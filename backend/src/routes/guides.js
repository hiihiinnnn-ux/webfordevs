import { mapGuide, likePattern } from '../lib/mappers.js';

export async function guideRoutes(fastify) {
  const { db } = fastify;

  fastify.get('/', async (request) => {
    const { level, q, limit = '50', offset = '0' } = request.query;
    const clauses = ['published = 1'];
    const params = [];

    if (level) {
      clauses.push('level = ?');
      params.push(level);
    }
    if (q) {
      clauses.push(
        `(lower(title) LIKE ? OR lower(summary) LIKE ? OR lower(tags) LIKE ? OR lower(body) LIKE ?)`
      );
      const pattern = likePattern(q);
      params.push(pattern, pattern, pattern, pattern);
    }

    const where = `WHERE ${clauses.join(' AND ')}`;
    const take = Math.min(Number(limit) || 50, 100);
    const skip = Math.max(Number(offset) || 0, 0);

    const total = db.prepare(`SELECT COUNT(*) AS count FROM guides ${where}`).get(...params).count;
    const rows = db
      .prepare(
        `SELECT * FROM guides ${where}
         ORDER BY created_at ASC
         LIMIT ? OFFSET ?`
      )
      .all(...params, take, skip);

    return {
      items: rows.map(mapGuide),
      total,
      limit: take,
      offset: skip,
    };
  });

  fastify.get('/:slug', async (request, reply) => {
    const row = db
      .prepare('SELECT * FROM guides WHERE slug = ? AND published = 1')
      .get(request.params.slug);
    if (!row) {
      return reply.code(404).send({ error: 'Guide not found' });
    }
    return { item: mapGuide(row) };
  });
}
