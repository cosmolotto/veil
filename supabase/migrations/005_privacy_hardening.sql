-- Privacy hardening for production testing.
-- Store previews separately so response bodies can be encrypted at rest.

ALTER TABLE responses
  DROP COLUMN IF EXISTS content_preview;

ALTER TABLE responses
  ADD COLUMN IF NOT EXISTS content_preview TEXT;

UPDATE responses
SET content_preview = LEFT(content_encrypted, 60)
WHERE content_preview IS NULL;
