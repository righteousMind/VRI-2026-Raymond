import * as FileSystem from 'expo-file-system/legacy';
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

// Generate TTS on server then download all 9 MP3s to device local storage.
// Returns an array indexed by questionIndex with local file URIs.
export async function generateAndCacheAudio(): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/answers/tts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Failed to generate audio');
  const { audioFiles } = await res.json() as {
    audioFiles: { questionIndex: number; url: string }[];
  };

  const localUris: string[] = new Array(audioFiles.length);

  await Promise.all(
    audioFiles.map(async ({ questionIndex, url }) => {
      const localUri = `${FileSystem.documentDirectory}answer_${questionIndex}.mp3`;
      await FileSystem.downloadAsync(url, localUri);
      localUris[questionIndex] = localUri;
    }),
  );

  return localUris;
}
