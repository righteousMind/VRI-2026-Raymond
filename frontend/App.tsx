import { registerRootComponent } from 'expo';
import React, { useState } from 'react';
import { logout, User } from './src/services/auth';
import { AnswerEntry } from './src/services/answers';
import LoginScreen from './src/screens/LoginScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import GeneratingScreen from './src/screens/GeneratingScreen';
import IntroScreen from './src/screens/IntroScreen';
import VoiceScreen from './src/screens/VoiceScreen';

type Screen = 'login' | 'profile-setup' | 'generating' | 'intro' | 'app';

function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [answers, setAnswers] = useState<AnswerEntry[]>([]);

  function handleLogin(u: User) { setUser(u); setScreen('profile-setup'); }
  function handleProfileSaved(u: User) { setUser(u); setScreen('generating'); }
  function handleReady(ans: AnswerEntry[]) { setAnswers(ans); setScreen('intro'); }
  function handleGenerateError(msg: string) { console.error(msg); setScreen('profile-setup'); }
  function handleLogout() { logout(); setUser(null); setAnswers([]); setScreen('login'); }

  if (screen === 'login') return <LoginScreen onLogin={handleLogin} />;
  if (screen === 'profile-setup') return <ProfileSetupScreen user={user!} onComplete={handleProfileSaved} />;
  if (screen === 'generating') return <GeneratingScreen onReady={handleReady} onError={handleGenerateError} />;
  if (screen === 'intro') return <IntroScreen onContinue={() => setScreen('app')} />;
  return <VoiceScreen user={user} answers={answers} onUpdateUser={setUser} onLogout={handleLogout} />;
}

registerRootComponent(App);
