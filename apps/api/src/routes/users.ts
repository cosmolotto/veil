import { FastifyInstance } from 'fastify';

export async function userRoutes(fastify: FastifyInstance) {
  // POST /api/users/onboard
  fastify.post<{
    Body: { alias: string; daily_prompt_time?: string }
  }>('/onboard', {
    schema: {
      body: {
        type: 'object',
        required: ['alias'],
        properties: {
          alias: { type: 'string', minLength: 2, maxLength: 30, pattern: '^[a-zA-Z0-9_]+$' },
          daily_prompt_time: { type: 'string' },
        }
      }
    }
  }, async (request, reply) => {
    const { alias, daily_prompt_time = '08:00' } = request.body;
    const userId = request.userId;

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

  // PATCH /api/users/me
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
      .select('id, alias, created_at, last_active_at, soul_map_metadata, daily_prompt_time, onboarding_complete, is_plus')
      .eq('id', request.userId)
      .single();

    if (error || !data) return reply.notFound('User not found');
    return { data, error: null };
  });

  // GET /api/users/check-alias?alias=foo
  fastify.get<{ Querystring: { alias: string } }>('/check-alias', async (request) => {
    const { alias } = request.query;
    const { data } = await fastify.supabase
      .from('users')
      .select('id')
      .eq('alias', alias)
      .single();
    return { available: !data };
  });
}
