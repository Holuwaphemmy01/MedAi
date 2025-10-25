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
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const update = req.body || {};
  const text = update.message?.text ?? update.callback_query?.data ?? "";
  const chatId = update.message?.chat?.id ?? update.callback_query?.message?.chat?.id;

  if (!chatId) {
    return res.status(200).end("no chat id");
  }

  try {
    const runner = await getCachedRunner();

    // runner.ask() is used in your existing `src/index.ts` — call similarly.
    const rawResult = await runner.ask(text);

    // Clean/format the AI response before sending back to Telegram
    const reply = formatMedAIResponse(rawResult);

    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(telegramUrl, {
      chat_id: chatId,
      text: reply,
    });

    return res.status(200).end("ok");
  } catch (err) {
    console.error("Telegram webhook handler error:", err);
    return res.status(500).end("internal error");
  }
}
