# LocalAI Hub

> A developer's guide to running AI locally — with searchable **tools**, **models** and hands-on **learning guides**, backed by a real API and developer accounts.

LocalAI Hub is a full-stack web app that introduces developers to **local / on-device AI**. Browse
and search the tooling ecosystem (runtimes, UIs, dev tools), find open models that fit your hardware,
learn the whole stack through practical guides, and — once you sign up — bookmark everything into your
own toolkit.

## Features

- **Strong backend API** — a documented REST API built with Express + SQLite.
- **Developer accounts** — register / log in with JWT auth and bcrypt-hashed passwords.
- **Search everything** — full-text-style search across tools, models and guides, plus per-section
  filtering (category, platform, modality, family, max RAM) and sorting.
- **Tools catalog** — real local-AI tools (Ollama, LM Studio, llama.cpp, vLLM, Open WebUI, …).
- **Models catalog** — open models (Llama, Mistral, Qwen, Gemma, Phi, embeddings, vision, audio, …)
  with hardware hints so you can find one that runs on your machine.
- **Learn section** — markdown guides from "What is local AI?" to RAG, quantization and fine-tuning.
- **Bookmarks & dashboard** — logged-in devs save items and see them grouped in a personal dashboard.
- **Modern UI** — a responsive React (Vite) front-end with a clean dark theme.

## Tech stack

| Layer     | Choice                                                                 |
| --------- | --------------------------------------------------------------------- |
| Backend   | Node.js, Express, better-sqlite3, JWT, bcryptjs, Zod, Helmet, rate-limit |
| Frontend  | React 18, Vite, React Router, marked                                   |
| Database  | SQLite (file-based, zero external services, auto-seeded on first boot) |

## Project layout

```
localai-hub/
├── server/                 # Express API
│   └── src/
│       ├── index.js        # app wiring, security, static serving
│       ├── config.js
│       ├── db/             # sqlite setup, schema, seed data, serializers
│       ├── middleware/     # auth, validation, error handling
│       └── routes/         # auth, tools, models, guides, search, bookmarks
└── client/                 # React + Vite front-end
    └── src/
        ├── pages/          # home, tools, models, learn, search, auth, dashboard
        ├── components/     # navbar, footer, cards, common UI
        ├── context/        # auth + bookmarks state
        └── lib/            # API client, hooks
```

## Getting started

Requires Node.js 20+.

```bash
# 1. Install everything (root, server, client)
npm run install:all

# 2. Configure the server (optional — sensible defaults are used otherwise)
cp server/.env.example server/.env

# 3. Run the API and the web app together (hot reload)
npm run dev
```

- Web app: http://localhost:5173
- API: http://localhost:4000/api

The database is created and **seeded automatically** on first boot. To re-seed manually:

```bash
npm run seed
```

### Production / single-origin

Build the client and start the server — Express serves the built SPA and the API from one origin:

```bash
npm run build
npm start          # serves API + client on http://localhost:4000
```

## API reference

Base URL: `/api`

### Auth

| Method | Endpoint         | Auth | Description                       |
| ------ | ---------------- | ---- | --------------------------------- |
| POST   | `/auth/register` | –    | Create an account, returns a JWT  |
| POST   | `/auth/login`    | –    | Log in with username/email, JWT   |
| GET    | `/auth/me`       | ✔   | Current user                      |
| PATCH  | `/auth/me`       | ✔   | Update profile (bio)              |

### Catalog

| Method | Endpoint            | Description                                                                 |
| ------ | ------------------- | -------------------------------------------------------------------------- |
| GET    | `/tools`            | List/search tools. Query: `q, category, platform, sort, page, limit`       |
| GET    | `/tools/categories` | Category facets with counts                                                 |
| GET    | `/tools/:slug`      | Tool detail                                                                 |
| GET    | `/models`           | List/search models. Query: `q, modality, family, publisher, maxRam, sort…` |
| GET    | `/models/facets`    | Modality & family facets                                                    |
| GET    | `/models/:slug`     | Model detail                                                                |
| GET    | `/guides`           | List/search guides. Query: `q, level`                                       |
| GET    | `/guides/:slug`     | Guide detail (with markdown body)                                           |
| GET    | `/search`           | Unified search. Query: `q, type=all\|tool\|model\|guide, limit`             |

### Bookmarks (all require auth)

| Method | Endpoint          | Description                                          |
| ------ | ----------------- | --------------------------------------------------- |
| GET    | `/bookmarks`      | List the user's bookmarks (hydrated with the item)  |
| POST   | `/bookmarks`      | Add `{ itemType: tool\|model\|guide, itemId }`      |
| DELETE | `/bookmarks/:id`  | Remove a bookmark                                   |

## Testing

```bash
npm test            # runs the server's Node test suite (health, search, auth, bookmarks)
```

## Notes

- Catalog data is community-curated and illustrative; always confirm licenses and exact model tags
  on the publisher's page before use.
- Set a strong `JWT_SECRET` in production.
