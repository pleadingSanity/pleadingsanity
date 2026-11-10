/* Pleading Sanity Music — Shane's own audio files.
   Drives /music/index.html: renders tracks.json rows as big clickable play
   buttons (≥44px, aria-label "Play {title} by {artist}"), the sticky transport
   bar, seek, shuffle/repeat, a simple queue, and MediaSession lock-screen
   controls. Also renders Shane's playlist slots (YouTube / Sonos / Amazon Music)
   from /data/music-playlists.json as big themed buttons with an honest empty
   state when a URL is not filled. No external requests until a track is played.
   No purple/indigo. SVG-free text icons only. Evolution, not erasure. */
(function () {
  'use strict';
  if (document.getElementById('music-app-player-done')) return;
  var marker = document.createElement('meta');
  marker.id = 'music-app-player-done';
  document.head.appendChild(marker);

  var $ = function (id) { return document.getElementById(id); };
  var audio = $('track');
  var listEl = $('playlist');
  var emptyNote = $('empty-note');
  var nowTitle = $('now-title');
  var nowArtist = $('now-artist');
  var statusEl = $('player-status');
  var seek = $('seek');
  var btnPlay = $('play');
  var btnPrev = $('prev');
  var btnNext = $('next');
  var btnShuffle = $('shuffle');
  var btnRepeat = $('repeat');
  var btnQueue = $('queue-add');
  if (!audio || !listEl) return;

  var tracks = [];
  var index = 0;
  var queue = [];
  var shuffle = false;
  var repeat = false;
  var seekLock = false;

  function trackSrc(t) {
    return t && (t.src || t.url || t.file || t.audio || t.mp3 || '');
  }
  function status(msg) { if (statusEl) statusEl.textContent = msg; }

  function renderList() {
    listEl.innerHTML = '';
    if (!tracks.length) return;
    for (var i = 0; i < tracks.length; i++) {
      (function (t, i) {
        var li = document.createElement('li');
        li.style.margin = '.4rem 0';
        var src = trackSrc(t);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.style.cssText = 'width:100%;min-height:48px;text-align:left;display:flex;align-items:center;gap:.7rem;padding:.6rem .9rem;border-radius:12px;border:1px solid ' + (src ? 'rgba(0,255,240,.45)' : 'rgba(148,163,184,.3)') + ';background:#111827;color:#e8eef7;font:inherit;cursor:' + (src ? 'pointer' : 'default') + ';';
        var icon = document.createElement('span');
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = src
          ? '<svg width="16" height="16" viewBox="0 0 24 24" style="display:block;flex:0 0 auto;"><polygon points="6 4 20 12 6 20 6 4" fill="#00fff0"/></svg>'
          : '<svg width="16" height="16" viewBox="0 0 24 24" style="display:block;flex:0 0 auto;"><line x1="5" y1="12" x2="19" y2="12" stroke="#64748b" stroke-width="2" stroke-linecap="round"/></svg>';
        icon.style.cssText = 'flex:0 0 auto;';
        var meta = document.createElement('span');
        meta.style.cssText = 'flex:1 1 auto;min-width:0;display:flex;flex-direction:column;';
        var ti = document.createElement('span');
        ti.textContent = t.title || 'Untitled track';
        ti.style.cssText = 'font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
        var ar = document.createElement('span');
        ar.textContent = t.artist || 'Shane Cooper';
        ar.style.cssText = 'font-size:.85rem;color:#cbd5e1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
        meta.appendChild(ti); meta.appendChild(ar);
        btn.appendChild(icon); btn.appendChild(meta);
        if (src) {
          btn.setAttribute('aria-label', 'Play ' + (t.title || 'Untitled track') + ' by ' + (t.artist || 'Shane Cooper'));
          btn.addEventListener('click', function () { playIndex(i); });
        } else {
          btn.disabled = true;
          btn.setAttribute('aria-label', (t.title || 'Untitled track') + ' has no audio file yet');
        }
        if (i === index) {
          btn.style.borderColor = '#f59e0b';
          btn.style.background = 'rgba(245,158,11,.12)';
          btn.setAttribute('aria-current', 'true');
        }
        li.appendChild(btn);
        listEl.appendChild(li);
      })(tracks[i], i);
    }
  }

  function updateNow() {
    var t = tracks[index];
    if (nowTitle) nowTitle.textContent = t ? (t.title || 'Untitled track') : 'Nothing playing';
    if (nowArtist) nowArtist.textContent = t ? (t.artist || 'Shane Cooper') : 'Shane Cooper';
    if (btnPlay) {
      var playing = !audio.paused && !audio.ended;
      btnPlay.querySelector('span').textContent = playing ? 'Pause' : 'Play';
      btnPlay.setAttribute('aria-pressed', playing ? 'true' : 'false');
    }
    setMediaSession();
  }

  function setMediaSession() {
    var t = tracks[index];
    if (!('mediaSession' in navigator) || !t) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t.title || 'Untitled track',
        artist: t.artist || 'Shane Cooper',
        album: 'Pleading Sanity Music'
      });
      navigator.mediaSession.setActionHandler('play', function () { audio.play(); });
      navigator.mediaSession.setActionHandler('pause', function () { audio.pause(); });
      navigator.mediaSession.setActionHandler('previoustrack', function () { step(-1); });
      navigator.mediaSession.setActionHandler('nexttrack', function () { step(1); });
    } catch (e) {}
  }

  function loadIndex(i, autoplay) {
    var t = tracks[i];
    if (!t || !trackSrc(t)) { status('This track has no audio file.'); return; }
    index = i;
    audio.src = trackSrc(t);
    audio.preload = 'metadata';
    renderList();
    updateNow();
    if (autoplay) {
      var p = audio.play();
      if (p && typeof p.then === 'function') {
        p.then(function () { status('Playing ' + (t.title || 'track') + '.'); })
         .catch(function () { status('Press Play to start.'); });
      }
    }
  }

  function playIndex(i) { loadIndex(i, true); }

  function pickShuffle(exclude) {
    var playable = [];
    for (var i = 0; i < tracks.length; i++) if (trackSrc(tracks[i]) && i !== exclude) playable.push(i);
    if (!playable.length) return exclude >= 0 ? exclude : -1;
    return playable[Math.floor(Math.random() * playable.length)];
  }

  function step(dir) {
    if (queue.length) {
      var next = queue.shift();
      playIndex(next);
      return;
    }
    if (!tracks.length) return;
    var ni;
    if (shuffle) { ni = pickShuffle(index); if (ni < 0) ni = index; }
    else { ni = (index + dir + tracks.length) % tracks.length; }
    playIndex(ni);
  }

  if (btnPlay) btnPlay.addEventListener('click', function () {
    if (!tracks.length) { status('No tracks yet.'); return; }
    if (!audio.src) { loadIndex(index, true); return; }
    if (audio.paused) { audio.play().catch(function () { status('Press Play to start.'); }); }
    else { audio.pause(); }
  });
  if (btnPrev) btnPrev.addEventListener('click', function () { step(-1); });
  if (btnNext) btnNext.addEventListener('click', function () { step(1); });
  if (btnShuffle) btnShuffle.addEventListener('click', function () {
    shuffle = !shuffle;
    btnShuffle.setAttribute('aria-pressed', shuffle ? 'true' : 'false');
    status(shuffle ? 'Shuffle on.' : 'Shuffle off.');
  });
  if (btnRepeat) btnRepeat.addEventListener('click', function () {
    repeat = !repeat;
    btnRepeat.setAttribute('aria-pressed', repeat ? 'true' : 'false');
    status(repeat ? 'Repeat one on.' : 'Repeat off.');
  });
  if (btnQueue) btnQueue.addEventListener('click', function () {
    if (!tracks.length) return;
    var ni = shuffle ? pickShuffle(index) : (index + 1) % tracks.length;
    if (ni >= 0 && ni !== index) { queue.push(ni); status('Queued: ' + (tracks[ni].title || 'next track') + '.'); }
  });

  audio.addEventListener('play', updateNow);
  audio.addEventListener('pause', updateNow);
  audio.addEventListener('ended', function () {
    if (repeat) { audio.currentTime = 0; audio.play(); return; }
    step(1);
  });
  audio.addEventListener('timeupdate', function () {
    if (seekLock || !audio.duration) return;
    seek.value = Math.round((audio.currentTime / audio.duration) * 1000);
  });
  audio.addEventListener('loadedmetadata', function () {
    if (seek) seek.value = 0;
  });
  if (seek) {
    seek.addEventListener('input', function () { seekLock = true; });
    seek.addEventListener('change', function () {
      if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
      seekLock = false;
    });
  }

  // ---------- playlist slots (YouTube / Sonos / Amazon Music) ----------
  var PLATFORMS = [
    { key: 'youtube_url', name: 'YouTube', accent: '#ff0000' },
    { key: 'sonos_url', name: 'Sonos', accent: '#00fff0' },
    { key: 'amazon_music_url', name: 'Amazon Music', accent: '#f59e0b' }
  ];
  function ytNocookieUrl(url) {
    try {
      var list = url.match(/[?&]list=([A-Za-z0-9_-]+)/);
      if (list) return 'https://www.youtube-nocookie.com/embed/videoseries?list=' + list[1] + '&rel=0';
      var m = url.match(/(?:youtu\.be\/|\/embed\/|\/shorts\/|[?&]v=)([A-Za-z0-9_-]{11})/);
      if (m) return 'https://www.youtube-nocookie.com/embed/' + m[1] + '?rel=0';
      return null;
    } catch (e) { return null; }
  }
  function renderSlots(cfg) {
    var wrap = $('music-slots');
    if (!wrap) return;
    wrap.innerHTML = '';
    var title = document.createElement('h2');
    title.textContent = (cfg.label && cfg.label.trim()) ? cfg.label.trim() : "Shane's playlists";
    title.style.cssText = 'font-size:1.1rem;color:#00fff0;margin:1.2rem 0 .4rem;';
    wrap.appendChild(title);
    var intro = document.createElement('p');
    intro.className = 'note';
    intro.textContent = 'Open Shane\'s playlists in the official app. Sonos and Amazon Music cannot be embedded here — the button opens their app honestly. Empty slots are waiting for a link in data/music-playlists.json.';
    wrap.appendChild(intro);
    for (var i = 0; i < PLATFORMS.length; i++) {
      (function (plat) {
        var url = (cfg[plat.key] || '').trim();
        var slot = document.createElement('div');
        slot.style.cssText = 'margin:.5rem 0;';
        if (!url) {
          var hint = document.createElement('div');
          hint.setAttribute('role', 'note');
          hint.style.cssText = 'min-height:48px;display:flex;align-items:center;gap:.6rem;padding:.6rem 1rem;border-radius:12px;border:1px dashed rgba(148,163,184,.4);color:#94a3b8;font-size:.9rem;font-weight:600;';
          hint.textContent = 'Add your ' + plat.name + ' playlist link → data/music-playlists.json';
          slot.appendChild(hint);
        } else if (plat.key === 'youtube_url') {
          var embedUrl = ytNocookieUrl(url);
          if (embedUrl) {
            var playHere = document.createElement('button');
            playHere.type = 'button';
            playHere.textContent = 'Play ' + plat.name + ' playlist here';
            playHere.setAttribute('aria-label', 'Play ' + plat.name + ' playlist inline (privacy-enhanced, no cookies)');
            playHere.style.cssText = 'width:100%;min-height:48px;margin-bottom:.4rem;border-radius:12px;border:1px solid rgba(0,255,240,.5);background:rgba(0,255,240,.12);color:#e8eef7;font:inherit;font-weight:700;cursor:pointer;';
            var frameWrap = document.createElement('div');
            frameWrap.hidden = true;
            playHere.addEventListener('click', function () {
              var open = frameWrap.hidden;
              if (open && !frameWrap.firstChild) {
                var f = document.createElement('iframe');
                f.src = embedUrl;
                f.title = plat.name + ' playlist (privacy-enhanced embed, no cookies)';
                f.loading = 'lazy';
                f.setAttribute('allow', 'encrypted-media; fullscreen; picture-in-picture');
                f.style.cssText = 'display:block;width:100%;aspect-ratio:16/9;border:0;border-radius:12px;background:#000;';
                frameWrap.appendChild(f);
              }
              if (!open) frameWrap.textContent = '';
              frameWrap.hidden = !open;
              playHere.textContent = open ? 'Close inline player' : 'Play ' + plat.name + ' playlist here';
            });
            slot.appendChild(playHere); slot.appendChild(frameWrap);
          }
          var ytLink = document.createElement('a');
          ytLink.href = url; ytLink.target = '_blank'; ytLink.rel = 'noopener noreferrer';
          ytLink.textContent = 'Open on YouTube (new tab)';
          ytLink.setAttribute('aria-label', 'Open ' + plat.name + ' playlist on YouTube in a new tab');
          ytLink.style.cssText = 'display:inline-flex;align-items:center;min-height:44px;padding:.5rem 1rem;border-radius:12px;border:1px solid rgba(255,0,0,.5);color:#fca5a5;font-weight:700;text-decoration:none;';
          slot.appendChild(ytLink);
        } else {
          var ext = document.createElement('a');
          ext.href = url; ext.target = '_blank'; ext.rel = 'noopener noreferrer';
          var extLabel = plat.key === 'sonos_url' ? 'Open in Sonos app' : 'Open in Amazon Music';
          ext.textContent = extLabel;
          ext.setAttribute('aria-label', extLabel + ' (opens the official app or site, new tab)');
          ext.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:.5rem;min-height:48px;padding:.6rem 1rem;border-radius:12px;border:1px solid ' + plat.accent + ';background:rgba(0,0,0,.25);color:#e8eef7;font-weight:700;text-decoration:none;';
          var sub = document.createElement('div');
          sub.style.cssText = 'font-size:.78rem;color:#94a3b8;margin-top:.25rem;';
          sub.textContent = plat.key === 'sonos_url' ? 'Sonos cannot be embedded — this opens the Sonos app or site.' : 'Amazon Music cannot be embedded — this opens music.amazon.com.';
          slot.appendChild(ext); slot.appendChild(sub);
        }
        wrap.appendChild(slot);
      })(PLATFORMS[i]);
    }
  }

  // ---------- boot ----------
  fetch('/music/tracks.json', { cache: 'force-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      tracks = (j && Array.isArray(j.tracks)) ? j.tracks.filter(function (t) { return t && typeof t === 'object'; }) : [];
      if (!tracks.length) {
        if (emptyNote) emptyNote.textContent = (j && j.note) ? j.note : 'No songs uploaded yet. Shane adds his own audio files from the Creators hub. Other artists\' songs are on Sanity\'s Songs (YouTube).';
        if (btnPlay) btnPlay.disabled = true;
        status('No tracks yet — nothing to play.');
      } else {
        renderList();
        updateNow();
        status(tracks.length + ' track(s) ready. Tap a song or Play.');
      }
    })
    .catch(function () {
      if (emptyNote) emptyNote.textContent = 'Could not load the track list.';
      status('Track list unavailable.');
    });

  if (typeof fetch === 'function') {
    fetch('/data/music-playlists.json', { cache: 'force-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var cfg = { label: '', youtube_url: '', sonos_url: '', amazon_music_url: '' };
        if (j) { for (var k in cfg) { if (typeof j[k] === 'string') cfg[k] = j[k].trim(); } }
        renderSlots(cfg);
      })
      .catch(function () { renderSlots({ label: '', youtube_url: '', sonos_url: '', amazon_music_url: '' }); });
  } else {
    renderSlots({ label: '', youtube_url: '', sonos_url: '', amazon_music_url: '' });
  }
})();
