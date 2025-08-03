import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export async function splitDocument(document) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1200,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitText(document);
  return chunks;
}
