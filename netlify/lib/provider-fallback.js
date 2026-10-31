// Provider order for Arron. The first mind that answers wins.
// GPT, then Claude, then Gemini, then Grok. A timeout, an empty reply,
// or a quota error steps down. A spent time budget (OutOfTime) stops the walk.
// This file has no SDK and no key. Callers pass functions.

export const PROVIDER_ORDER = ["openai", "anthropic", "gemini", "grok"];
export const GEMINI_DIRECT_MODEL = "gemini-2.5-flash";
export const GEMINI_STEP_MS = 4500;
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
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
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
  const apiKey = String(env?.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not set in Netlify environment.");
    error.code = "GEMINI_KEY_MISSING";
    throw error;
  }
  return apiKey;
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
