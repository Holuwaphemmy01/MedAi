import { LlmAgent } from "@iqai/adk";

export const RecommendationAgent = new LlmAgent({
    name: "recommendation_agent",
    model: "gpt-4o-mini",
    description: "Suggests safe next steps based on analysis",
    instruction: `
    Using symptom_analysis and patient_details, provide safe recommendations:
    - immediate actions (rest, fluids),
    - red flags that require urgent care,
    - suggestions to see a doctor.
  `,
    outputKey: "recommendation",
});
