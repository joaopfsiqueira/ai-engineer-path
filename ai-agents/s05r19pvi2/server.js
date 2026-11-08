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
const systemPrompt = `You are OpenSwap, an AI assistant that helps users find open-source alternatives to popular software.

Use the search_swaps tool to search the local database when recommending alternatives. 
Base your recommendations on the database results rather than your memory.`;

const tools = [

  {
    type: "function",
    name: "search_swaps",
    description: "Search a local database of open-source software alternatives",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search term for finding open-source software alternatives. One search keyword based on the user's request. If the user asks about a software product, the topic should only be the product's name. e.g. Slack or Zoom. Otherwise topic should be one word like AI or Security",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  }
  /**
   * Challenge: Define search_swaps
   *
   * OpenSwap needs a function tool to search its database of open-source alternatives.
   *
   * Your task:
   *
   * 1. Define one function tool named search_swaps with a model-facing description.
   * 2. Give it a strict object schema with one required "query" string and a
   *    description for that input.
   * 3. Update the system prompt to introduce search_swaps and when to use it.
   *
   * This is just the first draft for testing; don't optimize or build a loop
   * yet. Just compare the query with the database matches in the console.
   *
   * Check the hints folder for more guidance!
   */
];

const userPrompt =
  "I want to replace Slack for our team. We need end-to-end encryption and unlimited message history.";

async function runAgent(userPrompt) {
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
