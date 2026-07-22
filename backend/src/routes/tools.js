import { mapTool, likePattern } from '../lib/mappers.js';

export async function toolRoutes(fastify) {
  const { db } = fastify;

  fastify.get('/', async (request) => {
    const { category, difficulty, featured, q, limit = '50', offset = '0' } = request.query;
    const clauses = [];
    const params = [];

    if (category) {
      clauses.push('category = ?');
      params.push(category);
    }
    if (difficulty) {
      clauses.push('difficulty = ?');
      params.push(difficulty);
    }
    if (featured === 'true' || featured === '1') {
      clauses.push('featured = 1');
    }
    if (q) {
      clauses.push(
        `(lower(name) LIKE ? OR lower(description) LIKE ? OR lower(tags) LIKE ? OR lower(category) LIKE ?)`
      );
      const pattern = likePattern(q);
      params.push(pattern, pattern, pattern, pattern);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const take = Math.min(Number(limit) || 50, 100);
    const skip = Math.max(Number(offset) || 0, 0);

    const total = db.prepare(`SELECT COUNT(*) AS count FROM tools ${where}`).get(...params).count;
    const rows = db
      .prepare(
        `SELECT * FROM tools ${where}
         ORDER BY featured DESC, name ASC
         LIMIT ? OFFSET ?`
      )
      .all(...params, take, skip);

    const categories = db
      .prepare('SELECT category, COUNT(*) AS count FROM tools GROUP BY category ORDER BY category')
      .all();

    return {
      items: rows.map(mapTool),
      total,
      limit: take,
      offset: skip,
      facets: { categories },
    };
  });

  fastify.get('/:slug', async (request, reply) => {
    const row = db.prepare('SELECT * FROM tools WHERE slug = ?').get(request.params.slug);
    if (!row) {
      return reply.code(404).send({ error: 'Tool not found' });
    }
    return { item: mapTool(row) };
  });
}
