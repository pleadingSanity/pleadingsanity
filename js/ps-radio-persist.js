/* P.S Radio — first-party music app player.
   Docked mini-player plus a tiny same-origin page swap so audio can
   keep playing while people browse. Full-page loads resume the saved
   position from localStorage (this browser only). No autoplay, no
   tracking, no libraries. Evolution, not erasure. */
(function () {
  'use strict';
  if (window.PSRadio) return;

  var CATALOG_URL = '/data/ps-playlists.json';
  var K_STATE = 'ps_radio_state';
  var K_RECENT = 'ps_radio_recent';
  var K_HIDDEN = 'ps_radio_hidden';
  var MAX_RECENT = 10;
  var SRC_OK = /^\/assets\/audio\/ps-ai\/[\w.-]+\.(?:mp3|m4a|ogg|opus|wav)$/i;

  var catalog = [];
  var playlists = [];
  var index = -1;
  var radioMode = false;
  var shuffleBag = [];
  var seekLock = false;
  var hidden = false;
  var ready = false;
  var audio = null;
  var root = null;
  var chip = null;

  function quietPath(p) {
    p = String(p || '');
    try { p = new URL(p, location.href).pathname; } catch (e) {}
    return /(?:^|\/)(crisis|login|signup|reset-password|support-us|supporter)(?:\.html)?$/i.test(p)
      || /(?:^|\/).*(?:payment|checkout)(?:-|[/.]|$)/i.test(p);
  }

  function readStore(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function writeStore(key, val) {
    try { localStorage.setItem(key, String(val)); } catch (e) {}
  }
  function readJson(key, fallback) {
    try {
      var v = JSON.parse(readStore(key, ''));
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function writeJson(key, val) {
    try { writeStore(key, JSON.stringify(val)); } catch (e) {}
  }

  function playable(track) {
    return track && track.approved === true
      && typeof track.src === 'string' && SRC_OK.test(track.src)
      && typeof track.title === 'string' && track.title.length > 0;
  }

  function artClass(id) {
    var map = {
      'ps-ai-01': 'ps-art-01',
      'ps-ai-02': 'ps-art-02',
      'ps-ai-03': 'ps-art-03',
      'ps-ai-04': 'ps-art-04',
      'ps-ai-05': 'ps-art-05',
      'ps-ai-06': 'ps-art-06',
      'breaking-free-ai-guide': 'ps-art-07',
      'breaking-free-instrumental': 'ps-art-08'
    };
    return map[id] || 'ps-art-01';
  }

  function findTrack(id) {
    if (!id) return null;
    for (var i = 0; i < catalog.length; i++) if (catalog[i].id === id) return catalog[i];
    return null;
  }
  function findIndex(id) {
    for (var i = 0; i < catalog.length; i++) if (catalog[i].id === id) return i;
    return -1;
  }

  function current() {
    return index >= 0 ? catalog[index] : null;
  }

  function emit() {
    var t = current();
    var detail = {
      track: t,
      index: index,
      playing: !!(audio && !audio.paused && !audio.ended),
      time: audio ? audio.currentTime || 0 : 0,
      duration: audio && isFinite(audio.duration) ? audio.duration : 0,
      volume: audio ? audio.volume : 0.85,
      radio: radioMode,
      recent: getRecent()
    };
    document.dispatchEvent(new CustomEvent('ps-radio', { detail: detail }));
    paintMini(detail);
    saveState();
  }

  function saveState() {
    var t = current();
    writeJson(K_STATE, {
      id: t ? t.id : '',
      time: audio ? Math.floor((audio.currentTime || 0) * 10) / 10 : 0,
      volume: audio ? audio.volume : 0.85,
      radio: radioMode
    });
  }

  function getRecent() {
    var raw = readJson(K_RECENT, []);
    if (!Array.isArray(raw)) return [];
    var out = [];
    var seen = {};
    for (var i = 0; i < raw.length; i++) {
      var id = raw[i] && (raw[i].id || raw[i]);
      var t = findTrack(id);
      if (!t || seen[t.id]) continue;
      seen[t.id] = 1;
      out.push({
        id: t.id,
        title: t.title,
        artist: t.artist || 'Pleading Socially',
        label: t.label || 'AI-generated',
        src: t.src,
        at: raw[i].at || 0
      });
      if (out.length >= MAX_RECENT) break;
    }
    return out;
  }

  function remember(track) {
    if (!playable(track)) return;
    var list = getRecent().filter(function (x) { return x.id !== track.id; });
    list.unshift({ id: track.id, at: Date.now() });
    writeJson(K_RECENT, list.slice(0, MAX_RECENT));
  }

  function clearRecent() {
    try { localStorage.removeItem(K_RECENT); } catch (e) {}
    emit();
  }

  function setMediaSession(track, playing) {
    if (!('mediaSession' in navigator) || !track) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title + (track.label ? ' (' + track.label + ')' : ''),
        artist: track.artist || 'Pleading Socially',
        album: 'P.S AI Playlist',
        artwork: [
          { src: '/images/heroes/music-hero.webp', sizes: '1024x576', type: 'image/webp' },
          { src: '/assets/favicon.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      });
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    } catch (e) {}
  }

  function bindMediaSession() {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setActionHandler) return;
    try {
      navigator.mediaSession.setActionHandler('play', function () { play(); });
      navigator.mediaSession.setActionHandler('pause', function () { pause(); });
      navigator.mediaSession.setActionHandler('previoustrack', function () { prev(); });
      navigator.mediaSession.setActionHandler('nexttrack', function () { next(); });
      navigator.mediaSession.setActionHandler('seekto', function (e) {
        if (audio && e && typeof e.seekTime === 'number') {
          audio.currentTime = e.seekTime;
          emit();
        }
      });
      navigator.mediaSession.setActionHandler('stop', function () { stop(); });
    } catch (e) {}
  }

  function loadSrc(track, time) {
    if (!audio || !playable(track)) return;
    if (audio.getAttribute('data-id') !== track.id) {
      audio.src = track.src;
      audio.setAttribute('data-id', track.id);
      audio.preload = 'metadata';
    }
    if (typeof time === 'number' && time > 0) {
      var apply = function () {
        try { if (Math.abs((audio.currentTime || 0) - time) > 0.4) audio.currentTime = time; } catch (e) {}
        audio.removeEventListener('loadedmetadata', apply);
      };
      if (audio.readyState >= 1) apply();
      else audio.addEventListener('loadedmetadata', apply);
    }
  }

  function play(id, opts) {
    opts = opts || {};
    if (id) {
      var i = findIndex(id);
      if (i < 0) return;
      index = i;
    }
    var t = current();
    if (!t) {
      if (catalog.length) { index = 0; t = current(); }
      else return;
    }
    loadSrc(t, opts.time);
    remember(t);
    hidden = false;
    writeStore(K_HIDDEN, '0');
    document.dispatchEvent(new CustomEvent('ps-audio-focus', { detail: { source: 'ps-radio' } }));
    var req = audio.play();
    if (req && typeof req.catch === 'function') {
      req.catch(function () { emit(); });
    }
    showBar();
    emit();
  }

  function pause() {
    if (audio) try { audio.pause(); } catch (e) {}
    emit();
  }

  function stop() {
    if (audio) {
      try { audio.pause(); } catch (e) {}
      try { audio.currentTime = 0; } catch (e) {}
    }
    emit();
  }

  function toggle() {
    if (audio && !audio.paused) pause();
    else play();
  }

  function refillBag(avoidId) {
    shuffleBag = catalog.map(function (t) { return t.id; });
    for (var i = shuffleBag.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = shuffleBag[i];
      shuffleBag[i] = shuffleBag[j];
      shuffleBag[j] = tmp;
    }
    if (avoidId && shuffleBag.length > 1 && shuffleBag[0] === avoidId) {
      shuffleBag.push(shuffleBag.shift());
    }
  }

  function next() {
    if (!catalog.length) return;
    if (radioMode) {
      if (!shuffleBag.length) refillBag(current() && current().id);
      var id = shuffleBag.shift();
      play(id);
      return;
    }
    if (index < 0) { play(catalog[0].id); return; }
    play(catalog[(index + 1) % catalog.length].id);
  }

  function prev() {
    if (!catalog.length) return;
    if (audio && audio.currentTime > 3) {
      try { audio.currentTime = 0; } catch (e) {}
      emit();
      return;
    }
    if (radioMode) {
      next();
      return;
    }
    if (index < 0) { play(catalog[0].id); return; }
    play(catalog[(index - 1 + catalog.length) % catalog.length].id);
  }

  function setRadio(on) {
    radioMode = !!on;
    if (radioMode) refillBag(current() && current().id);
    emit();
  }

  function setVolume(v) {
    v = Math.max(0, Math.min(1, Number(v)));
    if (audio) audio.volume = v;
    emit();
  }

  function seek(t) {
    if (!audio || !isFinite(t)) return;
    try { audio.currentTime = Math.max(0, t); } catch (e) {}
    emit();
  }

  function svg(path) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + path + '" fill="currentColor"/></svg>';
  }
  var ICO_PLAY = 'M8 5v14l11-7z';
  var ICO_PAUSE = 'M6 5h4v14H6zm8 0h4v14h-4z';
  var ICO_PREV = 'M6 6h2v12H6zm3.5 6 8.5 6V6z';
  var ICO_NEXT = 'M16 6h2v12h-2zM6 18V6l8.5 6z';
  var ICO_CLOSE = 'M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6z';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function formatTime(s) {
    if (!isFinite(s) || s < 0) return '0:00';
    s = Math.floor(s);
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function stackBottom() {
    var bottom = 0;
    var dock = document.querySelector('.ps-dock');
    if (dock) {
      var ds = window.getComputedStyle(dock);
      if (ds.display !== 'none' && (ds.position === 'fixed' || ds.position === 'sticky')) {
        bottom += dock.getBoundingClientRect().height + (parseFloat(ds.bottom) || 0);
      }
    }
    var foot = document.querySelector('.ps-crisis-footer, .crisis-strip');
    if (foot) {
      var fs = window.getComputedStyle(foot);
      if (fs.position === 'fixed' || fs.position === 'sticky') {
        var vis = fs.display !== 'none' && fs.visibility !== 'hidden';
        if (vis) bottom += foot.getBoundingClientRect().height;
      }
    }
    return bottom;
  }

  function layoutStack() {
    var bottom = stackBottom();
    var height = 0;
    if (root && root.classList.contains('is-on')) {
      height = root.getBoundingClientRect().height || 64;
    } else if (chip && chip.classList.contains('is-on')) {
      height = chip.getBoundingClientRect().height || 44;
    }
    document.documentElement.style.setProperty('--ps-app-bottom', bottom + 'px');
    document.documentElement.style.setProperty('--ps-app-player-height', height + 'px');
    document.documentElement.style.setProperty('--ps-app-stack', (bottom + height) + 'px');
  }

  function showBar() {
    if (quietPath(location.href)) {
      if (root) root.classList.remove('is-on');
      if (chip) chip.classList.remove('is-on');
      document.body.classList.remove('ps-app-player-on');
      layoutStack();
      return;
    }
    hidden = readStore(K_HIDDEN, '0') === '1';
    if (hidden) {
      if (root) root.classList.remove('is-on');
      if (chip) chip.classList.add('is-on');
      document.body.classList.add('ps-app-player-on');
    } else if (current()) {
      if (root) root.classList.add('is-on');
      if (chip) chip.classList.remove('is-on');
      document.body.classList.add('ps-app-player-on');
    }
    layoutStack();
  }

  function hideBar() {
    hidden = true;
    writeStore(K_HIDDEN, '1');
    showBar();
  }

  function unhideBar() {
    hidden = false;
    writeStore(K_HIDDEN, '0');
    showBar();
  }

  function paintMini(detail) {
    if (!root) return;
    var t = detail.track;
    var title = root.querySelector('.ps-mini-title');
    var sub = root.querySelector('.ps-mini-sub');
    var art = root.querySelector('.ps-art');
    var playBtn = root.querySelector('.ps-mini-play');
    var seek = root.querySelector('.ps-mini-seek input');
    var vol = root.querySelector('.ps-mini-vol input');
    if (title) title.textContent = t ? t.title : 'P.S Radio';
    if (sub) sub.textContent = t
      ? ((t.artist || 'Pleading Socially') + ' · ' + (t.label || 'AI-generated'))
      : 'Press play when you are ready';
    if (art) art.className = 'ps-art ' + artClass(t && t.id);
    if (playBtn) {
      playBtn.innerHTML = detail.playing ? svg(ICO_PAUSE) : svg(ICO_PLAY);
      playBtn.setAttribute('aria-label', detail.playing ? 'Pause' : 'Play');
      playBtn.setAttribute('aria-pressed', detail.playing ? 'true' : 'false');
    }
    if (seek && !seekLock) {
      seek.max = detail.duration ? String(Math.floor(detail.duration)) : '0';
      seek.value = String(Math.floor(detail.time || 0));
    }
    if (vol && document.activeElement !== vol) vol.value = String(Math.round((detail.volume || 0) * 100));
    if (root.hasAttribute('aria-label')) {
      root.setAttribute('aria-label', t ? ('Now playing: ' + t.title) : 'P.S Radio player');
    }
    setMediaSession(t, detail.playing);
    showBar();
  }

  function buildMini() {
    if (root) return;
    audio = document.createElement('audio');
    audio.id = 'ps-app-audio';
    audio.preload = 'none';
    audio.setAttribute('playsinline', '');
    audio.setAttribute('controlslist', 'nodownload');

    root = el('div', '');
    root.id = 'ps-app-player';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'P.S Radio player');

    var bar = el('div', 'ps-mini');
    var art = el('div', 'ps-art');
    art.setAttribute('aria-hidden', 'true');
    var meta = el('div', 'ps-mini-meta');
    var title = el('div', 'ps-mini-title', 'P.S Radio');
    var sub = el('div', 'ps-mini-sub', 'Press play when you are ready');
    meta.appendChild(title);
    meta.appendChild(sub);

    var controls = el('div', 'ps-mini-controls');
    function btn(cls, label, icon, fn) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = cls;
      b.setAttribute('aria-label', label);
      b.innerHTML = svg(icon);
      b.addEventListener('click', fn);
      return b;
    }
    controls.appendChild(btn('', 'Previous track', ICO_PREV, function () { prev(); }));
    controls.appendChild(btn('ps-mini-play', 'Play', ICO_PLAY, function () { toggle(); }));
    controls.appendChild(btn('', 'Next track', ICO_NEXT, function () { next(); }));

    var seekWrap = el('div', 'ps-mini-seek');
    var seekInput = document.createElement('input');
    seekInput.type = 'range';
    seekInput.min = '0';
    seekInput.max = '0';
    seekInput.value = '0';
    seekInput.setAttribute('aria-label', 'Seek');
    seekInput.addEventListener('pointerdown', function () { seekLock = true; });
    seekInput.addEventListener('pointerup', function () { seekLock = false; });
    seekInput.addEventListener('change', function () {
      seekLock = false;
      if (!audio) return;
      try { audio.currentTime = Number(seekInput.value) || 0; } catch (e) {}
      emit();
    });
    seekWrap.appendChild(seekInput);

    var volWrap = el('div', 'ps-mini-vol');
    var vol = document.createElement('input');
    vol.type = 'range';
    vol.min = '0';
    vol.max = '100';
    vol.value = '85';
    vol.setAttribute('aria-label', 'Volume');
    vol.addEventListener('input', function () { setVolume(Number(vol.value) / 100); });
    volWrap.appendChild(vol);

    var open = document.createElement('a');
    open.href = '/music/';
    open.className = 'ps-mini-open';
    open.textContent = 'Music';

    var hide = btn('', 'Hide player', ICO_CLOSE, function () { hideBar(); });

    bar.appendChild(art);
    bar.appendChild(meta);
    bar.appendChild(controls);
    bar.appendChild(seekWrap);
    bar.appendChild(volWrap);
    bar.appendChild(open);
    bar.appendChild(hide);
    root.appendChild(audio);
    root.appendChild(bar);

    chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'ps-mini-chip';
    chip.setAttribute('aria-label', 'Show P.S Radio player');
    chip.textContent = 'P.S Radio';
    chip.addEventListener('click', function () { unhideBar(); });

    document.body.appendChild(root);
    document.body.appendChild(chip);

    audio.addEventListener('play', function () {
      document.dispatchEvent(new CustomEvent('ps-audio-focus', { detail: { source: 'ps-radio' } }));
      emit();
    });
    audio.addEventListener('pause', emit);
    audio.addEventListener('timeupdate', function () {
      if (seekLock) return;
      emit();
    });
    audio.addEventListener('ended', function () { next(); });
    audio.addEventListener('volumechange', function () { saveState(); });
    audio.addEventListener('loadedmetadata', emit);

    document.addEventListener('ps-audio-stop', function () { pause(); });
    document.addEventListener('ps-audio-focus', function (e) {
      if (!e || !e.detail || e.detail.source === 'ps-radio') return;
      pause();
    });
    window.addEventListener('pagehide', saveState);
    window.addEventListener('beforeunload', saveState);
    window.addEventListener('resize', layoutStack);
    bindMediaSession();
  }

  function restore() {
    var state = readJson(K_STATE, null);
    if (audio && state && typeof state.volume === 'number') audio.volume = state.volume;
    else if (audio) audio.volume = 0.85;
    if (state && state.radio) radioMode = true;
    if (state && state.id && findTrack(state.id)) {
      index = findIndex(state.id);
      loadSrc(current(), state.time || 0);
      showBar();
    }
    emit();
  }

  /* ---------- tiny same-origin pjax ---------- */
  function sameOrigin(url) {
    try {
      var u = new URL(url, location.href);
      return u.origin === location.origin;
    } catch (e) { return false; }
  }

  function shouldIntercept(a, ev) {
    if (!a || ev.defaultPrevented) return false;
    if (ev.button && ev.button !== 0) return false;
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return false;
    if (a.hasAttribute('download') || a.target && a.target !== '' && a.target !== '_self') return false;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return false;
    if (href.slice(0, 7) === 'mailto:' || href.slice(0, 4) === 'tel:' || href.slice(0, 4) === 'sms:') return false;
    if (!sameOrigin(href)) return false;
    var u = new URL(href, location.href);
    if (u.pathname === location.pathname && u.search === location.search && u.hash) return false;
    if (excludedFile(u.pathname)) return false;
    if (quietPath(u.href)) return false;
    if (/\.(?:pdf|zip|mp3|mp4|jpg|jpeg|png|webp|svg|gif|json|css|js)$/i.test(u.pathname)) return false;
    return true;
  }

  function excludedFile(pathname) {
    return quietPath(pathname);
  }

  function pickMain(doc) {
    return doc.getElementById('main') || doc.querySelector('main');
  }

  function swapPage(url, html, push) {
    var parsed = new DOMParser().parseFromString(html, 'text/html');
    var nextMain = pickMain(parsed);
    var curMain = pickMain(document);
    if (!nextMain || !curMain) {
      location.href = url;
      return;
    }
    curMain.replaceWith(nextMain);
    document.title = parsed.title || document.title;
    if (parsed.body && parsed.body.className != null) {
      var keep = [];
      if (document.body.classList.contains('ps-app-player-on')) keep.push('ps-app-player-on');
      if (document.body.classList.contains('ps-no-dock')) keep.push('ps-no-dock');
      document.body.className = parsed.body.className;
      keep.forEach(function (c) { document.body.classList.add(c); });
    }
    var desc = parsed.querySelector('meta[name="description"]');
    var curDesc = document.querySelector('meta[name="description"]');
    if (desc && curDesc) curDesc.setAttribute('content', desc.getAttribute('content') || '');
    /* Bring in new same-origin stylesheets not already present. */
    var links = parsed.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (!href) continue;
      var abs = new URL(href, url).pathname;
      var exists = false;
      var have = document.querySelectorAll('link[rel="stylesheet"]');
      for (var j = 0; j < have.length; j++) {
        try { if (new URL(have[j].href, location.href).pathname === abs) exists = true; } catch (e) {}
      }
      if (!exists) {
        var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = href;
        document.head.appendChild(l);
      }
    }
    /* Load page scripts that are not already on the document (skip ourselves). */
    var scripts = parsed.querySelectorAll('script[src]');
    for (var s = 0; s < scripts.length; s++) {
      var src = scripts[s].getAttribute('src');
      if (!src) continue;
      if (/ps-radio-persist\.js/.test(src)) continue;
      var srcPath = new URL(src, url).pathname;
      if (document.querySelector('script[src="' + src + '"], script[src="' + srcPath + '"]')) continue;
      var ns = document.createElement('script');
      ns.src = src;
      if (scripts[s].type) ns.type = scripts[s].type;
      if (scripts[s].defer) ns.defer = true;
      document.body.appendChild(ns);
    }
    if (push) history.pushState({ psRadio: true }, '', url);
    var hash = new URL(url, location.href).hash;
    if (hash && document.querySelector(hash)) document.querySelector(hash).scrollIntoView();
    else window.scrollTo(0, 0);
    layoutStack();
    document.dispatchEvent(new CustomEvent('ps:navigate', { detail: { url: url } }));
  }

  function navigate(url, push) {
    if (quietPath(url) || !sameOrigin(url)) {
      location.href = url;
      return;
    }
    fetch(url, { credentials: 'same-origin', headers: { 'X-PS-Radio': '1' } })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        var type = r.headers.get('content-type') || '';
        if (type && type.indexOf('text/html') === -1) throw new Error('not html');
        return r.text();
      })
      .then(function (html) { swapPage(url, html, push !== false); })
      .catch(function () { location.href = url; });
  }

  function bindPjax() {
    document.addEventListener('click', function (ev) {
      var a = ev.target && ev.target.closest ? ev.target.closest('a') : null;
      if (!shouldIntercept(a, ev)) return;
      ev.preventDefault();
      navigate(a.href, true);
    });
    window.addEventListener('popstate', function () {
      navigate(location.href, false);
    });
  }

  var api = {
    play: play,
    pause: pause,
    stop: stop,
    toggle: toggle,
    next: next,
    prev: prev,
    seek: seek,
    setVolume: setVolume,
    setRadio: setRadio,
    isRadio: function () { return radioMode; },
    current: current,
    catalog: function () { return catalog.slice(); },
    playlists: function () { return playlists; },
    getRecent: getRecent,
    clearRecent: clearRecent,
    artClass: artClass,
    playable: playable,
    formatTime: formatTime,
    ready: function () { return ready; },
    shouldIntercept: shouldIntercept,
    quietPath: quietPath
  };
  window.PSRadio = api;

  function boot(data) {
    playlists = (data && data.playlists) || [];
    catalog = [];
    playlists.forEach(function (list) {
      (list.tracks || []).forEach(function (t) {
        if (playable(t)) {
          var copy = {};
          for (var k in t) if (Object.prototype.hasOwnProperty.call(t, k)) copy[k] = t[k];
          copy.playlistId = list.id;
          copy.kind = list.kind;
          catalog.push(copy);
        }
      });
    });
    buildMini();
    restore();
    bindPjax();
    ready = true;
    document.dispatchEvent(new CustomEvent('ps-radio-ready'));
    emit();
    layoutStack();
  }

  function start() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startOnce);
    } else {
      startOnce();
    }
  }
  var started = false;
  function startOnce() {
    if (started) return;
    started = true;
    fetch(CATALOG_URL, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(boot)
      .catch(function () { boot({ playlists: [] }); });
  }
  start();
})();
