import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const translateToYoruba = async (text: string) => {
  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Translate this medical text naturally into Yoruba." },
      { role: "user", content: text },
    ],
  });
  return resp.choices[0].message.content?.trim() || text;
};
