// ==============================================================
// 🌌 PROFILES — /api/me, /api/me/status and /api/profiles/:username
// Own Sanity Profile (read / onboard / edit / delete account), the
// daily status check-in, and public pages (/@username) — which
// guests can open too when the member keeps their page public.
// ==============================================================

import type { Config } from "@netlify/functions";
import { admin } from "@netlify/identity";
import { getStore } from "@netlify/blobs";
import { and, desc, eq, inArray, like, ne, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  activityLog,
  aiStories,
  aiStoryHearts,
  arronMemories,
  arronMessages,
  comments,
  creations,
  friends,
  gameProgress,
  journalEntries,
  passports,
  posts,
  profiles,
  rateLimits,
  saves,
  siteContent,
  studioItems,
  studioUsage,
  studioVotes,
  users,
} from "../../db/schema.js";
import {
  areFriends,
  badgesFor,
  cleanMood,
  cleanTags,
  cleanTruthTag,
  cleanVisibility,
  countSql,
  getSettings,
  isBlockedEitherWay,
  isGuardian,
  json,
  logActivity,
  mentionsCrisis,
  optionalUser,
  OWNER_NAME,
  profileFor,
  publicProfile,
  readBody,
  roleTier,
  str,
  unauthorized,
  USERNAME,
} from "../lib/social.js";
import { publishPost } from "../lib/publish.js";

const MAX_BIO = 300;
const MAX_STORY = 10000;
const MAX_STATUS = 280;

type Audience = "self" | "friends" | "members" | "guest";
// Post audiences each kind of visitor may see on someone's page.
const AUDIENCES: Record<Audience, string[]> = {
  self: ["public", "members", "friends", "private"],
  friends: ["public", "members", "friends"],
  members: ["public", "members"],
  guest: ["public"],
};

async function postCount(userId: string, audience: Audience) {
  const [row] = await db
    .select({ n: countSql })
    .from(posts)
    .where(
      and(
        eq(posts.authorId, userId),
        eq(posts.hidden, false),
        audience === "self" ? undefined : eq(posts.status, "live"),
        inArray(posts.visibility, AUDIENCES[audience]),
      ),
    );
  return row?.n ?? 0;
}

async function friendCount(userId: string) {
  const [row] = await db
    .select({ n: countSql })
    .from(friends)
    .where(and(eq(friends.status, "accepted"), or(eq(friends.requesterId, userId), eq(friends.addresseeId, userId))));
  return row?.n ?? 0;
}

const ownProfile = (p: typeof profiles.$inferSelect) => ({
  ...publicProfile(p),
  story: p.story,
  onboarded: p.onboarded,
  defaultVisibility: p.defaultVisibility,
  truthTagDefault: p.truthTagDefault,
});

// ─── GET /api/me ───
async function getMe(user: { id: string; email: string; roles: string[]; isOwner: boolean }) {
  const profile = await profileFor(user.id);
  const [pending] = await db
    .select({ n: countSql })
    .from(friends)
    .where(and(eq(friends.addresseeId, user.id), eq(friends.status, "pending")));
  const [journal] = await db.select({ n: countSql }).from(journalEntries).where(eq(journalEntries.userId, user.id));
  let awaitingReview = 0;
  if (user.isOwner) {
    const [row] = await db.select({ n: countSql }).from(posts).where(eq(posts.status, "pending"));
    awaitingReview = row?.n ?? 0;
  }
  return json({
    user: {
      id: user.id,
      email: user.email,
      isOwner: user.isOwner,
      isAdmin: user.roles.includes("admin"),
      isGuardian: isGuardian(user.roles),
      role: roleTier(user.roles),
      ownerName: user.isOwner ? OWNER_NAME : undefined,
    },
    profile: profile ? ownProfile(profile) : null,
    community: { reviewMode: (await getSettings()).reviewMode },
    counts: {
      posts: await postCount(user.id, "self"),
      friends: await friendCount(user.id),
      journal: journal?.n ?? 0,
      pendingRequests: pending?.n ?? 0,
      awaitingReview,
    },
  });
}

