// ==============================================================
// 🌱 GAME PROGRESS — private, follows members across devices
//   GET /api/progress            every game's saved progress
//   PUT /api/progress/:game      {data} → save (max 20 KB)
// Private saves only. Voluntary public scores use the separate /api/scores endpoint.
// ==============================================================

import type { Config } from "@netlify/functions";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { gameProgress } from "../../db/schema.js";
import { currentUser, json, readBody, unauthorized, logReason } from "../lib/social.js";

const GAME = /^[a-z0-9-]{2,40}$/;
const MAX_BYTES = 20_000;

export default async (req: Request) => {
  try {
    const user = await currentUser();
    if (!user) return unauthorized();
    const game = new URL(req.url).pathname.replace(/^\/api\/progress\/?/, "");

    if (req.method === "GET" && !game) {
      const rows = await db.select().from(gameProgress).where(eq(gameProgress.userId, user.id));
      return json({ progress: Object.fromEntries(rows.map((r) => [r.game, { data: r.data, updatedAt: r.updatedAt }])) });
    }

    if (req.method === "PUT" && GAME.test(game) && !game.startsWith('scores-')) {
      const { data, expectedAt } = await readBody(req);
      if (!data || typeof data !== "object" || Array.isArray(data)) return json({ error: "Nothing to save." }, 400);
      if (new TextEncoder().encode(JSON.stringify(data)).byteLength > (game === 'brain-games' ? 200_000 : MAX_BYTES)) return json({ error: "That's too much to save in one go." }, 413);
      if (expectedAt !== null && (typeof expectedAt !== "string" || !Number.isFinite(Date.parse(expectedAt)))) {
        return json({ error: "Refresh your game progress before saving." }, 400);
      }
      const now = new Date();
      // Compare-and-swap: stale devices cannot silently overwrite a newer save.
      const target = and(eq(gameProgress.userId, user.id), eq(gameProgress.game, game));
      const rows = expectedAt === null
        ? await db.insert(gameProgress).values({ userId: user.id, game, data, updatedAt: now })
          .onConflictDoNothing().returning()
        : await db.update(gameProgress).set({ data, updatedAt: sql`GREATEST(${now.toISOString()}::timestamp, ${gameProgress.updatedAt} + interval '1 millisecond')` })
          .where(and(target, sql`date_trunc('milliseconds', ${gameProgress.updatedAt}) = ${new Date(expectedAt as string).toISOString()}::timestamp`)).returning();
      if (!rows.length) {
        const [current] = await db.select().from(gameProgress).where(target);
        return json({ error: "A newer save exists.", current: current ? { data: current.data, updatedAt: current.updatedAt } : null }, 409);
      }
      return json({ ok: true, updatedAt: rows[0].updatedAt });
    }
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("Progress API error:", logReason(error));
    return json({ error: "Progress could not sync right now. Keep this page open and try again." }, 500);
  }
};

export const config: Config = { path: ["/api/progress", "/api/progress/:game"] };
