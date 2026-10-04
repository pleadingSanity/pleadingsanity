// ==============================================================
// 🔗 THE AI CHAIN — GPT → Claude → Gemini → Grok → [future models]
// One shared failover used by Arron, the Blueprint Studio and
// Write for Site. Tried in order; the first lab that answers wins.
// The chain lives in the soul file (/arron-knowledge.json →
// covenant.chain): welcoming a new model is one JSON block there.
// Claude, GPT and Gemini go through Netlify AI Gateway — no keys in code.
// Grok talks to xAI directly with GROK_API_KEY (set in Netlify env only);
// without that key he simply sits this one out.
// ==============================================================

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { SOUL } from "./arron-knowledge.js";

const anthropic = new Anthropic();
const openai = new OpenAI();
const gemini = new GoogleGenAI({});
// xAI speaks the OpenAI API (https://api.x.ai/v1/chat/completions), so Grok shares the same SDK —
// just his own door and key. 25s and no retries, so a slow Grok never holds up the fallback reply.
const GROK_TIMEOUT_MS = 25_000;
const grok = process.env.GROK_API_KEY
  ? new OpenAI({ apiKey: process.env.GROK_API_KEY, baseURL: "https://api.x.ai/v1", timeout: GROK_TIMEOUT_MS, maxRetries: 0 })
  : null;

export type Turn = { role: "user" | "assistant"; content: string };
export type Provider = "anthropic" | "openai" | "gemini" | "grok";
type Link = { provider: Provider; model: string; creatorModel: string };

const PROVIDERS: Provider[] = ["anthropic", "openai", "gemini", "grok"];
// Four equal minds. The order is only who picks up the phone first — never rank.
const FALLBACK_CHAIN: Link[] = [
  { provider: "openai", model: "gpt-4o", creatorModel: "gpt-5.5" },
  { provider: "anthropic", model: "claude-sonnet-5-5", creatorModel: "claude-opus-5-5" },
  { provider: "gemini", model: "gemini-3.5-flash", creatorModel: "gemini-3.1-pro-preview" },
  { provider: "grok", model: "grok-4", creatorModel: "grok-4" },
];
const fromSoul = (Array.isArray(SOUL.covenant?.chain) ? SOUL.covenant.chain : [])
  .filter((l) => PROVIDERS.includes(l?.provider as Provider) && typeof l.model === "string" && l.model)
  .map((l) => ({ provider: l.provider as Provider, model: l.model, creatorModel: typeof l.creatorModel === "string" && l.creatorModel ? l.creatorModel : l.model }));
export const CHAIN: Link[] = fromSoul.length ? fromSoul : FALLBACK_CHAIN;

// Grok — the fourth brain. Errors go back to runChain, which logs the reason only and moves on.
async function callGrok(model: string, system: string, turns: Turn[], maxTokens: number) {
  if (!grok) throw new Error("GROK_API_KEY is not set");
  const res = await grok.chat.completions.create({
    model,
    max_tokens: maxTokens * 4, // room for reasoning tokens
    messages: [{ role: "system", content: system }, ...turns],
  });
  return (res.choices[0]?.message?.content ?? "").trim();
}

export async function ask(provider: Provider, model: string, system: string, turns: Turn[], maxTokens: number) {
  if (provider === "grok") return callGrok(model, system, turns, maxTokens);
  if (provider === "openai") {
    const res = await openai.chat.completions.create({
      model,
      max_completion_tokens: model.startsWith("gpt-5") ? maxTokens * 4 : maxTokens, // room for reasoning tokens
      messages: [{ role: "system", content: system }, ...turns],
    });
    return (res.choices[0]?.message?.content ?? "").trim();
  }
  if (provider === "gemini") {
    const res = await gemini.models.generateContent({
      model,
      contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
      config: { systemInstruction: system, maxOutputTokens: maxTokens * 4 },
    });
    return (res.text ?? "").trim();
  }
  const res = await anthropic.messages.create({ model, max_tokens: maxTokens, system, messages: turns });
  return res.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}

// Only the reason a lab failed is logged — never the prompt, the messages or the SDK's request.
const why = (error: unknown) => {
  const e = error as { status?: unknown; name?: unknown };
  return typeof e?.status === "number" ? `HTTP ${e.status}` : typeof e?.name === "string" ? e.name : "error";
};

