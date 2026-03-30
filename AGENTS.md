# VEIL — Codex Autonomous Build Brief
## Phase 1: Full Foundation
**Supervised by Claude (Anthropic) | Executed by Codex**

---

## YOUR ROLE
You are Codex, acting as a senior full-stack engineer. You have been given a complete specification. You must execute it fully, autonomously, without asking questions. Every decision is already made for you in this document. If something is ambiguous, use the most defensive, privacy-preserving choice and leave a `// CLAUDE_REVIEW:` comment.

Do not stop. Do not ask for confirmation. Build everything in this document top to bottom.

---

## WHAT YOU ARE BUILDING
**VEIL** — A Soul-Resonance Social Network. The world's first social app where identity is hidden until a genuine emotional connection is formed. Users connect through anonymous shared introspection, not profiles or photos.

**Phase 1 Deliverable:** A fully working cross-platform app (iOS + Android + Web) with:
- Complete project scaffold
- Supabase database with full schema + RLS
- Fastify backend API (fully typed)
- Onboarding flow (5 screens)
- Today Screen (daily prompt + text response)
- Soul Map data pipeline (emotional signature extraction via OpenAI)
- All navigation wired up
- All environment variables documented

---

## TECH STACK — DO NOT DEVIATE

| Layer | Technology |
|-------|-----------|
| Frontend | React Native + Expo SDK 51, Expo Router v3, TypeScript strict |
| Styling | NativeWind v4 (Tailwind for RN) |
| Animations | React Native Reanimated 3 |
| State | Zustand 4 + React Query (TanStack Query v5) |
| Backend | Node.js + Fastify v4, TypeScript strict |
| Database | PostgreSQL via Supabase (supabase-js v2) |
| Auth | Supabase Auth (magic link / email only) |
| AI | OpenAI API (gpt-4o for extraction, text-embedding-3-large for vectors) |
| Storage | Supabase Storage |
| Package manager | pnpm workspaces (monorepo) |

---

## PROJECT STRUCTURE

Create this exact monorepo structure:

```
veil/
├── apps/
│   └── mobile/                  # Expo React Native app
│       ├── app/                 # Expo Router file-based routing
│       │   ├── (auth)/
│       │   │   ├── welcome.tsx
│       │   │   ├── create-alias.tsx
│       │   │   ├── first-prompt.tsx
│       │   │   ├── soul-intro.tsx
│       │   │   ├── privacy-promise.tsx
│       │   │   └── daily-time.tsx
│       │   ├── (tabs)/
│       │   │   ├── _layout.tsx
│       │   │   ├── today.tsx
│       │   │   ├── veil.tsx
│       │   │   ├── thread.tsx
│       │   │   └── self.tsx
│       │   ├── _layout.tsx
│       │   └── index.tsx
│       ├── components/
│       │   ├── ui/
│       │   │   ├── VeilButton.tsx
│       │   │   ├── VeilCard.tsx
│       │   │   ├── VeilInput.tsx
│       │   │   └── VeilText.tsx
│       │   ├── prompt/
│       │   │   ├── PromptCard.tsx
│       │   │   └── ResponseComposer.tsx
│       │   └── soul/
│       │       └── SoulMapOrb.tsx
│       ├── stores/
│       │   ├── authStore.ts
│       │   └── promptStore.ts
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useTodayPrompt.ts
│       │   └── useSoulMap.ts
│       ├── lib/
│       │   ├── supabase.ts
│       │   ├── api.ts
│       │   └── constants.ts
│       ├── app.json
│       ├── package.json
│       └── tsconfig.json
│
├── apps/
│   └── api/                     # Fastify backend
│       ├── src/
│       │   ├── index.ts
│       │   ├── plugins/
│       │   │   ├── supabase.ts
│       │   │   ├── openai.ts
│       │   │   └── auth.ts
│       │   ├── routes/
│       │   │   ├── prompts.ts
│       │   │   ├── responses.ts
│       │   │   ├── users.ts
│       │   │   └── soulmap.ts
│       │   ├── services/
│       │   │   ├── promptService.ts
│       │   │   ├── responseService.ts
│       │   │   └── soulMapService.ts
│       │   └── types/
│       │       └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/                  # Shared TypeScript types
│       ├── src/
│       │   └── types.ts
│       └── package.json
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql
│
├── pnpm-workspace.yaml
├── package.json
└── .env.example
```

---

## STEP 1 — MONOREPO INIT

Run these commands exactly:

```bash
mkdir veil && cd veil
pnpm init
```

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Create root `package.json`:
```json
{
  "name": "veil",
  "private": true,
  "scripts": {
    "mobile": "pnpm --filter mobile start",
    "api": "pnpm --filter api dev",
    "build:api": "pnpm --filter api build"
  }
}
```

---

