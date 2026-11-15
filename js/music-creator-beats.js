/* Original Pleading Sanity synthesized backing loops. No samples, vocals, downloads
   or artist recordings. Generated audio may be used in your own music/videos,
   including commercial releases, without attribution. Non-exclusive; no guarantee
   against platform claims. This permission does not cover imported third-party files. */
(function (root) {
  'use strict';
  const presets = Object.freeze([
    { name: 'Night Drive', bpm: 92, kicks: [0, 6, 8, 11], hats: 2, bass: [36, 39, 34, 41] },
    { name: 'Leicester After Dark', bpm: 78, kicks: [0, 7, 10], hats: 2, bass: [33, 36, 31, 38] },
    { name: 'Stand Again', bpm: 78, kicks: [0, 8, 11], hats: 4, bass: [36, 32, 39, 34], pad: true },
    { name: 'Concrete Steps', bpm: 86, kicks: [0, 3, 8, 10], hats: 2, bass: [38, 41, 36, 33] },
    { name: 'No Looking Back', bpm: 96, kicks: [0, 6, 8, 14], hats: 1, bass: [35, 38, 33, 40] },
    { name: 'Garage Lights', bpm: 130, kicks: [0, 7, 10], hats: 2, bass: [36, 39, 34, 31], swing: .17 },
    { name: 'First Light', bpm: 124, kicks: [0, 4, 8, 12], hats: 2, bass: [33, 36, 40, 38], dance: true }
  ].map(p => Object.freeze({ ...p, kicks: Object.freeze(p.kicks), bass: Object.freeze(p.bass) })));
  function create(presetIndex) {
    if (!Number.isInteger(presetIndex) || !presets[presetIndex]) throw new Error('Choose one of the seven studio beats.');
    const preset = presets[presetIndex], rate = 22050, step = 60 / preset.bpm / 4;
    const frames = Math.round(step * 16 * 8 * rate), data = new Float32Array(frames);
    let seed = 8917 + presetIndex * 739;
    function noise() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2147483648 - 1; }
    function add(time, duration, sample) {
      const start = Math.round(time * rate), length = Math.round(duration * rate);
      for (let i = 0; i < length; i++) {
        // Wrapping drum tails into the start preserves the steady eight-bar loop.
        data[(start + i) % frames] += sample(i / rate, i / length);
      }
    }
    function kick(time) { add(time, .28, t => .7 * Math.sin(2 * Math.PI * (46 * t + 7 * (1 - Math.exp(-32 * t)))) * Math.exp(-19 * t) * Math.min(1, t * 1500)); }
    function snare(time) { add(time, .15, t => (.22 * noise() + .10 * Math.sin(2 * Math.PI * 175 * t)) * Math.exp(-30 * t) * Math.min(1, t * 1800)); }
    function hat(time, open) {
      let previous = 0;
      add(time, open ? .13 : .045, t => { const n = noise(), high = n - previous; previous = n; return high * .055 * Math.exp(-t * (open ? 35 : 105)) * Math.min(1, t * 2200); });
    }
    function bass(time, note, length) {
      const frequency = 440 * 2 ** ((note - 69) / 12);
      add(time, length, (t, progress) => .19 * (Math.sin(2 * Math.PI * frequency * t) + .12 * Math.sin(4 * Math.PI * frequency * t)) * Math.min(1, t * 80) * Math.min(1, (1 - progress) * 18) * Math.exp(-t * 1.4));
    }
    for (let bar = 0; bar < 8; bar++) {
      const start = bar * 16 * step;
      for (const s of preset.kicks) kick(start + s * step);
      for (const s of [4, 12]) snare(start + s * step);
      for (let s = 0; s < 16; s += preset.hats) hat(start + (s + (s % 4 === 2 ? preset.swing || 0 : 0)) * step, preset.dance && s % 4 === 2);
      const note = preset.bass[bar % preset.bass.length];
      for (const s of preset.dance ? [0, 4, 8, 12] : [0, 6, 10]) bass(start + s * step, note, step * (preset.dance ? 2.5 : 3.5));
      if (preset.pad) for (const interval of [12, 15, 19]) {
        const frequency = 440 * 2 ** ((note + interval - 69) / 12);
        add(start, 16 * step, (t, progress) => .025 * Math.sin(2 * Math.PI * frequency * t) * Math.sin(Math.PI * progress) ** 2);
      }
    }
    let peak = 0; for (const sample of data) peak = Math.max(peak, Math.abs(sample));
    const gain = peak > 0 ? .82 / peak : 1;
    const bytes = new ArrayBuffer(44 + frames * 2), view = new DataView(bytes);
    function text(offset, value) { for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i)); }
    text(0, 'RIFF'); view.setUint32(4, bytes.byteLength - 8, true); text(8, 'WAVE'); text(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    text(36, 'data'); view.setUint32(40, frames * 2, true);
    for (let i = 0; i < frames; i++) view.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, data[i] * gain)) * 32767), true);
    return { blob: new Blob([bytes], { type: 'audio/wav' }), name: preset.name, bpm: preset.bpm, duration: frames / rate };
  }
  root.PSStudioBeats = Object.freeze({ presets, create });
})(typeof window === 'undefined' ? globalThis : window);
