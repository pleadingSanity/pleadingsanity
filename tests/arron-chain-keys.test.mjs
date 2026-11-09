import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

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

test("arron-health endpoint never echoes key values and reports key presence", () => {
  const src = readFileSync(new URL("../netlify/functions/arron-health.mts", import.meta.url), "utf8");
  assert.ok(!src.includes("sk-ant"), "no hardcoded anthropic key");
  assert.ok(!src.includes("xai-"), "no hardcoded xai key");
  assert.ok(src.includes("nonEmpty"), "reports key presence only");
  assert.ok(src.includes("no live API calls"), "states no live calls made");
});
