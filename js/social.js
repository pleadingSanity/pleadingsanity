// ==============================================================
// PLEADING SANITY — SOCIAL UI
// Shared rendering for posts, comments, people and safety tools:
// content-warning veils, crisis support strips and the report dialog.
// ==============================================================

import { api, avatarText, esc, toast } from '/js/auth.js';

export const MOODS = {
  low: { label: 'Low', icon: '🌧️' },
  anxious: { label: 'Anxious', icon: '🌪️' },
  rising: { label: 'Rising', icon: '🌅' },
  fierce: { label: 'Fierce', icon: '🔥' },
};

export const moodBadge = (mood) => {
  const m = MOODS[mood] || MOODS.rising;
  return `<span class="mood mood-${esc(mood in MOODS ? mood : 'rising')}"><span aria-hidden="true">${m.icon}</span> ${m.label}</span>`;
};

export const avatar = (who, size = '') =>
  `<span class="ps-avatar ${size}" aria-hidden="true">${esc(avatarText(who?.avatar, who?.displayName))}</span>`;

export const CRISIS_STRIP = `
  <div class="crisis-strip" role="note">
    💙 <strong>You're not alone.</strong> If this is you right now, please reach out:
    <a href="tel:116123">Samaritans 116 123</a> (free, 24/7) ·
    text <a href="sms:85258?body=SHOUT">SHOUT to 85258</a> ·
    <a href="tel:999">999</a> in an emergency ·
    <a href="/crisis.html">more support</a>
  </div>`;

export function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const s = Math.max(1, Math.round((Date.now() - then) / 1000));
  if (s < 60) return 'just now';
  const units = [[60, 'min'], [24, 'hr'], [7, 'day'], [4.35, 'wk'], [12, 'mo'], [Infinity, 'yr']];
  let value = s / 60;
  for (const [step, label] of units) {
    if (value < step) {
      const n = Math.floor(value);
      return `${n} ${label}${n === 1 ? '' : 's'} ago`;
    }
    value /= step;
  }
  return new Date(iso).toLocaleDateString('en-GB');
}

const KIND_LABEL = { story: '📖 My Story', video: '🎬 Video', image: '🖼️ Image', text: '' };

export function postHTML(post, { full = false } = {}) {
  const author = post.author;
  const profileLink = author.username ? `/profile.html?user=${encodeURIComponent(author.username)}` : '#';
  const media = post.videoId
    ? `<div class="post-media"><iframe src="https://www.youtube-nocookie.com/embed/${esc(post.videoId)}?autoplay=1&mute=1&playsinline=1&rel=0"
         title="${esc(post.title || 'Video post')}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`
    : post.imageUrl
      ? `<div class="post-media"><img src="${esc(post.imageUrl)}" alt="${esc(post.title || 'Image shared by ' + author.displayName)}" loading="lazy" /></div>`
      : '';
  const long = !full && post.body.length > 600;
  const content = `
    ${post.title ? `<h3>${esc(post.title)}</h3>` : ''}
    ${post.body ? `<div class="post-body${long ? ' clamp' : ''}">${esc(post.body)}</div>` : ''}
    ${long ? '<button type="button" class="linkish" data-expand>Read more</button>' : ''}
    ${media}
    ${post.tags.length ? `<div class="tagline">${post.tags.map((t) => `<a href="/feed.html?tag=${encodeURIComponent(t)}#community">#${esc(t)}</a>`).join('')}</div>` : ''}`;

  return `
  <article class="post" data-post="${post.id}" aria-labelledby="post-${post.id}-by">
    <div class="post-head">
      <a href="${profileLink}" tabindex="-1">${avatar(author)}</a>
      <div>
        <a class="post-author" id="post-${post.id}-by" href="${profileLink}">${esc(author.displayName)}</a>
        <div class="post-time">${author.username ? '@' + esc(author.username) + ' · ' : ''}<time datetime="${esc(post.createdAt)}">${timeAgo(post.createdAt)}</time>${post.visibility === 'friends' ? ' · 🔒 friends' : ''}</div>
      </div>
      <span class="spacer"></span>
      ${KIND_LABEL[post.kind] ? `<span class="tag">${KIND_LABEL[post.kind]}</span>` : ''}
      ${moodBadge(post.mood)}
    </div>
    ${post.contentWarning ? '<p><span class="tw-banner">⚠️ TW · heavy topic</span></p>' : ''}
    ${post.contentWarning
      ? `<div class="cw-wrap veiled">
           <div class="cw-cover">
             <strong>Content warning</strong>
             <p>This post touches on a heavy topic. Take care of yourself first.</p>
             <button type="button" class="sbtn small" data-reveal>Show post</button>
           </div>
           <div class="cw-content" aria-hidden="true">${content}</div>
         </div>`
      : content}
    ${post.crisis ? CRISIS_STRIP : ''}
    <div class="post-actions">
      <button type="button" data-like aria-pressed="${post.liked}" class="${post.liked ? 'liked' : ''}">
        <span aria-hidden="true">${post.liked ? '💗' : '🤍'}</span> <span data-like-count>${post.likes}</span><span class="sr-only"> hearts</span>
      </button>
      <button type="button" data-comments aria-expanded="false">💬 <span data-comment-count>${post.comments}</span><span class="sr-only"> comments</span></button>
      <button type="button" data-share>🔗 Share</button>
      ${post.mine
        ? '<button type="button" class="report" data-delete>🗑️ Delete</button>'
        : '<button type="button" class="report" data-report>🚩 Report</button>'}
    </div>
    <div class="comments" hidden></div>
  </article>`;
}

