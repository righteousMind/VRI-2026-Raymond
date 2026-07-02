import { registerRootComponent } from 'expo';
import React, { useState } from 'react';
import { logout, User } from './src/services/auth';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import IntroScreen from './src/screens/IntroScreen';
import VoiceScreen from './src/screens/VoiceScreen';

type Screen = 'login' | 'register' | 'profile-setup' | 'intro' | 'app';

function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);

  function handleLogin(u: User) { setUser(u); setScreen('app'); }
  function handleRegister(u: User) { setUser(u); setScreen('profile-setup'); }
  function handleProfileComplete(u: User) { setUser(u); setScreen('intro'); }
  function handleLogout() { logout(); setUser(null); setScreen('login'); }

  if (screen === 'login') {
    return <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen('register')} />;
  }

  if (screen === 'register') {
    return <RegisterScreen onRegister={handleRegister} onGoLogin={() => setScreen('login')} />;
  }

  if (screen === 'profile-setup') {
    return <ProfileSetupScreen user={user!} onComplete={(u) => handleProfileComplete(u)} />;
  }

  if (screen === 'intro') {
    return <IntroScreen onContinue={() => setScreen('app')} />;
  }

  return <VoiceScreen user={user} onUpdateUser={setUser} onLogout={handleLogout} />;
}

registerRootComponent(App);
