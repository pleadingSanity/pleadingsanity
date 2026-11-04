/* Consent banner — GA4 only after Accept. No ads. No personal data. */
(function () {
  'use strict';
  var KEY = 'psConsent';
  var ID = 'G-G7SLWNCTWB';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function loadGA() {
    if (window.__psGA) return;
    window.__psGA = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', ID, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
  }
  var saved = get();
  if (saved === 'yes') { loadGA(); return; }
  if (saved === 'no') return;

  var bar = document.createElement('div');
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-label', 'Cookie choice');
  bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:60;background:#0b0f19;color:#eef6ff;border-top:1px solid rgba(0,255,240,.3);padding:12px 16px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;font:14px system-ui,sans-serif';
  bar.innerHTML = '<span>We only use anonymised stats to improve the sanctuary. Nothing personal — ever.</span>' +
    '<span style="display:flex;gap:8px"><button type="button" data-yes style="background:#00fff0;color:#0b0f19;border:0;border-radius:999px;padding:8px 16px;font-weight:700;cursor:pointer">Accept</button>' +
    '<button type="button" data-no style="background:transparent;color:#eef6ff;border:1px solid #38bdf8;border-radius:999px;padding:8px 16px;cursor:pointer">Decline</button></span>';
  document.body.appendChild(bar);
  bar.querySelector('[data-yes]').addEventListener('click', function () { set('yes'); bar.remove(); loadGA(); });
  bar.querySelector('[data-no]').addEventListener('click', function () { set('no'); bar.remove(); });
})();
