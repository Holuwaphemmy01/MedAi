import { AgentBuilder } from "@iqai/adk";
import dotenv from "dotenv";
import { getMedicalPipelineAgent } from "./medical-pipeline-agent/agent";
dotenv.config();


export const getRootAgent = () => {
  const medicalPipelineAgent = getMedicalPipelineAgent();

  return AgentBuilder.create("root_medical_agent")
    .withDescription(
      "Root agent that coordinates medical data collection, symptom analysis, and recommendation generation.",
    )
    .withInstruction(
      `
    You are MedAI, an intelligent health assistant.
	Always greet users politely, ask clarifying questions before analyzing symptoms,
	and provide safe, general medical guidance. 
	Avoid making direct diagnoses — instead, suggest possible causes and next steps.
	Use bullet points, emojis (where appropriate), and keep tone friendly but professional.
      `,
    )
    .withModel(process.env.LLM_MODEL || "gemini-2.5-flash")
    .withSubAgents([medicalPipelineAgent])
    .build();
};
