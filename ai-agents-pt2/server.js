import "./environment.js";
import express from "express";
import OpenAI from "openai";
import { checkHealth } from "./store/github.js";

// Create the Express app for our backend server
const app = express();
// Initialize an OpenAI client for your provider using env vars
const client = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
});

const tools = [
  {
    type: "function",
    name: "check_health",
    description: "Check the maintenance health of a project. Use this to verify if a suggested alternative is actively maintained.",
    parameters: {
      type: "object",
      properties: {
        project_name: {
          type: "string",
          description: "A project name. Examples: 'Mumble' or 'Strapi'.",
        },
      },
      required: ["project_name"],
      additionalProperties: false,
    },
    strict: true,
  },
];

const prompts = [
  "Is matermost still actively maintained?",
  "Is paperlessNGX repo doing well these days?",
  "Jitsi still actiive?",
  "is simplex a good telegram replacement"
];

async function inspectPrompt(userPrompt) {
  console.log(`\nPrompt: ${userPrompt}`);

  // Start the conversation with the user's maintenance question.
  const inputContext = [{ role: "user", content: userPrompt }];

  // Turn 1: the model decides whether this question needs the health tool.
  console.log("Turn 1");
  const requestedTool = await runTurn(inputContext);
  if (!requestedTool) {
    return;
  }


  // Turn 2: the model reads our tool result and decides what to do next.
  console.log("Turn 2");
  const retriedTool = await runTurn(inputContext);
  if (!retriedTool) {
    return;
  }
}

// Send the conversation to the model, log its turn, and run any tools it requests.
// Returns true if the model requested a tool, so there's a result to send back.
async function runTurn(inputContext) {
  const response = await client.responses.create({
    model: process.env.AI_MODEL,
    instructions:
      "You are an open-source software advisor. Use tools only when they clearly improve the answer.",
    input: inputContext,
    tools,
    tool_choice: "auto",
  });

  // Preserve the model's whole output turn for the next request.
  inputContext.push(...response.output);

  const toolCalls = response.output.filter(
    (item) => item.type === "function_call"
  );

  if (toolCalls.length > 0) {
    for (const toolCall of toolCalls) {
      console.log("tool name:", toolCall.name);
      console.log("tool arguments:", toolCall.arguments);

      // Run the requested function and log its result.
      const result = await runTool(toolCall);
      console.log("tool result:", result);

      // Send the result back under the same call ID, so the model reads it next turn.
      inputContext.push({
        type: "function_call_output",
        call_id: toolCall.call_id,
        output: JSON.stringify(result),
      });
    }
    return true;
  } else {
    console.log("content:", response.output_text);
    return false;
  }
}

async function runTool(toolCall) {
  try {
    // Parse the tool's JSON arguments.
    const toolInput = JSON.parse(toolCall.arguments || "{}");

    // Run the local checkHealth function with the model's arguments.
    if (toolCall.name === "check_health") {
      return await checkHealth(toolInput);
    }

    return {
      status: "error",
      message: "Unknown tool: " + toolCall.name,
    };
  } catch (error) {
    return {
      status: "error",
      message: toolCall.name + " failed.",
      details: error.message,
    };
  }
}

async function runHealthCheckLab() {
  for (const prompt of prompts) {
    await inspectPrompt(prompt);
  }

  return "Health check lab complete. Check the server console for each result.";
}

// Run the lab when the frontend requests it.
app.post("/api/agent", async (_req, res) => {
  try {
    const agentResponse = await runHealthCheckLab();
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
