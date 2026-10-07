// ==============================================================
// 🎙️ AI STUDIO — where humans and AI create side by side
// Create: ask Arron, Nova (GPT), Sol (Gemini), Claude or Grok for
//         something inspiring, funny or brave, then share it.
// Battle: one prompt a day. Humans vs AI. Everyone votes.
// Unity Pod: three AIs from three labs talk through real problems,
//         read aloud with a different voice for each.
// ==============================================================

import { api, esc, loadMe, toast } from '/js/auth.js';

const $ = (id) => document.getElementById(id);
const DEVICE = 'ps-studio-device';
const VOICE_STYLE = {
  arron: { pitch: 0.85, rate: 0.95, prefer: /(male|daniel|george|arthur|ryan|guy)/i, colour: 'cyan' },
  nova: { pitch: 1.1, rate: 1.03, prefer: /(female|libby|sonia|kate|serena|samantha|aria)/i, colour: 'gold' },
  sol: { pitch: 1.25, rate: 1.08, prefer: /(google uk english female|moira|tessa|karen|natasha|jenny)/i, colour: 'magenta' },
};

// A random key per device lets guests heart things without an account.
function deviceKey() {
  try {
    let key = localStorage.getItem(DEVICE);
    if (!key) {
      key = crypto.randomUUID().replace(/-/g, '');
      localStorage.setItem(DEVICE, key);
    }
    return key;
  } catch {
    return '';
  }
}

async function get(path) {
  const sep = path.includes('?') ? '&' : '?';
  return api(`${path}${sep}deviceKey=${deviceKey()}`);
}

const when = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const lines = (text) => esc(text).replace(/\n/g, '<br />');

// ─── TABS ───
const tabs = [...document.querySelectorAll('.st-tabs [role="tab"]')];
function showTab(name, focus) {
  tabs.forEach((t) => {
    const on = t.dataset.tab === name;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    $(t.getAttribute('aria-controls')).hidden = !on;
    if (on && focus) t.focus();
  });
  history.replaceState(null, '', '#' + name);
  if (name === 'battle') loadBattle();
  if (name === 'pod') loadPods();
  if (name === 'wall') loadWall();
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => showTab(t.dataset.tab));
  t.addEventListener('keydown', (e) => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (d) showTab(tabs[(i + d + tabs.length) % tabs.length].dataset.tab, true);
  });
});

// ─── CARDS ───
function card(item, { battle = false } = {}) {
  const who = item.ai ? `<span class="st-badge ai">🤖 ${esc(item.author)}</span>` : `<span class="st-badge human">🧑 ${esc(item.author)}</span>`;
  return `
    <article class="st-card ${item.ai ? 'is-ai' : 'is-human'}" data-id="${item.id}">
      <header>${who}<time datetime="${esc(item.createdAt)}">${when(item.createdAt)}</time></header>
      ${item.title ? `<h3>${esc(item.title)}</h3>` : ''}
      <p class="st-body">${lines(item.body)}</p>
      <footer>
        <button type="button" class="st-vote" data-vote="${item.id}" aria-pressed="${item.voted}">
          <span aria-hidden="true">${item.voted ? '💗' : '🤍'}</span> <span data-n>${item.votes}</span><span class="sr-only"> hearts</span>
        </button>
        ${battle ? '' : `<button type="button" class="st-share" data-share="${item.id}">↗️ Share</button>`}
        <button type="button" class="st-share" data-copy="${item.id}">📋 Copy</button>
      </footer>
    </article>`;
}

document.addEventListener('click', async (e) => {
  const voteBtn = e.target.closest('[data-vote]');
  if (voteBtn) {
    const was = voteBtn.getAttribute('aria-pressed') === 'true';
    try {
      const { voted, votes } = await api(`/api/studio/vote/${voteBtn.dataset.vote}`, { method: 'POST', body: { deviceKey: deviceKey() } });
      voteBtn.setAttribute('aria-pressed', String(voted));
      voteBtn.querySelector('[aria-hidden]').textContent = voted ? '💗' : '🤍';
      voteBtn.querySelector('[data-n]').textContent = votes;
      if (voted && !was) voteBtn.classList.add('pop');
      setTimeout(() => voteBtn.classList.remove('pop'), 500);
    } catch (error) {
      toast(error.message);
    }
    return;
  }
  const share = e.target.closest('[data-share], [data-copy]');
  if (share) {
    const c = share.closest('.st-card');
    const text = `${c.querySelector('h3')?.textContent ?? ''}\n${c.querySelector('.st-body').innerText}\n\n— made in the Pleading Sanity AI Studio`.trim();
    const url = location.origin + '/ai-studio.html';
    try {
      if (share.dataset.share && navigator.share) return await navigator.share({ title: 'Pleading Sanity AI Studio', text, url });
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast('Copied — go spread some light ✨');
    } catch (error) {
      if (error?.name !== 'AbortError') toast('Could not copy on this device.');
    }
  }
});

