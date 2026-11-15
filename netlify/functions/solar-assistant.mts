// Insane Solar assistant. Guests can ask. The Arron chain answers.
// Crisis is decided before any provider call and before the rate limit.
import type { Config, Context } from "@netlify/functions";
import { runChain } from "../lib/ai-chain.js";
import { allow, slowDown } from "../lib/rate-limit.js";
import { SOLAR_BOUNDARY, prepareSolarTurn } from "../lib/solar-knowledge.js";

const BUDGET_MS = 20_000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  let body: { message?: unknown; question?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const message = typeof body.message === "string" ? body.message : typeof body.question === "string" ? body.question : "";
  const turn = prepareSolarTurn(message);
  if (!turn.ok) return json({ error: turn.error }, turn.status);
  if (!turn.callModel) return json({ reply: turn.reply, provider: "none", crisis: true });
  if (!(await allow("ai", context))) return slowDown("The solar desk needs a minute. Try again shortly, or call 07999 899304.");
  try {
    const result = await Promise.race([
      runChain(turn.system, [{ role: "user", content: turn.user }], { maxTokens: 700, budgetMs: BUDGET_MS, spares: false }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("timeout")), BUDGET_MS + 1_500);
      }),
    ]);
    const reply = `${result.text}\n\n${SOLAR_BOUNDARY}`;
    return json({ reply, provider: result.provider, model: result.model, crisis: false });
  } catch (error) {
    console.error("Solar assistant:", error instanceof Error ? error.name : "error");
    return json({
      reply: `The solar desk is quiet just now. Call Titan 2 on 07999 899304 or WhatsApp 447711147663.\n\n${SOLAR_BOUNDARY}`,
      provider: "none",
      crisis: false,
    }, 503);
  }
};

export const config: Config = { path: "/api/solar" };
