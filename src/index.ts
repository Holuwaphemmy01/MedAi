// // // src/agents/Index.ts
// // import { agent } from "./agents/example.ts";
// // import dotenv from "dotenv";
// //
// // dotenv.config();
// // console.log("✅ Loaded GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "FOUND" : "MISSING");
// //
// //
// // async function main() {
// //     const { runner } = await agent();
// //
// //     const response = await runner.ask("What is the capital of France?");
// //     console.log("🤖 Response:", response);
// // }
// //
// // main().catch(console.error);
//
// // src/index.ts
// import "dotenv/config";
// import { runMedicalPipeline } from "./agents/MedicalPipeline";
//
// async function main() {
//     const input = "I have had a headache and fever for 3 days, mild cough.";
//     const out = await runMedicalPipeline(input);
//     console.log("=== PIPELINE OUTPUT ===");
//     console.log(JSON.stringify(out, null, 2));
// }
//
// main().catch((e) => {
//     console.error("Fatal error:", e);
// });



import {AgentBuilder} from "@iqai/adk";
import medicalPipeline from "./agents/MedicalPipeline.ts"

async function main() {
    // ✅ Correct builder usage
    const builder = AgentBuilder.withAgent(medicalPipeline);

    // ✅ The `.build()` method now returns { agent, runner }
    const { runner } = await builder.build();

    // ✅ Run the pipeline
    const result = await runner.run({
        patientDetails: "I have had a headache and fever for 3 days, mild cough.",
    });

    console.log("=== PIPELINE OUTPUT ===");
    console.log(result);
}

main().catch(console.error);