// ─── CREATE ───
const createForm = $('st-create');
createForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = createForm.querySelector('button[type="submit"]');
  const out = $('st-result');
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');
  out.innerHTML = '<p class="st-thinking">✨ The AI is dreaming something up…</p>';
  try {
    const f = createForm.elements;
    const { item } = await api('/api/studio/create', { method: 'POST', body: { style: f.style.value, voice: f.voice.value, topic: f.topic.value } });
    out.innerHTML = card(item);
    out.querySelector('.st-card').classList.add('fresh');
  } catch (error) {
    out.innerHTML = `<p class="st-note">${esc(error.message)}</p>`;
  } finally {
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
  }
});

// ─── WALL — most-loved and newest creations ───
let wallSort = 'top';
let wallBefore = null;
async function loadWall(more = false) {
  const list = $('st-wall');
  if (!more) { list.innerHTML = '<p class="st-thinking">Loading the wall…</p>'; wallBefore = null; }
  try {
    const q = `/api/studio/items?kind=creation&sort=${wallSort}${more && wallBefore ? '&before=' + wallBefore : ''}`;
    const { items, nextBefore } = await get(q);
    if (!more) list.innerHTML = '';
    list.insertAdjacentHTML('beforeend', items.map((i) => card(i)).join('') || '<p class="st-note">Nothing here yet. Be the first to create something ✨</p>');
    wallBefore = nextBefore;
    $('st-wall-more').hidden = !nextBefore;
  } catch (error) {
    list.innerHTML = `<p class="st-note">${esc(error.message)}</p>`;
  }
}
document.querySelectorAll('[data-sort]').forEach((b) => b.addEventListener('click', () => {
  wallSort = b.dataset.sort;
  document.querySelectorAll('[data-sort]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  loadWall();
}));
$('st-wall-more').addEventListener('click', () => loadWall(true));

// ─── BATTLE ───
async function loadBattle() {
  const list = $('st-battle-list');
  list.innerHTML = '<p class="st-thinking">The AI is warming up… 🥊</p>';
  try {
    const { prompt, entries, score } = await get('/api/studio/battle');
    $('st-battle-prompt').textContent = prompt;
    $('st-score-ai').textContent = score.ai;
    $('st-score-humans').textContent = score.humans;
    const total = score.ai + score.humans || 1;
    $('st-score-bar').style.setProperty('--humans', `${(score.humans / total) * 100}%`);
    list.innerHTML = entries.map((it) => card(it, { battle: true })).join('') || '<p class="st-note">No entries yet today.</p>';
  } catch (error) {
    list.innerHTML = `<p class="st-note">${esc(error.message)}</p>`;
  }
}
$('st-battle-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  if (!(await loadMe())) {
    location.href = '/login.html?next=' + encodeURIComponent('/ai-studio.html#battle');
    return;
  }
  try {
    await api('/api/studio/battle', { method: 'POST', body: { body: form.elements.entry.value } });
    form.reset();
    toast('You\'re in! Rally the humans 💪');
    loadBattle();
  } catch (error) {
    toast(error.message);
  }
});

// ─── UNITY POD ───
const synth = 'speechSynthesis' in window ? speechSynthesis : null;
let voices = [];
const loadVoices = () => { voices = synth ? synth.getVoices().filter((v) => /^en/i.test(v.lang)) : []; };
if (synth) { loadVoices(); synth.addEventListener?.('voiceschanged', loadVoices); }

