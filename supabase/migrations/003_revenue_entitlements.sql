-- Revenue and entitlement fields for VEIL+

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_plus BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS plus_activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plus_source TEXT DEFAULT 'none';
