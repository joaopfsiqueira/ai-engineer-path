import { openai, supabase } from './config.js';
import podcasts from './content.js';

async function main(input) {
  await Promise.all(
    input.map( async (textChunk) => {
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: textChunk
        });
        const data = { 
          content: textChunk, 
          embedding: embeddingResponse.data[0].embedding 
        }
        console.log(data);  
    })    
  );
  console.log('Embedding complete!');
}