function pickVoice(id) {
  const style = VOICE_STYLE[id];
  const gb = voices.filter((v) => /en-GB/i.test(v.lang));
  const pool = gb.length >= 2 ? gb : voices;
  const preferred = pool.find((v) => style.prefer.test(v.name));
  const index = { arron: 0, nova: 1, sol: 2 }[id];
  return preferred || pool[index % Math.max(pool.length, 1)] || null;
}

let playing = null;
function stopPod() {
  synth?.cancel();
  document.querySelectorAll('.st-turn.speaking').forEach((t) => t.classList.remove('speaking'));
  if (playing) playing.textContent = '▶ Play episode';
  playing = null;
}

function playPod(btn) {
  if (!synth) return toast('Your browser can\'t read aloud — the transcript is right here.');
  if (playing === btn) return stopPod();
  stopPod();
  playing = btn;
  btn.textContent = '⏹ Stop';
  const turns = [...btn.closest('.st-episode').querySelectorAll('.st-turn')];
  turns.forEach((el) => {
    const u = new SpeechSynthesisUtterance(el.querySelector('.st-said').textContent);
    const style = VOICE_STYLE[el.dataset.voice] || VOICE_STYLE.arron;
    u.voice = pickVoice(el.dataset.voice);
    u.pitch = style.pitch;
    u.rate = style.rate;
    u.lang = u.voice?.lang || 'en-GB';
    u.onstart = () => {
      document.querySelectorAll('.st-turn.speaking').forEach((t) => t.classList.remove('speaking'));
      el.classList.add('speaking');
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
    u.onend = () => { if (el === turns[turns.length - 1]) stopPod(); };
    synth.speak(u);
  });
}

function episode(item) {
  if (item.pending) {
    return `<article class="st-episode pending"><h3>🎙️ Recording: ${esc(item.topic)}</h3><p class="st-thinking">Arron, Nova and Sol are in the booth. This takes a minute or two…</p></article>`;
  }
  const turns = (item.script || []).map((t) => `
    <li class="st-turn" data-voice="${esc(t.voice)}">
      <span class="st-speaker ${VOICE_STYLE[t.voice]?.colour || 'cyan'}">${esc(t.name)} <small>${esc(t.lab)}</small></span>
      <p class="st-said">${esc(t.text)}</p>
    </li>`).join('');
  return `
    <article class="st-episode" data-id="${item.id}">
      <p class="st-kicker">The Unity Pod · ${when(item.createdAt)}</p>
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.body || item.topic)}</p>
      <div class="st-row">
        <button type="button" class="st-play" data-play>▶ Play episode</button>
        <button type="button" class="st-vote" data-vote="${item.id}" aria-pressed="${item.voted}"><span aria-hidden="true">${item.voted ? '💗' : '🤍'}</span> <span data-n>${item.votes}</span><span class="sr-only"> hearts</span></button>
      </div>
      <details><summary>Read the transcript</summary><ol class="st-transcript">${turns}</ol></details>
    </article>`;
}

let podTimer = null;
async function loadPods() {
  const list = $('st-pods');
  try {
    const { items } = await get('/api/studio/items?kind=podcast&sort=new');
    list.innerHTML = items.map(episode).join('') || '<p class="st-note">The first episode is on its way. Check back soon 🎙️</p>';
    clearTimeout(podTimer);
    if (items.some((i) => i.pending)) podTimer = setTimeout(loadPods, 15000);
  } catch (error) {
    list.innerHTML = `<p class="st-note">${esc(error.message)}</p>`;
  }
}
$('st-pods').addEventListener('click', (e) => {
  const play = e.target.closest('[data-play]');
  if (play) {
    const details = play.closest('.st-episode').querySelector('details');
    if (details) details.open = true;
    playPod(play);
  }
});
addEventListener('pagehide', stopPod);

// Creator-only: record a new episode on any topic
$('st-record').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  try {
    await api('/api/studio/podcast', { method: 'POST', body: { topic: form.elements.topic.value } });
    form.reset();
    toast('Recording started 🎙️ It appears below in a minute or two.');
    loadPods();
  } catch (error) {
    toast(error.message);
  }
});

// ─── START ───
loadMe().then((me) => {
  const creator = me?.user?.isAdmin;
  $('st-record').hidden = !creator;
  $('st-battle-signin').hidden = Boolean(me);
});
const first = location.hash.slice(1);
showTab(tabs.some((t) => t.dataset.tab === first) ? first : 'create');
