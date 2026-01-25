const CACHE_NAME = 'loglegends-v3'; // Increment version to force update
const urlsToCache = [
  '/LogLegends/',
  '/LogLegends/index.html',
  '/LogLegends/styles.css',
  '/LogLegends/app.js',
  '/LogLegends/storage.js',
  '/LogLegends/dashboard.js',
  '/LogLegends/checklist.js',
  '/LogLegends/timeline.js',
  '/LogLegends/profile.js',
  '/LogLegends/map.js',
  '/LogLegends/pdf-export.js',
  '/LogLegends/freemium.js',
  '/LogLegends/settings.js',
  '/LogLegends/manifest.json'
];

// Install service worker and cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app files');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Cache failed:', err);
      })
  );
  self.skipWaiting();
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return offline page
        return caches.match('/LogLegends/index.html');
      })
  );
});

// Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});
