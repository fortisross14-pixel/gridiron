// Service worker for Gridiron PWA.
// Strategy: network-first for HTML (so updates show up), cache-first for assets.
// Versioned cache means a deployed app update invalidates the old cache.

const VERSION = 'gridiron-v1';
const CACHE = `${VERSION}-static`;

// The scope determines what the service worker controls — typically
// `/gridiron/` (or whatever base path the app is served from). Derive
// the shell URLs from registration.scope so we don't hardcode.
const shellUrls = (scope) => [
  scope,
  scope + 'index.html',
  scope + 'manifest.webmanifest',
  scope + 'icon-192.png',
  scope + 'icon-512.png',
];

// On install, pre-cache the shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(shellUrls(self.registration.scope))
    ).catch(() => {})
  );
  self.skipWaiting();
});

// On activate, drop old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Only handle same-origin GETs.
  if (url.origin !== self.location.origin) return;

  // HTML / navigation: network-first, fall back to cache.
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((m) => m || caches.match(self.registration.scope)))
    );
    return;
  }

  // Everything else (JS, CSS, fonts, images): cache-first.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      });
    })
  );
});
