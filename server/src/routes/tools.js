import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { validate } from '../middleware/validate.js';
import { serializeTool } from '../db/serialize.js';

export const toolsRouter = Router();

const listQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(50).optional(),
  platform: z.string().trim().max(50).optional(),
  sort: z.enum(['stars', 'name', 'newest']).optional().default('stars'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
});

const SORT_SQL = {
  stars: 'stars DESC, name ASC',
  name: 'name ASC',
  newest: 'created_at DESC, id DESC',
};

toolsRouter.get('/', validate(listQuerySchema, 'query'), (req, res) => {
  const { q, category, platform, sort, page, limit } = req.query;
  const where = [];
  const params = {};

  if (q) {
    where.push('(name LIKE @q OR tagline LIKE @q OR description LIKE @q OR tags LIKE @q)');
    params.q = `%${q}%`;
  }
  if (category) {
    where.push('category = @category');
    params.category = category;
  }
  if (platform) {
    where.push('platforms LIKE @platform');
    params.platform = `%${platform}%`;
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = db.prepare(`SELECT COUNT(*) AS n FROM tools ${whereSql}`).get(params).n;
  const offset = (page - 1) * limit;

  const rows = db
    .prepare(
      `SELECT * FROM tools ${whereSql} ORDER BY ${SORT_SQL[sort]} LIMIT @limit OFFSET @offset`,
    )
    .all({ ...params, limit, offset });

  res.json({
    data: rows.map(serializeTool),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

toolsRouter.get('/categories', (_req, res) => {
  const rows = db
    .prepare('SELECT category, COUNT(*) AS count FROM tools GROUP BY category ORDER BY count DESC')
    .all();
  res.json({ data: rows });
});

toolsRouter.get('/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM tools WHERE slug = ?').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Tool not found.' });
  res.json({ data: serializeTool(row) });
});
