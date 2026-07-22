import { Router } from "express";
import { db } from "../db/index.js";
import {
  asyncHandler, hydrate, toFtsQuery,
  MODEL_JSON_FIELDS, TOOL_JSON_FIELDS, GUIDE_JSON_FIELDS,
} from "../lib/helpers.js";

const router = Router();

const HYDRATORS = {
  model: { table: "models", fields: MODEL_JSON_FIELDS },
  tool: { table: "tools", fields: TOOL_JSON_FIELDS },
  guide: { table: "guides", fields: GUIDE_JSON_FIELDS },
};

// GET /api/search?q=...&kind=model|tool|guide&limit=20
// Unified full-text search across models, tools and guides, ranked by BM25.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || "").trim();
    if (!q) return res.status(400).json({ error: "Missing required query parameter 'q'." });

    const kind = req.query.kind ? String(req.query.kind) : null;
    if (kind && !HYDRATORS[kind]) {
      return res.status(400).json({ error: "Invalid 'kind'. Must be one of: model, tool, guide." });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const fts = toFtsQuery(q);
    if (!fts) return res.json({ query: q, results: [] });

    const rows = db
      .prepare(`
        SELECT kind, ref_id, bm25(search_index, 0, 0, 3.0, 1.0, 2.0) AS score,
               snippet(search_index, 3, '<mark>', '</mark>', '…', 20) AS snippet
        FROM search_index
        WHERE search_index MATCH @fts ${kind ? "AND kind = @kind" : ""}
        ORDER BY score
        LIMIT @limit
      `)
      .all({ fts, kind, limit });

    const results = rows.map((r) => {
      const { table, fields } = HYDRATORS[r.kind];
      const cols = r.kind === "guide"
        ? "id, slug, title, level, minutes, summary, tags"
        : "*";
      const item = db.prepare(`SELECT ${cols} FROM ${table} WHERE id = ?`).get(r.ref_id);
      return { kind: r.kind, score: r.score, snippet: r.snippet, item: hydrate(item, fields) };
    });

    res.json({ query: q, results });
  })
);

export default router;
