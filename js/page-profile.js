// profile.html — page script (kept out of the HTML so the strict Content-Security-Policy allows it)
import { api, clearMe, esc, loadMe, requireMember, toast } from '/js/auth.js';
import { CRISIS_STRIP, MOODS, TRUTH_TAGS, avatar, moodBadge, postHTML, setViewer, timeAgo, truthBadge, wirePosts } from '/js/social.js';
import { mountProfileForm } from '/js/profile-form.js';

// ─── MY SANITY PROFILE ───
// Your own space. Other people's pages live at /@username.
// Old links (/profile.html?user=name) open that member's page.
const requested = (new URLSearchParams(location.search).get('user') || '').toLowerCase();
if (/^[a-z0-9_]{3,24}$/.test(requested)) {
  location.replace(`/@${requested}`);
  await new Promise(() => {});
}
const me = await requireMember();
const root = document.getElementById('root');
setViewer(me);

const ROLES = {
  owner: ['💫', 'Owner · Founder', 'Full power: instant publishing, the review queue, roles, Arron\'s voice — and no limits.'],
  member: ['🌿', 'Member · free forever', 'Journal, post, create images with Arron and share — all free, always.'],
  guardian: ['🛡️', 'Guardian', 'Trusted helper: reviews flags and can pin posts to the feed.'],
  creator: ['✨', 'Creator', 'Creator mode: Arron and the AI Studio run at full power for you.'],
  admin: ['🛡️', 'Admin', 'Full power plus the moderation queue.'],
};
function myRole(role = 'member') {
  const [icon, name, desc] = ROLES[role] || ROLES.member;
  return `<span class="role-badge role-${role === 'owner' ? 'owner' : role === 'member' ? 'guardian' : 'creator'}" title="${esc(desc)}"><span aria-hidden="true">${icon}</span> ${esc(name)}</span>`;
}
const AUDIENCE = { private: '🔒 Only me', members: '🌿 Members', public: '🌍 Public' };

function playerHTML() {
  const G = window.PSGames;
  if (!G) return '';
  const pr = G.profile();
  const li = G.levelInfo(pr.xp);
  const day = G.dayKey();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yKey = G.dayKey(y);
  const streak = pr.streak.last === day || pr.streak.last === yKey ? pr.streak.count : 0;
  const earned = Object.keys(pr.badges).sort((a, b) => pr.badges[b] - pr.badges[a]);
  const total = Object.keys(G.BADGES).length;
  const badges = earned.filter((id) => G.BADGES[id]).slice(0, 12).map((id) => {
    const b = G.BADGES[id];
    return `<li class="pp-badge" title="${esc(b.desc)}"><span aria-hidden="true">${b.icon}</span>${esc(b.name)}</li>`;
  }).join('');
  const levels = (G.GAMES || []).map((game) => {
    const st = pr.games[game.id] || { bestLevel: 0, plays: 0 };
    const n = st.plays ? (st.bestLevel || 1) : 0;
    return `<li><span>${esc(game.icon)} ${esc(game.title)}</span><strong>Lv ${n}</strong></li>`;
  }).join('');
  return `
    <section class="panel" aria-labelledby="player-title">
      <h2 id="player-title">🌟 Cosmic Player</h2>
      <div class="pp-stats">
        <div><strong>Lv ${li.level}</strong><span>${esc(li.title)}</span></div>
        <div><strong>${pr.xp}</strong><span>total XP</span></div>
        <div><strong>🔥 ${streak}</strong><span>day streak</span></div>
        <div><strong>${earned.length}/${total}</strong><span>badges</span></div>
      </div>
      <div class="pp-bar" role="progressbar" aria-label="XP to next level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${li.pct}"><span style="width:${li.pct}%"></span></div>
      <p class="muted">${li.into} / ${li.need} XP to level ${li.level + 1}</p>
      ${badges ? `<ul class="pp-badges">${badges}</ul>` : '<p class="muted">No badges yet — your first game unlocks ✨ First Light.</p>'}
      <h3 style="margin:1rem 0 .4rem;font-size:1rem">Game levels</h3>
      <ul class="pp-levels">${levels}</ul>
      <div class="btn-row"><a class="sbtn primary" href="/games.html">🎮 Play today's challenge</a><a class="sbtn ghost" href="/games.html#psg-hub">🏅 All badges</a></div>
      <p class="muted" style="font-size:.85rem">Level numbers live on this device. They show on your profile, not on someone else's page.</p>
    </section>`;
}

