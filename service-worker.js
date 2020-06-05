let STATIC_CACHE_NAME = "testPWA-v1"; // The string used to identify our cache

const FILES_TO_CACHE = ["offline.html", "style.css", "index.html"];

self.addEventListener("install", (event) => {
  console.log("Installing...");
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(FILES_TO_CACHE);
      })
      .catch((err) => console.log(err))
  );
});

self.addEventListener("activate", (event) => {
  console.log("Activating new service worker...");

  const cacheWhitelist = [STATIC_CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log("Fetch event for ", event.request.url);
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          console.log("Found ", event.request.url, " in cache");
          return response;
        }
        console.log("Network request for ", event.request.url);
        return fetch(event.request).then((response) => {
          // if (response.status === 404) {
          //   return caches.match('pages/404.html');
          // }
          return caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(event.request.url, response.clone());
            return response;
          });
        });
      })
      .catch((error) => {
        console.log("Error, ", error);
        return caches.match("offline.html");
      })
  );
});
