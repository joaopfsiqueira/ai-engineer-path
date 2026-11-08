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
  },
];

const userPrompt = "I want to replace Calendly for our team. We need SSO authentication and source code access.";

async function getOpenSourceNews() {
  const rawNews = await readFile(
    new URL("./news.json", import.meta.url),
    "utf8"
  );
  return JSON.parse(rawNews);
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

    console.log(turnResponse.output);
    // Preserve all output items for the next turn
    inputContext.push(...turnResponse.output);


    const latestOutputItem = turnResponse.output.at(-1);

    if (latestOutputItem?.type === "message") {
      console.log("\n" + (turnResponse.output_text || "Something went wrong. Please try again."));
      return;
    }

    if (latestOutputItem?.type === "function_call") {
      console.log("Tool call requested:", latestOutputItem.name);
      console.log("Call ID:", latestOutputItem.call_id);

      if (latestOutputItem.name === "get_open_source_news") {
        // Run the tool locally
        const openSourceNews = await getOpenSourceNews();
        console.log("get_open_source_news executed: Got", openSourceNews.length, "items");

 

        // Tool outputs must point back to the call_id of the tool request
        inputContext.push({
          type: "function_call_output",
          call_id: latestOutputItem.call_id,
          output: JSON.stringify(openSourceNews),
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
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
