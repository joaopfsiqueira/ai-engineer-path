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
    model: "black-forest-labs/FLUX.1-schnell",
    provider: "hf-inference",
    inputs:  "A Renaissance oil painting of a seated woman, upper body portrait, centered composition. She has light skin, soft facial features, and a subtle enigmatic smile. Dark brown hair, middle-parted, smooth and slightly wavy, falling over her shoulders. Her hands are gently folded in front of her, one resting over the other. She wears a dark, modest Renaissance dress with soft fabric folds and muted tones. The background is a distant atmospheric landscape with winding paths, rivers, rocky hills, and soft blue-green mountains fading into haze. Lighting is soft and diffused, with smooth transitions between light and shadow (sfumato), no harsh edges. Warm natural tones, delicate shading, highly detailed, realistic anatomy, classical 16th-century Italian painting style, oil on wood panel texture, subtle craquelure.",
    parameters: { num_inference_steps: 5 },
  });

  // Convert Blob → ArrayBuffer → Buffer
  const arrayBuffer = await imageBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return buffer; 
}