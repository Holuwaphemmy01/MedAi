// // // /api/telegram.ts
// // import { getTelegramAgent } from "../agents/telegram-agent/agent";
// // import { getRootAgent } from "../agents/agent";
// // import { createSamplingHandler } from "@iqai/adk";
// // import { formatMedAIResponse } from "../utils/medAIFormatter";

// // export default async function handler(req: any, res: any) {
// //   if (req.method === "POST") {
// //     try {
// //       // Initialize the root AI agent
// //       const { runner } = await getRootAgent();

// //       // Create sampling handler
// //       const samplingHandler = createSamplingHandler(async (input) => {
// //         const result = await runner.ask(input);
// //         const cleanText = formatMedAIResponse(result);
// //         return cleanText;
// //       });

// //       // Initialize the Telegram agent
// //       const telegramAgent = await getTelegramAgent(samplingHandler);

// //       // **Run** the Telegram agent with incoming webhook data
// //       await (telegramAgent as any).ask(req.body.message.text);

// //       // Important: end the response (Telegram expects 200)
// //       res.status(200).end();
// //     } catch (error) {
// //       console.error("❌ Telegram webhook error:", error);
// //       res.status(500).json({ error: "Internal Server Error" });
// //     }
// //   } else {
// //     // Health check for GET requests
// //     res.status(200).send("✅ MedAI Telegram webhook is live!");
// //   }
// // }



// export default async function handler(req: any, res: any) {
//   console.log("Telegram webhook hit:", req.method);

//   if (req.method === "POST") {
//     console.log("Incoming Telegram update:", req.body);
//     return res.status(200).send("OK");
//   }

//   return res.status(200).send("✅ Telegram webhook is live!");
// }



import { getTelegramAgent } from "../../src/agents/telegram-agent/agent";
import { getRootAgent } from "../../src/agents/agent";
import { createSamplingHandler } from "@iqai/adk";
import { formatMedAIResponse } from "../../src/utils/medAIFormatter";

export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    try {
      const { runner } = await getRootAgent();
      const samplingHandler = createSamplingHandler(async (input) => {
        const result = await runner.ask(input);
        const cleanText = formatMedAIResponse(result);
        return cleanText;
      });

      const telegramAgent = await getTelegramAgent(samplingHandler);
      const chatId = req.body.message?.chat?.id;
      const text = req.body.message?.text;

      if (!chatId || !text) {
        console.log('Invalid update or non-text message:', JSON.stringify(req.body, null, 2));
        return res.status(200).end(); // Acknowledge to clear Telegram queue
      }

      // Invoke the agent with the text and assume it handles the response
      const response = await (telegramAgent as any).ask(text); // Adjust based on LlmAgent API
      // Note: If ask() doesn't send the response, you may need to call a tool manually
      console.log('Agent response:', response);
      res.status(200).end();
    } catch (error) {
      console.error("❌ Telegram webhook error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(200).send("✅ MedAI Telegram webhook is live!");
  }
}