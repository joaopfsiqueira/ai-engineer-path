import "./environment.js";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
});

const userPrompt = "Give me a short explanation of why open-source tools matter.";

/*
  Chat Completions puts the system prompt and user input in messages.

  messages: [
    { role: "system", content: "..." },
    { role: "user", content: "..." },
  ]

  Read the model's reply from:

  response.choices[0].message.content
*/
export async function runChatCompletionsDemo() {
  const response = await client.chat.completions.create({
    model: process.env.AI_MODEL,
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: userPrompt },
    ],
  });

  console.log("\n=== Chat Completions ===\n");
  console.log(response.choices[0].message.content);
}
