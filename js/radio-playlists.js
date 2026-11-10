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
      if (url.protocol !== 'https:' || !['youtube.com', 'www.youtube.com', 'music.youtube.com', 'm.youtube.com', 'youtu.be'].includes(url.hostname)) return null;
      if (url.hostname === 'youtu.be') {
        var vid = url.pathname.slice(1).split('/')[0];
        return /^[A-Za-z0-9_-]{11}$/.test(vid) ? 'v:' + vid : null;
      }
      if (!['/playlist', '/watch'].includes(url.pathname)) return null;
      var list = url.searchParams.get('list');
      if (list && /^[A-Za-z0-9_-]{10,100}$/.test(list)) return list;
      var v = url.searchParams.get('v');
      if (url.pathname === '/watch' && v && /^[A-Za-z0-9_-]{11}$/.test(v)) return 'v:' + v;
      return null;
    } catch (_) { return null; }
  }
  function read() {
    try {
      var value = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(value) ? value.filter(function (id) { return /^[A-Za-z0-9_-]{10,100}$/.test(id) || /^v:[A-Za-z0-9_-]{11}$/.test(id); }).slice(0, 30) : [];
    } catch (_) { return []; }
  }
  var ids = read();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(ids)); return true; }
    catch (_) { status.textContent = 'This browser cannot save playlists. Links remain available until you close the page.'; return false; }
  }
  function openPlaylist(id) {
    embed.replaceChildren();
    var isVideo = /^v:/.test(id);
    var frame = document.createElement('iframe');
    frame.title = isVideo ? 'YouTube video player' : 'YouTube playlist player';
    frame.src = isVideo
      ? 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id.slice(2))
      : 'https://www.youtube-nocookie.com/embed/videoseries?list=' + encodeURIComponent(id);
    frame.loading = 'lazy';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.style.cssText = 'display:block;width:100%;aspect-ratio:16/9;border:0;border-radius:12px';
    embed.appendChild(frame);
    status.textContent = isVideo
      ? 'Track opened in the official player. If it stays blank or restricted, open it in YouTube Music.'
      : 'Playlist opened in the official player. If it stays blank or restricted, open it in YouTube Music — private or region-locked lists need the app.';
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
    var isVideo = /^v:/.test(id);
    var title = document.createElement('div');
    title.className = 'playlist-item-title';
    title.textContent = isVideo ? 'Saved track ' + (i + 1) : 'Saved playlist ' + (i + 1);
    var sub = document.createElement('div');
    sub.className = 'playlist-item-sub';
    sub.textContent = isVideo ? 'Single YouTube track · saved on this device only' : 'YouTube / YouTube Music · saved on this device only';
    var play = makeButton('Play here', 'Play saved ' + (isVideo ? 'track' : 'playlist') + ' ' + (i + 1) + ' here', function () { openPlaylist(id); });
    var link = document.createElement('a');
    link.className = 'playlist-open';
    link.href = isVideo ? ('https://music.youtube.com/watch?v=' + encodeURIComponent(id.slice(2))) : ('https://music.youtube.com/playlist?list=' + encodeURIComponent(id));
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.textContent = 'Open in YouTube Music';
    link.setAttribute('aria-label', 'Open saved ' + (isVideo ? 'track' : 'playlist') + ' ' + (i + 1) + ' in YouTube Music (new tab)');
    var remove = makeButton('Remove', 'Remove saved playlist ' + (i + 1) + ' from this device', function () {
      ids = ids.filter(function (x) { return x !== id; });
      save(); embed.replaceChildren(); render(); status.textContent = 'Playlist removed from this device.';
    }, true);
    item.append(title, sub, play, link, remove);
    return item;
  }
  // Shane's curated slots from /data/music-playlists.json — always render a block.
  // Filled slots become action buttons (YouTube: in-page nocookie embed + official
  // link; Sonos / Amazon Music: honest deep-link "Opens in ... app" — we cannot
  // embed them). Empty slots render a dashed hint telling Shane exactly where to
  // add the link. Never invent a playlist URL.
  var PLATFORMS = [
    { key: 'youtube_url', name: 'YouTube' },
    { key: 'sonos_url', name: 'Sonos' },
    { key: 'amazon_music_url', name: 'Amazon Music' }
  ];
  function renderCurated(cfg) {
    var item = document.createElement('div');
    item.className = 'playlist-item playlist-curated';
    var title = document.createElement('div');
    title.className = 'playlist-item-title';
    title.textContent = (cfg.label && cfg.label.trim()) ? cfg.label.trim() : "Shane's playlists";
    var sub = document.createElement('div');
    sub.className = 'playlist-item-sub';
    sub.textContent = 'Curated by Shane · opens in the official service. Empty slots are waiting for a link in data/music-playlists.json.';
    item.append(title, sub);
    for (var i = 0; i < PLATFORMS.length; i++) {
      (function (p) {
        var url = (cfg[p.key] || '').trim();
        if (!url) {
          var hint = document.createElement('div');
          hint.className = 'playlist-slot-empty';
          hint.setAttribute('role', 'note');
          hint.textContent = 'Add your ' + p.name + ' playlist link → data/music-playlists.json';
          item.appendChild(hint);
          return;
        }
        if (p.key === 'youtube_url') {
          var yid = playlistId(url);
          if (yid) {
            item.appendChild(makeButton('Play here', 'Play ' + title.textContent + ' on ' + p.name + ' here', function () { openPlaylist(yid); }));
          }
        }
        var a = document.createElement('a');
        a.className = 'playlist-open';
        a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        var openLabel = p.key === 'youtube_url' ? 'Open on YouTube' : (p.key === 'sonos_url' ? 'Open in Sonos app' : 'Open in Amazon Music');
        a.textContent = openLabel;
        a.setAttribute('aria-label', openLabel + ' — ' + title.textContent + ' (new tab or app)');
        item.appendChild(a);
        if (p.key !== 'youtube_url') {
          var note = document.createElement('div');
          note.className = 'playlist-item-sub';
          note.style.flex = '1 1 100%';
          note.textContent = p.key === 'sonos_url' ? 'Sonos cannot be embedded — this opens the Sonos app or site.' : 'Amazon Music cannot be embedded — this opens music.amazon.com.';
          item.appendChild(note);
        }
      })(PLATFORMS[i]);
    }
    return item;
  }
  function loadCurated() {
    if (typeof fetch !== 'function') return;
    fetch('/data/music-playlists.json', { cache: 'force-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var cfg = { label: '', youtube_url: '', sonos_url: '', amazon_music_url: '' };
        if (j) { for (var k in cfg) { if (typeof j[k] === 'string') cfg[k] = j[k].trim(); } cfg.label = (typeof j.label === 'string') ? j.label.trim() : ''; }
        var existing = list.querySelector('.playlist-curated');
        if (existing) existing.remove();
        list.prepend(renderCurated(cfg));
      })
      .catch(function () {
        var existing = list.querySelector('.playlist-curated');
        if (existing) existing.remove();
        list.prepend(renderCurated({ label: '', youtube_url: '', sonos_url: '', amazon_music_url: '' }));
      });
  }
  // ---------- Sane Shane's Playlists (config-driven named playlist cards) ----------
  // Reads shane_playlists[] from /data/music-playlists.json. Each entry:
  //   { "name": "...", "youtube_playlist_id": "", "url": "", "description": "" }
  // Filled youtube_playlist_id -> official youtube-nocookie embed + open link.
  // Empty array / empty ids -> honest empty-state card. No invented URLs/IDs.
  // Shane's email is never published — we reference "Shane's YouTube Music" only.
  var shaneGrid = document.getElementById('shane-playlists-grid');
  function validPlaylistIdShane(id) { return typeof id === 'string' && /^[A-Za-z0-9_-]{10,100}$/.test(id); }
  function shaneEmptyCard(name) {
    var card = document.createElement('div');
    card.className = 'shane-playlist-card shane-playlist-empty';
    var badge = document.createElement('span');
    badge.className = 'shane-empty-badge';
    badge.textContent = 'Coming soon';
    var title = document.createElement('div');
    title.className = 'shane-playlist-name';
    title.textContent = name && String(name).trim() ? String(name).trim() : "Shane's dropping his playlists in";
    var note = document.createElement('p');
    note.className = 'shane-empty-note';
    note.textContent = name && String(name).trim()
      ? 'This Shane playlist is not live yet — check back. When it drops, the official YouTube player embeds right here.'
      : "Shane's dropping his playlists in — check back. They'll embed right here with the official YouTube player. No links are invented.";
    card.append(badge, title, note);
    return card;
  }
  function shaneFilledCard(entry) {
    var card = document.createElement('div');
    card.className = 'shane-playlist-card is-filled';
    var name = entry.name && String(entry.name).trim() ? String(entry.name).trim() : "Shane's playlist";
    var title = document.createElement('div');
    title.className = 'shane-playlist-name';
    title.textContent = name;
    if (entry.description && String(entry.description).trim()) {
      var desc = document.createElement('p');
      desc.className = 'shane-playlist-desc';
      desc.textContent = String(entry.description).trim();
      card.appendChild(desc);
    }
    var actions = document.createElement('div');
    actions.className = 'shane-playlist-actions';
    var isVideo = !validPlaylistIdShane(entry.youtube_playlist_id) && /^[A-Za-z0-9_-]{11}$/.test(String(entry.youtube_video_id || ''));
    var id = isVideo ? 'v:' + String(entry.youtube_video_id).trim() : entry.youtube_playlist_id;
    var embedWrap = document.createElement('div');
    embedWrap.className = 'shane-embed';
    embedWrap.hidden = true;
    var play = document.createElement('button');
    play.type = 'button';
    play.className = 'shane-playlist-btn';
    play.textContent = 'Play here';
    play.setAttribute('aria-label', 'Play ' + name + ' here with the official YouTube player');
    play.addEventListener('click', function () {
      if (!embedWrap.hidden) { embedWrap.hidden = true; embedWrap.replaceChildren(); play.textContent = 'Play here'; return; }
      var frame = document.createElement('iframe');
      frame.title = name + (isVideo ? ' — YouTube video player' : ' — YouTube playlist player');
      frame.src = isVideo ? ('https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id.slice(2))) : ('https://www.youtube-nocookie.com/embed/videoseries?list=' + encodeURIComponent(id));
      frame.loading = 'lazy';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.allowFullscreen = true;
      embedWrap.appendChild(frame);
      embedWrap.hidden = false;
      play.textContent = 'Hide player';
    });
    actions.appendChild(play);
    var open = document.createElement('a');
    open.className = 'shane-playlist-btn';
    open.href = (entry.url && String(entry.url).trim()) ? String(entry.url).trim() : (isVideo ? ('https://music.youtube.com/watch?v=' + encodeURIComponent(id.slice(2))) : ('https://music.youtube.com/playlist?list=' + encodeURIComponent(id)));
    open.target = '_blank'; open.rel = 'noopener noreferrer';
    open.textContent = "Open on Shane's YouTube Music";
    open.setAttribute('aria-label', 'Open ' + name + " on Shane's YouTube Music (new tab)");
    actions.appendChild(open);
    card.append(title, actions, embedWrap);
    return card;
  }
  function renderShane(cfg) {
    if (!shaneGrid) return;
    shaneGrid.replaceChildren();
    var list = Array.isArray(cfg.shane_playlists) ? cfg.shane_playlists : [];
    var filled = list.filter(function (e) { return e && (validPlaylistIdShane(e.youtube_playlist_id) || /^[A-Za-z0-9_-]{11}$/.test(String(e.youtube_video_id || ''))); });
    if (!filled.length) {
      var named = list.filter(function (e) { return e && e.name && String(e.name).trim(); });
      shaneGrid.appendChild(shaneEmptyCard(named.length ? named[0].name : ''));
      return;
    }
    filled.forEach(function (entry) { shaneGrid.appendChild(shaneFilledCard(entry)); });
  }
  function loadShane() {
    if (!shaneGrid) return;
    if (typeof fetch !== 'function') { renderShane({ shane_playlists: [] }); return; }
    fetch('/data/music-playlists.json', { cache: 'force-cache' })
      .then(function (r) { return r.ok ? r.json() : { shane_playlists: [] }; })
      .then(function (j) { renderShane({ shane_playlists: (j && Array.isArray(j.shane_playlists)) ? j.shane_playlists : [] }); })
      .catch(function () { renderShane({ shane_playlists: [] }); });
  }
  loadShane();
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
    if (!id) { status.textContent = 'Enter a valid YouTube or YouTube Music link — a playlist (…/playlist?list=…) or a single track (…/watch?v=…).'; return; }
    if (ids.includes(id)) { status.textContent = 'That playlist is already saved on this device.'; return; }
    if (ids.length >= 30) { status.textContent = 'Maximum 30 playlists on this device. Remove one first.'; return; }
    ids.push(id); save(); field.value = ''; render();
    status.textContent = 'Link added to this device. Tap Play here to load the official YouTube player.';
  });
  render();
})();
