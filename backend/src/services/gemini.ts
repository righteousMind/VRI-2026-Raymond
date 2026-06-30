import { GoogleGenerativeAI } from '@google/generative-ai';

let client: GoogleGenerativeAI | null = null;

function getGemini(): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
  }
  return client;
}

// 免费 model 选项：
// 'gemini-2.0-flash'   → 最新快，推荐
// 'gemini-1.5-flash'   → 稳定，免费 tier 更宽松
const FREE_MODEL = 'gemini-1.5-flash';

export async function geminiGenerateText(
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string,
  systemPrompt: string,
): Promise<string> {
  const model = getGemini().getGenerativeModel({
    model: FREE_MODEL,
    systemInstruction: systemPrompt,
  });

  const chat = model.startChat({
    history: history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

export async function geminiTranscribeAudio(filePath: string): Promise<string> {
  const model = getGemini().getGenerativeModel({ model: FREE_MODEL });

  const audioBase64 = require('fs').readFileSync(filePath).toString('base64');

  const result = await model.generateContent([
    { inlineData: { data: audioBase64, mimeType: 'audio/m4a' } },
    { text: 'Transcribe this audio accurately. Return only the transcribed text, nothing else.' },
  ]);

  return result.response.text();
}
