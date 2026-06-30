import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
} from 'react-native';
import { Audio } from 'expo-av';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

type Status = 'idle' | 'recording' | 'thinking' | 'playing';

interface VoiceScreenProps {
  visible: boolean;
  onClose: () => void;
}

const STATUS_TEXT: Record<Status, string> = {
  idle: 'Tap to speak',
  recording: 'Listening...',
  thinking: 'Thinking...',
  playing: 'Speaking...',
};

export default function VoiceScreen({ visible, onClose }: VoiceScreenProps) {
  const [status, setStatus] = useState<Status>('idle');
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [status, pulseAnim]);

  async function startRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
      setStatus('recording');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopAndSend() {
    const recording = recordingRef.current;
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      setStatus('thinking');

      if (!uri) return;

      const formData = new FormData();
      formData.append('file', { uri, type: 'audio/m4a', name: 'voice.m4a' } as any);

      const res = await fetch(`${API_URL}/api/voice`, {
        method: 'POST',
        body: formData,
      });

      const data = (await res.json()) as { audioUrl?: string; error?: string };
      console.log('Backend response:', data);

      if (!res.ok || !data.audioUrl) {
        throw new Error(data.error ?? 'No audio URL returned');
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });

      const { sound } = await Audio.Sound.createAsync({ uri: data.audioUrl });
      soundRef.current = sound;
      setStatus('playing');

      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((s) => {
        if (s.isLoaded && s.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
          setStatus('idle');
        }
      });
    } catch (err) {
      console.error('Voice error', err);
      setStatus('idle');
    }
  }

  function handleMicPress() {
    if (status === 'idle') startRecording();
    else if (status === 'recording') stopAndSend();
  }

  function handleClose() {
    recordingRef.current?.stopAndUnloadAsync();
    soundRef.current?.unloadAsync();
    recordingRef.current = null;
    soundRef.current = null;
    setStatus('idle');
    onClose();
  }

  const isActive = status === 'thinking' || status === 'playing';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🩺</Text>
          </View>
          <Text style={styles.title}>Health Coach</Text>
        </View>

        <Text style={styles.statusText}>{STATUS_TEXT[status]}</Text>

        <Animated.View style={[styles.micRing, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            style={[styles.micButton, status === 'recording' && styles.micButtonRecording]}
            onPress={handleMicPress}
            disabled={isActive}
            activeOpacity={0.8}
          >
            <Text style={styles.micIcon}>{status === 'recording' ? '⏹' : '🎤'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,122,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 12,
    marginBottom: 64,
  },
  micRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(0,122,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonRecording: {
    backgroundColor: '#FF3B30',
  },
  micIcon: {
    fontSize: 38,
  },
});
