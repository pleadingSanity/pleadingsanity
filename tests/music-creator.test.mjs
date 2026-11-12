import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { load } from 'cheerio';

const html = fs.readFileSync(new URL('../music-creator.html', import.meta.url), 'utf8');
const script = fs.readFileSync(new URL('../js/music-creator.js', import.meta.url), 'utf8');
// Media mocks verify control flow; these do not certify a real browser encoder.
function fixture({ denyMic = false, delayedMedia = false, Speech, delayedDecode = false } = {}) {
  const dom = load(html), elements = new Map(), streams = [], timers = new Map(), revoked = [], added = [];
  let urlCounter = 0, timerCounter = 0;
  const documentEvents = {}, windowEvents = {}, mediaResolvers = [], decodeResolvers = [], urlBlobs = new Map(), recorders = [], sources = [], canvases = [];
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
  const stream = () => { const track = { stopped: false, stop() { this.stopped = true; } }; const s = { track, addTrack() {}, getTracks: () => [track], getAudioTracks: () => [track] }; streams.push(s); return s; };
  class Recorder {
    static isTypeSupported() { return true; }
    constructor(s, options) { recorders.push(this); this.stream = s; this.state = 'inactive'; this.mimeType = options?.mimeType || 'audio/webm'; }
    start() { this.state = 'recording'; }
    stop() { this.state = 'inactive'; this.ondataavailable?.({ data: new Blob(['take'], { type: this.mimeType }) }); this.onstop?.(); }
  }
  const buffer = (channels = 1, length = 4, rate = 4) => { const data = Array.from({ length: channels }, () => new Float32Array(length).fill(.1)); return { numberOfChannels: channels, sampleRate: rate, length, duration: length / rate, getChannelData: c => data[c] }; };
  class Audio {
    currentTime = 0;
    async resume() {}
    async close() {}
    async decodeAudioData() { if (delayedDecode) await new Promise(resolve => decodeResolvers.push(resolve)); return buffer(); }
    createBufferSource() { const source = { connect() { return this; }, start(offset) { added.push({ offset, buffer: source.buffer, loop: source.loop }); }, stop(time) { source.stopTime = time; } }; sources.push(source); return source; }
    createMediaStreamDestination() { return { stream: stream() }; }
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
    addEventListener(name, fn) { documentEvents[name] = fn; },
    createElement: tag => {
      if (tag !== 'canvas') return new Element();
      const canvas = { width: 0, height: 0, captureStream: () => stream(), getContext: () => ({ fillRect() {}, fillText() {}, drawImage() {}, measureText: text => ({ width: text.length * 10 }), createRadialGradient: () => ({ addColorStop() {} }) }) };
      canvases.push(canvas); return canvas;
    }
  };
  const context = vm.createContext({ document, navigator: { mediaDevices: { async getUserMedia() { if (delayedMedia) await new Promise(resolve => mediaResolvers.push(resolve)); if (denyMic) throw Object.assign(new Error('denied'), { name: 'NotAllowedError' }); return stream(); } } },
    window: { AudioContext: Audio, MediaRecorder: Recorder, SpeechRecognition: Speech, addEventListener(name, fn) { windowEvents[name] = fn; } }, MediaRecorder: Recorder, OfflineAudioContext: Offline,
    HTMLCanvasElement: { prototype: { captureStream() {} } }, Blob, TextEncoder, TextDecoder, URL: { createObjectURL(blob) { const key = `blob:test-${++urlCounter}`; urlBlobs.set(key, blob); return key; }, revokeObjectURL(value) { revoked.push(value); } },
    setTimeout(fn) { const id = ++timerCounter; timers.set(id, fn); return id; }, clearTimeout(id) { timers.delete(id); }, requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}
  });
  vm.runInContext(script.replace(/\}\)\(\);\s*$/, 'globalThis.helpers = { wav, extension, buildProject, readProject, videoDuration }; })();'), context);
  return { elements, streams, revoked, added, recorders, sources, canvases, document, documentEvents, windowEvents, mediaResolvers, decodeResolvers, urlBlobs, helpers: context.helpers, el: id => elements.get(id), buffer };
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
  assert.doesNotMatch(script, /\bfetch\s*\(|XMLHttpRequest|speechSynthesis|webkitSpeechRecognition/);
});
test('media controls are labelled and the new page has no inline scripts or remote media', () => {
  const $ = load(html); $('input,textarea,select').each((_, el) => assert.equal($(`label[for="${el.attribs.id}"]`).length > 0 || $(el).closest('label').length > 0, true, el.attribs.id));
  assert.equal($('script:not([src])').length, 0); assert.equal($('audio[src],video[src]').length, 0);
});


