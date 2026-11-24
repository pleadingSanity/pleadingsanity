// Home: image-led jump tiles and the coming-soon drop teaser (23 Nov 2026).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const html = read('index.html');

test('home has six image-led jump tiles with real images', () => {
  const tiles = [...html.matchAll(/<a class="hx-tile" href="([^"]+)"><img src="([^"]+)"/g)];
  assert.deepEqual(tiles.map(t => t[1]), ['/arron.html', '/music/', '/my-space.html', '/prints.html', '/frequencies.html', '/journal-vault.html']);
  for (const t of tiles) assert.ok(existsSync(new URL('.' + t[2], root)), t[2]);
});

test('drop teaser: exact wording, no price, no designer name, safe external link', () => {
  const drop = html.slice(html.indexOf('<aside class="hx-drop"'), html.indexOf('</aside>', html.indexOf('<aside class="hx-drop"')));
  assert.match(drop, /New drop coming soon: Flexi Mech Dragon in silk rainbow/);
  assert.match(drop, /href="https:\/\/legallyinsane\.co\.uk" target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(drop, /£|\$|price|WinsomeBog|croc/i);
});

test('home tiles CSS and dragon art hold the brand lock', () => {
  const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const f of ['css/home-tiles.css', 'assets/images/svg/flexi-mech-dragon-silk.svg']) {
    assert.doesNotMatch(strip(read(f)), /#(ff4d8d|a855f7|8b5cf6|7c3aed|6366f1|4f46e5|ec4899|db2777|d946ef|c026d3)\b|purple|violet|indigo|magenta|fuchsia/i, f);
  }
});

test('home preloads the AVIF LCP art once', () => {
  assert.equal((html.match(/rel="preload" as="image" type="image\/avif"/g) || []).length, 1);
});
