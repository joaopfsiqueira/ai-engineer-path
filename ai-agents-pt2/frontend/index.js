import "../environment.js";
import { systemPrompt } from "./prompts.js";
import { tools } from "./tools.js";
import { searchSwaps } from "../store/index.js";

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

      const result = await runTool(toolCall)
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


/**
 * Challenge: Always Return a Tool Result
 *
 * 1. Give each result a status. "ok" when the search returned records,
 *    "no_results" when it ran but matched nothing (with a message the model can
 *    pass to the user), and "error" when the call could not complete.
 * 2. Return an "error" result for an unknown tool name or an empty query
 *
 * When fixed, a known product, an unknown product, and the simulated Notion
 * failure will all produce model-readable results instead of breaking the
 * request.
 *
 * Check the hints folder for more guidance!
 */
async function runTool(toolCall) {
  if (toolCall.name !== "search_swaps") {
    return {
      status: "error",
      message: "Unknown tool"
    }
  }
  // Parse the tool's JSON arguments.
  const toolInput = JSON.parse(toolCall.arguments);

  if (!toolInput.query) {
    return {
      status: "error",
      message: "Query required."
    }
  }

  try {
    // Call the local searchSwaps function with the model's arguments.
    const result = await searchSwaps(toolInput);
    console.log("Database matches:", result.totalMatches);

    // If the search returned no records, return a "no_results" status
    if (result.totalMatches === 0) {
      return {
        status: "no_results",
        message: "No swaps found matching that product"
      }
    }

    return {
      status: "ok",
      result: result.swaps
    }
  } catch(error) {
    // If the tool call failed, return an error result the model can read.
    return {
      status: "error",
      message: error.message
    }
  }
}
