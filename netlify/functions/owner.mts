// ==============================================================
// 💫 OWNER'S ROOM API — Shane only
//   GET  /api/owner                       system overview + review queue
//   GET  /api/owner/queue?status=held     held posts
//   POST /api/owner/posts/:id             {action: approve | hold}
//   POST /api/owner/approve-all           every pending post goes live
//   PUT  /api/owner/settings              {reviewMode?, arronVoice?}
//   POST /api/owner/roles                 {username, role: guardian|creator, grant}
// ==============================================================

import type { Config } from "@netlify/functions";
import { currentUser, json, readBody, saveSettings, str, unauthorized } from "../lib/social.js";
import { approveAll, overview, reviewPost, reviewQueue, setRole } from "../lib/owner.js";

export default async (req: Request) => {
  try {
    const user = await currentUser();
    if (!user) return unauthorized();
    if (!user.isOwner) return json({ error: "Only Shane holds that key." }, 403);

    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean); // ["api","owner",section?,id?]
    const section = parts[2] ?? "";

    if (!section && req.method === "GET") return json(await overview());
    if (section === "queue" && req.method === "GET") {
      return json({ queue: await reviewQueue(url.searchParams.get("status") === "held" ? "held" : "pending") });
    }
    if (section === "posts" && req.method === "POST") {
      const body = await readBody(req);
      const action = body.action === "hold" ? "hold" : "approve";
      const row = await reviewPost(user.id, Number(parts[3]), action);
      return row ? json({ ok: true, status: row.status }) : json({ error: "That post isn't waiting for review." }, 404);
    }
    if (section === "approve-all" && req.method === "POST") return json({ ok: true, approved: await approveAll(user.id) });
    if (section === "settings" && req.method === "PUT") {
      const body = await readBody(req);
      const changes: { reviewMode?: boolean; arronVoice?: string } = {};
      if (typeof body.reviewMode === "boolean") changes.reviewMode = body.reviewMode;
      if (typeof body.arronVoice === "string") changes.arronVoice = str(body.arronVoice, 2000);
      return json({ settings: await saveSettings(changes) });
    }
    if (section === "roles" && req.method === "POST") {
      const body = await readBody(req);
      const result = await setRole(user.id, str(body.username, 40), str(body.role, 20), body.grant !== false);
      return result.ok ? json(result) : json({ error: result.error }, 400);
    }
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("Owner API error:", error);
    return json({ error: "Something went wrong in the Owner's Room." }, 500);
  }
};

export const config: Config = {
  path: ["/api/owner", "/api/owner/:section", "/api/owner/:section/:id"],
};
