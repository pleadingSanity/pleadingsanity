// ==============================================================
// PLEADING SANITY — ACCOUNTS (Netlify Identity / gotrue)
// Loaded as a module on every page:
// • finishes email links (confirm, sign-in link, password reset)
// • shows Sign in, or Community + Post + avatar menu when signed in
// • exports helpers the social pages use (api, requireMember, …)
// Guests can browse every public page without an account.
//
// PERSISTENCE MODEL (fixed — sign-in survives reload, navigation and tab close):
// • The gotrue token + refresh token live in localStorage ("gotrue.user"),
// written by js/vendor/netlify-identity.js. That already persisted; the bug
// was that getUser() threw the stored session away when the nf_jwt *cookie*
// (a session cookie) was missing after tab close. Vendor now force-refreshes
// and re-writes the cookie instead.
// • The /api/me cache (ps-me), post-oauth redirect (ps-next) and welcome flag
// (ps-welcome) are in localStorage too; they used to be in sessionStorage,
// which dies on tab close — a one-time migration copies old values over.
// • Tokens only. Passwords are never stored.
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
const WELCOME_KEY = 'ps-welcome';
const NEXT_KEY = 'ps-next';
// One-time migration: auth/current-user state used to live in sessionStorage,
// which dies on tab close — a prime cause of "glitchy logouts". Copy any
// existing values to localStorage on first load, then drop them from
// sessionStorage so nothing later reads a stale copy. Tokens are never stored
// here; the gotrue token already lives in localStorage (gotrue.user).
try {
 for (const key of [ME_CACHE, WELCOME_KEY, NEXT_KEY]) {
 const v = sessionStorage.getItem(key);
 if (v !== null && localStorage.getItem(key) === null) localStorage.setItem(key, v);
 sessionStorage.removeItem(key);
 }
} catch { /* storage blocked — fall back to defaults */ }
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
// Access token for our own API: prefer the nf_jwt cookie (re-written by
// getUser() on every load), fall back to the token stored in the persisted
// gotrue session so a missing/expired cookie never strips the Authorization header.
function accessToken() {
 const fromCookie = readCookie('nf_jwt');
 if (fromCookie) return fromCookie;
 try {
 return JSON.parse(localStorage.getItem('gotrue.user') || 'null')?.token?.access_token || '';
 } catch { return ''; }
}
// Fetch our own API as the signed-in member. Throws with a friendly message.
export async function api(path, { method = 'GET', body, form } = {}) {
 await getUser(); // refreshes the session token if close to expiring, and re-creates the nf_jwt cookie if it was lost on tab close
 const headers = {};
 const token = accessToken();
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
 try { localStorage.removeItem(ME_CACHE); } catch { /* storage blocked */ }
 return null;
 }
 try {
 const me = await api('/api/me');
 try { localStorage.setItem(ME_CACHE, JSON.stringify(me)); } catch { /* storage blocked */ }
 return me;
 } catch (error) {
 if (error.status === 401) return null;
 let cached = null;
 try { cached = JSON.parse(localStorage.getItem(ME_CACHE) || 'null'); } catch { cached = null; }
 return cached || { user: { id: user.id, email: user.email }, profile: null, counts: {} };
 }
 })();
 return mePromise;
}
export function clearMe() {
 mePromise = null;
 try { localStorage.removeItem(ME_CACHE); } catch { /* storage blocked */ }
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
// Where to go after sign-in: ?next= (our convention) or ?redirect= (common alias),
// both must be same-origin paths. Fallback is always a real page — never a 404.
export function safeNext(fallback = '/feed.html') {
 const params = new URLSearchParams(location.search);
 const next = params.get('next') || params.get('redirect') || '';
 if (next.startsWith('/') && !next.startsWith('//')) return next;
 return fallback || '/';
}
// After any successful sign-in: onboarding first, then wherever they were heading.
export async function afterSignIn(fallback = '/feed.html') {
 clearMe();
 const me = await loadMe({ fresh: true });
 const next = safeNext(fallback);
 location.replace(me?.profile?.onboarded ? next : '/onboarding.html?next=' + encodeURIComponent(next));
}
// ─── STAY SIGNED IN ───
// Ticked (the default): the session survives closing the browser, on every
// device. Unticked: a browser-session cookie marks this visit, and the next
// visit after the browser closes starts signed out.
const SESSION_ONLY = 'ps-session-only';
export function rememberChoice(stay) {
 try {
 if (stay) localStorage.removeItem(SESSION_ONLY);
 else localStorage.setItem(SESSION_ONLY, '1');
 } catch { /* storage blocked */ }
 document.cookie = 'ps_alive=1; path=/; SameSite=Lax; Secure';
}
function sessionExpired() {
 try {
 return localStorage.getItem(SESSION_ONLY) === '1' && !/(?:^|; )ps_alive=1/.test(document.cookie);
 } catch { return false; }
}
// Signing out leaves no trace: synced progress is saved to the account
// first, then this device forgets the session, every draft, every cached
// copy and all local data. Arron's memory stays safe in the account.
export async function signOut({ redirect = true } = {}) {
 try {
 if (!window.psProgressFlush) await import('/js/progress.js');
 if (!await window.psProgressFlush?.()) {
 const discard = window.confirm?.('Some progress has not synced. Sign out anyway and erase unsaved progress on this device? Cancel keeps you signed in so you can reconnect and save.');
 if (!discard) {
 toast('Your progress is kept. You are still signed in; reconnect and try again, or resolve save conflicts on the Games page.', 7000);
 return false;
 }
 }
 } catch {
 const discard = window.confirm?.('Progress could not be saved. Sign out anyway and erase unsaved progress on this device?');
 if (!discard) {
 toast('Your progress is kept. You are still signed in; please try again.', 7000);
 return false;
 }
 }
 try {
 await logout();
 } catch {
 // Even if the server call fails, forget the session on this device.
 }
 clearMe();
 try { sessionStorage.clear(); } catch { /* storage blocked */ }
 try { localStorage.clear(); } catch { /* storage blocked */ }
 document.cookie = 'ps_alive=; path=/; max-age=0';
 // Explicit sign-out must also drop the gotrue session cookies; if the server
 // logout call failed they would otherwise rehydrate the session on next load.
 document.cookie = 'nf_jwt=; path=/; secure; samesite=lax; expires=Thu, 01 Jan 1970 00:00:00 GMT';
 document.cookie = 'nf_refresh=; path=/; secure; samesite=lax; expires=Thu, 01 Jan 1970 00:00:00 GMT';
 try {
 // Pages are re-fetched next time; the offline crisis pages are kept.
 const names = await caches.keys();
 await Promise.all(names.filter((n) => n.includes('dynamic')).map((n) => caches.delete(n)));
 } catch { /* no Cache API */ }
 if (redirect) location.href = '/';
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
 try { localStorage.setItem(WELCOME_KEY, result.type); } catch { /* storage blocked */ }
 // One-tap sign in leaves the site, so where they were heading was kept in localStorage.
 let kept = '';
 try { kept = localStorage.getItem(NEXT_KEY) || ''; localStorage.removeItem(NEXT_KEY); } catch { /* storage blocked */ }
 await afterSignIn(kept.startsWith('/') && !kept.startsWith('//') ? kept : '/feed.html');
 } else if (result.type === 'email_change') {
 toast('Email address updated ♥');
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
 // Members get their own corner at the top of the Community group.
 const communityMenu = inner.querySelector('#ps-g-community');
 if (communityMenu) {
 communityMenu.prepend(navLink('/community.html', ' My Community'), navLink('/post.html', '✍ New Post'));
 } else {
 const links = inner.querySelector('.ps-links');
 const crisis = links?.querySelector('.ps-crisis');
 links?.insertBefore(navLink('/community.html', 'Community'), crisis);
 links?.insertBefore(navLink('/post.html', '✍ Post'), crisis);
 }
 const profile = me.profile;
 const name = profile?.displayName || me.user.email;
 const pending = me.counts?.pendingRequests || 0;
 const review = me.counts?.awaitingReview || 0;
 account.innerHTML = `
 <button type="button" class="ps-avatar-btn" aria-haspopup="true" aria-expanded="false" aria-controls="ps-account-menu">
 <span class="ps-avatar" aria-hidden="true">${esc(avatarText(profile?.avatar, name))}</span>
 <span>${esc(profile ? profile.displayName : 'Account')}</span>
 ${me.user.isOwner ? '<span class="ps-owner-star" title="Owner">✦</span>' : ''}
 ${pending + review ? `<span class="ps-badge" aria-label="${pending ? `${pending} friend requests` : ''}${pending && review ? ', ' : ''}${review ? `${review} posts to review` : ''}">${pending + review}</span>` : ''}
 </button>
 <div class="ps-menu" id="ps-account-menu" role="menu" hidden>
 <p class="ps-menu-role">${{ owner: '✦ Owner · Founder — welcome home', admin: ' Admin', creator: '✦ Creator · full power', guardian: ' Guardian' }[me.user.role] || ' Member · free forever'}</p>
 ${me.user.isOwner ? `<a role="menuitem" href="/owner.html">✦ Owner's Room${review ? ` (${review} to review)` : ''}</a>` : ''}
 ${profile?.onboarded
 ? `<a role="menuitem" href="/profile.html"> My Sanity Profile</a>
 <a role="menuitem" href="/@${esc(profile.username)}"> My page</a>
 <a role="menuitem" href="/profile.html#journal"> My Journal</a>
 <a role="menuitem" href="/sanctuary.html">★ My Sanctuary</a>
 <a role="menuitem" href="/feed.html#community"> Community feed</a>
 <a role="menuitem" href="/creations.html#mine"> My Creations</a>
 <a role="menuitem" href="/community.html#requests"> Friends${pending ? ` (${pending} new)` : ''}</a>`
 : `<a role="menuitem" href="/onboarding.html">✦ Finish your profile</a>`}
 <a role="menuitem" href="/settings.html"> Settings</a>
 ${me.user.isGuardian || me.user.isAdmin ? '<a role="menuitem" href="/admin.html"> Moderation queue</a>' : ''}
 ${me.user.role === 'creator' || me.user.isAdmin ? '<a role="menuitem" href="/write.html#review">✍ Review site writing</a>' : ''}
 <hr />
 <button type="button" role="menuitem" data-signout> Sign out</button>
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
// Optimistic signed-in shell: render the member nav immediately from the
// persisted session/cache so a reload never flashes "Sign in" first. The full
// /api/me fetch then re-renders with profile name, badges and menu links.
function cachedMe() {
 try {
 const v = JSON.parse(localStorage.getItem(ME_CACHE) || 'null');
 return v && v.user ? v : null;
 } catch { return null; }
}
function optimisticMe() {
 const fromCache = cachedMe();
 if (fromCache) return fromCache;
 try {
 const raw = JSON.parse(localStorage.getItem('gotrue.user') || 'null');
 if (!raw || !raw.id) return null;
 const role = raw.role || 'member';
 return { user: { id: raw.id, email: raw.email, role, isOwner: role === 'owner', isAdmin: role === 'admin', isGuardian: role === 'guardian' }, profile: null, counts: {} };
 } catch { return null; }
}
// ─── BOOT ───
(async () => {
 // Register first so a login/logout that lands mid-boot still updates the nav.
 onAuthChange((event) => {
 if (event === 'login' || event === 'logout') {
 clearMe();
 loadMe().then(renderNav);
 }
 });
 try {
 await finishEmailLink();
 if (sessionExpired() && (await currentUser())) await signOut({ redirect: false });
 const opt = optimisticMe();
 if (opt) renderNav(opt); // no flash of signed-out
 const me = await loadMe();
 renderNav(me);
 // Shane knows instantly he's home (once per browser session).
 if (me?.user?.isOwner && !sessionStorage.getItem('ps-owner-welcomed')) {
 sessionStorage.setItem('ps-owner-welcomed', '1');
 toast(`✦ Welcome home, ${me.user.ownerName || 'Shane'}. Full power, full respect.${me.counts?.awaitingReview ? ` ${me.counts.awaitingReview} post${me.counts.awaitingReview === 1 ? '' : 's'} waiting for you.` : ''}`, 5000);
 }
 } catch (err) {
 // A failed Identity/widget load must never break the page.
 console.warn('[auth] boot failed (page continues as guest):', err);
 }
})();
