/* DoodhPulse service worker: keeps every app file on the phone so the app opens with no internet.
   No data passes through here: customers, sales and khata live in this phone's storage (IndexedDB). */
const CACHE = "doodhpulse-v1.0.2-test";
const FILES = ["index.html", "app.html", "dp.js", "nacl.min.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable.png", "apple-touch-icon.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("doodhpulse-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.pathname.startsWith(new URL("./", location.href).pathname)) return;
  e.respondWith(
    caches.open(CACHE).then((c) => c.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() =>
        req.mode === "navigate" ? c.match("app.html") : new Response("", { status: 504 }));
    }))
  );
});
