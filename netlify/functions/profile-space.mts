// ==============================================================
// P.S SPACE — a member's profile look, saved to their account.
//   GET  /api/me/space                  own space + profile basics
//   PUT  /api/me/space                  save own space (owner only)
//   GET  /api/profiles/:username/space  someone's space, same rules
//                                       as their /@username page
// Stored as one small JSON blob per member (Netlify Blobs store
// "profile-space", key = Identity user id), so no schema change.
// Display name, bio, status line and page privacy reuse the
// columns that already exist on `profiles`.
// No uploads here, no third-party calls, nothing autoplays.
// ==============================================================

import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import { profiles } from "../../db/schema.js";
import {
  areFriends,
  isBlockedEitherWay,
  json,
  logActivity,
  logReason,
  mentionsCrisis,
  optionalUser,
  profileFor,
  readBody,
  str,
  unauthorized,
} from "../lib/social.js";

export const THEMES = ["deep-space", "chrome", "aurora", "ember", "ice", "mono", "sunrise", "neon"] as const;
export const COVERS = ["brain-nebula", "midlands-night", "aurora-cabin", "observatory", "creator-stage", "my-banner"] as const;
const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const TRACK_ID = /^[A-Za-z0-9_-]{1,64}$/;
const TOP8 = /^(space|ai|track|user):[a-z0-9_-]{1,64}$/i;
const MAX_BIO = 300;
const MAX_STATUS = 280;

type Song = { type: "library"; id: string } | { type: "youtube"; id: string; title: string; artist: string } | null;
export type Space = { v: 2; theme: string; cover: string; song: Song; top8: string[]; links: string[] };

const DEFAULT_SPACE: Space = { v: 2, theme: "deep-space", cover: "brain-nebula", song: null, top8: ["ai:arron", "space:ps-radio", "space:healing-hz", "space:feed"], links: [] };

// Loopback, private, link-local and unique-local hosts are never stored as links:
// 127/8, 10/8, 172.16/12, 192.168/16, 169.254/16, 0/8, 100.64/10, ::1, ::, fc00::/7, fe80::/10.
export function privateHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || /\.(localhost|local|internal)$/.test(h)) return true;
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const a = Number(m[1]), b = Number(m[2]);
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  if (h.includes(":")) return h === "::1" || h === "::" || /^f[cd][0-9a-f]{0,2}:/.test(h) || /^fe[89ab][0-9a-f]?:/.test(h) || /^::ffff:/.test(h);
  return false;
}

function safeLink(u: unknown): string | null {
  if (typeof u !== "string" || u.length > 300) return null;
  try {
    const x = new URL(u.trim());
    if (x.protocol !== "https:" || x.username || x.password) return null;
    if (privateHost(x.hostname) || !x.hostname.includes(".")) return null;
    return x.toString();
  } catch {
    return null;
  }
}

function cleanSong(v: unknown): Song {
  if (!v || typeof v !== "object") return null;
  const s = v as Record<string, unknown>;
  if (s.type === "library" && typeof s.id === "string" && TRACK_ID.test(s.id)) return { type: "library", id: s.id };
  if (s.type === "youtube" && typeof s.id === "string" && YT_ID.test(s.id)) {
    return { type: "youtube", id: s.id, title: str(s.title, 80), artist: str(s.artist, 60) };
  }
  return null;
}

export function cleanSpace(v: unknown): Space {
  const d = v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  const theme = (THEMES as readonly string[]).includes(d.theme as string) ? (d.theme as string) : DEFAULT_SPACE.theme;
  const cover = (COVERS as readonly string[]).includes(d.cover as string) ? (d.cover as string) : DEFAULT_SPACE.cover;
  const top8 = Array.isArray(d.top8)
    ? [...new Set(d.top8.filter((t): t is string => typeof t === "string" && TOP8.test(t)).map((t) => t.toLowerCase()))].slice(0, 8)
    : DEFAULT_SPACE.top8;
  const links = Array.isArray(d.links) ? [...new Set(d.links.map(safeLink).filter((x): x is string => !!x))].slice(0, 4) : [];
  return { v: 2, theme, cover, song: cleanSong(d.song), top8, links };
}

const store = () => getStore("profile-space");

async function readSpace(userId: string): Promise<{ space: Space; saved: boolean }> {
  try {
    const raw = await store().get(userId, { type: "json" });
    if (raw) return { space: cleanSpace(raw), saved: true };
  } catch (error) {
    console.error("Could not read space:", logReason(error));
  }
  return { space: { ...DEFAULT_SPACE }, saved: false };
}

async function hasBanner(userId: string) {
  try {
    return Boolean(await getStore("post-images").getMetadata(`banner/${userId}`));
  } catch {
    return false;
  }
}

