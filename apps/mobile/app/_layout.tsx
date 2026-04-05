import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import '../global.css';
import { AppErrorBoundary } from '../components/system/AppErrorBoundary';
import { COLORS } from '../lib/constants';

const queryClient = new QueryClient();

function AuthGuard() {
  const { session, user, setSession, setUser, isLoading, onboardingLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s as { access_token: string } | null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s as { access_token: string } | null);
      if (s) {
        try {
          const { data } = await api.getMe();
          setUser(data);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setUser]);

  useEffect(() => {
    if (isLoading || onboardingLoading) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (session && !user && !inAuthGroup) {
      router.replace('/(auth)/create-alias');
    } else if (session && user && !user.onboarding_complete && !inAuthGroup) {
      router.replace('/(auth)/create-alias');
    } else if (session && user?.onboarding_complete && inAuthGroup) {
      router.replace('/(tabs)/today');
    }
  }, [session, user, segments, isLoading, onboardingLoading, router]);

  if (isLoading || onboardingLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>VEIL</Text>
        <Text style={styles.loadingBody}>Opening your quiet corner...</Text>
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <AuthGuard />
      </AppErrorBoundary>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingTitle: { color: COLORS.white, fontSize: 36, fontWeight: '800', marginBottom: 10 },
  loadingBody: { color: COLORS.muted, fontSize: 14 },
});
