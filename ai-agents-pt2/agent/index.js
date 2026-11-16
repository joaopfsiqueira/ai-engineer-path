import "../environment.js";
import { systemPrompt } from "./prompts.js";
import { tools } from "./tools.js";
import { searchSwaps } from "../store/swaps.js";

// Runs the agent loop until it finishes with an answer
export async function runAgent({ client, userPrompt }) {
  // Start the conversation with the user's request.
  const inputContext = [{ role: "user", content: userPrompt }];

  // Limit how many turns the agent can take to avoid infinite loops.
  const maxTurns = 5;
  let turnCount = 0;

  // Keep going until the agent finishes or runs out of turns.
  while (turnCount < maxTurns) {
    turnCount++;
    console.log(`Turn ${turnCount}`);

    // Send the inputContext to the model and get its response.
    const turnResponse = await client.responses.create({
      model: process.env.AI_MODEL,
      instructions: systemPrompt,
      input: inputContext,
      tools,
    });

    console.log(turnResponse.output);

    // Preserve the model's whole output turn for the next request.
    inputContext.push(...turnResponse.output);

    // Create a list of all tool calls requested in this turn.
    const toolCalls = turnResponse.output.filter(
      (item) => item.type === "function_call"
    );

    // If there are no tool calls, return the model's final output text.
    if (toolCalls.length === 0) {
      return turnResponse.output_text;
    }

    // Process each tool call in the order they were requested.
    for (const toolCall of toolCalls) {
      console.log("Tool call requested:", toolCall.name);
      console.log("Arguments:", toolCall.arguments);

      const result = await runTool(toolCall);

      inputContext.push({
        type: "function_call_output",
        call_id: toolCall.call_id,
        output: JSON.stringify(result),
      });
    }
  }

  // Fall back if the agent uses every turn.
  return "Something went wrong. Please try again.";
}

async function runTool(toolCall) {
  // Parse the tool's JSON arguments.
  const toolInput = JSON.parse(toolCall.arguments);

  try {
    // Run the store function for the tool the model requested.
    if (toolCall.name === "search_swaps") {
      return await searchSwaps(toolInput);
    }
  } catch (error) {
    // If the tool call failed, return an error result the model can read.
    return {
      status: "error",
      message: error.message,
    };
  }

  // If the model requested a tool that doesn't exist, return an error result.
  return {
    status: "error",
    message: "Unknown tool",
  };
}
