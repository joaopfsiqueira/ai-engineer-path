import { checkEnvironment } from "./utils.js"
// Import and configure the OpenAI client using environment variables
import OpenAI from "openai"
const aiClient = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
  dangerouslyAllowBrowser: true
})

checkEnvironment();

// Create a string containing the prompt for the model
const userPrompt = "Suggest some gifts for someone who loves hiphop music"

// Wrap the prompt in a message object with a user role
const userMessage = {
  role: "user",
  content: userPrompt
}

// Send an API request with a model and messages array.
const aiResponse = await aiClient.chat.completions.create({
  model: process.env.AI_MODEL,
  messages: [ userMessage ]
})

// Extract the model's generated text from the response
console.log(aiResponse.choices[0].message.content)