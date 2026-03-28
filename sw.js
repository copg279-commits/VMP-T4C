const CACHE_NAME = 'pwa-cache-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './T4C.png',
    './logogad.png',
    './polipensador.png',
    './CICLOMOTOR.png',
    './MOTO.png',
    './VMPPLACA.png',
    './logoautoequilibrado.png',
    './logo192.png',
    './logo512.png'
];

// Instalación: Guardar archivos en caché
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

// Activación: Limpiar cachés antiguas
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Intercepción de peticiones
self.addEventListener('fetch', event => {
    // REGLA DE ORO PARA FIREBASE: Solo cachear peticiones GET locales.
    // Ignorar cross-origin (Firebase Auth, Firestore, Google APIs, etc.)
    if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Devuelve la caché si existe, si no, va a la red
                return response || fetch(event.request);
            })
    );
});