import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Shard 1 (functions+arron) regression tests — full-power audit 2026-11-10.
// Covers: probe endpoint lockdown, credential sanitization, finance feed SSRF guard,
// crisis signpost completeness, tappable crisis numbers on Arron pages.

const probeSrc = readFileSync(new URL("../netlify/functions/arron-health.mts", import.meta.url), "utf8");
const financeSrc = readFileSync(new URL("../netlify/functions/finance-providers.mts", import.meta.url), "utf8");
const arronSrc = readFileSync(new URL("../netlify/functions/arron.mts", import.meta.url), "utf8");

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

test("sanitizeProbeError strips credential-looking strings", async () => {
  const { sanitizeProbeError } = await import("../netlify/functions/arron-health.mts");
  assert.equal(sanitizeProbeError("err sk-abcdefghijklmnopqrstuvwx here"), "err [redacted] here");
  assert.equal(sanitizeProbeError("nfp_abcdefghijklmnopqrstuvwx"), "[redacted]");
  assert.equal(sanitizeProbeError("token ghp_abcdefghijklmnopqrstuvwx expired"), "token [redacted] expired");
  assert.equal(sanitizeProbeError("xoxb-abcdefghijklmnopqrstuvwx-123"), "[redacted]-123");
  assert.equal(sanitizeProbeError("auth Bearer abcdefghijklmnopqrstuvwx sent"), "auth [redacted] sent");
  assert.equal(sanitizeProbeError("normal error: HTTP 429 Too Many Requests"), "normal error: HTTP 429 Too Many Requests");
});

test("finance feedUrlAllowed: public https allowed, private/localhost/credentialed blocked", async () => {
  const { feedUrlAllowed } = await import("../netlify/functions/finance-providers.mts");
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
