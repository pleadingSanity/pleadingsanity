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
  const fetches = js.match(/fetch\(([^,)]+)/g) || [];
  assert.deepEqual(fetches, ["fetch('/data/ps-playlists.json'"], 'only the static library is fetched directly');
  for (const m of js.matchAll(/(?:getJSON|callAPI)\(([^),]+)/g)) assert.match(m[1], /^'\/api\/|^path$/, 'same-origin API only: ' + m[1]);
});

test('signed-in calls use the shared api() helper and auth.js loads before the space script', () => {
  assert.match(js, /import\('\/js\/auth\.js'\)/);
  assert.match(js, /m\.api\(path, opts\)/);
  assert.match(js, /callAPI\('\/api\/me\/space', \{\s*method: 'PUT'/);
  for (const f of ['profile.html', 'my-space.html', 'member.html']) {
    const h = read(f);
    const a = h.indexOf('/js/auth.js'), b = h.indexOf('/js/ps-space.js');
    assert.ok(a > -1 && b > a, f + ': auth.js before ps-space.js');
  }
  assert.match(js, /Saved on this device only/);
});

test('save message follows privacy, and locked public cards re-mount after sign-in', () => {
  assert.match(js, /Live on your public page/);
  assert.match(js, /Visible to signed-in members only/);
  assert.match(js, /Visible to your friends only/);
  assert.match(js, /SAVED_FOR\[d\.privacy\]/);
  assert.doesNotMatch(js, /el\.remove\(\)/, 'locked slot is hidden, not removed');
  assert.match(js, /onAuth\(function \(\) \{ if \(el\.isConnected\)/);
});

test('private hosts are rejected in links, client and server', async () => {
  const api = read('netlify/functions/profile-space.mts');
  const src = js.slice(js.indexOf('function privateHost'), js.indexOf('function ytId'));
  const privateHost = new Function(src + '; return privateHost;')();
  const hostOf = (u) => new URL(u).hostname;
  for (const u of ['https://127.0.0.1/', 'https://10.2.3.4/', 'https://172.16.0.1/', 'https://172.31.255.255/', 'https://192.168.1.1/', 'https://169.254.169.254/', 'https://0.0.0.0/', 'https://[::1]/', 'https://[fc00::1]/', 'https://[fd12:3456::1]/', 'https://[fe80::1]/', 'https://localhost/', 'https://printer.local/']) {
    assert.equal(privateHost(hostOf(u)), true, u);
  }
  for (const u of ['https://172.15.0.1/', 'https://172.32.0.1/', 'https://instagram.com/', 'https://8.8.8.8/']) assert.equal(privateHost(hostOf(u)), false, u);
  assert.match(api, /a === 172 && b >= 16 && b <= 31/);
  assert.match(api, /\^fe\[89ab\]/);
  assert.match(api, /\^f\[cd\]/);
});

test('banner URLs never carry the Identity id; id route stays owner-only', () => {
  const img = strip(read('netlify/functions/images.mts'));
  const api = strip(read('netlify/functions/profile-space.mts'));
  assert.match(img, /"\/api\/images\/banner-of\/:username"/);
  assert.match(img, /pageVisibleTo\(owner\.userId/);
  assert.match(img, /if \(!ownerId \|\| ownerId !== user\.id\) return new Response\("Not found"/);
  assert.match(img, /avatar === `photo:\$\{key\}` && \(await pageVisibleTo/);
  assert.doesNotMatch(api, /images\/banner\/\$\{/);
  assert.match(api, /images\/banner-of\/\$\{encodeURIComponent\(p\.username\)\}/);
});

test('Ocean Neon stays on the brand lock', () => {
  assert.doesNotMatch(js + css, /#a3e635|#22d3ee|#67e8f9/i);
  assert.match(js, /\{ id: 'neon', name: 'Ocean Neon', s: \['#0b0f19', '#38bdf8', '#00fff0'\] \}/);
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
