import { openai, supabase } from './config.js';
import podcasts from './content.js';

async function main(input) {
  try {
    const data = await Promise.all(
    input.map( async (textChunk) => {
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: textChunk
        });
        return { 
          content: textChunk, 
          embedding: embeddingResponse.data[0].embedding 
        }
    })
  );
  
    // Insert content and embedding into Supabase
    const { data: insertedData, error } = await supabase
    .from('documents')
    .insert(insertedData)
    .select();

    if (error) {
      throw new Error(`Erro ao inserir no Supabase: ${error.message}`);
    }

    console.log('Embedding and storing complete!');
  } catch (error) {
    console.error('Error occurred:', error);
  }

}

main(podcasts)