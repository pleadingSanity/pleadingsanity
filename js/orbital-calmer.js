/* Orbital Calmer View — Phase 1A
 * Persists a low-glow, static alternative for people overwhelmed by motion.
 * No network calls, no analytics, no personal data. Key: localStorage.ps-calm.
 */
(function () {
  'use strict';
  var KEY = 'ps-calm';
  var root = document.documentElement;

  function stored() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }

  function paint(on) {
    root.classList.toggle('calm-view', on);
    var btn = document.getElementById('orbitalCalmToggle');
    if (btn) {
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = 'Calmer view: ' + (on ? 'On' : 'Off');
    }
  }

  var prefersReduced = false;
  try {
    prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { prefersReduced = false; }

  paint(stored() || (prefersReduced && !localStorage.getItem(KEY)));

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('orbitalCalmToggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = !stored();
      try { localStorage.setItem(KEY, next ? '1' : '0'); } catch (e) {}
      paint(next);
    });
  });
})();
