// ==============================================================
// 🌌 SOCIAL — shared helpers for the survivor platform APIs
// Auth (Netlify Identity), JSON responses, safety checks and the
// activity trail. Every write goes through `moderate()` first.
// ==============================================================

import Anthropic from "@anthropic-ai/sdk";
import { admin, getUser } from "@netlify/identity";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { activityLog, blocks, friends, memberRoles, profiles, siteSettings, users } from "../../db/schema.js";

export const anthropic = new Anthropic();
export const WRITER_MODEL = "claude-sonnet-5";
export const MODERATION_MODEL = "claude-haiku-4-5";

export const MOODS = ["low", "anxious", "rising", "fierce"] as const;
export type Mood = (typeof MOODS)[number];

export const CRISIS_SUPPORT = {
  house: "/crisis.html",
  tools: "/tools.html",
  note: "Sit with the story. This house does not publish clinic numbers or NHS lines.",
};

export const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export const str = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

// ─── OWNER ───
// Shane Cooper is the sole Owner and Founder. Ownership comes from his
// verified email alone: it is never stored, so it can't be granted,
// revoked, demoted or claimed by anyone else.
// The addresses live only in the NETLIFY_OWNER_EMAILS env var (comma-separated),
// never in code. If it's unset, nobody is Owner — the safe way to fail.
export const OWNER_EMAILS = (process.env.NETLIFY_OWNER_EMAILS ?? "")
  .split(/[,;\s]+/)
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
export const OWNER_NAME = "Shane";
export const isOwnerEmail = (email = "") => OWNER_EMAILS.includes(email.trim().toLowerCase());

// The email must be confirmed before it unlocks anything — a sign-up that
// merely types Shane's address gets nothing until it's proven theirs.
const verifiedOwners = new Map<string, boolean>();
async function ownerVerified(user: { id: string; email?: string; provider?: string; confirmedAt?: string }) {
  if (!isOwnerEmail(user.email)) return false;
  const cached = verifiedOwners.get(user.id);
  if (cached !== undefined) return cached;
  let ok = Boolean(user.confirmedAt) || (user.provider !== undefined && user.provider !== "email");
  if (!ok) {
    try {
      const full = await admin.getUser(user.id);
      ok = Boolean(full.confirmedAt) && isOwnerEmail(full.email);
    } catch (error) {
      console.error("Could not verify the owner account:", error);
      return false; // don't cache — try again next request
    }
  }
  verifiedOwners.set(user.id, ok);
  return ok;
}

// ─── AUTH ───
export type AuthedUser = { id: string; email: string; roles: string[]; isOwner: boolean };

// Roles a member holds: Identity roles (set in the Netlify UI), roles the
// Owner granted here, and — for Shane alone — owner + full power.
async function effectiveRoles(userId: string, identityRoles: string[], owner: boolean) {
  const granted = await db.select({ role: memberRoles.role }).from(memberRoles).where(eq(memberRoles.userId, userId));
  const roles = new Set([...identityRoles, ...granted.map((g) => g.role)].filter((r) => r !== "owner"));
  if (owner) {
    ["owner", "creator", "admin"].forEach((r) => roles.add(r));
    // A marker row so the 💫 Owner badge can show on Shane's posts for everyone.
    if (!granted.some((g) => g.role === "owner")) {
      await db.insert(memberRoles).values({ userId, role: "owner", grantedBy: "verified-email" }).onConflictDoNothing();
    }
  }
  return [...roles];
}

export async function currentUser(): Promise<AuthedUser | null> {
  const user = await getUser();
  if (!user) return null;
  const email = user.email ?? "";
  // Keep our own users row in step with Identity — created on first API call.
  await db
    .insert(users)
    .values({ id: user.id, email })
    .onConflictDoUpdate({ target: users.id, set: { email, lastSeenAt: new Date() } });
  const owner = await ownerVerified(user);
  return { id: user.id, email, roles: await effectiveRoles(user.id, user.roles ?? [], owner), isOwner: owner };
}

// For pages that work for guests too (public profiles, Arron): never throws.
export async function optionalUser(): Promise<AuthedUser | null> {
  try {
    return await currentUser();
  } catch (error) {
    console.error("Could not read the signed-in user:", error);
    return null;
  }
}

export const unauthorized = () => json({ error: "Please sign in first." }, 401);

// ─── ROLES ───
// 💫 owner (Shane, automatic) · 💫 creator · 🛡️ admin · ✨ guardian · 🌿 member.
// The Owner grants Guardian and Creator from the Owner's Room; admin stays in Netlify → Identity.
export const GRANTABLE_ROLES = ["guardian", "creator"] as const;
export const GUARDIAN_ROLES = ["owner", "admin", "creator", "guardian"];
export const isGuardian = (roles: string[] = []) => roles.some((r) => GUARDIAN_ROLES.includes(r));
export const isCreator = (roles: string[] = []) => roles.includes("owner") || roles.includes("creator") || roles.includes("admin");
export const isOwner = (roles: string[] = []) => roles.includes("owner");

