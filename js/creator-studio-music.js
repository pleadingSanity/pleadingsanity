// Creator Music Studio (private). Gate, lyrics vault, beat picker, recorder, vocal polish, takes.
// The server decides who gets in (/api/creator-studio checks the creator role); this page only
// reflects that answer. No tracking, no third-party requests, no keys.
import { api, currentUser, esc } from '/js/auth.js';

const $ = (id) => document.getElementById(id);
const TARGET_BPM = 138;
const state = { drafts: [], current: 0, ctx: null, beatBuffers: new Map(), beatSource: null, playing: [], recorder: null, stream: null, chunks: [], dryBlob: null, dryBuffer: null, rendered: new Map(), maxBytes: 4_500_000 };

function audioCtx() {
  if (!state.ctx) state.ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (state.ctx.state === 'suspended') state.ctx.resume();
  return state.ctx;
}

// ─── GATE ───
async function gate() {
  try {
    const info = await api('/api/creator-studio');
    $('gate').hidden = true;
    $('studio').hidden = false;
    state.maxBytes = info.maxTakeBytes || state.maxBytes;
    $('storageNote').textContent = info.storage === 'supabase'
      ? 'Takes are stored in the private Supabase bucket. Only the creator team can reach them.'
      : 'Takes are stored in the site\u2019s private store. Only the creator team can reach them.';
    $('genStatus').textContent = info.generate?.configured ? 'A provider key is set, but generation is not switched on yet.' : 'Not configured yet. No provider key is set.';
    return true;
  } catch (error) {
    if (error.status === 401) {
      $('gateText').textContent = 'This studio is private. Sign in with your creator account to open it.';
      $('gateSignIn').hidden = false;
    } else if (error.status === 403) {
      $('gateText').textContent = 'This is a private studio for the Pleading Sanity creator team. Ask Shane if you think you should have a key.';
    } else {
      $('gateText').textContent = 'The studio could not be reached just now. Please try again shortly.';
    }
    return false;
  }
}

// ─── LYRICS VAULT ───
function renderDrafts() {
  const pick = $('draftPick');
  pick.innerHTML = state.drafts.map((d, i) => `<option value="${i}">${esc(d.title)}</option>`).join('');
  pick.value = String(state.current);
  const d = state.drafts[state.current] || { title: '', body: '' };
  $('draftTitle').value = d.title;
  $('draftBody').value = d.body;
  $('prompter').textContent = d.body;
}
async function loadDrafts() {
  try {
    const data = await api('/api/creator-studio/lyrics');
    state.drafts = (data.drafts || []).map((d) => ({ id: d.id, title: d.title, body: d.body }));
    if (data.seeded) $('vaultStatus').textContent = 'Seeded with the Shaney C drafts. Save once to keep your edits.';
  } catch (error) {
    $('vaultStatus').textContent = error.message;
  }
  if (!state.drafts.length) state.drafts = [{ id: 'draft-1', title: 'New draft', body: '' }];
  renderDrafts();
}
function wireVault() {
  $('draftPick').addEventListener('change', (e) => { state.current = Number(e.target.value) || 0; renderDrafts(); });
  $('draftTitle').addEventListener('input', (e) => { state.drafts[state.current].title = e.target.value; });
  $('draftBody').addEventListener('input', (e) => { state.drafts[state.current].body = e.target.value; $('prompter').textContent = e.target.value; });
  $('draftNew').addEventListener('click', () => {
    state.drafts.push({ id: 'draft-' + Date.now().toString(36), title: 'New draft', body: '' });
    state.current = state.drafts.length - 1;
    renderDrafts();
    $('draftTitle').focus();
  });
  $('draftSave').addEventListener('click', async () => {
    $('vaultStatus').textContent = 'Saving…';
    try {
      const data = await api('/api/creator-studio/lyrics', { method: 'PUT', body: { drafts: state.drafts } });
      state.drafts = data.drafts.map((d) => ({ id: d.id, title: d.title, body: d.body }));
      renderDrafts();
      $('vaultStatus').textContent = 'Saved to the vault.';
    } catch (error) {
      $('vaultStatus').textContent = error.message;
    }
  });
}

