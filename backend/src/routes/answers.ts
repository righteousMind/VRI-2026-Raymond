import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { User } from '../models/User';
import UserAnswers from '../models/UserAnswers';
import { getOpenAI } from '../services/openai';

const router = Router();

const QUESTIONS = [
  'Based on my routine, when would be the best time for a 30-minute walk today?',
  'Given my current activity level, what should my walking goal be today?',
  'What would be the easiest way for me to fit more steps into my day?',
  'Considering my schedule, should I walk before or after dinner?',
  'What should I do if I feel tired after work today?',
  'Looking at my routine, what is the most realistic exercise plan for today?',
  'Which part of my day has the best opportunity for physical activity?',
  'How can I reach my step goal without changing my schedule too much?',
  'Based on everything you know about me, what is your recommendation for staying active today?',
];

function buildSystemPrompt(profile: Record<string, unknown>): string {
  return `You are Aura, a concise AI health coach. The user has shared their profile:
- Age: ${profile.age}
- Work hours: ${profile.workStart} – ${profile.workEnd}
- Commute: ${profile.commuteMinutes} minutes
- Dinner time: ${profile.dinnerTime}
- Daily step goal: ${profile.dailyStepGoal} steps
- Preferred exercise: ${profile.preferredExercise}
- Most energetic time of day: ${profile.mostEnergeticTime}
- Current activity level: ${profile.activityLevel}

Answer each question in 3–5 natural spoken sentences. Be specific to the user's schedule and numbers. Do not use bullet points or markdown.`;
}

router.post('/generate', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const profile = user.profile as Record<string, unknown>;
    const systemPrompt = buildSystemPrompt(profile);
    const openai = getOpenAI();

    const answerPromises = QUESTIONS.map((question, i) =>
      openai.chat.completions
        .create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question },
          ],
          max_tokens: 200,
          temperature: 0.7,
        })
        .then((r) => ({
          questionIndex: i,
          question,
          answer: r.choices[0].message.content?.trim() ?? '',
        })),
    );

    const answers = await Promise.all(answerPromises);

    await UserAnswers.findOneAndUpdate(
      { userId: req.userId },
      { userId: req.userId, answers },
      { upsert: true, new: true },
    );

    res.json({ answers });
  } catch (err) {
    console.error('[answers/generate]', err);
    res.status(500).json({ error: 'Failed to generate answers' });
  }
});

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await UserAnswers.findOne({ userId: req.userId });
    if (!doc) { res.status(404).json({ error: 'No answers found' }); return; }
    res.json({ answers: doc.answers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch answers' });
  }
});

export default router;
