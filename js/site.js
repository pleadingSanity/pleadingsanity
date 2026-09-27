// ==============================================================
// PLEADING SANITY — SHARED SITE SCRIPT
// Footer year · Service worker (offline support)
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

  // PWA — offline support
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
})();
