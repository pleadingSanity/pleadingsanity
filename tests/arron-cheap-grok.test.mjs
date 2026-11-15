import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CHEAP_DEFAULTS, anthropicHeaders, everydayModel, failureTag } from "../netlify/lib/provider-config.js";

const chain = readFileSync(new URL("../netlify/lib/ai-chain.ts", import.meta.url), "utf8");
const probe = readFileSync(new URL("../netlify/functions/arron-health.mts", import.meta.url), "utf8");

test("Grok's everyday model is the cheap default when GROK_MODEL is empty or retired", () => {
  assert.equal(CHEAP_DEFAULTS.grok, "grok-4.3");
  assert.deepEqual(everydayModel("grok", "grok-2", "grok-4.7"), { model: "grok-4.3", source: "cheap-default", ignored: "grok-2" });
  assert.deepEqual(everydayModel("grok", "", "grok-4.7"), { model: "grok-4.3", source: "cheap-default", ignored: null });
  // A live env id still wins, so Shane can pick any model on Netlify.
  assert.deepEqual(everydayModel("grok", "grok-build-0.1", "grok-4.7"), { model: "grok-build-0.1", source: "env", ignored: null });
  // Labs without a cheap default keep the soul id.
  assert.deepEqual(everydayModel("gemini", "gemini-2.0-flash-exp", "gemini-3.8-flash"), { model: "gemini-3.8-flash", source: "soul", ignored: "gemini-2.0-flash-exp" });
});

test("the chain uses the everyday model for chats and keeps the soul id for creators", () => {
  assert.match(chain, /const model = realModel\(p, l\.model, true\);/);
  assert.match(chain, /const creatorModel = realModel\(p, creatorSoul\);/);
  assert.match(chain, /export const CHAIN: Link\[\] = orderChain\(BASE_CHAIN\);/);
  assert.match(probe, /everydayModel\("grok", env\.GROK_MODEL, CURRENT_MODELS\.grok\)/);
});

test("Anthropic workspace header only from a plain workspace id", () => {
  assert.deepEqual(anthropicHeaders({}), {});
  assert.deepEqual(anthropicHeaders({ ANTHROPIC_WORKSPACE_ID: "wrkspc_01AbC" }), { "anthropic-workspace-id": "wrkspc_01AbC" });
  assert.deepEqual(anthropicHeaders({ ANTHROPIC_WORKSPACE_ID: "bad value; x" }), {});
});

test("failure tags name the real cause without keeping the message", () => {
  assert.equal(failureTag({ status: 400, message: '400 {"error":{"message":"This API key is not scoped to a workspace, so this request must include the anthropic-workspace-id header"}}' }), "HTTP 400 workspace-id-needed");
  assert.equal(failureTag({ status: 400, message: "Your credit balance is too low to access the Anthropic API." }), "HTTP 400 credit-balance");
  assert.equal(failureTag({ status: 400, message: "API key not valid. Please pass a valid API key." }), "HTTP 400 bad-key");
  assert.equal(failureTag({ status: 400, message: "API key expired. Please renew the API key." }), "HTTP 400 key-expired");
  assert.equal(failureTag({ status: 403, message: "Your team has either used all available credits or reached its monthly spending limit." }), "HTTP 403 spending-limit");
  assert.equal(failureTag({ status: 403, message: "Your API key or team is blocked." }), "HTTP 403 blocked");
  assert.equal(failureTag({ status: 403 }), "HTTP 403 forbidden");
});

test("crisis lines and the all-quiet reply are untouched", () => {
  assert.match(chain, /call 999\.\nTo talk to someone, Samaritans are free, any time, on 116 123/);
  assert.match(chain, /text SHOUT to 85258/);
  assert.match(chain, /NHS 111 option 2/);
});
