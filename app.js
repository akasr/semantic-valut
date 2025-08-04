import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import documentRouter from './controllers/document.js';
import loginRouter from './controllers/login.js';
import userRouter from './controllers/user.js';
import { info, error } from './utils/logger.js';
import middleware from './utils/middleware.js';

const app = express();

info('connecting to', process.env.MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    info('Connected to MongoDB');
  })
  .catch(err => {
    error('error connecting to MongoDB: ', err.message);
  });

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);
app.use('/api/v1/login', loginRouter);
app.use('/api/v1/users', userRouter);
app.use(middleware.tokenExtractor);
app.use(middleware.userExtractor);
app.use('/api/v1/', documentRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
