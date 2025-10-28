import { LlmAgent } from "@iqai/adk";
import { env } from "../../env";


export const getSymptomAnalyzerAgent = () => {
    const symptomAnalyzerAgent = new LlmAgent({
        name: "symptom_analyzer_agent",
        description: "Analyzes the collected symptom data using medical reasoning and large language model capabilities. It identifies potential causes, correlates symptom patterns, evaluates severity, and generates a list of likely medical conditions or categories. The agent also flags urgent or high-risk symptoms that may require immediate attention.",
        model: env.LLM_MODEL,
    });

    return symptomAnalyzerAgent;
};
