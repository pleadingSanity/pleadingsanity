import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CURRENT_MODELS,
  KEY_NAMES,
  chooseModel,
  failureTag,
  isRetiredModel,
  keySources,
  providerStatusSnapshot,
  recordProviderStatus,
  resetProviderStatus,
  resolveKey,
  safeStatus,
} from "../netlify/lib/provider-config.js";

const chain = readFileSync(new URL("../netlify/lib/ai-chain.ts", import.meta.url), "utf8");
const arron = readFileSync(new URL("../netlify/functions/arron.mts", import.meta.url), "utf8");
const probe = readFileSync(new URL("../netlify/functions/arron-health.mts", import.meta.url), "utf8");
const handoff = readFileSync(new URL("../AI_HANDOFF.md", import.meta.url), "utf8");

test("a drop-in ARRON_* key wins over an older key of the same lab", () => {
  const env = { OPENAI_API_KEY: "old-openai-value-123", ARRON_OPENAI_KEY: "new-openai-value-456" };
  const got = resolveKey("openai", env);
  assert.equal(got.value, "new-openai-value-456");
  assert.equal(got.name, "ARRON_OPENAI_KEY");
  assert.equal(got.dropIn, true);
});

test("common alias names are accepted for every lab", () => {
  assert.equal(resolveKey("grok", { XAI_API_KEY: "xai-alias-value-1234" }).name, "XAI_API_KEY");
  assert.equal(resolveKey("grok", { xAI_KEY: "older-xai-value-1234" }).name, "xAI_KEY");
  assert.equal(resolveKey("anthropic", { CLAUDE_API_KEY: "claude-alias-value-1" }).name, "CLAUDE_API_KEY");
  assert.equal(resolveKey("anthropic", { Anthropic_Key_Arron: "older-anthropic-val" }).name, "Anthropic_Key_Arron");
  assert.equal(resolveKey("gemini", { GOOGLE_API_KEY: "google-alias-value-1" }).name, "GOOGLE_API_KEY");
  assert.equal(resolveKey("openrouter", { OPENROUTER_API_KEY: "openrouter-value-12" }).name, "OPENROUTER_API_KEY");
  // The existing names keep their old order after the drop-in.
  assert.deepEqual(KEY_NAMES.grok, ["ARRON_GROK_KEY", "GROK_API_KEY", "xAI_KEY", "XAI_API_KEY"]);
});

test("blank or placeholder values are not keys, and keySources returns names only", () => {
  const env = { GROK_API_KEY: "   ", GEMINI_API_KEY: "short", OPENAI_API_KEY: "real-looking-openai-1" };
  assert.equal(resolveKey("grok", env).name, null);
  assert.equal(resolveKey("gemini", env).name, null);
  const names = keySources(env);
  assert.equal(names.openai, "OPENAI_API_KEY");
  assert.equal(JSON.stringify(names).includes("real-looking-openai-1"), false);
});

test("retired model ids from env are ignored in favour of the soul id", () => {
  assert.equal(isRetiredModel("gemini", "gemini-2.0-flash-exp"), true);
  assert.equal(isRetiredModel("gemini", "gemini-1.5-pro"), true);
  assert.equal(isRetiredModel("gemini", "gemini-2.5-flash"), true);
  assert.equal(isRetiredModel("gemini", "gemini-2.5-flash-lite"), false);
  assert.equal(isRetiredModel("gemini", "gemini-3.8-flash"), false);
  assert.equal(isRetiredModel("grok", "grok-2"), true);
  assert.equal(isRetiredModel("grok", "grok-2-1212"), true);
  assert.equal(isRetiredModel("grok", "grok-4.7"), false);
  assert.equal(isRetiredModel("anthropic", "claude-3-5-sonnet-20241022"), true);
  assert.equal(isRetiredModel("anthropic", "claude-sonnet-4-6"), false);
  assert.equal(isRetiredModel("openai", "gpt-4o"), false); // deprecated, still served until Jan 2027
  assert.equal(isRetiredModel("openai", "gpt-4-turbo"), true);
  assert.deepEqual(chooseModel("grok", "grok-2", "grok-4.7"), { model: "grok-4.7", source: "soul", ignored: "grok-2" });
  assert.deepEqual(chooseModel("anthropic", "claude-sonnet-4-6", "claude-sonnet-5-5"), { model: "claude-sonnet-4-6", source: "env", ignored: null });
  assert.deepEqual(chooseModel("openai", "", "gpt-5.6-sol"), { model: "gpt-5.6-sol", source: "soul", ignored: null });
});

