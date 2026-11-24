// First-party Core Web Vitals collector.
// Accepts LCP, INP, CLS only. No cookies, no user id, no third party.
import type { Config } from "@netlify/functions";

type Sample = { name: string; value: number; rating: string; path: string; at: string };
const ALLOWED = new Set(["LCP", "INP", "CLS"]);
const MAX = 200;
const samples: Sample[] = [];

const rating = (name: string, value: number) => {
  if (name === "LCP") return value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor";
  if (name === "INP") return value <= 200 ? "good" : value <= 500 ? "needs-improvement" : "poor";
  if (name === "CLS") return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor";
  return "unknown";
};

const summary = () => {
  const out: Record<string, { count: number; p75: number | null; good: number }> = {};
  for (const name of ALLOWED) {
    const vals = samples.filter((s) => s.name === name).map((s) => s.value).sort((a, b) => a - b);
    const p75 = vals.length ? vals[Math.min(vals.length - 1, Math.floor(vals.length * 0.75))] : null;
    out[name] = { count: vals.length, p75, good: samples.filter((s) => s.name === name && s.rating === "good").length };
  }
  return { ok: true, samples: samples.length, metrics: out, note: "This instance only. No cookies. No user id." };
};

export default async (req: Request) => {
  if (req.method === "GET") return Response.json(summary());
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  let body: { name?: string; value?: number; path?: string };
  try { body = await req.json(); } catch { return new Response("Bad JSON", { status: 400 }); }
  const name = String(body.name || "").toUpperCase();
  const value = Number(body.value);
  if (!ALLOWED.has(name) || !Number.isFinite(value) || value < 0) {
    return new Response("Bad sample", { status: 400 });
  }
  samples.push({
    name,
    value: name === "CLS" ? Math.round(value * 1000) / 1000 : Math.round(value),
    rating: rating(name, value),
    path: String(body.path || "/").slice(0, 80),
    at: new Date().toISOString(),
  });
  if (samples.length > MAX) samples.splice(0, samples.length - MAX);
  return Response.json({ ok: true });
};

export const config: Config = { path: "/api/vitals" };
