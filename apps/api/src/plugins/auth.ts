import fp from 'fastify-plugin';
import { FastifyRequest, FastifyReply } from 'fastify';
import { createClient } from '@supabase/supabase-js';

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}

export const authPlugin = fp(async (fastify) => {
  fastify.decorateRequest('userId', '');

  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.url === '/health') return;
    if (request.url.startsWith('/api/billing/revenuecat/webhook')) return;

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.unauthorized('Missing auth token');
    }

    const token = authHeader.split(' ')[1];
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return reply.unauthorized('Invalid token');
    }

    request.userId = user.id;
  });
});
