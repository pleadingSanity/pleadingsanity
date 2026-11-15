// Profile songs — Turso (libSQL) backed. User-scoped via Netlify Identity.
// Public read returns only visibility='public' songs. Never stores audio.
import type { Config, Context } from "@netlify/functions";
import { json, optionalUser, readBody, unauthorized } from "../lib/social.js";
import { initTursoSchema, turso, tursoConfigured, youtubeIdFromUrl } from "../lib/turso.js";

const MAX_SONGS = 20;

export default async (req: Request, _context: Context) => {
  try {
    const url = new URL(req.url);
    const user = await optionalUser();

    // Public: GET /api/profiles/:username/songs
    if (url.pathname.startsWith("/api/profiles/") && url.pathname.endsWith("/songs")) {
      if (!tursoConfigured()) return json({ ok: false, configured: false, songs: [] }, 503);
      const username = decodeURIComponent(
        url.pathname.replace("/api/profiles/", "").replace(/\/songs$/, "")
      );
      if (req.method !== "GET" || !username) return json({ error: "Not found" }, 404);
      await initTursoSchema();
      // Look up user_id by username via Postgres profiles table (existing Drizzle).
      // If profiles lookup unavailable, return empty (graceful).
      let userId: string | null = null;
      try {
        const { db } = await import("../../db/index.js");
        const { profiles } = await import("../../db/schema.js");
        const { eq } = await import("drizzle-orm");
        const rows = await db.select({ userId: profiles.userId }).from(profiles).where(eq(profiles.username, username)).limit(1);
        userId = rows[0]?.userId ?? null;
      } catch {
        userId = null;
      }
      if (!userId) return json({ ok: true, songs: [] });
      const r = await turso().execute({
        sql: "SELECT id, youtube_id, title, artist, added_at FROM profile_songs WHERE user_id = ? AND visibility = 'public' ORDER BY added_at DESC LIMIT ?",
        args: [userId, MAX_SONGS],
      });
      return json({ ok: true, songs: r.rows.map((row) => ({ id: row.id, youtubeId: row.youtube_id, title: row.title, artist: row.artist, addedAt: row.added_at })) });
    }

    // Authenticated endpoints below
    if (!user) return unauthorized();
    if (!tursoConfigured()) return json({ ok: false, configured: false }, 503);
    await initTursoSchema();
    const userId = user.id;

    // DELETE /api/profile-songs/:id
    const delMatch = url.pathname.match(/^\/api\/profile-songs\/([A-Za-z0-9_-]+)$/);
    if (delMatch && req.method === "DELETE") {
      await turso().execute({
        sql: "DELETE FROM profile_songs WHERE id = ? AND user_id = ?",
        args: [delMatch[1], userId],
      });
      return json({ ok: true });
    }

    if (url.pathname !== "/api/profile-songs") return json({ error: "Not found" }, 404);

    // GET own songs
    if (req.method === "GET") {
      const r = await turso().execute({
        sql: "SELECT id, youtube_id, title, artist, visibility, added_at FROM profile_songs WHERE user_id = ? ORDER BY added_at DESC LIMIT ?",
        args: [userId, MAX_SONGS],
      });
      return json({
        ok: true,
        songs: r.rows.map((row) => ({ id: row.id, youtubeId: row.youtube_id, title: row.title, artist: row.artist, visibility: row.visibility, addedAt: row.added_at })),
      });
    }

    // POST add song
    if (req.method === "POST") {
      const body = await readBody(req);
      const youtubeId = youtubeIdFromUrl(body?.url);
      if (!youtubeId) return json({ error: "Paste a valid YouTube link or 11-character video ID." }, 400);
      const count = await turso().execute({ sql: "SELECT COUNT(*) as c FROM profile_songs WHERE user_id = ?", args: [userId] });
      if (Number(count.rows[0].c) >= MAX_SONGS) return json({ error: `Maximum ${MAX_SONGS} songs. Remove one first.` }, 400);
      const dup = await turso().execute({ sql: "SELECT id FROM profile_songs WHERE user_id = ? AND youtube_id = ?", args: [userId, youtubeId] });
      if (dup.rows.length) return json({ error: "That song is already in your list." }, 409);
      const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const visibility = body?.visibility === "public" ? "public" : "private";
      await turso().execute({
        sql: "INSERT INTO profile_songs (id, user_id, youtube_id, title, artist, visibility) VALUES (?, ?, ?, ?, ?, ?)",
        args: [id, userId, youtubeId, String(body?.title ?? "").slice(0, 80), String(body?.artist ?? "").slice(0, 60), visibility],
      });
      return json({ ok: true, id });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (e) {
    console.error("profile-songs error:", e instanceof Error ? e.message : String(e));
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
};

export const config: Config = {
  path: ["/api/profile-songs", "/api/profile-songs/:id", "/api/profiles/:username/songs"],
};
