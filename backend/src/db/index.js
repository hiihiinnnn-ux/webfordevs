import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrate } from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultPath = path.join(__dirname, '../../data/loci.db');

export function createDb(dbPath = process.env.LOCI_DB_PATH || defaultPath) {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

let singleton;

export function getDb() {
  if (!singleton) {
    singleton = createDb();
  }
  return singleton;
}
