import openai from './config.js';

/** Create embeddings representing the input text */
async function main() {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: "The quick brown fox jumped over the lazy dog",
  });
  console.log(embedding);
}
main();
