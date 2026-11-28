// Provider order for Arron. The first mind that answers wins.
// GPT, then Claude, then Gemini, then Grok. A timeout, an empty reply,
// or a quota error steps down. A spent time budget (OutOfTime) stops the walk.
// This file has no SDK and no key. Callers pass functions.
import { GEMINI_DIRECT_MODEL as GEMINI_DEFAULT_DIRECT, resolveKey } from "./provider-config.js";

export const PROVIDER_ORDER = ["openai", "anthropic", "gemini", "grok"];
// gemini-3.5-flash-lite by default (see provider-config.js). GEMINI_FALLBACK_MODEL overrides it.
export const GEMINI_DIRECT_MODEL = String(globalThis.process?.env?.GEMINI_FALLBACK_MODEL || "").trim() || GEMINI_DEFAULT_DIRECT;
// 15s, not 4.5s. gpt-5.6-sol, claude-sonnet-5-5, gemini-3.8-flash and grok-4.7
// reason before they speak. A 4.5s abort returned a timeout for a valid key.
// A rejected key still fails in well under a second and the next lab is tried.
export const GEMINI_STEP_MS = 15_000;
export const GEMINI_GOOGLE_BASE = "https://generativelanguage.googleapis.com";

export function geminiContents(messages) {
  return (Array.isArray(messages) ? messages : []).map((message) => ({
    role: message && message.role === "assistant" ? "model" : "user",
    parts: [{ text: typeof message?.content === "string" ? message.content : "" }],
  }));
}

export function geminiFallbackConfig(systemPrompt) {
  return {
    systemInstruction: typeof systemPrompt === "string" ? systemPrompt : "",
    temperature: 0.7,
    maxOutputTokens: 800,
  };
}

export function geminiDirectRequest(messages, systemPrompt) {
  return {
    model: GEMINI_DIRECT_MODEL,
    contents: geminiContents(messages),
    config: geminiFallbackConfig(systemPrompt),
  };
}

export function readGeminiKey(env = process.env) {
  // ARRON_GEMINI_KEY, then GEMINI_API_KEY, then the aliases in provider-config.js.
  const apiKey = resolveKey("gemini", env || {}).value;
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not set in Netlify environment.");
    error.code = "GEMINI_KEY_MISSING";
    throw error;
  }
  return apiKey;
}

// Where a failed hop goes next.
// next-key: this secret was rejected or this account is out of credit; a later env name may be a different account.
// next-model: this id is missing, empty, or the model is overloaded (503); try the lab's current id.
// next-provider: timeout or anything else. Do not spend the rest of the budget on the same lab.
export function nextStep(tag) {
  const s = String(tag || "").toLowerCase();
  if (/empty|model-not-found|\b404\b|\b502\b|\b503\b|\b504\b/.test(s)) return "next-model";
  if (/rejected-key|forbidden|quota|billing|spending-limit|\b401\b|\b402\b|\b403\b|\b429\b/.test(s)) return "next-key";
  return "next-provider";
}

// Ids to try on one lab. The chosen id first, then the soul/current id, then that lab's named spare.
export function fallbackModels(provider, model, extras = {}) {
  const models = [];
  const add = (id) => {
    if (typeof id === "string" && id && !models.includes(id)) models.push(id);
  };
  add(model);
  add(extras.current);
  if (provider === "grok") add(extras.grokSecond);
  if (provider === "gemini") add(extras.geminiDirect);
  return models;
}

function scrub(text) {
  return String(text || "").slice(0, 180).replace(/sk-[a-z0-9_-]+|xai-[a-z0-9]+|AIza[0-9A-Za-z_-]+|Bearer\s+\S+/gi, "redacted");
}

function messageText(content) {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content.map((part) => (typeof part === "string" ? part : typeof part?.text === "string" ? part.text : "")).join("").trim();
}

