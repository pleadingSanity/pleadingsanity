/* Insane Radio — consent-first continuous official YouTube embeds. No hosted audio. */
(function () {
  'use strict';
  var tracks = [], index = 0, player = null, wanted = false, ready = false, loadedId = null;
  var loadTimer = null, progressTimer = null, fadeTimer = null, generation = 0, failures = 0;
  var STATE = {ENDED:0, PLAYING:1, PAUSED:2, BUFFERING:3, CUED:5};
  // ---- per-track like/dislike votes (device-local, ps_radio_vote_ prefix) ----
  // Disliked tracks are skipped in the continuous stream. Like is a saved favourite
  // marker only (no count server). Buttons are injected into the player card so they
  // are visible and tappable (≥44px) on mobile — Shane's #1 ask.
  var RV_KEY = function (id) { return 'ps_radio_vote_' + id; };
  function rvRead(k, fb) { try { var v = localStorage.getItem(k); return (v === null || v === undefined) ? fb : v; } catch (e) { return fb; } }
  function rvWrite(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }
  function rvRemove(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function rvGet(id) { var v = rvRead(RV_KEY(id), ''); return (v === 'like' || v === 'dislike') ? v : ''; }
  function rvIsDisliked(id) { return rvGet(id) === 'dislike'; }
  function rvSet(id, vote) { if (vote === 'like' || vote === 'dislike') rvWrite(RV_KEY(id), vote); else rvRemove(RV_KEY(id)); }
  function rvFindPlayable(fromIdx, dir) {
    var n = tracks.length;
    for (var step = 1; step <= n; step++) {
      var idx = (fromIdx + dir * step % n + n) % n;
      if (tracks[idx] && !rvIsDisliked(tracks[idx].youtubeId)) return idx;
    }
    return -1;
  }
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
  function genreLabel(g) {
    if (g === 'rnb') return 'R&B';
    if (g === 'hiphop') return 'Hip-Hop';
    if (g === 'grime') return 'Grime';
    return g ? String(g).replace(/[-_]/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }) : '';
  }
  function shareTrack(button, t) {
    button.setAttribute('data-ps-share', 'song');
    button.setAttribute('data-ps-title', t.title);
    button.setAttribute('data-ps-artist', t.artist);
    button.setAttribute('data-ps-url', valid(t.youtubeId) ? 'https://pleadingsanity.co.uk/insane-radio.html?track=' + encodeURIComponent(t.youtubeId) : official(t));
  }
  function render() {
    var t = track(); if (!t) return;
    label('radio-title', t.title); label('radio-artist', t.artist);
    var metaBits = [genreLabel(t.genre), t.album, t.year, t.region].filter(Boolean);
    label('radio-era', metaBits.join(' · '));
    var link = el('radio-support'); if (link) { link.href = official(t); link.textContent = 'Open official music link'; }
    var list = el('radio-upnext'); if (list) {
      list.replaceChildren();
      for (var i = 1; i < Math.min(tracks.length, 5); i++) {
        var t2 = tracks[(index + i) % tracks.length];
        var item = document.createElement('li');
        var b = document.createElement('button');
        b.type = 'button';
        shareTrack(b, t2);
        b.textContent = t2.title + ' · ' + t2.artist;
        b.setAttribute('aria-label', 'Play ' + t2.title + ' by ' + t2.artist);
        b.style.cssText = 'display:block;width:100%;min-height:44px;text-align:left;background:transparent;border:0;color:inherit;font:inherit;cursor:pointer;padding:.5rem;border-radius:8px;';
        (function (targetIdx) {
          b.addEventListener('click', function () {
            index = targetIdx;
            if (wanted) { generation++; startCurrent(); }
            else { render(); label('radio-status', 'Selected — press Play'); }
          });
        })((index + i) % tracks.length);
        item.appendChild(b);
        list.appendChild(item);
      }
    }
    var full = el('radio-tracklist');
    if (full) {
      var sumEl = el('radio-tracklist-summary');
      if (sumEl) sumEl.textContent = 'All ' + tracks.length + ' tracks — tap any song to play';
      full.replaceChildren();
      for (var j = 0; j < tracks.length; j++) {
        (function (tj, targetIdx) {
          var li2 = document.createElement('li');
          var btn = document.createElement('button');
          btn.type = 'button';
          shareTrack(btn, tj);
          var hasVid = !!(tj.youtubeId && String(tj.youtubeId).trim());
          btn.textContent = (targetIdx + 1) + '. ' + tj.title + ' · ' + tj.artist + (hasVid ? '' : '  (official link only)');
          btn.setAttribute('aria-label', 'Play ' + tj.title + ' by ' + tj.artist + (hasVid ? '' : ', no in-page video'));
          btn.className = 'radio-tracklist-btn' + (targetIdx === index ? ' is-current' : '');
          btn.addEventListener('click', function () {
            index = targetIdx;
            if (wanted) { generation++; startCurrent(); }
            else { render(); label('radio-status', hasVid ? 'Selected — press Play' : 'No in-page video for this track — use the official link'); }
          });
          li2.appendChild(btn);
          full.appendChild(li2);
        })(tracks[j], j);
      }
    }
    var art = el('radio-art-title'); if (art) art.textContent = genreLabel(t.genre) || 'INSANE RADIO';
    resetProgress();
    updateVoteUI();
  }
  function fadeSwitch(fn) {
    var card = el('radio-card');
    if (card && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      card.classList.add('is-switching');
      setTimeout(function () { card.classList.remove('is-switching'); }, 260);
    }
    fn();
  }
  // ---------- like / dislike vote row (injected into the player card) ----------
  var voteLikeBtn = null, voteDisBtn = null;
  var VOTE_SVG = {
    like: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style="display:block;"><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3zm0 0l4.2-7.4a1.6 1.6 0 0 1 2.9 1.3L13.4 8H19a2 2 0 0 1 2 2.4l-1.4 8A2 2 0 0 1 17.6 20H7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    dislike: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style="display:block;"><path d="M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3zm0 0l-4.2 7.4a1.6 1.6 0 0 1-2.9-1.3L10.6 16H5a2 2 0 0 1-2-2.4l1.4-8A2 2 0 0 1 6.4 4H17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
  };
  function updateVoteUI() {
    var t = track(); if (!t || !voteLikeBtn || !voteDisBtn) return;
    var v = rvGet(t.youtubeId);
    voteLikeBtn.classList.toggle('is-active', v === 'like');
    voteLikeBtn.setAttribute('aria-pressed', v === 'like' ? 'true' : 'false');
    voteDisBtn.classList.toggle('is-active', v === 'dislike');
    voteDisBtn.setAttribute('aria-pressed', v === 'dislike' ? 'true' : 'false');
  }
  function injectVoteUI() {
    var card = el('radio-card'); if (!card) return;
    var hint = card.querySelector('.radio-hint');
    var row = document.createElement('div');
    row.className = 'radio-vote-row';
    row.setAttribute('aria-label', 'Rate this track');
    row.style.cssText = 'display:flex;gap:.6rem;justify-content:center;margin:.4rem 0 .2rem;flex-wrap:wrap;';
    voteLikeBtn = document.createElement('button');
    voteLikeBtn.type = 'button';
    voteLikeBtn.className = 'radio-vote-btn radio-vote-like';
    voteLikeBtn.innerHTML = VOTE_SVG.like + '<span style="font-size:.8rem;font-weight:700;">Like</span>';
    voteLikeBtn.setAttribute('aria-label', 'Like this track');
    voteLikeBtn.setAttribute('aria-pressed', 'false');
    voteDisBtn = document.createElement('button');
    voteDisBtn.type = 'button';
    voteDisBtn.className = 'radio-vote-btn radio-vote-dislike';
    voteDisBtn.innerHTML = VOTE_SVG.dislike + '<span style="font-size:.8rem;font-weight:700;">Dislike &amp; skip</span>';
    voteDisBtn.setAttribute('aria-label', 'Dislike this track and skip it in future');
    voteDisBtn.setAttribute('aria-pressed', 'false');
    voteLikeBtn.addEventListener('click', function () {
      var t = track(); if (!t) return;
      rvSet(t.youtubeId, rvGet(t.youtubeId) === 'like' ? '' : 'like');
      updateVoteUI();
      label('radio-status', rvGet(t.youtubeId) === 'like' ? 'Saved as liked on this device.' : 'Like removed.');
    });
    voteDisBtn.addEventListener('click', function () {
      var t = track(); if (!t) return;
      var nowDisliked = rvGet(t.youtubeId) !== 'dislike';
      rvSet(t.youtubeId, nowDisliked ? 'dislike' : '');
      updateVoteUI();
      if (nowDisliked && wanted) {
        label('radio-status', 'Disliked — skipping.');
        move(1, false);
      } else {
        label('radio-status', nowDisliked ? 'Disliked — will be skipped from now on.' : 'Skip removed.');
      }
    });
    row.append(voteLikeBtn, voteDisBtn);
    if (hint && hint.parentNode) hint.parentNode.insertBefore(row, hint);
    else card.appendChild(row);
    updateVoteUI();
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
    if (t && rvIsDisliked(t.youtubeId)) { label('radio-status', 'Disliked — skipping.'); move(1, false); return; }
    fadeSwitch(render);
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
    if (wanted) {
      var guard = 0;
      while (tracks[index] && rvIsDisliked(tracks[index].youtubeId) && guard < tracks.length) {
        index = (index + 1) % tracks.length; guard++;
      }
      if (guard >= tracks.length) {
        wanted = false; stateUI(false);
        label('radio-status', 'Every track is disliked. Clear a dislike or use the official link.');
        safeCall('stopVideo'); return;
      }
      startCurrent();
    } else { render(); label('radio-status', 'Selected — press Play'); }
  }
  function stop() {
    wanted = false; generation++; clearLoad(); clearFade();
    safeCall('pauseVideo'); stateUI(false);
    label('radio-status', 'Paused — press Play to continue');
  }
  // ---- unified stop-all + floating Stop (Shane: make radio easy to turn off) ----
  var floatStop = null, stationGeneration = 0;
  function showFloatStop() { if (floatStop) floatStop.hidden = false; }
  function hideFloatStop() { if (floatStop) floatStop.hidden = true; }
  function stopStationAudio() {
    stationGeneration++;
    var a = el('station-audio');
    if (a) { try { a.pause(); a.removeAttribute('src'); a.load(); } catch (e) {} }
    var btns = document.querySelectorAll('.station-play');
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove('is-active');
    var st = el('station-status'); if (st) st.textContent = 'Station stopped.';
  }
  function stopAll() {
    document.dispatchEvent(new CustomEvent('ps-audio-stop'));
    stop();
    stopStationAudio();
    hideFloatStop();
    label('radio-status', 'Stopped — all audio off. Press Play to start again.');
  }
  function play() {
    if (!tracks.length) return;
    document.dispatchEvent(new CustomEvent('ps-audio-focus', {detail:{source:'radio'}}));
    stopStationAudio();
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
      stateUI(true); label('radio-status', 'Now playing · official YouTube source'); showFloatStop();
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
    var stopBtn = el('radio-stop'); if (stopBtn) stopBtn.addEventListener('click', stopAll);
    floatStop = el('radio-float-stop'); if (floatStop) floatStop.addEventListener('click', stopAll);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      stopAll();
    });
    document.addEventListener('ps-audio-focus', function (e) { if (e.detail.source !== 'radio') { stop(); stopStationAudio(); hideFloatStop(); if (e.detail.source === 'widget') showFloatStop(); } });
    document.addEventListener('ps-audio-stop', function () { stop(); stopStationAudio(); hideFloatStop(); });
    document.addEventListener('ps-playlist-opened', showFloatStop);
    progressTimer = setInterval(tick, 500);
    fetch('/data/radio-library.json').then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (data) {
      tracks = Array.isArray(data.tracks) ? data.tracks.filter(function (t) { return t && typeof t.title === 'string' && typeof t.artist === 'string'; }) : [];
      if (!tracks.length) { label('radio-status', 'Track list empty.'); return; }
      var selected = new URLSearchParams(window.location.search).get('track');
      var selectedIndex = tracks.findIndex(function (t) { return valid(selected) && t.youtubeId === selected; });
      if (selectedIndex >= 0) index = selectedIndex;
      render(); injectVoteUI(); label('radio-status', 'Ready — press Play once for continuous listening');
      initYouTube();
    }).catch(function () { label('radio-status', 'Track list unavailable. Please try again later.'); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearFade(); });
  }
  // ---------- live station engine (station cards, #station-audio, #station-stop) ----------
  // Evolution Not Erasure: same engine as the former inline script, extended to the
  // card grid. Audio element and Stop button contract preserved exactly.
  function initStations() {
    var audio = document.getElementById('station-audio');
    var status = document.getElementById('station-status');
    var stopBtn = document.getElementById('station-stop');
    if (!audio || !status) return;
    function clearActive() {
      var btns = document.querySelectorAll('.station-play');
      for (var i = 0; i < btns.length; i++) btns[i].classList.remove('is-active');
    }
    var btns = document.querySelectorAll('.station-play[data-src]');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var src = btn.getAttribute('data-src');
          var name = btn.getAttribute('data-name');
          var q = btn.getAttribute('data-q') || '';
          document.dispatchEvent(new CustomEvent('ps-audio-focus', {detail:{source:'radio'}}));
          stopStationAudio(); stop();
          var token = ++stationGeneration;
          btn.classList.add('is-active');
          audio.src = src;
          status.textContent = 'Connecting to ' + name + '…';
          showFloatStop();
          function started() {
            if (token !== stationGeneration) return;
            status.textContent = 'Playing ' + name + (q ? ' · ' + q + ' kbps' : '') + '. Live broadcast — the station chooses what plays next.';
            if ('mediaSession' in navigator) {
              try { navigator.mediaSession.metadata = new MediaMetadata({ title:name, artist:'Insane Radio · live' }); } catch (e) {}
            }
          }
          function failed() {
            if (token !== stationGeneration) return;
            stopStationAudio(); hideFloatStop();
            status.textContent = 'Could not start ' + name + '. Open its official listening link or try another station.';
          }
          audio.onplaying = started;
          audio.onerror = failed;
          audio.onwaiting = function () { if (token === stationGeneration) status.textContent = 'Buffering ' + name + '…'; };
          try {
            var playPromise = audio.play();
            if (playPromise && typeof playPromise.then === 'function') playPromise.then(started).catch(failed);
          } catch (e) { failed(); }
        });
      })(btns[i]);
    }
    if (stopBtn) {
      stopBtn.addEventListener('click', stopAll);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); initStations(); });
  } else {
    init(); initStations();
  }
})();

