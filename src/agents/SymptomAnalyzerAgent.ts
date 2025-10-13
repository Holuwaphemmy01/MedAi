import { LlmAgent } from "@iqai/adk";

export const SymptomAnalyzerAgent = new LlmAgent({
    name: "symptom_analyzer",
    model: "gpt-4o-mini",
    description: "Analyzes user symptoms for possible causes",
    instruction: `
    Given patient_details, analyze the likely causes and uncertainties.
    Output concise bullet points for "possible_causes" and "next_steps".
  `,
    outputKey: "symptom_analysis",
});
