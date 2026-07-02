import { API_URL } from '../config';
import { getToken } from './auth';

export interface AnswerEntry {
  questionIndex: number;
  question: string;
  answer: string;
}

export async function generateAnswers(): Promise<AnswerEntry[]> {
  const res = await fetch(`${API_URL}/api/answers/generate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to generate answers');
  }
  const data = await res.json();
  return data.answers;
}

export async function getAnswers(): Promise<AnswerEntry[]> {
  const res = await fetch(`${API_URL}/api/answers`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('No answers found');
  const data = await res.json();
  return data.answers;
}
