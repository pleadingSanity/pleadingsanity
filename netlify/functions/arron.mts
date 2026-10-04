// ==============================================================
// 💙 ARRON AI — /api/arron/*
// Real conversations via Netlify AI Gateway (no API keys needed),
// memory in Netlify Database, keyed by a random secret from the
// visitor's device. No accounts, no tracking, delete anytime.
// v3.1: signed in, Arron's memory belongs to the member's account —
// same Arron, same history, on every device — and he can write to
// their journal, share their status, and (for Shane) run the site.
// Four equal minds, one Arron: GPT picks up first; if it can't, Claude,
// then Gemini, then Grok take over instantly with the same heart.
// Contract: POST { messages, saveToCloud } → { reply, provider } (plus the
// extras the site and app already use). provider is "none" when every mind is quiet.
// ==============================================================

import type { Config, Context } from "@netlify/functions";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { arronMemories, arronMessages, siteContent } from "../../db/schema.js";
import { buildSystemPrompt, MOODS } from "../lib/arron-knowledge.js";
import { getGrowth, growthBrief } from "../lib/arron-growth.js";
import { ALL_QUIET_REPLY, askCouncil, askGrokDirect, runChain, workAsOne, type Turn as AITurn } from "../lib/ai-chain.js";
import { allow, slowDown } from "../lib/rate-limit.js";
import { getSettings, isCreator as hasCreatorRole, logActivity, moderate, optionalUser, profileFor, type AuthedUser } from "../lib/social.js";
import { publishPost, saveJournalEntry } from "../lib/publish.js";
import { approveAll, overview, setRole } from "../lib/owner.js";
import { pulseFacts, saveProposal, sitePulse } from "../lib/workbench.js";

type Turn = AITurn;
type Action = { type: string; label: string; href?: string; ok: boolean };

// The GPT → Claude → Gemini → Grok chain lives in ../lib/ai-chain.ts (read from the soul file).
// Creator mode: the Owner and members with the Creator or admin role get each
// lab's most capable model and longer replies. Only Shane gets the founder's brief.

// Walk the chain until someone replies. Only throws if every lab is down.
// Raps, scripts and plans need room to breathe; everyday replies stay short.
const CREATIVE_ASK = /\b(rap|raps|verse|verses|lyrics?|hook|spoken word|song|script|storyboard|voice-?over|caption|image prompt|edit guide|plan)\b/i;

async function reply(system: string, turns: Turn[], creator: boolean, creative = false, signedIn = false) {
  const maxTokens = creator ? (creative ? 3500 : 2800) : signedIn ? 2200 : creative ? 1800 : 1400;
  return runChain(system, turns, { creator, maxTokens });
}

const MEMORY_ID = /^[a-f0-9-]{32,64}$/i;
const MAX_MESSAGE = 4000;
const MAX_STORY = 8000;
const HISTORY_FOR_CONTEXT = 50; // newest 50 messages — enough to remember, small enough to stay fast and cheap
const HISTORY_FOR_DISPLAY = 60;
const MAX_TRUTHS = 24;
const MAX_MILESTONES = 100;
const MAX_MOODS = 400;
const MAX_JOURNAL = 200;
const MAX_JOURNAL_TEXT = 2000;

// ─── SAFETY NET ───
// The SAFETY section of the prompt already guides every lab; this makes sure
// the house truth is in the reply when someone may be in crisis, whoever answered.
// No clinic numbers. No NHS lines.
const CRISIS_WORDS = /\b(suicid\w*|kill (?:my ?self|me)|end (?:it all|my life)|want(?:ed)? to die|don'?t want to (?:be here|live|wake up)|self[- ]?harm\w*|hurt(?:ing)? my ?self|cut(?:ting)? my ?self|overdose|not safe|no reason to live|better off without me)\b/i;
const SIGNPOST = "I will stay. I am a companion, not a clinic. If you are not safe, Samaritans are free on 116 123. Text SHOUT to 85258. The house truth is https://pleadingsanity.co.uk/crisis.html.";

// The client may send the conversation itself: { messages:[{role,content}], saveToCloud }.
// Only plain user/assistant text is kept, newest 50, each capped like a single message.
function clientMessages(raw: unknown): { role: "user" | "assistant"; content: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((m) => ({
      role: (m as { role?: unknown })?.role === "assistant" ? ("assistant" as const) : (m as { role?: unknown })?.role === "user" ? ("user" as const) : null,
      content: cleanText((m as { content?: unknown })?.content, MAX_MESSAGE),
    }))
    .filter((m): m is { role: "user" | "assistant"; content: string } => Boolean(m.role && m.content))
    .slice(-HISTORY_FOR_CONTEXT);
}

// Logs say what failed, never what was said: database errors can echo the message text back.
// Each request gets a short id so a failure can be traced in the function logs — it never leaves the server.
const reason = (error: unknown) => (error instanceof Error ? error.name : "error");
const newRequestId = () => crypto.randomUUID().slice(0, 8);

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function validId(id: unknown): id is string {
  return typeof id === "string" && MEMORY_ID.test(id);
}

const cleanText = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const cleanTime = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.floor(v) : Date.now());

