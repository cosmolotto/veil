import { FastifyInstance } from 'fastify';
import { decryptText, encryptText } from '../services/cryptoService';
import {
  deriveGhostResonanceType,
  extractPrimaryEmotion,
  getGhostReply,
  getGhostStatus,
  randomGhostDelayMs,
  scoreGhostResonance,
} from '../services/ghostService';

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

type ConnectionRow = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  resonance_type: ResonanceType;
  depth_score: number;
  state: string;
  created_at: string;
  ghost_user_messages?: number | null;
  ghost_reply_scheduled_at?: string | null;
  ghost_last_auto_reply_at?: string | null;
  ghost_has_withdrawn?: boolean | null;
};

async function getGhostUserForConnection(fastify: FastifyInstance, connection: Pick<ConnectionRow, 'user_a_id' | 'user_b_id'>) {
  const { data } = await fastify.supabase
    .from('users')
    .select('id, alias, is_ghost')
    .in('id', [connection.user_a_id, connection.user_b_id])
    .eq('is_ghost', true)
    .maybeSingle();

  return data;
}

async function materializeGhostReply(fastify: FastifyInstance, connection: ConnectionRow) {
  if (!connection.ghost_reply_scheduled_at || connection.ghost_has_withdrawn) return;
  if (new Date(connection.ghost_reply_scheduled_at).getTime() > Date.now()) return;

  const ghostUser = await getGhostUserForConnection(fastify, connection);
  if (!ghostUser?.id) return;

  const { count } = await fastify.supabase
    .from('thread_messages')
    .select('*', { count: 'exact', head: true })
    .eq('connection_id', connection.id)
    .eq('sender_id', ghostUser.id);

  if ((count || 0) > 0 && connection.ghost_last_auto_reply_at) return;

  await fastify.supabase.from('thread_messages').insert({
    connection_id: connection.id,
    sender_id: ghostUser.id,
    body: encryptText(getGhostReply(Number(connection.ghost_user_messages || 0))),
  });

  await fastify.supabase
    .from('connections')
    .update({
      ghost_last_auto_reply_at: new Date().toISOString(),
      ghost_reply_scheduled_at: null,
      depth_score: Math.min(100, Number(connection.depth_score || 0) + 6),
    })
    .eq('id', connection.id);
}

