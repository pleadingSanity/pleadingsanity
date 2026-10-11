// ==============================================================
// 🌱 GAME PROGRESS — private, follows members across devices
//   GET /api/progress            every game's saved progress
//   PUT /api/progress/:game      {data} → save (max 20 KB)
// No leaderboards, no comparison: only the member ever sees this.
// ==============================================================

import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { gameProgress } from "../../db/schema.js";
import { currentUser, json, readBody, unauthorized } from "../lib/social.js";

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

    if (req.method === "PUT" && GAME.test(game)) {
      const { data } = await readBody(req);
      if (!data || typeof data !== "object" || Array.isArray(data)) return json({ error: "Nothing to save." }, 400);
      if (JSON.stringify(data).length > MAX_BYTES) return json({ error: "That's too much to save in one go." }, 413);
      await db
        .insert(gameProgress)
        .values({ userId: user.id, game, data })
        .onConflictDoUpdate({ target: [gameProgress.userId, gameProgress.game], set: { data, updatedAt: new Date() } });
      return json({ ok: true });
    }
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("Progress API error:", (error as Error)?.name || "error");
    return json({ error: "Progress couldn't sync right now — it's safe on this device." }, 500);
  }
};

export const config: Config = { path: ["/api/progress", "/api/progress/:game"] };
