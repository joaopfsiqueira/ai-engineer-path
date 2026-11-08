import "./environment.js";
import express from "express";
import OpenAI from "openai";
import { searchSwaps } from "./store/index.js";

// Create the Express app for our backend server.
const app = express();

// Initialize an OpenAI client for your provider using env vars
const client = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
});

const systemPrompt = `You are OpenSwap, an AI assistant that helps users find
open-source alternatives to popular software. 

Use the search_swaps tool to search the local database when recommending alternatives. 
Base your recommendations on the database results rather than memory.`;

const tools = [
  /**
   * Challenge: Improve the Tool Definition
   *
   * The model is picking search_swaps, but its query includes more than the
   * name of the software the user wants to replace.
   *
   * Before editing, answer four questions from the code:
   *
   * - When should the model select this tool?
   * - What argument shape does the schema already enforce?
   * - What exact values does the matcher accept?
   * - What information returns after a match?
   *
   * Your task:
   *
   * 1. Update the tool description to explain when search_swaps should be used
   *    to find alternatives in OpenSwap's database.
   * 2. Update the query description so the model passes only the name of
   *    the software being replaced.
   *
   * Leave the runAgent function and database search unchanged. A focused
   * Slack query should return five database matches.
   *
   * Check the hints folder for more guidance!
   */
  {
    type: "function",
    "name": "search_swaps",
    "description": "Search a local database of open-source software alternatives to a specified product.",
    "strict": true,
    "parameters": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Only the name of the product to find open-source software alternatives for. Do not include any requirements or other words."
        }
      },
      "required": [
        "query"
      ],
      "additionalProperties": false
    }
  },
];

const userPrompt =
  "I want to replace Slack for our team. We need end-to-end encryption and unlimited message history.";

async function runAgent(userPrompt) {
  // We never typed this in a UI, but we still send a formatted user prompt.
  // Log it so we can compare what we sent with the query the model puts in the tool call.
  console.log("User prompt:", userPrompt);

  const response = await client.responses.create({
    model: process.env.AI_MODEL,
    instructions: systemPrompt,
    input: userPrompt,
    tools,
  });

  const toolCall = response.output.at(-1);

  if (toolCall?.type !== "function_call") {
    return response.output_text || "Something went wrong. Please try again.";
  }

  console.log("Tool call requested:", toolCall.name);
  console.log("Arguments:", toolCall.arguments);

  const toolInput = JSON.parse(toolCall.arguments);
  const result = await searchSwaps(toolInput);

  console.log("Database matches:", result.totalMatches);
  console.log("Matched swaps:", result.swaps.map((swap) => swap.name));

  return "The diagnostic run is complete. Check the server console to compare the tool arguments with the database matches.";
}

// Run the agent when the frontend calls this backend route.
app.post("/api/agent", async (_req, res) => {
  try {
    const agentResponse = await runAgent(userPrompt);
    console.log(agentResponse);
    res.json({ status: "ok", agentResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong with the AI request." });
  }
});

// Start the Express server so the frontend can talk to it
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
