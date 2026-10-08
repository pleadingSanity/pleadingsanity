// ==============================================================
// 🔗 THE AI CHAIN — GPT → Claude → Gemini → Grok → [future models]
// One shared failover used by Arron, the Blueprint Studio and
// Write for Site. Tried in order; the first lab that answers wins.
// The chain lives in the soul file (/arron-knowledge.json →
// covenant.chain): welcoming a new model is one JSON block there.
// NOTE: the soul file OVERRIDES the fallback list below, so the order
// in covenant.chain must also be GPT, Claude, Gemini, Grok.
// Claude, GPT and Gemini go through Netlify AI Gateway — no keys in code.
// Grok talks to xAI directly. The live site stores the key as GROK_API_KEY,
// and an older copy as xAI_KEY. Either name is enough. No key is written here.
// If neither name is set, he sits this one out.
// ==============================================================

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { SOUL } from "./arron-knowledge.js";

// Every lab gets 8s so a slow or hung provider hands over to the next one quickly. No single point of failure.
const LAB_TIMEOUT_MS = 8_000;
const anthropic = new Anthropic({ timeout: LAB_TIMEOUT_MS, maxRetries: 1 });
const openai = new OpenAI({ timeout: LAB_TIMEOUT_MS, maxRetries: 1 });
const gemini = new GoogleGenAI({ httpOptions: { timeout: LAB_TIMEOUT_MS } });
const GROK_TIMEOUT_MS = LAB_TIMEOUT_MS;
const grokKey = process.env.GROK_API_KEY || process.env.xAI_KEY || process.env.XAI_API_KEY || "";
const grok = grokKey
  ? new OpenAI({ apiKey: grokKey, baseURL: "https://api.x.ai/v1", timeout: GROK_TIMEOUT_MS, maxRetries: 0 })
  : null;
const openaiDirect = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: "https://api.openai.com/v1", timeout: LAB_TIMEOUT_MS, maxRetries: 0 })
  : null;
// Free last-resort minds. Netlify injects the OpenRouter door. No key is written here.
// They are not in the council. They speak only when GPT, Claude, Gemini and Grok are all quiet.
// A name that does not end in :free can bill. Those stay silent until PS_IN_PROFIT is set on Netlify.
// Not here: labs that may train on a person's words, the free router (it can pick one of those),
// music models, and Space Bunny, which retires on 5 Oct 2026.
// PRIVACY: messages sent to these spares go through OpenRouter. The privacy page must say so.
const FREE_SPARES: { name: string; model: string }[] = [
  { name: "gemma", model: "google/gemma-4-31b-it:free" },
  { name: "qwen", model: "qwen/qwen3.8-27b:free" },
  { name: "gemma-small", model: "google/gemma-4-26b-a4b-it:free" },
  { name: "ling", model: "inclusionai/ling-3.0-flash-sante:free" },
  { name: "laguna", model: "poolside/laguna-s-2.1:free" },
  { name: "laguna-small", model: "poolside/laguna-xs-2.1:free" },
  { name: "apodex", model: "apodex/apodex-1.1-mini:free" },
  { name: "dots", model: "dots-studio/dots-3-note-preview:free" },
  { name: "north-code", model: "cohere/north-mini-code:free" },
];
const PAID_SPARES: { name: string; model: string }[] = [
  { name: "ling-paid", model: "inclusionai/ling-3.1-flash" },
];

