/* Pleading Sanity — opening splash.
   Shows the crying-brain logo on the sky while the page loads.
   Shown once per session (each installed-app launch, once per browser tab).
   Loaded synchronously at the top of <body> so it paints before the page. */
(function () {
  'use strict';
  try {
    // An installed app starts a fresh session on every launch, so it gets the splash each time.
    var seen = false;
    try { seen = sessionStorage.getItem('ps_splash_seen') === '1'; } catch (e) {}
    if (seen) return;
    try { sessionStorage.setItem('ps_splash_seen', '1'); } catch (e) {}

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var style = document.createElement('style');
    style.textContent =
      '#ps-splash{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;' +
      'background:#000103 url(/assets/theme/sky.jpg) center/cover no-repeat;transition:opacity .45s ease,visibility .45s ease;}' +
      '#ps-splash.ps-out{opacity:0;visibility:hidden;}' +
      '#ps-splash img{width:min(46vw,200px);height:auto;filter:drop-shadow(0 0 18px rgba(0,255,240,.5)) drop-shadow(0 0 36px rgba(255,0,255,.22));animation:psSplashIn .7s ease-out both;}' +
      '#ps-splash span{font:800 clamp(1.1rem,5vw,1.5rem)/1.2 system-ui,-apple-system,sans-serif;letter-spacing:.06em;color:#eef6ff;text-shadow:0 0 18px rgba(0,255,240,.45);}' +
      '@keyframes psSplashIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}' +
      '@media (prefers-reduced-motion: reduce){#ps-splash,#ps-splash img{transition:none;animation:none;}}';
    document.head.appendChild(style);

    var el = document.createElement('div');
    el.id = 'ps-splash';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<img src="/assets/images/brand/crying-brain-logo-clear-512.webp" alt="" width="200" height="200" decoding="sync"><span>Pleading Sanity</span>';
    (document.body || document.documentElement).appendChild(el);

    var start = Date.now();
    var minShow = reduce ? 250 : 900;
    var done = false;
    function hide() {
      if (done) return;
      done = true;
      var wait = Math.max(0, minShow - (Date.now() - start));
      setTimeout(function () {
        el.classList.add('ps-out');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, reduce ? 0 : 500);
      }, wait);
    }
    if (document.readyState === 'complete') hide();
    else window.addEventListener('load', hide);
    setTimeout(hide, 2500); // never hold the page hostage on a slow image
    el.addEventListener('click', hide);
  } catch (e) { /* splash is decoration only */ }
})();
