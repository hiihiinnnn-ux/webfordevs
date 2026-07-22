import jwt from "jsonwebtoken";
import { db } from "../db/index.js";

export const JWT_SECRET =
  process.env.JWT_SECRET || "dev-only-secret-change-me-in-production";
export const JWT_EXPIRES_IN = "7d";

export function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function getTokenUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return db
      .prepare("SELECT id, username, email, bio, hardware, created_at FROM users WHERE id = ?")
      .get(payload.sub) ?? null;
  } catch {
    return null;
  }
}

/** Rejects the request if no valid Bearer token is present. */
export function requireAuth(req, res, next) {
  const user = getTokenUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required. Pass 'Authorization: Bearer <token>'." });
  }
  req.user = user;
  next();
}

/** Attaches req.user when a valid token is present, but never rejects. */
export function optionalAuth(req, _res, next) {
  req.user = getTokenUser(req);
  next();
}
