// ==============================================================
// 💫 OWNER'S ROOM API — Shane only
//   GET  /api/owner                       system overview + review queue
//   GET  /api/owner/queue?status=held     held posts
//   POST /api/owner/posts/:id             {action: approve | hold}
//   POST /api/owner/approve-all           every pending post goes live
//   PUT  /api/owner/settings              {reviewMode?, arronVoice?}
//   POST /api/owner/roles                 {username, role: guardian|creator, grant}
//   GET  /api/owner/workbench             Arron's drafted changes + the site pulse
//   POST /api/owner/workbench/:id         {status: approved | done | dismissed | proposed}
// ==============================================================

import type { Config } from "@netlify/functions";
import { currentUser, json, readBody, saveSettings, str, unauthorized } from "../lib/social.js";
import { approveAll, overview, reviewPost, reviewQueue, setRole } from "../lib/owner.js";
import { buildBrief, listProposals, PROPOSAL_STATUSES, type ProposalStatus, setProposalStatus, sitePulse } from "../lib/workbench.js";

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
    if (section === "workbench" && !parts[3] && req.method === "GET") {
      const wanted = url.searchParams.get("status") as ProposalStatus | null;
      const [proposals, pulse] = await Promise.all([
        listProposals(wanted && PROPOSAL_STATUSES.includes(wanted) ? wanted : undefined),
        sitePulse(),
      ]);
      return json({ proposals: proposals.map((p) => ({ ...p, brief: buildBrief(p) })), pulse });
    }
    if (section === "workbench" && parts[3] && req.method === "POST") {
      const body = await readBody(req);
      const row = await setProposalStatus(user.id, Number(parts[3]), body.status as ProposalStatus);
      return row ? json({ ok: true, proposal: { ...row, brief: buildBrief(row) } }) : json({ error: "That change isn't on the workbench." }, 404);
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
