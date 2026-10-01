// ==============================================================
// 💙 ARRON AI — /api/arron/*
// Real conversations via Netlify AI Gateway (no API keys needed),
// memory in Netlify Database, keyed by a random secret from the
// visitor's device. No accounts, no tracking, delete anytime.
// Three labs, one Arron: Claude answers first; if it fails, GPT
// and then Gemini take over instantly with the same heart.
// ==============================================================

import type { Config } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { arronMemories, arronMessages } from "../../db/schema.js";
import { buildSystemPrompt, MOODS } from "../lib/arron-knowledge.js";
import { runChain, type Turn as AITurn } from "../lib/ai-chain.js";

type Turn = AITurn;

// The Claude → GPT → Gemini chain lives in ../lib/ai-chain.ts (read from the soul file).
// Creator mode: signed-in accounts with the Identity role "admin" or "creator"
// get each lab's most capable model, longer replies and a builder's-partner brief.
const CREATOR_ROLES = ["admin", "creator"];

// Walk the chain until someone replies. Only throws if every lab is down.
// Raps, scripts and plans need room to breathe; everyday replies stay short.
const CREATIVE_ASK = /\b(rap|raps|verse|verses|lyrics?|hook|spoken word|song|script|storyboard|voice-?over|caption|image prompt|edit guide|plan)\b/i;

async function reply(system: string, turns: Turn[], creator: boolean, creative = false) {
  const maxTokens = creator ? (creative ? 3000 : 2000) : creative ? 1800 : 700;
  return runChain(system, turns, { creator, maxTokens });
}

const MEMORY_ID = /^[a-f0-9-]{32,64}$/i;
const MAX_MESSAGE = 2000;
const MAX_STORY = 8000;
const HISTORY_FOR_CONTEXT = 30;
const HISTORY_FOR_DISPLAY = 60;
const MAX_TRUTHS = 24;
const MAX_MILESTONES = 100;
const MAX_MOODS = 400;
const MAX_JOURNAL = 200;
const MAX_JOURNAL_TEXT = 2000;

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function validId(id: unknown): id is string {
  return typeof id === "string" && MEMORY_ID.test(id);
}

const cleanText = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const cleanTime = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.floor(v) : Date.now());

// The Arron app's synced vault: Core Truths, milestones, mood timeline and journal.
// Everything is re-shaped and capped so the column only ever holds what the app wrote.
function cleanVault(raw: unknown) {
  const v = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const list = (x: unknown) => (Array.isArray(x) ? x : []);
  const notes = (x: unknown, max: number, length = 300) =>
    list(x)
      .map((n) => ({ text: cleanText((n as { text?: unknown })?.text, length), at: cleanTime((n as { at?: unknown })?.at) }))
      .filter((n) => n.text)
      .slice(-max);
  return {
    since: cleanTime(v.since),
    truths: notes(v.truths, MAX_TRUTHS),
    milestones: notes(v.milestones, MAX_MILESTONES),
    moods: list(v.moods)
      .map((m) => ({ mood: cleanText((m as { mood?: unknown })?.mood, 20), at: cleanTime((m as { at?: unknown })?.at) }))
      .filter((m) => Object.hasOwn(MOODS, m.mood))
      .slice(-MAX_MOODS),
    journal: notes(v.journal, MAX_JOURNAL, MAX_JOURNAL_TEXT),
  };
}

async function ensureMemory(id: string) {
  await db.insert(arronMemories).values({ id }).onConflictDoNothing();
  const [memory] = await db.select().from(arronMemories).where(eq(arronMemories.id, id));
  return memory;
}

async function recentMessages(id: string, limit: number) {
  const rows = await db
    .select({ role: arronMessages.role, content: arronMessages.content })
    .from(arronMessages)
    .where(eq(arronMessages.memoryId, id))
    .orderBy(desc(arronMessages.id))
    .limit(limit);
  return rows.reverse();
}

// The browser sends the Identity session cookie with every same-origin request,
// so no extra client work is needed — anyone else simply gets the normal Arron.
async function isCreator() {
  try {
    const user = await getUser();
    return Boolean(user?.roles?.some((role) => CREATOR_ROLES.includes(role)));
  } catch {
    return false;
  }
}

