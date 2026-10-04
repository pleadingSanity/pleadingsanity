// admin.html — page script (kept out of the HTML so the strict Content-Security-Policy allows it)
import { api, esc, requireMember, toast } from '/js/auth.js';
import { timeAgo } from '/js/social.js';

const me = await requireMember();
const queue = document.getElementById('queue');
let status = 'open';

if (!me.user.isAdmin && !me.user.isGuardian) {
  queue.innerHTML = '<p class="notice err">This page is for Guardians and moderators only.</p>';
  throw new Error('Not a guardian');
}

const REASONS = {
  harassment: 'Harassment or bullying', hate: 'Hate speech', 'self-harm-risk': 'Someone may be at risk',
  spam: 'Spam', impersonation: 'Impersonation', 'unsafe-content': 'Unsafe content', other: 'Other',
};

function card(r) {
  const t = r.target;
  const canHide = t && r.targetType !== 'user';
  return `
    <article class="panel" data-id="${r.id}">
      <div class="row" style="justify-content:space-between">
        <strong>${r.reason === 'self-harm-risk' ? '🚨 ' : ''}${esc(REASONS[r.reason] || r.reason)}</strong>
        <span class="post-time">${esc(r.targetType)} · ${esc(r.status)} · ${timeAgo(r.createdAt)}</span>
      </div>
      ${t
        ? `<p style="margin:.6rem 0 .3rem"><a href="${esc(t.link)}">${esc(t.label)}</a>${t.hidden ? ' <span class="post-time">(hidden)</span>' : ''}</p>
           ${t.excerpt ? `<blockquote class="muted" style="margin:0 0 .6rem;padding-left:12px;border-left:3px solid rgba(0,255,240,.4);white-space:pre-wrap">${esc(t.excerpt)}</blockquote>` : ''}`
        : '<p class="muted">The reported content no longer exists.</p>'}
      ${r.details ? `<p style="margin:0 0 .8rem"><strong>Reporter says:</strong> ${esc(r.details)}</p>` : ''}
      <div class="btn-row">
        ${canHide ? `<button type="button" class="sbtn small danger" data-act="actioned" data-hide="${!t.hidden}">${t.hidden ? 'Unhide' : 'Hide content'}</button>` : ''}
        ${r.status !== 'reviewed' ? '<button type="button" class="sbtn small ghost" data-act="reviewed">Mark reviewed (no action)</button>' : ''}
        ${r.status !== 'actioned' ? '<button type="button" class="sbtn small ghost" data-act="actioned">Mark actioned</button>' : ''}
        ${r.status !== 'open' ? '<button type="button" class="sbtn small ghost" data-act="open">Reopen</button>' : ''}
      </div>
    </article>`;
}

async function load() {
  queue.innerHTML = '<div class="skeleton"></div>';
  try {
    const { reports } = await api(`/api/admin/reports?status=${status}`);
    queue.innerHTML = reports.length ? reports.map(card).join('') : '<p class="empty">Nothing here. The community is being kind. 💙</p>';
  } catch (error) {
    queue.innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
  }
}

document.getElementById('filters').addEventListener('click', (e) => {
  const b = e.target.closest('[data-status]');
  if (!b) return;
  status = b.dataset.status;
  document.querySelectorAll('#filters [data-status]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  load();
});

queue.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const id = Number(b.closest('[data-id]').dataset.id);
  const body = { id, status: b.dataset.act };
  if (b.dataset.hide) body.hide = b.dataset.hide === 'true';
  b.disabled = true;
  try {
    await api('/api/admin/reports', { method: 'POST', body });
    toast('Updated ✓');
    load();
  } catch (error) {
    toast(error.message);
    b.disabled = false;
  }
});

load();
