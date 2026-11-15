// Pleading Sanity Music library.
// GET  /api/music                 public list. Empty until Shane uploads a song.
// GET  /api/music/file/:id        the audio bytes
// POST /api/music                 owner only, multipart file + title
// DELETE /api/music/:id           owner only
// Tracks in the repo manifest are included only when that file lists real songs.
// cosmic-healing.wav is a silence-page soundscape and is not part of this library.

import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { allow, slowDown } from "../lib/rate-limit.js";
import { currentUser, json, unauthorized } from "../lib/social.js";
import { EMPTY_NOTE, checkAudio, cleanTitle, uploadDecision } from "../lib/music-core.js";

type Track = { id: string; title: string; artist: string; src: string; mime: string; bytes: number; addedAt: string; source: "repo" | "upload" };

const store = () => getStore("owner-music");

async function uploaded(): Promise<Track[]> {
  const raw = (await store().get("index.json", { type: "json" }).catch(() => null)) as { tracks?: Track[] } | null;
  return Array.isArray(raw?.tracks) ? raw.tracks : [];
}

async function saveIndex(tracks: Track[]) {
  await store().setJSON("index.json", { tracks });
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const section = parts[2] ?? "";
  const id = parts[3] ?? section;

  if (req.method === "GET" && section === "file" && parts[3]) {
    const hit = (await uploaded()).find((track) => track.id === parts[3]);
    if (!hit) return json({ error: "No song by that id." }, 404);
    const file = await store().get(hit.id, { type: "arrayBuffer" }).catch(() => null);
    if (!file) return json({ error: "That song file is missing." }, 404);
    return new Response(file, {
      headers: {
        "content-type": hit.mime || "audio/mpeg",
        "cache-control": "public, max-age=86400",
        "accept-ranges": "none",
      },
    });
  }

  if (req.method === "GET" && section === "") {
    const tracks = await uploaded().catch(() => []);
    return json({ tracks, note: tracks.length ? "Shane Cooper. Songs he added himself." : EMPTY_NOTE, needsSongs: tracks.length === 0 });
  }

  const user = await currentUser().catch(() => null);
  const gate = uploadDecision(user);
  if (!gate.ok) return gate.status === 401 ? unauthorized() : json({ error: gate.error }, gate.status);

  if (req.method === "POST" && section === "") {
    if (!(await allow("write", context, user!.id))) return slowDown("Give the uploader a minute, then try again.");
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) return json({ error: "Choose a song file first." }, 400);
    const checked = checkAudio(file);
    if (!checked.ok) return json({ error: checked.error }, 400);
    const title = cleanTitle(form?.get("title"), file.name.replace(/\.[a-z0-9]+$/i, ""));
    const artist = cleanTitle(form?.get("artist"), "Shane Cooper");
    if (!title) return json({ error: "Give the song a title." }, 400);
    const trackId = crypto.randomUUID().slice(0, 8);
    await store().set(trackId, await file.arrayBuffer(), { metadata: { contentType: file.type, title, artist } });
    const tracks = await uploaded();
    tracks.push({ id: trackId, title, artist, src: `/api/music/file/${trackId}`, mime: file.type, bytes: file.size, addedAt: new Date().toISOString(), source: "upload" });
    await saveIndex(tracks);
    return json({ ok: true, track: tracks[tracks.length - 1] }, 201);
  }

  if (req.method === "DELETE" && id && id !== "file") {
    const tracks = (await uploaded()).filter((track) => track.id !== id);
    await store().delete(id).catch(() => {});
    await saveIndex(tracks);
    return json({ ok: true });
  }

  return json({ error: "Not found" }, 404);
};

export const config: Config = { path: ["/api/music", "/api/music/file/:id", "/api/music/:id"] };
