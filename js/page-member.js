// member.html — page script (kept out of the HTML so the strict Content-Security-Policy allows it)
import { api, esc, loadMe, toast } from '/js/auth.js';
import { CRISIS_STRIP, avatar, friendButtons, moodBadge, openReport, postHTML, roleBadge, sendFriendAction, setViewer, timeAgo, truthBadge, wirePosts } from '/js/social.js';

// ─── /@username — a member's own page ───
// Only what they chose to share: status, shared journal entries,
// shared creations and posts. Guests can visit public pages.
const root = document.getElementById('root');
const username = decodeURIComponent(location.pathname.replace(/^\/@/, '').replace(/\/$/, '')).toLowerCase()
  || (new URLSearchParams(location.search).get('user') || '').toLowerCase();
document.getElementById('canonical').href = `https://pleadingsanity.co.uk/@${encodeURIComponent(username)}`;
const me = await loadMe();
setViewer(me);
const signedIn = Boolean(me?.profile?.onboarded);

const notFound = (text) => {
  root.innerHTML = `<section class="panel empty" style="margin-top:1.5rem"><h1 style="font-size:1.5rem">🌌 ${esc(text)}</h1><div class="btn-row" style="justify-content:center"><a class="sbtn primary" href="/feed.html#community">Community feed</a>${signedIn ? '<a class="sbtn ghost" href="/community.html">Find people</a>' : '<a class="sbtn ghost" href="/signup.html">Join free</a>'}</div></section>`;
};

async function render() {
  if (!/^[a-z0-9_]{3,24}$/.test(username)) return notFound('No one here by that name.');
  let data;
  try {
    data = await api(`/api/profiles/${encodeURIComponent(username)}`);
  } catch (error) {
    return notFound(error.status === 404 ? 'No one here by that name.' : error.message);
  }
  const p = data.profile;
  const isSelf = data.relationship === 'self';
  document.title = `${p.displayName} (@${p.username}) — Pleading Sanity`;
  const joined = new Date(p.joinedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const actions = isSelf
    ? '<a class="sbtn primary" href="/profile.html">✏️ My Sanity Profile</a><a class="sbtn ghost" href="/post.html">✍️ New post</a>'
    : signedIn
      ? `${friendButtons(data.relationship)}<button type="button" class="sbtn small ghost" data-report-user>🚩 Report</button><button type="button" class="sbtn small ghost" data-block>🚫 Block</button>`
      : `<a class="sbtn primary" href="/signup.html?next=${encodeURIComponent(location.pathname)}">💙 Join free to connect</a><a class="sbtn ghost" href="/login.html?next=${encodeURIComponent(location.pathname)}">Sign in</a>`;

  const hero = `
    <section class="panel fade-in member-hero" aria-labelledby="p-name" style="margin-top:1.5rem">
      ${avatar(p, 'lg')}
      <h1 id="p-name">${esc(p.displayName)}</h1>
      <div class="person-meta">@${esc(p.username)}${p.pronouns ? ' · ' + esc(p.pronouns) : ''}${p.country ? ' · 📍 ' + esc(p.country) : ''} · Joined ${joined}</div>
      <div class="row" style="margin-top:8px">${moodBadge(p.mood)}${roleBadge(p.badge)}</div>
      ${data.counts ? `<div class="profile-stats" style="justify-content:center"><span><strong>${data.counts.posts}</strong> posts</span><span><strong>${data.counts.friends}</strong> friends</span></div>` : ''}
      ${p.bio ? `<p class="person-bio" style="font-size:1rem;margin:1rem auto 0;max-width:56ch">${esc(p.bio)}</p>` : ''}
      ${p.interests?.length ? `<div class="tagline" style="justify-content:center">${p.interests.map((t) => `<span>#${esc(t)}</span>`).join('')}</div>` : ''}
      <div class="btn-row" style="margin-top:1rem;justify-content:center" data-actions>${actions}</div>
    </section>`;

  if (data.locked) {
    root.innerHTML = hero + (data.locked === 'members'
      ? `<section class="panel empty"><p>🌿 ${esc(p.displayName)} shares their page with signed-in members.</p><p class="muted">It's free, always — no tiers, no paywalls.</p></section>`
      : `<section class="panel empty"><p>🔒 ${esc(p.displayName)} keeps their page for friends only.</p>${signedIn ? '<p class="muted">Send a friend request — if they accept, you\'ll see their story and posts.</p>' : ''}</section>`);
    wireActions(p);
    return;
  }

  const status = p.status ? `
    <section class="panel status-card" aria-labelledby="st-title">
      <h2 id="st-title">🌿 How ${isSelf ? "I'm" : esc(p.displayName) + ' is'} doing</h2>
      <p class="status-now">“${esc(p.status.text)}”</p>
      <p class="muted" style="margin:0">${p.status.mood ? moodBadge(p.status.mood) + ' · ' : ''}${timeAgo(p.status.at)}</p>
    </section>` : '';

  const journal = data.journal?.length ? `
    <section class="panel" aria-labelledby="j-title">
      <h2 id="j-title">📓 From ${isSelf ? 'my' : 'their'} journal</h2>
      <div class="journal-list">${data.journal.map((j) => `
        <article class="journal-entry">
          <div class="journal-meta"><time datetime="${esc(j.createdAt)}">${timeAgo(j.createdAt)}</time>${j.mood ? moodBadge(j.mood) : ''}${truthBadge(j.truthTag)}</div>
          ${j.title ? `<h3>${esc(j.title)}</h3>` : ''}
          <div class="post-body">${esc(j.body)}</div>
          ${j.crisis ? CRISIS_STRIP : ''}
        </article>`).join('')}</div>
    </section>` : '';

  root.innerHTML = hero + status + `
    ${p.story ? `
      <section class="panel" aria-labelledby="story-title">
        <h2 id="story-title">📖 ${isSelf ? 'My' : 'Their'} Story</h2>
        <div class="cw-wrap veiled" data-story>
          <div class="cw-cover"><strong>A personal story</strong><p>This may touch on difficult experiences.</p><button type="button" class="sbtn small" data-reveal-story>Read the story</button></div>
          <div class="cw-content story-text" aria-hidden="true">${esc(p.story)}</div>
        </div>
      </section>` : ''}
    ${journal}
    <section class="panel" aria-labelledby="pp-title" data-passport-panel hidden>
      <h2 id="pp-title">🛂 ${isSelf ? 'My' : 'Their'} Sanity Passport</h2>
      <dl class="passport-list" data-passport></dl>
      ${isSelf ? '<p class="muted" style="margin:0"><a href="/passport.html">Edit my Passport →</a></p>' : ''}
    </section>
    <section class="panel" aria-labelledby="c-title" data-creations-panel hidden>
      <h2 id="c-title">🎨 Creations</h2>
      <div class="creation-strip" data-creations></div>
    </section>
    <section aria-labelledby="posts-title">
      <h2 id="posts-title" style="margin:1.5rem 0 1rem">Posts</h2>
      <div data-posts></div>
      <div class="center" data-more></div>
    </section>`;

  wireActions(p);
  root.querySelector('[data-reveal-story]')?.addEventListener('click', () => {
    const wrap = root.querySelector('[data-story]');
    wrap.classList.remove('veiled');
    wrap.querySelector('.cw-cover').remove();
    wrap.querySelector('.cw-content').removeAttribute('aria-hidden');
  });
  loadCreations();
  loadPosts(root.querySelector('[data-posts]'), root.querySelector('[data-more]'));
}

function wireActions(p) {
  const actions = root.querySelector('[data-actions]');
  if (!signedIn || !actions) return;
  actions.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    try {
      if (b.dataset.friend) {
        const state = await sendFriendAction(p.username, b.dataset.friend);
        if (state) render();
      } else if (b.matches('[data-report-user]')) {
        openReport('user', p.username);
      } else if (b.matches('[data-block]')) {
        if (!confirm(`Block ${p.displayName}? They won't be able to see you or your posts, and any friendship ends.`)) return;
        await api('/api/blocks', { method: 'POST', body: { username: p.username, block: true } });
        toast('Blocked. You can undo this in Settings.');
        location.replace('/community.html');
      }
    } catch (error) { toast(error.message); }
  });
}

