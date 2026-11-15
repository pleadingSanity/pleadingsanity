// Creator Studio quick capture: one tap records, the take saves itself, nothing is lost offline.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createQuickCapture, pendingStore, quickTitle, formatClock, QUICK_TONES, ROLLOVER_SECONDS } from '../js/studio-quick-capture.js';

const read = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const flush = () => new Promise((r) => setImmediate(r));

class FakeRecorder {
  static made = [];
  constructor(stream, opts) { this.stream = stream; this.opts = opts; this.state = 'inactive'; this.mimeType = 'audio/webm'; FakeRecorder.made.push(this); }
  start() { this.state = 'recording'; }
  stop() { this.state = 'inactive'; this.ondataavailable({ data: new Blob(['abc'], { type: 'audio/webm' }) }); this.onstop(); }
}
function rig({ uploadFails = false, deny = false } = {}) {
  FakeRecorder.made = [];
  const uploads = [], states = [], takes = [], timers = [];
  let stopped = 0;
  const stream = { getTracks: () => [{ stop: () => { stopped++; } }] };
  const store = pendingStore(null);
  const qc = createQuickCapture({
    getUserMedia: async () => { if (deny) { const e = new Error('no'); e.name = 'NotAllowedError'; throw e; } return stream; },
    MediaRecorderImpl: FakeRecorder,
    upload: async (blob, title) => { if (uploadFails) throw new Error('offline'); uploads.push({ blob, title }); },
    store,
    now: () => new Date(2026, 10, 15, 23, 40, 5),
    onState: (s) => states.push(s),
    onTake: (blob, title) => takes.push(title),
    setTimer: (fn, ms) => { timers.push({ fn, ms }); return timers.length; },
    clearTimer: () => {},
  });
  return { qc, uploads, states, takes, timers, store, get stopped() { return stopped; } };
}

test('one tap starts, the next tap stops and the take uploads itself with a dated, tone-tagged title', async () => {
  const r = rig();
  r.qc.setTone('Sung');
  await r.qc.toggle();
  assert.equal(r.qc.state.recording, true);
  assert.equal(FakeRecorder.made[0].opts.audioBitsPerSecond, 64000);
  r.qc.toggle();
  await flush(); await flush();
  assert.equal(r.uploads.length, 1);
  assert.equal(r.uploads[0].title, 'Quick take · Sung · 15/11 23:40:05');
  assert.equal(r.stopped, 1, 'microphone released');
  assert.deepEqual(await r.store.all(), [], 'local copy removed once saved');
  assert.equal(r.takes.length, 1, 'take handed to the polish panel');
  assert.match(r.states.at(-1).message, /^Saved: Quick take/);
});

test('no connection: the take waits on the device and saves itself on retry', async () => {
  const r = rig({ uploadFails: true });
  await r.qc.start(); r.qc.stop(); await flush(); await flush();
  assert.equal((await r.store.all()).length, 1);
  assert.match(r.states.at(-1).message, /kept on this device/);
  const uploads = [];
  const again = createQuickCapture({ getUserMedia: async () => ({}), MediaRecorderImpl: FakeRecorder, upload: async (b, t) => uploads.push(t), store: r.store });
  assert.equal(await again.retryPending(), 1);
  assert.equal(uploads.length, 1);
  assert.deepEqual(await r.store.all(), []);
});

test('long sessions roll over before the upload cap; a blocked mic explains itself', async () => {
  const r = rig();
  await r.qc.start();
  assert.equal(r.timers[0].ms, ROLLOVER_SECONDS * 1000);
  assert.ok(ROLLOVER_SECONDS * 64000 / 8 < 4_500_000, 'segment fits under 4.5 MB');
  r.timers[0].fn(); await flush(); await flush();
  assert.equal(r.uploads.length, 1, 'first part saved');
  assert.equal(r.qc.state.recording, true, 'still recording');
  assert.equal(FakeRecorder.made.length, 2);
  const denied = rig({ deny: true });
  await denied.qc.start();
  assert.equal(denied.qc.state.recording, false);
  assert.ok(denied.states.some((s) => /blocked/.test(s.message || '')));
});

test('helpers and tones', () => {
  assert.equal(formatClock(75.9), '1:15');
  assert.equal(quickTitle(new Date(2026, 0, 2, 3, 4, 5), 'nope'), 'Quick take · 02/01 03:04:05');
  assert.ok(QUICK_TONES.includes('Rap'));
  const r = rig();
  assert.equal(r.qc.setTone('Low'), 'Low');
  assert.equal(r.qc.setTone('Low'), '', 'tapping again clears it');
});

test('studio page wires quick capture inside the gate, on brand, no third parties', () => {
  const html = read('creator-studio-music.html');
  const js = read('js/creator-studio-music.js');
  const quick = read('js/studio-quick-capture.js');
  const css = read('css/creator-studio-music.css');
  assert.ok(html.indexOf('id="quick"') > html.indexOf('<div id="studio" class="csm-grid" hidden>'), 'quick capture sits inside the gated studio');
  assert.match(html, /id="quickBtn"[^>]*aria-pressed="false"/);
  assert.ok(js.indexOf('wireQuick();') > js.indexOf('if (!(await gate())) return;'), 'wired only after the gate passes');
  assert.match(js, /kind', 'dry'/);
  for (const text of [quick, css, html]) {
    assert.doesNotMatch(text, /\p{Extended_Pictographic}/u);
    assert.doesNotMatch(text, /#000103|#ff4d8d|purple|indigo|violet|magenta|coral/i);
  }
  assert.doesNotMatch(quick, /https?:\/\/|fetch\(/, 'no network calls of its own');
  assert.doesNotMatch(html, /\sstyle=|<style/, 'page CSP is style-src self');
  assert.match(css, /prefers-reduced-motion:reduce/);
});
