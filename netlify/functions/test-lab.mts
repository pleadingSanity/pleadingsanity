// Owner Test Lab.
// GET  /api/test-lab            checklist plus latest notes
// GET  /api/test-lab/export     same book, for other AIs, still owner-only
// POST /api/test-lab            result, feedback, add or resolve
// Anyone who is not Shane gets 401 or 403 before the database is touched.

import type { Config, Context } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { testLabFeedback, testLabItems } from "../../db/schema.js";
import { allow, slowDown } from "../lib/rate-limit.js";
import { currentUser, json, readBody, unauthorized } from "../lib/social.js";
import { SEED_ITEMS, accessDecision, cleanResult, localSummary } from "../lib/test-lab-core.js";

async function ensureSeed() {
  for (const item of SEED_ITEMS) {
    await db
      .insert(testLabItems)
      .values({ id: item.id, title: item.title, what: item.what, href: item.href, page: item.page, area: item.area, source: "seed" })
      .onConflictDoUpdate({
        target: testLabItems.id,
        set: { title: item.title, what: item.what, href: item.href, page: item.page, area: item.area },
      });
  }
}

function publicItem(row: typeof testLabItems.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    what: row.what,
    href: row.href,
    page: row.page,
    area: row.area,
    source: row.source,
    status: row.status,
    updatedAt: row.updatedAt,
  };
}

function publicNote(row: typeof testLabFeedback.$inferSelect) {
  return {
    id: row.id,
    item: row.itemId,
    status: row.status,
    notes: row.notes,
    page: row.page,
    hasScreenshot: Boolean(row.screenshot),
    createdAt: row.createdAt,
  };
}

async function book() {
  await ensureSeed();
  const [items, notes] = await Promise.all([
    db.select().from(testLabItems).orderBy(testLabItems.createdAt),
    db.select().from(testLabFeedback).orderBy(desc(testLabFeedback.id)).limit(200),
  ]);
  const visible = items.map(publicItem);
  return { items: visible, feedback: notes.map(publicNote), summary: localSummary(visible), persisted: true };
}

export default async (req: Request, context: Context) => {
  const user = await currentUser().catch(() => null);
  const gate = accessDecision(user);
  if (!gate.ok) return gate.status === 401 ? unauthorized() : json({ error: gate.error }, gate.status);

  const url = new URL(req.url);
  const section = url.pathname.split("/").filter(Boolean)[2] ?? "";

  if (req.method === "GET" && (section === "" || section === "export")) {
    try {
      const payload = await book();
      return json(section === "export" ? { ...payload, format: "pleading-sanity-test-lab/1" } : payload);
    } catch (error) {
      console.error("Test lab read failed:", error instanceof Error ? error.name : "error");
      return json({
        items: SEED_ITEMS.map((item) => ({ ...item, source: "seed", status: "open" })),
        feedback: [],
        summary: "The checklist is here, but results are not saving yet. The test lab migration still needs to be applied.",
        persisted: false,
      });
    }
  }

  if (req.method === "POST" && section === "") {
    if (!(await allow("write", context, user!.id))) return slowDown("Give the test book a minute, then try again.");
    const parsed = cleanResult(await readBody(req));
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    const body = parsed.value;
    try {
      await ensureSeed();
      if (body.action === "add") {
        await db
          .insert(testLabItems)
          .values({ id: body.id, title: body.title, what: body.what, href: body.href, page: body.page || body.href, area: body.area, source: "added", status: "open" })
          .onConflictDoUpdate({
            target: testLabItems.id,
            set: { title: body.title, what: body.what, href: body.href, page: body.page || body.href, area: body.area, updatedAt: new Date() },
          });
        return json({ ok: true, book: await book() });
      }
      if (body.action === "resolve") {
        const [row] = await db
          .update(testLabItems)
          .set({ status: "resolved", resolvedAt: new Date(), updatedAt: new Date() })
          .where(eq(testLabItems.id, body.item))
          .returning({ id: testLabItems.id });
        if (!row) return json({ error: "That test is not on the list." }, 404);
        await db.insert(testLabFeedback).values({ itemId: body.item, status: "resolved", notes: "Marked resolved.", page: "", userId: user!.id });
        return json({ ok: true, book: await book() });
      }
      if (body.action === "result" && body.item) {
        const [exists] = await db.select({ id: testLabItems.id }).from(testLabItems).where(eq(testLabItems.id, body.item));
        if (!exists) return json({ error: "That test is not on the list." }, 404);
        await db.update(testLabItems).set({ status: body.status, updatedAt: new Date() }).where(eq(testLabItems.id, body.item));
      }
      await db.insert(testLabFeedback).values({
        itemId: body.item || null,
        status: body.status,
        notes: body.notes,
        page: body.page,
        userId: user!.id,
        screenshot: body.screenshot,
      });
      return json({ ok: true, book: await book() });
    } catch (error) {
      console.error("Test lab write failed:", error instanceof Error ? error.name : "error");
      return json({ error: "That did not save. The test lab table may not be applied yet." }, 503);
    }
  }

  return json({ error: "Not found" }, 404);
};

export const config: Config = { path: ["/api/test-lab", "/api/test-lab/export"] };
