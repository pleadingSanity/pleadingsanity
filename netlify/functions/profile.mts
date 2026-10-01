// ==============================================================
// 🌌 PROFILES — /api/me and /api/profiles/:username
// Own profile (read / onboard / edit / delete account) and public
// profiles, respecting friends-only privacy and blocks.
// ==============================================================

import type { Config } from "@netlify/functions";
import { admin } from "@netlify/identity";
import { getStore } from "@netlify/blobs";
import { and, desc, eq, ne, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { friends, posts, profiles, users } from "../../db/schema.js";
import {
  areFriends,
  cleanMood,
  cleanTags,
  countSql,
  currentUser,
  isBlockedEitherWay,
  json,
  logActivity,
  mentionsCrisis,
  profileFor,
  publicProfile,
  readBody,
  roleTier,
  isGuardian,
  str,
  unauthorized,
  USERNAME,
} from "../lib/social.js";

const MAX_BIO = 300;
const MAX_STORY = 10000;

async function postCount(userId: string, includeFriendsOnly: boolean) {
  const [row] = await db
    .select({ n: countSql })
    .from(posts)
    .where(
      and(
        eq(posts.authorId, userId),
        eq(posts.hidden, false),
        includeFriendsOnly ? undefined : eq(posts.visibility, "public"),
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


// ─── GET /api/me ───
async function getMe(userId: string, email: string, roles: string[]) {
  const profile = await profileFor(userId);
  const [pending] = await db
    .select({ n: countSql })
    .from(friends)
    .where(and(eq(friends.addresseeId, userId), eq(friends.status, "pending")));
  return json({
    user: { id: userId, email, isAdmin: roles.includes("admin"), isGuardian: isGuardian(roles), role: roleTier(roles) },
    profile: profile ? { ...publicProfile(profile), story: profile.story, onboarded: profile.onboarded } : null,
    counts: {
      posts: await postCount(userId, true),
      friends: await friendCount(userId),
      pendingRequests: pending?.n ?? 0,
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
  const avatar = str(body.avatar, 8) || existing?.avatar || "🌌";
  const pick = <T,>(key: string, clean: (v: unknown) => T, fallback: T): T =>
    key in body ? clean(body[key]) : fallback;

  const values = {
    username,
    displayName,
    avatar,
    bio: pick("bio", (v) => str(v, MAX_BIO), existing?.bio ?? ""),
    country: pick("country", (v) => str(v, 56), existing?.country ?? ""),
    mood: pick("mood", cleanMood, cleanMood(existing?.mood)),
    interests: pick("interests", cleanTags, existing?.interests ?? []),
    story: pick("story", (v) => str(v, MAX_STORY), existing?.story ?? ""),
    isPrivate: pick("isPrivate", (v) => v === true, existing?.isPrivate ?? false),
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
    profile: saved ? { ...publicProfile(saved), story: saved.story, onboarded: saved.onboarded } : null,
    storyNeedsSupport: mentionsCrisis(values.story),
  });
}

// ─── DELETE /api/me — GDPR erasure ───
// Removes every row we hold (profile, posts, comments, likes, friends,
// blocks cascade from `users`), uploaded images, and the Identity account.
async function deleteMe(userId: string) {
  const images = await db
    .select({ key: posts.imageKey })
    .from(posts)
    .where(eq(posts.authorId, userId));
  const store = getStore("post-images");
  await Promise.all(
    images.filter((i) => i.key).map((i) => store.delete(i.key as string).catch(() => {})),
  );

  await db.delete(users).where(eq(users.id, userId));
  await logActivity(null, "account.delete", "user", userId);

  try {
    await admin.deleteUser(userId);
  } catch (error) {
    console.error("Could not delete Identity account:", error);
    return json({ ok: true, identityDeleted: false });
  }
  return json({ ok: true, identityDeleted: true });
}

// ─── GET /api/profiles/:username ───
async function getProfile(viewerId: string, username: string) {
  const [profile] = await db.select().from(profiles).where(eq(profiles.username, username.toLowerCase()));
  if (!profile) return json({ error: "No one here by that name." }, 404);

  const isSelf = profile.userId === viewerId;
  if (!isSelf && (await isBlockedEitherWay(viewerId, profile.userId))) {
    return json({ error: "No one here by that name." }, 404);
  }

  // Relationship between the viewer and this person.
  let relationship: "self" | "friends" | "outgoing" | "incoming" | "none" = isSelf ? "self" : "none";
  if (!isSelf) {
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

  const canSeeAll = isSelf || relationship === "friends" || (await areFriends(viewerId, profile.userId));
  const base = {
    username: profile.username,
    displayName: profile.displayName,
    avatar: profile.avatar,
    mood: profile.mood,
    isPrivate: profile.isPrivate,
    joinedAt: profile.createdAt,
  };

  if (profile.isPrivate && !canSeeAll) {
    return json({ profile: base, relationship, locked: true, posts: [], counts: { posts: 0, friends: 0 } });
  }

  const recent = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.authorId, profile.userId),
        eq(posts.hidden, false),
        canSeeAll ? undefined : eq(posts.visibility, "public"),
      ),
    )
    .orderBy(desc(posts.createdAt))
    .limit(20);

  return json({
    profile: { ...publicProfile(profile), story: profile.story },
    relationship,
    locked: false,
    counts: { posts: await postCount(profile.userId, canSeeAll), friends: await friendCount(profile.userId) },
    posts: recent.map((p) => ({
      id: p.id,
      kind: p.kind,
      title: p.title,
      body: p.body.slice(0, 400),
      mood: p.mood,
      tags: p.tags,
      contentWarning: p.contentWarning,
      crisis: p.crisis,
      truthTag: p.truthTag,
      createdAt: p.createdAt,
    })),
  });
}

export default async (req: Request) => {
  try {
    const user = await currentUser();
    if (!user) return unauthorized();
    const url = new URL(req.url);

    if (url.pathname === "/api/me") {
      if (req.method === "GET") return await getMe(user.id, user.email, user.roles);
      if (req.method === "PUT") return await saveMe(req, user.id);
      if (req.method === "DELETE") return await deleteMe(user.id);
      return json({ error: "Method not allowed" }, 405);
    }

    const username = decodeURIComponent(url.pathname.replace("/api/profiles/", ""));
    if (req.method === "GET" && username) return await getProfile(user.id, username);
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("Profile API error:", error);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
};

export const config: Config = {
  path: ["/api/me", "/api/profiles/:username"],
};
