import "./environment.js";
import express from "express";
import OpenAI from "openai";
import { runAgent } from "./agent/index.js";
import { getStarterSwapOptions } from "./store/index.js";

// Create the Express app for our backend server
const app = express();
// Parse JSON request bodies before route handlers read req.body
app.use(express.json());

// Initialize an OpenAI client for your provider using env vars
const client = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
});

// Send the UI a list of popular software names to show as chips
app.get("/api/popular-software", (_req, res) => {
  res.json({ popularSoftware: getStarterSwapOptions() });
});

// Accept a user prompt and return the agent's answer
app.post("/api/swaps", async (req, res) => {
  const { userPrompt } = req.body;

  // Reject empty input before it can spend a model request
  if (typeof userPrompt !== "string" || !userPrompt.trim()) {
    res.status(400).json({ error: "A user prompt is required." });
    return;
  }

  console.log("[/api/swaps] prompt:", userPrompt);

  // Challenge: See challenge.md for instructions.
  try {
    const swapAgentResponse = await runAgent({ client, userPrompt });
    res.json({ swapAgentResponse });
  } catch (error) {
    // Give the browser one stable error shape for agent or provider failures.
    console.error(error);
    res.status(500).json({ error: "Something went wrong with the AI request." });
  }
});

// Start the Express server so the frontend can talk to it
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`OpenSwap server running at http://localhost:${PORT}`);
});
