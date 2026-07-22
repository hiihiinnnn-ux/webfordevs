import { mapTool, mapModel, mapGuide, mapUser } from '../lib/mappers.js';

export async function statsRoutes(fastify) {
  const { db } = fastify;

  fastify.get('/overview', async () => {
    const tools = db.prepare('SELECT COUNT(*) AS count FROM tools').get().count;
    const models = db.prepare('SELECT COUNT(*) AS count FROM models').get().count;
    const guides = db.prepare('SELECT COUNT(*) AS count FROM guides WHERE published = 1').get().count;
    const users = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;

    const featuredTools = db
      .prepare('SELECT * FROM tools WHERE featured = 1 ORDER BY name LIMIT 6')
      .all()
      .map(mapTool);
    const featuredModels = db
      .prepare('SELECT * FROM models WHERE featured = 1 ORDER BY name LIMIT 6')
      .all()
      .map(mapModel);
    const starterGuides = db
      .prepare(
        `SELECT * FROM guides WHERE published = 1 AND level = 'intro' ORDER BY created_at ASC LIMIT 4`
      )
      .all()
      .map(mapGuide);

    return {
      counts: { tools, models, guides, users },
      featuredTools,
      featuredModels,
      starterGuides,
    };
  });
}

export async function userRoutes(fastify) {
  const { db } = fastify;

  fastify.get('/:username', async (request, reply) => {
    const row = db
      .prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE')
      .get(request.params.username);
    if (!row) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const bookmarkCount = db
      .prepare('SELECT COUNT(*) AS count FROM bookmarks WHERE user_id = ?')
      .get(row.id).count;

    return {
      user: mapUser(row),
      stats: { bookmarkCount },
    };
  });
}
