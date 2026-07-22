import test from 'node:test';
import assert from 'node:assert/strict';
import app from './index.js';

// Minimal in-process HTTP harness so we don't need a running server or extra deps.
function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

async function request(server, method, path, { body, token } = {}) {
  const { port } = server.address();
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

test('health check responds ok', async () => {
  const server = await listen();
  try {
    const res = await request(server, 'GET', '/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  } finally {
    server.close();
  }
});

test('tools listing is seeded and searchable', async () => {
  const server = await listen();
  try {
    const all = await request(server, 'GET', '/api/tools');
    assert.equal(all.status, 200);
    assert.ok(all.body.data.length > 0);

    const search = await request(server, 'GET', '/api/tools?q=ollama');
    assert.equal(search.status, 200);
    assert.ok(search.body.data.some((t) => t.slug === 'ollama'));
  } finally {
    server.close();
  }
});

test('unified search returns tools, models and guides', async () => {
  const server = await listen();
  try {
    const res = await request(server, 'GET', '/api/search?q=local');
    assert.equal(res.status, 200);
    assert.ok(res.body.total > 0);
    assert.ok(res.body.results.tools);
    assert.ok(res.body.results.models);
    assert.ok(res.body.results.guides);
  } finally {
    server.close();
  }
});

test('auth + bookmark flow works end to end', async () => {
  const server = await listen();
  try {
    const unique = Date.now();
    const reg = await request(server, 'POST', '/api/auth/register', {
      body: { username: `dev${unique}`, email: `dev${unique}@example.com`, password: 'supersecret1' },
    });
    assert.equal(reg.status, 201);
    const { token } = reg.body;
    assert.ok(token);

    const me = await request(server, 'GET', '/api/auth/me', { token });
    assert.equal(me.status, 200);
    assert.equal(me.body.user.username, `dev${unique}`);

    // Bookmarks require auth.
    const noAuth = await request(server, 'GET', '/api/bookmarks');
    assert.equal(noAuth.status, 401);

    const tool = (await request(server, 'GET', '/api/tools')).body.data[0];
    const created = await request(server, 'POST', '/api/bookmarks', {
      token,
      body: { itemType: 'tool', itemId: tool.id },
    });
    assert.equal(created.status, 201);

    const list = await request(server, 'GET', '/api/bookmarks', { token });
    assert.equal(list.status, 200);
    assert.equal(list.body.data.length, 1);

    const del = await request(server, 'DELETE', `/api/bookmarks/${created.body.data.id}`, { token });
    assert.equal(del.status, 204);
  } finally {
    server.close();
  }
});