function savedHTML() {
  let items = {};
  try { items = JSON.parse(localStorage.getItem('ps-saved-items')) || {}; } catch {}
  const list = Object.values(items).sort((a, b) => b.at - a.at).slice(0, 20);
  const icon = { post: '🌟', video: '🎬', quote: '✨', tip: '💡' };
  const rows = list.map((it) => {
    const text = `<span aria-hidden="true">${icon[it.type] || '⭐'}</span> <span>${esc(it.title)}${it.sub ? ` <small class="muted">— ${esc(it.sub)}</small>` : ''}</span>`;
    const ext = it.href?.startsWith('http');
    return `<li>${it.href ? `<a href="${esc(it.href)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>` : text}</li>`;
  }).join('');
  return `
    <section class="panel" aria-labelledby="saved-title">
      <h2 id="saved-title">⭐ Saved</h2>
      ${rows ? `<ul class="pp-saved">${rows}</ul>` : '<p class="muted">Tap ☆ on any card in the For You feed to keep it here.</p><a class="sbtn ghost" href="/feed.html">🌟 Open the feed</a>'}
    </section>`;
}

// ─── STATUS — "How are you really doing today?" ───
function statusHTML(p) {
  const st = p.status;
  const moods = Object.entries(MOODS).map(([v, m]) => `<label class="chip-radio"><input type="radio" name="mood" value="${v}" ${(st?.mood || p.mood) === v ? 'checked' : ''} /> <span>${m.icon} ${m.label}</span></label>`).join('');
  return `
    <section class="panel status-card" aria-labelledby="status-title">
      <h2 id="status-title">🌿 My Status</h2>
      ${st ? `<p class="status-now">“${esc(st.text)}”</p><p class="muted" style="margin-top:0">${st.mood ? moodBadge(st.mood) + ' · ' : ''}${timeAgo(st.at)}</p>` : '<p class="muted">How are you really doing today? A few honest words is enough.</p>'}
      <form class="status-form" data-status novalidate>
        <label class="field"><span>How are you really doing today?</span>
          <textarea name="text" maxlength="280" rows="2" placeholder="I'm feeling…"></textarea>
        </label>
        <div class="picker" role="radiogroup" aria-label="Mood">${moods}</div>
        <label class="check field" style="margin-top:.75rem">
          <input type="checkbox" name="share" />
          <span>Also share it to my page and the community feed</span>
        </label>
        <div class="btn-row"><button class="sbtn primary" type="submit">Check in 💙</button>${st ? '<button type="button" class="sbtn ghost" data-clear-status>Clear status</button>' : ''}</div>
      </form>
    </section>`;
}

