// Arron chain health — reports which provider keys are non-empty. Never echoes key values.
// Plain GET: key presence only (no spend).
// ?probe=1: one lightweight GET per provider (credential validity, no spend) + site daily budget counter.
// ?probe=2: one real 1-token chat completion per provider (negligible spend) to prove the exact hop that fails.
// Probe levels 1 and 2 require a verified owner session and the AI rate limit.
// PS_PROBE_TOKEN, when configured, is an additional check. probe=0 stays public.
import type { Config, Context } from "@netlify/functions";
import { db } from "../../db/index.js";
import { rateLimits } from "../../db/schema.js";
import { sql } from "drizzle-orm";
import { allow, slowDown } from "../lib/rate-limit.js";
import { optionalUser } from "../lib/social.js";
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const nonEmpty = (v: string | undefined) => Boolean(v && v.trim().length > 8);
// Never echo a credential-looking string back to the client. Provider error
// bodies shouldn't contain them, but a defensive strip costs nothing.
const TOKENISH = /(sk-[a-zA-Z0-9]{16,}|nfp_[a-zA-Z0-9]{16,}|ghp_[a-zA-Z0-9]{16,}|xox[a-zA-Z]-[a-zA-Z0-9]{8,}|Bearer [A-Za-z0-9._-]{16,})/g;
export const sanitizeProbeError = (s: string) => s.replace(TOKENISH, "[redacted]");
async function getProbe(name: string, url: string, headers: Record<string, string>) {
  const started = Date.now();
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { method: "GET", headers, signal: ctrl.signal });
    clearTimeout(t);
    return { provider: name, ok: res.ok, status: res.status, ms: Date.now() - started };
  } catch (error) {
    return { provider: name, ok: false, status: 0, error: sanitizeProbeError(String(error).slice(0, 60)), ms: Date.now() - started };
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
    return { provider: name, ok: res.ok, status: res.status, ms: Date.now() - started, err: res.ok ? undefined : sanitizeProbeError(text.slice(0, 120)) };
  } catch (error) {
    return { provider: name, ok: false, status: 0, error: sanitizeProbeError(String(error).slice(0, 60)), ms: Date.now() - started };
  }
}
export default async (req: Request, context: Context) => {
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
  // Active probes require verified owner login even when no probe token is set.
  // probe=0 (key presence + budget) stays public and never calls a provider.
  if (probeLevel !== "0" && probeLevel !== "1" && probeLevel !== "2") {
    return json({ error: "probe must be 0, 1 or 2", keys, budget }, 400);
  }
  if (probeLevel !== "0") {
    const user = await optionalUser();
    if (!user?.isOwner) return json({ error: "Not found" }, 404);
    if (probeLevel === "2" && env.PS_PAID_PROBES_APPROVED !== "true") {
      return json({ error: "Paid probes are disabled." }, 403);
    }
    const token = (env.PS_PROBE_TOKEN || "").trim();
    const given = (url.searchParams.get("token") || "").trim();
    if (token && given !== token) {
      return json({ error: "Probe locked. Set ?token= to PS_PROBE_TOKEN, or use ?probe=0 for key presence only.", keys, budget }, 403);
    }
    if (!(await allow("ai", context))) {
      return slowDown("Probes are rate-limited — wait a minute, or use ?probe=0 for key presence only.");
    }
  }
  if (probeLevel === "0") {
    return json({ ok: true, chain: ["openai", "anthropic", "gemini", "grok"], keys, budget, note: "Key presence + budget only. Active probes require verified owner login, rate limiting and any configured PS_PROBE_TOKEN." });
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
    return json({ ok: true, probed: 1, keys, budget, openaiBaseUrlSet: Boolean((env.OPENAI_BASE_URL || "").trim()), model, probes, note: "Credential GET check + budget. ?probe=2 for real chat. No keys returned." });
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
