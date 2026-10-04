// owner.html — page script (kept out of the HTML so the strict Content-Security-Policy allows it)
import { api, esc, requireMember, toast } from '/js/auth.js';
import { CRISIS_STRIP, avatar, moodBadge, pageLink, roleBadge, timeAgo, truthBadge } from '/js/social.js';

const me = await requireMember();
const root = document.getElementById('root');
if (!me.user.isOwner) {
  root.innerHTML = '<section class="panel empty"><p>🔑 Only Shane holds that key.</p><a class="sbtn primary" href="/feed.html#community">Back to the feed</a></section>';
}

const queueItem = (q) => `
  <article class="queue-item" data-queue="${q.id}">
    <div class="post-head">
      <a href="${pageLink(q.author.username)}" tabindex="-1">${avatar(q.author)}</a>
      <div><a class="post-author" href="${pageLink(q.author.username)}">${esc(q.author.displayName)}</a>
        <div class="post-time">@${esc(q.author.username)} · ${timeAgo(q.createdAt)} · ${esc(q.visibility)}</div></div>
      <span class="spacer"></span>${truthBadge(q.truthTag)}${moodBadge(q.mood)}
    </div>
    ${q.contentWarning ? '<p><span class="tw-banner">⚠️ TW · heavy topic</span></p>' : ''}
    ${q.title ? `<h3>${esc(q.title)}</h3>` : ''}
    ${q.body ? `<div class="post-body">${esc(q.body)}</div>` : ''}
    ${q.imageUrl ? `<div class="post-media"><img src="${esc(q.imageUrl)}" alt="Image shared by ${esc(q.author.displayName)}" loading="lazy" /></div>` : ''}
    ${q.crisis ? CRISIS_STRIP : ''}
    <div class="btn-row" style="margin-top:.75rem">
      <button type="button" class="sbtn primary small" data-approve>✅ Approve — go live</button>
      ${q.status === 'held' ? '' : '<button type="button" class="sbtn ghost small" data-hold>⏸️ Hold</button>'}
    </div>
  </article>`;