// ─── BEATS ───
const beatIndex = () => Number($('beatPick').value) || 0;
const preset = () => window.PSStudioBeats.presets[beatIndex()];
const beatRate = () => ($('beatLift').checked ? TARGET_BPM / preset().bpm : 1);
const beatBpm = () => ($('beatLift').checked ? TARGET_BPM : preset().bpm);
const beatGain = () => Number($('beatLevel').value) / 100;
async function beatBuffer() {
  const i = beatIndex();
  if (!state.beatBuffers.has(i)) {
    const made = window.PSStudioBeats.create(i);
    state.beatBuffers.set(i, await audioCtx().decodeAudioData(await made.blob.arrayBuffer()));
  }
  return state.beatBuffers.get(i);
}
function showBpm() { $('bpmValue').textContent = String(beatBpm()); state.rendered.clear(); }
async function startBeat(when) {
  const ctx = audioCtx();
  const src = ctx.createBufferSource();
  src.buffer = await beatBuffer();
  src.loop = true;
  src.playbackRate.value = beatRate();
  const g = ctx.createGain(); g.gain.value = beatGain();
  src.connect(g); g.connect(ctx.destination);
  src.start(when ?? ctx.currentTime + 0.05);
  return src;
}
function stopAll() {
  for (const s of state.playing) { try { s.stop(); } catch { /* already stopped */ } }
  state.playing = [];
  $('beatStop').disabled = true; $('playStop').disabled = true;
}
function wireBeats() {
  const beats = window.PSStudioBeats?.presets || [];
  $('beatPick').innerHTML = beats.map((b, i) => `<option value="${i}">${esc(b.name)} (${b.bpm} BPM original)</option>`).join('');
  $('beatPick').addEventListener('change', showBpm);
  $('beatLift').addEventListener('change', showBpm);
  $('beatLevel').addEventListener('input', () => state.rendered.clear());
  showBpm();
  $('beatPlay').addEventListener('click', async () => { stopAll(); state.playing.push(await startBeat()); $('beatStop').disabled = false; });
  $('beatStop').addEventListener('click', stopAll);
}

// ─── RECORDER ───
function pickMime() {
  for (const type of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']) {
    if (window.MediaRecorder?.isTypeSupported?.(type)) return type;
  }
  return '';
}
function setTakeButtons(on) { for (const id of ['playDry', 'playPolished', 'saveDry', 'savePolished', 'saveMix']) $(id).disabled = !on; }
function wireRecorder() {
  $('recStart').addEventListener('click', async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { $('recStatus').textContent = 'This browser cannot record audio. Try Chrome, Edge, Firefox or Safari.'; return; }
    try {
      stopAll();
      state.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } });
      const mime = pickMime();
      state.recorder = new MediaRecorder(state.stream, mime ? { mimeType: mime } : undefined);
      state.chunks = [];
      state.recorder.ondataavailable = (e) => { if (e.data.size) state.chunks.push(e.data); };
      state.recorder.onstop = finishTake;
      const ctx = audioCtx();
      const when = ctx.currentTime + 0.1;
      state.playing.push(await startBeat(when));
      setTimeout(() => state.recorder.start(), 100);
      $('recStart').disabled = true; $('recStop').disabled = false;
      $('recStatus').textContent = 'Recording. Beat is playing.';
    } catch (error) {
      $('recStatus').textContent = error.name === 'NotAllowedError' ? 'Microphone access was blocked. Allow it in the browser and try again.' : 'Could not start the microphone.';
    }
  });
  $('recStop').addEventListener('click', () => {
    if (state.recorder?.state === 'recording') state.recorder.stop();
    stopAll();
    state.stream?.getTracks().forEach((t) => t.stop());
    $('recStart').disabled = false; $('recStop').disabled = true;
  });
}
async function finishTake() {
  state.dryBlob = new Blob(state.chunks, { type: state.recorder.mimeType || 'audio/webm' });
  state.rendered.clear();
  try {
    state.dryBuffer = await audioCtx().decodeAudioData(await state.dryBlob.arrayBuffer());
    $('recStatus').textContent = `Take captured: ${state.dryBuffer.duration.toFixed(1)} seconds. Polish and save it below.`;
    setTakeButtons(true);
  } catch {
    $('recStatus').textContent = 'The take was recorded but could not be decoded for polishing. You can still save it dry.';
    $('saveDry').disabled = false;
  }
}

