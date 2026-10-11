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

  // Day / night. The house starts dark. The choice stays on this device.
  var themeBtn = document.createElement("button");
  themeBtn.type = "button";
  themeBtn.className = "ps-theme";
  function paintTheme(theme) {
    var light = theme === "light";
    document.documentElement.dataset.theme = light ? "light" : "dark";
    try { localStorage.setItem("ps-theme", light ? "light" : "dark"); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", light ? "#f4f8fb" : "#000103");
    themeBtn.textContent = light ? "Dark" : "Light";
    themeBtn.setAttribute("aria-pressed", light ? "false" : "true");
    themeBtn.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
  }
  var saved = "dark";
  try { saved = localStorage.getItem("ps-theme") === "light" ? "light" : "dark"; } catch (e) {}
  paintTheme(saved);
  themeBtn.addEventListener("click", function () {
    paintTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
  });
  var navInner = document.querySelector(".ps-nav-inner");
  if (navInner) navInner.appendChild(themeBtn);

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
  function ensureSolitaireCard() {
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
  if (/\/games\.html$|\/games$/.test(location.pathname)) ensureSolitaireCard();
  var nav = document.querySelector('.ps-nav');
  // The LIVE door is deliberately visible across the house.
  if (nav) {
    var navLinks = nav.querySelector('.ps-links');
    if (navLinks && !navLinks.querySelector('a[href="/live.html"]')) {
      var liveLink = document.createElement('a');
      liveLink.href = '/live.html';
      liveLink.className = 'ps-live-link';
      liveLink.innerHTML = '<span aria-hidden="true">●</span> LIVE';
      liveLink.setAttribute('aria-label', 'Live creator stage');
      navLinks.insertBefore(liveLink, navLinks.firstChild);
    }
  }
  if (nav && !nav.querySelector('.ps-nav-toggle')) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ps-nav-toggle';
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = 'Menu';
    var inner = nav.querySelector('.ps-nav-inner') || nav;
    inner.appendChild(btn);
    var links = nav.querySelector('.ps-links');
    if (links) {
      if (!links.id) links.id = 'ps-main-links';
      btn.setAttribute('aria-controls', links.id);
    }
    if (links && !links.querySelector('.ps-sheet-doors')) {
      var doors = document.createElement('div');
      doors.className = 'ps-sheet-doors';
      doors.innerHTML = '<a href="/arron.html">Talk to Arron</a><a href="/about.html#legacy">Our Legacy</a>';
      links.insertBefore(doors, links.firstChild);
    }
    function setMenuOpen(open) {
      nav.classList.toggle('is-open', open);
      nav.querySelectorAll('.ps-group.open').forEach(function (group) {
        if (open) return;
        group.classList.remove('open');
        var groupButton = group.querySelector('.ps-group-btn');
        if (groupButton) groupButton.setAttribute('aria-expanded', 'false');
      });
      document.querySelectorAll('.ps-nav-toggle, .ps-dock-menu').forEach(function (control) {
        control.setAttribute('aria-expanded', open ? 'true' : 'false');
        control.textContent = open ? 'Close' : 'Menu';
      });
    }
    function shut() { setMenuOpen(false); }
    nav.psSetMenuOpen = setMenuOpen;
    btn.addEventListener('click', function () {
      setMenuOpen(!nav.classList.contains('is-open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var wasOpen = nav.classList.contains('is-open') || !!nav.querySelector('.ps-group.open');
        shut();
        if (wasOpen) btn.focus();
      }
    });
    if (links) links.addEventListener('click', function (e) {
      var gbtn = e.target.closest('.ps-group-btn');
      if (gbtn) {
        e.preventDefault();
        var group = gbtn.closest('.ps-group');
        var willOpen = !group.classList.contains('open');
        links.querySelectorAll('.ps-group.open').forEach(function (g) {
          g.classList.remove('open');
          var b = g.querySelector('.ps-group-btn');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
          group.classList.add('open');
          gbtn.setAttribute('aria-expanded', 'true');
        }
        return;
      }
      if (e.target.closest('a')) shut();
    });
  }
  var path = location.pathname;
  var onArron = /arron/.test(path);
  if (onArron) document.body.classList.add('ps-no-dock');
  if (!onArron && !document.querySelector('.ps-dock')) {
    var dock = document.createElement('nav');
    dock.className = 'ps-dock';
    dock.setAttribute('aria-label', 'Phone doors');
    dock.innerHTML = '<a href="/live.html" class="ps-dock-live">● LIVE</a><a href="/arron.html">Talk</a><a href="/journal-vault.html">Journal</a><a href="/crisis.html">Support</a><button type="button" class="ps-dock-menu" aria-expanded="false">Menu</button>';
    document.body.appendChild(dock);
    var here = dock.querySelector('a[href="' + path + '"]');
    if (here) here.setAttribute('aria-current', 'page');
    var dockMenu = dock.querySelector('.ps-dock-menu');
    if (dockMenu && nav) {
      var menuLinks = nav.querySelector('.ps-links');
      if (menuLinks && menuLinks.id) dockMenu.setAttribute('aria-controls', menuLinks.id);
      dockMenu.addEventListener('click', function () {
        if (nav.psSetMenuOpen) nav.psSetMenuOpen(!nav.classList.contains('is-open'));
      });
    }
  }

})();
