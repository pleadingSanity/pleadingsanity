// ==============================================================
// PLEADING SANITY — ONE-TAP SIGN IN (configured OAuth providers)
// Shows a button for each provider switched on in Netlify →
// Identity. The return trip is finished by /js/auth.js on load.
// ==============================================================

import { getSettings, oauthLogin } from '/js/vendor/netlify-identity.js';

const PROVIDERS = [
  ['google', 'Continue with Google', 'G'],
  ['github', 'Continue with GitHub', '🐙'],
  ['gitlab', 'Continue with GitLab', '🦊'],
  ['bitbucket', 'Continue with Bitbucket', '🪣'],
  ['facebook', 'Continue with Facebook', 'f'],
];

export async function mountOAuth(container, { beforeRedirect } = {}) {
  if (!container) return;
  let enabled = {};
  try {
    enabled = (await getSettings()).providers || {};
  } catch {
    return; // Identity not reachable — email sign-in still works
  }
  const available = PROVIDERS.filter(([id]) => enabled[id] === true || enabled[id]?.enabled === true);
  if (!available.length) return;
  container.innerHTML = `
    <div class="oauth-row">
      ${available.map(([id, label, icon]) => `<button type="button" class="sbtn ghost block" data-oauth="${id}"><span aria-hidden="true">${icon}</span> ${label}</button>`).join('')}
    </div>
    <div class="divider">or with email</div>`;
  container.addEventListener('click', (e) => {
    const b = e.target.closest('[data-oauth]');
    if (!b) return;
    beforeRedirect?.();
    const next = new URLSearchParams(location.search).get('next');
    if (next) sessionStorage.setItem('ps-next', next);
    oauthLogin(b.dataset.oauth);
  });
}
