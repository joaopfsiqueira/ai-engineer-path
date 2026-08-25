import openai from './config.js';

/** Create embeddings representing the input text */
async function main() {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: "Hello, world!",
  });
  console.log(embedding.data[0].embedding);
}
main();