// Top 8 friends: show a person only if this viewer could open their page.
async function resolvePeople(top8: string[], viewerId: string | null) {
  const names = top8.filter((t) => t.startsWith("user:")).map((t) => t.slice(5));
  if (!names.length) return [];
  const rows = await db.select().from(profiles).where(and(inArray(profiles.username, names), eq(profiles.onboarded, true)));
  const out = [];
  for (const p of rows) {
    if (viewerId && viewerId !== p.userId && (await isBlockedEitherWay(viewerId, p.userId))) continue;
    if (p.pageVisibility !== "public" && !viewerId) continue;
    if (p.isPrivate && viewerId !== p.userId && (!viewerId || !(await areFriends(viewerId, p.userId)))) continue;
    out.push({ username: p.username, displayName: p.displayName, avatar: p.avatar, mood: p.mood });
  }
  return out;
}

const privacyOf = (p: typeof profiles.$inferSelect) => (p.isPrivate ? "friends" : p.pageVisibility === "members" ? "members" : "public");

async function getOwn(userId: string) {
  const p = await profileFor(userId);
  if (!p?.onboarded) return json({ error: "Finish setting up your profile first.", onboarding: true }, 409);
  const { space, saved } = await readSpace(userId);
  return json({
    ok: true,
    saved,
    space,
    hasBanner: await hasBanner(userId),
    bannerUrl: `/api/images/banner-of/${encodeURIComponent(p.username)}`,
    profile: {
      username: p.username,
      displayName: p.displayName,
      avatar: p.avatar,
      bio: p.bio,
      mood: p.mood,
      statusText: p.statusText,
      privacy: privacyOf(p),
    },
    people: await resolvePeople(space.top8, userId),
  });
}

async function saveOwn(req: Request, userId: string) {
  const p = await profileFor(userId);
  if (!p?.onboarded) return json({ error: "Finish setting up your profile first.", onboarding: true }, 409);
  const body = await readBody(req);
  const space = cleanSpace(body.space);
  await store().set(userId, JSON.stringify(space));

  // Optional profile basics, written only to this member's own row.
  const set: Partial<typeof profiles.$inferInsert> = {};
  if ("displayName" in body) set.displayName = str(body.displayName, 40) || p.displayName;
  if ("bio" in body) set.bio = str(body.bio, MAX_BIO);
  if ("statusText" in body) {
    const text = str(body.statusText, MAX_STATUS);
    if (text !== p.statusText) {
      set.statusText = text;
      set.statusAt = text ? new Date() : null;
    }
  }
  if (body.privacy === "public" || body.privacy === "members" || body.privacy === "friends") {
    set.isPrivate = body.privacy === "friends";
    set.pageVisibility = body.privacy === "members" ? "members" : "public";
  }
  if (Object.keys(set).length) {
    await db.update(profiles).set({ ...set, updatedAt: new Date() }).where(eq(profiles.userId, userId));
  }
  await logActivity(userId, "profile.space", "user", userId);
  const needsSupport = mentionsCrisis(`${set.bio ?? ""} ${set.statusText ?? ""}`);
  return json({ ok: true, space, needsSupport });
}

async function getPublic(viewerId: string | null, username: string) {
  const [p] = await db.select().from(profiles).where(eq(profiles.username, username.toLowerCase()));
  const notFound = () => json({ error: "No one here by that name." }, 404);
  if (!p || !p.onboarded) return notFound();
  const isSelf = p.userId === viewerId;
  if (viewerId && !isSelf && (await isBlockedEitherWay(viewerId, p.userId))) return notFound();
  if (!isSelf && !viewerId && p.pageVisibility !== "public") return json({ ok: true, locked: "members" });
  if (!isSelf && p.isPrivate && (!viewerId || !(await areFriends(viewerId, p.userId)))) return json({ ok: true, locked: "friends" });
  const { space, saved } = await readSpace(p.userId);
  const banner = space.cover === "my-banner" && (await hasBanner(p.userId));
  return json({
    ok: true,
    saved,
    space: banner || space.cover !== "my-banner" ? space : { ...space, cover: DEFAULT_SPACE.cover },
    bannerUrl: banner ? `/api/images/banner-of/${encodeURIComponent(p.username)}` : null,
    profile: { username: p.username, displayName: p.displayName, avatar: p.avatar, bio: p.bio, mood: p.mood, statusText: p.statusText },
    people: await resolvePeople(space.top8, viewerId),
  });
}

export default async (req: Request) => {
  try {
    const url = new URL(req.url);
    const user = await optionalUser();
    if (url.pathname.startsWith("/api/profiles/") && url.pathname.endsWith("/space")) {
      const username = decodeURIComponent(url.pathname.replace("/api/profiles/", "").replace(/\/space$/, ""));
      if (req.method !== "GET" || !/^[a-z0-9_]{3,24}$/i.test(username)) return json({ error: "Not found" }, 404);
      return await getPublic(user?.id ?? null, username);
    }
    if (url.pathname !== "/api/me/space") return json({ error: "Not found" }, 404);
    if (!user) return unauthorized();
    if (req.method === "GET") return await getOwn(user.id);
    if (req.method === "PUT") {
      const origin = req.headers.get("origin");
      if (origin && new URL(origin).host !== url.host) return json({ error: "Not allowed from another site." }, 403);
      return await saveOwn(req, user.id);
    }
    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("Profile space error:", logReason(error));
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
};

export const config: Config = {
  path: ["/api/me/space", "/api/profiles/:username/space"],
};