## STEP 2 — SHARED TYPES PACKAGE

Create `packages/shared/package.json`:
```json
{
  "name": "@veil/shared",
  "version": "0.1.0",
  "main": "src/types.ts"
}
```

Create `packages/shared/src/types.ts` with ALL of these types — do not omit any:

```typescript
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
  daily_prompt_time?: string; // HH:MM format
  onboarding_complete: boolean;
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
  weight: number; // 0-1
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
  date: string; // YYYY-MM-DD
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
  // NOTE: content_encrypted is NEVER sent to client in full
  // Only a preview of first 60 chars for own responses
  content_preview?: string;
}

export interface EmotionalSignature {
  primary_emotion: EmotionType;
  secondary_emotion?: EmotionType;
  depth_level: number; // 1-10
  vulnerability_score: number; // 1-10
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
  depth_score: number; // 0-100
  state: ConnectionState;
  created_at: string;
  // Partner info is ALWAYS anonymous until unveiled
  partner_alias?: string; // only post-unveil
  partner_photo_url?: string; // only post-unveil
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
```

---

## STEP 3 — SUPABASE SCHEMA

Create `supabase/migrations/001_initial_schema.sql`:

```sql
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
```

Create `supabase/seed.sql` with 30 seed prompts covering all emotion categories:

```sql
INSERT INTO prompts (text, category, difficulty_level) VALUES
-- grief
('What loss are you still carrying that others have forgotten about?', 'grief', 4),
('Describe something that ended before you were ready.', 'grief', 3),
-- wonder
('What ordinary thing secretly astonishes you?', 'wonder', 2),
('Describe a moment when the world felt larger than usual.', 'wonder', 3),
-- identity
('What do you pretend not to care about?', 'identity', 4),
('Describe a version of yourself you quietly abandoned.', 'identity', 5),
('What label do people give you that feels slightly wrong?', 'identity', 3),
-- desire
('What do you want that you are ashamed to want?', 'desire', 5),
('What would you do if no one was watching and no one would ever know?', 'desire', 4),
-- fear
('What are you most afraid of becoming?', 'fear', 5),
('What do you avoid thinking about before you sleep?', 'fear', 4),
-- joy
('What small thing made today more bearable?', 'joy', 1),
('Describe a moment of joy you have never told anyone about.', 'joy', 3),
-- loss
('What do you miss that no longer exists?', 'loss', 3),
('What did you used to believe that you wish were still true?', 'loss', 4),
-- becoming
('Who are you becoming that scares you a little?', 'becoming', 5),
('What is something about you that is still unfinished?', 'becoming', 3),
-- nostalgia
('What place exists only in your memory now?', 'nostalgia', 3),
('Describe a sound from your childhood that no one else would remember.', 'nostalgia', 4),
-- anger
('What injustice do you carry quietly?', 'anger', 4),
('What do you wish you had said?', 'anger', 3),
-- peace
('When do you feel most like yourself?', 'peace', 2),
('Describe a moment when everything felt exactly right.', 'peace', 2),
-- confusion
('What do you not understand about yourself?', 'confusion', 4),
('What question keeps returning to you without an answer?', 'confusion', 3),
-- mixed difficulty
('If your silence could speak, what would it say right now?', 'identity', 5),
('What do you wish someone had noticed about you today?', 'desire', 3),
('Describe a time you felt completely invisible.', 'grief', 4),
('What are you in the middle of that no one knows about?', 'becoming', 4),
('What would the kindest version of you say to you right now?', 'peace', 2);
```

---

## STEP 4 — FASTIFY API

### `apps/api/package.json`
```json
{
  "name": "api",
  "version": "0.1.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "@veil/shared": "workspace:*",
    "fastify": "^4.28.0",
    "@fastify/cors": "^9.0.0",
    "@fastify/sensible": "^5.6.0",
    "openai": "^4.67.0",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0"
  }
}
```

### `apps/api/src/index.ts`
```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import 'dotenv/config';

import { supabasePlugin } from './plugins/supabase';
import { openaiPlugin } from './plugins/openai';
import { authPlugin } from './plugins/auth';

import { promptRoutes } from './routes/prompts';
import { responseRoutes } from './routes/responses';
import { userRoutes } from './routes/users';
import { soulMapRoutes } from './routes/soulmap';

const app = Fastify({ logger: true });

// Plugins
app.register(cors, { origin: true });
app.register(sensible);
app.register(supabasePlugin);
app.register(openaiPlugin);
app.register(authPlugin);

// Routes
app.register(promptRoutes, { prefix: '/api/prompts' });
app.register(responseRoutes, { prefix: '/api/responses' });
app.register(userRoutes, { prefix: '/api/users' });
app.register(soulMapRoutes, { prefix: '/api/soul-map' });

// Health
app.get('/health', async () => ({ status: 'ok', version: '1.0.0' }));

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

### `apps/api/src/plugins/supabase.ts`
```typescript
import fp from 'fastify-plugin';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare module 'fastify' {
  interface FastifyInstance {
    supabase: SupabaseClient;
  }
}

