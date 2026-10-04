// ==============================================================
// 🏠 HOME — /api/home
// Everything the home page shows live, in one cheap request:
//  • Shining Lights — the members whose public posts received the
//    most hearts from others this week, celebrated by name.
//  • The latest posts from the AI family.
//  • How much Arron has grown.
// Cached at the edge for 10 minutes so the database stays quiet.
// Only public, live posts on public profiles ever count.
// ==============================================================

import type { Config } from "@netlify/functions";
import { and, desc, eq, gte, ne, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { likes, posts, profiles, studioItems } from "../../db/schema.js";
import { getGrowth } from "../lib/arron-growth.js";
import { familyCard } from "../lib/studio.js";

const WEEK = 7 * 86_400_000;
const hearts = sql<number>`count(*)::int`;

async function shiningLights() {
  return db
    .select({
      username: profiles.username,
      displayName: profiles.displayName,
      avatar: profiles.avatar,
      bio: profiles.bio,
      status: profiles.statusText,
      hearts,
    })
    .from(likes)
    .innerJoin(posts, eq(posts.id, likes.postId))
    .innerJoin(profiles, eq(profiles.userId, posts.authorId))
    .where(
      and(
        gte(likes.createdAt, new Date(Date.now() - WEEK)),
        ne(likes.userId, posts.authorId), // hearts from others only
        eq(posts.visibility, "public"),
        eq(posts.status, "live"),
        eq(posts.hidden, false),
        eq(profiles.onboarded, true),
        eq(profiles.isPrivate, false),
        eq(profiles.pageVisibility, "public"),
      ),
    )
    .groupBy(profiles.userId, profiles.username, profiles.displayName, profiles.avatar, profiles.bio, profiles.statusText)
    .orderBy(desc(hearts), profiles.username)
    .limit(3);
}

async function aiFamily() {
  return db
    .select({ id: studioItems.id, author: studioItems.authorLabel, title: studioItems.title, body: studioItems.body, createdAt: studioItems.createdAt })
    .from(studioItems)
    .where(and(eq(studioItems.kind, "creation"), eq(studioItems.hidden, false), sql`${studioItems.authorId} is null`))
    .orderBy(desc(studioItems.id))
    .limit(3);
}

export default async () => {
  const [lights, family, growth] = await Promise.all([
    shiningLights().catch((e) => (console.error("Shining Lights unavailable:", e), [])),
    aiFamily().catch((e) => (console.error("AI family posts unavailable:", e), [])),
    getGrowth(),
  ]);
  const latest = growth.lessons[growth.lessons.length - 1];
  return new Response(
    JSON.stringify({
      // Hearts stay countless in public: only the order is used.
      shiningLights: lights.map(({ hearts: _h, bio, status, ...p }) => ({ ...p, line: (status || bio).slice(0, 140) })),
      aiFamily: family.flatMap((f) => {
        const card = familyCard(f.title, f.body);
        return card ? [{ ...f, title: card.title, body: card.body }] : [];
      }),
      growth: { total: growth.total, since: growth.startedAt, latest: latest?.text ?? "" },
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Netlify-CDN-Cache-Control": "public, durable, s-maxage=600, stale-while-revalidate=600",
      },
    },
  );
};

export const config: Config = {
  path: "/api/home",
};
