// Read-only public search of the knowledge mirror.
// GET or POST /api/kb/search. No auth: the corpus is public-safe repo text.
// This does not connect any external AI. It does not return embeddings or private rows.
import type { Config, Context } from "@netlify/functions";
import { allow, slowDown } from "../lib/rate-limit.js";
import { kbConfigured, queryIsPublic, searchPublic } from "../lib/kb-retrieve.js";

const NOTE = "Repository files are the source of truth. This endpoint is a public searchable mirror of those files. It does not connect any AI permanently.";
const BRANDS = new Set(["pleading-sanity", "insane-solar", "sanity-law", "shared"]);

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export default async (req: Request, context: Context) => {
  if (req.method !== "GET" && req.method !== "POST") return json({ error: "GET or POST" }, 405);
  if (!(await allow("views", context))) return slowDown("The knowledge mirror needs a minute. Try again shortly.");

  let rawQuery = "";
  let brand: string | null = null;
  let matchCount = 5;
  if (req.method === "GET") {
    const url = new URL(req.url);
    rawQuery = url.searchParams.get("q") || "";
    brand = url.searchParams.get("brand");
    matchCount = Number(url.searchParams.get("k") || 5);
  } else {
    let body: { q?: unknown; query?: unknown; brand?: unknown; k?: unknown } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    rawQuery = typeof body.q === "string" ? body.q : typeof body.query === "string" ? body.query : "";
    brand = typeof body.brand === "string" ? body.brand : null;
    matchCount = Number(body.k || 5);
  }

  if (brand && !BRANDS.has(brand)) return json({ error: "Unknown brand" }, 400);
  if (rawQuery.trim() && !queryIsPublic(rawQuery.slice(0, 2000))) return json({ error: "That query cannot be searched." }, 400);
  if (!kbConfigured()) return json({ ok: false, configured: false, results: [], facts: [], note: NOTE }, 503);

  const query = rawQuery.trim().slice(0, 500);
  const k = Number.isFinite(matchCount) ? Math.min(8, Math.max(1, Math.floor(matchCount))) : 5;
  const found = await searchPublic(query, brand, { matchCount: k });
  return json({
    ok: true,
    configured: true,
    brand: found.brand,
    mirror: found.mirror,
    facts: found.facts,
    results: found.results,
    note: NOTE,
  });
};

export const config: Config = { path: "/api/kb/search" };
