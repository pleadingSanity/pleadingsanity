// Pleading Sanity — shared site script. Footer year, nav, install, service worker, Solitaire card.
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
        closeAll(group);
        setOpen(group, open);
        if (open) {
          var first = group.querySelector('.ps-group-menu a');
          var keyboard = false;
          try { keyboard = btn.matches(':focus-visible'); } catch (err) {}
          if (first && keyboard) first.focus();
        }
      });
      group.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && group.classList.contains('open')) { setOpen(group, false); btn.focus(); }
      });
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('.ps-group')) closeAll();
    });
  }
  var installPrompt = null;
  var installButtons = document.querySelectorAll('[data-pwa-install]');
  function showInstall(show) { installButtons.forEach(function (btn) { btn.hidden = !show; btn.classList.toggle('hidden', !show); }); }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installPrompt = e; showInstall(true); });
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS && !standalone) showInstall(true);
  installButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!installPrompt) {
        if (isIOS) alert('In Safari, tap Share, then Add to Home Screen.');
        return;
      }
      installPrompt.prompt();
      installPrompt.userChoice.finally(function () { installPrompt = null; showInstall(false); });
    });
  });
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }
  if (/\/games\.html$|\/games$/.test(location.pathname)) {
    var grid = document.querySelector('.games-grid');
    if (grid && !grid.querySelector('[data-game="sanity-solitaire"]')) {
      var card = document.createElement('article');
      card.className = 'game-card';
      card.setAttribute('data-game', 'sanity-solitaire');
      card.innerHTML = '<div class="game-thumb">\uD83C\uDCA1 <span class="badge new">NEW</span></div><div class="game-content"><h3>Sanity Solitaire</h3><p class="game-desc">One calm deal. Levels unlock tables and card backs. Free.</p><div class="btn-wrap"><a href="/sanity-solitaire.html" class="btn primary">Play Now</a></div></div>';
      grid.insertBefore(card, grid.firstChild);
    }
  }
})();
