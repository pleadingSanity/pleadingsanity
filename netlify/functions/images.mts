// ==============================================================
// 🖼️ POST IMAGES — stored in Netlify Blobs
//   POST /api/images            multipart "image" → { key, url }
//   GET  /api/images/:user/:id  serve the image
// Only signed-in members can upload. Max 5 MB images, 8 MB video.
// Serving follows the thing the file belongs to: an image on a friends-only
// or private post, or on an unshared creation, is only served to people who
// could see that post or creation. Avatars and banners have no post and are
// served to anyone holding their unguessable link, as before.
// ==============================================================

import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { creations, posts } from "../../db/schema.js";
import { areFriends, currentUser, isBlockedEitherWay, isGuardian, isOwner, json, logActivity, optionalUser, unauthorized } from "../lib/social.js";

type Viewer = { id: string; roles: string[] } | null;

// Same rules as the feed (posts.mts canView), for one viewer who may be a guest.
async function canSeePost(p: typeof posts.$inferSelect, viewer: Viewer) {
  if (viewer && p.authorId === viewer.id) return true;
  if (p.hidden) return isGuardian(viewer?.roles);
  if (p.status !== "live") return Boolean(viewer && (isOwner(viewer.roles) || isGuardian(viewer.roles)));
  if (p.visibility === "public") return !viewer || !(await isBlockedEitherWay(viewer.id, p.authorId));
  if (!viewer || p.visibility === "private") return false;
  if (await isBlockedEitherWay(viewer.id, p.authorId)) return false;
  return p.visibility === "members" || areFriends(viewer.id, p.authorId);
}

async function mayServe(key: string): Promise<boolean> {
  const [usedBy, made] = await Promise.all([
    db.select().from(posts).where(eq(posts.imageKey, key)).limit(5),
    db.select().from(creations).where(eq(creations.imageKey, key)).limit(5),
  ]);
  if (!usedBy.length && !made.length) return true; // avatar, banner or a fresh upload
  const viewer = await optionalUser();
  for (const c of made) if ((c.shared && !c.hidden) || c.authorId === viewer?.id || isGuardian(viewer?.roles)) return true;
  for (const p of usedBy) if (await canSeePost(p, viewer)) return true;
  return false;
}

const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_VIDEO = 8 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];
const TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];

export default async (req: Request) => {
  try {
    const store = getStore("post-images");
    const url = new URL(req.url);
    const user = req.method === "GET" ? null : await currentUser();
    if (req.method !== "GET" && !user) return unauthorized();

    if (req.method === "POST" && url.pathname === "/api/images/banner") {
      const form = await req.formData().catch(() => null);
      const file = form?.get("image");
      if (!(file instanceof File)) return json({ error: "No image received." }, 400);
      if (!IMAGE_TYPES.includes(file.type)) return json({ error: "Backgrounds are JPG, PNG, WebP or GIF." }, 400);
      if (file.size > MAX_IMAGE) return json({ error: "Backgrounds must be under 5 MB." }, 400);
      if (!user) return unauthorized();
      const key = `banner/${user.id}`;
      await store.set(key, await file.arrayBuffer(), {
        metadata: { contentType: file.type, owner: user.id, uploadedAt: Date.now() },
      });
      return json({ key, url: `/api/images/banner/${user.id}` }, 201);
    }

    if (req.method === "POST" && url.pathname === "/api/images") {
      const form = await req.formData().catch(() => null);
      const file = form?.get("image");
      if (!(file instanceof File)) return json({ error: "No file received." }, 400);
      if (!TYPES.includes(file.type)) return json({ error: "Use a JPG, PNG, WebP, GIF, MP4 or WebM." }, 400);
      const max = VIDEO_TYPES.includes(file.type) ? MAX_VIDEO : MAX_IMAGE;
      if (file.size > max) return json({ error: VIDEO_TYPES.includes(file.type) ? "Videos must be under 8 MB so the house stays free." : "Images must be under 5 MB." }, 400);

      if (!user) return unauthorized();
      const key = `${user.id}/${crypto.randomUUID()}`;
      await store.set(key, await file.arrayBuffer(), {
        metadata: { contentType: file.type, owner: user.id, uploadedAt: Date.now() },
      });
      await logActivity(user.id, "image.upload", "image", key);
      return json({ key, url: `/api/images/${key}` }, 201);
    }

    if (req.method === "GET") {
      const key = decodeURIComponent(url.pathname.replace("/api/images/", ""));
      if (!key.startsWith("banner/") && !(await mayServe(key))) return new Response("Not found", { status: 404 });
      const entry = await store.getWithMetadata(key, { type: "arrayBuffer" });
      if (!entry) return new Response("Not found", { status: 404 });
      const type = typeof entry.metadata.contentType === "string" ? entry.metadata.contentType : "image/jpeg";
      return new Response(entry.data, {
        headers: {
          "Content-Type": type,
          "Cache-Control": "private, max-age=86400",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("Images API error:", (error as Error)?.name || "error");
    return json({ error: "Upload failed. Please try again." }, 500);
  }
};

export const config: Config = {
  path: ["/api/images", "/api/images/banner", "/api/images/:user/:id"],
};