export function roleTier(roles: string[] = []) {
  if (roles.includes("owner")) return "owner";
  if (roles.includes("creator")) return "creator";
  if (roles.includes("admin")) return "admin";
  if (roles.includes("guardian")) return "guardian";
  return "member";
}

// ─── OWNER SETTINGS ───
// reviewMode: member posts wait for the Owner before going live. arronVoice: Shane's notes on how Arron speaks.
export type SiteSettings = { reviewMode: boolean; arronVoice: string };
const SETTINGS_DEFAULTS: SiteSettings = { reviewMode: false, arronVoice: "" };

export async function getSettings(): Promise<SiteSettings> {
  try {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, "owner"));
    return { ...SETTINGS_DEFAULTS, ...((row?.value as Partial<SiteSettings>) ?? {}) };
  } catch (error) {
    console.error("Settings unavailable:", error);
    return SETTINGS_DEFAULTS;
  }
}

export async function saveSettings(changes: Partial<SiteSettings>) {
  const value = { ...(await getSettings()), ...changes };
  await db
    .insert(siteSettings)
    .values({ key: "owner", value })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
  return value;
}

// ─── VISIBILITY ───
// public: anyone (guests too) · members: signed-in members · friends: accepted friends · private: only me
export const VISIBILITIES = ["public", "members", "friends", "private"] as const;
export type Visibility = (typeof VISIBILITIES)[number];
export const cleanVisibility = (value: unknown, fallback: Visibility = "public"): Visibility =>
  typeof value === "string" && (VISIBILITIES as readonly string[]).includes(value) ? (value as Visibility) : fallback;

export const TRUTH_TAGS = ["known", "experience", "thought", "belief", "unknown"] as const;
/**
 * Platform truth taxonomy. Legacy values are accepted and normalised so existing posts do not break.
 * known = evidence-backed; experience = personally experienced; thought = idea/hypothesis;
 * belief = personal/philosophical belief; unknown = genuinely unresolved.
 */
export const cleanTruthTag = (value: unknown) => {
  if (typeof value !== "string") return "";
  const legacy: Record<string, string> = { evidence: "known", philosophy: "belief" };
  const normal = legacy[value] ?? value;
  return (TRUTH_TAGS as readonly string[]).includes(normal) ? normal : "";
};

// ─── RELATIONSHIPS ───
export async function isBlockedEitherWay(a: string, b: string) {
  const rows = await db
    .select({ id: blocks.blockerId })
    .from(blocks)
    .where(
      or(
        and(eq(blocks.blockerId, a), eq(blocks.blockedId, b)),
        and(eq(blocks.blockerId, b), eq(blocks.blockedId, a)),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

export async function areFriends(a: string, b: string) {
  if (a === b) return true;
  const rows = await db
    .select({ id: friends.id })
    .from(friends)
    .where(
      and(
        eq(friends.status, "accepted"),
        or(
          and(eq(friends.requesterId, a), eq(friends.addresseeId, b)),
          and(eq(friends.requesterId, b), eq(friends.addresseeId, a)),
        ),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

// Ids of everyone this user has blocked or been blocked by.
export async function blockedIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ blocker: blocks.blockerId, blocked: blocks.blockedId })
    .from(blocks)
    .where(or(eq(blocks.blockerId, userId), eq(blocks.blockedId, userId)));
  return rows.map((r) => (r.blocker === userId ? r.blocked : r.blocker));
}

export async function friendIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ a: friends.requesterId, b: friends.addresseeId })
    .from(friends)
    .where(
      and(
        eq(friends.status, "accepted"),
        or(eq(friends.requesterId, userId), eq(friends.addresseeId, userId)),
      ),
    );
  return rows.map((r) => (r.a === userId ? r.b : r.a));
}

export async function profileFor(userId: string) {
  const [row] = await db.select().from(profiles).where(eq(profiles.userId, userId));
  return row ?? null;
}

// ─── ACTIVITY TRAIL ───
export async function logActivity(
  userId: string | null,
  action: string,
  targetType?: string,
  targetId?: string | number,
  detail = "",
) {
  try {
    await db.insert(activityLog).values({
      userId,
      action,
      targetType: targetType ?? null,
      targetId: targetId === undefined ? null : String(targetId),
      detail: detail.slice(0, 500),
    });
  } catch (error) {
    console.error("Could not write activity log:", error);
  }
}

// ─── SAFETY ───
// Keyword net for self-harm / suicide. Deliberately broad: a false positive
// only adds a support strip, a false negative could leave someone alone.
const CRISIS_PATTERNS = [
  /\bsuicid/i,
  /\bkill(ing)?\s+my\s*self\b/i,
  /\bend(ing)?\s+(it\s+all|my\s+life|things)\b/i,
  /\bwant(ed)?\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+here|wake\s+up)\b/i,
  /\bself[\s-]?harm/i,
  /\bcut(ting)?\s+my\s*self\b/i,
  /\bhurt(ing)?\s+my\s*self\b/i,
  /\boverdos/i,
  /\bno\s+reason\s+to\s+live\b/i,
  /\bbetter\s+off\s+(dead|without\s+me)\b/i,
  /\btake\s+my\s+(own\s+)?life\b/i,
];

