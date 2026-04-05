import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { VeilButton } from '../../components/ui/VeilButton';
import { VeilInput } from '../../components/ui/VeilInput';
import { COLORS } from '../../lib/constants';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

const ALIAS_REGEX = /^[a-zA-Z0-9_]+$/;

export default function CreateAlias() {
  const router = useRouter();
  const { setUser, setOnboardingLoading } = useAuthStore();
  const [alias, setAlias] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const checkAlias = useCallback(async (value: string) => {
    if (value.length < 2 || !ALIAS_REGEX.test(value)) {
      setAvailable(null);
      return;
    }
    setChecking(true);
    try {
      const { available: a } = await api.checkAlias(value);
      setAvailable(a);
    } catch {
      setAvailable(ALIAS_REGEX.test(value));
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (alias.length < 2 || !ALIAS_REGEX.test(alias)) {
      setAvailable(null);
      return;
    }

    const timeout = setTimeout(() => {
      void checkAlias(alias);
    }, 400);

    return () => clearTimeout(timeout);
  }, [alias, checkAlias]);

  const valid = alias.length >= 2 && ALIAS_REGEX.test(alias) && available === true;
  const statusColor = available === true ? '#10B981' : available === false ? COLORS.error : COLORS.muted;
  const statusText = checking ? 'Checking…' : available === true ? 'Available' : available === false ? 'Taken' : ' ';

  const handleContinue = async () => {
    if (!valid) return;

    setSaving(true);
    setOnboardingLoading(true);
    try {
      await api.onboard(alias.trim(), '09:00', referralCode.trim().toUpperCase() || undefined);
      const { data } = await api.updateMe({ onboarding_complete: true });
      setUser(data);
      router.replace('/(tabs)/today');
    } catch {
      Alert.alert('Could not finish setup', 'Your alias could not be saved yet. Please try again.');
    } finally {
      setSaving(false);
      setOnboardingLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>Choose your alias</Text>
      <Text style={styles.sub}>This is your name on VEIL. Not your real name.</Text>
      <Text style={styles.hint}>We skip the long intro. Pick a name and go straight to your first question.</Text>
      <VeilInput value={alias} onChangeText={setAlias} placeholder="your_alias" autoFocus maxLength={30} style={styles.input} />
      <VeilInput
        value={referralCode}
        onChangeText={setReferralCode}
        placeholder="Referral code (optional)"
        autoCapitalize="characters"
        maxLength={20}
        style={styles.input}
      />
      <Text style={[styles.status, { color: statusColor }]}>{statusText}</Text>
      <VeilButton label="Enter VEIL" onPress={handleContinue} loading={saving} disabled={!valid} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 32, paddingTop: 80 },
  back: { marginBottom: 32 },
  backText: { color: COLORS.muted, fontSize: 24 },
  heading: { fontSize: 28, fontWeight: '700', color: COLORS.white, marginBottom: 8 },
  sub: { fontSize: 15, color: COLORS.muted, marginBottom: 4 },
  hint: { fontSize: 12, color: COLORS.muted, marginBottom: 24, lineHeight: 18 },
  input: { marginBottom: 8 },
  status: { fontSize: 12, marginBottom: 32, minHeight: 16 },
  btn: { width: '100%' },
});
