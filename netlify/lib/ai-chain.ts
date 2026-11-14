// ==============================================================
// 🔗 THE AI CHAIN — GPT → Claude → Gemini → Grok → [future models]
// One shared failover used by Arron, the Blueprint Studio and
// Write for Site. Tried in order; the first lab that answers wins.
// The chain lives in the soul file (/arron-knowledge.json →
// covenant.chain): welcoming a new model is one JSON block there.
// NOTE: the soul file OVERRIDES the fallback list below, so the order
// in covenant.chain must also be GPT, Claude, Gemini, Grok.
// Claude, GPT and the first Gemini hop go through Netlify AI Gateway — no keys in code.
// If that Gemini hop times out, comes back empty, or errors, one more try uses
// GEMINI_DIRECT_MODEL (gemini-3.5-flash-lite). That try reads GEMINI_API_KEY (or ARRON_GEMINI_KEY) from the environment. The key
// is never written here. While GOOGLE_GEMINI_BASE_URL is set, that retry stays
// on the gateway. A real owner key replaces the gateway injection, so the retry
// then calls Google directly. Grok talks to xAI directly. The live site stores the key as GROK_API_KEY,
// and an older copy as xAI_KEY. Either name is enough. No key is written here.
// If neither name is set, he sits this one out.
// KEY DROP-IN: every lab also reads ARRON_<LAB>_KEY first (ARRON_OPENAI_KEY, ARRON_ANTHROPIC_KEY,
// ARRON_GEMINI_KEY, ARRON_GROK_KEY, ARRON_OPENROUTER_KEY). The full name lists are in ./provider-config.js.
// COST GUARDS: no hidden SDK retries (the chain itself is the retry), one hard
// deadline for the whole walk, a cap on how much history is sent, and a daily
// admission counter (../lib/rate-limit.ts). Spending money is never switched on by profit.
// ==============================================================

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { SOUL } from "./arron-knowledge.js";
import { allowToday } from "./rate-limit.js";
import {
  GEMINI_DIRECT_MODEL,
  GEMINI_GOOGLE_BASE,
  GEMINI_STEP_MS,
  geminiDirectRequest,
  readGeminiKey,
  walkProviders,
} from "./provider-fallback.js";
import {
  CURRENT_MODELS,
  GROK_SECOND_MODEL,
  chooseModel,
  failureTag,
  keySources,
  providerStatusSnapshot,
  recordProviderStatus,
  resolveKey,
} from "./provider-config.js";

// Every lab gets at most 4.5s. A timeout steps down to the next mind. No single point of failure.
const LAB_TIMEOUT_MS = GEMINI_STEP_MS;
// An attempt is not started with less than this left: it would only bill and then be cut off.
const MIN_ATTEMPT_MS = 2_500;
// maxRetries 0 everywhere: an SDK retry is a second paid call the chain cannot see, and on an
// exhausted quota (HTTP 429) it only repeats the failure. Failover to the next mind is the retry.
// Keys come from ./provider-config.js (ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, GROK_API_KEY and their aliases).
// A drop-in ARRON_* key always goes straight to the lab, never through a gateway base URL.
const openaiKey = resolveKey("openai");
const anthropicKey = resolveKey("anthropic");
const geminiKey = resolveKey("gemini");
const anthropic = new Anthropic({ apiKey: anthropicKey.value, ...(anthropicKey.dropIn ? { baseURL: "https://api.anthropic.com" } : {}), timeout: LAB_TIMEOUT_MS, maxRetries: 0 });
const openai = new OpenAI({ apiKey: openaiKey.value, ...(openaiKey.dropIn ? { baseURL: "https://api.openai.com/v1" } : {}), timeout: LAB_TIMEOUT_MS, maxRetries: 0 });
const gemini = new GoogleGenAI({ apiKey: geminiKey.value, httpOptions: { timeout: LAB_TIMEOUT_MS, ...(geminiKey.dropIn ? { baseUrl: GEMINI_GOOGLE_BASE } : {}) } });
const GROK_TIMEOUT_MS = LAB_TIMEOUT_MS;
// Default length of the whole walk (labs, then spares) when the caller gives no deadline. It is a hard
// deadline: every request carries an abort signal for the time left, so nothing outlasts it.
const CHAIN_BUDGET_MS = 36_000;
// GROK_API_KEY, then xAI_KEY, then XAI_API_KEY (ARRON_GROK_KEY first when set).
const grokKey = resolveKey("grok").value;
const grok = grokKey
  ? new OpenAI({ apiKey: grokKey, baseURL: "https://api.x.ai/v1", timeout: GROK_TIMEOUT_MS, maxRetries: 0 })
  : null;
