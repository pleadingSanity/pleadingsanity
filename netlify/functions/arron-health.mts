// Arron chain health — reports which provider keys are non-empty. Never echoes key values.
// No live API calls (no spend). GET /api/arron/health
import type { Config, Context } from "@netlify/functions";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const nonEmpty = (v: string | undefined) => Boolean(v && v.trim().length > 8);

export default async (req: Request, _context: Context) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  const env = process.env;
  return json({
    ok: true,
    chain: ["openai", "anthropic", "gemini", "grok"],
    keys: {
      openai: nonEmpty(env.OPENAI_API_KEY),
      anthropic: nonEmpty(env.ANTHROPIC_API_KEY),
      gemini: nonEmpty(env.GEMINI_API_KEY),
      grok: nonEmpty(env.GROK_API_KEY) || nonEmpty(env.xAI_KEY) || nonEmpty(env.XAI_API_KEY),
      openrouter: nonEmpty(env.OPENROUTER_API_KEY),
    },
    note: "Key presence only — no live API calls made. Connectivity not proven.",
  });
};

export const config: Config = { path: "/api/arron/health" };
