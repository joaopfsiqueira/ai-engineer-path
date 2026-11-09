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

    // Inspect the latest item to choose the next step.
    const latestItem = turnResponse.output.at(-1);

    // Return the final answer when the model is done.
    if (latestItem.type === "message") {
      return turnResponse.output_text;
    }

    // Handle a request to run a tool.
    if (latestItem.type === "function_call") {
      // Show which tool the model requested and what it sent.
      console.log("Tool call requested:", latestItem.name);
      console.log("Arguments:", latestItem.arguments);

      // Run the requested local tool.
      if (latestItem.name === "search_swaps") {
        // Parse the tool's JSON arguments.
        const toolInput = JSON.parse(latestItem.arguments);
        // Call the local searchSwaps function with the model's arguments.
        const result = await searchSwaps(toolInput);
        console.log("Database matches:", result.totalMatches);

        // Send the tool result back to the model.
        inputContext.push({
          type: "function_call_output",
          call_id: latestItem.call_id,
          output: JSON.stringify(result),
        });
      }
    }
  }

  // Fall back if the agent uses every turn.
  return "Something went wrong. Please try again.";
}
