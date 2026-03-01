const CACHE_NAME = "nws-weather-v1";
const SHELL_URLS = ["./index.html", "./manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // For NWS API requests: network first, no cache
  if (url.hostname === "api.weather.gov") {
    e.respondWith(fetch(e.request));
    return;
  }

  // For app shell: cache first, then network
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
