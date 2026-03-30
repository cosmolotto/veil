import fp from 'fastify-plugin';
import OpenAI from 'openai';

declare module 'fastify' {
  interface FastifyInstance {
    openai: OpenAI;
  }
}

export const openaiPlugin = fp(async (fastify) => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  fastify.decorate('openai', client);
});
