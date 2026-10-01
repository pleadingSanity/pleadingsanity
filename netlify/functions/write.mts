// ==============================================================
// ✍️ WRITE FOR SITE — Arron drafts, people decide, the site publishes
//   GET  /api/write/published?kind=&limit=      public pieces (anyone)
//   GET  /api/write/daily                        today's Daily Wisdom (anyone)
//   POST /api/write/draft   {kind, topic, notes} Arron drafts (members)
//   POST /api/write         {kind, title, body, truthTag, anonymous}
//                           submit → creator publishes instantly,
//                           everyone else waits for the creator's review
//   GET  /api/write/mine                         my submissions
//   GET  /api/write/queue                        pending (creator/admin)
//   POST /api/write/:id     {action: approve|reject|unpublish, note?}
// Every piece carries an author credit and a truth tag.
// ==============================================================

import type { Config, Context } from "@netlify/functions";
import { and, desc, eq, lt } from "drizzle-orm";
import { db } from "../../db/index.js";
import { siteContent } from "../../db/schema.js";
import {
  cleanTruthTag,
  currentUser,
  isCreator,
  json,
  logActivity,
  moderate,
  profileFor,
  readBody,
  str,
  unauthorized,
} from "../lib/social.js";
import { today, visitorKey, withinDailyLimit } from "../lib/studio.js";
import { ARRON_VOICE, parseJSON, runChain } from "../lib/ai-chain.js";

const KINDS: Record<string, string> = {
  wisdom: "a Daily Wisdom: 2-4 sentences, gentle, hopeful and real — something to carry through the day",
  story: "a Community Story / member spotlight (180-320 words) told with dignity, a real turning point, no clichés",
  educational: "an educational piece (250-450 words) on mental health, truth-tagging or the Four Pillars — clear, practical, short paragraphs",
  poetry: "a rap or poem (12-32 lines) — raw, honest, rhythmic, ending on light without denying the dark",
  update: "a Movement Update (150-300 words) — transparent, genuine, no corporate speak, what happened and what's next",
};
const DRAFT_LIMIT = 15;

type Row = typeof siteContent.$inferSelect;

const shape = (r: Row, viewerId?: string) => ({
  id: r.id,
  kind: r.kind,
  title: r.title,
  body: r.body,
  truthTag: r.truthTag,
  credit: r.anonymous ? "A member of the family" : r.credit,
  status: r.status,
  reviewNote: r.authorId && r.authorId === viewerId ? r.reviewNote : undefined,
  mine: !!viewerId && r.authorId === viewerId,
  createdAt: r.createdAt,
  publishedAt: r.publishedAt,
});

async function draft(req: Request, context: Context, user: { id: string; roles: string[] }) {
  const body = await readBody(req);
  const kind = Object.hasOwn(KINDS, str(body.kind, 16)) ? str(body.kind, 16) : "wisdom";
  const topic = str(body.topic, 300);
  const notes = str(body.notes, 2000);
  const creator = isCreator(user.roles);
  if (!creator) {
    const ok = await withinDailyLimit("write:" + visitorKey(req, context.ip, user.id), DRAFT_LIMIT);
    if (!ok) return json({ error: "Arron's pen needs a rest — more drafts tomorrow ✨" }, 429);
  }
  if (topic || notes) {
    const verdict = await moderate(`${topic}\n${notes}`, "post");
    if (!verdict.allowed) return json({ error: "Let's find a kinder angle.", reason: verdict.reason }, 422);
  }
  const system = `${ARRON_VOICE}

You are writing for the Pleading Sanity website, together with a member who will review and edit before publishing.
Write ${KINDS[kind]}.
Choose the honest truth tag: "evidence" (backed by well-established research — no invented numbers),
"experience" (lived experience, feelings, stories) or "philosophy" (beliefs, meaning, reflection).
Reply with ONLY JSON: {"title": string (max 70 chars, no clickbait), "body": string, "truthTag": "evidence"|"experience"|"philosophy"}`;
  const prompt = `${topic ? `Topic: ${topic}` : "Topic: something the family needs to hear today."}${notes ? `\nThe member's own words and notes (honour their voice):\n${notes}` : ""}`;
  const answer = await runChain(system, [{ role: "user", content: prompt }], { creator, maxTokens: creator ? 2400 : 1500 });
  const parsed = parseJSON<{ title?: string; body?: string; truthTag?: string }>(answer.text);
  const text = str(parsed?.body ?? answer.text, 8000);
  if (!text) return json({ error: "The words didn't come that time — try again." }, 502);
  return json({ draft: { kind, title: str(parsed?.title, 120), body: text, truthTag: cleanTruthTag(parsed?.truthTag) || "experience" }, model: answer.model });
}