// ─── POLISH ───
function polishOptions() {
  return { cleanup: $('pCleanup').checked, compress: $('pCompress').checked, eq: $('pEq').checked, space: $('pSpace').checked, tune: $('pTune').checked, bpm: beatBpm() };
}
async function rendered(withBeat) {
  const opts = polishOptions();
  const key = JSON.stringify({ ...opts, withBeat, beat: beatIndex(), rate: beatRate(), level: beatGain() });
  if (!state.rendered.has(key)) {
    $('polishStatus').textContent = opts.tune ? 'Polishing (pitch correction takes a few seconds)…' : 'Polishing…';
    const extra = withBeat ? { beatBuffer: await beatBuffer(), beatRate: beatRate(), beatGain: beatGain() } : {};
    state.rendered.set(key, await window.PSVocalPolish.render(state.dryBuffer, { ...opts, ...extra }));
    $('polishStatus').textContent = '';
  }
  return state.rendered.get(key);
}
async function play(buffer, withBeat) {
  stopAll();
  const ctx = audioCtx(), when = ctx.currentTime + 0.08;
  const src = ctx.createBufferSource(); src.buffer = buffer; src.connect(ctx.destination); src.start(when);
  state.playing.push(src);
  if (withBeat) state.playing.push(await startBeat(when));
  src.onended = () => stopAll();
  $('playStop').disabled = false;
}
// Realtime Opus encode for long takes that would not fit as WAV. Plays silently into a recorder.
function encodeCompressed(buffer) {
  return new Promise((resolve, reject) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const dest = ctx.createMediaStreamDestination();
    const src = ctx.createBufferSource(); src.buffer = buffer; src.connect(dest);
    const mime = pickMime();
    const rec = new MediaRecorder(dest.stream, mime ? { mimeType: mime } : undefined);
    const parts = [];
    rec.ondataavailable = (e) => { if (e.data.size) parts.push(e.data); };
    rec.onstop = () => { ctx.close(); resolve(new Blob(parts, { type: rec.mimeType || 'audio/webm' })); };
    rec.onerror = reject;
    src.onended = () => rec.stop();
    rec.start(); src.start();
  });
}
async function toFile(buffer) {
  const wav = window.PSVocalPolish.encodeWav(buffer, { sampleRate: 32000, mono: true });
  if (wav.size <= state.maxBytes) return wav;
  $('polishStatus').textContent = `Long take: compressing in real time (about ${Math.ceil(buffer.duration)} seconds)…`;
  return encodeCompressed(buffer);
}
const extFor = (type) => (type.includes('wav') ? 'wav' : type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm');
async function upload(blob, kind) {
  if (blob.size > state.maxBytes) { $('polishStatus').textContent = 'That take is over 4.5 MB. Record it in shorter sections.'; return; }
  const form = new FormData();
  form.append('file', blob, `take.${extFor(blob.type)}`);
  form.append('title', $('takeTitle').value.trim() || `${state.drafts[state.current]?.title || 'Take'} (${kind})`);
  form.append('kind', kind);
  form.append('beat', `${preset().name} @ ${beatBpm()} BPM`);
  $('polishStatus').textContent = 'Saving…';
  try {
    await api('/api/creator-studio/takes', { method: 'POST', form });
    $('polishStatus').textContent = `Saved ${kind} take.`;
    loadTakes();
  } catch (error) {
    $('polishStatus').textContent = error.message;
  }
}
function wirePolish() {
  for (const id of ['pCleanup', 'pCompress', 'pEq', 'pSpace', 'pTune']) $(id).addEventListener('change', () => state.rendered.clear());
  $('playDry').addEventListener('click', () => play(state.dryBuffer, true));
  $('playPolished').addEventListener('click', async () => play(await rendered(false), true));
  $('playStop').addEventListener('click', stopAll);
  $('saveDry').addEventListener('click', () => upload(state.dryBlob, 'dry'));
  $('savePolished').addEventListener('click', async () => upload(await toFile(await rendered(false)), 'polished'));
  $('saveMix').addEventListener('click', async () => upload(await toFile(await rendered(true)), 'mix'));
}

// ─── TAKES ───
function token() {
  const m = document.cookie.match(/(?:^|; )nf_jwt=([^;]*)/);
  if (m) return decodeURIComponent(m[1]);
  try { return JSON.parse(localStorage.getItem('gotrue.user') || 'null')?.token?.access_token || ''; } catch { return ''; }
}
async function loadTakes() {
  const list = $('takeList');
  try {
    const { takes } = await api('/api/creator-studio/takes');
    if (!takes.length) { list.innerHTML = '<li>No takes saved yet.</li>'; return; }
    list.innerHTML = takes.map((t) => `<li data-id="${esc(t.id)}"><div><strong>${esc(t.title)}</strong><span class="csm-tag">${esc(t.kind)}</span></div>
<div class="csm-note">${esc(t.beat || 'No beat noted')} / ${new Date(t.addedAt).toLocaleString('en-GB')} / ${Math.round(t.bytes / 1024)} KB</div>
<div class="csm-row"><button class="csm-secondary" type="button" data-act="load">Load to listen</button><button class="csm-secondary" type="button" data-act="delete">Delete</button></div></li>`).join('');
  } catch (error) {
    list.innerHTML = `<li>${esc(error.message)}</li>`;
  }
}
function wireTakes() {
  $('takeList').addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-act]');
    const li = btn?.closest('li[data-id]');
    if (!li) return;
    const id = li.dataset.id;
    if (btn.dataset.act === 'delete') {
      if (!confirm('Delete this take for good?')) return;
      try { await api(`/api/creator-studio/takes/${encodeURIComponent(id)}`, { method: 'DELETE' }); loadTakes(); } catch (error) { $('polishStatus').textContent = error.message; }
      return;
    }
    btn.disabled = true;
    await currentUser(); // refreshes the session token if needed
    const res = await fetch(`/api/creator-studio/takes/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token()}` }, credentials: 'same-origin' });
    if (!res.ok) { btn.disabled = false; $('polishStatus').textContent = 'Could not load that take.'; return; }
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = URL.createObjectURL(await res.blob());
    btn.replaceWith(audio);
  });
}

(async () => {
  if (!(await gate())) return;
  wireVault(); wireBeats(); wireRecorder(); wirePolish(); wireTakes();
  loadDrafts(); loadTakes();
})();