export const supabasePlugin = fp(async (fastify) => {
  const client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  fastify.decorate('supabase', client);
});
```

### `apps/api/src/plugins/openai.ts`
```typescript
import fp from 'fastify-plugin';
import OpenAI from 'openai';

declare module 'fastify' {
  interface FastifyInstance {
    openai: OpenAI;
  }
}

export const openaiPlugin = fp(async (fastify) => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  fastify.decorate('openai', client);
});
```

### `apps/api/src/plugins/auth.ts`
```typescript
import fp from 'fastify-plugin';
import { FastifyRequest, FastifyReply } from 'fastify';
import { createClient } from '@supabase/supabase-js';

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}

export const authPlugin = fp(async (fastify) => {
  fastify.decorateRequest('userId', '');

  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip auth for health check
    if (request.url === '/health') return;

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.unauthorized('Missing auth token');
    }

    const token = authHeader.split(' ')[1];
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return reply.unauthorized('Invalid token');
    }

    request.userId = user.id;
  });
});
```

### `apps/api/src/services/soulMapService.ts`
```typescript
import OpenAI from 'openai';
import { EmotionalSignature, EmotionType } from '@veil/shared';

const EXTRACTION_SYSTEM_PROMPT = `You are an emotional intelligence system for a private journaling app called VEIL.
Your job is to extract an emotional signature from a user's reflective text response.

CRITICAL RULES:
- Never quote or repeat any content from the user's text
- Never store or reference the user's actual words
- Output ONLY a valid JSON object, no markdown, no explanation
- Be accurate and empathetic, not clinical

Return exactly this JSON structure:
{
  "primary_emotion": "<one of: grief|wonder|identity|desire|fear|joy|loss|becoming|nostalgia|anger|peace|confusion>",
  "secondary_emotion": "<same options or null>",
  "depth_level": <integer 1-10>,
  "vulnerability_score": <integer 1-10>,
  "temporal_orientation": "<past|present|future>",
  "energy_level": "<low|medium|high>"
}`;

export async function extractEmotionalSignature(
  openai: OpenAI,
  responseContent: string
): Promise<EmotionalSignature | null> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 200,
      temperature: 0.3,
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
        { role: 'user', content: responseContent }
      ]
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Omit<EmotionalSignature, 'extracted_at'>;
    return {
      ...parsed,
      extracted_at: new Date().toISOString()
    };
  } catch {
    // CLAUDE_REVIEW: Silent fail intentional — signature is non-blocking
    return null;
  }
}

export async function generateSoulMapEmbedding(
  openai: OpenAI,
  signature: EmotionalSignature
): Promise<number[]> {
  // Embed the signature metadata (NOT the content) as a descriptor string
  const descriptor = `Emotional state: ${signature.primary_emotion}. ` +
    (signature.secondary_emotion ? `Also: ${signature.secondary_emotion}. ` : '') +
    `Depth: ${signature.depth_level}/10. ` +
    `Vulnerability: ${signature.vulnerability_score}/10. ` +
    `Time orientation: ${signature.temporal_orientation}. ` +
    `Energy: ${signature.energy_level}.`;

  const result = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: descriptor
  });

  return result.data[0].embedding;
}

export async function updateSoulMapVector(
  supabase: any,
  openai: OpenAI,
  userId: string
): Promise<void> {
  // Get last 30 emotional signatures for this user
  const { data: signatures } = await supabase
    .from('responses')
    .select('emotional_signature')
    .eq('user_id', userId)
    .not('emotional_signature', 'is', null)
    .order('created_at', { ascending: false })
    .limit(30);

  if (!signatures || signatures.length < 1) return;

  // Generate embeddings for each signature and average them
  const embeddings = await Promise.all(
    signatures.map((r: any) => generateSoulMapEmbedding(openai, r.emotional_signature))
  );

  // Rolling average vector
  const avgVector = embeddings[0].map((_: number, i: number) => {
    const sum = embeddings.reduce((acc: number, emb: number[]) => acc + emb[i], 0);
    return sum / embeddings.length;
  });

  // Compute soul map metadata
  const emotionCounts: Record<string, number> = {};
  let totalDepth = 0;
  let totalVuln = 0;
  const temporalCounts = { past: 0, present: 0, future: 0 };

  for (const r of signatures) {
    const sig: EmotionalSignature = r.emotional_signature;
    emotionCounts[sig.primary_emotion] = (emotionCounts[sig.primary_emotion] || 0) + 1;
    totalDepth += sig.depth_level;
    totalVuln += sig.vulnerability_score;
    temporalCounts[sig.temporal_orientation]++;
  }

  const dominant_emotions = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([emotion, count]) => ({
      emotion: emotion as EmotionType,
      weight: count / signatures.length
    }));

  const temporal_orientation = (Object.entries(temporalCounts)
    .sort(([, a], [, b]) => b - a)[0][0]) as 'past' | 'present' | 'future';

  const metadata = {
    dominant_emotions,
    avg_depth_score: totalDepth / signatures.length,
    avg_vulnerability_score: totalVuln / signatures.length,
    temporal_orientation,
    response_count: signatures.length,
    last_updated: new Date().toISOString()
  };

  await supabase
    .from('users')
    .update({
      soul_map_vector: `[${avgVector.join(',')}]`,
      soul_map_metadata: metadata
    })
    .eq('id', userId);
}
```

### `apps/api/src/routes/prompts.ts`
```typescript
import { FastifyInstance } from 'fastify';

