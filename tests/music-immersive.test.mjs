import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');
const page = read('music/index.html');
const css = read('css/music-immersive.css');
const data = JSON.parse(read('data/ps-playlists.json'));
const discoverSrc = read('js/music-discover.js');
const playerSrc = read('js/ps-radio-persist.js');
const ui = read('js/ps-playlists.js');

const banned = /purple|pink|indigo|violet|magenta|fuchsia|coral|lime|#ff4d8d|#ff00ff|#ff6b6b|#a3e635|#a855f7|#8b5cf6|#7c3aed|#6366f1|#ec4899|#d946ef|#000103/i;

function loadDiscover() {
  const sandbox = {};
  vm.runInNewContext(discoverSrc, { window: sandbox, globalThis: sandbox });
  return sandbox.PSDiscover;
}

test('every published track is badged Human or AI, and Shane’s voice stays human', () => {
  const D = loadDiscover();
  const human = D.badge({ kind: 'human', label: "Shane's own voice" });
  assert.equal(human.text, 'Human');
  assert.equal(human.cls, 'ps-origin-badge ps-badge-human');
  assert.equal(human.name, "Shane's voice");
  assert.equal(D.badge({ kind: 'human', label: 'AI-generated' }).text, 'Human');
  const ai = data.playlists.find((p) => p.kind === 'ai');
  for (const track of ai.tracks) {
    const badge = D.badge({ ...track, kind: 'ai' });
    assert.equal(badge.text, 'AI', track.id);
    assert.match(badge.cls, /ps-badge-ai/);
  }
  assert.match(ui, /originBadge\(track\)/);
  assert.match(ui, /aria-label', 'Play '/);
  assert.match(page, /Every track wears a Human or AI badge/);
});

test('mood, genre and BPM chips are hand-picked filters, not a feed', () => {
  const D = loadDiscover();
  for (const label of ['UK garage', 'Bassline', 'Grime', 'Deep house', 'Tech house', 'Hip-hop', 'Healing frequencies']) {
    assert.ok(page.includes(label), label);
  }
  assert.match(page, /HAND-PICKED · NOT AN ALGORITHM/);
  assert.match(page, /href="\/frequencies\.html"/);
  assert.equal(D.healingHref, '/frequencies.html');
  const ai = data.playlists.find((p) => p.kind === 'ai').tracks.map((t) => ({ ...t, kind: 'ai' }));
  assert.equal(ai.filter((t) => D.matchesGenre(t, 'bassline')).length, 0);
  assert.ok(ai.some((t) => D.matchesGenre(t, 'uk-garage')));
  assert.ok(ai.some((t) => D.matchesGenre(t, 'grime')));
  assert.ok(ai.some((t) => D.matchesMood(t, 'low-light')));
  const garage = ai.find((t) => t.id === 'ps-ai-03');
  const next = D.listenNext(ai, garage.id, 'all').map((t) => t.id);
  assert.ok(next.includes('ps-ai-06'));
  assert.ok(!next.includes('ps-ai-02'));
  assert.equal(D.listenNext(ai, 'ps-ai-02', 'low-light').length, 0);
  for (const track of ai) {
    assert.equal(D.bpmValue(track), null, track.id);
    assert.equal(D.matchesBpm(track, 'under-120'), false);
    assert.equal(D.matchesBpm(track, 'unstamped'), true);
  }
  assert.match(data.discovery.bpm, /Nothing is estimated/);
  assert.match(ui, /No bassline tracks are published/);
  assert.match(ui, /Tempos are not guessed/);
});

test('the listening room keeps crisis links, contrast hooks, motion opt-out and no tracking', () => {
  assert.ok(page.indexOf('tel:999') < page.indexOf('ps-cinema'));
  for (const href of ['tel:999', 'tel:116123', 'sms:85258', 'tel:111']) assert.ok(page.includes(href));
  assert.equal((page.match(/<h1\b/gi) || []).length, 1);
  assert.doesNotMatch(page, /<audio[^>]*\bautoplay/i);
  assert.match(page, /no autoplay/i);
  assert.doesNotMatch(page + css + ui, /googletagmanager|google-analytics|connect\.facebook\.net|analytics\.twitter|pixel\.js/i);
  const style = css.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(style, banned);
  assert.match(style, /prefers-reduced-motion/);
  assert.match(style, /min-height:\s*48px/);
  assert.match(style, /#f59e0b/);
  assert.match(page, /id="ps-listen-next"/);
  assert.match(page, /id="ps-app-queue"/);
});

function makeEl(tag) {
  const el = {
    tag,
    id: '',
    className: '',
    textContent: '',
    innerHTML: '',
    hidden: false,
    value: '',
    min: '',
    max: '',
    type: '',
    paused: true,
    ended: false,
    currentTime: 0,
    volume: 1,
    duration: 120,
    readyState: 0,
    src: '',
    preload: 'none',
    children: [],
    attrs: {},
    style: { setProperty() {} },
    parentNode: null,
    isContentEditable: false
  };
  const set = new Set();
  el.classList = {
    add(...cs) { cs.forEach((c) => set.add(c)); el.className = [...set].join(' '); },
    remove(...cs) { cs.forEach((c) => set.delete(c)); el.className = [...set].join(' '); },
    toggle(c, force) {
      const on = force === undefined ? !set.has(c) : !!force;
      if (on) set.add(c); else set.delete(c);
      el.className = [...set].join(' ');
      return on;
    },
    contains: (c) => set.has(c)
  };
  el.setAttribute = (k, v) => { el.attrs[k] = String(v); if (k === 'id') el.id = String(v); };
  el.getAttribute = (k) => (k in el.attrs ? el.attrs[k] : null);
  el.hasAttribute = (k) => k in el.attrs;
  el.appendChild = (child) => { child.parentNode = el; el.children.push(child); return child; };
  el.addEventListener = (type, fn) => { (el.listeners ||= {})[type] ||= []; el.listeners[type].push(fn); };
  el.removeEventListener = () => {};
  el.querySelector = (sel) => query(el, sel);
  el.querySelectorAll = () => [];
  el.closest = (sel) => closest(el, sel);
  el.getBoundingClientRect = () => ({ height: 64, width: 320, top: 0, bottom: 0 });
  el.play = () => { el.paused = false; el.plays = (el.plays || 0) + 1; return Promise.resolve(); };
  el.pause = () => { el.paused = true; };
  return el;
}

function classMatch(el, name) {
  return String(el.className || '').split(/\s+/).includes(name);
}
function matches(el, sel) {
  if (sel.startsWith('.')) return classMatch(el, sel.slice(1));
  if (sel.startsWith('#')) return el.id === sel.slice(1);
  return el.tag === sel;
}
function descendants(el) {
  const out = [];
  (el.children || []).forEach((child) => { out.push(child); descendants(child).forEach((n) => out.push(n)); });
  return out;
}
function query(rootEl, sel) {
  let nodes = [rootEl];
  for (const part of sel.trim().split(/\s+/)) {
    const next = [];
    nodes.forEach((n) => descendants(n).forEach((child) => { if (matches(child, part)) next.push(child); }));
    nodes = next;
  }
  return nodes[0] || null;
}
function closest(el, sel) {
  let n = el;
  while (n) {
    if (matches(n, sel) || (sel.startsWith('#') && n.id === sel.slice(1))) return n;
    n = n.parentNode;
  }
  return null;
}

function bootPlayer() {
  const plays = { n: 0 };
  const handlers = {};
  const docListeners = {};
  const body = makeEl('body');
  body.tagName = 'BODY';
  const psApp = makeEl('section');
  psApp.id = 'ps-app';
  body.appendChild(psApp);
  const document = {
    readyState: 'complete',
    title: '',
    body,
    documentElement: makeEl('html'),
    head: makeEl('head'),
    addEventListener(type, fn) { (docListeners[type] ||= []).push(fn); },
    createElement: (tag) => makeEl(tag),
    getElementById(id) {
      if (id === 'ps-app') return psApp;
      return descendants(body).find((n) => n.id === id) || null;
    },
    querySelector: (sel) => query(body, sel),
    querySelectorAll: () => [],
    dispatchEvent() { return true; }
  };
  document.documentElement.style = { setProperty() {} };
  const window = {
    addEventListener() {},
    getComputedStyle: () => ({ display: 'none', position: 'static', visibility: 'visible', bottom: '0px' }),
    scrollTo() {},
    location: { href: 'https://pleadingsanity.co.uk/music/', origin: 'https://pleadingsanity.co.uk', pathname: '/music/' }
  };
  const audioBox = { el: null };
  const orig = document.createElement;
  document.createElement = (tag) => {
    const el = orig(tag);
    el.tagName = String(tag).toUpperCase();
    if (tag === 'audio') {
      const play = el.play;
      el.play = () => { plays.n += 1; return play.call(el); };
      audioBox.el = el;
    }
    return el;
  };
  const catalog = JSON.parse(read('data/ps-playlists.json'));
  const context = {
    window,
    document,
    navigator: { mediaSession: { setActionHandler(name, fn) { handlers[name] = fn; }, playbackState: 'none' } },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    history: { pushState() {} },
    location: window.location,
    fetch: async () => ({ ok: true, json: async () => catalog }),
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init && init.detail; } },
    MediaMetadata: function MediaMetadata(data) { return data; },
    URL,
    DOMParser: function DOMParser() {},
    console
  };
  context.window = new Proxy(window, { get: (t, k) => (k === 'PSRadio' ? context.PSRadio : t[k]), set: (t, k, v) => { if (k === 'PSRadio') context.PSRadio = v; else t[k] = v; return true; } });
  vm.runInNewContext(playerSrc, context);
  return { context, plays, handlers, docListeners, document, audioBox };
}

