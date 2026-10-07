import "./environment.js";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
});

/*
  Responses API

  We use the instructions field to give the system prompt
  and the input field to give the user prompt.

  Chat Completions          Responses API
  -----------------         -----------------
  messages: [               instructions: "..."
    {                       input: "..."
      role: "system"
      content: "..."
    },     
    { 
      role: "user",
      content: "..."
    },
  ]

  To read the model's reply:
  
  response.choices[0]       response.output_text
  .message
  .content
*/
export async function runResponsesDemo() {

  /**
   * Challenge: Refactor the Responses Input
   *
   * The request works with a string assigned directly to input.
   * Refactor input to an array containing one role/content object for the user.
   *
   * Run the Responses demo again. You should still see the model's reply.
   *
   * Check the hints folder for more guidance!
   */
  const response = await client.responses.create({
    model: process.env.AI_MODEL,
    instructions: "You are a helpful assistant.",
    input: [{
      role: "user",
      content: "Give me a short explanation of why open-source tools matter."
    }],
  });

  console.log("\n=== Responses ===\n");
  console.log(response.output_text);

  console.log("\n=== Full output array ===\n");
  console.log(JSON.stringify(response.output, null, 2));
}
