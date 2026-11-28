import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  classifyFailure,
  listKeys,
  providerReport,
} from "../netlify/lib/provider-config.js";
import {
  PROVIDER_ORDER,
  chatRequest,
  fallbackModels,
  nextStep,
  postChat,
  relayOneModel,
} from "../netlify/lib/provider-fallback.js";

const chainSrc = readFileSync(new URL("../netlify/lib/ai-chain.ts", import.meta.url), "utf8");
const quiet = chainSrc.slice(chainSrc.indexOf("export const ALL_QUIET_REPLY"));

function httpError(status, message, code) {
  return {
    ok: false,
    status,
    async text() {
      return JSON.stringify({ error: { message, code } });
    },
  };
}

function httpText(text) {
  return {
    ok: true,
    status: 200,
    async text() {
      return JSON.stringify({ choices: [{ message: { content: text } }] });
    },
  };
}

test("failure classes stay coarse and never need a key value", () => {
  assert.equal(classifyFailure("HTTP 401 rejected-key"), "auth");
  assert.equal(classifyFailure("HTTP 403 forbidden"), "auth");
  assert.equal(classifyFailure("HTTP 403 spending-limit"), "quota");
  assert.equal(classifyFailure("HTTP 429 quota"), "quota");
  assert.equal(classifyFailure("HTTP 404 model-not-found"), "model");
  assert.equal(classifyFailure("TimeoutError"), "network");
  assert.equal(classifyFailure("HTTP 503"), "network");
  assert.equal(classifyFailure("not tried on this instance"), null);
  assert.equal(classifyFailure("no key"), null);
  assert.equal(nextStep("HTTP 401 rejected-key"), "next-key");
  assert.equal(nextStep("HTTP 403 spending-limit"), "next-key");
  assert.equal(nextStep("HTTP 404 model-not-found"), "next-model");
  assert.equal(nextStep("HTTP 503"), "next-model");
  assert.equal(nextStep("TimeoutError"), "next-provider");
  assert.equal(nextStep("EmptyReply"), "next-model");
});

test("health report says key yes or no and a class, never the secret", () => {
  const secret = "openai-live-secret-value";
  const report = providerReport(
    { OPENAI_API_KEY: secret, GROK_API_KEY: "short" },
    { openai: "HTTP 429 quota", grok: "no key", anthropic: "HTTP 401 rejected-key" },
  );
  assert.equal(report.openai.key, true);
  assert.equal(report.openai.errorClass, "quota");
  assert.equal(report.grok.key, false);
  assert.equal(report.grok.errorClass, null);
  assert.equal(report.anthropic.key, false);
  assert.equal(report.anthropic.errorClass, "auth");
  assert.equal(JSON.stringify(report).includes(secret), false);
  const keys = listKeys("grok", { GROK_API_KEY: "same-grok-secret-1", XAI_API_KEY: "same-grok-secret-1", ARRON_GROK_KEY: "fresh-grok-secret" });
  assert.deepEqual(keys.map((key) => key.name), ["ARRON_GROK_KEY", "GROK_API_KEY"]);
});

test("fallback model list keeps the chosen id first", () => {
  assert.deepEqual(
    fallbackModels("grok", "grok-2", { current: "grok-4.7", grokSecond: "grok-4.3" }),
    ["grok-2", "grok-4.7", "grok-4.3"],
  );
  assert.deepEqual(PROVIDER_ORDER, ["openai", "anthropic", "gemini", "grok"]);
});

