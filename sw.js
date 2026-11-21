/* Service Worker — يخزّن "هيكل التطبيق" فقط ليفتح بسرعة.
 * البيانات (data/*) وخدمات Google لا تُخزَّن أبداً: تُجلب دائماً من الشبكة. */
const CACHE = 'captains-shell-v1';
const SHELL = ['./captain.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.includes('/data/')) return;   // بيانات/خارجي: الشبكة مباشرة
  // شبكة أولاً ثم الكاش (حتى تصل التحديثات للكباتن فور رفعها)
  e.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('./captain.html')))
  );
});
