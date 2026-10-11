// ==============================================================
// 📓 MY JOURNAL — private first, shared only by choice
//   GET    /api/journal?before=           my entries, newest first
//   POST   /api/journal                   new entry (private)
//   PUT    /api/journal/:id               edit text or who can see it
//   DELETE /api/journal/:id               gone for good
//   POST   /api/journal/:id/share         share to my page + the feed
// Private entries are never moderated or seen by anyone — not even
// Guardians. Anything shared passes the kindness check first.
// ==============================================================

import type { Config } from "@netlify/functions";
import { and, desc, eq, lt } from "drizzle-orm";
import { db } from "../../db/index.js";
import { journalEntries, posts } from "../../db/schema.js";
import {
  cleanMood,
  cleanTruthTag,
  currentUser,
  json,
  logActivity,
  mentionsCrisis,
  moderate,
  profileFor,
  readBody,
  str,
  unauthorized,
} from "../lib/social.js";
import { publishPost, saveJournalEntry } from "../lib/publish.js";
import { allow, slowDown } from "../lib/rate-limit.js";

const PAGE = 20;
const ENTRY_AUDIENCES = ["private", "members", "public"];
type Entry = typeof journalEntries.$inferSelect;

const shape = (e: Entry) => ({
  id: e.id,
  title: e.title,
  body: e.body,
  mood: e.mood,
  truthTag: e.truthTag,
  visibility: e.visibility,
  source: e.source,
  postId: e.postId,
  createdAt: e.createdAt,
  updatedAt: e.updatedAt,
});

async function list(userId: string, url: URL) {
  const before = Number(url.searchParams.get("before"));
  const rows = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, userId), Number.isInteger(before) && before > 0 ? lt(journalEntries.id, before) : undefined))
    .orderBy(desc(journalEntries.id))
    .limit(PAGE + 1);
  const page = rows.slice(0, PAGE);
  return json({ entries: page.map(shape), nextBefore: rows.length > PAGE ? page[page.length - 1].id : null });
}

// Leaving "private" means other people will read it — so it gets the same kindness check as a post.
async function checkShareable(title: string, body: string) {
  const verdict = await moderate(`${title}\n\n${body}`, "post");
  if (verdict.allowed) return null;
  return json(
    { error: "This entry can't be shared as it is — it's still safe in your private journal.", reason: verdict.reason, blocked: true },
    422,
  );
}

export default async (req: Request) => {
  try {
    const user = await currentUser();
    if (!user) return unauthorized();
    const profile = await profileFor(user.id);
    if (!profile?.onboarded) return json({ error: "Finish setting up your profile first.", onboarding: true }, 409);

    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean); // ["api","journal",id?,action?]

    if (parts.length === 2) {
      if (req.method === "GET") return await list(user.id, url);
      if (req.method === "POST") {
        if (!(await allow("write", undefined, user.id))) return slowDown();
        const body = await readBody(req);
        const entry = await saveJournalEntry(user.id, {
          title: str(body.title, 120),
          body: str(body.body, 20000),
          mood: typeof body.mood === "string" ? body.mood : "",
          source: body.source === "arron" ? "arron" : "self",
        });
        if (!entry) return json({ error: "Your entry is empty." }, 400);
        if (body.truthTag) await db.update(journalEntries).set({ truthTag: cleanTruthTag(body.truthTag) }).where(eq(journalEntries.id, entry.id));
        return json({ entry: shape({ ...entry, truthTag: cleanTruthTag(body.truthTag) }), needsSupport: mentionsCrisis(entry.body) }, 201);
      }
      return json({ error: "Method not allowed" }, 405);
    }

    const id = Number(parts[2]);
    const [entry] = Number.isInteger(id)
      ? await db.select().from(journalEntries).where(and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id)))
      : [];
    if (!entry) return json({ error: "Entry not found." }, 404);

    if (parts[3] === "share" && req.method === "POST") {
      if (entry.postId) {
        const [existing] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, entry.postId));
        if (existing) return json({ error: "This entry is already on the feed.", postId: existing.id }, 409);
      }
      const body = await readBody(req);
      const visibility = body.visibility === "members" ? "members" : "public";
      const result = await publishPost(user, {
        kind: "journal",
        title: entry.title,
        body: entry.body,
        mood: entry.mood || profile.mood,
        truthTag: entry.truthTag || "experience",
        visibility,
      });
      if (!result.ok) {
        const { ok: _ok, status, ...rest } = result;
        return json(rest, status);
      }
      const [saved] = await db
        .update(journalEntries)
        .set({ postId: result.post.id, visibility, updatedAt: new Date() })
        .where(eq(journalEntries.id, entry.id))
        .returning();
      await logActivity(user.id, "journal.share", "journal", entry.id);
      return json({ entry: shape(saved), postId: result.post.id, pending: result.pending, crisis: result.crisis });
    }

    if (!parts[3] && req.method === "PUT") {
      const body = await readBody(req);
      const title = "title" in body ? str(body.title, 120) : entry.title;
      const text = "body" in body ? str(body.body, 20000) : entry.body;
      if (!text) return json({ error: "Your entry is empty." }, 400);
      const visibility = typeof body.visibility === "string" && ENTRY_AUDIENCES.includes(body.visibility) ? body.visibility : entry.visibility;
      if (visibility !== "private") {
        const blocked = await checkShareable(title, text);
        if (blocked) return blocked;
      }
      const [saved] = await db
        .update(journalEntries)
        .set({
          title,
          body: text,
          visibility,
          mood: "mood" in body ? (body.mood ? cleanMood(body.mood) : "") : entry.mood,
          truthTag: "truthTag" in body ? cleanTruthTag(body.truthTag) : entry.truthTag,
          updatedAt: new Date(),
        })
        .where(eq(journalEntries.id, entry.id))
        .returning();
      return json({ entry: shape(saved) });
    }

    if (!parts[3] && req.method === "DELETE") {
      await db.delete(journalEntries).where(eq(journalEntries.id, entry.id));
      await logActivity(user.id, "journal.delete", "journal", entry.id);
      return json({ ok: true });
    }

    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("Journal API error:", (error as Error)?.name || "error");
    return json({ error: "Your journal couldn't open just then — please try again." }, 500);
  }
};

export const config: Config = {
  path: ["/api/journal", "/api/journal/:id", "/api/journal/:id/:action"],
};
