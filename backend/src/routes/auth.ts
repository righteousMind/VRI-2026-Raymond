import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Users, StoredUser } from '../services/storage';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

function signToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1d' });
}

function sanitize(user: StoredUser) {
  return { _id: user._id, name: user.name, latinIndex: user.latinIndex, profile: user.profile };
}

// POST /api/auth/login — just username, no password
router.post('/login', (req, res: Response) => {
  const { username } = req.body as { username: string };
  if (!username) { res.status(400).json({ error: 'username is required' }); return; }

  const user = Users.findByName(username.trim());
  if (!user) { res.status(401).json({ error: 'Participant not found' }); return; }

  res.json({ token: signToken(user._id), user: sanitize(user) });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  const user = Users.findById(req.userId!);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ user: sanitize(user) });
});

// PUT /api/auth/profile — update health profile fields
router.put('/profile', requireAuth, (req: AuthRequest, res: Response) => {
  const { profile } = req.body as { profile?: Record<string, unknown> };
  if (!profile) { res.status(400).json({ error: 'profile is required' }); return; }
  const user = Users.updateProfile(req.userId!, profile);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ user: sanitize(user) });
});

export default router;
