// ==============================================================
// 🗒️ SANCTUARY NOTES — quick private notes that follow you
//   GET    /api/notes              my notes, pinned first then newest
//   POST   /api/notes              new note
//   POST   /api/notes/import       bring device-only notes into my account
//   PUT    /api/notes/:id          edit title, content, category or pin
//   DELETE /api/notes/:id          gone for good
// Every query is scoped to the signed-in member. Nobody else — not even
// Guardians — can read another member's notes.
// ==============================================================

import type { Config } from "@netlify/functions";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { sanctuaryNotes } from "../../db/schema.js";
import { currentUser, json, readBody, str, unauthorized } from "../lib/social.js";
import { allow, slowDown } from "../lib/rate-limit.js";

const MAX_NOTES = 500;
const MAX_IMPORT = 100;
const CATEGORIES = ["thought", "gratitude", "goal", "idea", "reminder", "win"];
type Note = typeof sanctuaryNotes.$inferSelect;

const cleanCategory = (value: unknown) =>
  typeof value === "string" && CATEGORIES.includes(value) ? value : "thought";

const shape = (n: Note) => ({
  id: n.id,
  title: n.title,
  content: n.content,
  category: n.category,
  pinned: n.pinned,
  createdAt: n.createdAt,
  updatedAt: n.updatedAt,
});

const read = (body: Record<string, unknown>) => ({
  title: str(body.title, 120),
  content: str(body.content, 10000),
  category: cleanCategory(body.category),
  pinned: body.pinned === true,
});

async function countFor(userId: string) {
  return (await db.select({ id: sanctuaryNotes.id }).from(sanctuaryNotes).where(eq(sanctuaryNotes.userId, userId))).length;
}

export default async (req: Request) => {
  try {
    const user = await currentUser();
    if (!user) return unauthorized();

    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean); // ["api","notes",id|"import"?]

    if (parts.length === 2) {
      if (req.method === "GET") {
        const rows = await db
          .select()
          .from(sanctuaryNotes)
          .where(eq(sanctuaryNotes.userId, user.id))
          .orderBy(desc(sanctuaryNotes.pinned), desc(sanctuaryNotes.updatedAt))
          .limit(MAX_NOTES);
        return json({ notes: rows.map(shape) });
      }
      if (req.method === "POST") {
        if (!(await allow("write", undefined, user.id))) return slowDown();
        const note = read(await readBody(req));
        if (!note.content) return json({ error: "Your note is empty." }, 400);
        if ((await countFor(user.id)) >= MAX_NOTES) return json({ error: `You've reached ${MAX_NOTES} notes — delete a few to make room.` }, 409);
        const [saved] = await db.insert(sanctuaryNotes).values({ userId: user.id, ...note }).returning();
        return json({ note: shape(saved) }, 201);
      }
      return json({ error: "Method not allowed" }, 405);
    }

    if (parts[2] === "import" && parts.length === 3) {
      if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
      if (!(await allow("write", undefined, user.id))) return slowDown();
      const body = await readBody(req);
      const incoming = Array.isArray(body.notes) ? body.notes.slice(0, MAX_IMPORT) : [];
      const room = MAX_NOTES - (await countFor(user.id));
      const values = incoming
        .map((n) => (n && typeof n === "object" ? read(n as Record<string, unknown>) : null))
        .filter((n): n is ReturnType<typeof read> => Boolean(n && n.content))
        .slice(0, Math.max(0, room))
        .map((n) => ({ userId: user.id, ...n }));
      const saved = values.length ? await db.insert(sanctuaryNotes).values(values).returning() : [];
      return json({ imported: saved.length, skipped: incoming.length - saved.length, notes: saved.map(shape) });
    }

    const id = Number(parts[2]);
    const [note] = Number.isInteger(id) && parts.length === 3
      ? await db.select().from(sanctuaryNotes).where(and(eq(sanctuaryNotes.id, id), eq(sanctuaryNotes.userId, user.id)))
      : [];
    if (!note) return json({ error: "Note not found." }, 404);

    if (req.method === "PUT") {
      const body = await readBody(req);
      const content = "content" in body ? str(body.content, 10000) : note.content;
      if (!content) return json({ error: "Your note is empty." }, 400);
      const [saved] = await db
        .update(sanctuaryNotes)
        .set({
          title: "title" in body ? str(body.title, 120) : note.title,
          content,
          category: "category" in body ? cleanCategory(body.category) : note.category,
          pinned: "pinned" in body ? body.pinned === true : note.pinned,
          updatedAt: new Date(),
        })
        .where(and(eq(sanctuaryNotes.id, note.id), eq(sanctuaryNotes.userId, user.id)))
        .returning();
      return json({ note: shape(saved) });
    }

    if (req.method === "DELETE") {
      await db.delete(sanctuaryNotes).where(and(eq(sanctuaryNotes.id, note.id), eq(sanctuaryNotes.userId, user.id)));
      return json({ ok: true });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("Notes API error:", error);
    return json({ error: "Your notes couldn't open just then — please try again." }, 500);
  }
};

export const config: Config = {
  path: ["/api/notes", "/api/notes/:id"],
};
