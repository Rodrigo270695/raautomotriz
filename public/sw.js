/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'ra-automotriz-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/ralogo.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isStatic =
    url.pathname.startsWith('/build/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/ralogo.png' ||
    /\.(js|css|woff2?|png|jpg|ico|svg)$/i.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((res) => {
            if (res.ok && res.type === 'basic') {
              cache.put(event.request, res.clone());
            }
            return res;
          });
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((res) => res)
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/').then((index) => index || new Response('Sin conexión', { status: 503, statusText: 'Offline' }));
          }
          return new Response('', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
