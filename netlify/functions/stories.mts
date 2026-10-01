// ==============================================================
// 💬 AI STORIES API — /api/stories
//   GET    /api/stories?kind=all|inspiring|funny|wisdom|win&sort=new|top&before=ID
//   POST   /api/stories              {kind, title, userLine, arronLine, reflection, anonymous}
//   POST   /api/stories/:id/heart    {deviceKey?}   → heart / un-heart
//   DELETE /api/stories/:id                         → author or admin removes a story
//   POST   /api/stories/:id/hide     {hide}         → admin moderation
// Everyone can read and heart. Sharing needs a member account, and
// every story passes the same kindness check as community posts.
// ==============================================================

import type { Config } from "@netlify/functions";
import { and, desc, eq, gt, inArray, lt, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { aiStories, aiStoryHearts, profiles } from "../../db/schema.js";
import { currentUser, json, logActivity, moderate, readBody, str, unauthorized } from "../lib/social.js";
import { allow, slowDown } from "../lib/rate-limit.js";

const KINDS = ["inspiring", "funny", "wisdom", "win"];
const PAGE = 12;
const DEVICE_KEY = /^[a-f0-9-]{16,64}$/i;
const DAILY_SHARES = 10;
type Story = typeof aiStories.$inferSelect;

function voterFor(userId: string | undefined, deviceKey: unknown) {
  if (userId) return "u:" + userId;
  return typeof deviceKey === "string" && DEVICE_KEY.test(deviceKey) ? "d:" + deviceKey : null;
}

async function shape(rows: Story[], voter: string | null, viewerId?: string, admin = false) {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const authorIds = [...new Set(rows.filter((r) => !r.anonymous).map((r) => r.authorId))];
  const [counts, mine, authors] = await Promise.all([
    db
      .select({ storyId: aiStoryHearts.storyId, n: sql<number>`count(*)::int` })
      .from(aiStoryHearts)
      .where(inArray(aiStoryHearts.storyId, ids))
      .groupBy(aiStoryHearts.storyId),
    voter
      ? db.select({ storyId: aiStoryHearts.storyId }).from(aiStoryHearts).where(and(inArray(aiStoryHearts.storyId, ids), eq(aiStoryHearts.voter, voter)))
      : Promise.resolve([]),
    authorIds.length
      ? db
          .select({ userId: profiles.userId, username: profiles.username, displayName: profiles.displayName, avatar: profiles.avatar })
          .from(profiles)
          .where(inArray(profiles.userId, authorIds))
      : Promise.resolve([]),
  ]);
  const countMap = new Map(counts.map((c) => [c.storyId, c.n]));
  const mineSet = new Set(mine.map((m) => m.storyId));
  const authorMap = new Map(authors.map((a) => [a.userId, a]));
  return rows.map((r) => {
    const a = r.anonymous ? null : authorMap.get(r.authorId);
    return {
      id: r.id,
      kind: r.kind,
      title: r.title,
      userLine: r.userLine,
      arronLine: r.arronLine,
      reflection: r.reflection,
      contentWarning: r.contentWarning,
      author: a ? { username: a.username, displayName: a.displayName, avatar: a.avatar } : null,
      createdAt: r.createdAt,
      hearts: countMap.get(r.id) ?? 0,
      hearted: mineSet.has(r.id),
      canDelete: admin || (viewerId !== undefined && viewerId === r.authorId),
      hidden: r.hidden,
    };
  });
}

// ─── LIST ───
async function list(url: URL, voter: string | null, viewerId?: string, admin = false) {
  const kind = url.searchParams.get("kind") ?? "all";
  const sort = url.searchParams.get("sort") === "top" ? "top" : "new";
  const before = Number(url.searchParams.get("before"));
  const base = and(eq(aiStories.hidden, false), KINDS.includes(kind) ? eq(aiStories.kind, kind) : undefined);

  if (sort === "top") {
    // Most-loved from the last 60 days
    const since = new Date(Date.now() - 60 * 86_400_000);
    const top = await db
      .select({ id: aiStories.id })
      .from(aiStories)
      .leftJoin(aiStoryHearts, eq(aiStoryHearts.storyId, aiStories.id))
      .where(and(base, gt(aiStories.createdAt, since)))
      .groupBy(aiStories.id)
      .orderBy(desc(sql`count(${aiStoryHearts.voter})`), desc(aiStories.id))
      .limit(PAGE);
    const rows = top.length ? await db.select().from(aiStories).where(inArray(aiStories.id, top.map((t) => t.id))) : [];
    const order = new Map(top.map((t, i) => [t.id, i]));
    rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    return json({ stories: await shape(rows, voter, viewerId, admin), nextBefore: null });
  }

  const rows = await db
    .select()
    .from(aiStories)
    .where(and(base, Number.isInteger(before) && before > 0 ? lt(aiStories.id, before) : undefined))
    .orderBy(desc(aiStories.id))
    .limit(PAGE + 1);
  const page = rows.slice(0, PAGE);
  return json({ stories: await shape(page, voter, viewerId, admin), nextBefore: rows.length > PAGE ? page[page.length - 1].id : null });
}

// ─── SHARE ───
async function share(req: Request, user: { id: string; roles: string[] }) {
  const body = await readBody(req);
  const kind = KINDS.includes(str(body.kind, 20)) ? str(body.kind, 20) : "inspiring";
  const title = str(body.title, 100);
  const userLine = str(body.userLine, 600);
  const arronLine = str(body.arronLine, 1500);
  const reflection = str(body.reflection, 600);
  if (!arronLine) return json({ error: "Add what Arron said — that's the heart of the story." }, 400);

  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(aiStories)
    .where(and(eq(aiStories.authorId, user.id), gt(aiStories.createdAt, new Date(Date.now() - 86_400_000))));
  if (n >= DAILY_SHARES) return json({ error: "That's plenty of sharing for today — come back tomorrow 💙" }, 429);

  const verdict = await moderate([title, userLine, arronLine, reflection].filter(Boolean).join("\n\n"), "post");
  if (!verdict.allowed) return json({ error: verdict.reason || "Let's keep AI Stories kind and uplifting." }, 400);

  const [story] = await db
    .insert(aiStories)
    .values({
      authorId: user.id,
      kind,
      title,
      userLine,
      arronLine,
      reflection,
      anonymous: body.anonymous === true,
      contentWarning: verdict.contentWarning,
    })
    .returning();
  await logActivity(user.id, "story.create", "story", story.id);
  const [shaped] = await shape([story], "u:" + user.id, user.id);
  return json({ story: shaped, crisis: verdict.crisis }, 201);
}

async function findStory(id: number) {
  if (!Number.isInteger(id) || id <= 0) return null;
  const [story] = await db.select().from(aiStories).where(eq(aiStories.id, id));
  return story ?? null;
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const [, idPart, action] = url.pathname.replace(/^\/api\/stories\/?/, "").match(/^(\d+)?\/?(\w+)?$/) ?? [];

  try {
    const user = await currentUser().catch(() => null);
    const admin = Boolean(user?.roles.includes("admin"));

    if (!idPart && req.method === "GET") {
      const voter = voterFor(user?.id, url.searchParams.get("deviceKey"));
      return await list(url, voter, user?.id, admin);
    }
    if (!idPart && req.method === "POST") {
      if (!user) return unauthorized();
      if (!(await allow("write", undefined, user.id))) return slowDown();
      return await share(req, user);
    }

    const story = await findStory(Number(idPart));
    if (!story) return json({ error: "Story not found." }, 404);

    if (action === "heart" && req.method === "POST") {
      const voter = voterFor(user?.id, (await readBody(req)).deviceKey);
      if (!voter) return json({ error: "Missing device key." }, 400);
      const removed = await db
        .delete(aiStoryHearts)
        .where(and(eq(aiStoryHearts.storyId, story.id), eq(aiStoryHearts.voter, voter)))
        .returning();
      if (!removed.length) await db.insert(aiStoryHearts).values({ storyId: story.id, voter }).onConflictDoNothing();
      const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(aiStoryHearts).where(eq(aiStoryHearts.storyId, story.id));
      return json({ hearted: !removed.length, hearts: n });
    }

    if (action === "hide" && req.method === "POST") {
      if (!admin) return json({ error: "Admins only." }, 403);
      const hide = (await readBody(req)).hide !== false;
      await db.update(aiStories).set({ hidden: hide }).where(eq(aiStories.id, story.id));
      await logActivity(user!.id, hide ? "admin.hide" : "admin.unhide", "story", story.id);
      return json({ ok: true, hidden: hide });
    }

    if (!action && req.method === "DELETE") {
      if (!user) return unauthorized();
      if (!admin && user.id !== story.authorId) return json({ error: "Only the person who shared this can remove it." }, 403);
      await db.delete(aiStories).where(eq(aiStories.id, story.id));
      await logActivity(user.id, "story.delete", "story", story.id);
      return json({ ok: true });
    }

    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("Stories API error:", error);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
};

export const config: Config = {
  path: ["/api/stories", "/api/stories/*"],
};