function commentHTML(c) {
  const link = c.author.username ? `/profile.html?user=${encodeURIComponent(c.author.username)}` : '#';
  return `
    <div class="comment" data-comment="${c.id}">
      ${avatar(c.author, 'sm')}
      <div class="comment-body">
        <div class="row"><a class="post-author" href="${link}">${esc(c.author.displayName)}</a>
          <span class="post-time">${timeAgo(c.createdAt)}</span><span class="spacer"></span>
          ${c.mine ? `<button type="button" class="linkish" data-delete-comment="${c.id}">Delete</button>`
                   : `<button type="button" class="linkish" data-report-comment="${c.id}">Report</button>`}
        </div>
        <p>${esc(c.body)}</p>
        ${c.crisis ? CRISIS_STRIP : ''}
      </div>
    </div>`;
}

async function openComments(article, postId) {
  const box = article.querySelector('.comments');
  const toggle = article.querySelector('[data-comments]');
  if (!box.hidden) {
    box.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    return;
  }
  box.hidden = false;
  toggle.setAttribute('aria-expanded', 'true');
  box.innerHTML = '<p class="muted">Loading kind words…</p>';
  try {
    const { comments } = await api(`/api/posts/${postId}/comments`);
    box.innerHTML = `
      <div data-list>${comments.map(commentHTML).join('') || '<p class="muted" data-none>No comments yet — be the first kind voice.</p>'}</div>
      <form class="comment-form">
        <label class="sr-only" for="c-${postId}">Write a kind comment</label>
        <textarea id="c-${postId}" name="body" maxlength="1000" rows="1" placeholder="Say something kind…" required></textarea>
        <button class="sbtn small primary" type="submit">Send</button>
      </form>
      <p class="post-time">Comments are checked for kindness before they appear. 💙</p>`;
    box.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const button = form.querySelector('button');
      button.setAttribute('aria-busy', 'true');
      button.disabled = true;
      try {
        const { comment } = await api(`/api/posts/${postId}/comments`, { method: 'POST', body: { body: form.body.value } });
        box.querySelector('[data-none]')?.remove();
        box.querySelector('[data-list]').insertAdjacentHTML('beforeend', commentHTML(comment));
        form.reset();
        const count = article.querySelector('[data-comment-count]');
        count.textContent = String(Number(count.textContent) + 1);
      } catch (error) {
        toast(error.data?.reason ? `${error.message} ${error.data.reason}` : error.message, 6000);
      } finally {
        button.removeAttribute('aria-busy');
        button.disabled = false;
      }
    });
  } catch (error) {
    box.innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
  }
}

// ─── REPORT DIALOG ───
let dialog;
export function openReport(targetType, targetId) {
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.className = 'ps-dialog';
    dialog.setAttribute('aria-labelledby', 'report-title');
    dialog.innerHTML = `
      <form method="dialog">
        <h2 id="report-title">🚩 Report to moderators</h2>
        <p class="muted">Reports are private. The person won't know it was you.</p>
        <label class="field"><span>What's wrong?</span>
          <select name="reason" required>
            <option value="harassment">Bullying or harassment</option>
            <option value="hate">Hate or discrimination</option>
            <option value="self-harm-risk">Someone may be at risk</option>
            <option value="unsafe-content">Unsafe or graphic content</option>
            <option value="impersonation">Fake account / impersonation</option>
            <option value="spam">Spam or scam</option>
            <option value="other">Something else</option>
          </select>
        </label>
        <label class="field"><span>Anything else? (optional)</span>
          <textarea name="details" maxlength="1000" rows="3"></textarea>
        </label>
        <p class="post-time">If someone is in immediate danger, call 999.</p>
        <div class="btn-row">
          <button class="sbtn primary" value="send">Send report</button>
          <button class="sbtn ghost" value="cancel" formnovalidate>Cancel</button>
        </div>
      </form>`;
    document.body.appendChild(dialog);
  }
  const form = dialog.querySelector('form');
  form.reset();
  dialog.onclose = async () => {
    if (dialog.returnValue !== 'send') return;
    try {
      await api('/api/reports', {
        method: 'POST',
        body: { targetType, targetId, reason: form.reason.value, details: form.details.value },
      });
      toast('Thank you. Our moderators will look at this. 💙');
    } catch (error) {
      toast(error.message);
    }
  };
  dialog.showModal();
}

