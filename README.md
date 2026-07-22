# ⚡ localai.dev — Local AI for Developers

A full-stack website that introduces developers to running AI models on their own hardware. It pairs a real backend (REST API, JWT auth, full-text search, SQLite) with a zero-build single-page frontend.

## What it does

- **Learn** — a 7-part guide curriculum, from "what is local AI?" through quantization and hardware, up to production serving with vLLM.
- **Browse models** — a catalog of 14 open-weights models (Llama, Qwen, Mistral, Whisper, FLUX, …) with parameter counts, context windows, licenses, quantizations and minimum RAM/VRAM. Filter by type, family, license, or what your GPU can actually fit.
- **Browse tools** — 14 runtimes, servers, UIs, IDE extensions and frameworks (Ollama, llama.cpp, vLLM, Continue, ComfyUI, …) rated by difficulty.
- **Search** — unified full-text search across models, tools and guides, ranked by BM25 with highlighted snippets (SQLite FTS5).
- **Accounts** — devs can register, log in, star favorites, and save a hardware profile (RAM/VRAM/GPU).
- **Recommendations** — `/api/recommend` matches models to your hardware (from query params or your saved profile) and a goal like `coding` or `rag`.

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Server | Node.js + Express 5 | Minimal, well-known |
| Database | SQLite via better-sqlite3 (WAL) | Zero-ops, synchronous & fast |
| Search | SQLite FTS5 virtual table + triggers | Real BM25-ranked full-text search without extra infra |
| Auth | bcryptjs + JWT (7-day tokens) | Stateless sessions |
| Validation | Zod | Typed request schemas with useful error output |
| Hardening | helmet, express-rate-limit | Sane headers + brute-force protection on auth |
| Frontend | Vanilla JS SPA, no build step | Served straight from `public/` by Express |

## Running it

```bash
npm install
npm start          # serves http://localhost:3000, auto-seeds the DB on first run
```

Dev mode with auto-reload: `npm run dev`. Re-seed from scratch: `npm run seed -- --force`.

Environment variables (all optional):

- `PORT` — default `3000`
- `JWT_SECRET` — **set this in production**; a dev-only fallback is used otherwise
- `DATA_DIR` — where `localai.db` lives (default `./data`)

## API overview

All endpoints are under `/api`. Authenticated routes take `Authorization: Bearer <token>`.

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | `{ username, email, password }` → `{ token, user }` |
| POST | `/api/auth/login` | `{ identifier, password }` (username or email) → `{ token, user }` |
| GET | `/api/auth/me` 🔒 | Current user |
| PATCH | `/api/auth/me` 🔒 | Update `bio` and/or `hardware: { ram_gb, vram_gb, gpu }` |

### Catalog

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/models` | Filters: `q`, `type`, `family`, `license`, `tag`, `max_ram_gb`, `max_vram_gb`, `sort`, `page`, `limit` |
| GET | `/api/models/facets` | Distinct types/families/licenses with counts (for filter UIs) |
| GET | `/api/models/:slug` | Full model detail + favorites count |
| GET | `/api/tools` | Filters: `q`, `category`, `difficulty`, `platform`, `gpu`, `tag`, paging |
| GET | `/api/tools/facets` | Category/difficulty facets |
| GET | `/api/tools/:slug` | Full tool detail |
| GET | `/api/guides` | Filters: `level`, `tag` (bodies omitted in list) |
| GET | `/api/guides/:slug` | Full guide with markdown body |

### Search & recommendations

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/search?q=…` | BM25-ranked results across everything, with `<mark>` snippets. Optional `kind=model\|tool\|guide` |
| GET | `/api/recommend?ram_gb=16&vram_gb=8&goal=coding` | Models that fit the hardware + starter tools. Falls back to the logged-in user's saved profile |

### Favorites 🔒

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/favorites` | Everything the user starred, hydrated |
| POST | `/api/favorites` | `{ item_type: "model"\|"tool"\|"guide", item_id }` |
| DELETE | `/api/favorites/:type/:id` | Unstar |

### Example session

```bash
# register
TOKEN=$(curl -s -X POST localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"ada","email":"ada@dev.io","password":"hunter2hunter2"}' | jq -r .token)

# save hardware profile
curl -s -X PATCH localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"hardware":{"ram_gb":32,"vram_gb":12,"gpu":"RTX 3060"}}'

# get models that fit that machine
curl -s "localhost:3000/api/recommend?goal=coding" -H "Authorization: Bearer $TOKEN"

# search everything
curl -s "localhost:3000/api/search?q=quantization"
```

## Tests

```bash
npm test
```

12 integration tests (Node's built-in test runner against an in-memory database) cover the catalog filters, FTS search, the full auth lifecycle, favorites CRUD and hardware-aware recommendations.

## Project layout

```
src/
  server.js          # Express app, middleware, static SPA serving
  db/index.js        # schema, migrations, FTS5 index + sync triggers
  db/seed.js         # curated seed data: 14 models, 14 tools, 7 guides
  lib/auth.js        # JWT sign/verify, requireAuth / optionalAuth
  lib/helpers.js     # pagination, JSON-column hydration, FTS query escaping
  routes/            # auth, models, tools, guides, search, favorites, recommend
public/              # SPA: index.html, app.js (router + pages), styles.css
tests/api.test.js    # integration test suite
```
