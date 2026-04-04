import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import { initBilling } from '../lib/billing';
import '../global.css';

const queryClient = new QueryClient();

function AuthGuard() {
  const { session, user, setSession, setUser } = useAuthStore();
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
          if (data.id) {
            await initBilling(data.id).catch(() => null);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
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
  }, [session, user, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
    </QueryClientProvider>
  );
}
