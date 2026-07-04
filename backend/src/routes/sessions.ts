import { Router, Response } from 'express';
import { Sessions } from '../services/storage';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/sessions — log a completed trial
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  const { questionIndex, delay, cueType, cueText, answerText } = req.body;
  try {
    const session = Sessions.create({
      userId: req.userId!,
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
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const sessions = Sessions.findByUser(req.userId!);
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

export default router;
