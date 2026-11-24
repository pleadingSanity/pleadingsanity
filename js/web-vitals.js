// First-party Core Web Vitals. LCP, INP, CLS only.
// Posts to /api/vitals. No cookies. No third party. No user id.
(function () {
  if (!("PerformanceObserver" in window)) return;
  var sent = {};
  function send(name, value) {
    var key = name + ":" + Math.round(value);
    if (sent[key]) return;
    sent[key] = 1;
    var body = JSON.stringify({ name: name, value: value, path: location.pathname });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/vitals", new Blob([body], { type: "application/json" }));
      return;
    }
    fetch("/api/vitals", { method: "POST", body: body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(function () {});
  }
  try {
    var lcp = 0;
    new PerformanceObserver(function (list) {
      var entries = list.getEntries();
      var last = entries[entries.length - 1];
      if (last) lcp = last.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden" && lcp) send("LCP", lcp);
    });
  } catch (e) {}
  try {
    var cls = 0;
    new PerformanceObserver(function (list) {
      list.getEntries().forEach(function (entry) {
        if (!entry.hadRecentInput) cls += entry.value;
      });
    }).observe({ type: "layout-shift", buffered: true });
    addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") send("CLS", cls);
    });
  } catch (e) {}
  try {
    new PerformanceObserver(function (list) {
      list.getEntries().forEach(function (entry) {
        if (entry.duration) send("INP", entry.duration);
      });
    }).observe({ type: "event", buffered: true, durationThreshold: 40 });
  } catch (e) {}
})();
