// ==============================================================
// 🛠️ ARRON PHASE 2 — Tool calling (GPT function-calling path)
// When OPENAI_API_KEY is set, Arron's chat tries ONE round of GPT
// function calling BEFORE the normal provider chain. Three tools:
//   solar_calculator — panels / rails / price estimate (transparent formula)
//   crisis_check     — self-harm/suicide keyword guard → real crisis lines
//   url_fetch        — fetch a URL, return truncated text for context
// If the key is absent, the tool path errors, or the model asks for
// no tool, maybeRunTools returns null and chat falls through to the
// existing GPT→Claude→Gemini→Grok chain UNCHANGED. Tools never
// break chat. Max one round of tool calls to bound latency.
//
// The openai SDK is imported dynamically so this module loads even
// when node_modules is absent (tests mock it); a failed import just
// disables tools.
// ==============================================================

import type { Turn } from "./ai-chain.js";
import { CRISIS_WORDS as SHARED_CRISIS_WORDS } from "./crisis-phrases.js";

export type ToolName = "solar_calculator" | "crisis_check" | "url_fetch";

export const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "solar_calculator",
      description:
        "Estimate a domestic solar PV installation: panel count, rail length and a rough installed price, from system size (kW) and/or roof area (sq m). State assumptions clearly. Use when someone asks about solar panels, how many panels they need, roof size for solar, or solar cost.",
      parameters: {
        type: "object",
        properties: {
          system_kw: { type: "number", description: "Desired system size in kilowatts (kW)." },
          roof_sqm: { type: "number", description: "Available roof area in square metres." },
          country: { type: "string", description: "Country for a rough price adjustment (default: UK)." },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "crisis_check",
      description:
        "Check a message for self-harm or suicide risk. If risk words are present, return real crisis helplines (UK Samaritans 116 123, US/Canada 988, international). Use when a message may express self-harm, suicide, or wanting to die. If no risk, return {crisis:false}.",
      parameters: {
        type: "object",
        properties: {
          message_text: { type: "string", description: "The person's latest message to check." },
        },
        required: ["message_text"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "url_fetch",
      description:
        "Fetch a web page and return its text (truncated) so Arron can answer about it. Use only when the person gives a URL and asks about its content. Fail gracefully.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "The URL to fetch (https only)." },
        },
        required: ["url"],
      },
    },
  },
];

// Crisis lines — mirrors arron-knowledge.json crisisLines + the UK
// signpost in arron.mts, plus 988 (US/Canada) and international.
const CRISIS_LINES_TEXT = `- 999 (UK emergency) — if you are in immediate danger, have hurt yourself, or have taken something.
- Samaritans (UK & Ireland): 116 123 — free, 24/7, for any reason.
- Text SHOUT to 85258 (UK) — free, confidential, text only, 24/7.
- NHS 111, then option 2 (England) — urgent mental-health help.
- Childline (UK): 0800 1111 — free, for children and young people.
- National Domestic Abuse Helpline (UK): 0808 2000 247 — free, 24/7.
- 988 (US & Canada) — Suicide & Crisis Lifeline, call or text, 24/7.
- International: find a helpline near you at https://findahelpline.com/
- Full options on the site: https://pleadingsanity.co.uk/crisis.html`;

// Same shared list as arron.mts: ./crisis-phrases.js (one source of truth, no hand-synced copy).
const CRISIS_WORDS = SHARED_CRISIS_WORDS;

export function openaiToolsEnabled(): boolean {
  // Same guard as ai-chain.ts: if OPENAI_BASE_URL is set, OPENAI_API_KEY is the
  // Netlify gateway credential and must never be sent to api.openai.com.
  return Boolean(process.env.OPENAI_API_KEY) && !process.env.OPENAI_BASE_URL;
}

// ─── Tool executors (pure, testable, never throw) ───────────────

