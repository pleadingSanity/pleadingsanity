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
        <time datetime="${esc(when)}">${new Date(when).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
      </div>
      ${p.title ? `<h3>${esc(p.title)}</h3>` : ''}
      <div class="sx-body">${esc(p.body)}</div>
      <div class="btn-row" style="margin-top:12px">
        <button type="button" class="sbtn small ghost" data-share="${p.id}" data-title="${esc(p.title || k.label)}">🔗 Share</button>
      </div>
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
    else list.innerHTML = html || '<p class="empty">No pieces here yet. <a href="/write.html">Write the first one with Arron →</a></p>';
    nextBefore = data.nextBefore;
    more.hidden = !nextBefore;
    if (!append && location.hash.startsWith('#piece-')) document.querySelector(location.hash)?.scrollIntoView();
  } catch {
    list.innerHTML = '<p class="notice info">The library is resting right now — please try again in a moment.</p>';
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
