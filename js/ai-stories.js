// ==============================================================
// 💬 AI STORIES — the community wall of Arron's best moments
// Everyone can read and heart. Members share a moment: what they
// said, what Arron said, and why it mattered. Every story passes
// the same kindness check as community posts.
// A draft can arrive from Arron's chat (sessionStorage) so sharing
// a lovely reply takes one tap.
// ==============================================================

import { api, esc, avatarText, loadMe, toast } from '/js/auth.js';

const DEVICE = 'ps-studio-device'; // shared with AI Studio hearts
const DRAFT = 'ps-story-draft';
const KINDS = {
  inspiring: ['🌟', 'Inspiring'],
  funny: ['😂', 'Funny'],
  wisdom: ['🦉', 'Wisdom'],
  win: ['🏆', 'Win'],
};

const wall = document.querySelector('[data-wall]');
const more = document.querySelector('[data-more]');
const shareBox = document.querySelector('[data-share]');
const state = { kind: 'all', sort: 'new' };

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

const lines = (text) => esc(text).replace(/\n/g, '<br />');
const when = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function storyHTML(s) {
  const [icon, label] = KINDS[s.kind] || KINDS.inspiring;
  const who = s.author
    ? `<a class="as-who" href="/profile.html?user=${encodeURIComponent(s.author.username)}"><span class="ps-avatar sm" aria-hidden="true">${esc(avatarText(s.author.avatar, s.author.displayName))}</span>${esc(s.author.displayName)}</a>`
    : '<span class="as-who"><span class="ps-avatar sm" aria-hidden="true">🌌</span>A member of the family</span>';
  const body = `
    ${s.title ? `<h3>${esc(s.title)}</h3>` : ''}
    ${s.userLine ? `<div class="as-bubble you"><span class="as-label">They said</span><p>${lines(s.userLine)}</p></div>` : ''}
    <div class="as-bubble arron"><span class="as-label">🤖 Arron said</span><p>${lines(s.arronLine)}</p></div>
    ${s.reflection ? `<p class="as-reflect">💭 ${lines(s.reflection)}</p>` : ''}`;
  return `
    <article class="panel as-story" id="story-${s.id}" data-id="${s.id}">
      <header class="as-head">
        <span class="as-kind as-${esc(s.kind)}">${icon} ${label}</span>
        ${who}
        <time class="muted" datetime="${esc(s.createdAt)}">${when(s.createdAt)}</time>
      </header>
      ${s.contentWarning
        ? `<div class="cw-wrap veiled"><div class="cw-cover"><strong>A heavier moment</strong><p>This story touches on something difficult.</p><button type="button" class="sbtn small" data-reveal>Read it</button></div><div class="cw-content" aria-hidden="true">${body}</div></div>`
        : body}
      <div class="btn-row as-actions">
        <button type="button" class="sbtn small ghost" data-heart aria-pressed="${s.hearted}" aria-label="Heart this story (${s.hearts})"><span aria-hidden="true">${s.hearted ? '💗' : '🤍'}</span> <span data-count>${s.hearts || ''}</span></button>
        <button type="button" class="sbtn small ghost" data-share-story>🔗 Share</button>
        ${s.canDelete ? '<button type="button" class="sbtn small ghost" data-delete>🗑️ Remove</button>' : ''}
      </div>
    </article>`;
}

// ─── WALL ───
async function load(before) {
  const q = new URLSearchParams({ kind: state.kind, sort: state.sort, deviceKey: deviceKey() });
  if (before) q.set('before', before);
  try {
    const { stories, nextBefore } = await api('/api/stories?' + q);
    if (!before) wall.innerHTML = '';
    if (!before && !stories.length) {
      wall.innerHTML = `<div class="panel empty"><p>No ${state.kind === 'all' ? '' : esc(KINDS[state.kind][1].toLowerCase()) + ' '}stories yet. Be the first to share a moment ✨</p><a class="sbtn primary" href="/arron.html">Talk to Arron</a></div>`;
    }
    wall.insertAdjacentHTML('beforeend', stories.map(storyHTML).join(''));
    more.innerHTML = nextBefore ? '<button type="button" class="sbtn ghost">Load more stories</button>' : '';
    more.querySelector('button')?.addEventListener('click', () => load(nextBefore), { once: true });
    if (!before && location.hash.startsWith('#story-')) document.querySelector(location.hash)?.scrollIntoView({ block: 'center' });
  } catch (error) {
    wall.innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
  }
}

