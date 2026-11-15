/* =====================================================
   PLEADING SANITY — REVEAL ON SCROLL
   Opt-in: add class "reveal" to any element.
   - Initial hidden state is applied ONLY when JS is active
     (we add .reveal-js to <html> first), so no-JS users see
     all content normally — nothing gets stuck invisible.
   - IntersectionObserver fades + slides elements in once.
   - Respects prefers-reduced-motion: disables entirely.
===================================================== */
(function () {
  'use strict';

  // Respect reduced motion: never hide anything.
  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}
  if (reduceMotion) return;

  // No IntersectionObserver: show everything, bail.
  if (!('IntersectionObserver' in window)) return;

  // Gate the hidden state behind a class on <html> — if this script
  // fails to run, content stays visible.
  document.documentElement.classList.add('reveal-js');

  function init() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
