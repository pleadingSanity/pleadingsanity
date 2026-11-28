// ==============================================================
// 📈 SANITY VIEWS — privacy-first page counter, pure logic (no Netlify
// imports so unit tests run with no dependencies installed).
//
// Stored: total view counts, per-page counts, per-day counts and a
// salted-hash bucket of daily visitor tokens. Never stored: IP
// addresses, user agents, referrers, names, emails or cookies.
// The client token is a random id in localStorage; the server keeps
// only a SHA-256 salted hash, rotated daily and trimmed after 42 days.
// ==============================================================

export const MAX_DAYS = 42;
export const MAX_PATH_LENGTH = 120;

const BLOCKED_PREFIXES = [
  "/api/",
  "/netlify/",
  "/admin",
  "/data/",
  "/assets/",
  "/images/",
  "/css/",
  "/js/",
  "/fonts/",
  "/media/",
  "/uploads/",
  "/db/",
  "/scripts/",
  "/tmp/",
];

const BLOCKED_FILE_SUFFIXES = [
  "/sw.js",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  ".webmanifest",
  ".json",
  ".xml",
  ".svg",
];

export function emptyStats() {
  return { total: 0, pages: {}, days: {}, updatedAt: null };
}

export function dayStamp(now = new Date()) {
  const d = now instanceof Date ? now : new Date(now);
  return d.toISOString().slice(0, 10);
}

/**
 * Normalise a client-reported pathname. Null for anything that is
 * not a same-site public page (assets, APIs, data files, traversal).
 * @param {unknown} input
 * @returns {string|null}
 */
export function normalizePath(input) {
  if (typeof input !== "string") return null;
  let raw = input.trim();
  if (!raw || raw.length > MAX_PATH_LENGTH) return null;
  raw = raw.split("?")[0].split("#")[0];
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  try {
    raw = decodeURIComponent(raw);
  } catch {
    return null;
  }
  if (raw.includes("%")) return null;
  if (/[<>\\\s]/.test(raw)) return null;
  const lower = raw.toLowerCase();
  for (const prefix of BLOCKED_PREFIXES) if (lower.startsWith(prefix)) return null;
  for (const suffix of BLOCKED_FILE_SUFFIXES) if (lower.endsWith(suffix)) return null;
  if (lower.includes("/.")) return null;
  if (lower.split("/").some((seg) => seg === "..")) return null;
  if (!/^[a-z0-9/_.-]*$/.test(lower)) return null;
  let path = lower.replace(/\/{2,}/g, "/");
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path || "/";
}

/** Trim day buckets older than MAX_DAYS. Lifetime `total` never decays. */
export function trimOldDays(stats, now = new Date()) {
  const keep = new Set();
  const today = dayStamp(now);
  for (let i = 0; i < MAX_DAYS; i += 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    keep.add(dayStamp(d));
  }
  for (const date of Object.keys(stats.days)) {
    if (!keep.has(date) || date > today) delete stats.days[date];
  }
  return stats;
}

/**
 * Record one hit. `visitorHash` is pre-hashed; null = anonymous.
 * @param {ReturnType<typeof emptyStats>} stats
 * @param {string} path
 * @param {string|null} visitorHash
 */
export function recordHit(stats, path, visitorHash, now = new Date()) {
  const day = dayStamp(now);
  stats.total += 1;

  const page = (stats.pages[path] ||= { views: 0, unique: [] });
  page.views += 1;
  if (visitorHash && !page.unique.includes(visitorHash)) page.unique.push(visitorHash);

  const bucket = (stats.days[day] ||= { total: 0, unique: [] });
  bucket.total += 1;
  if (visitorHash && !bucket.unique.includes(visitorHash)) bucket.unique.push(visitorHash);

  stats.updatedAt = new Date(now).toISOString();
  return trimOldDays(stats, now instanceof Date ? now : new Date(now));
}

export function topPages(stats, limit = 10) {
  return Object.entries(stats.pages)
    .map(([path, p]) => ({ path, views: p.views, unique: p.unique.length }))
    .sort((a, b) => b.views - a.views || a.path.localeCompare(b.path))
    .slice(0, limit);
}

export function publicView(stats, now = new Date()) {
  const today = dayStamp(now);
  const bucket = stats.days[today] || { total: 0, unique: [] };
  return {
    total: stats.total,
    today: bucket.total,
    todayUnique: bucket.unique.length,
    pages: topPages(stats, 10),
    updatedAt: stats.updatedAt,
  };
}
