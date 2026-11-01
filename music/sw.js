// Music app worker. Scope is /music/ only. It does not replace the house worker.
const CACHE = "ps-music-shell-v1";
const SHELL = ["/music/index.html", "/music/manifest.json", "/music/tracks.json", "/css/support-strip.css", "/js/music-player.js", "/assets/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => Promise.all(SHELL.map((url) => cache.add(url).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith("/music/")) return;
  event.respondWith(fetch(event.request).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match(event.request).then((hit) => hit || caches.match("/music/index.html"))));
});
