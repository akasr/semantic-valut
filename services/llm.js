import ollama from 'ollama';

import { info } from '../utils/logger.js';

const llmModel = process.env.OLLAMA_MODEL || 'tinyllama';

const promptTemplate = `
  You are an expert assistant. Your task is to answer the user's question based *only* on the following context. Your answer must be direct, on-point, and no more than three sentences.
  If the answer cannot be found in the context, respond with "I cannot answer this question based on the provided document."

  Context:
  {context}

  Question:
  {question}
`;

async function generateAnswer(question, retrievedChunks) {
  const context = retrievedChunks.map(chunk => chunk.text).join('\n\n');
  const prompt = promptTemplate
    .replace('{context}', context)
    .replace('{question}', question);

  info('Generating answer for question:', question);
  const startLLMTime = Date.now();
  const response = await ollama.chat({
    model: llmModel,
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: question,
      },
    ],
  });

  const endLLMTime = Date.now();
  const llmTime = endLLMTime - startLLMTime;
  info(`Answer generated in ${llmTime}ms`);
  info('Answer:', response.message.content);
  return response.message.content;
}

export default generateAnswer;
