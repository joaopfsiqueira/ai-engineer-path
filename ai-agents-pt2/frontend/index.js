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
    
    console.log(turnResponse.output)

    // Preserve the model's whole output turn for the next request.
    inputContext.push(...turnResponse.output);

    /**
     * Challenge: Handling Every Tool Call
     *
     * Our code only inspects the last item in the output array, 
     * so every earlier tool call is dropped and the model never 
     * gets the tool results it asked for.
     *
     * Your task:
     *
     * 1. Filter turnResponse.output to collect every item whose type is
     *    "function_call".
     * 2. If there are no tool calls, return the model's final answer text.
     * 3. Loop over the tool calls, run each one, and push a
     *    function_call_output carrying that call's own call_id.
     *
     * You'll know it works when a two-product request comes back with real
     * matches for both products, and the logs show the model handled 
     * two tool calls in the same turn.
     *
     * Check the hints folder for more guidance!
     */

    // Create a list of all tool calls requested in this turn.
    const toolCalls = turnResponse.output.filter(
      (outputItem) => outputItem.type === "function_call"
    )

    // If there are no tool calls, return the model's final output text.
    if (toolCalls.length === 0) {
      return turnResponse.output_text
    }

    // Loop over the tool calls, run each one
    for (const toolCall of toolCalls) {
      // Show which tool the model requested and what it sent.
      console.log("Tool call requested:", toolCall.name);
      console.log("Arguments:", toolCall.arguments);

      // Run the requested local tool.
      if (toolCall.name === "search_swaps") {
        // Parse the tool's JSON arguments.
        const toolInput = JSON.parse(toolCall.arguments);
        // Call the local searchSwaps function with the model's arguments.
        const result = await searchSwaps(toolInput);
        console.log("Database matches:", result.totalMatches);

        // Send the tool result back to the model.
        inputContext.push({
          type: "function_call_output",
          call_id: toolCall.call_id,
          output: JSON.stringify(result),
        });
      }
    }
  }

  // Fall back if the agent uses every turn.
  return "Something went wrong. Please try again.";
}
