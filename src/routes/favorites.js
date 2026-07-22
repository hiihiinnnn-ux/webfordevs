import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { requireAuth } from "../lib/auth.js";
import {
  asyncHandler, hydrate,
  MODEL_JSON_FIELDS, TOOL_JSON_FIELDS, GUIDE_JSON_FIELDS,
} from "../lib/helpers.js";

const router = Router();
router.use(requireAuth);

const TYPES = {
  model: { table: "models", fields: MODEL_JSON_FIELDS },
  tool: { table: "tools", fields: TOOL_JSON_FIELDS },
  guide: { table: "guides", fields: GUIDE_JSON_FIELDS },
};

const favSchema = z.object({
  item_type: z.enum(["model", "tool", "guide"]),
  item_id: z.number().int().positive(),
});

// GET /api/favorites — everything the current user has starred
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const favs = db
      .prepare("SELECT item_type, item_id, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC")
      .all(req.user.id);

    const items = favs.map((f) => {
      const { table, fields } = TYPES[f.item_type];
      const cols = f.item_type === "guide" ? "id, slug, title, level, minutes, summary, tags" : "*";
      const item = db.prepare(`SELECT ${cols} FROM ${table} WHERE id = ?`).get(f.item_id);
      return { item_type: f.item_type, favorited_at: f.created_at, item: hydrate(item, fields) };
    }).filter((f) => f.item);

    res.json({ items });
  })
);

// POST /api/favorites — { item_type, item_id }
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = favSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
    }
    const { item_type, item_id } = parsed.data;

    const exists = db.prepare(`SELECT 1 FROM ${TYPES[item_type].table} WHERE id = ?`).get(item_id);
    if (!exists) return res.status(404).json({ error: `No ${item_type} with id ${item_id}.` });

    db.prepare(
      "INSERT INTO favorites (user_id, item_type, item_id) VALUES (?, ?, ?) ON CONFLICT DO NOTHING"
    ).run(req.user.id, item_type, item_id);

    res.status(201).json({ ok: true, item_type, item_id });
  })
);

// DELETE /api/favorites/:type/:id
router.delete(
  "/:type/:id",
  asyncHandler(async (req, res) => {
    const { type, id } = req.params;
    if (!TYPES[type]) return res.status(400).json({ error: "Invalid type." });
    const info = db
      .prepare("DELETE FROM favorites WHERE user_id = ? AND item_type = ? AND item_id = ?")
      .run(req.user.id, type, Number(id));
    if (info.changes === 0) return res.status(404).json({ error: "Favorite not found." });
    res.json({ ok: true });
  })
);

export default router;
