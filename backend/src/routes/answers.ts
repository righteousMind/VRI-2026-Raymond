import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { Users, Answers } from '../services/storage';
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
    const user = Users.findById(req.userId!);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const systemPrompt = buildSystemPrompt(user.profile);
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
    Answers.upsert(req.userId!, answers);
    res.json({ answers });
  } catch (err) {
    console.error('[answers/generate]', err);
    res.status(500).json({ error: 'Failed to generate answers' });
  }
});

router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const doc = Answers.findByUser(req.userId!);
  if (!doc) { res.status(404).json({ error: 'No answers found' }); return; }
  res.json({ answers: doc.answers });
});

// POST /api/answers/tts — pre-generate audio for all answers, return URLs
router.post('/tts', requireAuth, async (req: AuthRequest, res: Response) => {
  const doc = Answers.findByUser(req.userId!);
  if (!doc) { res.status(404).json({ error: 'No answers found' }); return; }

  const openai = getOpenAI();
  const audioDir = path.resolve('public/audio');

  try {
    const audioPromises = doc.answers.map(async (a) => {
      const speech = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: a.answer,
      });
      const fileName = `${req.userId}_${a.questionIndex}.mp3`;
      fs.writeFileSync(path.join(audioDir, fileName), Buffer.from(await speech.arrayBuffer()));
      const base = `${req.protocol}://${req.headers.host}`;
      return { questionIndex: a.questionIndex, url: `${base}/audio/${fileName}` };
    });

    const audioFiles = await Promise.all(audioPromises);
    res.json({ audioFiles });
  } catch (err) {
    console.error('[answers/tts]', err);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

export default router;