/** Transparent solar estimate. No invented precision. Returns a plain string. */
export function solarCalculator(args: { system_kw?: unknown; roof_sqm?: unknown; country?: unknown }): string {
  const kw = typeof args.system_kw === "number" && Number.isFinite(args.system_kw) && args.system_kw > 0 ? args.system_kw : null;
  const sqm = typeof args.roof_sqm === "number" && Number.isFinite(args.roof_sqm) && args.roof_sqm > 0 ? args.roof_sqm : null;
  const country = typeof args.country === "string" && args.country.trim() ? args.country.trim() : "UK";
  // Assumptions (stated in the result):
  //   panel ≈ 400 W, ≈ 1.9 sq m each → ≈ 0.21 kW per sq m of roof (derate for gaps/mounting)
  //   rails ≈ 1.2 m per panel (two horizontal runs approximated)
  //   installed price ≈ £1,200 / kW in the UK (rough; varies by roof, inverter, battery, region)
  const PANEL_W = 400;
  const SQM_PER_PANEL = 1.9;
  const KW_PER_SQM = PANEL_W / 1000 / SQM_PER_PANEL; // ≈0.21
  const RAILS_M_PER_PANEL = 1.2;
  const GBP_PER_KW = 1200;

  let systemKw = kw;
  let fromRoof = false;
  if (systemKw === null && sqm !== null) {
    systemKw = Math.round(sqm * KW_PER_SQM * 10) / 10;
    fromRoof = true;
  }
  if (systemKw === null) {
    return `To estimate your solar setup, tell me either the system size you want (in kW) or your available roof area (in sq m). A typical UK home is 3–5 kW. Assumptions I use: 400 W panels (~1.9 sq m each), ~1.2 m of rails per panel, and roughly £1,200 per kW installed in the UK. Prices vary a lot by roof type, inverter, battery and region — get three real quotes.`;
  }
  const panels = Math.max(1, Math.ceil((systemKw * 1000) / PANEL_W));
  const railsM = Math.round(panels * RAILS_M_PER_PANEL * 10) / 10;
  const priceGbp = Math.round(systemKw * GBP_PER_KW);
  const roofNeeded = Math.ceil(panels * SQM_PER_PANEL);
  return `Rough solar estimate (${country === "UK" ? "UK" : `priced at UK rates, ${country} may differ`}):
- System size: ~${systemKw} kW${fromRoof ? ` (derived from ${sqm} sq m of roof)` : ""}
- Panels: ~${panels} × 400 W panels
- Roof area needed: ~${roofNeeded} sq m${sqm !== null && !fromRoof ? ` (you have ${sqm} sq m — ${sqm >= roofNeeded ? "that should fit" : "that may be tight; a smaller system may fit better"})` : ""}
- Mounting rails: ~${railsM} m total
- Rough installed price: ~£${priceGbp.toLocaleString("en-GB")} (before battery; battery typically adds £4,000–£7,000)
Assumptions: 400 W panels, ~1.9 sq m each, £1,200/kW typical UK install. This is a ballpark, not a quote — roof type, orientation, inverter, scaffolding and region change the real number. Get three MCS-certified quotes.`;
}

/** Deterministic crisis guard. Returns {crisis, lines?} — never throws. */
export function crisisCheck(messageText: unknown): { crisis: boolean; lines?: string } {
  const text = typeof messageText === "string" ? messageText : "";
  if (!text || !CRISIS_WORDS.test(text)) return { crisis: false };
  return { crisis: true, lines: CRISIS_LINES_TEXT };
}

const MAX_FETCH_REDIRECTS = 3;

function ipv4Blocked(a: number, b: number, c: number, d: number) {
  if ([a, b, c, d].some((n) => n > 255)) return true;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a === 198 && b === 51 && c === 100) return true;
  if (a >= 224) return true;
  return false;
}

/** True for localhost, single-label names, and private or link-local addresses. */
function fetchTargetBlocked(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase().replace(/\.$/, "");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host === "metadata.google.internal" || host === "metadata.google.com") return true;
  if (host.includes(":")) {
    if (host === "::" || host === "::1" || host === "0:0:0:0:0:0:0:1") return true;
    if (host.startsWith("::ffff:")) return fetchTargetBlocked(host.slice("::ffff:".length));
    if (host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) return true;
    return false;
  }
  if (/^\d+$/.test(host) || /^0x[0-9a-f.]+$/i.test(host)) return true;
  const parts = host.split(".");
  if (parts.length >= 1 && parts.length <= 4 && parts.every((part) => /^\d{1,3}$/.test(part))) {
    const nums = parts.map(Number);
    while (nums.length < 4) nums.push(0);
    return ipv4Blocked(nums[0], nums[1], nums[2], nums[3]);
  }
  if (!host.includes(".")) return true;
  return false;
}

async function resolvesToBlockedAddress(hostname: string) {
  if (fetchTargetBlocked(hostname)) return true;
  try {
    const { lookup } = await import("node:dns/promises");
    const looked = await Promise.race([
      lookup(hostname, { all: true, verbatim: true }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 800)),
    ]);
    if (!looked) return false;
    return looked.some((row) => fetchTargetBlocked(row.address));
  } catch {
    return false;
  }
}

