import { LlmAgent } from "@iqai/adk";
import { env } from "../../env";


export const getQuestionFromUserAgent = () => {
    const questionAgent = new LlmAgent({
        name: "question_agent",
        description: "Responsible for gathering all relevant patient information through structured and adaptive questioning. It collects key data such as age, gender, symptom descriptions, duration, severity, and relevant medical history. The agent ensures completeness and accuracy of responses, reformats them into a structured format, and prepares the data for downstream analysis by other agents.",
        model: env.LLM_MODEL,
    });

    return questionAgent;
};
