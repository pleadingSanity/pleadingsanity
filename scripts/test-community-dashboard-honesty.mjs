import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../community-dashboard.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

const forbidden = [
  'Sarah C.',
  'Marcus J.',
  'Aisha R.',
  '2,847',
  '3,102',
  '£124,500',
  '£2.3M',
  '94.7%',
  '99.94%',
  'Crisis Response: OPERATIONAL',
  '24/7 support active',
  'All data anonymized',
  'Vote recorded',
  'Council will review',
  'launching next week',
  'Training portal opening',
  'Now live',
  'Faster crisis detection',
  'Fully anonymized'
];

test('community board does not present invented people, ballots, money or a crisis team', () => {
  for (const phrase of forbidden) assert.equal(page.includes(phrase), false, phrase);
  assert.match(page, /This house does not run a response team/);
  assert.match(page, /tel:999/);
  assert.match(page, /116 123/);
  assert.match(page, /85258/);
  assert.match(page, /NHS 111/);
  assert.match(page, /Open seat/);
  assert.match(page, /not a community ballot/);
  assert.match(page, /Not published/);
  assert.match(page, /Not measured/);
  assert.match(page, /Nothing was sent/);
  assert.match(page, /There is no financial report to open/);
  assert.equal(page.includes('class="crisis-status operational"'), false);
});

test('the corrected board stays on the existing service worker and install path', () => {
  const site = readFileSync(new URL('../js/site.js', import.meta.url), 'utf8');
  assert.match(sw, /pleading-sanity-static-v102/);
  assert.match(sw, /\/community-dashboard\.html/);
  assert.match(site, /navigator\.serviceWorker\.register\('\/sw\.js'\)/);
  assert.equal(sw.includes('pleading-sanity-static-v101'), false);
});