/* ============================================================
   R2 RADIO POLISH SHARD (dola/r2-radio-20261112) — appended,
   additive only. Does NOT modify any existing function, hook,
   ID or class. Provides: cosmic SVG transport icons, share-button
   data attributes on every rendered track (picked up by
   js/radio-share.js), active-station equalizer indicator, station
   volume control, cross-page playback handoff writes, and the
   honest on-page persistence note. All wrapped in try/catch.
   ============================================================ */
(function () {
  'use strict';
  try {
    var ICONS = (window.PSRadioShare && window.PSRadioShare.ICONS) || null;
    var RADIO_PAGE = (window.PSRadioShare && window.PSRadioShare.RADIO_PAGE) || 'https://pleadingsanity.co.uk/insane-radio.html';
    var HANDOFF_KEY = 'psRadioHandoff';
    function readStore(k, fb) { try { var v = localStorage.getItem(k); return (v === null || v === undefined) ? fb : v; } catch (e) { return fb; } }
    function writeStore(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }
    function removeStore(k) { try { localStorage.removeItem(k); } catch (e) {} }
    function writeHandoff(obj) { writeStore(HANDOFF_KEY, JSON.stringify(obj)); }
    function clearHandoff() { removeStore(HANDOFF_KEY); }

    function el(id) { return document.getElementById(id); }

    // ---- 1. transport buttons: prepend cosmic SVG icon, keep text ----
    function iconSpan(markup) {
      var s = document.createElement('span');
      s.className = 'psr-ic';
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = markup;
      return s;
    }
    function decorateTransport() {
      var play = el('radio-play'), prev = el('radio-prev'), next = el('radio-next');
      if (prev && !prev.querySelector('.psr-ic') && ICONS) { prev.insertBefore(iconSpan(ICONS.prev), prev.firstChild); }
      if (next && !next.querySelector('.psr-ic') && ICONS) { next.insertBefore(iconSpan(ICONS.next), next.firstChild); }
      // play button toggles text Play/Pause in stateUI; re-prepend icon on a timer
      setInterval(function () {
        var p = el('radio-play');
        if (!p || !ICONS) return;
        if (!p.querySelector('.psr-ic')) p.insertBefore(iconSpan(p.textContent && p.textContent.indexOf('Pause') >= 0 ? ICONS.pause : ICONS.play), p.firstChild);
      }, 400);
    }

    // ---- 2. share data attributes on rendered tracks (radio-share.js augments) ----
    // Parse "title · artist" from button text; tolerate "N. title · artist" and
    // "  (official link only)" suffix. URL = radio page (no external hotlinks).
    function decorateTrackButton(btn) {
      if (!btn || btn.classList.contains('ps-share-btn') || btn.getAttribute('data-ps-share')) return;
      var raw = (btn.textContent || '').trim();
      raw = raw.replace(/^\d+\.\s*/, '').replace(/\s*\(official link only\)\s*$/, '').trim();
      var parts = raw.split('·');
      var title = (parts[0] || '').trim();
      var artist = (parts[1] || '').trim();
      btn.setAttribute('data-ps-share', 'song');
      if (title) btn.setAttribute('data-ps-title', title);
      if (artist) btn.setAttribute('data-ps-artist', artist);
      btn.setAttribute('data-ps-url', RADIO_PAGE);
    }
    function scanTracks() {
      var up = el('radio-upnext');
      if (up) { var b1 = up.querySelectorAll('button'); for (var i = 0; i < b1.length; i++) decorateTrackButton(b1[i]); }
      var full = el('radio-tracklist');
      if (full) { var b2 = full.querySelectorAll('button'); for (var j = 0; j < b2.length; j++) decorateTrackButton(b2[j]); }
    }

    // ---- 3. active-station equalizer indicator (injected into each station card) ----
    function injectStationEq() {
      if (!ICONS) return;
      var btns = document.querySelectorAll('.station-play');
      for (var i = 0; i < btns.length; i++) {
        if (btns[i].querySelector('.ps-station-eq')) continue;
        var eq = document.createElement('span');
        eq.className = 'ps-station-eq';
        eq.setAttribute('aria-hidden', 'true');
        eq.innerHTML = ICONS.eq;
        btns[i].appendChild(eq);
      }
    }

    // ---- 4. station volume control (next to Stop button) ----
    function injectStationVolume() {
      var audio = el('station-audio');
      var stopBtn = el('station-stop');
      if (!audio || !stopBtn || document.querySelector('.ps-station-volume')) return;
      var wrap = document.createElement('div');
      wrap.className = 'ps-station-volume';
      wrap.setAttribute('role', 'group');
      wrap.setAttribute('aria-label', 'Live station volume');
      var ic = document.createElement('span');
      ic.className = 'psr-ic';
      ic.setAttribute('aria-hidden', 'true');
      ic.innerHTML = ICONS ? ICONS.volume : '';
      var slider = document.createElement('input');
      slider.type = 'range'; slider.min = '0'; slider.max = '100'; slider.step = '1'; slider.value = '80';
      slider.setAttribute('aria-label', 'Live station volume level');
      var label = document.createElement('span');
      label.className = 'ps-station-vol-label';
      label.textContent = '80%';
      audio.volume = 0.8;
      slider.addEventListener('input', function () {
        var v = parseInt(slider.value, 10) || 0;
        audio.volume = v / 100;
        label.textContent = v + '%';
      });
      wrap.appendChild(ic); wrap.appendChild(slider); wrap.appendChild(label);
      var actions = stopBtn.parentNode;
      if (actions) actions.insertBefore(wrap, stopBtn.nextSibling);
    }

    // ---- 5. cross-page handoff writes ----
    function wireHandoff() {
      var audio = el('station-audio');
      if (audio) {
        audio.addEventListener('play', function () {
          var active = document.querySelector('.station-play.is-active');
          var name = active ? (active.getAttribute('data-name') || 'Live station') : 'Live station';
          var src = audio.src || '';
          var q = active ? (active.getAttribute('data-q') || '') : '';
          writeHandoff({ kind: 'station', name: name, src: src, q: q, playing: true, ts: Date.now() });
        });
        audio.addEventListener('pause', function () { clearHandoff(); });
        audio.addEventListener('emptied', function () { clearHandoff(); });
      }
      // YouTube curated tracks: observe .is-playing on radio-card + read title/artist.
      // YouTube cannot truly resume cross-page (iframe is destroyed), so we record
      // now-playing info honestly (kind=track, resumable=false) for the widget chip.
      var card = el('radio-card');
      if (card && 'MutationObserver' in window) {
        var mo = new MutationObserver(function () {
          var playing = card.classList.contains('is-playing');
          if (playing) {
            var title = (el('radio-title') && el('radio-title').textContent) || '';
            var artist = (el('radio-artist') && el('radio-artist').textContent) || '';
            writeHandoff({ kind: 'track', title: title, artist: artist, resumable: false, playing: true, ts: Date.now() });
          } else {
            // only clear if we wrote a track handoff (don't clobber station handoff)
            try {
              var cur = JSON.parse(readStore(HANDOFF_KEY, 'null'));
              if (cur && cur.kind === 'track') clearHandoff();
            } catch (e) {}
          }
        });
        mo.observe(card, { attributes: true, attributeFilter: ['class'] });
      }
      // clear handoff when leaving the radio page (station audio stops on unload)
      window.addEventListener('pagehide', function () {
        try {
          var cur = JSON.parse(readStore(HANDOFF_KEY, 'null'));
          if (cur && cur.kind === 'station' && cur.playing) {
            // keep it — the next page's widget will attempt resume
            cur.ts = Date.now();
            writeHandoff(cur);
          }
        } catch (e) {}
      });
    }

    // ---- 6. honest on-page persistence note ----
    function injectPersistNote() {
      if (document.querySelector('.ps-persist-note')) return;
      var card = el('radio-card');
      if (!card) return;
      var note = document.createElement('p');
      note.className = 'ps-persist-note';
      note.textContent = 'Keep this tab open to keep listening. Opening another site page here interrupts playback; a station resume control may be offered on the next page. Phone lock and app switching depend on your browser and OS. Installing the site does not guarantee background audio.';
      card.parentNode.insertBefore(note, card.nextSibling);
    }

    function boot() {
      try {
        decorateTransport();
        injectStationEq();
        injectStationVolume();
        wireHandoff();
        injectPersistNote();
        scanTracks();
        // re-scan for late-rendered tracks (render() rebuilds lists on track change)
        setInterval(scanTracks, 1200);
        if ('MutationObserver' in window) {
          var up = el('radio-upnext'), full = el('radio-tracklist');
          var mo = new MutationObserver(function () { scanTracks(); });
          if (up) mo.observe(up, { childList: true, subtree: true });
          if (full) mo.observe(full, { childList: true, subtree: true });
        }
      } catch (e) {}
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  } catch (e) { /* never break the player */ }
})();
