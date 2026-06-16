const CACHE_NAME = "fieldscan-v8";

// Precache only the core shell + PWA assets.
// (Other JS modules are imported by app.bundle.js, and images are handled by on-demand caching.)
const ASSETS = [
  "./index.html",
  "./style.css",
  "./app.bundle.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./fieldscan.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  // Navigation: Network-first, fallback to cached index.html
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match("./index.html")));
    return;
  }

  // Static assets: cache-first, then network and update cache
  e.respondWith(
    caches.match(e.request).then((r) => {
      if (r) return r;
      return fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
        return res;
      });
    }),
  );
});
