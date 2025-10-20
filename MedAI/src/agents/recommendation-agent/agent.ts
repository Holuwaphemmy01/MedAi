import { LlmAgent } from "@iqai/adk";
import { env } from "../../env";


export const getRecommendationAgent = () => {
    const recommendationAgent = new LlmAgent({
        name: "recommendation_agent",
        description: "Interprets the results from the SymptomAnalyzerAgent and provides clear, human-readable recommendations. This includes possible diagnoses, next steps such as rest, hydration, over-the-counter options, or when to seek medical care. The agent ensures advice is safe, general, and compliant with non-diagnostic health information standards.",
        model: env.LLM_MODEL,
    });

    return recommendationAgent;
};
