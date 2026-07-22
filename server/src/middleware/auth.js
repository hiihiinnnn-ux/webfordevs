import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { db } from '../db/index.js';

function readToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

/**
 * Requires a valid JWT. Attaches req.user with the current user record.
 */
export function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = db
      .prepare('SELECT id, username, email, bio, created_at FROM users WHERE id = ?')
      .get(payload.sub);
    if (!user) return res.status(401).json({ error: 'Invalid session.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Attaches req.user when a valid token is present, but never blocks the request.
 */
export function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = db
      .prepare('SELECT id, username, email, bio, created_at FROM users WHERE id = ?')
      .get(payload.sub);
    if (user) req.user = user;
  } catch {
    /* ignore — treat as anonymous */
  }
  next();
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}
