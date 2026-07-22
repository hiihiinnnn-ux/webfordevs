import { z } from 'zod';
import { mapTool, mapModel, mapGuide } from '../lib/mappers.js';

const bookmarkSchema = z.object({
  itemType: z.enum(['tool', 'model', 'guide']),
  itemId: z.number().int().positive(),
});

function resolveItem(db, itemType, itemId) {
  if (itemType === 'tool') {
    return mapTool(db.prepare('SELECT * FROM tools WHERE id = ?').get(itemId));
  }
  if (itemType === 'model') {
    return mapModel(db.prepare('SELECT * FROM models WHERE id = ?').get(itemId));
  }
  if (itemType === 'guide') {
    return mapGuide(db.prepare('SELECT * FROM guides WHERE id = ?').get(itemId));
  }
  return null;
}

export async function bookmarkRoutes(fastify) {
  const { db } = fastify;

  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/', async (request) => {
    const rows = db
      .prepare(
        `SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC`
      )
      .all(request.user.sub);

    const items = rows
      .map((row) => {
        const item = resolveItem(db, row.item_type, row.item_id);
        if (!item) return null;
        return {
          id: row.id,
          itemType: row.item_type,
          itemId: row.item_id,
          createdAt: row.created_at,
          item,
        };
      })
      .filter(Boolean);

    return { items };
  });

  fastify.post('/', async (request, reply) => {
    const parsed = bookmarkSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { itemType, itemId } = parsed.data;
    const item = resolveItem(db, itemType, itemId);
    if (!item) {
      return reply.code(404).send({ error: 'Item not found' });
    }

    try {
      const result = db
        .prepare(
          `INSERT INTO bookmarks (user_id, item_type, item_id) VALUES (?, ?, ?)`
        )
        .run(request.user.sub, itemType, itemId);

      return reply.code(201).send({
        bookmark: {
          id: result.lastInsertRowid,
          itemType,
          itemId,
          item,
        },
      });
    } catch (err) {
      if (String(err.message).includes('UNIQUE')) {
        return reply.code(409).send({ error: 'Already bookmarked' });
      }
      throw err;
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    const result = db
      .prepare('DELETE FROM bookmarks WHERE id = ? AND user_id = ?')
      .run(Number(request.params.id), request.user.sub);

    if (result.changes === 0) {
      return reply.code(404).send({ error: 'Bookmark not found' });
    }
    return reply.code(204).send();
  });

  fastify.delete('/by-item', async (request, reply) => {
    const parsed = bookmarkSchema.safeParse({
      itemType: request.query.itemType,
      itemId: Number(request.query.itemId),
    });
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const result = db
      .prepare('DELETE FROM bookmarks WHERE user_id = ? AND item_type = ? AND item_id = ?')
      .run(request.user.sub, parsed.data.itemType, parsed.data.itemId);

    if (result.changes === 0) {
      return reply.code(404).send({ error: 'Bookmark not found' });
    }
    return reply.code(204).send();
  });
}
