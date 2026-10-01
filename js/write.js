// ==============================================================
// PLEADING SANITY — WRITE WITH ARRON
// Arron drafts in the house voice → the member edits → submits.
// The creator's pieces publish instantly; everyone else's wait for
// the creator's one-tap review. Every piece carries a credit and a
// truth tag.
// ==============================================================

import { api, esc, requireMember, toast } from '/js/auth.js';
import { truthBadge } from '/js/social.js';

export const KINDS = {
  wisdom: { icon: '🌅', label: 'Daily Wisdom' },
  story: { icon: '📖', label: 'Community Story' },
  educational: { icon: '🧠', label: 'Educational' },
  poetry: { icon: '🎤', label: 'Rap / Poetry' },
  update: { icon: '✊', label: 'Movement Update' },
};

const me = await requireMember();
const creator = me.user.role === 'creator' || me.user.isAdmin;
const form = document.getElementById('write-form');
const msg = document.getElementById('write-msg');
const kindBox = document.getElementById('kind-chips');
let kind = new URLSearchParams(location.search).get('kind') in KINDS ? new URLSearchParams(location.search).get('kind') : 'wisdom';

kindBox.innerHTML = Object.entries(KINDS)
  .map(([k, v]) => `<button type="button" class="chip" data-kind="${k}" aria-pressed="${k === kind}">${v.icon} ${v.label}</button>`)
  .join('');
kindBox.addEventListener('click', (e) => {
  const b = e.target.closest('[data-kind]');
  if (!b) return;
  kind = b.dataset.kind;
  kindBox.querySelectorAll('[data-kind]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
});

document.getElementById('publish-btn').textContent = creator ? '🚀 Publish now' : '📨 Send for review';
document.getElementById('credit-row').hidden = !creator;
if (creator) form.credit.value = me.profile.displayName;

// ─── DRAFT WITH ARRON ───
document.getElementById('draft-btn').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');
  btn.textContent = '✨ Arron is writing…';
  msg.innerHTML = '';
  try {
    const { draft } = await api('/api/write/draft', {
      method: 'POST',
      body: { kind, topic: form.topic.value.trim(), notes: form.body.value.trim() },
    });
    form.title.value = draft.title;
    form.body.value = draft.body;
    form.truthTag.value = draft.truthTag;
    msg.innerHTML = '<p class="notice ok">Here\'s a draft. Make it yours — change anything, then publish. 💙</p>';
    form.body.focus();
  } catch (error) {
    msg.innerHTML = `<p class="notice err">${esc(error.message)}${error.data?.reason ? ' ' + esc(error.data.reason) : ''}</p>`;
  } finally {
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
    btn.textContent = '✨ Draft with Arron';
  }
});

// ─── SUBMIT ───
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (form.body.value.trim().length < 10) { msg.innerHTML = '<p class="notice err">There\'s not quite enough here yet.</p>'; return; }
  const btn = document.getElementById('publish-btn');
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');
  try {
    const { published } = await api('/api/write', {
      method: 'POST',
      body: {
        kind,
        title: form.title.value.trim(),
        body: form.body.value.trim(),
        truthTag: form.truthTag.value,
        anonymous: form.anonymous.checked,
        credit: creator ? form.credit.value.trim() : undefined,
      },
    });
    msg.innerHTML = published
      ? `<p class="notice ok">🚀 Live on the site. <a href="/wisdom.html">See it in Words from the Family →</a></p>`
      : '<p class="notice ok">📨 Sent to Shane for review. You\'ll see its status below. Thank you for adding your voice. 💙</p>';
    form.reset();
    if (creator) form.credit.value = me.profile.displayName;
    loadMine();
    if (creator) loadQueue();
  } catch (error) {
    msg.innerHTML = `<p class="notice err">${esc(error.message)}${error.data?.reason ? ' ' + esc(error.data.reason) : ''}</p>`;
  } finally {
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
  }
});

function pieceHTML(p, { review = false } = {}) {
  const k = KINDS[p.kind] || KINDS.wisdom;
  return `
    <article class="panel sx-piece" data-piece="${p.id}">
      <div class="sx-meta">
        <span class="sx-kind">${k.icon} ${k.label}</span>
        ${truthBadge(p.truthTag)}
        <span class="sx-status-${esc(p.status)}">● ${esc(p.status)}</span>
        <span>✍️ ${esc(p.credit)}${p.anonymous ? ' (shown as anonymous)' : ''}</span>
      </div>
      ${p.title ? `<h3>${esc(p.title)}</h3>` : ''}
      <div class="sx-body">${esc(p.body)}</div>
      ${p.reviewNote ? `<p class="notice info" style="margin-top:10px">Note from Shane: ${esc(p.reviewNote)}</p>` : ''}
      ${review
        ? `<div class="btn-row" style="margin-top:12px">
             <button type="button" class="sbtn small primary" data-review="approve">✅ Approve &amp; publish</button>
             <button type="button" class="sbtn small ghost" data-review="reject">Not this time</button>
           </div>`
        : ''}
    </article>`;
}

async function loadMine() {
  const box = document.getElementById('mine');
  try {
    const { pieces } = await api('/api/write/mine');
    box.innerHTML = pieces.map((p) => pieceHTML(p)).join('') || '<p class="empty">Nothing yet. Your first piece is waiting to be written.</p>';
  } catch (error) {
    box.innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
  }
}

async function loadQueue() {
  const section = document.getElementById('review');
  section.hidden = false;
  const box = document.getElementById('queue');
  try {
    const { pieces } = await api('/api/write/queue');
    box.innerHTML = pieces.map((p) => pieceHTML(p, { review: true })).join('') || '<p class="empty">All caught up — nothing waiting for review. ✨</p>';
  } catch (error) {
    box.innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
  }
}

document.getElementById('queue').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-review]');
  if (!b) return;
  const card = b.closest('[data-piece]');
  const action = b.dataset.review;
  const note = action === 'reject' ? prompt('A kind note for the writer (optional):') ?? '' : '';
  try {
    await api(`/api/write/${card.dataset.piece}`, { method: 'POST', body: { action, note } });
    card.remove();
    toast(action === 'approve' ? 'Published 🚀' : 'Returned with care.');
  } catch (error) { toast(error.message); }
});

loadMine();
if (creator) {
  loadQueue();
  if (location.hash === '#review') document.getElementById('review').scrollIntoView();
}