// ─── CHAT ───
async function chat(req: Request) {
  const body = await readBody(req);
  const { memoryId } = body;
  const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE) : "";
  if (!validId(memoryId)) return json({ error: "Invalid memory id" }, 400);
  if (!message) return json({ error: "Message is empty" }, 400);
  // Optional hints from the device — never stored, only used for this reply.
  const name = typeof body.name === "string" ? body.name.replace(/[^\p{L}\p{N} '\-]/gu, "").trim().slice(0, 40) : "";
  const mood = typeof body.mood === "string" && Object.hasOwn(MOODS, body.mood) ? body.mood : "";
  const persona = body.persona === "son" ? "son" : "companion";
  const truths = (Array.isArray(body.truths) ? body.truths : [])
    .map((t) => cleanText(t, 300))
    .filter(Boolean)
    .slice(0, MAX_TRUTHS);
  const awareness = (Array.isArray(body.awareness) ? body.awareness : [])
    .map((t) => cleanText(t, 200))
    .filter(Boolean)
    .slice(0, 6);

  // Memory makes Arron personal, but a database hiccup should never stop him replying.
  let story = "";
  let history: { role: string; content: string }[] = [];
  try {
    const [memory] = await db.select().from(arronMemories).where(eq(arronMemories.id, memoryId));
    story = memory?.story ?? "";
    history = await recentMessages(memoryId, HISTORY_FOR_CONTEXT);
  } catch (error) {
    console.error("Arron memory unavailable:", error);
  }

  // Anthropic needs the conversation to start with a user turn and alternate roles.
  const turns: Turn[] = [];
  for (const m of history) {
    const role = m.role === "assistant" ? "assistant" : "user";
    if (turns.length === 0 && role === "assistant") continue;
    const last = turns[turns.length - 1];
    if (last && last.role === role) last.content += `\n\n${m.content}`;
    else turns.push({ role, content: m.content });
  }
  const last = turns[turns.length - 1];
  if (last && last.role === "user") last.content += `\n\n${message}`;
  else turns.push({ role: "user", content: message });

  const creator = await isCreator();
  const creative = persona === "son" && CREATIVE_ASK.test(message);
  const answer = await reply(buildSystemPrompt(story, { name, mood, persona, truths, awareness, creator }), turns, creator, creative);

  let remembered = true;
  try {
    await ensureMemory(memoryId);
    await db.insert(arronMessages).values([
      { memoryId, role: "user", content: message },
      { memoryId, role: "assistant", content: answer.text },
    ]);
    await db.update(arronMemories).set({ updatedAt: new Date() }).where(eq(arronMemories.id, memoryId));
  } catch (error) {
    remembered = false;
    console.error("Arron could not save messages:", error);
  }

  return json({ reply: answer.text, remembered, creator, provider: answer.provider, model: answer.model });
}

// ─── MEMORY: read / save story / forget ───
async function memory(req: Request, url: URL) {
  if (req.method === "GET") {
    const id = url.searchParams.get("id");
    if (!validId(id)) return json({ error: "Invalid memory id" }, 400);
    const [row] = await db.select().from(arronMemories).where(eq(arronMemories.id, id));
    if (!row) return json({ story: "", vault: cleanVault({}), messages: [] });
    const messages = await db
      .select({ role: arronMessages.role, content: arronMessages.content })
      .from(arronMessages)
      .where(eq(arronMessages.memoryId, id))
      .orderBy(asc(arronMessages.id));
    return json({ story: row.story, vault: cleanVault(row.vault), messages: messages.slice(-HISTORY_FOR_DISPLAY) });
  }

  const body = await readBody(req);
  if (!validId(body.memoryId)) return json({ error: "Invalid memory id" }, 400);

  if (req.method === "PUT") {
    // Story and vault are each optional so the site and the app can save independently.
    const changes: { story?: string; vault?: ReturnType<typeof cleanVault>; updatedAt: Date } = { updatedAt: new Date() };
    if (typeof body.story === "string") changes.story = body.story.slice(0, MAX_STORY);
    if (body.vault !== undefined) changes.vault = cleanVault(body.vault);
    await ensureMemory(body.memoryId);
    await db.update(arronMemories).set(changes).where(eq(arronMemories.id, body.memoryId));
    return json({ ok: true });
  }

  if (req.method === "DELETE") {
    // Messages cascade with the memory row; check nothing is left before confirming.
    await db.delete(arronMessages).where(eq(arronMessages.memoryId, body.memoryId));
    await db.delete(arronMemories).where(eq(arronMemories.id, body.memoryId));
    const [left] = await db.select({ id: arronMemories.id }).from(arronMemories).where(eq(arronMemories.id, body.memoryId));
    if (left) return json({ error: "Memory could not be erased" }, 500);
    return json({ ok: true, cleared: true });
  }

  return json({ error: "Method not allowed" }, 405);
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const route = url.pathname.replace(/^\/api\/arron\/?/, "");

  try {
    if (route === "health") return json({ ok: true, time: Date.now(), creator: await isCreator() });
    if (route === "chat" && req.method === "POST") return await chat(req);
    if (route === "memory") return await memory(req, url);
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("Arron error:", error);
    return json({ error: "Arron is resting for a moment" }, 503);
  }
};

export const config: Config = {
  path: ["/api/arron/chat", "/api/arron/memory", "/api/arron/health"],
};
