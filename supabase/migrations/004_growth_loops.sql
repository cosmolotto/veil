-- Growth loops: referrals, streak shields, snapshots, highlights readiness

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS plus_trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS streak_days INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_shields INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_response_date DATE;

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(referrer_id, referred_user_id),
  UNIQUE(referred_user_id)
);

CREATE TABLE IF NOT EXISTS soul_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshot_text TEXT NOT NULL,
  mood_tag TEXT,
  gradient_key TEXT NOT NULL DEFAULT 'midnight',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE soul_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_read_own" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "soul_snapshots_own" ON soul_snapshots
  FOR ALL USING (auth.uid() = user_id);
