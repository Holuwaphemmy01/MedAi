import { AgentBuilder } from "@iqai/adk";
import dotenv from "dotenv";

dotenv.config();
import { getWeatherAgent } from "./weather-agent/agent";

/**
 * Creates and configures the root agent for the telegram bot.
 *
 * This agent is responsible for handling every incoming telegram message received by the sampling handler.
 * It delegates tasks to sub-agents, specifically for telling jokes and providing weather information.
 * The root agent uses the "gemini-2.5-flash" model and maintains session state using a SQLite-backed session service.
 *
 * @returns The fully constructed root agent instance, ready to process and route user requests to the appropriate sub-agent.
 */
export const getRootAgent = () => {
	const weatherAgent = getWeatherAgent();

	return AgentBuilder.create("root_agent")
		.withDescription(
			"Root agent that delegates tasks to sub-agents for telling jokes and providing weather information.",
		)
		.withInstruction(
			"Use the joke sub-agent for humor requests and the weather sub-agent for weather-related queries. Route user requests to the appropriate sub-agent.",
		)
		.withModel(process.env.LLM_MODEL || "gemini-2.5-flash")
		.withSubAgents([weatherAgent])
		.build();
};