// ─── PUT /api/me — onboarding and profile edits ───
async function saveMe(req: Request, userId: string) {
  const body = await readBody(req);
  const existing = await profileFor(userId);

  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : existing?.username ?? "";
  if (!USERNAME.test(username)) {
    return json({ error: "Usernames are 3–24 characters: lowercase letters, numbers and underscores." }, 400);
  }
  const taken = await db
    .select({ id: profiles.userId })
    .from(profiles)
    .where(and(eq(profiles.username, username), ne(profiles.userId, userId)))
    .limit(1);
  if (taken.length) return json({ error: "That username is taken — try another." }, 409);

  const displayName = str(body.displayName, 40) || existing?.displayName || username;
  const avatar = str(body.avatar, 220) || existing?.avatar || "🌌";
  const pick = <T,>(key: string, clean: (v: unknown) => T, fallback: T): T =>
    key in body ? clean(body[key]) : fallback;

  const values = {
    username,
    displayName,
    avatar,
    pronouns: pick("pronouns", (v) => str(v, 30), existing?.pronouns ?? ""),
    bio: pick("bio", (v) => str(v, MAX_BIO), existing?.bio ?? ""),
    country: pick("country", (v) => str(v, 56), existing?.country ?? ""),
    mood: pick("mood", cleanMood, cleanMood(existing?.mood)),
    interests: pick("interests", cleanTags, existing?.interests ?? []),
    story: pick("story", (v) => str(v, MAX_STORY), existing?.story ?? ""),
    isPrivate: pick("isPrivate", (v) => v === true, existing?.isPrivate ?? false),
    pageVisibility: pick("pageVisibility", (v) => (v === "members" ? "members" : "public"), existing?.pageVisibility ?? "public"),
    defaultVisibility: pick("defaultVisibility", (v) => cleanVisibility(v), cleanVisibility(existing?.defaultVisibility)),
    truthTagDefault: pick("truthTagDefault", cleanTruthTag, existing?.truthTagDefault ?? ""),
    onboarded: true,
    updatedAt: new Date(),
  };

  await db
    .insert(profiles)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: profiles.userId, set: values });
  await logActivity(userId, existing ? "profile.update" : "profile.create", "user", userId);

  const saved = await profileFor(userId);
  return json({
    profile: saved ? ownProfile(saved) : null,
    storyNeedsSupport: mentionsCrisis(values.story),
  });
}

// ─── PUT /api/me/status — "How are you really doing?" ───
// Saved on their profile; `share` also posts it to their page and the feed.
async function saveStatus(req: Request, user: { id: string; roles: string[] }) {
  const profile = await profileFor(user.id);
  if (!profile?.onboarded) return json({ error: "Finish setting up your profile first.", onboarding: true }, 409);
  const body = await readBody(req);
  const text = str(body.text, MAX_STATUS);
  const mood = body.mood ? cleanMood(body.mood) : "";

  let shared = null;
  if (text && body.share === true) {
    const result = await publishPost(user, { kind: "status", body: text, mood: mood || profile.mood, visibility: body.visibility, truthTag: "experience" });
    if (!result.ok) {
      const { ok: _ok, status, ...rest } = result;
      return json(rest, status);
    }
    shared = { id: result.post.id, pending: result.pending, crisis: result.crisis };
  }

  await db
    .update(profiles)
    .set({ statusText: text, statusMood: mood, statusAt: text ? new Date() : null, ...(mood ? { mood } : {}), updatedAt: new Date() })
    .where(eq(profiles.userId, user.id));
  await logActivity(user.id, "profile.status", "user", user.id);
  return json({ ok: true, shared, needsSupport: mentionsCrisis(text) });
}

