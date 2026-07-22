import { Router } from "express";
import { db } from "../db/index.js";
import { optionalAuth } from "../lib/auth.js";
import { asyncHandler, hydrate, MODEL_JSON_FIELDS, TOOL_JSON_FIELDS } from "../lib/helpers.js";

const router = Router();

// GET /api/recommend?ram_gb=16&vram_gb=8[&goal=coding|chat|rag|images|speech]
// Falls back to the logged-in user's saved hardware profile when params are omitted.
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    let ram = req.query.ram_gb !== undefined ? +req.query.ram_gb : NaN;
    let vram = req.query.vram_gb !== undefined ? +req.query.vram_gb : NaN;

    if ((Number.isNaN(ram) || Number.isNaN(vram)) && req.user?.hardware) {
      try {
        const hw = JSON.parse(req.user.hardware);
        if (Number.isNaN(ram)) ram = +hw.ram_gb || NaN;
        if (Number.isNaN(vram)) vram = hw.vram_gb == null ? 0 : +hw.vram_gb;
      } catch { /* ignore malformed profile */ }
    }

    if (Number.isNaN(ram)) {
      return res.status(400).json({
        error: "Provide ram_gb (and optionally vram_gb) as query params, or save a hardware profile via PATCH /api/auth/me.",
      });
    }
    if (Number.isNaN(vram)) vram = 0;

    const goal = req.query.goal ? String(req.query.goal) : null;
    const GOAL_TYPES = {
      coding: ["code"], chat: ["chat"], rag: ["chat", "embedding"],
      images: ["image", "vision"], speech: ["speech"], reasoning: ["reasoning"],
    };
    if (goal && !GOAL_TYPES[goal]) {
      return res.status(400).json({ error: `Invalid goal. One of: ${Object.keys(GOAL_TYPES).join(", ")}` });
    }

    const typeFilter = goal ? `AND type IN (${GOAL_TYPES[goal].map(() => "?").join(",")})` : "";
    const typeParams = goal ? GOAL_TYPES[goal] : [];

    const fits = db
      .prepare(`
        SELECT * FROM models
        WHERE min_ram_gb <= ? AND min_vram_gb <= ? ${typeFilter}
        ORDER BY params_b DESC NULLS LAST
        LIMIT 10
      `)
      .all(ram, vram, ...typeParams);

    // Beginner-friendly tools always make sense as a starting stack.
    const starterTools = db
      .prepare(`
        SELECT * FROM tools
        WHERE difficulty = 'beginner'
          AND EXISTS (SELECT 1 FROM json_each(tools.tags) WHERE json_each.value = 'starter')
        ORDER BY name ASC LIMIT 5
      `)
      .all();

    let tier;
    if (vram >= 24 || ram >= 64) tier = "high-end: you can run 30-70B class models";
    else if (vram >= 10 || ram >= 24) tier = "mid-range: 13-14B models run well";
    else if (vram >= 6 || ram >= 12) tier = "entry: 7-9B models at Q4 are your sweet spot";
    else tier = "constrained: stick to 1-3B models, they are surprisingly capable";

    res.json({
      hardware: { ram_gb: ram, vram_gb: vram, tier },
      goal: goal || "any",
      models: fits.map((m) => hydrate(m, MODEL_JSON_FIELDS)),
      starter_tools: starterTools.map((t) => hydrate(t, TOOL_JSON_FIELDS)),
    });
  })
);

export default router;
