// ==============================================================
// 🎨 CREATIONS — Arron makes images with members
//   POST   /api/creations              {prompt, title?}  → generate (members)
//   GET    /api/creations?scope=gallery|mine&before=ID
//   GET    /api/creations/:id/image                       → the picture
//   POST   /api/creations/:id          {action: share|unshare}
//   DELETE /api/creations/:id
// Images come from a Gemini image model through Netlify AI Gateway
// (no keys in code) and live in the "post-images" blob store, so a
// creation can be shared straight to the feed as an image post.
// Every prompt passes the Truth Filter before anything is drawn.
// ==============================================================

import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { GoogleGenAI } from "@google/genai";
import { and, desc, eq, inArray, lt } from "drizzle-orm";
import { db } from "../../db/index.js";
import { creations, profiles } from "../../db/schema.js";
import { currentUser, isCreator, isGuardian, json, logActivity, moderate, readBody, str, unauthorized } from "../lib/social.js";
import { visitorKey, withinDailyLimit } from "../lib/studio.js";

const IMAGE_MODEL = "gemini-3.1-flash-image";
const DAILY_LIMIT = 6;
const PAGE = 24;

// The house look: every picture belongs to the same cosmic family.
const BRAND_STYLE = `Art direction (always): Pleading Sanity brand — deep space background (#000103 to #0d1b2a),
glowing cosmic cyan (#00fff0) neon light with soft violet-magenta accents, gentle starlight and nebula dust,
warm, hopeful, healing mood. Clean composition, high detail, soft glow. The brand symbol is a luminous silver
brain with cyan outlines and glowing tear-drops — include it only if it suits the request.
Never include text, logos, watermarks, gore, weapons, self-harm, or anything frightening.`;

type Creation = typeof creations.$inferSelect;

function gateway() {
  return new GoogleGenAI({
    apiKey: process.env.NETLIFY_AI_GATEWAY_KEY,
    httpOptions: { baseUrl: process.env.NETLIFY_AI_GATEWAY_BASE_URL?.replace(/\/$/, "") },
  });
}

async function shape(rows: Creation[], viewerId: string | null) {
  if (!rows.length) return [];
  const authors = await db
    .select()
    .from(profiles)
    .where(inArray(profiles.userId, [...new Set(rows.map((r) => r.authorId))]));
  const map = new Map(authors.map((a) => [a.userId, a]));
  return rows.map((r) => {
    const a = map.get(r.authorId);
    return {
      id: r.id,
      title: r.title,
      prompt: r.prompt,
      imageUrl: `/api/creations/${r.id}/image`,
      imageKey: r.authorId === viewerId ? r.imageKey : undefined,
      shared: r.shared,
      createdAt: r.createdAt,
      mine: r.authorId === viewerId,
      author: a
        ? { username: a.username, displayName: a.displayName, avatar: a.avatar }
        : { username: "", displayName: "Member", avatar: "🌌" },
    };
  });
}

async function generate(req: Request, context: Context, user: { id: string; roles: string[] }) {
  const body = await readBody(req);
  const prompt = str(body.prompt, 500);
  const title = str(body.title, 80);
  if (prompt.length < 4) return json({ error: "Tell Arron what you'd like to see — a few words is enough." }, 400);

  if (!isCreator(user.roles)) {
    const ok = await withinDailyLimit("image:" + visitorKey(req, context.ip, user.id), DAILY_LIMIT);
    if (!ok) return json({ error: "That's today's creations — the canvas refills tomorrow ✨" }, 429);
  }

  const verdict = await moderate(prompt, "post");
  if (!verdict.allowed) {
    return json({ error: "Arron can't make that one.", reason: verdict.reason || "Try a gentler, kinder idea." }, 422);
  }

  const response = await gateway().models.generateContent({
    model: IMAGE_MODEL,
    contents: `${BRAND_STYLE}\n\nCreate a square image of: ${prompt}`,
  });
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const image = parts.find((p) => p.inlineData?.data);
  if (!image?.inlineData?.data) {
    return json({ error: "The stars didn't line up that time — try rewording your idea." }, 502);
  }

  const contentType = image.inlineData.mimeType || "image/png";
  const key = `${user.id}/${crypto.randomUUID()}`;
  const bytes = Uint8Array.from(Buffer.from(image.inlineData.data, "base64"));
  await getStore("post-images").set(key, bytes.buffer as ArrayBuffer, {
    metadata: { contentType, owner: user.id, uploadedAt: Date.now(), source: "creation" },
  });

  const [row] = await db
    .insert(creations)
    .values({ authorId: user.id, prompt, title: title || prompt.slice(0, 60), imageKey: key, model: IMAGE_MODEL })
    .returning();
  await logActivity(user.id, "creation.create", "creation", row.id);
  return json({ creation: (await shape([row], user.id))[0] }, 201);
}

