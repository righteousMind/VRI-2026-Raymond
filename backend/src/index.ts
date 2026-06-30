import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import chatRouter from './routes/chat';
import voiceRouter from './routes/voice';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());
app.use('/audio', express.static(path.resolve('public/audio')));
app.use('/api', chatRouter);
app.use('/api', voiceRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log('OPENAI_API_KEY loaded:', !!process.env.OPENAI_API_KEY);
});
