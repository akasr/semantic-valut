import Chunk from '../models/chunk.js';
import { info } from '../utils/logger.js';

import { createEmbeddings } from './createEmbeddings.js';
import generateAnswer from './llm.js';

async function processQuestions(questions, document) {
  const answers = [];
  for (const question of questions) {
    info('Processing question:', question);
    info('Creating embeddings for question');
    const embedding = await createEmbeddings([question]);
    info('Embeddings created for question');
    const questionEmbedding = embedding[0].embedding;

    // Perform a semantic search on MongoDB Atlas
    info('Performing semantic search');
    const searchResults = await Chunk.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: questionEmbedding,
          numCandidates: 100,
          limit: 5,
          filter: {
            document: document._id,
          },
        },
      },
      {
        $project: {
          text: 1,
          document: 1,
          chunkIndex: 1,
          _id: 0,
        },
      },
    ]).exec();
    info('Semantic search completed', searchResults);

    if (searchResults.length === 0) {
      info('No relevant chunks found for question');
      answers.push({
        question,
        answer: 'I cannot answer this question based on the provided document.',
      });
      continue;
    }

    const answer = await generateAnswer(question, searchResults);
    answers.push({ question, answer });
  }

  return answers;
}

export default processQuestions;
