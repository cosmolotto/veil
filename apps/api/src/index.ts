import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import 'dotenv/config';

import { supabasePlugin } from './plugins/supabase';
import { openaiPlugin } from './plugins/openai';
import { authPlugin } from './plugins/auth';

import { promptRoutes } from './routes/prompts';
import { responseRoutes } from './routes/responses';
import { userRoutes } from './routes/users';
import { soulMapRoutes } from './routes/soulmap';

const app = Fastify({ logger: true });

app.register(cors, { origin: true });
app.register(sensible);
app.register(supabasePlugin);
app.register(openaiPlugin);
app.register(authPlugin);

app.register(promptRoutes, { prefix: '/api/prompts' });
app.register(responseRoutes, { prefix: '/api/responses' });
app.register(userRoutes, { prefix: '/api/users' });
app.register(soulMapRoutes, { prefix: '/api/soul-map' });

app.get('/health', async () => ({ status: 'ok', version: '1.0.0' }));

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