// The request Arron sends. The key is a header, never a query parameter.
// A drop-in ARRON_* key, or a lab with no gateway base URL, goes to the lab itself.
export function chatRequest(spec, env = globalThis.process?.env || {}) {
  const provider = spec?.provider;
  const model = spec?.model;
  const system = typeof spec?.system === "string" ? spec.system : "";
  const turns = Array.isArray(spec?.turns) ? spec.turns : [];
  const maxTokens = Number(spec?.maxTokens) > 0 ? Number(spec.maxTokens) : 700;
  const apiKey = spec?.apiKey;
  const dropIn = Boolean(spec?.dropIn);
  if (provider === "grok") {
    return {
      url: "https://api.x.ai/v1/chat/completions",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: {
        model,
        max_tokens: maxTokens * 4,
        messages: [{ role: "system", content: system }, ...turns],
      },
    };
  }
  if (provider === "openai") {
    const gateway = !dropIn && String(env.OPENAI_BASE_URL || "").trim();
    const base = (gateway || "https://api.openai.com/v1").replace(/\/$/, "");
    const body = {
      model,
      max_completion_tokens: String(model).startsWith("gpt-5") ? maxTokens * 4 : maxTokens,
      messages: [{ role: "system", content: system }, ...turns],
    };
    return {
      url: `${base}/chat/completions`,
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body,
    };
  }
  if (provider === "anthropic") {
    const gateway = !dropIn && String(env.ANTHROPIC_BASE_URL || "").trim();
    const base = (gateway || "https://api.anthropic.com").replace(/\/$/, "");
    return {
      url: `${base}/v1/messages`,
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      // Adaptive thinking shares this budget. The old cap was the reply budget alone, so a valid
      // Claude key could come back with thinking blocks and no text.
      body: { model, max_tokens: maxTokens * 4, system, messages: turns },
    };
  }
  if (provider === "gemini") {
    const gateway = !dropIn && String(env.GOOGLE_GEMINI_BASE_URL || "").trim();
    const base = (gateway || "https://generativelanguage.googleapis.com").replace(/\/$/, "");
    return {
      url: `${base}/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: {
        systemInstruction: { parts: [{ text: system }] },
        contents: geminiContents(turns),
        generationConfig: { maxOutputTokens: maxTokens * 4, temperature: 0.7 },
      },
    };
  }
  throw new Error("unknown provider");
}

export function readProviderText(provider, json) {
  if (provider === "anthropic") {
    const blocks = Array.isArray(json?.content) ? json.content : [];
    return blocks.map((block) => (block?.type === "text" && typeof block.text === "string" ? block.text : "")).join("").trim();
  }
  if (provider === "gemini") {
    const parts = json?.candidates?.[0]?.content?.parts;
    return messageText(parts);
  }
  return messageText(json?.choices?.[0]?.message?.content);
}

// One HTTP call. fetchImpl is for tests. The thrown error carries a status and a short scrubbed message, never the key.
export async function postChat(spec, fetchImpl = globalThis.fetch) {
  const request = chatRequest(spec);
  const res = await fetchImpl(request.url, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify(request.body),
    signal: spec?.signal,
  });
  const raw = await res.text();
  let json = {};
  try { json = raw ? JSON.parse(raw) : {}; } catch { json = {}; }
  if (!res.ok) {
    const message = json?.error?.message || json?.error?.status || json?.message || `HTTP ${res.status}`;
    const error = new Error(scrub(message));
    error.status = res.status;
    error.code = typeof json?.error?.code === "string" ? json.error.code : undefined;
    throw error;
  }
  return readProviderText(spec.provider, json);
}

// Try each key for one model. A rejected or unpaid key moves to the next name.
// A timeout, a missing model, or an empty reply is thrown so the caller can change model or lab.
export async function relayOneModel({ keys, send, classify }) {
  const list = Array.isArray(keys) ? keys : [];
  if (!list.length) {
    const error = new Error("No key on this deploy");
    error.code = "NO_KEY";
    throw error;
  }
  let last = null;
  for (const key of list) {
    try {
      const text = await send(key);
      if (typeof text === "string" && text.trim()) return text.trim();
      const empty = new Error("empty reply");
      empty.name = "EmptyReply";
      throw empty;
    } catch (error) {
      if (error && error.name === "OutOfTime") throw error;
      last = error;
      const step = nextStep(typeof classify === "function" ? classify(error) : error?.message);
      if (step === "next-key") continue;
      throw error;
    }
  }
  throw last instanceof Error ? last : new Error("provider failed");
}

export async function walkProviders(order, callers) {
  const tried = [];
  let last = null;
  const list = Array.isArray(order) ? order : [];
  for (const name of list) {
    const call = callers?.[name];
    if (typeof call !== "function") continue;
    tried.push(name);
    try {
      const result = await call();
      const text = typeof result === "string" ? result.trim() : String(result?.text ?? "").trim();
      if (!text) continue;
      const model = typeof result === "object" && result && typeof result.model === "string" && result.model
        ? result.model
        : name;
      return { text, provider: name, model, tried: tried.slice() };
    } catch (error) {
      if (error && error.name === "OutOfTime") throw error;
      last = error;
    }
  }
  const error = new Error("Every AI provider failed");
  error.tried = tried;
  error.cause = last;
  throw error;
}
