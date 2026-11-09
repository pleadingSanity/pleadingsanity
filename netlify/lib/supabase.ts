// Supabase Postgres (direct pg) client — used for NEW features only (Arron memory).
// Existing Drizzle/Postgres tables are NOT migrated or duplicated.
// Env vars (set in Netlify, never committed): DATABASE_URL (primary), DATABASE_URL_2 (replica).
import pg from "pg";

let _pool: pg.Pool | null = null;

export function supabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function supabasePool(): pg.Pool {
  if (!_pool) {
    if (!supabaseConfigured()) throw new Error("Supabase DATABASE_URL not configured");
    _pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 30000,
    });
  }
  return _pool;
}

// Idempotent schema init — no migration tooling risk. New tables only.
export async function initSupabaseSchema(): Promise<void> {
  const pool = supabasePool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS arron_memories (
      id TEXT PRIMARY KEY,
      user_id TEXT DEFAULT '' NOT NULL,
      memory TEXT NOT NULL,
      tags TEXT DEFAULT '' NOT NULL,
      created_at TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') NOT NULL
    )
  `);
  await pool.query(
    "CREATE INDEX IF NOT EXISTS arron_memories_user_idx ON arron_memories (user_id, created_at DESC)"
  );
}
