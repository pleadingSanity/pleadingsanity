// ==============================================================
// PLEADING SANITY — MIND MODE
// Guided breathing, 5-4-3-2-1 grounding and gentle affirmations.
// Progress is private: saved on this device, synced when signed in.
// ==============================================================

import { loadProgress, saveProgress, onProgressSync } from '/js/progress.js';
import { loadMe } from '/js/auth.js';

const GAME = 'mind-mode';
const DEFAULTS = { sessions: 0, breaths: 0, seconds: 0, groundings: 0, patterns: {}, recent: [], sound: false, pattern: 'box', rounds: 5 };

const PATTERNS = {
  box: { name: 'Box', sub: '4-4-4-4', desc: 'Breathe in, hold, out, hold — four counts each. Steady and grounding.', phases: [['in', 4], ['hold', 4], ['out', 4], ['rest', 4]] },
  '478': { name: '4-7-8', sub: 'relaxing', desc: 'In for 4, hold for 7, out slowly for 8. If the hold feels too long, that\'s okay — breathe whenever you need to.', phases: [['in', 4], ['hold', 7], ['out', 8]] },
  coherent: { name: 'Coherent', sub: '5-5', desc: 'In for 5, out for 5. An even, gentle rhythm.', phases: [['in', 5], ['out', 5]] },
  calm: { name: 'Calm exhale', sub: '4-6', desc: 'In for 4, out for 6. A longer out-breath can help the body settle.', phases: [['in', 4], ['out', 6]] },
};
const CUES = { in: 'Breathe in', hold: 'Hold', out: 'Breathe out', rest: 'Rest' };

const GROUND = [
  { n: 5, sense: 'see', text: 'Look around. Name five things you can see — a colour, a shape, a shadow, anything at all.' },
  { n: 4, sense: 'feel', text: 'Notice four things you can feel — your feet on the floor, fabric on your skin, the air on your face.' },
  { n: 3, sense: 'hear', text: 'Listen for three things you can hear. Near or far, loud or very quiet.' },
  { n: 2, sense: 'smell', text: 'Find two things you can smell. If nothing comes, think of two smells you like.' },
  { n: 1, sense: 'taste', text: 'Notice one thing you can taste — or simply take a sip of water.' },
];

const AFFIRMATIONS = [
  'You don\'t have to have it all figured out today.',
  'Rest is not something you have to earn.',
  'It\'s okay to take this one breath at a time.',
  'You have survived every hard day so far. That counts.',
  'Feelings are visitors. They come, and they go.',
  'You are allowed to take up space.',
  'Small steps are still steps.',
  'You can be a work in progress and still be enough.',
  'Asking for help is a strength, not a weakness.',
  'Nothing needs fixing in this moment. Just breathe.',
  'You\'re doing better than your worst thoughts tell you.',
  'Being gentle with yourself is not giving up.',
  'Today can just be a quiet day. That\'s allowed.',
  'You are more than what you\'re going through.',
  'Healing doesn\'t have to be pretty to be real.',
  'Some days, getting through is the whole achievement.',
];

const $ = (id) => document.getElementById(id);
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

let state = load();
function load() {
  const s = { ...structuredClone(DEFAULTS), ...loadProgress(GAME, DEFAULTS) };
  if (!PATTERNS[s.pattern]) s.pattern = 'box';
  if (!Array.isArray(s.recent)) s.recent = [];
  if (!s.patterns || typeof s.patterns !== 'object') s.patterns = {};
  return s;
}
function save() {
  state.recent = state.recent.slice(-30);
  saveProgress(GAME, state);
  renderStats();
}

// ─── PRIVACY NOTE ───
loadMe().then((me) => {
  if (!me) return;
  document.querySelectorAll('[data-sg-guest]').forEach((n) => { n.hidden = true; });
  document.querySelectorAll('[data-sg-member]').forEach((n) => { n.hidden = false; });
}).catch(() => {});

// ─── MODE TABS ───
const tabs = document.querySelectorAll('[data-mode]');
tabs.forEach((btn) => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
function setMode(mode) {
  tabs.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  document.querySelectorAll('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== mode; });
  if (mode !== 'breathe' && running) stopBreathing();
  if (mode === 'calm') startRotation(); else stopRotation();
}

// ─── SOFT TONE (WebAudio, off by default) ───
let ctx = null;
function tone(phase) {
  if (!state.sound) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const freq = { in: 396, hold: 330, out: 264, rest: 330 }[phase] || 330;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 1.5);
  } catch { /* audio unavailable — silence is fine */ }
}
const soundBtn = $('mm-sound');
function renderSound() {
  soundBtn.setAttribute('aria-pressed', String(!!state.sound));
  soundBtn.textContent = state.sound ? '🔔 Soft tone on' : '🔇 Soft tone off';
}
soundBtn.addEventListener('click', () => { state.sound = !state.sound; renderSound(); save(); if (state.sound) tone('in'); });

