const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/styles.css",
    "/index.js",
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
    );
});

// fetch
self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/")) {
        evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return fetch(evt.request)
            .then(response => {
                if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
                }

                return response;
            })
            .catch(err => {
                return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
        );

        return;
    }

    evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
            return response || fetch(evt.request);
        });
        })
    );
});