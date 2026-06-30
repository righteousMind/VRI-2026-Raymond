import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { getOpenAI, SYSTEM_PROMPT } from '../services/openai';
import { transcribeAudio, generateText } from '../services/provider';

const router = Router();
const upload = multer({ dest: 'tmp/' });

router.post('/voice', upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No audio file provided' });
    return;
  }

  try {
    // 1. STT — whisper or gemini depending on AI_PROVIDER
    const userText = await transcribeAudio(file.path);

    // 2. AI reply — openai or gemini depending on AI_PROVIDER
    const aiText = await generateText([], userText);

    // 3. TTS — always OpenAI tts-1 (Gemini TTS is experimental)
    const fileName = `${crypto.randomUUID()}.mp3`;
    const audioPath = path.resolve('public/audio', fileName);

    const speech = await getOpenAI().audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: aiText,
    });

    fs.writeFileSync(audioPath, Buffer.from(await speech.arrayBuffer()));

    const host = req.headers.host;
    const protocol = req.protocol;
    res.json({ audioUrl: `${protocol}://${host}/audio/${fileName}` });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  } finally {
    fs.unlink(file.path, () => {});
  }
});

export default router;
