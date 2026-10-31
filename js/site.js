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

  // Install controls are optional. A prompt is single-use and browser-owned.
  var installPrompt = null;
  var installBusy = false;
  var installButtons = document.querySelectorAll('[data-pwa-install]');
  var installDisplay = window.matchMedia('(display-mode: standalone)');
  var installed = navigator.standalone === true || installDisplay.matches;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function installHelp(btn, message, focus) {
    var note = btn.parentElement.querySelector('[data-install-status]');
    if (!note) {
      note = document.createElement('p');
      note.dataset.installStatus = '';
      note.setAttribute('role', 'status');
      note.setAttribute('tabindex', '-1');
      note.className = 'note';
      btn.insertAdjacentElement('afterend', note);
    }
    note.textContent = message;
    if (focus) note.focus();
  }
  function showInstall() {
    installButtons.forEach(function (btn) {
      var show = !installed && (isIOS || !!installPrompt);
      btn.hidden = !show;
      btn.disabled = installBusy;
      btn.classList.toggle('hidden', !show);
    });
  }
  function installedNow() {
    installed = true;
    installPrompt = null;
    installBusy = false;
    installButtons.forEach(function (btn) {
      if (document.activeElement === btn || btn.parentElement.querySelector('[data-install-status]')) {
        installHelp(btn, 'Installed. Open the sanctuary from its app icon.', document.activeElement === btn);
      }
    });
    showInstall();
  }
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    if (!installed && !installBusy) installPrompt = e;
    showInstall();
  });
  window.addEventListener('appinstalled', installedNow);
  if (installDisplay.addEventListener) installDisplay.addEventListener('change', function (e) {
    if (e.matches) installedNow();
  });
  showInstall();
  installButtons.forEach(function (btn) {
    btn.addEventListener('click', async function () {
      if (installed || installBusy) return;
      if (!installPrompt) {
        installHelp(btn, isIOS
          ? 'In Safari, tap Share, then Add to Home Screen. If you opened this inside another app, open it in Safari first.'
          : 'Open your browser menu and choose Install app or Add to Home Screen if available.');
        return;
      }
      var prompt = installPrompt;
      installPrompt = null;
      installBusy = true;
      installButtons.forEach(function (button) { button.disabled = true; });
      try {
        // Call immediately from the click: browsers require user activation.
        var result = await prompt.prompt();
        var choice = result && result.outcome ? result : await prompt.userChoice;
        if (!installed) installHelp(btn, choice && choice.outcome === 'accepted'
          ? 'Install accepted. Your browser will finish adding the app.'
          : 'No problem. Keep using the sanctuary in your browser.', document.activeElement === btn);
      } catch (e) {
        if (!installed) installHelp(btn, 'The install prompt could not open. Use the browser menu, or follow the instructions on the App Hub.', document.activeElement === btn);
      } finally {
        installBusy = false;
        showInstall();
      }
    });
  });
  // ─── INSTALL ONCE, GROW FOREVER ───
  // The service worker updates itself silently (sw.js skips waiting and
  // clears old caches). A long-open app checks for a new version when it
  // comes back to the screen, at most once an hour. Nothing is reloaded
  // under anyone's fingers: fresh pages simply arrive on the next tap.
  if ('serviceWorker' in navigator && location.protocol === 'https:' && location.pathname.indexOf('/music/') !== 0) {
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

  // "Arron grew wiser " — when the soul file (/arron-knowledge.json) changes,
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
        gentleNote('Arron grew wiser ' + (latest ? ' — ' + latest : ''));
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
  if (!document.querySelector('.ps-nav') && document.body && window.self === window.top) {
    var house = document.createElement('nav');
    house.className = 'ps-nav';
    house.setAttribute('aria-label', 'Main navigation');
    house.innerHTML = '<div class="ps-nav-inner"><a href="/" class="ps-brand"><img src="/assets/images/brand/crying-brain-logo-clear-256.webp" alt="" width="36" height="36"><span>Pleading Sanity</span></a><div class="ps-links"></div><div class="ps-account"><a class="ps-signin" href="/login.html">Sign in</a></div></div>';
    document.body.insertBefore(house, document.body.firstChild);
    document.querySelectorAll('.eco-nav').forEach(function (el) { el.hidden = true; });
    if (!document.querySelector('link[href="/css/site.css"]')) {
      var sheet = document.createElement('link');
      sheet.rel = 'stylesheet';
      sheet.href = '/css/site.css';
      document.head.appendChild(sheet);
    }
  }
  var nav = document.querySelector('.ps-nav');
  function ensureNavLink(href, label) {
    if (!nav) return;
    var links = nav.querySelector('.ps-links');
    if (!links) return;
    for (var i = 0; i < links.children.length; i++) {
      var child = links.children[i];
      if (child.tagName === 'A' && child.getAttribute('href') === href) {
        child.classList.add('ps-main');
        return;
      }
    }
    var anchor = document.createElement('a');
    anchor.href = href;
    anchor.className = 'ps-main';
    anchor.textContent = label;
    links.appendChild(anchor);
  }
  if (nav) {
    ensureNavLink('/get-the-app.html', 'App Hub');
    ensureNavLink('/insane-solar.html', 'Solar');
    ensureNavLink('/shop.html', 'Shop');
    ensureNavLink('/about.html', 'About');
    var crisisLink = nav.querySelector('a.ps-crisis, a[href="/crisis.html"]');
    var navInnerBar = nav.querySelector('.ps-nav-inner') || nav;
    if (!crisisLink) {
      crisisLink = document.createElement('a');
      crisisLink.href = '/crisis.html';
      navInnerBar.appendChild(crisisLink);
    } else if (crisisLink.parentElement !== navInnerBar) {
      navInnerBar.appendChild(crisisLink);
    }
    crisisLink.classList.add('ps-crisis');
    crisisLink.textContent = 'Crisis help';
    crisisLink.setAttribute('aria-label', 'Crisis help');
    nav.querySelectorAll('a, button').forEach(function (el) {
      if (el.children.length) return;
      var clean = el.textContent.replace(/\p{Extended_Pictographic}/gu, '').replace(/\s+/g, ' ').trim();
      if (clean) el.textContent = clean;
    });
    if (!nav.querySelector('.ps-account')) {
      var accountSlot = document.createElement('div');
      accountSlot.className = 'ps-account';
      var signIn = document.createElement('a');
      signIn.className = 'ps-signin';
      signIn.href = '/login.html';
      signIn.textContent = 'Sign in';
      accountSlot.appendChild(signIn);
      navInnerBar.appendChild(accountSlot);
    }
  }
  // The LIVE door is deliberately visible across the house.
  if (nav) {
    var navLinks = nav.querySelector('.ps-links');
    var existingLive = navLinks && navLinks.querySelector('a[href="/live.html"], a[href="/live"], a[href="/live/"]');
    if (existingLive) {
      existingLive.classList.add('ps-live-link');
      existingLive.setAttribute('aria-label', 'Live creator stage');
    }
    var kidsPage = /\/kids(?:-series)?\.html$/.test(location.pathname);
    if (!kidsPage && navLinks && !navLinks.querySelector('a[href="/get-the-app.html"]')) {
      var hub = document.createElement('a');
      hub.href = '/get-the-app.html';
      hub.textContent = 'App Hub';
      hub.setAttribute('aria-label', 'App Hub and install');
      navLinks.appendChild(hub);
    }
    if (!kidsPage && navLinks && !navLinks.querySelector('a[href="/sanity-songs.html"]') && window.self === window.top) {
      var songs = document.createElement('a');
      songs.href = '/sanity-songs.html?page=' + encodeURIComponent(location.pathname + location.search);
      songs.textContent = "Sanity's Songs";
      songs.setAttribute('aria-label', "Sanity's Songs");
      navLinks.appendChild(songs);
    }
    if (navLinks && !existingLive) {
      var liveLink = document.createElement('a');
      liveLink.href = '/live.html';
      liveLink.className = 'ps-live-link';
      liveLink.innerHTML = '<span aria-hidden="true">●</span> LIVE';
      liveLink.setAttribute('aria-label', 'Live creator stage');
      navLinks.insertBefore(liveLink, navLinks.firstChild);
    }
    if (navLinks && !navLinks.querySelector('.ps-more')) {
      var more = document.createElement('div');
      more.className = 'ps-group ps-more';
      var moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'ps-group-btn';
      moreBtn.setAttribute('aria-expanded', 'false');
      moreBtn.setAttribute('aria-controls', 'ps-g-more');
      moreBtn.textContent = 'More';
      var moreMenu = document.createElement('div');
      moreMenu.className = 'ps-group-menu';
      moreMenu.id = 'ps-g-more';
      function moreLink(href, label) {
        var item = document.createElement('a');
        item.href = href;
        item.textContent = label;
        moreMenu.appendChild(item);
      }
      moreLink('/get-the-app.html', 'App Hub');
      if (!kidsPage) moreLink('/sanity-songs.html?page=' + encodeURIComponent(location.pathname + location.search), "Sanity's Songs");
      moreLink('/about.html', 'About');
      more.appendChild(moreBtn);
      more.appendChild(moreMenu);
      navLinks.appendChild(more);
      Array.prototype.forEach.call(navLinks.children, function (child) {
        if (!child || child.tagName !== 'A') return;
        var href = child.getAttribute('href') || '';
        if (href === '/get-the-app.html' || href === '/about.html' || href.indexOf('/sanity-songs.html') === 0) {
          child.classList.add('ps-more-item');
        }
      });
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
    nav.classList.add('ps-nav-ready');
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
    var menuOpener = btn;
    function setMenuOpen(open, opener) {
      if (opener) menuOpener = opener;
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
    function toggleGroup(groupButton, forceOpen) {
      var group = groupButton.closest('.ps-group');
      var open = forceOpen === true || !group.classList.contains('open');
      links.querySelectorAll('.ps-group.open').forEach(function (item) {
        item.classList.remove('open');
        var button = item.querySelector('.ps-group-btn');
        if (button) button.setAttribute('aria-expanded', 'false');
      });
      if (open) { group.classList.add('open'); groupButton.setAttribute('aria-expanded', 'true'); }
    }
    nav.psSetMenuOpen = setMenuOpen;
    btn.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      setMenuOpen(open, btn);
      if (open && links) { var first = links.querySelector('a'); if (first) first.focus(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && nav.classList.contains('is-open') && links) {
        var items = links.querySelectorAll('a, button');
        if (items.length) {
          var list = Array.prototype.slice.call(items);
          var firstItem = list[0];
          var lastItem = list[list.length - 1];
          if (e.shiftKey && document.activeElement === firstItem) { e.preventDefault(); lastItem.focus(); }
          else if (!e.shiftKey && document.activeElement === lastItem) { e.preventDefault(); firstItem.focus(); }
        }
        return;
      }
      if (e.key === 'Escape') {
        var wasOpen = nav.classList.contains('is-open') || !!nav.querySelector('.ps-group.open');
        var openGroup = nav.querySelector('.ps-group.open');
        var restore = nav.classList.contains('is-open') ? menuOpener : openGroup && openGroup.querySelector('.ps-group-btn');
        shut();
        if (wasOpen && restore) { e.preventDefault(); restore.focus(); }
      }
    });
    if (links) links.addEventListener('click', function (e) {
      var gbtn = e.target.closest('.ps-group-btn');
      if (gbtn) {
        e.preventDefault();
        toggleGroup(gbtn);
        return;
      }
      if (e.target.closest('a')) shut();
    });
    if (links) links.addEventListener('keydown', function (e) {
      var groupButton = e.target.closest('.ps-group-btn');
      if (groupButton && e.key === 'ArrowDown') {
        e.preventDefault(); toggleGroup(groupButton, true);
        var first = groupButton.closest('.ps-group').querySelector('.ps-group-menu a');
        if (first) first.focus();
      }
    });
    document.addEventListener('pointerdown', function (e) {
      if (!nav.contains(e.target) && !e.target.closest('.ps-dock-menu')) shut();
    });
    document.addEventListener('focusin', function (e) {
      if (!nav.contains(e.target) && !e.target.closest('.ps-dock-menu')) shut();
    });
    // Disable focus-within's no-JS fallback only after disclosure handlers exist.
    nav.classList.add('ps-js');
  }
  var path = location.pathname;
  var onArron = /arron/.test(path);
  var calmPage = /\/(?:crisis|safety)(?:\.html)?$/.test(path);
  if (onArron || calmPage) document.body.classList.add('ps-no-dock');
  if (!onArron && !calmPage && !document.querySelector('.ps-dock')) {
    var dock = document.createElement('nav');
    dock.className = 'ps-dock';
    dock.setAttribute('aria-label', 'Phone doors');
    dock.innerHTML = '<a href="/live.html" class="ps-dock-live">● LIVE</a><a href="/arron.html">Talk</a><a href="/feed.html">Feed</a><a href="/journal-vault.html">Journal</a><a href="/support.html">Support</a>' + (nav ? '<button type="button" class="ps-dock-menu" aria-expanded="false">Menu</button>' : '<a href="/tools.html">Tools</a>');
    document.body.appendChild(dock);
    var here = dock.querySelector('a[href="' + path + '"]');
    if (here) here.setAttribute('aria-current', 'page');
    var dockMenu = dock.querySelector('.ps-dock-menu');
    if (dockMenu && nav) {
      var menuLinks = nav.querySelector('.ps-links');
      if (menuLinks && menuLinks.id) dockMenu.setAttribute('aria-controls', menuLinks.id);
      dockMenu.addEventListener('click', function () {
        if (nav.psSetMenuOpen) {
          var open = !nav.classList.contains('is-open');
          nav.psSetMenuOpen(open, dockMenu);
          if (open && menuLinks) { var first = menuLinks.querySelector('a'); if (first) first.focus(); }
        }
      });
    }
  }

  // Brand lock: visitors should not see emoji. Leave form fields and code alone.
  try {
    var emoji = /\p{Extended_Pictographic}/gu;
    var skip = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, NOSCRIPT: 1 };
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var textNode;
    while ((textNode = walker.nextNode())) {
      var parent = textNode.parentElement;
      if (!parent || skip[parent.tagName]) continue;
      if (!emoji.test(textNode.nodeValue || "")) { emoji.lastIndex = 0; continue; }
      emoji.lastIndex = 0;
      var cleaned = textNode.nodeValue.replace(emoji, "").replace(/[ \t]{2,}/g, " ");
      if (cleaned !== textNode.nodeValue) textNode.nodeValue = cleaned;
    }
  } catch (err) {}

})();
