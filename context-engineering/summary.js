import { getTotalTokenCount, getMessageTokenCount } from "./utils.js";
import { generateText } from 'ai';

/**
 * Context Summarization Challenge
 * 
 * Your task is to implement the two functions splitForSummary
 * and generateSummary below.
 * 
 * Available utilities:
 * - getTotalTokenCount(messages) -> total token count for a messages array
 * - getMessageTokenCount(message) -> token count for a single message
 *
 * 💡 Check the hints folder if you're stuck.
 */

/**
 * Challenge 1: Implement splitForSummary
 * 
 * This function's goal is to split the `messages` array into two parts:
 * 
 * - messagesToSummarize: older messages that need to be summarized
 * - remainingMessages: recent messages to keep as-is
 * 
 * You need to find the "split point" (an index) where the number of
 * tokens in remainingMessages is within the tokenTarget.
 */
export function splitForSummary(messages, tokenTarget) {
  // Your implementation here
  
  return {
    messagesToSummarize: [],
    remainingMessages: messages
  };
}

/**
 * Challenge 2: Implement generateSummary
 * 
 * This function takes an array of messages and uses the AI model
 * to create a condensed summary.
 * 
 * Remember, you must add a new message to the array to explicitly
 * ask the AI to create a summary.
 * 
 * Return a final message object containing the summary.
 */
export async function generateSummary(messages, model) {
  // Your implementation here

  const summaryContent = "Placeholder summary";

  return { 
    role: "system", 
    content: `${summaryContent}` 
  };
}