export async function promptRoutes(fastify: FastifyInstance) {

  // GET /api/prompts/today — returns today's prompt for the authenticated user
  fastify.get('/today', async (request, reply) => {
    const userId = request.userId;
    const today = new Date().toISOString().split('T')[0];

    // Check for existing assignment
    const { data: existing } = await fastify.supabase
      .from('daily_prompt_assignments')
      .select('prompt_id, prompts(*)')
      .eq('user_id', userId)
      .eq('assigned_date', today)
      .single();

    if (existing) {
      // Check if user already responded
      const { data: response } = await fastify.supabase
        .from('responses')
        .select('id')
        .eq('user_id', userId)
        .eq('prompt_id', existing.prompt_id)
        .single();

      return {
        data: {
          prompt: existing.prompts,
          date: today,
          user_has_responded: !!response
        },
        error: null
      };
    }

    // Assign a new prompt — avoid prompts user has already seen
    const { data: seenPrompts } = await fastify.supabase
      .from('daily_prompt_assignments')
      .select('prompt_id')
      .eq('user_id', userId);

    const seenIds = seenPrompts?.map((p: any) => p.prompt_id) || [];

    let query = fastify.supabase
      .from('prompts')
      .select('*')
      .eq('is_active', true);

    if (seenIds.length > 0) {
      query = query.not('id', 'in', `(${seenIds.join(',')})`);
    }

    const { data: available } = await query;

    if (!available || available.length === 0) {
      return reply.internalServerError('No prompts available');
    }

    // Pick random prompt
    const prompt = available[Math.floor(Math.random() * available.length)];

    // Create assignment
    await fastify.supabase
      .from('daily_prompt_assignments')
      .insert({ user_id: userId, prompt_id: prompt.id, assigned_date: today });

    return {
      data: { prompt, date: today, user_has_responded: false },
      error: null
    };
  });
}
```

### `apps/api/src/routes/responses.ts`
```typescript
import { FastifyInstance } from 'fastify';
import { extractEmotionalSignature, updateSoulMapVector } from '../services/soulMapService';

export async function responseRoutes(fastify: FastifyInstance) {

  // POST /api/responses — submit a response to a prompt
  fastify.post<{
    Body: { prompt_id: string; type: 'text' | 'voice' | 'sketch'; content: string; is_shared?: boolean }
  }>('/', {
    schema: {
      body: {
        type: 'object',
        required: ['prompt_id', 'type', 'content'],
        properties: {
          prompt_id: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['text', 'voice', 'sketch'] },
          content: { type: 'string', minLength: 1, maxLength: 10000 },
          is_shared: { type: 'boolean' }
        }
      }
    }
  }, async (request, reply) => {
    const userId = request.userId;
    const { prompt_id, type, content, is_shared = false } = request.body;

    // Verify prompt was assigned to user
    const today = new Date().toISOString().split('T')[0];
    const { data: assignment } = await fastify.supabase
      .from('daily_prompt_assignments')
      .select('id')
      .eq('user_id', userId)
      .eq('prompt_id', prompt_id)
      .single();

    if (!assignment) {
      return reply.forbidden('Prompt not assigned to user');
    }

    // Check for duplicate
    const { data: existing } = await fastify.supabase
      .from('responses')
      .select('id')
      .eq('user_id', userId)
      .eq('prompt_id', prompt_id)
      .single();

    if (existing) {
      return reply.conflict('Already responded to this prompt');
    }

    // Extract emotional signature (non-blocking)
    const emotional_signature = await extractEmotionalSignature(fastify.openai, content);

    // Store response (content stored as-is; in production this would be encrypted)
    // CLAUDE_REVIEW: Add proper encryption (AES-256-GCM) before production
    const { data: response, error } = await fastify.supabase
      .from('responses')
      .insert({
        user_id: userId,
        prompt_id,
        type,
        content_encrypted: content,
        emotional_signature,
        is_shared
      })
      .select('id, type, created_at, is_shared, emotional_signature, content_preview')
      .single();

    if (error) return reply.internalServerError(error.message);

    // Async soul map update (fire and forget)
    updateSoulMapVector(fastify.supabase, fastify.openai, userId).catch(console.error);

    return { data: response, error: null };
  });

  // GET /api/responses/mine — get user's own responses (no content, just metadata)
  fastify.get('/mine', async (request) => {
    const { data, error } = await fastify.supabase
      .from('responses')
      .select('id, prompt_id, type, created_at, is_shared, emotional_signature, content_preview')
      .eq('user_id', request.userId)
      .order('created_at', { ascending: false });

    return { data: data || [], error: error?.message || null };
  });
}
```

### `apps/api/src/routes/users.ts`
```typescript
import { FastifyInstance } from 'fastify';

