// Pleading Sanity Service Worker
// Provides offline functionality and caching

const CACHE_NAME = 'pleading-sanity-v1.2';
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
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap'
];

const DYNAMIC_CACHE_URLS = [
  'https://www.youtube.com/embed/',
  'https://i.ytimg.com/vi/', 
  'https://www.googleapis.com/youtube/v3/',
  '/.netlify/functions/'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('🚀 Pleading Sanity SW: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 SW: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch(error => {
        console.error('❌ SW: Failed to cache static assets:', error);
      })
  );
  
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('✅ Pleading Sanity SW: Activated');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Fetch Strategy: Network First with Cache Fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and external APIs we don't want to cache
  if (url.protocol === 'chrome-extension:' || 
      url.hostname === 'zenquotes.io' ||
      url.hostname.includes('analytics')) {
    return;
  }
  
  // Handle static assets (Cache First)
  if (STATIC_CACHE_URLS.some(cacheUrl => request.url.includes(cacheUrl))) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request).then(networkResponse => {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone));
            return networkResponse;
          });
        })
        .catch(() => {
          // Return offline fallback for HTML pages
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        })
    );
    return;
  }
  
  // Handle dynamic content (Network First)
  if (DYNAMIC_CACHE_URLS.some(dynamicUrl => request.url.includes(dynamicUrl))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }
  
  // Default: Network First with Cache Fallback
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
      .catch(() => {
        // Ultimate fallback for navigation requests
        if (request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      })
  );
});

// Background Sync for Journal Vault
self.addEventListener('sync', event => {
  if (event.tag === 'journal-backup') {
    event.waitUntil(backupJournalVault());
  }
});

// Backup Journal Vault to IndexedDB
async function backupJournalVault() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKUP_JOURNAL',
        message: 'Backing up journal vault...'
      });
    });
  } catch (error) {
    console.error('❌ SW: Journal backup failed:', error);
  }
}

// Push Notifications (for future features)
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New cosmic inspiration awaits!',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1
    },
    actions: [
      {
        action: 'explore',
        title: '🌌 Explore',
        icon: '/assets/icons/explore-action.png'
      },
      {
        action: 'close',
        title: '❌ Close',
        icon: '/assets/icons/close-action.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Pleading Sanity', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for client communication
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});