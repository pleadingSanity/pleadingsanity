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
    card.innerHTML = '<div class="game-thumb" aria-hidden="true" style="font-size:2.4rem;line-height:1">A&#9824;<span class="badge new">NEW</span></div><div class="game-content"><h3>Sanity Solitaire</h3><p class="game-desc">Three peaks. Clear them. Levels open new tables.</p><div class="game-stats"><span>Peaks</span><span>4 levels</span><span>Free</span></div><p class="game-pb">Play Now opens the deal</p><div class="btn-wrap"><a href="/sanity-solitaire.html" class="btn primary">&#9654; Play Now</a></div></div>';
    grid.insertBefore(card, grid.firstChild);
  }
})();
