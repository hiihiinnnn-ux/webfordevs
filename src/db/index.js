import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "..", "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

const dbFile =
  process.env.NODE_ENV === "test" ? ":memory:" : path.join(DATA_DIR, "localai.db");

export const db = new Database(dbFile);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
      email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      bio           TEXT DEFAULT '',
      hardware      TEXT DEFAULT NULL, -- JSON: { ram_gb, vram_gb, gpu }
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS models (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      slug           TEXT NOT NULL UNIQUE,
      name           TEXT NOT NULL,
      family         TEXT NOT NULL,
      type           TEXT NOT NULL, -- chat | code | reasoning | vision | speech | image | embedding
      params_b       REAL,          -- billions of parameters (NULL for non-LLM)
      context_window INTEGER,
      license        TEXT NOT NULL,
      min_ram_gb     REAL NOT NULL,
      min_vram_gb    REAL NOT NULL, -- 0 means runs fine on CPU
      quantizations  TEXT NOT NULL DEFAULT '[]', -- JSON array
      description    TEXT NOT NULL,
      tags           TEXT NOT NULL DEFAULT '[]', -- JSON array
      homepage       TEXT,
      created_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tools (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT NOT NULL UNIQUE,
      name        TEXT NOT NULL,
      category    TEXT NOT NULL, -- runtime | server | desktop-app | web-ui | ide-extension | image | speech | framework
      language    TEXT,
      difficulty  TEXT NOT NULL DEFAULT 'beginner', -- beginner | intermediate | advanced
      gpu_support TEXT NOT NULL DEFAULT '[]', -- JSON array e.g. ["cuda","metal","rocm","cpu"]
      platforms   TEXT NOT NULL DEFAULT '[]', -- JSON array e.g. ["linux","macos","windows"]
      description TEXT NOT NULL,
      tags        TEXT NOT NULL DEFAULT '[]',
      repo_url    TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS guides (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      slug       TEXT NOT NULL UNIQUE,
      title      TEXT NOT NULL,
      level      TEXT NOT NULL DEFAULT 'beginner',
      minutes    INTEGER NOT NULL DEFAULT 5,
      summary    TEXT NOT NULL,
      body       TEXT NOT NULL, -- markdown
      tags       TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS favorites (
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_type  TEXT NOT NULL CHECK (item_type IN ('model','tool','guide')),
      item_id    INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, item_type, item_id)
    );

    CREATE INDEX IF NOT EXISTS idx_models_type    ON models(type);
    CREATE INDEX IF NOT EXISTS idx_models_license ON models(license);
    CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);

    -- Full-text search over everything, kept in sync by triggers.
    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
      kind UNINDEXED, ref_id UNINDEXED, title, body, tags
    );
  `);

  // FTS sync triggers (models / tools / guides -> search_index)
  const triggers = [
    ["models", "model", "name", "description"],
    ["tools", "tool", "name", "description"],
    ["guides", "guide", "title", "summary"],
  ];
  for (const [table, kind, titleCol, bodyCol] of triggers) {
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS ${table}_ai AFTER INSERT ON ${table} BEGIN
        INSERT INTO search_index (kind, ref_id, title, body, tags)
        VALUES ('${kind}', new.id, new.${titleCol}, new.${bodyCol}, new.tags);
      END;
      CREATE TRIGGER IF NOT EXISTS ${table}_ad AFTER DELETE ON ${table} BEGIN
        DELETE FROM search_index WHERE kind = '${kind}' AND ref_id = old.id;
      END;
      CREATE TRIGGER IF NOT EXISTS ${table}_au AFTER UPDATE ON ${table} BEGIN
        DELETE FROM search_index WHERE kind = '${kind}' AND ref_id = old.id;
        INSERT INTO search_index (kind, ref_id, title, body, tags)
        VALUES ('${kind}', new.id, new.${titleCol}, new.${bodyCol}, new.tags);
      END;
    `);
  }
}

migrate();
