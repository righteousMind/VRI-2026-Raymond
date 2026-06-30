import { SYSTEM_PROMPT, getOpenAI } from './openai';
import { geminiGenerateText, geminiTranscribeAudio } from './gemini';
import { toFile } from 'openai';
import fs from 'fs';

export { SYSTEM_PROMPT };

// Set AI_PROVIDER=gemini in .env to use Gemini; defaults to openai
function useGemini(): boolean {
  return (process.env.AI_PROVIDER ?? 'openai').toLowerCase() === 'gemini';
}

export async function generateText(
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string,
): Promise<string> {
  if (useGemini()) {
    console.log('[AI] generateText → gemini-2.0-flash (free)');
    return geminiGenerateText(history, userMessage, SYSTEM_PROMPT);
  }

  console.log('[AI] generateText → gpt-4o-mini (openai)');
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const reply = completion.choices[0]?.message?.content;
  if (!reply) throw new Error('No response from OpenAI');
  return reply.trim();
}

export async function transcribeAudio(filePath: string): Promise<string> {
  if (useGemini()) {
    console.log('[AI] transcribeAudio → gemini-2.0-flash (free)');
    return geminiTranscribeAudio(filePath);
  }

  console.log('[AI] transcribeAudio → whisper-1 (openai)');
  const openai = getOpenAI();
  const transcription = await openai.audio.transcriptions.create({
    file: await toFile(fs.createReadStream(filePath), 'voice.m4a', { type: 'audio/m4a' }),
    model: 'whisper-1',
  });
  return transcription.text;
}
