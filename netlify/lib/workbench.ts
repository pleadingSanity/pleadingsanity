// ==============================================================
// 🛠️ ARRON'S WORKBENCH — Shane only
// Arron notices what the site needs, drafts the change in chat,
// and it waits here until Shane says go. Nothing on the site
// changes without his approval.
//   proposed → approved (ready to push) → done   | dismissed
// Approving a page change gives Shane a ready-to-paste build brief
// for the Netlify agent (or any builder). One paste, one deploy.
// The Pulse tells him what people are reading, hearting and playing.
// ==============================================================

import { and, desc, eq, gte, inArray, ne, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { gameProgress, likes, posts, siteProposals } from "../../db/schema.js";
import { SOUL } from "./arron-knowledge.js";
import { countSql, logActivity } from "./social.js";

export const PROPOSAL_STATUSES = ["proposed", "approved", "done", "dismissed"] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];
export type Proposal = typeof siteProposals.$inferSelect;

const DAY = 86_400_000;

// Arron's draft: first line is the title, an optional "WHY:" line, then the change itself.
export function parseDraft(raw: string) {
  const lines = raw.trim().split(/\n/);
  const title = (lines.shift() ?? "").replace(/^[#*\s]+|[*\s]+$/g, "").slice(0, 120) || "A change Arron drafted";
  let why = "";
  const whyAt = lines.findIndex((l) => /^\s*\**\s*why\s*:/i.test(l));
  if (whyAt !== -1 && whyAt < 4) why = lines.splice(whyAt, 1)[0].replace(/^\s*\**\s*why\s*:\s*\**\s*/i, "").slice(0, 400);
  return { title, why, body: lines.join("\n").trim().slice(0, 12000) };
}

export async function saveProposal(ownerId: string, target: string, raw: string) {
  const draft = parseDraft(raw);
  if (draft.body.length < 20) return null;
  const [row] = await db
    .insert(siteProposals)
    .values({ kind: "page", target: target.slice(0, 80), ...draft })
    .returning();
  await logActivity(ownerId, "workbench.propose", "proposal", row.id);
  return row;
}

export async function listProposals(status?: ProposalStatus) {
  return db
    .select()
    .from(siteProposals)
    .where(status ? eq(siteProposals.status, status) : inArray(siteProposals.status, ["proposed", "approved"]))
    .orderBy(desc(siteProposals.id))
    .limit(50);
}

export async function setProposalStatus(ownerId: string, id: number, status: ProposalStatus) {
  if (!Number.isInteger(id) || !PROPOSAL_STATUSES.includes(status)) return null;
  const [row] = await db
    .update(siteProposals)
    .set({ status, updatedAt: new Date() })
    .where(eq(siteProposals.id, id))
    .returning();
  if (row) await logActivity(ownerId, `workbench.${status}`, "proposal", id);
  return row ?? null;
}

// The brief Shane pastes into the builder. Plain, complete, and bound by the project rules.
export function buildBrief(p: Proposal) {
  return [
    `Pleading Sanity — approved change #${p.id}: ${p.title}`,
    p.target ? `Where: ${p.target}` : "",
    p.why ? `Why: ${p.why}` : "",
    "",
    "What to do:",
    p.body,
    "",
    "Keep to the project rules: pure HTML/CSS/vanilla JS, no build step, brand colours, system fonts, WCAG 2.1 AA, en-GB, Evolution Not Erasure — build on what's there, delete nothing that still serves.",
  ]
    .filter((l, i, all) => l !== "" || (all[i - 1] ?? "") !== "")
    .join("\n");
}

// What people are reading, hearting and playing — so Arron can say what's loved and what's missing.
export async function sitePulse() {
  const since = new Date(Date.now() - 14 * DAY);
  const live = and(eq(posts.visibility, "public"), eq(posts.status, "live"), eq(posts.hidden, false), gte(posts.createdAt, since));
  const hearts = sql<number>`count(${likes.postId})::int`;
  const [mostWalked, mostLoved, games, [waiting]] = await Promise.all([
    db
      .select({ id: posts.id, title: posts.title, body: posts.body, views: posts.views })
      .from(posts)
      .where(and(live, gte(posts.views, 1)))
      .orderBy(desc(posts.views))
      .limit(5),
    db
      .select({ id: posts.id, title: posts.title, body: posts.body, hearts })
      .from(likes)
      .innerJoin(posts, eq(posts.id, likes.postId))
      .where(and(live, ne(likes.userId, posts.authorId)))
      .groupBy(posts.id, posts.title, posts.body)
      .orderBy(desc(hearts))
      .limit(5),
    db
      .select({ game: gameProgress.game, players: countSql })
      .from(gameProgress)
      .groupBy(gameProgress.game)
      .orderBy(desc(countSql))
      .limit(12),
    db.select({ n: countSql }).from(siteProposals).where(inArray(siteProposals.status, ["proposed", "approved"])),
  ]);
  const label = (p: { title: string; body: string }) => (p.title || p.body).replace(/\s+/g, " ").slice(0, 70);
  const roadmap = Array.isArray((SOUL as { roadmap?: unknown }).roadmap) ? ((SOUL as { roadmap: { item: string; status?: string }[] }).roadmap) : [];
  return {
    mostWalked: mostWalked.map((p) => ({ id: p.id, label: label(p), views: p.views })),
    mostLoved: mostLoved.map((p) => ({ id: p.id, label: label(p), hearts: p.hearts })),
    games,
    waiting: waiting?.n ?? 0,
    roadmap,
  };
}

export function pulseFacts(p: Awaited<ReturnType<typeof sitePulse>>) {
  return [
    "SITE PULSE (last 14 days, public posts only — no names):",
    p.mostWalked.length ? `Most walked: ${p.mostWalked.map((x) => `#${x.id} "${x.label}" (${x.views} views)`).join(" | ")}.` : "No views counted yet.",
    p.mostLoved.length ? `Most loved: ${p.mostLoved.map((x) => `#${x.id} "${x.label}" (${x.hearts} hearts)`).join(" | ")}.` : "No hearts yet this fortnight.",
    p.games.length ? `Games with saved progress (members): ${p.games.map((g) => `${g.game} ${g.players}`).join(", ")}.` : "No saved game progress yet.",
    `Workbench: ${p.waiting} change(s) waiting for Shane.`,
    p.roadmap.length ? `Roadmap in the soul file: ${p.roadmap.map((r) => `${r.item}${r.status ? ` [${r.status}]` : ""}`).join("; ")}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
