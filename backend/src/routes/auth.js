import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { mapUser } from '../lib/mappers.js';

const registerSchema = z.object({
  email: z.string().email().max(255),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores'),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(80).optional(),
});

const loginSchema = z.object({
  login: z.string().min(1).max(255),
  password: z.string().min(1).max(128),
});

const profileSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  bio: z.string().max(500).optional(),
});

export async function authRoutes(fastify) {
  const { db } = fastify;

  fastify.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { email, username, password, displayName } = parsed.data;
    const existing = db
      .prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE OR username = ? COLLATE NOCASE')
      .get(email, username);

    if (existing) {
      return reply.code(409).send({ error: 'Email or username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = db
      .prepare(
        `INSERT INTO users (email, username, password_hash, display_name)
         VALUES (?, ?, ?, ?)`
      )
      .run(email.toLowerCase(), username, passwordHash, displayName || username);

    const user = mapUser(db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid));
    const token = fastify.jwt.sign({ sub: user.id, username: user.username });

    return reply.code(201).send({ user, token });
  });

  fastify.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { login, password } = parsed.data;
    const row = db
      .prepare(
        `SELECT * FROM users
         WHERE email = ? COLLATE NOCASE OR username = ? COLLATE NOCASE`
      )
      .get(login, login);

    if (!row) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const user = mapUser(row);
    const token = fastify.jwt.sign({ sub: user.id, username: user.username });
    return { user, token };
  });

  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request) => {
    const user = mapUser(db.prepare('SELECT * FROM users WHERE id = ?').get(request.user.sub));
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return { user };
  });

  fastify.patch('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = profileSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const current = db.prepare('SELECT * FROM users WHERE id = ?').get(request.user.sub);
    if (!current) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const displayName = parsed.data.displayName ?? current.display_name;
    const bio = parsed.data.bio ?? current.bio;

    db.prepare(
      `UPDATE users SET display_name = ?, bio = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(displayName, bio, current.id);

    return { user: mapUser(db.prepare('SELECT * FROM users WHERE id = ?').get(current.id)) };
  });
}
