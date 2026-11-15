// Pleading Sanity Music rules. No database and no invented tracks.

export const AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/wave", "audio/x-wav", "audio/ogg", "audio/webm", "audio/mp4", "audio/aac"];
export const MAX_AUDIO_BYTES = 4_500_000;
export const EMPTY_NOTE = "No owner songs are in the library yet. Shane adds them from the Creators hub. This player does not invent tracks or play other people's music.";

export function uploadDecision(user) {
  if (!user) return { ok: false, status: 401, error: "Please sign in first." };
  if (!user.isOwner) return { ok: false, status: 403, error: "Only Shane can add songs." };
  return { ok: true, status: 200 };
}

export function cleanTitle(value, fallback = "") {
  const text = String(value ?? "").replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 80);
  return text || fallback;
}

export function checkAudio(file) {
  if (!file || typeof file.size !== "number") return { ok: false, error: "Choose a song file first." };
  const type = String(file.type || "").toLowerCase();
  if (!AUDIO_TYPES.includes(type)) return { ok: false, error: "Use an MP3, WAV, OGG, M4A or WebM file." };
  if (file.size < 1000) return { ok: false, error: "That file looks empty." };
  if (file.size > MAX_AUDIO_BYTES) return { ok: false, error: "Songs must be under 4.5 MB." };
  return { ok: true };
}

export function nextIndex(index, length, mode, rng) {
  if (length <= 0) return -1;
  const repeat = mode.repeat || "off";
  if (repeat === "one") return index < 0 ? 0 : index;
  if (mode.shuffle && length > 1) {
    let pick = index;
    for (let n = 0; n < 6 && pick === index; n += 1) pick = Math.floor(rng() * length);
    return pick;
  }
  const next = index + 1;
  if (next < length) return next;
  return repeat === "all" ? 0 : -1;
}

export function previousIndex(index, length, repeat) {
  if (length <= 0) return -1;
  if (index > 0) return index - 1;
  if (repeat === "all") return length - 1;
  return 0;
}

export function sessionArtwork(origin) {
  const root = String(origin || "").replace(/\/$/, "");
  return [{ src: `${root}/assets/images/brand/crying-brain-logo-512.webp`, sizes: "512x512", type: "image/webp" }];
}