async function submit(req: Request, user: { id: string; roles: string[] }) {
  const profile = await profileFor(user.id);
  if (!profile?.onboarded) return json({ error: "Finish setting up your profile first.", onboarding: true }, 409);
  const body = await readBody(req);
  const kind = Object.hasOwn(KINDS, str(body.kind, 16)) ? str(body.kind, 16) : "wisdom";
  const title = str(body.title, 120);
  const text = str(body.body, 8000);
  if (text.length < 10) return json({ error: "There's not quite enough here yet." }, 400);
  const verdict = await moderate(`${title}\n\n${text}`, "post");
  if (!verdict.allowed) {
    return json({ error: "This piece can't go on the site as it is.", reason: verdict.reason, blocked: true }, 422);
  }
  const creator = isCreator(user.roles);
  const credit = str(body.credit, 60) && creator ? str(body.credit, 60) : profile.displayName;
  const [row] = await db
    .insert(siteContent)
    .values({
      authorId: user.id,
      credit,
      kind,
      title,
      body: text,
      truthTag: cleanTruthTag(body.truthTag) || "experience",
      anonymous: body.anonymous === true,
      status: creator ? "published" : "pending",
      publishedAt: creator ? new Date() : null,
    })
    .returning();
  await logActivity(user.id, creator ? "write.publish" : "write.submit", "content", row.id);
  return json({ piece: shape(row, user.id), published: creator }, 201);
}

async function published(url: URL) {
  const kind = str(url.searchParams.get("kind"), 16);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 12, 1), 30);
  const before = Number(url.searchParams.get("before"));
  const rows = await db
    .select()
    .from(siteContent)
    .where(
      and(
        eq(siteContent.status, "published"),
        Object.hasOwn(KINDS, kind) ? eq(siteContent.kind, kind) : undefined,
        Number.isInteger(before) && before > 0 ? lt(siteContent.id, before) : undefined,
      ),
    )
    .orderBy(desc(siteContent.id))
    .limit(limit + 1);
  const page = rows.slice(0, limit);
  return json(
    { pieces: page.map((r) => shape(r)), nextBefore: rows.length > limit ? page[page.length - 1].id : null },
    200,
  );
}

// Today's wisdom: the newest published piece, rotating through the
// whole collection by day so the homepage always has something fresh.
async function daily() {
  const rows = await db
    .select()
    .from(siteContent)
    .where(and(eq(siteContent.status, "published"), eq(siteContent.kind, "wisdom")))
    .orderBy(desc(siteContent.id))
    .limit(60);
  if (!rows.length) return json({ wisdom: null });
  const fresh = rows.find((r) => r.publishedAt && r.publishedAt.toISOString().slice(0, 10) === today());
  const pick = fresh ?? rows[Math.floor(Date.parse(today()) / 86_400_000) % rows.length];
  return json({ wisdom: shape(pick) });
}

export default async (req: Request, context: Context) => {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.replace(/^\/api\/write\/?/, "").split("/").filter(Boolean);

    if (req.method === "GET" && parts[0] === "published") return await published(url);
    if (req.method === "GET" && parts[0] === "daily") return await daily();

    const user = await currentUser();
    if (!user) return unauthorized();
    const viewer = { id: user.id, roles: user.roles };

    if (req.method === "POST" && parts[0] === "draft") return await draft(req, context, viewer);
    if (req.method === "POST" && !parts.length) return await submit(req, viewer);
    if (req.method === "GET" && parts[0] === "mine") {
      const rows = await db.select().from(siteContent).where(eq(siteContent.authorId, user.id)).orderBy(desc(siteContent.id)).limit(50);
      return json({ pieces: rows.map((r) => shape(r, user.id)) });
    }

    if (!isCreator(user.roles)) return json({ error: "Only the creator can review site content." }, 403);

    if (req.method === "GET" && parts[0] === "queue") {
      const rows = await db.select().from(siteContent).where(eq(siteContent.status, "pending")).orderBy(desc(siteContent.id)).limit(50);
      return json({ pieces: rows.map((r) => ({ ...shape(r, user.id), credit: r.credit, anonymous: r.anonymous })) });
    }

    const id = Number(parts[0]);
    if (req.method === "POST" && Number.isInteger(id)) {
      const body = await readBody(req);
      const action = str(body.action, 12);
      const status = { approve: "published", reject: "rejected", unpublish: "pending" }[action];
      if (!status) return json({ error: "Unknown action." }, 400);
      const [row] = await db
        .update(siteContent)
        .set({ status, reviewNote: str(body.note, 300), publishedAt: status === "published" ? new Date() : null })
        .where(eq(siteContent.id, id))
        .returning();
      if (!row) return json({ error: "Not found." }, 404);
      await logActivity(user.id, `write.${action}`, "content", id);
      return json({ piece: shape(row, user.id) });
    }
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("Write API error:", error);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
};

export const config: Config = {
  path: ["/api/write", "/api/write/:action"],
};
