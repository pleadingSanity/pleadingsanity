/* Insane Radio — starts silent. No hosted audio. Official links only. */
(function () {
  'use strict';
  var lib = null, idx = 0, playing = false, frame = null, vol = 15;
  try { var s = localStorage.getItem('psRadioVol'); if (s) vol = Math.max(0, Math.min(100, parseInt(s, 10) || 15)); } catch (e) {}

  function el(id) { return document.getElementById(id); }
  function setText(id, t) { var n = el(id); if (n) n.textContent = t; }

  function loadLib(cb) {
    fetch('/data/radio-library.json').then(function (r) { return r.json(); }).then(function (d) {
      lib = d.tracks || [];
      cb();
    }).catch(function () { setText('radio-status', 'Library unavailable.'); });
  }

  function current() { return lib && lib[idx]; }

  function ensureFrame() {
    if (frame) return;
    frame = document.createElement('iframe');
    frame.title = 'Insane Radio player';
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;left:-9999px';
    frame.allow = 'encrypted-media';
    document.body.appendChild(frame);
  }

  function render() {
    var t = current();
    if (!t) return;
    setText('radio-title', t.title);
    setText('radio-artist', t.artist);
    setText('radio-era', t.region + ' · ' + t.era + ' · ' + t.genre);
    var link = el('radio-support');
    if (link) { link.href = t.supportLink || '#'; link.textContent = 'Support this artist'; }
    var up = el('radio-upnext');
    if (up) {
      up.innerHTML = '';
      for (var i = 1; i <= 3; i++) {
        var n = lib[(idx + i) % lib.length];
        var li = document.createElement('li');
        li.textContent = n.title + ' · ' + n.artist;
        up.appendChild(li);
      }
    }
  }

  function play() {
    var t = current();
    if (!t || !t.youtubeId) { window.open(t && t.supportLink ? t.supportLink : '#', '_blank'); return; }
    ensureFrame();
    frame.src = 'https://www.youtube.com/embed/' + t.youtubeId + '?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1';
    playing = true;
    var btn = el('radio-play');
    if (btn) { btn.textContent = 'Pause'; btn.setAttribute('aria-label', 'Pause'); }
    setText('radio-status', 'Playing');
  }

  function pause() {
    if (frame) frame.src = 'about:blank';
    playing = false;
    var btn = el('radio-play');
    if (btn) { btn.textContent = 'Play'; btn.setAttribute('aria-label', 'Play'); }
    setText('radio-status', 'Silent');
  }

  function next() { if (!lib) return; idx = (idx + 1) % lib.length; render(); if (playing) play(); }
  function prev() { if (!lib) return; idx = (idx - 1 + lib.length) % lib.length; render(); if (playing) play(); }

  function init() {
    loadLib(function () {
      render();
      setText('radio-status', 'Silent — press Play');
      var btn = el('radio-play');
      if (btn) btn.addEventListener('click', function () { playing ? pause() : play(); });
      var n = el('radio-next'); if (n) n.addEventListener('click', next);
      var p = el('radio-prev'); if (p) p.addEventListener('click', prev);
      var sl = el('radio-vol');
      if (sl) {
        sl.value = vol;
        sl.addEventListener('input', function () {
          vol = parseInt(sl.value, 10) || 15;
          try { localStorage.setItem('psRadioVol', String(vol)); } catch (e) {}
        });
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
