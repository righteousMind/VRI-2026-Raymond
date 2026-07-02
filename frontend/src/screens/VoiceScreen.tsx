import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { User, getToken } from '../services/auth';
import SidePanel from '../components/SidePanel';
import TypingDots from '../components/TypingDots';
import TypedText from '../components/TypedText';
import { getCue, GENERIC_CUES } from '../data/cues';
import { getTrialConfig } from '../data/latinSquare';
import { API_URL } from '../config';
import { getAnswers, AnswerEntry } from '../services/answers';

type Phase = 'question' | 'recording' | 'delay' | 'answer' | 'complete';

interface Props {
  user: User | null;
  onUpdateUser: (u: User) => void;
  onLogout: () => void;
}

async function logSession(payload: object, token: string) {
  try {
    await fetch(`${API_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  } catch {
    // non-critical
  }
}

export default function VoiceScreen({ user, onUpdateUser, onLogout }: Props) {
  const [phase, setPhase] = useState<Phase>('question');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [cueText, setCueText] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [answers, setAnswers] = useState<AnswerEntry[]>([]);

  useEffect(() => {
    getAnswers().then(setAnswers).catch(() => {});
  }, []);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const latinIndex = user?.latinIndex ?? 0;
  const currentAnswer = answers[questionIndex];
  const trial = getTrialConfig(latinIndex, questionIndex);

  // pulse while recording
  useEffect(() => {
    if (phase === 'recording') {
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
  }, [phase, pulseAnim]);

  async function startRecording() {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) return;
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );
    recordingRef.current = recording;
    setPhase('recording');
  }

  async function stopAndRunTrial() {
    const recording = recordingRef.current;
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    recordingRef.current = null;

    setPhase('delay');
    setCueText('');

    const { delay, cueType } = trial;
    const resolvedCue =
      cueType === 'generic'
        ? GENERIC_CUES[Math.floor(Math.random() * GENERIC_CUES.length)]
        : getCue(questionIndex, cueType);

    const token = getToken();

    // show cue at random early time (300ms – 1200ms)
    const cueDelay = 300 + Math.random() * 900;
    const cueTimer = setTimeout(() => setCueText(resolvedCue), cueDelay);

    // at end of delay → speak answer
    const delayTimer = setTimeout(async () => {
      setPhase('answer');
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      Speech.speak(currentAnswer.answer, { language: 'en-US', rate: 0.95 });
      logSession({ questionIndex, delay, cueType, cueText: resolvedCue, answerText: currentAnswer.answer }, token);
    }, delay * 1000);

    return () => {
      clearTimeout(cueTimer);
      clearTimeout(delayTimer);
    };
  }

  function handleMicPress() {
    if (phase === 'question') startRecording();
    else if (phase === 'recording') stopAndRunTrial();
  }

  function handleNext() {
    Speech.stop();
    setCueText('');
    const next = questionIndex + 1;
    if (next >= answers.length) {
      setPhase('complete');
    } else {
      setQuestionIndex(next);
      setPhase('question');
    }
  }

  if (!currentAnswer) return null;

  if (phase === 'complete') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeWrap}>
          <View style={styles.completeDot} />
          <Text style={styles.completeTitle}>All done!</Text>
          <Text style={styles.completeSubtitle}>Thank you for completing the session.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isRecording = phase === 'recording';
  const micDisabled = phase === 'delay' || phase === 'answer';
  const showNext = phase === 'answer';

  if (!currentAnswer) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Menu */}
      <TouchableOpacity style={styles.menuButton} onPress={() => setPanelOpen(true)}>
        <View style={styles.menuIcon}>
          {[0, 1, 2].map((i) => <View key={i} style={styles.menuLine} />)}
        </View>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <Text style={styles.title}>Aura</Text>
        <Text style={styles.progress}>{questionIndex + 1} / {answers.length}</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentArea} contentContainerStyle={styles.contentInner}>
        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.cardLabel}>QUESTION</Text>
          <Text style={styles.questionText}>{currentAnswer.question}</Text>
        </View>

        {/* Cue card — dots show entire delay, cue text typed when ready, both disappear at answer */}
        {phase === 'delay' || phase === 'answer' ? (
          <View style={styles.cueCard}>
            <Text style={styles.cardLabel}>AURA</Text>
            {cueText.length > 0 && <TypedText text={cueText} />}
            {phase === 'delay' && <TypingDots />}
          </View>
        ) : null}

        {/* Answer — appears after delay */}
        {phase === 'answer' && (
          <View style={styles.answerCard}>
            <Text style={styles.cardLabel}>ANSWER</Text>
            <Text style={styles.answerText}>{currentAnswer.answer}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottomArea}>
        {showNext ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {questionIndex + 1 < answers.length ? 'Next question →' : 'Finish'}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.statusText}>
              {phase === 'question' && 'Tap to answer'}
              {phase === 'recording' && 'Listening... tap to stop'}
              {phase === 'delay' && 'Processing...'}
            </Text>
            <Animated.View style={[styles.micRing, { transform: [{ scale: pulseAnim }] }]}>
              <TouchableOpacity
                style={[styles.micButton, isRecording && styles.micButtonRecording]}
                onPress={handleMicPress}
                disabled={micDisabled}
                activeOpacity={0.8}
              >
                <View style={isRecording ? styles.micStop : styles.micRecord} />
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </View>

      {panelOpen && (
        <SidePanel user={user} onUpdateUser={onUpdateUser} onLogout={onLogout} onClose={() => setPanelOpen(false)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A1A' },
  menuButton: {
    position: 'absolute', top: 56, right: 20,
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  menuIcon: { gap: 5 },
  menuLine: { width: 22, height: 2, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 32, paddingBottom: 16, paddingHorizontal: 20, gap: 10,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,122,255,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#007AFF' },
  title: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', flex: 1 },
  progress: { fontSize: 13, color: 'rgba(255,255,255,0.35)' },
  contentArea: { flex: 1 },
  contentInner: { paddingHorizontal: 20, gap: 12, paddingBottom: 20 },
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', padding: 16,
  },
  cueCard: {
    backgroundColor: 'rgba(255,160,0,0.07)',
    borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(255,160,0,0.2)', padding: 16,
  },
  answerCard: {
    backgroundColor: 'rgba(0,122,255,0.08)',
    borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.2)', padding: 16,
  },
  cardLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.3)', marginBottom: 8,
  },
  questionText: { fontSize: 16, lineHeight: 24, color: '#FFFFFF' },
  answerText: { fontSize: 15, lineHeight: 23, color: '#FFFFFF' },
  bottomArea: { alignItems: 'center', paddingBottom: 40, gap: 16, minHeight: 180, justifyContent: 'center' },
  statusText: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  micRing: {
    width: 112, height: 112, borderRadius: 56,
    backgroundColor: 'rgba(0,122,255,0.15)', justifyContent: 'center', alignItems: 'center',
  },
  micButton: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center',
  },
  micButtonRecording: { backgroundColor: '#FF3B30' },
  micRecord: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF' },
  micStop: { width: 20, height: 20, borderRadius: 3, backgroundColor: '#FFFFFF' },
  nextButton: {
    backgroundColor: '#007AFF', borderRadius: 12,
    paddingVertical: 15, paddingHorizontal: 40,
  },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  completeWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  completeDot: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#007AFF', marginBottom: 8 },
  completeTitle: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  completeSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.4)' },
});
