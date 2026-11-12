import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { load } from 'cheerio';

const html = fs.readFileSync(new URL('../music-creator.html', import.meta.url), 'utf8');
const script = fs.readFileSync(new URL('../js/music-creator.js', import.meta.url), 'utf8');
// Media mocks verify control flow; these do not certify a real browser encoder.
function fixture({ denyMic = false } = {}) {
  const dom = load(html), elements = new Map(), streams = [], timers = new Map(), revoked = [], added = [];
  let urlCounter = 0, timerCounter = 0;
  class Element {
    constructor(id = '') { this.id = id; this.hidden = false; this.disabled = false; this.checked = false; this.value = ''; this.dataset = {}; this.handlers = {}; }
    addEventListener(name, fn) { this.handlers[name] = fn; }
    removeAttribute(key) { delete this[key]; }
    pause() {}
    async play() {}
    replaceChildren(...items) { this.children = items; }
    querySelector(selector) { return elements.get(`${this.id}:${selector}`) || new Element(); }
  }
  dom('[id]').each((_, node) => {
    const el = new Element(node.attribs.id); el.disabled = 'disabled' in node.attribs; el.hidden = 'hidden' in node.attribs; el.value = dom(node).val() || '';
    elements.set(el.id, el);
  });
  const stream = () => { const track = { stopped: false, stop() { this.stopped = true; } }; const s = { track, getTracks: () => [track], getAudioTracks: () => [track] }; streams.push(s); return s; };
  class Recorder {
    static isTypeSupported() { return true; }
    constructor(s, options) { this.stream = s; this.state = 'inactive'; this.mimeType = options?.mimeType || 'audio/webm'; }
    start() { this.state = 'recording'; }
    stop() { this.state = 'inactive'; this.ondataavailable?.({ data: new Blob(['take'], { type: this.mimeType }) }); this.onstop?.(); }
  }
  const buffer = (channels = 1, length = 4, rate = 4) => { const data = Array.from({ length: channels }, () => new Float32Array(length).fill(.1)); return { numberOfChannels: channels, sampleRate: rate, length, duration: length / rate, getChannelData: c => data[c] }; };
  class Audio {
    currentTime = 0;
    async resume() {}
    async close() {}
    async decodeAudioData() { return buffer(); }
    createBufferSource() { const source = { connect() { return this; }, start(offset) { added.push({ offset, buffer: source.buffer, loop: source.loop }); }, stop() {} }; return source; }
    createGain() { return { gain: { value: 0 }, connect() { return this; } }; }
    createMediaStreamSource() { return { connect() {} }; }
    createAnalyser() { return { fftSize: 4, getFloatTimeDomainData() {} }; }
  }
  class Offline extends Audio {
    constructor(channels, length, rate) { super(); this.buffer = buffer(channels, length, rate); }
    async startRendering() { return this.buffer; }
  }
  const document = {
    getElementById: id => elements.get(id),
    querySelectorAll: () => [...elements.values()].filter(el => dom(`#${el.id}`).is('button,input,textarea,select')),
    addEventListener() {},
    createElement: () => new Element()
  };
  const context = vm.createContext({ document, navigator: { mediaDevices: { async getUserMedia() { if (denyMic) throw Object.assign(new Error('denied'), { name: 'NotAllowedError' }); return stream(); } } },
    window: { AudioContext: Audio, MediaRecorder: Recorder, addEventListener() {} }, MediaRecorder: Recorder, OfflineAudioContext: Offline,
    HTMLCanvasElement: { prototype: { captureStream() {} } }, Blob, URL: { createObjectURL() { return `blob:test-${++urlCounter}`; }, revokeObjectURL(value) { revoked.push(value); } },
    setTimeout(fn) { const id = ++timerCounter; timers.set(id, fn); return id; }, clearTimeout(id) { timers.delete(id); }, requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}
  });
  vm.runInContext(script.replace(/\}\)\(\);\s*$/, 'globalThis.helpers = { wav, extension }; })();'), context);
  return { elements, streams, revoked, added, helpers: context.helpers, el: id => elements.get(id), buffer };
}

