// LifeOS Service Worker — offline cache + background sync
const CACHE_NAME = 'lifeos-v1';
const STATIC_ASSETS = [
  '/',
  '/financas',
  '/projetos',
  '/objetivos',
  '/responsabilidades',
  '/patrimonio',
  '/familia',
  '/saude',
  '/conhecimento',
  '/decisoes',
  '/ia',
  '/relatorio',
  '/casal',
  '/notificacoes',
  '/orcamento',
  '/cenarios',
  '/checkin',
  '/openfinance',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET, API calls, and cross-origin
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
