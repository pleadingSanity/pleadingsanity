// ==============================================================
// 🤝 COMMUNITY — search, suggested friends, friend requests,
// blocks and reports.
//   GET  /api/community/search?q=&country=
//   GET  /api/community/suggested
//   GET  /api/friends                 → friends, incoming, outgoing
//   POST /api/friends   {username, action: request|accept|decline|cancel|remove}
//   GET  /api/blocks  · POST /api/blocks {username, block}
//   POST /api/reports {targetType, targetId, reason, details}
// No DMs exist anywhere; country is the most precise location we keep.
// ==============================================================

import type { Config } from "@netlify/functions";
import { and, desc, eq, ilike, inArray, notInArray, or, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { blocks, comments, creations, friends, posts, profiles, reports } from "../../db/schema.js";
import {
  blockedIds,
  currentUser,
  isBlockedEitherWay,
  json,
  logActivity,
  profileFor,
  readBody,
  str,
  unauthorized,
} from "../lib/social.js";

const card = (p: typeof profiles.$inferSelect) => ({
  username: p.username,
  displayName: p.displayName,
  avatar: p.avatar,
  bio: p.isPrivate ? "" : p.bio,
  country: p.isPrivate ? "" : p.country,
  mood: p.mood,
  interests: p.isPrivate ? [] : p.interests,
  isPrivate: p.isPrivate,
});

const REPORT_REASONS = ["harassment", "hate", "self-harm-risk", "spam", "impersonation", "unsafe-content", "other"];

async function search(userId: string, url: URL) {
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 60);
  const country = (url.searchParams.get("country") ?? "").trim().slice(0, 56);
  const hidden = [userId, ...(await blockedIds(userId))];
  const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;

  const rows = await db
    .select()
    .from(profiles)
    .where(
      and(
        eq(profiles.onboarded, true),
        notInArray(profiles.userId, hidden),
        q
          ? or(
              ilike(profiles.username, like),
              ilike(profiles.displayName, like),
              and(eq(profiles.isPrivate, false), ilike(profiles.bio, like)),
              and(
                eq(profiles.isPrivate, false),
                sql`exists (select 1 from unnest(${profiles.interests}) i where i ilike ${like})`,
              ),
            )
          : undefined,
        country ? and(eq(profiles.isPrivate, false), ilike(profiles.country, country)) : undefined,
      ),
    )
    .orderBy(desc(profiles.updatedAt))
    .limit(30);

  const ids = rows.map((r) => r.userId);
  const links = ids.length
    ? await db
        .select()
        .from(friends)
        .where(
          or(
            and(eq(friends.requesterId, userId), inArray(friends.addresseeId, ids)),
            and(eq(friends.addresseeId, userId), inArray(friends.requesterId, ids)),
          ),
        )
    : [];
  const stateFor = (id: string) => {
    const l = links.find((x) => x.requesterId === id || x.addresseeId === id);
    if (!l) return "none";
    if (l.status === "accepted") return "friends";
    return l.requesterId === userId ? "outgoing" : "incoming";
  };

  return json({ results: rows.map((r) => ({ ...card(r), state: stateFor(r.userId) })) });
}

// People who share interests or country, excluding existing links and blocks.
async function suggested(userId: string) {
  const me = await profileFor(userId);
  const linked = await db
    .select({ a: friends.requesterId, b: friends.addresseeId })
    .from(friends)
    .where(or(eq(friends.requesterId, userId), eq(friends.addresseeId, userId)));
  const exclude = [
    userId,
    ...(await blockedIds(userId)),
    ...linked.map((r) => (r.a === userId ? r.b : r.a)),
  ];
  const interests = me?.interests ?? [];

  const country = me?.country ?? "";
  const sameCountry = sql`(case when ${country} <> '' and lower(${profiles.country}) = lower(${country}) then 1 else 0 end)`;
  const sharedInterests = interests.length
    ? sql`(select count(*) from unnest(${profiles.interests}) i where lower(i) in (${sql.join(
        interests.map((i) => sql`${i.toLowerCase()}`),
        sql`, `,
      )}))::int`
    : sql`0`;
  const score = sql<number>`(${sharedInterests} + ${sameCountry})`;

  const rows = await db
    .select({ profile: profiles, score })
    .from(profiles)
    .where(and(eq(profiles.onboarded, true), eq(profiles.isPrivate, false), notInArray(profiles.userId, exclude)))
    .orderBy(desc(score), desc(profiles.updatedAt))
    .limit(12);

  return json({ results: rows.map((r) => ({ ...card(r.profile), shared: r.score })) });
}

async function listFriends(userId: string) {
  const links = await db
    .select()
    .from(friends)
    .where(or(eq(friends.requesterId, userId), eq(friends.addresseeId, userId)))
    .orderBy(desc(friends.updatedAt));
  const otherIds = links.map((l) => (l.requesterId === userId ? l.addresseeId : l.requesterId));
  const people = otherIds.length ? await db.select().from(profiles).where(inArray(profiles.userId, otherIds)) : [];
  const byId = new Map(people.map((p) => [p.userId, p]));

  const out = { friends: [] as unknown[], incoming: [] as unknown[], outgoing: [] as unknown[] };
  for (const l of links) {
    const other = byId.get(l.requesterId === userId ? l.addresseeId : l.requesterId);
    if (!other) continue;
    const entry = { ...card(other), since: l.updatedAt };
    if (l.status === "accepted") out.friends.push(entry);
    else if (l.requesterId === userId) out.outgoing.push(entry);
    else out.incoming.push(entry);
  }
  return json(out);
}

async function targetByUsername(username: unknown) {
  if (typeof username !== "string" || !username) return null;
  const [row] = await db.select().from(profiles).where(eq(profiles.username, username.toLowerCase()));
  return row ?? null;
}

