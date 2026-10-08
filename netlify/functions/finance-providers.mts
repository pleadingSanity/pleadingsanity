// ==============================================================
// THE SANE FINANCE GBT — PROVIDER FEED + FCA REGISTER LOOKUP
// Never invents a lender. Never fakes a rate.
//
// GET /api/finance-providers
//   Returns verified provider records ONLY from a connected, licensed feed
//   (FINANCE_PROVIDER_FEED_URL). With no feed: { connected: false }.
//   Every record is validated with the same rules the page uses; stale,
//   incomplete or malformed records are dropped and counted, never shown.
//
// GET /api/finance-providers?frn=123456
//   Looks a firm up on the official FCA Register API (free key from
//   register.fca.org.uk — FCA_REGISTER_EMAIL + FCA_REGISTER_KEY).
//   With no key: { connected: false } and the public register link.
// ==============================================================
import type { Config, Context } from "@netlify/functions";
import { validateProvider } from "../../js/finance-engine.js";
import { allow, slowDown } from "../lib/rate-limit.js";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

const REGISTER = "https://register.fca.org.uk/s/";

async function getJSON(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, { headers: { accept: "application/json", ...headers }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fcaLookup(frn: string) {
  const email = Netlify.env.get("FCA_REGISTER_EMAIL");
  const key = Netlify.env.get("FCA_REGISTER_KEY");
  if (!email || !key) {
    return { connected: false, message: "FCA Register lookup not connected. Check the firm yourself on the official register.", register: REGISTER };
  }
  try {
    const data: any = await getJSON(`https://register.fca.org.uk/services/V0.1/Firm/${frn}`, { "X-Auth-Email": email, "X-Auth-Key": key });
    const firm = Array.isArray(data?.Data) ? data.Data[0] : null;
    if (!firm) return { connected: true, found: false, frn, message: "No firm found with that reference on the FCA Register.", register: REGISTER };
    return {
      connected: true, found: true, frn, checkedAt: new Date().toISOString(),
      name: String(firm["Organisation Name"] ?? "").slice(0, 200),
      status: String(firm["Status"] ?? "").slice(0, 100),
      type: String(firm["Business Type"] ?? "").slice(0, 100),
      source: "FCA Register API", register: REGISTER,
    };
  } catch (error) {
    console.warn("FCA Register lookup unavailable:", error instanceof Error ? error.message : "error");
    return { connected: false, message: "The FCA Register could not be reached just now. Check the firm on the official register.", register: REGISTER };
  }
}

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") return json({ error: "GET only" }, 405);
  if (!(await allow("views", context))) return slowDown();
  const url = new URL(req.url);
  const frn = url.searchParams.get("frn");
  if (frn !== null) {
    if (!/^\d{6,7}$/.test(frn)) return json({ error: "An FCA reference number is 6 or 7 digits." }, 400);
    return json(await fcaLookup(frn));
  }

  const feed = Netlify.env.get("FINANCE_PROVIDER_FEED_URL");
  if (!feed) {
    return json({ connected: false, providers: [], message: "Live provider data not connected.", reviews: { connected: false, message: "Review feed not connected." } });
  }
  try {
    const data: any = await getJSON(feed);
    const records = Array.isArray(data?.providers) ? data.providers.slice(0, 500) : [];
    const checked = records.map((r: unknown) => validateProvider(r));
    const providers = checked.filter((c: any) => c.ok).map((c: any) => ({ ...c.provider, age_days: c.ageDays }));
    const dropped = checked.reduce((acc: Record<string, number>, c: any) => (c.ok ? acc : { ...acc, [c.status]: (acc[c.status] || 0) + 1 }), {});
    return json({
      connected: true, source: String(data?.source ?? "Connected provider feed").slice(0, 200), fetchedAt: new Date().toISOString(),
      providers, dropped,
      message: providers.length ? null : "The provider feed is connected but has no current, verified records.",
      reviews: data?.reviews_connected ? { connected: true } : { connected: false, message: "Review feed not connected." },
    });
  } catch (error) {
    console.warn("Provider feed unavailable:", error instanceof Error ? error.message : "error");
    return json({ connected: false, providers: [], message: "Live provider data not connected. The feed could not be reached." });
  }
};

export const config: Config = { path: "/api/finance-providers" };
