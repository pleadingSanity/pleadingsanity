// ==============================================================
// 💙 ARRON — SERVICE WORKER v2.2-FULL
// Controls only /arron-app.html, separate from the main site's /sw.js.
// Interface, orb, wisdom and the soul file cached for offline.
// Pages & knowledge → network first · images → cache first ·
// /api/ → always live (the app answers gently when offline).
// New versions install silently and clear the old cache.
// Evolution, Not Erasure.
// ==============================================================

const VERSION = '3.7-no-hud';
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
    '/tools.html',
    '/about.html',
    '/games.html',
    '/css/space.css',
    '/assets/theme/sky.jpg',
    '/assets/favicon.svg',
    '/assets/images/brand/crying-brain-logo-512.webp',
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

function withoutHud(response) {
    if (!response || !response.ok) return Promise.resolve(response);
    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html')) return Promise.resolve(response);
    return response.text().then(html => {
        const cleaned = html.replace(/<script\b[^>]*src=["']\/\.netlify\/scripts\/hud[^"']*["'][^>]*>\s*<\/script>/gi, '');
        const headers = new Headers(response.headers);
        headers.delete('content-length');
        return new Response(cleaned, { status: response.status, statusText: response.statusText, headers });
    });
}

self.addEventListener('fetch', event => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;
    // Netlify appends a badge script after </html>. It is not Arron. An empty file
    // means it never builds the inline frame the page lock is right to block.
    if (url.pathname === '/.netlify/scripts/hud') {
        event.respondWith(new Response('', { status: 200, headers: { 'Content-Type': 'application/javascript; charset=utf-8' } }));
        return;
    }
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/.netlify/')) return;

    // Deep links (?view=journal, ?say=…, share target) all open the same cached app
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request, async () =>
            (await caches.match(APP_URL)) || (await caches.match('/offline.html'))
        ).then(withoutHud));
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
