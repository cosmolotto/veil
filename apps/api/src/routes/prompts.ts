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
          user_has_responded: !!response,
        },
        error: null,
      };
    }

    // Assign a new prompt — avoid prompts user has already seen
    const { data: seenPrompts } = await fastify.supabase
      .from('daily_prompt_assignments')
      .select('prompt_id')
      .eq('user_id', userId);

    const seenIds = seenPrompts?.map((p: { prompt_id: string }) => p.prompt_id) || [];

    let query = fastify.supabase
      .from('prompts')
      .select('*')
      .eq('is_active', true);

    if (seenIds.length > 0) {
      const escapedIds = seenIds.map((id) => `"${id}"`).join(',');
      query = query.not('id', 'in', `(${escapedIds})`);
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
      error: null,
    };
  });
}
