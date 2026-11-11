// Coach — service worker : fonctionnement hors ligne après le premier chargement.
const CACHE = 'coach-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png', './programme.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;   // météo : jamais mise en cache
  if (url.pathname.endsWith('/programme.json')) {                                    // réseau d'abord, cache en secours
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); if (r.ok) caches.open(CACHE).then(c => c.put('./programme.json', cp)); return r; })
      .catch(() => caches.match('./programme.json')));
    return;
  }
  // coquille : cache d'abord, mise à jour en arrière-plan
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => {
    const net = fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
