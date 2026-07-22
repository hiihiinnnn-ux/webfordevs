import { Router } from "express";
import { db } from "../db/index.js";
import { asyncHandler, hydrate, TOOL_JSON_FIELDS, parsePagination, toFtsQuery } from "../lib/helpers.js";

const router = Router();

// GET /api/tools — list with filters
// Query params: q, category, difficulty, platform, gpu, tag, page, limit
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { q, category, difficulty, platform, gpu, tag } = req.query;
    const where = [];
    const params = {};

    if (category) { where.push("category = @category"); params.category = category; }
    if (difficulty) { where.push("difficulty = @difficulty"); params.difficulty = difficulty; }
    if (platform) { where.push("EXISTS (SELECT 1 FROM json_each(tools.platforms) WHERE json_each.value = @platform)"); params.platform = platform; }
    if (gpu) { where.push("EXISTS (SELECT 1 FROM json_each(tools.gpu_support) WHERE json_each.value = @gpu)"); params.gpu = gpu; }
    if (tag) { where.push("EXISTS (SELECT 1 FROM json_each(tools.tags) WHERE json_each.value = @tag)"); params.tag = tag; }
    if (q) {
      const fts = toFtsQuery(String(q));
      if (fts) {
        where.push("id IN (SELECT ref_id FROM search_index WHERE kind = 'tool' AND search_index MATCH @fts)");
        params.fts = fts;
      }
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const { limit, page, offset } = parsePagination(req.query);

    const total = db.prepare(`SELECT COUNT(*) AS c FROM tools ${whereSql}`).get(params).c;
    const rows = db
      .prepare(`SELECT * FROM tools ${whereSql} ORDER BY name ASC LIMIT @limit OFFSET @offset`)
      .all({ ...params, limit, offset });

    res.json({
      items: rows.map((r) => hydrate(r, TOOL_JSON_FIELDS)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  })
);

// GET /api/tools/facets
router.get("/facets", (_req, res) => {
  res.json({
    categories: db.prepare("SELECT category AS value, COUNT(*) AS count FROM tools GROUP BY category ORDER BY count DESC").all(),
    difficulties: db.prepare("SELECT difficulty AS value, COUNT(*) AS count FROM tools GROUP BY difficulty ORDER BY count DESC").all(),
  });
});

// GET /api/tools/:slug
router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const row = db.prepare("SELECT * FROM tools WHERE slug = ?").get(req.params.slug);
    if (!row) return res.status(404).json({ error: "Tool not found." });
    const favorites = db
      .prepare("SELECT COUNT(*) AS c FROM favorites WHERE item_type = 'tool' AND item_id = ?")
      .get(row.id).c;
    res.json({ ...hydrate(row, TOOL_JSON_FIELDS), favorites_count: favorites });
  })
);

export default router;
