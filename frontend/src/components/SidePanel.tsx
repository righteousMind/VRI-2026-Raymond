import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { updateProfile, changePassword, logout, User, UserProfile } from '../services/auth';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PANEL_WIDTH = SCREEN_WIDTH * 0.85;

interface Props {
  user: User | null;
  onUpdateUser: (u: User) => void;
  onLogout: () => void;
  onClose: () => void;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.2)"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
      />
    </View>
  );
}

export default function SidePanel({ user, onUpdateUser, onLogout, onClose }: Props) {
  const slideAnim = useRef(new Animated.Value(PANEL_WIDTH)).current;

  const [name, setName] = useState(user?.name ?? '');
  const [age, setAge] = useState(String(user?.profile?.age ?? ''));
  const [workStart, setWorkStart] = useState(user?.profile?.workStart ?? '');
  const [workEnd, setWorkEnd] = useState(user?.profile?.workEnd ?? '');
  const [commuteMinutes, setCommuteMinutes] = useState(String(user?.profile?.commuteMinutes ?? ''));
  const [dinnerTime, setDinnerTime] = useState(user?.profile?.dinnerTime ?? '');
  const [dailyStepGoal, setDailyStepGoal] = useState(String(user?.profile?.dailyStepGoal ?? ''));
  const [preferredExercise, setPreferredExercise] = useState(user?.profile?.preferredExercise ?? '');
  const [mostEnergeticTime, setMostEnergeticTime] = useState(user?.profile?.mostEnergeticTime ?? '');
  const [activityLevel, setActivityLevel] = useState(user?.profile?.activityLevel ?? '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  }, []);

  function close() {
    Animated.timing(slideAnim, { toValue: PANEL_WIDTH, duration: 220, useNativeDriver: true }).start(onClose);
  }

  async function handleSaveProfile() {
    const profile: UserProfile = {
      age: age ? Number(age) : undefined,
      workStart: workStart || undefined,
      workEnd: workEnd || undefined,
      commuteMinutes: commuteMinutes ? Number(commuteMinutes) : undefined,
      dinnerTime: dinnerTime || undefined,
      dailyStepGoal: dailyStepGoal ? Number(dailyStepGoal) : undefined,
      preferredExercise: preferredExercise || undefined,
      mostEnergeticTime: mostEnergeticTime || undefined,
      activityLevel: activityLevel || undefined,
    };
    try {
      const updated = await updateProfile({ name: name.trim(), profile });
      onUpdateUser(updated);
      setSaveMsg('Saved');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : 'Failed to save');
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) { setPwMsg('Fill in both fields'); return; }
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setPwMsg('Password updated');
      setTimeout(() => setPwMsg(''), 2000);
    } catch (err) {
      setPwMsg(err instanceof Error ? err.message : 'Failed to update');
    }
  }

  async function handleLogout() {
    await logout();
    onLogout();
  }

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={close} activeOpacity={1} />
      <Animated.View style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>{user?.name ?? 'Settings'}</Text>
              <TouchableOpacity onPress={close}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              <Text style={styles.section}>Account</Text>
              <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />

              <Text style={styles.section}>Health Profile</Text>
              <Field label="Age" value={age} onChangeText={setAge} placeholder="30" keyboardType="numeric" />
              <Field label="Work hours start" value={workStart} onChangeText={setWorkStart} placeholder="9:00 AM" />
              <Field label="Work hours end" value={workEnd} onChangeText={setWorkEnd} placeholder="5:30 PM" />
              <Field label="Commute (minutes)" value={commuteMinutes} onChangeText={setCommuteMinutes} placeholder="30" keyboardType="numeric" />
              <Field label="Dinner time" value={dinnerTime} onChangeText={setDinnerTime} placeholder="7:30 PM" />
              <Field label="Daily step goal" value={dailyStepGoal} onChangeText={setDailyStepGoal} placeholder="8000" keyboardType="numeric" />
              <Field label="Preferred exercise" value={preferredExercise} onChangeText={setPreferredExercise} placeholder="Walking" />
              <Field label="Most energetic time" value={mostEnergeticTime} onChangeText={setMostEnergeticTime} placeholder="Evening" />
              <Field label="Current activity level" value={activityLevel} onChangeText={setActivityLevel} placeholder="Below target this week" />

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save profile</Text>
              </TouchableOpacity>
              {saveMsg ? <Text style={styles.msg}>{saveMsg}</Text> : null}

              <Text style={styles.section}>Change Password</Text>
              <Field label="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
              <Field label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]} onPress={handleChangePassword}>
                <Text style={styles.saveButtonText}>Update password</Text>
              </TouchableOpacity>
              {pwMsg ? <Text style={styles.msg}>{pwMsg}</Text> : null}

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Log out</Text>
              </TouchableOpacity>
            </ScrollView>

          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  panel: {
    width: PANEL_WIDTH,
    backgroundColor: '#111122',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  panelTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  closeText: { color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  section: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.3)', marginTop: 20, marginBottom: 10,
  },
  fieldWrap: { marginBottom: 10 },
  fieldLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 5 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: '#FFFFFF',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  saveButton: {
    backgroundColor: '#007AFF', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center', marginTop: 16,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  msg: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 8 },
  logoutButton: {
    marginTop: 32, paddingVertical: 13, alignItems: 'center',
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,59,48,0.4)',
  },
  logoutText: { color: '#FF3B30', fontSize: 14, fontWeight: '600' },
});
