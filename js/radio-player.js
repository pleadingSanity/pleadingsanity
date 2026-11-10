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
          clearActive();
          btn.classList.add('is-active');
          if (audio.src !== src) audio.src = src;
          var playPromise = audio.play();
          if (playPromise && typeof playPromise.then === 'function') {
            playPromise.then(function () {
              status.textContent = 'Playing ' + name + (q ? ' · ' + q + ' kbps' : '') + '. Live broadcast — the station chooses what plays next. Sound follows your speakers, headphones, or Bluetooth.';
              if ('mediaSession' in navigator) {
                try { navigator.mediaSession.metadata = new MediaMetadata({ title: name, artist: 'Insane Radio · live' }); } catch (e) {}
              }
            }).catch(function () {
              status.textContent = 'Could not start ' + name + '. Try another station.';
              btn.classList.remove('is-active');
            });
          }
        });
      })(btns[i]);
    }
    if (stopBtn) {
      stopBtn.addEventListener('click', function () {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        clearActive();
        status.textContent = 'Station stopped.';
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); initStations(); });
  } else {
    init(); initStations();
  }
})();
