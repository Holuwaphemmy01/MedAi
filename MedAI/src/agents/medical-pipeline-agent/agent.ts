import { SequentialAgent } from "@iqai/adk";
import { getQuestionFromUserAgent } from "../question-asker-agent/agent";
import { getSymptomAnalyzerAgent } from "../symptom-analyzer-agent/agent";
import { getRecommendationAgent } from "../recommendation-agent/agent";


const getMedicalPipelineAgent = new SequentialAgent({
  name: "medical-pipeline-research-agent",
  description: "Comprehensive market analysis and strategy development",
  subAgents: [getQuestionFromUserAgent(), getSymptomAnalyzerAgent(), getRecommendationAgent()],
});




