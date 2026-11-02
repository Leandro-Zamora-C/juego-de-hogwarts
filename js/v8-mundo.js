/* =====================================================================
   HOGWARTS · VERSIÓN 8 · EL MUNDO MÁGICO
   Mapa del castillo navegable, escaleras que cambian (premio diario
   escondido), Sala de los Menesteres, retratos que hablan, fantasmas,
   clima mágico, lechucería (cartas a amigos), eventos por fecha y
   mascota que crece.
===================================================================== */
(() => {
  const V8 = window.V8, st = V8.st;
  const today = () => V8.day();
  const rngToday = salt => V8.rng(V8.seedOf(today() + salt + (S.playerId || '')));

  /* =====================================================================
     CLIMA DEL DÍA
  ===================================================================== */
  V8.weather = () => {
    const m = new Date().getMonth() + 1, r = rngToday('clima')();
    if (m === 12 || m <= 2) return r < .55 ? 'nieve' : r < .75 ? 'niebla' : 'despejado';
    if (m >= 9 && m <= 11) return r < .35 ? 'lluvia' : r < .55 ? 'niebla' : r < .65 ? 'tormenta' : 'despejado';
    return r < .25 ? 'lluvia' : r < .35 ? 'tormenta' : r < .45 ? 'niebla' : 'despejado';
  };
  const W_TXT = { nieve: '❄️ Nieva sobre Hogwarts', lluvia: '🌧️ Llueve en el castillo', tormenta: '⛈️ Tormenta sobre el lago', niebla: '🌫️ Niebla en los terrenos', despejado: '✨ Noche despejada' };
  function weatherLayer(host) {
    if (!host || host.querySelector('.v8-weather') || V8.reduced() || V8.low()) return;
    const w = V8.weather(); if (w === 'despejado') return;
    const cv = document.createElement('canvas'); cv.className = 'v8-weather'; host.appendChild(cv); const x = cv.getContext('2d'), P = [];
    let flash = 0;
    const loop = () => {
      if (!cv.isConnected) return; requestAnimationFrame(loop);
      if (document.hidden || host.offsetParent === null) return;
      const Wd = cv.clientWidth, H = cv.clientHeight; if (cv.width !== Wd || cv.height !== H) { cv.width = Wd; cv.height = H; }
      x.clearRect(0, 0, Wd, H);
      if (w === 'niebla') { const t = performance.now() / 4000; for (let i = 0; i < 4; i++) { const gx = ((t * 30 * (i + 1)) % (Wd + 400)) - 200, g = x.createRadialGradient(gx, H * (.4 + i * .15), 10, gx, H * (.4 + i * .15), 220); g.addColorStop(0, 'rgba(220,220,235,.22)'); g.addColorStop(1, 'rgba(220,220,235,0)'); x.fillStyle = g; x.fillRect(0, 0, Wd, H); } return; }
      const n = w === 'nieve' ? 70 : 120;
      while (P.length < n) P.push({ x: Math.random() * Wd, y: Math.random() * -H, v: w === 'nieve' ? .6 + Math.random() : 6 + Math.random() * 5, s: Math.random() });
      x.strokeStyle = 'rgba(190,210,255,.45)'; x.fillStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 1;
      P.forEach(p => { p.y += p.v; p.x += w === 'nieve' ? Math.sin(p.y / 30 + p.s * 6) * .5 : -1.2; if (p.y > H) { p.y = -10; p.x = Math.random() * Wd; }
        if (w === 'nieve') { x.beginPath(); x.arc(p.x, p.y, 1 + p.s * 2, 0, 7); x.fill(); } else { x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x - 2, p.y + 10); x.stroke(); } });
      if (w === 'tormenta') { if (flash > 0) { x.fillStyle = `rgba(230,235,255,${flash})`; x.fillRect(0, 0, Wd, H); flash -= .05; } else if (Math.random() < .004) flash = .5; }
    };
    loop();
  }
  V8.weatherLayer = weatherLayer;

  /* =====================================================================
     MAPA DEL CASTILLO
  ===================================================================== */
  const PLACES = [
    { id: 'salon', n: 'Gran Salón', e: '🍽️', x: 500, y: 300, go: () => switchTab('home'), d: 'Trivia y el banquete de cada día.' },
    { id: 'biblio', n: 'Biblioteca', e: '📚', x: 600, y: 230, go: () => switchTab('library'), d: 'Libros de personajes, criaturas e historia.' },
    { id: 'mazmorras', n: 'Mazmorras', e: '⚗️', x: 430, y: 380, go: () => openG('caldero'), d: 'Clase de Pociones Avanzadas.' },
    { id: 'astronomia', n: 'Torre de Astronomía', e: '🔭', x: 470, y: 120, go: () => openG('adivinacion'), d: 'Lee las estrellas y tu futuro.' },
    { id: 'dcao', n: 'Aula de Defensa', e: '🛡️', x: 560, y: 160, go: () => openG('dcao'), d: 'Vence a boggarts y criaturas oscuras.' },
    { id: 'sala', n: 'Sala común', e: '🛋️', x: 380, y: 200, go: () => V8.goCol('sala'), d: 'Tu sala decorada.' },
    { id: 'lechuceria', n: 'Lechucería', e: '🦉', x: 300, y: 150, go: () => V8.owlery(), d: 'Envía cartas a tus amigos.' },
    { id: 'retratos', n: 'Galería de retratos', e: '🖼️', x: 650, y: 330, go: () => V8.portraits(), d: 'Los cuadros te dan pistas y retos.' },
    { id: 'invernaderos', n: 'Invernaderos', e: '🌱', x: 220, y: 360, go: () => openG('herbologia'), d: 'Herbología: cuida tu planta.' },
    { id: 'lago', n: 'Lago Negro', e: '🌊', x: 200, y: 520, go: () => openG('lago'), d: 'Bucea con branquialgas.' },
    { id: 'bosque', n: 'Bosque Prohibido', e: '🌲', x: 830, y: 470, go: () => openG('bosque'), d: 'Busca criaturas con Lumos.' },
    { id: 'quidditch', n: 'Campo de Quidditch', e: '🏟️', x: 820, y: 170, go: () => openG('q3d'), d: 'Quidditch 3D y clase de vuelo.' },
    { id: 'laberinto', n: 'Laberinto del Torneo', e: '🌿', x: 700, y: 560, go: () => openG('laberinto'), d: 'Encuentra la Copa.' },
    { id: 'cabana', n: 'Cabaña de Hagrid', e: '🛖', x: 660, y: 450, go: () => V8.goCol('bestiario'), d: 'Hagrid te muestra tu bestiario.' },
    { id: 'menesteres', n: 'Sala de los Menesteres', e: '🚪', x: 520, y: 210, go: () => V8.roomOfReq(), d: 'Solo aparece cuando completas las misiones del día.', hidden: true }
  ];
  const openG = id => { switchTab('games'); setTimeout(() => openGame(id), 120); };
  const stairsRoom = () => V8.pick(PLACES.filter(p => !p.hidden), rngToday('escalera')).id;
  const reqOpen = () => { const M = V8.missions && V8.missions(); return !!(M && M.list.every(m => m.got)); };
  function mapSVG() {
    const s = st(), w = V8.weather(), stair = stairsRoom(), gotStair = s.castle.stair === today();
    return `<svg viewBox="0 0 1000 680" class="v8-map" role="img" aria-label="Mapa de Hogwarts">
      <defs><linearGradient id="mSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1030"/><stop offset=".55" stop-color="#2a1e4a"/><stop offset="1" stop-color="#1b2a1a"/></linearGradient>
        <radialGradient id="mLake" cx=".5" cy=".4"><stop offset="0" stop-color="#1e3a8a"/><stop offset="1" stop-color="#0b1a3f"/></radialGradient>
        <clipPath id="mPin"><circle r="22"/></clipPath><linearGradient id="mStone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b6378"/><stop offset="1" stop-color="#2a2433"/></linearGradient></defs>
      <rect width="1000" height="680" fill="url(#mSky)"/>
      ${Array.from({ length: 60 }, (_, i) => `<circle cx="${(i * 163) % 1000}" cy="${(i * 71) % 260}" r="${i % 3 ? 1 : 1.8}" fill="#fff" opacity="${.3 + (i % 5) / 8}"/>`).join('')}
      <circle cx="880" cy="70" r="34" fill="#fef3c7" opacity=".9"/>
      <path d="M0 330 L120 250 L220 300 L330 220 L440 290 L560 230 L700 300 L820 240 L1000 320 L1000 680 L0 680Z" fill="#1d2b22"/>
      <path d="M0 400 Q300 360 600 410 T1000 400 L1000 680 L0 680Z" fill="#203a26"/>
      <ellipse cx="210" cy="540" rx="200" ry="95" fill="url(#mLake)"/><path d="M60 540 q30 -6 60 0 M200 580 q40 -6 80 0 M250 510 q30 -5 60 0" stroke="#93c5fd" stroke-width="2" fill="none" opacity=".4"/>
      ${Array.from({ length: 26 }, (_, i) => { const x = 740 + (i % 9) * 30 + (i > 8 ? 12 : 0), y = 410 + Math.floor(i / 9) * 45; return `<path d="M${x} ${y - 40} l-18 46 h36z" fill="${i % 2 ? '#0f2a1a' : '#143823'}"/>`; }).join('')}
      <ellipse cx="820" cy="170" rx="110" ry="42" fill="#3f6b2f" stroke="#a16207" stroke-width="3"/>${[790, 820, 850].map((x, i) => `<g stroke="#facc15" stroke-width="3" fill="none"><line x1="${x}" y1="${150 + i % 2 * 6}" x2="${x}" y2="${120}"/><circle cx="${x}" cy="${112}" r="8"/></g>`).join('')}
      <g fill="url(#mStone)" stroke="#1c1726" stroke-width="2">
        <rect x="360" y="200" width="300" height="150"/><rect x="420" y="140" width="40" height="110"/><path d="M415 140 l25 -60 25 60z"/><rect x="455" y="110" width="30" height="100"/><path d="M450 110 l20 -70 20 70z" fill="#3b3352"/>
        <rect x="540" y="150" width="45" height="110"/><path d="M535 150 l27 -55 27 55z" fill="#3b3352"/><rect x="600" y="190" width="50" height="90"/><path d="M595 190 l30 -50 30 50z" fill="#3b3352"/>
        <rect x="290" y="160" width="40" height="150"/><path d="M285 160 l25 -55 25 55z" fill="#3b3352"/><rect x="330" y="250" width="40" height="100"/>
        <rect x="380" y="350" width="120" height="50"/><rect x="620" y="310" width="70" height="60"/>
      </g>
      ${Array.from({ length: 22 }, (_, i) => `<rect x="${375 + (i % 11) * 26}" y="${215 + Math.floor(i / 11) * 60}" width="8" height="13" rx="4" fill="#fbbf24" opacity="${.5 + (i * 37 % 10) / 20}"/>`).join('')}
      <g fill="#a5f3fc" opacity=".35" stroke="#e0f2fe">${[180, 230, 270].map(x => `<path d="M${x} 375 a25 25 0 0 1 50 0z"/>`).join('')}</g>
      <path d="M640 455 l20 -18 20 18v20h-40z" fill="#78350f"/><rect x="655" y="462" width="10" height="13" fill="#fbbf24"/>
      <g stroke="#14532d" stroke-width="8" fill="none" opacity=".9"><path d="M640 530h120v70H640z M660 545h80v40h-80z M680 560h40v12"/></g>
      ${PLACES.map(p => { const hid = p.hidden && !reqOpen(); if (hid) return ''; const isStair = p.id === stair && !gotStair; return `<g class="v8-pin ${p.hidden ? 'secret' : ''}" tabindex="0" role="button" aria-label="${p.n}" onclick="V8.goPlace('${p.id}')" onkeydown="if(event.key==='Enter')V8.goPlace('${p.id}')" transform="translate(${p.x} ${p.y})">
        <circle r="24" class="bg"/><text y="8" text-anchor="middle" font-size="24">${p.e}</text><image href="img/castillo/${p.id}.jpg" x="-22" y="-22" width="44" height="44" clip-path="url(#mPin)" preserveAspectRatio="xMidYMid slice"/>${isStair ? '<text x="18" y="-14" font-size="18" class="spark">✨</text>' : ''}<text y="42" text-anchor="middle" class="lbl">${p.n}</text></g>`; }).join('')}
    </svg>`;
  }
  V8.goPlace = id => {
    const p = PLACES.find(x => x.id === id); if (!p) return; sfx('tick');
    const s = st();
    if (id === stairsRoom() && s.castle.stair !== today()) {
      s.castle.stair = today(); save();
      const r = rngToday('premio')(), prize = r < .5 ? ['🪙', 60] : r < .85 ? ['🐸', 1] : ['🃏', 0];
      showDialog({ icon: '🪜', title: '¡Las escaleras se movieron!', body: `Encontraste un pasillo secreto cerca de <b>${p.n}</b> con un cofre: ${prize[0] === '🪙' ? '<b>60 galeones</b>' : prize[0] === '🐸' ? '<b>una rana de chocolate</b>' : '<b>un cromo raro</b>'}.`, actions: [{ label: '¡Genial!', primary: true, onClick: () => { if (prize[0] === '🪙') V8.gold(60); else if (prize[0] === '🐸') V8.addFrogs(1); else { const c = V8.pick(V8.CARDS.filter(c => c.r === 'r')); s.cards[c.id] = (s.cards[c.id] || 0) + 1; save(); toast(`Cromo: ${c.name}`, '🃏'); } unlock('v8stairs'); renderCastle(); } }] });
      return;
    }
    p.go();
  };
  function renderCastle() {
    const box = $('tab-castillo'); if (!box) return; const s = st(), w = V8.weather();
    box.innerHTML = `<div class="text-center space-y-1"><h2 class="text-2xl sm:text-3xl font-bold text-amber-400 font-wizard">Mapa del Castillo 🏰</h2><p class="text-stone-300 text-xs">Toca un lugar para entrar. ${W_TXT[w]}.</p></div>
      <div class="v8-mapwrap glass-card rounded-3xl overflow-hidden relative" id="v8MapWrap">${mapSVG()}</div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="glass-card rounded-2xl p-3 text-sm"><b class="text-amber-300">🪜 Escaleras que cambian</b><p class="text-xs text-stone-400 mt-1">${s.castle.stair === today() ? 'Ya encontraste el pasillo secreto de hoy. Mañana se abre otro.' : 'Hoy se abrió un pasillo secreto junto a un lugar con ✨. ¡Búscalo!'}</p></div>
        <div class="glass-card rounded-2xl p-3 text-sm"><b class="text-amber-300">🚪 Sala de los Menesteres</b><p class="text-xs text-stone-400 mt-1">${reqOpen() ? (s.castle.req === today() ? 'Ya la visitaste hoy.' : '¡Apareció! Está en el centro del castillo.') : 'Aparece solo si completas y reclamas las 3 misiones del día.'}</p></div>
        <div class="glass-card rounded-2xl p-3 text-sm"><b class="text-amber-300">👻 Fantasmas</b><p class="text-xs text-stone-400 mt-1">A veces un fantasma cruza la pantalla. Tócalo antes de que se vaya: trae un reto y premios.</p></div></div>`;
    weatherLayer($('v8MapWrap'));
  }
  V8.renderCastle = renderCastle;
  V8.openCastle = () => switchTab('castillo');
  V8.roomOfReq = () => {
    if (!reqOpen()) return toast('La sala no aparece todavía. Completa las misiones del día.', '🚪');
    const s = st(); if (s.castle.req === today()) return toast('La sala ya te dio su regalo hoy.', '🚪');
    s.castle.req = today(); save(); unlock('v8req');
    const r = rngToday('req')(); const opts = [['Una sala llena de libros', () => { const sp = V8.pick(V8.SPELLS.filter(x => !s.spells.includes(x.id))); sp ? V8.learnSpell(sp.id) : V8.gold(80); }], ['Una montaña de galeones', () => V8.gold(120)], ['Un baúl con ranas de chocolate', () => V8.addFrogs(3)], ['Un cromo legendario escondido', () => { const c = V8.pick(V8.CARDS.filter(c => c.r === 'l')); s.cards[c.id] = (s.cards[c.id] || 0) + 1; save(); toast(`¡Cromo legendario: ${c.name}!`, '🌟'); }]];
    const pick = opts[Math.floor(r * opts.length)];
    showDialog({ icon: '🚪', title: 'La Sala de los Menesteres', body: `Caminaste tres veces frente a la pared pensando en lo que necesitabas… y apareció una puerta. Dentro hay: <b>${pick[0]}</b>.`, actions: [{ label: 'Tomarlo', primary: true, onClick: () => { pick[1](); fireConfetti({ particleCount: 120, spread: 100 }); renderCastle(); } }] });
  };

  /* =====================================================================
     RETRATOS QUE HABLAN
  ===================================================================== */
  const PORTRAITS = [
    { n: 'Sir Cadogan', look: { hair: 'long', hairC: '#a8a29e', beard: 'short', beardC: '#a8a29e', robe: '#57534e', house: false }, say: ['¡En guardia, perro sarnoso!', '¡Un caballero nunca se rinde!', '¡Hoy es día de batallas, joven!'] },
    { n: 'La Dama Gorda', look: { hair: 'curly', hairC: '#7c2d12', robe: '#be185d', house: false }, say: ['¿Contraseña? Ah, hoy estoy de buen humor.', 'Anoche canté una ópera entera.', 'Los de Gryffindor siempre llegan tarde.'] },
    { n: 'Phineas Nigellus', look: { hair: 'short', hairC: '#1c1917', beard: 'short', beardC: '#1c1917', robe: '#065f46', mood: 'serio', house: false }, say: ['Los jóvenes de hoy no saben nada.', 'Fui el director menos querido. Con orgullo.', 'Hmm… otra vez tú.'] },
    { n: 'Violeta', look: { hair: 'bun', hairC: '#a8a29e', robe: '#7c3aed', house: false }, say: ['¿Ya escuchaste el último chisme del castillo?', 'Me encanta visitar otros cuadros.', 'Shh… alguien viene.'] },
    { n: 'Armando Dippet', look: { hair: 'bald', beard: 'long', robe: '#7c2d12', glasses: 'half', house: false }, say: ['En mis tiempos la Cámara se abrió una vez…', 'Un buen director escucha a sus alumnos.', 'Las reglas existen por algo, ¿no?'] },
    { n: 'Dilys Derwent', look: { hair: 'long', hairC: '#78716c', robe: '#0e7490', house: false }, say: ['Fui sanadora antes que directora.', 'Cuida tu salud: duerme bien antes de un examen.', 'Una buena poción lo cura casi todo.'] }
  ];
  V8.portraits = () => {
    const s = st(), r = rngToday('retrato'), done = s.castle.portrait === today(), stair = PLACES.find(p => p.id === stairsRoom());
    const q = V8.pick(V8.pool(), r), opts = V8.shuffle([q.a, ...q.w], r);
    V8.sheet('🖼️ Galería de retratos', `<div class="v8-portraits">${PORTRAITS.map((p, i) => `<div class="v8-frame"><div class="pic"><span class="pe">${['⚔️', '🎶', '🎩', '💜', '📜', '🩺'][i]}</span>${V8.ph('retratos', i + 1)}</div><b>${p.n}</b><p>«${V8.pick(p.say, rngToday('say' + i))}»</p></div>`).join('')}</div>
      <div class="glass-card rounded-2xl p-3 mt-3 text-sm"><b class="text-amber-300">🗝️ Pista del día:</b> <span class="text-stone-300">dicen que las escaleras llevan a un pasillo secreto cerca de <b>${s.castle.stair === today() ? '…(ya lo encontraste)' : stair.n}</b>.</span></div>
      <div class="glass-card rounded-2xl p-3 mt-3"><b class="text-amber-300">🎯 Reto del retrato</b> <span class="text-[11px] text-stone-400">(+15 galeones)</span><p class="font-bold text-amber-100 my-2">${esc(q.q)}</p>${done ? '<p class="text-xs text-emerald-300">Ya respondiste el reto de hoy.</p>' : `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${opts.map(o => `<button class="opt-btn !text-sm" onclick="V8.portraitAns(this, ${JSON.stringify(o === q.a)})">${esc(o)}</button>`).join('')}</div>`}</div>`, { wide: true });
    if (V8.speak) V8.speak(`${PORTRAITS[0].n} dice: ${V8.pick(PORTRAITS[0].say, rngToday('say0'))}`);
  };
  V8.portraitAns = (btn, ok) => { const s = st(); [...btn.parentElement.children].forEach(b => b.disabled = true); btn.classList.add(ok ? 'correct' : 'wrong'); sfx(ok ? 'correct' : 'wrong'); s.castle.portrait = today(); save(); if (ok) { V8.gold(15, 'Los retratos aplauden'); unlock('v8portrait'); } };

  /* =====================================================================
     FANTASMAS QUE CRUZAN LA PANTALLA
  ===================================================================== */
  const GHOSTS = [['nearly', 'Nick Casi Decapitado'], ['fraile', 'El Fraile Gordo'], ['dama', 'La Dama Gris'], ['baron', 'El Barón Sanguinario'], ['myrtle', 'Myrtle la Llorona']];
  function spawnGhost() {
    if (document.hidden || $('v8Ghost') || $('v8Sheet') || (typeof activeGame !== 'undefined' && activeGame) || (typeof duel !== 'undefined' && duel.running) || !S.house || V8.reduced()) return;
    if (!V8.signed() && window.V7 && V7.guardPlay) return;
    const [id, name] = V8.pick(GHOSTS), card = V8.CARDS.find(c => c.id === id);
    const g = document.createElement('button'); g.id = 'v8Ghost'; g.className = 'v8-ghost'; g.setAttribute('aria-label', `${name}: tócalo para un reto`);
    g.innerHTML = `<b class="gh">👻</b><span>${name}</span>`; void card; g.style.top = (15 + Math.random() * 55) + 'vh';
    g.onclick = () => { g.remove(); ghostQuiz(id, name); };
    document.body.appendChild(g); sfx('hat');
    setTimeout(() => g.remove(), 14000);
  }
  function ghostQuiz(id, name) {
    const q = V8.pick(V8.pool()), opts = V8.shuffle([q.a, ...q.w]);
    V8.sheet(`👻 ${name}`, `<p class="text-sm text-stone-300">«¡Buuu! Si respondes bien te daré un regalo…»</p><p class="font-bold text-amber-100 my-2">${esc(q.q)}</p><div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${opts.map(o => `<button class="opt-btn !text-sm" onclick="V8.ghostAns(this, ${JSON.stringify(o === q.a)}, '${id}')">${esc(o)}</button>`).join('')}</div>`);
  }
  V8.ghostAns = (btn, ok, id) => {
    [...btn.parentElement.children].forEach(b => b.disabled = true); btn.classList.add(ok ? 'correct' : 'wrong'); sfx(ok ? 'correct' : 'wrong');
    if (!ok) return; unlock('v8ghost');
    if (Math.random() < .2) { const s = st(); s.cards[id] = (s.cards[id] || 0) + 1; save(); toast('¡El fantasma te regaló su cromo!', '👻'); } else V8.gold(20, 'Regalo del fantasma');
  };
  setInterval(() => { if (Math.random() < .3) spawnGhost(); }, 150000);
  V8.spawnGhost = spawnGhost;

  /* =====================================================================
     LECHUCERÍA: cartas con frases para tus amigos
  ===================================================================== */
  const PHRASES = ['¡Hola! ¿Jugamos un duelo? ⚔️', '¡Feliz cumpleaños! 🎂', '¡Te reto al Ludo! 🎲', '¡Buena suerte en tus exámenes! 📚', '¡Gracias, amigo! 💛', '¡Te extraño en Hogwarts! 🏰', '¡Mira mi nuevo cromo! 🃏', '¡Que gane la mejor casa! 🏆', '¡Expecto Patronum! 🦌', '¡Nos vemos en el Gran Salón! 🍽️'];
  V8.owlery = async () => {
    if (!V8.signed()) return toast('Inicia sesión para enviar cartas.', '🦉');
    const body = V8.sheet('🦉 Lechucería', '<p class="text-xs text-stone-400"><i class="fa-solid fa-spinner fa-spin"></i> Buscando a tus amigos…</p>');
    let friends = [], inbox = [];
    try { friends = S.friends && S.friends.length ? await fetchProfiles(S.friends) : []; } catch (e) {}
    try { inbox = await rpc('cartas_mias') || []; } catch (e) {}
    if (!$('v8SheetBody')) return;
    $('v8SheetBody').innerHTML = `<h4 class="v8-h4">📬 Cartas recibidas</h4>${inbox.length ? inbox.map(c => `<div class="v8-letter"><b>${esc(c.de)}</b><p>${esc(PHRASES[c.frase] || '')}</p><small>${new Date(c.creado).toLocaleDateString('es-PE')}</small></div>`).join('') : '<p class="text-xs text-stone-400">Aún no recibes cartas.</p>'}
      <h4 class="v8-h4 mt-4">✉️ Enviar una carta</h4>${friends.length ? `<select id="owTo" class="w-full bg-stone-950 border border-amber-700/50 rounded-lg px-3 py-2 text-sm text-stone-200">${friends.filter(Boolean).map(f => `<option value="${f.codigo}">${esc(f.nombre)} (${esc(f.casa || '')})</option>`).join('')}</select>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">${PHRASES.map((p, i) => `<button class="v8-chip text-left" onclick="V8.sendOwl(${i})">${p}</button>`).join('')}</div>` : '<p class="text-xs text-stone-400">Agrega amigos con su código en <b>Comunidad → Amigos</b> para enviarles cartas.</p>'}`;
    if (inbox.some(c => !c.leida)) { try { await rpc('cartas_leer'); } catch (e) {} }
    void body;
  };
  V8.sendOwl = async i => {
    const to = ($('owTo') || {}).value; if (!to) return;
    try { await rpc('carta_enviar', { p_para: to, p_de: V8.name(), p_frase: i }); toast('¡Tu lechuza salió volando con la carta!', '🦉'); sfx('spell'); unlock('v8owl'); flyOwl(); }
    catch (e) { toast(String(e.message || '').includes('limite') ? 'Ya enviaste muchas cartas hoy. ¡Mañana más!' : 'No se pudo enviar. ¿Ejecutaste supabase-v8.sql?', '⚠️'); }
  };
  function flyOwl() { if (V8.reduced()) return; const o = document.createElement('div'); o.className = 'v8-owlfly'; o.textContent = '🦉'; document.body.appendChild(o); setTimeout(() => o.remove(), 2600); }
  async function checkLetters() { if (!V8.signed() || !supaReady()) return; try { const r = await rpc('cartas_mias'); const n = (r || []).filter(c => !c.leida).length; if (n) { toast(`Tienes ${n} carta${n > 1 ? 's' : ''} nueva${n > 1 ? 's' : ''} en la Lechucería`, '🦉'); if (V8.notify) V8.notify('🦉 Te llegó una carta', 'Un amigo te escribió en Hogwarts.'); } } catch (e) {} }
  V8.on('signedIn', () => setTimeout(checkLetters, 6000));

  /* =====================================================================
     EVENTOS POR FECHA (se suman a Halloween, Navidad y cumpleaños)
  ===================================================================== */
  if (typeof EVENTS !== 'undefined') {
    Object.assign(EVENTS, {
      expreso: { name: 'Regreso a Hogwarts', icon: '🚂', from: [9, 1], to: [9, 3], text: '¡El Expreso de Hogwarts sale del andén 9¾! Trivia especial y 100 galeones de bienvenida.' },
      batalla: { name: 'Batalla de Hogwarts', icon: '⚔️', from: [5, 2], to: [5, 3], text: 'Recordamos a los héroes de la batalla. Trivia especial y premio para los valientes.' }
    });
    const _ae = applyEvent;
    applyEvent = function () {
      _ae();
      const ev = activeEvent(); if (!ev || !['expreso', 'batalla', 'cumple'].includes(ev)) return;
      const key = ev + '-' + new Date().getFullYear(), box = $('eventBanner');
      if (ev !== 'cumple' && !S.claimed[key]) { S.claimed[key] = true; save(); setTimeout(() => V8.gold(100, `Regalo de ${EVENTS[ev].name}`), 1500); }
      const b = box && box.querySelector('.event-banner'); if (b && !b.querySelector('.v8-evq')) b.insertAdjacentHTML('beforeend', `<button class="btn-gold v8-evq" onclick="V8.eventQuiz('${ev}')">Jugar la trivia especial</button>`);
    };
  }
  V8.eventQuiz = async ev => {
    if (window.V7 && V7.guardPlay && V7.guardPlay()) return;
    await V8.loadPool(); const P = V8.pool(), topic = ev === 'batalla' ? 'historia' : ev === 'expreso' ? 'lugares' : 'personajes';
    const list = V8.shuffle(P.filter(q => q.topic === topic)).slice(0, 10); let i = 0, ok = 0;
    const show = () => {
      if (i >= list.length) { const key = 'evq-' + ev + new Date().getFullYear(), first = !S.claimed[key]; if (first && ok >= 6) { S.claimed[key] = true; save(); V8.gold(80, 'Premio del evento'); V8.addFrogs(1); unlock('v8event'); } $('v8SheetBody').innerHTML = `<div class="text-center space-y-2"><div class="text-5xl">${EVENTS[ev].icon}</div><p class="font-wizard text-xl text-amber-300">${ok}/10 correctas</p><p class="text-xs text-stone-400">${ok >= 6 ? (first ? '¡Ganaste el premio del evento!' : 'Ya tenías el premio de este año.') : 'Necesitas 6 aciertos para el premio.'}</p></div>`; return; }
      const q = list[i], opts = V8.shuffle([q.a, ...q.w]);
      $('v8SheetBody').innerHTML = `<p class="text-xs text-stone-400">Pregunta ${i + 1}/10 · ✔ ${ok}</p><p class="font-bold text-amber-100 my-2">${esc(q.q)}</p><div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${opts.map(o => `<button class="opt-btn !text-sm">${esc(o)}</button>`).join('')}</div>`;
      [...$('v8SheetBody').querySelectorAll('.opt-btn')].forEach((b, k) => b.onclick = () => { const good = opts[k] === q.a; if (good) ok++; b.classList.add(good ? 'correct' : 'wrong'); sfx(good ? 'correct' : 'wrong'); V8.emit('answer', { ok: good, q, source: 'evento' }); i++; setTimeout(show, 700); });
    };
    V8.sheet(`${EVENTS[ev].icon} ${EVENTS[ev].name}`, ''); show();
  };

  /* =====================================================================
     MASCOTA QUE CRECE (etapas y trucos)
  ===================================================================== */
  const TRICKS = [[1, 'Saltar', 'pet-jump'], [3, 'Dar una vuelta', 'v8-spin'], [5, 'Brillar', 'v8-glow'], [7, 'Volar', 'v8-fly'], [10, 'Hacer magia', 'v8-magic']];
  const stage = lv => lv >= 8 ? ['Adulto mágico', 1.25, '👑'] : lv >= 4 ? ['Joven', 1.1, '🎀'] : ['Bebé', .85, '🍼'];
  if (typeof petHtml === 'function') {
    const _ph = petHtml;
    petHtml = function (compact) {
      let h = _ph(compact); const p = S.pet && petTick(); if (!p) return h;
      const [name, sc, acc] = stage(p.level);
      h = h.replace('<div class="pet-emoji text-6xl">', `<div class="pet-emoji text-6xl relative" style="transform:scale(${sc})"><span class="v8-petacc">${acc}</span>`);
      return h + `<div class="mt-2"><p class="text-[11px] text-stone-400">Etapa: <b class="text-amber-200">${name}</b> · Trucos:</p><div class="flex flex-wrap gap-1.5 mt-1">${TRICKS.map(([lv, n, cls]) => p.level >= lv ? `<button class="v8-chip" onclick="V8.trick('${cls}')">${n}</button>` : `<span class="v8-chip off">🔒 ${n} (nivel ${lv})</span>`).join('')}</div></div>`;
    };
  }
  V8.trick = cls => { const el = document.querySelector('.pet-emoji'); if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); sfx('spell'); if (cls === 'v8-magic') burst(innerWidth / 2, innerHeight / 2, '#c084fc', 50); V8.emit('pet', {}); };

  /* =====================================================================
     PESTAÑA «CASTILLO»
  ===================================================================== */
  const sec = document.createElement('section'); sec.id = 'tab-castillo'; sec.className = 'hidden space-y-4';
  const home = $('tab-home'); if (home) home.parentElement.appendChild(sec);
  TABS.push('castillo');
  if (typeof NAV !== 'undefined') { NAV.splice(NAV.findIndex(n => n[0] === 'duel') + 1, 0, ['castillo', 'fa-chess-rook', 'Castillo']); renderNav(); }
  const _sw = switchTab;
  switchTab = function (tab) { const r = _sw(tab); if (tab === 'castillo') renderCastle(); if (tab === 'home') setTimeout(() => weatherLayer($('v7Hall')), 300); return r; };
  setTimeout(() => weatherLayer($('v7Hall')), 1500);
  Object.assign(ACH, {
    v8stairs: ['🪜', 'Escaleras traviesas', 'Encuentra el pasillo secreto del día'], v8req: ['🚪', 'Sala de los Menesteres', 'Entra a la Sala de los Menesteres'], v8portrait: ['🖼️', 'Amigo de los retratos', 'Responde el reto de un retrato'],
    v8ghost: ['👻', 'Cazafantasmas', 'Responde el reto de un fantasma'], v8owl: ['🦉', 'Correo lechuza', 'Envía una carta a un amigo'], v8event: ['🎉', 'Invitado de honor', 'Gana el premio de un evento especial']
  });
})();
