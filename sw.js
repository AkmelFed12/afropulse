/* ═══════════════════════════════════════════════
   AfroPulse Service Worker
   Cache des assets statiques + offline fallback
═══════════════════════════════════════════════ */

const CACHE = 'afropulse-v3';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/particulier.html',
  '/talents.html',
  '/tarifs.html',
  '/contact.html',
  '/a-propos.html',
  '/404.html',
  '/assets/tailwind.css',
  '/assets/env.js',
  '/assets/style.css',
  '/assets/app.js',
  '/assets/db.js',
  '/assets/auth.js',
  '/assets/data.js',
  '/assets/locations.js',
  '/assets/realtime.js',
  '/manifest.json'
];

/* Install : cache les assets essentiels */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

/* Activate : nettoie les vieux caches */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Fetch : stratégie hybride */
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Ne pas intercepter Supabase, CDN, API externes
  if (
    url.origin !== self.location.origin ||
    e.request.method !== 'GET' ||
    url.pathname.startsWith('/functions/')
  ) return;

  // HTML : network first (pour contenu frais)
  if (e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return resp;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match('/404.html')))
    );
    return;
  }

  // Assets statiques : cache first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      });
    })
  );
});