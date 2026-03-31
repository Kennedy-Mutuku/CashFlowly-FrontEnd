// CashFlowly Service Worker — required for Web Share Target to work
const CACHE_NAME = 'cashflowly-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Pass through all fetch requests (no caching for API calls)
self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request).catch(() => {
        return new Response('Offline', { status: 503 });
    }));
});
