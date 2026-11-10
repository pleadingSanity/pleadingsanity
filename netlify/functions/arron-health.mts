// Arron chain health — reports which provider keys are non-empty. Never echoes key values.
// Plain GET: key presence only (no spend). ?probe=1: one lightweight GET per provider to
// verify the credential actually works (status code only, no content, no token spend).
import type { Config, Context } from "@netlify/functions";
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const nonEmpty = (v: string | undefined) => Boolean(v && v.trim().length > 8);

async function probe(name: string, url: string, headers: Record<string, string>) {
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

export default async (req: Request, _context: Context) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  const env = process.env;
  const url = new URL(req.url);
  const keys = {
    openai: nonEmpty(env.OPENAI_API_KEY),
    anthropic: nonEmpty(env.ANTHROPIC_API_KEY) || nonEmpty(env.Anthropic_Key_Arron),
    gemini: nonEmpty(env.GEMINI_API_KEY),
    grok: nonEmpty(env.GROK_API_KEY) || nonEmpty(env.xAI_KEY) || nonEmpty(env.XAI_API_KEY),
    openrouter: nonEmpty(env.OPENROUTER_API_KEY),
  };
  if (url.searchParams.get("probe") !== "1") {
    return json({ ok: true, chain: ["openai", "anthropic", "gemini", "grok"], keys, note: "Key presence only — no live API calls made. Connectivity not proven. Add ?probe=1 for live credential check." });
  }
  // Live probe — one cheap GET per provider, status code only, no token spend.
  const openaiKey = env.OPENAI_API_KEY || "";
  const anthropicKey = env.ANTHROPIC_API_KEY || env.Anthropic_Key_Arron || "";
  const geminiKey = env.GEMINI_API_KEY || "";
  const grokKey = env.GROK_API_KEY || env.xAI_KEY || env.XAI_API_KEY || "";
  const probes = await Promise.all([
    probe("openai", "https://api.openai.com/v1/models", { Authorization: `Bearer ${openaiKey}` }),
    probe("anthropic", "https://api.anthropic.com/v1/models", { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01" }),
    probe("gemini", `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(geminiKey)}`, {}),
    probe("grok", "https://api.x.ai/v1/models", { Authorization: `Bearer ${grokKey}` }),
  ]);
  return json({
    ok: true,
    probed: true,
    keys,
    openaiBaseUrlSet: Boolean((env.OPENAI_BASE_URL || "").trim()),
    models: { openai: env.OPENAI_MODEL, anthropic: env.CLAUDE_MODEL, gemini: env.GEMINI_MODEL, grok: env.GROK_MODEL },
    probes,
    note: "Live credential probe — status codes only, no content or keys returned.",
  });
};
export const config: Config = { path: "/api/ops/ai-probe" };
