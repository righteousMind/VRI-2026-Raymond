import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateProfile, User, UserProfile } from '../services/auth';

interface Props {
  user: User;
  onComplete: (user: User) => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function Field({
  label, value, onChangeText, placeholder, keyboardType = 'default', error,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; keyboardType?: 'default' | 'numeric' | 'number-pad'; error?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.25)"
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function TimeField({
  label, date, onDateChange, active, onPress, error,
}: {
  label: string; date: Date | null; onDateChange: (d: Date) => void;
  active: boolean; onPress: () => void; error?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.input, error ? styles.inputError : null]} onPress={onPress} activeOpacity={0.7}>
        <Text style={date ? styles.inputText : styles.inputPlaceholder}>
          {date ? formatTime(date) : 'Select time'}
        </Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {active && (
        <DateTimePicker
          value={date ?? new Date()}
          mode="time"
          display="spinner"
          textColor="#FFFFFF"
          onChange={(_: unknown, selected?: Date) => { if (selected) onDateChange(selected); }}
        />
      )}
    </View>
  );
}

const ENERGETIC_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night'];
const EXERCISE_OPTIONS = ['Walking', 'Running', 'Jogging', 'Stretching'];

function Dropdown({
  label, value, options, onSelect, error,
}: {
  label: string; value: string; options: string[]; onSelect: (v: string) => void; error?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.input, error ? styles.inputError : null]} onPress={() => setOpen((o) => !o)} activeOpacity={0.7}>
        <Text style={value ? styles.inputText : styles.inputPlaceholder}>{value || 'Select...'}</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {open && (
        <View style={styles.dropdownList}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.dropdownItem, value === opt && styles.dropdownItemActive]}
              onPress={() => { onSelect(opt); setOpen(false); }}
            >
              <Text style={[styles.dropdownItemText, value === opt && styles.dropdownItemTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

type ErrorMap = Partial<Record<string, string>>;

export default function ProfileSetupScreen({ user, onComplete }: Props) {
  const [age, setAge] = useState('');
  const [workStart, setWorkStart] = useState<Date>(() => { const d = new Date(); d.setHours(9, 0, 0, 0); return d; });
  const [workEnd, setWorkEnd] = useState<Date>(() => { const d = new Date(); d.setHours(17, 0, 0, 0); return d; });
  const [commuteMinutes, setCommuteMinutes] = useState('');
  const [dinnerTime, setDinnerTime] = useState<Date>(() => { const d = new Date(); d.setHours(18, 30, 0, 0); return d; });
  const [dailyStepGoal, setDailyStepGoal] = useState('');
  const [preferredExercise, setPreferredExercise] = useState('');
  const [mostEnergeticTime, setMostEnergeticTime] = useState('');
  const [activityLevel, setActivityLevel] = useState('');

  const [activePicker, setActivePicker] = useState<'workStart' | 'workEnd' | 'dinner' | null>(null);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function clearError(key: string) {
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function togglePicker(field: 'workStart' | 'workEnd' | 'dinner') {
    setActivePicker((prev) => (prev === field ? null : field));
  }

  function handleWorkStartChange(d: Date) {
    setWorkStart(d);
    if (d >= workEnd) { const adj = new Date(d); adj.setMinutes(adj.getMinutes() + 30); setWorkEnd(adj); }
  }

  function handleWorkEndChange(d: Date) {
    setWorkEnd(d);
    if (d <= workStart) { const adj = new Date(d); adj.setMinutes(adj.getMinutes() - 30); setWorkStart(adj); }
  }

  function validate(): boolean {
    const e: ErrorMap = {};
    if (!age.trim() || isNaN(Number(age)) || Number(age) <= 0) e.age = 'Please enter a valid age';
    if (!commuteMinutes.trim() || isNaN(Number(commuteMinutes)) || Number(commuteMinutes) < 0) e.commute = 'Please enter commute minutes';
    if (!dailyStepGoal.trim() || isNaN(Number(dailyStepGoal)) || Number(dailyStepGoal) <= 0) e.stepGoal = 'Please enter a step goal';
    if (!preferredExercise) e.exercise = 'Please select your preferred exercise';
    if (!mostEnergeticTime) e.energetic = 'Please select your most energetic time';
    if (!activityLevel.trim()) e.activity = 'Please describe your activity level';
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
        workStart: formatTime(workStart),
        workEnd: formatTime(workEnd),
        commuteMinutes: Number(commuteMinutes),
        dinnerTime: formatTime(dinnerTime),
        dailyStepGoal: Number(dailyStepGoal),
        preferredExercise,
        mostEnergeticTime,
        activityLevel: activityLevel.trim(),
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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.subtitle}>Help Aura personalise your experience</Text>

        {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

        <Field label="Age" value={age} onChangeText={(v) => { setAge(v); clearError('age'); }}
          placeholder="e.g. 28" keyboardType="number-pad" error={errors.age} />

        <TimeField label="Work hours start" date={workStart} onDateChange={handleWorkStartChange}
          active={activePicker === 'workStart'} onPress={() => togglePicker('workStart')} />
        <TimeField label="Work hours end" date={workEnd} onDateChange={handleWorkEndChange}
          active={activePicker === 'workEnd'} onPress={() => togglePicker('workEnd')} />

        <Field label="Commute (minutes)" value={commuteMinutes} onChangeText={(v) => { setCommuteMinutes(v); clearError('commute'); }}
          placeholder="e.g. 30" keyboardType="number-pad" error={errors.commute} />

        <TimeField label="Dinner time" date={dinnerTime} onDateChange={setDinnerTime}
          active={activePicker === 'dinner'} onPress={() => togglePicker('dinner')} />

        <Field label="Daily step goal" value={dailyStepGoal} onChangeText={(v) => { setDailyStepGoal(v); clearError('stepGoal'); }}
          placeholder="e.g. 8000" keyboardType="number-pad" error={errors.stepGoal} />

        <Dropdown label="Preferred exercise" value={preferredExercise}
          options={EXERCISE_OPTIONS} onSelect={(v) => { setPreferredExercise(v); clearError('exercise'); }}
          error={errors.exercise} />

        <Dropdown label="Most energetic time of day" value={mostEnergeticTime}
          options={ENERGETIC_OPTIONS} onSelect={(v) => { setMostEnergeticTime(v); clearError('energetic'); }}
          error={errors.energetic} />

        <Field label="Current activity level" value={activityLevel} onChangeText={(v) => { setActivityLevel(v); clearError('activity'); }}
          placeholder="e.g. Below target this week" error={errors.activity} />

        <TouchableOpacity style={styles.button} onPress={handleNext} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>Next</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0A0A1A' },
  container: { flex: 1 },
  inner: { paddingHorizontal: 28, paddingTop: 72, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 32 },
  serverError: {
    color: '#FF453A', fontSize: 13, marginBottom: 16,
    backgroundColor: 'rgba(255,69,58,0.1)', padding: 10, borderRadius: 8,
  },
  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#FFFFFF',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center',
  },
  inputError: { borderColor: '#FF453A' },
  inputText: { fontSize: 15, color: '#FFFFFF' },
  inputPlaceholder: { fontSize: 15, color: 'rgba(255,255,255,0.25)' },
  errorText: { fontSize: 12, color: '#FF453A', marginTop: 4, marginLeft: 4 },
  dropdownList: {
    marginTop: 4, backgroundColor: '#1C1C2E', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  dropdownItemActive: { backgroundColor: 'rgba(0,122,255,0.15)' },
  dropdownItemText: { fontSize: 15, color: 'rgba(255,255,255,0.7)' },
  dropdownItemTextActive: { color: '#007AFF', fontWeight: '600' },
  button: {
    backgroundColor: '#007AFF', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', marginTop: 24, minHeight: 52, justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
