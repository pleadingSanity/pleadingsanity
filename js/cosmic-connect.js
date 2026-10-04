// ==============================================================
// PLEADING SANITY — COSMIC CONNECT
// A gentle memory-matching puzzle and constellation drawing.
// No timer. Moves are private, for the player's own history only.
// ==============================================================

import { loadProgress, saveProgress, onProgressSync } from '/js/progress.js';
import { loadMe } from '/js/auth.js';

const GAME = 'cosmic-connect';
const DEFAULTS = { completed: { 6: 0, 8: 0, 12: 0 }, history: [], found: [], drawn: 0, size: 6 };

const SYMBOLS = [
  ['🌙', 'crescent moon'], ['⭐', 'star'], ['🪐', 'ringed planet'], ['☄️', 'comet'],
  ['🌌', 'Milky Way'], ['🌠', 'shooting star'], ['🌍', 'Earth'], ['🌸', 'blossom'],
  ['🦋', 'butterfly'], ['🕊️', 'dove'], ['💙', 'blue heart'], ['🌊', 'wave'],
  ['☀️', 'sun'], ['🌈', 'rainbow'], ['🌻', 'sunflower'],
];

const MATCH_WORDS = [
  'Some things just belong together — like you and a little peace.',
  'One gentle step at a time.',
  'Your mind is doing quiet, good work.',
  'There\'s no rush. You\'re right on time.',
  'Little moments of calm add up.',
  'You found it. Breathe that in.',
  'Steady and kind — that\'s the way.',
  'Connection is always possible, even after a long search.',
  'Notice how your shoulders feel. Let them drop.',
  'Patience is a kind of strength.',
  'You\'re allowed to enjoy this.',
  'Every star was once lost in the dark too.',
];

// Points in a 400 × 300 sky. links: [from, to] by index (default: one after another).
const CONSTELLATIONS = [
  { id: 'lantern', name: 'The Lantern', pts: [[200, 45], [265, 105], [265, 225], [135, 225], [135, 105]], close: true,
    msg: 'Even a small light is enough to see the next step.' },
  { id: 'kite', name: 'The Kite', pts: [[200, 40], [285, 125], [200, 210], [115, 125]], close: true,
    msg: 'You can rise with the wind instead of fighting it.' },
  { id: 'bridge', name: 'The Bridge', pts: [[50, 225], [115, 145], [200, 110], [285, 145], [350, 225]],
    msg: 'There is a way across, even when you can\'t yet see the other side.' },
  { id: 'seedling', name: 'The Seedling', pts: [[200, 265], [200, 195], [200, 130], [130, 85], [270, 85]],
    links: [[0, 1], [1, 2], [2, 3], [2, 4]],
    msg: 'Growth happens quietly, long before anyone sees it.' },
  { id: 'bird', name: 'The Gull', pts: [[55, 160], [130, 115], [200, 160], [270, 115], [345, 160]],
    msg: 'You are allowed to rest mid-flight.' },
  { id: 'lighthouse', name: 'The Lighthouse', pts: [[150, 260], [160, 130], [200, 65], [240, 130], [250, 260], [345, 90]],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [2, 5]],
    msg: 'Somewhere, someone is keeping a light on for you.' },
  { id: 'heart', name: 'The Heart', pts: [[200, 95], [140, 55], [80, 105], [115, 180], [200, 255], [285, 180], [320, 105], [260, 55]], close: true,
    msg: 'You deserve the same care you so easily give to others.' },
  { id: 'compass', name: 'The Compass', pts: [[200, 40], [200, 150], [200, 260], [90, 150], [310, 150]],
    links: [[0, 1], [1, 2], [1, 3], [1, 4]],
    msg: 'You don\'t need the whole map. Just the next direction.' },
];

