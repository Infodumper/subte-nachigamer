const CACHE_NAME = 'subte-nachi-v2';

// Assets estáticos que se precargan al instalar el SW
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/js/database.js',
    '/js/views.js',
    '/js/greeting.js',
    '/js/app.js',
    '/manifest.json',
    '/styles/Subte_gcba_logo.png'
];

// Instalar y precargar el shell
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
    );
});

// Activar: limpiar caches viejos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Estrategia por tipo de request:
// - JS/CSS/HTML/PNG → Cache-First (devuelve instantáneo, actualiza en bgd)
// - Imágenes externas → Stale-While-Revalidate
// - Todo lo demás → Network-First con fallback a cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Solo manejar GETs
    if (request.method !== 'GET') return;

    // Archivos propios del app (mismo origen)
    if (url.origin === self.location.origin) {
        event.respondWith(
            caches.match(request).then((cached) => {
                const networkFetch = fetch(request).then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                });
                // Cache-first: devuelve cache si existe, si no espera network
                return cached || networkFetch;
            })
        );
        return;
    }

    // Recursos externos (Google Fonts, imágenes remotas, Tailwind CDN)
    event.respondWith(
        caches.match(request).then((cached) => {
            const networkFetch = fetch(request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => cached); // Si falla la red, devuelve caché
            // Stale-while-revalidate: devuelve cache inmediatamente y actualiza en bgd
            return cached ? cached : networkFetch;
        })
    );
});