test('a microphone permission granted after tab hide is cancelled and its tracks are stopped', async () => {
  const f = fixture({ delayedMedia: true }); const capture = f.el('recordBtn').onclick();
  f.document.hidden = true; f.documentEvents.visibilitychange(); f.document.hidden = false;
  f.mediaResolvers.shift()(); await capture;
  assert.equal(f.streams[0].track.stopped, true); assert.equal(f.el('stopBtn').disabled, true);
  assert.match(f.el('recStatus').textContent, /cancelled/);
});
test('a camera permission granted after navigation cannot reopen the camera', async () => {
  const f = fixture({ delayedMedia: true }); const capture = f.el('camBtn').onclick();
  f.windowEvents.pagehide({ persisted: false }); f.mediaResolvers.shift()(); await capture;
  assert.equal(f.streams[0].track.stopped, true); assert.equal(f.el('viewfinder').hidden, true);
});
test('browser history restore keeps blob URLs alive, normal navigation revokes them', async () => {
  const f = fixture(); await f.el('recordBtn').onclick(); f.el('stopBtn').onclick();
  f.windowEvents.pagehide({ persisted: true }); assert.equal(f.revoked.length, 0);
  f.windowEvents.pageshow(); f.windowEvents.pagehide({ persisted: false }); assert.equal(f.revoked.length, 2);
});
test('a removed beat cannot return when its delayed decode completes', async () => {
  const f = fixture({ delayedDecode: true });
  const load = f.el('beatFile').onchange({ target: { files: [new Blob(['beat'], { type: 'audio/wav' })] } });
  await new Promise(resolve => setImmediate(resolve)); f.el('clearBeatBtn').onclick();
  f.decodeResolvers.shift()(); await load;
  // A saved project must have no removed beat, even though decoding completed later.
  f.el('saveProjectBtn').onclick(); const backup = f.urlBlobs.get(f.el('projectDownload').href);
  const project = await f.helpers.readProject(backup); assert.equal(project.media.beat, undefined);
});
function speechMock(available = 'available') {
  const calls = { available: 0, install: 0, instances: [] };
  class Speech {
    static async available(options) { calls.available++; assert.equal(options.processLocally, true); return available; }
    static async install(options) { calls.install++; assert.equal(options.processLocally, true); return true; }
    constructor() { calls.instances.push(this); }
    start() { assert.equal(this.processLocally, true); this.started = true; }
    abort() { this.aborted = true; }
  }
  Speech.prototype.processLocally = false;
  return { Speech, calls };
}
test('speech stays off unless local availability is checked and the user opts in', async () => {
  const mock = speechMock(), f = fixture({ Speech: mock.Speech });
  assert.equal(mock.calls.available, 0); assert.equal(mock.calls.instances.length, 0);
  await f.el('checkSpeechBtn').onclick(); assert.equal(f.el('transcribe').disabled, false);
  f.el('transcribe').checked = true; await f.el('recordBtn').onclick();
  const speech = mock.calls.instances[0]; assert.equal(speech.started, true); assert.equal(speech.processLocally, true);
  speech.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: 'My own words' }], { isFinal: true })] });
  assert.match(f.el('lyrics').value, /My own words/); f.el('stopBtn').onclick(); assert.equal(speech.aborted, true);
});
test('unsupported local speech never falls back to remote recognition', async () => {
  class RemoteOnly { start() { throw new Error('must not run'); } }
  const f = fixture({ Speech: RemoteOnly }); await f.el('checkSpeechBtn').onclick();
  assert.equal(f.el('transcribe').disabled, true); assert.match(f.el('speechStatus').textContent, /not supported/);
});
test('downloadable speech pack is never installed automatically', async () => {
  const mock = speechMock('downloadable'), f = fixture({ Speech: mock.Speech });
  await f.el('checkSpeechBtn').onclick(); assert.equal(mock.calls.install, 0); assert.equal(f.el('transcribe').disabled, true); assert.equal(f.el('installSpeechBtn').hidden, false);
  await f.el('installSpeechBtn').onclick(); assert.equal(mock.calls.install, 1);
});
function fields() { return { trackTitle: 'My track', lyrics: 'One line\nAnother line', beatCredit: 'My own beat', beat: 'Hip-hop / laid-back', beatVolume: '.25', offset: '0', choirPlace: 'outro', visualChoice: 'cosmic' }; }
test('project backup round-trips lyrics, settings and original audio bytes without network or base64', async () => {
  const f = fixture(), media = { voice: new Blob(['original audio'], { type: 'audio/wav' }), beat: new Blob(['beat audio'], { type: 'audio/mp3' }) };
  const blob = f.helpers.buildProject(fields(), media); const result = await f.helpers.readProject(blob);
  assert.equal(result.fields.lyrics, fields().lyrics); assert.equal(await result.media.voice.text(), 'original audio'); assert.equal(await result.media.beat.text(), 'beat audio');
});
test('damaged, truncated and oversized projects are rejected before session replacement', async () => {
  const f = fixture(), good = f.helpers.buildProject(fields(), { voice: new Blob(['audio'], { type: 'audio/wav' }) });
  await assert.rejects(f.helpers.readProject(new Blob(['not a real project'])), /not a Pleading/);
  await assert.rejects(f.helpers.readProject(good.slice(0, good.size - 1)), /incomplete/);
  await assert.rejects(f.helpers.readProject({ size: 251 * 1024 * 1024 }), /under 250 MB/);
  const bad = fields(); bad.offset = '-99'; await assert.rejects(f.helpers.readProject(f.helpers.buildProject(bad, {})), /out of range/);
});
test('restoring a project resets rights and hook confirmation and permits a fresh audio mix', async () => {
  const f = fixture(), blob = f.helpers.buildProject(fields(), { voice: new Blob(['take'], { type: 'audio/wav' }), hook: new Blob(['hook'], { type: 'audio/wav' }) });
  f.el('rights').checked = true; f.el('choir').checked = true;
  await f.el('projectFile').onchange({ target: { files: [blob] } });
  assert.equal(f.el('lyrics').value, fields().lyrics); assert.equal(f.el('rights').checked, false); assert.equal(f.el('choir').checked, false);
  assert.equal(f.el('previewBtn').disabled, false); assert.equal(f.el('choir').disabled, false);
  await f.el('previewBtn').onclick(); assert.match(f.el('mixStatus').textContent, /Mix ready/);
});

