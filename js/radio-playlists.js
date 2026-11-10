/* Insane Radio playlist links — device-local, consent-first, official YouTube embeds only.
   2026-11 god-mode: saved playlists render as big clickable buttons (Play here / Open in
   YouTube Music / Remove) with per-item themed accent. Shane's curated slots from
   /data/music-playlists.json auto-render as buttons when filled (empty by default). */
(function () {
  'use strict';
  var KEY = 'ps-radio-playlist-links-v1';
  var form = document.getElementById('radio-playlist-form');
  var field = document.getElementById('radio-playlist-url');
  var list = document.getElementById('radio-playlist-list');
  var status = document.getElementById('radio-playlist-status');
  var embed = document.getElementById('radio-playlist-embed');
  if (!form || !field || !list || !status || !embed) return;
  function playlistId(value) {
    try {
      var url = new URL(value);
      if (url.protocol !== 'https:' || !['youtube.com', 'www.youtube.com', 'music.youtube.com', 'm.youtube.com'].includes(url.hostname)) return null;
      if (!['/playlist', '/watch'].includes(url.pathname)) return null;
      var id = url.searchParams.get('list');
      return id && /^[A-Za-z0-9_-]{10,100}$/.test(id) ? id : null;
    } catch (_) { return null; }
  }
  function read() {
    try {
      var value = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(value) ? value.filter(function (id) { return /^[A-Za-z0-9_-]{10,100}$/.test(id); }).slice(0, 30) : [];
    } catch (_) { return []; }
  }
  var ids = read();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(ids)); return true; }
    catch (_) { status.textContent = 'This browser cannot save playlists. Links remain available until you close the page.'; return false; }
  }
  function openPlaylist(id) {
    embed.replaceChildren();
    var frame = document.createElement('iframe');
    frame.title = 'YouTube playlist player';
    frame.src = 'https://www.youtube-nocookie.com/embed/videoseries?list=' + encodeURIComponent(id);
    frame.loading = 'lazy';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.style.cssText = 'display:block;width:100%;aspect-ratio:16/9;border:0;border-radius:12px';
    embed.appendChild(frame);
    status.textContent = 'Playlist opened in the official player. If it stays blank or restricted, open it in YouTube Music — private or region-locked lists need the app.';
  }
  function makeButton(label, ariaLabel, onClick, danger) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'playlist-btn' + (danger ? ' is-danger' : '');
    b.textContent = label;
    b.setAttribute('aria-label', ariaLabel);
    b.addEventListener('click', onClick);
    return b;
  }
  function renderSavedItem(id, i) {
    var item = document.createElement('div');
    item.className = 'playlist-item';
    var title = document.createElement('div');
    title.className = 'playlist-item-title';
    title.textContent = 'Saved playlist ' + (i + 1);
    var sub = document.createElement('div');
    sub.className = 'playlist-item-sub';
    sub.textContent = 'YouTube / YouTube Music · saved on this device only';
    var play = makeButton('Play here', 'Play saved playlist ' + (i + 1) + ' here', function () { openPlaylist(id); });
    var link = document.createElement('a');
    link.className = 'playlist-open';
    link.href = 'https://music.youtube.com/playlist?list=' + encodeURIComponent(id);
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.textContent = 'Open in YouTube Music';
    link.setAttribute('aria-label', 'Open saved playlist ' + (i + 1) + ' in YouTube Music (new tab)');
    var remove = makeButton('Remove', 'Remove saved playlist ' + (i + 1) + ' from this device', function () {
      ids = ids.filter(function (x) { return x !== id; });
      save(); embed.replaceChildren(); render(); status.textContent = 'Playlist removed from this device.';
    }, true);
    item.append(title, sub, play, link, remove);
    return item;
  }
  // Shane's curated slots from /data/music-playlists.json — render as buttons only when filled.
  var PLATFORMS = [
    { key: 'youtube_url', name: 'YouTube' },
    { key: 'sonos_url', name: 'Sonos' },
    { key: 'amazon_music_url', name: 'Amazon Music' }
  ];
  function renderCurated(cfg) {
    var filled = PLATFORMS.filter(function (p) { return (cfg[p.key] || '').trim(); });
    if (!filled.length) return null;
    var item = document.createElement('div');
    item.className = 'playlist-item playlist-curated';
    var title = document.createElement('div');
    title.className = 'playlist-item-title';
    title.textContent = (cfg.label && cfg.label.trim()) ? cfg.label.trim() : "Shane's playlist";
    var sub = document.createElement('div');
    sub.className = 'playlist-item-sub';
    sub.textContent = 'Curated by Shane · opens in the official service';
    item.append(title, sub);
    for (var i = 0; i < filled.length; i++) {
      (function (p) {
        var url = cfg[p.key].trim();
        if (p.key === 'youtube_url') {
          var yid = playlistId(url);
          if (yid) {
            item.appendChild(makeButton('Play here', 'Play ' + title.textContent + ' here', function () { openPlaylist(yid); }));
          }
        }
        var a = document.createElement('a');
        a.className = 'playlist-open';
        a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.textContent = 'Open in ' + p.name;
        a.setAttribute('aria-label', 'Open ' + title.textContent + ' in ' + p.name + ' (new tab)');
        item.appendChild(a);
      })(filled[i]);
    }
    return item;
  }
  function loadCurated() {
    if (typeof fetch !== 'function') return;
    fetch('/data/music-playlists.json', { cache: 'force-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j) return;
        var cfg = {};
        PLATFORMS.forEach(function (p) { cfg[p.key] = (typeof j[p.key] === 'string') ? j[p.key].trim() : ''; });
        cfg.label = (typeof j.label === 'string') ? j.label.trim() : '';
        var node = renderCurated(cfg);
        if (node) { list.prepend(node); }
      })
      .catch(function () { /* empty or missing config — no curated buttons */ });
  }
  function render() {
    list.replaceChildren();
    if (!ids.length) {
      var empty = document.createElement('p');
      empty.className = 'playlist-empty';
      empty.textContent = 'No playlists saved on this device yet. Paste a public or unlisted YouTube Music link above.';
      list.appendChild(empty);
    } else {
      ids.forEach(function (id, i) { list.appendChild(renderSavedItem(id, i)); });
    }
    loadCurated();
  }
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var id = playlistId(field.value.trim());
    if (!id) { status.textContent = 'Enter a valid YouTube or YouTube Music playlist URL (https://music.youtube.com/playlist?list=...).'; return; }
    if (ids.includes(id)) { status.textContent = 'That playlist is already saved on this device.'; return; }
    if (ids.length >= 30) { status.textContent = 'Maximum 30 playlists on this device. Remove one first.'; return; }
    ids.push(id); save(); field.value = ''; render();
    status.textContent = 'Playlist added to this device. Tap Play here to load the official YouTube player.';
  });
  render();
})();