// ─── POST INTERACTIONS (event delegation) ───
export function wirePosts(container, { onDelete } = {}) {
  container.addEventListener('click', async (e) => {
    const target = e.target.closest('button');
    if (!target) return;
    const article = target.closest('[data-post]');

    if (target.matches('[data-delete-comment]')) {
      const id = target.dataset.deleteComment;
      if (!confirm('Delete this comment?')) return;
      try {
        await api(`/api/comments/${id}`, { method: 'DELETE' });
        target.closest('.comment').remove();
        const count = article?.querySelector('[data-comment-count]');
        if (count) count.textContent = String(Math.max(0, Number(count.textContent) - 1));
      } catch (error) { toast(error.message); }
      return;
    }
    if (target.matches('[data-report-comment]')) return openReport('comment', target.dataset.reportComment);
    if (!article) return;
    const id = article.dataset.post;

    if (target.matches('[data-reveal]')) {
      const wrap = target.closest('.cw-wrap');
      wrap.classList.remove('veiled');
      wrap.querySelector('.cw-content').removeAttribute('aria-hidden');
      wrap.querySelector('.cw-cover').remove();
      wrap.querySelector('.cw-content h3, .cw-content .post-body')?.setAttribute('tabindex', '-1');
      wrap.querySelector('.cw-content h3, .cw-content .post-body')?.focus();
    } else if (target.matches('[data-expand]')) {
      article.querySelector('.post-body')?.classList.remove('clamp');
      target.remove();
    } else if (target.matches('[data-like]')) {
      try {
        const { liked, likes } = await api(`/api/posts/${id}/like`, { method: 'POST' });
        target.classList.toggle('liked', liked);
        target.setAttribute('aria-pressed', String(liked));
        target.querySelector('[aria-hidden]').textContent = liked ? '💗' : '🤍';
        target.querySelector('[data-like-count]').textContent = likes;
      } catch (error) { toast(error.message); }
    } else if (target.matches('[data-comments]')) {
      openComments(article, id);
    } else if (target.matches('[data-share]')) {
      const url = `${location.origin}/feed.html?post=${id}#community`;
      try {
        if (navigator.share) await navigator.share({ title: 'Pleading Sanity', url });
        else { await navigator.clipboard.writeText(url); toast('Link copied — only members can open it. 💙'); }
      } catch { /* share sheet closed */ }
    } else if (target.matches('[data-report]')) {
      openReport('post', id);
    } else if (target.matches('[data-delete]')) {
      if (!confirm('Delete this post? This cannot be undone.')) return;
      try {
        await api(`/api/posts/${id}`, { method: 'DELETE' });
        article.remove();
        toast('Post deleted.');
        onDelete?.(id);
      } catch (error) { toast(error.message); }
    }
  });
}

// ─── PEOPLE ───
export function personHTML(p, actions = '') {
  const link = `/profile.html?user=${encodeURIComponent(p.username)}`;
  return `
    <div class="person" data-username="${esc(p.username)}">
      <a href="${link}" tabindex="-1">${avatar(p)}</a>
      <div class="person-body">
        <a class="person-name" href="${link}">${esc(p.displayName)}</a>
        <div class="person-meta">@${esc(p.username)}${p.country ? ' · 📍 ' + esc(p.country) : ''}${p.isPrivate ? ' · 🔒' : ''}</div>
        <div class="row" style="margin:4px 0">${moodBadge(p.mood)}${p.shared ? `<span class="post-time">✨ ${p.shared} in common</span>` : ''}</div>
        ${p.bio ? `<p class="person-bio">${esc(p.bio)}</p>` : ''}
        ${p.interests?.length ? `<div class="tagline">${p.interests.slice(0, 5).map((t) => `<span>#${esc(t)}</span>`).join('')}</div>` : ''}
        <div class="btn-row">${actions}</div>
      </div>
    </div>`;
}

