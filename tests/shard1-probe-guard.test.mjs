import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

// Shard 1 (functions+arron) regression tests — full-power audit 2026-11-10.
// Covers: probe endpoint lockdown, credential sanitization, finance feed SSRF guard,
// crisis signpost completeness, tappable crisis numbers on Arron pages.
// Behavioral tests extract the pure helpers from source and eval them, so the
// heavy Netlify/DB imports in the function files are never loaded.

const probeSrc = readFileSync(new URL("../netlify/functions/arron-health.mts", import.meta.url), "utf8");
const financeSrc = readFileSync(new URL("../netlify/functions/finance-providers.mts", import.meta.url), "utf8");
const arronSrc = readFileSync(new URL("../netlify/functions/arron.mts", import.meta.url), "utf8");

// Extract a top-level function/const block from TS source, strip types, return it as JS.
function extractBlock(src, startRe) {
  const m = startRe.exec(src);
  if (!m) throw new Error("marker not found");
  let i = m.index;
  // find the opening brace or the end of a const arrow one-liner
  const braceStart = src.indexOf("{", i);
  const semi = src.indexOf(";", i);
  if (braceStart === -1 || (semi !== -1 && semi < braceStart)) {
    // one-liner const arrow: take to the semicolon
    return stripTypeScriptTypes(src.slice(i, semi + 1)).replace(/^export\s+/, "");
  }
  let depth = 0;
  let j = braceStart;
  for (; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}") { depth--; if (depth === 0) { j++; break; } }
  }
  return stripTypeScriptTypes(src.slice(i, j)).replace(/^export\s+/, "");
}

function evalFn(block, name) {
  return new Function(`${block}; return ${name};`)();
}

test("probe guard: PS_PROBE_TOKEN + AI rate limit + 403 on mismatch, probe=0 stays public", () => {
  assert.match(probeSrc, /PS_PROBE_TOKEN/, "PS_PROBE_TOKEN env is checked");
  assert.match(probeSrc, /allow\("ai", context\)/, "AI rate-limit bucket applied to probes");
  assert.match(probeSrc, /403/, "wrong token returns 403");
  assert.match(probeSrc, /probeLevel !== "0"/, "guard only applies to probe 1/2, not probe=0");
  assert.doesNotMatch(probeSrc, /\/api\/arron\/health/, "still repurposed to /api/ops/ai-probe only");
});

test("probe guard: invalid probe level returns 400, valid levels 0/1/2 accepted", () => {
  assert.match(probeSrc, /probe must be 0, 1 or 2/, "invalid probe level rejected with message");
  assert.match(probeSrc, /probeLevel !== "0" && probeLevel !== "1" && probeLevel !== "2"/, "level whitelist");
});

test("sanitizeProbeError strips credential-looking strings", () => {
  const tokenishBlock = stripTypeScriptTypes(probeSrc.match(/const TOKENISH[^;]*;/)[0]);
  const sanitizeBlock = stripTypeScriptTypes(probeSrc.match(/export const sanitizeProbeError[^;]*;/)[0]).replace(/^export\s+/, "");
  const sanitizeProbeError = evalFn(`${tokenishBlock}\n${sanitizeBlock}`, "sanitizeProbeError");
  // Token-like fixtures are built by concatenation so the literal never appears in the repo (Netlify secret-scan block mode).
  const sk = "s" + "k-" + "abcdefghijklmnopqrstuvwx";
  const nfp = "nfp" + "_" + "abcdefghijklmnopqrstuvwx";
  const ghp = "ghp" + "_" + "abcdefghijklmnopqrstuvwx";
  const xox = "xoxb" + "-" + "abcdefghijklmnopqrstuvwx" + "-123";
  const bearer = "Bearer " + "abcdefghijklmnopqrstuvwx";
  assert.equal(sanitizeProbeError(`err ${sk} here`), "err [redacted] here");
  assert.equal(sanitizeProbeError(nfp), "[redacted]");
  assert.equal(sanitizeProbeError(`token ${ghp} expired`), "token [redacted] expired");
  assert.equal(sanitizeProbeError(xox), "[redacted]-123");
  assert.equal(sanitizeProbeError(`auth ${bearer} sent`), "auth [redacted] sent");
  assert.equal(sanitizeProbeError("normal error: HTTP 429 Too Many Requests"), "normal error: HTTP 429 Too Many Requests");
});

test("finance feedUrlAllowed: public https allowed, private/localhost/credentialed blocked", () => {
  const block = extractBlock(financeSrc, /export function feedUrlAllowed/);
  const feedUrlAllowed = evalFn(block, "feedUrlAllowed");
  assert.equal(feedUrlAllowed("https://providers.example.com/feed.json"), true, "public https allowed");
  assert.equal(feedUrlAllowed("http://providers.example.com/feed.json"), false, "http blocked");
  assert.equal(feedUrlAllowed("https://localhost/feed.json"), false, "localhost blocked");
  assert.equal(feedUrlAllowed("https://127.0.0.1/feed.json"), false, "loopback IPv4 blocked");
  assert.equal(feedUrlAllowed("https://192.168.1.5/feed.json"), false, "private 192.168 blocked");
  assert.equal(feedUrlAllowed("https://10.0.0.5/feed.json"), false, "private 10 blocked");
  assert.equal(feedUrlAllowed("https://169.254.169.254/latest/meta-data/"), false, "link-local metadata blocked");
  assert.equal(feedUrlAllowed("https://metadata.google.internal/feed"), false, "GCP metadata blocked");
  assert.equal(feedUrlAllowed("https://user:pass@example.com/feed.json"), false, "credentials in URL blocked");
  assert.equal(feedUrlAllowed("not a url"), false, "garbage blocked");
});

test("finance-providers calls feedUrlAllowed before fetching the env feed", () => {
  assert.match(financeSrc, /if \(!feedUrlAllowed\(feed\)\)/, "guard invoked on env feed URL");
  assert.match(financeSrc, /not a public https URL/, "human-friendly blocked message");
});

test("arron.mts CRISIS_SIGNPOST includes findahelpline.com and all required numbers", () => {
  assert.match(arronSrc, /findahelpline\.com/, "findahelpline in backend crisis signpost");
  assert.match(arronSrc, /999/, "999 present");
  assert.match(arronSrc, /116 123/, "116 123 present");
  assert.match(arronSrc, /85258/, "SHOUT 85258 present");
  assert.match(arronSrc, /0800 1111/, "Childline present");
  assert.match(arronSrc, /0808 2000 247/, "DA helpline present");
  assert.match(arronSrc, /AbortSignal\.timeout\(5000\)/, "deploy hook fetch has a timeout (latency buff)");
});

test("Arron pages carry tappable sms:85258 and findahelpline.com", () => {
  for (const f of ["arron.html", "arron-app.html", "app.html"]) {
    const src = readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
    assert.match(src, /sms:85258/, `${f}: SHOUT is tappable via sms:`);
    assert.match(src, /findahelpline\.com/, `${f}: findahelpline.com linked`);
    assert.match(src, /tel:999/, `${f}: 999 tappable`);
    assert.match(src, /tel:116123/, `${f}: 116123 tappable`);
  }
});
