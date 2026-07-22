import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { validate } from '../middleware/validate.js';
import { serializeTool, serializeModel, serializeGuide } from '../db/serialize.js';

export const searchRouter = Router();

const searchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Provide a search query.').max(100),
  type: z.enum(['all', 'tool', 'model', 'guide']).optional().default('all'),
  limit: z.coerce.number().int().min(1).max(25).optional().default(6),
});

// Unified search across tools, models and guides.
searchRouter.get('/', validate(searchQuerySchema, 'query'), (req, res) => {
  const { q, type, limit } = req.query;
  const like = `%${q}%`;
  const result = {};

  if (type === 'all' || type === 'tool') {
    const tools = db
      .prepare(
        `SELECT * FROM tools
         WHERE name LIKE ? OR tagline LIKE ? OR description LIKE ? OR tags LIKE ?
         ORDER BY stars DESC LIMIT ?`,
      )
      .all(like, like, like, like, limit);
    result.tools = tools.map(serializeTool);
  }

  if (type === 'all' || type === 'model') {
    const models = db
      .prepare(
        `SELECT * FROM models
         WHERE name LIKE ? OR description LIKE ? OR family LIKE ? OR tags LIKE ?
         ORDER BY downloads DESC LIMIT ?`,
      )
      .all(like, like, like, like, limit);
    result.models = models.map(serializeModel);
  }

  if (type === 'all' || type === 'guide') {
    const guides = db
      .prepare(
        `SELECT * FROM guides
         WHERE title LIKE ? OR summary LIKE ? OR tags LIKE ?
         ORDER BY sort_order ASC LIMIT ?`,
      )
      .all(like, like, like, limit);
    result.guides = guides.map((g) => serializeGuide(g));
  }

  const total =
    (result.tools?.length || 0) + (result.models?.length || 0) + (result.guides?.length || 0);

  res.json({ query: q, total, results: result });
});
