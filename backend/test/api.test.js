import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createDb } from '../src/db/index.js';
import { buildApp } from '../src/index.js';

describe('Loci API', () => {
  let app;
  let dbPath;
  let token;
  let toolId;

  before(async () => {
    dbPath = path.join(os.tmpdir(), `loci-test-${Date.now()}.db`);
    process.env.LOCI_DB_PATH = dbPath;
    const db = createDb(dbPath);

    db.prepare(
      `INSERT INTO tools (slug, name, category, description, long_description, tags, platforms, difficulty, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      'ollama',
      'Ollama',
      'runtime',
      'Run models locally',
      'Long desc',
      '["cli"]',
      '["Linux"]',
      'beginner',
      1
    );

    db.prepare(
      `INSERT INTO models (slug, name, family, description, tags, use_cases, formats, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      'llama-3-2-3b',
      'Llama 3.2 3B',
      'Llama',
      'Small local model',
      '["small"]',
      '["chat"]',
      '["GGUF"]',
      1
    );

    db.prepare(
      `INSERT INTO guides (slug, title, summary, body, level, tags)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      'what-is-local-ai',
      'What is local AI?',
      'Intro',
      '# Hello',
      'intro',
      '["fundamentals"]'
    );

    toolId = db.prepare('SELECT id FROM tools WHERE slug = ?').get('ollama').id;
    app = await buildApp({ db, logger: false });
    await app.ready();
  });

  after(async () => {
    await app.close();
    try {
      fs.unlinkSync(dbPath);
    } catch {
      // ignore
    }
  });

  it('health check works', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().ok, true);
  });

  it('registers and logs in a user', async () => {
    const register = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'dev@example.com',
        username: 'devuser',
        password: 'password123',
        displayName: 'Dev User',
      },
    });
    assert.equal(register.statusCode, 201);
    assert.ok(register.json().token);
    token = register.json().token;

    const me = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(me.statusCode, 200);
    assert.equal(me.json().user.username, 'devuser');

    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { login: 'devuser', password: 'password123' },
    });
    assert.equal(login.statusCode, 200);
    assert.ok(login.json().token);
  });

  it('lists tools and searches', async () => {
    const tools = await app.inject({ method: 'GET', url: '/api/tools' });
    assert.equal(tools.statusCode, 200);
    assert.equal(tools.json().total, 1);

    const search = await app.inject({ method: 'GET', url: '/api/search?q=ollama' });
    assert.equal(search.statusCode, 200);
    assert.ok(search.json().results.length >= 1);
    assert.equal(search.json().results[0].type, 'tool');
  });

  it('bookmarks require auth and work', async () => {
    const denied = await app.inject({ method: 'GET', url: '/api/bookmarks' });
    assert.equal(denied.statusCode, 401);

    const created = await app.inject({
      method: 'POST',
      url: '/api/bookmarks',
      headers: { authorization: `Bearer ${token}` },
      payload: { itemType: 'tool', itemId: toolId },
    });
    assert.equal(created.statusCode, 201);

    const list = await app.inject({
      method: 'GET',
      url: '/api/bookmarks',
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(list.statusCode, 200);
    assert.equal(list.json().items.length, 1);
  });
});
