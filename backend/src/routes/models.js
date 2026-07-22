import { mapModel, likePattern } from '../lib/mappers.js';

export async function modelRoutes(fastify) {
  const { db } = fastify;

  fastify.get('/', async (request) => {
    const { family, featured, q, maxVram, limit = '50', offset = '0' } = request.query;
    const clauses = [];
    const params = [];

    if (family) {
      clauses.push('family = ?');
      params.push(family);
    }
    if (featured === 'true' || featured === '1') {
      clauses.push('featured = 1');
    }
    if (maxVram) {
      clauses.push('(min_vram_gb IS NULL OR min_vram_gb <= ?)');
      params.push(Number(maxVram));
    }
    if (q) {
      clauses.push(
        `(lower(name) LIKE ? OR lower(description) LIKE ? OR lower(tags) LIKE ? OR lower(family) LIKE ? OR lower(use_cases) LIKE ?)`
      );
      const pattern = likePattern(q);
      params.push(pattern, pattern, pattern, pattern, pattern);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const take = Math.min(Number(limit) || 50, 100);
    const skip = Math.max(Number(offset) || 0, 0);

    const total = db.prepare(`SELECT COUNT(*) AS count FROM models ${where}`).get(...params).count;
    const rows = db
      .prepare(
        `SELECT * FROM models ${where}
         ORDER BY featured DESC, name ASC
         LIMIT ? OFFSET ?`
      )
      .all(...params, take, skip);

    const families = db
      .prepare('SELECT family, COUNT(*) AS count FROM models GROUP BY family ORDER BY family')
      .all();

    return {
      items: rows.map(mapModel),
      total,
      limit: take,
      offset: skip,
      facets: { families },
    };
  });

  fastify.get('/:slug', async (request, reply) => {
    const row = db.prepare('SELECT * FROM models WHERE slug = ?').get(request.params.slug);
    if (!row) {
      return reply.code(404).send({ error: 'Model not found' });
    }
    return { item: mapModel(row) };
  });
}