async function list(url: URL, viewerId: string | null) {
  const scope = url.searchParams.get("scope") === "mine" ? "mine" : "gallery";
  if (scope === "mine" && !viewerId) return unauthorized();
  const before = Number(url.searchParams.get("before"));
  // ?author=username → that member's shared creations, for their /@username page.
  const authorName = url.searchParams.get("author");
  let authorId: string | undefined;
  if (authorName && scope === "gallery") {
    const [a] = await db.select({ id: profiles.userId }).from(profiles).where(eq(profiles.username, authorName.toLowerCase()));
    if (!a) return json({ creations: [], nextBefore: null });
    authorId = a.id;
  }
  const rows = await db
    .select()
    .from(creations)
    .where(
      and(
        scope === "mine" ? eq(creations.authorId, viewerId as string) : and(eq(creations.shared, true), eq(creations.hidden, false)),
        authorId ? eq(creations.authorId, authorId) : undefined,
        Number.isInteger(before) && before > 0 ? lt(creations.id, before) : undefined,
      ),
    )
    .orderBy(desc(creations.id))
    .limit(PAGE + 1);
  const page = rows.slice(0, PAGE);
  return json({ creations: await shape(page, viewerId), nextBefore: rows.length > PAGE ? page[page.length - 1].id : null });
}

async function serveImage(row: Creation, viewer: { id: string; roles: string[] } | null) {
  const visible = (row.shared && !row.hidden) || row.authorId === viewer?.id || isGuardian(viewer?.roles);
  if (!visible) return new Response("Not found", { status: 404 });
  const entry = await getStore("post-images").getWithMetadata(row.imageKey, { type: "arrayBuffer" });
  if (!entry) return new Response("Not found", { status: 404 });
  const type = typeof entry.metadata.contentType === "string" ? entry.metadata.contentType : "image/png";
  return new Response(entry.data, {
    headers: {
      "Content-Type": type,
      "Cache-Control": row.shared ? "public, max-age=86400" : "private, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export default async (req: Request, context: Context) => {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean); // ["api","creations",id?,"image"?]
    const user = await currentUser();
    const viewer = user ? { id: user.id, roles: user.roles } : null;

    if (parts.length === 2) {
      if (req.method === "GET") return await list(url, viewer?.id ?? null);
      if (req.method === "POST") return viewer ? await generate(req, context, viewer) : json({ error: "Sign in to create with Arron 🎨" }, 401);
      return json({ error: "Method not allowed" }, 405);
    }

    const id = Number(parts[2]);
    const [row] = Number.isInteger(id) ? await db.select().from(creations).where(eq(creations.id, id)) : [];
    if (!row) return json({ error: "Creation not found." }, 404);

    if (parts[3] === "image" && req.method === "GET") return await serveImage(row, viewer);
    if (!viewer) return unauthorized();
    const owner = row.authorId === viewer.id;

    if (req.method === "POST") {
      const action = str((await readBody(req)).action, 10);
      if (action === "hide" || action === "unhide") {
        if (!isGuardian(viewer.roles)) return json({ error: "Guardians only." }, 403);
        await db.update(creations).set({ hidden: action === "hide" }).where(eq(creations.id, id));
        await logActivity(viewer.id, `creation.${action}`, "creation", id);
        return json({ ok: true });
      }
      if (!owner) return json({ error: "Not your creation." }, 403);
      const shared = action === "share";
      await db.update(creations).set({ shared }).where(eq(creations.id, id));
      await logActivity(viewer.id, shared ? "creation.share" : "creation.unshare", "creation", id);
      return json({ shared });
    }

    if (req.method === "DELETE") {
      if (!owner && !isGuardian(viewer.roles)) return json({ error: "Not your creation." }, 403);
      await db.delete(creations).where(eq(creations.id, id));
      await logActivity(viewer.id, "creation.delete", "creation", id);
      return json({ ok: true });
    }
    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("Creations API error:", error);
    return json({ error: "The canvas flickered — please try again in a moment." }, 500);
  }
};

export const config: Config = {
  path: ["/api/creations", "/api/creations/:id", "/api/creations/:id/:action"],
};
