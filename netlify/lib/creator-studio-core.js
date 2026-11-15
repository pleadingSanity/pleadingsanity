// Creator Music Studio rules. Pure functions so the gate can be tested without a network.
// Who may enter: the verified Owner (Shane) and members holding the creator or admin role.
// Roles come from the existing Netlify Identity session (see netlify/lib/social.ts).
// No keys live here. Storage and provider keys are read from env vars by the function only.

export const TAKE_TYPES = ["audio/webm", "audio/ogg", "audio/wav", "audio/wave", "audio/x-wav", "audio/mp4", "audio/mpeg", "audio/aac"];
export const MAX_TAKE_BYTES = 4_500_000;
export const MAX_DRAFTS = 60;
export const MAX_LYRIC_CHARS = 20_000;
export const TAKE_KINDS = ["dry", "polished", "mix"];
export const TAKES_BUCKET = "creator-takes";

export const PRIVATE_NOTE = "This is a private studio for the Pleading Sanity creator team. Ask Shane if you think you should have a key.";

export function isStudioCreator(user) {
  if (!user) return false;
  if (user.isOwner === true) return true;
  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles.includes("owner") || roles.includes("creator") || roles.includes("admin");
}

export function studioGate(user) {
  if (!user) return { ok: false, status: 401, error: "Please sign in first." };
  if (!isStudioCreator(user)) return { ok: false, status: 403, error: PRIVATE_NOTE };
  return { ok: true, status: 200 };
}

const clean = (value, max) => String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, max);

export function cleanDrafts(input) {
  if (!Array.isArray(input)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of input.slice(0, MAX_DRAFTS)) {
    const id = clean(raw?.id, 40).replace(/[^a-z0-9-]/gi, "") || "draft-" + (out.length + 1);
    if (seen.has(id)) continue;
    seen.add(id);
    const title = clean(raw?.title, 100).trim() || "Untitled draft";
    out.push({ id, title, body: clean(raw?.body, MAX_LYRIC_CHARS), updatedAt: new Date().toISOString() });
  }
  return out;
}

export function checkTake(file) {
  if (!file || typeof file.size !== "number") return { ok: false, error: "No take was attached." };
  const type = String(file.type || "").toLowerCase().split(";")[0].trim();
  if (!TAKE_TYPES.includes(type)) return { ok: false, error: "Takes must be WebM, OGG, WAV, M4A or MP3 audio." };
  if (file.size < 500) return { ok: false, error: "That take looks empty." };
  if (file.size > MAX_TAKE_BYTES) return { ok: false, error: "Takes must be under 4.5 MB. Download longer takes to your device." };
  return { ok: true, type };
}

export const takeKind = (value) => (TAKE_KINDS.includes(value) ? value : "dry");

// Supabase Storage is used only when both server-side env vars exist; otherwise takes stay in
// the site's private Netlify Blobs store. Either way nothing is public and no key reaches the browser.
export function storageMode(env = {}) {
  return env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY ? "supabase" : "netlify-blobs";
}

// Track generation is a future paid provider (Runway or fal). It stays off until Shane says yes
// and a key is set in Netlify. Even with a key, this build makes no paid call.
export function generateStatus(env = {}) {
  const provider = String(env.MUSIC_GEN_PROVIDER || "").toLowerCase();
  const key = provider === "fal" ? env.FAL_KEY : provider === "runway" ? env.RUNWAYML_API_SECRET : "";
  if (!provider || !key) {
    return { configured: false, status: 501, error: "Track generation is not configured. Shane picks a provider (Runway or fal) and adds its key in Netlify first." };
  }
  return { configured: true, provider, status: 501, error: "A provider key is set, but the paid generation call is not wired yet. Nothing was charged." };
}
