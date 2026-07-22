import { Router } from "express";
import { db } from "../db/index.js";
import { asyncHandler, hydrate, GUIDE_JSON_FIELDS, parsePagination } from "../lib/helpers.js";

const router = Router();

// GET /api/guides — list (without full body)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { level, tag } = req.query;
    const where = [];
    const params = {};
    if (level) { where.push("level = @level"); params.level = level; }
    if (tag) { where.push("EXISTS (SELECT 1 FROM json_each(guides.tags) WHERE json_each.value = @tag)"); params.tag = tag; }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const { limit, page, offset } = parsePagination(req.query, { defaultLimit: 50 });

    const total = db.prepare(`SELECT COUNT(*) AS c FROM guides ${whereSql}`).get(params).c;
    const rows = db
      .prepare(`SELECT id, slug, title, level, minutes, summary, tags, created_at FROM guides ${whereSql} ORDER BY id ASC LIMIT @limit OFFSET @offset`)
      .all({ ...params, limit, offset });

    res.json({
      items: rows.map((r) => hydrate(r, GUIDE_JSON_FIELDS)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  })
);

// GET /api/guides/:slug — full guide including markdown body
router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const row = db.prepare("SELECT * FROM guides WHERE slug = ?").get(req.params.slug);
    if (!row) return res.status(404).json({ error: "Guide not found." });
    res.json(hydrate(row, GUIDE_JSON_FIELDS));
  })
);

export default router;
