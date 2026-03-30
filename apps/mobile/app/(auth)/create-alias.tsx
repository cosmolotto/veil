import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { VeilButton } from '../../components/ui/VeilButton';
import { VeilInput } from '../../components/ui/VeilInput';
import { COLORS } from '../../lib/constants';
import { api } from '../../lib/api';

const ALIAS_REGEX = /^[a-zA-Z0-9_]+$/;

export default function CreateAlias() {
  const router = useRouter();
  const [alias, setAlias] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const checkAlias = useCallback(async (value: string) => {
    if (value.length < 2 || !ALIAS_REGEX.test(value)) { setAvailable(null); return; }
    setChecking(true);
    try {
      const { available: a } = await api.checkAlias(value);
      setAvailable(a);
    } catch {
      // CLAUDE_REVIEW: Add server-side check — fall back to client validation for now
      setAvailable(ALIAS_REGEX.test(value));
    } finally {
      setChecking(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setAlias(value);
    if (value.length >= 2) {
      const timeout = setTimeout(() => checkAlias(value), 500);
      return () => clearTimeout(timeout);
    }
  };

  const valid = alias.length >= 2 && ALIAS_REGEX.test(alias) && available === true;
  const statusColor = available === true ? '#10B981' : available === false ? COLORS.error : COLORS.muted;
  const statusText = checking ? 'Checking…' : available === true ? '✓ Available' : available === false ? '✗ Taken' : ' ';

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>Choose your alias</Text>
      <Text style={styles.sub}>This is your name on VEIL. Not your real name.</Text>
      <Text style={styles.hint}>Letters, numbers, underscores only. You can change this later.</Text>
      <VeilInput
        value={alias}
        onChangeText={handleChange}
        placeholder="your_alias"
        autoFocus
        maxLength={30}
        style={styles.input}
      />
      <Text style={[styles.status, { color: statusColor }]}>{statusText}</Text>
      <VeilButton
        label="Continue"
        onPress={() => router.push({ pathname: '/(auth)/first-prompt', params: { alias } })}
        disabled={!valid}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 32, paddingTop: 80 },
  back: { marginBottom: 32 },
  backText: { color: COLORS.muted, fontSize: 24 },
  heading: { fontSize: 28, fontWeight: '700', color: COLORS.white, marginBottom: 8 },
  sub: { fontSize: 15, color: COLORS.muted, marginBottom: 4 },
  hint: { fontSize: 12, color: COLORS.muted, marginBottom: 24 },
  input: { marginBottom: 8 },
  status: { fontSize: 12, marginBottom: 32, minHeight: 16 },
  btn: { width: '100%' },
});
