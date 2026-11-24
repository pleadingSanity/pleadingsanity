// ==============================================================
// 📈 ps-views.js — privacy-friendly page-view beacon.
// No cookies, no IP/UA/referrer collection, no third-party hosts.
// Respects Do Not Track and stays off the most sensitive pages.
// One beacon per tab session per path; the random id lives in
// localStorage and the server stores only a salted hash of it.
// ==============================================================
(function () {
  "use strict";
  try {
    if (typeof document === "undefined" || !window.fetch && !navigator.sendBeacon) return;
    if (navigator.doNotTrack === "1" || navigator.doNotTrack === "yes") return;

    var path = location.pathname || "/";
    if (/^\/(crisis|safety|login|signup|reset-password|arron)(\/|\.html)?/i.test(path)) return;

    var vid = null;
    try {
      vid = localStorage.getItem("ps.vid");
      if (!vid) {
        vid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : "v-" + Date.now() + "-" + Math.random().toString(36).slice(2);
        localStorage.setItem("ps.vid", vid);
      }
    } catch (e) { vid = null; }

    var sessionKey = "ps-view:" + path;
    try {
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, "1");
    } catch (e) { /* private mode: allow repeat beacon, still safe */ }

    var payload = JSON.stringify({ path: path, v: vid });
    if (navigator.sendBeacon) {
      var blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon("/api/views", blob)) return;
    }
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(function () { /* the page never depends on the counter */ });
  } catch (e) { /* counter must never break a page */ }
})();
