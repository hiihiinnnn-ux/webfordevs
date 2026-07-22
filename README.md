# Ember

A developer portal for **local AI** — accounts, a searchable catalog of tools and models, learning guides, and a real JSON API backend.

## Features

- **Auth**: register / login / logout with bcrypt password hashes and HTTP-only JWT cookies
- **Catalog APIs**: tools, models, unified search, guides, stats
- **Bookmarks**: signed-in developers can save tools and models
- **Guides**: short introduction path to local inference for builders
- **SQLite + Prisma**: portable local database with seeded demo data

## Quick start

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo account after seeding:

- Email: `dev@ember.local`
- Password: `password123`

## API overview

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current user |
| GET | `/api/tools` | Search tools |
| GET | `/api/models` | Search models |
| GET | `/api/search?q=` | Unified search |
| GET/POST/DELETE | `/api/bookmarks` | User bookmarks |
| GET | `/api/guides` | Learning guides |
| GET | `/api/stats` | Catalog facets |

See `/api-docs` in the app for the full reference.

## Stack

- Next.js 15 (App Router) + TypeScript
- Prisma 7 + SQLite (`better-sqlite3` adapter)
- Zod validation, Jose JWT sessions, Tailwind CSS 4
