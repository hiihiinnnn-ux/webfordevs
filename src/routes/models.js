import { Router } from "express";
import { db } from "../db/index.js";
import { asyncHandler, hydrate, MODEL_JSON_FIELDS, parsePagination, toFtsQuery } from "../lib/helpers.js";

const router = Router();

const SORTS = {
  name: "name ASC",
  params_asc: "params_b ASC NULLS LAST",
  params_desc: "params_b DESC NULLS LAST",
  newest: "created_at DESC",
};

// GET /api/models — list with filters
// Query params: q, type, license, family, tag, max_ram_gb, max_vram_gb, sort, page, limit
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { q, type, license, family, tag, max_ram_gb, max_vram_gb } = req.query;
    const where = [];
    const params = {};

    if (type) { where.push("type = @type"); params.type = type; }
    if (license) { where.push("license LIKE @license"); params.license = `%${license}%`; }
    if (family) { where.push("family = @family COLLATE NOCASE"); params.family = family; }
    if (tag) { where.push("EXISTS (SELECT 1 FROM json_each(models.tags) WHERE json_each.value = @tag)"); params.tag = tag; }
    if (max_ram_gb && !Number.isNaN(+max_ram_gb)) { where.push("min_ram_gb <= @max_ram"); params.max_ram = +max_ram_gb; }
    if (max_vram_gb !== undefined && !Number.isNaN(+max_vram_gb)) { where.push("min_vram_gb <= @max_vram"); params.max_vram = +max_vram_gb; }
    if (q) {
      const fts = toFtsQuery(String(q));
      if (fts) {
        where.push("id IN (SELECT ref_id FROM search_index WHERE kind = 'model' AND search_index MATCH @fts)");
        params.fts = fts;
      }
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const orderSql = SORTS[req.query.sort] || SORTS.name;
    const { limit, page, offset } = parsePagination(req.query);

    const total = db.prepare(`SELECT COUNT(*) AS c FROM models ${whereSql}`).get(params).c;
    const rows = db
      .prepare(`SELECT * FROM models ${whereSql} ORDER BY ${orderSql} LIMIT @limit OFFSET @offset`)
      .all({ ...params, limit, offset });

    res.json({
      items: rows.map((r) => hydrate(r, MODEL_JSON_FIELDS)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  })
);

// GET /api/models/facets — distinct values for filter UIs
router.get("/facets", (_req, res) => {
  res.json({
    types: db.prepare("SELECT type AS value, COUNT(*) AS count FROM models GROUP BY type ORDER BY count DESC").all(),
    families: db.prepare("SELECT family AS value, COUNT(*) AS count FROM models GROUP BY family ORDER BY count DESC").all(),
    licenses: db.prepare("SELECT license AS value, COUNT(*) AS count FROM models GROUP BY license ORDER BY count DESC").all(),
  });
});

// GET /api/models/:slug
router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const row = db.prepare("SELECT * FROM models WHERE slug = ?").get(req.params.slug);
    if (!row) return res.status(404).json({ error: "Model not found." });
    const favorites = db
      .prepare("SELECT COUNT(*) AS c FROM favorites WHERE item_type = 'model' AND item_id = ?")
      .get(row.id).c;
    res.json({ ...hydrate(row, MODEL_JSON_FIELDS), favorites_count: favorites });
  })
);

export default router;
