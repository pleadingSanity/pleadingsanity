// ==============================================================
// 📈 /api/views — privacy-first public page counter
//   GET  /api/views  → totals + top pages (no personal data)
//   POST /api/views  { path, v } → one beacon; v is an optional
//                     random anonymous id from localStorage.
// Persists small JSON in Netlify Blobs. No IP, UA, referrer, cookie or
// account data is read or stored. Anonymous still counts as a view.
// ==============================================================

import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { allow } from "../lib/rate-limit.js";
import { emptyStats, normalizePath, publicView, recordHit } from "../lib/views.js";

const STORE = "site-views";
const KEY = "stats.v1.json";
const MAX_BODY = 1024;

export const config: Config = { path: ["/api/views"] };

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=10",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

async function hashId(raw: string): Promise<string> {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`pleading-sanity-views:${raw}`),
  );
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

async function readStats() {
  const store = getStore(STORE);
  const entry = await store.getWithMetadata(KEY, { type: "arrayBuffer" });
  if (!entry?.data) return emptyStats();
  try {
    const parsed = JSON.parse(new TextDecoder().decode(entry.data));
    if (parsed && typeof parsed.total === "number" && parsed.pages && parsed.days) return parsed;
    return emptyStats();
  } catch {
    return emptyStats();
  }
}

export default async (req: Request, context: Context) => {
  try {
    const store = getStore(STORE);

    if (req.method === "GET") {
      const stats = await readStats();
      return json(publicView(stats));
    }

    if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

    if (!(await allow("views", context))) {
      return json({ ok: false, reason: "Slow down a moment and try again." }, 429);
    }

    const bodyText = await req.text();
    if (bodyText.length > MAX_BODY) return json({ ok: false, reason: "Payload too large." }, 413);
    const body: unknown = JSON.parse(bodyText || "{}");
    const path = normalizePath((body as { path?: unknown })?.path);
    if (!path) return json({ ok: false, reason: "Unknown page." }, 400);

    const rawVid = (body as { v?: unknown })?.v;
    let visitorHash: string | null = null;
    if (typeof rawVid === "string" && /^[A-Za-z0-9-]{8,64}$/.test(rawVid)) {
      visitorHash = await hashId(rawVid);
    }

    const stats = recordHit(await readStats(), path, visitorHash);
    await store.set(KEY, JSON.stringify(stats), {
      metadata: { contentType: "application/json", updatedAt: stats.updatedAt ?? new Date().toISOString() },
    });
    const view = publicView(stats);
    return json({ ok: true, total: view.total, today: view.today }, 202);
  } catch (error) {
    console.error("views API error:", error instanceof Error ? error.message : "error");
    // Never break a page load because the counter hiccupped.
    return json({ ok: false, reason: "Counter unavailable." }, 200);
  }
};
