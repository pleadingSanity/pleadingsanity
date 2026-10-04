// post.html — page script (kept out of the HTML so the strict Content-Security-Policy allows it)
import { api, esc, requireMember, toast } from '/js/auth.js';
import { CRISIS_STRIP, INTERESTS, MOODS, chipGroup, setChips } from '/js/social.js';

const me = await requireMember();
const form = document.getElementById('composer');
const msg = document.getElementById('form-msg');
const bodyEl = document.getElementById('body');
const count = document.getElementById('body-count');
let kind = 'text';
let imageKey = '';
let videoKey = '';
let meme = false;

// Their Sanity Profile defaults: who sees new posts, and their usual Truth Tag.
document.getElementById('visibility').value = me.profile.isPrivate ? 'friends' : me.profile.defaultVisibility || 'public';
if (me.profile.truthTagDefault) {
  const tag = form.querySelector(`input[name="truthTag"][value="${me.profile.truthTagDefault}"]`);
  if (tag) tag.checked = true;
}
if (me.community?.reviewMode && !me.user.isGuardian && me.user.role !== 'creator') {
  msg.innerHTML = '<p class="notice info">🌿 Shane is reviewing new posts right now — yours will appear on the feed once he\'s had a look. You\'ll see it on your page straight away.</p>';
}

// ─── KIND ───
const LIMITS = { text: 5000, story: 20000, video: 5000, image: 5000, status: 1000, writing: 20000 };
const LABELS = { text: "What's on your mind?", story: 'Your story', video: 'Say something about the video', image: 'Say something about the image', status: "I'm feeling…", writing: 'Your poem, thought or story' };
function setKind(next) {
  meme = next === 'meme';
  kind = meme ? 'image' : next;
  document.querySelectorAll('#kinds [data-kind]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kind === next)));
  document.getElementById('video-field').hidden = next !== 'video';
  document.getElementById('image-field').hidden = next !== 'image' && next !== 'meme';
  document.getElementById('body-label').textContent = LABELS[kind];
  bodyEl.maxLength = LIMITS[kind];
  bodyEl.rows = kind === 'story' || kind === 'writing' ? 14 : kind === 'status' ? 3 : 7;
  updateCount();
}
document.getElementById('kinds').addEventListener('click', (e) => {
  const b = e.target.closest('[data-kind]');
  if (b) setKind(b.dataset.kind);
});
const updateCount = () => { count.textContent = `${bodyEl.value.length} / ${bodyEl.maxLength}`; };
bodyEl.addEventListener('input', updateCount);
const wanted = new URLSearchParams(location.search).get('kind');
if (wanted in LIMITS) setKind(wanted);

// ─── MOOD & TAGS ───
const moodsBox = document.getElementById('moods');
const getMood = chipGroup(moodsBox, Object.entries(MOODS).map(([value, m]) => ({ value, label: `${m.icon} ${m.label}` })), [me.profile.mood || 'rising'], { single: true });
moodsBox.querySelectorAll('.chip').forEach((c) => { c.style.fontSize = '1rem'; });

const tagBox = document.getElementById('tag-chips');
let tagValues = [...INTERESTS];
let tagBoxRef = tagBox;
let getTags = chipGroup(tagBox, tagValues, []);
function addTags(list) {
  const current = getTags();
  const cleaned = list.map((t) => String(t).replace(/[^\p{L}\p{N}]/gu, '').slice(0, 30)).filter(Boolean);
  const fresh = cleaned.filter((t) => !tagValues.some((v) => v.toLowerCase() === t.toLowerCase()));
  if (fresh.length) {
    tagValues = [...fresh, ...tagValues];
    const box = tagBoxRef.cloneNode(false);
    tagBoxRef.replaceWith(box);
    getTags = chipGroup(box, tagValues, current);
    tagBoxRef = box;
  }
  setChips(tagBoxRef, [...new Set([...current, ...cleaned])].slice(0, 8));
}
const tagInput = document.getElementById('tag-input');
const addTyped = () => {
  if (!tagInput.value.trim()) return;
  addTags([tagInput.value.trim()]);
  tagInput.value = '';
};
document.getElementById('tag-add').addEventListener('click', addTyped);
tagInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addTyped(); } });

// ─── IMAGE ───
const fileInput = document.getElementById('image');
const preview = document.getElementById('preview');
fileInput.addEventListener('change', async () => {
  imageKey = '';
  const file = fileInput.files[0];
  preview.hidden = true;
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { toast('That image is over 5 MB — try a smaller one.'); fileInput.value = ''; return; }
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  const data = new FormData();
  data.append('image', file);
  msg.innerHTML = '<p class="notice info">Uploading image…</p>';
  try {
    ({ key: imageKey } = await api('/api/images', { method: 'POST', form: data }));
    msg.innerHTML = '<p class="notice ok">Image ready ✓</p>';
  } catch (error) {
    msg.innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
    fileInput.value = '';
    preview.hidden = true;
  }
});

