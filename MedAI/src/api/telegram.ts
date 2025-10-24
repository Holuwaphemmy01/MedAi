// // import { getTelegramAgent } from "../agents/telegram-agent/agent";
// // import { getRootAgent } from "../agents/agent";
// // import { createSamplingHandler } from "@iqai/adk";
// // import { formatMedAIResponse } from "../utils/medAIFormatter";

// // export default async function handler(req: any, res: any) {
// //   if (req.method === "POST") {
// //     try {
// //       const { runner } = await getRootAgent();

// //       const samplingHandler = createSamplingHandler(async (input) => {
// //         const result = await runner.ask(input);
// //         const cleanText = formatMedAIResponse(result);
// //         return cleanText;
// //       });

// //       // Corrected line (only pass samplingHandler)
// //       await getTelegramAgent(samplingHandler);

// //       res.status(200).json({ ok: true });
// //     } catch (error) {
// //       console.error("Telegram webhook error:", error);
// //       res.status(500).json({ error: "Internal Server Error" });
// //     }
// //   } else {
// //     res.status(200).send("✅ MedAI Telegram webhook is live!");
// //   }
// // }




// import { getTelegramAgent } from "../agents/telegram-agent/agent";
// import { createSamplingHandler } from "@iqai/adk";

// // Telegram webhook endpoint
// export default async function handler(req: any, res: any) {
//   if (req.method !== "POST") {
//     return res.status(200).send("✅ Telegram webhook is live!");
//   }

//   try {
//     // Step 1: Get Telegram data from webhook
//     const update = req.body;

//     // Step 2: Create a sampling handler
//     const samplingHandler = createSamplingHandler(async (input) => {
//       const telegramAgent = await getTelegramAgent(samplingHandler);
//       // LlmAgent<BaseLlm> does not expose getRunner, call ask directly on the agent
//       const result = await (telegramAgent as any).ask(input);
//       return result;
//     });

//     // Step 3: Process Telegram update using the agent
//     await samplingHandler(JSON.stringify(update) as any);

//     res.status(200).send("✅ Webhook processed successfully");
//   } catch (error) {
//     console.error("❌ Telegram webhook error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }



// /api/telegram.ts
import { getTelegramAgent } from "../agents/telegram-agent/agent";
import { getRootAgent } from "../agents/agent";
import { createSamplingHandler } from "@iqai/adk";
import { formatMedAIResponse } from "../utils/medAIFormatter";

export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    try {
      // Initialize the root AI agent
      const { runner } = await getRootAgent();

      // Create sampling handler
      const samplingHandler = createSamplingHandler(async (input) => {
        const result = await runner.ask(input);
        const cleanText = formatMedAIResponse(result);
        return cleanText;
      });

      // Initialize the Telegram agent
      const telegramAgent = await getTelegramAgent(samplingHandler);

      // **Run** the Telegram agent with incoming webhook data
      await (telegramAgent as any).ask(req.body.message.text);

      // Important: end the response (Telegram expects 200)
      res.status(200).end();
    } catch (error) {
      console.error("❌ Telegram webhook error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    // Health check for GET requests
    res.status(200).send("✅ MedAI Telegram webhook is live!");
  }
}
