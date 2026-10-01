// ==============================================================
// 🌌 SOCIAL — shared helpers for the survivor platform APIs
// Auth (Netlify Identity), JSON responses, safety checks and the
// activity trail. Every write goes through `moderate()` first.
// ==============================================================

import Anthropic from "@anthropic-ai/sdk";
import { getUser } from "@netlify/identity";
import { and, eq, or, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { activityLog, blocks, friends, profiles, users } from "../../db/schema.js";

export const anthropic = new Anthropic();
export const WRITER_MODEL = "claude-sonnet-5";
export const MODERATION_MODEL = "claude-haiku-4-5";

export const MOODS = ["low", "anxious", "rising", "fierce"] as const;
export type Mood = (typeof MOODS)[number];

export const CRISIS_SUPPORT = {
  samaritans: "116 123",
  shout: "85258",
  emergency: "999",
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

// ─── AUTH ───
export type AuthedUser = { id: string; email: string; roles: string[] };

export async function currentUser(): Promise<AuthedUser | null> {
  const user = await getUser();
  if (!user) return null;
  const email = user.email ?? "";
  // Keep our own users row in step with Identity — created on first API call.
  await db
    .insert(users)
    .values({ id: user.id, email })
    .onConflictDoUpdate({ target: users.id, set: { email, lastSeenAt: new Date() } });
  return { id: user.id, email, roles: user.roles ?? [] };
}

export const unauthorized = () => json({ error: "Please sign in first." }, 401);

// ─── ROLES ───
// 💫 creator (Shane) · 🛡️ admin · ✨ guardian (trusted helpers) · 🌿 member.
// Roles are granted by hand in Netlify → Identity.
export const GUARDIAN_ROLES = ["admin", "creator", "guardian"];
export const isGuardian = (roles: string[] = []) => roles.some((r) => GUARDIAN_ROLES.includes(r));
export const isCreator = (roles: string[] = []) => roles.includes("creator") || roles.includes("admin");

export function roleTier(roles: string[] = []) {
  if (roles.includes("creator")) return "creator";
  if (roles.includes("admin")) return "admin";
  if (roles.includes("guardian")) return "guardian";
  return "member";
}

export const TRUTH_TAGS = ["evidence", "experience", "philosophy"] as const;
export const cleanTruthTag = (value: unknown) =>
  typeof value === "string" && (TRUTH_TAGS as readonly string[]).includes(value) ? value : "";

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
  bio: p.bio,
  country: p.country,
  mood: p.mood,
  interests: p.interests,
  isPrivate: p.isPrivate,
  joinedAt: p.createdAt,
});

export const countSql = sql<number>`count(*)::int`;
