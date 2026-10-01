// ==============================================================
// PLEADING SANITY — CREATIONS
// Members describe an idea; Arron paints it in the house style
// (deep space, cosmic cyan, gentle glow). Every image carries the
// "Pleading Sanity · Evolution Not Erasure" mark, baked in when
// downloaded. Keep it private, share it to the gallery, or post it
// to the feed.
// ==============================================================

import { api, esc, loadMe, toast } from '/js/auth.js';

const WATERMARK = 'Pleading Sanity · Evolution Not Erasure';
const IDEAS = [
  'A lighthouse made of starlight guiding a small boat home',
  'Two hands holding a glowing seed in deep space',
  'A cosmic phoenix rising from a calm ocean at dawn',
  'A cosy room floating among nebulae, a candle in the window',
  'The crying brain smiling as its tears turn into stars',
  'A forest path lit by fireflies shaped like constellations',
  'A tired warrior resting under a cyan aurora',
  'A whale swimming through galaxies carrying a sleeping child',
];

const me = await loadMe();
const createBox = document.getElementById('create-box');
const grid = document.getElementById('grid');
const more = document.getElementById('more');
const tabs = document.getElementById('scope-tabs');
let scope = location.hash === '#mine' && me ? 'mine' : 'gallery';
let nextBefore = null;

// ─── WATERMARKED DOWNLOAD ───
async function download(url, name) {
  try {
    const res = await fetch(url, { credentials: 'same-origin' });
    const bitmap = await createImageBitmap(await res.blob());
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    const size = Math.max(14, Math.round(canvas.width / 48));
    ctx.font = `700 ${size}px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
    const pad = Math.round(size * 0.7);
    const w = ctx.measureText(WATERMARK).width + pad * 2;
    const h = size + pad;
    const x = canvas.width - w - pad;
    const y = canvas.height - h - pad;
    ctx.fillStyle = 'rgba(0, 1, 3, 0.55)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, h / 2) : ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 255, 240, 0.5)';
    ctx.lineWidth = Math.max(1, size / 12);
    ctx.stroke();
    ctx.fillStyle = 'rgba(234, 255, 253, 0.92)';
    ctx.textBaseline = 'middle';
    ctx.fillText(WATERMARK, x + pad, y + h / 2);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${(name || 'creation').replace(/[^\w-]+/g, '-').slice(0, 40)}-pleading-sanity.png`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => { URL.revokeObjectURL(link.href); link.remove(); }, 1000);
  } catch {
    toast("Couldn't prepare the download — try again.");
  }
}

function card(c) {
  const by = c.author.username ? `<a href="/profile.html?user=${encodeURIComponent(c.author.username)}">${esc(c.author.displayName)}</a>` : esc(c.author.displayName);
  return `
  <figure class="sx-art" data-creation="${c.id}" data-key="${esc(c.imageKey || '')}">
    <img src="${esc(c.imageUrl)}" alt="${esc(c.title || c.prompt)} — created with Arron" loading="lazy" width="512" height="512" />
    <span class="sx-watermark" aria-hidden="true">${WATERMARK}</span>
    <figcaption>
      <strong>${esc(c.title || c.prompt)}</strong>
      <span class="post-time">🎨 ${by} &amp; Arron · <time datetime="${esc(c.createdAt)}">${new Date(c.createdAt).toLocaleDateString('en-GB')}</time>${c.mine ? (c.shared ? ' · 🌍 in gallery' : ' · 🔒 private') : ''}</span>
      <div class="btn-row">
        <button type="button" class="sbtn small ghost" data-act="download">⬇️ Download</button>
        ${c.mine
          ? `<button type="button" class="sbtn small ghost" data-act="${c.shared ? 'unshare' : 'share'}">${c.shared ? '🔒 Make private' : '🌍 Share to gallery'}</button>
             <button type="button" class="sbtn small ghost" data-act="post">✍️ Post to feed</button>
             <button type="button" class="sbtn small ghost" data-act="delete" aria-label="Delete this creation">🗑️</button>`
          : `<button type="button" class="sbtn small ghost" data-act="report">🚩 Report</button>`}
      </div>
    </figcaption>
  </figure>`;
}

const byId = new Map();

async function load(append = false) {
  if (!append) grid.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
  more.hidden = true;
  try {
    const q = new URLSearchParams({ scope });
    if (append && nextBefore) q.set('before', nextBefore);
    const data = me ? await api(`/api/creations?${q}`) : await (await fetch(`/api/creations?${q}`)).json();
    if (data.error) throw new Error(data.error);
    data.creations.forEach((c) => byId.set(String(c.id), c));
    const html = data.creations.map(card).join('');
    if (append) grid.insertAdjacentHTML('beforeend', html);
    else grid.innerHTML = html || `<p class="empty">${scope === 'mine' ? 'Nothing yet — your first creation is one idea away. ✨' : 'The gallery is waiting for its first piece. Create something and share it 💙'}</p>`;
    nextBefore = data.nextBefore;
    more.hidden = !nextBefore;
  } catch (error) {
    grid.innerHTML = `<p class="notice err">${esc(error.message || 'The gallery is resting — try again soon.')}</p>`;
  }
}

