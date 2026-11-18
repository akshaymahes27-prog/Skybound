/* Skybound service worker
   Bump VERSION whenever you ship a new index.html / assets so installed apps update. */
const VERSION = 'v1';
const SHELL_CACHE = 'skybound-shell-' + VERSION;
const RUNTIME_CACHE = 'skybound-runtime-' + VERSION;
const FONT_CACHE = 'skybound-fonts-v1';
const BASE = self.registration.scope;
const url = (p) => new URL(p, BASE).href;

const CORE = ['./', 'index.html', 'manifest.webmanifest', 'offline.html',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png', 'icons/favicon-32.png', 'icons/favicon.ico'];

// Artwork the app references. Cached best-effort: a missing file never breaks install.
const ART = ['hero_skybound', 'ic_skybound_mascot',
  ...['happy','wink','celebrating','victory','excited','thinking','calm','sleepy','sad','peeking',
      'organised','love','inprogress','focused','determined','cool'].map(n => 'mascot_pose_' + n),
  ...['sports','music','fitness','dance','study','art','focus','wellbeing','achieve','habits'].map(n => 'act_' + n),
  ...['unlock','trophy','streak','star','special','progress','milestone','medal','levelup','achievement'].map(n => 'badge_' + n)
].map(n => 'assets/' + n + '.png');

self.addEventListener('install', (event) => {
  self.skipWaiting(); // new versions take over straight away (pages always load network-first anyway)
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await Promise.all(CORE.map(p => cache.add(new Request(url(p), { cache: 'reload' }))));
    await Promise.all(ART.map(p => cache.add(new Request(url(p), { cache: 'reload' })).catch(() => {})));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = [SHELL_CACHE, RUNTIME_CACHE, FONT_CACHE];
    const names = await caches.keys();
    await Promise.all(names.filter(n => n.startsWith('skybound-') && !keep.includes(n)).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

// Network first (with a short timeout) so updates arrive quickly, cached copy when offline.
async function navigate(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const res = await Promise.race([
      fetch(request),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))
    ]);
    if (res && res.ok) cache.put(url('index.html'), res.clone());
    return res;
  } catch (err) {
    return (await cache.match(url('index.html'))) || (await cache.match(url('offline.html'))) || Response.error();
  }
}

// Serve from cache straight away, refresh it in the background.
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const refresh = fetch(request).then(res => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
    return res;
  }).catch(() => null);
  return cached || (await refresh) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);

  if (req.mode === 'navigate') { event.respondWith(navigate(req)); return; }

  if (u.origin === location.origin) {
    if (!u.href.startsWith(BASE)) return;
    const isShellFile = /\/(sw\.js)$/.test(u.pathname);
    if (isShellFile) return; // let the browser handle SW update checks itself
    const cacheName = /\.(png|jpe?g|webp|svg|ico|webmanifest)$/i.test(u.pathname) ? SHELL_CACHE : RUNTIME_CACHE;
    event.respondWith(staleWhileRevalidate(req, cacheName));
    return;
  }

  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(req, FONT_CACHE));
  }
});
