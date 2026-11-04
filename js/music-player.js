/* =====================================================
   PLEADING SANITY — 5-SONG BACKGROUND MUSIC PLAYLIST
   Injects a hidden YouTube iframe (playlist, loop) + a
   floating widget (play/pause, prev, next, mute, volume).
   - No media requests until explicit Play or track selection.
   - No page-wide gesture auto-unmute.
   - Persists: psMusicMuted, psMusicVolume, psMusicIndex.
   - Uses postMessage (enablejsapi=1) — no external API
     dependency. Listens to infoDelivery for current track.
   - No emoji. SVG icons only. No purple/indigo.
   SEPARATE from js/cosmic-audio-system.js (SFX) and
   js/ps-music.js (optional Spotify widget). No conflict.
===================================================== */
(function () {
  'use strict';

  var PLAYLIST = [
    { id: 'DjdB4Bm4n2M',  title: 'Man on the Moon (The Anthem)', artist: 'Kid Cudi' },
    { id: '3pysm_JU_wA',  title: 'Deliverance (ft. Timbaland)',   artist: 'Bubba Sparxxx' },
    { id: '0slhR2obZSE',  title: 'NVM (Starring Mya)',            artist: 'Joyner Lucas' },
    { id: 'rT1fqRkFiqY',  title: 'Locked Up (DJ Fleq Remix ft. Lil Wayne, 2Pac & Biggie)', artist: 'Akon' },
    { id: 'b8M6N0FTpNc',  title: 'Girls Want Girls (ft. Lil Baby)', artist: 'Drake' }
  ];

  var K_MUTED  = 'psMusicMuted';
  var K_VOLUME = 'psMusicVolume';
  var K_INDEX  = 'psMusicIndex';

  function readStore(key, fallback) {
    try { var v = localStorage.getItem(key); return (v === null || v === undefined) ? fallback : v; } catch (e) { return fallback; }
  }
  function writeStore(key, val) { try { localStorage.setItem(key, String(val)); } catch (e) {} }

  var state = {
    index: parseInt(readStore(K_INDEX, '0'), 10) || 0,
    muted: readStore(K_MUTED, '1') === '1', // default muted until first gesture
    volume: parseInt(readStore(K_VOLUME, '15'), 10) || 15,
    unlocked: false,
    playing: false, // starts OFF — user chooses
    iframeReady: false
  };
  if (state.index < 0 || state.index >= PLAYLIST.length) state.index = 0;
  if (state.volume < 0) state.volume = 0;
  if (state.volume > 100) state.volume = 100;

  var userExplicitlyMuted = readStore(K_MUTED, null) === '1';

  // ---------- inject hidden iframe ----------
  var iframe = document.createElement('iframe');
  iframe.id = 'ps-music-frame';
  iframe.setAttribute('title', 'Background music player');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');
  iframe.setAttribute('allow', 'autoplay; encrypted-media');
  iframe.style.cssText = 'position:fixed;width:0;height:0;border:0;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none;';
  var ids = PLAYLIST.map(function (t) { return t.id; }).join(',');
  function buildSrc(startId, muted) {
    return 'https://www.youtube.com/embed/' + startId +
      '?autoplay=1&mute=' + (muted ? '1' : '0') +
      '&loop=1&playlist=' + ids +
      '&enablejsapi=1&rel=0&modestbranding=1&playsinline=1';
  }
  // Defer all YouTube requests until the visitor explicitly chooses Play.
  function loadPlayer() {
    if (iframe.parentNode) return false;
    iframe.src = buildSrc(PLAYLIST[state.index].id, state.muted);
    document.body.appendChild(iframe);
    return true;
  }

  function postCmd(func, args) {
    if (!iframe || !iframe.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: args || [] }), '*');
    } catch (e) {}
  }

  // ---------- inject widget ----------
  // SVG icons (inline, no emoji)
  var ICON = {
    play:  '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/></svg>',
    prev:  '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="19 5 9 12 19 19 19 5" fill="currentColor" stroke="none"/><rect x="5" y="5" width="2.5" height="14" rx="1" fill="currentColor" stroke="none"/></svg>',
    next:  '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="5 5 15 12 5 19 5 5" fill="currentColor" stroke="none"/><rect x="16.5" y="5" width="2.5" height="14" rx="1" fill="currentColor" stroke="none"/></svg>',
    mute:  '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/><line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    vol:   '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/><path d="M15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  var widget = document.createElement('div');
  widget.id = 'ps-music-widget';
  widget.className = 'ps-music-widget';
  widget.setAttribute('role', 'region');
  widget.setAttribute('aria-label', 'Background music control');
  widget.innerHTML =
    '<div class="ps-mp-track">' +
      '<span class="ps-mp-title"></span>' +
      '<span class="ps-mp-sep"> — </span>' +
      '<span class="ps-mp-artist"></span>' +
    '</div>' +
    '<div class="ps-mp-controls">' +
      '<button type="button" class="ps-mp-btn ps-mp-prev" aria-label="Previous song" title="Previous song">' + ICON.prev + '</button>' +
      '<button type="button" class="ps-mp-btn ps-mp-play" aria-label="Pause" title="Pause">' + ICON.pause + '</button>' +
      '<button type="button" class="ps-mp-btn ps-mp-next" aria-label="Next song" title="Next song">' + ICON.next + '</button>' +
      '<span class="ps-mp-divider" aria-hidden="true"></span>' +
      '<button type="button" class="ps-mp-btn ps-mp-mute" aria-label="Unmute" title="Unmute">' + ICON.mute + '</button>' +
      '<input type="range" class="ps-mp-volume" min="0" max="100" step="1" value="' + state.volume + '" aria-label="Volume">' +
    '</div>';
  document.body.appendChild(widget);

  var elTitle  = widget.querySelector('.ps-mp-title');
  var elArtist = widget.querySelector('.ps-mp-artist');
  var elPlay   = widget.querySelector('.ps-mp-play');
  var elPrev   = widget.querySelector('.ps-mp-prev');
  var elNext   = widget.querySelector('.ps-mp-next');
  var elMute   = widget.querySelector('.ps-mp-mute');
  var elVol    = widget.querySelector('.ps-mp-volume');

  function renderTrack() {
    var t = PLAYLIST[state.index];
    elTitle.textContent = t.title;
    elArtist.textContent = t.artist;
    widget.classList.toggle('ps-playing', state.playing && !state.muted);
  }
  function renderPlayIcon() {
    elPlay.innerHTML = state.playing ? ICON.pause : ICON.play;
    elPlay.setAttribute('aria-label', state.playing ? 'Pause' : 'Play');
    elPlay.setAttribute('title', state.playing ? 'Pause' : 'Play');
  }
  function renderMuteIcon() {
    elMute.innerHTML = state.muted ? ICON.mute : ICON.vol;
    elMute.setAttribute('aria-label', state.muted ? 'Unmute' : 'Mute');
    elMute.setAttribute('title', state.muted ? 'Unmute' : 'Mute');
  }
  function renderAll() { renderTrack(); renderPlayIcon(); renderMuteIcon(); elVol.value = state.volume; }

  // ---------- iframe message listener: track current song + state ----------
  function idToIndex(vid) {
    for (var i = 0; i < PLAYLIST.length; i++) if (PLAYLIST[i].id === vid) return i;
    return -1;
  }
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://www.youtube.com') return;
    var data;
    try { data = (typeof e.data === 'string') ? JSON.parse(e.data) : e.data; } catch (err) { return; }
    if (!data || typeof data !== 'object') return;
    if (data.event === 'infoDelivery' && data.info) {
      if (data.info.videoData && data.info.videoData.video_id) {
        var idx = idToIndex(data.info.videoData.video_id);
        if (idx >= 0 && idx !== state.index) {
          state.index = idx;
          writeStore(K_INDEX, idx);
          renderTrack();
        }
      }
      if (typeof data.info.playerState === 'number') {
        var s = data.info.playerState;
        if (s === 1) { state.playing = true; renderPlayIcon(); }
        else if (s === 2) { state.playing = false; renderPlayIcon(); }
        // s === 0 (ended): playlist auto-advances; infoDelivery will report new video
      }
    } else if (data.event === 'onReady' || (data.event === 'infoDelivery' && !state.iframeReady)) {
      state.iframeReady = true;
      // sync initial volume + mute once iframe is alive
      postCmd('setVolume', [state.volume]);
      if (!state.muted) postCmd('unMute', []);
    }
  });

  // ---------- controls ----------
  function stopProp(e) { e.stopPropagation(); e.preventDefault(); }

  elPlay.addEventListener('click', function (e) {
    stopProp(e);
    state.unlocked = true; removeGestureListeners();
    if (state.playing) { postCmd('pauseVideo', []); state.playing = false; }
    else { if (state.muted && !userExplicitlyMuted) { state.muted = false; writeStore(K_MUTED, '0'); } if (!loadPlayer()) postCmd('playVideo', []); state.playing = true; }
    renderPlayIcon(); renderTrack();
  });

  elPrev.addEventListener('click', function (e) {
    stopProp(e);
    state.unlocked = true; removeGestureListeners();
    if (iframe.parentNode) postCmd('previousVideo', []);
    state.index = (state.index - 1 + PLAYLIST.length) % PLAYLIST.length;
    writeStore(K_INDEX, state.index);
    loadPlayer();
    state.playing = true; renderPlayIcon(); renderTrack();
  });

  elNext.addEventListener('click', function (e) {
    stopProp(e);
    state.unlocked = true; removeGestureListeners();
    if (iframe.parentNode) postCmd('nextVideo', []);
    state.index = (state.index + 1) % PLAYLIST.length;
    writeStore(K_INDEX, state.index);
    loadPlayer();
    state.playing = true; renderPlayIcon(); renderTrack();
  });

  elMute.addEventListener('click', function (e) {
    stopProp(e);
    state.unlocked = true; removeGestureListeners();
    state.muted = !state.muted;
    if (state.muted) { postCmd('mute', []); userExplicitlyMuted = true; writeStore(K_MUTED, '1'); }
    else { postCmd('unMute', []); postCmd('setVolume', [state.volume]); userExplicitlyMuted = false; writeStore(K_MUTED, '0'); }
    renderMuteIcon(); renderTrack();
  });

  var volTimer = null;
  elVol.addEventListener('input', function (e) {
    stopProp(e);
    state.unlocked = true; removeGestureListeners();
    state.volume = parseInt(elVol.value, 10) || 0;
    writeStore(K_VOLUME, state.volume);
    postCmd('setVolume', [state.volume]);
    if (state.muted) { state.muted = false; postCmd('unMute', []); writeStore(K_MUTED, '0'); renderMuteIcon(); renderTrack(); }
  });

  // Playback and unmute are controlled only by the player's own buttons.
  function removeGestureListeners() { /* No global gesture listeners. */ }

  // ---------- init ----------
  renderAll();
  // No media requests or audio until explicit player interaction.
})();
