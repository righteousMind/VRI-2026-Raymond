import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { toFile } from 'openai';
import { getOpenAI, SYSTEM_PROMPT } from '../services/openai';

const router = Router();
const upload = multer({ dest: 'tmp/' });

router.post('/voice', upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No audio file provided' });
    return;
  }

  try {
    const openai = getOpenAI();

    // 1. Whisper — 语音转文字
    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(fs.createReadStream(file.path), 'voice.m4a', { type: 'audio/m4a' }),
      model: 'whisper-1',
    });
    const userText = transcription.text;

    // 2. ChatGPT — 生成回复
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userText },
      ],
    });
    const aiText = response.output_text;

    // 3. TTS — 文字转语音
    const fileName = `${crypto.randomUUID()}.mp3`;
    const audioPath = path.resolve('public/audio', fileName);

    const speech = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: aiText,
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    fs.writeFileSync(audioPath, buffer);

    // 返回音频 URL
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
