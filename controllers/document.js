import { Router } from 'express';

import Chunk from '../models/chunk.js';
import Document from '../models/document.js';
import User from '../models/user.js';
import { createEmbeddings } from '../services/createEmbeddings.js';
import handlePDFProcessing from '../services/processPdf.js';
import processQuestions from '../services/processQuestions.js';
import { splitDocument } from '../services/splitDocument.js';
import { error, info } from '../utils/logger.js';

const documentRouter = Router();
documentRouter.post('/hackrx/run', async (req, res) => {
  info('Request received');
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ error: 'userId missing or not valid' });
    }

    const { documents: documentURL, questions } = req.body;

    let document = await Document.findOne({
      originalUrl: documentURL,
      user: user._id,
    });
    info('Searching for document');
    if (!document) {
      info('Document not found, creating new document');
      document = new Document({ originalUrl: documentURL, user: user._id });
      info('Document created');

      info('Processing document');
      const extractedText = await handlePDFProcessing(documentURL);
      info('Document processed');

      info('Splitting document');
      const chunks = await splitDocument(extractedText);
      info('Chunks split');

      info('Creating embeddings');
      const embeddings = await createEmbeddings(chunks);
      info('Embeddings created');

      info('Saving chunks');
      const chunkPromises = embeddings.map(async (embedding, index) => {
        const newChunk = new Chunk({
          document: document._id,
          text: embedding.content,
          embedding: embedding.embedding,
          chunkIndex: index,
        });
        await newChunk.save();
      });
      info('Chunks saved');

      info('Saving document');
      await Promise.all(chunkPromises);
      info('Document saved');

      info('Saving user');
      await document.save();
      user.documents.push(document._id);
      await user.save();
      info('User saved');
    }

    if (!documentURL) {
      return res.status(400).json({ error: 'documentURL is required' });
    }

    info('Processing questions');
    const answers = await processQuestions(questions, document);
    info('Questions processed');

    res.status(200).json({ answers });
  } catch (err) {
    error('Error in /hackrx/run:', err);
    res.status(500).json({ error: err.message });
  }
});

export default documentRouter;
