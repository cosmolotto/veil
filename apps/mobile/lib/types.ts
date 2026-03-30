// ─── User & Auth ───────────────────────────────────────────────
export interface VeilUser {
  id: string;
  alias: string;
  created_at: string;
  last_active_at: string;
  soul_map_vector?: number[];
  soul_map_metadata?: SoulMapMetadata;
  unveil_photo_url?: string | null;
  unveil_name?: string | null;
  daily_prompt_time?: string;
  onboarding_complete: boolean;
  is_plus?: boolean;
}

// ─── Soul Map ──────────────────────────────────────────────────
export interface SoulMapMetadata {
  dominant_emotions: EmotionEntry[];
  avg_depth_score: number;
  avg_vulnerability_score: number;
  temporal_orientation: 'past' | 'present' | 'future' | 'mixed';
  response_count: number;
  streak_days: number;
  last_updated: string;
}

export interface EmotionEntry {
  emotion: EmotionType;
  weight: number;
}

export type EmotionType =
  | 'grief' | 'wonder' | 'identity' | 'desire'
  | 'fear' | 'joy' | 'loss' | 'becoming'
  | 'nostalgia' | 'anger' | 'peace' | 'confusion';

// ─── Prompts ───────────────────────────────────────────────────
export interface Prompt {
  id: string;
  text: string;
  category: EmotionType;
  difficulty_level: 1 | 2 | 3 | 4 | 5;
  created_at: string;
}

export interface DailyPrompt {
  prompt: Prompt;
  date: string;
  user_has_responded: boolean;
}

// ─── Responses ─────────────────────────────────────────────────
export type ResponseType = 'text' | 'voice' | 'sketch';

export interface Response {
  id: string;
  user_id: string;
  prompt_id: string;
  type: ResponseType;
  created_at: string;
  is_shared: boolean;
  emotional_signature?: EmotionalSignature;
  content_preview?: string;
}

export interface EmotionalSignature {
  primary_emotion: EmotionType;
  secondary_emotion?: EmotionType;
  depth_level: number;
  vulnerability_score: number;
  temporal_orientation: 'past' | 'present' | 'future';
  energy_level: 'low' | 'medium' | 'high';
  extracted_at: string;
}

// ─── Connections ───────────────────────────────────────────────
export type ResonanceType = 'mirror' | 'contrast' | 'echo';
export type ConnectionState =
  | 'proposed'
  | 'accepted'
  | 'veiled'
  | 'unveil_pending'
  | 'unveiled'
  | 'anonymous_forever';

export interface Connection {
  id: string;
  resonance_type: ResonanceType;
  depth_score: number;
  state: ConnectionState;
  created_at: string;
  partner_alias?: string;
  partner_photo_url?: string;
}

// ─── Signals ───────────────────────────────────────────────────
export type SignalType = 'RESONANCE' | 'ACHE' | 'WONDER' | 'RECOGNITION' | 'PRESENCE';

export interface Signal {
  id: string;
  connection_id: string;
  signal_type: SignalType;
  response_id?: string;
  created_at: string;
}

// ─── API Response wrappers ─────────────────────────────────────
export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
