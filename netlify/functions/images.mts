// ==============================================================
// 🖼️ POST IMAGES — stored in Netlify Blobs
//   POST /api/images            multipart "image" → { key, url }
//   GET  /api/images/:user/:id  serve the image
// Only signed-in members can upload or view. Max 5 MB, images only.
// ==============================================================

import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { currentUser, json, logActivity, unauthorized, areFriends, isBlockedEitherWay } from "../lib/social.js";
import { db } from "../../db/index.js";
import { posts } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_VIDEO = 8 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];
const TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];

export default async (req: Request) => {
  try {
    const store = getStore("post-images");
    const url = new URL(req.url);
    const user = await currentUser();
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
      // Deny access by default. A blob URL is not proof that a viewer may read it.
      if (!user) return unauthorized();
      if (key.startsWith("banner/")) {
        const ownerId = key.slice("banner/".length);
        if (!ownerId || ownerId !== user.id) return new Response("Not found", { status: 404 });
      } else {
        const ownerId = key.split("/")[0];
        if (!ownerId || !key.startsWith(ownerId + "/")) return new Response("Not found", { status: 404 });
        if (ownerId !== user.id) {
          const rows = await db.select({
            authorId: posts.authorId, visibility: posts.visibility, status: posts.status, hidden: posts.hidden,
          }).from(posts).where(eq(posts.imageKey, key)).limit(10);
          let allowed = false;
          for (const post of rows) {
            if (post.authorId !== ownerId || post.status !== "live" || post.hidden) continue;
            if (await isBlockedEitherWay(user.id, ownerId)) continue;
            if (post.visibility === "public" || post.visibility === "members") allowed = true;
            if (post.visibility === "friends" && await areFriends(user.id, ownerId)) allowed = true;
          }
          if (!allowed) return new Response("Not found", { status: 404 });
        }
      }
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
    console.error("Images API error:", error);
    return json({ error: "Upload failed. Please try again." }, 500);
  }
};

export const config: Config = {
  path: ["/api/images", "/api/images/banner", "/api/images/:user/:id"],
};
