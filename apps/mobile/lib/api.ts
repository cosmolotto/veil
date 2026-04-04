import { supabase } from './supabase';
import type { DailyPrompt, Response, VeilUser } from '@veil/shared';

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
  onboard: (alias: string, daily_prompt_time?: string, referral_code?: string) =>
    apiFetch<{ data: VeilUser }>('/api/users/onboard', {
      method: 'POST',
      body: JSON.stringify({ alias, daily_prompt_time, referral_code })
    }),
  getMe: () => apiFetch<{ data: VeilUser }>('/api/users/me'),
  getAccess: () => apiFetch<{ data: { has_plus_access: boolean; is_plus: boolean; plus_trial_ends_at: string | null } }>('/api/users/access'),
  updateMe: (body: Partial<VeilUser>) =>
    apiFetch<{ data: VeilUser }>('/api/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
  checkAlias: (alias: string) =>
    apiFetch<{ available: boolean }>(`/api/users/check-alias?alias=${encodeURIComponent(alias)}`),
  getReferral: () =>
    apiFetch<{ data: { invite_code: string | null; successful_invites: number; trial_ends_at: string | null } }>('/api/users/referral'),

  getTodayPrompt: () => apiFetch<{ data: DailyPrompt }>('/api/prompts/today'),

  submitResponse: (body: { prompt_id: string; type: 'text' | 'voice' | 'sketch'; content: string; is_shared?: boolean }) =>
    apiFetch<{ data: Response }>('/api/responses', { method: 'POST', body: JSON.stringify(body) }),
  getMyResponses: () => apiFetch<{ data: Response[] }>('/api/responses/mine'),
  getResponseHighlights: () =>
    apiFetch<{ data: Array<{ id: string; type: 'text' | 'voice' | 'sketch'; created_at: string; content_preview: string; emotion: string; depth_level: number; alias_hint: string }> }>('/api/responses/highlights'),

  getMySoulMap: () => apiFetch<{ data: unknown }>('/api/soul-map/me'),
  getMySoulSnapshots: () =>
    apiFetch<{ data: Array<{ id: string; snapshot_text: string; mood_tag: string | null; gradient_key: string; created_at: string }> }>('/api/soul-map/snapshots/mine'),
  createSoulSnapshot: (body: { snapshot_text: string; mood_tag?: string; gradient_key?: string }) =>
    apiFetch<{ data: { id: string; snapshot_text: string; mood_tag: string | null; gradient_key: string; created_at: string } }>('/api/soul-map/snapshots', { method: 'POST', body: JSON.stringify(body) }),

  getResonanceSuggestions: () =>
    apiFetch<{ data: Array<{ partner_user_id: string; partner_alias: string; score: number; resonance_type: 'mirror' | 'contrast' | 'echo' }> }>('/api/connections/resonance'),
  proposeConnection: (body: { partner_user_id: string; resonance_type: 'mirror' | 'contrast' | 'echo' }) =>
    apiFetch<{ data: unknown }>('/api/connections/propose', { method: 'POST', body: JSON.stringify(body) }),
  getMyConnections: () =>
    apiFetch<{ data: Array<{ id: string; resonance_type: 'mirror' | 'contrast' | 'echo'; depth_score: number; state: string; created_at: string; partner_alias?: string; partner_user_id: string }> }>('/api/connections/mine'),
  acceptConnection: (id: string) =>
    apiFetch<{ data: unknown }>(`/api/connections/${id}/accept`, { method: 'POST' }),
  requestUnveil: (id: string) =>
    apiFetch<{ data: unknown }>(`/api/connections/${id}/unveil/request`, { method: 'POST' }),
  respondUnveil: (id: string, accept: boolean) =>
    apiFetch<{ data: unknown }>(`/api/connections/${id}/unveil/respond`, { method: 'POST', body: JSON.stringify({ accept }) }),
  getThread: (connectionId: string) =>
    apiFetch<{ data: Array<{ id: string; sender_id: string; body: string; created_at: string; is_mine: boolean }> }>(`/api/connections/${connectionId}/thread`),
  sendThreadMessage: (connectionId: string, body: string) =>
    apiFetch<{ data: { id: string; sender_id: string; body: string; created_at: string } }>(`/api/connections/${connectionId}/thread`, { method: 'POST', body: JSON.stringify({ body }) }),
  registerPushToken: (expo_push_token: string, platform: 'ios' | 'android' | 'web') =>
    apiFetch<{ data: unknown }>('/api/users/push-token', { method: 'POST', body: JSON.stringify({ expo_push_token, platform }) }),
  activatePlus: (source: 'playstore' | 'test_unlock' | 'manual' = 'test_unlock') =>
    apiFetch<{ data: VeilUser }>('/api/users/plus/activate', { method: 'POST', body: JSON.stringify({ source }) }),
  restorePlus: () =>
    apiFetch<{ data: VeilUser }>('/api/users/plus/restore', { method: 'POST' }),
};
