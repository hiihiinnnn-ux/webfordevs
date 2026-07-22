# Loci — Local AI for developers

Loci is a full-stack learning and discovery platform that introduces developers to **local AI**: runtimes, models, guides, search, and developer accounts — backed by a real REST API.

## Stack

- **Frontend:** Vite + React + React Router
- **Backend:** Fastify (Node.js)
- **Database:** SQLite via `better-sqlite3`
- **Auth:** JWT + bcrypt password hashing

## Features

- Developer **register / login** accounts
- **Search** across tools, models, and guides (`GET /api/search`)
- Catalog APIs for tools, models, and learning guides
- Authenticated **bookmarks**
- Seeded content covering Ollama, LM Studio, llama.cpp, GGUF models, RAG, and more

## Quick start

```bash
npm install
npm run seed
npm run dev
```

- Web UI: http://localhost:5173
- API: http://localhost:4000/api/health

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current user (Bearer token) |
| PATCH | `/api/auth/me` | Update profile |
| GET | `/api/tools` | List/filter tools |
| GET | `/api/tools/:slug` | Tool detail |
| GET | `/api/models` | List/filter models |
| GET | `/api/models/:slug` | Model detail |
| GET | `/api/guides` | List guides |
| GET | `/api/guides/:slug` | Guide detail |
| GET | `/api/search?q=` | Unified search |
| GET | `/api/search/suggest?q=` | Search suggestions |
| GET/POST/DELETE | `/api/bookmarks` | Bookmarks (auth) |
| GET | `/api/stats/overview` | Homepage catalog stats |

### Example: register + search

```bash
curl -s -X POST http://localhost:4000/api/auth/register \
  -H 'content-type: application/json' \
  -d '{"email":"dev@example.com","username":"dev","password":"password123"}'

curl -s 'http://localhost:4000/api/search?q=ollama'
```

## Scripts

| Script | What it does |
|--------|----------------|
| `npm run dev` | API + web concurrently |
| `npm run seed` | Seed SQLite catalog |
| `npm test` | Backend API tests |
| `npm run build` | Production frontend build |

## Environment

- `PORT` — API port (default `4000`)
- `JWT_SECRET` — JWT signing secret
- `LOCI_DB_PATH` — optional SQLite path
- `VITE_API_URL` — leave empty in dev (Vite proxies `/api`)
