import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { VeilUser } from '@veil/shared';

interface AuthState {
  user: VeilUser | null;
  session: { access_token: string } | null;
  isLoading: boolean;
  onboardingLoading: boolean;
  setUser: (user: VeilUser | null) => void;
  setSession: (session: { access_token: string } | null) => void;
  setOnboardingLoading: (value: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  onboardingLoading: false,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, isLoading: false }),
  setOnboardingLoading: (onboardingLoading) => set({ onboardingLoading }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
