/* RestoPulse Tablet service worker: keeps every app file on the device so RestoPulse opens with no internet.
   No data passes through here: menu, orders and sales live in this device's storage (IndexedDB). */
const CACHE = "rp-tablet-8c4d7ac805";
const FILES = ["index.html", "app.html", "rp-core.js", "rp-shim.js", "nacl.min.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable.png", "apple-touch-icon.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("rp-tablet-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) { // keep the app's fonts for offline use after the first online start
    e.respondWith(caches.open(CACHE).then((c) => c.match(req).then((hit) => hit || fetch(req).then((r) => { c.put(req, r.clone()); return r; }).catch(() => new Response("", { status: 504 })))));
    return;
  }
  if (url.origin !== location.origin || !url.pathname.startsWith(new URL("./", location.href).pathname)) return; // e.g. the photo-menu reader from the internet
  e.respondWith(
    caches.open(CACHE).then((c) => c.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() =>
        req.mode === "navigate" ? c.match("app.html") : new Response("", { status: 504 }));
    }))
  );
});
