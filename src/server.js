import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { seed } from "./db/seed.js";
import authRoutes from "./routes/auth.js";
import modelRoutes from "./routes/models.js";
import toolRoutes from "./routes/tools.js";
import guideRoutes from "./routes/guides.js";
import searchRoutes from "./routes/search.js";
import favoriteRoutes from "./routes/favorites.js";
import recommendRoutes from "./routes/recommend.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet({ contentSecurityPolicy: false })); // CSP off: inline SPA scripts
app.use(express.json({ limit: "100kb" }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// --- API ---
app.get("/api/health", (_req, res) => res.json({ ok: true, uptime_s: Math.round(process.uptime()) }));
app.use("/api/auth", authRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/recommend", recommendRoutes);

app.use("/api", (_req, res) => res.status(404).json({ error: "Unknown API endpoint." }));

// --- Static frontend (SPA) ---
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));
app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(publicDir, "index.html")));

// --- Error handler ---
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
  const result = seed();
  if (result.seeded) console.log(`Seeded database: ${result.models} models, ${result.tools} tools, ${result.guides} guides.`);
  app.listen(PORT, () => console.log(`localai.dev hub listening on http://localhost:${PORT}`));
}

export default app;
