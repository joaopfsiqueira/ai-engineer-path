import OpenAI from "openai/index.js";
import { checkEnvironment, sleep } from "./utils.js";
import { giftSchema } from "./schema.js"
import { giftSchemaResponses } from "./schema-responses.js"

// Initialize OpenAI client with environment variables
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
  dangerouslyAllowBrowser: true,
});

checkEnvironment();

// Make a gift suggestion request with the Chat Completions API
// async function getGiftSuggestion() {
//   const response = await openai.chat.completions.create({
//     model: process.env.AI_MODEL,
//     messages: [
//       {
//         role: "user",
//         content: `Suggest 3 gifts for a coffee lover.`,
//       },
//     ],
//     response_format: giftSchema
//   });

//   return response.choices[0].message.content;
// }

// Make a gift suggestion request with the Responses API
async function getGiftSuggestion() {
  const response = await openai.responses.create({
    model: process.env.AI_MODEL,
    input: `Suggest 3 gifts for a coffee lover.`,
    text: {
      format: giftSchemaResponses
    }
  });

  return response.output_text;
}

// Run 5 calls to observe output 
async function runDemo() {
  console.log("Making 5 gift suggestion calls with JSON prompting...\n");

  for (let i = 1; i <= 5; i++) {
    const result = await getGiftSuggestion();
    console.log(`Call ${i}:`);
    console.log(result);

    // Try to parse as JSON to see if it works
    try {
      JSON.parse(result);
      console.log("✓ Parsed as JSON");
    } catch (e) {
      console.log("✗ Failed to parse (has extra text or formatting)");
    }
    console.log("-".repeat(50));

    // Pace the calls
    if (i < 5) await sleep(1000);
  }

  console.log("\nThings to watch out for:");
  console.log("- Code fences (```json)");
  console.log("- Preamble text ('Here is the JSON:')");
}

runDemo();
