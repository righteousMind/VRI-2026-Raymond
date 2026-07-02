import { API_URL } from '../config';

export interface UserProfile {
  age?: number;
  workStart?: string;
  workEnd?: string;
  commuteMinutes?: number;
  dinnerTime?: string;
  dailyStepGoal?: number;
  preferredExercise?: string;
  mostEnergeticTime?: string;
  activityLevel?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  latinIndex: number;
  profile: UserProfile;
}

let _token: string | null = null;

export function getToken(): string {
  return _token ?? '';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/api/auth${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  profile: UserProfile;
}): Promise<User> {
  const data = await request<{ token: string; user: User }>('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  _token = data.token;
  return data.user;
}

export async function login(email: string, password: string): Promise<User> {
  const data = await request<{ token: string; user: User }>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  _token = data.token;
  return data.user;
}

export async function updateProfile(payload: { name?: string; profile?: UserProfile }): Promise<User> {
  const data = await request<{ user: User }>('/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return data.user;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await request('/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function logout(): void {
  _token = null;
}
