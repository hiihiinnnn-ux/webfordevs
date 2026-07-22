import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { serializeTool, serializeModel, serializeGuide } from '../db/serialize.js';

export const bookmarksRouter = Router();

// Everything here requires a logged-in developer.
bookmarksRouter.use(requireAuth);

const createSchema = z.object({
  itemType: z.enum(['tool', 'model', 'guide']),
  itemId: z.coerce.number().int().positive(),
});

const TABLE_BY_TYPE = { tool: 'tools', model: 'models', guide: 'guides' };

function hydrate(bookmark) {
  const table = TABLE_BY_TYPE[bookmark.item_type];
  const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(bookmark.item_id);
  let item = null;
  if (bookmark.item_type === 'tool') item = serializeTool(row);
  else if (bookmark.item_type === 'model') item = serializeModel(row);
  else if (bookmark.item_type === 'guide') item = serializeGuide(row);
  return {
    id: bookmark.id,
    itemType: bookmark.item_type,
    itemId: bookmark.item_id,
    createdAt: bookmark.created_at,
    item,
  };
}

bookmarksRouter.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  res.json({ data: rows.map(hydrate).filter((b) => b.item) });
});

bookmarksRouter.post('/', validate(createSchema), (req, res) => {
  const { itemType, itemId } = req.body;

  const table = TABLE_BY_TYPE[itemType];
  const exists = db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(itemId);
  if (!exists) return res.status(404).json({ error: `That ${itemType} does not exist.` });

  try {
    const result = db
      .prepare('INSERT INTO bookmarks (user_id, item_type, item_id) VALUES (?, ?, ?)')
      .run(req.user.id, itemType, itemId);
    const row = db.prepare('SELECT * FROM bookmarks WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ data: hydrate(row) });
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Already bookmarked.' });
    }
    throw err;
  }
});

bookmarksRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const result = db
    .prepare('DELETE FROM bookmarks WHERE id = ? AND user_id = ?')
    .run(id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Bookmark not found.' });
  res.status(204).end();
});
