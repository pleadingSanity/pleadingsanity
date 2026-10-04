// ==============================================================
// ✍️ PUBLISH — one path onto the community feed
// Used by the post composer, "share from my journal" and Arron's
// "share this update". Every post passes the kindness check, gets a
// Truth Tag, and goes live now — or waits for the Owner when review
// mode is on. The Owner's own posts are always live instantly.
// ==============================================================

import { getStore } from "@netlify/blobs";
import { db } from "../../db/index.js";
import { journalEntries, posts } from "../../db/schema.js";
import {
  cleanMood,
  cleanTags,
  cleanTruthTag,
  cleanVisibility,
  CRISIS_SUPPORT,
  getSettings,
  isCreator,
  isGuardian,
  isOwner,
  logActivity,
  moderate,
  profileFor,
  str,
  type Visibility,
} from "./social.js";

export const POST_KINDS = ["text", "story", "video", "image", "status", "journal", "writing"] as const;
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export type Post = typeof posts.$inferSelect;
export type Author = { id: string; roles: string[] };

export function youtubeId(input: string): string | null {
  const value = input.trim();
  if (YOUTUBE_ID.test(value)) return value;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = url.searchParams.get("v");
      const parts = url.pathname.split("/").filter(Boolean);
      if (!id && ["embed", "shorts", "live", "v"].includes(parts[0])) id = parts[1] ?? null;
    }
    return id && YOUTUBE_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

// Trusted voices (Owner, Creators, Guardians) always publish straight away.
export async function needsReview(roles: string[]) {
  if (isOwner(roles) || isCreator(roles) || isGuardian(roles)) return false;
  return (await getSettings()).reviewMode;
}

type Result =
  | { ok: true; post: Post; pending: boolean; crisis: boolean; support: typeof CRISIS_SUPPORT | null }
  | { ok: false; status: number; error: string; reason?: string; blocked?: boolean; onboarding?: boolean };

export async function publishPost(author: Author, input: Record<string, unknown>): Promise<Result> {
  const profile = await profileFor(author.id);
  if (!profile?.onboarded) return { ok: false, status: 409, error: "Finish setting up your profile first.", onboarding: true };

  const kind = (POST_KINDS as readonly string[]).includes(input.kind as string) ? (input.kind as string) : "text";
  const title = str(input.title, 120);
  const text = str(input.body, kind === "story" || kind === "writing" || kind === "journal" ? 20000 : 5000);

  let videoId: string | null = null;
  let imageKey: string | null = null;
  if (kind === "video") {
    videoId = youtubeId(str(input.videoUrl, 300));
    const videoKey = str(input.videoKey, 200);
    if (!videoId && videoKey.startsWith(`${author.id}/`)) {
      const exists = await getStore("post-images").getMetadata(videoKey);
      if (!exists) return { ok: false, status: 400, error: "That video upload has expired — please add it again." };
      imageKey = videoKey;
    } else if (!videoId) {
      return { ok: false, status: 400, error: "Add a YouTube link, or a short video under 8 MB." };
    }
  }
  if (kind === "image") {
    const key = str(input.imageKey, 200);
    if (!key.startsWith(`${author.id}/`)) return { ok: false, status: 400, error: "Please upload an image first." };
    const exists = await getStore("post-images").getMetadata(key);
    if (!exists) return { ok: false, status: 400, error: "That image upload has expired — please add it again." };
    imageKey = key;
  }

  if (!title && !text && !videoId && !imageKey) return { ok: false, status: 400, error: "Your post is empty." };

  const verdict = await moderate(`${title}\n\n${text}`, "post");
  if (!verdict.allowed) {
    await logActivity(author.id, "post.blocked", "post", undefined, verdict.reason);
    return {
      ok: false,
      status: 422,
      error: "This post can't be shared as it is.",
      reason: verdict.reason || "It may be hurtful to others. Try rewording it with kindness.",
      blocked: true,
    };
  }

  const fallback: Visibility = profile.isPrivate ? "friends" : cleanVisibility(profile.defaultVisibility);
  const visibility = cleanVisibility(input.visibility, fallback);
  const pending = visibility !== "private" && (await needsReview(author.roles));
  const [post] = await db
    .insert(posts)
    .values({
      authorId: author.id,
      kind,
      title,
      body: text,
      videoId,
      imageKey,
      tags: cleanTags(input.tags),
      mood: cleanMood(input.mood ?? profile.mood),
      truthTag: cleanTruthTag(input.truthTag) || cleanTruthTag(profile.truthTagDefault),
      contentWarning: verdict.contentWarning || input.contentWarning === true,
      crisis: verdict.crisis,
      visibility,
      status: pending ? "pending" : "live",
    })
    .returning();
  await logActivity(author.id, pending ? "post.pending" : "post.create", "post", post.id, verdict.crisis ? "crisis-strip" : "");
  return { ok: true, post, pending, crisis: verdict.crisis, support: verdict.crisis ? CRISIS_SUPPORT : null };
}

// ─── JOURNAL ───
// Private first. Entries written with Arron arrive here too (source: "arron").
export async function saveJournalEntry(userId: string, input: { title?: string; body: string; mood?: string; source?: "self" | "arron" }) {
  const body = str(input.body, 20000);
  if (!body) return null;
  const [entry] = await db
    .insert(journalEntries)
    .values({
      userId,
      title: str(input.title, 120),
      body,
      mood: input.mood ? cleanMood(input.mood) : "",
      source: input.source ?? "self",
      visibility: "private",
    })
    .returning();
  await logActivity(userId, "journal.create", "journal", entry.id, input.source ?? "self");
  return entry;
}
