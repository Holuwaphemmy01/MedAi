import {LlmAgent} from "@iqai/adk";


export const sentimentAnalyzer = new LlmAgent({
    name: "sentiment_analyzer",
    model: "gemini-2.5-flash",
    description: "Analyzes emotional tone and sentiment",
    instruction:
        "Analyze the sentiment and emotional tone of the content. Classify as positive, negative, or neutral with confidence scores.",
    outputKey: "sentiment_analysis",
});
