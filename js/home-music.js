/* Homepage music — starts silent. No iframe until Play. */
(function () {
  'use strict';
  if (!/\/(index\.html)?$/.test(location.pathname) && location.pathname !== '/') return;
  var tracks = [
    { id: 'DjdB4Bm4n2M', title: 'Man on the Moon' },
    { id: '3pysm_JU_wA', title: 'Deliverance' },
    { id: '0slhR2obZSE', title: 'NVM' }
  ];
  var vol = 15;
  try { var s = localStorage.getItem('psHomeVol'); if (s) vol = Math.max(0, Math.min(100, parseInt(s, 10) || 15)); } catch (e) {}
  var idx = 0, playing = false, frame = null;

  var bar = document.createElement('div');
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Homepage music');
  bar.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:40;display:flex;gap:8px;align-items:center;background:#0b0f19;border:1px solid rgba(0,255,240,.35);border-radius:999px;padding:8px 12px;color:#eef6ff;font:14px system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.4)';
  bar.innerHTML = '<button type="button" aria-label="Play music" style="background:#00fff0;color:#0b0f19;border:0;border-radius:999px;padding:8px 14px;font-weight:700;cursor:pointer">Play</button>' +
    '<span aria-live="polite" style="min-width:7rem;font-size:13px;color:#94a3b8">Silent</span>' +
    '<input type="range" min="0" max="100" value="' + vol + '" aria-label="Volume" style="width:72px">';
  document.body.appendChild(bar);
  var btn = bar.querySelector('button');
  var label = bar.querySelector('span');
  var slider = bar.querySelector('input');

  function ensureFrame() {
    if (frame) return;
    frame = document.createElement('iframe');
    frame.title = 'Homepage music';
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;left:-9999px';
    frame.allow = 'encrypted-media';
    document.body.appendChild(frame);
  }
  function load(i, auto) {
    ensureFrame();
    var t = tracks[i];
    frame.src = 'https://www.youtube.com/embed/' + t.id + '?autoplay=' + (auto ? '1' : '0') + '&mute=0&enablejsapi=1&rel=0&modestbranding=1&playsinline=1';
    label.textContent = t.title;
  }
  btn.addEventListener('click', function () {
    if (!playing) {
      load(idx, true);
      playing = true;
      btn.textContent = 'Pause';
      btn.setAttribute('aria-label', 'Pause music');
    } else {
      if (frame) frame.src = 'about:blank';
      playing = false;
      btn.textContent = 'Play';
      btn.setAttribute('aria-label', 'Play music');
      label.textContent = 'Silent';
    }
  });
  slider.addEventListener('input', function () {
    vol = parseInt(slider.value, 10) || 15;
    try { localStorage.setItem('psHomeVol', String(vol)); } catch (e) {}
  });
})();