// ─── JOURNAL — private first ───
function entryHTML(e) {
  const title = e.title || new Date(e.createdAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  return `
    <article class="journal-entry" data-entry="${e.id}">
      <div class="journal-meta">
        <time datetime="${esc(e.createdAt)}">${timeAgo(e.createdAt)}</time>
        ${e.source === 'arron' ? '<span class="tag">💙 With Arron</span>' : ''}
        ${e.mood ? moodBadge(e.mood) : ''}${truthBadge(e.truthTag)}
        <span class="tag">${AUDIENCE[e.visibility] || AUDIENCE.private}</span>
        ${e.postId ? `<a href="/feed.html?post=${e.postId}#community">On the feed →</a>` : ''}
      </div>
      <h3>${esc(title)}</h3>
      <div class="post-body">${esc(e.body)}</div>
      <div class="journal-actions">
        <label class="sr-only" for="vis-${e.id}">Who can see this entry</label>
        <select id="vis-${e.id}" data-visibility>
          ${Object.entries(AUDIENCE).map(([v, l]) => `<option value="${v}" ${e.visibility === v ? 'selected' : ''}>${l}${v === 'private' ? '' : ' — on my page'}</option>`).join('')}
        </select>
        ${e.postId ? '' : '<button type="button" class="sbtn small ghost" data-share-entry>🌌 Share to the feed</button>'}
        <button type="button" class="sbtn small ghost" data-delete-entry>🗑️ Delete</button>
      </div>
    </article>`;
}

function journalHTML() {
  return `
    <section class="panel" id="journal" aria-labelledby="journal-title" tabindex="-1">
      <h2 id="journal-title">📓 My Journal</h2>
      <p class="muted" style="margin-top:0">Private until you choose otherwise. Not even Guardians can read private entries. Tell Arron <em>"write this in my journal"</em> and it lands here too.</p>
      <form data-journal novalidate>
        <label class="field"><span>Title <small style="display:inline">(optional)</small></span>
          <input type="text" name="title" maxlength="120" placeholder="Today" />
        </label>
        <label class="field"><span>What's on your heart?</span>
          <textarea name="body" maxlength="20000" rows="5" required placeholder="Write it however it comes out…"></textarea>
        </label>
        <div class="btn-row"><button class="sbtn primary" type="submit">Save privately 🔒</button><a class="sbtn ghost" href="/arron.html">💙 Write with Arron</a></div>
      </form>
      <div class="journal-list" data-entries><div class="skeleton"></div></div>
      <div class="center" data-entries-more></div>
    </section>`;
}

function creationsHTML() {
  return `
    <section class="panel" aria-labelledby="creations-title">
      <h2 id="creations-title">🎨 My Creations</h2>
      <div class="creation-strip" data-creations><div class="skeleton"></div></div>
      <div class="btn-row" style="margin-top:1rem"><a class="sbtn primary" href="/creations.html#create">🎨 Create with Arron</a><a class="sbtn ghost" href="/creations.html#mine">All my creations</a></div>
    </section>`;
}

async function render() {
  clearMe();
  const fresh = await loadMe({ fresh: true });
  const p = fresh?.profile || me.profile;
  const user = fresh?.user || me.user;
  const counts = fresh?.counts || me.counts || {};
  document.title = `${p.displayName} — My Sanity Profile · Pleading Sanity`;
  const joined = new Date(p.joinedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  root.innerHTML = `
    ${user.isOwner ? `
    <section class="panel fade-in" style="margin-top:1.5rem;border-color:rgba(255,215,0,.45)" aria-labelledby="owner-title">
      <h2 id="owner-title">💫 Welcome home, ${esc(user.ownerName || 'Shane')}</h2>
      <p style="margin-top:0">You hold the only Owner key. Your posts go live instantly; Arron knows it's you.</p>
      <div class="btn-row"><a class="sbtn primary" href="/owner.html">💫 Owner's Room${counts.awaitingReview ? ` · ${counts.awaitingReview} to review` : ''}</a><a class="sbtn ghost" href="/post.html">✍️ Publish now</a><a class="sbtn ghost" href="/arron.html">💙 Talk to Arron</a></div>
    </section>` : ''}
    <section class="panel fade-in" aria-labelledby="p-name" style="${user.isOwner ? '' : 'margin-top:1.5rem'}">
      <img class="profile-banner" src="/api/images/banner/${esc(user.id)}" alt="" onerror="this.hidden=true" />
      <div class="profile-top">
        ${avatar(p, 'lg')}
        <div style="flex:1;min-width:200px">
          <h1 id="p-name">${esc(p.displayName)}</h1>
          <div class="person-meta">@${esc(p.username)}${p.pronouns ? ' · ' + esc(p.pronouns) : ''}${p.country ? ' · 📍 ' + esc(p.country) : ''} · Joined ${joined}${p.isPrivate ? ' · 🔒 Friends-only' : ''}</div>
          <div class="row" style="margin-top:6px">${moodBadge(p.mood)}${myRole(user.role)}</div>
          <div class="profile-stats"><span><strong>${counts.posts ?? 0}</strong> posts</span><span><strong>${counts.journal ?? 0}</strong> journal entries</span><span><strong>${counts.friends ?? 0}</strong> friends</span></div>
        </div>
      </div>
      ${p.bio ? `<p class="person-bio" style="font-size:1rem;margin-top:1rem">${esc(p.bio)}</p>` : ''}
      ${p.interests?.length ? `<div class="tagline">${p.interests.map((t) => `<span>#${esc(t)}</span>`).join('')}</div>` : ''}
      <div class="btn-row" style="margin-top:1rem">
        <a class="sbtn primary" href="/@${esc(p.username)}">🌿 My public page</a>
        <button type="button" class="sbtn ghost" data-edit>✏️ Edit profile &amp; privacy</button>
        <a class="sbtn ghost" href="/post.html">✍️ New post</a>
        <a class="sbtn ghost" href="/settings.html">⚙️ Settings</a>
      </div>
      <p class="muted" style="font-size:.85rem;margin-bottom:0">Page: ${p.pageVisibility === 'members' ? '🌿 members only' : '🌍 public'} · New posts: ${esc({ public: '🌍 public', members: '🌿 members', friends: '💙 friends', private: '🔒 only me' }[p.defaultVisibility] || '🌍 public')}${p.truthTagDefault ? ` · Usual Truth Tag: ${TRUTH_TAGS[p.truthTagDefault]?.icon || ''} ${esc(TRUTH_TAGS[p.truthTagDefault]?.label || '')}` : ''}</p>
    </section>
    <section class="panel" id="edit" hidden aria-labelledby="edit-title">
      <h2 id="edit-title">Edit your profile</h2>
      <div data-form></div>
    </section>
    <div data-status-out aria-live="polite"></div>
    ${statusHTML(p)}
    ${journalHTML()}
    ${creationsHTML()}
    ${playerHTML()}
    ${savedHTML()}
    ${p.story ? `
      <section class="panel" aria-labelledby="story-title">
        <h2 id="story-title">📖 My Story</h2>
        <div class="story-text">${esc(p.story)}</div>
      </section>` : `
      <section class="panel"><h2>📖 My Story</h2><p class="muted">Your story section is empty — and that's okay. Share it only if and when you're ready, from "Edit profile".</p></section>`}
    <section aria-labelledby="posts-title">
      <h2 id="posts-title" style="margin:1.5rem 0 1rem">My posts</h2>
      <p class="muted" style="margin-top:-.5rem">Everything you've shared — including posts only you can see, and any waiting for review.</p>
      <div data-posts></div>
      <div class="center" data-more></div>
    </section>`;

  wireEdit(p);
  wireStatus();
  wireJournal();
  loadCreations();
  loadPosts(root.querySelector('[data-posts]'), root.querySelector('[data-more]'));
  if (location.hash === '#journal') root.querySelector('#journal').focus();
}

function wireEdit(p) {
  root.querySelector('[data-edit]').addEventListener('click', () => {
    const edit = root.querySelector('#edit');
    edit.hidden = !edit.hidden;
    if (edit.hidden) return;
    const { extra } = mountProfileForm(edit.querySelector('[data-form]'), {
      profile: p,
      withStory: true,
      onSaved: async (result) => {
        toast('Profile saved 💙');
        if (result.storyNeedsSupport) toast('Thank you for sharing your story. The house will sit with it. 💙', 8000);
        render();
      },
    });
    extra.innerHTML = '<button type="button" class="sbtn ghost" data-cancel>Cancel</button>';
    extra.querySelector('[data-cancel]').addEventListener('click', () => { edit.hidden = true; });
    edit.scrollIntoView({ behavior: 'smooth' });
  });
}

function wireStatus() {
  const form = root.querySelector('[data-status]');
  const out = root.querySelector('[data-status-out]');
  const send = async (text, share, mood) => {
    const result = await api('/api/me/status', { method: 'PUT', body: { text, share, mood } });
    if (result.needsSupport) out.innerHTML = CRISIS_STRIP;
    toast(result.shared ? (result.shared.pending ? 'Checked in 💙 Your update will appear on the feed once Shane has reviewed it.' : 'Checked in and shared 💙') : text ? 'Checked in 💙' : 'Status cleared.');
    render();
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = form.text.value.trim();
    if (!text) return toast('A few words is enough — even "rough day" counts. 💙');
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try { await send(text, form.share.checked, form.mood.value); }
    catch (error) { toast(error.data?.reason ? `${error.message} ${error.data.reason}` : error.message, 6000); button.disabled = false; }
  });
  root.querySelector('[data-clear-status]')?.addEventListener('click', () => send('', false, '').catch((e) => toast(e.message)));
}

function wireJournal() {
  const form = root.querySelector('[data-journal]');
  const list = root.querySelector('[data-entries]');
  const more = root.querySelector('[data-entries-more]');

  async function load(before) {
    try {
      const { entries, nextBefore } = await api(`/api/journal${before ? `?before=${before}` : ''}`);
      const html = entries.map(entryHTML).join('');
      if (before) list.insertAdjacentHTML('beforeend', html);
      else list.innerHTML = html || '<p class="muted">Nothing here yet. Your first entry is just for you.</p>';
      more.innerHTML = nextBefore ? '<button type="button" class="sbtn ghost">Older entries</button>' : '';
      more.querySelector('button')?.addEventListener('click', () => load(nextBefore), { once: true });
    } catch (error) {
      list.innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.body.value.trim()) return toast('Write a few words first.');
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      const { entry, needsSupport } = await api('/api/journal', { method: 'POST', body: { title: form.title.value, body: form.body.value } });
      form.reset();
      list.querySelector('.muted')?.remove();
      list.insertAdjacentHTML('afterbegin', entryHTML(entry));
      toast('Saved to your private journal 🔒');
      if (needsSupport) toast('That sounds heavy. You do not have to carry it alone. The house will sit. 💙', 8000);
    } catch (error) { toast(error.message); }
    finally { button.disabled = false; }
  });

  list.addEventListener('change', async (e) => {
    const select = e.target.closest('[data-visibility]');
    if (!select) return;
    const article = select.closest('[data-entry]');
    try {
      const { entry } = await api(`/api/journal/${article.dataset.entry}`, { method: 'PUT', body: { visibility: select.value } });
      article.outerHTML = entryHTML(entry);
      toast(entry.visibility === 'private' ? 'Back to private 🔒' : `Now on your page for ${entry.visibility === 'public' ? 'everyone' : 'members'} 🌿`);
    } catch (error) {
      toast(error.data?.reason ? `${error.message} ${error.data.reason}` : error.message, 6000);
      load();
    }
  });

  list.addEventListener('click', async (e) => {
    const article = e.target.closest('[data-entry]');
    if (!article) return;
    const id = article.dataset.entry;
    if (e.target.closest('[data-delete-entry]')) {
      if (!confirm('Delete this journal entry for good?')) return;
      try { await api(`/api/journal/${id}`, { method: 'DELETE' }); article.remove(); toast('Entry deleted.'); }
      catch (error) { toast(error.message); }
    } else if (e.target.closest('[data-share-entry]')) {
      const audience = article.querySelector('[data-visibility]').value === 'members' ? 'members' : 'public';
      if (!confirm(`Share this entry on the community feed (${audience === 'public' ? 'everyone' : 'members only'})?`)) return;
      try {
        const result = await api(`/api/journal/${id}/share`, { method: 'POST', body: { visibility: audience } });
        article.outerHTML = entryHTML(result.entry);
        toast(result.pending ? 'Shared 💙 It will appear once Shane has reviewed it.' : 'Shared to the feed 💙');
      } catch (error) { toast(error.data?.reason ? `${error.message} ${error.data.reason}` : error.message, 6000); }
    }
  });

  load();
}

