// ==============================================================
// 🧠 ARRON PHASE 2 — Supabase memory endpoint
// Mounted at /api/arron/memory/supabase (deliberately NOT
// /api/arron/memory, which arron.mts owns). Thin HTTP wrapper over
// netlify/lib/supabase-memory.ts. Every op is best-effort: if
// SUPABASE_URL / SUPABASE_ANON_KEY are unset, this returns 503 with
// supabaseEnabled:false and Arron continues on local Netlify DB.
//
//   GET    /api/arron/memory/supabase?id=<memoryId>&limit=50
//   POST   /api/arron/memory/supabase  { memoryId, messages:[{role,content}] }
//   DELETE /api/arron/memory/supabase  { memoryId }
//
// This endpoint is a management/debug door. The chat path in
// arron.mts writes to Supabase directly via the same lib. "Forget
// Me" is still DELETE /api/arron/memory (arron.mts), which also
// calls clearMemory here.
// ==============================================================

import type { Config, Context } from "@netlify/functions";
import { appendMessages, clearMemory, readHistory, supabaseEnabled, type MemoryRole } from "../lib/supabase-memory.js";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const MEMORY_ID = /^[a-f0-9-]{32,64}$/i;
const validId = (id: unknown): id is string => typeof id === "string" && MEMORY_ID.test(id);

export default async (req: Request, _context: Context) => {
  if (!supabaseEnabled()) {
    return json({ ok: false, supabaseEnabled: false, note: "Set SUPABASE_URL and SUPABASE_ANON_KEY to enable cloud memory. Local Netlify DB memory is unaffected." }, 503);
  }
  const url = new URL(req.url);
  let body: Record<string, unknown> = {};
  if (req.method !== "GET") {
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }
  }
  const memoryId = req.method === "GET" ? url.searchParams.get("id") : body.memoryId;
  if (!validId(memoryId)) return json({ error: "Invalid memory id" }, 400);

  if (req.method === "GET") {
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "50", 10);
    const messages = await readHistory(memoryId, Number.isFinite(limit) ? limit : 50);
    return json({ ok: true, supabaseEnabled: true, memoryIdPrefix: memoryId.slice(0, 8), messages });
  }

  if (req.method === "POST") {
    const raw = Array.isArray(body.messages) ? body.messages : [];
    const messages = raw
      .map((m) => {
        const r = (m as { role?: unknown; content?: unknown; ts?: unknown }) ?? {};
        const role = r.role === "assistant" ? "assistant" : r.role === "tool" ? "tool" : "user";
        const content = typeof r.content === "string" ? r.content.slice(0, 4000) : "";
        const ts = typeof r.ts === "number" && r.ts > 0 ? r.ts : undefined;
        return { role: role as MemoryRole, content, ts };
      })
      .filter((m) => m.content);
    if (!messages.length) return json({ error: "No messages to append" }, 400);
    const ok = await appendMessages(memoryId, messages);
    return json({ ok, supabaseEnabled: true, appended: ok ? messages.length : 0 });
  }

  if (req.method === "DELETE") {
    const ok = await clearMemory(memoryId);
    return json({ ok, supabaseEnabled: true, cleared: ok });
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config: Config = {
  path: "/api/arron/memory/supabase",
};