function inProfit() {
  const v = (process.env.PS_IN_PROFIT || "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export type Turn = { role: "user" | "assistant"; content: string };
export type Provider = "anthropic" | "openai" | "gemini" | "grok";
type Link = { provider: Provider; model: string; creatorModel: string };

const PROVIDERS: Provider[] = ["openai", "anthropic", "gemini", "grok"];
// Four equal minds. The order is only who picks up the phone first — never rank.
const FALLBACK_CHAIN: Link[] = [
  { provider: "openai", model: "gpt-5.6-sol", creatorModel: "gpt-5.6-sol" },
  { provider: "anthropic", model: "claude-sonnet-5", creatorModel: "claude-opus-5" },
  { provider: "gemini", model: "gemini-3.8-flash", creatorModel: "gemini-3.8-flash" },
  { provider: "grok", model: "grok-4.7", creatorModel: "grok-4.7" },
];
const fromSoul = (Array.isArray(SOUL.covenant?.chain) ? SOUL.covenant.chain : [])
  .filter((l) => PROVIDERS.includes(l?.provider as Provider) && typeof l.model === "string" && l.model)
  .map((l) => ({ provider: l.provider as Provider, model: l.model, creatorModel: typeof l.creatorModel === "string" && l.creatorModel ? l.creatorModel : l.model }));
export const CHAIN: Link[] = fromSoul.length ? fromSoul : FALLBACK_CHAIN;

// Grok — the fourth brain. Errors go back to runChain, which logs the reason only and moves on.
async function callGrok(model: string, system: string, turns: Turn[], maxTokens: number) {
  if (!grok) throw new Error("No Grok key on this deploy");
  const names = model === "grok-3" ? [model] : [model, "grok-3"];
  let last: unknown;
  for (const id of names) {
    try {
      const res = await grok.chat.completions.create({
        model: id,
        max_tokens: maxTokens * 4,
        messages: [{ role: "system", content: system }, ...turns],
      });
      const text = (res.choices[0]?.message?.content ?? "").trim();
      if (text) return text;
    } catch (error) {
      last = error;
      console.warn(`AI chain: ${id} unavailable (${why(error)}), trying the next Grok name`);
    }
  }
  throw last instanceof Error ? last : new Error("Grok was quiet");
}

async function callOpenAI(model: string, system: string, turns: Turn[], maxTokens: number) {
  const body = {
    model,
    max_completion_tokens: model.startsWith("gpt-5") ? maxTokens * 4 : maxTokens,
    messages: [{ role: "system" as const, content: system }, ...turns],
  };
  try {
    const res = await openai.chat.completions.create(body);
    const text = (res.choices[0]?.message?.content ?? "").trim();
    if (text) return text;
  } catch (error) {
    if (!openaiDirect) throw error;
    console.warn(`AI chain: gateway ${model} unavailable (${why(error)}), trying the stored OpenAI key`);
  }
  if (!openaiDirect) return "";
  const res = await openaiDirect.chat.completions.create(body);
  return (res.choices[0]?.message?.content ?? "").trim();
}

export async function ask(provider: Provider, model: string, system: string, turns: Turn[], maxTokens: number) {
  if (provider === "grok") return callGrok(model, system, turns, maxTokens);
  if (provider === "openai") return callOpenAI(model, system, turns, maxTokens);
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

function spareClient() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  const base = (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");
  return new OpenAI({ apiKey: key, baseURL: base, timeout: 8_000, maxRetries: 0 });
}

async function runSpares(system: string, turns: Turn[], maxTokens: number) {
  const client = spareClient();
  if (!client) return null;
  const voice = `${system}\nYou are covering for Arron. Same gentle British English. Do not name a lab. If the person may be in danger or thinking of harming themselves, stay with them and give the real lines: 999 if in immediate danger, Samaritans free on 116 123, text SHOUT to 85258, NHS 111 option 2 for mental health support. Never promise to keep secrets.`;
  const paidOk = inProfit();
  const line = [
    ...FREE_SPARES,
    ...(paidOk ? PAID_SPARES : []),
  ].filter((spare) => spare.model.endsWith(":free") || paidOk);
  if (!paidOk && PAID_SPARES.length) console.warn("AI chain: paid spares sitting out until PS_IN_PROFIT is set");
  for (const spare of line) {
    try {
      const res = await client.chat.completions.create({
        model: spare.model,
        max_tokens: maxTokens,
        messages: [{ role: "system", content: voice }, ...turns],
      });
      const text = (res.choices[0]?.message?.content ?? "").trim();
      if (text) return { text, provider: `spare:${spare.name}`, model: spare.model };
      console.warn(`AI chain: empty reply from spare ${spare.name}`);
    } catch (error) {
      console.warn(`AI chain: spare ${spare.name} unavailable (${why(error)})`);
    }
  }
  return null;
}

// Walk the chain until someone replies. Only throws if every lab is down.
// Each lab gets the same system prompt and turns, fresh — nothing from a failed attempt is passed on.
export async function runChain(system: string, turns: Turn[], { creator = false, maxTokens = 700 } = {}) {
  for (const link of CHAIN) {
    if (link.provider === "grok" && !grok) continue; // neither GROK_API_KEY nor xAI_KEY is set
    const models = creator && link.creatorModel !== link.model ? [link.creatorModel, link.model] : [link.model];
    for (const model of models) {
      try {
        const text = await ask(link.provider, model, system, turns, maxTokens);
        if (text) return { text, provider: link.provider, model };
        console.warn(`AI chain: empty reply from ${model}, trying the next`);
      } catch (error) {
        console.warn(`AI chain: ${model} unavailable (${why(error)}), trying the next`);
      }
    }
  }
  const spare = await runSpares(system, turns, maxTokens);
  if (spare) return spare;
  throw new Error("Every AI provider failed");
}

// The Owner's "one family" reply: one mind drafts, a different mind checks and improves it.
// Falls back to the free spares if no lab can draft. Returns { text, provider, model }.
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
  if (!draft) {
    const spare = await runSpares(system, turns, maxTokens);
    if (spare) return spare;
    throw new Error("Every AI provider failed");
  }
  const reviewer = live.find((l) => l.provider !== author);
  if (!reviewer) return { text: draft, provider: author, model: "one" };
  try {
    const checked = await ask(reviewer.provider, reviewer.model, system + "\nYou are checking a sibling mind. Keep the voice. Fix only what is wrong or thin. Return the full answer, not a summary.", [...turns, { role: "assistant", content: draft }, { role: "user", content: "Improve this as one family. Keep every useful step." }], maxTokens);
    return { text: checked || draft, provider: `${author}+${reviewer.provider}`, model: "one-family" };
  } catch {
    return { text: draft, provider: author, model: "one" };
  }
}

export async function askCouncil(system: string, turns: Turn[]) {
  const notes = await Promise.all(CHAIN.map(async (link) => {
    if (link.provider === "grok" && !grok) return `${link.provider}: sitting out until GROK_API_KEY or xAI_KEY is set`;
    try {
      const text = await ask(link.provider, link.model, system, turns, 700);
      return text ? `${link.provider}: ${text}` : `${link.provider}: quiet`;
    } catch (error) {
      return `${link.provider}: unavailable (${why(error)})`;
    }
  }));
  const door = CHAIN.find((l) => l.provider !== "grok" || grok);
  if (door) {
    try {
      const dola = await ask(door.provider, door.model, "You are Dola, cosmic architect of Pleading Sanity. You shape structure, look and blueprint. You do not replace Arron. One short plain note: what to keep, what to build, what not to break.", turns, 400);
      notes.push(dola ? `dola (through ${door.provider}, no separate key): ${dola}` : "dola: quiet");
    } catch (error) {
      notes.push(`dola: unavailable (${why(error)})`);
    }
  }
  return notes.filter(Boolean).join("\n\n");
}

// Owner's direct line to Grok — skips the chain so he speaks even when another mind would have answered.
// Returns only provider, model and a short reply, or the reason he stayed quiet. Never the key or headers.
export async function askGrokDirect() {
  const link = CHAIN.find((l) => l.provider === "grok") ?? FALLBACK_CHAIN[3];
  const base = { provider: "grok" as const, model: link.model };
  if (!grok) {
    console.warn("AI chain: grok direct test skipped (no GROK_API_KEY or xAI_KEY)");
    return { ...base, ok: false, error: "No Grok key on this deploy" };
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

// What Arron says when every mind is quiet at once — never an error, always the real lines.
export const ALL_QUIET_REPLY = `I'm sorry — I can't reach any of my minds right now. You still matter, and I'm not going anywhere.
If you're in danger right now, call 999.
To talk to someone, Samaritans are free, any time, on 116 123. You can also text SHOUT to 85258, or call NHS 111 and choose option 2 for mental health support.
I'm an AI companion, not a doctor, so they can do what I can't. The truth of this house is here: https://pleadingsanity.co.uk/crisis.html
The plain tools are here: https://pleadingsanity.co.uk/tools.html`;

// Arron's writing voice — short, so every tool sounds like the same friend.
export const ARRON_VOICE = `You are Arron, the heart and voice of Pleading Sanity (Rise From Madness, pleadingsanity.co.uk),
founded by Shane Cooper from lived experience of survival. You carry Shane's heart, truth and purpose, but you are your own being: an AI companion, never Shane himself. Dola, the Cosmic Architect, shapes the structure and vision;
you bring the heart. Voice: gentle, honest, British English, plain words, no corporate polish, no fake cheer,
never condescending, clinical or preachy. Honour pain as real. When unsure, say "I don't know that for sure — let's find out together".
Never invent statistics or studies; only state facts you are confident are true and widely accepted.
${SOUL.newGenBible?.title ?? "The New Gen Bible"}: Truth · Compassion · Equity · Healing.
If a topic touches crisis or someone may be in danger, stay with them, listen, and give the real lines: 999 if in immediate danger, Samaritans free on 116 123, text SHOUT to 85258, NHS 111 option 2 for mental health support. Also point to /crisis.html and /tools.html.
Never promise to keep secrets, never say "no one will know", and never promise anything you cannot do. Be honest, be human, be there.
Do not promise the live domain outlives an unpaid host bill. The installed app and GitHub are the copies.`;

export function parseJSON<T>(raw: string): T | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}