const $ = (id) => document.getElementById(id);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const today = () => new Date().toISOString().slice(0, 10);
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let state = load();
function load() {
  const s = { ...structuredClone(DEFAULTS), ...loadProgress(GAME, DEFAULTS) };
  s.completed = { ...DEFAULTS.completed, ...(s.completed || {}) };
  if (!Array.isArray(s.history)) s.history = [];
  if (!Array.isArray(s.found)) s.found = [];
  if (![6, 8, 12].includes(Number(s.size))) s.size = 6;
  return s;
}
function save() {
  state.history = state.history.slice(-30);
  saveProgress(GAME, state);
  renderStats();
}

loadMe().then((me) => {
  if (!me) return;
  document.querySelectorAll('[data-sg-guest]').forEach((n) => { n.hidden = true; });
  document.querySelectorAll('[data-sg-member]').forEach((n) => { n.hidden = false; });
}).catch(() => {});

// ─── TABS ───
const tabs = document.querySelectorAll('[data-mode]');
tabs.forEach((b) => b.addEventListener('click', () => {
  tabs.forEach((t) => t.setAttribute('aria-pressed', String(t === b)));
  document.querySelectorAll('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== b.dataset.mode; });
}));

// ─── MEMORY ───
const grid = $('cc-grid');
const affirm = $('cc-affirm');
const live = $('cc-live');
let deck = [];
let up = [];
let moves = 0;
let matched = 0;
let flipBack = null;

function label(i) {
  const c = deck[i];
  if (c.matched) return `Card ${i + 1}, ${c.name}, matched`;
  if (c.up) return `Card ${i + 1}, ${c.name}`;
  return `Card ${i + 1}, face down`;
}
function paint(i) {
  const c = deck[i];
  const btn = grid.children[i];
  btn.textContent = c.up || c.matched ? c.emoji : '';
  btn.classList.toggle('is-up', c.up && !c.matched);
  btn.classList.toggle('is-matched', c.matched);
  btn.setAttribute('aria-label', label(i));
  if (c.matched) btn.setAttribute('aria-disabled', 'true'); else btn.removeAttribute('aria-disabled');
}

function newPuzzle() {
  clearTimeout(flipBack);
  const size = Number(state.size);
  const picks = shuffle(SYMBOLS.slice()).slice(0, size);
  deck = shuffle(picks.flatMap(([emoji, name]) => [{ emoji, name }, { emoji, name }])).map((c) => ({ ...c, up: false, matched: false }));
  up = [];
  moves = 0;
  matched = 0;
  grid.dataset.size = String(size);
  grid.innerHTML = deck.map(() => '<button type="button" class="cc-card"></button>').join('');
  deck.forEach((_, i) => paint(i));
  affirm.textContent = '';
  live.textContent = `New puzzle with ${size} pairs. ${deck.length} cards, all face down.`;
  if (window.PSVoice) PSVoice.speak('Turn two cards. Match the sky.');
  document.querySelectorAll('#cc-sizes [data-size]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.size) === size)));
}

function turnBack() {
  clearTimeout(flipBack);
  flipBack = null;
  up.forEach((i) => { deck[i].up = false; paint(i); });
  up = [];
}

function flip(i) {
  const c = deck[i];
  if (!c || c.matched || c.up) return;
  if (up.length === 2) turnBack(); // a third tap simply moves things along
  c.up = true;
  up.push(i);
  paint(i);
  if (up.length < 2) { live.textContent = `Card ${i + 1}: ${c.name}.`; return; }
  moves += 1;
  const [a, b] = up;
  if (deck[a].emoji === deck[b].emoji) {
    deck[a].matched = deck[b].matched = true;
    deck[a].up = deck[b].up = false;
    paint(a); paint(b);
    up = [];
    matched += 1;
    const words = MATCH_WORDS[Math.floor(Math.random() * MATCH_WORDS.length)];
    if (matched === deck.length / 2) { finish(); return; }
    affirm.textContent = `${deck[a].emoji} ${words}`;
    live.textContent = `Pair found: ${deck[a].name}. ${matched} of ${deck.length / 2}.`;
  } else {
    live.textContent = `Card ${i + 1}: ${c.name}. Not a pair this time — they'll turn back over.`;
    flipBack = setTimeout(turnBack, reduced() ? 1600 : 1200);
  }
}

function finish() {
  const size = deck.length / 2;
  state.completed[size] = (state.completed[size] || 0) + 1;
  state.history.push({ s: size, m: moves, d: today() });
  save();
  const msg = `All ${size} pairs found, in ${moves} moves. However it felt, you gave your mind a gentle stretch. 🌌`;
  affirm.textContent = msg + ' Another round is waiting.';
  live.textContent = affirm.textContent;
  if (window.PSGames) {
    const score = Math.max(20, 240 - moves * 5);
    PSGames.record('cosmic-connect', { score: score, level: size, maxCombo: size });
    PSGames.markWeekly('cosmic-connect');
    PSGames.confetti();
    PSGames.sfx('good', size);
    PSGames.pulse(grid, 'good');
  }
  if (window.PSVoice) PSVoice.speak('All the pairs are found.');
  $('cc-new').focus();
}

grid.addEventListener('click', (e) => {
  const btn = e.target.closest('.cc-card');
  if (btn) flip([...grid.children].indexOf(btn));
});
grid.addEventListener('keydown', (e) => {
  const btn = e.target.closest('.cc-card');
  if (!btn) return;
  const cards = [...grid.children];
  const i = cards.indexOf(btn);
  const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 4;
  const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols, Home: -i, End: cards.length - 1 - i }[e.key];
  if (move === undefined) return;
  const next = cards[i + move];
  if (next) { e.preventDefault(); next.focus(); }
});
$('cc-sizes').addEventListener('click', (e) => {
  const b = e.target.closest('[data-size]');
  if (!b) return;
  state.size = Number(b.dataset.size);
  saveProgress(GAME, state);
  newPuzzle();
});
$('cc-new').addEventListener('click', newPuzzle);

// ─── CONSTELLATIONS ───
const NS = 'http://www.w3.org/2000/svg';
const sky = $('cc-sky');
const reveal = $('cc-reveal');
const pick = $('cc-const-pick');
let cIndex = 0;
let lit = 0;

function renderPicker() {
  pick.innerHTML = CONSTELLATIONS.map((c, i) =>
    `<button type="button" class="chip" data-const="${i}" aria-pressed="${i === cIndex}" data-found="${state.found.includes(c.id)}">${c.name}${state.found.includes(c.id) ? '<span class="sr-only">, found</span>' : ''}</button>`).join('');
}
pick.addEventListener('click', (e) => {
  const b = e.target.closest('[data-const]');
  if (b) { cIndex = Number(b.dataset.const); drawSky(); renderPicker(); }
});

function linksFor(c) {
  if (c.links) return c.links;
  const l = c.pts.slice(1).map((_, i) => [i, i + 1]);
  if (c.close) l.push([c.pts.length - 1, 0]);
  return l;
}

function el(name, attrs) {
  const n = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  return n;
}

function drawSky() {
  const c = CONSTELLATIONS[cIndex];
  lit = 0;
  [...sky.querySelectorAll('g, line, circle.bg')].forEach((n) => n.remove());
  $('cc-sky-title').textContent = `${c.name}: ${c.pts.length} stars to join in order`;
  // a few faint background stars, purely decorative
  for (let k = 0; k < 26; k += 1) {
    sky.append(el('circle', { class: 'bg', cx: (k * 157) % 400, cy: (k * 89 + 23) % 300, r: k % 3 ? 0.8 : 1.4, fill: 'rgba(255,255,255,.35)', 'aria-hidden': 'true' }));
  }
  const lines = el('g', { 'aria-hidden': 'true', id: 'cc-lines' });
  sky.append(lines);
  c.pts.forEach(([x, y], i) => {
    const g = el('g', { class: 'cc-star', role: 'button', tabindex: '0', 'data-i': i });
    g.append(el('circle', { class: 'hit', cx: x, cy: y, r: 26 }));
    g.append(el('circle', { class: 'ring', cx: x, cy: y, r: 13 }));
    g.append(el('circle', { class: 'dot', cx: x, cy: y, r: 5 }));
    const t = el('text', { x: x + 14, y: y - 12, 'aria-hidden': 'true' });
    t.textContent = String(i + 1);
    g.append(t);
    sky.append(g);
  });
  reveal.textContent = `${c.name}. Start with star 1.`;
  paintStars();
}

function paintStars() {
  const c = CONSTELLATIONS[cIndex];
  sky.querySelectorAll('.cc-star').forEach((g) => {
    const i = Number(g.dataset.i);
    g.classList.toggle('is-lit', i < lit);
    g.classList.toggle('is-next', i === lit);
    g.setAttribute('aria-label', `Star ${i + 1}${i < lit ? ', joined' : i === lit ? ', next' : ''}`);
  });
  const lines = $('cc-lines');
  lines.innerHTML = '';
  linksFor(c).forEach(([a, b]) => {
    if (Math.max(a, b) >= lit) return;
    const [x1, y1] = c.pts[a];
    const [x2, y2] = c.pts[b];
    lines.append(el('line', { class: 'cc-line', x1, y1, x2, y2 }));
  });
}

function tapStar(i) {
  const c = CONSTELLATIONS[cIndex];
  if (lit >= c.pts.length || i < lit) return;
  if (i !== lit) {
    reveal.textContent = `That's star ${i + 1}. Look for star ${lit + 1} — it's glowing pink.`;
    return;
  }
  lit += 1;
  paintStars();
  if (lit < c.pts.length) {
    reveal.textContent = `Star ${i + 1} joined. Next, star ${lit + 1}.`;
    const next = sky.querySelector(`.cc-star[data-i="${lit}"]`);
    if (next && document.activeElement?.closest?.('.cc-star')) next.focus();
    return;
  }
  reveal.textContent = `✨ ${c.name}: ${c.msg} Another round is waiting.`;
  state.drawn = (state.drawn || 0) + 1;
  if (!state.found.includes(c.id)) state.found.push(c.id);
  save();
  if (window.PSGames) {
    PSGames.record('cosmic-connect', { score: 40, level: 1, maxCombo: 1 });
    PSGames.confetti();
    PSGames.sfx('good', 1);
    PSGames.pulse(sky, 'good');
  }
  if (window.PSVoice) PSVoice.speak(c.name + ' is drawn.');
  renderPicker();
}

sky.addEventListener('click', (e) => {
  const g = e.target.closest('.cc-star');
  if (g) tapStar(Number(g.dataset.i));
});
sky.addEventListener('keydown', (e) => {
  const g = e.target.closest('.cc-star');
  if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tapStar(Number(g.dataset.i)); }
});
$('cc-const-again').addEventListener('click', drawSky);
$('cc-const-next').addEventListener('click', () => {
  cIndex = (cIndex + 1) % CONSTELLATIONS.length;
  renderPicker();
  drawSky();
});

// ─── STATS ───
function renderStats() {
  const total = Object.values(state.completed).reduce((a, b) => a + Number(b || 0), 0);
  const items = [
    [total, total === 1 ? 'puzzle completed' : 'puzzles completed'],
    [state.completed[6] || 0, 'with 6 pairs'],
    [state.completed[8] || 0, 'with 8 pairs'],
    [state.completed[12] || 0, 'with 12 pairs'],
    [`${state.found.length} / ${CONSTELLATIONS.length}`, 'constellations found'],
  ];
  $('cc-stats').innerHTML = items.map(([b, l]) => `<li><b>${b}</b>${l}</li>`).join('');
  const fmt = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const recent = state.history.slice(-5).reverse();
  $('cc-history').textContent = recent.length
    ? recent.map((h) => `${fmt(h.d)}: ${h.s} pairs in ${h.m} moves`).join(' · ')
    : 'No puzzles yet. Whenever you\'re ready.';
}

onProgressSync((games) => {
  if (!games.includes(GAME)) return;
  state = load();
  renderStats();
  renderPicker();
});

renderStats();
renderPicker();
newPuzzle();
drawSky();
