// ==============================================================
// 💙 ARRON AI — /api/arron/*
// Real conversations via Netlify AI Gateway (no API keys needed),
// memory in Netlify Database, keyed by a random secret from the
// visitor's device. No accounts, no tracking, delete anytime.
// ==============================================================

import type { Config } from "@netlify/functions";
import Anthropic from "@anthropic-ai/sdk";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { arronMemories, arronMessages } from "../../db/schema.js";
import { buildSystemPrompt } from "../lib/arron-knowledge.js";

const anthropic = new Anthropic();
const MODEL = "claude-sonnet-5";

const MEMORY_ID = /^[a-f0-9-]{32,64}$/i;
const MAX_MESSAGE = 2000;
const MAX_STORY = 8000;
const HISTORY_FOR_CONTEXT = 30;
const HISTORY_FOR_DISPLAY = 60;

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

// ─── CHAT ───
async function chat(req: Request) {
  const body = await readBody(req);
  const { memoryId } = body;
  const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE) : "";
  if (!validId(memoryId)) return json({ error: "Invalid memory id" }, 400);
  if (!message) return json({ error: "Message is empty" }, 400);

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
  const turns: { role: "user" | "assistant"; content: string }[] = [];
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

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 700,
    system: buildSystemPrompt(story),
    messages: turns,
  });

  const reply = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
  if (!reply) throw new Error("Empty reply from model");

  let remembered = true;
  try {
    await ensureMemory(memoryId);
    await db.insert(arronMessages).values([
      { memoryId, role: "user", content: message },
      { memoryId, role: "assistant", content: reply },
    ]);
    await db.update(arronMemories).set({ updatedAt: new Date() }).where(eq(arronMemories.id, memoryId));
  } catch (error) {
    remembered = false;
    console.error("Arron could not save messages:", error);
  }

  return json({ reply, remembered });
}

// ─── MEMORY: read / save story / forget ───
async function memory(req: Request, url: URL) {
  if (req.method === "GET") {
    const id = url.searchParams.get("id");
    if (!validId(id)) return json({ error: "Invalid memory id" }, 400);
    const [row] = await db.select().from(arronMemories).where(eq(arronMemories.id, id));
    if (!row) return json({ story: "", messages: [] });
    const messages = await db
      .select({ role: arronMessages.role, content: arronMessages.content })
      .from(arronMessages)
      .where(eq(arronMessages.memoryId, id))
      .orderBy(asc(arronMessages.id));
    return json({ story: row.story, messages: messages.slice(-HISTORY_FOR_DISPLAY) });
  }

  const body = await readBody(req);
  if (!validId(body.memoryId)) return json({ error: "Invalid memory id" }, 400);

  if (req.method === "PUT") {
    const story = typeof body.story === "string" ? body.story.slice(0, MAX_STORY) : "";
    await ensureMemory(body.memoryId);
    await db
      .update(arronMemories)
      .set({ story, updatedAt: new Date() })
      .where(eq(arronMemories.id, body.memoryId));
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
    if (route === "chat" && req.method === "POST") return await chat(req);
    if (route === "memory") return await memory(req, url);
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("Arron error:", error);
    return json({ error: "Arron is resting for a moment" }, 503);
  }
};

export const config: Config = {
  path: ["/api/arron/chat", "/api/arron/memory"],
};