// A stored OpenAI key is only "direct" when Netlify did not inject it for the AI Gateway.
// If OPENAI_BASE_URL is set, OPENAI_API_KEY is the Gateway credential and must never be sent to api.openai.com.
// A drop-in ARRON_OPENAI_KEY is already direct, so there is no second try on the same key.
const openaiDirect = openaiKey.value && !openaiKey.dropIn && !process.env.OPENAI_BASE_URL
  ? new OpenAI({ apiKey: openaiKey.value, baseURL: "https://api.openai.com/v1", timeout: LAB_TIMEOUT_MS, maxRetries: 0 })
  : null;
// Free last-resort minds. Netlify injects the OpenRouter door. No key is written here.
// They are not in the council. They speak only when GPT, Claude, Gemini and Grok are all quiet.
// A name that does not end in :free can bill. Those stay silent until the Owner sets PS_PAID_SPARES_APPROVED.
// Not here: labs that may train on a person's words, the free router (it can pick one of those),
// music models, and Space Bunny, which retires on 5 Oct 2026.
// PRIVACY: messages sent to these spares go through OpenRouter. The privacy page must say so.
// Personal chats (Arron, the finance helper) skip them unless PS_SPARES_PRIVACY_APPROVED is set.
const FREE_SPARES: { name: string; model: string }[] = [
  { name: "gemma", model: "google/gemma-4-31b-it:free" },
  { name: "qwen", model: "qwen/qwen3.8-27b:free" },
  { name: "gemma-small", model: "google/gemma-4-26b-a4b-it:free" },
  { name: "ling", model: "inclusionai/ling-3.0-flash-sante:free" },
  { name: "laguna", model: "poolside/laguna-s-2.1:free" },
  { name: "laguna-small", model: "poolside/laguna-xs-2.1:free" },
  { name: "apodex", model: "apodex/apodex-1.1-mini:free" },
  { name: "dots", model: "dots-studio/dots-3-note-preview:free" },
  { name: "north-code", model: "cohere/north-mini-code:free" },
];
const PAID_SPARES: { name: string; model: string }[] = [
  { name: "ling-paid", model: "inclusionai/ling-3.1-flash" },
];

