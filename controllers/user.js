import bcrypt from 'bcryptjs';
import express from 'express';

import User from '../models/user.js';

const userRouter = express.Router();

userRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('documents', {
    originalUrl: 1,
  });
  response.json(users);
});

userRouter.post('/', async (request, response) => {
  const { username, email, password } = request.body;

  if (!password || password.length < 3) {
    return response
      .status(400)
      .json({ error: 'Password must be at least 3 characters long' });
  }

  if (!username || username.length < 3) {
    return response
      .status(400)
      .json({ error: 'Username must be at least 3 characters long' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    email,
    passwordHash,
  });

  try {
    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message });
    } else if (error.code === 11000) {
      return response.status(400).json({ error: 'Username must be unique' });
    }
    throw error;
  }
});

export default userRouter;
