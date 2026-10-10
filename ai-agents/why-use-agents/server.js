import "./environment.js";
import express from "express";
import OpenAI from "openai";
import { openSourceNewsItems } from "./news.js";

// Create the Express app for our backend server.
const app = express();

// Initialize an OpenAI client for your provider using env vars
const client = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
});

const systemPrompt = `You are a helpful assistant that recommends open-source alternatives
based on a user's request.

Use the recent open-source news below to avoid making outdated recommendations.
If recent news changes the recommendation, explain that clearly.

Recent open-source news:

${JSON.stringify(openSourceNewsItems)}`;

const userPrompt =
  "I want to replace Calendly for our team. We need SSO authentication and source code access.";

async function runAgent() {
  const response = await client.responses.create({
    model: process.env.AI_MODEL,
    instructions: systemPrompt,
    input: userPrompt,
  });

  console.log(response.output_text);
  console.log("\nUsage:", response.usage);
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
  console.log(`Agent server running at http://localhost:${PORT}`);
});