async function changeFriend(req: Request, userId: string) {
  const body = await readBody(req);
  const target = await targetByUsername(body.username);
  if (!target || target.userId === userId) return json({ error: "Person not found." }, 404);
  if (await isBlockedEitherWay(userId, target.userId)) return json({ error: "Person not found." }, 404);

  const [link] = await db
    .select()
    .from(friends)
    .where(
      or(
        and(eq(friends.requesterId, userId), eq(friends.addresseeId, target.userId)),
        and(eq(friends.requesterId, target.userId), eq(friends.addresseeId, userId)),
      ),
    );

  switch (body.action) {
    case "request": {
      if (link?.status === "accepted") return json({ status: "friends" });
      if (link && link.requesterId === userId) return json({ status: "outgoing" });
      if (link) {
        // They already asked us — sending one back means yes.
        await db.update(friends).set({ status: "accepted", updatedAt: new Date() }).where(eq(friends.id, link.id));
        await logActivity(userId, "friend.accept", "user", target.userId);
        return json({ status: "friends" });
      }
      await db.insert(friends).values({ requesterId: userId, addresseeId: target.userId });
      await logActivity(userId, "friend.request", "user", target.userId);
      return json({ status: "outgoing" });
    }
    case "accept": {
      if (!link || link.addresseeId !== userId) return json({ error: "No request to accept." }, 400);
      await db.update(friends).set({ status: "accepted", updatedAt: new Date() }).where(eq(friends.id, link.id));
      await logActivity(userId, "friend.accept", "user", target.userId);
      return json({ status: "friends" });
    }
    case "decline":
    case "cancel":
    case "remove": {
      if (link) await db.delete(friends).where(eq(friends.id, link.id));
      await logActivity(userId, `friend.${body.action}`, "user", target.userId);
      return json({ status: "none" });
    }
    default:
      return json({ error: "Unknown action." }, 400);
  }
}

async function listBlocks(userId: string) {
  const rows = await db
    .select({ profile: profiles })
    .from(blocks)
    .innerJoin(profiles, eq(profiles.userId, blocks.blockedId))
    .where(eq(blocks.blockerId, userId));
  return json({ blocked: rows.map((r) => card(r.profile)) });
}

async function changeBlock(req: Request, userId: string) {
  const body = await readBody(req);
  const target = await targetByUsername(body.username);
  if (!target || target.userId === userId) return json({ error: "Person not found." }, 404);

  if (body.block === false) {
    await db.delete(blocks).where(and(eq(blocks.blockerId, userId), eq(blocks.blockedId, target.userId)));
    await logActivity(userId, "user.unblock", "user", target.userId);
    return json({ blocked: false });
  }

  await db.insert(blocks).values({ blockerId: userId, blockedId: target.userId }).onConflictDoNothing();
  // Blocking also ends any friendship or pending request.
  await db
    .delete(friends)
    .where(
      or(
        and(eq(friends.requesterId, userId), eq(friends.addresseeId, target.userId)),
        and(eq(friends.requesterId, target.userId), eq(friends.addresseeId, userId)),
      ),
    );
  await logActivity(userId, "user.block", "user", target.userId);
  return json({ blocked: true });
}

async function fileReport(req: Request, userId: string) {
  const body = await readBody(req);
  const targetType = body.targetType;
  if (targetType !== "user" && targetType !== "post" && targetType !== "comment" && targetType !== "creation") {
    return json({ error: "Unknown report type." }, 400);
  }
  const reason = typeof body.reason === "string" && REPORT_REASONS.includes(body.reason) ? body.reason : "other";

  // Resolve the target so reports always point at something real.
  let targetId = "";
  if (targetType === "user") {
    const target = await targetByUsername(body.targetId);
    targetId = target?.userId ?? "";
  } else if (targetType === "creation") {
    const id = Number(body.targetId);
    const [row] = Number.isInteger(id) ? await db.select({ id: creations.id }).from(creations).where(eq(creations.id, id)) : [];
    targetId = row ? String(row.id) : "";
  } else {
    const id = Number(body.targetId);
    if (Number.isInteger(id)) {
      const table = targetType === "post" ? posts : comments;
      const [row] = await db.select({ id: table.id }).from(table).where(eq(table.id, id));
      targetId = row ? String(row.id) : "";
    }
  }
  if (!targetId || targetId === userId) return json({ error: "Could not find what you're reporting." }, 404);

  const [report] = await db
    .insert(reports)
    .values({ reporterId: userId, targetType, targetId, reason, details: str(body.details, 1000) })
    .returning({ id: reports.id });
  await logActivity(userId, "report.create", targetType, targetId, reason);
  return json({ ok: true, id: report.id }, 201);
}

export default async (req: Request) => {
  try {
    const user = await currentUser();
    if (!user) return unauthorized();
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/api/community/search" && req.method === "GET") return await search(user.id, url);
    if (path === "/api/community/suggested" && req.method === "GET") return await suggested(user.id);
    if (path === "/api/friends" && req.method === "GET") return await listFriends(user.id);
    if (path === "/api/friends" && req.method === "POST") return await changeFriend(req, user.id);
    if (path === "/api/blocks" && req.method === "GET") return await listBlocks(user.id);
    if (path === "/api/blocks" && req.method === "POST") return await changeBlock(req, user.id);
    if (path === "/api/reports" && req.method === "POST") return await fileReport(req, user.id);
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("Community API error:", (error as Error)?.name || "error");
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
};

export const config: Config = {
  path: ["/api/community/search", "/api/community/suggested", "/api/friends", "/api/blocks", "/api/reports"],
};
