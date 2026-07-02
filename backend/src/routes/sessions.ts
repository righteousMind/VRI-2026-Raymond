import { Router, Response } from 'express';
import { Session } from '../models/Session';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/sessions — log a completed trial
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { questionIndex, delay, cueType, cueText, answerText } = req.body;
  try {
    const session = await Session.create({
      userId: req.userId,
      questionIndex,
      delay,
      cueType,
      cueText,
      answerText,
    });
    res.status(201).json({ session });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// GET /api/sessions — get all sessions for current user
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await Session.find({ userId: req.userId }).sort({ createdAt: 1 });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

export default router;
