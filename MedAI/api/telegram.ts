import axios from "axios";
// `getRootAgent` is imported dynamically inside `getCachedRunner` to avoid
// module-load exceptions on Vercel when environment variables or other
// dependencies are missing. Dynamic import lets us catch and return a
// controlled error instead of crashing the function at startup.
import { formatMedAIResponse } from "../src/utils/medAIFormatter";
//import { env } from "../src/env";
import dotenv from "dotenv";
dotenv.config();


let cachedRunnerPromise: Promise<any> | null = null;

async function getCachedRunner() {
  if (!cachedRunnerPromise) {
    cachedRunnerPromise = (async () => {
      const agent = await getRootAgent();
      // AgentBuilder.build() in this project should expose a runner property
      // (index.ts destructures { runner } from getRootAgent()). Try common shapes.
      if ((agent as any).runner) return (agent as any).runner;
      if (typeof (agent as any).ask === "function") return agent;
      if (typeof (agent as any).getRunner === "function") return (agent as any).getRunner();
      throw new Error("Could not locate runner on agent");
    })();
  }
  return cachedRunnerPromise;
}

async function getRootAgent(): Promise<any> {
    // Allow overriding the entry point via env for flexibility in different builds
    const envEntry = process.env.AGENT_ENTRY || process.env.ROOT_AGENT_PATH;
    const candidates = [
        ...(envEntry ? [envEntry] : []),
        "../src/index",
        "../src/agent",
        "../src/agents/index",
        "../src/agents/root",
        "../index",
        "./index",
    ];

    const tried: string[] = [];
    for (const path of candidates) {
        if (!path) continue;
        tried.push(path);
        try {
            const mod: any = await import(path);

            // If module default is a factory function, call it (it may return a promise)
            if (typeof mod.default === "function") {
                return await mod.default();
            }
            // If default is already an agent-like object, return it
            if (mod.default && (mod.default.runner || typeof mod.default.ask === "function" || typeof mod.default.getRunner === "function")) {
                return mod.default;
            }

            // Named export common patterns
            if (typeof mod.getRootAgent === "function") {
                return await mod.getRootAgent();
            }
            if (typeof mod.build === "function") {
                return await mod.build();
            }
            if (typeof mod.createAgent === "function") {
                return await mod.createAgent();
            }

            // If the module itself looks like an agent
            if (mod.runner || typeof mod.ask === "function" || typeof mod.getRunner === "function") {
                return mod;
            }
        } catch (err) {
            // ignore and try next candidate
        }
    }

    throw new Error(
        `Could not locate root agent. Tried import paths: ${tried.join(", ")}. ` +
            `Set AGENT_ENTRY or ROOT_AGENT_PATH to your agent entry if it's not in a standard location.`
    );
}
// duplicate stub removed — actual getRootAgent implementation is above

// Handler (exported for both ESM and CommonJS)
export default async function handler(req: any, res: any) {
    // Health endpoint
    if (req.method === "GET") {
        return res.status(200).json({ ok: true, status: "healthy" });
    }

    if (req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        return res.status(405).json({ ok: false, error: { message: "Method Not Allowed" } });
    }

    const update = req.body || {};
    const text = update.message?.text ?? update.callback_query?.data ?? "";
    const chatId = update.message?.chat?.id ?? update.callback_query?.message?.chat?.id;

    if (!chatId) {
        return res.status(400).json({ ok: false, error: { message: "Missing chat id in update" } });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) {
        console.error("Missing TELEGRAM_BOT_TOKEN environment variable");
        return res.status(500).json({ ok: false, error: { message: "Server misconfiguration: TELEGRAM_BOT_TOKEN is not set" } });
    }

    let runner: any;
    try {
        runner = await getCachedRunner();
    } catch (err: any) {
        console.error("Failed to initialize agent runner:", err);
        return res.status(500).json({ ok: false, error: { message: "Failed to initialize agent runner", details: err?.message ?? String(err) } });
    }

    let rawResult: any;
    try {
        rawResult = await runner.ask(text);
    } catch (err: any) {
        console.error("runner.ask failed:", err);
        return res.status(502).json({ ok: false, error: { message: "AI model request failed", details: err?.message ?? String(err) } });
    }

    let reply: string;
    try {
        reply = formatMedAIResponse(rawResult);
    } catch (err: any) {
        console.error("formatMedAIResponse failed:", err);
        try {
            reply = typeof rawResult === "string" ? rawResult : JSON.stringify(rawResult);
        } catch (e: any) {
            reply = "(failed to generate reply)";
        }
    }

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        await axios.post(telegramUrl, {
            chat_id: chatId,
            text: reply,
        });
    } catch (err: any) {
        console.error("Failed to send message to Telegram:", err?.response?.data ?? err?.message ?? err);
        return res.status(502).json({ ok: false, error: { message: "Failed to send message to Telegram", details: err?.response?.data ?? err?.message ?? String(err) } });
    }

    return res.status(200).json({ ok: true });
}

// Ensure CommonJS compatibility for Vercel runtime
try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof module !== "undefined") module.exports = handler;
} catch (e) {
    // ignore
}

