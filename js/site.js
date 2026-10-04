(function () {
  'use strict';
  document.querySelectorAll('.ps-year').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  function stopSelfPlay(frame) {
    if (!frame || frame.dataset.userPlay === '1') return;
    if (!frame.src || frame.src.indexOf('autoplay=1') === -1) return;
    frame.src = frame.src.replace('autoplay=1', 'autoplay=0');
  }
  document.querySelectorAll('iframe').forEach(stopSelfPlay);
  if ('MutationObserver' in window) {
    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (!node || node.nodeType !== 1) return;
          if (node.tagName === 'IFRAME') stopSelfPlay(node);
          if (node.querySelectorAll) node.querySelectorAll('iframe').forEach(stopSelfPlay);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
  var installPrompt = null;
  var installButtons = document.querySelectorAll('[data-pwa-install]');
  function showInstall(show) { installButtons.forEach(function (btn) { btn.hidden = !show; btn.classList.toggle('hidden', !show); }); }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installPrompt = e; showInstall(true); });
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS && !(navigator.standalone === true)) showInstall(true);
  installButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!installPrompt) { if (isIOS) alert('In Safari, tap Share, then Add to Home Screen.'); return; }
      installPrompt.prompt();
      installPrompt.userChoice.finally(function () { installPrompt = null; showInstall(false); });
    });
  });
  // ─── INSTALL ONCE, GROW FOREVER ───
  // The service worker updates itself silently (sw.js skips waiting and
  // clears old caches). A long-open app checks for a new version when it
  // comes back to the screen, at most once an hour. Nothing is reloaded
  // under anyone's fingers: fresh pages simply arrive on the next tap.
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').then(function (reg) {
        var lastCheck = Date.now();
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState !== 'visible' || Date.now() - lastCheck < 3600000) return;
          lastCheck = Date.now();
          reg.update().catch(function () {});
          checkSoul();
        });
      }).catch(function () {});
    });
  }

  // "Arron grew wiser ✨" — when the soul file (/arron-knowledge.json) changes,
  // a gentle note says so, once per new version. Never on someone's first visit.
  var SOUL_SEEN = 'ps-soul-version';
  function gentleNote(text) {
    var note = document.createElement('div');
    note.setAttribute('role', 'status');
    note.textContent = text;
    note.style.cssText = 'position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:9999;max-width:min(92vw,440px);padding:12px 18px;border-radius:14px;background:#0d1b2a;color:#e6ffff;border:1px solid #00fff0;box-shadow:0 6px 30px rgba(0,255,240,.25);font:inherit;font-size:.95rem;line-height:1.4;text-align:center;cursor:pointer';
    note.addEventListener('click', function () { note.remove(); });
    document.body.appendChild(note);
    setTimeout(function () { note.remove(); }, 7000);
  }
  function checkSoul() {
    if (!window.fetch) return;
    fetch('/arron-knowledge.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (soul) {
        if (!soul || !soul.version) return;
        var key = soul.version + '|' + (soul.updated || '');
        var seen = null;
        try { seen = localStorage.getItem(SOUL_SEEN); localStorage.setItem(SOUL_SEEN, key); } catch (e) { return; }
        if (!seen || seen === key) return;
        var latest = Array.isArray(soul.changelog) && soul.changelog[0] && soul.changelog[0].tag;
        gentleNote('Arron grew wiser ✨' + (latest ? ' — ' + latest : ''));
      })
      .catch(function () {});
  }
  window.addEventListener('load', function () { setTimeout(checkSoul, 2500); });
  if (/\/games\.html$|\/games$/.test(location.pathname)) {
    var grid = document.querySelector('.games-grid');
    if (!grid) return;
    var old = grid.querySelector('[data-game="sanity-solitaire"]');
    if (old && old.querySelector('[data-mark="sanity-solitaire"]')) return;
    if (old) old.remove();
    var card = document.createElement('article');
    card.className = 'game-card';
    card.setAttribute('data-game', 'sanity-solitaire');
    card.innerHTML = '<div class="game-thumb" data-mark="sanity-solitaire"><span class="badge official">OFFICIAL</span></div><div class="game-content"><h3>Sanity Solitaire</h3><p class="game-desc">Three peaks. One rank up or down. The brain card on the back, the night sky on the table.</p><div class="game-stats"><span>Three peaks</span><span>Undo</span><span>Own install</span></div><div class="btn-wrap"><a href="/sanity-solitaire.html" class="btn primary">&#9654; Play Now</a></div></div>';
    grid.insertBefore(card, grid.firstChild);
  }
  var nav = document.querySelector('.ps-nav');
  if (nav && !nav.querySelector('.ps-nav-toggle')) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ps-nav-toggle';
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = 'Menu';
    var inner = nav.querySelector('.ps-nav-inner') || nav;
    inner.appendChild(btn);
    var links = nav.querySelector('.ps-links');
    if (links && !links.querySelector('.ps-sheet-doors')) {
      var doors = document.createElement('div');
      doors.className = 'ps-sheet-doors';
      doors.innerHTML = '<a href="/arron.html">Talk to Arron</a><a href="/about.html#legacy">Our Legacy</a>';
      links.insertBefore(doors, links.firstChild);
    }
    function shut() {
      nav.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = 'Menu';
    }
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Close' : 'Menu';
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') shut(); });
    if (links) links.addEventListener('click', function (e) { if (e.target.closest('a')) shut(); });
  }
  var path = location.pathname;
  var onArron = /arron/.test(path);
  if (onArron) document.body.classList.add('ps-no-dock');
  if (!onArron && !document.querySelector('.ps-dock')) {
    var dock = document.createElement('nav');
    dock.className = 'ps-dock';
    dock.setAttribute('aria-label', 'Phone doors');
    dock.innerHTML = '<a href="/arron.html">Talk</a><a href="/journal-vault.html">Journal</a><a href="/crisis.html">Truth</a><button type="button" class="ps-dock-menu">Menu</button>';
    document.body.appendChild(dock);
    var here = dock.querySelector('a[href="' + path + '"]');
    if (here) here.setAttribute('aria-current', 'page');
    var dockMenu = dock.querySelector('.ps-dock-menu');
    if (dockMenu && nav) dockMenu.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      var top = nav.querySelector('.ps-nav-toggle');
      if (top) { top.setAttribute('aria-expanded', open ? 'true' : 'false'); top.textContent = open ? 'Close' : 'Menu'; }
      dockMenu.textContent = open ? 'Close' : 'Menu';
    });
  }

})();
