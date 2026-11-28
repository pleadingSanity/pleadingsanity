/* Pleading Socially music app page.
   Renders two playlists (Shane's Voice vs P.S AI), the page transport,
   Your recently played (this browser only), Creator picks, and the
   hand-picked shelves. Talks to window.PSRadio. Text is set with
   textContent. No autoplay. */
(function () {
  'use strict';
  var CREATOR_URL = '/data/creator-recent.json';
  var creatorPicks = [];
  var filters = { mood: 'all', genre: 'all', bpm: 'any' };
  var shelfKey = '';
  var queueSig = '';
  var lastDetail = null;
  var chipsBound = false;
  var pulseArmed = false;

  function $(id) { return document.getElementById(id); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function radio() { return window.PSRadio || null; }

  function discover() { return window.PSDiscover || null; }

  function badgeInfo(track) {
    var d = discover();
    if (d && d.badge) return d.badge(track);
    var ai = track && (track.kind === 'ai' || /ai-generated/i.test(track.label || ''));
    return ai
      ? { text: 'AI', cls: 'ps-origin-badge ps-badge-ai', name: 'AI-generated' }
      : { text: 'Human', cls: 'ps-origin-badge ps-badge-human', name: "Shane's voice" };
  }

  function originBadge(track) {
    var info = badgeInfo(track);
    var b = el('span', info.cls, info.text);
    b.setAttribute('aria-label', info.name);
    return b;
  }

  function artFor(track) {
    var id = track && track.id;
    var n = el('div', 'ps-art ' + (radio() ? radio().artClass(id) : 'ps-art-01'));
    n.setAttribute('aria-hidden', 'true');
    if (track) n.appendChild(originBadge(track));
    return n;
  }

  function trackMatches(track) {
    var d = discover();
    if (!d || !track) return true;
    return d.matchesMood(track, filters.mood)
      && d.matchesGenre(track, filters.genre)
      && d.matchesBpm(track, filters.bpm);
  }

  function catalogById() {
    var map = {};
    var r = radio();
    var cat = r ? r.catalog() : [];
    for (var i = 0; i < cat.length; i++) map[cat[i].id] = cat[i];
    return map;
  }

  function trackButton(track, extraLabel) {
    var li = document.createElement('li');
    li.className = 'ps-track-card';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ps-track-btn';
    btn.setAttribute('data-track-id', track.id);
    var label = track.title + (track.label ? ' (' + track.label + ')' : '');
    if (extraLabel) label += ' — ' + extraLabel;
    var origin = badgeInfo(track);
    btn.setAttribute('aria-label', 'Play ' + label + ', ' + origin.name);
    btn.appendChild(artFor(track));
    var meta = el('span', 'ps-track-meta');
    meta.appendChild(el('span', 'ps-track-title', track.title));
    var sub = (track.artist || 'Pleading Socially');
    if (track.genre) sub += ' · ' + track.genre;
    var tempo = discover() && discover().bpmValue(track);
    if (tempo !== null && tempo !== undefined) sub += ' · ' + tempo + ' BPM';
    meta.appendChild(el('span', 'ps-track-sub', sub));
    btn.appendChild(meta);
    btn.addEventListener('click', function () {
      var r = radio();
      if (r) r.play(track.id);
    });
    var queue = document.createElement('button');
    queue.type = 'button';
    queue.className = 'ps-queue-add';
    queue.textContent = 'Queue';
    queue.setAttribute('aria-label', 'Add ' + track.title + ' to queue');
    queue.addEventListener('click', function () {
      var r = radio();
      if (r && r.enqueue) r.enqueue(track.id);
    });
    li.appendChild(btn);
    li.appendChild(queue);
    return li;
  }

  function markCurrent() {
    var r = radio();
    var cur = r && r.current && r.current();
    var id = cur && cur.id;
    var nodes = document.querySelectorAll('#ps-app [data-track-id], #ps-ai-playlists-list [data-track-id], #ps-discover [data-track-id]');
    for (var i = 0; i < nodes.length; i++) {
      var on = id && nodes[i].getAttribute('data-track-id') === id;
      nodes[i].classList.toggle('is-current', !!on);
    }
  }

  function renderPlaylists() {
    var root = $('ps-playlists-list');
    if (!root) return;
    var aiRoot = $('ps-ai-playlists-list');
    var r = radio();
    var lists = r ? r.playlists() : [];
    root.textContent = '';
    if (aiRoot) aiRoot.textContent = '';
    if (!lists.length) {
      root.appendChild(el('p', 'ps-pl-soon', 'The playlists could not load right now. Try again later.'));
      return;
    }
    lists.forEach(function (list) {
      var target = list.kind === 'ai' && aiRoot ? aiRoot : root;
      var card = el('article', 'ps-pl-card ps-pl-' + (list.kind === 'ai' ? 'ai' : 'human'));
      card.setAttribute('aria-labelledby', 'ps-pl-' + list.id);
      var badge = el('span', 'ps-pl-badge', list.kind === 'ai' ? 'AI-generated' : (list.label || "Shane's own voice"));
      var origin = originBadge(list);
      var h = el('h3', null, list.title);
      h.id = 'ps-pl-' + list.id;
      card.appendChild(badge);
      card.appendChild(origin);
      card.appendChild(h);
      if (list.description) card.appendChild(el('p', 'ps-pl-desc', list.description));
      var tracks = (list.tracks || []).filter(function (t) { return r && r.playable(t); });
      if (tracks.length) {
        var ol = el('ol', 'ps-pl-tracks');
        tracks.forEach(function (t) { ol.appendChild(trackButton(t)); });
        card.appendChild(ol);
      } else {
        card.appendChild(el('p', 'ps-pl-soon', 'Coming soon. Nothing is published here until Shane approves it.'));
        var studio = list.in_the_studio || [];
        if (studio.length) {
          card.appendChild(el('p', 'ps-pl-studio-label', 'In the studio'));
          card.appendChild(el('p', 'ps-pl-desc', 'These titles are in progress. They are not playable tracks.'));
          var ul = el('ul', 'ps-pl-studio');
          studio.forEach(function (name) { ul.appendChild(el('li', null, String(name))); });
          card.appendChild(ul);
        }
      }
      target.appendChild(card);
    });
  }

  function countLibrary() {
    var map = catalogById();
    var nodes = document.querySelectorAll('#ps-playlists-list [data-track-id], #ps-ai-playlists-list [data-track-id]');
    var seen = {};
    var shown = 0;
    var total = 0;
    for (var i = 0; i < nodes.length; i++) {
      var id = nodes[i].getAttribute('data-track-id');
      if (!id || seen[id]) continue;
      seen[id] = 1;
      total += 1;
      var li = nodes[i].closest ? nodes[i].closest('li') : null;
      var on = trackMatches(map[id] || { id: id });
      if (li) li.classList.toggle('is-filtered-out', !on);
      if (on) shown += 1;
    }
    return { shown: shown, total: total };
  }

  function paintStatus(counts) {
    var status = $('ps-discover-status');
    if (!status) return;
    if (filters.genre === 'bassline' && counts.shown === 0) {
      status.textContent = 'No bassline tracks are published in this library yet.';
      return;
    }
    if (filters.bpm !== 'any' && filters.bpm !== 'unstamped' && counts.shown === 0) {
      status.textContent = 'No track in this library has a stamped BPM, so this range is empty. Tempos are not guessed.';
      return;
    }
    if (counts.shown === 0) {
      status.textContent = 'Nothing in the library matches this hand-picked filter.';
      return;
    }
    var noun = counts.shown === 1 ? ' track' : ' tracks';
    status.textContent = 'Showing ' + counts.shown + noun + ' from the library. Chosen by hand, not ranked.';
  }

  function renderDiscovery(detail) {
    var d = discover();
    var r = radio();
    var shelves = $('ps-shelves');
    var next = $('ps-listen-next');
    if (!d || !r || !shelves) return;
    var cur = detail && detail.track;
    var curId = cur && cur.id || '';
    var key = [filters.mood, filters.genre, filters.bpm, curId].join('|');
    if (key === shelfKey && shelves.childNodes.length) return;
    shelfKey = key;
    var cat = r.catalog().filter(trackMatches);
    shelves.textContent = '';
    if (next) next.textContent = '';
    var rows = d.shelves(cat);
    if (filters.mood !== 'all') rows = rows.filter(function (s) { return s.id === filters.mood; });
    if (next) {
      var h = el('h3', 'ps-shelf-title', 'Listen next');
      h.id = 'ps-listen-next-title';
      next.setAttribute('aria-labelledby', 'ps-listen-next-title');
      next.appendChild(el('p', 'ps-shelf-kicker', 'Same mood'));
      next.appendChild(h);
      if (!cur) {
        next.appendChild(el('p', 'ps-empty', 'Press play when you are ready. The next row stays on that track’s mood. Nothing starts by itself.'));
      } else {
        var follow = d.listenNext(cat, cur.id, filters.mood);
        if (!follow.length) {
          next.appendChild(el('p', 'ps-empty', 'Nothing else is published on this mood yet.'));
        } else {
          next.appendChild(el('p', 'ps-shelf-note', 'The rest of this hand-picked mood. It is not a recommendation feed.'));
          var ol = el('ol', 'ps-shelf-row');
          follow.forEach(function (t) { ol.appendChild(trackButton(t)); });
          next.appendChild(ol);
        }
      }
    }
    rows.forEach(function (shelf) {
      if (cur && filters.mood === 'all') {
        var onShelf = d.matchesMood(cur, shelf.id);
        if (onShelf) return;
      }
      var sec = el('section', 'ps-shelf');
      var title = el('h3', 'ps-shelf-title', shelf.label);
      title.id = 'ps-shelf-' + shelf.id;
      sec.setAttribute('aria-labelledby', title.id);
      sec.appendChild(el('p', 'ps-shelf-kicker', 'Listen next'));
      sec.appendChild(title);
      if (!shelf.tracks.length) {
        sec.appendChild(el('p', 'ps-empty', 'Nothing on the ' + shelf.label + ' shelf is in this library yet.'));
      } else {
        sec.appendChild(el('p', 'ps-shelf-note', 'Hand-picked from this mood. Not a personalised queue.'));
        var row = el('ol', 'ps-shelf-row');
        shelf.tracks.forEach(function (t) { row.appendChild(trackButton(t)); });
        sec.appendChild(row);
      }
      shelves.appendChild(sec);
    });
    markCurrent();
  }

  var recentSig = '';
  function renderYourRecent() {
    var box = $('ps-your-recent-list');
    if (!box) return;
    var r = radio();
    var items = r ? r.getRecent() : [];
    var sig = items.map(function (t) { return t.id; }).join(',');
    if (sig === recentSig && box.childNodes.length) return;
    recentSig = sig;
    box.textContent = '';
    if (!items.length) {
      box.appendChild(el('p', 'ps-recent-empty', 'Nothing here yet. Tracks you play on this device will appear in this list. They stay in this browser only.'));
      return;
    }
    var ol = el('ol', 'ps-pl-tracks');
    items.forEach(function (t) { ol.appendChild(trackButton(t)); });
    box.appendChild(ol);
  }

  function renderCreator() {
    var box = $('ps-creator-recent-list');
    if (!box) return;
    var r = radio();
    box.textContent = '';
    var allowed = [];
    (creatorPicks || []).forEach(function (row) {
      if (!row || !row.id) return;
      var t = null;
      if (r) {
        var cat = r.catalog();
        for (var i = 0; i < cat.length; i++) if (cat[i].id === row.id) t = cat[i];
      }
      if (t) allowed.push(t);
    });
    if (!allowed.length) {
      box.appendChild(el('p', 'ps-recent-empty', 'No creator picks are published just now.'));
      return;
    }
    var ol = el('ol', 'ps-pl-tracks');
    allowed.forEach(function (t) { ol.appendChild(trackButton(t, 'Creator pick')); });
    box.appendChild(ol);
  }

  function paintQueue(detail) {
    var r = radio();
    var panel = $('ps-app-queue-panel');
    var list = $('ps-app-queue-list');
    var btn = $('ps-app-queue');
    if (!panel || !list || !r || !r.queue) return;
    var items = r.queue();
    var open = btn && btn.getAttribute('aria-pressed') === 'true';
    panel.hidden = !open;
    var sig = items.map(function (t) { return t.id; }).join(',');
    if (sig === queueSig && list.childNodes.length) return;
    queueSig = sig;
    list.textContent = '';
    if (!items.length) {
      list.appendChild(el('li', null, 'The queue is empty.'));
      return;
    }
    items.forEach(function (t) {
      var li = document.createElement('li');
      li.appendChild(el('span', null, t.title));
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.textContent = 'Remove';
      rm.setAttribute('aria-label', 'Remove ' + t.title + ' from queue');
      rm.addEventListener('click', function () { if (r.removeFromQueue) r.removeFromQueue(t.id); });
      li.appendChild(rm);
      list.appendChild(li);
    });
    if (detail && detail.track) markCurrent();
  }

  function paintTransport(detail) {
    lastDetail = detail || null;
    var t = detail && detail.track;
    var title = $('ps-app-now-name') || $('ps-app-now-title');
    var sub = $('ps-app-now-sub');
    var art = $('ps-app-now-art');
    var play = $('ps-app-play');
    var radioBtn = $('ps-app-radio');
    var seek = $('ps-app-seek');
    var time = $('ps-app-time');
    var vol = $('ps-app-vol');
    var badge = $('ps-app-now-badge');
    if (title) title.textContent = t ? t.title : 'Nothing playing';
    if (sub) {
      sub.textContent = t
        ? ((t.artist || 'Pleading Socially') + ' · ' + (t.label || (t.kind === 'human' ? "Shane's own voice" : 'AI-generated')) + (t.genre ? ' · ' + t.genre : '') + (detail.radio ? ' · Radio' : ''))
        : 'Press play when you are ready. Nothing starts by itself.';
    }
    if (badge) {
      if (!t) {
        badge.hidden = true;
        badge.textContent = '';
      } else {
        var info = badgeInfo(t);
        badge.hidden = false;
        badge.className = info.cls;
        badge.textContent = info.text;
        badge.setAttribute('aria-label', info.name);
      }
    }
    if (art) {
      art.className = 'ps-art ps-art-lg ' + (radio() ? radio().artClass(t && t.id) : 'ps-art-01');
      art.textContent = '';
      if (t) art.appendChild(originBadge(t));
    }
    if (play) {
      play.textContent = detail && detail.playing ? 'Pause' : 'Play';
      play.setAttribute('aria-pressed', detail && detail.playing ? 'true' : 'false');
    }
    if (radioBtn) radioBtn.setAttribute('aria-pressed', detail && detail.radio ? 'true' : 'false');
    if (seek && document.activeElement !== seek) {
      seek.max = detail && detail.duration ? String(Math.floor(detail.duration)) : '0';
      seek.value = String(Math.floor((detail && detail.time) || 0));
    }
    if (time && radio()) {
      time.textContent = radio().formatTime((detail && detail.time) || 0) + ' / ' + radio().formatTime((detail && detail.duration) || 0);
    }
    if (vol && document.activeElement !== vol && detail) {
      vol.value = String(Math.round((detail.volume || 0) * 100));
    }
    renderYourRecent();
    paintStatus(countLibrary());
    renderDiscovery(detail);
    paintQueue(detail);
    markCurrent();
    if (detail && detail.playing) document.body.classList.add('ps-is-playing');
    else document.body.classList.remove('ps-is-playing');
  }

  function bindTransport() {
    var r = radio();
    if (!r) return;
    var play = $('ps-app-play');
    var prev = $('ps-app-prev');
    var next = $('ps-app-next');
    var radioBtn = $('ps-app-radio');
    var seek = $('ps-app-seek');
    var vol = $('ps-app-vol');
    var clear = $('ps-recent-clear');
    var queueBtn = $('ps-app-queue');
    var queueClear = $('ps-app-queue-clear');
    if (play) play.addEventListener('click', function () { r.toggle(); });
    if (prev) prev.addEventListener('click', function () { r.prev(); });
    if (next) next.addEventListener('click', function () { r.next(); });
    if (radioBtn) radioBtn.addEventListener('click', function () { r.setRadio(!r.isRadio()); });
    if (seek) seek.addEventListener('change', function () { r.seek(Number(seek.value) || 0); });
    if (vol) vol.addEventListener('input', function () { r.setVolume(Number(vol.value) / 100); });
    if (clear) clear.addEventListener('click', function () { r.clearRecent(); renderYourRecent(); });
    if (queueBtn) queueBtn.addEventListener('click', function () {
      var open = queueBtn.getAttribute('aria-pressed') === 'true';
      queueBtn.setAttribute('aria-pressed', open ? 'false' : 'true');
      queueSig = '';
      paintQueue(lastDetail);
    });
    if (queueClear) queueClear.addEventListener('click', function () {
      if (r.clearQueue) r.clearQueue();
    });
  }

  function bindChips() {
    if (chipsBound) return;
    chipsBound = true;
    var buttons = document.querySelectorAll('[data-ps-filter]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (ev) {
        var btn = ev.currentTarget;
        var kind = btn.getAttribute('data-ps-filter');
        var value = btn.getAttribute('data-ps-value');
        if (!kind || !filters.hasOwnProperty(kind)) return;
        filters[kind] = value;
        var group = document.querySelectorAll('[data-ps-filter="' + kind + '"]');
        for (var n = 0; n < group.length; n++) {
          group[n].setAttribute('aria-pressed', group[n] === btn ? 'true' : 'false');
        }
        shelfKey = '';
        paintStatus(countLibrary());
        renderDiscovery(lastDetail);
      });
    }
  }

  function bindPulse() {
    if (pulseArmed) return;
    pulseArmed = true;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    var ctx = null;
    var analyser = null;
    var loop = false;
    function arm() {
      if (ctx) return;
      var audio = $('ps-app-audio');
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!audio || !AC) return;
      try {
        ctx = new AC();
        var src = ctx.createMediaElementSource(audio);
        analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        src.connect(analyser);
        analyser.connect(ctx.destination);
      } catch (e) {
        ctx = null;
      }
    }
    function tick() {
      if (!analyser || !loop) return;
      var bins = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(bins);
      var sum = 0;
      for (var i = 0; i < bins.length; i++) sum += bins[i];
      var level = bins.length ? (sum / (bins.length * 255)) : 0;
      document.documentElement.style.setProperty('--ps-level', level.toFixed(3));
      window.requestAnimationFrame(tick);
    }
    document.addEventListener('ps-radio', function (e) {
      var playing = !!(e.detail && e.detail.playing);
      loop = playing;
      if (!playing) return;
      arm();
      if (ctx && ctx.state === 'suspended') {
        var resumed = ctx.resume();
        if (resumed && resumed.catch) resumed.catch(function () {});
      }
      if (analyser) window.requestAnimationFrame(tick);
    });
  }

  var bound = false;
  function mount() {
    if (!$('ps-app')) return;
    renderPlaylists();
    renderYourRecent();
    renderCreator();
    bindChips();
    if (!bound) {
      bindTransport();
      bindPulse();
      bound = true;
    }
    shelfKey = '';
    paintStatus(countLibrary());
    renderDiscovery(lastDetail);
    markCurrent();
  }

  function whenReady(fn) {
    if (radio() && radio().ready()) fn();
    else document.addEventListener('ps-radio-ready', fn, { once: true });
  }

  function boot() {
    whenReady(function () {
      fetch(CREATOR_URL, { cache: 'no-cache' })
        .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
        .then(function (data) {
          creatorPicks = (data && data.tracks) || [];
          mount();
        })
        .catch(function () { creatorPicks = []; mount(); });
    });
  }

  document.addEventListener('ps-radio', function (e) { paintTransport(e.detail || {}); });
  document.addEventListener('ps:navigate', function () {
    bound = false;
    chipsBound = false;
    shelfKey = '';
    boot();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
