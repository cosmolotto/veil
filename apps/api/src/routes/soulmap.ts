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
}