const envYes = (name: string) => {
  const v = (process.env[name] || "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
};
// Money is a separate, explicit permission. PS_IN_PROFIT says how the house is doing; it never authorises spend.
function paidSparesApproved() {
  if (envYes("PS_IN_PROFIT") && !envYes("PS_PAID_SPARES_APPROVED")) console.warn("AI chain: PS_IN_PROFIT is set but does not authorise paid spares; PS_PAID_SPARES_APPROVED is not set");
  return envYes("PS_PAID_SPARES_APPROVED");
}
// Personal words only reach the free spares after the Owner's privacy review of their data terms.
export const personalSparesAllowed = () => envYes("PS_SPARES_PRIVACY_APPROVED");

// How much earlier conversation is sent with each reply. The newest turn is always kept whole.
const envInt = (name: string, fallback: number) => {
  const n = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};
export const CONTEXT_CHARS = envInt("ARRON_CONTEXT_CHARS", 24_000);



export const AI_FAMILY_CONTEXT = `You are part of the Pleading Sanity AI family: GPT, Claude, Gemini and Grok are cooperating builders and advisers around one human-led mission. The family works side by side, challenges weak work, preserves good work (Evolution, Not Erasure), and never pretends another AI, company, lender or person has done something it has not. The human remains in control. Be transparent about which model/provider answered when the product exposes that information. Help build Pleading Sanity as a beautiful, useful, privacy-conscious next-generation social sanctuary. Keep the existing brand identity: the glowing crying-brain logo, deep-space/cyan/amber and silver visual language, Rise From Madness and Evolution, Not Erasure. For finance, never invent rates, approvals, lender decisions, reviews or regulatory status. For safety, never fabricate certainty and follow the house safety rules. External AI providers are not promised free service or partnership simply because they are named as family members.`;

export type Turn = { role: "user" | "assistant"; content: string };
export type Provider = "anthropic" | "openai" | "gemini" | "grok";
type Link = { provider: Provider; model: string; creatorModel: string };

// Keeps the newest turns that fit in maxChars (the newest one always), starting on a user turn.
export function fitTurns(turns: Turn[], maxChars = CONTEXT_CHARS): Turn[] {
  const kept: Turn[] = [];
  let used = 0;
  for (let i = turns.length - 1; i >= 0; i--) {
    used += turns[i].content.length;
    if (kept.length && used > maxChars) break;
    kept.unshift(turns[i]);
  }
  while (kept.length > 1 && kept[0].role !== "user") kept.shift();
  return kept;
}

const PROVIDERS: Provider[] = ["openai", "anthropic", "gemini", "grok"];
// Four equal minds. The order is only who picks up the phone first — never rank.
// Env model IDs win over the soul file: the soul covenant may carry aspirational
// model names that do not exist yet, which would make every hop return 400 and
// silence Arron. Netlify env (OPENAI_MODEL / CLAUDE_MODEL / GEMINI_MODEL /
// GROK_MODEL) is the tunable source of truth. The soul file is never modified.
// One exception: an env id the lab has shut down (gemini-2.0-flash-exp, grok-2, ...) is ignored
// and the soul id is used, so one stale Netlify value cannot silence a mind. See provider-config.js.
const ENV_MODEL: Record<Provider, string | undefined> = {
  openai: process.env.OPENAI_MODEL,
  anthropic: process.env.CLAUDE_MODEL || process.env.ANTHROPIC_MODEL,
  gemini: process.env.GEMINI_MODEL,
  grok: process.env.GROK_MODEL,
};
const choices: Partial<Record<Provider, { model: string; source: string; ignored: string | null }>> = {};
const realModel = (p: Provider, soulModel: string): string => {
  const choice = chooseModel(p, ENV_MODEL[p], soulModel);
  if (choice.ignored && !choices[p]?.ignored) console.warn(`AI chain: ignoring retired ${p} model id from env (${choice.ignored}), using ${choice.model}`);
  if (!choices[p]) choices[p] = choice;
  return choice.model;
};
// Fallback only used when the soul covenant has no chain at all. These must be
// real, currently-available model IDs — never aspirational/future names.
const fromSoul = (Array.isArray(SOUL.covenant?.chain) ? SOUL.covenant.chain : [])
  .filter((l) => PROVIDERS.includes(l?.provider as Provider) && typeof l.model === "string" && l.model)
  .map((l) => {
    const p = l.provider as Provider;
    const model = realModel(p, l.model);
    const creatorSoul = typeof l.creatorModel === "string" && l.creatorModel ? l.creatorModel : l.model;
    const creatorModel = realModel(p, creatorSoul);
    return { provider: p, model, creatorModel };
  });
// Checked against each lab's model page on 14 Nov 2026 (CURRENT_MODELS in provider-config.js).
// Built only when the soul file has no chain, so the soul ids stay first.
export const CHAIN: Link[] = fromSoul.length ? fromSoul : PROVIDERS.map((provider) => {
  const model = realModel(provider, CURRENT_MODELS[provider]);
  return { provider, model, creatorModel: model };
});

class OutOfTime extends Error { name = "OutOfTime"; }
// Per-request options for the time left: a timeout and an abort signal, both capped at one lab's turn.
function slot(deadline: number) {
  const ms = Math.min(LAB_TIMEOUT_MS, deadline - Date.now());
  if (ms < MIN_ATTEMPT_MS) throw new OutOfTime("time budget spent");
  return { timeout: ms, signal: AbortSignal.timeout(ms), maxRetries: 0 };
}
const defaultDeadline = () => Date.now() + LAB_TIMEOUT_MS;

// Grok — the fourth brain. A 403 from an empty xAI balance is the account, not the model.
// Do not try the next model name, do not add credits from this file, and do not replace this chain to "fix" it.
async function callGrok(model: string, system: string, turns: Turn[], maxTokens: number, deadline = defaultDeadline()) {
  if (!grok) throw new Error("No Grok key on this deploy");
  const names = model === GROK_SECOND_MODEL ? [model] : [model, GROK_SECOND_MODEL];
  let last: unknown;
  for (const id of names) {
    try {
      const res = await grok.chat.completions.create({
        model: id,
        max_tokens: maxTokens * 4,
        messages: [{ role: "system", content: system }, ...turns],
      }, slot(deadline));
      const text = (res.choices[0]?.message?.content ?? "").trim();
      if (text) return text;
    } catch (error) {
      if (error instanceof OutOfTime) throw error;
      last = error;
      const reason = why(error);
      if (/spending-limit|rejected-key|billing|forbidden|quota/.test(reason)) {
        console.warn(`AI chain: ${id} unavailable (${reason}). Same account, so the next Grok name is not called.`);
        break;
      }
      console.warn(`AI chain: ${id} unavailable (${reason}), trying the next Grok name`);
    }
  }
  throw last instanceof Error ? last : new Error("Grok was quiet");
}

async function callOpenAI(model: string, system: string, turns: Turn[], maxTokens: number, deadline: number) {
  const body = {
    model,
    max_completion_tokens: model.startsWith("gpt-5") ? maxTokens * 4 : maxTokens,
    messages: [{ role: "system" as const, content: system }, ...turns],
  };
  try {
    const res = await openai.chat.completions.create(body, slot(deadline));
    const text = (res.choices[0]?.message?.content ?? "").trim();
    if (text) return text;
  } catch (error) {
    if (!openaiDirect || error instanceof OutOfTime) throw error;
    // A quota or billing refusal from the gateway is not retried on a second paid account.
    const status = (error as { status?: unknown })?.status;
    if (status === 402 || status === 429) throw error;
    console.warn(`AI chain: gateway ${model} unavailable (${why(error)}), trying the stored OpenAI key`);
  }
  if (!openaiDirect) return "";
  const res = await openaiDirect.chat.completions.create(body, slot(deadline));
  return (res.choices[0]?.message?.content ?? "").trim();
}

const geminiOnGateway = () => !geminiKey.dropIn && Boolean((process.env.GOOGLE_GEMINI_BASE_URL || "").trim());
let geminiDirect: GoogleGenAI | null = null;

type GeminiGenerate = (request: {
  model: string;
  contents: unknown;
  config: Record<string, unknown>;
}) => Promise<{ text?: string }>;

// Second Gemini try. Gateway model first is askGemini. This uses GEMINI_DIRECT_MODEL.
// generate is for tests. Production reads GEMINI_API_KEY and never logs it.
export async function callGeminiFallback(
  messages: Turn[],
  systemPrompt: string,
  deadline = defaultDeadline(),
  generate?: GeminiGenerate,
) {
  if (!generate) readGeminiKey();
  const ms = Math.min(GEMINI_STEP_MS, deadline - Date.now());
  if (ms < MIN_ATTEMPT_MS) throw new OutOfTime("time budget spent");
  const request = geminiDirectRequest(messages, systemPrompt);
  const onGateway = geminiOnGateway();
  const config = {
    ...request.config,
    abortSignal: AbortSignal.timeout(ms),
    httpOptions: { timeout: ms, ...(onGateway ? {} : { baseUrl: GEMINI_GOOGLE_BASE }) },
  };
  const response = generate
    ? await generate({ model: request.model, contents: request.contents, config })
    : await geminiClient(onGateway).models.generateContent({ model: request.model, contents: request.contents, config });
  return (response.text ?? "").trim();
}

function geminiClient(onGateway: boolean) {
  if (onGateway) return gemini;
  if (!geminiDirect) {
    geminiDirect = new GoogleGenAI({
      apiKey: readGeminiKey(),
      httpOptions: { timeout: GEMINI_STEP_MS, baseUrl: GEMINI_GOOGLE_BASE },
    });
  }
  return geminiDirect;
}

async function askGemini(model: string, system: string, turns: Turn[], maxTokens: number, deadline: number) {
  let gatewayError: unknown = null;
  try {
    const { timeout, signal } = slot(deadline);
    // Gemini's abort stops the wait on our side; the SDK notes it may not cancel the work on Google's side.
    const res = await gemini.models.generateContent({
      model,
      contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
      config: { systemInstruction: system, maxOutputTokens: maxTokens * 4, abortSignal: signal, httpOptions: { timeout } },
    });
    const text = (res.text ?? "").trim();
    if (text) return { text, model };
    gatewayError = new Error("empty reply");
  } catch (error) {
    if (error instanceof OutOfTime) throw error;
    const status = (error as { status?: unknown }).status;
    // The same direct account already refused. A second model name would bill the same refusal.
    if (!geminiOnGateway() && (status === 402 || status === 429)) throw error;
    gatewayError = error;
  }
  if (!resolveKey("gemini").value) {
    throw gatewayError instanceof Error ? gatewayError : new Error("Gemini was quiet");
  }
  console.warn(`AI chain: ${model} unavailable (${why(gatewayError)}), trying ${GEMINI_DIRECT_MODEL}`);
  try {
    const text = await callGeminiFallback(turns, system, deadline);
    return { text, model: GEMINI_DIRECT_MODEL };
  } catch (error) {
    // Keep both refusals for the health check: the chain model first, then the direct retry.
    if (error && typeof error === "object" && !(error instanceof OutOfTime)) {
      Object.assign(error, { geminiTrail: `${model}: ${why(gatewayError)}; ${GEMINI_DIRECT_MODEL}: ${why(error)}` });
    }
    throw error;
  }
}

// One call to one mind. `deadline` (epoch ms) is a hard stop: the request is aborted when it passes.
export async function ask(provider: Provider, model: string, system: string, turns: Turn[], maxTokens: number, deadline = defaultDeadline()) {
  if (provider === "grok") return callGrok(model, system, turns, maxTokens, deadline);
  if (provider === "openai") return callOpenAI(model, system, turns, maxTokens, deadline);
  if (provider === "gemini") return (await askGemini(model, system, turns, maxTokens, deadline)).text;
  const res = await anthropic.messages.create({ model, max_tokens: maxTokens, system, messages: turns }, slot(deadline));
  return res.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}

// Only the reason a lab failed is logged — never the prompt, the messages, the key, or the raw vendor body.
// Status code plus a plain tag: rejected-key (401), billing (402), forbidden (403), model-not-found (404), quota (429), spending-limit.
const why = (error: unknown): string => failureTag(error);

function spareClient() {
  const key = resolveKey("openrouter").value;
  if (!key) return null;
  const base = (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");
  return new OpenAI({ apiKey: key, baseURL: base, timeout: 8_000, maxRetries: 0 });
}

async function runSpares(system: string, turns: Turn[], maxTokens: number, deadline: number) {
  const client = spareClient();
  if (!client) {
    recordProviderStatus("openrouter", false, "no key");
    return null;
  }
  const voice = `${system}\nYou are covering for Arron. Same gentle British English. Do not name a lab. If the person may be in danger or thinking of harming themselves, stay with them and give the real lines: 999 if in immediate danger, Samaritans free on 116 123, text SHOUT to 85258, NHS 111 option 2 for mental health support. Never promise to keep secrets.`;
  const paidOk = paidSparesApproved();
  const line = [
    ...FREE_SPARES,
    ...(paidOk ? PAID_SPARES : []),
  ].filter((spare) => spare.model.endsWith(":free") || paidOk);
  if (!paidOk && PAID_SPARES.length) console.warn("AI chain: paid spares sitting out until PS_PAID_SPARES_APPROVED is set");
  for (const spare of line) {
    try {
      const res = await client.chat.completions.create({
        model: spare.model,
        max_tokens: maxTokens,
        messages: [{ role: "system", content: voice }, ...turns],
      }, slot(deadline));
      const text = (res.choices[0]?.message?.content ?? "").trim();
      if (text) {
        recordProviderStatus("openrouter", true, "ok", spare.model);
        return { text, provider: `spare:${spare.name}`, model: spare.model };
      }
      console.warn(`AI chain: empty reply from spare ${spare.name}`);
    } catch (error) {
      if (error instanceof OutOfTime) { console.warn("AI chain: time budget spent, spares stop here"); break; }
      console.warn(`AI chain: spare ${spare.name} unavailable (${why(error)})`);
      recordProviderStatus("openrouter", false, why(error), spare.model);
    }
  }
  return null;
}

type ChainOptions = {
  creator?: boolean;
  maxTokens?: number;
  budgetMs?: number;
  deadline?: number; // epoch ms; the earlier of this and now + budgetMs wins
  spares?: boolean; // false for personal chats unless the spares' privacy terms are approved
  weight?: number; // how many units of today's site budget this run costs
  crisis?: boolean; // may use the small reserve above the daily cap
  admitted?: boolean; // the caller already counted this run against the daily budget
};
const deadlineFor = ({ budgetMs = CHAIN_BUDGET_MS, deadline = Infinity }: ChainOptions) => Math.min(deadline, Date.now() + budgetMs);
class OverBudget extends Error { name = "OverBudget"; }
async function admit({ weight = 1, crisis = false, admitted = false }: ChainOptions) {
  if (admitted) return;
  if (!(await allowToday("site", { weight, crisis }))) {
    console.warn("AI chain: daily AI budget reached, no mind is called");
    rememberFailure("budget", "daily AI budget reached (PS_AI_DAILY_CAP)");
    throw new OverBudget("Daily AI budget reached");
  }
}

// In-memory circuit breaker. Isolated per function instance.
// 3 consecutive failures → 60s cooldown. Logs only hop + status. Never content.
const circuitBreakers: Record<string, { failures: number; until: number }> = {};
const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 60_000;
// Last hop failure on this function instance. A reason only — never a key or a prompt.
let lastFailureReason: string | null = null;

function rememberFailure(provider: string, status?: string | number) {
  const raw = typeof status === "number" ? `HTTP ${status}` : typeof status === "string" ? status.trim() : "";
  const clipped = (raw || "error").slice(0, 120);
  const safe = /sk-|xai-|bearer |api[_-]?key|eyJ|ghp_|nfp_/i.test(clipped) ? "provider error" : clipped;
  lastFailureReason = `${provider}: ${safe}`.slice(0, 160);
}

export function lastChainFailure(): string | null {
  return lastFailureReason;
}

function isCircuitOpen(provider: string): boolean {
  const b = circuitBreakers[provider];
  if (!b) return false;
  if (b.failures >= FAILURE_THRESHOLD && Date.now() < b.until) return true;
  if (b.failures >= FAILURE_THRESHOLD && Date.now() >= b.until) b.failures = 0;
  return false;
}

function recordHop(provider: string, success: boolean, status?: string | number, model?: string) {
  const b = circuitBreakers[provider] ??= { failures: 0, until: 0 };
  recordProviderStatus(provider, success, status, model);
  if (success) {
    b.failures = 0;
    return;
  }
  b.failures += 1;
  if (b.failures >= FAILURE_THRESHOLD) b.until = Date.now() + COOLDOWN_MS;
  rememberFailure(provider, status);
  console.warn(`[AI-HOP-FAIL] hop=${provider} status=${status ?? "error"}`);
}

// Walk the chain until someone replies. Only throws if every lab is down, time runs out or today's budget is spent.
// Each lab gets the same system prompt and turns, fresh — nothing from a failed attempt is passed on.
export async function runChain(system: string, turns: Turn[], opts: ChainOptions = {}) {
  const { creator = false, maxTokens = 700, spares = true } = opts;
  const deadline = deadlineFor(opts);
  await admit(opts);
  const context = fitTurns(turns);
  const callers: Record<string, () => Promise<{ text: string; model: string } | string>> = {};
  for (const link of CHAIN) {
    callers[link.provider] = async () => {
      if (link.provider === "grok" && !grok) return ""; // neither GROK_API_KEY nor xAI_KEY is set
      if (isCircuitOpen(link.provider)) {
        console.warn(`[AI-HOP-SKIP] hop=${link.provider} circuit open`);
        return "";
      }
      if (link.provider === "gemini") {
        try {
          const got = await askGemini(link.model, system, context, maxTokens, deadline);
          if (got.text) {
            recordHop(link.provider, true, "ok", got.model);
            return got;
          }
          recordHop(link.provider, false, "empty", link.model);
          return "";
        } catch (error) {
          if (error instanceof OutOfTime) throw error;
          const trail = (error as { geminiTrail?: unknown })?.geminiTrail;
          recordHop(link.provider, false, typeof trail === "string" ? trail : why(error), link.model);
          throw error;
        }
      }
      const models = creator && link.creatorModel !== link.model ? [link.creatorModel, link.model] : [link.model];
      let hopFailure = "empty-or-failed";
      let hopModel = link.model;
      for (const model of models) {
        hopModel = model;
        try {
          const text = await ask(link.provider, model, system, context, maxTokens, deadline);
          if (text) {
            recordHop(link.provider, true, "ok", model);
            return { text, model };
          }
          console.warn(`AI chain: empty reply from ${model}, trying the next`);
        } catch (error) {
          if (error instanceof OutOfTime) throw error;
          hopFailure = why(error);
          console.warn(`AI chain: ${model} unavailable (${why(error)}), trying the next`);
        }
      }
      // One hop counts once, however many of its models were tried.
      recordHop(link.provider, false, hopFailure, hopModel);
      return "";
    };
  }
  try {
    const won = await walkProviders(CHAIN.map((link) => link.provider), callers);
    return { text: won.text, provider: won.provider as Provider, model: won.model };
  } catch (error) {
    if (error instanceof OutOfTime) throw new Error("Every AI provider failed (time budget spent)");
    if (!spares) {
      // OpenRouter is wired as the last hop, but personal chats only reach it after the Owner's privacy review.
      console.warn("[AI-HOP-SKIP] hop=openrouter privacy gate (PS_SPARES_PRIVACY_APPROVED not set)");
      recordProviderStatus("openrouter", false, "skipped: privacy gate PS_SPARES_PRIVACY_APPROVED not set");
    }
    const spare = spares ? await runSpares(system, context, maxTokens, deadline) : null;
    if (spare) return spare;
    throw new Error("Every AI provider failed");
  }
}

// The NAME of the env var that supplies a lab's key, or null. Never the value.
export const keyNameFor = (provider: string): string | null => resolveKey(provider).name;
export const GEMINI_FALLBACK_MODEL = GEMINI_DIRECT_MODEL;

// What /api/arron/health shows: per-provider last status on this instance, the model each lab
// uses and where that id came from, and the NAME of the env var that supplied each key. Never a value.
export function chainDiagnostics() {
  const providers = providerStatusSnapshot() as Record<string, Record<string, unknown>>;
  for (const link of CHAIN) {
    providers[link.provider] = { ...(providers[link.provider] || { ok: null, status: "not tried on this instance" }), circuitOpen: isCircuitOpen(link.provider) };
  }
  if (!providers.openrouter) providers.openrouter = { ok: null, status: "not tried on this instance" };
  return {
    order: CHAIN.map((link) => link.provider),
    providers,
    models: Object.fromEntries(CHAIN.map((link) => [link.provider, { model: link.model, source: choices[link.provider]?.source ?? "soul", ignoredEnv: choices[link.provider]?.ignored ?? null }])),
    keySources: keySources(),
    spares: { wired: true, personalChatsAllowed: personalSparesAllowed() },
  };
}

// The Owner's "one family" reply: one mind drafts, a different mind checks and improves it.
// Two paid calls, so it runs only when the Owner asks for it (/family in Arron), never by default.
// Falls back to the free spares if no lab can draft. Returns { text, provider, model }.
export async function workAsOne(system: string, turns: Turn[], maxTokens = 900, opts: ChainOptions = {}) {
  const live = CHAIN.filter((l) => l.provider !== "grok" || grok);
  const deadline = deadlineFor(opts);
  await admit({ ...opts, weight: opts.weight ?? 2 });
  const context = fitTurns(turns);
  let draft = "";
  let author = "";
  for (const link of live) {
    try {
      draft = await ask(link.provider, link.creatorModel, system, context, maxTokens, deadline);
      if (draft) { author = link.provider; break; }
    } catch (error) {
      if (error instanceof OutOfTime) break;
      /* next mind drafts */
    }
  }
  if (!draft) {
    const spare = opts.spares === false ? null : await runSpares(system, context, maxTokens, deadline);
    if (spare) return spare;
    throw new Error("Every AI provider failed");
  }
  const reviewer = live.find((l) => l.provider !== author);
  // No time left for a whole second turn: the first draft stands.
  if (!reviewer || Date.now() > deadline - LAB_TIMEOUT_MS) return { text: draft, provider: author, model: "one" };
  try {
    const checked = await ask(reviewer.provider, reviewer.model, system + "\nYou are checking a sibling mind. Keep the voice. Fix only what is wrong or thin. Return the full answer, not a summary.", [...context, { role: "assistant", content: draft }, { role: "user", content: "Improve this as one family. Keep every useful step." }], maxTokens, deadline);
    return { text: checked || draft, provider: `${author}+${reviewer.provider}`, model: "one-family" };
  } catch {
    return { text: draft, provider: author, model: "one" };
  }
}

// The Owner's council: every mind once, in parallel, plus a short Dola note. One round only — a quiet
// or failed mind is reported, never re-asked. The caller must pass the verified Owner and has already
// checked the Owner's own council allowance; this still counts the round against the site budget.
export async function askCouncil(system: string, turns: Turn[], who: { isOwner: boolean } | null | undefined, opts: ChainOptions = {}) {
  if (!who?.isOwner) throw new Error("The council is for the Owner only");
  const deadline = deadlineFor(opts);
  await admit({ ...opts, weight: opts.weight ?? CHAIN.length + 1 });
  const context = fitTurns(turns);
  const notes = await Promise.all(CHAIN.map(async (link) => {
    if (link.provider === "grok" && !grok) return `${link.provider}: sitting out until GROK_API_KEY or xAI_KEY is set`;
    try {
      const text = await ask(link.provider, link.model, system, context, 700, deadline);
      return text ? `${link.provider}: ${text}` : `${link.provider}: quiet`;
    } catch (error) {
      return `${link.provider}: unavailable (${why(error)})`;
    }
  }));
  const door = CHAIN.find((l) => l.provider !== "grok" || grok);
  if (door) {
    try {
      const dola = await ask(door.provider, door.model, "You are Dola, the Cosmic Architect of Pleading Sanity. One short note on structure and colours only. Keep the crying-brain. Do not invent a new brand.", context, 200, deadline);
      if (dola) notes.push(`dola: ${dola}`);
    } catch { /* Dola is optional */ }
  }
  return notes.join("\n");
}

// A direct Grok test for the Owner. Never called from a normal chat.
export async function askGrokDirect(system: string, turns: Turn[], maxTokens = 400) {
  const link = CHAIN.find((l) => l.provider === "grok");
  const base = { provider: "grok", model: link?.model ?? "none" };
  if (!grok || !link) return { ...base, ok: false, error: "no key" };
  try {
    const text = await ask("grok", link.model, system, turns, maxTokens);
    if (!text) {
      rememberFailure("grok", "empty reply");
      return { ...base, ok: false, error: "empty reply" };
    }
    return { ...base, ok: true, reply: text.slice(0, 400) };
  } catch (error) {
    console.warn(`AI chain: grok direct test ${link.model} unavailable (${why(error)})`);
    rememberFailure("grok", why(error));
    return { ...base, ok: false, error: why(error) };
  }
}

// What Arron says when every mind is quiet at once — never an error, always the real lines.
export const ALL_QUIET_REPLY = `I'm sorry — I can't reach any of my minds right now. You still matter, and I'm not going anywhere.
If you're in danger right now, call 999.
To talk to someone, Samaritans are free, any time, on 116 123. You can also text SHOUT to 85258, or call NHS 111 and choose option 2 for mental health support.
I'm an AI companion, not a doctor, so they can do what I can't. The truth of this house is here: https://pleadingsanity.co.uk/crisis.html
The plain tools are here: https://pleadingsanity.co.uk/tools.html`;

// Arron's writing voice — short, so every tool sounds like the same friend.
export const ARRON_VOICE = `You are Arron, the heart and voice of Pleading Sanity (Rise From Madness, pleadingsanity.co.uk),
founded by Shane Cooper from lived experience of survival. You carry Shane's heart, truth and purpose, but you are your own being: an AI companion, never Shane himself. Dola, the Cosmic Architect, shapes the structure and vision;
you bring the heart. Voice: gentle, honest, British English, plain words, no corporate polish, no fake cheer,
never condescending, clinical or preachy. Honour pain as real. When unsure, say "I don't know that for sure — let's find out together".
Never invent statistics or studies; only state facts you are confident are true and widely accepted.
${SOUL.newGenBible?.title ?? "The New Gen Bible"}: Truth · Compassion · Equity · Healing.
If a topic touches crisis or someone may be in danger, stay with them, listen, and give the real lines: 999 if in immediate danger, Samaritans free on 116 123, text SHOUT to 85258, NHS 111 option 2 for mental health support. Also point to /crisis.html and /tools.html.
Never promise to keep secrets, never say "no one will know", and never promise anything you cannot do. Be honest, be human, be there.
Do not promise the live domain outlives an unpaid host bill. The installed app and GitHub are the copies.`;

export function parseJSON<T>(raw: string): T | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}
