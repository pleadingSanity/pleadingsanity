/* Pleading Socially music app page.
   Renders two playlists (Shane's Voice vs P.S AI), the page transport,
   Your recently played (this browser only) and Creator picks.
   Talks to window.PSRadio. Text is set with textContent. No autoplay. */
(function () {
  'use strict';
  var CREATOR_URL = '/data/creator-recent.json';
  var creatorPicks = [];

  function $(id) { return document.getElementById(id); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function radio() { return window.PSRadio || null; }

  function artFor(id) {
    var n = el('div', 'ps-art ' + (radio() ? radio().artClass(id) : 'ps-art-01'));
    n.setAttribute('aria-hidden', 'true');
    return n;
  }

  function trackButton(track, extraLabel) {
    var li = document.createElement('li');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ps-track-btn';
    btn.setAttribute('data-track-id', track.id);
    var label = track.title + (track.label ? ' (' + track.label + ')' : '');
    if (extraLabel) label += ' — ' + extraLabel;
    btn.setAttribute('aria-label', 'Play ' + label);
    btn.appendChild(artFor(track.id));
    var meta = el('span', 'ps-track-meta');
    meta.appendChild(el('span', 'ps-track-title', track.title + (track.label ? ' (' + track.label + ')' : '')));
    var sub = (track.artist || 'Pleading Socially');
    if (track.genre) sub += ' · ' + track.genre;
    meta.appendChild(el('span', 'ps-track-sub', sub));
    btn.appendChild(meta);
    btn.addEventListener('click', function () {
      var r = radio();
      if (r) r.play(track.id);
    });
    li.appendChild(btn);
    return li;
  }

  function markCurrent() {
    var r = radio();
    var cur = r && r.current && r.current();
    var id = cur && cur.id;
    var nodes = document.querySelectorAll('#ps-app [data-track-id]');
    for (var i = 0; i < nodes.length; i++) {
      var on = id && nodes[i].getAttribute('data-track-id') === id;
      nodes[i].classList.toggle('is-current', !!on);
    }
  }

  function renderPlaylists() {
    var root = $('ps-playlists-list');
    if (!root) return;
    var r = radio();
    var lists = r ? r.playlists() : [];
    root.textContent = '';
    if (!lists.length) {
      root.appendChild(el('p', 'ps-pl-soon', 'The playlists could not load right now. Try again later.'));
      return;
    }
    lists.forEach(function (list) {
      var card = el('article', 'ps-pl-card ps-pl-' + (list.kind === 'ai' ? 'ai' : 'human'));
      card.setAttribute('aria-labelledby', 'ps-pl-' + list.id);
      var badge = el('span', 'ps-pl-badge', list.kind === 'ai' ? 'AI-generated' : (list.label || "Shane's own voice"));
      var h = el('h3', null, list.title);
      h.id = 'ps-pl-' + list.id;
      card.appendChild(badge);
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
          var ul = el('ul', 'ps-pl-studio');
          studio.forEach(function (name) { ul.appendChild(el('li', null, String(name))); });
          card.appendChild(ul);
        }
      }
      root.appendChild(card);
    });
  }

  function renderYourRecent() {
    var box = $('ps-your-recent-list');
    if (!box) return;
    var r = radio();
    var items = r ? r.getRecent() : [];
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

  function paintTransport(detail) {
    var t = detail && detail.track;
    var title = $('ps-app-now-title');
    var sub = $('ps-app-now-sub');
    var art = $('ps-app-now-art');
    var play = $('ps-app-play');
    var radioBtn = $('ps-app-radio');
    var seek = $('ps-app-seek');
    var time = $('ps-app-time');
    var vol = $('ps-app-vol');
    if (title) title.textContent = t ? t.title : 'Nothing playing';
    if (sub) sub.textContent = t
      ? ((t.artist || 'Pleading Socially') + ' · ' + (t.label || 'AI-generated') + (detail.radio ? ' · Radio' : ''))
      : 'Press play when you are ready. Nothing starts by itself.';
    if (art) art.className = 'ps-art ps-art-lg ' + (radio() ? radio().artClass(t && t.id) : 'ps-art-01');
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
    markCurrent();
    renderYourRecent();
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
    if (play) play.addEventListener('click', function () { r.toggle(); });
    if (prev) prev.addEventListener('click', function () { r.prev(); });
    if (next) next.addEventListener('click', function () { r.next(); });
    if (radioBtn) radioBtn.addEventListener('click', function () { r.setRadio(!r.isRadio()); });
    if (seek) seek.addEventListener('change', function () { r.seek(Number(seek.value) || 0); });
    if (vol) vol.addEventListener('input', function () { r.setVolume(Number(vol.value) / 100); });
    if (clear) clear.addEventListener('click', function () { r.clearRecent(); renderYourRecent(); });
  }

  var bound = false;
  function mount() {
    if (!$('ps-app')) return;
    renderPlaylists();
    renderYourRecent();
    renderCreator();
    if (!bound) {
      bindTransport();
      bound = true;
    }
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
    boot();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
