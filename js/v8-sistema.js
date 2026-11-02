/* =====================================================================
   HOGWARTS · VERSIÓN 8 · SISTEMA
   Exterior 3D del castillo, magos 3D en el duelo, idioma inglés, modo
   para daltónicos y lectores de pantalla, narrador con voz, música por
   sala, modo cine, notificaciones, reportar preguntas, preguntas de la
   comunidad, estadísticas personales y panel del administrador
   (estadísticas, preguntas, reportes, mantenimiento, anuncios y
   respaldo en Excel) y la ventana de novedades.
===================================================================== */
(() => {
  const V8 = window.V8, V = window.V7 || {}, st = V8.st;
  const opt = () => { const s = st(); s.sys = Object.assign({ lang: 'es', cb: false, narr: false, music: true, notif: false }, s.sys || {}); return s.sys; };

  /* =====================================================================
     NARRADOR (voz del navegador)
  ===================================================================== */
  let voice = null;
  const pickV = () => { const vs = (speechSynthesis.getVoices && speechSynthesis.getVoices()) || []; voice = vs.find(v => /es[-_](PE|MX|US|419)/i.test(v.lang)) || vs.find(v => /^es/i.test(v.lang)) || null; };
  if ('speechSynthesis' in window) { pickV(); speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', pickV); }
  V8.speak = (text, force) => {
    if (!('speechSynthesis' in window) || (!force && !opt().narr)) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, '')); u.lang = opt().lang === 'en' ? 'en-US' : 'es-ES'; if (voice && opt().lang !== 'en') u.voice = voice; u.rate = .98; u.pitch = 1; speechSynthesis.speak(u); } catch (e) {}
  };
  // el sombrero, el tutorial y la carta hablan
  const hatTxt = $('sortingThinkingText'); if (hatTxt) new MutationObserver(() => V8.speak(hatTxt.textContent)).observe(hatTxt, { childList: true, characterData: true, subtree: true });
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.id === 'v7Tut') { const ob = new MutationObserver(() => { const p = n.querySelector('.tip p'); if (p) V8.speak(p.textContent); }); ob.observe(n, { childList: true }); } }))).observe(document.body, { childList: true });
  if (typeof renderLetter === 'function') {
    const _rl = renderLetter;
    renderLetter = function () { const r = _rl.apply(this, arguments); const box = $('tab-letter'); if (box && !$('v8LetterVoice')) { const b = document.createElement('button'); b.id = 'v8LetterVoice'; b.className = 'btn-ghost !py-1.5 !text-xs mx-auto block'; b.innerHTML = '🔊 Escuchar mi carta'; b.onclick = () => { const t = box.querySelector('.letter-paper, #letterBody, .parchment') || box; V8.speak(t.innerText.slice(0, 1200), true); }; box.prepend(b); } return r; };
  }

  /* =====================================================================
     MÚSICA POR SALA (generada, o tus mp3 en audio/sala-*.mp3)
  ===================================================================== */
  const ROOMS = { home: 'salon', movies: 'salon', castillo: 'misterio', games: 'juego', duel: 'epica', library: 'calma', letter: 'calma', coleccion: 'calma', studio: 'misterio', wand: 'calma', shop: 'juego', profile: 'calma', community: 'juego', live: 'epica' };
  const SCALES = { salon: [261.6, 293.7, 329.6, 392, 440], calma: [220, 261.6, 293.7, 329.6, 392], misterio: [220, 246.9, 261.6, 329.6, 349.2], juego: [329.6, 392, 440, 523.3, 587.3], epica: [146.8, 174.6, 196, 220, 261.6] };
  const mus = { timer: 0, room: null, el: null };
  function userMusicOn() { return typeof music !== 'undefined' && music.el && !music.el.paused; }
  function roomMusic() {
    clearInterval(mus.timer); mus.timer = 0;
    const room = ROOMS[currentTab]; mus.room = room;
    if (!opt().music || !S.sound || document.hidden || !room || userMusicOn() || V8.reduced()) return;
    if (typeof AC === 'undefined' || !AC || AC.state !== 'running') return;
    const sc = SCALES[room]; let step = 0;
    mus.timer = setInterval(() => {
      if (document.hidden || userMusicOn() || (typeof duckReasons !== 'undefined' && duckReasons.size && room !== 'epica')) return;
      const f = sc[(step * 3 + (step >> 2)) % sc.length] * (step % 8 === 0 ? .5 : 1);
      tone(f, room === 'epica' ? .3 : .9, room === 'juego' ? 'triangle' : 'sine', room === 'epica' ? .025 : .018);
      if (room === 'epica' && step % 2 === 0) tone(65, .25, 'sine', .05, 45);
      if (step % 4 === 0) tone(sc[0] / 2, 1.6, 'sine', .015);
      step++;
    }, room === 'epica' ? 380 : room === 'juego' ? 420 : 700);
  }
  V8.roomMusic = roomMusic;
  document.addEventListener('visibilitychange', roomMusic);
  document.addEventListener('pointerdown', () => { if (!mus.timer) setTimeout(roomMusic, 400); }, { passive: true });

  /* =====================================================================
     IDIOMA INGLÉS (menús y botones; las preguntas siguen en español)
  ===================================================================== */
  const EN = {
    'Inicio': 'Home', 'Trivia': 'Trivia', 'Juegos': 'Games', 'Duelo': 'Duel', 'Castillo': 'Castle', 'Colección': 'Collection', 'Estudio': 'Studio', 'Ollivanders': 'Ollivanders', 'Carta': 'Letter', 'Biblioteca': 'Library', 'Ranking': 'Ranking', 'Tienda': 'Shop', 'Callejón Diagon': 'Diagon Alley', 'Perfil': 'Profile', 'Más': 'More', 'En vivo': 'Live', 'Comunidad': 'Community', 'Admin': 'Admin',
    'Mi perfil': 'My profile', 'Hechizos': 'Spells', 'Varita': 'Wand', 'Misiones': 'Missions', 'Premio diario': 'Daily reward', 'Ranas': 'Frogs', 'Reta a un amigo': 'Challenge a friend', 'El Gran Salón': 'The Great Hall', '¡A cenar trivia!': 'Trivia dinner!',
    'Jugar Trivia': 'Play Trivia', 'Retar a un Duelo': 'Start a Duel', 'Sala de Juegos': 'Game Room', 'Desafío Diario': 'Daily Challenge', 'Copa de las Casas': 'House Cup', 'Arena del Duelo ⚔️': 'Duel Arena ⚔️', '2 jugadores': '2 players', 'Contra la IA': 'Against AI', 'En línea': 'Online',
    'Lanzar dado': 'Roll the die', 'Salir': 'Exit', 'Aceptar': 'OK', 'Cancelar': 'Cancel', 'Revancha': 'Rematch', '¡Empezar!': 'Start!', '¡A jugar!': "Let's play!", 'Otra vez': 'Again', 'Cerrar sesión': 'Sign out', 'Sincronizar': 'Sync', 'Borrar mis datos': 'Delete my data',
    'Ajustes': 'Settings', 'Tema': 'Theme', 'Tamaño de letra': 'Font size', 'Calidad gráfica': 'Graphics quality', 'Sonido ambiente': 'Ambient sound', 'Vibración': 'Vibration', 'Idioma': 'Language', 'Narrador con voz': 'Voice narrator', 'Música por sala': 'Music per room', 'Modo para daltónicos': 'Color-blind mode',
    'Inicia sesión para jugar': 'Sign in to play', '¡Bienvenido/a a Hogwarts!': 'Welcome to Hogwarts!', 'Continuar con Google': 'Continue with Google', '👀 Continuar sin cuenta (solo explorar)': '👀 Continue without account (explore only)', '← Seguir explorando': '← Keep exploring',
    'Tu Colección ✨': 'Your Collection ✨', 'Cromos': 'Cards', 'Bestiario': 'Bestiary', 'Medallas': 'Medals', 'Diario': 'Diary', 'Sala común': 'Common room', 'Avatar': 'Avatar', 'Mapa del Castillo 🏰': 'Castle Map 🏰',
    'Principales': 'Main games', 'Más juegos mágicos': 'More magic games', 'Ludo Mágico': 'Magic Ludo', 'Ajedrez Mágico': 'Wizard Chess', 'Memoria Mágica': 'Magic Memory', 'Escoba Voladora': 'Flying Broom', 'Atrapa la Snitch': 'Catch the Snitch',
    'Tiempo por pregunta': 'Time per question', 'Dificultad': 'Difficulty', 'Tema ': 'Topic ', 'Todos los temas': 'All topics', 'Fácil': 'Easy', 'Normal': 'Normal', 'Experto': 'Expert', 'Todas': 'All',
    'Expediente del alumno': 'Student record', 'Cambiar de casa': 'Change house', 'Reiniciar progreso': 'Reset progress', 'Vitrina de trofeos': 'Trophy case', 'Historial de duelos': 'Duel history', 'Galeones': 'Galleons', 'Patronus': 'Patronus', 'Duelos ganados': 'Duels won', 'Logros': 'Achievements',
    'Tu bolsa': 'Your purse', 'Comprar': 'Buy', 'Usar': 'Use', '✔ En uso': '✔ In use', 'Depositar': 'Deposit', 'Retirar': 'Withdraw', 'Reclamar': 'Claim', 'Hoy': 'Today', 'Esta semana': 'This week'
  };
  const REV = Object.fromEntries(Object.entries(EN).map(([a, b]) => [b, a]));
  let i18nObs = null;
  function translateNode(root, map) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement && !/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/.test(n.parentElement.tagName) && n.nodeValue.trim() ? 1 : 2 });
    const list = []; while (w.nextNode()) list.push(w.currentNode);
    list.forEach(n => { const t = n.nodeValue.trim(), r = map[t]; if (r) n.nodeValue = n.nodeValue.replace(t, r); });
  }
  V8.setLang = l => {
    opt().lang = l; save(); document.documentElement.lang = l;
    if (i18nObs) { i18nObs.disconnect(); i18nObs = null; }
    if (l === 'en') { translateNode(document.body, EN); i18nObs = new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) translateNode(n, EN); else if (n.nodeType === 3 && EN[n.nodeValue.trim()]) n.nodeValue = EN[n.nodeValue.trim()]; }))); i18nObs.observe(document.body, { childList: true, subtree: true }); toast('English menus on. Questions stay in Spanish for now.', '🇬🇧'); }
    else { translateNode(document.body, REV); }
  };

  /* =====================================================================
     DALTONISMO Y LECTORES DE PANTALLA
  ===================================================================== */
  function applyA11y() {
    document.documentElement.classList.toggle('v8-cb', !!opt().cb);
    // botones que solo tienen ícono
    [['accountBtn', 'Mi cuenta'], ['musicBtn', 'Música']].forEach(([id, l]) => { const b = $(id); if (b && !b.getAttribute('aria-label')) b.setAttribute('aria-label', l); });
    document.querySelectorAll('button:not([aria-label])').forEach(b => { if (!b.textContent.trim() && b.title) b.setAttribute('aria-label', b.title); });
  }
  const live = document.createElement('div'); live.id = 'v8Live'; live.setAttribute('aria-live', 'polite'); live.className = 'sr-only'; live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)'; document.body.appendChild(live);
  V8.announce = t => { live.textContent = ''; setTimeout(() => { live.textContent = t; }, 50); };
  ['duelQuestionText', 'quizQuestionText'].forEach(id => { const el = $(id); if (el) new MutationObserver(() => V8.announce('Pregunta: ' + el.textContent)).observe(el, { childList: true, characterData: true, subtree: true }); });
  V8.on('answer', ({ ok, q }) => V8.announce(ok ? 'Correcto' : `Incorrecto. La respuesta era ${q && q.a}`));

  /* =====================================================================
     AJUSTES NUEVOS
  ===================================================================== */
  const _rs = renderSettings;
  renderSettings = function () {
    _rs();
    const box = $('settingsToggles'); if (!box) return; const o = opt();
    const sw = (k, label, hint) => `<label class="flex items-center justify-between gap-3 py-2.5 cursor-pointer"><span><span class="block text-sm text-stone-200 font-semibold">${label}</span><span class="block text-[11px] text-stone-500">${hint}</span></span><span class="switch"><input type="checkbox" ${o[k] ? 'checked' : ''} onchange="V8.setSys('${k}', this.checked)"><span></span></span></label>`;
    box.insertAdjacentHTML('beforeend', `<div class="pt-3 mt-2 border-t border-amber-900/40"><p class="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Versión 8</p>
      <div class="flex items-center justify-between gap-3 py-2.5"><span><span class="block text-sm text-stone-200 font-semibold">Idioma</span><span class="block text-[11px] text-stone-500">Menús en inglés (las preguntas siguen en español).</span></span><select onchange="V8.setLang(this.value)" class="bg-stone-950 border border-amber-800/50 rounded-lg px-2 py-1 text-xs text-amber-100"><option value="es" ${o.lang === 'es' ? 'selected' : ''}>🇵🇪 Español</option><option value="en" ${o.lang === 'en' ? 'selected' : ''}>🇬🇧 English</option></select></div>
      ${sw('cb', 'Modo para daltónicos', 'Aciertos en azul ✔ y errores en naranja ✖, en vez de verde y rojo.')}
      ${sw('narr', 'Narrador con voz', 'Lee en voz alta la carta, el diario, los retratos y el Sombrero.')}
      ${sw('music', 'Música por sala', 'Melodías suaves que cambian según la sala (si no tienes tus mp3).')}
      ${sw('notif', 'Notificaciones', 'Avisos de retos de amigos, cartas y tu racha diaria.')}
      <div class="grid grid-cols-2 gap-2 mt-2"><button onclick="closeSettings();V8.news(true)" class="btn-ghost !text-xs">✨ Novedades</button><button onclick="closeSettings();V8.cinema()" class="btn-ghost !text-xs">🎬 Modo cine</button></div></div>`);
  };
  V8.setSys = (k, v) => { opt()[k] = v; save(); if (k === 'cb') applyA11y(); if (k === 'music') roomMusic(); if (k === 'narr' && v) V8.speak('El narrador está activado.', true); if (k === 'notif' && v) askNotif(); };

  /* =====================================================================
     NOTIFICACIONES
  ===================================================================== */
  async function askNotif() { if (!('Notification' in window)) { toast('Tu navegador no permite notificaciones.', '🔕'); opt().notif = false; save(); return; } const p = await Notification.requestPermission(); if (p !== 'granted') { opt().notif = false; save(); toast('No diste permiso para notificaciones.', '🔕'); } else V8.notify('🦉 ¡Listo!', 'Así te avisaremos de retos y cartas.'); }
  V8.notify = async (title, body) => {
    if (!opt().notif || !('Notification' in window) || Notification.permission !== 'granted') return;
    try { const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); if (reg) reg.showNotification(title, { body, icon: 'img/icon-192.png', badge: 'img/icon-192.png', tag: title }); else new Notification(title, { body, icon: 'img/icon-192.png' }); } catch (e) {}
  };
  // recordatorio de racha si la página queda abierta de noche
  setInterval(() => { const h = new Date().getHours(), s = st(); if (h >= 19 && s.daily && s.daily.last !== V8.day() && s.daily.streak > 2 && document.hidden && s.lastStreakNote !== V8.day()) { s.lastStreakNote = V8.day(); save(); V8.notify('🔥 ¡No pierdas tu racha!', `Llevas ${s.daily.streak} días seguidos. Entra a reclamar tu premio de hoy.`); } }, 600000);

  /* =====================================================================
     EXTERIOR DE HOGWARTS EN 3D (en la portada, junto al Gran Salón)
  ===================================================================== */
  const ext = { R: null, raf: 0, on: false };
  function extBuild(host) {
    const cv = document.createElement('canvas'); cv.id = 'v8Ext'; host.appendChild(cv);
    const R = M3.create(cv, { maxDpr: 1.75 }); if (!R) { cv.remove(); return null; }
    const G = M3.G, mat = R.mat;
    R.clear = [.02, .02, .07]; R.sky = [.3, .32, .55]; R.ground = [.05, .05, .08]; R.light.dir = M3.norm([.4, -.6, -.7]); R.light.color = [.55, .6, .95];
    R.fog = { color: [.06, .06, .16], density: .013 }; R.cam.fov = 42; R.cam.far = 260;
    R.pl[0] = { pos: [0, 4, 6], color: [1.2, .75, .3], range: 14 };
    if (typeof c3SkyGeo === 'function') R.add(R.node(R.mesh(c3SkyGeo([.01, .02, .1], [.2, .14, .38], [.03, .03, .08])), mat({ unlit: true, bg: true, fog: false, ds: true }), { cast: false, scl: [2.4, 2.4, 2.4] }));
    R.add(R.node(R.mesh(G.sphere(5, 24, 16)), mat({ color: [1, .97, .85], unlit: true, fog: false }), { pos: [-60, 70, -150], cast: false }));
    R.add(R.node(R.mesh(G.plane(400, 400, 1, 1)), mat({ color: [.06, .1, .2], spec: 1.6, shin: 160 }), { pos: [0, -.8, 0], cast: false }));
    R.add(R.node(R.mesh(G.plane(60, 34, 30, 18, (x, z) => Math.max(0, 3.2 - Math.hypot(x * .8, z * 1.2) * .22) + Math.sin(x * .5) * .2)), mat({ color: [.12, .2, .1], spec: .05 }), { pos: [0, -1.2, -2], cast: false }));
    if (typeof b3CastleGeo === 'function') {
      const cg = b3CastleGeo();
      const g = R.add(R.node(null, null, { pos: [0, 1.5, -3], scl: [1.1, 1.1, 1.1] }));
      R.add(R.node(R.mesh(cg.stone), mat({ color: [.46, .44, .5], pat: 2, patS: 2, spec: .08, rim: .2, rimC: [.5, .55, 1] })), g);
      R.add(R.node(R.mesh(cg.roofs), mat({ color: [.15, .17, .26], spec: .7, shin: 50 })), g);
      R.add(R.node(R.mesh(cg.wins), mat({ color: [1, .78, .35], unlit: true })), g);
    }
    if (typeof b3HillsGeo === 'function') { const hg = b3HillsGeo(); const g = R.add(R.node(null, null, { pos: [0, -1, -40] })); R.add(R.node(R.mesh(hg.hill), mat({ color: [.06, .12, .09], spec: 0 })), g); R.add(R.node(R.mesh(hg.trees), mat({ color: [.03, .08, .06], spec: 0 })), g); }
    const stars = Array.from({ length: 180 }, () => { const a = Math.random() * 6.28, e = .1 + Math.random() * 1.2; return [Math.cos(a) * 140 * Math.cos(e), 20 + Math.sin(e) * 110, Math.sin(a) * 140 * Math.cos(e) - 40]; });
    const t0 = performance.now();
    const loop = now => {
      ext.raf = 0; if (!ext.on || !cv.isConnected || document.hidden || currentTab !== 'home') return; ext.raf = requestAnimationFrame(loop);
      R.tick(now); const r = cv.getBoundingClientRect(); if (Math.abs(r.width - R.w) > 1) R.resize();
      const t = (now - t0) / 1000, a = Math.sin(t * .05) * .9;
      R.cam.pos = [Math.sin(a) * 30, 6 + Math.sin(t * .2) * .6, Math.cos(a) * 30]; R.cam.target = [0, 5, -3];
      const pts = stars.map((p, i) => ({ p, c: [.9, .92, 1, .4 + .4 * Math.sin(t * 2 + i)], s: 1.2 }));
      for (let i = 0; i < 14; i++) pts.push({ p: [Math.sin(i * 2.2) * 9, 1 + (i % 4) * 1.6, 2.2 + Math.cos(i) * .5], c: [1, .75, .3, .35], s: 1.4 });
      R.render(pts);
    };
    ext.wake = () => { if (!ext.raf) ext.raf = requestAnimationFrame(loop); };
    return R;
  }
  V8.hallView = which => {
    const hall = $('v7Hall'); if (!hall) return; ext.on = which === 'ext';
    const inner = hall.querySelector('canvas:not(#v8Ext)');
    if (ext.on && !ext.R) ext.R = extBuild(hall);
    const ec = $('v8Ext'); if (ec) ec.style.display = ext.on ? 'block' : 'none'; if (inner) inner.style.visibility = ext.on ? 'hidden' : 'visible';
    const h3 = hall.querySelector('.cap h3'); if (h3) h3.textContent = ext.on ? 'Hogwarts de noche' : 'El Gran Salón';
    hall.querySelectorAll('.v8-viewbtn button').forEach(b => b.classList.toggle('on', b.dataset.v === which));
    if (ext.on && ext.wake) ext.wake(); st().hallView = which; save();
  };
  function hallButtons() {
    const hall = $('v7Hall'); if (!hall || hall.querySelector('.v8-viewbtn')) return;
    hall.insertAdjacentHTML('beforeend', `<div class="v8-viewbtn">${M3.supported() ? '<button data-v="in" class="on" onclick="V8.hallView(\'in\')">🍽️ Gran Salón</button><button data-v="ext" onclick="V8.hallView(\'ext\')">🏰 Exterior</button>' : ''}<button onclick="V8.cinema()" title="Modo cine">🎬</button></div>`);
    if (st().hallView === 'ext' && M3.supported()) setTimeout(() => V8.hallView('ext'), 400);
  }

  /* =====================================================================
     MODO CINE
  ===================================================================== */
  V8.cinema = () => {
    if (currentTab !== 'home') switchTab('home');
    setTimeout(() => {
      const hall = $('v7Hall'); if (!hall) return;
      hall.classList.add('v8-cinema'); document.documentElement.classList.add('v8-cine');
      const exit = () => { hall.classList.remove('v8-cinema'); document.documentElement.classList.remove('v8-cine'); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); hall.removeEventListener('click', exit); removeEventListener('keydown', esc1); window.dispatchEvent(new Event('resize')); };
      const esc1 = e => { if (e.key === 'Escape') exit(); };
      try { (hall.requestFullscreen || hall.webkitRequestFullscreen || (() => Promise.reject())).call(hall).catch(() => {}); } catch (e) {}
      setTimeout(() => { hall.addEventListener('click', exit); addEventListener('keydown', esc1); window.dispatchEvent(new Event('resize')); }, 300);
      document.addEventListener('fullscreenchange', function f() { if (!document.fullscreenElement) { exit(); document.removeEventListener('fullscreenchange', f); } });
      toast('Modo cine: toca la pantalla para salir.', '🎬'); unlock('v8cine');
    }, 200);
  };

  /* =====================================================================
     MAGOS 3D EN EL DUELO
  ===================================================================== */
  const D3 = { R: null, raf: 0, wiz: [], beams: [], parts: [], t0: 0 };
  function duel3D() {
    const stage = $('v7DuelStage'); if (!stage || $('v8Duel3d') || !M3.supported() || V8.low()) return;
    const cv = document.createElement('canvas'); cv.id = 'v8Duel3d'; stage.appendChild(cv);
    const R = M3.create(cv, { maxDpr: 1.5 }); if (!R) { cv.remove(); return; }
    D3.R = R; const G = M3.G, mat = R.mat;
    const old = stage.querySelector('canvas:not(#v8Duel3d)'); if (old) old.style.visibility = 'hidden';
    R.clear = [.05, .03, .1]; R.sky = [.45, .4, .7]; R.ground = [.1, .06, .05]; R.light.dir = M3.norm([.2, -1, -.6]); R.light.color = [.9, .85, 1];
    R.fog = { color: [.05, .03, .1], density: .03 }; R.cam.fov = 30; R.cam.pos = [0, 2.1, 7.4]; R.cam.target = [0, 1.3, 0];
    R.pl[0] = { pos: [-3, 2, 1], color: [1, .3, .25], range: 4 }; R.pl[1] = { pos: [3, 2, 1], color: [.25, 1, .55], range: 4 };
    R.add(R.node(R.mesh(G.cyl(5.5, 5.8, .3, 40)), mat({ color: [.32, .28, .3], pat: 5, patS: .5, spec: .3 }), { pos: [0, -.3, 0], cast: false }));
    const robe = G.lathe([[0, 0], [.55, 0], [.5, .4], [.38, 1], [.28, 1.5], [.2, 1.62], [0, 1.64]], 18);
    const hat = G.lathe([[0, 0], [.42, 0], [.42, .04], [.2, .1], [.05, .7], [0, .78]], 16);
    const arm = G.merge([[G.cyl(.07, .09, .7, 8), G.at(0, -.7, 0)], [G.cyl(.02, .025, .6, 6), G.at(0, -1.25, 0)]]);
    [[-2.6, '#b91c1c', 1], [2.6, '#047857', -1]].forEach(([x, col, dir], i) => {
      const root = R.add(R.node(null, null, { pos: [x, 0, 0], rot: [0, dir * 1.2, 0] }));
      R.add(R.node(R.mesh(robe), mat({ color: M3.hex(col), spec: .3, rim: .4, rimC: [1, .9, .7] })), root);
      R.add(R.node(R.mesh(G.sphere(.24, 16, 12)), mat({ color: [.95, .78, .62], spec: .2 }), { pos: [0, 1.85, 0] }), root);
      R.add(R.node(R.mesh(hat), mat({ color: [.08, .07, .1], spec: .4 }), { pos: [0, 1.98, 0], rot: [0, 0, dir * .12] }), root);
      const sh = R.add(R.node(null, null, { pos: [0, 1.45, .25] }), root);
      R.add(R.node(R.mesh(arm), mat({ color: M3.hex(col).map(v => v * .8), spec: .3 })), sh);
      D3.wiz[i] = { root, sh, dir, cast: 0, hurt: 0 };
    });
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; R.add(R.node(R.mesh(G.cyl(.06, .07, .4, 8)), mat({ color: [1, .95, .8], em: [.3, .25, .15] }), { pos: [Math.cos(a) * 4.6, 2.8 + Math.sin(i) * .3, Math.sin(a) * 2 - 2.2], cast: false })); }
    D3.t0 = performance.now();
    const loop = now => {
      D3.raf = requestAnimationFrame(loop);
      if (document.hidden || !cv.isConnected || $('duelArena').classList.contains('hidden')) return;
      R.tick(now); const r = cv.getBoundingClientRect(); if (Math.abs(r.width - R.w) > 1 || Math.abs(r.height - R.h) > 1) R.resize();
      const t = (now - D3.t0) / 1000, pts = [];
      D3.wiz.forEach((w, i) => { w.cast = Math.max(0, w.cast - .03); w.hurt = Math.max(0, w.hurt - .02); w.sh.rot = [-(.9 + w.cast * .9) + Math.sin(t * 1.5 + i) * .05, 0, w.dir * .2]; w.root.rot = [0, w.dir * 1.2, -w.dir * w.hurt * .5]; w.root.pos = [w.root.pos[0], Math.sin(t * 2 + i) * .03, 0]; });
      const tipOf = i => { const w = D3.wiz[i]; return [w.root.pos[0] + w.dir * .75, 1.45 + .2 + w.cast * .3, .9]; };
      D3.beams = D3.beams.filter(b => { const age = (now - b.t) / 1000; if (age > 1) return false; const a = tipOf(b.from), z = tipOf(1 - b.from), k = Math.min(1, age / .3); for (let s = 0; s <= 22; s++) { const f = s / 22 * k; pts.push({ p: [a[0] + (z[0] - a[0]) * f, a[1] + (z[1] - a[1]) * f + Math.sin(f * 30 + t * 40) * .06, a[2]], c: [...b.c, 1 - Math.max(0, age - .5) * 2], s: .18 }); }
        if (k >= 1 && !b.hit) { b.hit = true; D3.wiz[1 - b.from].hurt = 1; for (let i = 0; i < 40; i++) { const an = Math.random() * 6.28, sp = Math.random() * .08; D3.parts.push({ p: z.slice(), v: [Math.cos(an) * sp, Math.random() * .08, Math.sin(an) * sp], c: b.c, l: 1 }); } } return true; });
      D3.parts = D3.parts.filter(p => { p.p[0] += p.v[0]; p.p[1] += p.v[1]; p.p[2] += p.v[2]; p.v[1] -= .003; p.l -= .025; if (p.l <= 0) return false; pts.push({ p: p.p, c: [...p.c, p.l], s: .12 }); return true; });
      const ta = tipOf(0), tb = tipOf(1); pts.push({ p: ta, c: [1, .4, .3, .8], s: .35 }, { p: tb, c: [.3, 1, .6, .8], s: .35 });
      R.render(pts);
    };
    D3.raf = requestAnimationFrame(loop);
  }
  if (typeof beam === 'function') { const _b = beam; beam = function (fromLeft, color) { const r = _b(fromLeft, color); if (D3.R) { const i = fromLeft ? 0 : 1; D3.wiz[i].cast = 1; D3.beams.push({ from: i, t: performance.now(), c: M3.hex(color && color[0] === '#' ? color : (fromLeft ? '#ef4444' : '#10b981')) }); } return r; }; }

  /* =====================================================================
     REPORTAR UNA PREGUNTA
  ===================================================================== */
  V8.report = (q, a) => {
    if (!q) return;
    showDialog({ icon: '🚩', title: 'Reportar pregunta', body: `<p class="text-xs text-stone-400 mb-2">«${esc(q)}»</p><select id="rpWhy" class="w-full bg-stone-950 border border-amber-700/50 rounded-lg px-3 py-2 text-sm text-stone-200"><option>La respuesta correcta está mal</option><option>Tiene un error de escritura</option><option>Es confusa</option><option>Otra cosa</option></select><textarea id="rpTxt" maxlength="200" rows="2" placeholder="Comentario (opcional)" class="w-full mt-2 bg-stone-950 border border-amber-700/50 rounded-lg px-3 py-2 text-sm text-stone-200"></textarea>`,
      actions: [{ label: 'Enviar reporte', primary: true, onClick: async () => { try { await rpc('reportar_pregunta', { p_pregunta: String(q).slice(0, 300), p_respuesta: String(a || '').slice(0, 120), p_motivo: ($('rpWhy') || {}).value || '', p_comentario: (($('rpTxt') || {}).value || '').slice(0, 200) }); toast('¡Gracias! El administrador revisará la pregunta.', '🚩'); } catch (e) { toast('No se pudo enviar. ¿Ejecutaste supabase-v8.sql?', '⚠️'); } } }, { label: 'Cancelar' }] });
  };
  function addReportButtons() {
    const qg = $('quizOptionsGrid'); if (qg && !$('v8RepQ')) qg.insertAdjacentHTML('afterend', `<button id="v8RepQ" class="v8-report" onclick="V8.report(quiz && quiz.list[quiz.i] && quiz.list[quiz.i].q, quiz && quiz.list[quiz.i] && quiz.list[quiz.i].a)">🚩 Reportar pregunta</button>`);
    const dg = $('v7Jokers') || $('duelOptionsGrid'); if (dg && !$('v8RepD')) dg.insertAdjacentHTML('afterend', `<button id="v8RepD" class="v8-report" onclick="const q=(typeof od!=='undefined'&&od.running?od.q:duel.q);V8.report(q&&q.q,q&&q.a)">🚩 Reportar pregunta</button>`);
  }

  /* =====================================================================
     PREGUNTAS DE LA COMUNIDAD (las agrega el administrador)
  ===================================================================== */
  V8.communityQ = async () => { try { const c = await loadSupabase(); const { data } = await c.from('preguntas_comunidad').select('id,pregunta,correcta,mal1,mal2,mal3,tema').eq('activa', true).order('id').limit(300); return (data || []).map(r => ({ q: r.pregunta, a: r.correcta, w: [r.mal1, r.mal2, r.mal3], movie: '⭐ Comunidad · ' + (r.tema || ''), d: 'm', topic: 'comunidad' })); } catch (e) { return []; } };
  V8.playCommunity = async () => {
    if (V.guardPlay && V.guardPlay()) return;
    const list = V8.shuffle(await V8.communityQ()).slice(0, 10);
    if (!list.length) return toast('Todavía no hay preguntas de la comunidad. ¡Pronto!', '⭐');
    let i = 0, ok = 0;
    const show = () => {
      if (!$('v8SheetBody')) return;
      if (i >= list.length) { $('v8SheetBody').innerHTML = `<div class="text-center space-y-2"><div class="text-5xl">⭐</div><p class="font-wizard text-xl text-amber-300">${ok}/${list.length} correctas</p></div>`; if (ok) addPoints(ok * 3); return; }
      const q = list[i], opts = V8.shuffle([q.a, ...q.w]);
      $('v8SheetBody').innerHTML = `<p class="text-xs text-stone-400">Pregunta ${i + 1}/${list.length}</p><p class="font-bold text-amber-100 my-2">${esc(q.q)}</p><div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${opts.map(o => `<button class="opt-btn !text-sm">${esc(o)}</button>`).join('')}</div><button class="v8-report" onclick="V8.report(${JSON.stringify(q.q).replace(/"/g, '&quot;')}, ${JSON.stringify(q.a).replace(/"/g, '&quot;')})">🚩 Reportar</button>`;
      [...$('v8SheetBody').querySelectorAll('.opt-btn')].forEach((b, k) => b.onclick = () => { const g = opts[k] === q.a; if (g) ok++; b.classList.add(g ? 'correct' : 'wrong'); sfx(g ? 'correct' : 'wrong'); V8.emit('answer', { ok: g, q, source: 'comunidad' }); i++; setTimeout(show, 750); });
    };
    V8.sheet('⭐ Preguntas de la comunidad', ''); show();
  };
  function triviaCommunityCard() {
    const grid = $('tab-movies'); if (!grid || $('v8CommCard')) return;
    grid.insertAdjacentHTML('afterbegin', `<div id="v8CommCard" class="glass-card rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 max-w-5xl mx-auto"><span class="text-sm text-stone-200">⭐ <b class="text-amber-300">Preguntas nuevas de la comunidad</b> · y 🧩 <b class="text-amber-300">Trivia Mixta</b> con imágenes y verdadero o falso.</span><span class="flex gap-2"><button class="btn-gold !py-1.5 !text-xs" onclick="V8.playCommunity()">Jugar comunidad</button><button class="btn-ghost !py-1.5 !text-xs" onclick="switchTab('games');setTimeout(()=>openGame('mixta'),150)">Trivia Mixta</button><button class="btn-ghost !py-1.5 !text-xs" onclick="V8.retoNew()">⚔️ Retar a un amigo</button></span></div>`);
  }

  /* =====================================================================
     ESTADÍSTICAS PERSONALES
  ===================================================================== */
  V8.on('answer', ({ ok, movieId }) => {
    const s = st().stats, h = new Date().getHours(); s.hours[h] = (s.hours[h] || 0) + 1;
    if (movieId) { const m = s.movie[movieId] = s.movie[movieId] || [0, 0]; m[1]++; if (ok) m[0]++; }
  });
  const _ax = addXp; addXp = function (n) { const r = _ax(n); const d = st().stats.days, k = V8.day(); d[k] = (d[k] || 0) + n; const keys = Object.keys(d).sort(); while (keys.length > 30) delete d[keys.shift()]; return r; };
  function bars(vals, labels, color, fmt = v => v) {
    const max = Math.max(1, ...vals), W = 100 / vals.length;
    return `<svg viewBox="0 0 100 46" class="v8-chart" preserveAspectRatio="none">${vals.map((v, i) => `<rect x="${i * W + W * .15}" y="${40 - v / max * 36}" width="${W * .7}" height="${Math.max(.5, v / max * 36)}" rx="1" fill="${color}"><title>${labels[i]}: ${fmt(v)}</title></rect>`).join('')}</svg><div class="v8-chartlbl">${labels.map(l => `<span>${l}</span>`).join('')}</div>`;
  }
  function statsHTML() {
    const s = st().stats;
    const movies = MOVIES.map((m, i) => { const v = s.movie[i + 1] || [0, 0]; return v[1] ? Math.round(v[0] / v[1] * 100) : 0; });
    const days = Array.from({ length: 7 }, (_, i) => V8.day(new Date(Date.now() - (6 - i) * 86400000)));
    const best = s.hours.indexOf(Math.max(...s.hours));
    return `<div class="glass-card rounded-3xl p-4 space-y-3"><h3 class="font-wizard font-bold text-amber-300">📊 Tus estadísticas</h3>
      <div><p class="text-xs text-stone-400">Porcentaje de aciertos por película</p>${bars(movies, MOVIES.map(m => m.num), '#f59e0b', v => v + '%')}</div>
      <div><p class="text-xs text-stone-400">XP ganada esta semana</p>${bars(days.map(d => s.days[d] || 0), days.map(d => ['D', 'L', 'M', 'M', 'J', 'V', 'S'][new Date(d + 'T12:00').getDay()]), '#34d399')}</div>
      <p class="text-xs text-stone-300">🕐 Tu mejor hora para jugar: <b class="text-amber-300">${Math.max(...s.hours) ? `${best}:00 a ${best + 1}:00` : 'todavía no hay datos'}</b></p></div>`;
  }
  const _rp = renderProfile;
  renderProfile = function () { const r = _rp.apply(this, arguments); if (currentTab === 'profile') { const p = $('v7Profile'); if (p) { let box = $('v8Stats'); if (!box) { box = document.createElement('div'); box.id = 'v8Stats'; p.appendChild(box); } box.innerHTML = statsHTML(); } } return r; };

  /* =====================================================================
     REGISTRO DE USO (para el panel del administrador)
  ===================================================================== */
  const usage = [];
  ['gamePlayed', 'duelPlayed', 'ludoPlayed', 'retoCreado'].forEach(t => V8.on(t, d => usage.push({ t, j: d.id || '' })));
  let answers = 0; V8.on('answer', () => answers++);
  async function flushUsage() {
    if (!V8.signed() || !supaReady()) return;
    const items = usage.splice(0, 40); if (answers) { items.push({ t: 'answers', j: String(answers) }); answers = 0; }
    items.push({ t: 'visita', j: '' });
    try { await rpc('registrar_uso', { p_items: items }); } catch (e) {}
  }
  setInterval(flushUsage, 90000); document.addEventListener('visibilitychange', () => { if (document.hidden) flushUsage(); });
  V8.on('signedIn', () => setTimeout(flushUsage, 3000));

  /* =====================================================================
     PANEL DEL ADMINISTRADOR (sección nueva debajo del panel actual)
  ===================================================================== */
  if (typeof renderAdmin === 'function') {
    const _ra = renderAdmin;
    renderAdmin = async function () {
      await _ra.apply(this, arguments);
      if (typeof isAdmin === 'undefined' || !isAdmin) return;
      const box = $('adminBox'); if (!box) return;
      const sec = document.createElement('div'); sec.id = 'v8Admin'; sec.className = 'space-y-4 mt-4'; box.appendChild(sec);
      sec.innerHTML = `<div class="v8-tabs">${[['est', '📈 Uso'], ['preg', '⭐ Preguntas'], ['rep', '🚩 Reportes'], ['avisos', '📢 Anuncio y mantenimiento'], ['resp', '💾 Respaldo']].map(([k, l]) => `<button onclick="V8.adm('${k}')" data-k="${k}">${l}</button>`).join('')}</div><div id="v8AdmBody" class="glass-card rounded-3xl p-4"></div>`;
      V8.adm('est');
    };
  }
  V8.adm = async k => {
    document.querySelectorAll('#v8Admin .v8-tabs button').forEach(b => b.classList.toggle('on', b.dataset.k === k));
    const b = $('v8AdmBody'); if (!b) return; b.innerHTML = '<p class="text-xs text-stone-400"><i class="fa-solid fa-spinner fa-spin"></i> Cargando…</p>';
    try {
      if (k === 'est') {
        const s = await rpc('admin_stats_v8');
        const dias = s.dias || [], juegos = s.juegos || [];
        b.innerHTML = `<div class="grid grid-cols-2 md:grid-cols-4 gap-3">${[['👥', 'Activos hoy', s.activos_hoy], ['📅', 'Activos (7 días)', s.activos_7], ['🔁', 'Vuelven (retención)', (s.retencion || 0) + '%'], ['🎮', 'Partidas (7 días)', s.partidas_7], ['⚔️', 'Duelos (7 días)', s.duelos_7], ['🎲', 'Ludo (7 días)', s.ludo_7], ['❓', 'Respuestas (7 días)', s.respuestas_7], ['📜', 'Retos creados', s.retos]].map(([i, l, v]) => `<div class="glass-card rounded-2xl p-3 text-center"><div class="text-2xl">${i}</div><div class="text-xl font-black text-amber-200">${v ?? 0}</div><div class="text-[11px] text-stone-400">${l}</div></div>`).join('')}</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"><div><p class="text-xs text-stone-400">Jugadores por día (14 días)</p>${bars(dias.map(d => d.n), dias.map(d => d.dia.slice(8)), '#60a5fa')}</div>
          <div><p class="text-xs text-stone-400">Juegos más jugados (7 días)</p>${juegos.length ? juegos.map(j => `<div class="flex items-center gap-2 text-xs my-1"><span class="w-28 truncate text-stone-300">${esc((GAMES.find(g => g.id === j.juego) || { name: j.juego }).name)}</span><span class="flex-grow h-2 bg-stone-950 rounded-full overflow-hidden"><i class="block h-full bg-amber-500" style="width:${j.n / juegos[0].n * 100}%"></i></span><b class="text-amber-200">${j.n}</b></div>`).join('') : '<p class="text-xs text-stone-500">Aún no hay datos.</p>'}</div></div>
          <p class="text-[11px] text-stone-500 mt-2">Retención = de quienes jugaron en los últimos 7 días, cuántos volvieron en 2 días distintos o más.</p>`;
      }
      if (k === 'preg') {
        const c = await loadSupabase(); const { data } = await c.from('preguntas_comunidad').select('*').order('id', { ascending: false }).limit(200);
        b.innerHTML = `<p class="text-xs text-stone-400">Estas preguntas aparecen en Trivia → «Preguntas de la comunidad». Así agregas preguntas sin tocar el código.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">${['Pregunta', 'Respuesta correcta', 'Respuesta incorrecta 1', 'Respuesta incorrecta 2', 'Respuesta incorrecta 3', 'Tema (opcional)'].map((l, i) => `<input id="aq${i}" maxlength="${i ? 120 : 300}" placeholder="${l}" class="bg-stone-950 border border-amber-700/50 rounded-lg px-3 py-2 text-sm text-stone-200 ${i === 0 ? 'md:col-span-2' : ''}">`).join('')}</div>
          <button class="btn-gold mt-2" onclick="V8.admAddQ()">➕ Agregar pregunta</button>
          <div class="mt-3 space-y-1.5">${(data || []).map(q => `<div class="v8-mission"><div class="flex-grow min-w-0"><b class="truncate">${esc(q.pregunta)}</b><small>✔ ${esc(q.correcta)} · ✖ ${esc(q.mal1)}, ${esc(q.mal2)}, ${esc(q.mal3)}</small></div><button class="v8-chip ${q.activa ? 'on' : ''}" onclick="V8.admToggleQ(${q.id}, ${!q.activa})">${q.activa ? 'Activa' : 'Oculta'}</button><button class="v8-chip" onclick="V8.admDelQ(${q.id})">🗑️</button></div>`).join('') || '<p class="text-xs text-stone-500">Aún no agregas preguntas.</p>'}</div>`;
      }
      if (k === 'rep') {
        const c = await loadSupabase(); const { data } = await c.from('reportes').select('*').order('creado', { ascending: false }).limit(100);
        b.innerHTML = (data || []).length ? data.map(r => `<div class="v8-mission ${r.resuelto ? 'got' : ''}"><div class="flex-grow min-w-0"><b>${esc(r.pregunta)}</b><small>Respuesta: ${esc(r.respuesta || '')} · Motivo: ${esc(r.motivo || '')}${r.comentario ? ' · «' + esc(r.comentario) + '»' : ''} · ${new Date(r.creado).toLocaleDateString('es-PE')}</small></div>${r.resuelto ? '✔' : `<button class="btn-ghost !py-1 !px-2 !text-[10px]" onclick="V8.admSolve(${r.id})">Marcar resuelto</button>`}</div>`).join('') : '<p class="text-xs text-stone-400">No hay reportes. ¡Las preguntas están bien!</p>';
      }
      if (k === 'avisos') {
        const cfg = await getConfig(true);
        const m = cfg.mantenimiento || {}, a = cfg.anuncio || {};
        b.innerHTML = `<div class="space-y-3"><div><p class="font-bold text-amber-300 text-sm">📢 Anuncio para todos</p><p class="text-[11px] text-stone-400">Aparece una vez en la portada de cada jugador. Déjalo vacío para no mostrar nada.</p><input id="anTxt" maxlength="200" value="${esc(a.texto || '')}" placeholder="¡Nuevo evento este fin de semana!" class="w-full bg-stone-950 border border-amber-700/50 rounded-lg px-3 py-2 text-sm text-stone-200 mt-1"><button class="btn-gold mt-2 !text-xs" onclick="V8.admAnuncio()">Publicar anuncio</button></div>
          <div class="border-t border-amber-900/40 pt-3"><p class="font-bold text-amber-300 text-sm">🔧 Modo mantenimiento</p><p class="text-[11px] text-stone-400">Mientras esté activo, los jugadores ven «Hogwarts está en reparación». Tú (administrador) sí puedes entrar.</p><input id="mtTxt" maxlength="200" value="${esc(m.texto || 'Estamos mejorando el castillo. Vuelve en un ratito.')}" class="w-full bg-stone-950 border border-amber-700/50 rounded-lg px-3 py-2 text-sm text-stone-200 mt-1"><button class="${m.activo ? 'btn-ghost' : 'btn-gold'} mt-2 !text-xs" onclick="V8.admMant(${!m.activo})">${m.activo ? '✅ Desactivar mantenimiento' : '🔧 Activar mantenimiento'}</button> <span class="text-xs ${m.activo ? 'text-red-300' : 'text-emerald-300'}">${m.activo ? 'ACTIVO ahora' : 'Inactivo'}</span></div></div>`;
      }
      if (k === 'resp') b.innerHTML = `<p class="text-sm text-stone-300">Descarga el progreso de todos los jugadores en un archivo que se abre con Excel.</p><button class="btn-gold mt-2" onclick="V8.admBackup()">💾 Descargar respaldo (Excel)</button><p id="bkMsg" class="text-xs text-stone-400 mt-2"></p>`;
    } catch (e) { b.innerHTML = `<p class="text-sm text-red-300">No se pudo cargar. ¿Ejecutaste <b>supabase-v8.sql</b> en Supabase? (${esc(e.message || '')})</p>`; }
  };
  V8.admAddQ = async () => { const v = [0, 1, 2, 3, 4, 5].map(i => (($('aq' + i) || {}).value || '').trim()); if (v.slice(0, 5).some(x => !x)) return toast('Completa la pregunta y las 4 respuestas.', '✍️'); try { const c = await loadSupabase(); const { error } = await c.from('preguntas_comunidad').insert({ pregunta: v[0], correcta: v[1], mal1: v[2], mal2: v[3], mal3: v[4], tema: v[5] || null }); if (error) throw error; toast('Pregunta agregada.', '⭐'); V8.adm('preg'); } catch (e) { toast('No se pudo guardar: ' + (e.message || ''), '⚠️'); } };
  V8.admToggleQ = async (id, on) => { const c = await loadSupabase(); await c.from('preguntas_comunidad').update({ activa: on }).eq('id', id); V8.adm('preg'); };
  V8.admDelQ = async id => { if (!confirm('¿Borrar esta pregunta?')) return; const c = await loadSupabase(); await c.from('preguntas_comunidad').delete().eq('id', id); V8.adm('preg'); };
  V8.admSolve = async id => { const c = await loadSupabase(); await c.from('reportes').update({ resuelto: true }).eq('id', id); V8.adm('rep'); };
  V8.admAnuncio = async () => { const t = (($('anTxt') || {}).value || '').trim(); await setConfig('anuncio', { texto: t, id: Date.now() }); toast(t ? 'Anuncio publicado.' : 'Anuncio quitado.', '📢'); };
  V8.admMant = async on => { await setConfig('mantenimiento', { activo: on, texto: (($('mtTxt') || {}).value || '').trim() }); toast(on ? 'Mantenimiento activado.' : 'Mantenimiento desactivado.', '🔧'); V8.adm('avisos'); };
  V8.admBackup = async () => {
    const m = $('bkMsg'); if (m) m.textContent = 'Preparando…';
    try {
      const rows = await rpc('admin_respaldo') || [];
      const cols = ['correo', 'nombre', 'casa', 'xp', 'puntos', 'galeones', 'logros', 'duelos_ganados', 'actualizado'];
      const csv = '﻿' + [cols.join(';'), ...rows.map(r => cols.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(';'))].join('\r\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = `respaldo-hogwarts-${V8.day()}.csv`; a.click();
      if (m) m.textContent = `Listo: ${rows.length} jugadores. El archivo se abre con Excel.`;
    } catch (e) { if (m) m.textContent = 'No se pudo: ' + (e.message || ''); }
  };

  /* ---------- configuración global: mantenimiento y anuncio ---------- */
  let cfgCache = null;
  async function getConfig(force) { if (cfgCache && !force) return cfgCache; try { const c = await loadSupabase(); const { data } = await c.from('config_juego').select('clave,valor'); cfgCache = Object.fromEntries((data || []).map(r => [r.clave, r.valor])); } catch (e) { cfgCache = {}; } return cfgCache; }
  async function setConfig(k, v) { const c = await loadSupabase(); const { error } = await c.from('config_juego').upsert({ clave: k, valor: v }); if (error) throw error; cfgCache = null; }
  async function checkConfig() {
    if (!supaReady()) return; const cfg = await getConfig(true), m = cfg.mantenimiento, a = cfg.anuncio;
    let admin = false; try { admin = V8.signed() && !!(await rpc('es_admin')); } catch (e) {}
    if (m && m.activo && !admin && !$('v8Maint')) document.body.insertAdjacentHTML('beforeend', `<div id="v8Maint" class="v8-maint"><div><div class="text-6xl">🔧</div><h2>Hogwarts está en reparación</h2><p>${esc(m.texto || 'Vuelve en un ratito.')}</p><button class="btn-gold mt-3" onclick="location.reload()">Volver a intentar</button></div></div>`);
    if (m && !m.activo && $('v8Maint')) $('v8Maint').remove();
    if (a && a.texto && st().seenAnnounce !== a.id) { const home = $('tab-home'); if (home && !$('v8Ann')) home.insertAdjacentHTML('afterbegin', `<div id="v8Ann" class="v8-ann"><span>📢</span><p>${esc(a.texto)}</p><button onclick="V8.st().seenAnnounce=${Number(a.id) || 0};save();this.parentElement.remove()" aria-label="Cerrar">✕</button></div>`); }
  }
  setTimeout(checkConfig, 2500); setInterval(checkConfig, 300000);

  /* =====================================================================
     NOVEDADES DE LA VERSIÓN 8
  ===================================================================== */
  V8.news = force => {
    if (!force && (st().seenNews === V8.version || !S.house)) return;
    const dlg = $('dialog');
    if (!force && ($('v7Tut') || $('v8Sheet') || currentTab !== 'home' || activeGame || (dlg && !dlg.classList.contains('hidden')))) { V8._newsTry = (V8._newsTry || 0) + 1; if (V8._newsTry < 20) setTimeout(() => V8.news(), 4000); return; }
    st().seenNews = V8.version; save();
    showDialog({ icon: '✨', title: '¡Novedades de Hogwarts 8!', body: `<ul class="text-left text-sm space-y-1.5">
      <li>🎲 <b>Ludo Mágico</b> en línea con amigos (2, 3 o 4 jugadores).</li>
      <li>🏰 <b>Mapa del castillo</b> con escaleras que cambian, fantasmas y la Sala de los Menesteres.</li>
      <li>🐸 <b>Cromos de ranas de chocolate</b>, misiones diarias y premio por entrar cada día.</li>
      <li>🎮 <b>15 juegos nuevos</b>: Quidditch 3D, Snap, Laberinto, Bosque Prohibido, Lago Negro y más.</li>
      <li>🧙 <b>Tu avatar</b>, tu sala común, libro de hechizos, bestiario y el diario de Tom Riddle.</li>
      <li>⚔️ <b>Reta a un amigo</b> aunque no estén conectados al mismo tiempo.</li></ul>`, actions: [{ label: '¡A explorar!', primary: true }] });
  };

  /* =====================================================================
     ESTADOS VACÍOS MÁS AMIGABLES
  ===================================================================== */
  if (typeof renderFriends === 'function') {
    const _rf = renderFriends;
    renderFriends = async function () { const r = await _rf.apply(this, arguments); const box = $('friendsBox'); if (box && V8.signed() && !(S.friends || []).length && !box.querySelector('.v8-empty')) box.insertAdjacentHTML('beforeend', '<div class="v8-empty"><span>🦉</span><p>Aún no tienes amigos agregados. Comparte tu código por WhatsApp y agrégalos con el suyo: podrán enviarse cartas y retarse.</p></div>'); return r; };
  }

  /* =====================================================================
     ARRANQUE
  ===================================================================== */
  const _sw = switchTab;
  switchTab = function (tab) {
    const r = _sw(tab);
    roomMusic();
    if (tab === 'home') setTimeout(hallButtons, 200); else if (ext.on) { /* se pausa solo */ }
    if (tab === 'duel') setTimeout(() => { duel3D(); addReportButtons(); }, 250);
    if (tab === 'movies') triviaCommunityCard();
    if (tab === 'home' && ext.on && ext.wake) ext.wake();
    return r;
  };
  const _sq = startQuiz; startQuiz = function () { const r = _sq.apply(this, arguments); addReportButtons(); return r; };
  applyA11y(); setTimeout(hallButtons, 900);
  if (opt().lang === 'en') setTimeout(() => V8.setLang('en'), 1500);
  V8.on('signedIn', () => setTimeout(() => V8.news(), 2500));
  Object.assign(ACH, { v8cine: ['🎬', 'Noche de cine', 'Usa el modo cine del Gran Salón'] });
})();