async function render() {
  let o;
  try { o = await api('/api/owner'); }
  catch (error) { root.innerHTML = `<p class="notice err">${esc(error.message)}</p>`; return; }
  const c = o.counts;
  root.innerHTML = `
    <section class="panel" aria-labelledby="ov-title">
      <h2 id="ov-title">🌌 Everything, right now</h2>
      <div class="owner-stats">
        <div><strong>${c.members}</strong><span>members</span></div>
        <div><strong>${c.newMembers}</strong><span>joined this week</span></div>
        <div><strong>${c.postsToday}</strong><span>posts in 24h</span></div>
        <div><strong>${c.pending}</strong><span>waiting for you</span></div>
        <div><strong>${c.openReports}</strong><span>open reports</span></div>
      </div>
      <div class="btn-row" style="margin-top:1rem"><a class="sbtn primary" href="/post.html">✍️ Publish now (live instantly)</a><a class="sbtn ghost" href="/admin.html">🛡️ Moderation queue${c.openReports ? ` (${c.openReports})` : ''}</a><a class="sbtn ghost" href="/write.html#review">📜 Review site writing</a><a class="sbtn ghost" href="/arron.html">💙 Talk to Arron</a></div>
    </section>

    <section class="panel" aria-labelledby="wb-title" id="workbench">
      <h2 id="wb-title">🛠️ Arron's Workbench</h2>
      <p class="muted" style="margin-top:0;max-width:65ch">Changes Arron drafted for you in chat. Nothing on the site changes until you say so. Approve one and you get a ready build brief — paste it into the Netlify agent (or any builder) and it goes live in one deploy. Tell Arron <em>"update the home page: …"</em> or ask <em>"what's missing?"</em> to fill this.</p>
      <div data-workbench><div class="skeleton" style="height:90px"></div></div>
    </section>

    <section class="panel" aria-labelledby="mode-title">
      <h2 id="mode-title">⚖️ How member posts go live</h2>
      <div class="switch-row">
        <p style="margin:0;max-width:60ch">${o.settings.reviewMode
          ? '<strong>Review mode is ON.</strong> Member posts wait here for you. Your posts, Guardians\' and Creators\' still go live instantly.'
          : '<strong>Posts go live instantly.</strong> Every post still passes the kindness check and gets a Truth Tag.'}</p>
        <button type="button" class="sbtn ${o.settings.reviewMode ? 'ghost' : 'primary'}" data-toggle-review aria-pressed="${o.settings.reviewMode}">${o.settings.reviewMode ? '🌍 Switch to instant' : '🔍 Turn on review mode'}</button>
      </div>
    </section>

    <section class="panel" aria-labelledby="q-title" id="review">
      <div class="switch-row"><h2 id="q-title" style="margin:0">⏳ Review queue</h2>
        <div class="btn-row" style="margin:0">${o.queue.length ? '<button type="button" class="sbtn small primary" data-approve-all>✅ Approve all</button>' : ''}<button type="button" class="sbtn small ghost" data-show-held>⏸️ Held posts</button></div></div>
      <div data-queue style="margin-top:1rem">${o.queue.map(queueItem).join('') || '<p class="muted">Nothing waiting. 💙</p>'}</div>
    </section>

    <section class="panel" aria-labelledby="roles-title" id="roles">
      <h2 id="roles-title">🛡️ Roles</h2>
      <p class="muted" style="margin-top:0">Guardians review reports and can pin up to 3 posts. Creators get Arron and the studios at full power. Only you can give or take these — and the Owner key stays yours alone.</p>
      <form class="row" data-role-form novalidate style="align-items:flex-end">
        <label class="field" style="margin:0;flex:2;min-width:180px"><span>Username</span><input type="text" name="username" maxlength="25" placeholder="@username" autocapitalize="off" spellcheck="false" required /></label>
        <label class="field" style="margin:0;flex:1;min-width:140px"><span>Role</span><select name="role"><option value="guardian">🛡️ Guardian</option><option value="creator">✨ Creator</option></select></label>
        <button type="submit" class="sbtn primary">Give role</button>
      </form>
      <ul class="pp-saved" style="margin-top:1rem" data-team>${o.team.map((t) => `
        <li><span>${avatar(t, 'sm')} <a href="${pageLink(t.username)}">${esc(t.displayName)}</a> <small class="muted">@${esc(t.username)}</small> ${roleBadge(t.role)}</span>
          <button type="button" class="sbtn small ghost" data-revoke="${esc(t.username)}" data-role="${esc(t.role)}">Remove ${esc(t.role)}</button></li>`).join('') || '<li class="muted">No Guardians or Creators yet.</li>'}</ul>
    </section>

    <section class="panel" aria-labelledby="new-title">
      <h2 id="new-title">🌱 Newest members</h2>
      <ul class="pp-saved">${o.recentMembers.map((m) => `<li><a href="${pageLink(m.username)}">${avatar(m, 'sm')} <span>${esc(m.displayName)} <small class="muted">@${esc(m.username)} · joined ${timeAgo(m.joinedAt)}</small></span></a></li>`).join('') || '<li class="muted">No one yet.</li>'}</ul>
    </section>

    <section class="panel" aria-labelledby="voice-title">
      <h2 id="voice-title">💙 Arron's voice</h2>
      <p class="muted" style="margin-top:0">Notes Arron follows in every conversation, with everyone — how he speaks, what he should know. Keep it short and true.</p>
      <form data-voice novalidate>
        <label class="field"><span class="sr-only">Arron's voice notes</span>
          <textarea name="voice" rows="5" maxlength="2000" placeholder="e.g. Use more Scottish warmth. Mention the Sunday live sessions when people feel alone.">${esc(o.settings.arronVoice || '')}</textarea>
        </label>
        <button type="submit" class="sbtn primary">Save Arron's voice</button>
      </form>
    </section>`;
  wire(o);
  renderWorkbench();
}

