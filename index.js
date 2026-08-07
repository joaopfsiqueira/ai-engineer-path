import { checkEnvironment } from "./utils.js"
import OpenAI from "openai"

// Initialize the OpenAI client using environment variables
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
  dangerouslyAllowBrowser: true
})

checkEnvironment();

/**
 * Challenge: Separating Intent from Instructions
 *
 * Right now, our entire prompt lives in a single user message.
 * This works — but it’s fragile.
 *
 * Your job is to:
 *
 * 1. Move the behavioral instructions into a system message
 * 2. Keep the user's actual request clean and minimal
 * 3. Send both messages in the messages array
 *
 */
const messages = [ 
  {
    role: "system",
    content: `Make these suggestions thoughtful and practical. 
    Your response must be under 100 words. 
    Skip intros and conclusions. 
    Only output gift suggestions.`
  },
  {
    role: "user",
    content: `Suggest some gifts for someone who loves hiphop music.`
  }
]

const response = await openai.chat.completions.create({
  model: process.env.AI_MODEL,
  messages
})

// Extract the model's generated text from the response
console.log(response.choices[0].message.content)