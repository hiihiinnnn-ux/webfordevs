// NODE_ENV=test must be set before these imports run (the npm test script
// does this) so the DB layer uses an in-memory database and the server
// module skips listening on the real port.
process.env.NODE_ENV = "test";

const { default: app } = await import("../src/server.js");
const { seed } = await import("../src/db/seed.js");
const { test, before, after } = await import("node:test");
const { default: assert } = await import("node:assert/strict");

let server, base;

before(async () => {
  seed({ force: true });
  server = app.listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.closeAllConnections();
  server.close();
});

const req = async (path, opts = {}) => {
  const res = await fetch(`${base}/api${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return { status: res.status, data: await res.json() };
};

test("health check", async () => {
  const { status, data } = await req("/health");
  assert.equal(status, 200);
  assert.equal(data.ok, true);
});

test("lists models with pagination", async () => {
  const { status, data } = await req("/models?limit=5");
  assert.equal(status, 200);
  assert.equal(data.items.length, 5);
  assert.ok(data.pagination.total >= 14);
});

test("filters models by type and hardware", async () => {
  const { data } = await req("/models?type=code&max_vram_gb=8");
  assert.ok(data.items.length >= 1);
  for (const m of data.items) {
    assert.equal(m.type, "code");
    assert.ok(m.min_vram_gb <= 8);
  }
});

test("model detail by slug, 404 for unknown", async () => {
  const ok = await req("/models/llama-3.1-8b-instruct");
  assert.equal(ok.status, 200);
  assert.equal(ok.data.name, "Llama 3.1 8B Instruct");
  assert.ok(Array.isArray(ok.data.quantizations));

  const missing = await req("/models/does-not-exist");
  assert.equal(missing.status, 404);
});

test("lists tools filtered by category and difficulty", async () => {
  const { data } = await req("/tools?category=runtime&difficulty=beginner");
  assert.ok(data.items.some((t) => t.slug === "ollama"));
});

test("guides list omits body, detail includes it", async () => {
  const list = await req("/guides");
  assert.ok(list.data.items.length >= 7);
  assert.equal(list.data.items[0].body, undefined);

  const detail = await req("/guides/run-your-first-model");
  assert.equal(detail.status, 200);
  assert.ok(detail.data.body.includes("ollama run llama3.1"));
});

test("unified search ranks and snippets results", async () => {
  const { status, data } = await req("/search?q=coding copilot");
  assert.equal(status, 200);
  assert.ok(data.results.length > 0);
  const kinds = new Set(data.results.map((r) => r.kind));
  assert.ok(kinds.size >= 2, "should find matches across kinds");
  assert.ok(data.results[0].snippet.length > 0);
});

test("search requires q and validates kind", async () => {
  assert.equal((await req("/search")).status, 400);
  assert.equal((await req("/search?q=x&kind=bogus")).status, 400);
});

test("auth: register -> me -> login flow", async () => {
  const reg = await req("/auth/register", {
    method: "POST",
    body: { username: "testdev", email: "dev@test.io", password: "supersecret1" },
  });
  assert.equal(reg.status, 201);
  assert.ok(reg.data.token);
  assert.equal(reg.data.user.username, "testdev");

  const me = await req("/auth/me", { headers: { Authorization: `Bearer ${reg.data.token}` } });
  assert.equal(me.status, 200);
  assert.equal(me.data.user.email, "dev@test.io");

  const login = await req("/auth/login", {
    method: "POST",
    body: { identifier: "dev@test.io", password: "supersecret1" },
  });
  assert.equal(login.status, 200);
  assert.ok(login.data.token);
});

test("auth: rejects duplicates, bad passwords and bad tokens", async () => {
  const dup = await req("/auth/register", {
    method: "POST",
    body: { username: "testdev", email: "other@test.io", password: "supersecret1" },
  });
  assert.equal(dup.status, 409);

  const short = await req("/auth/register", {
    method: "POST",
    body: { username: "otherdev", email: "o@test.io", password: "short" },
  });
  assert.equal(short.status, 400);

  const wrong = await req("/auth/login", {
    method: "POST",
    body: { identifier: "testdev", password: "wrongpassword" },
  });
  assert.equal(wrong.status, 401);

  const badToken = await req("/auth/me", { headers: { Authorization: "Bearer garbage" } });
  assert.equal(badToken.status, 401);
});

test("favorites: full CRUD cycle requires auth", async () => {
  assert.equal((await req("/favorites")).status, 401);

  const { data: reg } = await req("/auth/register", {
    method: "POST",
    body: { username: "favuser", email: "fav@test.io", password: "supersecret1" },
  });
  const auth = { Authorization: `Bearer ${reg.token}` };

  const model = (await req("/models/qwen2.5-coder-7b")).data;
  const add = await req("/favorites", { method: "POST", headers: auth, body: { item_type: "model", item_id: model.id } });
  assert.equal(add.status, 201);

  const list = await req("/favorites", { headers: auth });
  assert.equal(list.data.items.length, 1);
  assert.equal(list.data.items[0].item.slug, "qwen2.5-coder-7b");

  const missing = await req("/favorites", { method: "POST", headers: auth, body: { item_type: "tool", item_id: 99999 } });
  assert.equal(missing.status, 404);

  const del = await req(`/favorites/model/${model.id}`, { method: "DELETE", headers: auth });
  assert.equal(del.status, 200);
  assert.equal((await req("/favorites", { headers: auth })).data.items.length, 0);
});

test("profile update + hardware-aware recommendations", async () => {
  const { data: reg } = await req("/auth/register", {
    method: "POST",
    body: { username: "hwuser", email: "hw@test.io", password: "supersecret1" },
  });
  const auth = { Authorization: `Bearer ${reg.token}` };

  const patch = await req("/auth/me", {
    method: "PATCH", headers: auth,
    body: { bio: "I like small models", hardware: { ram_gb: 16, vram_gb: 8, gpu: "RTX 3070" } },
  });
  assert.equal(patch.status, 200);
  assert.equal(patch.data.user.hardware.vram_gb, 8);

  // explicit query params
  const explicit = await req("/recommend?ram_gb=16&vram_gb=8&goal=coding");
  assert.equal(explicit.status, 200);
  assert.ok(explicit.data.models.length > 0);
  for (const m of explicit.data.models) {
    assert.ok(m.min_vram_gb <= 8 && m.min_ram_gb <= 16);
    assert.equal(m.type, "code");
  }

  // falls back to saved profile
  const fromProfile = await req("/recommend", { headers: auth });
  assert.equal(fromProfile.status, 200);
  assert.equal(fromProfile.data.hardware.ram_gb, 16);

  // no params, no profile -> 400
  assert.equal((await req("/recommend")).status, 400);
});
