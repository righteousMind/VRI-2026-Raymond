import React, { useState, useRef, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import VoiceScreen from './VoiceScreen';
import { sendMessage } from '../services/openai';
import { Message, OpenAIMessage } from '../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm your AI Health Coach. I'm here to help you with nutrition, exercise, sleep, and overall wellbeing. What would you like to work on today?",
  timestamp: new Date(),
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceVisible, setVoiceVisible] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
  const conversationHistory = useRef<OpenAIMessage[]>([]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      setError(null);

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      scrollToBottom();
      setIsLoading(true);

      try {
        const reply = await sendMessage(conversationHistory.current, text);

        conversationHistory.current = [
          ...conversationHistory.current,
          { role: 'user', content: text },
          { role: 'assistant', content: reply },
        ];

        setMessages((prev) => [
          ...prev,
          { id: generateId(), role: 'assistant', content: reply, timestamp: new Date() },
        ]);
        scrollToBottom();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [scrollToBottom],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>🩺</Text>
        </View>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>Health Coach</Text>
          <Text style={styles.headerSubtitle}>AI-powered wellness guide</Text>
        </View>
        <TouchableOpacity style={styles.voiceButton} onPress={() => setVoiceVisible(true)}>
          <Text style={styles.voiceButtonText}>🎤</Text>
        </TouchableOpacity>
      </View>

      <VoiceScreen visible={voiceVisible} onClose={() => setVoiceVisible(false)} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
        />

        {isLoading && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.typingText}>Health Coach is thinking…</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <ChatInput onSend={handleSend} disabled={isLoading} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  headerTextGroup: {
    flex: 1,
  },
  voiceButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EBF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonText: {
    fontSize: 18,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EBF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 1,
  },
  messageList: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  typingText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  errorBanner: {
    marginHorizontal: 12,
    marginBottom: 6,
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FFD0D0',
  },
  errorText: {
    fontSize: 13,
    color: '#C0392B',
    textAlign: 'center',
  },
});
