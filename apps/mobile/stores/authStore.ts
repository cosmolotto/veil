import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { VeilUser } from '@veil/shared';

interface AuthState {
  user: VeilUser | null;
  session: { access_token: string } | null;
  isLoading: boolean;
  setUser: (user: VeilUser | null) => void;
  setSession: (session: { access_token: string } | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, isLoading: false }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
