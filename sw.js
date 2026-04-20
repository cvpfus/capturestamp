const CACHE = 'capturestamp-v1';
const STATIC_ASSETS = [
  '/capturestamp/index.html',
  '/capturestamp/manifest.json',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          fetch(url, { credentials: 'omit' })
            .then((res) => { if (res.ok) cache.put(url, res); })
            .catch((err) => console.warn('SW: fetch error', url, err))
        )
      )
    )
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for static assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        if (res.ok) caches.open(CACHE).then((cache) => cache.put(event.request, res.clone()));
        return res;
      });
    })
  );
});
