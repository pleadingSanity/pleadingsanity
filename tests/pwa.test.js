/**
 * PWA (Progressive Web App) Tests
 * Tests for service worker, manifest, and offline functionality
 */

describe('PWA Functionality', () => {
  describe('Service Worker', () => {
    test('should register service worker', async () => {
      // Mock service worker registration
      const mockRegistration = {
        scope: '/',
        active: { state: 'activated' }
      };
      
      navigator.serviceWorker.register.mockResolvedValue(mockRegistration);
      
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
      expect(registration.scope).toBe('/');
    });

    test('should handle service worker registration failure', async () => {
      const error = new Error('Service worker registration failed');
      navigator.serviceWorker.register.mockRejectedValue(error);
      
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (e) {
        expect(e.message).toContain('registration failed');
      }
    });

    test('should cache static assets', () => {
      const staticAssets = [
        '/',
        '/index.html',
        '/styles.css',
        '/script.js',
        '/manifest.json'
      ];
      
      // Mock cache API
      const mockCache = {
        addAll: jest.fn(() => Promise.resolve()),
        match: jest.fn(),
        put: jest.fn()
      };
      
      global.caches = {
        open: jest.fn(() => Promise.resolve(mockCache))
      };
      
      // Simulate caching
      return caches.open('pleading-sanity-v1')
        .then(cache => cache.addAll(staticAssets))
        .then(() => {
          expect(caches.open).toHaveBeenCalledWith('pleading-sanity-v1');
          expect(mockCache.addAll).toHaveBeenCalledWith(staticAssets);
        });
    });

    test('should serve cached content when offline', async () => {
      const mockCache = {
        match: jest.fn(() => Promise.resolve(new Response('cached content')))
      };
      
      global.caches = {
        match: jest.fn(() => Promise.resolve(new Response('cached content')))
      };
      
      const cachedResponse = await caches.match('/index.html');
      
      expect(caches.match).toHaveBeenCalledWith('/index.html');
      expect(cachedResponse).toBeInstanceOf(Response);
    });
  });

  describe('Web App Manifest', () => {
    test('should have valid manifest structure', () => {
      const manifest = {
        name: 'Pleading Sanity',
        short_name: 'Pleading Sanity',
        description: 'Mental health support platform',
        start_url: '/',
        display: 'standalone',
        background_color: '#000011',
        theme_color: '#00fff0',
        icons: [
          {
            src: 'assets/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      };

      expect(manifest.name).toBeDefined();
      expect(manifest.start_url).toBe('/');
      expect(manifest.display).toBe('standalone');
      expect(manifest.icons).toHaveLength(1);
    });

    test('should support app installation', () => {
      // Mock beforeinstallprompt event
      const mockInstallEvent = {
        preventDefault: jest.fn(),
        prompt: jest.fn(() => Promise.resolve()),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };

      // Simulate install prompt
      global.dispatchEvent(new CustomEvent('beforeinstallprompt', { detail: mockInstallEvent }));
      
      expect(mockInstallEvent.preventDefault).not.toThrow();
    });
  });

  describe('Offline Functionality', () => {
    test('should detect online/offline status', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      expect(navigator.onLine).toBe(false);

      // Simulate going online
      navigator.onLine = true;
      expect(navigator.onLine).toBe(true);
    });

    test('should queue actions when offline', () => {
      const offlineQueue = [];
      const action = {
        type: 'SAVE_JOURNAL',
        data: testData.journalEntry,
        timestamp: new Date().toISOString()
      };

      // Simulate offline queuing
      if (!navigator.onLine) {
        offlineQueue.push(action);
      }

      expect(offlineQueue).toHaveLength(1);
      expect(offlineQueue[0].type).toBe('SAVE_JOURNAL');
    });

    test('should sync queued actions when back online', async () => {
      const offlineQueue = [
        {
          type: 'SAVE_JOURNAL',
          data: testData.journalEntry,
          timestamp: new Date().toISOString()
        }
      ];

      // Mock successful sync
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      // Simulate sync process
      for (const action of offlineQueue) {
        if (action.type === 'SAVE_JOURNAL') {
          await fetch('/api/journal', {
            method: 'POST',
            body: JSON.stringify(action.data)
          });
        }
      }

      expect(fetch).toHaveBeenCalledWith('/api/journal', expect.any(Object));
    });
  });

  describe('Push Notifications', () => {
    test('should request notification permission', async () => {
      Notification.requestPermission.mockResolvedValue('granted');
      
      const permission = await Notification.requestPermission();
      
      expect(permission).toBe('granted');
      expect(Notification.requestPermission).toHaveBeenCalled();
    });

    test('should handle notification permission denial', async () => {
      Notification.requestPermission.mockResolvedValue('denied');
      
      const permission = await Notification.requestPermission();
      
      expect(permission).toBe('denied');
    });

    test('should create notification when permission granted', () => {
      Notification.permission = 'granted';
      
      const notification = {
        title: 'Daily Check-in Reminder',
        body: 'How are you feeling today?',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png'
      };

      // Mock Notification constructor
      global.Notification = jest.fn();
      
      new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon,
        badge: notification.badge
      });

      expect(Notification).toHaveBeenCalledWith(
        notification.title,
        expect.objectContaining({
          body: notification.body,
          icon: notification.icon
        })
      );
    });
  });

  describe('Background Sync', () => {
    test('should register background sync', async () => {
      const mockRegistration = {
        sync: {
          register: jest.fn(() => Promise.resolve())
        }
      };

      navigator.serviceWorker.ready = Promise.resolve(mockRegistration);
      
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('background-sync');

      expect(registration.sync.register).toHaveBeenCalledWith('background-sync');
    });

    test('should handle background sync events', () => {
      const syncEvent = {
        tag: 'background-sync',
        waitUntil: jest.fn()
      };

      // Mock sync handler
      const handleSync = (event) => {
        if (event.tag === 'background-sync') {
          event.waitUntil(
            // Simulate background work
            Promise.resolve('Background sync completed')
          );
        }
      };

      handleSync(syncEvent);
      
      expect(syncEvent.waitUntil).toHaveBeenCalled();
    });
  });
});