// ==============================================================
// PLEADING SANITY — MOOD JOURNEY
// A gentle, private 8-week check-in. No scores, no streaks.
// Missing weeks are fine: life happens. Pick up where you are.
// ==============================================================

import { loadProgress, saveProgress, onProgressSync } from '/js/progress.js';
import { loadMe, esc } from '/js/auth.js';

const GAME = 'mood-journey';
const WEEKS = 8;
const DEFAULTS = { journey: null, archive: [] };

const MOODS = [
  { v: 1, e: '🌧️', l: 'Really low' },
  { v: 2, e: '🌥️', l: 'Low' },
  { v: 3, e: '⛅', l: 'Mixed' },
  { v: 4, e: '🌤️', l: 'Okay' },
  { v: 5, e: '☀️', l: 'Good' },
];
const FIELDS = {
  sleep: [['poor', 'Poor'], ['okay', 'Okay'], ['good', 'Good']],
  connection: [['alone', 'Alone'], ['little', 'A little'], ['connected', 'Connected']],
  energy: [['low', 'Low'], ['some', 'Some'], ['good', 'Good']],
};

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, '0');
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const utc = (key) => { const [y, m, d] = key.split('-').map(Number); return Date.UTC(y, m - 1, d); };
const addDays = (key, n) => { const t = new Date(utc(key) + n * 86400000); return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`; };
const fmt = (key, year = false) => new Date(`${key}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', ...(year ? { year: 'numeric' } : {}) });
const moodOf = (v) => MOODS.find((m) => m.v === v);

let state = load();
function load() {
  const s = { ...structuredClone(DEFAULTS), ...loadProgress(GAME, DEFAULTS) };
  if (!Array.isArray(s.archive)) s.archive = [];
  if (s.journey && (!s.journey.start || !Array.isArray(s.journey.weeks))) s.journey = null;
  if (s.journey) s.journey.weeks = Array.from({ length: WEEKS }, (_, i) => s.journey.weeks[i] || null);
  return s;
}
function save() {
  state.archive = state.archive.slice(0, 3);
  saveProgress(GAME, state);
}

loadMe().then((me) => {
  if (!me) return;
  document.querySelectorAll('[data-sg-guest]').forEach((n) => { n.hidden = true; });
  document.querySelectorAll('[data-sg-member]').forEach((n) => { n.hidden = false; });
}).catch(() => {});

// Which week are we in? 0-based; WEEKS or more means the eight weeks have passed.
function weekIndex() {
  if (!state.journey) return 0;
  return Math.max(0, Math.floor((utc(todayKey()) - utc(state.journey.start)) / (7 * 86400000)));
}
function isFinished() {
  const j = state.journey;
  return !!j && (weekIndex() >= WEEKS || !!j.weeks[WEEKS - 1]);
}

// ─── FORM ───
const form = $('mj-form');
const moodBox = $('mj-mood');
const support = $('mj-support');
const note = $('mj-note');
const msg = $('mj-form-msg');
let draft = { m: 0, sleep: '', connection: '', energy: '' };

moodBox.innerHTML = MOODS.map((m) => `<button type="button" data-v="${m.v}" aria-pressed="false">${m.e}<span>${m.l}</span></button>`).join('');
document.querySelectorAll('[data-field]').forEach((box) => {
  box.innerHTML = FIELDS[box.dataset.field].map(([v, l]) => `<button type="button" class="chip" data-v="${v}" aria-pressed="false">${l}</button>`).join('');
  box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]');
    if (!b) return;
    const f = box.dataset.field;
    draft[f] = draft[f] === b.dataset.v ? '' : b.dataset.v; // tap again to clear
    paintForm();
  });
});
moodBox.addEventListener('click', (e) => {
  const b = e.target.closest('[data-v]');
  if (!b) return;
  draft.m = Number(b.dataset.v);
  msg.hidden = true;
  paintForm();
});

const SUPPORT_HTML = `<div class="notice ok sg-help" role="note">
  <p><strong>Thank you for being honest about this week.</strong> A very low week is heavy. You do not have to tidy it up. This house will sit with the story. It is not a clinic.</p>
  <p>Read <a href="/crisis.html">why people lose themselves</a>, or the <a href="/tools.html">plain tools</a>: water, sun, a walk, sleep, breath. If you are not safe, get to another person near you. You can still finish this check-in. It stays yours.</p>
</div>`;

function paintForm() {
  moodBox.querySelectorAll('[data-v]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.v) === draft.m)));
  document.querySelectorAll('[data-field]').forEach((box) => {
    box.querySelectorAll('[data-v]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === draft[box.dataset.field])));
  });
  const low = draft.m === 1;
  if (low && support.hidden) support.innerHTML = SUPPORT_HTML;
  support.hidden = !low;
}

function loadDraft() {
  const i = weekIndex();
  const entry = state.journey && i < WEEKS ? state.journey.weeks[i] : null;
  draft = entry
    ? { m: entry.m, sleep: entry.s || '', connection: entry.c || '', energy: entry.e || '' }
    : { m: 0, sleep: '', connection: '', energy: '' };
  note.value = entry?.n || '';
  $('mj-save').textContent = entry ? 'Update this week' : 'Save this week';
  paintForm();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!draft.m) {
    msg.textContent = 'Choose the mood that feels closest — there\'s no wrong answer.';
    msg.hidden = false;
    moodBox.querySelector('button').focus();
    return;
  }
  if (!state.journey || weekIndex() >= WEEKS) state.journey = { start: todayKey(), weeks: Array(WEEKS).fill(null) };
  const i = weekIndex();
  const wasEdit = !!state.journey.weeks[i];
  state.journey.weeks[i] = {
    m: draft.m, s: draft.sleep, c: draft.connection, e: draft.energy,
    n: note.value.trim().slice(0, 280), d: todayKey(),
  };
  save();
  render();
  msg.textContent = wasEdit
    ? `Week ${i + 1} updated.`
    : `Week ${i + 1} saved. Thank you for checking in with yourself.`;
  msg.hidden = false;
  msg.focus?.();
});
msg.setAttribute('tabindex', '-1');
msg.setAttribute('role', 'status');

