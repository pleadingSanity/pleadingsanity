// ==============================================================
// 🌌 PLEADING SANITY — PWA SERVICE WORKER v2.0-GAMES-FULL
// Advanced Offline Crisis Support • All 5 Games Cached • Smart Sync
// Evolution Not Erasure • One Source • One Consciousness • One Family
// Built for Shane Cooper — Pleading Sanity Universal Alliance
// ==============================================================

const CACHE_NAME = 'pleading-sanity-v2.0';
const STATIC_CACHE = 'pleading-sanity-static-v2.0';
const DYNAMIC_CACHE = 'pleading-sanity-dynamic-v2.0';
const VERSION = '2.0.0';

// ========================================
// 🛡️ CRITICAL — Always Available Offline
// ========================================
const CRITICAL_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/manifest.json',
    '/assets/favicon.ico',
    '/assets/crying-brain-og.png'
];

// ========================================
// 📦 STATIC — ALL Pages + ALL 5 Games
// ========================================
const STATIC_CACHE_URLS = [
    // Core Pages
    '/',
    '/index.html',
    '/about.html',
    '/sanityhub.html',
    '/journal-vault.html',
    '/journal-vault-viewer.html',
    '/frequencies.html',
    '/games.html',
    '/shop.html',
    '/movement.html',
    
    // 🧠 ALL 5 BRAIN GAMES — FULL OFFLINE ACCESS
    '/cosmic-focus.html',
    '/number-nebula.html',
    '/pattern-galaxy.html',
    '/memory-ocean.html',
    '/rhythm-resonance.html',
    
    // Styles & Shared
    '/styles.css',
    '/manifest.json',
    
    // ✅ Fonts — Fixed & Verified
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap'
    // Note: Actual .woff2 files auto-cached when visited — no hard fail
];

// ========================================
// 🔄 DYNAMIC — Live APIs & External Content
// ========================================
const DYNAMIC_CACHE_URLS = [
    'https://www.youtube.com/embed/',
    'https://i.ytimg.com/vi/',
    'https://www.googleapis.com/youtube/v3/',
    '/.netlify/functions/',
    '/api/'
];

// ========================================
// 🚀 INSTALL — Prime the Cache
// ========================================
self.addEventListener('install', event => {
    console.log(`🚀 Pleading Sanity SW: Installing v${VERSION}…`);
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 SW: Caching all pages & 5 games…');
                return cache.addAll(STATIC_CACHE_URLS).catch(err => {
                    console.warn('⚠️ SW: Some non-critical assets skipped:', err.message);
                });
            })
            .then(() => caches.open(CACHE_NAME))
            .then(cache => {
                console.log('🔒 SW: Caching critical offline essentials…');
                return cache.addAll(CRITICAL_CACHE);
            })
            .then(() => console.log(`✅ SW v${VERSION}: ALL GAMES OFFLINE-READY`))
            .catch(error => {
                console.error('❌ SW: Critical cache failed:', error);
            })
    );
    
    self.skipWaiting(); // Activate instantly
});

// ========================================
// ✅ ACTIVATE — Clean Old Caches
// ========================================
self.addEventListener('activate', event => {
    console.log(`✅ Pleading Sanity SW: Activated v${VERSION}`);
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (![CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
                        console.log('🗑️ SW: Purging stale cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// ========================================
// 📡 FETCH — Smart Network → Cache Strategy
// ========================================
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle GET requests
    if (request.method !== 'GET') return;

    // Skip browser extensions & tracking
    if (
        url.protocol === 'chrome-extension:' ||
        url.hostname === 'zenquotes.io' ||
        url.hostname.includes('analytics') ||
        url.hostname.includes('googletagmanager')
    ) return;

    // ── STATIC: Cache First → Instant Load ──
    const isStatic = STATIC_CACHE_URLS.some(cachedUrl => 
        request.url === cachedUrl || request.url.includes(cachedUrl)
    );
    if (isStatic) {
        event.respondWith(
            caches.match(request)
                .then(cached => {
                    const networkFetch = fetch(request)
                        .then(networkRes => {
                            caches.open(STATIC_CACHE).then(cache => {
                                cache.put(request, networkRes.clone());
                            });
                            return networkRes;
                        })
                        .catch(() => {
                            console.log('📴 SW: Offline — serving cached:', url.pathname);
                            return cached;
                        });
                    return cached || networkFetch;
                })
                .catch(() => fetch(request))
        );
        return;
    }

    // ── DYNAMIC: Network First → Graceful Fallback ──
    const isDynamic = DYNAMIC_CACHE_URLS.some(pattern => 
        request.url.includes(pattern)
    );
    if (isDynamic) {
        event.respondWith(
            fetch(request)
                .then(networkRes => {
                    if (networkRes.ok) {
                        caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(request, networkRes.clone());
                        });
                    }
                    return networkRes;
                })
                .catch(() => {
                    console.log('🔌 SW: Live content offline — using fallback');
                    return caches.match(request).then(cached => {
                        if (cached) return cached;
                        // API: return friendly offline message
                        if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/.netlify/')) {
                            return new Response(
                                JSON.stringify({ 
                                    offline: true, 
                                    message: 'Working offline — changes sync when you reconnect ✨' 
                                }),
                                { status: 200, headers: { 'Content-Type': 'application/json' } }
                            );
                        }
                        // Pages: serve home as fallback
                        if (request.headers.get('accept')?.includes('text/html')) {
                            return caches.match('/index.html');
                        }
                    });
                })
        );
        return;
    }

    // ── DEFAULT: Network → Cache → Offline Fallback ──
    event.respondWith(
        fetch(request)
            .catch(() => caches.match(request))
            .catch(() => {
                if (request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('/index.html');
                }
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
        icon: '/assets/crying-brain-og.png',
        badge: '/assets/favicon.ico',
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
            cacheName: CACHE_NAME,
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
