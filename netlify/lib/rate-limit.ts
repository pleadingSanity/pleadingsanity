// ==============================================================
// 🛡️ RATE LIMITS — gentle brakes so one person (or bot) can't
// drown out everyone else, or burn the AI budget.
// Chat: 30 a minute. Writes (posts, comments, journal, stories): 10 a minute.
// Views ("X have walked this path"): 60 batches a minute.
// Counted in Netlify Database with one atomic upsert per request.
// IPs are hashed before they're stored — no raw addresses, ever.
// ==============================================================

import type { Context } from "@netlify/functions";
import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { rateLimits } from "../../db/schema.js";

export const LIMITS = { chat: 30, write: 10, views: 60 } as const;
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

// True when the request may go ahead. A database hiccup never blocks anyone.
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
    return true;
  }
}

export const slowDown = (message = "That's a lot at once — take a breath and try again in a minute 💙") =>
  Response.json({ error: message }, { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(WINDOW_SECONDS) } });
