import { LlmAgent } from "@iqai/adk";

/**
 * QuestionAskerAgent - returns questions / collects details.
 * NOTE: This is an LlmAgent instance (not a class); runner drives it.
 */
export const QuestionAskerAgent = new LlmAgent({
    name: "question_asker",
    model: "gpt-4o-mini",
    description: "Asks diagnostic questions to gather more context",
    instruction: `
    Ask follow-up questions to clarify symptoms (age, duration, severity, other symptoms).
    Keep each question short and clear. Output a JSON-like object with collected fields when done.
  `,
    outputKey: "patient_details",
});
