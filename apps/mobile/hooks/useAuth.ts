import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const { user, session, isLoading, setSession, setUser, signOut } = useAuthStore();
  return { user, session, isLoading, setSession, setUser, signOut };
}
