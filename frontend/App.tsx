import { registerRootComponent } from 'expo';
import React from 'react';
import ChatScreen from './src/screens/ChatScreen';

function App() {
  return <ChatScreen />;
}

registerRootComponent(App);
