import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { validate } from '../middleware/validate.js';
import { serializeModel } from '../db/serialize.js';

export const modelsRouter = Router();

const listQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  modality: z.string().trim().max(30).optional(),
  family: z.string().trim().max(50).optional(),
  publisher: z.string().trim().max(50).optional(),
  maxRam: z.coerce.number().int().min(1).max(1024).optional(),
  sort: z.enum(['downloads', 'name', 'newest', 'ram']).optional().default('downloads'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
});

const SORT_SQL = {
  downloads: 'downloads DESC, name ASC',
  name: 'name ASC',
  newest: 'created_at DESC, id DESC',
  ram: 'min_ram_gb ASC, name ASC',
};

modelsRouter.get('/', validate(listQuerySchema, 'query'), (req, res) => {
  const { q, modality, family, publisher, maxRam, sort, page, limit } = req.query;
  const where = [];
  const params = {};

  if (q) {
    where.push('(name LIKE @q OR description LIKE @q OR family LIKE @q OR tags LIKE @q)');
    params.q = `%${q}%`;
  }
  if (modality) {
    where.push('modality = @modality');
    params.modality = modality;
  }
  if (family) {
    where.push('family = @family');
    params.family = family;
  }
  if (publisher) {
    where.push('publisher = @publisher');
    params.publisher = publisher;
  }
  if (maxRam) {
    where.push('min_ram_gb <= @maxRam');
    params.maxRam = maxRam;
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = db.prepare(`SELECT COUNT(*) AS n FROM models ${whereSql}`).get(params).n;
  const offset = (page - 1) * limit;

  const rows = db
    .prepare(
      `SELECT * FROM models ${whereSql} ORDER BY ${SORT_SQL[sort]} LIMIT @limit OFFSET @offset`,
    )
    .all({ ...params, limit, offset });

  res.json({
    data: rows.map(serializeModel),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

modelsRouter.get('/facets', (_req, res) => {
  const modalities = db
    .prepare('SELECT modality AS value, COUNT(*) AS count FROM models GROUP BY modality ORDER BY count DESC')
    .all();
  const families = db
    .prepare('SELECT family AS value, COUNT(*) AS count FROM models GROUP BY family ORDER BY count DESC')
    .all();
  res.json({ data: { modalities, families } });
});

modelsRouter.get('/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM models WHERE slug = ?').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Model not found.' });
  res.json({ data: serializeModel(row) });
});
