import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { updateProfile, User, UserProfile } from '../services/auth';

interface Props {
  user: User;
  onComplete: (user: User) => void;
}

// Field must be defined outside the screen component so React doesn't remount it on every keystroke
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  hint?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.25)"
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

export default function ProfileSetupScreen({ user, onComplete }: Props) {
  const [age, setAge] = useState('30');
  const [workStart, setWorkStart] = useState('9:00 AM');
  const [workEnd, setWorkEnd] = useState('5:30 PM');
  const [commuteMinutes, setCommuteMinutes] = useState('30');
  const [dinnerTime, setDinnerTime] = useState('7:30 PM');
  const [dailyStepGoal, setDailyStepGoal] = useState('8000');
  const [preferredExercise, setPreferredExercise] = useState('Walking');
  const [mostEnergeticTime, setMostEnergeticTime] = useState('Evening');
  const [activityLevel, setActivityLevel] = useState('Below target this week');

  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleNext() {
    setLoading(true);
    setServerError('');
    try {
      const profile: UserProfile = {
        age: age.trim() ? Number(age) || undefined : undefined,
        workStart: workStart.trim() || undefined,
        workEnd: workEnd.trim() || undefined,
        commuteMinutes: commuteMinutes.trim() ? Number(commuteMinutes) || undefined : undefined,
        dinnerTime: dinnerTime.trim() || undefined,
        dailyStepGoal: dailyStepGoal.trim() ? Number(dailyStepGoal) || undefined : undefined,
        preferredExercise: preferredExercise.trim() || undefined,
        mostEnergeticTime: mostEnergeticTime.trim() || undefined,
        activityLevel: activityLevel.trim() || undefined,
      };
      const updated = await updateProfile(profile);
      onComplete(updated);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.inner}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Your Profile</Text>
      <Text style={styles.subtitle}>Help Aura personalise your experience</Text>

      {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

      <Field label="Age" value={age} onChangeText={setAge} placeholder="30" keyboardType="numeric" />
      <Field label="Work hours start" value={workStart} onChangeText={setWorkStart} placeholder="9:00 AM" />
      <Field label="Work hours end" value={workEnd} onChangeText={setWorkEnd} placeholder="5:30 PM" />
      <Field label="Commute (minutes)" value={commuteMinutes} onChangeText={setCommuteMinutes} placeholder="30" keyboardType="numeric" />
      <Field label="Dinner time" value={dinnerTime} onChangeText={setDinnerTime} placeholder="7:30 PM" />
      <Field label="Daily step goal" value={dailyStepGoal} onChangeText={setDailyStepGoal} placeholder="8000" keyboardType="numeric" />
      <Field label="Preferred exercise" value={preferredExercise} onChangeText={setPreferredExercise} placeholder="Walking" />
      <Field label="Most energetic time" value={mostEnergeticTime} onChangeText={setMostEnergeticTime} placeholder="Evening" />
      <Field label="Current activity level" value={activityLevel} onChangeText={setActivityLevel} placeholder="Below target this week" />

      <TouchableOpacity style={styles.button} onPress={handleNext} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Next</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A1A' },
  inner: { paddingHorizontal: 28, paddingTop: 72, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 32 },
  serverError: {
    color: '#FF453A', fontSize: 13, marginBottom: 16,
    backgroundColor: 'rgba(255,69,58,0.1)', padding: 10, borderRadius: 8,
  },
  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
  hint: { fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 4 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  button: {
    backgroundColor: '#007AFF', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', marginTop: 24, minHeight: 52,
    justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
