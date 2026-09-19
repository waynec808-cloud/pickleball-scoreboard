// Pickleball Scoreboard v3.4.7
const CACHE = 'pickleball-scoreboard-v3-7';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-180.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            event.waitUntil(
              caches.open(CACHE).then(cache => cache.put('./index.html', copy))
            );
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE);
          return (await cache.match('./index.html')) ||
                 (await cache.match('./')) ||
                 Response.error();
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (
          request.method === 'GET' &&
          response &&
          response.ok &&
          new URL(request.url).origin === self.location.origin
        ) {
          const copy = response.clone();
          event.waitUntil(
            caches.open(CACHE).then(cache => cache.put(request, copy))
          );
        }
        return response;
      });
    })
  );
});
