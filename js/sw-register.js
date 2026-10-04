// Kept for pages that still link it. Registration, silent updates and the
// "Arron grew wiser ✨" note all live in /js/site.js now. This file no longer
// reloads the page when a new service worker takes over — on a first visit
// that reload fired for nothing, and mid-sentence it could lose someone's words.
if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("/sw.js").catch(function () {});
}
