import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { VeilButton } from '../../components/ui/VeilButton';
import { VeilInput } from '../../components/ui/VeilInput';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';
import { useAuthStore } from '../../stores/authStore';

export default function Welcome() {
  const router = useRouter();
  const { setSession, setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const handleContinue = async () => {
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes('@')) {
      setNotice('Enter a valid email address.');
      return;
    }

    setLoading(true);
    setNotice('');

    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: {
        emailRedirectTo: 'veil://',
      },
    });

    if (error) {
      setNotice('Unable to send magic link. Please try again.');
      setLoading(false);
      return;
    }

    setNotice('Magic link sent. Open your email to continue.');
    setLoading(false);
  };

  const handleDemoMode = () => {
    setSession({ access_token: 'demo-session' });
    setUser({
      id: 'demo-user',
      alias: 'demo_soul',
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
      onboarding_complete: true,
      daily_prompt_time: '08:00',
      is_plus: false,
    });
    router.replace('/(tabs)/today');
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.delay(800).duration(1000)} style={styles.content}>
        <Text style={styles.title}>VEIL</Text>
        <Text style={styles.tagline}>Be Known Before You Are Seen.</Text>
        <Text style={styles.sub}>Sign in with your email to begin.</Text>
        <VeilInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        {!!notice && <Text style={styles.notice}>{notice}</Text>}
        <VeilButton
          label="Send magic link"
          onPress={handleContinue}
          loading={loading}
          style={styles.btn}
        />
        <VeilButton
          label="I already signed in"
          onPress={() => router.push('/(auth)/create-alias')}
          style={styles.secondaryBtn}
        />
        <VeilButton
          label="Demo mode (no login)"
          onPress={handleDemoMode}
          style={styles.secondaryBtn}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  content: { width: '100%', paddingHorizontal: 40, alignItems: 'center' },
  title: { fontSize: 64, fontWeight: '800', color: COLORS.accent, letterSpacing: 8, marginBottom: 16 },
  tagline: { fontSize: 18, color: COLORS.accent, fontStyle: 'italic', textAlign: 'center', marginBottom: 10 },
  sub: { fontSize: 13, color: COLORS.muted, marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', marginBottom: 10 },
  notice: { color: COLORS.muted, fontSize: 12, marginBottom: 16, textAlign: 'center' },
  btn: { width: '100%' },
  secondaryBtn: { width: '100%', marginTop: 12 },
});
