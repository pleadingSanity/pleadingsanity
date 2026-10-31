// ==============================================================
// 🧠 ARRON PHASE 2 — Supabase long-term memory layer
// A second, portable copy of Arron's chat history, stored in
// Supabase (Postgres via PostgREST) and keyed by memoryId.
// Best-effort ONLY: if SUPABASE_URL / SUPABASE_ANON_KEY are not
// set, or any Supabase call fails, every function below returns a
// neutral empty/false value and Arron keeps working on the local
// Netlify Database (the source of truth). A Supabase failure must
// NEVER break a chat reply or a Forget Me.
//
// PRIVACY: nothing a person said is ever written to the logs.
// Logs carry only the operation name, an error type, and the first
// 8 chars of the memoryId (enough to correlate, not enough to
// identify). Writes happen only when the caller has consent
// (saveToCloud === true or a signed-in user) — the caller enforces
// that; this layer is dumb storage. "Forget Me" (clearMemory)
// removes every row for that memoryId.
//
// Shane — run this once in the Supabase SQL editor:
//
//   create table if not exists public.arron_chat_memory (
//     id         bigint generated always as identity primary key,
//     memory_id  text not null,
//     role       text not null check (role in ('user','assistant','tool')),
//     content    text not null,
//     created_at timestamptz not null default now()
//   );
//   create index if not exists arron_chat_memory_memory_id_idx
//     on public.arron_chat_memory (memory_id, created_at desc);
//   -- Recommended: enable RLS and let the anon key only INSERT.
//   -- Reads/deletes from this function use the same anon key, so
//   -- either add a permissive policy for the anon role or use a
//   -- service-role key (SUPABASE_SERVICE_KEY) for reads. The layer
//   -- degrades gracefully either way.
//   -- alter table public.arron_chat_memory enable row level security;
//   -- create policy "anon insert only" on public.arron_chat_memory
//   --   for insert to anon with check (true);
// ==============================================================

export type MemoryRole = "user" | "assistant" | "tool";
export type MemoryMessage = { role: MemoryRole; content: string; ts?: number };
export type StoredMessage = { role: MemoryRole; content: string; created_at: string };

const TABLE = "arron_chat_memory";
const MAX_CONTENT = 4000; // match Arron's per-message cap
const FETCH_TIMEOUT_MS = 8_000;

const supabaseUrl = () => (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const supabaseKey = () => (process.env.SUPABASE_ANON_KEY || "").trim();

/** True iff both env vars are present. When false, every op is a no-op. */
export function supabaseEnabled(): boolean {
  return Boolean(supabaseUrl() && supabaseKey());
}

function authHeaders(): Record<string, string> {
  const key = supabaseKey();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };
}

// Logs never contain message content. Only the op, error kind, and
// a short memoryId prefix.
const warn = (op: string, memoryId: string, error: unknown) => {
  const kind = error instanceof Error ? error.name : "error";
  console.warn(`[arron-supabase] ${op} failed (${kind}); memory=${memoryId.slice(0, 8)}… — degraded to local memory`);
};

async function withTimeout(url: string, init: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Append one or more messages to Supabase memory.
 * Returns true on success, false on any failure (including disabled).
 * Never throws.
 */
export async function appendMessages(memoryId: string, messages: MemoryMessage[]): Promise<boolean> {
  if (!supabaseEnabled() || !memoryId || !Array.isArray(messages) || messages.length === 0) return false;
  try {
    const now = Date.now();
    const rows = messages.map((m, i) => ({
      memory_id: memoryId,
      role: m.role === "assistant" ? "assistant" : m.role === "tool" ? "tool" : "user",
      content: String(m.content ?? "").slice(0, MAX_CONTENT),
      created_at: new Date(typeof m.ts === "number" && m.ts > 0 ? m.ts : now + i).toISOString(),
    }));
    const res = await withTimeout(`${supabaseUrl()}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(rows),
    });
    if (!res.ok) throw new Error(`http_${res.status}`);
    return true;
  } catch (error) {
    warn("append", memoryId, error);
    return false;
  }
}

/**
 * Read the newest lastN messages for a memoryId, oldest-first.
 * Returns [] when disabled, empty, or on any error. Never throws.
 */
export async function readHistory(memoryId: string, lastN = 50): Promise<StoredMessage[]> {
  if (!supabaseEnabled() || !memoryId) return [];
  try {
    const limit = Math.max(1, Math.min(200, Math.floor(lastN) || 50));
    const qs = `?memory_id=eq.${encodeURIComponent(memoryId)}&select=role,content,created_at&order=created_at.desc&limit=${limit}`;
    const res = await withTimeout(`${supabaseUrl()}/rest/v1/${TABLE}${qs}`, {
      method: "GET",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`http_${res.status}`);
    const rows = (await res.json()) as StoredMessage[];
    return Array.isArray(rows) ? rows.reverse() : [];
  } catch (error) {
    warn("read", memoryId, error);
    return [];
  }
}

/**
 * Delete every row for a memoryId ("Forget Me" in the cloud).
 * Returns true on success, false on any failure. Never throws.
 */
export async function clearMemory(memoryId: string): Promise<boolean> {
  if (!supabaseEnabled() || !memoryId) return false;
  try {
    const qs = `?memory_id=eq.${encodeURIComponent(memoryId)}`;
    const res = await withTimeout(`${supabaseUrl()}/rest/v1/${TABLE}${qs}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`http_${res.status}`);
    return true;
  } catch (error) {
    warn("clear", memoryId, error);
    return false;
  }
}
