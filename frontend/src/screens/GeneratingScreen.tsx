import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { generateAnswers, AnswerEntry } from '../services/answers';

interface Props {
  onReady: (answers: AnswerEntry[]) => void;
  onError: (msg: string) => void;
}

const STEPS = [
  'Analysing your profile...',
  'Personalising your session...',
  'Preparing responses...',
  'Getting audio ready...',
];

export default function GeneratingScreen({ onReady, onError }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Cycle through step labels every 3s for visual feedback
  useEffect(() => {
    const id = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 3000);
    return () => clearInterval(id);
  }, [fadeAnim]);

  // Dot bounce animation
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -8, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(450),
        ]),
      );
    const a1 = bounce(dot1, 0);
    const a2 = bounce(dot2, 150);
    const a3 = bounce(dot3, 300);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [dot1, dot2, dot3]);

  // Run the actual generation
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const answers = await generateAnswers();
        if (cancelled) return;
        onReady(answers);
      } catch (err) {
        if (!cancelled) onError(err instanceof Error ? err.message : 'Failed to prepare session');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={[styles.dot, { transform: [{ translateY: dot }] }]} />
        ))}
      </View>
      <Animated.Text style={[styles.label, { opacity: fadeAnim }]}>
        {STEPS[stepIndex]}
      </Animated.Text>
      <Text style={styles.sub}>Aura is getting ready for you</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0A0A1A',
    justifyContent: 'center', alignItems: 'center', gap: 20,
  },
  dotsRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#007AFF' },
  label: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.3)' },
});
