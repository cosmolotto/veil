import { supabase } from './supabase';
import type { DailyPrompt, Response, VeilUser } from './types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers, ...options?.headers } });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'API error');
  return json;
}

export const api = {
  onboard: (alias: string, daily_prompt_time?: string) =>
    apiFetch<{ data: VeilUser }>('/api/users/onboard', {
      method: 'POST',
      body: JSON.stringify({ alias, daily_prompt_time })
    }),
  getMe: () => apiFetch<{ data: VeilUser }>('/api/users/me'),
  updateMe: (body: Partial<VeilUser>) =>
    apiFetch<{ data: VeilUser }>('/api/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
  checkAlias: (alias: string) =>
    apiFetch<{ available: boolean }>(`/api/users/check-alias?alias=${encodeURIComponent(alias)}`),

  getTodayPrompt: () => apiFetch<{ data: DailyPrompt }>('/api/prompts/today'),

  submitResponse: (body: { prompt_id: string; type: 'text'; content: string; is_shared?: boolean }) =>
    apiFetch<{ data: Response }>('/api/responses', { method: 'POST', body: JSON.stringify(body) }),
  getMyResponses: () => apiFetch<{ data: Response[] }>('/api/responses/mine'),

  getMySoulMap: () => apiFetch<{ data: unknown }>('/api/soul-map/me'),
};
