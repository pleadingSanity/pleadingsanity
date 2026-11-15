/* Pleading Sanity vocal polish. Runs entirely in the browser with the Web Audio API.
   No paid service, no network, no voice cloning: it only cleans up the voice you recorded.
   Chain: noise gate + high-pass cleanup, compression, presence EQ, light reverb and delay,
   optional gentle pitch correction (snaps toward the nearest semitone). */
(function (root) {
  'use strict';

  const DEFAULTS = Object.freeze({ cleanup: true, compress: true, eq: true, space: true, tune: false, tuneStrength: 0.6, bpm: 138 });

  // ─── NOISE GATE (buffer level) ───
  // Envelope follower; quiet passages between phrases (room hiss, breaths, headphone bleed)
  // are pulled down smoothly instead of chopped.
  function noiseGate(data, rate, opts = {}) {
    const thresholdDb = opts.thresholdDb ?? -48, floorDb = opts.floorDb ?? -30;
    const attack = Math.exp(-1 / ((opts.attackMs ?? 4) / 1000 * rate));
    const release = Math.exp(-1 / ((opts.releaseMs ?? 140) / 1000 * rate));
    const threshold = 10 ** (thresholdDb / 20), floor = 10 ** (floorDb / 20);
    const out = new Float32Array(data.length);
    let env = 0, gain = floor;
    for (let i = 0; i < data.length; i++) {
      const level = Math.abs(data[i]);
      env = level > env ? level + attack * (env - level) : level + release * (env - level);
      const target = env >= threshold ? 1 : floor;
      gain = target > gain ? target + attack * (gain - target) : target + release * (gain - target);
      out[i] = data[i] * gain;
    }
    return out;
  }

  // ─── PITCH ───
  // Normalised autocorrelation on a frame; returns Hz, or 0 when the frame is unvoiced.
  function detectPitch(frame, rate, minHz = 70, maxHz = 1000) {
    const n = frame.length;
    let energy = 0;
    for (let i = 0; i < n; i++) energy += frame[i] * frame[i];
    if (energy / n < 1e-5) return 0;
    const minLag = Math.max(2, Math.floor(rate / maxHz)), maxLag = Math.min(n - 2, Math.ceil(rate / minHz));
    const corr = new Float32Array(maxLag + 2);
    let bestLag = 0, best = 0;
    for (let lag = minLag; lag <= maxLag + 1; lag++) {
      let sum = 0, e1 = 0, e2 = 0;
      for (let i = 0; i + lag < n; i++) { sum += frame[i] * frame[i + lag]; e1 += frame[i] * frame[i]; e2 += frame[i + lag] * frame[i + lag]; }
      corr[lag] = e1 && e2 ? sum / Math.sqrt(e1 * e2) : 0;
    }
    // First strong peak avoids octave-down errors.
    let peak = 0;
    for (let lag = minLag; lag <= maxLag; lag++) peak = Math.max(peak, corr[lag]);
    if (peak < 0.6) return 0;
    for (let lag = minLag + 1; lag <= maxLag; lag++) {
      if (corr[lag] >= 0.9 * peak && corr[lag] >= corr[lag - 1] && corr[lag] >= corr[lag + 1]) { bestLag = lag; best = corr[lag]; break; }
    }
    if (!bestLag) return 0;
    const a = corr[bestLag - 1], b = best, c = corr[bestLag + 1], d = a - 2 * b + c;
    const shift = d ? 0.5 * (a - c) / d : 0;
    return rate / (bestLag + shift);
  }

  const nearestNoteHz = (hz) => (hz > 0 ? 440 * 2 ** (Math.round(12 * Math.log2(hz / 440)) / 12) : 0);

  // Time-preserving granular pitch correction. Each overlapping Hann grain is resampled by the
  // ratio that moves its detected pitch toward the nearest semitone. Kept gentle on purpose:
  // ratios are limited to about one semitone and unvoiced grains pass straight through.
  function pitchCorrect(data, rate, opts = {}) {
    const strength = Math.min(1, Math.max(0, opts.strength ?? 0.6));
    const size = rate > 30000 ? 2048 : 1024, hop = size / 4, half = size / 2, dec = rate > 30000 ? 4 : 2;
    const win = new Float32Array(size);
    for (let i = 0; i < size; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / size);
    const out = new Float32Array(data.length), norm = new Float32Array(data.length);
    const small = new Float32Array(size / dec);
    let smooth = 1, anchor = 0;
    for (let start = -half; start < data.length; start += hop) {
      for (let j = 0; j < small.length; j++) {
        let s = 0; for (let k = 0; k < dec; k++) { const idx = start + j * dec + k; s += idx >= 0 && idx < data.length ? data[idx] : 0; }
        small[j] = s / dec;
      }
      const hz = detectPitch(small, rate / dec);
      let ratio = 1;
      if (hz) ratio = Math.min(1.06, Math.max(0.944, (nearestNoteHz(hz) / hz) ** strength));
      smooth = smooth * 0.5 + ratio * 0.5;
      const centre = start + half;
      // Keep the source anchor phase-continuous (advance by hop * ratio), slipping by whole
      // pitch periods when it drifts from real time. Unvoiced grains snap back to real time.
      anchor += hop * smooth;
      if (!hz) { anchor = centre; smooth = 1; } else {
        const period = rate / hz, drift = centre - anchor;
        if (Math.abs(drift) > period / 2) anchor += Math.round(drift / period) * period;
      }
      for (let i = 0; i < size; i++) {
        const o = start + i;
        if (o < 0 || o >= data.length) continue;
        const src = anchor + (i - half) * smooth, i0 = Math.floor(src), f = src - i0;
        const s0 = i0 >= 0 && i0 < data.length ? data[i0] : 0, s1 = i0 + 1 >= 0 && i0 + 1 < data.length ? data[i0 + 1] : 0;
        out[o] += win[i] * (s0 + (s1 - s0) * f);
        norm[o] += win[i];
      }
    }
    for (let i = 0; i < out.length; i++) out[i] = norm[i] > 1e-3 ? out[i] / norm[i] : data[i];
    return out;
  }

  // ─── WEB AUDIO CHAIN ───
  function impulse(ctx, seconds = 1.6, decay = 3.2) {
    const length = Math.round(ctx.sampleRate * seconds), ir = ctx.createBuffer(2, length, ctx.sampleRate);
    let seed = 20261115;
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < length; i++) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; d[i] = (seed / 2147483648 - 1) * (1 - i / length) ** decay; }
    }
    return ir;
  }

  // Wires input -> polish -> returns the output node (connect it where you like).
  function buildChain(ctx, input, options = {}) {
    const o = { ...DEFAULTS, ...options };
    let node = input;
    const link = (next) => { node.connect(next); node = next; return next; };
    if (o.cleanup) {
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 90; hp.Q.value = 0.7; link(hp);
    }
    if (o.eq) {
      const mud = ctx.createBiquadFilter(); mud.type = 'peaking'; mud.frequency.value = 300; mud.Q.value = 1; mud.gain.value = -2.5; link(mud);
    }
    if (o.compress) {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -22; comp.knee.value = 8; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.16; link(comp);
      const makeup = ctx.createGain(); makeup.gain.value = 1.6; link(makeup);
    }
    if (o.eq) {
      const presence = ctx.createBiquadFilter(); presence.type = 'peaking'; presence.frequency.value = 3200; presence.Q.value = 0.9; presence.gain.value = 4; link(presence);
      const air = ctx.createBiquadFilter(); air.type = 'highshelf'; air.frequency.value = 10000; air.gain.value = 2.5; link(air);
    }
    const bus = ctx.createGain();
    node.connect(bus);
    if (o.space) {
      const verb = ctx.createConvolver(); verb.buffer = impulse(ctx);
      const verbWet = ctx.createGain(); verbWet.gain.value = 0.14;
      node.connect(verb); verb.connect(verbWet); verbWet.connect(bus);
      const delay = ctx.createDelay(2); delay.delayTime.value = Math.min(1.9, (60 / (o.bpm || 138)) * 0.75);
      const feedback = ctx.createGain(); feedback.gain.value = 0.24;
      const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 4200;
      const delayWet = ctx.createGain(); delayWet.gain.value = 0.1;
      node.connect(delay); delay.connect(tone); tone.connect(feedback); feedback.connect(delay); tone.connect(delayWet); delayWet.connect(bus);
    }
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -2; limiter.knee.value = 0; limiter.ratio.value = 20; limiter.attack.value = 0.001; limiter.release.value = 0.08;
    bus.connect(limiter);
    return limiter;
  }

  // Buffer-level steps (gate, tuning) before the graph. Returns a mono Float32Array.
  function prepare(buffer, options = {}) {
    const o = { ...DEFAULTS, ...options };
    const rate = buffer.sampleRate, chans = buffer.numberOfChannels;
    let mono = new Float32Array(buffer.length);
    for (let ch = 0; ch < chans; ch++) { const d = buffer.getChannelData(ch); for (let i = 0; i < d.length; i++) mono[i] += d[i] / chans; }
    if (o.cleanup) mono = noiseGate(mono, rate);
    if (o.tune) mono = pitchCorrect(mono, rate, { strength: o.tuneStrength });
    return mono;
  }

  // Offline render: polished voice, optionally with the beat underneath (for a rough mix).
  async function render(buffer, options = {}) {
    const o = { ...DEFAULTS, ...options };
    const rate = o.sampleRate || buffer.sampleRate;
    const tail = o.space ? 2.5 : 0.2;
    const length = Math.ceil((buffer.duration + tail) * rate);
    const Offline = root.OfflineAudioContext || root.webkitOfflineAudioContext;
    const ctx = new Offline(2, length, rate);
    const voiceData = prepare(buffer, o);
    const voice = ctx.createBuffer(1, voiceData.length, buffer.sampleRate);
    voice.copyToChannel(voiceData, 0);
    const src = ctx.createBufferSource(); src.buffer = voice;
    buildChain(ctx, src, o).connect(ctx.destination);
    if (o.beatBuffer) {
      const beat = ctx.createBufferSource(); beat.buffer = o.beatBuffer; beat.loop = true; beat.playbackRate.value = o.beatRate || 1;
      const g = ctx.createGain(); g.gain.value = o.beatGain ?? 0.55; beat.connect(g); g.connect(ctx.destination);
      beat.start(0); beat.stop(buffer.duration + 0.05);
    }
    src.start(0);
    return ctx.startRendering();
  }

  // 16-bit PCM WAV. Down-mixes to mono and resamples (linear) when a lower rate is asked for.
  function encodeWav(buffer, { sampleRate, mono = false } = {}) {
    const inRate = buffer.sampleRate, outRate = sampleRate || inRate;
    const chans = mono ? 1 : buffer.numberOfChannels;
    const src = [];
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) src.push(buffer.getChannelData(ch));
    const frames = Math.floor(buffer.length * outRate / inRate);
    const bytes = new ArrayBuffer(44 + frames * chans * 2), view = new DataView(bytes);
    const text = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
    text(0, 'RIFF'); view.setUint32(4, bytes.byteLength - 8, true); text(8, 'WAVE'); text(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, chans, true);
    view.setUint32(24, outRate, true); view.setUint32(28, outRate * chans * 2, true); view.setUint16(32, chans * 2, true); view.setUint16(34, 16, true);
    text(36, 'data'); view.setUint32(40, frames * chans * 2, true);
    const read = (data, pos) => { const i = Math.floor(pos), f = pos - i; const a = data[i] || 0, b = data[i + 1] ?? a; return a + (b - a) * f; };
    let p = 44;
    for (let i = 0; i < frames; i++) {
      const pos = i * inRate / outRate;
      for (let ch = 0; ch < chans; ch++) {
        let v;
        if (mono) { v = 0; for (const d of src) v += read(d, pos) / src.length; } else v = read(src[ch], pos);
        view.setInt16(p, Math.round(Math.max(-1, Math.min(1, v)) * 32767), true); p += 2;
      }
    }
    return new Blob([bytes], { type: 'audio/wav' });
  }

  root.PSVocalPolish = Object.freeze({ DEFAULTS, noiseGate, detectPitch, nearestNoteHz, pitchCorrect, buildChain, prepare, render, encodeWav });
})(typeof window === 'undefined' ? globalThis : window);
