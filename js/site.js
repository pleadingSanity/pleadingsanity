(function () {
  'use strict';
  var year = String(new Date().getFullYear());
  document.querySelectorAll('.ps-year').forEach(function (el) { el.textContent = year; });
  var nav = document.querySelector('.ps-nav');
  if (nav) {
    nav.classList.add('ps-js');
    var groups = nav.querySelectorAll('.ps-group');
    var setOpen = function (group, open) {
      group.classList.toggle('open', open);
      var btn = group.querySelector('.ps-group-btn');
      if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    var closeAll = function (except) { groups.forEach(function (g) { if (g !== except) setOpen(g, false); }); };
    groups.forEach(function (group) {
      var btn = group.querySelector('.ps-group-btn');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var open = !group.classList.contains('open');
        closeAll(group); setOpen(group, open);
      });
      group.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && group.classList.contains('open')) { setOpen(group, false); btn.focus(); }
      });
    });
    document.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.ps-group')) closeAll(); });
  }
  var installPrompt = null;
  var installButtons = document.querySelectorAll('[data-pwa-install]');
  function showInstall(show) { installButtons.forEach(function (btn) { btn.hidden = !show; btn.classList.toggle('hidden', !show); }); }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installPrompt = e; showInstall(true); });
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS && !standalone) showInstall(true);
  installButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!installPrompt) { if (isIOS) alert('In Safari, tap Share, then Add to Home Screen.'); return; }
      installPrompt.prompt();
      installPrompt.userChoice.finally(function () { installPrompt = null; showInstall(false); });
    });
  });
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }
  if (/\/games\.html$|\/games$/.test(location.pathname)) {
    var grid = document.querySelector('.games-grid');
    if (!grid) return;
    var old = grid.querySelector('[data-game="sanity-solitaire"]');
    if (old) old.remove();
    var card = document.createElement('article');
    card.className = 'game-card';
    card.setAttribute('data-game', 'sanity-solitaire');
    card.innerHTML = '<div class="game-thumb" aria-hidden="true" style="font-size:2.4rem;line-height:1">A&#9824;<span class="badge new">NEW</span></div><div class="game-content"><h3>Sanity Solitaire</h3><p class="game-desc">A proper deal. Seven columns, four suits, levels that open new tables.</p><div class="game-stats"><span>Klondike</span><span>4 levels</span><span>Free</span></div><p class="game-pb">Play Now opens the deal</p><div class="btn-wrap"><a href="/sanity-solitaire.html" class="btn primary">&#9654; Play Now</a></div></div>';
    grid.insertBefore(card, grid.firstChild);
  }
})();
