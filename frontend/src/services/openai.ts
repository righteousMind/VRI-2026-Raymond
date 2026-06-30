import { OpenAIMessage } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function sendMessage(
  conversationHistory: OpenAIMessage[],
  userMessage: string,
): Promise<string> {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history: conversationHistory, message: userMessage }),
  });

  const data = await response.json() as { reply?: string; error?: string };

  if (!response.ok || !data.reply) {
    throw new Error(data.error ?? `Request failed with status ${response.status}`);
  }

  return data.reply;
}
