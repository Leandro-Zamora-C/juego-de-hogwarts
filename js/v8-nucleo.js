/* =====================================================================
   HOGWARTS · VERSIÓN 8 · NÚCLEO
   Estado nuevo, eventos para misiones, registro de juegos nuevos (se
   cargan solo al abrirlos), Sala de Juegos ordenada, tutorial por juego,
   ventanas y utilidades que usan los demás archivos v8.
===================================================================== */
(() => {
  const V8 = window.V8 = window.V8 || {};
  const V = window.V7 || {};
  V8.version = '8.0';

  /* ---------- estado ---------- */
  V8.st = () => {
    S.v8 = Object.assign({ frogs: 1, cards: {}, missions: null, daily: { last: '', streak: 0 }, avatar: null, room: {}, owned: [], effect: '', spells: [], beasts: [], riddle: { read: [] }, medals: {}, deposits: [], plant: null, stats: { movie: {}, hours: Array(24).fill(0), days: {} }, castle: {}, tut: {}, seenNews: '', titles: [], best: {} }, S.v8 || {});
    return S.v8;
  };
  V8.st();

  /* ---------- utilidades ---------- */
  V8.day = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  V8.week = (d = new Date()) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return t.getUTCFullYear() + '-S' + Math.ceil(((t - y) / 86400000 + 1) / 7); };
  V8.rng = seed => { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  V8.seedOf = str => hash(String(str));
  V8.pick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];
  V8.shuffle = (arr, r = Math.random) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  V8.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  V8.gold = (n, why) => { S.gold = Math.max(0, (S.gold || 0) + n); save(); updateWallet(); if (why) toast(`${why}: ${n > 0 ? '+' : ''}${n} galeones`, '🪙'); };
  V8.reduced = () => typeof reduceMotion !== 'undefined' && reduceMotion;
  V8.low = () => V.quality ? V.quality() === 'low' : false;
  V8.signed = () => !!(typeof cloud !== 'undefined' && cloud.user);
  V8.name = () => (S.student || S.rankName || (typeof myName === 'function' && myName()) || 'Mago').slice(0, 20);
  V8.houseColor = h => ({ Gryffindor: '#b91c1c', Slytherin: '#047857', Ravenclaw: '#1d4ed8', Hufflepuff: '#ca8a04' })[h] || '#a16207';

  /* ---------- eventos (misiones, estadísticas, logros) ---------- */
  const subs = {};
  V8.on = (type, fn) => { (subs[type] = subs[type] || []).push(fn); };
  V8.emit = (type, data = {}) => { (subs[type] || []).concat(subs['*'] || []).forEach(fn => { try { fn(data, type); } catch (e) { console.warn('v8', type, e); } }); };

  // trivia: cada respuesta
  const _check = checkAnswer;
  checkAnswer = function (idx) {
    const q = typeof quiz !== 'undefined' && quiz && !quiz.answered ? quiz.list[quiz.i] : null;
    const movieId = q ? quiz.movieId : null;
    const r = _check(idx);
    if (q) { const ok = idx >= 0 && q.opts[idx] === q.a; V8.emit('answer', { ok, q, movieId, source: 'trivia' }); }
    return r;
  };
  // duelo local
  const _ansDuel = answerDuel;
  answerDuel = function (idx) {
    const human = typeof isHumanTurn === 'function' ? isHumanTurn() : true, q = duel.q, before = duel.locked;
    const r = _ansDuel(idx);
    if (!before && q && human && duel.mode !== '2p') V8.emit('answer', { ok: idx >= 0 && q.opts[idx] === q.a, q, source: 'duel' });
    return r;
  };
  // historial de duelos -> victorias
  if (V.addHistory) { const _ah = V.addHistory; V.addHistory = (icon, text, result, gold) => { _ah(icon, text, result, gold); if (/^Ganaste/.test(result)) V8.emit('duelWin', { online: /línea/.test(text) }); V8.emit('duelPlayed', {}); }; }
  // juegos jugados y puntos de minijuegos
  const _reward = gameReward;
  gameReward = function (points, label) { const r = _reward(points, label); V8.emit('gameScore', { id: activeGame, points }); return r; };
  if (typeof answerDaily === 'function') { const _ad = answerDaily; answerDaily = function () { const r = _ad.apply(this, arguments); V8.emit('daily', {}); return r; }; }
  if (typeof onSignedIn === 'function') { const _os = onSignedIn; onSignedIn = async function (u) { const r = await _os.apply(this, arguments); V8.emit('signedIn', {}); return r; }; }
  if (typeof feedPet === 'function') { const _fp = feedPet; feedPet = function () { const r = _fp(); V8.emit('pet', {}); return r; }; }
  if (typeof playPet === 'function') { const _pp = playPet; playPet = function () { const r = _pp(); V8.emit('pet', {}); return r; }; }
  if (typeof summonPatronus === 'function') { const _sp = summonPatronus; summonPatronus = function () { const r = _sp(); V8.emit('spell', { name: 'Expecto Patronum' }); return r; }; }

  /* =====================================================================
     VENTANA GRANDE (para colecciones, mapa, etc.)
  ===================================================================== */
  V8.sheet = (title, html, opts = {}) => {
    V8.closeSheet();
    const el = document.createElement('div'); el.id = 'v8Sheet'; el.className = 'v8-sheet'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.innerHTML = `<div class="v8-sheet-box ${opts.wide ? 'wide' : ''}"><div class="v8-sheet-head"><h3>${title}</h3><button onclick="V8.closeSheet()" aria-label="Cerrar">✕</button></div><div class="v8-sheet-body" id="v8SheetBody">${html}</div></div>`;
    el.addEventListener('click', e => { if (e.target === el) V8.closeSheet(); });
    document.body.appendChild(el); document.body.style.overflow = 'hidden'; sfx('tick');
    return $('v8SheetBody');
  };
  V8.closeSheet = () => { const el = $('v8Sheet'); if (el) { el.remove(); document.body.style.overflow = ''; if (V8._sheetClose) { const f = V8._sheetClose; V8._sheetClose = null; f(); } } };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('v8Sheet')) V8.closeSheet(); });

  /* =====================================================================
     REGISTRO DE JUEGOS NUEVOS (se cargan al abrirlos)
  ===================================================================== */
  V8.games = {};
  V8.reg = def => {
    V8.games[def.id] = Object.assign(V8.games[def.id] || {}, def);
    if (!GAMES.find(g => g.id === def.id)) GAMES.push({ id: def.id, name: def.name, icon: def.icon, desc: def.desc, g: def.g || ['#3b0764', '#0c0a09'], tag: def.tag });
  };
  V8.impl = (id, impl) => { V8.games[id] = Object.assign(V8.games[id] || {}, impl); };
  const loaded = {};
  V8.load = file => loaded[file] || (loaded[file] = loadScript(file + '?v=' + V8.version).catch(e => { delete loaded[file]; throw e; }));

  const MAIN = ['chess', 'ludo', 'memory'];
  const ORDER = ['chess', 'ludo', 'memory', 'q3d', 'broom', 'snitch', 'mixta', 'snap', 'laberinto', 'dcao', 'bosque', 'lago', 'gobstones', 'ritmo', 'vuelo', 'caldero', 'herbologia', 'retrato', 'escape2', 'adivinacion', 'school', 'quidditch', 'map', 'potions', 'guess', 'hangman', 'escape'];
  const sortGames = () => GAMES.sort((a, b) => { const ia = ORDER.indexOf(a.id), ib = ORDER.indexOf(b.id); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });

  const _open = openGame; // ya protegido por la cuenta (v7)
  openGame = function (id) {
    if (V.guardPlay && V.guardPlay()) return;
    const def = V8.games[id];
    V8.emit('gamePlayed', { id });
    if (!def) { const r = _open(id); V8.howto(id); return r; }
    stopAllGames(); activeGame = id;
    const g = GAMES.find(x => x.id === id);
    $('gamesHubWrap').classList.add('hidden'); $('gameStage').classList.remove('hidden');
    $('gameTitle').textContent = `${g.icon} ${g.name}`; $('gameBest').textContent = bestText(id);
    $('gameBody').innerHTML = '<div class="text-center py-16 text-stone-400"><i class="fa-solid fa-wand-sparkles fa-spin"></i> Preparando la magia…</div>';
    window.scrollTo({ top: 0, behavior: V8.reduced() ? 'auto' : 'smooth' });
    const go = () => { if (activeGame !== id) return; try { V8.games[id].init($('gameBody')); } catch (e) { console.error(e); $('gameBody').innerHTML = `<p class="text-center text-red-300 py-10">No se pudo abrir el juego. Recarga la página.</p>`; } V8.howto(id); };
    if (def.init) go(); else V8.load(def.file).then(go).catch(() => { $('gameBody').innerHTML = '<p class="text-center text-red-300 py-10">No se pudo cargar el juego. Revisa tu internet y vuelve a intentarlo.</p>'; });
  };
  const _stop = stopAllGames;
  stopAllGames = function () { _stop(); Object.values(V8.games).forEach(g => { if (g.stop && g._on) { try { g.stop(); } catch (e) {} g._on = false; } }); };
  V8.started = id => { if (V8.games[id]) V8.games[id]._on = true; };
  const _best = bestText;
  bestText = function (id) { const b = V8.st().best[id]; const def = V8.games[id]; if (def) return def.best ? def.best(b) : (b ? `Récord: ${b}` : ''); return _best(id); };
  V8.record = (id, v, higher = true) => { const s = V8.st(); const o = s.best[id]; if (o == null || (higher ? v > o : v < o)) { s.best[id] = v; save(); refreshBest(); return true; } return false; };

  renderGamesHub = function () {
    if (activeGame) return;
    sortGames();
    const card = g => `<button onclick="openGame('${g.id}')" class="glass-card hoverable rounded-2xl overflow-hidden text-left flex flex-col v8-gamecard">
      <div class="h-24 flex items-center justify-center text-5xl relative" style="background: radial-gradient(circle at 50% 120%, rgb(var(--amber-500) / .25), transparent 60%), linear-gradient(150deg, ${g.g[0]}, ${g.g[1]})">
        ${V8.ph('juegos', g.id)}<span class="drop-shadow-lg relative">${g.icon}</span>
        ${V8.games[g.id] && !V8.st().tut[g.id] ? '<span class="v8-new">NUEVO</span>' : ''}
        ${bestText(g.id) ? `<span class="absolute top-2 right-2 text-[9px] font-bold bg-stone-950/80 text-amber-200 px-2 py-0.5 rounded-full">${bestText(g.id)}</span>` : ''}
      </div>
      <div class="p-3 space-y-1"><h3 class="font-wizard font-bold text-amber-300 text-sm">${g.name}</h3><p class="text-[11px] text-stone-400 leading-snug">${g.desc}</p></div></button>`;
    const main = GAMES.filter(g => MAIN.includes(g.id)), rest = GAMES.filter(g => !MAIN.includes(g.id));
    $('gamesHub').innerHTML = `<div class="col-span-full v8-hubhead">⭐ Principales · se juegan en línea con amigos</div>${main.map(g => card(g).replace('v8-gamecard', 'v8-gamecard v8-main')).join('')}
      <div class="col-span-full v8-hubhead">🎮 Más juegos mágicos <span>${rest.length}</span></div>${rest.map(card).join('')}`;
  };

  /* =====================================================================
     CÓMO SE JUEGA (la primera vez que abres cada juego)
  ===================================================================== */
  V8.HOWTO = {
    chess: ['Toca una pieza tuya y luego la casilla a donde quieres moverla.', 'Arrastra el tablero para girarlo.', 'Puedes jugar contra la IA o en línea con un amigo.'],
    memory: ['Voltea dos cartas por turno.', 'Si son iguales, se quedan descubiertas.', 'Encuentra todas las parejas con la menor cantidad de jugadas.'],
    broom: ['Toca la pantalla o la barra espaciadora para subir.', 'Esquiva las torres y atrapa snitches.'],
    snitch: ['Toca la snitch dorada para atraparla.', 'Si tocas una bludger pierdes 3 segundos.'],
    quidditch: ['Responde preguntas para anotar con la quaffle.', 'Atrapa la snitch para ganar 150 puntos.'],
    map: ['Activa el mapa y encuentra al personaje escondido por los pasillos.'],
    potions: ['Echa los ingredientes al caldero en el orden de la receta.'],
    guess: ['Las pistas aparecen de a una. Si adivinas con menos pistas, ganas más puntos.'],
    hangman: ['Adivina la palabra letra por letra antes de que llegue el dementor.'],
    school: ['Toma las 3 clases de cada año y aprueba el examen final para pasar de año.'],
    escape: ['Resuelve los acertijos de la Cámara antes de que se acabe el tiempo.']
  };
  V8.howto = (id, force) => {
    const s = V8.st(); if (!force && s.tut[id]) return;
    s.tut[id] = 1; save();
    const steps = (V8.games[id] && V8.games[id].howto) || V8.HOWTO[id]; if (!steps) return;
    const g = GAMES.find(x => x.id === id) || {};
    setTimeout(() => showDialog({ icon: g.icon || '🎮', title: `Cómo se juega: ${g.name || ''}`, body: `<ol class="text-left text-sm space-y-1.5 list-decimal pl-5">${steps.map(t => `<li>${t}</li>`).join('')}</ol>`, actions: [{ label: '¡A jugar!', primary: true }] }), 350);
  };

  /* ---------- tus imágenes (opcionales) ----------
     Si guardas una imagen en img/<carpeta>/<nombre>.jpg (o .png), se muestra
     encima del dibujo. Si no existe, se sigue viendo el dibujo. */
  V8.ph = (folder, id, cls = '') => `<img class="v8-ph ${cls}" src="img/${folder}/${id}.jpg" alt="" loading="lazy" decoding="async" onerror="if(!this.dataset.p){this.dataset.p=1;this.src=this.src.replace(/\\.jpg$/,'.png')}else{this.remove()}">`;

  /* ---------- dibujo de iconos simples en SVG ---------- */
  V8.svgStar = (c = '#fcd34d', s = 14) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path fill="${c}" d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z"/></svg>`;

  /* ---------- registros de juegos nuevos (los detalles están en otros archivos) ---------- */
  V8.reg({ id: 'ludo', name: 'Ludo Mágico', icon: '🎲', desc: 'Ludo de las cuatro casas para 2, 3 o 4 jugadores: contra la IA, en el mismo celular o en línea con amigos.', g: ['#7f1d1d', '#1e3a8a'], file: 'js/v8-ludo.js' });
  const J = 'js/v8-juegos.js';
  [
    ['q3d', 'Quidditch 3D', '🏟️', 'Lanza la quaffle por los aros en un estadio 3D y vence al guardián.', ['#14532d', '#0c0a09']],
    ['mixta', 'Trivia Mixta', '🧩', 'Preguntas con imagen, verdadero o falso, ordenar sucesos y ¿quién lo dijo?', ['#4c1d95', '#0c0a09']],
    ['snap', 'Snap Explosivo', '💥', 'Toca ¡SNAP! cuando salgan dos cartas iguales, antes que la IA o tu amigo.', ['#9a3412', '#1c1917']],
    ['laberinto', 'Laberinto del Torneo', '🌿', 'Encuentra la Copa en el laberinto antes de que te alcancen los escregutos.', ['#14532d', '#022c22']],
    ['dcao', 'Defensa Contra las Artes Oscuras', '🛡️', 'Desliza el dedo con el gesto correcto para vencer a cada criatura.', ['#312e81', '#0c0a09']],
    ['bosque', 'Bosque Prohibido', '🌲', 'Explora de noche con Lumos y descubre criaturas para tu bestiario.', ['#052e16', '#000000']],
    ['lago', 'Lago Negro', '🌊', 'Bucea con branquialgas, esquiva grindylows y rescata a tu amigo.', ['#0c4a6e', '#020617']],
    ['gobstones', 'Gobstones', '🔮', 'Juego de canicas mágicas: apunta y lánzalas al círculo contra la IA.', ['#581c87', '#1c1917']],
    ['ritmo', 'Encantamientos al Ritmo', '🎵', 'Toca en el momento justo para que el hechizo salga perfecto.', ['#831843', '#1c1917']],
    ['vuelo', 'Clase de Vuelo', '🧹', 'Pasa por los aros con tu escoba y gana medallas por tiempo.', ['#0e7490', '#0c0a09']],
    ['caldero', 'Pociones Avanzadas', '⚗️', 'Echa ingredientes, revuelve y controla el fuego del caldero.', ['#065f46', '#1c1917']],
    ['herbologia', 'Herbología', '🌱', 'Cuida tu planta mágica cada día y cosecha una mandrágora (¡con orejeras!).', ['#3f6212', '#1c1917']],
    ['retrato', 'Adivina el Retrato', '🖼️', 'El retrato se revela por partes: adivina el personaje cuanto antes.', ['#78350f', '#1c1917']],
    ['escape2', 'Escape del Mes', '🗝️', 'Un capítulo nuevo de escape cada mes con acertijos y candados.', ['#1e293b', '#020617']],
    ['adivinacion', 'Adivinación', '🔮', 'Hojas de té, bola de cristal y cartas: tu predicción mágica del día.', ['#6b21a8', '#1e1b4b']]
  ].forEach(([id, name, icon, desc, g]) => V8.reg({ id, name, icon, desc, g, file: J }));

  /* ---------- juegos nuevos que se juegan en línea (misma partida, gana el mejor puntaje) ---------- */
  V8.ONLINE_GAMES = ['q3d', 'mixta', 'snap', 'laberinto', 'dcao', 'bosque', 'lago', 'gobstones', 'ritmo', 'vuelo', 'caldero', 'retrato', 'escape2'];
  if (typeof GR_INFO !== 'undefined') {
    V8.ONLINE_GAMES.forEach(id => { const g = GAMES.find(x => x.id === id); GR_INFO[id] = { title: `${g ? g.name : id} en línea`, desc: 'Los dos juegan la misma partida al mismo tiempo, cada uno en su celular. Gana quien saque más puntos.' }; });
    // pestañas «solo / en línea» para cualquier juego
    const _tabs = grModeTabs;
    grModeTabs = function (game, online) { if (['chess', 'broom', 'snitch', 'memory'].includes(game)) return _tabs(game, online); return `<div class="flex justify-center gap-2 mb-1"><button onclick="grSetMode('${game}',false)" class="${online ? 'btn-ghost' : 'btn-gold'} !py-1.5 !px-3 !text-xs">🎮 Jugar solo</button><button onclick="grSetMode('${game}',true)" class="${online ? 'btn-gold' : 'btn-ghost'} !py-1.5 !px-3 !text-xs">🌐 Contra un amigo</button></div>`; };
    // antes de jugar en línea hay que cargar el archivo del juego
    const _gsm = grSetMode;
    grSetMode = function (game, online) { if (online && V8.games[game] && !V8.games[game].init) return V8.load(V8.games[game].file).then(() => _gsm(game, online)); return _gsm(game, online); };
    // los enlaces de invitación (?juego=...&sala=...) de los juegos nuevos
    try { const g = new URLSearchParams(location.search).get('juego'); if (g && V8.ONLINE_GAMES.includes(g) && typeof handleGameLink === 'function') handleGameLink(); } catch (e) {}
  }
  Object.assign(V8.games.ludo || {}, {});

  // Las preguntas del duelo (v7) se usan en varios juegos nuevos
  V8.pool = () => (V.POOL && V.POOL.length ? V.POOL : ALL_Q);
  V8.loadPool = () => (V.loadDuelQ ? V.loadDuelQ() : Promise.resolve(ALL_Q));
})();
