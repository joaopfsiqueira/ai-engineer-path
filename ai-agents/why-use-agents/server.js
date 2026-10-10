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

const userPrompt = "I want to replace Calendly for our team. We need SSO authentication and source code access.";

const tools = [
  {
    type: "function",
    name: "get_open_source_news",
    description:
      "Retrieve recent news about open-source software. Use this before recommending software, in case recent news would change your answer.",
  },
];

async function runAgent() {
  const inputContext = [
    {
      role: "user",
      content: userPrompt
    }
  ]
  const maxTurns = 5;
  let turnCounter = 0;

  while (turnCounter < maxTurns) {
    console.log(`Turn ${turnCounter + 1}`)
    turnCounter++;

    const turnResponse = await client.responses.create({
      model: process.env.AI_MODEL,
      instructions: systemPrompt,
      input: inputContext,
      tools,
    });

    /**
     * Challenge: Inspect the Latest Model Output
     *
     * The loop runs, but nothing checks what the model returned.
     * Use turnResponse.output.at(-1) to get the latest output item.
     *
     * Your task:
     *
     * 1. If the type is "message", log the output text and return.
     * 2. If the type is "function_call", log the tool name and continue to the next turn.
     *
     * Don't run the tool yet. Just notice that the model is asking for it.
     *
     * Check the hints folder for more guidance!
     */

    const latestOutputItem = turnResponse.output.at(-1);

    if (latestOutputItem.type === "message") {
      console.log(turnResponse.output_text)
      return;
    }

    if (latestOutputItem.type === "function") {
      console.log(`Requesting tool: ${latestOutputItem.name}`)
      continue;
    }

    console.log("\nFull output array:", JSON.stringify(turnResponse.output, null, 2));

  }

  // Inspect what came back
  console.log("Maximum Turns Exceeded");
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
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
