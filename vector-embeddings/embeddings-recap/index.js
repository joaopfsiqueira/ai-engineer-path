import {openai} from './config.js';

const content = [
  "Hello, world.",
]; 

async function main() {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: content,
  });
  console.log(embedding.data[0].embedding);
}
main();