test("failure tags name the real reason by status code", () => {
  assert.equal(failureTag({ status: 401 }), "HTTP 401 rejected-key");
  assert.equal(failureTag({ status: 403 }), "HTTP 403 forbidden");
  assert.equal(failureTag({ status: 403, message: "Your team does not have any credits" }), "HTTP 403 spending-limit");
  assert.equal(failureTag({ status: 404 }), "HTTP 404 model-not-found");
  assert.equal(failureTag({ status: 429 }), "HTTP 429 quota");
  assert.equal(failureTag({ name: "TimeoutError" }), "TimeoutError");
});

test("per-provider status is recorded without secrets", () => {
  resetProviderStatus();
  recordProviderStatus("openai", false, "HTTP 429 quota", "gpt-4o", 0);
  recordProviderStatus("grok", false, "Bearer xai-abcdefghijklmnop leaked", "grok-4.7", 0);
  recordProviderStatus("anthropic", true, "ok", "claude-sonnet-4-6", 0);
  const snap = providerStatusSnapshot();
  assert.deepEqual(snap.openai, { ok: false, status: "HTTP 429 quota", model: "gpt-4o", at: "1970-01-01T00:00:00.000Z" });
  assert.equal(snap.grok.status, "provider error");
  assert.equal(snap.anthropic.status, "ok");
  assert.equal(safeStatus(403), "HTTP 403");
  resetProviderStatus();
});

test("the chain uses the shared config and keeps its order and crisis lines", () => {
  assert.match(chain, /const PROVIDERS: Provider\[\] = \["openai", "anthropic", "gemini", "grok"\]/);
  assert.match(chain, /recordProviderStatus\(provider, success, status, model\)/);
  assert.match(chain, /export function chainDiagnostics\(\)/);
  assert.match(chain, /\[AI-HOP-SKIP\] hop=openrouter privacy gate/);
  assert.match(chain, /export const ALL_QUIET_REPLY = `I'm sorry — I can't reach any of my minds right now/);
  assert.match(chain, /call 999\.\nTo talk to someone, Samaritans are free, any time, on 116 123/);
});

test("health shows per-provider status and the owner probe uses the same keys", () => {
  assert.match(arron, /chain: chainDiagnostics\(\)/);
  assert.match(arron, /\/api\/ops\/ai-probe/);
  assert.match(probe, /resolveKey\("grok", env\)\.value/);
  assert.match(probe, /chooseModel\(p, envModel, CURRENT_MODELS\[p\]\)/);
  assert.match(probe, /if \(!user\?\.isOwner\) return json\(\{ error: "Not found" \}, 404\)/);
  assert.match(probe, /PS_PAID_PROBES_APPROVED/);
  assert.doesNotMatch(probe, /\?key=\$\{/); // Gemini key goes in a header, not the URL
});

test("handoff documents the key drop-in", () => {
  assert.match(handoff, /## Arron key drop-in/);
  for (const name of ["ARRON_OPENAI_KEY", "ARRON_ANTHROPIC_KEY", "ARRON_GEMINI_KEY", "ARRON_GROK_KEY"]) assert.ok(handoff.includes(name), name);
});

test("CURRENT_MODELS mirrors the soul chain, so the owner probe tests the models Arron calls", () => {
  const soul = JSON.parse(readFileSync(new URL("../arron-knowledge.json", import.meta.url), "utf8"));
  const chainLinks = soul.covenant?.chain || [];
  for (const link of chainLinks) {
    if (CURRENT_MODELS[link.provider]) assert.equal(CURRENT_MODELS[link.provider], link.model, link.provider);
  }
  assert.deepEqual(chainLinks.map((l) => l.provider), ["openai", "anthropic", "gemini", "grok"]);
});