async function loadCreations() {
  // Sanity Passport: only the fields this person made visible to this viewer.
  api(`/api/passport/${encodeURIComponent(username)}`).then(({ fields }) => {
    if (!fields?.length) return;
    const LABELS = { whoIAm: 'Who I am', whatMatters: 'What matters to me', inspires: 'What inspires me', learning: "What I'm learning", creating: "What I'm creating", helps: 'What helps me', goals: 'My goals', story: 'My story', interests: 'My interests', journey: 'My journey' };
    root.querySelector('[data-passport]').innerHTML = fields.map((f) => `<dt>${esc(LABELS[f.key] || '')}</dt><dd>${esc(f.text)}</dd>`).join('');
    root.querySelector('[data-passport-panel]').hidden = false;
  }).catch(() => {});

  try {
    const { creations } = await api(`/api/creations?author=${encodeURIComponent(username)}`);
    if (!creations.length) return;
    root.querySelector('[data-creations]').innerHTML = creations.slice(0, 8).map((c) =>
      `<a href="/creations.html" title="${esc(c.title || c.prompt)}"><img src="${esc(c.imageUrl)}" alt="${esc(c.title || c.prompt)} — created with Arron" loading="lazy" width="160" height="160" /></a>`).join('');
    root.querySelector('[data-creations-panel]').hidden = false;
  } catch { /* creations are a bonus */ }
}

async function loadPosts(list, more, before) {
  try {
    const q = new URLSearchParams({ author: username });
    if (!signedIn) q.set('public', '1');
    if (before) q.set('before', before);
    const { posts, nextBefore } = await api(`/api/posts?${q}`);
    list.insertAdjacentHTML('beforeend', posts.map((post) => postHTML(post)).join('') || (before ? '' : '<div class="panel empty"><p>No posts to show yet.</p></div>'));
    more.innerHTML = nextBefore ? '<button type="button" class="sbtn ghost">Load more</button>' : '';
    more.querySelector('button')?.addEventListener('click', () => loadPosts(list, more, nextBefore), { once: true });
  } catch (error) {
    list.innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
  }
}

wirePosts(root);
render();
