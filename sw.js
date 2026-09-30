// ==============================================================
// 🌌 PLEADING SANITY — PWA SERVICE WORKER v4.0
// Offline crisis support • All pages & games cached • Smart updates
// Evolution Not Erasure • One Source • One Consciousness • One Family
// ==============================================================

const VERSION = '4.5.0';
const STATIC_CACHE = 'pleading-sanity-static-v12';
const DYNAMIC_CACHE = 'pleading-sanity-dynamic-v12';
const OFFLINE_URL = '/offline.html';

// Member-only pages hold personal data: always from the network, never cached.
const PRIVATE_PAGES = [
    '/profile.html',
    '/post.html',
    '/community.html',
    '/settings.html',
    '/onboarding.html',
    '/admin.html'
];

// ========================================
// 📦 PRECACHE — every page, style & script the site needs offline
// ========================================
const PRECACHE_URLS = [
    '/',
    '/about.html',
    '/ai-ecosystem.html',
    '/ai-stories.html',
    '/ai-studio.html',
    '/arron.html',
    '/arron-app.html',
    '/community-dashboard.html',
    '/cosmic-focus.html',
    '/crisis.html',
    '/feed.html',
    '/frequencies.html',
    '/games.html',
    '/index.html',
    '/journal-vault-viewer.html',
    '/journal-vault.html',
    '/kids.html',
    '/login.html',
    '/meditation.html',
    '/memory-ocean.html',
    '/movement.html',
    '/number-nebula.html',
    '/offline.html',
    '/pattern-galaxy.html',
    '/quote-wall.html',
    '/reset-password.html',
    '/rhythm-resonance.html',
    '/sanityhub.html',
    '/shop.html',
    '/signup.html',
    '/stardust-dash.html',
    '/videos.html',
    '/manifest.json',
    '/manifest-arron.json',
    '/css/styles.css',
    '/css/animations.css',
    '/css/accessibility.css',
    '/css/mobile-responsive.css',
    '/css/site.css',
    '/css/arron.css',
    '/css/arron-styles.css',
    '/css/social.css',
    '/css/ai-studio.css',
    '/css/cosmic-scroll.css',
    '/css/ai-family.css',
    '/js/site.js',
    '/js/arron-companion.js',
    '/js/arron-core.js',
    '/js/auth.js',
    '/js/social.js',
    '/js/ai-studio.js',
    '/js/profile-form.js',
    '/js/vendor/netlify-identity.js',
    '/js/games.js',
    '/js/stardust-dash.js',
    '/js/mindmode.js',
    '/js/scrollFeed.js',
    '/js/video-feed.js',
    '/js/cosmic-scroll.js',
    '/js/ai-stories.js',
    '/content/content_feed.json',
    '/arron-knowledge.json',
    '/assets/logo.svg',
    '/assets/favicon.svg',
    '/assets/favicon.ico',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/assets/apple-touch-icon.png'
];

// ========================================
// 🚀 INSTALL — cache each file individually so one miss never breaks install
// ========================================
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => Promise.all(
                PRECACHE_URLS.map(url => cache.add(url).catch(() => console.warn('SW: skipped', url)))
            ))
            .then(() => self.skipWaiting())
    );
});

// ========================================
// ♻️ ACTIVATE — clear old caches (only our own; Arron's sw-arron.js keeps its cache)
// ========================================
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(names => Promise.all(
                names.filter(n => n.startsWith('pleading-sanity-') && n !== STATIC_CACHE && n !== DYNAMIC_CACHE).map(n => caches.delete(n))
            ))
            .then(() => self.clients.claim())
    );
});

// ========================================
// 🌐 FETCH
// Pages → network first, cached copy or offline page when offline
// Member pages → network only, offline page when offline
// Scripts, styles & JSON → network first, cached copy when offline
// Images & audio → cache first, refreshed in the background
// APIs & third parties → straight to network
// ========================================
self.addEventListener('fetch', event => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/.netlify/')) return;

    if (request.mode === 'navigate' && PRIVATE_PAGES.includes(url.pathname)) {
        event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(async () =>
                    (await caches.match(request, { ignoreSearch: true })) ||
                    (await caches.match(OFFLINE_URL))
                )
        );
        return;
    }

    // Code and data → network first so a fresh page never runs stale scripts
    if (/\.(?:js|css|json)$/.test(url.pathname)) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(async () => (await caches.match(request)) || Response.error())
        );
        return;
    }

    // Images, icons, audio → cache first, refreshed in the background
    event.respondWith(
        caches.match(request).then(cached => {
            const network = fetch(request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() => cached || Response.error());
            return cached || network;
        })
    );
});

// ========================================
// 🔄 BACKGROUND SYNC — Journal Backup
// ========================================
self.addEventListener('sync', event => {
    if (event.tag === 'journal-backup') {
        event.waitUntil(backupJournalVault());
    }
});

async function backupJournalVault() {
    try {
        const allClients = await self.clients.matchAll();
        allClients.forEach(client => {
            client.postMessage({
                type: 'BACKUP_JOURNAL',
                timestamp: new Date().toISOString(),
                status: 'syncing'
            });
        });
        console.log('📝 SW: Journal backup synced');
    } catch (error) {
        console.error('❌ SW: Journal backup failed:', error);
    }
}

// ========================================
// 🔔 PUSH NOTIFICATIONS — Cosmic Alerts
// ========================================
self.addEventListener('push', event => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body || 'New cosmic inspiration awaits you ✨',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-96x96.png',
        vibrate: [100, 50, 100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: data.primaryKey || 1,
            url: data.url || '/'
        },
        actions: [
            { action: 'explore', title: '🌌 Open' },
            { action: 'dismiss', title: '✧ Later' }
        ],
        requireInteraction: true
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Pleading Sanity', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data?.url || '/')
        );
    }
});

// ========================================
// 📬 MESSAGING — Client ↔ SW Communication
// ========================================
self.addEventListener('message', event => {
    const { data } = event;
    
    if (data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (data?.type === 'GET_VERSION' && event.ports?.[0]) {
        event.ports[0].postMessage({
            version: VERSION,
            cacheName: STATIC_CACHE,
            gamesCached: 5,
            status: 'active',
            timestamp: new Date().toISOString()
        });
    }
    
    if (data?.type === 'CLEAR_CACHES') {
        event.waitUntil(
            caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
        );
    }
});
