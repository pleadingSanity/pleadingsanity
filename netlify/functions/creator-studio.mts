// ==============================================================
// CREATOR MUSIC STUDIO API — Shane and members with the creator/admin role only
//   GET    /api/creator-studio                 gate check + storage mode
//   GET    /api/creator-studio/lyrics          lyric drafts (seeded with Shaney C originals)
//   PUT    /api/creator-studio/lyrics          {drafts:[{id,title,body}]}
//   GET    /api/creator-studio/takes           list of saved takes
//   POST   /api/creator-studio/takes           multipart: file, title, kind (dry|polished), beat
//   GET    /api/creator-studio/takes/:id       the take's audio bytes (private, no-store)
//   DELETE /api/creator-studio/takes/:id
//   POST   /api/creator-studio/generate        future paid provider; returns 501 "not configured"
// Auth is the site's existing Netlify Identity session. Takes go to the private Supabase
// Storage bucket "creator-takes" when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set in
// Netlify, otherwise to the private Netlify Blobs store. Keys stay server-side; none in code.
// ==============================================================

import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { allow, slowDown } from "../lib/rate-limit.js";
import { currentUser, json, logReason, readBody, unauthorized } from "../lib/social.js";
import { MAX_TAKE_BYTES, TAKES_BUCKET, checkTake, cleanDrafts, generateStatus, storageMode, studioGate, takeKind } from "../lib/creator-studio-core.js";
import { SEED_DRAFTS } from "../lib/creator-studio-seeds.js";

type Take = { id: string; title: string; kind: string; beat: string; mime: string; bytes: number; storage: string; addedAt: string; by: string };

const store = () => getStore("creator-studio");
const supabaseBase = () => String(process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const supabaseHeaders = (extra: Record<string, string> = {}) => {
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "");
  return { apikey: key, Authorization: `Bearer ${key}`, ...extra };
};
const objectUrl = (id: string) => `${supabaseBase()}/storage/v1/object/${TAKES_BUCKET}/takes/${encodeURIComponent(id)}`;

async function takes(): Promise<Take[]> {
  const raw = (await store().get("takes-index.json", { type: "json" }).catch(() => null)) as { takes?: Take[] } | null;
  return Array.isArray(raw?.takes) ? raw.takes : [];
}
const saveTakes = (list: Take[]) => store().setJSON("takes-index.json", { takes: list });

async function putAudio(id: string, bytes: ArrayBuffer, mime: string, mode: string) {
  if (mode === "supabase") {
    const res = await fetch(objectUrl(id), { method: "POST", headers: supabaseHeaders({ "content-type": mime, "x-upsert": "true" }), body: bytes });
    if (!res.ok) throw new Error(`Supabase storage upload failed (${res.status})`);
    return;
  }
  await store().set(`take-${id}`, bytes, { metadata: { contentType: mime } });
}

async function getAudio(take: Take): Promise<ArrayBuffer | null> {
  if (take.storage === "supabase") {
    const res = await fetch(objectUrl(take.id), { headers: supabaseHeaders() });
    return res.ok ? await res.arrayBuffer() : null;
  }
  return (await store().get(`take-${take.id}`, { type: "arrayBuffer" }).catch(() => null)) as ArrayBuffer | null;
}

async function deleteAudio(take: Take) {
  if (take.storage === "supabase") {
    await fetch(objectUrl(take.id), { method: "DELETE", headers: supabaseHeaders() }).catch(() => null);
    return;
  }
  await store().delete(`take-${take.id}`).catch(() => {});
}

export default async (req: Request, context: Context) => {
  try {
    const user = await currentUser().catch(() => null);
    const gate = studioGate(user);
    if (!gate.ok) return gate.status === 401 ? unauthorized() : json({ error: gate.error, privateStudio: true }, gate.status);

    const parts = new URL(req.url).pathname.split("/").filter(Boolean); // ["api","creator-studio",section?,id?]
    const section = parts[2] ?? "";
    const id = parts[3] ?? "";
    const env = process.env as Record<string, string | undefined>;

    if (!section && req.method === "GET") {
      return json({ ok: true, creator: true, storage: storageMode(env), maxTakeBytes: MAX_TAKE_BYTES, generate: { configured: generateStatus(env).configured } });
    }

    if (section === "lyrics" && req.method === "GET") {
      const saved = (await store().get("lyrics.json", { type: "json" }).catch(() => null)) as { drafts?: unknown } | null;
      const drafts = Array.isArray(saved?.drafts) && saved!.drafts.length ? saved!.drafts : SEED_DRAFTS;
      return json({ drafts, seeded: drafts === SEED_DRAFTS });
    }
    if (section === "lyrics" && req.method === "PUT") {
      if (!(await allow("write", context, user!.id))) return slowDown("Give the vault a minute, then save again.");
      const body = await readBody(req);
      const drafts = cleanDrafts(body.drafts);
      if (!drafts.length) return json({ error: "Nothing to save yet." }, 400);
      await store().setJSON("lyrics.json", { drafts, savedBy: user!.id, savedAt: new Date().toISOString() });
      return json({ ok: true, drafts });
    }

    if (section === "takes" && !id && req.method === "GET") return json({ takes: await takes() });
    if (section === "takes" && !id && req.method === "POST") {
      if (!(await allow("write", context, user!.id))) return slowDown("Give the studio a minute, then save the take again.");
      const form = await req.formData().catch(() => null);
      const file = form?.get("file");
      if (!(file instanceof File)) return json({ error: "No take was attached." }, 400);
      const checked = checkTake(file);
      if (!checked.ok) return json({ error: checked.error }, 400);
      const mode = storageMode(env);
      const take: Take = {
        id: crypto.randomUUID(),
        title: String(form?.get("title") ?? "").replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 80) || "Untitled take",
        kind: takeKind(String(form?.get("kind") ?? "")),
        beat: String(form?.get("beat") ?? "").replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 60),
        mime: checked.type!,
        bytes: file.size,
        storage: mode,
        addedAt: new Date().toISOString(),
        by: user!.id,
      };
      await putAudio(take.id, await file.arrayBuffer(), take.mime, mode);
      const list = await takes();
      list.unshift(take);
      await saveTakes(list.slice(0, 500));
      return json({ ok: true, take }, 201);
    }
    if (section === "takes" && id && req.method === "GET") {
      const take = (await takes()).find((t) => t.id === id);
      if (!take) return json({ error: "No take by that id." }, 404);
      const bytes = await getAudio(take);
      if (!bytes) return json({ error: "That take's audio is missing." }, 404);
      return new Response(bytes, { headers: { "content-type": take.mime, "cache-control": "private, no-store" } });
    }
    if (section === "takes" && id && req.method === "DELETE") {
      const list = await takes();
      const take = list.find((t) => t.id === id);
      if (!take) return json({ error: "No take by that id." }, 404);
      await deleteAudio(take);
      await saveTakes(list.filter((t) => t.id !== id));
      return json({ ok: true });
    }

    if (section === "generate" && req.method === "POST") {
      const status = generateStatus(env);
      return json({ ok: false, configured: status.configured, error: status.error }, status.status);
    }

    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("Creator studio error:", logReason(error));
    return json({ error: "Something went wrong in the studio." }, 500);
  }
};

export const config: Config = {
  path: ["/api/creator-studio", "/api/creator-studio/:section", "/api/creator-studio/:section/:id"],
};