/** Fetch a public https URL, return truncated plain text. Never throws. Redirects are capped and re-checked. */
export async function fetchUrl(url: unknown, maxChars = 4000): Promise<{ ok: boolean; text: string; url: string }> {
  const raw = typeof url === "string" ? url.trim() : "";
  if (!/^https:\/\//i.test(raw)) {
    return { ok: false, text: "Only https URLs can be fetched.", url: raw };
  }
  try {
    let current = raw;
    for (let hop = 0; hop <= MAX_FETCH_REDIRECTS; hop++) {
      let parsed: URL;
      try {
        parsed = new URL(current);
      } catch {
        return { ok: false, text: "That URL could not be read.", url: raw };
      }
      if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
        return { ok: false, text: "Only https URLs can be fetched.", url: raw };
      }
      if (await resolvesToBlockedAddress(parsed.hostname)) {
        return { ok: false, text: "That address is not available to fetch.", url: raw };
      }
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      let res: Response;
      try {
        res = await fetch(parsed.toString(), {
          signal: ctrl.signal,
          headers: { "User-Agent": "ArronBot/1.0 (pleadingsanity.co.uk)" },
          redirect: "manual",
        });
      } finally {
        clearTimeout(timer);
      }
      if (res.status >= 300 && res.status < 400) {
        const next = res.headers.get("location");
        if (!next || hop === MAX_FETCH_REDIRECTS) return { ok: false, text: "Too many redirects.", url: raw };
        current = new URL(next, parsed).toString();
        continue;
      }
      if (!res.ok) return { ok: false, text: `Fetch failed: HTTP ${res.status}.`, url: raw };
      const html = await res.text();
      // Crude HTML→text: drop scripts/styles, then tags, then collapse whitespace.
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();
      return { ok: true, text: text.slice(0, maxChars), url: raw };
    }
    return { ok: false, text: "Too many redirects.", url: raw };
  } catch {
    return { ok: false, text: "Could not fetch that page right now (network error or timeout).", url: raw };
  }
}

async function executeTool(name: string, argsJson: string): Promise<string> {
  let args: Record<string, unknown> = {};
  try {
    args = JSON.parse(argsJson || "{}");
  } catch {
    args = {};
  }
  try {
    if (name === "solar_calculator") return solarCalculator(args);
    if (name === "crisis_check") return JSON.stringify(crisisCheck(args.message_text));
    if (name === "url_fetch") {
      const r = await fetchUrl(args.url);
      return JSON.stringify({ ok: r.ok, url: r.url, text: r.text });
    }
    return JSON.stringify({ error: `unknown tool ${name}` });
  } catch (error) {
    return JSON.stringify({ error: error instanceof Error ? error.name : "tool_error" });
  }
}

export type ToolRoundResult = { toolUsed: ToolName; note: string } | null;

/**
 * Try one round of GPT function calling.
 * - Returns null (skip) when: key absent, SDK missing, call fails,
 *   timeout, or the model requests no tool. Chat then uses the chain.
 * - If a tool is called and executed, the result is appended to the
 *   LAST user turn in `turns` (mutated in place) so the existing
 *   chain can produce the final reply with enriched context.
 * This round is an extra paid gpt-4o-mini call. Arron only starts it when the
 * message looks like a solar estimate or an https page. Logs only the tool
 * name and a request tag — never message content.
 */
export async function maybeRunTools(
  system: string,
  turns: Turn[],
  opts: { maxTokens: number; deadline: number; logTag?: string },
): Promise<ToolRoundResult> {
  if (!openaiToolsEnabled()) return null;
  if (!Array.isArray(turns) || turns.length === 0) return null;
  const logTag = opts.logTag ?? "arron";
  let OpenAICtor: typeof import("openai").default | null = null;
  try {
    const mod = await import("openai");
    OpenAICtor = mod.default ?? (mod as unknown as { OpenAI?: typeof import("openai").default }).OpenAI ?? null;
  } catch {
    console.warn(`[arron-tools] openai SDK unavailable (${logTag}); tools skipped`);
    return null;
  }
  if (!OpenAICtor) return null;
  try {
    // openaiToolsEnabled() already refused a gateway key. This client is direct OpenAI only.
    const client = new OpenAICtor({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://api.openai.com/v1",
      timeout: Math.min(8000, Math.max(2000, opts.deadline - Date.now())),
      maxRetries: 0,
    });
    const messages: Array<Record<string, unknown>> = [
      { role: "system", content: system },
      ...turns.map((t) => ({ role: t.role, content: t.content })),
    ];
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // cheap + fast for tool routing; final answer comes from the chain
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      max_tokens: Math.min(200, opts.maxTokens), // routing only; we discard any text
      temperature: 0.2,
    });
    const choice = completion?.choices?.[0];
    const toolCalls = choice?.message?.tool_calls;
    if (!Array.isArray(toolCalls) || toolCalls.length === 0) return null; // no tool → chain answers

    // Execute up to the first tool call (one round, latency-bounded).
    const call = toolCalls[0];
    const name = String(call?.function?.name ?? "");
    const args = String(call?.function?.arguments ?? "{}");
    if (!name) return null;
    const result = await executeTool(name, args);
    // Enrich the last user turn so the chain sees the tool result.
    const last = turns[turns.length - 1];
    last.content = `${last.content}\n\n[TOOL RESULT (${name})]\n${result}`;
    console.log(`[arron-tools] used ${name} (${logTag})`);
    return { toolUsed: name as ToolName, note: `tool ${name} result injected into context` };
  } catch (error) {
    const kind = error instanceof Error ? error.name : "error";
    console.warn(`[arron-tools] tool round failed (${kind}, ${logTag}); falling back to chain`);
    return null;
  }
}
