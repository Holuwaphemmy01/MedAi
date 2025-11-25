import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import dotenv from "dotenv";
import { getRootAgent } from "../src/agents/agent";
import { formatMedAIResponse } from "../src/utils/medAIFormatter";

dotenv.config();

let runnerPromise: Promise<any> | null = null;

async function getRunner() {
  if (!runnerPromise) {
    runnerPromise = getRootAgent().then((r: any) => r.runner);
  }
  return runnerPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    res.status(500).send("Missing TELEGRAM_BOT_TOKEN");
    return;
  }

  const update: any = req.body;
  const message = update?.message ?? update?.edited_message;
  const chatId = message?.chat?.id;
  const text = message?.text;

  if (!chatId || !text) {
    res.status(200).json({ ok: true });
    return;
  }

  try {
    const runner = await getRunner();
    const answerRaw = await runner.ask(text);
    const answer = formatMedAIResponse(answerRaw);

    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: answer,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
}