test('voice recording releases microphone tracks and produces a local download', async () => {
  const f = fixture(); await f.el('recordBtn').onclick();
  assert.equal(f.el('stopBtn').disabled, false); f.el('stopBtn').onclick();
  assert.equal(f.streams[0].track.stopped, true);
  assert.match(f.el('playback').src, /^blob:/); assert.equal(f.el('voiceDownload').hidden, false);
  assert.equal(f.el('recordBtn').disabled, false);
});
test('permission denial leaves capture recoverable and explains file import', async () => {
  const f = fixture({ denyMic: true }); await f.el('recordBtn').onclick();
  assert.equal(f.el('recordBtn').disabled, false); assert.match(f.el('recStatus').textContent, /import a file/);
});
test('closing camera stops every camera track and hides live preview', async () => {
  const f = fixture(); await f.el('camBtn').onclick(); f.el('closeCamBtn').onclick();
  assert.equal(f.streams[0].track.stopped, true); assert.equal(f.el('viewfinder').hidden, true);
});
test('starting a fresh take invalidates a previous export rather than reusing its audio', async () => {
  const f = fixture(); await f.el('recordBtn').onclick(); f.el('stopBtn').onclick(); await f.el('previewBtn').onclick();
  assert.equal(f.el('genShortBtn').disabled, false);
  await f.el('recordBtn').onclick(); assert.equal(f.el('genShortBtn').disabled, true); f.el('stopBtn').onclick();
});
test('imported beats cannot be mixed without rights confirmation; confirmation permits local mixing', async () => {
  const f = fixture(); await f.el('recordBtn').onclick(); f.el('stopBtn').onclick();
  await f.el('beatFile').onchange({ target: { files: [new Blob(['beat'], { type: 'audio/wav' })] } });
  await f.el('previewBtn').onclick(); assert.match(f.el('mixStatus').textContent, /Confirm permission/); assert.equal(f.added.length, 0);
  f.el('rights').checked = true; await f.el('previewBtn').onclick(); assert.match(f.el('mixStatus').textContent, /Mix ready/);
  assert.equal(f.added.length, 2); assert.equal(f.added[1].loop, true);
});
test('audio preview respects voice offset and revokes stale object URLs', async () => {
  const f = fixture(); await f.el('recordBtn').onclick(); f.el('stopBtn').onclick(); f.el('offset').value = '1.5';
  await f.el('previewBtn').onclick(); assert.equal(f.added[0].offset, 1.5);
  f.el('offset').handlers.input(); assert.equal(f.el('genLongBtn').disabled, true); assert.ok(f.revoked.length >= 2);
});
test('invalid offsets cannot reach audio rendering', async () => {
  const f = fixture(); await f.el('recordBtn').onclick(); f.el('stopBtn').onclick(); f.el('offset').value = '-1';
  await f.el('previewBtn').onclick(); assert.match(f.el('mixStatus').textContent, /between 0 and 10/); assert.equal(f.added.length, 0);
});
test('WAV download has correct PCM header, stereo interleaving and clipped sample bounds', async () => {
  const f = fixture(), buffer = f.buffer(2, 2, 44100); buffer.getChannelData(0).set([-2, 2]); buffer.getChannelData(1).set([.5, -.5]);
  const bytes = await f.helpers.wav(buffer).arrayBuffer(), view = new DataView(bytes);
  assert.equal(Buffer.from(bytes).subarray(0, 4).toString(), 'RIFF'); assert.equal(view.getUint16(22, true), 2); assert.equal(view.getUint32(24, true), 44100);
  assert.equal(view.getUint32(40, true), 8); assert.equal(view.getInt16(44, true), -32768); assert.equal(view.getInt16(48, true), 32767);
});
test('demo preserves the provided lyrics, metadata uses text, and recording requires no network', () => {
  const f = fixture(); f.el('demoBtn').onclick(); assert.match(f.el('lyrics').value, /I'm ready to stand for what I believe/); assert.match(f.el('lyrics').value, /kids are safe with me/);
  f.el('metadataBtn').onclick(); assert.match(f.el('metadata').value, /Inside The War/);
  assert.doesNotMatch(script, /\bfetch\s*\(|XMLHttpRequest|SpeechRecognition|speechSynthesis/);
});
test('media controls are labelled and the new page has no inline scripts or remote media', () => {
  const $ = load(html); $('input,textarea,select').each((_, el) => assert.equal($(`label[for="${el.attribs.id}"]`).length > 0 || $(el).closest('label').length > 0, true, el.attribs.id));
  assert.equal($('script:not([src])').length, 0); assert.equal($('audio[src],video[src]').length, 0);
});
