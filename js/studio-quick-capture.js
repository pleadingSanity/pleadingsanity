// Quick capture for the private Creator Music Studio (15 Nov 2026).
// One tap starts the microphone, one tap stops, and the take saves itself:
// no title, no polish, no save button. Long sessions roll over into a new take
// before the 4.5 MB upload limit. If saving fails (no signal), the take waits in
// this device's IndexedDB and is retried on the next visit or when back online.
// No tracking, no third-party requests. Works with fakes in tests.

export const QUICK_TONES = ['Spoken', 'Sung', 'Rap', 'Low', 'High', 'Soft', 'Hook idea'];
export const ROLLOVER_SECONDS = 8 * 60; // 8 min at 64 kbps is about 3.8 MB, under the 4.5 MB cap
export const BITRATE = 64000;

export function quickTitle(date, tone) {
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  const t = QUICK_TONES.includes(tone) ? ` · ${tone}` : '';
  return `Quick take${t} · ${stamp}`.slice(0, 80);
}

export function formatClock(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Tiny IndexedDB queue. Falls back to memory when IndexedDB is missing.
export function pendingStore(idb = globalThis.indexedDB) {
  const memory = new Map();
  const open = () => new Promise((resolve, reject) => {
    const req = idb.open('ps-studio-quick', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('pending', { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  const run = async (mode, fn) => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pending', mode);
      const out = fn(tx.objectStore('pending'));
      tx.oncomplete = () => { db.close(); resolve(out && 'result' in out ? out.result : undefined); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  };
  if (!idb) {
    return {
      put: async (item) => { memory.set(item.id, item); },
      remove: async (id) => { memory.delete(id); },
      all: async () => [...memory.values()],
    };
  }
  return {
    put: (item) => run('readwrite', (s) => s.put(item)),
    remove: (id) => run('readwrite', (s) => s.delete(id)),
    all: () => run('readonly', (s) => s.getAll()).then((r) => r || []),
  };
}

export function createQuickCapture(deps) {
  const { getUserMedia, MediaRecorderImpl, upload, store, now = () => new Date(), onState = () => {}, onTake = () => {}, setTimer = setTimeout, clearTimer = clearTimeout, pickMime = () => '' } = deps;
  const s = { recording: false, busy: false, stream: null, recorder: null, chunks: [], startedAt: 0, tone: '', rollTimer: null, saved: 0, waiting: 0 };
  const emit = (message) => onState({ recording: s.recording, busy: s.busy, saved: s.saved, waiting: s.waiting, startedAt: s.startedAt, stream: s.stream, message });

  async function save(blob, startedAt) {
    const item = { id: `q-${startedAt.getTime()}-${Math.random().toString(36).slice(2, 7)}`, title: quickTitle(startedAt, s.tone), blob, at: startedAt.toISOString() };
    try { await store.put(item); } catch { /* the upload still runs */ }
    try {
      await upload(blob, item.title);
      s.saved++;
      try { await store.remove(item.id); } catch { /* harmless: it is retried and saved twice at worst */ }
      emit(`Saved: ${item.title}`);
    } catch {
      s.waiting++;
      emit('No connection to the studio just now. The take is kept on this device and will save itself later.');
    }
    onTake(blob, item.title);
  }

  function beginSegment() {
    const mime = pickMime();
    const opts = mime ? { mimeType: mime, audioBitsPerSecond: BITRATE } : { audioBitsPerSecond: BITRATE };
    const rec = new MediaRecorderImpl(s.stream, opts);
    const startedAt = now();
    const chunks = [];
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      if (!chunks.length) return;
      save(new Blob(chunks, { type: rec.mimeType || mime || 'audio/webm' }), startedAt);
    };
    rec.start(1000);
    s.recorder = rec;
    s.startedAt = startedAt.getTime();
    clearTimer(s.rollTimer);
    s.rollTimer = setTimer(() => { if (s.recording) { rec.stop(); beginSegment(); emit('Long take: saved the first part and kept recording.'); } }, ROLLOVER_SECONDS * 1000);
  }

  async function start() {
    if (s.recording || s.busy) return;
    s.busy = true; emit('Opening the microphone…');
    try {
      s.stream = await getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } });
      s.recording = true;
      beginSegment();
      emit('Recording. Tap again to stop. It saves itself.');
    } catch (error) {
      s.stream = null;
      emit(error && error.name === 'NotAllowedError' ? 'Microphone access was blocked. Allow it for this site and tap again.' : 'Could not start the microphone.');
    } finally {
      s.busy = false; emit();
    }
  }

  function stop() {
    if (!s.recording) return;
    s.recording = false;
    clearTimer(s.rollTimer);
    try { if (s.recorder && s.recorder.state !== 'inactive') s.recorder.stop(); } catch { /* already stopped */ }
    try { s.stream && s.stream.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
    s.stream = null;
    emit('Saving your take…');
  }

  async function retryPending() {
    let items = [];
    try { items = await store.all(); } catch { return 0; }
    let done = 0;
    for (const item of items) {
      try { await upload(item.blob, item.title); await store.remove(item.id); done++; s.saved++; } catch { break; }
    }
    s.waiting = Math.max(0, items.length - done);
    if (done) emit(`Saved ${done} take${done === 1 ? '' : 's'} that were waiting on this device.`);
    return done;
  }

  return {
    toggle: () => (s.recording ? stop() : start()),
    start, stop, retryPending,
    setTone: (tone) => { s.tone = QUICK_TONES.includes(tone) && s.tone !== tone ? tone : ''; return s.tone; },
    get state() { return { ...s }; },
  };
}
