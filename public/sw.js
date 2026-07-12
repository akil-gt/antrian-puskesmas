const CACHE = 'antrian-puskesmas-v1';
const PRECACHE_URLS = ['/', '/offline'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    )).then(self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => {
      if (res.status === 200 && event.request.url.startsWith(self.location.origin)) {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, clone));
      }
      return res;
    }))
  );
});
