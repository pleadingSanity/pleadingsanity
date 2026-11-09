/* Preference banner. No analytics, no ads, and no network calls. */
(function () {
  'use strict';
  var KEY = 'psConsent';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  var saved = get();
  if (saved === 'yes' || saved === 'no') return;

  var bar = document.createElement('div');
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-label', 'Site preference');
  bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:60;background:#0b0f19;color:#eef6ff;border-top:1px solid rgba(0,255,240,.3);padding:12px 16px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;font:14px system-ui,sans-serif';
  bar.innerHTML = '<span>This sanctuary does not load analytics. Your choice is saved on this device only.</span>' +
    '<span style="display:flex;gap:8px"><button type="button" data-yes style="background:#00fff0;color:#0b0f19;border:0;border-radius:999px;padding:8px 16px;font-weight:700;cursor:pointer">Accept</button>' +
    '<button type="button" data-no style="background:transparent;color:#eef6ff;border:1px solid #38bdf8;border-radius:999px;padding:8px 16px;cursor:pointer">Decline</button></span>';
  document.body.appendChild(bar);
  bar.querySelector('[data-yes]').addEventListener('click', function () { set('yes'); bar.remove(); });
  bar.querySelector('[data-no]').addEventListener('click', function () { set('no'); bar.remove(); });
})();
