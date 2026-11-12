/* Pleading Sanity Music Creator: local media only, no uploads or paid calls. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const urls = new Map();
  let voice = null, beat = null, hook = null, photo = null, clip = null, mix = null;
  let voiceRecorder = null, videoRecorder = null, micStream = null, cameraStream = null;
  let pendingMic = false, pendingCamera = false, leaving = false, renderCancel = null, busy = false;
  let micContext = null, meterFrame = 0, recordTimer = 0, videoTimer = 0;
  let mixRevision = 0, captureEpoch = 0, pendingImports = 0, speech = null, speechReady = false, finishingVoice = false, finishingVideo = false;
  const importRevisions = { beat: 0, hook: 0 };
  const PROJECT_LIMIT = 250 * 1024 * 1024;
  const PROJECT_FIELDS = ['trackTitle', 'lyrics', 'beatCredit', 'beat', 'beatVolume', 'offset', 'choirPlace', 'visualChoice'];
  function capturing() { return pendingMic || pendingCamera || finishingVoice || finishingVideo || voiceRecorder?.state === 'recording' || videoRecorder?.state === 'recording'; }
  function projectDirty() { $('projectDownload').hidden = true; revoke('project'); }
  function stopSpeech() {
    const active = speech; speech = null;
    if (active) { message('speechStatus', 'Local transcription off. Review the words captured in your lyrics.'); active.onresult = null; active.onerror = null; active.onend = null; try { active.abort(); } catch { /* Already ended. */ } }
  }
  function localSpeechConstructor() {
    const Speech = window.SpeechRecognition;
    return Speech && typeof Speech.available === 'function' && 'processLocally' in Speech.prototype ? Speech : null;
  }
  async function checkSpeech() {
    if (capturing() || busy) { message('speechStatus', 'Stop recording or rendering before checking transcription.'); return; }
    speechReady = false; $('transcribe').checked = false; $('transcribe').disabled = true; $('installSpeechBtn').hidden = true;
    const Speech = localSpeechConstructor();
    if (!Speech) { message('speechStatus', 'Local transcription is not supported by this browser. Recording and manual lyrics still work.'); return; }
    try {
      const available = await Speech.available({ langs: ['en-GB'], processLocally: true });
      speechReady = available === 'available'; $('transcribe').disabled = !speechReady;
      $('installSpeechBtn').hidden = available !== 'downloadable' || typeof Speech.install !== 'function';
      message('speechStatus', speechReady ? 'Local English (UK) ready. Tick the option for your next take.' : available === 'downloadable' ? 'A browser language pack is needed. Download only if you want to use internet data for it.' : 'Local English (UK) is unavailable or still downloading. Use manual lyrics for now.');
    } catch { message('speechStatus', 'Local transcription check failed. No cloud service was started.'); }
  }
  $('checkSpeechBtn').onclick = checkSpeech;
  $('installSpeechBtn').onclick = async () => {
    const Speech = localSpeechConstructor(); if (!Speech || typeof Speech.install !== 'function' || capturing() || busy) return;
    $('installSpeechBtn').disabled = true; message('speechStatus', 'Asking your browser to download the English (UK) pack…');
    try { await Speech.install({ langs: ['en-GB'], processLocally: true }); await checkSpeech(); }
    catch { message('speechStatus', 'Language pack could not be installed. Recording still works without transcription.'); }
    finally { $('installSpeechBtn').disabled = false; }
  };
  function startSpeech() {
    if (!$('transcribe').checked || !speechReady) return;
    const Speech = localSpeechConstructor(); if (!Speech) return;
    try {
      stopSpeech(); const active = new Speech();
      active.processLocally = true;
      if (active.processLocally !== true) throw new Error('Local processing could not be enabled.');
      active.lang = 'en-GB'; active.continuous = true; active.interimResults = false; speech = active;
      active.onresult = event => {
        if (speech !== active || leaving || document.hidden) return;
        for (let i = event.resultIndex; i < event.results.length; i++) if (event.results[i].isFinal) {
          const text = event.results[i][0].transcript.trim();
          if (text) { $('lyrics').value = ($('lyrics').value.trimEnd() + '\n' + text).trimStart(); projectDirty(); }
        }
        message('speechStatus', 'Local transcript added to your lyrics. Review every line.');
      };
      active.onerror = () => { if (speech === active) { stopSpeech(); message('speechStatus', 'Local transcription stopped. Your voice recording continues; type or edit the lyrics manually.'); } };
      active.onend = () => { if (speech === active) { speech = null; message('speechStatus', 'Local transcription ended. Review the words captured; recording is controlled separately.'); } };
      active.start(); message('speechStatus', 'Transcribing this take on-device. Check the lyrics after recording.');
    } catch { stopSpeech(); message('speechStatus', 'Local transcription could not start. Your recording is still available; there is no cloud fallback.'); }
  }
  $('transcribe').addEventListener('change', () => { if (!$('transcribe').checked) stopSpeech(); });
  const MAX_BYTES = 100 * 1024 * 1024;
  const audioContext = () => new (window.AudioContext || window.webkitAudioContext)();
  const message = (id, value) => { $(id).textContent = value; };
  const stopTracks = stream => stream?.getTracks().forEach(track => track.stop());
  function revoke(key) { if (urls.has(key)) URL.revokeObjectURL(urls.get(key)); urls.delete(key); }
  function url(key, blob) { revoke(key); const value = URL.createObjectURL(blob); urls.set(key, value); return value; }
  function mediaSource(element, value) {
    if (!['AUDIO', 'VIDEO', 'IMG'].includes(element.tagName) || !value?.startsWith('blob:')) throw new Error('Invalid local media preview.');
    element.setAttribute('src', value);
  }
  function extension(type) {
    if (type.includes('wav')) return 'wav';
    if (type.includes('mpeg')) return 'mp3';
    if (type.includes('png')) return 'png';
    if (type.includes('jpeg')) return 'jpg';
    if (type.includes('webp')) return 'webp';
    if (type.includes('mp4')) return type.startsWith('audio/') ? 'm4a' : 'mp4';
    return type.includes('ogg') ? 'ogg' : 'webm';
  }
  function download(id, key, blob, name) {
    const link = $(id);
    if (link.tagName !== 'A') throw new Error('Invalid download control.');
    link.setAttribute('href', url(key, blob)); link.download = name; link.hidden = false;
  }
  function mime(kind) {
    const options = kind === 'audio' ? ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'] : ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    return options.find(type => window.MediaRecorder?.isTypeSupported(type)) || '';
  }
  function recorder(stream, kind) {
    if (!window.MediaRecorder) throw new Error('This browser cannot record. Import a recording instead.');
    const type = mime(kind);
    return new MediaRecorder(stream, type ? { mimeType: type } : undefined);
  }
  function explain(error) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') return 'Permission was not granted. Allow access in browser site settings, or import a file.';
    if (error.name === 'NotFoundError') return 'No device found. Connect a microphone / camera, or import a file.';
    return error.message || 'That did not work. Try again or import a file.';
  }
  function invalidate() {
    projectDirty(); mixRevision++; mix = null;
    $('mixPlayback').pause(); $('mixPlayback').removeAttribute('src'); $('mixPlayback').hidden = true;
    $('mixDownload').hidden = true; revoke('mix'); revoke('mixDownload');
    $('genShortBtn').disabled = true; $('genLongBtn').disabled = true;
    $('finalPreview').pause(); $('finalPreview').removeAttribute('src'); $('finalPreview').hidden = true;
    $('videoDownload').hidden = true; revoke('final'); revoke('finalDownload');
    message('mixStatus', voice ? 'Your mix changed. Build a fresh preview.' : 'Record or import your voice first.');
    message('genStatus', 'Build and listen to your audio preview first.');
  }
  function lock(value) {
    busy = value;
    document.querySelectorAll('.mc-card button, .mc-card input, .mc-card textarea, .mc-card select').forEach(el => {
      if (el.id === 'cancelRender') return;
      if (value) { el.dataset.wasDisabled = String(el.disabled); el.disabled = true; }
      else { el.disabled = el.dataset.wasDisabled === 'true'; delete el.dataset.wasDisabled; }
    });
  }
  async function decode(blob, context) {
    const buffer = await context.decodeAudioData(await blob.arrayBuffer());
    if (buffer.duration > 600) throw new Error('Choose audio shorter than 10 minutes.');
    return buffer;
  }
  function checkFile(file) {
    if (!file || !file.size) throw new Error('Choose a non-empty media file.');
    if (file.size > MAX_BYTES) throw new Error('Choose a file under 100 MB to protect your phone’s memory.');
    return file;
  }
  async function analyse(blob) {
    let context;
    try {
      context = audioContext(); const buffer = await decode(blob, context);
      const data = buffer.getChannelData(0); let square = 0, clipped = 0;
      for (const value of data) { square += value * value; if (Math.abs(value) > .98) clipped++; }
      if (voice !== blob || leaving) return;
      const rms = Math.sqrt(square / data.length);
      message('volumeFeedback', clipped / data.length > .001 ? 'Clipping detected — lower your input' : rms < .015 ? 'Quiet take — move a little closer' : 'Usable level — listen back for clarity');
      const tips = [clipped ? 'Lower the input or move away if peaks sound distorted.' : 'Check the loudest line for distortion.', rms < .015 ? 'Move closer or reduce room noise before recording again.' : 'Keep your distance from the microphone consistent.', 'Check every lyric and adjust the voice start offset by ear.'];
      $('fixList').replaceChildren(...tips.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    } catch { if (voice === blob && !leaving) message('volumeFeedback', 'Level analysis unavailable — use playback to review'); }
    finally { await context?.close().catch(() => {}); }
  }
  function setVoice(blob) {
    voice = blob; invalidate();
    mediaSource($('playback'), url('voice', blob)); $('playback').hidden = false;
    download('voiceDownload', 'voiceDownload', blob, `pleading-sanity-voice.${extension(blob.type)}`);
    $('previewBtn').disabled = false; message('recStatus', 'Take ready in this tab. Download it to keep a copy.');
    analyse(blob);
  }
  async function closeMeter() {
    cancelAnimationFrame(meterFrame); $('level').value = 0;
    const context = micContext; micContext = null;
    await context?.close().catch(() => {});
  }
  function stopVoice() {
    stopSpeech(); clearTimeout(recordTimer);
    $('stopBtn').disabled = true; $('recordBtn').disabled = true;
    if (voiceRecorder?.state !== 'inactive' && voiceRecorder) { finishingVoice = true; voiceRecorder.stop(); }
    stopTracks(micStream); micStream = null; closeMeter();
  }
  $('recordBtn').onclick = async () => {
    if (capturing() || busy) return;
    const epoch = captureEpoch; $('playback').pause(); invalidate(); pendingMic = true; $('recordBtn').disabled = true; $('camBtn').disabled = true;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Recording needs HTTPS and a supported browser. You can import a file instead.');
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (leaving || document.hidden || epoch !== captureEpoch) { stopTracks(micStream); micStream = null; $('recordBtn').disabled = false; $('camBtn').disabled = false; message('recStatus', 'Microphone request cancelled because the page was hidden. Tap Record again when ready.'); return; }
      voiceRecorder = recorder(micStream, 'audio'); const parts = [];
      voiceRecorder.ondataavailable = event => { if (event.data.size) parts.push(event.data); };
      voiceRecorder.onstop = () => {
        finishingVoice = false;
        const type = voiceRecorder.mimeType || parts[0]?.type || 'audio/webm';
        stopSpeech(); stopTracks(micStream); micStream = null; clearTimeout(recordTimer); closeMeter();
        $('recordBtn').disabled = false; $('camBtn').disabled = false; $('stopBtn').disabled = true;
        $('voiceFile').disabled = false; $('previewBtn').disabled = !voice;
        if (!leaving && parts.length) setVoice(new Blob(parts, { type }));
      };
      voiceRecorder.onerror = () => { stopVoice(); message('recStatus', 'Recording interrupted. Check any saved take before trying again.'); };
      voiceRecorder.start(1000); startSpeech(); $('stopBtn').disabled = false; $('voiceFile').disabled = true; $('previewBtn').disabled = true;
      message('recStatus', 'Recording… Tap Stop when ready. Maximum 4 minutes.');
      recordTimer = setTimeout(stopVoice, 240000);
      try {
        micContext = audioContext(); await micContext.resume();
        if (!micStream || voiceRecorder.state !== 'recording') { closeMeter(); return; }
        const source = micContext.createMediaStreamSource(micStream), analyser = micContext.createAnalyser();
        source.connect(analyser); analyser.fftSize = 1024; const data = new Float32Array(analyser.fftSize);
        const tick = () => { analyser.getFloatTimeDomainData(data); let square = 0; for (const sample of data) square += sample * sample; $('level').value = Math.min(1, Math.sqrt(square / data.length) * 4); meterFrame = requestAnimationFrame(tick); }; tick();
      } catch { /* Audio recording still works without a level meter. */ }
    } catch (error) { stopTracks(micStream); micStream = null; closeMeter(); $('recordBtn').disabled = false; $('camBtn').disabled = false; message('recStatus', explain(error)); }
    finally { pendingMic = false; }
  };
  $('stopBtn').onclick = stopVoice;
  $('voiceFile').onchange = event => { try { setVoice(checkFile(event.target.files[0])); } catch (error) { message('recStatus', explain(error)); } };
  function stopVideo() {
    clearTimeout(videoTimer);
    if (videoRecorder && videoRecorder.state !== 'inactive') { finishingVideo = true; videoRecorder.stop(); }
    $('stopVidBtn').disabled = true;
  }
  function closeCamera() {
    stopVideo(); stopTracks(cameraStream); cameraStream = null; $('camPreview').srcObject = null; $('viewfinder').hidden = true;
    $('snapBtn').disabled = true; $('recVidBtn').disabled = true; $('closeCamBtn').disabled = true;
    message('camStatus', 'Camera off. Captures remain in this tab.');
  }
  $('camBtn').onclick = async () => {
    if (pendingCamera || cameraStream || busy) return;
    const epoch = captureEpoch; pendingCamera = true; $('camBtn').disabled = true; $('recordBtn').disabled = true;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera capture needs HTTPS and a supported browser. Import a photo or video instead.');
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', aspectRatio: { ideal: 9 / 16 }, width: { ideal: 720 }, height: { ideal: 1280 } }, audio: false });
      if (leaving || document.hidden || epoch !== captureEpoch) { closeCamera(); return; }
      $('camPreview').srcObject = cameraStream; $('viewfinder').hidden = false; await $('camPreview').play();
      if (!cameraStream || leaving || document.hidden || epoch !== captureEpoch) { closeCamera(); return; }
      $('snapBtn').disabled = false; $('recVidBtn').disabled = false; $('closeCamBtn').disabled = false;
      message('camStatus', 'Camera on. Preview is mirrored; saved captures are not.');
    } catch (error) { closeCamera(); message('camStatus', explain(error)); }
    finally { pendingCamera = false; $('camBtn').disabled = false; $('recordBtn').disabled = false; }
  };
  $('closeCamBtn').onclick = closeCamera;
  function chooseVisual() {
    const choice = $('visualChoice').value;
    $('photoPreview').hidden = choice !== 'photo'; $('videoPlayback').hidden = choice !== 'video';
    $('videoPlayback').pause(); $('visualDownload').hidden = choice === 'cosmic';
    const blob = choice === 'photo' ? photo : clip;
    if (blob) download('visualDownload', 'visualDownload', blob, choice === 'photo' ? `pleading-sanity-portrait.${extension(blob.type)}` : `pleading-sanity-performance.${extension(blob.type)}`);
    invalidate();
  }
  function setVisual(blob, kind) {
    if (kind === 'photo') { photo = blob; mediaSource($('photoPreview'), url('photo', blob)); }
    else { clip = blob; mediaSource($('videoPlayback'), url('clip', blob)); }
    $('visualChoice').querySelector(`[value="${kind}"]`).disabled = false; $('visualChoice').value = kind; chooseVisual();
    message('camStatus', `${kind === 'photo' ? 'Portrait' : 'Video'} selected. Download it to keep a copy.`);
  }
  $('visualChoice').onchange = chooseVisual;
  $('snapBtn').onclick = () => {
    const video = $('camPreview');
    if (!video.videoWidth) { message('camStatus', 'Wait for the camera picture, then try again.'); return; }
    const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0); canvas.toBlob(blob => { if (blob && !leaving && !busy) setVisual(blob, 'photo'); }, 'image/png');
  };
  $('recVidBtn').onclick = () => {
    try {
      if (!cameraStream) return;
      invalidate(); videoRecorder = recorder(cameraStream, 'video'); const parts = [];
      videoRecorder.ondataavailable = event => { if (event.data.size) parts.push(event.data); };
      videoRecorder.onstop = () => {
        finishingVideo = false;
        clearTimeout(videoTimer); if (!leaving && parts.length) setVisual(new Blob(parts, { type: videoRecorder.mimeType || parts[0].type }), 'video');
        $('recVidBtn').disabled = !cameraStream; $('snapBtn').disabled = !cameraStream; $('stopVidBtn').disabled = true;
      };
      videoRecorder.onerror = () => { closeCamera(); message('camStatus', 'Video recording interrupted. Try again.'); };
      videoRecorder.start(1000); $('recVidBtn').disabled = true; $('snapBtn').disabled = true; $('stopVidBtn').disabled = false;
      message('camStatus', 'Recording silent video… Tap Stop video when ready.'); videoTimer = setTimeout(stopVideo, 240000);
    } catch (error) { message('camStatus', explain(error)); }
  };
  $('stopVidBtn').onclick = stopVideo;
  $('visualFile').onchange = event => { try { const file = checkFile(event.target.files[0]); if (!/^(image|video)\//.test(file.type)) throw new Error('Choose a photo or video file.'); setVisual(file, file.type.startsWith('image/') ? 'photo' : 'video'); } catch (error) { message('camStatus', explain(error)); } };
  for (const [id, kind] of [['beatFile', 'beat'], ['hookFile', 'hook']]) $(id).onchange = async event => {
    let context; const revision = ++importRevisions[kind]; pendingImports++;
    try {
      const file = checkFile(event.target.files[0]); context = audioContext(); await decode(file, context);
      if (revision !== importRevisions[kind] || leaving) return;
      if (kind === 'beat') beat = file;
      else { hook = file; $('choir').disabled = false; }
      invalidate(); message('beatStatus', `${kind === 'beat' ? 'Beat' : 'Hook'} loaded. Confirm its rights before mixing.`);
    } catch (error) { message('beatStatus', explain(error)); }
    finally { pendingImports--; await context?.close().catch(() => {}); }
  };
  $('clearBeatBtn').onclick = () => { importRevisions.beat++; beat = null; $('beatFile').value = ''; invalidate(); message('beatStatus', 'Beat removed. You can build an a cappella mix.'); };
  $('clearHookBtn').onclick = () => { importRevisions.hook++; hook = null; $('hookFile').value = ''; $('choir').checked = false; $('choir').disabled = true; $('choirPlace').disabled = true; invalidate(); message('beatStatus', 'Hook removed.'); };
  ['rights', 'beatVolume', 'offset', 'choir', 'choirPlace'].forEach(id => $(id).addEventListener('input', () => { $('choirPlace').disabled = !$('choir').checked; invalidate(); }));
  ['lyrics', 'trackTitle', 'beatCredit', 'beat'].forEach(id => $(id).addEventListener('input', () => { projectDirty(); $('finalPreview').hidden = true; $('videoDownload').hidden = true; }));
  function wav(buffer) {
    const channels = buffer.numberOfChannels, length = buffer.length * channels * 2;
    const out = new ArrayBuffer(44 + length), view = new DataView(out);
    const text = (offset, value) => [...value].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
    text(0, 'RIFF'); view.setUint32(4, 36 + length, true); text(8, 'WAVE'); text(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true); view.setUint32(24, buffer.sampleRate, true); view.setUint32(28, buffer.sampleRate * channels * 2, true); view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true); text(36, 'data'); view.setUint32(40, length, true);
    const data = Array.from({ length: channels }, (_, i) => buffer.getChannelData(i));
    for (let i = 0, offset = 44; i < buffer.length; i++) for (let c = 0; c < channels; c++, offset += 2) { const value = Math.max(-1, Math.min(1, data[c][i])); view.setInt16(offset, value * (value < 0 ? 32768 : 32767), true); }
    return new Blob([out], { type: 'audio/wav' });
  }
  $('previewBtn').onclick = async () => {
    if (!voice || busy) return;
    if (pendingImports) { message('mixStatus', 'Wait for your audio file to finish loading.'); return; }
    if (capturing()) { message('mixStatus', 'Stop your recording before building the mix.'); return; }
    if ((beat || ($('choir').checked && hook)) && !$('rights').checked) { message('mixStatus', 'Confirm permission for your beat and hook before mixing.'); return; }
    const offset = Number($('offset').value);
    if (!Number.isFinite(offset) || offset < 0 || offset > 10) { message('mixStatus', 'Voice offset must be between 0 and 10 seconds.'); return; }
    let context; lock(true); invalidate(); message('mixStatus', 'Building your mix locally…');
    try {
      context = audioContext(); const vocal = await decode(voice, context), beatBuffer = beat ? await decode(beat, context) : null, hookBuffer = $('choir').checked && hook ? await decode(hook, context) : null;
      const duration = vocal.duration + offset;
      const offline = new OfflineAudioContext(2, Math.ceil(duration * 44100), 44100);
      const add = (buffer, start, gain, loop = false) => { const source = offline.createBufferSource(), volume = offline.createGain(); source.buffer = buffer; source.loop = loop; volume.gain.value = gain; source.connect(volume).connect(offline.destination); source.start(start); };
      add(vocal, offset, .85); if (beatBuffer) add(beatBuffer, 0, Number($('beatVolume').value), true);
      if (hookBuffer) { const place = $('choirPlace').value; add(hookBuffer, place === 'intro' ? 0 : place === 'chorus' ? duration / 2 : Math.max(0, duration - hookBuffer.duration), .4); }
      const buffer = await offline.startRendering();
      // Keep the mix below clipping without changing the singer's identity or pitch.
      let peak = 0; for (let c = 0; c < buffer.numberOfChannels; c++) for (const v of buffer.getChannelData(c)) peak = Math.max(peak, Math.abs(v));
      if (peak > .95) for (let c = 0; c < buffer.numberOfChannels; c++) { const data = buffer.getChannelData(c); for (let i = 0; i < data.length; i++) data[i] *= .95 / peak; }
      mix = { buffer, offset, vocalDuration: vocal.duration, revision: mixRevision };
      const blob = wav(buffer); mediaSource($('mixPlayback'), url('mix', blob)); $('mixPlayback').hidden = false;
      download('mixDownload', 'mixDownload', blob, 'pleading-sanity-mix.wav'); message('mixStatus', `Mix ready · ${Math.ceil(duration)} seconds. Listen before generating.`);
    } catch (error) { message('mixStatus', explain(error)); }
    finally { await context?.close().catch(() => {}); lock(false); const allowed = !!mix && !!window.MediaRecorder && !!HTMLCanvasElement.prototype.captureStream; $('genShortBtn').disabled = !allowed; $('genLongBtn').disabled = !allowed; message('genStatus', allowed ? 'Mix ready. Choose your video format.' : mix ? 'Video export is not supported here. Download your WAV mix and use a browser with canvas recording support.' : 'Build your audio preview first.'); }
  };
  function cover(ctx, media, width, height) {
    const w = media.videoWidth || media.naturalWidth, h = media.videoHeight || media.naturalHeight;
    if (!w || !h) return;
    const scale = Math.max(width / w, height / h); ctx.drawImage(media, (width - w * scale) / 2, (height - h * scale) / 2, w * scale, h * scale);
  }
  function linesFor(ctx, text, maxWidth) {
    const lines = []; let line = '';
    for (const word of text.split(/\s+/)) { if (ctx.measureText(`${line} ${word}`).width > maxWidth && line) { lines.push(line); line = word; } else line = line ? `${line} ${word}` : word; }
    if (line) lines.push(line); return lines.slice(0, 3);
  }
  // Chrome MediaRecorder streams omit WebM Duration. Add it to the early Info
  // element only for the unknown-length, unindexed Segment shape we can preserve.
  // Unsupported layouts are returned untouched, rather than rewriting their media.
  async function videoDuration(blob, seconds) {
    if (!blob.type.includes('webm') || !Number.isFinite(seconds) || seconds <= 0) return blob;
    const bytes = new Uint8Array(await blob.slice(0, 65536).arrayBuffer());
    function element(position) {
      const start = position;
      function vint(isId) {
        if (position >= bytes.length || bytes[position] === 0) throw new Error('Invalid EBML');
        let width = 1, marker = 128;
        while (!(bytes[position] & marker)) { width++; marker >>= 1; }
        if (width > (isId ? 4 : 8) || position + width > bytes.length) throw new Error('Invalid EBML size');
        let value = isId ? bytes[position] : bytes[position] & (marker - 1), unknown = !isId && value === marker - 1;
        for (let i = 1; i < width; i++) { value = value * 256 + bytes[position + i]; unknown = unknown && bytes[position + i] === 255; }
        position += width; if (!unknown && !Number.isSafeInteger(value)) throw new Error('Oversized EBML');
        return { value, width, unknown };
      }
      const id = vint(true), sizeOffset = position, size = vint(false);
      return { start, id: id.value, sizeOffset, width: size.width, size: size.value, unknown: size.unknown, body: position, end: position + size.value };
    }
    function sizeBytes(value, width) {
      while (value >= 2 ** (width * 7) - 1) width++;
      if (width > 6) throw new Error('Oversized Info');
      const encoded = new Uint8Array(width); let remaining = value;
      for (let i = width - 1; i >= 0; i--) { encoded[i] = remaining % 256; remaining = Math.floor(remaining / 256); }
      encoded[0] |= 1 << (8 - width); return encoded;
    }
    try {
      const header = element(0); if (header.id !== 0x1a45dfa3 || header.unknown) return blob;
      const segment = element(header.end); if (segment.id !== 0x18538067 || !segment.unknown) return blob;
      const info = element(segment.body);
      if (info.id !== 0x1549a966 || info.unknown || info.end > bytes.length) return blob;
      let scale = 1000000;
      for (let position = info.body; position < info.end;) {
        const child = element(position);
        if (child.unknown || child.end > info.end || child.end <= position) return blob;
        if (child.id === 0x4489) return blob; // Existing finite duration belongs to its encoder.
        if (child.id === 0x2ad7b1) { scale = 0; for (let i = child.body; i < child.end; i++) scale = scale * 256 + bytes[i]; }
        position = child.end;
      }
      if (!Number.isFinite(scale) || scale <= 0) return blob;
      const duration = new Uint8Array(11); duration.set([0x44, 0x89, 0x88]); new DataView(duration.buffer).setFloat64(3, seconds * 1e9 / scale, false);
      return new Blob([blob.slice(0, info.sizeOffset), sizeBytes(info.size + duration.length, info.width), blob.slice(info.body, info.end), duration, blob.slice(info.end)], { type: blob.type });
    } catch { return blob; }
  }
  async function generate(vertical) {
    if (!mix || busy) return;
    if (pendingImports) { message('genStatus', 'Wait for your audio file to finish loading.'); return; }
    if (capturing()) { message('genStatus', 'Stop your recording before generating.'); return; }
    stopSpeech(); closeCamera(); $('playback').pause(); $('mixPlayback').pause();
    const canvas = document.createElement('canvas'); canvas.width = vertical ? 720 : 1280; canvas.height = vertical ? 1280 : 720;
    const ctx = canvas.getContext('2d'); const duration = Math.min(mix.buffer.duration, vertical ? 90 : 240);
    const captions = $('lyrics').value.split('\n').map(line => line.trim()).filter(line => line && !/^\[.*\]$/.test(line));
    const choice = $('visualChoice').value; let visual = null, audio = null, stream = null, exportRecorder = null, animation = 0, timeout = 0, cancelled = false;
    let source = null;
    lock(true); $('cancelRender').hidden = false; $('renderProgress').hidden = false; $('renderProgress').value = 0;
    $('videoDownload').hidden = true; $('finalPreview').hidden = true;
    const cancel = () => { cancelled = true; if (exportRecorder?.state === 'recording') exportRecorder.stop(); };
    renderCancel = cancel;
    try {
      if (choice === 'photo') { visual = new Image(); mediaSource(visual, urls.get('photo')); await visual.decode(); }
      if (choice === 'video') {
        visual = document.createElement('video'); mediaSource(visual, urls.get('clip')); visual.muted = true; visual.loop = true; visual.playsInline = true;
        await visual.play();
      }
      if (cancelled) throw new Error('Video cancelled. Your source files are still available.');
      audio = audioContext(); await audio.resume();
      source = audio.createBufferSource(); source.buffer = mix.buffer;
      const destination = audio.createMediaStreamDestination(); source.connect(destination);
      const width = canvas.width, height = canvas.height;
      const start = audio.currentTime;
      const draw = () => {
        const elapsed = Math.min(duration, Math.max(0, audio.currentTime - start));
        ctx.fillStyle = '#0b0f19'; ctx.fillRect(0, 0, width, height);
        const glow = ctx.createRadialGradient(width * .2, height * .25, 0, width * .5, height * .5, height);
        glow.addColorStop(0, '#00534e'); glow.addColorStop(.5, '#0b0f19'); glow.addColorStop(1, '#533707'); ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
        for (let i = 0; i < 65; i++) { ctx.fillStyle = i % 3 ? '#cbd5e1' : '#f59e0b'; ctx.fillRect((i * 197.3) % width, (i * 317.7) % height, 2, 2); }
        if (visual) { ctx.globalAlpha = .85; cover(ctx, visual, width, height); ctx.globalAlpha = 1; }
        ctx.fillStyle = '#0b0f19c9'; ctx.fillRect(0, 0, width, 115); ctx.fillRect(0, height * .7, width, height * .3);
        ctx.textAlign = 'center'; ctx.fillStyle = '#00fff0'; ctx.font = 'bold 24px system-ui'; ctx.fillText('PLEADING SANITY', width / 2, 42);
        ctx.fillStyle = '#eef6ff'; ctx.font = '22px system-ui'; ctx.fillText($('trackTitle').value.slice(0, 70), width / 2, 80, width - 60);
        if (captions.length && elapsed >= mix.offset && elapsed < mix.offset + mix.vocalDuration) {
          const index = Math.min(captions.length - 1, Math.floor((elapsed - mix.offset) / mix.vocalDuration * captions.length));
          ctx.font = `bold ${vertical ? 35 : 30}px system-ui`; ctx.fillStyle = '#eef6ff';
          linesFor(ctx, captions[index], width - 90).forEach((line, i) => ctx.fillText(line, width / 2, height * .78 + i * 45, width - 80));
        }
        ctx.font = '20px system-ui'; ctx.fillStyle = '#f59e0b'; ctx.fillText('Rise From Madness.', width / 2, height - 35);
        $('renderProgress').value = elapsed / duration;
        animation = requestAnimationFrame(draw);
      };
      draw(); stream = canvas.captureStream(24); destination.stream.getAudioTracks().forEach(track => stream.addTrack(track));
      exportRecorder = recorder(stream, 'video'); const parts = [];
      const finished = new Promise((resolve, reject) => { exportRecorder.ondataavailable = e => { if (e.data.size) parts.push(e.data); }; exportRecorder.onstop = resolve; exportRecorder.onerror = () => reject(new Error('Video encoder failed. Try a shorter recording.')); });
      exportRecorder.start(1000); source.start(); source.stop(audio.currentTime + duration);
      source.onended = () => { if (exportRecorder.state === 'recording') exportRecorder.stop(); };
      timeout = setTimeout(cancel, (duration + 15) * 1000);
      if (cancelled) cancel();
      message('genStatus', `Generating ${vertical ? '9:16' : '16:9'} · ${Math.ceil(duration)} seconds. Keep this tab visible.`);
      await finished;
      if (cancelled) { message('genStatus', 'Video cancelled. Your source files and mix are still available.'); return; }
      if (!parts.length) throw new Error('No video data was produced. Try a shorter take.');
      const blob = await videoDuration(new Blob(parts, { type: exportRecorder.mimeType || parts[0].type }), duration);
      if (leaving || cancelled) { message('genStatus', 'Video cancelled. Your source files and mix are still available.'); return; }
      mediaSource($('finalPreview'), url('final', blob)); $('finalPreview').hidden = false;
      download('videoDownload', 'finalDownload', blob, `pleading-sanity-${vertical ? 'short' : 'full'}.${extension(blob.type)}`);
      message('genStatus', 'Video ready. Watch it and check caption timing before uploading.'); $('renderProgress').value = 1;
    } catch (error) { message('genStatus', explain(error)); }
    finally {
      clearTimeout(timeout); cancelAnimationFrame(animation); visual?.pause?.();
      if (exportRecorder?.state === 'recording') exportRecorder.stop();
      try { source?.stop(); } catch { /* Already ended. */ }
      stopTracks(stream); await audio?.close().catch(() => {}); renderCancel = null;
      $('cancelRender').hidden = true; $('renderProgress').hidden = true; lock(false);
    }
  }
  $('genShortBtn').onclick = () => generate(true); $('genLongBtn').onclick = () => generate(false); $('cancelRender').onclick = () => renderCancel?.();

  function buildProject(fields, media) {
    const files = Object.entries(media).filter(([, blob]) => blob).map(([key, blob]) => ({ key, type: blob.type, size: blob.size }));
    const manifest = new TextEncoder().encode(JSON.stringify({ version: 1, fields, files }));
    if (manifest.length > 65536) throw new Error('Project text is too long. Keep lyrics and notes under 64 KB combined.');
    const bytes = files.reduce((total, file) => total + file.size, 12 + manifest.length);
    if (bytes > PROJECT_LIMIT) throw new Error('Project is over 250 MB. Download individual takes instead.');
    const header = new ArrayBuffer(12); const view = new DataView(header);
    [...'PSMUSIC1'].forEach((char, i) => view.setUint8(i, char.charCodeAt(0))); view.setUint32(8, manifest.length, true);
    return new Blob([header, manifest, ...files.map(file => media[file.key])], { type: 'application/octet-stream' });
  }
  async function readProject(file) {
    if (!file || file.size < 12 || file.size > PROJECT_LIMIT) throw new Error('Choose a valid project under 250 MB.');
    const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (new TextDecoder().decode(header.slice(0, 8)) !== 'PSMUSIC1') throw new Error('This is not a Pleading Sanity music project.');
    const length = new DataView(header.buffer).getUint32(8, true);
    if (length < 2 || length > 65536 || 12 + length > file.size) throw new Error('Project header is damaged.');
    const data = JSON.parse(await file.slice(12, 12 + length).text());
    if (data.version !== 1 || !data.fields || typeof data.fields !== 'object' || !Array.isArray(data.files) || data.files.length > 5) throw new Error('Project version or contents are unsupported.');
    const fields = {};
    for (const key of PROJECT_FIELDS) { const value = data.fields[key]; if (typeof value !== 'string') throw new Error('Project settings are damaged.'); fields[key] = value; }
    for (const [key, max] of [['offset', 10], ['beatVolume', .8]]) if (!Number.isFinite(Number(fields[key])) || Number(fields[key]) < 0 || Number(fields[key]) > max) throw new Error('Project audio settings are out of range.');
    if (!['intro', 'chorus', 'outro'].includes(fields.choirPlace) || !['cosmic', 'photo', 'video'].includes(fields.visualChoice)) throw new Error('Project selection is invalid.');
    const media = {}; let position = 12 + length;
    for (const entry of data.files) {
      if (!entry || !['voice', 'beat', 'hook', 'photo', 'clip'].includes(entry.key) || Object.hasOwn(media, entry.key) || !Number.isSafeInteger(entry.size) || entry.size <= 0 || entry.size > MAX_BYTES || typeof entry.type !== 'string') throw new Error('Project media entry is invalid.');
      const category = entry.key === 'photo' ? 'image/' : entry.key === 'clip' ? 'video/' : 'audio/';
      if ((!entry.type.startsWith(category) && !(category === 'audio/' && entry.type === '')) || entry.type.length > 150 || position + entry.size > file.size) throw new Error('Project media is invalid or incomplete.');
      media[entry.key] = file.slice(position, position + entry.size, entry.type); position += entry.size;
    }
    if (position !== file.size || fields.visualChoice === 'photo' && !media.photo || fields.visualChoice === 'video' && !media.clip) throw new Error('Project media does not match its settings.');
    return { fields, media };
  }
  $('saveProjectBtn').onclick = () => {
    if (busy || capturing() || pendingImports) { message('projectStatus', 'Stop recording and let files finish loading before saving.'); return; }
    try {
      const fields = Object.fromEntries(PROJECT_FIELDS.map(key => [key, $(key).value]));
      const blob = buildProject(fields, { voice, beat, hook, photo, clip });
      download('projectDownload', 'project', blob, 'pleading-sanity-session.psmusic');
      message('projectStatus', 'Project prepared. Tap Download project backup to save it on your device. Generated exports are separate downloads.');
    } catch (error) { message('projectStatus', explain(error)); }
  };
  $('projectFile').onchange = async event => {
    if (busy || capturing() || pendingImports) { message('projectStatus', 'Stop recording and let files finish loading before reopening a project.'); return; }
    lock(true);
    try {
      const project = await readProject(event.target.files[0]);
      if (leaving) return;
      closeCamera(); stopSpeech(); $('playback').pause(); invalidate();
      voice = project.media.voice || null; beat = project.media.beat || null; hook = project.media.hook || null; photo = project.media.photo || null; clip = project.media.clip || null;
      for (const key of ['voice', 'voiceDownload', 'photo', 'clip', 'visualDownload']) revoke(key);
      for (const key of PROJECT_FIELDS) $(key).value = project.fields[key];
      for (const key of ['voiceFile', 'beatFile', 'hookFile', 'visualFile']) $(key).value = '';
      $('rights').checked = false; $('choir').checked = false; $('transcribe').checked = false;
      $('playback').removeAttribute('src'); $('playback').hidden = true; $('voiceDownload').hidden = true;
      $('photoPreview').removeAttribute('src'); $('photoPreview').hidden = true;
      $('videoPlayback').removeAttribute('src'); $('videoPlayback').hidden = true;
      $('visualChoice').querySelector('[value="photo"]').disabled = !photo; $('visualChoice').querySelector('[value="video"]').disabled = !clip;
      if (voice) setVoice(voice);
      if (photo) mediaSource($('photoPreview'), url('photo', photo));
      if (clip) mediaSource($('videoPlayback'), url('clip', clip));
      chooseVisual();
      message('projectStatus', 'Project reopened locally. Confirm your music rights and enable your hook again if wanted, then build a fresh mix.');
    } catch (error) { message('projectStatus', explain(error)); }
    finally { lock(false); $('previewBtn').disabled = !voice; $('choir').disabled = !hook; $('choirPlace').disabled = !$('choir').checked; }
  };

  $('metadataBtn').onclick = () => {
    const title = $('trackTitle').value.trim() || 'My story';
    $('metadata').value = `${title} | Shane Cooper · Pleading Sanity\n\nOriginal voice and words by Shane Cooper. UK rap from Leicester, lived experience and the Pleading Sanity movement.\nRise From Madness.\nhttps://pleadingsanity.co.uk\n\nMusic credits / licence notes:\n${$('beatCredit').value.trim() || 'Add any required credits and confirm all rights before uploading.'}\n\nTags: UK rap, Leicester rap, Pleading Sanity, Shane Cooper, lived experience, mental health awareness\n\nReview title, credits, audience settings and advertiser suitability before publishing.`;
  };
  $('demoBtn').onclick = () => { $('lyrics').value = DEMO_LYRICS; projectDirty(); message('mixStatus', 'Inside The War lyrics loaded. Record your own performance to test the full flow.'); $('finalPreview').hidden = true; $('videoDownload').hidden = true; };
  document.addEventListener('visibilitychange', () => { if (document.hidden) { captureEpoch++; stopSpeech(); renderCancel?.(); if (voiceRecorder?.state === 'recording') stopVoice(); closeCamera(); } });
  window.addEventListener('pageshow', () => { leaving = false; });
  window.addEventListener('pagehide', event => { leaving = true; captureEpoch++; stopSpeech(); renderCancel?.(); if (voiceRecorder?.state === 'recording') stopVoice(); closeCamera(); closeMeter(); if (!event.persisted) for (const key of urls.keys()) revoke(key); });
  const DEMO_LYRICS = "[Verse]\nI'm ready to stand for what I believe\nI ain't scared of what comes after I leave\nI'm doing this for every hurting kid\nWho never got the help that they need\n\nI unlock the chains that hold your mind\nRead the signs, leave the old life behind\nBelieve in yourself, you're one of a kind\n\nPeople ask why I'm still broke\nWhy there's so little hope\nBack in 12 I almost choked\nBipolar waking me with every stroke\n\nWoke up to the game, mother named me Shane\nCrazy kid walking through the pain\nTime to regain everything they took away\nAnger turned to purpose day after day\n\nSystem's a joke, I see the whole picture\nFighting for the ones who need the fixture\nHead so loud you can scream and shout\nPunch through the pain till the doubt runs out\n\nI tried to give everything I had for you\nGot nothing back but hatred and doubt too\nJust a regular man on a mission with shit to do\nMy family stands with me, and hopefully they'll see\n\n[CHORUS \u2014 repeat twice]\nInside the war we rise up\nOpen our eyes, rise up\nLeicester to the whole wide world\nPleading Sanity unfurled\nHeal the hurt, break the curse\nThis is our story, this is our verse\n\n[Outro]\nYou can have every degree, travel every land\nSpeak every language, hold every command\nBut if you don't know who you are inside\nYou'll never build the life you hoped to find\n\nFought the side-effects from every drug they prescribed\nBut I ain't giving up, I ain't ever gonna hide\nCreator of the vision, believe what you see\nI wipe the harm away so the kids are safe with me";
})();