async function settleUntil(predicate) { for (let i = 0; i < 20 && !predicate(); i++) await new Promise(resolve => setImmediate(resolve)); assert.ok(predicate(), 'expected asynchronous media state'); }
for (const [id, width, height] of [['genShortBtn', 720, 1280], ['genLongBtn', 1280, 720]]) {
  test(`${id} exports selected dimensions, includes audio and releases its stream`, async () => {
    const f = fixture(); await f.el('recordBtn').onclick(); f.el('stopBtn').onclick(); await f.el('previewBtn').onclick();
    const job = f.el(id).onclick(); await settleUntil(() => f.recorders.length === 2);
    const encoder = f.recorders[1]; assert.equal(encoder.state, 'recording'); assert.equal(f.canvases[0].width, width); assert.equal(f.canvases[0].height, height);
    const source = f.sources.at(-1); assert.equal(source.stopTime, 1); source.onended(); await job;
    assert.equal(f.el('videoDownload').hidden, false); assert.match(f.el('genStatus').textContent, /Video ready/); assert.equal(encoder.stream.track.stopped, true);
    assert.equal(f.el('cancelRender').hidden, true); assert.equal(f.el(id).disabled, false);
  });
}
test('cancelling a render never offers a completed download and releases all resources', async () => {
  const f = fixture(); await f.el('recordBtn').onclick(); f.el('stopBtn').onclick(); await f.el('previewBtn').onclick();
  const job = f.el('genShortBtn').onclick(); await settleUntil(() => f.recorders.length === 2); f.el('cancelRender').onclick(); await job;
  assert.equal(f.el('videoDownload').hidden, true); assert.match(f.el('genStatus').textContent, /cancelled/);
  assert.equal(f.recorders[1].stream.track.stopped, true); assert.equal(f.el('cancelRender').hidden, true);
});
test('hiding the tab cancels an in-progress render without a success message', async () => {
  const f = fixture(); await f.el('recordBtn').onclick(); f.el('stopBtn').onclick(); await f.el('previewBtn').onclick();
  const job = f.el('genLongBtn').onclick(); await settleUntil(() => f.recorders.length === 2);
  f.document.hidden = true; f.documentEvents.visibilitychange(); await job;
  assert.match(f.el('genStatus').textContent, /cancelled/); assert.equal(f.el('videoDownload').hidden, true);
});


test('WebM duration patch adds finite timing while preserving all media bytes', async () => {
  const f = fixture();
  const prefix = Buffer.from('1a45dfa39f4286810142f7810142f2810442f381084282847765626d42878104428581021853806701ffffffffffffff1549a966992ad7b1830f42404d80864368726f6d655741864368726f6d65', 'hex');
  const media = Buffer.from('1654ae6b84deadbeef1f43b67584aabbccdd', 'hex');
  const original = new Blob([prefix, media], { type: 'video/webm' });
  const fixed = await f.helpers.videoDuration(original, 90); const bytes = Buffer.from(await fixed.arrayBuffer());
  assert.equal(fixed.size, original.size + 11); assert.deepEqual(bytes.subarray(-media.length), media);
  const timing = bytes.indexOf(Buffer.from([0x44, 0x89, 0x88])); assert.ok(timing > 0); assert.equal(bytes.readDoubleBE(timing + 3), 90000);
  assert.equal(await f.helpers.videoDuration(fixed, 90), fixed, 'existing duration must not be rewritten');
});
test('WebM duration patch leaves other formats and malformed data untouched', async () => {
  const f = fixture(), mp4 = new Blob(['mp4'], { type: 'video/mp4' }), malformed = new Blob(['webm'], { type: 'video/webm' });
  assert.equal(await f.helpers.videoDuration(mp4, 10), mp4); assert.equal(await f.helpers.videoDuration(malformed, 10), malformed);
  assert.equal(await f.helpers.videoDuration(malformed, Infinity), malformed);
});
