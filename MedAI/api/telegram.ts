import axios from "axios";
import { getRootAgent } from "../src/agents/agent";
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

export default async function handler(req: any, res: any) {
  // Health endpoint: quick check without initializing the agent
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

  // Defensive call to runner.ask
  let rawResult: any;
  try {
    // Some runners expect structured input; prefer passing text directly as in your index.ts
    rawResult = await runner.ask(text);
  } catch (err: any) {
    console.error("runner.ask failed:", err);
    return res.status(502).json({ ok: false, error: { message: "AI model request failed", details: err?.message ?? String(err) } });
  }

  // Attempt to format the result; guard against formatter errors
  let reply: string;
  try {
    reply = formatMedAIResponse(rawResult);
  } catch (err: any) {
    console.error("formatMedAIResponse failed:", err);
    // Fallback: try to coerce a string from rawResult
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
