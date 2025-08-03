import { Router } from 'express';

import Chunk from '../models/chunk.js';
import Document from '../models/document.js';
import User from '../models/user.js';
import { createEmbeddings } from '../services/createEmbeddings.js';
import handlePDFProcessing from '../services/processPdf.js';
import { error } from '../utils/logger.js';

const documentRouter = Router();
documentRouter.post('/hackrx/run', async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ error: 'userId missing or not valid' });
    }

    const { documentURL, questions } = req.body;

    let document = await Document.findOne({
      originalUrl: documentURL,
      user: user._id,
    });
    if (!document) {
      document = new Document({ originalUrl: documentURL, user: user._id });
    }

    if (!documentURL) {
      return res.status(400).json({ error: 'documentURL is required' });
    }

    const extractedText = await handlePDFProcessing(documentURL);
    res.json({ extractedText });
  } catch (err) {
    error('Error in /hackrx/run:', err);
    res.status(500).json({ error: err.message });
  }
});

export default documentRouter;