// ─── PATH ───
function renderPath() {
  const j = state.journey;
  const cur = j ? Math.min(weekIndex(), WEEKS) : 0;
  $('mj-path').innerHTML = Array.from({ length: WEEKS }, (_, i) => {
    const entry = j?.weeks[i];
    const m = entry && moodOf(entry.m);
    const isCur = i === cur && !isFinished();
    let state_ = 'ahead';
    if (entry) state_ = `checked in, ${m.l.toLowerCase()}`;
    else if (isCur) state_ = 'this week';
    else if (j && i < cur) state_ = 'no check-in, and that\'s okay';
    const cls = ['mj-stone', entry ? 'is-done' : '', isCur ? 'is-current' : ''].join(' ').trim();
    return `<li class="${cls}"${isCur ? ' aria-current="step"' : ''}><span class="mj-emoji" aria-hidden="true">${m ? m.e : isCur ? '✨' : '·'}</span><span>Week ${i + 1}</span><span class="sr-only">, ${state_}</span></li>`;
  }).join('');

  const status = $('mj-status');
  if (!j) { status.textContent = 'Your journey begins with your first check-in, whenever you\'re ready.'; return; }
  if (isFinished()) { status.textContent = `You began on ${fmt(j.start, true)}. All eight weeks have passed — have a look back below.`; return; }
  const i = weekIndex();
  const missed = j.weeks.slice(0, i).some((w) => !w);
  const nextOpens = fmt(addDays(j.start, (i + 1) * 7));
  let text = j.weeks[i]
    ? `Week ${i + 1} is checked in. You can change it until your next stone opens on ${nextOpens}.`
    : `This is week ${i + 1} of ${WEEKS}.`;
  if (missed) text += ' Some stones were skipped — life happens. Pick up where you are.';
  status.textContent = text;
}

// ─── REFLECTION ───
function chartHtml(weeks) {
  return weeks.map((w, i) => {
    const m = w && moodOf(w.m);
    const h = m ? 20 + (m.v - 1) * 20 : 6;
    return `<li><span class="sr-only">Week ${i + 1}: ${m ? m.l : 'no check-in'}</span><span aria-hidden="true">${m ? m.e : ''}</span><span class="bar${m ? '' : ' empty'}" style="height:${h}%" aria-hidden="true"></span><span aria-hidden="true">W${i + 1}</span></li>`;
  }).join('');
}
function wordsHtml(weeks) {
  const notes = weeks.map((w, i) => ({ w, i })).filter(({ w }) => w && w.n);
  if (!notes.length) return '<li>You didn\'t leave any notes this time — showing up was enough.</li>';
  return notes.map(({ w, i }) => `<li><b>Week ${i + 1} · ${moodOf(w.m)?.e || ''} ${moodOf(w.m)?.l || ''}</b>${esc(w.n)}</li>`).join('');
}

function renderReflection() {
  const panel = $('mj-reflection');
  const done = isFinished();
  panel.hidden = !done;
  $('mj-form-panel').hidden = done && weekIndex() >= WEEKS;
  if (!done) return;
  const weeks = state.journey.weeks;
  const count = weeks.filter(Boolean).length;
  $('mj-ref-intro').textContent = count === WEEKS
    ? 'You walked all eight stones. Here\'s what you shared, in your own words.'
    : `You checked in on ${count} of ${WEEKS} weeks. Every one of them counts — here's what you shared.`;
  $('mj-chart').innerHTML = chartHtml(weeks);
  $('mj-words').innerHTML = wordsHtml(weeks);
}

$('mj-new').addEventListener('click', () => {
  if (state.journey) state.archive.unshift({ start: state.journey.start, weeks: state.journey.weeks });
  state.journey = null;
  save();
  render();
  msg.hidden = true;
  $('mj-form-h').focus?.();
});
$('mj-form-h').setAttribute('tabindex', '-1');

function renderArchive() {
  const panel = $('mj-archive-panel');
  panel.hidden = !state.archive.length;
  $('mj-archive').innerHTML = state.archive.map((a) => `<details class="mj-archive">
    <summary>Journey from ${fmt(a.start, true)} · ${a.weeks.map((w) => (w ? moodOf(w.m)?.e : '·')).join(' ')}</summary>
    <ol class="mj-chart" aria-label="Moods, week by week">${chartHtml(a.weeks)}</ol>
    <ul class="mj-words" style="margin-top:1rem">${wordsHtml(a.weeks)}</ul>
  </details>`).join('');
}

function render() {
  renderPath();
  renderReflection();
  renderArchive();
  loadDraft();
}

onProgressSync((games) => {
  if (!games.includes(GAME)) return;
  state = load();
  render();
});

render();
