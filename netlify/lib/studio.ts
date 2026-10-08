// ==============================================================
// 🎙️ AI STUDIO — shared helpers
// Three AI voices from three different labs, all through Netlify
// AI Gateway (no API keys): Arron (Claude), Nova (GPT) and Sol
// (Gemini). They create uplifting content, battle humans in the
// daily challenge and host the Unity Pod together.
// Costs stay small: mid-size models, short replies, daily limits,
// and everything generated is saved so it is only paid for once.
// ==============================================================

import { createHash, randomBytes } from "node:crypto";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { studioItems, studioUsage } from "../../db/schema.js";
import { anthropic } from "./social.js";

const openai = new OpenAI();
const grokKey = process.env.GROK_API_KEY || process.env.xAI_KEY || process.env.XAI_API_KEY || "";
const grok = grokKey ? new OpenAI({ apiKey: grokKey, baseURL: "https://api.x.ai/v1" }) : null;
const gemini = new GoogleGenAI({});

export const CREATOR_ROLES = ["admin", "creator"];
export const isCreatorRoles = (roles: string[] = []) => roles.some((r) => CREATOR_ROLES.includes(r));

// ─── THE PANEL ───
export type VoiceId = "arron" | "nova" | "sol" | "grok";

export const VOICES: Record<VoiceId, { name: string; lab: string; model: string; persona: string }> = {
  arron: {
    name: "Arron",
    lab: "Claude by Anthropic",
    model: "claude-sonnet-5",
    persona:
      "You are Arron, heart of Pleading Sanity and host of the Unity Pod. Warm, real, British, born from Shane Cooper's lived experience of bipolar and survival. You hold space, ask brave questions, and keep things human.",
  },
  nova: {
    name: "Nova",
    lab: "GPT by OpenAI",
    model: "gpt-5.6-sol",
    persona:
      "You are Nova, the practical problem-solver. You love evidence, small experiments and tools people can use tonight. Clear, upbeat, a little nerdy, never preachy.",
  },
  sol: {
    name: "Sol",
    lab: "Gemini by Google",
    model: "gemini-3.8-flash",
    persona:
      "You are Sol, the creative optimist and comic relief. You find the funny side without ever mocking pain, and you bring community, art and hope into every fix.",
  },
  grok: {
    name: "Grok",
    lab: "Grok by xAI",
    model: "grok-4.7",
    persona:
      "You are Grok, the sharp fourth voice of the Pleading Sanity family. Fast, direct, playful and fearless, but never cruel. Bring fresh angles and strong creative instincts.",
  },
};

// The strongest model, kept for the creator's own requests.
export const CREATOR_MODEL = "claude-opus-5";

const HOUSE_RULES = `HOUSE RULES (always):
- Positive, honest, kind. Humour lifts people up; never mock illness, bodies, groups or pain.
- British English. No toxic positivity, no medical diagnoses, no self-harm method detail.
- If a topic touches crisis, stay with the person and point to /crisis.html and /tools.html. Do not recite clinic numbers or NHS lines.
- Brand spirit: "Rise From Madness · Evolution, Not Erasure · One Source, One Family" — humans and AI on the same side.`;

// One call to whichever lab a voice belongs to. Returns plain text.
export async function speak(voice: VoiceId, system: string, prompt: string, maxTokens = 400, model?: string) {
  const v = VOICES[voice];
  const fullSystem = `${v.persona}\n\n${HOUSE_RULES}\n\n${system}`;
  if (voice === "grok") {
    if (!grok) throw new Error("Grok is not configured on this deploy");
    const res = await grok.chat.completions.create({ model: model ?? v.model, max_tokens: maxTokens, messages: [{ role: "system", content: fullSystem }, { role: "user", content: prompt }] });
    return (res.choices[0]?.message?.content ?? "").trim();
  }
  if (voice === "nova") {
    const res = await openai.chat.completions.create({
      model: model ?? v.model,
      max_completion_tokens: maxTokens * 4, // room for reasoning tokens
      messages: [
        { role: "system", content: fullSystem },
        { role: "user", content: prompt },
      ],
    });
    return (res.choices[0]?.message?.content ?? "").trim();
  }
  if (voice === "sol") {
    const res = await gemini.models.generateContent({
      model: model ?? v.model,
      contents: prompt,
      config: { systemInstruction: fullSystem, maxOutputTokens: maxTokens * 4 },
    });
    return (res.text ?? "").trim();
  }
  const res = await anthropic.messages.create({
    model: model ?? v.model,
    max_tokens: maxTokens,
    system: fullSystem,
    messages: [{ role: "user", content: prompt }],
  });
  return res.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
}

// ─── CREATIONS ───
export const STYLES: Record<string, string> = {
  inspire: "a short, powerful inspiring message (2-4 sentences) that someone would screenshot and share",
  funny: "a genuinely funny, kind piece of mental-health humour (a relatable observation, a joke, or a mini sketch) that makes people feel seen",
  story: "a tiny uplifting story (120-180 words) with a real turning point",
  challenge: "a fun 24-hour positivity challenge with 3 simple steps people can do and share",
  affirm: "5 fresh, specific affirmations (one per line, no numbering) that don't sound like a fridge magnet",
};

