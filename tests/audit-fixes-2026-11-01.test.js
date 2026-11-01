// Audit fixes for 1 Nov 2026. Read-only. No network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url);

function read(name) {
  return readFileSync(new URL(name, root), 'utf8');
}

const banned = /#ff00ff|#ff4d8d|#ff6688|rgba\(\s*255\s*,\s*0\s*,\s*255|--magenta|var\(\s*--magenta\)/i;

test('top-level pages do not use magenta or pink accents', () => {
  const pages = readdirSync(root).filter((name) => name.endsWith('.html'));
  const hits = [];
  for (const name of pages) {
    const text = read(name);
    if (banned.test(text)) hits.push(name);
  }
  assert.deepEqual(hits, []);
});

test('the home crisis strip is first and in the house order', () => {
  const html = read('index.html');
  const body = html.slice(html.indexOf('<body>'));
  const strip = body.slice(0, 700);
  assert.match(strip, /class="ps-support-strip"/);
  const samaritans = strip.indexOf('tel:116123');
  const shout = strip.indexOf('sms:85258');
  const nhs = strip.indexOf('href="tel:111"');
  const emergency = strip.indexOf('href="tel:999"');
  assert.ok(samaritans > 0 && samaritans < shout && shout < nhs && nhs < emergency);
  assert.match(strip, /116 123/);
  assert.match(strip, /85258/);
});

test('Arron shows NHS 111 and 999, and video fallbacks use /api/ytFeed', () => {
  const arron = read('arron.html');
  assert.match(arron, /href="tel:111"/);
  assert.match(arron, /href="tel:999"/);
  for (const name of ['feed.html', 'videos.html']) {
    const page = read(name);
    assert.match(page, /\/api\/ytFeed/);
    assert.equal(page.includes('/.netlify/functions/ytFeed'), false);
  }
  assert.match(read('safety.html'), /name="description"/);
  assert.match(read('sw.js'), /pleading-sanity-static-v107/);
});
