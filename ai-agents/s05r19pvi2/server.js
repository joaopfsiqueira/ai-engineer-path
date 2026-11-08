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
          description: "The news topic to search for"
        }
      },
      required: ["topic"],
      additionalProperties: false, 
    },
    strict: true
  },
];

const userPrompt =
  "I want to replace Calendly for our team. We need SSO authentication and source code access.";

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

async function runDemo() {
  const response = await client.responses.create({
    model: process.env.AI_MODEL,
    instructions: systemPrompt,
    input: [{ role: "user", content: userPrompt }],
    tools,
  });

  const latestOutputItem = response.output.at(-1);

  if (latestOutputItem?.type === "function_call") {
    console.log("Tool call requested:", latestOutputItem.name);
    console.log("Call ID:", latestOutputItem.call_id);
    console.log("Arguments: ", latestOutputItem.arguments)
    return;
  }

  console.log("Latest item type:", latestOutputItem?.type ?? "none");
}

// Run the demo when the frontend calls this backend route.
app.post("/api/agent", async (_req, res) => {
  try {
    await runDemo();
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
