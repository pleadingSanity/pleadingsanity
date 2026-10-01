// ==============================================================
// PLEADING SANITY — MY SANCTUARY
// A private home for each member: what they've saved, what they've
// made, their gentle progress, and their favourite quiet corners.
// Only they can see this page.
// ==============================================================

import { api, esc, requireMember } from '/js/auth.js';
import { moodBadge, postHTML, setViewer, wirePosts } from '/js/social.js';
import { loadProgress, onProgressSync, SYNCED } from '/js/progress.js';

const ROLE = {
  creator: '💫 Creator',
  admin: '🛡️ Admin',
  guardian: '✨ Guardian',
  member: '🌿 Member',
};
const GAMES = {
  'mind-mode': ['🌬️', 'Mind Mode', '/mind-mode.html'],
  'mood-journey': ['🌱', 'Mood Journey', '/mood-journey.html'],
  'cosmic-connect': ['🃏', 'Cosmic Connect', '/cosmic-connect.html'],
  'truth-tag': ['🏷️', 'Truth Tag', '/truth-tag.html'],
  'brain-games': ['🧠', 'Brain Games', '/games.html'],
};

const me = await requireMember();
setViewer(me);
const p = me.profile;

document.getElementById('welcome').innerHTML = `
  <div class="row" style="justify-content:center;gap:16px">
    <span class="ps-avatar lg" aria-hidden="true">${esc(p.avatar)}</span>
    <div style="text-align:left">
      <h1 style="margin:0">Welcome home, ${esc(p.displayName)}</h1>
      <p class="row" style="margin:6px 0 0;gap:8px">
        <span class="sx-kind">${ROLE[me.user.role] || ROLE.member}</span>
        ${moodBadge(p.mood)}
        <span class="post-time">Here since ${new Date(p.joinedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
      </p>
    </div>
  </div>
  <p style="margin-top:1rem">This is your private corner. No one else can see it — not even other members.</p>`;

function renderProgress() {
  const box = document.getElementById('progress');
  box.innerHTML = Object.entries(GAMES).map(([id, [icon, name, href]]) => {
    const data = id in SYNCED ? loadProgress(id, {}) : {};
    const started = data && Object.keys(data).length > 0;
    return `<a class="sx-card" href="${href}"><span class="sx-icon" aria-hidden="true">${icon}</span><h3>${name}</h3><p>${started ? '✓ Your progress is saved and syncing' : 'Not started — whenever you’re ready'}</p></a>`;
  }).join('');
}
renderProgress();
onProgressSync(renderProgress);

// Saved posts
const saved = document.getElementById('saved');
wirePosts(saved);
api('/api/posts?filter=saved')
  .then(({ posts }) => {
    saved.innerHTML = posts.map((x) => postHTML(x)).join('') ||
      '<p class="empty">Nothing saved yet. Tap <strong>☆ Save</strong> on any post in the <a href="/feed.html#community">feed</a> and it lands here.</p>';
  })
  .catch((error) => { saved.innerHTML = `<p class="notice err">${esc(error.message)}</p>`; });

// Creations
const art = document.getElementById('art');
api('/api/creations?scope=mine')
  .then(({ creations }) => {
    art.innerHTML = creations.slice(0, 6).map((c) => `
      <figure class="sx-art"><a href="/creations.html#mine"><img src="${esc(c.imageUrl)}" alt="${esc(c.title || c.prompt)}" loading="lazy" width="256" height="256" /></a>
      <span class="sx-watermark" aria-hidden="true">Pleading Sanity</span>
      <figcaption><strong>${esc(c.title || c.prompt)}</strong></figcaption></figure>`).join('') ||
      '<p class="empty">No creations yet. <a href="/creations.html#create">Make your first with Arron 🎨</a></p>';
  })
  .catch(() => { art.innerHTML = '<p class="empty"><a href="/creations.html">Open Creations →</a></p>'; });

// Writing
const writing = document.getElementById('writing');
api('/api/write/mine')
  .then(({ pieces }) => {
    writing.innerHTML = pieces.length
      ? `<ul>${pieces.slice(0, 5).map((w) => `<li><strong>${esc(w.title || w.kind)}</strong> — <span class="sx-status-${esc(w.status)}">${esc(w.status)}</span></li>`).join('')}</ul><p><a href="/write.html">All your writing →</a></p>`
      : '<p class="empty">Your words matter here. <a href="/write.html">Write something with Arron ✍️</a></p>';
  })
  .catch(() => { writing.innerHTML = '<p><a href="/write.html">Open Write with Arron →</a></p>'; });
