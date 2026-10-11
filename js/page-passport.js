// ==============================================================
// 🛂 SANITY PASSPORT — page wiring
// Every field starts private and hidden from Arron. Nothing is
// saved until the member presses Save. All text is escaped.
// ==============================================================
import { api, esc, requireMember, toast } from '/js/auth.js';

const FIELDS = [
  ['whoIAm', 'Who I am', 'A few words about you, the way you want to be known.'],
  ['whatMatters', 'What matters to me', 'People, values, causes.'],
  ['inspires', 'What inspires me', 'Music, people, places, ideas.'],
  ['learning', "What I'm learning", 'A skill, a subject, a lesson life is teaching you.'],
  ['creating', "What I'm creating", 'Art, music, writing, a project.'],
  ['helps', 'What helps me', 'Things that steady you on a hard day.'],
  ['goals', 'My goals', 'Big or small. This month or this life.'],
  ['story', 'My story', 'As much or as little as you like. Leave out names and places.'],
  ['interests', 'My interests', 'Anything you enjoy.'],
  ['journey', 'My journey', 'Where you have been and where you are heading.'],
];
const AUDIENCE = [['private', '🔒 Only me'], ['members', '🌿 Members'], ['public', '🌍 Public']];

// Honest, simple matching done in the browser: words in what you wrote → a page that may fit.
const SUGGEST = [
  [/music|song|rap|beat|lyric/i, '/rap.html', '🎤 Rap Studio: write and shape verses'],
  [/write|writing|poem|poetry|story|book/i, '/write.html', '✍️ Write with Arron: drafts you make your own'],
  [/art|draw|paint|image|picture/i, '/creations.html', '🎨 Image Creations'],
  [/anx|calm|breath|stress|panic|sleep/i, '/mind-mode.html', '🌬️ Mind Mode: breathing and grounding'],
  [/quiet|silence|meditat|still/i, '/meditation.html', '🧘 Silence & Breath'],
  [/truth|philosoph|belief|faith|god|meaning|unknown/i, '/new-gen-bible.html', '📖 New Gen Bible: known, thought, belief, unknown'],
  [/game|play|puzzle|memory|focus/i, '/games.html', '🧠 Brain Games'],
  [/money|debt|loan|finance|budget|car/i, '/finance.html', '💷 Sane Finance: affordability before anything else'],
  [/mood|feel|journal|diary/i, '/mood-journey.html', '🌱 Mood Journey'],
  [/people|friend|lonely|community|connect/i, '/feed.html', '🌟 The community feed'],
];

const me = await requireMember();
const list = document.getElementById('pp-list');
const form = document.getElementById('pp-form');
const msg = document.getElementById('pp-msg');
if (me?.profile?.username) document.getElementById('pp-page').href = `/@${encodeURIComponent(me.profile.username)}`;

function render(data) {
  list.innerHTML = FIELDS.map(([key, label, hint]) => {
    const f = data.fields[key] || { text: '', visibility: 'private', ai: false };
    return `<fieldset class="field pp-field" data-key="${key}">
      <legend>${esc(label)}</legend>
      <label class="sr-only" for="pp-${key}">${esc(label)}</label>
      <textarea class="input" id="pp-${key}" name="${key}" rows="3" maxlength="1200" placeholder="${esc(hint)}">${esc(f.text)}</textarea>
      <div class="row" style="gap:12px;flex-wrap:wrap;align-items:center;margin-top:6px">
        <label><span class="sr-only">Who can see ${esc(label)}</span>
          <select class="input" name="${key}-vis" style="min-height:44px">${AUDIENCE.map(([v, l]) => `<option value="${v}" ${f.visibility === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
        </label>
        <label class="row" style="gap:6px;align-items:center;min-height:44px"><input type="checkbox" name="${key}-ai" ${f.ai ? 'checked' : ''} /> <span>Arron may use this</span></label>
      </div>
    </fieldset>`;
  }).join('');
  form.elements.aiMemoryAllowed.checked = data.aiMemoryAllowed;
  form.elements.personalise.checked = data.personalise;
  suggest();
}

function collect() {
  const fields = {};
  for (const [key] of FIELDS) {
    const text = form.elements[key].value.trim();
    if (text) fields[key] = { text, visibility: form.elements[`${key}-vis`].value, ai: form.elements[`${key}-ai`].checked };
  }
  return { fields, aiMemoryAllowed: form.elements.aiMemoryAllowed.checked, personalise: form.elements.personalise.checked };
}

function suggest() {
  const box = document.getElementById('pp-suggest');
  if (!form.elements.personalise.checked) { box.hidden = true; return; }
  const words = FIELDS.map(([key]) => form.elements[key]?.value || '').join(' ');
  const hits = SUGGEST.filter(([re]) => re.test(words)).slice(0, 5);
  box.hidden = false;
  document.getElementById('pp-suggest-list').innerHTML = hits.length
    ? hits.map(([, href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('')
    : '<li class="muted">Write a little in your Passport and suggestions will appear here.</li>';
}
form.elements.personalise.addEventListener('change', suggest);

try {
  render(await api('/api/passport'));
} catch (error) {
  list.innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('pp-save');
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');
  msg.innerHTML = '';
  try {
    render(await api('/api/passport', { method: 'PUT', body: collect() }));
    msg.innerHTML = '<p class="notice ok">Saved. Only what you made visible can be seen by others.</p>';
  } catch (error) {
    msg.innerHTML = `<p class="notice err">${esc(error.message)}${error.data?.reason ? ' ' + esc(error.data.reason) : ''}</p>`;
  } finally {
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
  }
});

document.getElementById('pp-delete').addEventListener('click', async () => {
  if (!confirm('Delete your whole Sanity Passport? This cannot be undone.')) return;
  try {
    await api('/api/passport', { method: 'DELETE' });
    render({ fields: {}, aiMemoryAllowed: false, personalise: false });
    toast('Your Passport is deleted.');
  } catch (error) {
    toast(error.message);
  }
});
