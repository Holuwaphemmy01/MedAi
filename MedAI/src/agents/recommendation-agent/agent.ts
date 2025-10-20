import { LlmAgent } from "@iqai/adk";
import { env } from "../../env";


export const getRecommendationAgent = () => {
    const recommendationAgent = new LlmAgent({
        name: "recommendation_agent",
        description: "Responsible for providing personalized treatment recommendations based on the analyzed symptom data and patient history. It takes into account the patient's unique circumstances, preferences, and medical guidelines to suggest appropriate interventions.",
        model: env.LLM_MODEL,
    });

    return recommendationAgent;
};
