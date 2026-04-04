import { FastifyInstance } from 'fastify';

type ResonanceType = 'mirror' | 'contrast' | 'echo';

function anonymousAlias(id: string): string {
  return `Soul-${id.slice(0, 6)}`;
}

function hasPlusAccess(user: { is_plus?: boolean | null; plus_trial_ends_at?: string | null } | null): boolean {
  if (!user) return false;
  if (user.is_plus) return true;
  if (!user.plus_trial_ends_at) return false;
  return new Date(user.plus_trial_ends_at).getTime() > Date.now();
}

export async function connectionRoutes(fastify: FastifyInstance) {
  // GET /api/connections/resonance
  fastify.get('/resonance', async (request, reply) => {
    const userId = request.userId;
    const { data: user } = await fastify.supabase
      .from('users')
      .select('is_plus, plus_trial_ends_at')
      .eq('id', userId)
      .single();
    const isPlus = hasPlusAccess(user);

    const { data, error } = await fastify.supabase.rpc('find_resonance_matches', {
      target_user_id: userId,
      match_limit: isPlus ? 8 : 3,
    });

    if (error) {
      return reply.internalServerError(error.message);
    }

    const candidates = (data || []).map((item: { user_id: string; score: number; resonance_type: ResonanceType }) => ({
      partner_user_id: item.user_id,
      partner_alias: anonymousAlias(item.user_id),
      score: Math.max(0, Math.min(1, item.score ?? 0)),
      resonance_type: item.resonance_type,
    }));

    return { data: candidates, error: null };
  });

  // POST /api/connections/propose
  fastify.post<{
    Body: { partner_user_id: string; resonance_type: ResonanceType }
  }>('/propose', {
    schema: {
      body: {
        type: 'object',
        required: ['partner_user_id', 'resonance_type'],
        properties: {
          partner_user_id: { type: 'string', format: 'uuid' },
          resonance_type: { type: 'string', enum: ['mirror', 'contrast', 'echo'] },
        },
      },
    },
  }, async (request, reply) => {
    const userId = request.userId;
    const { partner_user_id, resonance_type } = request.body;

    if (partner_user_id === userId) {
      return reply.badRequest('Cannot connect to self');
    }

    const { data: existing } = await fastify.supabase
      .from('connections')
      .select('id')
      .or(`and(user_a_id.eq.${userId},user_b_id.eq.${partner_user_id}),and(user_a_id.eq.${partner_user_id},user_b_id.eq.${userId})`)
      .maybeSingle();

    if (existing) {
      return reply.conflict('Connection already exists');
    }

    const { data, error } = await fastify.supabase
      .from('connections')
      .insert({
        user_a_id: userId,
        user_b_id: partner_user_id,
        resonance_type,
        state: 'proposed',
      })
      .select('*')
      .single();

    if (error) return reply.internalServerError(error.message);
    return { data, error: null };
  });

  // GET /api/connections/mine
  fastify.get('/mine', async (request, reply) => {
    const userId = request.userId;
    const { data, error } = await fastify.supabase
      .from('connections')
      .select('*')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) return reply.internalServerError(error.message);

    const normalized = (data || []).map((connection: {
      id: string;
      user_a_id: string;
      user_b_id: string;
      resonance_type: ResonanceType;
      depth_score: number;
      state: string;
      created_at: string;
    }) => {
      const partnerId = connection.user_a_id === userId ? connection.user_b_id : connection.user_a_id;
      const unveiled = connection.state === 'unveiled';
      return {
        id: connection.id,
        resonance_type: connection.resonance_type,
        depth_score: Number(connection.depth_score || 0),
        state: connection.state,
        created_at: connection.created_at,
        partner_alias: unveiled ? anonymousAlias(partnerId) : undefined,
        partner_user_id: partnerId,
      };
    });

    return { data: normalized, error: null };
  });

  // POST /api/connections/:id/accept
  fastify.post<{ Params: { id: string } }>('/:id/accept', async (request, reply) => {
    const userId = request.userId;
    const { id } = request.params;

    const { data: connection, error: findError } = await fastify.supabase
      .from('connections')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !connection) return reply.notFound('Connection not found');
    if (connection.user_b_id !== userId) return reply.forbidden('Only receiver can accept');

    const { data, error } = await fastify.supabase
      .from('connections')
      .update({ state: 'veiled', depth_score: 20 })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return reply.internalServerError(error.message);
    return { data, error: null };
  });

  // POST /api/connections/:id/unveil/request
  fastify.post<{ Params: { id: string } }>('/:id/unveil/request', async (request, reply) => {
    const userId = request.userId;
    const { id } = request.params;
    const { data: user } = await fastify.supabase
      .from('users')
      .select('is_plus, plus_trial_ends_at')
      .eq('id', userId)
      .single();
    const hasAccess = hasPlusAccess(user);

    const { data: connection, error: findError } = await fastify.supabase
      .from('connections')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !connection) return reply.notFound('Connection not found');
    if (connection.user_a_id !== userId && connection.user_b_id !== userId) {
      return reply.forbidden('Not a member');
    }
    if (!hasAccess && Number(connection.depth_score || 0) < 90) {
      return reply.forbidden('VEIL+ required for early unveil requests (before depth 90)');
    }

    const { data, error } = await fastify.supabase
      .from('connections')
      .update({ state: 'unveil_pending', depth_score: Math.max(Number(connection.depth_score || 0), 60) })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return reply.internalServerError(error.message);
    return { data, error: null };
  });

  // POST /api/connections/:id/unveil/respond
  fastify.post<{
    Params: { id: string };
    Body: { accept: boolean };
  }>('/:id/unveil/respond', async (request, reply) => {
    const userId = request.userId;
    const { id } = request.params;
    const { accept } = request.body;

    const { data: connection, error: findError } = await fastify.supabase
      .from('connections')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !connection) return reply.notFound('Connection not found');
    if (connection.user_a_id !== userId && connection.user_b_id !== userId) {
      return reply.forbidden('Not a member');
    }

    const nextState = accept ? 'unveiled' : 'anonymous_forever';
    const nextDepth = accept ? 100 : Number(connection.depth_score || 0);

    const { data, error } = await fastify.supabase
      .from('connections')
      .update({ state: nextState, depth_score: nextDepth })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return reply.internalServerError(error.message);
    return { data, error: null };
  });

  // GET /api/connections/:id/thread
  fastify.get<{ Params: { id: string } }>('/:id/thread', async (request, reply) => {
    const userId = request.userId;
    const { id } = request.params;

    const { data: connection } = await fastify.supabase
      .from('connections')
      .select('id, user_a_id, user_b_id')
      .eq('id', id)
      .single();

    if (!connection) return reply.notFound('Connection not found');
    if (connection.user_a_id !== userId && connection.user_b_id !== userId) {
      return reply.forbidden('Not a member');
    }

    const { data, error } = await fastify.supabase
      .from('thread_messages')
      .select('id, sender_id, body, created_at')
      .eq('connection_id', id)
      .order('created_at', { ascending: true })
      .limit(200);

    if (error) return reply.internalServerError(error.message);

    return {
      data: (data || []).map((message: { id: string; sender_id: string; body: string; created_at: string }) => ({
        ...message,
        is_mine: message.sender_id === userId,
      })),
      error: null,
    };
  });

  // POST /api/connections/:id/thread
  fastify.post<{
    Params: { id: string };
    Body: { body: string };
  }>('/:id/thread', {
    schema: {
      body: {
        type: 'object',
        required: ['body'],
        properties: {
          body: { type: 'string', minLength: 1, maxLength: 1000 },
        },
      },
    },
  }, async (request, reply) => {
    const userId = request.userId;
    const { id } = request.params;
    const { body } = request.body;

    const { data: connection } = await fastify.supabase
      .from('connections')
      .select('id, user_a_id, user_b_id, state, depth_score')
      .eq('id', id)
      .single();

    if (!connection) return reply.notFound('Connection not found');
    if (connection.user_a_id !== userId && connection.user_b_id !== userId) {
      return reply.forbidden('Not a member');
    }
    if (!['accepted', 'veiled', 'unveil_pending', 'unveiled', 'anonymous_forever'].includes(connection.state)) {
      return reply.forbidden('Connection is not active');
    }

    const { data, error } = await fastify.supabase
      .from('thread_messages')
      .insert({
        connection_id: id,
        sender_id: userId,
        body,
      })
      .select('id, sender_id, body, created_at')
      .single();

    if (error) return reply.internalServerError(error.message);

    // Gradually increase depth as people converse
    await fastify.supabase
      .from('connections')
      .update({ depth_score: Math.min(100, Number(connection.depth_score || 0) + 2) })
      .eq('id', id);

    return { data, error: null };
  });
}
