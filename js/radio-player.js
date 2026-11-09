/* Insane Radio — consent-first continuous official YouTube embeds. No hosted audio. */
(function () {
  'use strict';
  var tracks = [], index = 0, player = null, wanted = false, ready = false, loadedId = null;
  var loadTimer = null, progressTimer = null, fadeTimer = null, generation = 0, failures = 0;
  var STATE = {ENDED:0, PLAYING:1, PAUSED:2, BUFFERING:3, CUED:5};
  function el(id) { return document.getElementById(id); }
  function label(id, value) { var node = el(id); if (node) node.textContent = value; }
  function track() { return tracks[index]; }
  function valid(id) { return typeof id === 'string' && /^[A-Za-z0-9_-]{11}$/.test(id); }
  function official(t) {
    try {
      var u = new URL(t.supportLink);
      if (u.protocol === 'https:' && ['youtube.com','www.youtube.com','music.youtube.com','youtu.be'].indexOf(u.hostname) >= 0) return u.href;
    } catch (e) {}
    return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(t.artist + ' ' + t.title);
  }
  function clearLoad() { if (loadTimer !== null) { clearTimeout(loadTimer); loadTimer = null; } }
  function clearFade() { if (fadeTimer !== null) { clearInterval(fadeTimer); fadeTimer = null; } }
  function resetProgress() {
    var bar = el('radio-progress'), time = el('radio-time');
    if (bar) { bar.value = 0; bar.max = 100; }
    if (time) time.textContent = '0:00 / --:--';
  }
  function fmt(seconds) {
    seconds = Math.max(0, Math.floor(Number(seconds) || 0));
    return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
  }
  function stateUI(active) {
    var card = el('radio-card'), button = el('radio-play');
    if (card) card.classList.toggle('is-playing', active);
    if (button) { button.textContent = wanted ? 'Pause' : 'Play'; button.setAttribute('aria-label', wanted ? 'Pause radio' : 'Play radio'); }
  }
  function render() {
    var t = track(); if (!t) return;
    label('radio-title', t.title); label('radio-artist', t.artist);
    label('radio-era', [t.album, t.year, t.region].filter(Boolean).join(' · '));
    var link = el('radio-support'); if (link) { link.href = official(t); link.textContent = 'Open official music link'; }
    var list = el('radio-upnext'); if (list) {
      list.replaceChildren();
      for (var i = 1; i < Math.min(tracks.length, 5); i++) {
        var t2 = tracks[(index + i) % tracks.length];
        var item = document.createElement('li');
        item.textContent = t2.title + ' · ' + t2.artist;
        list.appendChild(item);
      }
    }
    var art = el('radio-art-title'); if (art) art.textContent = t.genre === 'rnb' ? 'R&B' : 'HIP-HOP';
    resetProgress();
  }
  function safeCall(method, arg) {
    try { if (player && typeof player[method] === 'function') return player[method](arg); } catch (e) {}
    return undefined;
  }
  function fadeTo(target, callback) {
    clearFade();
    var volume = Number(safeCall('getVolume')); if (!Number.isFinite(volume)) volume = 75;
    var steps = 5, count = 0, start = volume;
    fadeTimer = setInterval(function () {
      count++;
      safeCall('setVolume', Math.round(start + (target - start) * count / steps));
      if (count >= steps) { clearFade(); if (callback) callback(); }
    }, 70);
  }
  function scheduleTimeout(token) {
    clearLoad();
    loadTimer = setTimeout(function () {
      if (!wanted || token !== generation) return;
      label('radio-status', "This one's resting — up next instead.");
      skipFailed();
    }, 8000);
  }
  function skipFailed() {
    clearLoad(); clearFade(); failures++;
    if (failures >= tracks.length) {
      wanted = false; stateUI(false);
      label('radio-status', 'No embeddable tracks are available right now. Use the official music link.');
      safeCall('stopVideo'); return;
    }
    move(1, true);
  }
  function startCurrent() {
    if (!wanted || !tracks.length) return;
    generation++;
    var token = generation, t = track();
    render();
    if (!valid(t.youtubeId)) {
      label('radio-status', "This one's resting — up next instead.");
      skipFailed(); return;
    }
    if (!ready || !player) {
      label('radio-status', 'Connecting to official music player…');
      scheduleTimeout(token); return;
    }
    label('radio-status', 'Loading ' + t.title + '…');
    loadedId = t.youtubeId;
    safeCall('loadVideoById', t.youtubeId);
    scheduleTimeout(token);
  }
  function move(delta, failed) {
    if (!tracks.length) return;
    clearLoad(); clearFade(); generation++;
    if (!failed) failures = 0;
    index = (index + delta + tracks.length) % tracks.length;
    if (wanted) startCurrent();
    else { render(); label('radio-status', 'Selected — press Play'); }
  }
  function stop() {
    wanted = false; generation++; clearLoad(); clearFade();
    safeCall('pauseVideo'); stateUI(false);
    label('radio-status', 'Paused — press Play to continue');
  }
  function play() {
    if (!tracks.length) return;
    wanted = true; failures = 0; stateUI(false);
    if (ready && player && loadedId === track().youtubeId && valid(track().youtubeId) && safeCall('getPlayerState') === STATE.PAUSED) {
      label('radio-status', 'Resuming…');
      safeCall('playVideo'); clearLoad();
    } else startCurrent();
    stateUI(false);
  }
  function tick() {
    if (!wanted || !ready || safeCall('getPlayerState') !== STATE.PLAYING) return;
    var duration = Number(safeCall('getDuration')), position = Number(safeCall('getCurrentTime'));
    if (!(duration > 0) || !(position >= 0)) return;
    var bar = el('radio-progress');
    if (bar) { bar.max = duration; bar.value = Math.min(duration, position); }
    label('radio-time', fmt(position) + ' / ' + fmt(duration));
  }
  function onState(event) {
    if (!wanted) {
      if (event.data === STATE.PLAYING) safeCall('pauseVideo');
      return;
    }
    if (event.data === STATE.PLAYING) {
      clearLoad(); failures = 0;
      stateUI(true); label('radio-status', 'Now playing · official YouTube source');
      if (typeof player.setVolume === 'function') { safeCall('setVolume', 0); fadeTo(75); }
    } else if (event.data === STATE.ENDED) {
      clearLoad(); clearFade(); move(1, false);
    } else if (event.data === STATE.BUFFERING) {
      label('radio-status', 'Buffering…');
      if (loadTimer === null) scheduleTimeout(generation);
    } else if (event.data === STATE.PAUSED) {
      wanted = false; generation++; clearLoad(); clearFade();
      stateUI(false);
      label('radio-status', 'Paused by the player. Tap Play to continue.');
    }
  }
  function initYouTube() {
    window.onYouTubeIframeAPIReady = function () {
      player = new window.YT.Player('radio-video-player', {
        host:'https://www.youtube-nocookie.com',
        width:'640', height:'360',
        playerVars:{playsinline:1,rel:0,origin:window.location.origin},
        events:{
          onReady:function () { ready = true; if (wanted) startCurrent(); },
          onStateChange:onState,
          onError:function () { if (wanted) { label('radio-status', "This one's resting — up next instead."); skipFailed(); } }
        }
      });
    };
    var script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api'; script.async = true;
    script.onerror = function () { label('radio-status', 'Player unavailable. Open the official music link below.'); clearLoad(); wanted = false; stateUI(false); };
    document.head.appendChild(script);
  }
  function init() {
    label('radio-status', 'Loading track list…');
    var playButton = el('radio-play');
    if (playButton) playButton.addEventListener('click', function () { if (wanted) stop(); else play(); });
    var next = el('radio-next'); if (next) next.addEventListener('click', function () { move(1, false); });
    var prev = el('radio-prev'); if (prev) prev.addEventListener('click', function () { move(-1, false); });
    progressTimer = setInterval(tick, 500);
    fetch('/data/radio-library.json').then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (data) {
      tracks = Array.isArray(data.tracks) ? data.tracks.filter(function (t) { return t && typeof t.title === 'string' && typeof t.artist === 'string'; }) : [];
      if (!tracks.length) { label('radio-status', 'Track list empty.'); return; }
      render(); label('radio-status', 'Ready — press Play once for continuous listening');
      initYouTube();
    }).catch(function () { label('radio-status', 'Track list unavailable. Please try again later.'); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearFade(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
