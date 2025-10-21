import { AgentBuilder } from "@iqai/adk";
import dotenv from "dotenv";
import { getMedicalPipelineAgent } from "./medical-pipeline-agent/agent";
dotenv.config();

/**
 * Creates and configures the root medical agent for the MedAI app.
 *
 * This root agent handles user interactions and routes them through the
 * medical pipeline, which consists of:
 *  - QuestionAskerAgent (collects user details)
 *  - SymptomAnalyzerAgent (analyzes symptoms)
 *  - RecommendationAgent (provides recommendations)
 *
 * The root agent serves as the entry point of the AI flow.
 */
export const getRootAgent = () => {
  const medicalPipelineAgent = getMedicalPipelineAgent();

  return AgentBuilder.create("root_medical_agent")
    .withDescription(
      "Root agent that coordinates medical data collection, symptom analysis, and recommendation generation.",
    )
    .withInstruction(
      `
      When a user interacts with you, start by gathering basic medical information (age, symptoms, duration, etc.).
      Once all required info is collected, analyze the symptoms and provide accurate, clear, and safe medical recommendations.
      `,
    )
    .withModel(process.env.LLM_MODEL || "gemini-2.5-flash")
    .withSubAgents([medicalPipelineAgent])
    .build();
};