// Friend action buttons for a given relationship state.
export function friendButtons(state) {
  switch (state) {
    case 'friends':
      return '<button type="button" class="sbtn small ghost" data-friend="remove">✓ Friends · Remove</button>';
    case 'outgoing':
      return '<button type="button" class="sbtn small ghost" data-friend="cancel">⏳ Requested · Cancel</button>';
    case 'incoming':
      return '<button type="button" class="sbtn small primary" data-friend="accept">✓ Accept</button><button type="button" class="sbtn small ghost" data-friend="decline">Decline</button>';
    case 'self':
      return '';
    default:
      return '<button type="button" class="sbtn small primary" data-friend="request">➕ Add friend</button>';
  }
}

const STATE_AFTER = { friends: 'friends', outgoing: 'outgoing', none: 'none' };

export async function sendFriendAction(username, action) {
  if ((action === 'remove') && !confirm('Remove this friend?')) return null;
  const { status } = await api('/api/friends', { method: 'POST', body: { username, action } });
  const messages = { request: 'Friend request sent 💙', accept: "You're now friends 💙", decline: 'Request declined.', cancel: 'Request cancelled.', remove: 'Friend removed.' };
  toast(status === 'friends' && action === 'request' ? "You're now friends 💙" : messages[action]);
  return STATE_AFTER[status] ?? 'none';
}

// ─── PROFILE OPTIONS ───
export const AVATARS = ['🌌', '🌅', '🔥', '🌊', '🌙', '⭐', '🦋', '🌻', '🐺', '🦁', '🐉', '🌈', '💙', '🧠', '🎧', '🌿', '🕊️', '⚡'];

export const INTERESTS = [
  'Anxiety', 'Depression', 'Bipolar', 'PTSD', 'ADHD', 'Autism', 'OCD', 'Grief', 'Addiction', 'Recovery',
  'SelfCare', 'MensMentalHealth', 'Parenting', 'Veterans', 'Music', 'Art', 'Writing', 'Fitness', 'Nature',
  'Gaming', 'Meditation', 'Faith', 'Survivor', 'RiseFromMadness',
];

export const COUNTRIES = [
  'United Kingdom', 'Ireland', 'United States', 'Canada', 'Australia', 'New Zealand', 'South Africa', 'India',
  'Pakistan', 'Nigeria', 'Kenya', 'Ghana', 'Jamaica', 'Trinidad and Tobago', 'France', 'Germany', 'Spain',
  'Portugal', 'Italy', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Poland', 'Ukraine', 'Romania',
  'Greece', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland', 'Czechia', 'Hungary', 'Turkey', 'Israel',
  'United Arab Emirates', 'Saudi Arabia', 'Egypt', 'Morocco', 'Brazil', 'Argentina', 'Mexico', 'Colombia',
  'Chile', 'Japan', 'South Korea', 'China', 'Philippines', 'Singapore', 'Malaysia', 'Indonesia', 'Thailand',
  'Vietnam', 'Other',
];

export const countryOptions = (selected = '') =>
  `<option value="">Prefer not to say</option>` +
  COUNTRIES.map((c) => `<option${c === selected ? ' selected' : ''}>${esc(c)}</option>`).join('');

// Wire a group of toggle chips; returns a getter for the selected values.
export function chipGroup(container, values, selected = [], { single = false } = {}) {
  const chosen = new Set(selected.map((s) => s.toLowerCase()));
  container.innerHTML = values
    .map((v) => {
      const value = typeof v === 'string' ? v : v.value;
      const label = typeof v === 'string' ? '#' + v : v.label;
      return `<button type="button" class="chip" data-value="${esc(value)}" aria-pressed="${chosen.has(value.toLowerCase())}">${esc(label)}</button>`;
    })
    .join('');
  container.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-value]');
    if (!chip) return;
    if (single) container.querySelectorAll('[data-value]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    chip.setAttribute('aria-pressed', String(single || chip.getAttribute('aria-pressed') !== 'true'));
  });
  return () => [...container.querySelectorAll('[aria-pressed="true"]')].map((c) => c.dataset.value);
}

export function setChips(container, selected) {
  const chosen = new Set(selected.map((s) => s.toLowerCase()));
  container.querySelectorAll('[data-value]').forEach((c) => c.setAttribute('aria-pressed', String(chosen.has(c.dataset.value.toLowerCase()))));
}
