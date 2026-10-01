// ==============================================================
// 💫 OWNER — Shane's powers, shared by the Owner's Room and Arron
// System overview, the review queue, and granting / revoking the
// Guardian and Creator roles. The Owner role itself can never be
// granted, revoked or moved: it belongs to Shane's verified email.
// ==============================================================

import { and, desc, eq, gte, inArray, ne } from "drizzle-orm";
import { db } from "../../db/index.js";
import { memberRoles, posts, profiles, reports, users } from "../../db/schema.js";
import { countSql, GRANTABLE_ROLES, getSettings, isOwnerEmail, logActivity } from "./social.js";

const DAY = 86400000;

export async function overview() {
  const since = new Date(Date.now() - 7 * DAY);
  const today = new Date(Date.now() - DAY);
  const [[members], [newMembers], [postsToday], [pending], [openReports], recent, queue, team, settings] = await Promise.all([
    db.select({ n: countSql }).from(profiles).where(eq(profiles.onboarded, true)),
    db.select({ n: countSql }).from(profiles).where(and(eq(profiles.onboarded, true), gte(profiles.createdAt, since))),
    db.select({ n: countSql }).from(posts).where(gte(posts.createdAt, today)),
    db.select({ n: countSql }).from(posts).where(eq(posts.status, "pending")),
    db.select({ n: countSql }).from(reports).where(eq(reports.status, "open")),
    db
      .select({ username: profiles.username, displayName: profiles.displayName, avatar: profiles.avatar, mood: profiles.mood, joinedAt: profiles.createdAt })
      .from(profiles)
      .where(eq(profiles.onboarded, true))
      .orderBy(desc(profiles.createdAt))
      .limit(12),
    reviewQueue(),
    db
      .select({ role: memberRoles.role, username: profiles.username, displayName: profiles.displayName, avatar: profiles.avatar })
      .from(memberRoles)
      .innerJoin(profiles, eq(profiles.userId, memberRoles.userId))
      .where(inArray(memberRoles.role, [...GRANTABLE_ROLES])),
    getSettings(),
  ]);
  return {
    counts: {
      members: members?.n ?? 0,
      newMembers: newMembers?.n ?? 0,
      postsToday: postsToday?.n ?? 0,
      pending: pending?.n ?? 0,
      openReports: openReports?.n ?? 0,
    },
    recentMembers: recent,
    queue,
    team,
    settings,
  };
}

export async function reviewQueue(status: "pending" | "held" = "pending") {
  const rows = await db
    .select({ post: posts, author: profiles })
    .from(posts)
    .leftJoin(profiles, eq(profiles.userId, posts.authorId))
    .where(and(eq(posts.status, status), eq(posts.hidden, false)))
    .orderBy(desc(posts.createdAt))
    .limit(50);
  return rows.map(({ post, author }) => ({
    id: post.id,
    kind: post.kind,
    title: post.title,
    body: post.body.slice(0, 1500),
    mood: post.mood,
    truthTag: post.truthTag,
    visibility: post.visibility,
    contentWarning: post.contentWarning,
    crisis: post.crisis,
    imageUrl: post.imageKey ? `/api/images/${post.imageKey}` : null,
    status: post.status,
    createdAt: post.createdAt,
    author: author
      ? { username: author.username, displayName: author.displayName, avatar: author.avatar }
      : { username: "", displayName: "Survivor", avatar: "🌌" },
  }));
}

// approve → live on the feed now · hold → stays off the feed (the author still sees it)
export async function reviewPost(ownerId: string, id: number, action: "approve" | "hold") {
  if (!Number.isInteger(id)) return null;
  const [row] = await db
    .update(posts)
    .set({ status: action === "approve" ? "live" : "held" })
    .where(and(eq(posts.id, id), ne(posts.status, "live")))
    .returning({ id: posts.id, status: posts.status });
  if (row) await logActivity(ownerId, `owner.${action}`, "post", id);
  return row ?? null;
}

export async function approveAll(ownerId: string) {
  const rows = await db.update(posts).set({ status: "live" }).where(eq(posts.status, "pending")).returning({ id: posts.id });
  await logActivity(ownerId, "owner.approve-all", "post", undefined, String(rows.length));
  return rows.length;
}

type RoleResult = { ok: true; displayName: string; username: string; role: string; granted: boolean } | { ok: false; error: string };

export async function setRole(ownerId: string, usernameRaw: string, roleRaw: string, grant: boolean): Promise<RoleResult> {
  const role = roleRaw.toLowerCase();
  if (role === "owner") return { ok: false, error: "There is only one Owner. That key isn't transferable." };
  if (!(GRANTABLE_ROLES as readonly string[]).includes(role)) return { ok: false, error: "Roles you can give are Guardian and Creator." };
  const username = usernameRaw.replace(/^@/, "").trim().toLowerCase();
  const [target] = await db
    .select({ userId: profiles.userId, username: profiles.username, displayName: profiles.displayName, email: users.email })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .where(eq(profiles.username, username));
  if (!target) return { ok: false, error: `No member called @${username}.` };
  if (target.userId === ownerId || isOwnerEmail(target.email)) return { ok: false, error: "The Owner already holds every power — nothing to change." };

  if (grant) {
    await db.insert(memberRoles).values({ userId: target.userId, role, grantedBy: ownerId }).onConflictDoNothing();
  } else {
    await db.delete(memberRoles).where(and(eq(memberRoles.userId, target.userId), eq(memberRoles.role, role)));
  }
  await logActivity(ownerId, grant ? "owner.grant" : "owner.revoke", "user", target.userId, role);
  return { ok: true, displayName: target.displayName, username: target.username, role, granted: grant };
}
