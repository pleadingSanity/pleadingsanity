// ==============================================================
// PLEADING SANITY — PROFILE FORM
// Shared by onboarding and "edit profile": display name, username,
// avatar, bio, mood, interests, country (optional) and privacy.
// ==============================================================

import { api, esc } from '/js/auth.js';
import { AVATARS, INTERESTS, MOODS, chipGroup, countryOptions } from '/js/social.js';

const slug = (name) =>
  name.toLowerCase().normalize('NFKD').replace(/[^\w\s]/g, '').trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 20);

export function mountProfileForm(root, { profile = null, withStory = false, submitLabel = 'Save profile', onSaved } = {}) {
  const p = profile || {};
  root.innerHTML = `
    <div data-msg aria-live="polite"></div>
    <form novalidate>
      <label class="field"><span>Display name</span>
        <input type="text" name="displayName" maxlength="40" required value="${esc(p.displayName || '')}" autocomplete="nickname" />
        <small>Any name you like — it doesn't need to be your real one.</small>
      </label>
      <label class="field"><span>Username</span>
        <input type="text" name="username" maxlength="24" required pattern="[a-z0-9_]{3,24}" value="${esc(p.username || '')}" autocapitalize="off" spellcheck="false" />
        <small>3–24 characters: lowercase letters, numbers, underscores. Your profile lives at /profile.html?user=<span data-preview>${esc(p.username || 'you')}</span></small>
      </label>
      <div class="field" role="group" aria-labelledby="avatar-label">
        <span id="avatar-label">Avatar</span>
        <div class="picker" data-avatars>
          ${AVATARS.map((a) => `<button type="button" data-avatar="${a}" aria-pressed="${p.avatar === a}" aria-label="Avatar ${a}">${a}</button>`).join('')}
          <button type="button" data-avatar="" aria-pressed="${p.avatar && !AVATARS.includes(p.avatar)}" aria-label="Use my initials" style="font-size:1rem">Aa</button>
        </div>
        <small>Pick an emoji, or "Aa" to use your initials.</small>
      </div>
      <label class="field"><span>Bio <small style="display:inline">(optional)</small></span>
        <textarea name="bio" maxlength="300" rows="3" placeholder="A few words about you, your journey, what helps…">${esc(p.bio || '')}</textarea>
      </label>
      <div class="field" role="group" aria-labelledby="mood-label">
        <span id="mood-label">How are you feeling lately?</span>
        <div class="picker" data-mood></div>
      </div>
      <div class="field" role="group" aria-labelledby="int-label">
        <span id="int-label">Interests <small style="display:inline">(helps us suggest friends)</small></span>
        <div class="picker" data-interests></div>
      </div>
      <label class="field"><span>Country <small style="display:inline">(optional)</small></span>
        <select name="country">${countryOptions(p.country || '')}</select>
        <small>Used only for "Survivors near you". We never ask for or store your exact location.</small>
      </label>
      ${withStory ? `
      <label class="field"><span>📖 My Story <small style="display:inline">(optional — never required)</small></span>
        <textarea name="story" maxlength="10000" rows="8" placeholder="Share your journey, in your own words, when and if you're ready.">${esc(p.story || '')}</textarea>
      </label>` : ''}
      <label class="check field">
        <input type="checkbox" name="isPrivate" ${p.isPrivate ? 'checked' : ''} />
        <span><strong>Friends-only profile</strong><br /><small>Only friends see your bio, story and posts. Everyone else just sees your name and avatar.</small></span>
      </label>
      <div class="btn-row"><button class="sbtn primary" type="submit">${esc(submitLabel)}</button><span data-extra></span></div>
    </form>`;

  const form = root.querySelector('form');
  const msg = root.querySelector('[data-msg]');
  const show = (text, kind = 'err') => { msg.innerHTML = `<p class="notice ${kind}">${text}</p>`; msg.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };

  let avatar = p.avatar || AVATARS[0];
  const avatars = root.querySelector('[data-avatars]');
  if (!p.avatar) avatars.querySelector(`[data-avatar="${AVATARS[0]}"]`).setAttribute('aria-pressed', 'true');
  avatars.addEventListener('click', (e) => {
    const b = e.target.closest('[data-avatar]');
    if (!b) return;
    avatars.querySelectorAll('[data-avatar]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', 'true');
    avatar = b.dataset.avatar;
  });

  const moodValues = Object.entries(MOODS).map(([value, m]) => ({ value, label: `${m.icon} ${m.label}` }));
  const getMood = chipGroup(root.querySelector('[data-mood]'), moodValues, [p.mood || 'rising'], { single: true });
  const getInterests = chipGroup(root.querySelector('[data-interests]'), INTERESTS, p.interests || []);

  const { displayName, username } = form.elements;
  let usernameTouched = Boolean(p.username);
  const preview = root.querySelector('[data-preview]');
  displayName.addEventListener('input', () => {
    if (!usernameTouched) { username.value = slug(displayName.value); preview.textContent = username.value || 'you'; }
  });
  username.addEventListener('input', () => {
    usernameTouched = true;
    username.value = username.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    preview.textContent = username.value || 'you';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!displayName.value.trim()) return show('Please choose a display name.');
    if (!/^[a-z0-9_]{3,24}$/.test(username.value)) return show('Usernames are 3–24 characters: lowercase letters, numbers and underscores.');
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    const body = {
      displayName: displayName.value,
      username: username.value,
      avatar: avatar || displayName.value,
      bio: form.elements.bio.value,
      mood: getMood()[0] || 'rising',
      interests: getInterests(),
      country: form.elements.country.value,
      isPrivate: form.elements.isPrivate.checked,
    };
    if (withStory) body.story = form.elements.story.value;
    try {
      const result = await api('/api/me', { method: 'PUT', body });
      await onSaved?.(result);
    } catch (error) {
      show(esc(error.message));
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  });

  return { form, extra: root.querySelector('[data-extra]') };
}