// ─── PATTERN & ROUNDS PICKERS ───
const patternBox = $('mm-patterns');
patternBox.innerHTML = Object.entries(PATTERNS).map(([id, p]) =>
  `<button type="button" class="chip" data-pattern="${id}" aria-pressed="false">${p.name} <span class="muted">(${p.sub})</span></button>`).join('');
patternBox.addEventListener('click', (e) => {
  const b = e.target.closest('[data-pattern]');
  if (!b || running) return;
  state.pattern = b.dataset.pattern;
  renderPickers();
  saveProgress(GAME, state);
});
$('mm-rounds').addEventListener('click', (e) => {
  const b = e.target.closest('[data-rounds]');
  if (!b || running) return;
  state.rounds = Number(b.dataset.rounds);
  renderPickers();
  saveProgress(GAME, state);
});
function renderPickers() {
  patternBox.querySelectorAll('[data-pattern]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pattern === state.pattern)));
  $('mm-rounds').querySelectorAll('[data-rounds]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.rounds) === Number(state.rounds))));
  $('mm-pattern-desc').textContent = PATTERNS[state.pattern].desc;
}

// ─── BREATHING ───
const orb = $('mm-orb');
const cue = $('mm-cue');
const count = $('mm-count');
const live = $('mm-live');
const startBtn = $('mm-start');
const stopBtn = $('mm-stop');
let running = false;
let tick = null;
let session = null;

function setOrb(phase, secs) {
  orb.style.transitionDuration = `${secs}s`;
  if (phase === 'in') orb.classList.add('is-full');
  else if (phase === 'out') orb.classList.remove('is-full');
}

function startBreathing() {
  const p = PATTERNS[state.pattern];
  running = true;
  session = { pattern: state.pattern, rounds: Number(state.rounds) || 0, round: 1, phase: 0, left: p.phases[0][1], started: Date.now(), breaths: 0 };
  startBtn.hidden = true;
  stopBtn.hidden = false;
  patternBox.querySelectorAll('button').forEach((b) => b.setAttribute('aria-disabled', 'true'));
  $('mm-rounds').querySelectorAll('button').forEach((b) => b.setAttribute('aria-disabled', 'true'));
  enterPhase();
  tick = setInterval(step, 1000);
  stopBtn.focus();
}

function enterPhase() {
  const p = PATTERNS[session.pattern];
  const [phase, secs] = p.phases[session.phase];
  session.left = secs;
  setOrb(phase, secs);
  tone(phase);
  cue.textContent = `${CUES[phase]}… ${secs}`;
  const of = session.rounds ? ` of ${session.rounds}` : '';
  count.textContent = `Round ${session.round}${of}`;
  // Polite announcement on phase changes only, never every second.
  live.textContent = `${CUES[phase]} for ${secs}.${session.phase === 0 ? ` Round ${session.round}${of}.` : ''}`;
}

function step() {
  const p = PATTERNS[session.pattern];
  session.left -= 1;
  if (session.left > 0) {
    cue.textContent = `${CUES[p.phases[session.phase][0]]}… ${session.left}`;
    return;
  }
  session.phase += 1;
  if (session.phase >= p.phases.length) {
    session.phase = 0;
    session.breaths += 1;
    if (session.rounds && session.round >= session.rounds) { finishBreathing(true); return; }
    session.round += 1;
  }
  enterPhase();
}

function finishBreathing(complete) {
  clearInterval(tick);
  running = false;
  const s = session;
  session = null;
  orb.style.transitionDuration = '2s';
  orb.classList.remove('is-full');
  startBtn.hidden = false;
  stopBtn.hidden = true;
  patternBox.querySelectorAll('button').forEach((b) => b.removeAttribute('aria-disabled'));
  $('mm-rounds').querySelectorAll('button').forEach((b) => b.removeAttribute('aria-disabled'));
  const secs = Math.round((Date.now() - s.started) / 1000);
  if (s.breaths > 0) {
    state.sessions += 1;
    state.breaths += s.breaths;
    state.seconds += secs;
    state.patterns[s.pattern] = (state.patterns[s.pattern] || 0) + 1;
    state.recent.push({ d: today(), t: s.pattern });
    save();
  }
  const msg = complete
    ? `That's ${s.breaths} slow breaths. Notice how you feel — whatever it is, it's okay.`
    : s.breaths > 0
      ? `You took ${s.breaths} slow ${s.breaths === 1 ? 'breath' : 'breaths'}. Stopping when you need to is part of it.`
      : 'Stopped. Come back whenever you like.';
  cue.textContent = complete ? 'Well breathed' : 'Paused';
  count.textContent = '';
  live.textContent = msg;
  count.textContent = msg;
  startBtn.textContent = 'Breathe again';
  startBtn.focus();
}
function stopBreathing() { if (running) finishBreathing(false); }

startBtn.addEventListener('click', () => { if (!running) startBreathing(); });
stopBtn.addEventListener('click', stopBreathing);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && running) stopBreathing(); });