async function loadCreations() {
  const strip = root.querySelector('[data-creations]');
  try {
    const { creations } = await api('/api/creations?scope=mine');
    strip.innerHTML = creations.slice(0, 8).map((c) => `<a href="/creations.html#mine" title="${esc(c.title || c.prompt)}"><img src="${esc(c.imageUrl)}" alt="${esc(c.title || c.prompt)}" loading="lazy" width="160" height="160" /></a>`).join('')
      || '<p class="muted">No creations yet — describe a feeling and Arron will paint it.</p>';
  } catch {
    strip.innerHTML = '<p class="muted">Your creations will show here.</p>';
  }
}

// Full post cards (with media, likes and comments) come from the feed API.
async function loadPosts(list, more, before) {
  try {
    const q = new URLSearchParams({ filter: 'mine' });
    if (before) q.set('before', before);
    const { posts, nextBefore } = await api(`/api/posts?${q}`);
    list.insertAdjacentHTML('beforeend', posts.map((post) => postHTML(post)).join('') || (before ? '' : '<div class="panel empty"><p>No posts yet.</p><a class="sbtn primary" href="/post.html">Share your first post</a></div>'));
    more.innerHTML = nextBefore ? '<button type="button" class="sbtn ghost">Load more</button>' : '';
    more.querySelector('button')?.addEventListener('click', () => loadPosts(list, more, nextBefore), { once: true });
  } catch (error) {
    list.innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
  }
}

wirePosts(root);
render();
