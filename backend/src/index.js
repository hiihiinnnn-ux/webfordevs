import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb, createDb } from './db/index.js';
import { authRoutes } from './routes/auth.js';
import { toolRoutes } from './routes/tools.js';
import { modelRoutes } from './routes/models.js';
import { guideRoutes } from './routes/guides.js';
import { searchRoutes } from './routes/search.js';
import { bookmarkRoutes } from './routes/bookmarks.js';
import { statsRoutes, userRoutes } from './routes/stats.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function buildApp(options = {}) {
  const app = Fastify({
    logger: options.logger ?? true,
  });

  const dataDir = path.join(__dirname, '../data');
  fs.mkdirSync(dataDir, { recursive: true });

  const db = options.db || getDb();
  app.decorate('db', db);

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'loci-dev-secret-change-me',
  });

  app.decorate('authenticate', async function authenticate(request, reply) {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    const status = error.statusCode || 500;
    reply.code(status).send({
      error: status >= 500 ? 'Internal server error' : error.message,
    });
  });

  app.get('/api/health', async () => ({
    ok: true,
    service: 'loci-api',
    time: new Date().toISOString(),
  }));

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(toolRoutes, { prefix: '/api/tools' });
  await app.register(modelRoutes, { prefix: '/api/models' });
  await app.register(guideRoutes, { prefix: '/api/guides' });
  await app.register(searchRoutes, { prefix: '/api/search' });
  await app.register(bookmarkRoutes, { prefix: '/api/bookmarks' });
  await app.register(statsRoutes, { prefix: '/api/stats' });
  await app.register(userRoutes, { prefix: '/api/users' });

  return app;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const port = Number(process.env.PORT) || 4000;
  const host = process.env.HOST || '0.0.0.0';

  // Ensure DB exists / migrated; seed if empty
  const db = getDb();
  const toolCount = db.prepare('SELECT COUNT(*) AS count FROM tools').get().count;
  if (toolCount === 0) {
    const { spawnSync } = await import('node:child_process');
    spawnSync(process.execPath, [path.join(__dirname, 'db/seed.js')], {
      stdio: 'inherit',
      env: process.env,
    });
  }

  const app = await buildApp({ db });
  try {
    await app.listen({ port, host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

export { createDb };
