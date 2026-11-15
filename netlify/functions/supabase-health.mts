// Supabase Postgres health check — connects via pg, inits schema, returns ok.
// Never echoes credentials. GET /api/supabase-health
import type { Config, Context } from "@netlify/functions";
import { initSupabaseSchema, supabaseConfigured, supabasePool } from "../lib/supabase.js";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export default async (req: Request, _context: Context) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  if (!supabaseConfigured()) return json({ ok: false, configured: false }, 503);
  try {
    await initSupabaseSchema();
    const r = await supabasePool().query("SELECT 1 as ok");
    const ok = r.rows.length === 1 && Number(r.rows[0].ok) === 1;
    return json({ ok, configured: true, tables: "arron_memories", driver: "pg" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const authFail = /password|authentication|auth/i.test(msg);
    return json({ ok: false, configured: true, error: authFail ? "auth_failed" : "connect_failed" }, 502);
  }
};

export const config: Config = { path: "/api/supabase-health" };
