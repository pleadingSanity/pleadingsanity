// Arron chain health — reports which provider keys are non-empty. Never echoes key values.
// Plain GET: key presence only (no spend).
// ?probe=1: one lightweight GET per provider (credential validity, no spend) + site daily budget counter.
// ?probe=2: one real 1-token chat completion per provider (negligible spend) to prove the exact hop that fails.
import type { Config, Context } from "@netlify/functions";
import { db } from "../../db/index.js";
import { rateLimits } from "../../db/schema.js";
import { sql } from "drizzle-orm";
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const nonEmpty = (v: string | undefined) => Boolean(v && v.trim().length > 8);

async function getProbe(name: string, url: string, headers: Record<string, string>) {
  const started = Date.now();
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { method: "GET", headers, signal: ctrl.signal });
    clearTimeout(t);
    return { provider: name, ok: res.ok, status: res.status, ms: Date.now() - started };
  } catch (error) {
    return { provider: name, ok: false, status: 0, error: String(error).slice(0, 60), ms: Date.now() - started };
  }
}

async function chatProbe(name: string, url: string, headers: Record<string, string>, body: unknown) {
  const started = Date.now();
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body), signal: ctrl.signal });
    clearTimeout(t);
    const text = await res.text();
    return { provider: name, ok: res.ok, status: res.status, ms: Date.now() - started, err: res.ok ? undefined : text.slice(0, 120) };
  } catch (error) {
    return { provider: name, ok: false, status: 0, error: String(error).slice(0, 60), ms: Date.now() - started };
  }
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  const env = process.env;
  const url = new URL(req.url);
  const probeLevel = url.searchParams.get("probe") || "0";
  const keys = {
    openai: nonEmpty(env.OPENAI_API_KEY),
    anthropic: nonEmpty(env.ANTHROPIC_API_KEY) || nonEmpty(env.Anthropic_Key_Arron),
    gemini: nonEmpty(env.GEMINI_API_KEY),
    grok: nonEmpty(env.GROK_API_KEY) || nonEmpty(env.xAI_KEY) || nonEmpty(env.XAI_API_KEY),
    openrouter: nonEmpty(env.OPENROUTER_API_KEY),
  };
  let budget: { cap: number; used: number | null; remaining: number | null } = { cap: Number(env.PS_AI_DAILY_CAP || 3000), used: null, remaining: null };
  try {
    const rows = await db.select().from(rateLimits).where(sql`${rateLimits.key} = 'day:site'`).limit(1);
    if (rows[0]) {
      budget.used = Number(rows[0].count || 0);
      budget.remaining = Math.max(0, budget.cap - budget.used);
    }
  } catch {
    budget = { ...budget, used: -1, remaining: -1 };
  }
  if (probeLevel === "0") {
    return json({ ok: true, chain: ["openai", "anthropic", "gemini", "grok"], keys, budget, note: "Key presence + budget only. ?probe=1 credential check, ?probe=2 real 1-token chat." });
  }
  const openaiKey = env.OPENAI_API_KEY || "";
  const anthropicKey = env.ANTHROPIC_API_KEY || env.Anthropic_Key_Arron || "";
  const geminiKey = env.GEMINI_API_KEY || "";
  const grokKey = env.GROK_API_KEY || env.xAI_KEY || env.XAI_API_KEY || "";
  const model = { openai: env.OPENAI_MODEL || "gpt-4o", anthropic: env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022", gemini: env.GEMINI_MODEL || "gemini-1.5-pro", grok: env.GROK_MODEL || "grok-2" };
  if (probeLevel === "1") {
    const probes = await Promise.all([
      getProbe("openai", "https://api.openai.com/v1/models", { Authorization: `Bearer ${openaiKey}` }),
      getProbe("anthropic", "https://api.anthropic.com/v1/models", { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01" }),
      getProbe("gemini", `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(geminiKey)}`, {}),
      getProbe("grok", "https://api.x.ai/v1/models", { Authorization: `Bearer ${grokKey}` }),
    ]);
    return json({ ok: true, probed: 1, keys, budget, openaiBaseUrlSet: Boolean((env.OPENAI_BASE_URL || "").trim()), model, probes, note: "Credential GET check + budget. ?probe=2 for real chat." });
  }
  const chat = await Promise.all([
    chatProbe("openai", "https://api.openai.com/v1/chat/completions", { Authorization: `Bearer ${openaiKey}` }, { model: model.openai, max_completion_tokens: 1, messages: [{ role: "user", content: "hi" }] }),
    chatProbe("anthropic", "https://api.anthropic.com/v1/messages", { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01" }, { model: model.anthropic, max_tokens: 1, messages: [{ role: "user", content: "hi" }] }),
    chatProbe("gemini", `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model.gemini)}:generateContent?key=${encodeURIComponent(geminiKey)}`, {}, { contents: [{ parts: [{ text: "hi" }] }], generationConfig: { maxOutputTokens: 1 } }),
    chatProbe("grok", "https://api.x.ai/v1/chat/completions", { Authorization: `Bearer ${grokKey}` }, { model: model.grok, max_tokens: 1, messages: [{ role: "user", content: "hi" }] }),
  ]);
  return json({ ok: true, probed: 2, keys, budget, model, chat, note: "Real 1-token chat per provider — status + error snippet. No keys or content returned." });
};
export const config: Config = { path: "/api/ops/ai-probe" };
