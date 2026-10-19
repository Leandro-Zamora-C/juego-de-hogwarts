/* Service worker de Hogwarts Magic Experience
   Permite instalar la página como app y usarla sin internet.
   Si cambias index.html y no ves los cambios, sube el número de VERSION. */
const VERSION = 'hogwarts-v12';
const CORE = ['./', './index.html', './manifest.json', './css/v7.css', './js/v7-duelo.js', './js/v7-magia.js', './js/preguntas-duelo-1.js', './js/preguntas-duelo-2.js', './img/icon-192.png', './img/icon-512.png'];
const OPTIONAL = ['./audio/musica1.mp3', './audio/musica2.mp3', './audio/musica3.mp3', './audio/musica.mp3', './audio/sombrero.mp3',
  './audio/gryffindor.mp3', './audio/slytherin.mp3', './audio/ravenclaw.mp3', './audio/hufflepuff.mp3',
  ...['dueloimagen', 'frases', 'maraton', 'hechizos', 'criaturas', 'personajes', 'halloween', 'navidad', 'pelicula1', 'pelicula2', 'pelicula3', 'pelicula4', 'pelicula5', 'pelicula6', 'pelicula7', 'pelicula8']
    .flatMap(n => [`./img/${n}.jpg`, `./img/${n}.webp`, `./img/${n}.png`])];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(CORE);
    // Los opcionales se guardan si existen; si alguno falta no pasa nada
    await Promise.all(OPTIONAL.map(u => cache.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Responde pedidos de audio por rangos (necesario para reproducir mp3 desde caché)
async function rangeResponse(request, cached) {
  const range = request.headers.get('range');
  const buf = await cached.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range || '');
  const start = m && m[1] ? +m[1] : 0;
  const end = m && m[2] ? +m[2] : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': cached.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes'
    }
  });
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('supabase.co') || url.protocol === 'chrome-extension:') return;

  // Audio: primero caché (con soporte de rangos), si no, red
  if (req.headers.get('range')) {
    event.respondWith((async () => {
      const cached = await caches.match(url.href, { ignoreSearch: true });
      if (cached) return rangeResponse(req, cached);
      return fetch(req);
    })());
    return;
  }

  // Páginas: red primero (para ver cambios), caché si no hay internet
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(VERSION);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (e) {
        return (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  // Lo demás (imágenes, fuentes, librerías): caché y se actualiza en segundo plano
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req);
    const network = fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()).catch(() => {});
      return res;
    }).catch(() => cached);
    return cached || network;
  })());
});

/* Recordatorio diario (Chrome para Android con la app instalada) */
self.addEventListener('periodicsync', event => {
  if (event.tag !== 'desafio-diario') return;
  event.waitUntil(self.registration.showNotification('🪄 ¡Nuevo desafío diario!', {
    body: 'Hay una pregunta nueva esperándote. Acierta y gana 25 puntos para tu casa.',
    icon: 'img/icon-192.png', badge: 'img/icon-192.png', tag: 'desafio-diario', renotify: false
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('./');
  })());
});
