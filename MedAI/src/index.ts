import { createSamplingHandler } from "@iqai/adk";
import * as dotenv from "dotenv";
import { getRootAgent } from "./agents/agent";
import { getTelegramAgent } from "./agents/telegram-agent/agent";
import { formatMedAIResponse } from "./utils/medAIFormatter";

dotenv.config();

async function main() {
	console.log("🤖 Initializing Telegram bot agent...");
	console.log("Environment:", {
		NODE_ENV: process.env.NODE_ENV,
		TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? '✓ Set' : '✗ Missing',
		GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? '✓ Set' : '✗ Missing',
		LLM_MODEL: process.env.LLM_MODEL || 'Not set',
		ADK_DEBUG: process.env.ADK_DEBUG || 'false'
	});

	// Test network connectivity
	try {
		console.log("Testing network connectivity...");
		const testResponse = await fetch("https://api.telegram.org");
		console.log("Network test result:", testResponse.status);
	} catch (error) {
		console.error("Network test failed:", error);
	}

	try {
		const { runner } = await getRootAgent();

		const samplingHandler = createSamplingHandler(async (input) => {
  		const result = await runner.ask(input);
  		const cleanText = formatMedAIResponse(result);
  		return cleanText;
	});

		await getTelegramAgent(samplingHandler);

		console.log("✅ Telegram bot agent initialized successfully!");
		console.log("🚀 Bot is now running and ready to receive messages...");

		await keepAlive();
	} catch (error) {
		console.error("❌ Failed to initialize Telegram bot:", error);
		process.exit(1);
	}
}


async function keepAlive() {
	process.on("SIGINT", () => {
		console.log("\n👋 Shutting down Telegram bot gracefully...");
		process.exit(0);
	});

	setInterval(() => {
	}, 1000);
}

main().catch(console.error);