// The Arron app's synced vault: Core Truths, milestones, mood timeline and journal.
// Everything is re-shaped and capped so the column only ever holds what the app wrote.
function cleanVault(raw: unknown) {
  const v = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const list = (x: unknown) => (Array.isArray(x) ? x : []);
  const notes = (x: unknown, max: number, length = 300) =>
    list(x)
      .map((n) => ({ text: cleanText((n as { text?: unknown })?.text, length), at: cleanTime((n as { at?: unknown })?.at) }))
      .filter((n) => n.text)
      .slice(-max);
  return {
    since: cleanTime(v.since),
    truths: notes(v.truths, MAX_TRUTHS),
    milestones: notes(v.milestones, MAX_MILESTONES),
    moods: list(v.moods)
      .map((m) => ({ mood: cleanText((m as { mood?: unknown })?.mood, 20), at: cleanTime((m as { at?: unknown })?.at) }))
      .filter((m) => Object.hasOwn(MOODS, m.mood))
      .slice(-MAX_MOODS),
    journal: notes(v.journal, MAX_JOURNAL, MAX_JOURNAL_TEXT),
  };
}

async function ensureMemory(id: string) {
  await db.insert(arronMemories).values({ id }).onConflictDoNothing();
  const [memory] = await db.select().from(arronMemories).where(eq(arronMemories.id, id));
  return memory;
}

async function recentMessages(id: string, limit: number) {
  const rows = await db
    .select({ role: arronMessages.role, content: arronMessages.content })
    .from(arronMessages)
    .where(eq(arronMessages.memoryId, id))
    .orderBy(desc(arronMessages.id))
    .limit(limit);
  return rows.reverse();
}

// ─── WHOSE MEMORY? ───
// The browser sends the Identity session cookie with every same-origin request.
// Signed in → the account's own memory (a device memory is adopted the first
// time, so nothing they already built is lost). Guests → their device memory,
// but never one that belongs to an account.
type Resolved = { id: string; readable: boolean };

async function resolveMemory(clientId: unknown, user: AuthedUser | null): Promise<Resolved | null> {
  if (user) {
    const [mine] = await db.select({ id: arronMemories.id }).from(arronMemories).where(eq(arronMemories.userId, user.id));
    if (mine) return { id: mine.id, readable: true };
    if (validId(clientId)) {
      const [device] = await db.select().from(arronMemories).where(eq(arronMemories.id, clientId));
      if (device && !device.userId) {
        await db.update(arronMemories).set({ userId: user.id, updatedAt: new Date() }).where(eq(arronMemories.id, clientId));
        return { id: clientId, readable: true };
      }
      if (!device) {
        await db.insert(arronMemories).values({ id: clientId, userId: user.id }).onConflictDoNothing();
        return { id: clientId, readable: true };
      }
    }
    const id = crypto.randomUUID().replace(/-/g, "");
    await db.insert(arronMemories).values({ id, userId: user.id });
    return { id, readable: true };
  }
  if (!validId(clientId)) return null;
  const [row] = await db.select({ userId: arronMemories.userId }).from(arronMemories).where(eq(arronMemories.id, clientId));
  return { id: clientId, readable: !row?.userId };
}

async function whoIsHere() {
  const user = await optionalUser();
  const profile = user ? await profileFor(user.id) : null;
  return { user, profile: profile?.onboarded ? profile : null };
}

