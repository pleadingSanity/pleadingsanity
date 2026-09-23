// ==============================================================
// 🌌 PLEADING SANITY — PWA SERVICE WORKER v1.4.0-PERFECTED
// Advanced Offline Crisis Support • Smart Caching • Background Sync
// Evolution Not Erasure • One Source • One Consciousness • One Family
// Built for Shane Cooper — Pleading Sanity Universal Alliance
// ==============================================================

const CACHE_NAME = 'pleading-sanity-v1.4.0';
const STATIC_CACHE = 'pleading-sanity-static-v1.4.0';
const DYNAMIC_CACHE = 'pleading-sanity-dynamic-v1.4.0';

// ========================================
// 🛡️ CRITICAL — Always Available Offline
// ========================================
const CRITICAL_CACHE = [
    '/',
    '/index.html',
    '/crisis-response-system.js',
    '/styles.css',
    '/mobile-responsive.css',
    '/error-handler.js',
    '/manifest.json'
];

// ========================================
// 📦 STATIC — Core Pages & Assets
// ========================================
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/sanityhub.html',
    '/shop.html',
    '/feed.html',
    '/games.html',
    '/videos.html',
    '/movement.html',
    '/about.html',
    '/journal-vault-viewer.html',
    '/styles.css',
    '/script.js',
    '/nav-component.css',
    '/manifest.json',
    '/assets/crying-brain-og.png',
    // ✅ Fixed: Use direct font URL with confirmed family
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap',
    'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
];

// ========================================
// 🔄 DYNAMIC — External APIs & Live Content
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
    console.log('🚀 Pleading Sanity SW: Installing v1.4.0...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 SW: Caching static assets');
                return cache.addAll(STATIC_CACHE_URLS).catch(err => {
                    console.warn('⚠️ SW: Some assets skipped (non-critical):', err.message);
                });
            })
            .then(() => caches.open(CACHE_NAME))
            .then(cache => cache.addAll(CRITICAL_CACHE))
            .catch(error => {
                console.error('❌ SW: Critical cache failed:', error);
            })
    );
    
    self.skipWaiting(); // Activate immediately
});

// ========================================
// ✅ ACTIVATE — Clean Old Caches
// ========================================
self.addEventListener('activate', event => {
    console.log('✅ Pleading Sanity SW: Activated v1.4.0');
    
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
        })
    );
    
    self.clients.claim(); // Take control of all open tabs
});

// ========================================
// 📡 FETCH — Smart Network → Cache Strategy
// ========================================
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle GET requests
    if (request.method !== 'GET') return;

    // Skip extensions, analytics, sensitive tracking
    if (
        url.protocol === 'chrome-extension:' ||
        url.hostname === 'zenquotes.io' ||
        url.hostname.includes('analytics') ||
        url.hostname.includes('googletagmanager')
    ) return;

    // ── STATIC: Cache First → Network Update ──
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
                        .catch(() => cached);
                    
                    return cached || networkFetch;
                })
                .catch(() => fetch(request))
        );
        return;
    }

    // ── DYNAMIC: Network First → Cache Fallback ──
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
                    console.log('🔌 SW: Offline — serving cached version');
                    return caches.match(request).then(cached => {
                        if (cached) return cached;
                        // For API: return empty gracefully
                        if (url.pathname.startsWith('/api/')) {
                            return new Response(
                                JSON.stringify({ offline: true, message: 'Working offline — changes will sync when back online' }),
                                { status: 200, headers: { 'Content-Type': 'application/json' } }
                            );
                        }
                        // For pages: serve fallback
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
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        vibrate: [100, 50, 100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: data.primaryKey || 1,
            url: data.url || '/'
        },
        actions: [
            { action: 'explore', title: '🌌 Open', icon: '/assets/icons/explore-action.png' },
            { action: 'dismiss', title: '✧ Later', icon: '/assets/icons/close-action.png' }
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
            version: CACHE_NAME,
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
