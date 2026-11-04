/* Insane Radio: user-initiated, visible official video playback. No hosted audio. */
(function () {
  'use strict';
  var lib = [], idx = 0, playing = false, frame = null;
  function el(id) { return document.getElementById(id); }
  function setText(id, value) { var n = el(id); if (n) n.textContent = value; }
  function current() { return lib[idx]; }
  function validId(value) { return typeof value === 'string' && /^[A-Za-z0-9_-]{11}$/.test(value); }
  function sourceLink(track) {
    var raw = track && track.supportLink;
    try { var url = new URL(raw); if (url.protocol === 'https:' && ['www.youtube.com','youtube.com','youtu.be','music.youtube.com'].includes(url.hostname)) return url.href; } catch (e) {}
    return 'https://www.youtube.com/results?search_query=' + encodeURIComponent((track ? track.artist + ' ' + track.title : 'Insane Radio'));
  }
  function ensureFrame() {
    if (frame) return frame;
    var container = el('radio-video');
    if (!container) return null;
    frame = document.createElement('iframe');
    frame.title = 'Official music video — YouTube player';
    frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
    frame.setAttribute('allowfullscreen', '');
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frame.style.cssText = 'width:100%;aspect-ratio:16/9;display:block;border:0;border-radius:12px;background:#05070b';
    container.appendChild(frame);
    return frame;
  }
  function resetFrame() {
    if (frame) { frame.remove(); frame = null; }
    var container = el('radio-video');
    if (container) container.hidden = true;
  }
  function updateButton(label) {
    var button = el('radio-play');
    if (button) { button.textContent = label; button.setAttribute('aria-label', label); }
  }
  function render() {
    var t = current();
    if (!t) { setText('radio-title', 'No tracks available'); setText('radio-status', 'The radio library is empty. Please try again later.'); return; }
    setText('radio-title', t.title);
    setText('radio-artist', t.artist);
    setText('radio-era', [t.region, t.era, t.genre].filter(Boolean).join(' · '));
    var link = el('radio-support');
    if (link) { link.href = sourceLink(t); link.textContent = 'Open official music link'; }
    var up = el('radio-upnext');
    if (up) {
      up.replaceChildren();
      for (var i = 1; i < Math.min(lib.length, 4); i++) {
        var n = lib[(idx + i) % lib.length];
        var li = document.createElement('li');
        li.textContent = n.title + ' · ' + n.artist;
        up.appendChild(li);
      }
    }
  }
  function play() {
    var t = current();
    if (!t) return;
    if (!validId(t.youtubeId)) {
      playing = false;
      resetFrame();
      updateButton('Open on YouTube');
      setText('radio-status', 'This track has no verified embedded player. Use the official music link.');
      var link = el('radio-support');
      if (link) { link.focus(); }
      return;
    }
    var container = el('radio-video');
    if (!container) { setText('radio-status', 'Player unavailable. Use the official music link.'); return; }
    container.hidden = false;
    var video = ensureFrame();
    if (!video) return;
    video.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(t.youtubeId) + '?autoplay=1&playsinline=1&rel=0';
    playing = true;
    updateButton('Stop');
    setText('radio-status', 'Video loaded. If sound does not start, tap Play in the video or open the official link below.');
  }
  function stop() {
    resetFrame();
    playing = false;
    updateButton('Play');
    setText('radio-status', 'Stopped — press Play');
  }
  function move(delta) {
    if (!lib.length) return;
    var resume = playing;
    stop();
    idx = (idx + delta + lib.length) % lib.length;
    render();
    if (resume) play();
  }
  function init() {
    setText('radio-status', 'Loading track list…');
    fetch('/data/radio-library.json').then(function (response) {
      if (!response.ok) throw new Error('Library HTTP ' + response.status);
      return response.json();
    }).then(function (data) {
      lib = Array.isArray(data.tracks) ? data.tracks.filter(function (t) { return t && typeof t.title === 'string' && typeof t.artist === 'string'; }) : [];
      render();
      if (lib.length) setText('radio-status', 'Ready — press Play. Sound starts only when you choose.');
      var button = el('radio-play');
      if (button) button.addEventListener('click', function () {
        if (playing) stop();
        else if (current() && !validId(current().youtubeId)) {
          window.open(sourceLink(current()), '_blank', 'noopener,noreferrer');
          setText('radio-status', 'Opened the official music link in a new tab.');
        } else play();
      });
      var next = el('radio-next'); if (next) next.addEventListener('click', function () { move(1); });
      var prev = el('radio-prev'); if (prev) prev.addEventListener('click', function () { move(-1); });
    }).catch(function () { setText('radio-status', 'Track list unavailable. Please reload or try again later.'); updateButton('Play'); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
