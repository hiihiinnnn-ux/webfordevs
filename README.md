# LocalAI Dev Platform

A full-stack developer platform for discovering and learning **local AI** — run models on your own hardware without cloud API keys.

## Features

- **Developer accounts** — JWT auth with register/login, user profiles, and saved favorites
- **Search API** — full-text search across tools, models, frameworks, and guides
- **Catalog APIs** — browse Ollama, llama.cpp, Llama 3, Mistral, LangChain, and more
- **Learning guides** — intro content from "why local AI" to RAG and OpenAI-compatible servers
- **Modern UI** — Next.js frontend with search, catalog pages, and a personal dashboard

## Quick start

### Option 1: Dev script

```bash
chmod +x scripts/dev.sh
./scripts/dev.sh
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Option 2: Manual

**Backend:**

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker compose up --build
```

## API overview

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | — | Create account |
| `/api/auth/login` | POST | — | Get JWT token |
| `/api/auth/me` | GET | Bearer | Current user |
| `/api/search?q=ollama` | GET | — | Search catalog |
| `/api/catalog/tools` | GET | — | List tools |
| `/api/catalog/models` | GET | — | List models |
| `/api/catalog/frameworks` | GET | — | List frameworks |
| `/api/catalog/guides` | GET | — | List guides |
| `/api/catalog/guides/{slug}` | GET | — | Guide detail |
| `/api/favorites` | GET/POST | Bearer | Saved items |
| `/api/health` | GET | — | Health check |

## Tech stack

- **Backend:** FastAPI, SQLAlchemy, SQLite, JWT (python-jose), bcrypt
- **Frontend:** Next.js 14, React, TypeScript
- **Database:** SQLite (auto-seeded on first run)

## Project structure

```
backend/
  app/
    routers/     # auth, search, catalog, favorites
    services/    # search scoring
    models.py    # SQLAlchemy models
    seed.py      # catalog seed data
frontend/
  src/
    app/         # pages (search, tools, models, guides, auth)
    components/  # Nav, SearchBar
    lib/api.ts   # API client
```

## License

MIT
