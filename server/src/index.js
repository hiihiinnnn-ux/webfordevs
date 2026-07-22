import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { initSchema } from './db/index.js';
import { runSeed } from './db/seed.js';
import { authRouter } from './routes/auth.js';
import { toolsRouter } from './routes/tools.js';
import { modelsRouter } from './routes/models.js';
import { guidesRouter } from './routes/guides.js';
import { searchRouter } from './routes/search.js';
import { bookmarksRouter } from './routes/bookmarks.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

initSchema();
// Seed reference data on first boot so the site is useful out of the box.
runSeed({ quiet: true });

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / server-to-server (no Origin header) and configured origins.
      if (!origin || config.clientOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 600, standardHeaders: true });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 40, standardHeaders: true });

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'localai-hub', time: new Date().toISOString() });
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/tools', toolsRouter);
app.use('/api/models', modelsRouter);
app.use('/api/guides', guidesRouter);
app.use('/api/search', searchRouter);
app.use('/api/bookmarks', bookmarksRouter);

app.use('/api', notFound);

// In production, serve the built React client (single-origin deployment).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

// Only start listening when run directly (not when imported by tests).
const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  app.listen(config.port, () => {
    console.log(`LocalAI Hub API listening on http://localhost:${config.port}`);
  });
}

export default app;
