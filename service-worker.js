let CACHE_NAME = "testPWA"; // The string used to identify our cache

const FILES_TO_CACHE = ["offline.html", "style.css"];

self.addEventListener("install", (event) => {
  console.log("Installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log(`[ServiceWorker] Pre-caching offline page`);
        return cache.addAll(FILES_TO_CACHE);
      })
      .catch((err) => console.log(err))
  );
});

self.addEventListener("activate", (event) => {
  console.log("Activating...");
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[ServiceWorker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// self.addEventListener("fetch", (event) => {
//   if (event.request.mode !== "navigate") {
//     // Not a page navigation, bail.
//     return;
//   }
//   event.respondWith(
//     fetch(event.request).catch(() => {
//       return caches.open(CACHE_NAME).then((cache) => {
//         return cache.match("offline.html");
//       });
//     })
//   );
// });

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
        return fetch(event.request);

        // TODO 4 - Add fetched files to the cache
      })
      .catch((error) => {
        // TODO 6 - Respond with custom offline page
        return caches.open(CACHE_NAME).then((cache) => {
          return cache.match("offline.html");
        });
      })
  );
});