// ─── DELETE /api/me — erase everything ───
// Every row we hold cascades from `users` (profile, posts, comments, likes,
// friends, blocks, journal, creations, Arron memory and messages), every
// uploaded or created image is deleted, then the Identity account itself.
// Also removed by hand because they don't cascade: Write-for-site pieces, the
// activity log, votes and hearts, rate-limit counters and the profile banner.
// Kept on purpose: reports other members made about this account (a safety record).
// Not reachable from here: Netlify's own backups, and words already sent to AI providers.
async function deleteMe(userId: string) {
  const store = getStore("post-images");
  try {
    const { blobs } = await store.list({ prefix: `${userId}/` });
    await Promise.all([...blobs.map((b) => store.delete(b.key).catch(() => {})), store.delete(`banner/${userId}`).catch(() => {})]);
  } catch (error) {
    console.error("Could not list images for erasure:", (error as Error)?.name || "error");
  }

  const voter = `u:${userId}`;
  await Promise.all([
    db.delete(siteContent).where(eq(siteContent.authorId, userId)),
    db.delete(activityLog).where(eq(activityLog.userId, userId)),
    db.delete(studioVotes).where(eq(studioVotes.voter, voter)),
    db.delete(aiStoryHearts).where(eq(aiStoryHearts.voter, voter)),
    db.delete(studioUsage).where(like(studioUsage.key, `%${voter}%`)),
    db.delete(rateLimits).where(like(rateLimits.key, `%:${voter}`)),
  ]).catch((error) => console.error("Could not erase every side record:", (error as Error)?.name || "error"));
  await db.delete(users).where(eq(users.id, userId));
  await logActivity(null, "account.delete", "user", "erased");

  try {
    await admin.deleteUser(userId);
  } catch (error) {
    console.error("Could not delete Identity account:", (error as Error)?.name || "error");
    return json({ ok: true, identityDeleted: false });
  }
  return json({ ok: true, identityDeleted: true });
}