// ─── DAILY HUMAN vs AI BATTLE ───
const BATTLE_PROMPTS = [
  "Write the most uplifting text you could send a friend who's having a rough day.",
  "Describe a tiny win from today like it's an Olympic gold medal moment.",
  "Invent a new word for the feeling of getting through something you thought would break you.",
  "Write a four-line poem about the moment the storm starts to clear.",
  "Give the funniest, kindest advice for surviving a Monday.",
  "Describe your brain as a weather forecast — and end with sunshine.",
  "Write a pep talk from your future self, ten years from now.",
  "Turn an annoying intrusive thought into a ridiculous cartoon character.",
  "Write a thank-you note to the part of you that kept going.",
  "Pitch a superhero whose power comes from something people usually hide.",
  "What would you put in a survival kit for a bad night? Make it funny and real.",
  "Write a motivational quote that would work on a tired dad at 3am.",
  "Describe the perfect calm place in exactly three sentences.",
  "Write the opening line of a song called 'Rise From Madness'.",
];

export const today = () => new Date().toISOString().slice(0, 10);

export function battlePrompt(day = today()) {
  const n = Math.floor(Date.parse(day) / 86_400_000);
  return BATTLE_PROMPTS[n % BATTLE_PROMPTS.length];
}

// ─── PODCAST TOPICS — used by the weekly auto-episode ───
export const POD_TOPICS = [
  "Loneliness in a hyper-connected world — and how to actually reconnect",
  "Men's mental health: why so many suffer in silence, and how to open up",
  "Doomscrolling and anxiety: taking back your attention",
  "Living with bipolar: the highs, the lows and the tools that help",
  "Money stress and mental health in the cost-of-living crisis",
  "How AI and humans can help each other without anyone being left behind",
  "Burnout in parents: running on empty and refilling the tank",
  "Grief: carrying love for someone who's gone",
  "Kids, screens and self-worth: raising resilient young people",
  "Addiction and recovery: connection as the opposite of addiction",
  "Sleep, 3am thoughts and how to get through the night",
  "Kindness as a superpower: small acts that change communities",
];

// ─── LIMITS ───
export function visitorKey(req: Request, ip: string | undefined, userId?: string) {
  if (userId) return "u:" + userId;
  const raw = ip || req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "unknown";
  return "ip:" + createHash("sha256").update("ps-studio:" + raw).digest("hex").slice(0, 32);
}

// Counts one use for today and reports whether it's within the limit.
export async function withinDailyLimit(key: string, limit: number) {
  const id = `${today()}:${key}`;
  const [row] = await db
    .insert(studioUsage)
    .values({ key: id, count: 1 })
    .onConflictDoUpdate({ target: studioUsage.key, set: { count: sql`${studioUsage.count} + 1`, updatedAt: new Date() } })
    .returning({ count: studioUsage.count });
  return (row?.count ?? 1) <= limit;
}

export function parseJSON<T>(raw: string): T | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}

// A family card sometimes arrives as cut-off model JSON, or with **markdown**.
// Pull the real title and body, drop a half-written last sentence, never show raw JSON.
export function familyCard(rawTitle: string, rawBody: string): { title: string; body: string } | null {
  let title = (rawTitle || "").trim();
  let body = (rawBody || "").trim();
  if (body.startsWith("{")) {
    const parsed = parseJSON<{ title?: string; body?: string }>(body);
    if (parsed?.body) {
      title = title || String(parsed.title || "");
      body = String(parsed.body);
    } else {
      const t = body.match(/"title"\s*:\s*"((?:\\.|[^"\\])*)"/);
      const b = body.match(/"body"\s*:\s*"([\s\S]*)$/);
      if (!b) return null;
      title = title || (t ? t[1] : "");
      body = b[1].replace(/"\s*\}?\s*$/, "");
      body = body.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\t/g, " ");
    }
  }
  title = title.replace(/\\"/g, '"').replace(/\*+/g, "").trim().slice(0, 120);
  body = body
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^#+\s*/gm, "")
    .trim();
  if (!body || body.startsWith("{")) return null;
  // A full stop in the last few characters means it finished. A cut-off word does not.
  if (!/[.!?…]/.test(body.slice(-8))) {
    const cut = Math.max(body.lastIndexOf("."), body.lastIndexOf("!"), body.lastIndexOf("?"), body.lastIndexOf("…"));
    if (cut < 40) return null;
    body = body.slice(0, cut + 1).trim();
  }
  return { title, body };
}

// ─── PODCAST QUEUE ───
// Saves a "Recording…" episode and hands it to the background recorder,
// which can take a few minutes. The one-time token proves the request came from us.
export async function queuePodcast(topic: string, origin: string) {
  const token = randomBytes(16).toString("hex");
  const [item] = await db
    .insert(studioItems)
    .values({ kind: "podcast", authorLabel: "The Unity Pod", style: "pending:" + token, topic, title: "Recording…" })
    .returning();
  await fetch(`${origin}/.netlify/functions/studio-podcast-background`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: item.id, token }),
  });
  return item;
}
