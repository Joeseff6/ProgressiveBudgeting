const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/styles.css",
    "/index.js",
    "/db/db.js"
];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", event => {
    event.waitUntil(
        caches
        .open(CACHE_NAME)
        .then(cache => cache.addAll(FILES_TO_CACHE))
        .then(() => {
            console.log(`Service worker has been installed!`);
            self.skipWaiting();
        })
        .catch(err => {
            console.log(err);
        })
    );
});

self.addEventListener("activate", event => {
    const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
    event.waitUntil(
        caches
        .keys()
        .then(cacheNames => {
            return cacheNames.filter(
            cacheName => !currentCaches.includes(cacheName)
            );
        })
        .then(cachesToDelete => {
                return Promise.all(
                cachesToDelete.map(cacheToDelete => {
                    return caches.delete(cacheToDelete);
                })
            );
        })
        .then(() => self.clients.claim())
        .catch(err => {
            console.log(err);
        })
    );
});