test("mocked fetch falls through a dead key and a dead lab to the one that answers", async () => {
  const seen = [];
  const fetchImpl = async (url, options) => {
    const body = JSON.parse(options.body);
    seen.push({ url, model: body.model, auth: options.headers.Authorization || options.headers["x-api-key"] || options.headers["x-goog-api-key"] });
    if (String(url).includes("api.openai.com")) return httpError(429, "You exceeded your current quota", "insufficient_quota");
    if (String(url).includes("api.anthropic.com")) return httpError(401, "invalid x-api-key");
    if (String(url).includes("generativelanguage.googleapis.com") && body.model === undefined && String(url).includes("gemini-2.0-flash-exp")) {
      return httpError(404, "models/gemini-2.0-flash-exp is not found");
    }
    if (String(url).includes("gemini-3.5-flash-lite")) {
      return {
        ok: true,
        status: 200,
        async text() {
          return JSON.stringify({ candidates: [{ content: { parts: [{ text: "I'm here with you." }] } }] });
        },
      };
    }
    if (String(url).includes("api.x.ai")) return httpText("should not be asked");
    return httpError(500, "unexpected url");
  };

  const labs = [
    { provider: "openai", model: "gpt-5.6-sol", key: "openai-test-key-111" },
    { provider: "anthropic", model: "claude-sonnet-5-5", key: "anthropic-test-key-1" },
    { provider: "gemini", model: "gemini-2.0-flash-exp", key: "gemini-test-key-1111" },
    { provider: "grok", model: "grok-4.7", key: "grok-test-key-111111" },
  ];
  let reply = "";
  for (const lab of labs) {
    const models = lab.provider === "gemini"
      ? fallbackModels("gemini", lab.model, { geminiDirect: "gemini-3.5-flash-lite" })
      : [lab.model];
    try {
      reply = await relayOneModel({
        keys: [{ value: lab.key, name: lab.provider, dropIn: true }],
        classify: (error) => `${error.name || "error"} ${error.message || ""} HTTP ${error.status || ""}`,
        send: async (key) => {
          let last;
          for (const model of models) {
            try {
              return await postChat({
                provider: lab.provider,
                apiKey: key.value,
                dropIn: true,
                model,
                system: "You are Arron.",
                turns: [{ role: "user", content: "hello" }],
                maxTokens: 100,
              }, fetchImpl);
            } catch (error) {
              last = error;
              const tag = `HTTP ${error.status} ${error.message}`;
              if (nextStep(tag) !== "next-model") throw error;
            }
          }
          throw last;
        },
      });
      break;
    } catch (error) {
      const tag = `HTTP ${error.status || ""} ${error.message || ""}`;
      if (nextStep(tag) === "next-provider" || nextStep(tag) === "next-key") continue;
      throw error;
    }
  }

  assert.equal(reply, "I'm here with you.");
  assert.deepEqual(seen.map((call) => call.url), [
    "https://api.openai.com/v1/chat/completions",
    "https://api.anthropic.com/v1/messages",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
  ]);
  assert.equal(seen[0].model, "gpt-5.6-sol");
  assert.equal(seen[0].auth.startsWith("Bearer "), true);
  assert.equal(seen[1].url.includes("key="), false);
  assert.equal(seen[2].url.includes("key="), false);
  assert.equal(seen[2].auth, "gemini-test-key-1111");
  assert.equal(String(seen[3].url).includes("api.x.ai"), false);
});

test("a rejected Grok key falls through to the next Grok key name", async () => {
  const used = [];
  const fetchImpl = async (url, options) => {
    assert.equal(url, "https://api.x.ai/v1/chat/completions");
    const token = options.headers.Authorization;
    used.push(token);
    const body = JSON.parse(options.body);
    assert.equal(body.model, "grok-4.7");
    assert.equal(url.includes("key="), false);
    if (token.endsWith("dead-grok-key-111")) {
      return httpError(403, "Your team does not have any credits", "spending-limit");
    }
    return httpText("Hello from the live key.");
  };
  const text = await relayOneModel({
    keys: [
      { value: "dead-grok-key-111", name: "GROK_API_KEY", dropIn: false },
      { value: "live-grok-key-111", name: "XAI_API_KEY", dropIn: false },
    ],
    classify: (error) => `HTTP ${error.status} ${error.message}`,
    send: (key) => postChat({
      provider: "grok",
      apiKey: key.value,
      dropIn: true,
      model: "grok-4.7",
      system: "You are Arron.",
      turns: [{ role: "user", content: "hello" }],
      maxTokens: 80,
    }, fetchImpl),
  });
  assert.equal(text, "Hello from the live key.");
  assert.equal(used.length, 2);
});

test("provider errors do not echo a key, and the quiet reply leads with the crisis numbers", async () => {
  await assert.rejects(
    () => postChat({
      provider: "openai",
      apiKey: "openai-test-key-111",
      dropIn: true,
      model: "gpt-5.6-sol",
      system: "x",
      turns: [{ role: "user", content: "hi" }],
      maxTokens: 20,
    }, async () => httpError(401, "Incorrect API key sk-test-redact-me")),
    (error) => {
      assert.equal(error.status, 401);
      assert.equal(String(error.message).includes("sk-test"), false);
      assert.equal(String(error.message).includes("redact-me"), false);
      return true;
    },
  );
  const request = chatRequest({
    provider: "grok",
    apiKey: "grok-header-only-11",
    model: "grok-4.7",
    system: "You are Arron.",
    turns: [{ role: "user", content: "hello" }],
    maxTokens: 10,
  });
  assert.equal(request.url, "https://api.x.ai/v1/chat/completions");
  assert.equal(request.url.includes("grok-header-only-11"), false);
  assert.equal(request.headers.Authorization, "Bearer grok-header-only-11");
  assert.match(quiet, /Samaritans are free on 116 123/);
  assert.match(quiet, /Text SHOUT to 85258/);
  assert.match(quiet, /NHS 111/);
  assert.match(quiet, /call 999/);
  assert.ok(quiet.indexOf("116 123") < quiet.indexOf("I'm sorry"));
  assert.match(chainSrc, /postChat/);
  assert.match(chainSrc, /relayOneModel/);
  assert.match(chainSrc, /https:\/\/api\.x\.ai\/v1/);
});
