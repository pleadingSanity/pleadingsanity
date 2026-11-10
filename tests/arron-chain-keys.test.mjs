import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("ai-chain.ts references the exact env var names for all four providers", () => {
  const src = readFileSync(new URL("../netlify/lib/ai-chain.ts", import.meta.url), "utf8");
  assert.ok(src.includes("process.env.OPENAI_API_KEY"), "OPENAI_API_KEY referenced");
  assert.ok(src.includes("process.env.GEMINI_API_KEY"), "GEMINI_API_KEY referenced");
  assert.ok(src.includes("process.env.GROK_API_KEY"), "GROK_API_KEY referenced");
  assert.ok(src.includes("process.env.xAI_KEY"), "xAI_KEY referenced");
  assert.ok(src.includes("process.env.XAI_API_KEY"), "XAI_API_KEY referenced");
});

test("arron-knowledge persona includes companion-not-therapist and Architect buff", () => {
  const src = readFileSync(new URL("../netlify/lib/arron-knowledge.ts", import.meta.url), "utf8");
  assert.ok(src.includes("companion, NOT a therapist") || src.includes("companion, not a therapist") || src.includes("NOT a therapist"), "companion-not-therapist present");
  assert.ok(src.includes("Arron the Architect"), "Architect buff present");
  assert.ok(src.includes("creativity, healing and empowerment"), "Pleading Sanity ethos present");
});

test("arron health route keeps ok:true and reports key presence without values", () => {
  const src = readFileSync(new URL("../netlify/functions/arron.mts", import.meta.url), "utf8");
  assert.equal(existsSync(new URL("../netlify/functions/arron-health.mts", import.meta.url)), false);
  assert.match(src, /ok: true/);
  assert.match(src, /keys: providerKeyPresence\(\)/);
  assert.match(src, /lastFailure: lastChainFailure\(\)/);
  assert.match(src, /no live API calls/);
  assert.match(src, /present\(env\.OPENAI_API_KEY\)/);
  assert.match(src, /present\(env\.GROK_API_KEY\) \|\| present\(env\.xAI_KEY\) \|\| present\(env\.XAI_API_KEY\)/);
  assert.doesNotMatch(src, /\$\{process\.env\.OPENAI_API_KEY\}/);
  assert.ok(!src.includes("sk-ant"), "no hardcoded anthropic key");
  assert.ok(!src.includes("xai-"), "no hardcoded xai key");
});