// ─── FOCUS: 5-4-3-2-1 GROUNDING ───
let gStep = -1;
const gBox = $('mm-ground');
const gNext = $('mm-ground-next');
const gBack = $('mm-ground-back');
const gDots = $('mm-ground-dots');
gDots.innerHTML = GROUND.map(() => '<li></li>').join('');
function renderGround() {
  gBack.hidden = gStep <= 0 || gStep >= GROUND.length;
  gDots.querySelectorAll('li').forEach((li, i) => li.classList.toggle('on', i <= gStep && gStep < GROUND.length));
  if (gStep < 0) {
    gBox.innerHTML = '<p class="sg-big">Find a comfortable position. There\'s no need to rush.</p>';
    gNext.textContent = 'Begin';
  } else if (gStep < GROUND.length) {
    const g = GROUND[gStep];
    gBox.innerHTML = `<div class="mm-ground-num" aria-hidden="true">${g.n}</div><p class="sg-big"><span class="sr-only">Step ${gStep + 1} of 5. ${g.n} things you can ${g.sense}. </span>${g.text}</p>`;
    gNext.textContent = gStep === GROUND.length - 1 ? 'Finish' : 'Next';
  } else {
    gBox.innerHTML = '<p class="sg-big">You\'re here, in this moment. Take one more slow breath before you carry on.</p>';
    gNext.textContent = 'Start again';
  }
}
gNext.addEventListener('click', () => {
  if (gStep >= GROUND.length) gStep = -1;
  gStep += 1;
  if (gStep === GROUND.length) {
    state.groundings += 1;
    state.sessions += 1;
    state.recent.push({ d: today(), t: 'ground' });
    save();
  }
  renderGround();
});
gBack.addEventListener('click', () => { if (gStep > 0) { gStep -= 1; renderGround(); } });

// ─── CALM: ROTATING AFFIRMATIONS ───
const aBox = $('mm-affirm');
const aLive = $('mm-affirm-live');
const aPause = $('mm-affirm-pause');
let aIndex = Math.floor(Math.random() * AFFIRMATIONS.length);
let rotate = null;
let paused = false;
function showAffirm(next, announce) {
  aIndex = next % AFFIRMATIONS.length;
  const set = () => { aBox.textContent = AFFIRMATIONS[aIndex]; aBox.classList.remove('is-fading'); };
  if (reduced()) set();
  else { aBox.classList.add('is-fading'); setTimeout(set, 600); }
  if (announce) aLive.textContent = AFFIRMATIONS[aIndex];
}
function startRotation() {
  stopRotation();
  if (!aBox.textContent) aBox.textContent = AFFIRMATIONS[aIndex];
  if (!paused) rotate = setInterval(() => showAffirm(aIndex + 1, false), 12000);
}
function stopRotation() { clearInterval(rotate); rotate = null; }
$('mm-affirm-next').addEventListener('click', () => { showAffirm(aIndex + 1, true); if (!paused) startRotation(); });
aPause.addEventListener('click', () => {
  paused = !paused;
  aPause.setAttribute('aria-pressed', String(paused));
  aPause.textContent = paused ? 'Resume rotating' : 'Pause rotating';
  if (paused) stopRotation(); else startRotation();
});

// ─── STATS ───
function renderStats() {
  const mins = Math.round(state.seconds / 60);
  const fav = Object.entries(state.patterns).sort((a, b) => b[1] - a[1])[0];
  const items = [
    [state.sessions, state.sessions === 1 ? 'session' : 'sessions'],
    [state.breaths, 'slow breaths'],
    [mins < 1 && state.seconds > 0 ? 'Under 1' : mins, mins === 1 ? 'minute breathing' : 'minutes breathing'],
    [state.groundings, state.groundings === 1 ? 'grounding walk' : 'grounding walks'],
    [fav ? PATTERNS[fav[0]]?.name || '—' : '—', 'favourite pattern'],
  ];
  $('mm-stats').innerHTML = items.map(([b, l]) => `<li><b>${b}</b>${l}</li>`).join('');
  const days = [...new Set(state.recent.map((r) => r.d))];
  const recent = $('mm-recent');
  if (!days.length) {
    recent.textContent = 'Nothing yet — and that\'s fine. Your first breath here is waiting whenever you are.';
  } else {
    const fmt = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    recent.textContent = `Days you've taken a calm moment recently: ${days.slice(-10).map(fmt).join(', ')}.`;
  }
}

onProgressSync((games) => {
  if (!games.includes(GAME) || running) return;
  state = load();
  renderPickers();
  renderSound();
  renderStats();
});

renderPickers();
renderSound();
renderGround();
renderStats();
