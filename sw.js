// Coach — service worker : fonctionnement hors ligne après le premier chargement.
const CACHE = 'coach-v3';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png',
  './programme.json', './voix.json', './voix.m4a'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Fichier audio : en ligne, on laisse le navigateur faire (Safari exige des réponses 206 pour les médias) ;
// hors ligne, on sert la copie en cache en respectant la plage demandée.
async function cachedRange(req) {
  const r = await caches.match('./voix.m4a');
  if (!r) return Response.error();
  const buf = await r.arrayBuffer(), range = req.headers.get('range');
  if (!range) return new Response(buf, { headers: { 'Content-Type': 'audio/mp4', 'Accept-Ranges': 'bytes' } });
  const m = /bytes=(\d+)-(\d*)/.exec(range), s = +m[1], end = m[2] ? Math.min(+m[2], buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(s, end + 1), { status: 206, headers: {
    'Content-Type': 'audio/mp4', 'Accept-Ranges': 'bytes', 'Content-Length': String(end - s + 1), 'Content-Range': `bytes ${s}-${end}/${buf.byteLength}` } });
}

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;   // météo : jamais mise en cache
  if (url.pathname.endsWith('/voix.m4a')) {
    if (!self.navigator.onLine) e.respondWith(cachedRange(e.request));
    return;
  }
  if (url.pathname.endsWith('/programme.json') || url.pathname.endsWith('/voix.json')) {   // réseau d'abord, cache en secours
    const key = './' + url.pathname.split('/').pop();
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); if (r.ok) caches.open(CACHE).then(c => c.put(key, cp)); return r; })
      .catch(() => caches.match(key)));
    return;
  }
  // coquille : cache d'abord, mise à jour en arrière-plan
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => {
    const net = fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
