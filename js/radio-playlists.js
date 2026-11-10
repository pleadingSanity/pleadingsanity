/* Insane Radio playlist links — device-local, consent-first, official YouTube embeds only. */
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
  function render() {
    list.replaceChildren();
    if (!ids.length) {
      var empty = document.createElement('li');
      empty.textContent = 'No playlists saved on this device yet. Paste a public or unlisted YouTube Music link above.';
      list.appendChild(empty);
      return;
    }
    ids.forEach(function (id, i) {
      var item = document.createElement('li');
      var name = document.createElement('span');
      name.textContent = 'Playlist ' + (i + 1) + ' · ';
      var play = document.createElement('button');
      play.type = 'button'; play.textContent = 'Play here';
      play.addEventListener('click', function () { openPlaylist(id); });
      var link = document.createElement('a');
      link.href = 'https://music.youtube.com/playlist?list=' + encodeURIComponent(id);
      link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.textContent = 'Open in YouTube Music';
      var remove = document.createElement('button');
      remove.type = 'button'; remove.textContent = 'Remove';
      remove.setAttribute('aria-label', 'Remove playlist ' + (i + 1));
      remove.addEventListener('click', function () {
        ids = ids.filter(function (x) { return x !== id; });
        save(); embed.replaceChildren(); render(); status.textContent = 'Playlist removed from this device.';
      });
      item.append(name, play, document.createTextNode(' · '), link, document.createTextNode(' · '), remove);
      list.appendChild(item);
    });
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
