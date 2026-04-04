-- Phase 2 social + retention primitives

-- Thread messages between connected users
CREATE TABLE IF NOT EXISTS thread_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Push notification tokens for daily reminders + social events
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, expo_push_token)
);

ALTER TABLE thread_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "thread_messages_member_read" ON thread_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM connections c
      WHERE c.id = thread_messages.connection_id
      AND (auth.uid() = c.user_a_id OR auth.uid() = c.user_b_id)
    )
  );

CREATE POLICY "thread_messages_member_insert" ON thread_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM connections c
      WHERE c.id = thread_messages.connection_id
      AND (auth.uid() = c.user_a_id OR auth.uid() = c.user_b_id)
    )
  );

CREATE POLICY "push_tokens_own" ON push_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Match by soul-map vector distance and classify resonance type
CREATE OR REPLACE FUNCTION find_resonance_matches(
  target_user_id UUID,
  match_limit INT DEFAULT 6
)
RETURNS TABLE(
  user_id UUID,
  score DOUBLE PRECISION,
  resonance_type TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH target AS (
    SELECT soul_map_vector AS vec
    FROM users
    WHERE id = target_user_id
    LIMIT 1
  )
  SELECT
    u.id AS user_id,
    (1 - (u.soul_map_vector <=> t.vec))::DOUBLE PRECISION AS score,
    CASE
      WHEN (1 - (u.soul_map_vector <=> t.vec)) >= 0.88 THEN 'mirror'
      WHEN (1 - (u.soul_map_vector <=> t.vec)) >= 0.74 THEN 'echo'
      ELSE 'contrast'
    END::TEXT AS resonance_type
  FROM users u
  CROSS JOIN target t
  WHERE u.id <> target_user_id
    AND t.vec IS NOT NULL
    AND u.soul_map_vector IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM connections c
      WHERE (c.user_a_id = target_user_id AND c.user_b_id = u.id)
         OR (c.user_b_id = target_user_id AND c.user_a_id = u.id)
    )
  ORDER BY u.soul_map_vector <=> t.vec
  LIMIT GREATEST(match_limit, 1);
END;
$$;
