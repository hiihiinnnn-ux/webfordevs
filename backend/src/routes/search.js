import { mapTool, mapModel, mapGuide, likePattern } from '../lib/mappers.js';

function scoreText(query, ...fields) {
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);
  let score = 0;
  const hay = fields.filter(Boolean).join(' ').toLowerCase();

  if (hay.includes(q)) score += 10;
  for (const token of tokens) {
    if (hay.includes(token)) score += 3;
  }
  for (const field of fields) {
    if (field && String(field).toLowerCase() === q) score += 20;
    if (field && String(field).toLowerCase().startsWith(q)) score += 8;
  }
  return score;
}

export async function searchRoutes(fastify) {
  const { db } = fastify;

  fastify.get('/', async (request, reply) => {
    const q = String(request.query.q || '').trim();
    const type = request.query.type; // tool | model | guide | all
    const limit = Math.min(Number(request.query.limit) || 20, 50);

    if (!q) {
      return reply.code(400).send({ error: 'Query parameter q is required' });
    }

    if (request.headers.authorization) {
      try {
        await request.jwtVerify();
        db.prepare('INSERT INTO search_history (user_id, query) VALUES (?, ?)').run(
          request.user.sub,
          q
        );
      } catch {
        db.prepare('INSERT INTO search_history (user_id, query) VALUES (?, ?)').run(null, q);
      }
    } else {
      db.prepare('INSERT INTO search_history (user_id, query) VALUES (?, ?)').run(null, q);
    }

    const pattern = likePattern(q);
    const results = [];

    const includeTools = !type || type === 'all' || type === 'tool';
    const includeModels = !type || type === 'all' || type === 'model';
    const includeGuides = !type || type === 'all' || type === 'guide';

    if (includeTools) {
      const tools = db
        .prepare(
          `SELECT * FROM tools
           WHERE lower(name) LIKE ? OR lower(description) LIKE ? OR lower(tags) LIKE ?
              OR lower(category) LIKE ? OR lower(long_description) LIKE ?`
        )
        .all(pattern, pattern, pattern, pattern, pattern);

      for (const row of tools) {
        const item = mapTool(row);
        results.push({
          type: 'tool',
          score: scoreText(q, item.name, item.category, item.description, item.tags.join(' ')),
          item,
        });
      }
    }

    if (includeModels) {
      const models = db
        .prepare(
          `SELECT * FROM models
           WHERE lower(name) LIKE ? OR lower(description) LIKE ? OR lower(tags) LIKE ?
              OR lower(family) LIKE ? OR lower(use_cases) LIKE ? OR lower(long_description) LIKE ?`
        )
        .all(pattern, pattern, pattern, pattern, pattern, pattern);

      for (const row of models) {
        const item = mapModel(row);
        results.push({
          type: 'model',
          score: scoreText(q, item.name, item.family, item.description, item.tags.join(' ')),
          item,
        });
      }
    }

    if (includeGuides) {
      const guides = db
        .prepare(
          `SELECT * FROM guides
           WHERE published = 1 AND (
             lower(title) LIKE ? OR lower(summary) LIKE ? OR lower(tags) LIKE ? OR lower(body) LIKE ?
           )`
        )
        .all(pattern, pattern, pattern, pattern);

      for (const row of guides) {
        const item = mapGuide(row);
        results.push({
          type: 'guide',
          score: scoreText(q, item.title, item.summary, item.tags.join(' ')),
          item,
        });
      }
    }

    results.sort((a, b) => b.score - a.score || a.item.name?.localeCompare?.(b.item.name || b.item.title || ''));

    return {
      query: q,
      total: results.length,
      results: results.slice(0, limit),
    };
  });

  fastify.get('/suggest', async (request) => {
    const q = String(request.query.q || '').trim();
    if (!q) {
      return { suggestions: [] };
    }

    const pattern = likePattern(q);
    const tools = db
      .prepare(`SELECT name, slug, 'tool' AS type FROM tools WHERE lower(name) LIKE ? LIMIT 5`)
      .all(pattern);
    const models = db
      .prepare(`SELECT name, slug, 'model' AS type FROM models WHERE lower(name) LIKE ? LIMIT 5`)
      .all(pattern);
    const guides = db
      .prepare(
        `SELECT title AS name, slug, 'guide' AS type FROM guides WHERE published = 1 AND lower(title) LIKE ? LIMIT 5`
      )
      .all(pattern);

    return {
      suggestions: [...tools, ...models, ...guides].slice(0, 10),
    };
  });
}
