import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';

fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

export const db = new Database(config.databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      bio           TEXT DEFAULT '',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tools (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      slug         TEXT NOT NULL UNIQUE,
      name         TEXT NOT NULL,
      tagline      TEXT NOT NULL DEFAULT '',
      description  TEXT NOT NULL DEFAULT '',
      category     TEXT NOT NULL DEFAULT 'other',
      homepage     TEXT DEFAULT '',
      repo_url     TEXT DEFAULT '',
      license      TEXT DEFAULT '',
      platforms    TEXT DEFAULT '',      -- comma separated: macos,linux,windows
      tags         TEXT DEFAULT '',      -- comma separated
      stars        INTEGER DEFAULT 0,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS models (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      slug          TEXT NOT NULL UNIQUE,
      name          TEXT NOT NULL,
      family        TEXT NOT NULL DEFAULT '',
      publisher     TEXT NOT NULL DEFAULT '',
      description   TEXT NOT NULL DEFAULT '',
      parameters    TEXT DEFAULT '',      -- e.g. "7B", "8x7B"
      quantizations TEXT DEFAULT '',      -- comma separated: Q4_K_M,Q8_0
      context_len   INTEGER DEFAULT 0,
      modality      TEXT DEFAULT 'text',  -- text, vision, code, audio, embedding
      license       TEXT DEFAULT '',
      min_ram_gb    INTEGER DEFAULT 0,
      tags          TEXT DEFAULT '',
      downloads     INTEGER DEFAULT 0,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS guides (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT NOT NULL UNIQUE,
      title       TEXT NOT NULL,
      summary     TEXT NOT NULL DEFAULT '',
      body        TEXT NOT NULL DEFAULT '',
      level       TEXT NOT NULL DEFAULT 'beginner', -- beginner, intermediate, advanced
      minutes     INTEGER DEFAULT 5,
      tags        TEXT DEFAULT '',
      sort_order  INTEGER DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL,
      item_type   TEXT NOT NULL,   -- 'tool' | 'model' | 'guide'
      item_id     INTEGER NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, item_type, item_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
    CREATE INDEX IF NOT EXISTS idx_models_modality ON models(modality);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
  `);
}

export default db;