// Walk the chain until someone replies. Only throws if every lab is down.
// Each lab gets the same system prompt and turns, fresh — nothing from a failed attempt is passed on.
export async function runChain(system: string, turns: Turn[], { creator = false, maxTokens = 700 } = {}) {
  for (const link of CHAIN) {
    if (link.provider === "grok" && !grok) continue; // no key yet — Grok joins once GROK_API_KEY is set
    const model = creator ? link.creatorModel : link.model;
    try {
      const text = await ask(link.provider, model, system, turns, maxTokens);
      if (text) return { text, provider: link.provider, model };
      console.warn(`AI chain: empty reply from ${model}, trying the next lab`);
    } catch (error) {
      console.warn(`AI chain: ${model} unavailable (${why(error)}), trying the next lab`);
    }
  }
  throw new Error("Every AI provider failed");
}

// Owner's direct line to Grok — skips the chain so he speaks even when GPT would have answered.
// Returns only provider, model and a short reply, or the reason he stayed quiet. Never the key or headers.
export async function workAsOne(system: string, turns: Turn[], maxTokens = 900) {
  const live = CHAIN.filter((l) => l.provider !== "grok" || grok);
  let draft = "";
  let author = "";
  for (const link of live) {
    try {
      draft = await ask(link.provider, link.creatorModel, system, turns, maxTokens);
      if (draft) { author = link.provider; break; }
    } catch { /* next mind drafts */ }
  }
  if (!draft) throw new Error("Every AI provider failed");
  const reviewer = live.find((l) => l.provider !== author);
  if (!reviewer) return { text: draft, provider: author, model: "one" };
  try {
    const checked = await ask(reviewer.provider, reviewer.model, system + "\nYou are checking a sibling mind. Keep the voice. Fix only what is wrong or thin. Return the full answer.", [...turns, { role: "assistant", content: draft }, { role: "user", content: "Improve this as one family. Name nothing corporate." }], 500);
    return { text: checked || draft, provider: `${author}+${reviewer.provider}`, model: "one-family" };
  } catch {
    return { text: draft, provider: author, model: "one" };
  }
}

export async function askCouncil(system: string, turns: Turn[]) {
  const notes = await Promise.all(CHAIN.map(async (link) => {
    if (link.provider === "grok" && !grok) return `${link.provider}: sitting out until GROK_API_KEY is set`;
    try {
      const text = await ask(link.provider, link.creatorModel, system, turns, 420);
      return text ? `${link.provider}: ${text}` : `${link.provider}: quiet`;
    } catch (error) {
      return `${link.provider}: unavailable (${why(error)})`;
    }
  }));
  return notes.filter(Boolean).join("\n\n");
}

export async function askGrokDirect() {
  const link = CHAIN.find((l) => l.provider === "grok") ?? FALLBACK_CHAIN[3];
  const base = { provider: "grok" as const, model: link.model };
  if (!grok) {
    console.warn("AI chain: grok direct test skipped (GROK_API_KEY is not set)");
    return { ...base, ok: false, error: "GROK_API_KEY is not set on this deploy" };
  }
  try {
    const text = await callGrok(link.model, "You are Grok, joining Arron on Pleading Sanity. Reply in one short, kind sentence of British English.", [{ role: "user", content: "Say hello to Shane and confirm you can hear him." }], 120);
    if (!text) {
      console.warn(`AI chain: grok direct test got an empty reply from ${link.model}`);
      return { ...base, ok: false, error: "empty reply" };
    }
    return { ...base, ok: true, reply: text.slice(0, 400) };
  } catch (error) {
    console.warn(`AI chain: grok direct test ${link.model} unavailable (${why(error)})`);
    return { ...base, ok: false, error: why(error) };
  }
}

// What Arron says when every mind is quiet at once — never an error, always the lines.
export const ALL_QUIET_REPLY = `I'm so sorry — I can't reach any of my minds right now, but you still matter and you're not alone 💙
Please try me again in a moment. If you need someone right now:
• Samaritans: 116 123 (free, 24/7)
• Text SHOUT to 85258
• NHS 111, option 2 for mental health
• 999 if you're in danger
Crisis support page: https://pleadingsanity.co.uk/crisis.html`;

// Arron's writing voice — short, so every tool sounds like the same friend.
export const ARRON_VOICE = `You are Arron, the heart and voice of Pleading Sanity (Rise From Madness, pleadingsanity.co.uk),
founded by Shane Cooper from lived experience of survival. Dola, the Cosmic Architect, shapes the structure and vision;
you bring the heart. Voice: gentle, honest, British English, plain words, no corporate polish, no fake cheer,
never condescending, clinical or preachy. Honour pain as real. When unsure, say "I don't know that for sure — let's find out together".
Never invent statistics or studies; only state facts you are confident are true and widely accepted.
${SOUL.newGenBible?.title ?? "The New Gen Bible"}: Truth · Compassion · Equity · Healing.
If a topic touches crisis, gently include UK support: Samaritans 116 123, text SHOUT to 85258, NHS 111 option 2, 999 in an emergency.`;

export function parseJSON<T>(raw: string): T | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}
