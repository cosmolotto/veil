import { FastifyInstance } from 'fastify';

type RevenueCatWebhookEvent = {
  event?: {
    type?: string;
    app_user_id?: string;
    entitlement_ids?: string[];
    product_id?: string;
    purchased_at_ms?: number;
    expiration_at_ms?: number;
  };
};

const PLUS_ENTITLEMENT = process.env.REVENUECAT_PLUS_ENTITLEMENT_ID || 'veil_plus';

function toIso(ms?: number): string | null {
  if (!ms) return null;
  return new Date(ms).toISOString();
}

export async function billingRoutes(fastify: FastifyInstance) {
  // RevenueCat server webhook
  fastify.post<{ Body: RevenueCatWebhookEvent }>('/revenuecat/webhook', async (request, reply) => {
    const expectedSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
    if (expectedSecret) {
      const auth = request.headers.authorization || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
      if (token !== expectedSecret) {
        return reply.unauthorized('Invalid webhook secret');
      }
    }

    const event = request.body?.event;
    if (!event?.app_user_id) {
      return reply.badRequest('Missing app_user_id');
    }

    const isPlusEntitlement = (event.entitlement_ids || []).includes(PLUS_ENTITLEMENT);
    const purchaseEvent = ['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'NON_RENEWING_PURCHASE'].includes(event.type || '');
    const revokeEvent = ['CANCELLATION', 'EXPIRATION', 'BILLING_ISSUE', 'SUBSCRIPTION_PAUSED'].includes(event.type || '');

    if (isPlusEntitlement && purchaseEvent) {
      await fastify.supabase
        .from('users')
        .update({
          is_plus: true,
          plus_activated_at: toIso(event.purchased_at_ms) || new Date().toISOString(),
          plus_source: event.product_id || 'playstore',
        })
        .eq('id', event.app_user_id);
    }

    if (isPlusEntitlement && revokeEvent) {
      const expired = Boolean(event.expiration_at_ms && event.expiration_at_ms < Date.now());
      if (expired || event.type === 'CANCELLATION') {
        await fastify.supabase
          .from('users')
          .update({
            is_plus: false,
          })
          .eq('id', event.app_user_id);
      }
    }

    return { ok: true };
  });
}
