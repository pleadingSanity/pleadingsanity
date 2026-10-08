// ==============================================================
// 🎙️ AI STUDIO API — /api/studio/*
//   GET  /api/studio/items?kind=creation|podcast&sort=top|new&before=ID
//   POST /api/studio/create        {style, topic}           → AI creation
//   GET  /api/studio/battle                                 → today's Human vs AI
//   POST /api/studio/battle        {body}                   → member entry
//   POST /api/studio/vote/:id      {deviceKey?}             → heart / un-heart
//   GET  /api/studio/podcast/:id                            → one episode
//   POST /api/studio/podcast       {topic}                  → creator records an episode
// Guests can watch, listen and vote; creating has daily limits.
// ==============================================================

import type { Config, Context } from "@netlify/functions";
import { and, desc, eq, gt, inArray, lt, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { studioItems, studioVotes } from "../../db/schema.js";
import { currentUser, json, logActivity, moderate, profileFor, readBody, str } from "../lib/social.js";
import {
  battlePrompt,
  CREATOR_MODEL,
  isCreatorRoles,
  familyCard,
  parseJSON,
  queuePodcast,
  speak,
  STYLES,
  today,
  visitorKey,
  VOICES,
  withinDailyLimit,
  type VoiceId,
} from "../lib/studio.js";

const PAGE = 12;
const DEVICE_KEY = /^[a-f0-9-]{16,64}$/i;
const LIMITS = { guest: 3, member: 12 };
type Item = typeof studioItems.$inferSelect;

async function withVotes(rows: Item[], voter: string | null) {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [counts, mine] = await Promise.all([
    db
      .select({ itemId: studioVotes.itemId, n: sql<number>`count(*)::int` })
      .from(studioVotes)
      .where(inArray(studioVotes.itemId, ids))
      .groupBy(studioVotes.itemId),
    voter
      ? db.select({ itemId: studioVotes.itemId }).from(studioVotes).where(and(inArray(studioVotes.itemId, ids), eq(studioVotes.voter, voter)))
      : Promise.resolve([]),
  ]);
  const countMap = new Map(counts.map((c) => [c.itemId, c.n]));
  const mineSet = new Set(mine.map((m) => m.itemId));
  return rows.flatMap((r) => {
    const card = r.authorId === null ? familyCard(r.title, r.body) : null;
    if (r.authorId === null && !card) return [];
    return [{
    id: r.id,
    kind: r.kind,
    author: r.authorLabel,
    ai: r.authorId === null,
    model: r.model,
    style: r.style.startsWith("pending") ? "" : r.style,
    topic: r.topic,
    title: card?.title || r.title,
    body: card?.body || (r.authorId === null ? "" : r.body),
    script: r.script,
    pending: r.kind === "podcast" && !r.script,
    day: r.day,
    createdAt: r.createdAt,
    votes: countMap.get(r.id) ?? 0,
    voted: mineSet.has(r.id),
  }];
  });
}

function voterFor(userId: string | undefined, deviceKey: unknown) {
  if (userId) return "u:" + userId;
  return typeof deviceKey === "string" && DEVICE_KEY.test(deviceKey) ? "d:" + deviceKey : null;
}

// ─── LIST ───
async function list(url: URL, voter: string | null) {
  const kind = url.searchParams.get("kind") === "podcast" ? "podcast" : "creation";
  const sort = url.searchParams.get("sort") === "top" ? "top" : "new";
  const before = Number(url.searchParams.get("before"));
  const base = and(eq(studioItems.kind, kind), eq(studioItems.hidden, false));

  if (sort === "top") {
    // Most-loved from the last 30 days
    const since = new Date(Date.now() - 30 * 86_400_000);
    const top = await db
      .select({ id: studioItems.id, n: sql<number>`count(${studioVotes.voter})::int` })
      .from(studioItems)
      .leftJoin(studioVotes, eq(studioVotes.itemId, studioItems.id))
      .where(and(base, gt(studioItems.createdAt, since)))
      .groupBy(studioItems.id)
      .orderBy(desc(sql`count(${studioVotes.voter})`), desc(studioItems.id))
      .limit(PAGE);
    const rows = top.length ? await db.select().from(studioItems).where(inArray(studioItems.id, top.map((t) => t.id))) : [];
    const order = new Map(top.map((t, i) => [t.id, i]));
    rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    return json({ items: await withVotes(rows, voter), nextBefore: null });
  }

  const rows = await db
    .select()
    .from(studioItems)
    .where(and(base, Number.isInteger(before) && before > 0 ? lt(studioItems.id, before) : undefined))
    .orderBy(desc(studioItems.id))
    .limit(PAGE + 1);
  const page = rows.slice(0, PAGE);
  return json({ items: await withVotes(page, voter), nextBefore: rows.length > PAGE ? page[page.length - 1].id : null });
}

// ─── CREATE — AI makes something positive on request ───
async function create(req: Request, context: Context) {
  const user = await currentUser();
  const creator = isCreatorRoles(user?.roles);
  const body = await readBody(req);
  const style = Object.hasOwn(STYLES, str(body.style, 20)) ? str(body.style, 20) : "inspire";
  const topic = str(body.topic, 200);
  const voice: VoiceId = Object.hasOwn(VOICES, str(body.voice, 10)) ? (str(body.voice, 10) as VoiceId) : "arron";

  if (!creator) {
    const ok = await withinDailyLimit("create:" + visitorKey(req, context.ip, user?.id), user ? LIMITS.member : LIMITS.guest);
    if (!ok) {
      return json({ error: user ? "You've used today's AI creations — come back tomorrow for more ✨" : "That's today's free creations. Sign in for more, or come back tomorrow ✨" }, 429);
    }
  }
  if (topic) {
    const verdict = await moderate(topic, "post");
    if (!verdict.allowed) return json({ error: verdict.reason || "Let's pick a kinder topic." }, 400);
  }

  const raw = await speak(
    voice,
    `Create ${STYLES[style]}. Reply with ONLY JSON: {"title": string (max 60 chars, catchy, no clickbait), "body": string}.`,
    topic ? `Topic: ${topic}` : "Topic: surprise me — something people need to hear today.",
    creator && voice === "arron" ? 900 : 450,
    creator && voice === "arron" ? CREATOR_MODEL : undefined,
  );
  const parsed = parseJSON<{ title?: string; body?: string }>(raw);
  const card = familyCard(str(parsed?.title, 120), str(parsed?.body || raw, 3000));
  if (!card) throw new Error("Empty creation");

  const [item] = await db
    .insert(studioItems)
    .values({
      kind: "creation",
      authorLabel: `${VOICES[voice].name} · ${VOICES[voice].lab}`,
      model: creator && voice === "arron" ? CREATOR_MODEL : VOICES[voice].model,
      style,
      topic,
      title: card.title,
      body: card.body,
    })
    .returning();
  return json({ item: (await withVotes([item], null))[0] }, 201);
}

// ─── DAILY BATTLE — one prompt, the AI panel vs every human ───
async function battle(voter: string | null) {
  const day = today();
  const prompt = battlePrompt(day);
  let entries = await db
    .select()
    .from(studioItems)
    .where(and(eq(studioItems.kind, "battle"), eq(studioItems.day, day), eq(studioItems.hidden, false)))
    .orderBy(desc(studioItems.id))
    .limit(60);

  // The AI enters once a day, the first time anyone opens the battle.
  if (!entries.some((e) => e.authorId === null)) {
    const voice: VoiceId = (["arron", "nova", "sol", "grok"] as const)[Math.floor(Date.parse(day) / 86_400_000) % 3];
    try {
      const reply = await speak(voice, "You are entering a friendly Human vs AI creativity battle. Give your single best answer, under 90 words. No preamble.", prompt, 300);
      if (reply) {
        await db.insert(studioItems).values({
          kind: "battle",
          authorLabel: `${VOICES[voice].name} · ${VOICES[voice].lab}`,
          model: VOICES[voice].model,
          topic: prompt,
          body: str(reply, 1200),
          day,
        });
        entries = await db
          .select()
          .from(studioItems)
          .where(and(eq(studioItems.kind, "battle"), eq(studioItems.day, day), eq(studioItems.hidden, false)))
          .orderBy(desc(studioItems.id))
          .limit(60);
      }
    } catch (error) {
      console.error("AI battle entry unavailable:", error);
    }
  }

  // All-time scoreboard: every heart on a battle entry counts for its side.
  const [score] = await db
    .select({
      ai: sql<number>`count(*) filter (where ${studioItems.authorId} is null)::int`,
      humans: sql<number>`count(*) filter (where ${studioItems.authorId} is not null)::int`,
    })
    .from(studioVotes)
    .innerJoin(studioItems, eq(studioItems.id, studioVotes.itemId))
    .where(eq(studioItems.kind, "battle"));

  const items = await withVotes(entries, voter);
  items.sort((a, b) => b.votes - a.votes);
  return json({ day, prompt, entries: items, score: score ?? { ai: 0, humans: 0 } });
}

async function enterBattle(req: Request) {
  const user = await currentUser();
  if (!user) return json({ error: "Sign in to take on the AI 💪" }, 401);
  const body = str((await readBody(req)).body, 600);
  if (body.length < 3) return json({ error: "Write your entry first." }, 400);
  const day = today();
  const [already] = await db
    .select({ id: studioItems.id })
    .from(studioItems)
    .where(and(eq(studioItems.kind, "battle"), eq(studioItems.day, day), eq(studioItems.authorId, user.id)));
  if (already) return json({ error: "You've already entered today — share it and rally the humans! 🙌" }, 409);

  const verdict = await moderate(body, "comment");
  if (!verdict.allowed) return json({ error: verdict.reason || "Let's keep it kind." }, 400);
  const profile = await profileFor(user.id);
  const [item] = await db
    .insert(studioItems)
    .values({
      kind: "battle",
      authorId: user.id,
      authorLabel: profile?.displayName || "Human",
      topic: battlePrompt(day),
      body,
      day,
      hidden: verdict.crisis,
    })
    .returning();
  await logActivity(user.id, "studio.battle", "studio", item.id);
  return json({ item: (await withVotes([item], "u:" + user.id))[0] }, 201);
}

// ─── VOTES ───
async function vote(req: Request, id: number, userId: string | undefined) {
  const voter = voterFor(userId, (await readBody(req)).deviceKey);
  if (!voter) return json({ error: "Missing device key" }, 400);
  const [item] = Number.isInteger(id) ? await db.select({ id: studioItems.id }).from(studioItems).where(eq(studioItems.id, id)) : [];
  if (!item) return json({ error: "Not found" }, 404);
  const removed = await db
    .delete(studioVotes)
    .where(and(eq(studioVotes.itemId, id), eq(studioVotes.voter, voter)))
    .returning();
  if (!removed.length) await db.insert(studioVotes).values({ itemId: id, voter }).onConflictDoNothing();
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(studioVotes).where(eq(studioVotes.itemId, id));
  return json({ voted: !removed.length, votes: n });
}

// ─── PODCAST — the creator starts an episode; a background job records it ───
async function startPodcast(req: Request) {
  const user = await currentUser();
  if (!user || !isCreatorRoles(user.roles)) return json({ error: "Only the creator can record new episodes." }, 403);
  const topic = str((await readBody(req)).topic, 200);
  if (topic.length < 5) return json({ error: "Give the panel a topic to talk about." }, 400);
  const item = await queuePodcast(topic, new URL(req.url).origin);
  return json({ item: (await withVotes([item], null))[0] }, 202);
}

async function episode(id: number, voter: string | null) {
  const [item] = Number.isInteger(id) ? await db.select().from(studioItems).where(and(eq(studioItems.id, id), eq(studioItems.kind, "podcast"))) : [];
  if (!item || item.hidden) return json({ error: "Episode not found" }, 404);
  return json({ item: (await withVotes([item], voter))[0] });
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/api\/studio\/?/, "").split("/").filter(Boolean);
  try {
    const user = req.method === "GET" || parts[0] === "vote" ? await currentUser() : null;
    const voter = voterFor(user?.id, url.searchParams.get("deviceKey"));

    if (parts[0] === "items" && req.method === "GET") return await list(url, voter);
    if (parts[0] === "create" && req.method === "POST") return await create(req, context);
    if (parts[0] === "battle" && req.method === "GET") return await battle(voter);
    if (parts[0] === "battle" && req.method === "POST") return await enterBattle(req);
    if (parts[0] === "vote" && req.method === "POST") return await vote(req, Number(parts[1]), user?.id);
    if (parts[0] === "podcast" && parts[1] && req.method === "GET") return await episode(Number(parts[1]), voter);
    if (parts[0] === "podcast" && req.method === "POST") return await startPodcast(req);
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("Studio error:", error);
    return json({ error: "The studio lights flickered — please try again in a moment." }, 503);
  }
};

export const config: Config = {
  path: ["/api/studio/items", "/api/studio/create", "/api/studio/battle", "/api/studio/vote/:id", "/api/studio/podcast", "/api/studio/podcast/:id"],
};
