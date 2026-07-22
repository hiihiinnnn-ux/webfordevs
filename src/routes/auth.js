import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { db } from "../db/index.js";
import { signToken, requireAuth } from "../lib/auth.js";
import { asyncHandler, hydrate } from "../lib/helpers.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many attempts, try again later." },
});

const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, - and _ allowed"),
  email: z.string().email().max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const loginSchema = z.object({
  identifier: z.string().min(1), // username or email
  password: z.string().min(1),
});

const profileSchema = z.object({
  bio: z.string().max(500).optional(),
  hardware: z
    .object({
      ram_gb: z.number().min(0).max(4096).nullable().optional(),
      vram_gb: z.number().min(0).max(1024).nullable().optional(),
      gpu: z.string().max(100).nullable().optional(),
    })
    .optional(),
});

function publicUser(row) {
  return hydrate(
    { id: row.id, username: row.username, email: row.email, bio: row.bio, hardware: row.hardware, created_at: row.created_at },
    ["hardware"]
  );
}

// POST /api/auth/register
router.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
    }
    const { username, email, password } = parsed.data;

    const existing = db
      .prepare("SELECT username, email FROM users WHERE username = ? OR email = ?")
      .get(username, email);
    if (existing) {
      const field = existing.username.toLowerCase() === username.toLowerCase() ? "username" : "email";
      return res.status(409).json({ error: `That ${field} is already taken.` });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const info = db
      .prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)")
      .run(username, email, password_hash);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  })
);

// POST /api/auth/login
router.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
    }
    const { identifier, password } = parsed.data;

    const user = db
      .prepare("SELECT * FROM users WHERE username = ? OR email = ?")
      .get(identifier, identifier);
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) return res.status(401).json({ error: "Invalid credentials." });

    res.json({ token: signToken(user), user: publicUser(user) });
  })
);

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// PATCH /api/auth/me — update bio / hardware profile
router.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
    }
    const { bio, hardware } = parsed.data;
    if (bio !== undefined) {
      db.prepare("UPDATE users SET bio = ? WHERE id = ?").run(bio, req.user.id);
    }
    if (hardware !== undefined) {
      db.prepare("UPDATE users SET hardware = ? WHERE id = ?").run(JSON.stringify(hardware), req.user.id);
    }
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    res.json({ user: publicUser(user) });
  })
);

export default router;
