import "../environment.js";
import { systemPrompt } from "./prompts.js";
import { tools } from "./tools.js";
import { searchSwaps } from "../store/swaps.js";
import { checkHealth } from "../store/github.js";

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
      console.log(
        `Tool result [${result.status}]:`,
        result.message || `${result.result?.length ?? 0} items`
      );

      inputContext.push({
        type: "function_call_output",
        call_id: toolCall.call_id,
        output: JSON.stringify(result),
      });
    }
  }

  /**
   * Challenge: Complete the Agent Loop
   *
   * When the loop runs out of turns, we return a generic apology and throw
   * away the tool results already sitting in inputContext.
   *
   * Your task:
   *
   * 1. Make a seperate responses.create() request after turns run out that 
   *    returns an answer which:
   *    A) Recommends what the OpenSwap agent managed to verify 
   *    B) States what information couldn't be verified
   *
   * 2. Set tool_choice: "none" so the model can't call tools in this request.
   *
   * 3. Return that response's text instead of the generic error message.
   *
   * Leave maxTurns at 3, then run the demo request again. When the turns
   * run out, you should get a final answer written from the tool results
   * already in the context.
   *
   * Check the hints folder for more guidance!
   */

  const finalResponse = await client.responses.create({
    model: process.env.AI_MODEL,
    instructions: `${systemPrompt}

    You have reached the maximum number of turns. Write a final answer with recommendations based on the information you were able to verify. If some information could not be verified, state so in your answer instead of guessing.
    `,
    input: inputContext,
    tool_choice: "none"
  })

  // Fall back if the agent uses every turn.
  return finalResponse.output_text;
}

async function runTool(toolCall) {
  // Parse the tool's JSON arguments.
  const toolInput = JSON.parse(toolCall.arguments);

  try {
    // Run the store function for the tool the model requested.
    if (toolCall.name === "search_swaps") {
      return await searchSwaps(toolInput);
    }

    if (toolCall.name === "check_health") {
      return await checkHealth(toolInput);
    }
  } catch (error) {
    // If the tool call failed, return an error result the model can read.
    return {
      status: "error",
      retryable: false,
      message: error.message,
    };
  }

  // If the model requested a tool that doesn't exist, return an error result.
  return {
    status: "error",
    retryable: false,
    message: "Unknown tool",
  };
}