function wire(o) {
  root.querySelector('[data-toggle-review]').addEventListener('click', async () => {
    try {
      await api('/api/owner/settings', { method: 'PUT', body: { reviewMode: !o.settings.reviewMode } });
      toast(!o.settings.reviewMode ? 'Review mode on — member posts will wait for you.' : 'Instant mode — member posts go live straight away.');
      render();
    } catch (error) { toast(error.message); }
  });

  const queue = root.querySelector('[data-queue]');
  queue.addEventListener('click', async (e) => {
    const item = e.target.closest('[data-queue]');
    const b = e.target.closest('button');
    if (!item || !b) return;
    const action = b.matches('[data-approve]') ? 'approve' : b.matches('[data-hold]') ? 'hold' : null;
    if (!action) return;
    try {
      await api(`/api/owner/posts/${item.dataset.queue}`, { method: 'POST', body: { action } });
      item.remove();
      toast(action === 'approve' ? 'Live on the feed ✅' : 'Held back — only the author can see it.');
      if (!queue.children.length) queue.innerHTML = '<p class="muted">Nothing waiting. 💙</p>';
    } catch (error) { toast(error.message); }
  });
  root.querySelector('[data-approve-all]')?.addEventListener('click', async () => {
    if (!confirm('Approve every waiting post?')) return;
    try { const r = await api('/api/owner/approve-all', { method: 'POST' }); toast(`${r.approved} posts are live ✅`); render(); }
    catch (error) { toast(error.message); }
  });
  root.querySelector('[data-show-held]').addEventListener('click', async () => {
    try {
      const { queue: held } = await api('/api/owner/queue?status=held');
      queue.innerHTML = held.map(queueItem).join('') || '<p class="muted">No held posts.</p>';
    } catch (error) { toast(error.message); }
  });

  const roleForm = root.querySelector('[data-role-form]');
  const setRole = async (username, role, grant) => {
    const r = await api('/api/owner/roles', { method: 'POST', body: { username, role, grant } });
    toast(grant ? `${r.displayName} is now a ${r.role} 🛡️` : `${r.role} removed from ${r.displayName}.`);
    render();
  };
  roleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = roleForm.username.value.trim().replace(/^@/, '');
    if (!name) return toast('Type their username first.');
    try { await setRole(name, roleForm.role.value, true); } catch (error) { toast(error.message); }
  });
  root.querySelector('[data-team]').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-revoke]');
    if (!b || !confirm(`Remove ${b.dataset.role} from @${b.dataset.revoke}?`)) return;
    try { await setRole(b.dataset.revoke, b.dataset.role, false); } catch (error) { toast(error.message); }
  });

  const voice = root.querySelector('[data-voice]');
  voice.addEventListener('submit', async (e) => {
    e.preventDefault();
    try { await api('/api/owner/settings', { method: 'PUT', body: { arronVoice: voice.voice.value } }); toast('Arron will speak this way from his next reply 💙'); }
    catch (error) { toast(error.message); }
  });
}

// ─── WORKBENCH ───
const STATUS_LABEL = { proposed: '💭 Drafted', approved: '✅ Approved — ready to push', done: '🌌 Done', dismissed: '🍂 Set aside' };
const proposalItem = (p) => `
  <article class="queue-item" id="proposal-${p.id}" data-proposal="${p.id}">
    <div class="switch-row" style="align-items:flex-start">
      <div><h3 style="margin:0 0 .25rem">${esc(p.title)}</h3>
        <div class="post-time">${p.target ? esc(p.target) + ' · ' : ''}${timeAgo(p.createdAt)} · <span data-status>${STATUS_LABEL[p.status] || esc(p.status)}</span></div></div>
    </div>
    ${p.why ? `<p style="margin:.5rem 0"><strong>Why:</strong> ${esc(p.why)}</p>` : ''}
    <details><summary>Read Arron's draft</summary><div class="post-body" style="margin-top:.5rem">${esc(p.body)}</div></details>
    <div class="btn-row" style="margin-top:.75rem">
      ${p.status === 'proposed' ? '<button type="button" class="sbtn primary small" data-pstatus="approved">✅ Approve &amp; copy brief</button>' : ''}
      ${p.status === 'approved' ? '<button type="button" class="sbtn primary small" data-copy>📋 Copy build brief</button><button type="button" class="sbtn ghost small" data-pstatus="done">🌌 Mark as live</button>' : ''}
      ${p.status !== 'dismissed' ? '<button type="button" class="sbtn ghost small" data-pstatus="dismissed">🍂 Set aside</button>' : '<button type="button" class="sbtn ghost small" data-pstatus="proposed">↩️ Bring back</button>'}
    </div>
  </article>`;

