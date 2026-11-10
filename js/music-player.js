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

   EXTENSIONS (2026-11-10, music integrations slice):
   - Like / Dislike vote buttons per song. Disliked songs are
     skipped in the loop. Votes persist under localStorage keys
     prefixed "ps_music_" (ps_music_vote_<videoId>).
   - Expandable drawer with Shane's playlist slots (YouTube /
     Sonos / Amazon Music), wired to /data/music-playlists.json.
     Empty URLs render a "coming soon" placeholder. YouTube
     offers a privacy-enhanced youtube-nocookie.com inline embed
     (loaded only on demand, removed on close).
   - Playlist config shape (data/music-playlists.json):
       { "label": "...", "youtube_url": "", "sonos_url": "",
         "amazon_music_url": "" }
     All URL fields empty by default; fill with a full https URL.
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
  // Vote keys: ps_music_vote_<videoId> -> "like" | "dislike" (absent = none).
  function voteKey(id) { return 'ps_music_vote_' + id; }
  function readStore(key, fallback) {
    try { var v = localStorage.getItem(key); return (v === null || v === undefined) ? fallback : v; } catch (e) { return fallback; }
  }
  function writeStore(key, val) { try { localStorage.setItem(key, String(val)); } catch (e) {} }
  function removeStore(key) { try { localStorage.removeItem(key); } catch (e) {} }
  // ---- vote helpers (localStorage only, key prefix ps_music_) ----
  function getVote(id) { var v = readStore(voteKey(id), ''); return (v === 'like' || v === 'dislike') ? v : ''; }
  function isDisliked(id) { return getVote(id) === 'dislike'; }
  function likeCount(id) { return getVote(id) === 'like' ? 1 : 0; } // this device's likes; simple count
  function setVote(id, vote) {
    if (vote === 'like' || vote === 'dislike') writeStore(voteKey(id), vote);
    else removeStore(voteKey(id));
  }
  // Find next playable (non-disliked) index from fromIdx in direction dir (+1/-1).
  // Returns -1 when every song is disliked.
  function findPlayable(fromIdx, dir) {
    var n = PLAYLIST.length;
    for (var step = 1; step <= n; step++) {
      var idx = (fromIdx + dir * step % n + n) % n;
      if (!isDisliked(PLAYLIST[idx].id)) return idx;
    }
    return -1;
  }
  // ---- no-repeat + shuffle (2026-11 god-mode) ----
  // Played history persists under localStorage keys prefixed "ps_music_played_":
  //   ps_music_played_round      -> current round number
  //   ps_music_played_<videoId>  -> round in which that track last played
  // A track will not be picked again until every other playable (non-disliked)
  // track has played in the current round; the round then rolls over. Disliked
  // tracks are excluded from the pool and skipped as before.
  var K_ROUND = 'ps_music_played_round';
  function playedKey(id) { return 'ps_music_played_' + id; }
  var currentRound = parseInt(readStore(K_ROUND, '1'), 10) || 1;
  if (currentRound < 1) currentRound = 1;
  function playableIds() {
    var out = [];
    for (var i = 0; i < PLAYLIST.length; i++) if (!isDisliked(PLAYLIST[i].id)) out.push(PLAYLIST[i].id);
    return out;
  }
  function isPlayedThisRound(id) { return readStore(playedKey(id), '') === String(currentRound); }
  function markPlayed(id) { writeStore(playedKey(id), String(currentRound)); }
  function newRound() { currentRound += 1; writeStore(K_ROUND, String(currentRound)); }
  var lastLoadedId = null; // id we explicitly cued, to avoid fighting YouTube auto-advance
  // Pick a shuffled next track that has not played this round. Never returns excludeId.
  // Returns null when there is no other playable track (e.g. only one song not disliked).
  function pickNextShuffle(excludeId) {
    var pool = playableIds();
    if (pool.length <= 1) return pool.length === 1 && pool[0] !== excludeId ? pool[0] : null;
    var candidates = pool.filter(function (id) { return id !== excludeId && !isPlayedThisRound(id); });
    if (!candidates.length) { newRound(); candidates = pool.filter(function (id) { return id !== excludeId; }); }
    if (!candidates.length) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  function cueTrack(id) {
    lastLoadedId = id;
    postCmd('loadVideoById', [id]);
  }
  // Explicit "play this track" from a drawer row click. Loads the hidden YouTube
  // player on first use (starting at the chosen track), otherwise cues it.
  // Like/dislike buttons stop propagation and never trigger this.
  function playTrackById(id) {
    var idx = idToIndex(id);
    if (idx < 0) return;
    state.unlocked = true; removeGestureListeners();
    state.index = idx; writeStore(K_INDEX, idx);
    if (state.muted && !userExplicitlyMuted) { state.muted = false; writeStore(K_MUTED, '0'); }
    lastLoadedId = id; // accept this track, do not auto-skip as already-played
    if (!iframe.parentNode) { loadPlayer(); }
    else { cueTrack(id); }
    state.playing = true;
    renderPlayIcon(); renderTrack(); renderVotes();
  }
  var state = {
    index: parseInt(readStore(K_INDEX, '0'), 10) || 0,
    muted: readStore(K_MUTED, '1') === '1', // default muted until first gesture
    volume: parseInt(readStore(K_VOLUME, '15'), 10) || 15,
    unlocked: false,
    playing: false, // starts OFF — user chooses
    iframeReady: false,
    skipFor: null,  // videoId we already issued a skip for this occurrence
    skipGuard: 0,   // prevents infinite skip when everything is disliked
    drawerOpen: false,
    config: null,   // loaded lazily from /data/music-playlists.json
    configLoading: false
  };
  if (state.index < 0 || state.index >= PLAYLIST.length) state.index = 0;
  if (state.volume < 0) state.volume = 0;
  if (state.volume > 100) state.volume = 100;
  // If the restored index is disliked, move to the first playable song.
  if (isDisliked(PLAYLIST[state.index].id)) {
    var p0 = findPlayable(state.index, 1);
    if (p0 >= 0) state.index = p0;
  }
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
    lastLoadedId = PLAYLIST[state.index].id; // first cued track is accepted, not auto-skipped
    document.body.appendChild(iframe);
    return true;
  }
  function postCmd(func, args) {
    if (!iframe || !iframe.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: args || [] }), '*');
    } catch (e) {}
  }
  // ---------- inject drawer/vote/slot styles (self-contained) ----------
  (function injectStyles() {
    if (document.getElementById('ps-mp-drawer-styles')) return;
    var s = document.createElement('style');
    s.id = 'ps-mp-drawer-styles';
    s.textContent =
      '#ps-music-widget .ps-mp-list-btn.is-active{border-color:rgba(245,158,11,.7);background:rgba(245,158,11,.25);color:#fde68a;}' +
      '#ps-music-widget .ps-mp-drawer{display:block;width:100%;max-height:62vh;overflow-y:auto;overscroll-behavior:contain;border-radius:14px;background:rgba(6,16,28,.96);border:1px solid rgba(45,212,191,.35);box-shadow:0 -8px 28px rgba(0,0,0,.5),0 0 18px rgba(45,212,191,.12);padding:10px 10px 8px;font-family:inherit;margin-bottom:8px;box-sizing:border-box;}' +
      '#ps-music-widget .ps-mp-drawer[hidden]{display:none;}' +
      '#ps-music-widget .ps-mp-drawer-title{margin:4px 2px 6px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#5eead4;font-weight:700;}' +
      '#ps-music-widget .ps-mp-drawer-title.ps-mp-slots-title{margin-top:12px;border-top:1px solid rgba(148,163,184,.18);padding-top:10px;}' +
      '#ps-music-widget .ps-mp-votelist{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;}' +
      '#ps-music-widget .ps-mp-vrow{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:10px;background:rgba(13,27,42,.6);border:1px solid rgba(45,212,191,.12);}' +
      '#ps-music-widget .ps-mp-vrow.is-disliked{opacity:.55;border-style:dashed;border-color:rgba(248,113,113,.4);}' +
      '#ps-music-widget .ps-mp-vmeta{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px;}' +
      '#ps-music-widget .ps-mp-vtitle{color:#5eead4;font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '#ps-music-widget .ps-mp-vartist{color:#fcd34d;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '#ps-music-widget .ps-mp-vactions{display:flex;align-items:center;gap:4px;flex:0 0 auto;}' +
      '#ps-music-widget .ps-mp-vbtn{width:44px;height:44px;min-width:44px;min-height:44px;border-radius:50%;border:1px solid rgba(45,212,191,.35);background:rgba(20,184,166,.14);color:#cbd5e1;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;touch-action:manipulation;transition:background .15s ease,border-color .15s ease,color .15s ease;position:relative;}' +
      '#ps-music-widget .ps-mp-vbtn svg{width:18px;height:18px;display:block;}' +
      '#ps-music-widget .ps-mp-vbtn:hover{background:rgba(45,212,191,.3);border-color:rgba(45,212,191,.6);}' +
      '#ps-music-widget .ps-mp-vbtn:focus-visible{outline:2px solid #2dd4bf;outline-offset:2px;}' +
      '#ps-music-widget .ps-mp-vbtn.is-like.is-active{border-color:rgba(245,158,11,.7);background:rgba(245,158,11,.22);color:#fbbf24;}' +
      '#ps-music-widget .ps-mp-vbtn.is-dislike.is-active{border-color:rgba(248,113,113,.7);background:rgba(248,113,113,.18);color:#fca5a5;}' +
      '#ps-music-widget .ps-mp-lcount{position:absolute;bottom:-2px;right:-2px;min-width:16px;height:16px;padding:0 3px;border-radius:999px;background:#0b0f19;border:1px solid rgba(148,163,184,.3);font-size:10px;color:#94a3b8;display:inline-flex;align-items:center;justify-content:center;font-weight:700;line-height:1;}' +
      '#ps-music-widget .ps-mp-skipped{font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:#f87171;font-weight:700;flex:0 0 auto;}' +
      '#ps-music-widget .ps-mp-slots{display:flex;flex-direction:column;gap:6px;}' +
      '#ps-music-widget .ps-mp-slot{display:flex;align-items:center;justify-content:center;gap:6px;min-height:44px;border-radius:10px;padding:0 12px;font-size:12.5px;font-weight:700;text-decoration:none;text-align:center;line-height:1.2;}' +
      '#ps-music-widget .ps-mp-slot svg{width:13px;height:13px;flex:0 0 auto;}' +
      '#ps-music-widget .ps-mp-slot-on{border:1px solid rgba(45,212,191,.5);background:rgba(20,184,166,.16);color:#e2e8f0;cursor:pointer;transition:background .15s ease,border-color .15s ease;}' +
      '#ps-music-widget .ps-mp-slot-on:hover{background:rgba(45,212,191,.3);border-color:rgba(45,212,191,.8);color:#fef3c7;}' +
      '#ps-music-widget .ps-mp-slot-on:focus-visible{outline:2px solid #2dd4bf;outline-offset:2px;}' +
      '#ps-music-widget .ps-mp-slot-off{border:1px dashed rgba(148,163,184,.35);background:transparent;color:#64748b;cursor:default;}' +
      '#ps-music-widget .ps-mp-playbtn{display:flex;align-items:center;gap:8px;flex:1 1 auto;min-width:0;min-height:44px;margin:0;padding:6px 8px;border:0;border-radius:8px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;touch-action:manipulation;transition:background .15s ease;}' +
      '#ps-music-widget .ps-mp-playbtn:hover{background:rgba(0,255,240,.08);}' +
      '#ps-music-widget .ps-mp-playbtn:focus-visible{outline:2px solid #2dd4bf;outline-offset:2px;}' +
      '#ps-music-widget .ps-mp-playbtn svg{width:16px;height:16px;flex:0 0 auto;color:#5eead4;}' +
      '#ps-music-widget .ps-mp-vrow.is-current{border-color:rgba(0,255,240,.6);background:rgba(0,255,240,.08);}' +
      '#ps-music-widget .ps-mp-vrow.is-current .ps-mp-playbtn svg{color:#fbbf24;}' +
      '#ps-music-widget .ps-mp-soon-dot{width:6px;height:6px;border-radius:50%;background:#f59e0b;flex:0 0 auto;opacity:.8;}' +
      '#ps-music-widget .ps-mp-embed{display:block;width:100%;min-height:34px;margin-top:4px;border-radius:8px;border:1px solid rgba(245,158,11,.5);background:transparent;color:#fbbf24;font:inherit;font-size:11px;font-weight:700;cursor:pointer;}' +
      '#ps-music-widget .ps-mp-embed[aria-expanded="true"]{background:rgba(245,158,11,.14);}' +
      '#ps-music-widget .ps-mp-embed-frame iframe{display:block;width:100%;aspect-ratio:16/9;border:0;border-radius:8px;margin-top:6px;background:#000;}' +
      '#ps-music-widget .ps-mp-drawer-note{margin:8px 2px 2px;font-size:10px;color:#64748b;line-height:1.4;}' +
      '@media (max-width:420px){#ps-music-widget .ps-mp-drawer{left:0;right:0;max-height:55vh;}#ps-music-widget .ps-mp-slot{font-size:12px;}}' +
      '@media (prefers-reduced-motion:reduce){#ps-music-widget .ps-mp-vbtn,#ps-music-widget .ps-mp-slot-on{transition:none;}}';
    (document.head || document.documentElement).appendChild(s);
  })();
  // ---------- inject widget ----------
  // SVG icons (inline, no emoji)
  var ICON = {
    play:  '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/></svg>',
    prev:  '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="19 5 9 12 19 19 19 5" fill="currentColor" stroke="none"/><rect x="5" y="5" width="2.5" height="14" rx="1" fill="currentColor" stroke="none"/></svg>',
    next:  '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="5 5 15 12 5 19 5 5" fill="currentColor" stroke="none"/><rect x="16.5" y="5" width="2.5" height="14" rx="1" fill="currentColor" stroke="none"/></svg>',
    mute:  '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/><line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    vol:   '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/><path d="M15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    list:  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="4" height="4" rx="1" fill="currentColor" stroke="none"/><rect x="3" y="15" width="4" height="4" rx="1" fill="currentColor" stroke="none"/><rect x="10" y="6.5" width="11" height="2.5" rx="1.25" fill="currentColor" stroke="none"/><rect x="10" y="15.5" width="11" height="2.5" rx="1.25" fill="currentColor" stroke="none"/></svg>',
    like:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3zm0 0l4.2-7.4a1.6 1.6 0 0 1 2.9 1.3L13.4 8H19a2 2 0 0 1 2 2.4l-1.4 8A2 2 0 0 1 17.6 20H7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    dislike: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3zm0 0l-4.2 7.4a1.6 1.6 0 0 1-2.9-1.3L10.6 16H5a2 2 0 0 1-2-2.4l1.4-8A2 2 0 0 1 6.4 4H17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    ext:   '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  var widget = document.createElement('div');
  widget.id = 'ps-music-widget';
  widget.className = 'ps-music-widget';
  widget.setAttribute('role', 'region');
  widget.setAttribute('aria-label', 'Background music control');
  widget.innerHTML =
    '<div class="ps-mp-drawer" hidden aria-label="Playlist votes and more playlists"></div>' +
    '<div class="ps-mp-track">' +
      '<span class="ps-mp-title"></span>' +
      '<span class="ps-mp-sep"> — </span>' +
      '<span class="ps-mp-artist"></span>' +
    '</div>' +
    '<div class="ps-mp-controls">' +
      '<button type="button" class="ps-mp-btn ps-mp-prev" aria-label="Previous song" title="Previous song">' + ICON.prev + '</button>' +
      '<button type="button" class="ps-mp-btn ps-mp-play" aria-label="Pause" title="Pause">' + ICON.pause + '</button>' +
      '<button type="button" class="ps-mp-btn ps-mp-next" aria-label="Next song" title="Next song">' + ICON.next + '</button>' +
      '<button type="button" class="ps-mp-btn ps-mp-list-btn" aria-label="Playlist, votes and more playlists" title="Playlist, votes and more playlists" aria-expanded="false">' + ICON.list + '</button>' +
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
  var elList   = widget.querySelector('.ps-mp-list-btn');
  var elMute   = widget.querySelector('.ps-mp-mute');
  var elVol    = widget.querySelector('.ps-mp-volume');
  var elDrawer = widget.querySelector('.ps-mp-drawer');
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
  // ---------- drawer: playlist votes + Shane's playlist slots ----------
  var PLATFORMS = [
    { key: 'youtube_url',       name: 'YouTube' },
    { key: 'sonos_url',         name: 'Sonos' },
    { key: 'amazon_music_url',  name: 'Amazon Music' }
  ];
  var DEFAULT_CONFIG = { label: '', youtube_url: '', sonos_url: '', amazon_music_url: '' };
  function loadConfig(cb) {
    if (state.config) { cb(state.config); return; }
    if (state.configLoading) return; // caller will re-render on open
    state.configLoading = true;
    var done = function (cfg) { state.config = cfg || DEFAULT_CONFIG; state.configLoading = false; if (cb) cb(state.config); };
    if (typeof fetch !== 'function') { done(DEFAULT_CONFIG); return; }
    fetch('/data/music-playlists.json', { cache: 'force-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var cfg = {};
        for (var k in DEFAULT_CONFIG) {
          cfg[k] = (j && typeof j[k] === 'string') ? j[k].trim() : '';
        }
        done(cfg);
      })
      .catch(function () { done(DEFAULT_CONFIG); });
  }
  // Privacy-enhanced nocookie embed URL for a YouTube link, or null if not embeddable.
  function ytNocookieUrl(url) {
    try {
      var u = url;
      var list = u.match(/[?&]list=([A-Za-z0-9_-]+)/);
      if (list) return 'https://www.youtube-nocookie.com/embed/videoseries?list=' + list[1] + '&rel=0';
      var m = u.match(/(?:youtu\.be\/|\/embed\/|\/shorts\/|[?&]v=)([A-Za-z0-9_-]{11})/);
      if (m) return 'https://www.youtube-nocookie.com/embed/' + m[1] + '?rel=0';
      return null;
    } catch (e) { return null; }
  }
  function renderVotes() {
    var list = elDrawer.querySelector('.ps-mp-votelist');
    if (!list) return;
    list.innerHTML = '';
    for (var i = 0; i < PLAYLIST.length; i++) {
      (function (t) {
        var vote = getVote(t.id);
        var li = document.createElement('li');
        li.className = 'ps-mp-vrow' + (vote === 'dislike' ? ' is-disliked' : '');
        li.setAttribute('data-id', t.id);
        if (PLAYLIST[state.index].id === t.id) {
          li.classList.add('is-current');
          li.setAttribute('aria-current', 'true');
        }
        var playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.className = 'ps-mp-playbtn';
        playBtn.setAttribute('aria-label', 'Play ' + t.title + ' by ' + t.artist);
        playBtn.innerHTML = ICON.play;
        var meta = document.createElement('span');
        meta.className = 'ps-mp-vmeta';
        var ti = document.createElement('span'); ti.className = 'ps-mp-vtitle'; ti.textContent = t.title;
        var ar = document.createElement('span'); ar.className = 'ps-mp-vartist'; ar.textContent = t.artist;
        meta.appendChild(ti); meta.appendChild(ar);
        playBtn.appendChild(meta);
        playBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          playTrackById(t.id);
        });
        var actions = document.createElement('span'); actions.className = 'ps-mp-vactions';
        var likeBtn = document.createElement('button');
        likeBtn.type = 'button'; likeBtn.className = 'ps-mp-vbtn is-like' + (vote === 'like' ? ' is-active' : '');
        likeBtn.setAttribute('aria-label', 'Like ' + t.title); likeBtn.setAttribute('aria-pressed', vote === 'like' ? 'true' : 'false');
        likeBtn.innerHTML = ICON.like;
        var count = document.createElement('span'); count.className = 'ps-mp-lcount'; count.textContent = String(likeCount(t.id));
        likeBtn.appendChild(count);
        var disBtn = document.createElement('button');
        disBtn.type = 'button'; disBtn.className = 'ps-mp-vbtn is-dislike' + (vote === 'dislike' ? ' is-active' : '');
        disBtn.setAttribute('aria-label', 'Dislike and skip ' + t.title); disBtn.setAttribute('aria-pressed', vote === 'dislike' ? 'true' : 'false');
        disBtn.innerHTML = ICON.dislike;
        likeBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          setVote(t.id, getVote(t.id) === 'like' ? '' : 'like');
          state.skipFor = null; state.skipGuard = 0;
          renderVotes();
        });
        disBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          var nowDisliked = getVote(t.id) !== 'dislike';
          setVote(t.id, nowDisliked ? 'dislike' : '');
          // If the currently playing song is now disliked, skip it at once.
          if (nowDisliked && state.playing && PLAYLIST[state.index].id === t.id) {
            state.skipFor = t.id;
            postCmd('nextVideo', []);
          } else {
            state.skipFor = null; state.skipGuard = 0;
          }
          renderVotes();
        });
        actions.appendChild(likeBtn); actions.appendChild(disBtn);
        li.appendChild(playBtn); li.appendChild(actions);
        if (vote === 'dislike') {
          var sk = document.createElement('span'); sk.className = 'ps-mp-skipped'; sk.textContent = 'Skipped';
          li.appendChild(sk);
        }
        list.appendChild(li);
      })(PLAYLIST[i]);
    }
  }
  function renderSlots() {
    var cfg = state.config || DEFAULT_CONFIG;
    var wrap = elDrawer.querySelector('.ps-mp-slots');
    var titleEl = elDrawer.querySelector('.ps-mp-slots-title');
    if (!wrap) return;
    if (titleEl) titleEl.textContent = (cfg.label && cfg.label.trim()) ? cfg.label.trim() : 'More playlists';
    wrap.innerHTML = '';
    for (var i = 0; i < PLATFORMS.length; i++) {
      (function (plat) {
        var url = (cfg[plat.key] || '').trim();
        if (!url) {
          var off = document.createElement('span');
          off.className = 'ps-mp-slot ps-mp-slot-off';
          var dot = document.createElement('span'); dot.className = 'ps-mp-soon-dot';
          off.appendChild(dot);
          off.appendChild(document.createTextNode('Add your ' + plat.name + ' playlist link → data/music-playlists.json'));
          wrap.appendChild(off);
          return;
        }
        var a = document.createElement('a');
        a.className = 'ps-mp-slot ps-mp-slot-on';
        a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        var slotLabel = plat.key === 'youtube_url' ? 'Play on YouTube' : (plat.key === 'sonos_url' ? 'Open in Sonos app' : 'Open in Amazon Music');
        a.textContent = slotLabel + ' ';
        a.setAttribute('aria-label', slotLabel + ' (opens in a new tab or app)');
        a.insertAdjacentHTML('beforeend', ICON.ext);
        wrap.appendChild(a);
        if (plat.key === 'youtube_url') {
          var embedUrl = ytNocookieUrl(url);
          if (embedUrl) {
            var btn = document.createElement('button');
            btn.type = 'button'; btn.className = 'ps-mp-embed'; btn.setAttribute('aria-expanded', 'false');
            btn.textContent = 'Inline player (privacy-enhanced)';
            var frame = document.createElement('div'); frame.className = 'ps-mp-embed-frame'; frame.hidden = true;
            btn.addEventListener('click', function (e) {
              e.stopPropagation();
              var open = frame.hidden;
              if (open && !frame.firstChild) {
                var f = document.createElement('iframe');
                f.src = embedUrl;
                f.title = 'YouTube playlist (privacy-enhanced embed, no cookies)';
                f.loading = 'lazy';
                f.setAttribute('allow', 'encrypted-media; fullscreen; picture-in-picture');
                frame.appendChild(f);
              }
              if (!open) { frame.textContent = ''; } // closing stops the music
              frame.hidden = !open;
              btn.setAttribute('aria-expanded', String(open));
              btn.textContent = open ? 'Close inline player' : 'Inline player (privacy-enhanced)';
            });
            wrap.appendChild(btn); wrap.appendChild(frame);
          }
        }
      })(PLATFORMS[i]);
    }
  }
  function renderDrawer() {
    if (!elDrawer.querySelector('.ps-mp-votelist')) {
      elDrawer.innerHTML =
        '<p class="ps-mp-drawer-title">Playlist — like or skip</p>' +
        '<ul class="ps-mp-votelist"></ul>' +
        '<p class="ps-mp-drawer-title ps-mp-slots-title">More playlists</p>' +
        '<div class="ps-mp-slots"></div>' +
        '<p class="ps-mp-drawer-note">Votes saved on this device only. A disliked song is skipped. Shuffle on: a song will not repeat until every other song has played. External playlists open in their own app or a new tab — Sonos and Amazon Music cannot be embedded here.</p>';
    }
    renderVotes();
    renderSlots();
  }
  function toggleDrawer() {
    state.drawerOpen = !state.drawerOpen;
    elDrawer.hidden = !state.drawerOpen;
    elList.classList.toggle('is-active', state.drawerOpen);
    elList.setAttribute('aria-expanded', state.drawerOpen ? 'true' : 'false');
    if (state.drawerOpen) {
      renderDrawer();
      loadConfig(function () { renderSlots(); });
    }
  }
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
        var vid = data.info.videoData.video_id;
        var idx = idToIndex(vid);
        if (idx >= 0 && idx !== state.index) {
          state.index = idx;
          writeStore(K_INDEX, idx);
          renderTrack();
        }
        // ---- vote skip: a disliked song must not play; shuffle to an unplayed one ----
        if (isDisliked(vid)) {
          if (state.skipFor !== vid) {
            state.skipFor = vid;
            if (state.skipGuard < PLAYLIST.length) {
              state.skipGuard++;
              var nxt = pickNextShuffle(vid);
              if (nxt) cueTrack(nxt); else postCmd('nextVideo', []);
            } else {
              // Everything is disliked: stop instead of looping forever.
              postCmd('pauseVideo', []);
              state.playing = false;
              renderPlayIcon();
            }
          }
        } else {
          state.skipFor = null;
          state.skipGuard = 0;
          var alreadyPlayed = isPlayedThisRound(vid);
          if (vid !== lastLoadedId && alreadyPlayed) {
            // YouTube's own playlist auto-advance landed on an already-played track
            // while unplayed ones remain — shuffle past it (no-repeat).
            var alt = pickNextShuffle(vid);
            if (alt) { cueTrack(alt); } else { markPlayed(vid); lastLoadedId = null; }
          } else {
            markPlayed(vid); // counts as played this round — no repeat until others have played
            lastLoadedId = null; // accepted track (ours, or a fresh unplayed one)
          }
        }
      }
      if (typeof data.info.playerState === 'number') {
        var s = data.info.playerState;
        if (s === 1) { state.playing = true; renderPlayIcon(); }
        else if (s === 2) { state.playing = false; renderPlayIcon(); }
        else if (s === 0 && state.playing) {
          // Track ended: shuffle to an unplayed track (no-repeat). If every other
          // track has played, the round rolls over automatically in pickNextShuffle.
          var curId = PLAYLIST[state.index] ? PLAYLIST[state.index].id : null;
          var after = pickNextShuffle(curId);
          if (after) cueTrack(after);
        }
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
    var pp = findPlayable(state.index, -1);
    if (pp >= 0) state.index = pp;
    writeStore(K_INDEX, state.index);
    lastLoadedId = PLAYLIST[state.index].id; // explicit prev: allow repeat, do not auto-skip
    loadPlayer();
    state.playing = true; renderPlayIcon(); renderTrack();
  });
  elNext.addEventListener('click', function (e) {
    stopProp(e);
    state.unlocked = true; removeGestureListeners();
    var cur = PLAYLIST[state.index] ? PLAYLIST[state.index].id : null;
    var nxt = pickNextShuffle(cur);
    if (nxt && iframe.parentNode) {
      cueTrack(nxt);
      var ni = idToIndex(nxt);
      if (ni >= 0) { state.index = ni; writeStore(K_INDEX, ni); renderTrack(); }
    } else if (nxt) {
      var ni2 = idToIndex(nxt);
      if (ni2 >= 0) { state.index = ni2; writeStore(K_INDEX, ni2); }
      loadPlayer();
    } else {
      if (iframe.parentNode) postCmd('nextVideo', []); else loadPlayer();
    }
    state.playing = true; renderPlayIcon();
  });
  elList.addEventListener('click', function (e) { stopProp(e); toggleDrawer(); });
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