// ─── GET /api/me/export — everything we hold for this account, as one JSON file ───
// Images are listed by key, not inlined. Device-only data (local journal, finance,
// game saves on the phone) is not on the server and is not in this file.
async function exportMe(user: { id: string; email: string; roles: string[] }) {
  const id = user.id;
  const [profile, passport, myPosts, myComments, journal, made, writing, memory, progress, saved, circle, studio, stories] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.userId, id)),
    db.select().from(passports).where(eq(passports.userId, id)),
    db.select().from(posts).where(eq(posts.authorId, id)).orderBy(desc(posts.id)),
    db.select().from(comments).where(eq(comments.authorId, id)),
    db.select().from(journalEntries).where(eq(journalEntries.userId, id)).orderBy(desc(journalEntries.id)),
    db.select().from(creations).where(eq(creations.authorId, id)),
    db.select().from(siteContent).where(eq(siteContent.authorId, id)),
    db.select().from(arronMemories).where(eq(arronMemories.userId, id)),
    db.select().from(gameProgress).where(eq(gameProgress.userId, id)),
    db.select().from(saves).where(eq(saves.userId, id)),
    db.select().from(friends).where(or(eq(friends.requesterId, id), eq(friends.addresseeId, id))),
    db.select().from(studioItems).where(eq(studioItems.authorId, id)),
    db.select().from(aiStories).where(eq(aiStories.authorId, id)),
  ]);
  const memoryIds = memory.map((m) => m.id);
  const messages = memoryIds.length ? await db.select().from(arronMessages).where(inArray(arronMessages.memoryId, memoryIds)) : [];
  await logActivity(id, "account.export", "user", id);
  const file = {
    exportedAt: new Date().toISOString(),
    about: "Everything Pleading Sanity's database holds for this account. Data kept only on your device is not included.",
    account: { id, email: user.email, roles: user.roles },
    profile: profile[0] ?? null,
    passport: passport[0] ?? null,
    posts: myPosts,
    comments: myComments,
    journal,
    creations: made,
    writingForSite: writing,
    arron: { memories: memory, messages },
    gameProgress: progress,
    saves: saved,
    friends: circle,
    studio,
    aiStories: stories,
  };
  return new Response(JSON.stringify(file, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="pleading-sanity-my-data.json"`,
      "Cache-Control": "no-store",
    },
  });
}

// ─── GET /api/profiles/:username — the /@username page ───
async function getProfile(viewerId: string | null, username: string) {
  const [profile] = await db.select().from(profiles).where(eq(profiles.username, username.toLowerCase()));
  const notFound = () => json({ error: "No one here by that name." }, 404);
  if (!profile || !profile.onboarded) return notFound();

  const isSelf = profile.userId === viewerId;
  if (viewerId && !isSelf && (await isBlockedEitherWay(viewerId, profile.userId))) return notFound();

  // Relationship between the viewer and this person.
  let relationship: "self" | "friends" | "outgoing" | "incoming" | "none" | "guest" = isSelf ? "self" : viewerId ? "none" : "guest";
  if (viewerId && !isSelf) {
    const [link] = await db
      .select()
      .from(friends)
      .where(
        or(
          and(eq(friends.requesterId, viewerId), eq(friends.addresseeId, profile.userId)),
          and(eq(friends.requesterId, profile.userId), eq(friends.addresseeId, viewerId)),
        ),
      );
    if (link?.status === "accepted") relationship = "friends";
    else if (link) relationship = link.requesterId === viewerId ? "outgoing" : "incoming";
  }

  const isFriend = relationship === "friends" || (viewerId && !isSelf ? await areFriends(viewerId, profile.userId) : false);
  const audience: Audience = isSelf ? "self" : isFriend ? "friends" : viewerId ? "members" : "guest";
  const badge = (await badgesFor([profile.userId])).get(profile.userId) ?? "";
  const base = {
    username: profile.username,
    displayName: profile.displayName,
    avatar: profile.avatar,
    pronouns: profile.pronouns,
    mood: profile.mood,
    isPrivate: profile.isPrivate,
    pageVisibility: profile.pageVisibility,
    badge,
    joinedAt: profile.createdAt,
  };

  // Members-only pages ask guests to sign in; friends-only pages stay locked to non-friends.
  if (audience === "guest" && profile.pageVisibility !== "public") {
    return json({ profile: base, relationship, locked: "members", posts: [], journal: [], counts: { posts: 0, friends: 0 } });
  }
  if (profile.isPrivate && audience !== "self" && audience !== "friends") {
    return json({ profile: base, relationship, locked: "friends", posts: [], journal: [], counts: { posts: 0, friends: 0 } });
  }

  // Shared journal entries only — private ones never leave /profile.html.
  const journal = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, profile.userId), inArray(journalEntries.visibility, audience === "guest" ? ["public"] : ["public", "members"])))
    .orderBy(desc(journalEntries.id))
    .limit(10);

  return json({
    profile: { ...publicProfile(profile), story: profile.story, badge },
    relationship,
    locked: false,
    counts: { posts: await postCount(profile.userId, audience), friends: await friendCount(profile.userId) },
    journal: journal.map((j) => ({
      id: j.id,
      title: j.title,
      body: j.body.slice(0, 1200),
      mood: j.mood,
      truthTag: j.truthTag,
      crisis: mentionsCrisis(j.body),
      createdAt: j.createdAt,
    })),
  });
}

export default async (req: Request) => {
  try {
    const user = await optionalUser();
    const url = new URL(req.url);

    if (url.pathname.startsWith("/api/profiles/")) {
      const username = decodeURIComponent(url.pathname.replace("/api/profiles/", ""));
      if (req.method === "GET" && username) return await getProfile(user?.id ?? null, username);
      return json({ error: "Not found" }, 404);
    }

    if (!user) return unauthorized();
    if (url.pathname === "/api/me/status") {
      if (req.method === "PUT") return await saveStatus(req, user);
      return json({ error: "Method not allowed" }, 405);
    }
    if (url.pathname === "/api/me/export") {
      if (req.method === "GET") return await exportMe(user);
      return json({ error: "Method not allowed" }, 405);
    }
    if (req.method === "GET") return await getMe(user);
    if (req.method === "PUT") return await saveMe(req, user.id);
    if (req.method === "DELETE") return await deleteMe(user.id);
    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("Profile API error:", (error as Error)?.name || "error");
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
};

export const config: Config = {
  path: ["/api/me", "/api/me/status", "/api/me/export", "/api/profiles/:username"],
};
