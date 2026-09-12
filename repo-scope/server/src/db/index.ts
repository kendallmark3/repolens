import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// v1 uses SQLite for zero-friction local demo. The schema avoids
// SQLite-specific features (no AUTOINCREMENT quirks relied upon, plain
// TEXT/INTEGER/REAL types, explicit FKs) so migration to PostgreSQL is
// a matter of swapping the driver + running the same DDL with minor
// dialect tweaks (e.g. SERIAL vs TEXT ids, TIMESTAMP vs TEXT dates).
const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_PATH = path.join(DATA_DIR, "repo-scope.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initSchema() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);
}

export function isSeeded(): boolean {
  const row = db
    .prepare("SELECT COUNT(*) as count FROM repository")
    .get() as { count: number };
  return row.count > 0;
}
