// src/utils/voiceTranslationTools.ts
import { BaseTool } from "@iqai/adk";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { translateToYoruba } from "../../utils/translate";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class TranscribeVoiceTool extends BaseTool {
  name = "transcribe_voice";
  description = "Convert a voice message to text using Whisper";

  async run({ filePath }: { filePath: string }) {
    const result = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });
    return result.text;
  }
}

export class TextToSpeechTool extends BaseTool {
  name = "text_to_speech";
  description = "Convert text to speech (mp3)";

  async run({ text }: { text: string }) {
    const outputPath = path.resolve(`tmp/${Date.now()}.mp3`);
    const mp3 = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: text,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  }
}

export class TranslateToYorubaTool extends BaseTool {
  name = "translate_to_yoruba";
  description = "Translate English medical text into Yoruba";

  async run({ text }: { text: string }) {
    return await translateToYoruba(text);
  }
}
