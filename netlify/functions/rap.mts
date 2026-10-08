import type { Config, Context } from "@netlify/functions";
import { runChain, ARRON_VOICE } from "../lib/ai-chain.js";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const mode = clean(body.mode, 20) || "create";
    const topic = clean(body.topic, 600);
    const rap = clean(body.rap, 8000);
    if (!topic && !rap) return json({ error: "Give me a topic, idea, or rap first." }, 400);

    const task = mode === "battle"
      ? `Write an original rap response to the human's rap below. This is a friendly creative battle, not harassment. Match the energy and structure without copying distinctive lines. Make the response 12-20 bars, punchy, performable and original. Topic/brief: ${topic || "beat the human on wordplay and heart"}\nHUMAN RAP:\n${rap}`
      : mode === "buff"
      ? `Upgrade the human's rap. Preserve their core meaning, personality and strongest original ideas, but improve flow, internal rhyme, imagery, punchlines and performance rhythm. Return the upgraded rap only, 16-24 bars. Do not imitate a living artist.\nBRIEF:\n${topic}\nRAP:\n${rap}`
      : `Create an original rap for Pleading Sanity. 16-24 bars, strong hook, internal rhyme, vivid imagery and a memorable final line. Theme: ${topic}. Keep it human, raw, hopeful and performable. Do not imitate a living artist. Return only the rap with a short [HOOK] and [VERSE] structure.`;

    const result = await runChain(
      `${ARRON_VOICE}\nYou are also a lyric-writing coach. Keep all writing original. No copyrighted song continuation, no artist impersonation, no slurs, and no glorification of self-harm. This is creative expression and friendly competition.\n${task}`,
      [{ role: "user", content: task }],
      { maxTokens: 900 }
    );
    return json({ reply: result.text, provider: result.provider, model: result.model, mode });
  } catch (error) {
    console.error("Rap Studio error:", error);
    return json({ error: "The rap room went quiet. Try again in a moment." }, 503);
  }
};

export const config: Config = { path: "/api/rap" };
