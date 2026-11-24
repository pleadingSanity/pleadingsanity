// Music page buff (23 Nov 2026): now-playing hero, album grid, recent row, P.S Space CTA, lighter covers.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const html = read('music/index.html');
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '');

test('now-playing hero sits above the playlists and nothing autoplays', () => {
  assert.ok(html.indexOf('ps-now-hero') > 0 && html.indexOf('ps-now-hero') < html.indexOf('id="ps-playlists-list"'));
  assert.doesNotMatch(html, /<audio[^>]*\bautoplay/i);
});

test('P.S Space call to action links to the profile studio', () => {
  assert.match(html, /<a class="ps-space-cta" href="\/my-space\.html">/);
});

test('crisis numbers stay exact and tappable on the music page', () => {
  for (const n of ['tel:999', 'tel:116123', 'sms:85258', 'tel:111']) assert.ok(html.includes(n), n);
});

test('music buff CSS holds the brand lock', () => {
  assert.doesNotMatch(strip(read('css/ps-music-buff.css')), /#(ff4d8d|a855f7|8b5cf6|7c3aed|6366f1|4f46e5|ec4899|db2777)\b|purple|violet|indigo|magenta|fuchsia/i);
});

test('discovery covers have AVIF and WebP versions far lighter than the JPEGs, JPEG kept as fallback', () => {
  const css = read('css/listening-room.css');
  for (const n of ['cover-bass', 'cover-uk-grime', 'cover-rnb']) {
    for (const ext of ['avif', 'webp']) {
      const f = new URL(`images/radio/${n}.${ext}`, root);
      assert.ok(existsSync(f), n + '.' + ext);
      assert.ok(statSync(f).size < statSync(new URL(`images/radio/${n}.jpg`, root)).size / 4, n + '.' + ext + ' is small');
    }
    assert.match(css, new RegExp(`url\\('/images/radio/${n}\\.jpg'\\)`), 'jpeg fallback kept');
    assert.match(css, new RegExp(`/images/radio/${n}\\.avif"\\) type\\("image/avif"\\)`));
  }
});
