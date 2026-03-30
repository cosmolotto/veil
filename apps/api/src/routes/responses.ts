import { FastifyInstance } from 'fastify';
import { extractEmotionalSignature, updateSoulMapVector } from '../services/soulMapService';

export async function responseRoutes(fastify: FastifyInstance) {
  // POST /api/responses
  fastify.post<{
    Body: { prompt_id: string; type: 'text'; content: string; is_shared?: boolean }
  }>('/', {
    schema: {
      body: {
        type: 'object',
        required: ['prompt_id', 'type', 'content'],
        properties: {
          prompt_id: { type: 'string' },
          type: { type: 'string', enum: ['text', 'voice', 'sketch'] },
          content: { type: 'string', minLength: 10 },
          is_shared: { type: 'boolean' },
        }
      }
    }
  }, async (request, reply) => {
    const { prompt_id, type, content, is_shared = false } = request.body;
    const userId = request.userId;

    const signature = await extractEmotionalSignature(fastify.openai, content);

    const { data, error } = await fastify.supabase
      .from('responses')
      .insert({
        user_id: userId,
        prompt_id,
        type,
        content_encrypted: content, // CLAUDE_REVIEW: encrypt before storing in Phase 2
        emotional_signature: signature,
        is_shared,
      })
      .select()
      .single();

    if (error) return reply.internalServerError(error.message);

    // Async soul map update — don't await
    updateSoulMapVector(fastify.supabase, fastify.openai, userId).catch(
      (e) => fastify.log.error({ err: e }, 'Soul map update failed')
    );

    return { data, error: null };
  });

  // GET /api/responses/mine
  fastify.get('/mine', async (request) => {
    const { data, error } = await fastify.supabase
      .from('responses')
      .select('id, prompt_id, type, created_at, is_shared, emotional_signature, content_preview')
      .eq('user_id', request.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data ?? [], error: null };
  });
}