// ─── AI HELPER ───
const aiBtn = document.getElementById('ai-btn');
const aiOut = document.getElementById('ai-out');
aiBtn.addEventListener('click', async () => {
  const draft = bodyEl.value.trim();
  if (draft.length < 5) { aiOut.innerHTML = '<p class="notice info" style="margin-top:1rem">Write a few words first — even messy ones are fine.</p>'; bodyEl.focus(); return; }
  aiBtn.disabled = true;
  aiBtn.textContent = '✨ Thinking…';
  aiOut.innerHTML = '';
  try {
    const s = await api('/api/ai-post', { method: 'POST', body: { draft, kind, mood: getMood()[0] } });
    aiOut.innerHTML = `
      <div class="notice ok" style="margin-top:1rem">
        ${s.note ? `<p style="margin:0 0 .6rem">${esc(s.note)}</p>` : ''}
        ${s.title ? `<p style="margin:0 0 .4rem"><strong>Title:</strong> ${esc(s.title)}</p>` : ''}
        <p style="margin:0 0 .6rem;white-space:pre-wrap">${esc(s.body)}</p>
        ${s.tags.length ? `<p style="margin:0 0 .6rem"><strong>Tags:</strong> ${s.tags.map((t) => '#' + esc(t)).join(' ')}</p>` : ''}
        <div class="btn-row"><button type="button" class="sbtn small primary" data-use>Use this</button><button type="button" class="sbtn small ghost" data-keep>Keep mine</button></div>
      </div>
      ${s.crisis ? CRISIS_STRIP : ''}`;
    aiOut.querySelector('[data-use]').addEventListener('click', () => {
      if (s.title) form.title.value = s.title;
      bodyEl.value = s.body;
      updateCount();
      if (s.tags.length) addTags(s.tags);
      if (s.mood) setChips(moodsBox, [s.mood]);
      if (s.contentWarning) document.getElementById('cw').checked = true;
      aiOut.querySelector('.notice').remove();
      toast('Suggestion applied — edit anything you like.');
    });
    aiOut.querySelector('[data-keep]').addEventListener('click', () => aiOut.querySelector('.notice').remove());
  } catch (error) {
    aiOut.innerHTML = `<p class="notice info" style="margin-top:1rem">${esc(error.message)}</p>`;
  } finally {
    aiBtn.disabled = false;
    aiBtn.textContent = '✨ Help me write';
  }
});

const videoFile = document.getElementById('video-file');
if (videoFile) videoFile.addEventListener('change', async () => {
  videoKey = '';
  const file = videoFile.files[0];
  if (!file) return;
  if (file.size > 8 * 1024 * 1024) { toast('That video is over 8 MB. Use a YouTube link for longer ones.'); videoFile.value = ''; return; }
  const data = new FormData();
  data.append('image', file);
  msg.innerHTML = '<p class="notice info">Uploading video…</p>';
  try {
    ({ key: videoKey } = await api('/api/images', { method: 'POST', form: data }));
    msg.innerHTML = '<p class="notice ok">Video ready ✓</p>';
  } catch (error) {
    msg.innerHTML = `<p class="notice err">${esc(error.message)}</p>`;
    videoFile.value = '';
  }
});

// ─── SUBMIT ───
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = bodyEl.value.trim();
  const mood = getMood()[0];
  const problem =
    !mood ? 'Pick how you are feeling.' :
    kind === 'video' && !form.videoUrl.value.trim() && !videoKey ? 'Add a YouTube link or a short video.' :
    kind === 'image' && !imageKey ? 'Choose an image (and wait for it to upload).' :
    !body && kind !== 'video' && kind !== 'image' ? 'Write something first.' : '';
  if (problem) { msg.innerHTML = `<p class="notice err">${problem}</p>`; msg.scrollIntoView({ block: 'center' }); return; }

  const submit = document.getElementById('submit');
  submit.disabled = true;
  submit.textContent = 'Checking & sharing…';
  msg.innerHTML = '';
  try {
    const result = await api('/api/posts', {
      method: 'POST',
      body: {
        kind, body, mood, imageKey,
    videoKey,
        title: form.title.value.trim(),
        videoUrl: form.videoUrl.value.trim(),
        tags: meme ? ["meme"] : getTags(),
        visibility: form.visibility.value,
        truthTag: form.truthTag.value,
        contentWarning: document.getElementById('cw').checked,
      },
    });
    const target = `/feed.html?post=${result.post.id}#community`;
    if (result.pending && !result.crisis) {
      toast('Shared 💙 It will appear on the feed once Shane has reviewed it.', 6000);
      location.href = `/@${me.profile.username}`;
      return;
    }
    if (result.crisis) {
      form.innerHTML = `
        <h2>Your post is shared 💙</h2>
        <p>It sounds like things are really heavy right now. You matter, and support is here any time — day or night.</p>
        ${CRISIS_STRIP}
        <div class="btn-row" style="margin-top:1rem"><a class="sbtn primary" href="${target}">See your post</a><a class="sbtn ghost" href="/crisis.html">House truth</a></div>`;
      form.querySelector('h2').tabIndex = -1;
      form.querySelector('h2').focus();
    } else {
      location.href = target;
    }
  } catch (error) {
    if (error.data?.onboarding) { location.href = '/onboarding.html?next=/post.html'; return; }
    msg.innerHTML = error.data?.blocked
      ? `<div class="notice err"><strong>${esc(error.message)}</strong>${error.data.reason ? `<br />${esc(error.data.reason)}` : ''}</div>`
      : `<p class="notice err">${esc(error.message)}</p>`;
    msg.scrollIntoView({ block: 'center' });
  } finally {
    if (submit.isConnected) { submit.disabled = false; submit.textContent = 'Share 💙'; }
  }
});
