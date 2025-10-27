import { VercelRequest, VercelResponse } from '@vercel/node';
import { createSamplingHandler } from "@iqai/adk";
import { getRootAgent } from "../src/agents/agent";
import { formatMedAIResponse } from "../src/utils/medAIFormatter";

// Initialize runner once (will be cached by Vercel)
let runnerPromise: Promise<any> | null = null;

async function getRunner() {
  try {
    if (!runnerPromise) {
      console.log('Initializing new runner...');
      runnerPromise = getRootAgent().then(({ runner }) => {
        console.log('Runner initialized successfully');
        return runner;
      }).catch(error => {
        console.error('Failed to initialize runner:', error);
        throw error;
      });
    }
    return runnerPromise;
  } catch (error) {
    console.error('getRunner error:', error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Health check for GET requests
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'Bot is running', timestamp: new Date().toISOString() });
  }

  // Handle POST requests (Telegram webhooks)
  if (req.method === 'POST') {
    try {
      console.log('Received POST request:', req.body);
      const update = req.body;
      
      // Get message from update
      const message = update.message || update.edited_message;
      
      if (!message || !message.text) {
        console.log('No valid message found in update');
        return res.status(200).json({ ok: true });
      }

      const chatId = message.chat.id;
      const userMessage = message.text;

      console.log(`Processing message: "${userMessage}" from chat ${chatId}`);

      // Get runner
      const runner = await getRunner();
      
      // Process message
      console.log('Asking runner...');
      const result = await runner.ask(userMessage);
      console.log('Got result from runner');
      
      const cleanText = formatMedAIResponse(result);
      console.log('Formatted response:', cleanText);

      // Send response back to Telegram
      await sendTelegramMessage(chatId, cleanText);
      console.log('Sent response to Telegram');

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Webhook error:', error);
      // Log the full error details
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
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
//       ok: true,
//       received: body
//     });
//   }

//   return res.status(405).json({ error: 'Method not allowed' });
// }