import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { validate } from '../middleware/validate.js';
import { serializeGuide } from '../db/serialize.js';

export const guidesRouter = Router();

const listQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

guidesRouter.get('/', validate(listQuerySchema, 'query'), (req, res) => {
  const { q, level } = req.query;
  const where = [];
  const params = {};
  if (q) {
    where.push('(title LIKE @q OR summary LIKE @q OR tags LIKE @q)');
    params.q = `%${q}%`;
  }
  if (level) {
    where.push('level = @level');
    params.level = level;
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = db
    .prepare(`SELECT * FROM guides ${whereSql} ORDER BY sort_order ASC, id ASC`)
    .all(params);
  res.json({ data: rows.map((r) => serializeGuide(r)) });
});

guidesRouter.get('/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM guides WHERE slug = ?').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Guide not found.' });
  res.json({ data: serializeGuide(row, { includeBody: true }) });
});
