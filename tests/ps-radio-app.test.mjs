import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');
const data = JSON.parse(read('data/ps-playlists.json'));
const creator = JSON.parse(read('data/creator-recent.json'));
const page = read('music/index.html');
const persist = read('js/ps-radio-persist.js');
const ui = read('js/ps-playlists.js');
const css = read('css/ps-radio-app.css') + read('css/ps-playlists.css');
const site = read('js/site.js');

const [voice, ai] = data.playlists;
const approved = (ai.tracks || []).filter((t) => t.approved === true);
const bannedColour = /purple|pink|indigo|violet|#ff4d8d|#a855f7|#8b5cf6|#7c3aed|#6366f1|#ec4899|#d946ef|#000103/i;

test('two separate playlists: Shane\'s Voice and the P.S AI Playlist', () => {
  assert.deepEqual(data.playlists.map((p) => p.title), [
    "Pleading Socially - Shane's Voice",
    'P.S AI Playlist'
  ]);
  assert.equal(voice.kind, 'human');
  assert.equal(ai.kind, 'ai');
  assert.equal(ai.label, 'AI-generated');
  assert.equal(voice.tracks.length, 0);
  assert.match(page, /Coming soon|ps-playlists-list/);
});

test('AI tracks are approved, labelled, and the audio files exist under 4MB', () => {
  assert.ok(approved.length >= 8, 'expected the six AI demos plus both Breaking Free takes');
  const ids = approved.map((t) => t.id);
  assert.ok(ids.includes('ps-ai-01') && ids.includes('breaking-free-ai-guide') && ids.includes('breaking-free-instrumental'));
  for (const t of approved) {
    assert.equal(t.label, 'AI-generated');
    assert.match(t.src, /^\/assets\/audio\/ps-ai\//);
    const rel = t.src.slice(1);
    assert.ok(existsSync(resolve(root, rel)), rel);
    const bytes = statSync(resolve(root, rel)).size;
    assert.ok(bytes < 4 * 1024 * 1024, rel + ' is ' + bytes);
  }
  const breaking = approved.find((t) => t.id === 'breaking-free-ai-guide');
  assert.equal(breaking.title, 'Breaking Free (AI guide vocal demo)');
});

test('no autoplay, no tracking, private voice takes are not published', () => {
  const code = persist + ui;
  assert.doesNotMatch(code, /\.autoplay\s*=\s*true/);
  assert.doesNotMatch(page, /\bautoplay\s*=/i);
  assert.doesNotMatch(page, /<(audio|video)\b[^>]*\bautoplay\b/i);
  assert.match(page, /no autoplay/i);
  assert.doesNotMatch(code, /googletagmanager|google-analytics|connect\.facebook\.net|analytics\.twitter|pixel\.js/i);
  const audioDir = resolve(root, 'assets/audio/ps-ai');
  for (const name of readdirSync(audioDir)) {
    assert.doesNotMatch(name, /shaney-c|voice-bank|private/i);
  }
  assert.doesNotMatch(persist + ui, /music-demos\/voice|shaney-c-feel-the-rush/);
});

test('persistent player, Media Session, Radio mode and pjax exclusions are wired', () => {
  assert.match(persist, /mediaSession/);
  assert.match(persist, /setActionHandler\('play'/);
  assert.match(persist, /setActionHandler\('nexttrack'/);
  assert.match(persist, /radioMode/);
  assert.match(persist, /history\.pushState/);
  assert.match(persist, /localStorage/);
  assert.match(persist, /ps_radio_state/);
  for (const path of ['crisis', 'login', 'signup', 'reset-password', 'support-us', 'payment', 'checkout']) {
    assert.match(persist, new RegExp(path));
  }
  assert.match(site, /ps-radio-persist\.js/);
  assert.match(page, /ps-radio-persist\.js/);
  assert.match(page, /id="ps-app-radio"/);
  assert.match(page, /id="ps-app-vol"/);
  assert.match(page, /id="ps-app-seek"/);
});

test('recently played: localStorage only, clear button, creator picks are site tracks', () => {
  assert.match(persist, /ps_radio_recent/);
  assert.match(persist, /MAX_RECENT = 10/);
  assert.match(page, /Your recently played/);
  assert.match(page, /Clear recently played/);
  assert.match(page, /Creator picks: recently played/);
  assert.match(page, /stored only on this device|this browser only/i);
  assert.match(ui, /clearRecent/);
  assert.doesNotMatch(persist, /\/(?:api|netlify\/functions)\/.*recent/i);

  const catalogIds = new Set(approved.map((t) => t.id));
  assert.ok((creator.tracks || []).length >= 1);
  for (const t of creator.tracks) {
    assert.ok(catalogIds.has(t.id), 'creator pick is not a published site track: ' + t.id);
    assert.doesNotMatch(t.title || '', /Kid Cudi|Drake|Akon|Joyner|Timbaland|Wiz Khalifa/i);
  }
  assert.match(ui, /r\.catalog\(\)/);
});

test('music page keeps crisis numbers exact and tappable, and one H1', () => {
  assert.match(page, /116 123/);
  assert.match(page, /href="tel:116123"/);
  assert.match(page, /href="sms:85258/);
  assert.match(page, /href="tel:111"/);
  assert.match(page, /href="tel:999"/);
  assert.equal((page.match(/<h1\b/gi) || []).length, 1);
  assert.match(page, /<title>Pleading Sanity Music<\/title>/);
  assert.match(page, /<meta name="description"/);
});

test('brand lock: no purple, pink, indigo, or emoji in the new player styles and UI', () => {
  const style = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const code = (persist + ui).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  assert.doesNotMatch(style, bannedColour);
  assert.doesNotMatch(code, bannedColour);
  assert.doesNotMatch(style, /\p{Extended_Pictographic}/u);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(persist, /createElement\('audio'\)|#ps-app-audio/);
});

test('mini-player sits above a sticky crisis footer and the phone dock', () => {
  assert.match(persist, /ps-crisis-footer/);
  assert.match(persist, /ps-dock/);
  assert.match(css, /--ps-app-bottom/);
  assert.match(page, /ps-crisis-footer/);
});
