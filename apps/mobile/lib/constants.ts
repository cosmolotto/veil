export const COLORS = {
  primary: '#2D1B69',
  accent: '#8B5CF6',
  gold: '#C9A84C',
  light: '#F3F0FF',
  dark: '#1A0F2E',
  mid: '#6B4FA0',
  text: '#1F1235',
  muted: '#7C7C9A',
  white: '#FFFFFF',
  background: '#0F0820',
  surface: '#1A1035',
  surfaceLight: '#251848',
  border: '#3D2A6B',
  error: '#EF4444',
} as const;

export const SIGNAL_LABELS: Record<string, string> = {
  RESONANCE: 'Resonance',
  ACHE: 'Ache',
  WONDER: 'Wonder',
  RECOGNITION: 'Recognition',
  PRESENCE: 'Presence',
};

export const SIGNAL_COLORS: Record<string, string> = {
  RESONANCE: '#8B5CF6',
  ACHE: '#EC4899',
  WONDER: '#06B6D4',
  RECOGNITION: '#C9A84C',
  PRESENCE: '#10B981',
};

export const MAX_CONNECTIONS = 12;
export const UNVEIL_DEPTH_THRESHOLD = 100;
export const RESONANCE_ENGINE_MIN_DAYS = 7;

export const VEIL_PLUS_PRODUCT_ID = 'veil_plus_monthly';
export const VEIL_PLUS_PRICE = '$4.99/mo';