function wireChips(selector, key) {
  const box = document.querySelector(selector);
  box.addEventListener('click', (e) => {
    const chip = e.target.closest('.as-chip');
    if (!chip) return;
    box.querySelectorAll('.as-chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    state[key] = chip.dataset[key];
    wall.innerHTML = '<div class="skeleton" style="height:160px"></div>';
    load();
  });
}
wireChips('[data-kinds]', 'kind');
wireChips('[data-sorts]', 'sort');

wall.addEventListener('click', async (e) => {
  const card = e.target.closest('.as-story');
  if (!card) return;
  const id = card.dataset.id;
  const btn = e.target.closest('button');
  if (!btn) return;
  try {
    if (btn.matches('[data-reveal]')) {
      const wrap = card.querySelector('.cw-wrap');
      wrap.classList.remove('veiled');
      wrap.querySelector('.cw-cover').remove();
      wrap.querySelector('.cw-content').removeAttribute('aria-hidden');
    } else if (btn.matches('[data-heart]')) {
      const { hearted, hearts } = await api(`/api/stories/${id}/heart`, { method: 'POST', body: { deviceKey: deviceKey() } });
      btn.setAttribute('aria-pressed', String(hearted));
      btn.setAttribute('aria-label', `Heart this story (${hearts})`);
      btn.querySelector('[aria-hidden]').textContent = hearted ? '💗' : '🤍';
      btn.querySelector('[data-count]').textContent = hearts || '';
    } else if (btn.matches('[data-share-story]')) {
      const url = `${location.origin}/ai-stories.html#story-${id}`;
      if (navigator.share) await navigator.share({ title: 'A moment with Arron 💙', url }).catch(() => {});
      else { await navigator.clipboard.writeText(url); toast('Link copied 💙'); }
    } else if (btn.matches('[data-delete]')) {
      if (!confirm('Remove this story from the wall?')) return;
      await api(`/api/stories/${id}`, { method: 'DELETE' });
      card.remove();
      toast('Story removed');
    }
  } catch (error) {
    toast(error.message);
  }
});

// ─── SHARE FORM ───
function readDraft() {
  try {
    const d = JSON.parse(sessionStorage.getItem(DRAFT) || 'null');
    return d && typeof d === 'object' ? d : {};
  } catch {
    return {};
  }
}

function renderShare(me) {
  if (!me) {
    shareBox.innerHTML = `<p>Had a moment with Arron worth passing on? <a href="/login.html?next=${encodeURIComponent('/ai-stories.html#share')}">Sign in</a> or <a href="/signup.html">join free</a> to share it. Reading and hearts are open to everyone.</p>`;
    return;
  }
  if (!me.profile?.onboarded) {
    shareBox.innerHTML = '<p><a href="/onboarding.html?next=%2Fai-stories.html%23share">Finish your profile</a> to share a story.</p>';
    return;
  }
  const d = readDraft();
  shareBox.innerHTML = `
    <form class="as-form" novalidate>
      <label class="field"><span>What kind of moment?</span>
        <select name="kind">${Object.entries(KINDS).map(([k, [i, l]]) => `<option value="${k}">${i} ${l}</option>`).join('')}</select>
      </label>
      <label class="field"><span>Title <small>(optional)</small></span><input name="title" maxlength="100" placeholder="e.g. The night Arron made me laugh at 3am" /></label>
      <label class="field"><span>What you said <small>(optional, leave out anything private)</small></span><textarea name="userLine" maxlength="600" rows="3">${esc(d.userLine || '')}</textarea></label>
      <label class="field"><span>What Arron said</span><textarea name="arronLine" maxlength="1500" rows="4" required>${esc(d.arronLine || '')}</textarea></label>
      <label class="field"><span>Why it mattered <small>(optional)</small></span><textarea name="reflection" maxlength="600" rows="2"></textarea></label>
      <label class="as-check"><input type="checkbox" name="anonymous" /> Share without my name</label>
      <div data-msg></div>
      <div class="btn-row"><button type="submit" class="sbtn primary">✨ Share to the wall</button></div>
    </form>`;
  const form = shareBox.querySelector('form');
  if (d.arronLine) {
    sessionStorage.removeItem(DRAFT);
    shareBox.closest('section').scrollIntoView({ block: 'start' });
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const msg = form.querySelector('[data-msg]');
    const f = new FormData(form);
    if (!String(f.get('arronLine') || '').trim()) {
      msg.innerHTML = '<p class="notice err">Add what Arron said — that\'s the heart of the story.</p>';
      return;
    }
    btn.setAttribute('aria-busy', 'true');
    btn.disabled = true;
    try {
      const { story, crisis } = await api('/api/stories', {
        method: 'POST',
        body: {
          kind: f.get('kind'),
          title: f.get('title'),
          userLine: f.get('userLine'),
          arronLine: f.get('arronLine'),
          reflection: f.get('reflection'),
          anonymous: f.get('anonymous') === 'on',
        },
      });
      form.reset();
      msg.innerHTML = '<p class="notice ok">Shared. Thank you for lifting someone else today 💙</p>';
      if (crisis) toast('Thank you for sharing. If things feel heavy, Samaritans are on 116 123, any time. 💙', 8000);
      wall.querySelector('.empty')?.remove();
      if (state.sort === 'new' && (state.kind === 'all' || state.kind === story.kind)) wall.insertAdjacentHTML('afterbegin', storyHTML(story));
    } catch (error) {
      msg.innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
    } finally {
      btn.removeAttribute('aria-busy');
      btn.disabled = false;
    }
  });
}

loadMe().then(renderShare).catch(() => renderShare(null));
load();
