import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db/index.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, signToken } from '../middleware/auth.js';

export const authRouter = Router();

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(32, 'Username must be at most 32 characters.')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Use letters, numbers, hyphens or underscores only.'),
  email: z.string().trim().email('Enter a valid email address.').max(254),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password is too long.'),
});

const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your username or email.'),
  password: z.string().min(1, 'Enter your password.'),
});

const updateProfileSchema = z.object({
  bio: z.string().max(500, 'Bio must be at most 500 characters.').optional(),
});

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    bio: user.bio ?? '',
    createdAt: user.created_at,
  };
}

authRouter.post('/register', validate(registerSchema), (req, res) => {
  const { username, email, password } = req.body;

  const existing = db
    .prepare('SELECT id, username, email FROM users WHERE username = ? OR email = ?')
    .get(username, email);
  if (existing) {
    const field = existing.username === username ? 'username' : 'email';
    return res.status(409).json({ error: `That ${field} is already taken.` });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
    .run(username, email, passwordHash);

  const user = db
    .prepare('SELECT id, username, email, bio, created_at FROM users WHERE id = ?')
    .get(result.lastInsertRowid);

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

authRouter.post('/login', validate(loginSchema), (req, res) => {
  const { identifier, password } = req.body;
  const user = db
    .prepare('SELECT * FROM users WHERE username = ? OR email = ?')
    .get(identifier, identifier);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

authRouter.patch('/me', requireAuth, validate(updateProfileSchema), (req, res) => {
  if (typeof req.body.bio === 'string') {
    db.prepare('UPDATE users SET bio = ? WHERE id = ?').run(req.body.bio, req.user.id);
  }
  const user = db
    .prepare('SELECT id, username, email, bio, created_at FROM users WHERE id = ?')
    .get(req.user.id);
  res.json({ user: publicUser(user) });
});
