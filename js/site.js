// ==============================================================
// PLEADING SANITY — SHARED SITE SCRIPT
// Footer year · Install button · Service worker (offline support)
// ==============================================================

(function () {
  'use strict';

  // Current year in every footer
  var year = String(new Date().getFullYear());
  document.querySelectorAll('.ps-year').forEach(function (el) {
    el.textContent = year;
  });

  // Keep the active nav link visible on small screens
  var current = document.querySelector('.ps-links a[aria-current="page"]');
  if (current) {
    var row = current.parentElement;
    row.scrollLeft = current.offsetLeft - (row.clientWidth - current.offsetWidth) / 2;
  }

  // PWA — install button. Any element with [data-pwa-install] stays
  // hidden until the browser says the site can be installed.
  var installPrompt = null;
  var installButtons = document.querySelectorAll('[data-pwa-install]');
  function showInstall(show) {
    installButtons.forEach(function (btn) {
      btn.hidden = !show;
      btn.classList.toggle('hidden', !show);
    });
  }
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    installPrompt = e;
    showInstall(true);
  });
  // iPhone and iPad never fire beforeinstallprompt — show how to add it by hand.
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS && !standalone) showInstall(true);
  function iosHint() {
    var old = document.getElementById('ps-ios-hint');
    if (old) { old.remove(); return; }
    var tip = document.createElement('div');
    tip.id = 'ps-ios-hint';
    tip.className = 'ps-toast';
    tip.setAttribute('role', 'status');
    tip.innerHTML = '📲 In Safari, tap <strong>Share</strong> <span aria-hidden="true">⎋</span> then <strong>Add to Home Screen</strong>.';
    document.body.appendChild(tip);
    setTimeout(function () { tip.remove(); }, 8000);
  }

  installButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!installPrompt) { if (isIOS) iosHint(); return; }
      installPrompt.prompt();
      installPrompt.userChoice.finally(function () {
        installPrompt = null;
        showInstall(false);
      });
    });
  });
  window.addEventListener('appinstalled', function () {
    installPrompt = null;
    showInstall(false);
  });

  // PWA — offline support
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
})();
