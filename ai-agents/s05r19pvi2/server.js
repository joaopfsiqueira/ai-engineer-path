import "./environment.js";
import { readFile } from "node:fs/promises";
import express from "express";
import OpenAI from "openai";

// Create the Express app for our backend server.
const app = express();

// Initialize an OpenAI client for your provider using env vars
const client = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
});

const systemPrompt = `You are OpenSwap, an AI assistant that helps users find open-source alternatives to popular software.

Use the get_open_source_news tool before recommending software in case recent news would change your answer.`;

/**
 * Challenge: Add A Topic Parameter To the News Tool
 *
 * The loop works, but get_open_source_news always returns the same broad
 * list. The model has no way to ask for news about one topic.
 *
 * getOpenSourceNews(topic) filters by a topic string.
 *
 * Your task:
 *
 * 1. Write a description that asks for one search keyword. Prefer a named
 *    software product, or fall back to one topic word if none is named.
 * 2. In the function_call branch, parse the function call arguments and
 *    pass the topic into getOpenSourceNews.
 *
 * When it works, the console logs arguments like {"topic":"Calendly"} and
 * the executed tool reports a smaller filtered item count. If the count is
 * ever 0, look at the words in your topic description.
 *
 * Check the hints folder for more guidance!
 */
const tools = [
  {
    type: "function",
    name: "get_open_source_news",
    description:
      "Retrieve recent news about open-source software. Use this before recommending software, in case recent news would change your answer.",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          // TODO: Step 1 - Write a description that asks for one search keyword.
          description: `One search keyword based on the user's request. If the user asks about a software product, the topic should only be the product's name. e.g. "Slack" or "Zoom". Otherwise topic should be one word like "AI" or "Security".`,
        },
      },
      required: ["topic"],
      additionalProperties: false,
    },
    strict: true,
  },
];

const userPrompt = "I want to replace Calendly for our team. We need SSO authentication and source code access.";

async function getOpenSourceNews(topic) {
  const rawNews = await readFile(
    new URL("./news.json", import.meta.url),
    "utf8"
  );
  let results = JSON.parse(rawNews);

  if (topic) {
    const keyword = topic.toLowerCase();
    results = results.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.details.toLowerCase().includes(keyword)
    );
  }

  return results.slice(0, 5);
}

async function runAgent() {
  // Keep a running input context array so later turns can see earlier output.
  const inputContext = [{ role: "user", content: userPrompt }];
  const maxTurns = 5;

  let turnCount = 0;

  while (turnCount < maxTurns) {
    turnCount++;
    console.log(`Turn ${turnCount}`);

    const turnResponse = await client.responses.create({
      model: process.env.AI_MODEL,
      instructions: systemPrompt,
      input: inputContext,
      tools,
    });

    // Preserve the model's whole output turn for the next request
    inputContext.push(...turnResponse.output);

    const latestOutputItem = turnResponse.output.at(-1);

    if (latestOutputItem?.type === "message") {
      console.log("\n" + (turnResponse.output_text || "Something went wrong. Please try again."));
      return;
    }

    if (latestOutputItem?.type === "function_call") {
      console.log("Tool call requested:", latestOutputItem.name);
      console.log("Call ID:", latestOutputItem.call_id);
      console.log("Arguments:", latestOutputItem.arguments);

      if (latestOutputItem.name === "get_open_source_news") {
        // TODO: Step 2 - parse latestOutputItem.arguments and pass the topic
        // into getOpenSourceNews
        const toolInput = JSON.parse(latestOutputItem.arguments)

        // Run the tool locally
        const result = await getOpenSourceNews(toolInput.topic);
        console.log("get_open_source_news executed: Got", result.length, "items");

        // Tool outputs must point back to the call_id of the tool request
        inputContext.push({
          type: "function_call_output",
          call_id: latestOutputItem.call_id,
          output: JSON.stringify(result),
        });
      }

      continue;
    }

    console.log("Latest item type:", latestOutputItem?.type ?? "none");
  }

  console.log("\nMax turns reached before the model returned a final answer.");
}

// Run the agent when the frontend calls this backend route.
app.post("/api/agent", async (_req, res) => {
  try {
    await runAgent();
    res.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Something went wrong. Please try again." });
  }
});

// Start the Express server so the frontend can talk to it
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
