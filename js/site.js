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
  installButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!installPrompt) return;
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
