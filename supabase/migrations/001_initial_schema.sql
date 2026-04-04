-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  alias TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  soul_map_vector vector(1536),
  soul_map_metadata JSONB DEFAULT '{}',
  unveil_photo_url TEXT,
  unveil_name TEXT,
  daily_prompt_time TEXT DEFAULT '08:00',
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE
);

-- Index for vector similarity search (resonance matching)
CREATE INDEX ON users USING ivfflat (soul_map_vector vector_cosine_ops)
  WITH (lists = 100);

-- ─────────────────────────────────────────
-- PROMPTS
-- ─────────────────────────────────────────
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'grief','wonder','identity','desire','fear','joy','loss','becoming',
    'nostalgia','anger','peace','confusion'
  )),
  difficulty_level SMALLINT NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Daily prompt assignments
CREATE TABLE daily_prompt_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id),
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, assigned_date)
);

-- ─────────────────────────────────────────
-- RESPONSES
-- ─────────────────────────────────────────
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id),
  type TEXT NOT NULL CHECK (type IN ('text','voice','sketch')),
  content_encrypted TEXT NOT NULL,
  content_preview TEXT GENERATED ALWAYS AS (LEFT(content_encrypted, 60)) STORED,
  emotional_signature JSONB,
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- ─────────────────────────────────────────
-- CONNECTIONS
-- ─────────────────────────────────────────
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resonance_type TEXT NOT NULL CHECK (resonance_type IN ('mirror','contrast','echo')),
  depth_score NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (depth_score BETWEEN 0 AND 100),
  state TEXT NOT NULL DEFAULT 'proposed' CHECK (state IN (
    'proposed','accepted','veiled','unveil_pending','unveiled','anonymous_forever'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (user_a_id <> user_b_id),
  UNIQUE(user_a_id, user_b_id)
);

-- Enforce max 12 connections per user via trigger
CREATE OR REPLACE FUNCTION check_max_connections()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM connections
    WHERE (user_a_id = NEW.user_a_id OR user_b_id = NEW.user_a_id)
    AND state IN ('accepted','veiled','unveil_pending','unveiled','anonymous_forever')
  ) >= 12 THEN
    RAISE EXCEPTION 'Maximum 12 active connections reached';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_connections
  BEFORE INSERT ON connections
  FOR EACH ROW EXECUTE FUNCTION check_max_connections();

-- ─────────────────────────────────────────
-- SIGNALS
-- ─────────────────────────────────────────
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'RESONANCE','ACHE','WONDER','RECOGNITION','PRESENCE'
  )),
  response_id UUID REFERENCES responses(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_prompt_assignments ENABLE ROW LEVEL SECURITY;

-- Users: can only see/edit own row
CREATE POLICY "users_own" ON users
  FOR ALL USING (auth.uid() = id);

-- Responses: users can only see their own
CREATE POLICY "responses_own" ON responses
  FOR ALL USING (auth.uid() = user_id);

-- Connections: users can see connections they are part of
CREATE POLICY "connections_member" ON connections
  FOR SELECT USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY "connections_insert_own" ON connections
  FOR INSERT WITH CHECK (auth.uid() = user_a_id);

-- Signals: users can see signals in their connections
CREATE POLICY "signals_member" ON signals
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "signals_insert_own" ON signals
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Prompts: readable by all authenticated users
CREATE POLICY "prompts_read" ON prompts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Daily assignments: own only
CREATE POLICY "assignments_own" ON daily_prompt_assignments
  FOR ALL USING (auth.uid() = user_id);
