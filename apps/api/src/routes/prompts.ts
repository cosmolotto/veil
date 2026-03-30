import { FastifyInstance } from 'fastify';

export async function promptRoutes(fastify: FastifyInstance) {
  // GET /api/prompts/today
  fastify.get('/today', async (request, reply) => {
    const userId = request.userId;
    const today = new Date().toISOString().split('T')[0];

    // Check existing assignment
    const { data: existing } = await fastify.supabase
      .from('daily_prompt_assignments')
      .select('prompt_id, prompts(*)')
      .eq('user_id', userId)
      .eq('assigned_date', today)
      .single();

    if (existing) {
      const hasResponded = await fastify.supabase
        .from('responses')
        .select('id')
        .eq('user_id', userId)
        .eq('prompt_id', existing.prompt_id)
        .single()
        .then(({ data }) => !!data);

      return {
        data: {
          prompt: existing.prompts,
          date: today,
          user_has_responded: hasResponded,
        },
        error: null,
      };
    }

    // Assign a new prompt
    const { data: prompt, error } = await fastify.supabase
      .from('prompts')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .order('created_at', { ascending: false })
      // CLAUDE_REVIEW: replace with random/weighted selection in Phase 2
      .single();

    if (error || !prompt) return reply.notFound('No prompts available');

    await fastify.supabase
      .from('daily_prompt_assignments')
      .insert({ user_id: userId, prompt_id: prompt.id, assigned_date: today });

    return {
      data: { prompt, date: today, user_has_responded: false },
      error: null,
    };
  });
}