const pulseHTML = (p) => `
  <details style="margin-top:1rem"><summary><strong>💓 Site pulse</strong> — what people are reading, loving and playing (14 days)</summary>
    <div class="row" style="margin-top:.75rem;gap:1.5rem;align-items:flex-start">
      <div style="flex:1;min-width:220px"><h3 style="margin:.25rem 0">👣 Most walked</h3><ul class="pp-saved">${p.mostWalked.map((x) => `<li><a href="/feed.html?post=${x.id}#community">${esc(x.label)}</a> <small class="muted">${x.views}</small></li>`).join('') || '<li class="muted">No views yet.</li>'}</ul></div>
      <div style="flex:1;min-width:220px"><h3 style="margin:.25rem 0">💗 Most loved</h3><ul class="pp-saved">${p.mostLoved.map((x) => `<li><a href="/feed.html?post=${x.id}#community">${esc(x.label)}</a> <small class="muted">${x.hearts}</small></li>`).join('') || '<li class="muted">No hearts yet.</li>'}</ul></div>
      <div style="flex:1;min-width:220px"><h3 style="margin:.25rem 0">🎮 Games played</h3><ul class="pp-saved">${p.games.map((g) => `<li>${esc(g.game)} <small class="muted">${g.players} members</small></li>`).join('') || '<li class="muted">No saved progress yet.</li>'}</ul></div>
    </div>
    ${p.roadmap.length ? `<h3 style="margin:.75rem 0 .25rem">🗺️ Roadmap (from the soul file)</h3><ul class="pp-saved">${p.roadmap.map((r) => `<li>${esc(r.item)} ${r.status ? `<small class="muted">${esc(r.status)}</small>` : ''}</li>`).join('')}</ul>` : ''}
  </details>`;

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Build brief copied — paste it into the Netlify agent 📋'); }
  catch { prompt('Copy this build brief:', text); }
}

async function renderWorkbench() {
  const box = root.querySelector('[data-workbench]');
  if (!box) return;
  let wb;
  try { wb = await api('/api/owner/workbench'); }
  catch (error) { box.innerHTML = `<p class="notice err">${esc(error.message)}</p>`; return; }
  const briefs = new Map(wb.proposals.map((p) => [String(p.id), p.brief]));
  box.innerHTML = (wb.proposals.map(proposalItem).join('') || '<p class="muted">Nothing on the bench. Ask Arron <em>"what\'s missing?"</em> 💙</p>')
    + pulseHTML(wb.pulse)
    + '<p style="margin-top:.75rem"><button type="button" class="linkish" data-show-done>Show finished &amp; set-aside changes</button></p>';
  box.onclick = async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.matches('[data-show-done]')) {
      try {
        const [done, dismissed] = await Promise.all([api('/api/owner/workbench?status=done'), api('/api/owner/workbench?status=dismissed')]);
        const all = [...done.proposals, ...dismissed.proposals];
        all.forEach((p) => briefs.set(String(p.id), p.brief));
        b.parentElement.insertAdjacentHTML('beforebegin', all.map(proposalItem).join('') || '<p class="muted">Nothing finished yet.</p>');
        b.remove();
      } catch (error) { toast(error.message); }
      return;
    }
    const item = b.closest('[data-proposal]');
    if (!item) return;
    const id = item.dataset.proposal;
    if (b.matches('[data-copy]')) return copyText(briefs.get(id) || '');
    try {
      const { proposal } = await api(`/api/owner/workbench/${id}`, { method: 'POST', body: { status: b.dataset.pstatus } });
      briefs.set(id, proposal.brief);
      item.outerHTML = proposalItem(proposal);
      if (proposal.status === 'approved') copyText(proposal.brief);
      else toast(proposal.status === 'done' ? 'Marked as live 🌌' : proposal.status === 'dismissed' ? 'Set aside — nothing changed.' : 'Back on the bench.');
    } catch (error) { toast(error.message); }
  };
  if (location.hash.startsWith('#proposal-')) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'center' });
  else if (location.hash === '#workbench') document.getElementById('workbench')?.scrollIntoView();
}

if (me.user.isOwner) render();
