// Turso health check — connects, inits schema idempotently, returns ok.
// Never echoes the token. GET /.netlify/functions/turso-health
import type { Config, Context } from "@netlify/functions";
import { tursoConfigured, initTursoSchema, turso } from "../lib/turso.js";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export default async (req: Request, _context: Context) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  if (!tursoConfigured()) return json({ ok: false, configured: false }, 503);
  try {
    await initTursoSchema();
    const r = await turso().execute("SELECT 1 as ok");
    const ok = r.rows.length === 1 && Number(r.rows[0].ok) === 1;
    return json({ ok, configured: true, tables: "profile_songs" });
  } catch (e) {
    return json({ ok: false, configured: true, error: "connect_failed" }, 502);
  }
};

export const config: Config = { path: "/api/turso-health" };
