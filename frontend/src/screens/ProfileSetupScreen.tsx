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
import { generateAnswers, AnswerEntry } from '../services/answers';

interface Props {
  user: User;
  onComplete: (user: User) => void;
}

type FieldKey =
  | 'age' | 'workStart' | 'workEnd' | 'commuteMinutes'
  | 'dinnerTime' | 'dailyStepGoal' | 'preferredExercise'
  | 'mostEnergeticTime' | 'activityLevel';

type Errors = Partial<Record<FieldKey, string>>;

function isPositiveInt(v: string) {
  return /^\d+$/.test(v.trim()) && Number(v) > 0;
}

function isTimeFormat(v: string) {
  return /^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(v.trim());
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

  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  function clearError(key: FieldKey) {
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const e: Errors = {};
    if (!age.trim()) e.age = 'Age is required';
    else if (!isPositiveInt(age) || Number(age) > 120) e.age = 'Enter a valid age (1–120)';
    if (!workStart.trim()) e.workStart = 'Work start time is required';
    else if (!isTimeFormat(workStart)) e.workStart = 'Use format like 9:00 AM';
    if (!workEnd.trim()) e.workEnd = 'Work end time is required';
    else if (!isTimeFormat(workEnd)) e.workEnd = 'Use format like 5:30 PM';
    if (!commuteMinutes.trim()) e.commuteMinutes = 'Commute is required';
    else if (!isPositiveInt(commuteMinutes)) e.commuteMinutes = 'Enter a valid number of minutes';
    if (!dinnerTime.trim()) e.dinnerTime = 'Dinner time is required';
    else if (!isTimeFormat(dinnerTime)) e.dinnerTime = 'Use format like 7:30 PM';
    if (!dailyStepGoal.trim()) e.dailyStepGoal = 'Step goal is required';
    else if (!isPositiveInt(dailyStepGoal)) e.dailyStepGoal = 'Enter a valid step count';
    if (!preferredExercise.trim()) e.preferredExercise = 'Preferred exercise is required';
    if (!mostEnergeticTime.trim()) e.mostEnergeticTime = 'Most energetic time is required';
    if (!activityLevel.trim()) e.activityLevel = 'Activity level is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleNext() {
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      const profile: UserProfile = {
        age: Number(age),
        workStart: workStart.trim(),
        workEnd: workEnd.trim(),
        commuteMinutes: Number(commuteMinutes),
        dinnerTime: dinnerTime.trim(),
        dailyStepGoal: Number(dailyStepGoal),
        preferredExercise: preferredExercise.trim(),
        mostEnergeticTime: mostEnergeticTime.trim(),
        activityLevel: activityLevel.trim(),
      };
      setLoadingMessage('Saving profile...');
      const updated = await updateProfile({ profile });
      setLoadingMessage('Aura is preparing your personalised session...');
      await generateAnswers();
      onComplete(updated);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to save profile');
      setLoadingMessage('');
    } finally {
      setLoading(false);
    }
  }

  function Field({
    fieldKey,
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    hint,
  }: {
    fieldKey: FieldKey;
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
          style={[styles.input, errors[fieldKey] && styles.inputError]}
          value={value}
          onChangeText={(v) => { onChangeText(v); clearError(fieldKey); }}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.25)"
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {errors[fieldKey] ? <Text style={styles.fieldError}>{errors[fieldKey]}</Text> : null}
      </View>
    );
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

      <Field fieldKey="age" label="Age" value={age} onChangeText={setAge} placeholder="30" keyboardType="numeric" />
      <Field fieldKey="workStart" label="Work hours start" value={workStart} onChangeText={setWorkStart} placeholder="9:00 AM" hint="Format: 9:00 AM" />
      <Field fieldKey="workEnd" label="Work hours end" value={workEnd} onChangeText={setWorkEnd} placeholder="5:30 PM" hint="Format: 5:30 PM" />
      <Field fieldKey="commuteMinutes" label="Commute (minutes)" value={commuteMinutes} onChangeText={setCommuteMinutes} placeholder="30" keyboardType="numeric" />
      <Field fieldKey="dinnerTime" label="Dinner time" value={dinnerTime} onChangeText={setDinnerTime} placeholder="7:30 PM" hint="Format: 7:30 PM" />
      <Field fieldKey="dailyStepGoal" label="Daily step goal" value={dailyStepGoal} onChangeText={setDailyStepGoal} placeholder="8000" keyboardType="numeric" />
      <Field fieldKey="preferredExercise" label="Preferred exercise" value={preferredExercise} onChangeText={setPreferredExercise} placeholder="Walking" />
      <Field fieldKey="mostEnergeticTime" label="Most energetic time" value={mostEnergeticTime} onChangeText={setMostEnergeticTime} placeholder="Evening" />
      <Field fieldKey="activityLevel" label="Current activity level" value={activityLevel} onChangeText={setActivityLevel} placeholder="Below target this week" />

      <TouchableOpacity style={styles.button} onPress={handleNext} disabled={loading}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#fff" size="small" />
            {loadingMessage ? <Text style={styles.loadingText}>{loadingMessage}</Text> : null}
          </View>
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
  inputError: { borderColor: '#FF453A' },
  fieldError: { color: '#FF453A', fontSize: 12, marginTop: 4, marginLeft: 4 },
  button: {
    backgroundColor: '#007AFF', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', marginTop: 24, minHeight: 52,
    justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingText: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
});
