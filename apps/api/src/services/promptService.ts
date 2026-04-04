import { FastifyInstance } from 'fastify';

export async function getTodayPromptForUser(
  _fastify: FastifyInstance,
  _userId: string
): Promise<void> {
  // CLAUDE_REVIEW: Route currently owns query flow; move query logic here in Phase 2.
}
