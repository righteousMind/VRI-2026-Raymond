import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto'; // used by Sessions.create

const DATA_DIR = path.resolve('data');

function filePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

function read<T>(name: string): T[] {
  try {
    return JSON.parse(fs.readFileSync(filePath(name), 'utf8')) as T[];
  } catch {
    return [];
  }
}

function write<T>(name: string, data: T[]): void {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2));
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface StoredUser {
  _id: string;
  name: string;       // e.g. "participant1"
  latinIndex: number; // 0–23
  profile: Record<string, unknown>;
}

export const Users = {
  all(): StoredUser[] {
    return read<StoredUser>('users');
  },
  findByName(name: string): StoredUser | undefined {
    return this.all().find((u) => u.name.toLowerCase() === name.toLowerCase());
  },
  findById(id: string): StoredUser | undefined {
    return this.all().find((u) => u._id === id);
  },
  updateProfile(id: string, profile: Record<string, unknown>): StoredUser | undefined {
    const users = this.all();
    const idx = users.findIndex((u) => u._id === id);
    if (idx === -1) return undefined;
    users[idx] = { ...users[idx], profile };
    write('users', users);
    return users[idx];
  },
};

// ── Answers ───────────────────────────────────────────────────────────────────

export interface AnswerEntry {
  questionIndex: number;
  question: string;
  answer: string;
}

export interface StoredAnswers {
  userId: string;
  answers: AnswerEntry[];
  updatedAt: string;
}

export const Answers = {
  findByUser(userId: string): StoredAnswers | undefined {
    return read<StoredAnswers>('answers').find((a) => a.userId === userId);
  },
  upsert(userId: string, answers: AnswerEntry[]): StoredAnswers {
    const all = read<StoredAnswers>('answers').filter((a) => a.userId !== userId);
    const doc: StoredAnswers = { userId, answers, updatedAt: new Date().toISOString() };
    write('answers', [...all, doc]);
    return doc;
  },
};

// ── Sessions ──────────────────────────────────────────────────────────────────

export interface StoredSession {
  _id: string;
  userId: string;
  questionIndex: number;
  delay: number;
  cueType: string;
  cueText?: string;
  answerText?: string;
  createdAt: string;
}

export const Sessions = {
  findByUser(userId: string): StoredSession[] {
    return read<StoredSession>('sessions')
      .filter((s) => s.userId === userId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  create(data: Omit<StoredSession, '_id' | 'createdAt'>): StoredSession {
    const sessions = read<StoredSession>('sessions');
    const session: StoredSession = {
      _id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    write('sessions', [...sessions, session]);
    return session;
  },
};
