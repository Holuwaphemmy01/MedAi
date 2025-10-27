// import { VercelRequest, VercelResponse } from '@vercel/node';
// import { createSamplingHandler } from "@iqai/adk";
// import * as dotenv from "dotenv";
// import { getRootAgent } from "../src/agents/agent";
// import { formatMedAIResponse } from "../src/utils/medAIFormatter";

// dotenv.config();

// // Initialize runner once (will be cached by Vercel)
// let runnerPromise: Promise<any> | null = null;

// async function getRunner() {
//   if (!runnerPromise) {
//     runnerPromise = getRootAgent().then(({ runner }) => runner);
//   }
//   return runnerPromise;
// }

// export default async function handler(req: VercelRequest, res: VercelResponse) {
//   // Health check for GET requests
//   if (req.method === 'GET') {
//     return res.status(200).json({ status: 'Bot is running', timestamp: new Date().toISOString() });
//   }

//   // Handle POST requests (Telegram webhooks)
//   if (req.method === 'POST') {
//     try {
//       const update = req.body;
      
//       // Get message from update
//       const message = update.message || update.edited_message;
      
//       if (!message || !message.text) {
//         return res.status(200).json({ ok: true });
//       }

//       const chatId = message.chat.id;
//       const userMessage = message.text;

//       // Get runner
//       const runner = await getRunner();
      
//       // Process message
//       const result = await runner.ask(userMessage);
//       const cleanText = formatMedAIResponse(result);

//       // Send response back to Telegram
//       await sendTelegramMessage(chatId, cleanText);

//       return res.status(200).json({ ok: true });
//     } catch (error) {
//       console.error('Webhook error:', error);
//       return res.status(200).json({ ok: true }); // Still return 200 to Telegram
//     }
//   }

//   return res.status(405).json({ error: 'Method not allowed' });
// }

// async function sendTelegramMessage(chatId: number, text: string) {
//   const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
//   const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
//   const response = await fetch(url, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       chat_id: chatId,
//       text: text,
//       parse_mode: 'Markdown'
//     })
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to send message: ${response.statusText}`);
//   }
// }


import { VercelRequest, VercelResponse } from '@vercel/node';
import { createSamplingHandler } from "@iqai/adk";
import * as dotenv from "dotenv";
import { getRootAgent } from "../src/agents/agent";
import { formatMedAIResponse } from "../src/utils/medAIFormatter";

dotenv.config();

// Initialize runner once (will be cached by Vercel)
let runnerPromise: Promise<any> | null = null;

async function getRunner() {
  if (!runnerPromise) {
    runnerPromise = getRootAgent().then(({ runner }) => runner);
  }
  return runnerPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Health check for GET requests
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'Bot is running', timestamp: new Date().toISOString() });
  }

  // Handle POST requests (Telegram webhooks)
  if (req.method === 'POST') {
    try {
      const update = req.body;
      
      // Get message from update
      const message = update.message || update.edited_message;
      
      if (!message || !message.text) {
        return res.status(200).json({ ok: true });
      }

      const chatId = message.chat.id;
      const userMessage = message.text;

      // Get runner
      const runner = await getRunner();
      
      // Process message
      const result = await runner.ask(userMessage);
      const cleanText = formatMedAIResponse(result);

      // Send response back to Telegram
      await sendTelegramMessage(chatId, cleanText);

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(200).json({ ok: true }); // Still return 200 to Telegram
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function sendTelegramMessage(chatId: number, text: string) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }
}