test('player queue, keyboard and Media Session do not autoplay', async () => {
  const { context, plays, handlers, docListeners, document, audioBox } = bootPlayer();
  await new Promise((r) => setTimeout(r, 30));
  const api = context.PSRadio;
  assert.equal(api.ready(), true);
  assert.equal(plays.n, 0);
  assert.equal(audioBox.el.getAttribute('autoplay'), null);
  api.enqueue('ps-ai-01');
  api.enqueue('ps-ai-01');
  api.enqueue('not-a-track');
  assert.equal(plays.n, 0, 'queueing must not start playback');
  assert.equal(api.queue()[0].id, 'ps-ai-01');
  assert.equal(api.queue().length, 1);
  assert.equal(api.queue()[0].kind, 'ai');
  api.enqueue('ps-ai-03');
  api.next();
  assert.equal(plays.n, 1);
  assert.equal(api.current().id, 'ps-ai-01');
  assert.equal(api.queue().length, 1);
  assert.equal(api.queue()[0].id, 'ps-ai-03');
  api.removeFromQueue('ps-ai-03');
  assert.equal(api.queue().length, 0);
  api.pause();
  const before = plays.n;
  docListeners.keydown.forEach((fn) => fn({
    key: ' ',
    target: document.body,
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true; }
  }));
  assert.equal(plays.n, before + 1, 'space on the music page toggles playback');
  assert.equal(typeof handlers.play, 'function');
  assert.equal(typeof handlers.pause, 'function');
  assert.equal(typeof handlers.nexttrack, 'function');
  assert.equal(typeof handlers.previoustrack, 'function');
  assert.equal(typeof handlers.seekto, 'function');
  assert.equal(typeof handlers.seekbackward, 'function');
  assert.equal(typeof handlers.seekforward, 'function');
  api.pause();
  api.seek(12);
  handlers.seekforward({ seekOffset: 5 });
  assert.equal(audioBox.el.currentTime, 17);
  const field = { tagName: 'INPUT', isContentEditable: false, closest: () => null };
  const played = plays.n;
  docListeners.keydown.forEach((fn) => fn({
    key: ' ',
    target: field,
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    defaultPrevented: false,
    preventDefault() {}
  }));
  assert.equal(plays.n, played, 'space in a field must not toggle playback');
});
