import { SequentialAgent } from "@iqai/adk";
import { getSymptomAnalyzerAgent } from "../symptom-analyzer-agent/agent";
import { getRecommendationAgent } from "../recommendation-agent/agent";
import { getQuestionFromUserAgent } from "../question-asker-agent/agent";

export const getMedicalPipelineAgent = () =>
  new SequentialAgent({
    name: "medicalPipelineResearchAgent",
    description: "Comprehensive market analysis and strategy development",
    subAgents: [getQuestionFromUserAgent(), getSymptomAnalyzerAgent(), getRecommendationAgent()],
  });





