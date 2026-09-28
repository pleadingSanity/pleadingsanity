// ==============================================================
// 🖼️ POST IMAGES — stored in Netlify Blobs
//   POST /api/images            multipart "image" → { key, url }
//   GET  /api/images/:user/:id  serve the image
// Only signed-in members can upload or view. Max 5 MB, images only.
// ==============================================================

import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { currentUser, json, logActivity, unauthorized } from "../lib/social.js";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default async (req: Request) => {
  try {
    const user = await currentUser();
    if (!user) return unauthorized();
    const store = getStore("post-images");
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/api/images") {
      const form = await req.formData().catch(() => null);
      const file = form?.get("image");
      if (!(file instanceof File)) return json({ error: "No image received." }, 400);
      if (!TYPES.includes(file.type)) return json({ error: "Please choose a JPG, PNG, WebP or GIF." }, 400);
      if (file.size > MAX_BYTES) return json({ error: "Images must be under 5 MB." }, 400);

      const key = `${user.id}/${crypto.randomUUID()}`;
      await store.set(key, await file.arrayBuffer(), {
        metadata: { contentType: file.type, owner: user.id, uploadedAt: Date.now() },
      });
      await logActivity(user.id, "image.upload", "image", key);
      return json({ key, url: `/api/images/${key}` }, 201);
    }

    if (req.method === "GET") {
      const key = url.pathname.replace("/api/images/", "");
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
  path: ["/api/images", "/api/images/:user/:id"],
};
