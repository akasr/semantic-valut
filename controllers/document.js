import { Router } from 'express';

import Chunk from '../models/chunk.js';
import Document from '../models/document.js';
import User from '../models/user.js';
import { createEmbeddings } from '../services/createEmbeddings.js';
import handlePDFProcessing from '../services/processPdf.js';
import { splitDocument } from '../services/splitDocument.js';
import { error, info } from '../utils/logger.js';

const documentRouter = Router();
documentRouter.post('/hackrx/run', async (req, res) => {
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
    if (!document) {
      document = new Document({ originalUrl: documentURL, user: user._id });

      const extractedText = await handlePDFProcessing(documentURL);
      const chunks = await splitDocument(extractedText);
      const embeddings = await createEmbeddings(chunks);
      info('embeddings', embeddings);

      const chunkPromises = embeddings.map(async (embedding, index) => {
        const newChunk = new Chunk({
          document: document._id,
          text: embedding.content,
          embedding: embedding.embedding,
          chunkIndex: index,
        });
        await newChunk.save();
      });

      await Promise.all(chunkPromises);
      await document.save();
      user.documents.push(document._id);
      await user.save();
    }

    if (!documentURL) {
      return res.status(400).json({ error: 'documentURL is required' });
    }

    res.json({ document });
  } catch (err) {
    error('Error in /hackrx/run:', err);
    res.status(500).json({ error: err.message });
  }
});

export default documentRouter;