export const mentionsCrisis = (text: string) => CRISIS_PATTERNS.some((re) => re.test(text));

// Heavier topics that deserve a click-to-reveal content warning.
const HEAVY_PATTERNS = [/\babuse[ds]?\b/i, /\bassault/i, /\brape[ds]?\b/i, /\beating\s+disorder/i, /\bpsychosis\b/i, /\btrauma\b/i];

export type Verdict = {
  allowed: boolean;
  reason: string;
  crisis: boolean;
  contentWarning: boolean;
};

// Every post and comment passes through here before it is saved.
// Pain, struggle and dark feelings are always allowed — this is a survivor
// space. What is blocked is cruelty: harassment, hate, threats, spam,
// graphic method detail, or encouraging anyone to hurt themselves.
export async function moderate(text: string, kind: "post" | "comment"): Promise<Verdict> {
  const crisis = mentionsCrisis(text);
  const heavy = crisis || HEAVY_PATTERNS.some((re) => re.test(text));
  const fallback: Verdict = { allowed: true, reason: "", crisis, contentWarning: heavy };
  if (!text.trim()) return fallback;

  try {
    const response = await anthropic.messages.create({
      model: MODERATION_MODEL,
      max_tokens: 200,
      system: `You are the safety moderator for Pleading Sanity, a UK peer-support community for mental health survivors.
Classify a user's ${kind}. Reply with ONLY a JSON object, no prose:
{"allowed": boolean, "reason": string, "crisis": boolean, "contentWarning": boolean}

allowed=false ONLY for: harassment or insults aimed at people, hate speech, threats, sexual content, spam or scams,
doxxing (addresses, phone numbers of others, real names of third parties), detailed self-harm or suicide METHODS,
or encouraging someone to hurt themselves.${kind === "comment" ? " For comments also block mockery, dismissiveness (\"just get over it\"), or unkind replies — comments must be kind and supportive." : ""}
allowed=true for sharing pain, sadness, anger at life, trauma histories, dark feelings, recovery stories, swearing that is not aimed at someone.
crisis=true if the writer may be at risk of suicide or self-harm.
contentWarning=true for heavy topics (self-harm, suicide, abuse, assault, eating disorders, graphic trauma).
reason: one short, gentle sentence addressed to the writer explaining what to change (empty if allowed).`,
      messages: [{ role: "user", content: text.slice(0, 6000) }],
    });
    const raw = response.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    const parsed = JSON.parse(match[0]) as Partial<Verdict>;
    return {
      allowed: parsed.allowed !== false,
      reason: typeof parsed.reason === "string" ? parsed.reason.slice(0, 300) : "",
      crisis: crisis || parsed.crisis === true,
      contentWarning: heavy || parsed.contentWarning === true || parsed.crisis === true,
    };
  } catch (error) {
    // If the AI check is unavailable we still publish — keyword safety nets stay on.
    console.error("Moderation unavailable:", error);
    return fallback;
  }
}

// ─── FORMATTING ───
export const USERNAME = /^[a-z0-9_]{3,24}$/;

export function cleanTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const tags = value
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.replace(/^#/, "").replace(/[^\p{L}\p{N}_]/gu, "").slice(0, 30))
    .filter(Boolean);
  return [...new Set(tags)].slice(0, 8);
}

export function cleanMood(value: unknown): Mood {
  return typeof value === "string" && (MOODS as readonly string[]).includes(value) ? (value as Mood) : "rising";
}

export const publicProfile = (p: typeof profiles.$inferSelect) => ({
  username: p.username,
  displayName: p.displayName,
  avatar: p.avatar,
  pronouns: p.pronouns,
  bio: p.bio,
  country: p.country,
  mood: p.mood,
  interests: p.interests,
  isPrivate: p.isPrivate,
  pageVisibility: p.pageVisibility,
  status: p.statusText ? { text: p.statusText, mood: p.statusMood, at: p.statusAt } : null,
  joinedAt: p.createdAt,
});

export const countSql = sql<number>`count(*)::int`;

// Public role badges for a set of people: owner · guardian · creator (or nothing).
export async function badgesFor(userIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!userIds.length) return map;
  const rows = await db
    .select({ userId: memberRoles.userId, role: memberRoles.role })
    .from(memberRoles)
    .where(inArray(memberRoles.userId, userIds));
  const rank = ["owner", "guardian", "creator"];
  for (const r of rows) {
    const current = map.get(r.userId);
    if (rank.includes(r.role) && (!current || rank.indexOf(r.role) < rank.indexOf(current))) map.set(r.userId, r.role);
  }
  return map;
}