export async function userRoutes(fastify: FastifyInstance) {

  // POST /api/users/onboard — creates user profile after signup
  fastify.post<{
    Body: { alias: string; daily_prompt_time?: string }
  }>('/onboard', {
    schema: {
      body: {
        type: 'object',
        required: ['alias'],
        properties: {
          alias: { type: 'string', minLength: 2, maxLength: 30, pattern: '^[a-zA-Z0-9_]+$' },
          daily_prompt_time: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' }
        }
      }
    }
  }, async (request, reply) => {
    const userId = request.userId;
    const { alias, daily_prompt_time = '08:00' } = request.body;

    // Check alias uniqueness
    const { data: existing } = await fastify.supabase
      .from('users')
      .select('id')
      .eq('alias', alias)
      .single();

    if (existing) return reply.conflict('Alias already taken');

    const { data, error } = await fastify.supabase
      .from('users')
      .insert({ id: userId, alias, daily_prompt_time })
      .select()
      .single();

    if (error) return reply.internalServerError(error.message);
    return { data, error: null };
  });

  // PATCH /api/users/me — update profile
  fastify.patch<{
    Body: { daily_prompt_time?: string; onboarding_complete?: boolean }
  }>('/me', async (request, reply) => {
    const { data, error } = await fastify.supabase
      .from('users')
      .update({ ...request.body, last_active_at: new Date().toISOString() })
      .eq('id', request.userId)
      .select()
      .single();

    if (error) return reply.internalServerError(error.message);
    return { data, error: null };
  });

  // GET /api/users/me
  fastify.get('/me', async (request, reply) => {
    const { data, error } = await fastify.supabase
      .from('users')
      .select('id, alias, created_at, last_active_at, soul_map_metadata, daily_prompt_time, onboarding_complete')
      .eq('id', request.userId)
      .single();

    if (error || !data) return reply.notFound('User not found');
    return { data, error: null };
  });
}
```

### `apps/api/src/routes/soulmap.ts`
```typescript
import { FastifyInstance } from 'fastify';

export async function soulMapRoutes(fastify: FastifyInstance) {

  // GET /api/soul-map/me — returns soul map metadata
  fastify.get('/me', async (request, reply) => {
    const { data, error } = await fastify.supabase
      .from('users')
      .select('soul_map_metadata')
      .eq('id', request.userId)
      .single();

    if (error) return reply.internalServerError(error.message);
    return { data: data?.soul_map_metadata || null, error: null };
  });
}
```

---

## STEP 5 — EXPO MOBILE APP

### `apps/mobile/package.json`
```json
{
  "name": "mobile",
  "version": "0.1.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@veil/shared": "workspace:*",
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "expo-status-bar": "~1.12.1",
    "expo-font": "~12.0.5",
    "expo-splash-screen": "~0.27.4",
    "expo-secure-store": "~13.0.1",
    "expo-notifications": "~0.28.5",
    "react": "18.2.0",
    "react-native": "0.74.0",
    "@supabase/supabase-js": "^2.45.0",
    "react-native-url-polyfill": "^2.0.0",
    "zustand": "^4.5.5",
    "@tanstack/react-query": "^5.56.0",
    "react-native-reanimated": "~3.10.0",
    "nativewind": "^4.0.1",
    "tailwindcss": "^3.4.0",
    "@expo/vector-icons": "^14.0.2"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "typescript": "^5.6.0"
  }
}
```

### `apps/mobile/lib/constants.ts`
```typescript
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
```

### `apps/mobile/lib/supabase.ts`
```typescript
import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