function setScope(next) {
  scope = next;
  tabs.querySelectorAll('[data-scope]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.scope === scope)));
  load();
}

tabs.addEventListener('click', (e) => {
  const b = e.target.closest('[data-scope]');
  if (!b) return;
  if (b.dataset.scope === 'mine' && !me) { location.href = '/login.html?next=%2Fcreations.html%23mine'; return; }
  history.replaceState(null, '', b.dataset.scope === 'mine' ? '#mine' : '#gallery');
  setScope(b.dataset.scope);
});
more.addEventListener('click', () => load(true));

async function act(fig, action) {
  const id = fig.dataset.creation;
  const c = byId.get(id);
  if (action === 'download') return download(`/api/creations/${id}/image`, c?.title);
  if (action === 'share' || action === 'unshare') {
    try {
      const { shared } = await api(`/api/creations/${id}`, { method: 'POST', body: { action } });
      if (c) c.shared = shared;
      fig.outerHTML = card({ ...c, shared });
      toast(shared ? 'Shared to the community gallery 🌍' : 'Back to private 🔒');
    } catch (error) { toast(error.message); }
  } else if (action === 'post') {
    try {
      const { post } = await api('/api/posts', {
        method: 'POST',
        body: { kind: 'image', imageKey: c.imageKey, title: c.title, body: `🎨 Created with Arron: “${c.prompt}”`, mood: 'rising', truthTag: 'philosophy' },
      });
      toast('Posted to the feed 💙');
      setTimeout(() => { location.href = `/feed.html?post=${post.id}#community`; }, 900);
    } catch (error) {
      toast(error.data?.onboarding ? 'Finish your profile first, then you can post.' : error.message, 6000);
    }
  } else if (action === 'delete') {
    if (!confirm('Delete this creation? This cannot be undone.')) return;
    try {
      await api(`/api/creations/${id}`, { method: 'DELETE' });
      fig.remove();
      toast('Creation deleted.');
    } catch (error) { toast(error.message); }
  } else if (action === 'report') {
    if (!me) { toast('Sign in to report something to the Guardians.'); return; }
    const { openReport } = await import('/js/social.js');
    openReport('creation', id);
  }
}

function wire(container) {
  container.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    const fig = b?.closest('[data-creation]');
    if (fig) act(fig, b.dataset.act);
  });
}
wire(grid);

// ─── CREATE ───
if (!me) {
  createBox.innerHTML = `
    <p>Describe a feeling, a memory or a hope — Arron paints it in the Sanctuary's cosmic style.</p>
    <div class="btn-row"><a class="sbtn primary" href="/login.html?next=%2Fcreations.html">Sign in to create</a><a class="sbtn ghost" href="/signup.html">Join free</a></div>`;
} else {
  createBox.innerHTML = `
    <form id="create-form" novalidate>
      <label class="field"><span>What would you like Arron to create?</span>
        <textarea name="prompt" id="prompt" maxlength="500" rows="3" required placeholder="e.g. A lighthouse made of starlight guiding a small boat home"></textarea>
        <small>Every idea passes the Truth Filter first. Kind, hopeful, healing. Up to 6 creations a day.</small>
      </label>
      <p class="muted" id="ideas-label" style="margin:0 0 6px">Need a spark?</p>
      <div class="sx-ideas" role="group" aria-labelledby="ideas-label">
        ${IDEAS.slice(0, 5).map((i) => `<button type="button" class="chip" data-idea="${esc(i)}">${esc(i.split(' ').slice(0, 5).join(' '))}…</button>`).join('')}
      </div>
      <label class="field"><span>Title (optional)</span>
        <input type="text" name="title" maxlength="80" placeholder="Give it a name" />
      </label>
      <button class="sbtn primary block" type="submit" id="create-btn">🎨 Create image</button>
    </form>
    <div id="create-out" aria-live="polite"></div>`;
  const form = document.getElementById('create-form');
  const out = document.getElementById('create-out');
  wire(out);
  form.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-idea]');
    if (chip) { form.prompt.value = chip.dataset.idea; form.prompt.focus(); }
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = form.prompt.value.trim();
    if (prompt.length < 4) { out.innerHTML = '<p class="notice err">Tell Arron what you\'d like to see — a few words is enough.</p>'; return; }
    const btn = document.getElementById('create-btn');
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    out.innerHTML = `<div class="sx-generating"><div><div class="sx-orb" aria-hidden="true"></div><p><strong>Arron is painting…</strong></p><p class="muted">This usually takes 10–30 seconds. Breathe with the orb.</p></div></div>`;
    try {
      const { creation } = await api('/api/creations', { method: 'POST', body: { prompt, title: form.title.value.trim() } });
      byId.set(String(creation.id), creation);
      out.innerHTML = `<div class="sx-result">${card(creation)}<p class="post-time center">Saved privately to My Creations. Share it whenever you're ready.</p></div>`;
      if (scope === 'mine') load();
    } catch (error) {
      out.innerHTML = `<p class="notice err">${esc(error.message)}${error.data?.reason ? ' ' + esc(error.data.reason) : ''}</p>`;
    } finally {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
    }
  });
}

setScope(scope);
if (location.hash === '#create') document.getElementById('create')?.scrollIntoView();
