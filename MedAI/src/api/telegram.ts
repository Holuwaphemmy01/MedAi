import { getTelegramAgent } from "../agents/telegram-agent/agent";
import { getRootAgent } from "../agents/agent";
import { createSamplingHandler } from "@iqai/adk";
import { formatMedAIResponse } from "../utils/medAIFormatter";

export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    try {
      const { runner } = await getRootAgent();

      const samplingHandler = createSamplingHandler(async (input) => {
        const result = await runner.ask(input);
        const cleanText = formatMedAIResponse(result);
        return cleanText;
      });

      // Corrected line (only pass samplingHandler)
      await getTelegramAgent(samplingHandler);

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Telegram webhook error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(200).send("✅ MedAI Telegram webhook is live!");
  }
}