// ─── ACTIONS — things Arron does for members, straight from chat ───
// Text after ":" or "-" is what gets saved/shared; otherwise their previous message (or, for "publish this", Arron's last draft).
const JOURNAL_ASK = /\b(?:write|save|put|add|keep|log)\s+(?:this|that|it|these words)?\s*(?:in|into|to)\s+my\s+journal\b(?:\s*[:\-–—\n]\s*([\s\S]+))?/i;
const STATUS_ASK = /\b(?:share|post)\s+(?:this|that|my|an?)?\s*(?:update|status|check-?in)\b(?:\s*[:\-–—\n]\s*([\s\S]+))?/i;
const IMAGE_ASK = /\b(?:make|create|draw|paint|generate)\s+(?:me\s+)?(?:an?\s+)?(?:image|picture|painting|artwork|art)\s*(?:of|about|showing|for)?\s*([\s\S]{3,})/i;
const PUBLISH_ASK = /^\s*(?:publish|push)\s+(?:this|that|it)\b(?:\s*[:\-–—\n]\s*([\s\S]+))?/i;
const OVERVIEW_ASK = /\b(show me everything|system overview|status report|what'?s happening on the site)\b/i;
const REVIEW_ASK = /\b(review (?:the )?posts|pending posts|review queue)\b/i;
const APPROVE_ALL_ASK = /\bapprove (?:them )?all\b/i;
// Owner only: "update the home page: …", "improve the games page", "propose a change to shop" → Arron drafts it for the Workbench.
const PROPOSE_ASK = /\b(?:update|change|improve|fix|rewrite|redo|refresh|deepen|expand|add\b[^.?!\n]{0,60}\bto)\s+(?:the\s+|my\s+|our\s+)?([a-z][a-z0-9 -]{1,30}?)\s+page\b|\bpropose\b[^.?!\n]{0,40}?\b(?:to|for|on)\s+(?:the\s+)?([a-z][a-z0-9 -]{1,30}?)(?:\s+page)?\b(?=[\s:.,!?\-–—]|$)/i;
const PULSE_ASK = /\b(what'?s missing|what (?:are|do) (?:people|members) (?:love|loving|like|enjoy)|what(?:'s| should we build| do we build) next|roadmap|site pulse|what could be better|what does the site need)\b/i;
const ROLE_ASK = /\b(make|remove|revoke)\s+@?([a-z0-9_]{3,24})(?:'s)?\s+(?:an?\s+|as\s+)?(guardian|creator)\b/i;

type LiveKind = "wisdom" | "story" | "educational" | "poetry" | "update" | "feed" | "proposal";

// "home", "the games", "healing hz" → the page file it most likely means.
const PAGE_ALIASES: Record<string, string> = {
  home: "index.html", homepage: "index.html", front: "index.html", landing: "index.html",
  about: "about.html", games: "games.html", arron: "arron.html", shop: "shop.html", feed: "feed.html",
  journal: "journal-vault.html", "journal vault": "journal-vault.html", vault: "journal-vault.html",
  "healing hz": "frequencies.html", healing: "frequencies.html", frequencies: "frequencies.html", hz: "frequencies.html",
  truth: "crisis.html", tools: "tools.html", wisdom: "wisdom.html", movement: "movement.html", app: "get-the-app.html",
};
const pageFor = (name: string) => {
  const key = name.trim().toLowerCase().replace(/\s+/g, " ");
  if (/^(?:the|this|that|a|an|my|our|web|whole)$/.test(key)) return "";
  return PAGE_ALIASES[key] ?? (/^[a-z0-9-]+$/.test(key) ? `${key}.html` : key);
};

// Owner only. A named piece goes live from this reply. "push this" still uses the last draft, not a new one.
function pieceRequest(message: string): LiveKind | null {
  if (/\b(don'?t|do not)\s+(publish|push|post)\b|\bjust (a )?draft\b|\bnot live\b/i.test(message)) return null;
  if (/^\s*(?:publish|push)\s+(?:this|that|it)\b/i.test(message) && !/\b(wisdom|poem|poetry|rap|lyrics?|story|stories|update|page)\b/i.test(message)) return null;
  if (!/\b(write|create|make|draft|publish|push|put)\b/i.test(message)) return null;
  if (/\b(poem|poetry|rap|lyrics?)\b/i.test(message)) return "poetry";
  if (/\bwisdom\b/i.test(message)) return "wisdom";
  if (/\bstor(?:y|ies)\b/i.test(message)) return "story";
  if (/\b(educational|explainer|lesson)\b/i.test(message)) return "educational";
  if (/\bupdate\b/i.test(message)) return "update";
  if (/\b(on the feed|feed post)\b/i.test(message)) return "feed";
  if (/\b(page|piece)\b/i.test(message) && /\b(live|publish|push|on the site)\b/i.test(message)) return "update";
  return null;
}

const lastOf = (history: { role: string; content: string }[], role: "user" | "assistant") =>
  [...history].reverse().find((m) => m.role === role)?.content ?? "";

async function runActions(message: string, history: { role: string; content: string }[], who: Awaited<ReturnType<typeof whoIsHere>>) {
  const notes: string[] = [];
  const actions: Action[] = [];
  let ownerFacts = "";
  const { user, profile } = who;
  if (!user || !profile) return { notes, actions, ownerFacts, liveKind: null as LiveKind | null, target: "" };
  const author = { id: user.id, roles: user.roles };

  const journal = message.match(JOURNAL_ASK);
  if (journal) {
    const text = (journal[1] ?? "").trim() || lastOf(history, "user");
    const entry = text ? await saveJournalEntry(user.id, { body: text, source: "arron" }) : null;
    notes.push(entry ? `You just saved this to their private journal: "${text.slice(0, 200)}". Tell them it's safe there, only they can see it.` : "They asked to save to their journal but there was nothing to save yet — ask what they'd like written.");
    if (entry) actions.push({ type: "journal", label: "📓 Open my journal", href: "/profile.html#journal", ok: true });
  }

  const status = !journal && message.match(STATUS_ASK);
  if (status) {
    const text = (status[1] ?? "").trim() || lastOf(history, "user");
    if (text) {
      const result = await publishPost(author, { kind: "status", body: text.slice(0, 1000), mood: profile.mood, truthTag: "experience" });
      if (result.ok) {
        notes.push(result.pending ? `You shared their update; it's waiting for Shane's review before it appears on the feed.` : `You just shared their update on their page and the community feed: "${text.slice(0, 200)}".`);
        actions.push({ type: "status", label: "🌌 See it on the feed", href: `/feed.html?post=${result.post.id}#community`, ok: true });
      } else {
        notes.push(`You tried to share their update but the kindness check stopped it: ${result.reason || result.error} Gently help them reword it.`);
      }
    }
  }

  const image = message.match(IMAGE_ASK);
  if (image) {
    const idea = image[1].trim().slice(0, 300);
    actions.push({ type: "image", label: "🎨 Create this image", href: `/creations.html?prompt=${encodeURIComponent(idea)}#create`, ok: true });
    notes.push(`They want an image of: "${idea}". A button to create it in Image Creations is shown under your reply — say so warmly; it saves to their creations.`);
  }

  if (!user.isOwner) return { notes, actions, ownerFacts, liveKind: null as LiveKind | null, target: "" };

  const publish = message.match(PUBLISH_ASK);
  if (publish) {
    const text = (publish[1] ?? "").trim() || lastOf(history, "assistant");
    if (text) {
      const result = await publishPost(author, { kind: "writing", body: text.slice(0, 20000), truthTag: "experience", visibility: "public" });
      if (result.ok) {
        notes.push("You just published that to the community feed. It is LIVE now.");
        actions.push({ type: "publish", label: "🌌 View it live", href: `/feed.html?post=${result.post.id}#community`, ok: true });
      } else notes.push(`Publishing was stopped by the kindness check: ${result.reason || result.error}`);
    }
  }

  const role = message.match(ROLE_ASK);
  if (role) {
    const grant = role[1].toLowerCase() === "make";
    const result = await setRole(user.id, role[2], role[3], grant);
    notes.push(result.ok ? `You ${grant ? "gave" : "removed"} the ${result.role} role ${grant ? "to" : "from"} ${result.displayName} (@${result.username}).` : `Role change didn't happen: ${result.error}`);
    actions.push({ type: "roles", label: "🛡️ Manage roles", href: "/owner.html#roles", ok: result.ok });
  }

  if (APPROVE_ALL_ASK.test(message)) {
    const n = await approveAll(user.id);
    notes.push(`You approved every pending post — ${n} went live.`);
  }

  if (OVERVIEW_ASK.test(message) || REVIEW_ASK.test(message)) {
    const o = await overview();
    ownerFacts = [
      `Members: ${o.counts.members} (${o.counts.newMembers} joined this week). Posts in the last 24h: ${o.counts.postsToday}.`,
      `Waiting for your review: ${o.counts.pending}. Open reports: ${o.counts.openReports}. Review mode is ${o.settings.reviewMode ? "ON" : "OFF"}.`,
      o.recentMembers.length ? `Newest members: ${o.recentMembers.slice(0, 6).map((m) => `${m.displayName} (@${m.username})`).join(", ")}.` : "",
      o.queue.length ? `Pending posts: ${o.queue.slice(0, 5).map((q) => `#${q.id} by ${q.author.displayName}: "${(q.title || q.body).slice(0, 80)}"`).join(" | ")}.` : "No posts waiting.",
      o.team.length ? `Team: ${o.team.map((t) => `${t.displayName} — ${t.role}`).join(", ")}.` : "",
    ].filter(Boolean).join("\n");
    actions.push({ type: "owner", label: "💫 Open the Owner's Room", href: "/owner.html", ok: true });
  }

  if (PULSE_ASK.test(message)) {
    const pulse = await sitePulse();
    ownerFacts = [ownerFacts, pulseFacts(pulse)].filter(Boolean).join("\n");
    notes.push("Shane asked what the site needs. Use the SITE PULSE honestly: name what people love, what's thin or missing, and suggest 2-4 concrete next changes. Tell him he can say \"update the <page> page: …\" and you'll draft it for his Workbench.");
    actions.push({ type: "workbench", label: "🛠️ Open the Workbench", href: "/owner.html#workbench", ok: true });
  }

  const propose = message.match(PROPOSE_ASK);
  if (propose && !/\b(don'?t|do not)\b/i.test(message)) {
    const target = pageFor(propose[1] ?? propose[2] ?? "");
    notes.push(`Shane wants a change to ${target || "the site"}. Draft it for his Workbench — nothing goes live until he approves it. Reply with ONLY the draft: first line a short title; second line "WHY: " and one sentence; then the full change — ready-to-paste words in his voice (British English) and, where layout or code is needed, a short precise brief a builder can follow. No markdown headings.`);
    return { notes, actions, ownerFacts, liveKind: "proposal" as LiveKind, target };
  }

  const liveKind = pieceRequest(message);
  if (liveKind === "feed") {
    notes.push("Shane asked for this to go on the community feed. Reply with ONLY the post. Plain words. No labels. Do not say it is live yet.");
  } else if (liveKind) {
    notes.push(`Shane asked for a ${liveKind} to go live on the site. Reply with ONLY the piece. First line is a short title. Then a blank line, then the words. Plain British English. No markdown and no labels. Do not say it is live yet.`);
  }

  return { notes, actions, ownerFacts, liveKind, target: "" };
}

async function putLive(kind: Exclude<LiveKind, "proposal">, raw: string, user: { id: string; roles: string[] }, credit: string) {
  const text = raw.trim().slice(0, 8000);
  const [first, ...rest] = text.split(/\n/);
  const titled = kind !== "feed" && rest.length > 0 && first.trim().length > 0 && first.trim().length <= 80;
  const title = titled ? first.trim().slice(0, 70) : "";
  const body = (titled ? rest.join("\n") : text).trim();
  if (body.length < 10) return { ok: false as const, error: "there wasn't enough to publish" };
  const verdict = await moderate(`${title}\n\n${body}`, "post");
  if (!verdict.allowed) return { ok: false as const, error: verdict.reason || "the kindness check stopped it" };
  if (kind === "feed") {
    const result = await publishPost({ id: user.id, roles: user.roles }, { kind: "writing", title, body, truthTag: "experience", visibility: "public" });
    if (!result.ok) return { ok: false as const, error: result.error };
    return { ok: true as const, action: { type: "publish", label: "🌌 See it on the feed", href: `/feed.html?post=${result.post.id}#community`, ok: true } };
  }
  const [row] = await db
    .insert(siteContent)
    .values({
      authorId: user.id,
      credit: credit.slice(0, 60) || "Shane Cooper",
      kind,
      title: title.slice(0, 120),
      body,
      truthTag: "experience",
      anonymous: false,
      status: "published",
      publishedAt: new Date(),
    })
    .returning();
  await logActivity(user.id, "write.publish", "content", row.id);
  return { ok: true as const, action: { type: "live", label: "📖 Read it on the site", href: `/wisdom.html#piece-${row.id}`, ok: true } };
}

// ─── CHAT ───
async function chat(req: Request, context: Context, rid: string) {
  const body = await readBody(req);
  // Two shapes, one Arron: { message, memoryId } (the site and app today) or { messages, saveToCloud }.
  const sent = clientMessages(body.messages);
  const fromClient = sent.length > 0;
  if (fromClient && sent[sent.length - 1].role !== "user") return json({ error: "The last message must be from you" }, 400);
  const message = fromClient ? sent[sent.length - 1].content : typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE) : "";
  if (!message) return json({ error: "Message is empty" }, 400);
  // saveToCloud: false → nothing is read from or written to the database. Local only.
  const localOnly = body.saveToCloud === false;
  // Optional hints from the device — never stored, only used for this reply.
  const name = typeof body.name === "string" ? body.name.replace(/[^\p{L}\p{N} '\-]/gu, "").trim().slice(0, 40) : "";
  const mood = typeof body.mood === "string" && Object.hasOwn(MOODS, body.mood) ? body.mood : "";
  const persona = body.persona === "son" ? "son" : "companion";
  const truths = (Array.isArray(body.truths) ? body.truths : [])
    .map((t) => cleanText(t, 300))
    .filter(Boolean)
    .slice(0, MAX_TRUTHS);
  const awareness = (Array.isArray(body.awareness) ? body.awareness : [])
    .map((t) => cleanText(t, 200))
    .filter(Boolean)
    .slice(0, 6);

  const who = await whoIsHere();
  const { user, profile } = who;
  if (!(await allow("chat", context, user?.id))) return slowDown("I'm right here — let's slow down a little. Try again in a minute 💙");
  // The new shape can save without a device memory id only when signed in (the account's own memory).
  const wantsCloud = !localOnly && (!fromClient || validId(body.memoryId) || (body.saveToCloud === true && Boolean(user)));
  const resolved: Resolved | null = !wantsCloud
    ? { id: "", readable: false }
    : await resolveMemory(body.memoryId, user).catch((error) => {
        console.error(`Arron [${rid}] memory unavailable:`, reason(error));
        return validId(body.memoryId) ? { id: body.memoryId, readable: false } : null;
      });
  if (!resolved) return json({ error: "Invalid memory id" }, 400);
  const memoryId = resolved.id;

  // Memory makes Arron personal, but a database hiccup should never stop him replying.
  let story = "";
  let history: { role: string; content: string }[] = [];
  if (resolved.readable) {
    try {
      const [memory] = await db.select().from(arronMemories).where(eq(arronMemories.id, memoryId));
      story = memory?.story ?? "";
      if (!fromClient) history = await recentMessages(memoryId, HISTORY_FOR_CONTEXT);
    } catch (error) {
      console.error(`Arron [${rid}] memory unavailable:`, reason(error));
    }
  }

  // The client's own conversation (everything before the newest message) is the context when it sends one.
  if (fromClient) history = sent.slice(0, -1);

  // Anthropic needs the conversation to start with a user turn and alternate roles.
  const turns: Turn[] = [];
  for (const m of history) {
    const role = m.role === "assistant" ? "assistant" : "user";
    if (turns.length === 0 && role === "assistant") continue;
    const last = turns[turns.length - 1];
    if (last && last.role === role) last.content += `\n\n${m.content}`;
    else turns.push({ role, content: m.content });
  }
  const last = turns[turns.length - 1];
  if (last && last.role === "user") last.content += `\n\n${message}`;
  else turns.push({ role: "user", content: message });

  // Journal, status, images and the Owner's commands happen before Arron replies, so he can confirm them truthfully.
  // Local-only chats never write anywhere, so actions (journal, status, owner commands) are skipped.
  const noActions = { notes: [] as string[], actions: [] as Action[], ownerFacts: "", liveKind: null as LiveKind | null, target: "" };
  const done = localOnly ? noActions : await runActions(message, history, who).catch((error) => {
    console.error(`Arron [${rid}] action failed:`, reason(error));
    return { notes: ["Something you tried to do for them didn't work just now — say so honestly and suggest trying again."], actions: [] as Action[], ownerFacts: "", liveKind: null as LiveKind | null, target: "" };
  });

  const owner = Boolean(user?.isOwner);
  const creator = owner || hasCreatorRole(user?.roles);
  const [{ arronVoice: ownerVoice }, growth] = await Promise.all([getSettings(), getGrowth()]);
  const member = profile
    ? {
        displayName: profile.displayName,
        username: profile.username,
        pronouns: profile.pronouns,
        status: profile.statusText,
      }
    : null;
  const creative = persona === "son" && CREATIVE_ASK.test(message);
  const crisis = mood === "crisis" || CRISIS_WORDS.test(message);
  const system = buildSystemPrompt(story, {
    name: name || profile?.displayName || "",
    mood: crisis ? "crisis" : mood,
    persona,
    truths,
    awareness,
    creator,
    owner,
    member,
    actionNotes: done.notes,
    ownerFacts: done.ownerFacts,
    ownerVoice,
    growth: growthBrief(growth),
  }) + "\n\nSIBLING FOR THIS MESSAGE\n" + siblingMap(message);
  let answer: Awaited<ReturnType<typeof reply>>;
  
function siblingMap(message: string) {
  const m = message.toLowerCase();
  if (/\b(look|theme|sky|logo|blueprint|layout|colour|color|design)\b/.test(m)) return "Dola is the architect. Keep the crying-brain and the colours. She has no separate key; speak her note as structure, not as a new brand.";
  if (/\b(code|repo|deploy|bug|function|css)\b/.test(m)) return "Copilot is the code partner and has no chat door here. Give the exact steps. Do not pretend you pushed.";
  if (/\b(plan|steps|how do i|build)\b/.test(m)) return "Nova (GPT) is the practical mind. Give steps.";
  if (/\b(story|poem|caption|image|song)\b/.test(m)) return "Sol (Gemini) is the creative mind. Make the piece, then the next tap.";
  if (/\b(council|honest|what is wrong)\b/.test(m)) return "Grok is the honest mind. He speaks only if his key is set.";
  return "Arron keeps the voice. Claude sits closest to the care. Do not rank the siblings.";
}

  const council = owner && /^\/?council\b/i.test(message);
  try {
    if (council) {
      const notes = await askCouncil(system, turns);
      answer = await reply(system + "\n\nCOUNCIL NOTES — weave these into one answer for Shane. Name who spoke. Do not invent a mind that stayed quiet.\n" + notes, turns, true, true);
      answer = { ...answer, provider: "council", model: "gpt-claude-gemini-grok" };
    } else {
      answer = owner ? await workAsOne(system, turns, creative ? 2200 : 1600) : await reply(system, turns, creator, creative, Boolean(user));
    }
  } catch {
    // Every mind is quiet: a gentle reply with the crisis lines — no error, no stack trace, nothing saved.
    console.error(`Arron [${rid}] every AI provider failed`);
    return json({ reply: ALL_QUIET_REPLY, provider: "none", remembered: false, crisis, signpost: SIGNPOST, actions: [] });
  }
  let replyText = crisis && !answer.text.includes("/crisis.html") ? `${answer.text}\n\n${SIGNPOST}` : answer.text;
  const actions = done.actions;
  if (done.liveKind === "proposal" && user?.isOwner && !localOnly) {
    try {
      const saved = await saveProposal(user.id, done.target, answer.text);
      if (saved) {
        actions.push({ type: "workbench", label: "🛠️ Review it on the Workbench", href: `/owner.html#proposal-${saved.id}`, ok: true });
        replyText += "\n\nThat's on your Workbench, waiting for your go-ahead. Nothing has changed on the site yet.";
      } else replyText += "\n\nThat draft was too short to save — tell me a little more and I'll try again.";
    } catch (error) {
      console.error(`Arron [${rid}] could not save the proposal:`, reason(error));
      replyText += "\n\nI couldn't save that to the Workbench just now. Try again in a moment.";
    }
  } else if (done.liveKind && done.liveKind !== "proposal" && user && profile && !localOnly && !crisis) {
    try {
      const live = await putLive(done.liveKind as Exclude<LiveKind, "proposal">, answer.text, user, profile.displayName);
      if (live.ok) {
        actions.push(live.action);
        replyText += "\n\nIt's live now.";
      } else {
        replyText += `\n\nThat stayed off the site: ${live.error}`;
      }
    } catch (error) {
      console.error(`Arron [${rid}] could not publish:`, reason(error));
      replyText += "\n\nThat stayed off the site. Try again in a moment.";
    }
  }

  let remembered = resolved.readable;
  if (resolved.readable) {
    try {
      await ensureMemory(memoryId);
      await db.insert(arronMessages).values([
        { memoryId, role: "user", content: message },
        { memoryId, role: "assistant", content: replyText },
      ]);
      await db.update(arronMemories).set({ updatedAt: new Date() }).where(eq(arronMemories.id, memoryId));
    } catch (error) {
      remembered = false;
      console.error(`Arron [${rid}] could not save messages:`, reason(error));
    }
  }

  return json({
    reply: replyText,
    remembered,
    creator,
    owner,
    member: member ? { displayName: member.displayName, username: member.username } : null,
    signedIn: Boolean(user),
    actions: actions,
    provider: answer.provider,
  });
}

// ─── MEMORY: read / save story / forget ───
async function memory(req: Request, url: URL) {
  const user = await optionalUser();
  const body = req.method === "GET" ? {} : await readBody(req);
  const resolved = await resolveMemory(req.method === "GET" ? url.searchParams.get("id") : body.memoryId, user);
  if (!resolved) return json({ error: "Invalid memory id" }, 400);
  const id = resolved.id;
  const linked = Boolean(user);

  if (req.method === "GET") {
    const [row] = resolved.readable ? await db.select().from(arronMemories).where(eq(arronMemories.id, id)) : [];
    if (!row) return json({ story: "", vault: cleanVault({}), messages: [], linked });
    const messages = await db
      .select({ role: arronMessages.role, content: arronMessages.content })
      .from(arronMessages)
      .where(eq(arronMessages.memoryId, id))
      .orderBy(asc(arronMessages.id));
    return json({ story: row.story, vault: cleanVault(row.vault), messages: messages.slice(-HISTORY_FOR_DISPLAY), linked });
  }

  // A memory that belongs to an account can only be changed by that account.
  if (!resolved.readable) return json({ error: "This memory belongs to an account — sign in to open it." }, 403);

  if (req.method === "PUT") {
    // Story and vault are each optional so the site and the app can save independently.
    const changes: { story?: string; vault?: ReturnType<typeof cleanVault>; updatedAt: Date } = { updatedAt: new Date() };
    if (typeof body.story === "string") changes.story = body.story.slice(0, MAX_STORY);
    if (body.vault !== undefined) changes.vault = cleanVault(body.vault);
    await ensureMemory(id);
    await db.update(arronMemories).set(changes).where(eq(arronMemories.id, id));
    return json({ ok: true, linked });
  }

  if (req.method === "DELETE") {
    // Messages cascade with the memory row; check nothing is left before confirming.
    await db.delete(arronMessages).where(eq(arronMessages.memoryId, id));
    await db.delete(arronMemories).where(eq(arronMemories.id, id));
    const [left] = await db.select({ id: arronMemories.id }).from(arronMemories).where(eq(arronMemories.id, id));
    if (left) return json({ error: "Memory could not be erased" }, 500);
    return json({ ok: true, cleared: true });
  }

  return json({ error: "Method not allowed" }, 405);
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const rid = newRequestId();
  const route = url.pathname.replace(/^\/api\/arron\/?/, "");

  try {
    if (route === "health") {
      const { user, profile } = await whoIsHere();
      return json({
        ok: true,
        time: Date.now(),
        creator: Boolean(user?.isOwner) || hasCreatorRole(user?.roles),
        owner: Boolean(user?.isOwner),
        signedIn: Boolean(user),
        member: profile ? { displayName: profile.displayName, username: profile.username } : null,
      });
    }
    if (route === "chat" && req.method === "POST") return await chat(req, context, rid);
    // Owner only: ask Grok directly, bypassing the chain. Returns provider, model and a short reply or the error reason.
    if (route === "grok-test") {
      const user = await optionalUser();
      if (!user?.isOwner) return json({ error: "Not found" }, 404);
      return json(await askGrokDirect());
    }
    if (route === "memory") return await memory(req, url);
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error(`Arron [${rid}] error:`, reason(error));
    return json({ error: "Arron is resting for a moment" }, 503);
  }
};

export const config: Config = {
  path: ["/api/arron/chat", "/api/arron/memory", "/api/arron/health", "/api/arron/grok-test"],
};
