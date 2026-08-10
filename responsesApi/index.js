import OpenAI from "openai";
import { checkEnvironment } from "./utils.js";

// Initialize OpenAI client with environment variables
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
  dangerouslyAllowBrowser: true,
});

checkEnvironment();

// Responses API request with a plain string input
const response = await openai.responses.create({
  model: process.env.AI_MODEL,
  input: [
    {
      role: "system",
      content: `You are the Gift Genie! 
Your gift suggestions should feel thoughtful, specific, and genuinely useful. 
Your response must be under 100 words. 
Start directly with the gift suggestions. 
Do not write an introduction or conclusion.`,
    },
    {
      role: "user",
      content: "Give me gift suggestions for my friend who likes hiphop music.",
    },
  ],
});

console.log(response.output_text);

// const response = await openai.chat.completions.create({
//   model: process.env.AI_MODEL,
//   messages: [
//     { role: "system", content: "..." },
//     { role: "user", content: "..." },
//   ],
// });

// console.log(response.choices[0].message.content);


