import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { register, User } from '../services/auth';

interface Props {
  onRegister: (user: User) => void;
  onGoLogin: () => void;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type Errors = { name?: string; email?: string; password?: string };

export default function RegisterScreen({ onRegister, onGoLogin }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Errors = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!isValidEmail(email.trim())) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      const user = await register({ name: name.trim(), email: email.trim(), password, profile: {} });
      onRegister(user);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  function field(
    key: keyof Errors,
    value: string,
    setter: (v: string) => void,
    placeholder: string,
    opts?: { secure?: boolean; keyboard?: 'email-address' },
  ) {
    return (
      <View style={styles.fieldWrap}>
        <TextInput
          style={[styles.input, errors[key] && styles.inputError]}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={value}
          onChangeText={(v) => { setter(v); setErrors((e) => ({ ...e, [key]: undefined })); }}
          autoCapitalize={opts?.keyboard ? 'none' : 'words'}
          keyboardType={opts?.keyboard}
          secureTextEntry={opts?.secure}
        />
        {errors[key] ? <Text style={styles.fieldError}>{errors[key]}</Text> : null}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Aura</Text>

        {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

        {field('name', name, setName, 'Name')}
        {field('email', email, setEmail, 'Email', { keyboard: 'email-address' })}
        {field('password', password, setPassword, 'Password (min. 8 characters)', { secure: true })}

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={onGoLogin}>
          <Text style={styles.link}>
            Already have an account? <Text style={styles.linkBold}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A1A' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 36 },
  serverError: {
    color: '#FF453A', fontSize: 13, marginBottom: 12,
    backgroundColor: 'rgba(255,69,58,0.1)', padding: 10, borderRadius: 8,
  },
  fieldWrap: { marginBottom: 12 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputError: { borderColor: '#FF453A' },
  fieldError: { color: '#FF453A', fontSize: 12, marginTop: 4, marginLeft: 4 },
  button: {
    backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', marginTop: 8, marginBottom: 20,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  linkBold: { color: '#007AFF', fontWeight: '600' },
});
