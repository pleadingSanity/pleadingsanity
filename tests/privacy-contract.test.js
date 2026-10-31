// Privacy regression contract checks — read-only; no network or database access.
// Run with: node --test tests/privacy-contract.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const arron = readFileSync(new URL('../netlify/functions/arron.mts', import.meta.url), 'utf8');
const finance = readFileSync(new URL('../js/finance.js', import.meta.url), 'utf8');
const chain = readFileSync(new URL('../netlify/lib/ai-chain.ts', import.meta.url), 'utf8');

test('Arron routes memory operations through existing handler', () => {
  assert.match(arron, /route === "memory"/);
  assert.match(arron, /req\.method === "DELETE"/);
  assert.match(arron, /resolveMemory\(req\.method === "GET"/);
});

test('Arron deletes messages and memory before returning success', () => {
  const start = arron.indexOf('if (req.method === "DELETE")');
  const end = arron.indexOf('return json({ ok: true, cleared: true })', start);
  assert.ok(start >= 0 && end > start, 'existing deletion success branch found');
  const body = arron.slice(start, end);
  assert.match(body, /db\.delete\(arronMessages\)/);
  assert.match(body, /db\.delete\(arronMemories\)/);
  assert.match(body, /if \(left\) return json\(/);
});

test('Finance deletion covers every registered storage key', () => {
  assert.match(finance, /Object\.values\(KEYS\)\.forEach\(store\.drop\)/);
  assert.match(finance, /profile = \{ \.\.\.E\.EMPTY_PROFILE \}/);
});

test('Finance AI request shares profile only behind explicit consent', () => {
  assert.match(finance, /profile:\s*\$\("a-consent"\)\.checked\s*\?\s*profileSummary\(\)\s*:\s*""/);
});

test('Existing AI chain remains present; do not replace with a new router', () => {
  for (const provider of ['GPT', 'Claude', 'Gemini', 'Grok']) {
    assert.ok(chain.includes(provider), provider + ' referenced');
  }
});

// These source checks are baseline guards, NOT proof of live deletion,
// in-flight cancellation, provider privacy, or complete local-data removal.
