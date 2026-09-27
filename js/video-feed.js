// ==============================================================
// 📺 PLEADING SANITY — AUTO-STREAM VIDEO ENGINE v3.0
// Sanity Feed · Videos · Hub · Home hero
//
// Any element with [data-ps-video] becomes an inline player that
// streams muted as soon as it scrolls into view and pauses when it
// leaves. No clicks needed. One tap turns the sound on.
//
//   <div data-ps-video data-id="VIDEO_ID" data-title="…"></div>
//   <div data-ps-video data-list="PLAYLIST_ID" data-title="…"></div>
//
// • Lazy — players only load when they get close to the screen and
//   unload again when far away, so long feeds stay fast.
// • Only the most visible player streams at a time.
// • If a video can't load (offline, blocked, removed) a cosmic quote
//   card takes its place.
// • Respects "reduce motion": no autoplay, a play button instead.
// • Privacy: youtube-nocookie.com embeds, no tracking.
//
// The home hero ([data-ps-hero]) plays a muted looped <video> if one
// is set with data-video-src, and otherwise renders a live cosmic
// animation — instant, smooth, zero downloads.
// ==============================================================

(function () {
  'use strict';

  var EMBED_HOST = 'https://www.youtube-nocookie.com';
  var READY_TIMEOUT = 10000;
  var SOUND_KEY = 'ps_video_sound';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var QUOTES = [
    ['What I survived didn’t erase me — it made me more.', 'Shane Cooper'],
    ['Evolution, Not Erasure.', 'Pleading Sanity'],
    ['You’re not too much. You’re deeply human — and that’s exactly what the world needs.', 'Pleading Sanity'],
    ['Turn pain into power. Turn survival into strength. Turn madness into meaning.', 'The Mission'],
    ['Even the darkest night will end and the sun will rise.', 'Victor Hugo'],
    ['Healing isn’t going back to normal. It’s rising into something truly yours.', 'Pleading Sanity'],
    ['One Source. One Consciousness. One Family.', 'Pleading Sanity']
  ];

  var players = [];
  var soundOn = false;
  try { soundOn = sessionStorage.getItem(SOUND_KEY) === 'on'; } catch (e) {}
  var nextId = 1;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  // ─── PLAYER ───
  function Player(root) {
    this.root = root;
    this.id = nextId++;
    this.videoId = root.dataset.id || '';
    this.listId = root.dataset.list || '';
    this.title = root.dataset.title || 'Pleading Sanity video';
    this.iframe = null;
    this.ready = false;
    this.failed = false;
    this.visible = 0;
    this.playing = false;
    this.timer = null;

    root.classList.add('ps-video');
    root.innerHTML = '';

    this.stage = el('div', 'ps-video-stage');
    this.poster = el('div', 'ps-video-poster');
    if (this.videoId) {
      var img = el('img');
      img.src = 'https://i.ytimg.com/vi/' + encodeURIComponent(this.videoId) + '/hqdefault.jpg';
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onerror = function () { img.remove(); };
      this.poster.appendChild(img);
    }
    this.poster.appendChild(el('span', 'ps-video-shimmer', reduceMotion ? '' : 'Streaming soon…'));
    this.stage.appendChild(this.poster);

    this.sound = el('button', 'ps-video-sound');
    this.sound.type = 'button';
    this.sound.addEventListener('click', this.toggleSound.bind(this));
    this.updateSoundButton();

    root.appendChild(this.stage);
    root.appendChild(this.sound);

    if (reduceMotion) {
      var play = el('button', 'ps-video-play', '▶ Play');
      play.type = 'button';
      play.setAttribute('aria-label', 'Play ' + this.title);
      var self = this;
      play.addEventListener('click', function () {
        self.userStarted = true;
        play.remove();
        self.play();
      });
      this.stage.appendChild(play);
    }
  }

  Player.prototype.src = function (autoplay) {
    var params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      mute: '1',
      playsinline: '1',
      enablejsapi: '1',
      rel: '0',
      modestbranding: '1',
      origin: location.origin
    });
    if (this.listId) {
      params.set('list', this.listId);
      params.set('loop', '1');
      return EMBED_HOST + '/embed/videoseries?' + params;
    }
    params.set('loop', '1');
    params.set('playlist', this.videoId);
    return EMBED_HOST + '/embed/' + encodeURIComponent(this.videoId) + '?' + params;
  };

  Player.prototype.load = function (autoplay) {
    if (this.iframe || this.failed) return;
    if (!this.videoId && !this.listId) return this.fail();
    if (navigator.onLine === false) return this.fail();

    var iframe = el('iframe');
    iframe.title = this.title;
    iframe.src = this.src(autoplay);
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    var self = this;
    this.loaded = false;
    iframe.addEventListener('load', function () { self.loaded = true; self.listen(); });
    this.iframe = iframe;
    this.stage.appendChild(iframe);

    // Nothing arrived at all (offline, blocked network) → cosmic quote card.
    // Unavailable videos are caught by YouTube's own onError message.
    clearTimeout(this.timer);
    this.timer = setTimeout(function () { if (!self.ready && !self.loaded) self.fail(); }, READY_TIMEOUT);
  };

  // Tear the iframe down when far off screen — keeps long feeds light
  Player.prototype.unload = function () {
    if (!this.iframe || this.userStarted) return;
    clearTimeout(this.timer);
    clearInterval(this.handshake);
    this.forcedAutoplay = false;
    this.iframe.remove();
    this.iframe = null;
    this.ready = false;
    this.playing = false;
    this.root.classList.remove('is-ready', 'is-playing');
  };

  // Handshake with the embed, retrying like YouTube's own API does
  Player.prototype.listen = function () {
    var self = this, tries = 0, frame = this.iframe;
    clearInterval(this.handshake);
    this.handshake = setInterval(function () {
      if (self.ready || self.iframe !== frame || ++tries > 20) {
        clearInterval(self.handshake);
        // No handshake: let the embed autoplay itself if it should be streaming
        if (!self.ready && self.iframe === frame && self.shouldPlay && !self.forcedAutoplay) {
          self.forcedAutoplay = true;
          frame.src = self.src(true);
        }
        return;
      }
      self.post({ event: 'listening', id: self.id, channel: 'widget' });
    }, 250);
    this.post({ event: 'listening', id: this.id, channel: 'widget' });
  };

  Player.prototype.post = function (msg) {
    if (!this.iframe || !this.iframe.contentWindow) return;
    try { this.iframe.contentWindow.postMessage(JSON.stringify(msg), EMBED_HOST); } catch (e) {}
  };

  Player.prototype.command = function (func, args) {
    this.post({ event: 'command', func: func, args: args || [], id: this.id, channel: 'widget' });
  };

  Player.prototype.onReady = function () {
    if (this.ready) return;
    this.ready = true;
    clearTimeout(this.timer);
    this.root.classList.add('is-ready');
    if (this.shouldPlay) this.play();
    else this.command('pauseVideo');
  };

  Player.prototype.play = function () {
    this.shouldPlay = true;
    if (!this.iframe) return this.load(true);
    if (!this.ready) return;
    this.command(soundOn ? 'unMute' : 'mute');
    if (soundOn) this.command('setVolume', [70]);
    this.command('playVideo');
    this.playing = true;
    this.root.classList.add('is-playing');
  };

  Player.prototype.pause = function () {
    this.shouldPlay = false;
    if (!this.playing) return;
    this.command('pauseVideo');
    this.playing = false;
    this.root.classList.remove('is-playing');
  };

  Player.prototype.toggleSound = function () {
    soundOn = !soundOn;
    try { sessionStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off'); } catch (e) {}
    players.forEach(function (p) {
      p.updateSoundButton();
      if (p.ready) p.command(soundOn && p.playing ? 'unMute' : 'mute');
    });
    if (soundOn) {
      if (!this.iframe) this.load(true);
      this.play();
      this.command('setVolume', [70]);
    }
  };

  Player.prototype.updateSoundButton = function () {
    this.sound.textContent = soundOn ? '🔊' : '🔇';
    this.sound.setAttribute('aria-pressed', String(soundOn));
    this.sound.setAttribute('aria-label', soundOn ? 'Mute videos' : 'Turn sound on');
    this.sound.title = soundOn ? 'Mute' : 'Sound on';
  };

  // ─── FALLBACK: cosmic quote card ───
  Player.prototype.fail = function () {
    if (this.failed) return;
    this.failed = true;
    this.ready = false;
    this.playing = false;
    clearTimeout(this.timer);
    clearInterval(this.handshake);
    if (this.iframe) { this.iframe.remove(); this.iframe = null; }

    var q = QUOTES[(this.id - 1) % QUOTES.length];
    var card = el('figure', 'ps-video-quote');
    card.appendChild(el('blockquote', '', '“' + q[0] + '”'));
    card.appendChild(el('figcaption', '', '— ' + q[1]));
    var href = this.listId
      ? 'https://www.youtube.com/playlist?list=' + encodeURIComponent(this.listId)
      : 'https://www.youtube.com/watch?v=' + encodeURIComponent(this.videoId);
    if (this.videoId || this.listId) {
      var link = el('a', 'ps-video-quote-link', 'Watch on YouTube →');
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      card.appendChild(link);
    }
    this.stage.innerHTML = '';
    this.stage.appendChild(card);
    this.sound.hidden = true;
    this.root.classList.add('is-fallback');
    this.root.classList.remove('is-ready', 'is-playing');
  };

  // ─── MESSAGES FROM YOUTUBE ───
  window.addEventListener('message', function (e) {
    if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(e.origin)) return;
    var data;
    try { data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (err) { return; }
    if (!data || !data.event) return;
    var player = players.find(function (p) { return p.iframe && p.iframe.contentWindow === e.source; });
    if (!player) return;

    if (data.event === 'onReady' || (data.event === 'initialDelivery' && !player.ready)) player.onReady();
    else if (data.event === 'onError') player.fail();
    else if (data.event === 'infoDelivery' && data.info && typeof data.info.playerState === 'number') {
      if (!player.ready) player.onReady();
      // 1 = playing, 2 = paused — keep the UI in sync with taps on the player itself
      if (data.info.playerState === 1) player.root.classList.add('is-playing');
      if (data.info.playerState === 2) player.root.classList.remove('is-playing');
    }
  });

  // ─── WHO STREAMS: the most visible player ───
  function pickActive() {
    if (reduceMotion || document.hidden) {
      players.forEach(function (p) { if (!p.userStarted) p.pause(); });
      return;
    }
    var best = null;
    players.forEach(function (p) {
      if (p.failed || p.visible < 0.55) return;
      if (!best || p.visible > best.visible) best = p;
    });
    players.forEach(function (p) {
      if (p === best) p.play();
      else if (p.playing || p.shouldPlay) p.pause();
    });
  }

  var nearObserver = 'IntersectionObserver' in window && new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var p = entry.target._psPlayer;
      if (!p) return;
      if (entry.isIntersecting) { if (!reduceMotion) p.load(false); }
      else p.unload();
    });
  }, { rootMargin: '600px 0px' });

  var viewObserver = 'IntersectionObserver' in window && new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var p = entry.target._psPlayer;
      if (p) p.visible = entry.isIntersecting ? entry.intersectionRatio : 0;
    });
    pickActive();
  }, { threshold: [0, 0.25, 0.55, 0.75, 1] });

  function mount(root) {
    if (root._psPlayer) return root._psPlayer;
    var p = new Player(root);
    root._psPlayer = p;
    players.push(p);
    if (nearObserver) {
      nearObserver.observe(root);
      viewObserver.observe(root);
    } else if (!reduceMotion) {
      p.load(false);
    }
    return p;
  }

  function scan(scope) {
    (scope || document).querySelectorAll('[data-ps-video]').forEach(mount);
  }

  // Remove players whose cards were taken off the page (e.g. new search)
  function prune() {
    players = players.filter(function (p) {
      if (document.contains(p.root)) return true;
      clearTimeout(p.timer);
      clearInterval(p.handshake);
      if (nearObserver) { nearObserver.unobserve(p.root); viewObserver.unobserve(p.root); }
      return false;
    });
  }

  if ('MutationObserver' in window) {
    new MutationObserver(function (mutations) {
      var added = false, removed = false;
      mutations.forEach(function (m) {
        if (m.addedNodes.length) added = true;
        if (m.removedNodes.length) removed = true;
      });
      if (removed) prune();
      if (added) scan();
    }).observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener('visibilitychange', pickActive);
  window.addEventListener('offline', function () {
    players.forEach(function (p) { if (!p.ready) p.fail(); });
  });

  // ─── HERO: muted looped video, or a live cosmic animation ───
  function initHero(hero) {
    var src = hero.dataset.videoSrc;
    if (src && !reduceMotion && navigator.onLine !== false) {
      var video = el('video', 'ps-hero-video');
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('muted', '');
      video.preload = 'auto';
      if (hero.dataset.poster) video.poster = hero.dataset.poster;
      video.src = src;
      video.addEventListener('error', function () { video.remove(); cosmicCanvas(hero); });
      hero.appendChild(video);
      var start = video.play();
      if (start && start.catch) start.catch(function () {});
      return;
    }
    cosmicCanvas(hero);
  }

  function cosmicCanvas(hero) {
    var canvas = el('canvas', 'ps-hero-canvas');
    hero.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var stars = [], clouds = [];
    var running = false, onScreen = true, t0 = performance.now();

    function resize() {
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(160, (w * h) / 5000));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.4 + 0.2, p: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 1.2 });
      }
      clouds = [
        { c: '0, 255, 240', x: 0.25, y: 0.35, r: 0.55, sx: 0.00007, sy: 0.00005 },
        { c: '255, 0, 255', x: 0.75, y: 0.6, r: 0.5, sx: 0.00006, sy: 0.00008 },
        { c: '90, 60, 255', x: 0.5, y: 0.9, r: 0.6, sx: 0.00004, sy: 0.00006 }
      ];
    }

    function frame(now) {
      var t = now - t0;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      clouds.forEach(function (c, i) {
        var cx = (c.x + Math.sin(t * c.sx + i) * 0.12) * w;
        var cy = (c.y + Math.cos(t * c.sy + i * 2) * 0.1) * h;
        var rad = c.r * Math.max(w, h) * (0.9 + Math.sin(t * 0.0003 + i) * 0.08);
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, 'rgba(' + c.c + ', 0.16)');
        g.addColorStop(1, 'rgba(' + c.c + ', 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });
      ctx.globalCompositeOperation = 'source-over';
      stars.forEach(function (s) {
        var a = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.001 * s.s + s.p));
        s.y -= 0.02 * s.s;
        if (s.y < -2) s.y = h + 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(234, 255, 253, ' + a.toFixed(2) + ')';
        ctx.fill();
      });
      if (running) requestAnimationFrame(frame);
    }

    function update() {
      var should = onScreen && !document.hidden && !reduceMotion;
      if (should && !running) { running = true; requestAnimationFrame(frame); }
      else if (!should) running = false;
    }

    resize();
    frame(performance.now()); // paint immediately, even with reduced motion
    window.addEventListener('resize', function () { resize(); if (!running) frame(performance.now()); }, { passive: true });
    document.addEventListener('visibilitychange', update);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { onScreen = entries[0].isIntersecting; update(); }).observe(hero);
    }
    update();
  }

  document.querySelectorAll('[data-ps-hero]').forEach(initHero);
  scan();

  window.PSVideo = { mount: mount, scan: scan };
})();
