// settings.html — page script (kept out of the HTML so the strict Content-Security-Policy allows it)
import { updateUser, logout } from '/js/vendor/netlify-identity.js';
import { api, clearMe, esc, requireMember, signOut, toast } from '/js/auth.js';
import { personHTML } from '/js/social.js';

const me = await requireMember({ allowUnonboarded: true });
document.getElementById('email').textContent = me.user.email;

const toggle = document.getElementById('private-toggle');
toggle.checked = Boolean(me.profile?.isPrivate);
toggle.disabled = !me.profile;
toggle.addEventListener('change', async () => {
  try {
    await api('/api/me', { method: 'PUT', body: { isPrivate: toggle.checked } });
    clearMe();
    toast(toggle.checked ? 'Your profile is now friends-only 🔒' : 'Your profile is now public 🌌');
  } catch (error) {
    toggle.checked = !toggle.checked;
    toast(error.message);
  }
});

const pwForm = document.getElementById('pw-form');
pwForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const pw = pwForm.elements.password.value;
  if (pw.length < 8) return toast('Your password needs at least 8 characters.');
  try {
    await updateUser({ password: pw });
    pwForm.reset();
    toast('Password changed 💙');
  } catch (error) { toast(error.message); }
});

const blocked = document.getElementById('blocked');
async function loadBlocks() {
  try {
    const { blocked: people } = await api('/api/blocks');
    blocked.innerHTML = people.length
      ? `<div class="people">${people.map((p) => personHTML(p, '<button type="button" class="sbtn small ghost" data-unblock>Unblock</button>')).join('')}</div>`
      : '<p class="muted">You haven\'t blocked anyone.</p>';
  } catch (error) {
    blocked.innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
  }
}
blocked.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-unblock]');
  if (!b) return;
  const username = b.closest('[data-username]').dataset.username;
  try {
    await api('/api/blocks', { method: 'POST', body: { username, block: false } });
    toast('Unblocked.');
    loadBlocks();
  } catch (error) { toast(error.message); }
});
loadBlocks();

document.getElementById('signout').addEventListener('click', signOut);

document.getElementById('export-btn').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');
  try {
    const data = await api('/api/me/export');
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'pleading-sanity-my-data.json' });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('Your data is downloading.');
  } catch (error) {
    toast(error.message);
  } finally {
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
  }
});

const delForm = document.getElementById('del-form');
delForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (delForm.elements.confirm.value.trim().toUpperCase() !== 'DELETE') return toast('Type DELETE to confirm.');
  if (!confirm('Last check — delete your account and everything it holds on Pleading Sanity? This cannot be undone.')) return;
  const button = delForm.querySelector('button');
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  try {
    await api('/api/me', { method: 'DELETE' });
    try { await logout(); } catch { /* account is already gone */ }
    clearMe();
    try { localStorage.clear(); sessionStorage.clear(); } catch { /* storage blocked */ }
    location.replace('/login.html?deleted=1');
  } catch (error) {
    toast(error.message);
    button.disabled = false;
    button.removeAttribute('aria-busy');
  }
});
