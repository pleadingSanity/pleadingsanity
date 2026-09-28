// ==============================================================
// PLEADING SANITY — ACCOUNTS (Netlify Identity)
// Loaded as a module on every page:
//   • finishes email links (confirm, sign-in link, password reset)
//   • shows Sign in, or Community + Post + avatar menu when signed in
//   • exports helpers the social pages use (api, requireMember, …)
// Guests can browse every public page without an account.
// ==============================================================

import {
  AuthError,
  MissingIdentityError,
  getUser,
  handleAuthCallback,
  logout,
  onAuthChange,
} from '/js/vendor/netlify-identity.js';

export { AuthError, MissingIdentityError };

const ME_CACHE = 'ps-me';

// ─── SMALL HELPERS ───
export const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Emoji avatars show as-is; anything else becomes initials.
export function avatarText(avatar, name) {
  const a = String(avatar || '').trim();
  if (a && /\p{Extended_Pictographic}/u.test(a)) return a;
  const initials = String(a || name || '?').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return initials || '?';
}

export function toast(message, ms = 3500) {
  const el = document.createElement('div');
  el.className = 'ps-toast';
  el.setAttribute('role', 'status');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

function readCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

// Fetch our own API as the signed-in member. Throws with a friendly message.
export async function api(path, { method = 'GET', body, form } = {}) {
  await getUser(); // refreshes the session token if it's close to expiring
  const headers = {};
  const token = readCookie('nf_jwt');
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(path, {
    method,
    headers,
    credentials: 'same-origin',
    body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Something went wrong. Please try again.');
    Object.assign(error, { status: res.status, data });
    throw error;
  }
  return data;
}

// ─── SESSION ───
let mePromise = null;

export async function currentUser() {
  try {
    return await getUser();
  } catch {
    return null;
  }
}

// { user, profile, counts } for the signed-in member, or null for guests.
export function loadMe({ fresh = false } = {}) {
  if (mePromise && !fresh) return mePromise;
  mePromise = (async () => {
    const user = await currentUser();
    if (!user) {
      sessionStorage.removeItem(ME_CACHE);
      return null;
    }
    try {
      const me = await api('/api/me');
      sessionStorage.setItem(ME_CACHE, JSON.stringify(me));
      return me;
    } catch (error) {
      if (error.status === 401) return null;
      const cached = sessionStorage.getItem(ME_CACHE);
      return cached ? JSON.parse(cached) : { user: { id: user.id, email: user.email }, profile: null, counts: {} };
    }
  })();
  return mePromise;
}

export function clearMe() {
  mePromise = null;
  sessionStorage.removeItem(ME_CACHE);
}

const here = () => location.pathname + location.search;

// Gate for private pages. Guests go to sign in; new members to onboarding.
export async function requireMember({ allowUnonboarded = false } = {}) {
  const me = await loadMe();
  if (!me) {
    location.replace('/login.html?next=' + encodeURIComponent(here()));
    return new Promise(() => {});
  }
  if (!allowUnonboarded && !me.profile?.onboarded) {
    location.replace('/onboarding.html?next=' + encodeURIComponent(here()));
    return new Promise(() => {});
  }
  return me;
}

export function safeNext(fallback = '/feed.html') {
  const next = new URLSearchParams(location.search).get('next') || '';
  return next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}

// After any successful sign-in: onboarding first, then wherever they were heading.
export async function afterSignIn(fallback = '/feed.html') {
  clearMe();
  const me = await loadMe({ fresh: true });
  const next = safeNext(fallback);
  location.replace(me?.profile?.onboarded ? next : '/onboarding.html?next=' + encodeURIComponent(next));
}

export async function signOut() {
  try {
    await logout();
  } catch {
    // Even if the server call fails, forget the session on this device.
  }
  clearMe();
  location.href = '/';
}

// ─── EMAIL LINKS ───
// Confirmation, sign-in links and password resets all land back on the
// site with a token in the URL hash; finish them on whatever page opens.
async function finishEmailLink() {
  if (!/(confirmation|recovery|invite|email_change)_token=|access_token=/.test(location.hash)) return;
  try {
    const result = await handleAuthCallback();
    if (!result) return;
    if (result.type === 'recovery') {
      location.replace('/reset-password.html?mode=set');
    } else if (result.type === 'confirmation' || result.type === 'oauth') {
      sessionStorage.setItem('ps-welcome', result.type);
      await afterSignIn('/feed.html');
    } else if (result.type === 'email_change') {
      toast('Email address updated 💙');
    } else if (result.type === 'invite') {
      location.replace('/signup.html?invite=' + encodeURIComponent(result.token));
    }
  } catch (error) {
    console.warn('Email link could not be completed:', error);
    location.replace('/login.html?link=expired');
  }
}

// ─── NAV ───
function navLink(href, label) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  a.dataset.memberLink = '';
  if (location.pathname === href) a.setAttribute('aria-current', 'page');
  return a;
}

function renderNav(me) {
  const inner = document.querySelector('.ps-nav .ps-nav-inner');
  if (!inner) return;
  inner.querySelectorAll('[data-member-link], .ps-account').forEach((el) => el.remove());

  const account = document.createElement('div');
  account.className = 'ps-account';

  if (!me) {
    const signin = document.createElement('a');
    signin.className = 'ps-signin';
    signin.href = '/login.html';
    signin.textContent = 'Sign in';
    if (location.pathname === '/login.html' || location.pathname === '/signup.html') signin.setAttribute('aria-current', 'page');
    account.appendChild(signin);
    inner.appendChild(account);
    return;
  }

  const links = inner.querySelector('.ps-links');
  const crisis = links?.querySelector('.ps-crisis');
  if (links) {
    links.insertBefore(navLink('/community.html', 'Community'), crisis);
    links.insertBefore(navLink('/post.html', '✍️ Post'), crisis);
  }

  const profile = me.profile;
  const name = profile?.displayName || me.user.email;
  const pending = me.counts?.pendingRequests || 0;
  account.innerHTML = `
    <button type="button" class="ps-avatar-btn" aria-haspopup="true" aria-expanded="false" aria-controls="ps-account-menu">
      <span class="ps-avatar" aria-hidden="true">${esc(avatarText(profile?.avatar, name))}</span>
      <span>${esc(profile ? profile.displayName : 'Account')}</span>
      ${pending ? `<span class="ps-badge" aria-label="${pending} friend requests">${pending}</span>` : ''}
    </button>
    <div class="ps-menu" id="ps-account-menu" role="menu" hidden>
      ${profile?.onboarded
        ? `<a role="menuitem" href="/profile.html">👤 My profile</a>
           <a role="menuitem" href="/feed.html#community">🌌 Community feed</a>
           <a role="menuitem" href="/community.html#requests">🤝 Friends${pending ? ` (${pending} new)` : ''}</a>`
        : `<a role="menuitem" href="/onboarding.html">✨ Finish your profile</a>`}
      <a role="menuitem" href="/settings.html">⚙️ Settings</a>
      ${me.user.isAdmin ? '<a role="menuitem" href="/admin.html">🛡️ Moderation queue</a>' : ''}
      <hr />
      <button type="button" role="menuitem" data-signout>🚪 Sign out</button>
    </div>`;
  inner.appendChild(account);

  const button = account.querySelector('.ps-avatar-btn');
  const menu = account.querySelector('.ps-menu');
  const items = () => [...menu.querySelectorAll('[role="menuitem"]')];
  const setOpen = (open, focusFirst) => {
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (open && focusFirst) items()[0]?.focus();
  };
  button.addEventListener('click', () => setOpen(menu.hidden, false));
  button.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true, true); }
  });
  menu.addEventListener('keydown', (e) => {
    const list = items();
    const i = list.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
    if (e.key === 'Escape') { setOpen(false); button.focus(); }
  });
  document.addEventListener('click', (e) => { if (!account.contains(e.target)) setOpen(false); });
  menu.querySelector('[data-signout]').addEventListener('click', signOut);
}

// ─── BOOT ───
(async () => {
  await finishEmailLink();
  renderNav(await loadMe());
  onAuthChange((event) => {
    if (event === 'login' || event === 'logout') {
      clearMe();
      loadMe().then(renderNav);
    }
  });
})();
