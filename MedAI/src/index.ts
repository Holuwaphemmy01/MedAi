// import { createSamplingHandler } from "@iqai/adk";
// import * as dotenv from "dotenv";
// import { getRootAgent } from "./agents/agent";
// import { getTelegramAgent } from "./agents/telegram-agent/agent";
// import { formatMedAIResponse } from "./utils/medAIFormatter";

// dotenv.config();

// async function main() {
// 	console.log("🤖 Initializing Telegram bot agent...");

// 	try {
// 		const { runner } = await getRootAgent();

// 		const samplingHandler = createSamplingHandler(async (input) => {
//   		const result = await runner.ask(input);
//   		const cleanText = formatMedAIResponse(result);
//   		return cleanText;
// 	});

// 		await getTelegramAgent(samplingHandler);

// 		console.log("✅ Telegram bot agent initialized successfully!");
// 		console.log("🚀 Bot is now running and ready to receive messages...");

// 		await keepAlive();
// 	} catch (error) {
// 		console.error("❌ Failed to initialize Telegram bot:", error);
// 		process.exit(1);
// 	}
// }


// async function keepAlive() {
// 	process.on("SIGINT", () => {
// 		console.log("\n👋 Shutting down Telegram bot gracefully...");
// 		process.exit(0);
// 	});

// 	setInterval(() => {
// 	}, 1000);
// }

// main().catch(console.error);




// src/main.ts
import { createSamplingHandler } from "@iqai/adk";
import * as dotenv from "dotenv";
import { getRootAgent } from "./agents/agent";
import { getTelegramAgent } from "./agents/telegram-agent/agent";
import { formatMedAIResponse } from "./utils/medAIFormatter";
import axios from 'axios';

dotenv.config();

async function setWebhook() {
  const token = process.env.BOT_TOKEN;
  const webhookUrl = `${process.env.APP_URL}/api/telegram`;
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`
    );
    console.log('Webhook set:', response.data);
  } catch (error) {
    console.error('Failed to set webhook:', error);
    throw error;
  }
}

async function main() {
  console.log("🤖 Initializing Telegram bot agent...");

  try {
    const { runner } = await getRootAgent();
    const samplingHandler = createSamplingHandler(async (input) => {
      const result = await runner.ask(input);
      const cleanText = formatMedAIResponse(result);
      return cleanText;
    });

    await setWebhook(); // Set webhook before agent initialization
    await getTelegramAgent(samplingHandler);

    console.log("✅ Telegram bot agent initialized successfully!");
    console.log("🚀 Bot is now running and ready to receive messages...");
  } catch (error) {
    console.error("❌ Failed to initialize Telegram bot:", error);
    process.exit(1);
  }
}

main().catch(console.error);