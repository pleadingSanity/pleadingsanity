// ==============================================================
// PLEADING SANITY — WORDS FROM THE FAMILY
// Everything published through Write with Arron: daily wisdom,
// community stories, education, poetry and movement updates.
// Public, chronological, shareable.
// ==============================================================

import { esc, toast } from '/js/auth.js';
import { truthBadge } from '/js/social.js';

const KINDS = {
  wisdom: { icon: '🌅', label: 'Daily Wisdom' },
  story: { icon: '📖', label: 'Community Story' },
  educational: { icon: '🧠', label: 'Educational' },
  poetry: { icon: '🎤', label: 'Rap / Poetry' },
  update: { icon: '✊', label: 'Movement Update' },
};

// A small local seed so the library is never empty or "resting" when
// offline. Evidence / Experience / Philosophy. Real published pieces
// always take its place as soon as the server answers.
const SEED = [
  { id: 'seed-evidence', strand: 'Evidence', kind: 'educational', truthTag: 'evidence', credit: 'The Family', title: 'Naming a feeling helps',
    body: 'Putting a feeling into words — even just "I feel anxious" — is linked in research to a calmer stress response (Lieberman and colleagues, "Putting Feelings Into Words", Psychological Science, 2007). You do not have to fix it yet. Naming it is a real first step.' },
  { id: 'seed-experience', strand: 'Experience', kind: 'story', truthTag: 'experience', credit: 'Arron', title: 'Your story belongs here',
    body: 'Some days the bravest thing is getting through the day. If you have lived something hard and found a way through, even a small one, your words could be the light someone else needs. Write it with Arron when you are ready.' },
  { id: 'seed-philosophy', strand: 'Philosophy', kind: 'wisdom', truthTag: 'philosophy', credit: 'The Family', title: 'Rise from madness',
    body: 'You are not your worst day. Healing is not a straight line, and rest is not giving up. Evolution, not erasure: every version of you is part of the one still rising.' },
];
// Starter words are labelled as such, never shared as if published, and
// never replace a real piece: they only fill an empty or offline list.
const seedHTML = (state = 'empty') => {
  const html = SEED.filter((p) => !kind || p.kind === kind).map((p) => pieceHTML({ ...p, seed: true })).join('');
  if (!html) return '';
  const why = {
    offline: "You're offline, so here are a few starter words kept on this device.",
    unreachable: "The library couldn't be reached just now, so here are a few starter words kept on this device.",
  }[state] || 'Nothing has been published here yet, so here are a few starter words while the library grows.';
  return `<p class="sx-seed-note" role="note">${why} Each one says whether it is Evidence, Experience or Philosophy.</p>${html}`;
};

const list = document.getElementById('pieces');
const more = document.getElementById('more');
const tabs = document.getElementById('kind-tabs');
let kind = '';
let nextBefore = null;

function pieceHTML(p) {
  const k = KINDS[p.kind] || KINDS.wisdom;
  const when = p.publishedAt || p.createdAt;
  return `
    <article class="panel sx-piece" id="piece-${p.id}">
      <div class="sx-meta">
        <span class="sx-kind">${k.icon} ${k.label}</span>
        ${truthBadge(p.truthTag)}
        <span>✍️ ${esc(p.credit)}</span>
        ${p.seed ? `<span class="sx-seed-tag">🌱 Starter words · ${esc(p.strand)}</span>` : ''}
        ${when ? `<time datetime="${esc(when)}">${new Date(when).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time>` : ''}
      </div>
      ${p.title ? `<h3>${esc(p.title)}</h3>` : ''}
      <div class="sx-body">${esc(p.body)}</div>
      ${p.seed ? '' : `<div class="btn-row" style="margin-top:12px">
        <button type="button" class="sbtn small ghost" data-share="${p.id}" data-title="${esc(p.title || k.label)}">🔗 Share</button>
      </div>`}
    </article>`;
}

async function load(append = false) {
  if (!append) list.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div>';
  more.hidden = true;
  try {
    const q = new URLSearchParams({ limit: '12' });
    if (kind) q.set('kind', kind);
    if (append && nextBefore) q.set('before', nextBefore);
    const res = await fetch(`/api/write/published?${q}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    const html = data.pieces.map(pieceHTML).join('');
    if (append) list.insertAdjacentHTML('beforeend', html);
    else list.innerHTML = html || seedHTML() || '<p class="empty">No pieces here yet. <a href="/write.html">Write the first one with Arron →</a></p>';
    nextBefore = data.nextBefore;
    more.hidden = !nextBefore;
    if (!append && location.hash.startsWith('#piece-')) document.querySelector(location.hash)?.scrollIntoView();
  } catch {
    if (append) return;
    list.innerHTML = seedHTML(navigator.onLine === false ? 'offline' : 'unreachable') || '<p class="empty">No pieces here yet. <a href="/write.html">Write the first one with Arron →</a></p>';
  }
}

tabs.innerHTML = `<button type="button" data-kind="" aria-pressed="true">✨ All</button>` +
  Object.entries(KINDS).map(([k, v]) => `<button type="button" data-kind="${k}" aria-pressed="false">${v.icon} ${v.label}</button>`).join('');
tabs.addEventListener('click', (e) => {
  const b = e.target.closest('[data-kind]');
  if (!b) return;
  kind = b.dataset.kind;
  tabs.querySelectorAll('[data-kind]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  load();
});
more.addEventListener('click', () => load(true));

list.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-share]');
  if (!b) return;
  const url = `${location.origin}/wisdom.html#piece-${b.dataset.share}`;
  try {
    if (navigator.share) await navigator.share({ title: b.dataset.title + ' — Pleading Sanity', url });
    else { await navigator.clipboard.writeText(url); toast('Link copied — share the light 💙'); }
  } catch { /* share sheet closed */ }
});

load();
