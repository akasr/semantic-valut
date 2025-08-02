import { Router } from 'express';

import handlePDFProcessing from '../services/handlePDFProcessing.js';
import { error } from '../utils/logger.js';

const documentRouter = Router();
documentRouter.post('/hackrx/run', async (req, res) => {
  try {
    const { documentURL, questions } = req.body;

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
