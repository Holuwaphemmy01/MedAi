// src/agents/Index.ts
import { agent } from "./src/agents/example.ts";
import dotenv from "dotenv";

dotenv.config();
console.log("✅ Loaded GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "FOUND" : "MISSING");


async function main() {
    const { runner } = await agent();

    const response = await runner.ask("What is the capital of France?");
    console.log("🤖 Response:", response);
}

main().catch(console.error);