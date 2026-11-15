// PWA "Install Sanity" app checks (15 Nov 2026): manifests, icons, screenshots, service worker.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p.replace(/^\//, ''), root));
const json = p => JSON.parse(read(p).toString('utf8'));
function dims(path) {
  const b = read(path.split('#')[0]);
  if (b.slice(1, 4).toString() === 'PNG') return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') {
    const kind = b.slice(12, 16).toString();
    if (kind === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (kind === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (kind === 'VP8L') { const n = b.readUInt32LE(21); return [1 + (n & 0x3fff), 1 + ((n >> 14) & 0x3fff)]; }
  }
  return null;
}
const BRAND = ['#0b0f19', '#00fff0', '#38bdf8'];
for (const file of ['manifest.json', 'manifest-arron.json', 'manifest-finance.json', 'manifest-solitaire.json']) {
  test(`${file}: valid, on-brand, every icon exists at its declared size, maskable icons are padded files`, () => {
    const m = json(file);
    assert.ok(m.name && m.short_name && m.start_url && m.display);
    assert.ok(BRAND.includes(m.background_color.toLowerCase()) && BRAND.includes(m.theme_color.toLowerCase()));
    for (const icon of m.icons) {
      assert.ok(existsSync(new URL(icon.src.slice(1), root)), icon.src);
      if (icon.sizes !== 'any') assert.deepEqual(dims(icon.src), icon.sizes.split('x').map(Number), icon.src);
    }
    const any = m.icons.filter(i => (i.purpose || 'any') === 'any');
    const mask = m.icons.filter(i => i.purpose === 'maskable');
    assert.ok(any.some(i => i.sizes === '192x192') && any.some(i => i.sizes === '512x512'));
    assert.ok(mask.some(i => i.sizes === '512x512'));
    for (const i of mask) assert.match(i.src, /icon-maskable-/, 'maskable icons need the padded safe-zone file');
    assert.ok(!m.icons.some(i => /crying-brain-logo-512\.webp/.test(i.src)), 'the purple-glow webp is not an app icon');
  });
}
test('main manifest: crisis help is the first shortcut, screenshots exist at declared sizes with narrow and wide', () => {
  const m = json('manifest.json');
  assert.equal(m.shortcuts[0].url, '/crisis.html');
  assert.ok(m.shortcuts.length <= 10, 'browsers only read the first 10 shortcuts');
  assert.equal(m.id, '/'); assert.equal(m.scope, '/');
  for (const s of m.shortcuts) for (const i of s.icons || []) assert.ok(existsSync(new URL(i.src.slice(1), root)));
  assert.ok(m.screenshots.some(s => s.form_factor === 'narrow') && m.screenshots.some(s => s.form_factor === 'wide'));
  for (const s of m.screenshots) assert.deepEqual(dims(s.src), s.sizes.split('x').map(Number), s.src);
  const text = JSON.stringify(m);
  assert.doesNotMatch(text, /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u, 'no emoji in the manifest');
});
test('service worker: offline page, crisis list and new icons precached; preload, bounded cache, private pages never cached', () => {
  const sw = read('sw.js').toString('utf8');
  new Function(sw.replace(/self\.addEventListener/g, '(()=>{})'));
  const list = sw.slice(sw.indexOf('const PRECACHE_URLS'), sw.indexOf('];', sw.indexOf('const PRECACHE_URLS')));
  for (const url of ['/offline.html', '/crisis.html', '/js/crisis-phrases.js', '/assets/icons/icon-maskable-512x512.png', '/manifest.json'])
    assert.ok(list.includes(`'${url}'`), url);
  for (const url of list.match(/'\/[^']*'/g).map(s => s.slice(1, -1)).filter(u => u !== '/'))
    assert.ok(existsSync(new URL(url.slice(1), root)), 'precached file missing: ' + url);
  assert.match(sw, /navigationPreload\.enable/);
  assert.match(sw, /event\.preloadResponse/);
  assert.match(sw, /DYNAMIC_LIMIT/);
  assert.match(sw, /isPrivatePath\(url\.pathname\)/);
  assert.match(sw, /skipWaiting/);
  assert.match(sw, /n !== STATIC_CACHE && n !== DYNAMIC_CACHE/);
  const offline = read('offline.html').toString('utf8');
  for (const n of ['116 123', '85258', '111', '999']) assert.ok(offline.includes(n), 'offline page keeps ' + n);
});
test('home and App Hub carry iOS home-screen tags; /favicon.ico resolves', () => {
  for (const page of ['index.html', 'get-the-app.html']) {
    const h = read(page).toString('utf8');
    assert.match(h, /rel="apple-touch-icon"/); assert.match(h, /apple-mobile-web-app-capable/); assert.match(h, /name="theme-color" content="#0b0f19"/);
  }
  assert.match(read('_redirects').toString('utf8'), /^\/favicon\.ico\s+\/assets\/favicon\.ico\s+200/m);
  assert.deepEqual(dims('/assets/apple-touch-icon.png'), [180, 180]);
});
test('binary-src: every base64 asset decodes to the file the site serves (run by pretest and the Netlify build)', async () => {
  const { readdirSync, statSync } = await import('node:fs');
  const base = new URL('binary-src/', root);
  if (!existsSync(base)) return;
  const walk = dir => readdirSync(dir).flatMap(n => { const u = new URL(n, dir); return statSync(u).isDirectory() ? walk(new URL(n + '/', dir)) : [u]; });
  for (const u of walk(base)) {
    if (!u.pathname.endsWith('.base64')) continue;
    const rel = decodeURIComponent(u.pathname.slice(base.pathname.length, -'.base64'.length));
    const bytes = Buffer.from(readFileSync(u, 'utf8').replace(/\s+/g, ''), 'base64');
    assert.ok(existsSync(new URL(rel, root)), 'not materialized: ' + rel);
    assert.ok(readFileSync(new URL(rel, root)).equals(bytes), 'stale: ' + rel);
  }
  assert.match(read('scripts/validate-build.cjs').toString('utf8'), /materialize-binary-assets/);
});
