import { FastifyInstance } from 'fastify';
import { decryptText } from '../services/cryptoService';

function generateInviteCode(alias: string): string {
  const seed = alias.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${seed}${rand}`;
}

function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function hasTrialAccess(plusTrialEndsAt?: string | null): boolean {
  if (!plusTrialEndsAt) return false;
  return new Date(plusTrialEndsAt).getTime() > Date.now();
}

export async function userRoutes(fastify: FastifyInstance) {
  // POST /api/users/onboard — creates user profile after signup
  fastify.post<{
    Body: { alias: string; daily_prompt_time?: string; referral_code?: string }
  }>('/onboard', {
    schema: {
      body: {
        type: 'object',
        required: ['alias'],
        properties: {
          alias: { type: 'string', minLength: 2, maxLength: 30, pattern: '^[a-zA-Z0-9_]+$' },
          daily_prompt_time: { type: 'string' },
          referral_code: { type: 'string', minLength: 4, maxLength: 20 },
        },
      },
    },
  }, async (request, reply) => {
    const { alias, daily_prompt_time = '08:00', referral_code } = request.body;
    const userId = request.userId;

    const { data: existing } = await fastify.supabase
      .from('users')
      .select('id')
      .eq('alias', alias)
      .single();

    if (existing) return reply.conflict('Alias already taken');

    const invite_code = generateInviteCode(alias);

    const { data, error } = await fastify.supabase
      .from('users')
      .insert({
        id: userId,
        alias,
        daily_prompt_time,
        invite_code,
        plus_trial_ends_at: addDaysIso(3),
      })
      .select('id, alias, created_at, last_active_at, soul_map_vector, soul_map_metadata, unveil_photo_url, unveil_name, daily_prompt_time, onboarding_complete, is_plus, plus_activated_at, plus_source, plus_trial_ends_at, invite_code, referred_by, streak_days, streak_shields, last_response_date')
      .single();

    if (error) return reply.internalServerError(error.message);

    // Apply referral if provided
    if (referral_code && referral_code.trim()) {
      const { data: referrer } = await fastify.supabase
        .from('users')
        .select('id, plus_trial_ends_at')
        .eq('invite_code', referral_code.trim().toUpperCase())
        .neq('id', userId)
        .maybeSingle();

      if (referrer) {
        await fastify.supabase
          .from('referrals')
          .insert({
            referrer_id: referrer.id,
            referred_user_id: userId,
          });

        await fastify.supabase
          .from('users')
          .update({
            referred_by: referrer.id,
            plus_trial_ends_at: addDaysIso(5),
          })
          .eq('id', userId);

        const refBase = referrer.plus_trial_ends_at ? new Date(referrer.plus_trial_ends_at) : new Date();
        refBase.setDate(refBase.getDate() + 7);

        await fastify.supabase
          .from('users')
          .update({ plus_trial_ends_at: refBase.toISOString() })
          .eq('id', referrer.id);
      }
    }

    const { data: refreshed } = await fastify.supabase
      .from('users')
      .select('id, alias, created_at, last_active_at, soul_map_vector, soul_map_metadata, unveil_photo_url, unveil_name, daily_prompt_time, onboarding_complete, is_plus, plus_activated_at, plus_source, plus_trial_ends_at, invite_code, referred_by, streak_days, streak_shields, last_response_date')
      .eq('id', userId)
      .single();

    return { data: refreshed || data, error: null };
  });

  // PATCH /api/users/me
  fastify.patch<{
    Body: { daily_prompt_time?: string; onboarding_complete?: boolean }
  }>('/me', async (request, reply) => {
    const { data, error } = await fastify.supabase
      .from('users')
      .update({ ...request.body, last_active_at: new Date().toISOString() })
      .eq('id', request.userId)
      .select('id, alias, created_at, last_active_at, soul_map_vector, soul_map_metadata, unveil_photo_url, unveil_name, daily_prompt_time, onboarding_complete, is_plus, plus_activated_at, plus_source, plus_trial_ends_at, invite_code, referred_by, streak_days, streak_shields, last_response_date')
      .single();

    if (error) return reply.internalServerError(error.message);
    return { data, error: null };
  });

  // GET /api/users/me
  fastify.get('/me', async (request, reply) => {
    const { data, error } = await fastify.supabase
      .from('users')
      .select('id, alias, created_at, last_active_at, soul_map_vector, soul_map_metadata, unveil_photo_url, unveil_name, daily_prompt_time, onboarding_complete, is_plus, plus_activated_at, plus_source, plus_trial_ends_at, invite_code, referred_by, streak_days, streak_shields, last_response_date')
      .eq('id', request.userId)
      .single();

    if (error || !data) return reply.notFound('User not found');
    return { data, error: null };
  });

  // GET /api/users/me/export
  fastify.get('/me/export', async (request, reply) => {
    const userId = request.userId;

    const [
      userResult,
      responsesResult,
      snapshotsResult,
      referralsResult,
      connectionsResult,
    ] = await Promise.all([
      fastify.supabase
        .from('users')
        .select('id, alias, created_at, last_active_at, soul_map_metadata, unveil_photo_url, unveil_name, daily_prompt_time, onboarding_complete, is_plus, plus_activated_at, plus_source, plus_trial_ends_at, invite_code, referred_by, streak_days, streak_shields, last_response_date')
        .eq('id', userId)
        .single(),
      fastify.supabase
        .from('responses')
        .select('id, prompt_id, type, created_at, is_shared, emotional_signature, content_encrypted, content_preview')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      fastify.supabase
        .from('soul_snapshots')
        .select('id, snapshot_text, mood_tag, gradient_key, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      fastify.supabase
        .from('referrals')
        .select('id, referrer_id, referred_user_id, created_at')
        .or(`referrer_id.eq.${userId},referred_user_id.eq.${userId}`)
        .order('created_at', { ascending: false }),
      fastify.supabase
        .from('connections')
        .select('id, user_a_id, user_b_id, resonance_type, depth_score, state, created_at')
        .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
        .order('created_at', { ascending: false }),
    ]);

    if (userResult.error || !userResult.data) return reply.notFound('User not found');

    const connectionIds = (connectionsResult.data || []).map((connection) => connection.id);
    let threadMessages: Array<{
      id: string;
      connection_id: string;
      sender_id: string;
      body: string;
      created_at: string;
    }> = [];

    if (connectionIds.length > 0) {
      const { data } = await fastify.supabase
        .from('thread_messages')
        .select('id, connection_id, sender_id, body, created_at')
        .in('connection_id', connectionIds)
        .order('created_at', { ascending: false });

      threadMessages = data || [];
    }

    return {
      data: {
        exported_at: new Date().toISOString(),
        user: userResult.data,
        responses: (responsesResult.data || []).map((item) => ({
          ...item,
          content: decryptText(item.content_encrypted),
        })),
        soul_snapshots: snapshotsResult.data || [],
        referrals: referralsResult.data || [],
        connections: connectionsResult.data || [],
        thread_messages: threadMessages.map((item) => ({
          ...item,
          body: decryptText(item.body),
        })),
      },
      error: null,
    };
  });

  // DELETE /api/users/me
  fastify.delete('/me', async (request, reply) => {
    const userId = request.userId;
    const { error } = await fastify.supabase.auth.admin.deleteUser(userId);
    if (error) return reply.internalServerError(error.message);
    return { data: { deleted: true, user_id: userId }, error: null };
  });

  // GET /api/users/access
  fastify.get('/access', async (request, reply) => {
    const { data, error } = await fastify.supabase
      .from('users')
      .select('is_plus, plus_trial_ends_at')
      .eq('id', request.userId)
      .single();

    if (error || !data) return reply.notFound('User not found');
    return {
      data: {
        has_plus_access: Boolean(data.is_plus) || hasTrialAccess(data.plus_trial_ends_at),
        is_plus: Boolean(data.is_plus),
        plus_trial_ends_at: data.plus_trial_ends_at || null,
      },
      error: null,
    };
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

  // GET /api/users/referral
  fastify.get('/referral', async (request, reply) => {
    const { data: me, error } = await fastify.supabase
      .from('users')
      .select('invite_code, plus_trial_ends_at')
      .eq('id', request.userId)
      .single();

    if (error || !me) return reply.notFound('User not found');

    const { count } = await fastify.supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', request.userId);

    return {
      data: {
        invite_code: me.invite_code,
        successful_invites: count || 0,
        trial_ends_at: me.plus_trial_ends_at,
      },
      error: null,
    };
  });

  // POST /api/users/push-token
  fastify.post<{
    Body: { expo_push_token: string; platform: 'ios' | 'android' | 'web' }
  }>('/push-token', {
    schema: {
      body: {
        type: 'object',
        required: ['expo_push_token', 'platform'],
        properties: {
          expo_push_token: { type: 'string', minLength: 10, maxLength: 255 },
          platform: { type: 'string', enum: ['ios', 'android', 'web'] },
        },
      },
    },
  }, async (request, reply) => {
    const userId = request.userId;
    const { expo_push_token, platform } = request.body;

    const { data, error } = await fastify.supabase
      .from('push_tokens')
      .upsert({
        user_id: userId,
        expo_push_token,
        platform,
      }, { onConflict: 'user_id,expo_push_token' })
      .select('*')
      .single();

    if (error) return reply.internalServerError(error.message);
    return { data, error: null };
  });

  // POST /api/users/plus/activate
  fastify.post<{
    Body: { source?: 'playstore' | 'test_unlock' | 'manual' }
  }>('/plus/activate', async (request, reply) => {
    const source = request.body.source || 'manual';
    const { data, error } = await fastify.supabase
      .from('users')
      .update({
        is_plus: true,
        plus_activated_at: new Date().toISOString(),
        plus_source: source,
      })
      .eq('id', request.userId)
      .select('id, alias, created_at, last_active_at, soul_map_vector, soul_map_metadata, unveil_photo_url, unveil_name, daily_prompt_time, onboarding_complete, is_plus, plus_activated_at, plus_source, plus_trial_ends_at, invite_code, referred_by, streak_days, streak_shields, last_response_date')
      .single();

    if (error) return reply.internalServerError(error.message);
    return { data, error: null };
  });

  // POST /api/users/plus/restore
  fastify.post('/plus/restore', async (request, reply) => {
    const { data, error } = await fastify.supabase
      .from('users')
      .select('id, alias, created_at, last_active_at, soul_map_vector, soul_map_metadata, unveil_photo_url, unveil_name, daily_prompt_time, onboarding_complete, is_plus, plus_activated_at, plus_source, plus_trial_ends_at, invite_code, referred_by, streak_days, streak_shields, last_response_date')
      .eq('id', request.userId)
      .single();

    if (error) return reply.internalServerError(error.message);
    return { data, error: null };
  });
}
