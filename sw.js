const CACHE_NAME = "zi-visor-v6";
const ASSETS = [
  "./index.html",
  "./icon.svg",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://unpkg.com/@turf/turf@7/turf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.9.0/proj4.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
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
  // Network-first for API calls, cache-first for assets. "mapama.gob.es"
  // ya no lo usa ningún fetch() del código (migrado a gis.miteco.gob.es),
  // se deja por si acaso algún enlace suelto lo referencia; miteco.gob.es
  // añadido porque es el dominio real de la OGC API desde la migración.
  if (e.request.url.includes("mapama.gob.es") ||
      e.request.url.includes("miteco.gob.es") ||
      e.request.url.includes("catastro.meh.es") ||
      e.request.url.includes("cartociudad.es") ||
      e.request.url.includes("ign.es/wm")) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
