import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import authRouter from './routes/auth';
import sessionsRouter from './routes/sessions';
import answersRouter from './routes/answers';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());
app.use('/audio', express.static(path.resolve('public/audio')));
app.use('/api/auth', authRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/answers', answersRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log('OPENAI_API_KEY loaded:', !!process.env.OPENAI_API_KEY);
});
