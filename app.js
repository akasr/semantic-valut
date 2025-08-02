import express from 'express';

import documentRouter from './controllers/document.js';

const app = express();

app.use(express.json());
app.use('/api/v1', documentRouter);

export default app;
