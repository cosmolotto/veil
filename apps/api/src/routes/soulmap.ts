import { FastifyInstance } from 'fastify';

export async function soulMapRoutes(fastify: FastifyInstance) {
  fastify.get('/me', async (request, reply) => {
    const { data, error } = await fastify.supabase
      .from('users')
      .select('soul_map_metadata')
      .eq('id', request.userId)
      .single();

    if (error) return reply.internalServerError(error.message);
    return { data: data?.soul_map_metadata || null, error: null };
  });

  // GET /api/soul-map/snapshots/mine
  fastify.get('/snapshots/mine', async (request, reply) => {
    const { data, error } = await fastify.supabase
      .from('soul_snapshots')
      .select('id, snapshot_text, mood_tag, gradient_key, created_at')
      .eq('user_id', request.userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) return reply.internalServerError(error.message);
    return { data: data || [], error: null };
  });

  // POST /api/soul-map/snapshots
  fastify.post<{
    Body: { snapshot_text: string; mood_tag?: string; gradient_key?: string }
  }>('/snapshots', {
    schema: {
      body: {
        type: 'object',
        required: ['snapshot_text'],
        properties: {
          snapshot_text: { type: 'string', minLength: 6, maxLength: 180 },
          mood_tag: { type: 'string', minLength: 2, maxLength: 30 },
          gradient_key: { type: 'string', minLength: 2, maxLength: 30 },
        },
      },
    },
  }, async (request, reply) => {
    const { snapshot_text, mood_tag, gradient_key } = request.body;
    const { data, error } = await fastify.supabase
      .from('soul_snapshots')
      .insert({
        user_id: request.userId,
        snapshot_text,
        mood_tag: mood_tag || null,
        gradient_key: gradient_key || 'midnight',
      })
      .select('id, snapshot_text, mood_tag, gradient_key, created_at')
      .single();

    if (error) return reply.internalServerError(error.message);
    return { data, error: null };
  });
}
