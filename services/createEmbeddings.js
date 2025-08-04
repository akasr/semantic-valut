import ollama from 'ollama';

import { error } from '../utils/logger.js';

export async function createEmbeddings(chunks) {
  try {
    if (!Array.isArray(chunks)) {
      throw new Error('Chunks parameter must be an array');
    }

    if (chunks.length === 0) {
      error('No chunks provided for embedding creation');
      return [];
    }

    const data = await Promise.all(
      chunks.map(async (chunk, index) => {
        try {
          const embeddingResponse = await ollama.embeddings({
            model: 'nomic-embed-text',
            prompt: chunk,
          });

          if (!embeddingResponse.embedding) {
            error(`Failed to generate embedding for chunk at index ${index}`);
            return null;
          }

          return {
            content: chunk,
            embedding: embeddingResponse.embedding,
          };
        } catch (chunkError) {
          error(
            `Error processing chunk at index ${index}:`,
            chunkError.message
          );
          return null;
        }
      })
    );

    // Filter out null results
    const validData = data.filter(item => item !== null);

    if (validData.length === 0) {
      throw new Error('Failed to create embeddings for any chunks');
    }

    return validData;
  } catch (err) {
    error('Error in createEmbeddings:', err.message);
    throw err;
  }
}
