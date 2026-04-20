const CACHE = 'capturestamp-v1';
const STATIC_ASSETS = [
  '/capturestamp.html',
  '/manifest.json',
];

// ─── Install: cache static assets ────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          fetch(url, { credentials: 'omit' })
            .then((res) => {
              if (res.ok) cache.put(url, res);
              else console.warn('SW: failed to cache', url, res.status);
            })
            .catch((err) => console.warn('SW: fetch error', url, err))
        )
      );
    })
  );
  self.skipWaiting();
});

// ─── Activate: clean old caches ──────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: network-first, fallback to cache ─────────────────
self.addEventListener('fetch', (event) => {
  // Only handle same-origin GET requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// ─── Message: receive capture blobs from the app ─────────────
const DB_NAME = 'capturestamp';
const STORE = 'captures';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror  = (e) => reject(e.target.error);
  });
}

self.addEventListener('message', async (event) => {
  const { type, data } = event.data || {};

  // ── STORE_CAPTURE: save blob + metadata to IndexedDB ──
  if (type === 'STORE_CAPTURE') {
    try {
      const db = await openDB();
      const tx  = db.transaction(STORE, 'readwrite');
      const now = new Date().toISOString();
      tx.objectStore(STORE).add({ ...data, savedAt: now });
      await new Promise((res, rej) => {
        tx.oncomplete = res;
        tx.onerror    = () => rej(tx.error);
      });

      // Notify all clients of updated gallery
      const clients = await self.clients.matchAll();
      clients.forEach((c) => c.postMessage({ type: 'CAPTURE_STORED', id: data.filename }));

      // Respond to sender
      if (event.ports?.length) {
        event.ports[0].postMessage({ ok: true });
      }
    } catch (err) {
      console.error('SW: STORE_CAPTURE error', err);
      if (event.ports?.length) {
        event.ports[0].postMessage({ ok: false, error: err.message });
      }
    }
  }

  // ── GET_CAPTURES: return list from IndexedDB ──
  if (type === 'GET_CAPTURES') {
    try {
      const db   = await openDB();
      const tx   = db.transaction(STORE, 'readonly');
      const req  = tx.objectStore(STORE).getAll();
      const list = await new Promise((res, rej) => {
        req.onsuccess = () => res(req.result);
        req.onerror   = () => rej(req.error);
      });
      if (event.ports?.length) {
        event.ports[0].postMessage({ ok: true, list });
      }
    } catch (err) {
      if (event.ports?.length) {
        event.ports[0].postMessage({ ok: false, error: err.message });
      }
    }
  }

  // ── DELETE_CAPTURE: remove by id ──
  if (type === 'DELETE_CAPTURE') {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(data.id);
      await new Promise((res, rej) => {
        tx.oncomplete = res;
        tx.onerror    = () => rej(tx.error);
      });
      if (event.ports?.length) {
        event.ports[0].postMessage({ ok: true });
      }
    } catch (err) {
      if (event.ports?.length) {
        event.ports[0].postMessage({ ok: false, error: err.message });
      }
    }
  }
});
