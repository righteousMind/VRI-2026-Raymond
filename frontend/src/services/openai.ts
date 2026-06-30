import { OpenAIMessage } from "../types";

const API_URL = "https://api.openai.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are a knowledgeable and empathetic AI Health Coach. Your role is to:
- Provide evidence-based health and wellness guidance
- Help users with nutrition, exercise, sleep, and mental wellbeing
- Offer motivational support and actionable advice
- Always recommend consulting a healthcare professional for medical concerns
- Keep responses concise, friendly, and encouraging

Important: You are a prototype demonstration assistant. Never diagnose medical conditions or replace professional medical advice.`;

export async function sendMessage(
  conversationHistory: OpenAIMessage[],
  userMessage: string,
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OpenAI API key is missing. Add EXPO_PUBLIC_OPENAI_API_KEY to your .env file.",
    );
  }

  const messages: OpenAIMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { error?: { message?: string } }).error?.message ??
        `OpenAI request failed with status ${response.status}`,
    );
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response content received from OpenAI.");
  }

  return content.trim();
}
