import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.row,
        isUser ? styles.rowUser : styles.rowAssistant,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🩺</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
        ]}
      >
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>
          {message.content}
        </Text>
        <Text style={[styles.timestamp, isUser ? styles.timestampUser : styles.timestampAssistant]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </Animated.View>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 2,
  },
  avatarText: {
    fontSize: 16,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    borderRadius: 20,
  },
  bubbleUser: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 5,
  },
  bubbleAssistant: {
    backgroundColor: '#F2F2F7',
    borderBottomLeftRadius: 5,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  textUser: {
    color: '#FFFFFF',
  },
  textAssistant: {
    color: '#1C1C1E',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  timestampUser: {
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'right',
  },
  timestampAssistant: {
    color: '#8E8E93',
    textAlign: 'left',
  },
});
