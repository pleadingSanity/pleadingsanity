// ==============================================================
// 🌌 PLEADING SANITY — PWA SERVICE WORKER v4.0
// Offline crisis support • All pages & games cached • Smart updates
// Evolution Not Erasure • One Source • One Consciousness • One Family
// ==============================================================

const VERSION = '5.12.45'; // New Gen Bible carries Shane's full text. Dola speaks only in her own section.
const STATIC_CACHE = 'pleading-sanity-static-v71';
const DYNAMIC_CACHE = 'pleading-sanity-dynamic-v18';
const OFFLINE_URL = '/offline.html';

// Profile, member, journal and account pages hold personal data.
// Always from the network. Never written into either cache.
const PRIVATE_PAGES = [
    '/profile.html',
    '/member.html',
    '/journal-vault.html',
    '/journal-vault-viewer.html',
    '/login.html',
    '/signup.html',
    '/reset-password.html',
    '/settings.html',
    '/onboarding.html',
    '/admin.html',
    '/owner.html',
    '/post.html',
    '/community.html',
    '/sanctuary.html',
    '/write.html'
];

function isPrivatePath(pathname) {
    const bare = pathname.replace(/\/$/, '') || '/';
    if (bare.startsWith('/@')) return true;
    if (bare === '/journal' || bare.startsWith('/journal/') || bare.startsWith('/journal.')) return true;
    if (/(^|\/)(profile|member|account)(\/|$|\.)/.test(bare)) return true;
    const page = bare.endsWith('.html') ? bare : `${bare}.html`;
    return PRIVATE_PAGES.includes(page) || PRIVATE_PAGES.includes(bare);
}

// ========================================
// 📦 PRECACHE — every page, style & script the site needs offline
// ========================================
const PRECACHE_URLS = [
    '/',
    '/about.html',
    '/ai-ecosystem.html',
    '/ai-family.html',
    '/ai-stories.html',
    '/ai-studio.html',
    '/arron.html',
    '/arron-app.html',
    '/community-dashboard.html',
    '/cosmic-focus.html',
    '/crisis.html',
    '/tools.html',
    '/feed.html',
    '/frequencies.html',
    '/games.html',
    '/get-the-app.html',
    '/safety.html',
    '/sanity-solitaire.html',
    '/poker.html',
    '/circle.html',
    '/index.html',
    '/kids.html',
    '/meditation.html',
    '/memory-ocean.html',
    '/movement.html',
    '/new-gen-bible.html',
    '/number-nebula.html',
    '/offline.html',
    '/pattern-galaxy.html',
    '/quote-wall.html',
    '/rhythm-resonance.html',
    '/sanityhub.html',
    '/shop.html',
    '/stardust-dash.html',
    '/videos.html',
    '/creations.html',
    '/blueprint.html',
    '/wisdom.html',
    '/mind-mode.html',
    '/cosmic-connect.html',
    '/truth-tag.html',
    '/mood-journey.html',
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
    '/css/sanctuary.css',
    '/css/games-sanctuary.css',
    '/css/space.css',
    '/assets/theme/game-icons.jpg',
    '/assets/theme/solitaire-board.jpg',
    '/assets/theme/games-board.jpg',
    '/assets/images/brand/meme-tea.jpg',
    '/assets/images/brand/meme-list.jpg',
    '/assets/images/brand/home-rise-sea.jpg',
    '/assets/images/brand/home-city-brain.jpg',
    '/assets/theme/icons/sanity-solitaire.jpg',
    '/assets/theme/icons/cosmic-focus.jpg',
    '/assets/theme/icons/number-nebula.jpg',
    '/assets/theme/icons/pattern-galaxy.jpg',
    '/assets/theme/icons/memory-ocean.jpg',
    '/assets/theme/icons/rhythm-resonance.jpg',
    '/assets/theme/icons/stardust-dash.jpg',
    '/assets/theme/icons/healing-hz.jpg',
    '/assets/theme/hz/174.jpg',
    '/assets/theme/hz/285.jpg',
    '/assets/theme/hz/396.jpg',
    '/assets/theme/hz/417.jpg',
    '/assets/theme/hz/432.jpg',
    '/assets/theme/hz/528.jpg',
    '/assets/theme/hz/639.jpg',
    '/assets/theme/hz/741.jpg',
    '/assets/theme/hz/852.jpg',
    '/assets/theme/hz/963.jpg',
    '/assets/theme/icons/sanity-stories.jpg',
    '/assets/theme/icons/mind-mode.jpg',
    '/assets/theme/icons/cosmic-connect.jpg',
    '/assets/theme/icons/truth-tag.jpg',
    '/assets/theme/icons/mood-journey.jpg',
    '/assets/theme/suits/heart.jpg',
    '/assets/theme/suits/spade.jpg',
    '/assets/theme/suits/club.jpg',
    '/assets/theme/suits/diamond.jpg',
    '/css/games-sky.css',
    '/js/site.js',
    '/js/arron-companion.js',
    '/js/arron-core.js',
    '/js/auth.js',
    '/js/social.js',
    '/js/ai-studio.js',
    '/js/profile-form.js',
    '/js/progress.js',
    '/js/creations.js',
    '/js/blueprint.js',
    '/js/wisdom.js',
    '/js/mind-mode.js',
    '/js/cosmic-connect.js',
    '/js/truth-tag.js',
    '/js/mood-journey.js',
    '/js/vendor/netlify-identity.js',
    '/js/games.js',
    '/js/house-voice.js',
    '/js/stardust-dash.js',
    '/js/mindmode.js',
    '/js/scrollFeed.js',
    '/js/video-feed.js',
    '/js/cosmic-scroll.js',
    '/js/ai-stories.js',
    '/js/oauth.js',
    '/content/content_feed.json',
    '/arron-knowledge.json',
    '/assets/logo.svg',
    '/assets/images/brand/crying-brain-logo-512.webp',
    '/assets/favicon.svg',
    '/assets/favicon.ico',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/assets/icons/icon-72x72.png',
    '/assets/icons/icon.svg',
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

    // Profile, member, journal, account: network only. Never stored.
    // Offline, the sanctuary page is /offline.html — not a cached copy of someone's private page.
    if (isPrivatePath(url.pathname)) {
        if (request.mode === 'navigate') {
            event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
        }
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
