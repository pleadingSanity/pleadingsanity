// ==============================================================
// 💙 ARRON — SERVICE WORKER v2.1-ASCENSION
// Controls only /arron-app.html, separate from the main site's /sw.js.
// Interface, orb, wisdom and the soul file cached for offline.
// Pages & knowledge → network first · images → cache first ·
// /api/ → always live (the app answers gently when offline).
// New versions install silently and clear the old cache.
// Evolution, Not Erasure.
// ==============================================================

const VERSION = '2.2-new-brain';
const PREFIX = 'arron-';
const CACHE = PREFIX + VERSION;
const APP_URL = '/arron-app.html';

const PRECACHE_URLS = [
    APP_URL,
    '/arron-knowledge.json',
    '/manifest-arron.json',
    '/js/arron-core.js',
    '/css/styles.css',
    '/css/animations.css',
    '/css/accessibility.css',
    '/css/mobile-responsive.css',
    '/css/arron-styles.css',
    '/offline.html',
    '/crisis.html',
    '/assets/favicon.svg',
    '/assets/favicon.ico',
    '/assets/apple-touch-icon.png',
    '/assets/icons/icon-96x96.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png'
];

// One miss never breaks install
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE)
            .then(cache => Promise.all(PRECACHE_URLS.map(url => cache.add(url).catch(() => {}))))
            .then(() => self.skipWaiting())
    );
});

// Only ever clears Arron's own old caches, never the main site's
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(names => Promise.all(names.filter(n => n.startsWith(PREFIX) && n !== CACHE).map(n => caches.delete(n))))
            .then(() => self.clients.claim())
    );
});

function networkFirst(request, fallback) {
    return fetch(request)
        .then(response => {
            if (response.ok) {
                const copy = response.clone();
                caches.open(CACHE).then(cache => cache.put(request, copy));
            }
            return response;
        })
        .catch(async () => (await caches.match(request, { ignoreSearch: true })) || (fallback && await fallback()) || Response.error());
}

self.addEventListener('fetch', event => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/.netlify/')) return;

    // Deep links (?view=journal, ?say=…, share target) all open the same cached app
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request, async () =>
            (await caches.match(APP_URL)) || (await caches.match('/offline.html'))
        ));
        return;
    }

    if (/\.(?:js|css|json)$/.test(url.pathname)) {
        event.respondWith(networkFirst(request));
        return;
    }

    event.respondWith(
        caches.match(request).then(cached => {
            const network = fetch(request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE).then(cache => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() => cached || Response.error());
            return cached || network;
        })
    );
});

self.addEventListener('message', event => {
    if (event.data?.type === 'GET_VERSION' && event.ports?.[0]) {
        event.ports[0].postMessage({ version: VERSION, cacheName: CACHE });
    }
});
