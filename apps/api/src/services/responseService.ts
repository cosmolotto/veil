import { FastifyInstance } from 'fastify';

export async function submitResponseForUser(
  _fastify: FastifyInstance,
  _userId: string
): Promise<void> {
  // CLAUDE_REVIEW: Route currently owns mutation flow; move insert logic here in Phase 2.
}
