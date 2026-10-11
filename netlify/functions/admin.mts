// ==============================================================
// 🛡️ ADMIN — moderation queue
//   GET  /api/admin/reports?status=open
//   POST /api/admin/reports  {id, status, hide?}
// Admins, the creator and Guardians (trusted helpers) may use this.
// ==============================================================

import type { Config } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { comments, creations, posts, profiles, reports } from "../../db/schema.js";
import { currentUser, isGuardian, json, logActivity, readBody, unauthorized } from "../lib/social.js";

const STATUSES = ["open", "reviewed", "actioned"];

async function describe(targetType: string, targetId: string) {
  if (targetType === "user") {
    const [p] = await db.select().from(profiles).where(eq(profiles.userId, targetId));
    return p ? { label: `@${p.username} (${p.displayName})`, excerpt: p.bio, link: `/@${p.username}` } : null;
  }
  const id = Number(targetId);
  if (targetType === "creation") {
    const [c] = await db.select().from(creations).where(eq(creations.id, id));
    return c ? { label: c.title || `Creation #${c.id}`, excerpt: c.prompt, link: `/api/creations/${c.id}/image`, hidden: c.hidden } : null;
  }
  if (targetType === "post") {
    const [p] = await db.select().from(posts).where(eq(posts.id, id));
    return p ? { label: p.title || `Post #${p.id}`, excerpt: p.body.slice(0, 300), link: `/feed.html?post=${p.id}`, hidden: p.hidden } : null;
  }
  const [c] = await db.select().from(comments).where(eq(comments.id, id));
  return c ? { label: `Comment #${c.id}`, excerpt: c.body.slice(0, 300), link: `/feed.html?post=${c.postId}`, hidden: c.hidden } : null;
}

export default async (req: Request) => {
  try {
    const user = await currentUser();
    if (!user) return unauthorized();
    if (!isGuardian(user.roles)) return json({ error: "Guardians and admins only." }, 403);

    if (req.method === "GET") {
      const status = new URL(req.url).searchParams.get("status") ?? "open";
      const rows = await db
        .select()
        .from(reports)
        .where(STATUSES.includes(status) ? eq(reports.status, status) : undefined)
        .orderBy(desc(reports.createdAt))
        .limit(100);
      const items = await Promise.all(rows.map(async (r) => ({ ...r, target: await describe(r.targetType, r.targetId) })));
      return json({ reports: items });
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      const id = Number(body.id);
      const status = typeof body.status === "string" && STATUSES.includes(body.status) ? body.status : "reviewed";
      const [report] = Number.isInteger(id) ? await db.select().from(reports).where(eq(reports.id, id)) : [];
      if (!report) return json({ error: "Report not found." }, 404);

      if (typeof body.hide === "boolean" && report.targetType !== "user") {
        if (report.targetType === "creation") {
          await db.update(creations).set({ hidden: body.hide }).where(eq(creations.id, Number(report.targetId)));
        } else {
          const table = report.targetType === "post" ? posts : comments;
          await db.update(table).set({ hidden: body.hide }).where(eq(table.id, Number(report.targetId)));
        }
        await logActivity(user.id, body.hide ? "admin.hide" : "admin.unhide", report.targetType, report.targetId);
      }
      await db.update(reports).set({ status }).where(eq(reports.id, id));
      await logActivity(user.id, "admin.report", "report", id, status);
      return json({ ok: true });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("Admin API error:", (error as Error)?.name || "error");
    return json({ error: "Something went wrong." }, 500);
  }
};

export const config: Config = {
  path: "/api/admin/reports",
};
