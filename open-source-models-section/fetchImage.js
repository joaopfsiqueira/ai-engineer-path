import { InferenceClient } from "@huggingface/inference";
const client = new InferenceClient(process.env.HF_TOKEN);

// Challenge: Generate an image as close as you can to the 'Mona Lisa' reference 
//by inputting your own prompt using the following model provided in the slides. 
// But make sure you don't include her name!

// Don't just rely on the code snippet. 
// Think on where to find the model name and the method to use.

// Once you have completed your code, press the button 'Generate Image' 
//to see your output!

export async function fetchImage() {
  const imageBlob = await client.methodToChange({
    parameters: { num_inference_steps: 5 },
  });

  // Convert Blob → ArrayBuffer → Buffer
  const arrayBuffer = await imageBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return buffer; 
}