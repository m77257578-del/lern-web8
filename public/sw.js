/**
 * PWA Service Worker: public/sw.js
 * Project: ليرن ويب | Lern Web
 * Features: Custom Offline Fallback Page (/offline.html), App Shell Precaching,
 *           Smart Runtime Caching & Embedded Offline Safety Net
 */

const CACHE_NAME = 'lern-web-v1.1.0';
const RUNTIME_CACHE = 'lern-web-runtime-v1.1.0';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

// Embedded fallback HTML in case /offline.html is ever evicted from Cache Storage
const EMBEDDED_OFFLINE_HTML = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>وضع عدم الاتصال | ليرن ويب - Lern Web Offline</title>
  <style>
    body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#020617; color:#f8fafc; font-family:system-ui,-apple-system,sans-serif; padding:1.5rem; text-align:center; }
    .card { max-width:520px; width:100%; background:#0f172a; border:1px solid #1e293b; border-radius:1.5rem; padding:2rem; box-shadow:0 20px 40px rgba(0,0,0,0.6); }
    .badge { display:inline-block; background:rgba(245,158,11,0.15); color:#fbbf24; border:1px solid rgba(245,158,11,0.3); padding:0.35rem 0.85rem; border-radius:999px; font-size:0.8rem; font-weight:700; margin-bottom:1rem; }
    h1 { font-size:1.5rem; margin:0 0 0.75rem; }
    p { color:#94a3b8; font-size:0.95rem; line-height:1.6; margin:0 0 1.5rem; }
    .btn { display:inline-block; background:#2563eb; color:#fff; font-weight:700; padding:0.8rem 1.4rem; border-radius:0.85rem; text-decoration:none; border:none; cursor:pointer; font-size:0.9rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">انقطع الاتصال بالشبكة • Offline Mode</div>
    <h1>أنت الآن في وضع عدم الاتصال بالإنترنت</h1>
    <p>تعذر الوصول إلى الخادم حالياً. بياناتك المحلية محفوظة بأمان عبر محرك Lern Web PWA، وسيتم استعادة الاتصال تلقائياً فور توفر الشبكة.</p>
    <button class="btn" onclick="window.location.reload()">إعادة المحاولة الآن</button>
  </div>
  <script>window.addEventListener('online', () => window.location.reload());</script>
</body>
</html>`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[LernWeb PWA SW] Precaching app shell & custom offline page');
      // Cache each core asset individually so a single missing optional asset doesn't abort precaching
      await Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch((err) => {
            console.warn('[LernWeb PWA SW] Failed to precache asset:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== RUNTIME_CACHE) {
            console.log('[LernWeb PWA SW] Deleting outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(async () => {
      if (self.registration.navigationPreload) {
        try {
          await self.registration.navigationPreload.enable();
        } catch {
          // Navigation preload not supported in this browser context
        }
      }
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'REFRESH_OFFLINE_CACHE') {
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)).catch(() => {});
  }
});

async function getOfflineFallbackResponse() {
  const cache = await caches.open(CACHE_NAME);
  const cachedOfflinePage = await cache.match(OFFLINE_URL) || await caches.match(OFFLINE_URL);
  if (cachedOfflinePage) {
    return cachedOfflinePage;
  }
  return new Response(EMBEDDED_OFFLINE_HTML, {
    status: 503,
    statusText: 'Service Unavailable - Offline',
    headers: new Headers({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    })
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);
  const acceptHeader = request.headers.get('accept') || '';
  const isNavigationRequest = request.mode === 'navigate' || acceptHeader.includes('text/html');

  // 1. Handle HTML Navigation Requests (Network-First -> Custom Offline Page Fallback)
  if (isNavigationRequest) {
    event.respondWith(
      (async () => {
        try {
          // Use preloaded response if available
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        } catch {
          // When user loses internet connection, serve the custom offline fallback page
          return await getOfflineFallbackResponse();
        }
      })()
    );
    return;
  }

  // 2. Handle API Requests (/api/*) with JSON Offline Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedApi = await caches.match(request);
        if (cachedApi) return cachedApi;

        return new Response(
          JSON.stringify({
            offline: true,
            status: 'offline',
            message: 'أنت الآن في وضع عدم الاتصال بالإنترنت. يتم استخدام البيانات المخزنة محلياً.',
            messageEn: 'You are currently offline. Serving local fallback state.'
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
          }
        );
      })
    );
    return;
  }

  // 3. Handle Static Assets (JS, CSS, Images, Fonts) with Network-First + Cache Fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        return new Response('Offline asset unavailable', {
          status: 503,
          statusText: 'Offline Mode Active',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })
  );
});
