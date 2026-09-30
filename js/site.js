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

  // Nav groups — Heal · Play · Community. One open at a time;
  // Escape, a tap outside or picking a link closes it.
  var nav = document.querySelector('.ps-nav');
  if (nav) {
    nav.classList.add('ps-js');
    var groups = nav.querySelectorAll('.ps-group');
    var setOpen = function (group, open) {
      group.classList.toggle('open', open);
      group.querySelector('.ps-group-btn').setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    var closeAll = function (except) {
      groups.forEach(function (g) { if (g !== except) setOpen(g, false); });
    };
    groups.forEach(function (group) {
      var btn = group.querySelector('.ps-group-btn');
      btn.addEventListener('click', function () {
        var open = !group.classList.contains('open');
        closeAll(group);
        setOpen(group, open);
        if (open) {
          var first = group.querySelector('.ps-group-menu a');
          var keyboard = false;
          try { keyboard = btn.matches(':focus-visible'); } catch (err) { /* older browsers */ }
          if (first && keyboard) first.focus();
        }
      });
      group.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && group.classList.contains('open')) {
          setOpen(group, false);
          btn.focus();
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          var links = Array.prototype.slice.call(group.querySelectorAll('.ps-group-menu a'));
          if (!group.classList.contains('open')) { closeAll(group); setOpen(group, true); }
          var i = links.indexOf(document.activeElement);
          var next = e.key === 'ArrowDown' ? (i + 1) % links.length : (i - 1 + links.length) % links.length;
          if (links[next]) { e.preventDefault(); links[next].focus(); }
        }
      });
      group.addEventListener('focusout', function (e) {
        if (!group.contains(e.relatedTarget) && e.relatedTarget) setOpen(group, false);
      });
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('.ps-group')) closeAll();
    });
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
