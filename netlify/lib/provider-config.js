// Which key and which model each of Arron's minds uses, and how each one last did.
// Plain JS with no SDK, so tests can load it. It never logs, returns or stores a key value:
// only the env var NAME that supplied the key, a model id, and a short status.
//
// KEY DROP-IN: the first name in each list wins. The ARRON_* names come first on purpose,
// so a fresh key can be added next to an old dead one without deleting anything.

export const KEY_NAMES = {
  openai: ["ARRON_OPENAI_KEY", "OPENAI_API_KEY", "OPENAI_KEY"],
  anthropic: ["ARRON_ANTHROPIC_KEY", "ANTHROPIC_API_KEY", "CLAUDE_API_KEY", "Anthropic_Key_Arron"],
  gemini: ["ARRON_GEMINI_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY"],
  grok: ["ARRON_GROK_KEY", "GROK_API_KEY", "xAI_KEY", "XAI_API_KEY"],
  openrouter: ["ARRON_OPENROUTER_KEY", "OPENROUTER_API_KEY"],
};

// A drop-in ARRON_* key always talks to the provider directly, never through a gateway base URL.
export const DROP_IN_PREFIX = "ARRON_";

// Netlify's dev-server context can hold an empty or placeholder value; very short strings are not keys.
const usable = (v) => typeof v === "string" && v.trim().length > 8;

export function resolveKey(provider, env = process.env) {
  for (const name of KEY_NAMES[provider] || []) {
    const value = env?.[name];
    if (usable(value)) return { value: value.trim(), name, dropIn: name.startsWith(DROP_IN_PREFIX) };
  }
  return { value: "", name: null, dropIn: false };
}

// Names only. Safe to show on the public health route.
export function keySources(env = process.env) {
  const out = {};
  for (const provider of Object.keys(KEY_NAMES)) out[provider] = resolveKey(provider, env).name;
  return out;
}

// Model ids the provider has shut down or restricted. An env override that matches is ignored
// (the soul file's current id is used instead) so one stale Netlify value cannot silence a mind.
// Sources, read 14 Nov 2026: Gemini API deprecations page, xAI models + retirement notes,
// OpenAI deprecations page, Anthropic models overview.
export const RETIRED_MODELS = {
  openai: /^(gpt-3\.5|gpt-4$|gpt-4-(?!o)|gpt-4o-2024-05-13|chatgpt-4o-latest|o1(-|$))/i,
  anthropic: /^claude-(instant|2|3)([.-]|$)/i,
  gemini: /^gemini-(1\.|2\.0|pro$|pro-|2\.5-(flash|pro)(-preview.*)?$)|-exp(-\d+)?$/i,
  grok: /^grok-(beta|vision-beta|2([.-]|$)|3-mini|4$|4-latest$)/i,
};

export function isRetiredModel(provider, model) {
  const rule = RETIRED_MODELS[provider];
  return Boolean(rule && typeof model === "string" && rule.test(model.trim()));
}

// env override wins unless it is empty or retired; then the soul file's id is used.
export function chooseModel(provider, envValue, soulModel) {
  const env = typeof envValue === "string" ? envValue.trim() : "";
  if (env && !isRetiredModel(provider, env)) return { model: env, source: "env", ignored: null };
  return { model: soulModel, source: "soul", ignored: env || null };
}

// Current fallback ids when the soul file has no chain (checked 14 Nov 2026).
export const CURRENT_MODELS = {
  openai: "gpt-5.6-sol",
  anthropic: "claude-sonnet-5-5",
  gemini: "gemini-3.8-flash",
  grok: "grok-4.7",
};
// Gemini direct retry when the chain's Gemini hop fails. gemini-2.5-flash is deprecated and limited to
// earlier users (Gemini API deprecations page, read 14 Nov 2026); Google names gemini-3.5-flash-lite.
export const GEMINI_DIRECT_MODEL = "gemini-3.5-flash-lite";
// Grok's second name when the first is refused for a model reason (not the account).
export const GROK_SECOND_MODEL = "grok-4.3";

// ─── per-provider status (this function instance only) ───
const status = {};
const SECRETISH = /sk-|xai-|bearer |api[_-]?key|eyJ|ghp_|nfp_|AIza/i;

export function safeStatus(raw) {
  const text = typeof raw === "number" ? `HTTP ${raw}` : typeof raw === "string" ? raw.trim() : "";
  const clipped = (text || "error").slice(0, 140);
  return SECRETISH.test(clipped) ? "provider error" : clipped;
}

export function recordProviderStatus(provider, ok, raw, model, now = Date.now()) {
  const prev = status[provider] || {};
  status[provider] = {
    ok: Boolean(ok),
    status: ok ? "ok" : safeStatus(raw),
    model: typeof model === "string" && model ? model.slice(0, 60) : prev.model || null,
    at: new Date(now).toISOString(),
  };
}

export function providerStatusSnapshot() {
  return JSON.parse(JSON.stringify(status));
}

export function resetProviderStatus() {
  for (const k of Object.keys(status)) delete status[k];
}

// Short, safe tag for a provider error: status code plus a plain reason. Never the body or a key.
export function failureTag(error) {
  const e = error || {};
  const code = typeof e.status === "number" ? e.status : null;
  const head = code ? `HTTP ${code}` : typeof e.name === "string" ? e.name : "error";
  const bits = [e.code, e.message, e.error?.code, e.error?.message].filter((v) => typeof v === "string").join(" ");
  const tag =
    /spending-limit|run out of credits|need a grok subscription|doesn't have any credits|does not have any credits/i.test(bits) ? "spending-limit" :
    /insufficient_quota/i.test(bits) ? "quota" :
    code === 401 ? "rejected-key" :
    code === 402 ? "billing" :
    code === 403 ? "forbidden" :
    code === 404 ? "model-not-found" :
    code === 429 ? "quota" :
    e.code === "GEMINI_KEY_MISSING" ? "no-key" :
    "";
  return tag ? `${head} ${tag}` : head;
}
