/* NeuroOrbitSynapse service worker.
   Strategy: network first (so an upload to GitHub is picked up at once), cache as the offline fallback.
   VERSION and SHELL are maintained by tools/sync.py. Bump VERSION on every release. */
const VERSION = 'nos-v7.4.0';
/*SHELL:start*/
const SHELL = ['./','index.html','manifest.webmanifest','nos7-apple-touch-icon.png','nos7-maskable.svg','nos7-mono.svg','nos7-monochrome-512.png','nos7-icon-192.png','nos7-icon-512.png','nos7-icon.svg','nos7-badge-96.png','nos7-maskable-512.png','nos7-favicon-32.png'];
/*SHELL:end*/

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  e.respondWith(
    fetch(e.request).then(r => {
      if (r && r.ok && u.origin === location.origin) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)).catch(() => {}); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(m => m || caches.match('./index.html')))
  );
});

/* notification buttons: Done logs the goal, tapping opens it */
self.addEventListener('notificationclick', e => {
  const n = e.notification, d = n.data || {}, act = e.action; n.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    if (cs.length) { const c = cs[0]; if (act === 'done' && d.goal) c.postMessage({ type: 'done', goal: d.goal }); else if (d.goal) c.postMessage({ type: 'open', goal: d.goal }); return c.focus(); }
    const q = act === 'done' && d.goal ? '?done=' + encodeURIComponent(d.goal) : (d.goal ? '?goal=' + encodeURIComponent(d.goal) : '');
    return self.clients.openWindow('./' + q);
  }));
});

/* focus-timer alert while the page is hidden */
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type !== 'focusTimer') return;
  const w = Math.max(0, d.at - Date.now());
  e.waitUntil(new Promise(res => setTimeout(() => {
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      if (cs.some(c => c.visibilityState === 'visible')) return res();
      self.registration.showNotification(d.title, { body: d.body, tag: d.tag, icon: 'nos7-icon-192.png', badge: 'nos7-badge-96.png', requireInteraction: true, vibrate: [300, 120, 300], data: {} }).then(res, res);
    }, res);
  }, Math.min(w, 5 * 3600 * 1000))));
});
