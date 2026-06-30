import { Router, Request, Response } from 'express';
import { generateText } from '../services/provider';

const router = Router();

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  history: ChatMessage[];
  message: string;
}

router.post('/chat', async (req: Request, res: Response) => {
  const { history, message } = req.body as ChatRequestBody;

  try {
    const reply = await generateText(history, message);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

export default router;
