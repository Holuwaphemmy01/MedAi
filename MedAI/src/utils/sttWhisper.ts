import OpenAI from "openai";
import fs from "fs";
import axios from "axios";
import path from "path";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const downloadFile = async (url: string, output: string) => {
  const { data } = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(output, data);
  return output;
};

export const transcribeAudio = async (filePath: string) => {
  const resp = await client.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-1",
  });
  return resp.text;
};
