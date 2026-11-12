import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const js = readFileSync(resolve(root, 'js/music-player.js'), 'utf8');
const cfg = JSON.parse(readFileSync(resolve(root, 'data/music-playlists.json'), 'utf8'));

const ORIGINAL_IDS = [
  'DjdB4Bm4n2M', '3pysm_JU_wA', '0slhR2obZSE', 'rT1fqRkFiqY', 'b8M6N0FTpNc'
];

test('music-playlists.json has the expected fields, platform URLs empty by default, Shane playlists array present', () => {
  assert.deepEqual(Object.keys(cfg).sort(), ['amazon_music_url', 'label', 'shane_playlists', 'sonos_url', 'youtube_url']);
  assert.equal(typeof cfg.label, 'string');
  assert.equal(cfg.youtube_url, '');
  assert.equal(cfg.sonos_url, '');
  assert.equal(cfg.amazon_music_url, '');
  assert.ok(Array.isArray(cfg.shane_playlists), 'shane_playlists must be an array');
});

test('Evolution Not Erasure: all five original songs retained, none deleted', () => {
  for (const id of ORIGINAL_IDS) assert.ok(js.includes(id), 'missing video id ' + id);
  // header still describes the playlist player
  assert.match(js, /5-SONG BACKGROUND MUSIC PLAYLIST/);
  // existing persisted keys untouched
  assert.match(js, /psMusicMuted/);
  assert.match(js, /psMusicVolume/);
  assert.match(js, /psMusicIndex/);
});

test('votes use the ps_music_ localStorage prefix and disliked-skip logic is wired', () => {
  assert.match(js, /ps_music_vote_/);
  assert.match(js, /isDisliked/);
  assert.match(js, /findPlayable/);
  assert.match(js, /nextVideo/);
  // skip-guard prevents an infinite loop when everything is disliked
  assert.match(js, /skipGuard/);
});

test('Shane playlist slots render from config with privacy-enhanced YouTube embed', () => {
  assert.match(js, /music-playlists\.json/);
  assert.match(js, /youtube-nocookie\.com/);
  // platform labels are built at runtime from the PLATFORMS table
  assert.match(js, /youtube_url/);
  assert.match(js, /sonos_url/);
  assert.match(js, /amazon_music_url/);
  assert.match(js, /Play on YouTube/);
  assert.match(js, /Open in Sonos app/);
  assert.match(js, /Open in Amazon Music/);
  assert.match(js, /coming soon/);
  assert.match(js, /target = '_blank'/);
  assert.match(js, /rel = 'noopener/);
});

test('no purple / violet / indigo colours and no external trackers in the player', () => {
  // strip comments so the "No purple/indigo" policy note is not counted as usage
  const code = js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  assert.doesNotMatch(code, /purple|violet|indigo|rebeccapurple/i);
  assert.doesNotMatch(code, /googletagmanager|google-analytics|connect\.facebook\.net|analytics\.twitter/i);
});

// ---- vm harness: a disliked song is skipped via postMessage nextVideo ----
function makeEl(tag) {
  const el = {
    tag, children: [], listeners: {}, attrs: {}, style: { cssText: '' },
    innerHTML: '', textContent: '', value: '', hidden: false, parentNode: null,
    classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      toggle(c, f) { if (f === undefined) f = !this._s.has(c); f ? this._s.add(c) : this._s.delete(c); return f; },
      contains(c) { return this._s.has(c); } },
    setAttribute(k, v) { this.attrs[k] = v; },
    getAttribute(k) { return this.attrs[k]; },
    appendChild(c) { this.children.push(c); return c; },
    insertAdjacentHTML() {},
    addEventListener(type, fn) { this.listeners[type] = fn; },
    querySelector() { return makeEl('queried'); },
    querySelectorAll() { return []; },
    contentWindow: null
  };
  return el;
}

