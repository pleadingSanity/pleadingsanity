import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { studioGate, isStudioCreator, cleanDrafts, checkTake, takeKind, storageMode, generateStatus, PRIVATE_NOTE } from '../netlify/lib/creator-studio-core.js';
import { SEED_DRAFTS } from '../netlify/lib/creator-studio-seeds.js';

const read = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');

test('studio gate: guests 401, members 403 with the private note, creators/admins/owner allowed', () => {
  assert.deepEqual(studioGate(null), { ok: false, status: 401, error: 'Please sign in first.' });
  assert.deepEqual(studioGate({ id: 'm', roles: [], isOwner: false }), { ok: false, status: 403, error: PRIVATE_NOTE });
  assert.equal(studioGate({ id: 'g', roles: ['guardian'], isOwner: false }).status, 403);
  for (const user of [{ roles: ['creator'] }, { roles: ['admin'] }, { roles: ['owner'] }, { roles: [], isOwner: true }]) {
    assert.equal(studioGate(user).ok, true, JSON.stringify(user));
  }
  assert.equal(isStudioCreator({ roles: 'creator' }), false, 'roles must be a real array');
});

test('api function gates every route before touching storage', () => {
  const src = read('netlify/functions/creator-studio.mts');
  const gateAt = src.indexOf('studioGate(user)');
  assert.ok(gateAt > 0);
  for (const marker of ['store().get', 'store().set', 'putAudio(', 'generateStatus(env)']) {
    const firstUse = src.indexOf(marker, src.indexOf('export default'));
    assert.ok(firstUse > gateAt, `${marker} must come after the gate`);
  }
  assert.doesNotMatch(src, /sk-[A-Za-z0-9]{10,}|sb_secret_|eyJhbGci/, 'no keys in code');
});

test('drafts and takes are cleaned and bounded', () => {
  const drafts = cleanDrafts([{ id: 'a', title: '', body: 'x\u0000y' }, { id: 'a', title: 'dupe' }, { id: '<b>', title: 'T', body: 'z' }]);
  assert.equal(drafts.length, 2);
  assert.equal(drafts[0].title, 'Untitled draft');
  assert.equal(drafts[0].body, 'xy');
  assert.equal(drafts[1].id, 'b');
  assert.deepEqual(cleanDrafts('nope'), []);
  assert.equal(checkTake({ size: 9000, type: 'audio/webm;codecs=opus' }).ok, true);
  assert.equal(checkTake({ size: 9000, type: 'video/mp4' }).ok, false);
  assert.equal(checkTake({ size: 5_000_000, type: 'audio/wav' }).ok, false);
  assert.equal(takeKind('polished'), 'polished');
  assert.equal(takeKind('mix'), 'mix');
  assert.equal(takeKind('anything'), 'dry');
});

test('storage and generation stay off until keys exist; generation never claims to charge', () => {
  assert.equal(storageMode({}), 'netlify-blobs');
  assert.equal(storageMode({ SUPABASE_URL: 'https://x.supabase.co' }), 'netlify-blobs');
  assert.equal(storageMode({ SUPABASE_URL: 'https://x.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'k' }), 'supabase');
  const off = generateStatus({});
  assert.equal(off.configured, false);
  assert.equal(off.status, 501);
  assert.match(off.error, /not configured/);
  const keyed = generateStatus({ MUSIC_GEN_PROVIDER: 'fal', FAL_KEY: 'k' });
  assert.equal(keyed.configured, true);
  assert.equal(keyed.status, 501);
  assert.match(keyed.error, /Nothing was charged/);
});

test('seed drafts mirror music/shaney-c and avoid the lifted Eiffel 65 line', () => {
  assert.equal(SEED_DRAFTS.length, 4);
  for (const seed of SEED_DRAFTS) assert.equal(seed.body, read(`music/shaney-c/${seed.id}.md`));
  for (const seed of SEED_DRAFTS) assert.doesNotMatch(seed.body, /if I was green/i);
});

test('studio page is private, noindex, emoji-free and on brand', () => {
  const html = read('creator-studio-music.html');
  const css = read('css/creator-studio-music.css');
  const js = read('js/creator-studio-music.js');
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
  assert.doesNotMatch(read('sitemap.xml'), /creator-studio-music/);
  for (const text of [html, css, js]) {
    assert.doesNotMatch(text, /\p{Extended_Pictographic}/u, 'SVG icons only, no emoji');
    assert.doesNotMatch(text, /#000103|#ff4d8d|purple|indigo|violet|magenta|coral/i);
  }
  assert.doesNotMatch(js, /https?:\/\//, 'no third-party requests');
  assert.match(read('netlify.toml'), /for = "\/creator-studio-music.html"[\s\S]*?microphone=\(self\)/);
});

test('vocal polish: gate quietens noise, pitch correction pulls toward the nearest note', () => {
  const context = vm.createContext({ window: {}, Blob, Math, Float32Array });
  vm.runInContext(read('js/vocal-polish.js'), context);
  const P = context.window.PSVocalPolish;
  const rate = 44100;
  const quiet = Float32Array.from({ length: rate }, (_, i) => (i < rate / 2 ? 0.001 * Math.sin(i) : 0.5 * Math.sin(i / 10)));
  const gated = P.noiseGate(quiet, rate);
  let lowPeak = 0, highPeak = 0;
  for (let i = 5000; i < 20000; i++) lowPeak = Math.max(lowPeak, Math.abs(gated[i]));
  for (let i = 30000; i < rate; i++) highPeak = Math.max(highPeak, Math.abs(gated[i]));
  assert.ok(lowPeak < 0.0002, 'hiss pulled down');
  assert.ok(highPeak > 0.45, 'voice passes');
  const sharp = Float32Array.from({ length: rate * 2 }, (_, i) => 0.5 * Math.sin(2 * Math.PI * 452 * i / rate));
  assert.ok(Math.abs(P.detectPitch(sharp.slice(10000, 12048), rate) - 452) < 1);
  const tuned = P.pitchCorrect(sharp, rate, { strength: 1 });
  assert.ok(Math.abs(P.detectPitch(tuned.slice(40000, 42048), rate) - 440) < 2);
  assert.equal(Math.round(P.nearestNoteHz(452)), 440);
  assert.equal(P.detectPitch(new Float32Array(2048), rate), 0, 'silence is unvoiced');
  assert.doesNotMatch(read('js/vocal-polish.js'), /fetch\(|XMLHttpRequest|https?:\/\//);
});
