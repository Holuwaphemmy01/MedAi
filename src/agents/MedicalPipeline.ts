// import {AgentBuilder, SequentialAgent,} from "@iqai/adk";
//
// import {QuestionAskerAgent} from "./QuestionAskerAgent.ts";
// import {SymptomAnalyzerAgent} from "./SymptomAnalyzerAgent.ts";
// import {RecommendationAgent} from "./RecommendationAgent.ts";
//
// const medicalPipeline = new SequentialAgent({
//     name: "medical_pipeline",
//     description: "Full pipeline: questions → analysis → recommendations",
//     subAgents: [QuestionAskerAgent, SymptomAnalyzerAgent, RecommendationAgent],
// });
//
// // 🔹 Step 3: Use the static builder (new syntax)
// export async function buildMedicalRunner() {
//
//
//     const {runner} = await AgentBuilder.withAgent.async(medicalPipeline).build();
//     return await runner.ask(
//         "i am having stomach ache'"
//     );
//
// }




import { AgentBuilder } from "@iqai/adk";
import { SequentialAgent, LlmAgent } from "@iqai/adk";

const medicalPipeline = new SequentialAgent({
    name: "medical_pipeline",
    description: "Handles the entire medical diagnostic flow",
    subAgents: [
        new LlmAgent({
            description: "Asks diagnostic questions to gather more context",
            name: "question_agent",
            model: "gemini-2.5-flash",
            instruction: "Ask follow-up diagnostic questions.",
            outputKey: "patientDetails"
        }),
        new LlmAgent({
            description: "Analyzes user symptoms for possible causes",
            name: "symptom_analyzer",
            model: "gemini-2.5-flash",
            instruction: "Analyze the user's symptoms in detail.",
            outputKey: "analysis",
        }),
        new LlmAgent({
            description: "Suggests safe next steps based on analysis",
            name: "recommendation_agent",
            model: "gemini-2.5-flash",
            instruction: "Provide recommendations based on {analysis}.",
            outputKey: "recommendation",
        }),
    ],
});

export default medicalPipeline;