function harness() {
  const store = new Map();
  const postCalls = [];
  let msgHandler = null;
  const docEvents = new Map();
  const iframe = makeEl('iframe');
  iframe.contentWindow = { postMessage(...args) { postCalls.push(args); } };
  const document = {
    addEventListener(type,fn) { if(!docEvents.has(type))docEvents.set(type,[]);docEvents.get(type).push(fn); },
    getElementById() { return null; },
    createElement(tag) { return tag === 'iframe' ? iframe : makeEl(tag); },
    body: { appendChild() {} },
    head: { appendChild() {} },
    documentElement: { appendChild() {} }
  };
  const window = { addEventListener(type, fn) { if (type === 'message') msgHandler = fn; } };
  const localStorage = {
    getItem(k) { return store.has(k) ? store.get(k) : null; },
    setItem(k, v) { store.set(k, String(v)); },
    removeItem(k) { store.delete(k); }
  };
  vm.runInNewContext(js, {
    window, document, localStorage,
    fetch: async () => ({ ok: true, json: async () => ({ label: '', youtube_url: '', sonos_url: '', amazon_music_url: '' }) }),
    setTimeout, clearTimeout, console
  });
  return { store, postCalls, stop:()=>{for(const fn of docEvents.get('ps-audio-stop')||[])fn();}, dispatch: (origin, data) => msgHandler && msgHandler({ origin, data }), iframe };
}

test('vm: when a disliked song is reported, the player cues a different playable song exactly once', () => {
  const h = harness();
  h.store.set('ps_music_vote_DjdB4Bm4n2M', 'dislike');
  h.dispatch('https://www.youtube.com', { event: 'infoDelivery', info: { videoData: { video_id: 'DjdB4Bm4n2M' } } });
  const cmds = h.postCalls.map(a => { try { return JSON.parse(a[0]).func; } catch { return null; } });
  assert.equal(cmds.filter(c => c === 'loadVideoById').length, 1);
  const cued = JSON.parse(h.postCalls.find(a => JSON.parse(a[0]).func === 'loadVideoById')[0]).args[0];
  assert.ok(ORIGINAL_IDS.includes(cued));
  assert.notEqual(cued, 'DjdB4Bm4n2M');
  // repeated infoDelivery for the same disliked track must not spam skips (skipFor guard)
  const before = h.postCalls.length;
  h.dispatch('https://www.youtube.com', { event: 'infoDelivery', info: { videoData: { video_id: 'DjdB4Bm4n2M' } } });
  assert.equal(h.postCalls.length, before, 'skip guard prevented duplicate nextVideo');
});

test('vm: a non-disliked song resets the skip guard and is not skipped', () => {
  const h = harness();
  h.store.set('ps_music_vote_DjdB4Bm4n2M', 'dislike');
  h.dispatch('https://www.youtube.com', { event: 'infoDelivery', info: { videoData: { video_id: 'DjdB4Bm4n2M' } } });
  assert.ok(h.postCalls.some(a => JSON.parse(a[0]).func === 'loadVideoById'));
  // a playable track arrives: no further nextVideo
  const before = h.postCalls.length;
  h.dispatch('https://www.youtube.com', { event: 'infoDelivery', info: { videoData: { video_id: '3pysm_JU_wA' } } });
  assert.equal(h.postCalls.length, before, 'playable track must not trigger skip');
});

test('vm: messages from non-YouTube origins are ignored', () => {
  const h = harness();
  h.store.set('ps_music_vote_DjdB4Bm4n2M', 'dislike');
  h.dispatch('https://evil.example', { event: 'infoDelivery', info: { videoData: { video_id: 'DjdB4Bm4n2M' } } });
  assert.equal(h.postCalls.length, 0);
});


test('shared Stop blocks late widget playing/ended events from restarting a track',()=>{
 const h=harness();h.stop();
 const before=h.postCalls.length;
 h.dispatch('https://www.youtube.com',{event:'infoDelivery',info:{playerState:1,videoData:{video_id:'DjdB4Bm4n2M'}}});
 h.dispatch('https://www.youtube.com',{event:'infoDelivery',info:{playerState:0,videoData:{video_id:'DjdB4Bm4n2M'}}});
 const commands=h.postCalls.slice(before).map(a=>JSON.parse(a[0]).func);
 assert.deepEqual(commands,['pauseVideo']);
});
