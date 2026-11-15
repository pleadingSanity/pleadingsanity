// Turso (libSQL) client — used for NEW features only (profile songs).
// Existing Postgres/Drizzle tables are NOT migrated here.
// Env vars (set in Netlify, never committed): TURSO_DATABASE_URL, TURSO_AUTH_TOKEN.
import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;
let _initDone = false;

export function tursoConfigured(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

export function turso(): Client {
  if (!_client) {
    if (!tursoConfigured()) throw new Error("Turso not configured");
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL as string,
      authToken: process.env.TURSO_AUTH_TOKEN as string,
    });
  }
  return _client;
}

// Idempotent schema init — no migration tooling risk.
export async function initTursoSchema(): Promise<void> {
  if (_initDone) return;
  const db = turso();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS profile_songs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      youtube_id TEXT NOT NULL,
      title TEXT DEFAULT '' NOT NULL,
      artist TEXT DEFAULT '' NOT NULL,
      visibility TEXT DEFAULT 'private' NOT NULL,
      added_at TEXT DEFAULT (datetime('now')) NOT NULL
    )
  `);
  await db.execute(
    "CREATE INDEX IF NOT EXISTS profile_songs_user_idx ON profile_songs (user_id, added_at DESC)"
  );
  _initDone = true;
}

export const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function youtubeIdFromUrl(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const v = input.trim();
  if (YOUTUBE_ID.test(v)) return v;
  try {
    const u = new URL(v);
    const host = u.hostname.toLowerCase();
    if (["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"].includes(host)) {
      const id = u.searchParams.get("v");
      if (id && YOUTUBE_ID.test(id)) return id;
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" && parts[1] && YOUTUBE_ID.test(parts[1])) return parts[1];
      if (parts[0] === "embed" && parts[1] && YOUTUBE_ID.test(parts[1])) return parts[1];
    }
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      if (YOUTUBE_ID.test(id)) return id;
    }
  } catch {
    /* not a URL */
  }
  return null;
}