export async function connectionRoutes(fastify: FastifyInstance) {
  fastify.get('/resonance', async (request, reply) => {
    const userId = request.userId;
    const [{ data: user }, { data: realMatches, error }, { count: realUserCount }, { data: ghosts }] = await Promise.all([
      fastify.supabase
        .from('users')
        .select('is_plus, plus_trial_ends_at, soul_map_vector, soul_map_metadata')
        .eq('id', userId)
        .single(),
      fastify.supabase.rpc('find_resonance_matches', {
        target_user_id: userId,
        match_limit: 8,
      }),
      fastify.supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_ghost', false),
      fastify.supabase
        .from('users')
        .select('id, alias, soul_map_vector, soul_map_metadata')
        .eq('is_ghost', true)
        .limit(8),
    ]);

    if (error) return reply.internalServerError(error.message);

    const isPlus = hasPlusAccess(user);
    const realCandidates = (realMatches || []).map((item: { user_id: string; score: number; resonance_type: ResonanceType }) => ({
      partner_user_id: item.user_id,
      partner_alias: anonymousAlias(item.user_id),
      score: Math.max(0, Math.min(1, item.score ?? 0)),
      resonance_type: item.resonance_type,
      is_ghost: false,
    }));

    if ((realUserCount || 0) >= 100 || !ghosts?.length) {
      return { data: realCandidates.slice(0, isPlus ? 8 : 3), error: null };
    }

    const ghostCandidates = ghosts
      .map((ghost) => {
        const score = scoreGhostResonance(
          user?.soul_map_vector,
          ghost.soul_map_vector,
          extractPrimaryEmotion(user?.soul_map_metadata),
          extractPrimaryEmotion(ghost.soul_map_metadata)
        );
        return {
          partner_user_id: ghost.id,
          partner_alias: ghost.alias,
          score,
          resonance_type: deriveGhostResonanceType(score),
          is_ghost: true,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const mixed: Array<typeof ghostCandidates[number]> = [];
    for (let i = 0; i < ghostCandidates.length; i += 1) {
      mixed.push(ghostCandidates[i]);
      if (realCandidates[i]) mixed.push(realCandidates[i] as typeof ghostCandidates[number]);
    }
    if (realCandidates.length > ghostCandidates.length) {
      mixed.push(...(realCandidates.slice(ghostCandidates.length) as Array<typeof ghostCandidates[number]>));
    }

    return { data: mixed.slice(0, isPlus ? 8 : 6), error: null };
  });

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

    if (partner_user_id === userId) return reply.badRequest('Cannot connect to self');

    const [{ data: existing }, { data: partner }] = await Promise.all([
      fastify.supabase
        .from('connections')
        .select('id')
        .or(`and(user_a_id.eq.${userId},user_b_id.eq.${partner_user_id}),and(user_a_id.eq.${partner_user_id},user_b_id.eq.${userId})`)
        .maybeSingle(),
      fastify.supabase
        .from('users')
        .select('id, is_ghost')
        .eq('id', partner_user_id)
        .maybeSingle(),
    ]);

    if (existing) return reply.conflict('Connection already exists');

    const { data, error } = await fastify.supabase
      .from('connections')
      .insert({
        user_a_id: userId,
        user_b_id: partner_user_id,
        resonance_type,
        state: partner?.is_ghost ? 'veiled' : 'proposed',
        depth_score: partner?.is_ghost ? 28 : 0,
      })
      .select('*')
      .single();

    if (error) return reply.internalServerError(error.message);
    return { data, error: null };
  });

  fastify.get('/mine', async (request, reply) => {
    const userId = request.userId;
    const { data, error } = await fastify.supabase
      .from('connections')
      .select('*')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) return reply.internalServerError(error.message);

    const partnerIds = (data || []).map((connection: ConnectionRow) => (
      connection.user_a_id === userId ? connection.user_b_id : connection.user_a_id
    ));

    const { data: partners } = await fastify.supabase
      .from('users')
      .select('id, alias, is_ghost')
      .in('id', partnerIds.length ? partnerIds : ['00000000-0000-0000-0000-000000000000']);

    const partnerMap = new Map((partners || []).map((partner: { id: string; alias: string; is_ghost?: boolean }) => [partner.id, partner]));

    const normalized = (data || []).map((connection: ConnectionRow) => {
      const partnerId = connection.user_a_id === userId ? connection.user_b_id : connection.user_a_id;
      const partner = partnerMap.get(partnerId);
      const isGhost = Boolean(partner?.is_ghost);
      return {
        id: connection.id,
        resonance_type: connection.resonance_type,
        depth_score: Number(connection.depth_score || 0),
        state: connection.state,
        created_at: connection.created_at,
        partner_alias: isGhost ? partner?.alias : connection.state === 'unveiled' ? anonymousAlias(partnerId) : undefined,
        partner_user_id: partnerId,
        is_ghost: isGhost,
        ghost_status: getGhostStatus(Boolean(connection.ghost_has_withdrawn)),
      };
    });

    return { data: normalized, error: null };
  });

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
    if (connection.user_a_id !== userId && connection.user_b_id !== userId) return reply.forbidden('Not a member');
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
    if (connection.user_a_id !== userId && connection.user_b_id !== userId) return reply.forbidden('Not a member');

    const { data, error } = await fastify.supabase
      .from('connections')
      .update({
        state: accept ? 'unveiled' : 'anonymous_forever',
        depth_score: accept ? 100 : Number(connection.depth_score || 0),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return reply.internalServerError(error.message);
    return { data, error: null };
  });

  fastify.get<{ Params: { id: string } }>('/:id/thread', async (request, reply) => {
    const userId = request.userId;
    const { id } = request.params;

    const { data: connection } = await fastify.supabase
      .from('connections')
      .select('id, user_a_id, user_b_id, depth_score, ghost_user_messages, ghost_reply_scheduled_at, ghost_last_auto_reply_at, ghost_has_withdrawn, state, created_at, resonance_type')
      .eq('id', id)
      .single<ConnectionRow>();

    if (!connection) return reply.notFound('Connection not found');
    if (connection.user_a_id !== userId && connection.user_b_id !== userId) return reply.forbidden('Not a member');

    await materializeGhostReply(fastify, connection);

    const { data, error } = await fastify.supabase
      .from('thread_messages')
      .select('id, sender_id, body, created_at')
      .eq('connection_id', id)
      .order('created_at', { ascending: true })
      .limit(200);

    if (error) return reply.internalServerError(error.message);

    return {
      data: {
        messages: (data || []).map((message: { id: string; sender_id: string; body: string; created_at: string }) => ({
          ...message,
          body: decryptText(message.body),
          is_mine: message.sender_id === userId,
        })),
        ghost_status: getGhostStatus(Boolean(connection.ghost_has_withdrawn)),
      },
      error: null,
    };
  });

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
      .select('id, user_a_id, user_b_id, state, depth_score, ghost_user_messages, ghost_has_withdrawn')
      .eq('id', id)
      .single<ConnectionRow>();

    if (!connection) return reply.notFound('Connection not found');
    if (connection.user_a_id !== userId && connection.user_b_id !== userId) return reply.forbidden('Not a member');
    if (connection.ghost_has_withdrawn) return reply.conflict('This soul has stepped back into silence.');
    if (!['accepted', 'veiled', 'unveil_pending', 'unveiled', 'anonymous_forever'].includes(connection.state)) {
      return reply.forbidden('Connection is not active');
    }

    const ghostUser = await getGhostUserForConnection(fastify, connection);

    const { data, error } = await fastify.supabase
      .from('thread_messages')
      .insert({
        connection_id: id,
        sender_id: userId,
        body: encryptText(body),
      })
      .select('id, sender_id, body, created_at')
      .single();

    if (error) return reply.internalServerError(error.message);

    const updates: Record<string, unknown> = {
      depth_score: Math.min(100, Number(connection.depth_score || 0) + 2),
    };

    if (ghostUser?.id && ghostUser.id !== userId) {
      const nextGhostMessages = Number(connection.ghost_user_messages || 0) + 1;
      updates.ghost_user_messages = nextGhostMessages;

      if (nextGhostMessages >= 2) {
        updates.ghost_has_withdrawn = true;
        updates.ghost_reply_scheduled_at = null;
      } else {
        updates.ghost_has_withdrawn = false;
        updates.ghost_last_auto_reply_at = null;
        updates.ghost_reply_scheduled_at = new Date(Date.now() + randomGhostDelayMs()).toISOString();
      }
    }

    await fastify.supabase.from('connections').update(updates).eq('id', id);

    return {
      data: data ? { ...data, body: decryptText(data.body) } : null,
      error: null,
    };
  });
}
