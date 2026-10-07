import { CharacterTextSplitter } from "langchain/text_splitter";

// LangChain text splitter
async function splitDocument() {
  const response = await fetch('podcasts.txt');
  const text = await response.text();

  const splitter = new CharacterTextSplitter({
    separator: " ",
    chunkSize: 7,
    chunkOverlap: 3,
  });
  const output = await splitter.createDocuments([text]);

}
splitDocument()