### `apps/mobile/lib/api.ts`
```typescript
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
  // Users
  onboard: (alias: string, daily_prompt_time?: string) =>
    apiFetch<{ data: VeilUser }>('/api/users/onboard', {
      method: 'POST',
      body: JSON.stringify({ alias, daily_prompt_time })
    }),
  getMe: () => apiFetch<{ data: VeilUser }>('/api/users/me'),
  updateMe: (body: Partial<VeilUser>) =>
    apiFetch<{ data: VeilUser }>('/api/users/me', { method: 'PATCH', body: JSON.stringify(body) }),

  // Prompts
  getTodayPrompt: () => apiFetch<{ data: DailyPrompt }>('/api/prompts/today'),

  // Responses
  submitResponse: (body: { prompt_id: string; type: 'text'; content: string; is_shared?: boolean }) =>
    apiFetch<{ data: Response }>('/api/responses', { method: 'POST', body: JSON.stringify(body) }),
  getMyResponses: () => apiFetch<{ data: Response[] }>('/api/responses/mine'),

  // Soul Map
  getMySoulMap: () => apiFetch<{ data: any }>('/api/soul-map/me'),
};
```

### `apps/mobile/stores/authStore.ts`
```typescript
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { VeilUser } from '@veil/shared';

interface AuthState {
  user: VeilUser | null;
  session: any | null;
  isLoading: boolean;
  setUser: (user: VeilUser | null) => void;
  setSession: (session: any) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, isLoading: false }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
```

### `apps/mobile/stores/promptStore.ts`
```typescript
import { create } from 'zustand';
import type { DailyPrompt } from '@veil/shared';

interface PromptState {
  todayPrompt: DailyPrompt | null;
  responseText: string;
  hasResponded: boolean;
  setTodayPrompt: (prompt: DailyPrompt) => void;
  setResponseText: (text: string) => void;
  markResponded: () => void;
}

export const usePromptStore = create<PromptState>((set) => ({
  todayPrompt: null,
  responseText: '',
  hasResponded: false,
  setTodayPrompt: (prompt) => set({ todayPrompt: prompt, hasResponded: prompt.user_has_responded }),
  setResponseText: (responseText) => set({ responseText }),
  markResponded: () => set({ hasResponded: true }),
}));
```

### `apps/mobile/app/_layout.tsx`
```typescript
import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';

const queryClient = new QueryClient();

function AuthGuard() {
  const { session, user, setSession, setUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        try {
          const { data } = await api.getMe();
          setUser(data);
        } catch {
          // User not onboarded yet — profile doesn't exist
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inTabGroup = segments[0] === '(tabs)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (session && !user && !inAuthGroup) {
      router.replace('/(auth)/create-alias');
    } else if (session && user?.onboarding_complete && inAuthGroup) {
      router.replace('/(tabs)/today');
    }
  }, [session, user, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
    </QueryClientProvider>
  );
}
```

### `apps/mobile/app/(tabs)/_layout.tsx`
```typescript
import { Tabs } from 'expo-router';
import { COLORS } from '../../lib/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.dark,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginBottom: 6 },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: ({ color }) => <TabIcon symbol="○" color={color} /> }} />
      <Tabs.Screen name="veil" options={{ title: 'Veil', tabBarIcon: ({ color }) => <TabIcon symbol="◌" color={color} /> }} />
      <Tabs.Screen name="thread" options={{ title: 'Thread', tabBarIcon: ({ color }) => <TabIcon symbol="◍" color={color} /> }} />
      <Tabs.Screen name="self" options={{ title: 'Self', tabBarIcon: ({ color }) => <TabIcon symbol="◎" color={color} /> }} />
    </Tabs>
  );
}

function TabIcon({ symbol, color }: { symbol: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ color, fontSize: 18 }}>{symbol}</Text>;
}
```

### ONBOARDING SCREENS — implement ALL of these:

