// ==============================================================
// 🛡️ RATE LIMITS — gentle brakes so one person (or bot) can't
// drown out everyone else, or burn the AI budget.
// Chat: 30 a minute. Writes (posts, comments, journal, stories): 10 a minute.
// Views ("X have walked this path"): 60 batches a minute.
// AI helpers outside chat (rap studio, post writer): 6 a minute.
// Counted in Netlify Database with one atomic upsert per request.
// IPs are hashed before they're stored — no raw addresses, ever.
// ==============================================================

import type { Context } from "@netlify/functions";
import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { rateLimits } from "../../db/schema.js";

export const LIMITS = { chat: 30, write: 10, views: 60, ai: 6 } as const;
export type Bucket = keyof typeof LIMITS;

const WINDOW_SECONDS = 60;

async function hash(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`pleading-sanity:${value}`));
  return Array.from(new Uint8Array(bytes).slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Members are counted by account; guests by a hash of their IP.
async function whoFor(context: Context | undefined, userId?: string | null) {
  if (userId) return `u:${userId}`;
  return `ip:${await hash(context?.ip || "unknown")}`;
}

// True when the request may go ahead. If the limiter cannot be checked, fail closed so an outage cannot become an abuse bypass.
export async function allow(bucket: Bucket, context: Context | undefined, userId?: string | null) {
  try {
    const key = `${bucket}:${await whoFor(context, userId)}`;
    const window = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
    const [row] = await db
      .insert(rateLimits)
      .values({ key, windowStart: window, count: 1 })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          count: sql`CASE WHEN ${rateLimits.windowStart} = ${window} THEN ${rateLimits.count} + 1 ELSE 1 END`,
          windowStart: window,
        },
      })
      .returning({ count: rateLimits.count });
    return (row?.count ?? 0) <= LIMITS[bucket];
  } catch (error) {
    console.error("Rate limit check unavailable:", error instanceof Error ? error.name : "error");
    // Safety boundary: if the database cannot verify the limit, do not allow
    // an unbounded write/AI request through. This is deliberately fail-closed.
    return false;
  }
}

export const slowDown = (message = "Give me a minute to catch my breath, then try again.") =>
  Response.json({ error: message }, { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(WINDOW_SECONDS) } });

// ─── DAILY ADMISSION CONTROL ───
// A second, slower brake on AI spend, counted per UTC day in the same table (keys start "day:").
// These are approximate cost counters, NOT a monetary guarantee: the real ceiling is the credit
// limit on the Netlify team and on any provider account, which only the Owner can set.
// Every number can be changed on Netlify without a code change.
const envInt = (name: string, fallback: number) => {
  const n = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};
export const DAILY = {
  site: envInt("PS_AI_DAILY_CAP", 3000), // weighted AI runs per day, whole site, every AI tool
  person: envInt("PS_AI_DAILY_PER_PERSON", 150), // Arron chats per person per day (Owner exempt)
  council: envInt("PS_COUNCIL_DAILY", 5), // Owner's council calls per day
  family: envInt("PS_FAMILY_DAILY", 30), // Owner's two-mind "/family" replies per day
  owner: envInt("PS_OWNER_DAILY", 300), // Owner's everyday single-mind chats, counted apart from the site cap
} as const;
export type DailyBucket = keyof typeof DAILY;
// Someone who may be in crisis can use a small reserve above the site cap, so the cap never lands on them first.
const CRISIS_RESERVE_PERCENT = 10;
const DAY_SECONDS = 86_400;

// Adds `weight` to today's counter only if it still fits under the cap, and says whether it did.
// A refused request adds nothing, so refusals can never eat the crisis reserve. Fails closed like allow().
export async function allowToday(bucket: DailyBucket, { context, userId, weight = 1, crisis = false }: { context?: Context; userId?: string | null; weight?: number; crisis?: boolean } = {}) {
  const limit = DAILY[bucket];
  if (limit === 0) return false;
  const cap = crisis ? limit + Math.ceil((limit * CRISIS_RESERVE_PERCENT) / 100) : limit;
  if (weight > cap) return false;
  try {
    const key = bucket === "site" ? "day:site" : `day:${bucket}:${await whoFor(context, userId)}`;
    const window = Math.floor(Date.now() / 1000 / DAY_SECONDS);
    const [row] = await db
      .insert(rateLimits)
      .values({ key, windowStart: window, count: weight })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          count: sql`CASE WHEN ${rateLimits.windowStart} = ${window} THEN ${rateLimits.count} + ${weight} ELSE ${weight} END`,
          windowStart: window,
        },
        // No update (and no row back) when today's count plus this weight would pass the cap.
        setWhere: sql`${rateLimits.windowStart} <> ${window} OR ${rateLimits.count} + ${weight} <= ${cap}`,
      })
      .returning({ count: rateLimits.count });
    return Boolean(row);
  } catch (error) {
    console.error("Daily budget check unavailable:", error instanceof Error ? error.name : "error");
    return false;
  }
}
