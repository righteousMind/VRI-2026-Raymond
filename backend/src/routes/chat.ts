import { Router, Request, Response } from 'express';
import { getOpenAI, SYSTEM_PROMPT } from '../services/openai';

const router = Router();

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  history: ChatMessage[];
  message: string;
}

router.post('/chat', async (req: Request, res: Response) => {
  const { history, message } = req.body as ChatRequestBody;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content;
    if (!reply) {
      res.status(500).json({ error: 'No response content received from OpenAI.' });
      return;
    }

    res.json({ reply: reply.trim() });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

export default router;