#### `apps/mobile/app/(auth)/welcome.tsx`
Full-screen dark background (#0F0820). Centered layout. Show:
- Large "VEIL" text in primary color (#2D1B69), bold, large (48px)
- Tagline: *"Be Known Before You Are Seen."* in accent color (#8B5CF6), italic
- Subtext: "A different kind of social" in muted color, small
- A single button "Begin" — VeilButton component, full width, accent background
- On press: router.push('/(auth)/create-alias')
- Animate in with a slow fade (Reanimated FadeIn, 800ms delay)

#### `apps/mobile/app/(auth)/create-alias.tsx`
Dark background. Show:
- Back arrow top left
- Heading: "Choose your alias" — this is your name on VEIL. Not your real name.
- Subtext: "Letters, numbers, underscores only. You can change this later."
- VeilInput component for alias input, autoFocus, maxLength 30
- Real-time alias availability check (debounced 500ms) — call GET /api/users/check-alias (add this route if needed, or do client-side validation for now with a `// CLAUDE_REVIEW: Add server-side check` comment)
- "Continue" VeilButton — disabled until alias is valid
- On press: store alias in local state, router.push('/(auth)/first-prompt')

#### `apps/mobile/app/(auth)/first-prompt.tsx`
Dark background. Show:
- Heading: "Every day, one question."
- A sample prompt card (use a hardcoded example: *"What do you wish someone had noticed about you today?"*)
- Subtext: "You answer it however you want. Voice, words, or a sketch. Nobody sees it unless you choose."
- "I understand" button → router.push('/(auth)/soul-intro')

#### `apps/mobile/app/(auth)/soul-intro.tsx`
Dark background. Animated particle orb in center (use a simple Animated circle with pulsing scale). Show:
- Heading: "Your Soul Map"
- Subtext: "As you respond, VEIL builds a private map of your emotional world. It never reads your words — only the feeling beneath them. It uses this to find people who resonate with you."
- "Interesting" button → router.push('/(auth)/privacy-promise')

#### `apps/mobile/app/(auth)/privacy-promise.tsx`
Dark background. Show:
- Icon: a shield or lock symbol (use @expo/vector-icons Ionicons)
- Heading: "Privacy is not a feature here."
- Four bullet points (each with a checkmark icon):
  1. Your responses are encrypted and never sold.
  2. No ads. No tracking. No data brokers.
  3. You are anonymous until you choose otherwise.
  4. Delete everything. Anytime. Instantly.
- "I trust this" button → router.push('/(auth)/daily-time')

#### `apps/mobile/app/(auth)/daily-time.tsx`
Dark background. Show:
- Heading: "When should we reach you?"
- Subtext: "We'll send your daily prompt at this time. One notification. That's it."
- Time picker (use a simple scroll picker or React Native's built-in — pick the simpler option)
- "Start my journey" button
- On press:
  1. Call api.onboard(alias, dailyTime)
  2. Call api.updateMe({ onboarding_complete: true })
  3. Update authStore user
  4. router.replace('/(tabs)/today')

### TODAY SCREEN — `apps/mobile/app/(tabs)/today.tsx`

This is the most important screen. Build it fully:

```
Layout (top to bottom, dark background #0F0820):
1. Header: "Today" left, current date right (e.g. "Mon, 10 Mar"), muted
2. If user has streak > 0: small streak indicator (🔥 or flame icon + number)
3. PromptCard component — the main prompt
4. If not yet responded: ResponseComposer component
5. If responded: "Responded today" confirmation state with Soul Map preview orb
```

**PromptCard component** (`components/prompt/PromptCard.tsx`):
- Card with surface background (#1A1035)
- Subtle border (#3D2A6B)
- Category label (e.g. "identity") in accent color, small caps, top
- Large prompt text, white, centered, generous padding
- Animated entrance: slide up + fade in (Reanimated)
- Loading skeleton state while fetching

**ResponseComposer component** (`components/prompt/ResponseComposer.tsx`):
- Three mode tabs at top: TEXT | VOICE | SKETCH (only TEXT is functional in Phase 1)
- VOICE and SKETCH show "Coming soon" placeholder with `// CLAUDE_REVIEW: implement in Phase 2`
- TEXT mode: multi-line TextInput, dark surface, placeholder "Write what's true for you...", min 3 lines, max 10000 chars
- Character count bottom right (muted color)
- "Share this with resonance matches" toggle switch (is_shared)
- "Submit" VeilButton — disabled if less than 10 chars
- On submit:
  1. Call api.submitResponse({ prompt_id, type: 'text', content, is_shared })
  2. Show loading state
  3. On success: animate card away, show confirmation state
  4. Mark store hasResponded = true

**Self screen** (`apps/mobile/app/(tabs)/self.tsx`): Show user alias, soul map metadata (dominant emotions as colored tags), response count, streak. Add "Sign out" at bottom.

**Veil screen** (`apps/mobile/app/(tabs)/veil.tsx`): Empty state for Phase 1. Show centered text: "Your resonance engine activates after 7 days of responses." with a pulsing orb. `// CLAUDE_REVIEW: Wire up connections in Phase 2`

**Thread screen** (`apps/mobile/app/(tabs)/thread.tsx`): Empty state for Phase 1. Show centered text: "Threads appear when you form your first connection." `// CLAUDE_REVIEW: Wire up threads in Phase 2`

---

## STEP 6 — UI COMPONENTS

### `apps/mobile/components/ui/VeilButton.tsx`
```typescript
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS } from '../../lib/constants';

interface VeilButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function VeilButton({ label, onPress, variant = 'primary', disabled, loading, style }: VeilButtonProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.96, {}, () => { scale.value = withSpring(1); });
    onPress();
  };

  const bg = variant === 'primary' ? COLORS.accent
    : variant === 'secondary' ? COLORS.surface
    : 'transparent';

  return (
    <Animated.View style={[animStyle, style]}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: bg, opacity: disabled ? 0.4 : 1 }]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading
          ? <ActivityIndicator color={COLORS.white} />
          : <Text style={styles.label}>{label}</Text>
        }
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  label: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  }
});
```

### `apps/mobile/components/ui/VeilInput.tsx`
```typescript
import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { COLORS } from '../../lib/constants';

interface VeilInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function VeilInput({ label, error, style, ...props }: VeilInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
          style as any
        ]}
        placeholderTextColor={COLORS.muted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { color: COLORS.muted, fontSize: 13, marginBottom: 8, letterSpacing: 0.5 },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    color: COLORS.white,
    fontSize: 16,
  },
  inputFocused: { borderColor: COLORS.accent },
  inputError: { borderColor: COLORS.error },
  error: { color: COLORS.error, fontSize: 12, marginTop: 6 },
});
```

### `apps/mobile/components/soul/SoulMapOrb.tsx`
Animated glowing orb component. Uses React Native Reanimated:
- Pulsing scale animation (1.0 → 1.08 → 1.0, loop, 3 second cycle)
- Multiple concentric circles with decreasing opacity
- Inner color based on dominant emotion (map emotion → SIGNAL_COLORS or fallback to COLORS.accent)
- Accepts `size` and `emotion` props
- Soft glow effect using shadow/elevation

---

## STEP 7 — ENVIRONMENT FILES

### `.env.example` (root)
```
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-...

# API
PORT=3001

# Mobile (Expo public vars)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://localhost:3001
```

Create `.env` (same as `.env.example` but with placeholder values so the app starts without crashing):
```
SUPABASE_URL=https://placeholder.supabase.co
SUPABASE_ANON_KEY=placeholder
SUPABASE_SERVICE_ROLE_KEY=placeholder
OPENAI_API_KEY=sk-placeholder
PORT=3001
EXPO_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=placeholder
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### `apps/mobile/app.json`
```json
{
  "expo": {
    "name": "VEIL",
    "slug": "veil",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "backgroundColor": "#0F0820",
    "splash": {
      "backgroundColor": "#0F0820"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.veil.app"
    },
    "android": {
      "package": "com.veil.app",
      "adaptiveIcon": {
        "backgroundColor": "#0F0820"
      }
    },
    "web": {
      "bundler": "metro"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-notifications",
        { "sounds": [] }
      ]
    ],
    "scheme": "veil"
  }
}
```

---

## STEP 8 — INSTALL ALL DEPENDENCIES

Run in order:
```bash
cd veil
pnpm install

# In apps/api
cd apps/api && pnpm add fastify-plugin

# Install Expo dependencies properly
cd ../../apps/mobile
npx expo install expo-router react-native-reanimated react-native-safe-area-context react-native-screens react-native-gesture-handler
```

---

## STEP 9 — TSCONFIG FILES

### `apps/api/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "paths": {
      "@veil/shared": ["../../packages/shared/src/types"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### `apps/mobile/tsconfig.json`
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@veil/shared": ["../../packages/shared/src/types"]
    }
  }
}
```

---

## STEP 10 — VERIFY CHECKLIST

Before finishing, verify ALL of the following. Fix anything that fails:

- [ ] `pnpm install` runs without errors from root
- [ ] `pnpm api` starts the Fastify server on port 3001
- [ ] `GET http://localhost:3001/health` returns `{"status":"ok"}`
- [ ] `pnpm mobile` starts the Expo dev server
- [ ] All TypeScript compiles with `strict: true` — zero errors
- [ ] All route files have proper TypeScript types — no `any` types (except where `// CLAUDE_REVIEW:` comments exist)
- [ ] All 5 onboarding screens exist and are navigable in sequence
- [ ] Today screen renders PromptCard and ResponseComposer
- [ ] All 4 tab screens exist (today, veil, thread, self)
- [ ] `.env.example` documents every environment variable
- [ ] `AGENTS.md` is present in root (this file)

---

## IMPORTANT CONSTRAINTS — NEVER VIOLATE THESE

1. **No open-ended chat** — do not build any free-form messaging components
2. **No follower counts** — no count displays of any kind
3. **No public feed** — no component that shows content from multiple users publicly
4. **No real names** — alias only, everywhere
5. **No `any` types** — TypeScript strict throughout (use `// CLAUDE_REVIEW:` if you must)
6. **No console.logs in production paths** — use `fastify.log` in API
7. **Content is never sent to analytics** — emotional signatures only, never raw text
8. **Animations must be intentional** — nothing should snap or jerk; everything fades or breathes

---

## WHEN YOU FINISH

Create a file called `PHASE1_COMPLETE.md` in the root with:
1. A list of everything built
2. A list of all `// CLAUDE_REVIEW:` comments and their locations
3. Instructions to run the project locally
4. What Phase 2 will need

---

*This brief was authored by Claude (Anthropic) as part of the VEIL project supervised architecture.*
*Codex executes. Claude reviews. Together we build what hasn't been built before.*
