// Voluntary, self-reported friendly scores. Never exposes a private progress row or user ID.
import type { Config, Context } from '@netlify/functions';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { gameProgress } from '../../db/schema.js';
import { currentUser, json, readBody, unauthorized, logReason } from '../lib/social.js';
import { allow, slowDown } from '../lib/rate-limit.js';
import { SCORE_GAMES, scoreEntry } from '../lib/game-scores.js';

export default async (req: Request, context: Context) => {
  const game = new URL(req.url).pathname.split('/').pop() || '';
  if (!SCORE_GAMES.includes(game)) return json({ error: 'Choose an arcade or card game.' }, 404);
  const key = `scores-${game}`;
  try {
    if (req.method === 'GET') {
      const rows = await db.select({ data: gameProgress.data }).from(gameProgress)
        .where(eq(gameProgress.game, key))
        .orderBy(desc(sql`(${gameProgress.data}->>'score')::integer`), gameProgress.updatedAt, gameProgress.userId).limit(50);
      const entries = rows.map(r => scoreEntry(r.data)).filter(Boolean);
      return json({ game, entries, selfReported: true });
    }
    if (!['PUT', 'DELETE'].includes(req.method)) return json({ error: 'Method not allowed.' }, 405);
    const user = await currentUser();
    if (!user) return unauthorized();
    if (!await allow('write', context, user.id)) return slowDown();
    if (req.method === 'DELETE') {
      await db.delete(gameProgress).where(and(eq(gameProgress.userId, user.id), eq(gameProgress.game, key)));
      return json({ ok: true });
    }
    const data = scoreEntry(await readBody(req));
    if (!data) return json({ error: 'Use a 3–20 character player alias and a valid score and level.' }, 400);
    await db.insert(gameProgress).values({ userId: user.id, game: key, data })
      .onConflictDoUpdate({ target: [gameProgress.userId, gameProgress.game], set: {
        data: sql`jsonb_build_object('alias', ${data.alias}::text,
          'score', GREATEST((${gameProgress.data}->>'score')::integer, ${data.score}::integer),
          'level', GREATEST((${gameProgress.data}->>'level')::integer, ${data.level}::integer))`,
        updatedAt: new Date()
      } });
    return json({ ok: true });
  } catch (error) {
    console.error('Score API unavailable:', logReason(error));
    return json({ error: 'The scoreboard is unavailable. Your private game progress is separate; try again later.' }, 503);
  }
};
export const config: Config = {
  path: '/api/scores/:game',
  rateLimit: { action: 'rate_limit', aggregateBy: 'ip', windowSize: 60, windowLimit: 60 }
};
