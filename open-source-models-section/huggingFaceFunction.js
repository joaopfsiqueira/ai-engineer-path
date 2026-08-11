import { InferenceClient } from "@huggingface/inference";
import dotenv from 'dotenv';

dotenv.config();
const client = new InferenceClient(process.env.HF_TOKEN);

const inputText = "A cherry blossom is the flower from a Prunus tree, of which there are many different kinds. Species cherry blossoms are found throughout the world being especially common in regions in the Northern Hemisphere with temperate climates, including Japan, China, and Korea, as well as Nepal, India, Pakistan, Iran, and Afghanistan, and several areas across northern Europe.Japan is particularly famous for its cherry blossom due its large number of varieties and the nationwide celebrations during the blooming season. As the buds burst open in parks and streets across the country, people throw picnic and hanami (flower viewing) parties to appreciate the transient beauty of the flowers and welcome in the warmer weather. Cherry blossoms in Japanese are known as sakura and it would not be an exaggeration to say they are a national obsession.";

export async function textSummarization() {
  const response = await client.textClassification({
    model:  "distilbert/distilbert-base-uncased-finetuned-sst-2-english",
    inputs: inputText,
    provider: "hf-inference",
  });

  return response;
};
