import { FastifyInstance } from 'fastify';
import { extractEmotionalSignature, updateSoulMapVector } from '../services/soulMapService';
import { encryptText, makeContentPreview } from '../services/cryptoService';

const SNAPSHOT_GRADIENT_BY_EMOTION: Record<string, string> = {
  joy: 'sunrise',
  peace: 'mist',
  wonder: 'ocean',
  grief: 'ember',
  loss: 'ember',
  fear: 'midnight',
  confusion: 'midnight',
  anger: 'ember',
  nostalgia: 'dusk',
  desire: 'dusk',
  identity: 'midnight',
  becoming: 'aurora',
};

function toDateOnly(value: Date): string {
  return value.toISOString().split('T')[0];
}

function dayDiff(fromDate: string, toDate: string): number {
  const from = new Date(`${fromDate}T00:00:00.000Z`).getTime();
  const to = new Date(`${toDate}T00:00:00.000Z`).getTime();
  return Math.round((to - from) / 86400000);
}

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
          is_shared: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    const userId = request.userId;
    const { prompt_id, type, content, is_shared = false } = request.body;

    // Verify prompt was assigned to user
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
    const contentPreview = makeContentPreview(content);

    const { data: response, error } = await fastify.supabase
      .from('responses')
      .insert({
        user_id: userId,
        prompt_id,
        type,
        content_encrypted: encryptText(content),
        content_preview: contentPreview,
        emotional_signature,
        is_shared,
      })
      .select('id, type, created_at, is_shared, emotional_signature, content_preview')
      .single();

    if (error) return reply.internalServerError(error.message);

    // Update streak + shields
    const today = toDateOnly(new Date());
    const { data: userForStreak } = await fastify.supabase
      .from('users')
      .select('streak_days, streak_shields, last_response_date')
      .eq('id', userId)
      .single();

    if (userForStreak) {
      const currentStreak = Number(userForStreak.streak_days || 0);
      const currentShields = Number(userForStreak.streak_shields || 0);
      const lastResponseDate = userForStreak.last_response_date as string | null;

      let nextStreak = currentStreak;
      let nextShields = currentShields;

      if (!lastResponseDate) {
        nextStreak = 1;
      } else {
        const diff = dayDiff(lastResponseDate, today);
        if (diff === 0) {
          nextStreak = currentStreak || 1;
        } else if (diff === 1) {
          nextStreak = currentStreak + 1;
          if (nextStreak > 0 && nextStreak % 7 === 0) {
            nextShields = Math.min(3, currentShields + 1);
          }
        } else if (diff > 1) {
          if (currentShields > 0) {
            nextShields = currentShields - 1;
          } else {
            nextStreak = 1;
          }
        }
      }

      await fastify.supabase
        .from('users')
        .update({
          streak_days: nextStreak,
          streak_shields: nextShields,
          last_response_date: today,
        })
        .eq('id', userId);
    }

    // Create soul snapshot when user shares response (viral card source)
    if (is_shared && emotional_signature) {
      const moodTag = emotional_signature.primary_emotion;
      const gradientKey = SNAPSHOT_GRADIENT_BY_EMOTION[moodTag] || 'midnight';
      await fastify.supabase
        .from('soul_snapshots')
        .insert({
          user_id: userId,
          snapshot_text: `${moodTag.toUpperCase()} • depth ${emotional_signature.depth_level}/10 • vulnerability ${emotional_signature.vulnerability_score}/10`,
          mood_tag: moodTag,
          gradient_key: gradientKey,
        });
    }

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

  // GET /api/responses/highlights — latest public emotional snippets
  fastify.get('/highlights', async (request, reply) => {
    const { data, error } = await fastify.supabase
      .from('responses')
      .select('id, user_id, type, created_at, content_preview, emotional_signature')
      .eq('is_shared', true)
      .order('created_at', { ascending: false })
      .limit(40);

    if (error) return reply.internalServerError(error.message);

    const highlights = (data || []).map((item: {
      id: string;
      user_id: string;
      type: 'text' | 'voice' | 'sketch';
      created_at: string;
      content_preview: string;
      emotional_signature?: { primary_emotion?: string; depth_level?: number } | null;
    }) => ({
      id: item.id,
      type: item.type,
      created_at: item.created_at,
      content_preview: item.content_preview,
      emotion: item.emotional_signature?.primary_emotion || 'identity',
      depth_level: item.emotional_signature?.depth_level || 5,
      alias_hint: `Soul-${item.user_id.slice(0, 6)}`,
    }));

    return { data: highlights, error: null };
  });
}
