# Localbench

A developer platform for **local AI**: create an account, search models and tools, follow intro guides, and call a real REST API.

## Stack

- **Next.js** (App Router) + TypeScript
- **Prisma** + SQLite
- **JWT** auth (HTTP-only cookie) + bcrypt password hashing
- **Zod** request validation

## Quick start

```bash
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo user (seeded):

- Email: `dev@localbench.dev`
- Password: `demo1234`

## What you get

| Area | Features |
|------|----------|
| Auth | Register, login, logout, `/api/auth/me` |
| Catalog | Models + tools with search, filters, detail pages |
| Favorites | Save/remove items (authenticated) |
| Guides | Intro curriculum for local AI development |
| API docs | Live endpoint reference at `/api-docs` |

## Key API routes

```text
GET  /api/health
POST /api/auth/register
POST /api/auth/login
GET  /api/catalog/search?q=ollama&type=tools
GET  /api/catalog/models
GET  /api/catalog/tools
GET  /api/guides
GET  /api/favorites          # auth required
POST /api/favorites          # auth required
```

See `/api-docs` in the running app for the full table and curl examples.
