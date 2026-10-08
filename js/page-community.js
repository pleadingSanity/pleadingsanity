// community.html — page script (kept out of the HTML so the strict Content-Security-Policy allows it)
import { api, esc, requireMember, toast } from '/js/auth.js';
import { countryOptions, friendButtons, personHTML, sendFriendAction } from '/js/social.js';

const me = await requireMember();
const myCountry = me.profile.country;
document.getElementById('country').innerHTML = countryOptions('').replace('Prefer not to say', 'Anywhere');

const grid = (people, state = 'none', empty = '') =>
  people.length
    ? `<div class="people">${people.map((p) => personHTML(p, friendButtons(p.state || state))).join('')}</div>`
    : `<p class="empty">${empty}</p>`;

// ─── TABS ───
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab, focus = false) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  if (focus) tab.focus();
  history.replaceState(null, '', '#' + tab.id.replace('tab-', ''));
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length], true);
    if (e.key === 'ArrowLeft') selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true);
  });
});
const initial = tabs.find((t) => t.id === 'tab-' + location.hash.slice(1));
if (initial) selectTab(initial);

// ─── DISCOVER ───
const results = document.getElementById('results');
const form = document.getElementById('search-form');

function mountCreatorHubTools() {
  if (!form || document.getElementById('creator-hub-tools')) return;
  const box = document.createElement('div');
  box.id = 'creator-hub-tools';
  box.className = 'panel';
  box.style.marginTop = '.8rem';
  box.innerHTML = `
    <div class="row" style="justify-content:space-between;gap:.6rem;flex-wrap:wrap">
      <strong>📡 Creator discovery</strong>
      <button type="button" class="sbtn small ghost" data-local-notifications>🔔 Notifications</button>
    </div>
    <div class="btn-row" style="margin-top:.7rem">
      <a class="sbtn small ghost" href="/live.html#now">🔴 Live Now</a>
      <a class="sbtn small ghost" href="/live.html#scheduled">📅 Upcoming</a>
      <button type="button" class="sbtn small ghost" data-creators-filter>👥 Creators</button>
    </div>
    <p class="muted" style="margin:.7rem 0 0;font-size:.88rem">
      Live filters open the dedicated LIVE hub. Cross-platform live status and real-time notifications are 🔜 COMING SOON with the live backend.
    </p>
    <div id="local-notification-panel" hidden style="margin-top:.8rem"></div>
  `;
  form.parentElement.insertBefore(box, form.nextSibling);

  box.querySelector('[data-creators-filter]').addEventListener('click', () => {
    form.q.value = '';
    form.country.value = '';
    results.innerHTML = '<p class="muted">Use the search above to find creators by name, bio or interests.</p>';
    form.q.focus();
  });
  box.querySelector('[data-local-notifications]').addEventListener('click', () => {
    const panel = box.querySelector('#local-notification-panel');
    panel.hidden = !panel.hidden;
    if (panel.hidden) return;
    let followed = [];
    let notifying = [];
    try { followed = JSON.parse(localStorage.getItem('ps-following-creators') || '[]'); } catch {}
    try { notifying = JSON.parse(localStorage.getItem('ps-live-notify-creators') || '[]'); } catch {}
    panel.innerHTML = followed.length
      ? `<strong>Following</strong><ul style="margin:.5rem 0 0;padding-left:1.2rem">${followed.map((u) => `<li><a href="/@${encodeURIComponent(u)}">@${esc(u)}</a> ${notifying.includes(u) ? '🔔' : ''}</li>`).join('')}</ul><p class="muted" style="margin:.5rem 0 0">🔜 Real-time alerts will arrive when the notification service is connected.</p>`
      : '<p class="muted" style="margin:0">You are not following any creators on this device yet. Open a creator profile and tap Follow.</p>';
  });
}

const formMarker="const results = document.getElementById('results');\nconst form = document.getElementById('search-form');\n";
mountCreatorHubTools();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const q = new URLSearchParams({ q: form.q.value.trim(), country: form.country.value });
  if (!form.q.value.trim() && !form.country.value) { results.innerHTML = ''; return; }
  results.innerHTML = '<div class="skeleton"></div>';
  try {
    const { results: people } = await api(`/api/community/search?${q}`);
    results.innerHTML = `<h2 style="margin:0 0 1rem">Results</h2>` + grid(people, 'none', 'No one found yet — try another word, or check back as the family grows. 💙');
  } catch (error) {
    results.innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
  }
});

async function loadNear() {
  const near = document.getElementById('near');
  if (!myCountry) {
    near.innerHTML = '<p class="muted">Add your country (optional) in <a href="/profile.html">your profile</a> to see survivors in the same country. We never use exact locations.</p>';
    return;
  }
  document.getElementById('near-title').textContent = `📍 Survivors in ${myCountry}`;
  try {
    const { results: people } = await api(`/api/community/search?${new URLSearchParams({ country: myCountry })}`);
    near.innerHTML = grid(people.slice(0, 9), 'none', `No one else in ${esc(myCountry)} yet — you're a pioneer. 🌅`);
  } catch (error) {
    near.innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
  }
}

async function loadSuggested() {
  const box = document.getElementById('suggested');
  try {
    const { results: people } = await api('/api/community/suggested');
    box.innerHTML = grid(people, 'none', 'No suggestions yet. Add interests to your profile to find people like you.');
  } catch (error) {
    box.innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
  }
}

// ─── REQUESTS & FRIENDS ───
async function loadFriends() {
  try {
    const data = await api('/api/friends');
    document.getElementById('req-count').textContent = data.incoming.length ? `(${data.incoming.length})` : '';
    document.getElementById('incoming').innerHTML = grid(data.incoming, 'incoming', 'No new requests.');
    document.getElementById('outgoing').innerHTML = grid(data.outgoing, 'outgoing', 'No pending requests.');
    document.getElementById('friends').innerHTML = grid(data.friends, 'friends', 'No friends yet — find your people in Discover. 💙');
  } catch (error) {
    document.getElementById('friends').innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
  }
}

document.querySelector('main').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-friend]');
  if (!b) return;
  const card = b.closest('[data-username]');
  b.disabled = true;
  try {
    const state = await sendFriendAction(card.dataset.username, b.dataset.friend);
    if (state) {
      document.querySelectorAll(`[data-username="${CSS.escape(card.dataset.username)}"] .btn-row`).forEach((row) => { row.innerHTML = friendButtons(state); });
      loadFriends();
    } else b.disabled = false;
  } catch (error) {
    toast(error.message);
    b.disabled = false;
  }
});

loadNear();
loadSuggested();
loadFriends();
