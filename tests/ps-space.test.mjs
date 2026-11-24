// P.S Space profile studio + site-wide image pass (23 Nov 2026).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '');
const js = strip(read('js/ps-space.js'));
const css = strip(read('css/ps-space.css'));

test('P.S Space never autoplays, uploads or calls unknown third parties', () => {
  assert.doesNotMatch(js, /\.autoplay\s*=\s*true|autoplay=|autoplay:|setAttribute\('autoplay'/i);
  assert.equal((js.match(/\.play\(\)/g) || []).length, 1, 'play only inside the tap handler');
  assert.match(js, /preload = 'none'/);
  const hosts = [...js.matchAll(/https:\/\/([a-z0-9.-]+)/gi)].map((m) => m[1]);
  assert.deepEqual([...new Set(hosts)].sort(), ['www.youtube-nocookie.com', 'www.youtube.com'], 'only YouTube, and only after a tap');
  assert.doesNotMatch(js, /type=["']?file|FileReader|navigator\.sendBeacon|gtag|analytics/i);
  const fetches = (js.match(/fetch\(([^,)]+)/g) || []).sort();
  assert.deepEqual(fetches, ["fetch('/api/me/space'", "fetch('/data/ps-playlists.json'", 'fetch(path'].sort());
  for (const m of js.matchAll(/getJSON\(([^)]+)\)/g)) assert.match(m[1], /^'\/api\/|^path$/, 'same-origin API only: ' + m[1]);
});

test('YouTube player loads only on a tap, from the privacy-enhanced host', () => {
  const tap = js.slice(js.indexOf("yt.addEventListener('click'"), js.indexOf('}, { once: true });'));
  assert.match(tap, /createElement\('iframe'\)/);
  assert.match(tap, /youtube-nocookie\.com\/embed\/' \+ encodeURIComponent\(id\)/);
  assert.equal((js.match(/createElement\('iframe'\)/g) || []).length, 1);
});

test('account space API: owner-only writes, visibility-checked reads, no schema change', () => {
  const api = strip(read('netlify/functions/profile-space.mts'));
  assert.match(api, /path: \["\/api\/me\/space", "\/api\/profiles\/:username\/space"\]/);
  assert.match(api, /if \(!user\) return unauthorized\(\);/);
  assert.match(api, /store\(\)\.set\(userId,/);
  assert.match(api, /where\(eq\(profiles\.userId, userId\)\)/, 'profile basics only ever update the caller');
  assert.match(api, /isBlockedEitherWay/);
  assert.match(api, /p\.pageVisibility !== "public"/);
  assert.match(api, /areFriends/);
  assert.match(api, /x\.protocol !== "https:"/);
  assert.match(api, /Not allowed from another site/);
  assert.doesNotMatch(api, /console\.error\([^;\n]*,\s*error\s*\)/);
  assert.match(read('netlify/functions/profile.mts'), /getStore\("profile-space"\)\.delete\(userId\)/, 'account deletion erases the space');
});

test('public member page shows the space and keeps every crisis number tappable', () => {
  const h = read('member.html');
  assert.match(h, /\/css\/ps-space\.css/);
  assert.match(h, /\/js\/ps-space\.js/);
  for (const n of ['tel:999', 'tel:116123', 'sms:85258', 'tel:111']) assert.ok(h.includes(n), 'member.html ' + n);
  assert.match(read('js/page-member.js'), /PSSpace\?\.mountPublic/);
});

test('profile songs only come from approved first-party P.S library audio and keep their label', () => {
  assert.match(js, /t\.approved === true/);
  assert.match(js, /indexOf\('\/assets\/audio\/'\) === 0/);
  assert.match(js, /AI-generated/);
});

test('links are https only and rendered with safe rel', () => {
  assert.match(js, /x\.protocol === 'https:'/);
  assert.match(js, /rel="noopener noreferrer nofollow ugc"/);
});

test('themes stay off the brand ban list (no purple, pink or indigo)', () => {
  for (const src of [js, css]) {
    assert.doesNotMatch(src, /#(ff4d8d|a855f7|8b5cf6|7c3aed|6366f1|4f46e5|ec4899|db2777|d946ef|c026d3)\b|purple|violet|indigo|magenta|fuchsia/i);
  }
  assert.ok((js.match(/\{ id: '[a-z-]+', name: '[^']+', s: \[/g) || []).length >= 6, '6-8 themes');
});

test('my-space and profile pages keep the crisis footer exact and tappable', () => {
  for (const f of ['my-space.html', 'profile.html']) {
    const h = read(f);
    for (const n of ['tel:999', 'tel:116123', 'sms:85258', 'tel:111']) assert.ok(h.includes(n), f + ' ' + n);
    assert.match(h, /id="ps-space"/);
    assert.match(h, /\/js\/ps-space\.js/);
  }
  assert.doesNotMatch(read('my-space.html'), /music-player\.js/, 'no competing site player on the space page');
});

test('home hero images are responsive, LCP is prioritised once, below-fold art is lazy', () => {
  const h = read('index.html');
  assert.match(h, /midland-night-800\.avif 800w/);
  assert.match(h, /hero-enhanced-800\.webp 800w/);
  const legacy = h.slice(h.indexOf('ps-legacy-hero'), h.indexOf('</figure>', h.indexOf('ps-legacy-hero')));
  assert.match(legacy, /loading="lazy"/);
  assert.doesNotMatch(legacy, /fetchpriority/);
  const cabin = h.slice(h.indexOf('home-sanctuary-art'), h.indexOf('</figure>', h.indexOf('home-sanctuary-art')));
  assert.match(cabin, /loading="lazy"/);
});

test('every srcset candidate on public pages points at a real file', () => {
  const pages = readdirSync(new URL('./', root)).filter(f => f.endsWith('.html')).concat(['music/index.html']);
  const missing = [];
  for (const p of pages) {
    const h = read(p);
    for (const m of h.matchAll(/srcset="([^"]+)"/g)) {
      if (m[1].includes('${')) continue;
      for (const part of m[1].split(',')) {
        const u = part.trim().split(/\s+/)[0];
        if (!u.startsWith('/') || u.startsWith('//')) continue;
        if (!existsSync(new URL('.' + u, root))) missing.push(p + ' ' + u);
      }
    }
  }
  assert.deepEqual(missing, []);
});
