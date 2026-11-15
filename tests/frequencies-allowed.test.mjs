import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ALLOWED = ["174", "285", "432", "528", "741", "963"];
const DISALLOWED = ["396", "417", "639", "852"];

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("aura-hz.html contains no disallowed frequencies", () => {
  const html = read("aura-hz.html");
  for (const f of DISALLOWED) {
    const re = new RegExp(`(?<!\\d)${f}(?!\\d)`);
    assert.ok(!re.test(html), `aura-hz.html must not contain ${f} as a standalone number`);
  }
});

test("aura-hz.html uses only allowed tones in FREQ_ORDER", () => {
  const html = read("aura-hz.html");
  const m = html.match(/FREQ_ORDER\s*=\s*\[([^\]]+)\]/);
  assert.ok(m, "FREQ_ORDER must exist");
  const freqs = m[1].split(",").map((s) => s.trim());
  for (const f of freqs) {
    assert.ok(ALLOWED.includes(f), `${f} is not an allowed tone`);
  }
  assert.deepEqual([...new Set(freqs)].sort(), ALLOWED.slice().sort(), "FREQ_ORDER must include all six allowed tones");
});

test("frequencies.html contains no disallowed frequencies", () => {
  const html = read("frequencies.html");
  for (const f of DISALLOWED) {
    assert.ok(!html.includes(`data-hz="${f}"`), `frequencies.html must not have data-hz=${f}`);
    assert.ok(!html.includes(`${f} Hz`), `frequencies.html must not show ${f} Hz`);
  }
});

test("frequencies.html shows exactly the 6 allowed tones", () => {
  const html = read("frequencies.html");
  const hz = [...html.matchAll(/data-hz="(\d+)"/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(hz)].sort(), ALLOWED.slice().sort());
});
