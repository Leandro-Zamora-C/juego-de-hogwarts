/* =====================================================================
   HOGWARTS · VERSIÓN 8 · MINIJUEGOS NUEVOS
   Quidditch 3D, Trivia Mixta, Snap Explosivo, Laberinto del Torneo,
   Defensa Contra las Artes Oscuras, Bosque Prohibido, Lago Negro,
   Gobstones, Encantamientos al Ritmo, Clase de Vuelo, Pociones
   Avanzadas, Herbología, Adivina el Retrato, Escape del Mes y
   Adivinación. Este archivo se carga solo al abrir uno de ellos.
===================================================================== */
(() => {
  const V8 = window.V8, st = V8.st;
  let RUN = null; // juego activo: { raf, timers[], keys, stop }
  const stop = () => { if (!RUN) return; cancelAnimationFrame(RUN.raf); RUN.timers.forEach(t => { clearTimeout(t); clearInterval(t); }); if (RUN.R) RUN.R.dispose(); if (RUN.off) RUN.off(); RUN = null; };
  const begin = id => { stop(); RUN = { id, raf: 0, timers: [], keys: {} }; V8.started(id); return RUN; };
  const later = (fn, ms) => { const t = setTimeout(fn, ms); RUN && RUN.timers.push(t); return t; };
  const every = (fn, ms) => { const t = setInterval(fn, ms); RUN && RUN.timers.push(t); return t; };
  const body = () => $('gameBody');
  const wrap = (inner, cls = '') => `<div class="max-w-3xl mx-auto space-y-3 v8-game ${cls}">${ON.active ? `<div class="v8-onbar" id="v8OnBar">${onBarTxt()}</div>` : ''}${inner}</div>`;
  const hud = items => `<div class="v8-hud">${items.map(([id, l, v]) => `<span>${l} <b id="${id}">${v}</b></span>`).join('')}</div>`;
  const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
  const intro = (id, icon, text, btn = '¡Empezar!') => { ON.active = false; body().innerHTML = wrap(`<div class="glass-card rounded-3xl p-6 text-center space-y-3"><div class="text-6xl">${icon}</div><p class="text-sm text-stone-300 max-w-md mx-auto">${text}</p><div class="flex gap-2 justify-center flex-wrap"><button class="btn-gold" onclick="V8G.go('${id}')">${btn}</button>${ONLINE.includes(id) ? `<button class="btn-ghost" onclick="V8G.online('${id}')">🌐 Contra un amigo en línea</button>` : ''}</div></div>`); };
  function end(id, { icon = '🏆', title, lines = [], points = 0, record = null, higher = true }) {
    if (ON.active && ON.id === id) return onlineEnd(id, points, title);
    const isRec = record != null ? V8.record(id, record, higher) : false;
    if (points > 0) gameReward(points, title.replace(/<[^>]+>/g, '')); else sfx('wrong');
    if (points >= 30) V8.emit('gameWin', { id });
    const b = body(); if (!b) return;
    b.innerHTML = wrap(`<div class="glass-card rounded-3xl p-6 text-center space-y-3"><div class="text-6xl">${icon}</div><p class="font-wizard text-2xl font-bold text-amber-300">${title}</p>${lines.map(l => `<p class="text-sm text-stone-300">${l}</p>`).join('')}${isRec ? '<p class="text-emerald-300 font-bold">🎉 ¡Nuevo récord!</p>' : ''}
      <div class="flex gap-2 justify-center"><button class="btn-gold" onclick="V8G.go('${id}')"><i class="fa-solid fa-rotate"></i> Otra vez</button><button class="btn-ghost" onclick="closeGame()">Salir</button></div></div>`);
    if (points >= 40) fireConfetti({ particleCount: 100, spread: 90 });
  }
  const canvasBox = (id, ratio = '4/3', extra = '', maxw = 760) => `<div class="relative rounded-2xl overflow-hidden border-2 border-amber-800/50 shadow-2xl shadow-black/60 mx-auto w-full" style="max-width:min(100%, ${maxw}px);aspect-ratio:${ratio}"><canvas id="${id}" class="block w-full h-full" style="touch-action:none"></canvas>${extra}</div>`;
  const fit = cv => { const dpr = Math.min(devicePixelRatio || 1, V8.low() ? 1 : 2), w = cv.clientWidth, h = cv.clientHeight; if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return [x, w, h]; };
  const keyHandler = () => { const k = RUN.keys; const dn = e => { k[e.key] = true; if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) && activeGame) e.preventDefault(); }, up = e => { k[e.key] = false; }; addEventListener('keydown', dn); addEventListener('keyup', up); const prev = RUN.off; RUN.off = () => { removeEventListener('keydown', dn); removeEventListener('keyup', up); prev && prev(); }; };
  const qpick = (n, filter) => V8.shuffle(V8.pool().filter(filter || (() => true))).slice(0, n).map(q => ({ ...q, opts: V8.shuffle([q.a, ...q.w]) }));
  window.V8G = { go: id => { V8.loadPool().then(() => GAMES_IMPL[id].play()); } };

  /* =====================================================================
     EN LÍNEA: los dos juegan la MISMA partida (misma semilla) al mismo
     tiempo y gana quien saque más puntos. Usa las salas de la versión 5.
  ===================================================================== */
  const ONLINE = V8.ONLINE_GAMES;
  const ON = { active: false, id: null, my: null, opp: null };
  const onBarTxt = () => `🌐 Contra <b>${typeof grOpp === 'function' ? grOpp() : 'tu rival'}</b> · ${ON.opp == null ? 'jugando…' : `terminó con <b>${ON.opp}</b> puntos`}`;
  const refreshBar = () => { const b = $('v8OnBar'); if (b) b.innerHTML = onBarTxt(); };
  function seeded(seed, fn) { const orig = Math.random; Math.random = V8.rng(seed); try { fn(); } finally { Math.random = orig; } }
  ONLINE.forEach(id => {
    GR[id] = {
      start({ seed }) { Object.assign(ON, { active: true, id, my: null, opp: null }); V8.loadPool().then(() => seeded(seed, () => id === 'snap' ? GAMES_IMPL.snap.start('ia') : GAMES_IMPL[id].play())); },
      msg(m) { if (m.type === 'v8score' && ON.active) { ON.opp = m.v; refreshBar(); toast(`${grOpp()} terminó con ${m.v} puntos`, '🌐'); if (ON.my != null) showOnline(); } },
      left() { if (ON.active) { if (ON.opp == null) ON.opp = -1; if (ON.my != null) showOnline(); else refreshBar(); } }
    };
  });
  function onlineEnd(id, points, title) {
    ON.my = Math.max(0, Math.round(points)); grSend({ type: 'v8score', v: ON.my });
    if (points > 0) gameReward(points, title.replace(/<[^>]+>/g, ''));
    showOnline();
  }
  function showOnline() {
    const b = body(); if (!b) return;
    if (ON.opp == null) { b.innerHTML = wrap(`<div class="glass-card rounded-3xl p-6 text-center space-y-3"><div class="text-5xl">⏳</div><p class="font-wizard text-xl text-amber-300">Hiciste ${ON.my} puntos</p><p class="text-sm text-stone-300">Esperando a que ${grOpp()} termine…</p></div>`); return; }
    const left = ON.opp < 0, win = left || ON.my > ON.opp, tie = !left && ON.my === ON.opp;
    if (win && !tie) { grWin('race'); V8.gold(20, 'Ganaste la partida en línea'); fireConfetti({ particleCount: 120, spread: 100 }); sfx('levelup'); }
    ON.active = false;
    b.innerHTML = wrap(`<div class="glass-card rounded-3xl p-6 flex flex-col items-center gap-3 text-center">${grResultHTML({ win, tie, title: left ? 'Tu rival se fue: ¡ganaste!' : null, mine: ON.my, theirs: left ? '—' : ON.opp, unit: 'pts' })}</div>`);
  }
  V8G.online = id => { stop(); if (typeof grSetMode === 'function') grSetMode(id, true); };
  const GAMES_IMPL = {};
  const def = (id, o) => { GAMES_IMPL[id] = o; V8.impl(id, { init: () => o.intro(), stop, howto: o.howto, best: o.best }); };

  /* =====================================================================
     1. QUIDDITCH 3D
  ===================================================================== */
  def('q3d', {
    howto: ['Toca la pantalla donde quieres lanzar la quaffle.', 'Pasa la pelota por uno de los tres aros: el guardián intenta bloquearla.', 'Tienes 60 segundos. Cada gol vale 10 puntos.'],
    best: b => b ? `Récord: ${b} goles` : '',
    intro: () => intro('q3d', '🏟️', 'Eres cazador de tu casa. Toca hacia un aro para lanzar la quaffle y vence al guardián. ¡60 segundos!'),
    play() {
      const R0 = begin('q3d');
      body().innerHTML = wrap(hud([['qG', '⚽ Goles', 0], ['qT', '⏱', 60], ['qS', '🎯 Tiros', 0]]) + canvasBox('qCv', '16/10', '<div id="qMsg" class="v8-float"></div>'));
      const cv = $('qCv'), use3d = M3.supported() && gfx3d();
      const S0 = { goals: 0, shots: 0, t: 60, ball: null, keeper: 0, kv: 2.2, hoops: [[-4, 6.2], [0, 7.4], [4, 6.2]], over: false, flash: 0 };
      let R = null, nodes = {};
      if (use3d) R = M3.create(cv, { maxDpr: 1.75 });
      if (R) {
        R0.R = R; const G = M3.G, mat = R.mat;
        R.clear = [.45, .62, .85]; R.sky = [.7, .8, 1]; R.ground = [.3, .4, .2]; R.light.dir = M3.norm([-.3, -1, -.5]); R.light.color = [1.1, 1.05, .95];
        R.fog = { color: [.6, .72, .9], density: .012 }; R.cam.fov = 55; R.cam.pos = [0, 3.2, 11]; R.cam.target = [0, 4.5, -12];
        R.add(R.node(R.mesh(G.plane(120, 120, 1, 1)), mat({ color: [.24, .5, .2], pat: 4, spec: .1 }), { cast: false }));
        R.add(R.node(R.mesh(G.plane(40, 8, 1, 1)), mat({ color: [.9, .9, .85], unlit: true }), { pos: [0, .02, -14], scl: [1, 1, .05], cast: false }));
        const H = ['#b91c1c', '#047857', '#1d4ed8', '#ca8a04'];
        for (let i = 0; i < 8; i++) { const a = Math.PI * .2 + i / 7 * Math.PI * .6; R.add(R.node(R.mesh(G.box(6, 7 + (i % 2) * 2, 3)), mat({ color: M3.hex(H[i % 4]), spec: .2 }), { pos: [Math.cos(a) * -30, 3.5, -Math.sin(a) * 30 - 6], rot: [0, -a + Math.PI / 2, 0] })); R.add(R.node(R.mesh(G.cyl(0, 2, 4, 4)), mat({ color: M3.hex(H[(i + 1) % 4]) }), { pos: [Math.cos(a) * -30, 9 + (i % 2) * 2, -Math.sin(a) * 30 - 6] })); }
        const gold = mat({ color: [.95, .75, .25], spec: 1.4, shin: 90 });
        S0.hoops.forEach(([x, y]) => { R.add(R.node(R.mesh(G.cyl(.12, .12, y - 1.1, 10)), gold, { pos: [x, 0, -14] })); R.add(R.node(R.mesh(G.torus(1.1, .12, 32, 10)), gold, { pos: [x, y, -14], rot: [Math.PI / 2, 0, 0] })); });
        nodes.keeper = R.add(R.node(R.mesh(G.merge([[G.cyl(.35, .55, 1.6, 12)], [G.sphere(.32, 12, 10), G.at(0, 1.9, 0)], [G.cyl(.04, .04, 3, 6), G.at(0, .6, .3, 0, 0, Math.PI / 2)]])), mat({ color: [.1, .45, .25], spec: .5, rim: .3 }), { pos: [0, 5.5, -13] }));
        nodes.ball = R.add(R.node(R.mesh(G.sphere(.33, 16, 12)), mat({ color: [.6, .15, .1], spec: .4 }), { visible: false }));
      }
      const x2 = R ? null : cv.getContext('2d');
      // de pantalla a punto del plano de los aros (z = -14)
      const toPlane = (px, py, w, h) => {
        if (R) { const ray = R.ray(px, py), t = (-14 - ray.o[2]) / ray.d[2]; return [ray.o[0] + ray.d[0] * t, ray.o[1] + ray.d[1] * t]; }
        return [(px / w - .5) * 16, (1 - py / h) * 10];
      };
      cv.addEventListener('pointerdown', e => {
        if (S0.over || S0.ball) return; const r = cv.getBoundingClientRect(); const [tx, ty] = toPlane(e.clientX - r.left, e.clientY - r.top, r.width, r.height);
        S0.ball = { t: 0, from: [0, 2.2, 8], to: [tx + (Math.random() - .5) * .5, ty + (Math.random() - .5) * .5, -14] }; S0.shots++; set('qS', S0.shots); sfx('spell');
      });
      const say = (t, c) => { const m = $('qMsg'); if (!m) return; m.textContent = t; m.style.color = c; m.classList.remove('show'); void m.offsetWidth; m.classList.add('show'); };
      every(() => { if (S0.over) return; S0.t--; set('qT', S0.t); if (S0.t <= 0) { S0.over = true; later(() => end('q3d', { icon: S0.goals >= 6 ? '🏆' : '🏟️', title: `${S0.goals} goles`, lines: [`Tiros: ${S0.shots} · Puntería: ${S0.shots ? Math.round(S0.goals / S0.shots * 100) : 0}%`], points: S0.goals * 10, record: S0.goals }), 600); } }, 1000);
      let last = performance.now();
      const loop = now => {
        if (!RUN || RUN.id !== 'q3d') return; RUN.raf = requestAnimationFrame(loop);
        const dt = Math.min(.05, (now - last) / 1000); last = now;
        S0.kv = 2.2 + (60 - S0.t) * .05; S0.keeper = Math.sin(now / 1000 * S0.kv * .55) * 4.6 + Math.sin(now / 370) * .4;
        if (S0.ball) {
          const b = S0.ball; b.t += dt / .75; const k = Math.min(1, b.t);
          b.pos = [b.from[0] + (b.to[0] - b.from[0]) * k, b.from[1] + (b.to[1] - b.from[1]) * k + Math.sin(k * Math.PI) * 1.5, b.from[2] + (b.to[2] - b.from[2]) * k];
          if (k >= 1) {
            const blocked = Math.abs(b.to[0] - S0.keeper) < 1.15 && Math.abs(b.to[1] - 5.5) < 1.9;
            const goal = !blocked && S0.hoops.some(([hx, hy]) => Math.hypot(b.to[0] - hx, b.to[1] - hy) < 1.0);
            if (blocked) { say('¡Atajada!', '#fca5a5'); sfx('wrong'); } else if (goal) { S0.goals++; set('qG', S0.goals); say('¡GOOOL! +10', '#86efac'); sfx('correct'); S0.flash = 1; } else { say('¡Fuera!', '#fde68a'); sfx('tick'); }
            S0.ball = null;
          }
        }
        if (R) {
          R.tick(now); { const r = cv.getBoundingClientRect(); if (Math.abs(r.width - R.w) > 1) R.resize(); }
          nodes.keeper.pos = [S0.keeper, 5.5 + Math.sin(now / 300) * .15, -13]; nodes.keeper.rot = [0, 0, Math.sin(now / 200) * .1];
          nodes.ball.visible = !!S0.ball; if (S0.ball) nodes.ball.pos = S0.ball.pos;
          const pts = []; if (S0.flash > 0) { S0.flash -= dt; for (let i = 0; i < 30; i++) pts.push({ p: [Math.sin(i * 2.1) * 3, 6 + Math.cos(i * 1.7) * 2, -14], c: [1, .85, .3, S0.flash], s: .4 }); }
          R.render(pts);
        } else {
          const [x, w, h] = fit(cv); const sx = v => (v / 16 + .5) * w, sy = v => (1 - v / 10) * h;
          x.fillStyle = '#7dd3fc'; x.fillRect(0, 0, w, h); x.fillStyle = '#3f7d2c'; x.fillRect(0, h * .75, w, h * .25);
          x.strokeStyle = '#facc15'; x.lineWidth = 6; S0.hoops.forEach(([hx, hy]) => { x.beginPath(); x.arc(sx(hx), sy(hy), w / 16, 0, 7); x.stroke(); x.beginPath(); x.moveTo(sx(hx), sy(hy) + w / 16); x.lineTo(sx(hx), h); x.stroke(); });
          x.fillStyle = '#065f46'; x.fillRect(sx(S0.keeper) - w / 28, sy(5.5) - h / 9, w / 14, h / 4.5); x.font = `${w / 20}px serif`; x.textAlign = 'center'; x.fillText('🧹', sx(S0.keeper), sy(5.5));
          if (S0.ball) { const b = S0.ball, k = Math.min(1, b.t); x.fillStyle = '#b91c1c'; x.beginPath(); x.arc(sx(b.from[0] + (b.to[0] - b.from[0]) * k), sy(b.from[1] + (b.to[1] - b.from[1]) * k), (1 - k * .6) * w / 30, 0, 7); x.fill(); }
        }
      };
      RUN.raf = requestAnimationFrame(loop);
    }
  });

  /* =====================================================================
     2. TRIVIA MIXTA
  ===================================================================== */
  const EMOJI_Q = [['🦉❄️📬', 'Hedwig', ['Errol', 'Fawkes', 'Buckbeak']], ['⚡👓🧹', 'Harry Potter', ['Ron Weasley', 'Neville Longbottom', 'Draco Malfoy']], ['🐍💍📕', 'Los horrocruxes', ['Las reliquias', 'Los trasladores', 'Los giratiempos']], ['🧙‍♂️🍬🧦', 'Dumbledore y los caramelos de limón', ['Snape y las pociones', 'Hagrid y los dragones', 'Filch y la Señora Norris']],
    ['🚂9️⃣¾', 'El andén 9¾', ['El Callejón Diagon', 'Hogsmeade', 'Gringotts']], ['🐉🥚🔥', 'Norberto el dragón', ['Aragog', 'Fluffy', 'Buckbeak']], ['🐕🐕🐕', 'Fluffy', ['Colmillo', 'Sirius', 'Canuto']], ['⏳📿👧', 'El giratiempo de Hermione', ['El collar de Slytherin', 'La Piedra Filosofal', 'El trasladador']],
    ['🧦🧝‍♂️🆓', 'Dobby es libre', ['Kreacher cocina', 'Winky llora', 'Griphook cuenta oro']], ['🏆🔥💧', 'El Cáliz de Fuego', ['La Copa de Quidditch', 'El Espejo de Oesed', 'El Pensadero']], ['🦌✨🛡️', 'El patronus de Harry', ['El patronus de Snape', 'Un boggart', 'Un thestral']], ['🍭🐸🃏', 'Las ranas de chocolate', ['Las grageas', 'Las plumas de azúcar', 'Las varitas de regaliz']],
    ['🗺️👣🤫', 'El Mapa del Merodeador', ['La Capa de Invisibilidad', 'El Profeta', 'El Quisquilloso']], ['🪞❤️👨‍👩‍👦', 'El Espejo de Oesed', ['El Pensadero', 'El Velo', 'La Sala de Menesteres']], ['🐀✋👆', 'Peter Pettigrew', ['Remus Lupin', 'Sirius Black', 'Lucius Malfoy']], ['🌙🦁🍾', 'Luna Lovegood', ['Ginny Weasley', 'Cho Chang', 'Fleur Delacour']]];
  const ORDER_Q = [
    ['La Piedra Filosofal', ['Harry recibe su carta', 'El Sombrero lo envía a Gryffindor', 'Vence al trol del baño', 'Encuentra la Piedra Filosofal']],
    ['La Cámara Secreta', ['Dobby advierte a Harry', 'El auto volador choca con el Sauce', 'Hermione queda petrificada', 'Harry destruye el diario']],
    ['El Prisionero de Azkaban', ['Harry infla a tía Marge', 'Los dementores suben al tren', 'Lupin enseña el patronus', 'Sirius escapa en Buckbeak']],
    ['El Cáliz de Fuego', ['Mundial de Quidditch', 'El Cáliz elige a Harry', 'La prueba del dragón', 'Regresa Voldemort']],
    ['La Orden del Fénix', ['Ataque de dementores en Little Whinging', 'Umbridge llega a Hogwarts', 'Nace el Ejército de Dumbledore', 'Batalla en el Ministerio']],
    ['El Misterio del Príncipe', ['Harry encuentra el libro del Príncipe', 'Ron toma la poción de amor', 'La cueva del guardapelo', 'Cae Dumbledore en la torre']],
    ['Reliquias de la Muerte', ['Los siete Potter', 'Robo en el Ministerio', 'Visita a Xenophilius', 'Batalla de Hogwarts']]
  ];
  def('mixta', {
    howto: ['Son 10 rondas de tipos distintos: con imagen, verdadero o falso, ordenar sucesos y ¿quién lo dijo?', 'Responde rápido: cuanto antes, más puntos.'],
    intro: () => intro('mixta', '🧩', 'Diez rondas con preguntas de imagen, verdadero o falso, ordenar sucesos y frases célebres.'),
    play() {
      begin('mixta');
      const kinds = V8.shuffle(['img', 'img', 'vf', 'vf', 'vf', 'ord', 'ord', 'quien', 'quien', 'quien']); const plan = kinds.map(() => V8.rng(Math.floor(Math.random() * 2 ** 31)));
      let i = 0, score = 0, ok = 0;
      const next = () => {
        if (!RUN || RUN.id !== 'mixta') return;
        if (i >= kinds.length) return end('mixta', { icon: ok >= 8 ? '🏆' : '🧩', title: `${ok}/10 correctas`, lines: [`Puntaje: ${score}`], points: Math.round(score / 10), record: score });
        const rr = plan[i], k = kinds[i++], t0 = performance.now(), pick = a => V8.pick(a, rr), shuf = a => V8.shuffle(a, rr);
        const done = good => { const pts = good ? Math.max(20, 100 - Math.round((performance.now() - t0) / 150)) : 0; if (good) { ok++; score += pts; } sfx(good ? 'correct' : 'wrong'); later(next, 1100); };
        const head = (lbl, q) => `${hud([['mxR', 'Ronda', `${i}/10`], ['mxS', 'Puntaje', score]])}<div class="glass-card rounded-3xl p-5 space-y-3"><p class="text-[10px] uppercase tracking-widest text-amber-500 font-bold">${lbl}</p>${q}`;
        if (k === 'img') { const [e, a, w] = pick(EMOJI_Q), opts = shuf([a, ...w]); body().innerHTML = wrap(head('🖼️ ¿Qué representa la imagen?', `<div class="v8-emojiq">${e}</div><div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${opts.map((o, j) => `<button class="opt-btn" data-j="${j}">${esc(o)}</button>`).join('')}</div></div>`)); bindOpts(opts, a, done); }
        if (k === 'vf') { const q = pick(V8.pool()), truth = rr() < .5, shown = truth ? q.a : pick(q.w); body().innerHTML = wrap(head('✅ ¿Verdadero o falso?', `<p class="font-bold text-amber-100 text-lg">${esc(q.q)}</p><p class="text-xl text-center my-3">→ <b class="text-amber-200">${esc(shown)}</b></p><div class="grid grid-cols-2 gap-2"><button class="opt-btn" data-j="0">✅ Verdadero</button><button class="opt-btn" data-j="1">❌ Falso</button></div><p class="hidden text-xs text-stone-400" id="vfA">La respuesta es: <b>${esc(q.a)}</b></p></div>`)); bindOpts(['✅ Verdadero', '❌ Falso'], truth ? '✅ Verdadero' : '❌ Falso', g => { $('vfA') && $('vfA').classList.remove('hidden'); done(g); }); }
        if (k === 'quien') { const q = pick(QUOTES.q), opts = shuf([q.a, ...q.w]); body().innerHTML = wrap(head('❝ ¿Quién lo dijo?', `<p class="font-bold text-amber-100 text-lg font-handwriting">${esc(q.q)}</p><div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${opts.map((o, j) => `<button class="opt-btn" data-j="${j}">${esc(o)}</button>`).join('')}</div></div>`)); bindOpts(opts, q.a, done); }
        if (k === 'ord') {
          const [movie, ev] = pick(ORDER_Q), sh = shuf(ev.map((e, j) => [e, j])), picked = [];
          body().innerHTML = wrap(head(`🔢 Ordena los sucesos · ${movie}`, `<p class="text-xs text-stone-400">Toca los sucesos en el orden en que pasaron.</p><div class="grid gap-2" id="ordBox">${sh.map(([e, j]) => `<button class="opt-btn !text-left" data-o="${j}">${esc(e)}</button>`).join('')}</div></div>`));
          [...document.querySelectorAll('#ordBox button')].forEach(b => b.onclick = () => { if (b.disabled) return; b.disabled = true; picked.push(+b.dataset.o); b.insertAdjacentHTML('afterbegin', `<span class="key-hint">${picked.length}</span>`); if (picked.length === 4) { const good = picked.every((v, j) => v === j); [...document.querySelectorAll('#ordBox button')].forEach(x => x.classList.add(good ? 'correct' : 'wrong')); if (!good) $('ordBox').insertAdjacentHTML('beforeend', `<p class="text-xs text-stone-300">Orden correcto: ${ev.map((e, j) => `${j + 1}. ${esc(e)}`).join(' · ')}</p>`); done(good); } });
        }
      };
      function bindOpts(opts, ans, cb) { const bs = [...document.querySelectorAll('.v8-game .opt-btn[data-j]')]; bs.forEach(b => b.onclick = () => { const o = opts[+b.dataset.j], good = o === ans; bs.forEach((x, j) => { x.disabled = true; if (opts[j] === ans) x.classList.add('correct'); }); if (!good) b.classList.add('wrong'); V8.emit('answer', { ok: good, q: { q: o, a: ans }, source: 'mixta' }); cb(good); }); }
      next();
    }
  });

  /* =====================================================================
     3. SNAP EXPLOSIVO
  ===================================================================== */
  const SNAP_SYM = ['⚡', '🦉', '🧹', '🐍', '🦁', '🦅', '🦡', '🔮', '🪄', '🏰'];
  def('snap', {
    howto: ['Las cartas caen de a una en la pila.', 'Cuando salen dos iguales seguidas, toca ¡SNAP! antes que tu rival.', 'Si tocas cuando no son iguales, pierdes un punto. Gana quien llegue a 7.'],
    intro() { body().innerHTML = wrap(`<div class="glass-card rounded-3xl p-6 text-center space-y-3"><div class="text-6xl">💥</div><p class="text-sm text-stone-300">Toca ¡SNAP! cuando salgan dos cartas iguales seguidas. ¡Cuidado, las cartas explotan!</p><div class="flex gap-2 justify-center flex-wrap"><button class="btn-gold" onclick="V8G.snap('ia')">🤖 Contra la IA</button><button class="btn-ghost" onclick="V8G.snap('2p')">👥 Dos en este celular</button><button class="btn-ghost" onclick="V8G.online('snap')">🌐 Contra un amigo en línea</button></div></div>`); ON.active = false; },
    play() { GAMES_IMPL.snap.start(GAMES_IMPL.snap.mode || 'ia'); },
    start(mode) {
      begin('snap'); GAMES_IMPL.snap.mode = mode;
      const sc = [0, 0], names = mode === 'ia' ? ['Tú', 'IA 🤖'] : ['Jugador 1', 'Jugador 2'];
      let prev = null, cur = null, open = false, speed = 1300, aiT = 0; const rr = V8.rng(Math.floor(Math.random() * 2 ** 31));
      body().innerHTML = wrap(`<div class="v8-snap">${mode === '2p' ? `<button class="snapbtn p2" id="snB">💥 SNAP<br><small>${names[1]}</small></button>` : ''}
        <div class="score"><span>${names[0]} <b id="sn0">0</b></span><span>${names[1]} <b id="sn1">0</b></span></div>
        <div class="pile"><div class="card prev" id="snP"></div><div class="card cur" id="snC">🂠</div></div><p id="snMsg" class="text-center text-sm text-stone-300 h-5"></p>
        <button class="snapbtn" id="snA">💥 ¡SNAP!${mode === '2p' ? `<br><small>${names[0]}</small>` : ''}</button></div>`);
      const msg = t => set('snMsg', t);
      const point = (who, good) => { if (!RUN) return; sc[who] = Math.max(0, sc[who] + (good ? 1 : -1)); set('sn0', sc[0]); set('sn1', sc[1]); if (good) { open = false; clearTimeout(aiT); const c = $('snC'); c.classList.add('boom'); sfx('zap'); burst(innerWidth / 2, innerHeight / 2, '#f97316', 40); msg(`¡${names[who]} gana la jugada!`); prev = null; }
        else { sfx('wrong'); msg(`${names[who]} se equivocó: −1`); }
        if (sc[who] >= 7) { const youWin = mode === '2p' || who === 0; later(() => end('snap', { icon: youWin ? '🏆' : '💥', title: mode === '2p' ? `¡Ganó ${names[who]}!` : youWin ? '¡Ganaste al Snap!' : 'La IA ganó', lines: [`${sc[0]} a ${sc[1]}`], points: youWin && mode === 'ia' ? 40 : mode === '2p' ? 15 : 5 }), 700); RUN.over = true; }
      };
      const snap = who => { if (!RUN || RUN.over) return; if (open) point(who, true); else point(who, false); };
      $('snA').onclick = () => snap(0); if ($('snB')) $('snB').onclick = () => snap(1);
      const kd = e => { if (e.key === ' ' || e.key === 'a' || e.key === 'A') snap(0); if (mode === '2p' && (e.key === 'l' || e.key === 'L')) snap(1); }; addEventListener('keydown', kd); RUN.off = () => removeEventListener('keydown', kd);
      const deal = () => {
        if (!RUN || RUN.over) return;
        open = false; clearTimeout(aiT);
        const c = $('snC'); if (!c) return; c.classList.remove('boom');
        prev = cur; cur = rr() < .3 && prev ? prev : V8.pick(SNAP_SYM, rr);
        $('snP').textContent = prev || ''; c.textContent = cur; c.classList.remove('flip'); void c.offsetWidth; c.classList.add('flip'); sfx('tick');
        if (prev && prev === cur) { open = true; if (mode === 'ia') aiT = later(() => snap(1), 420 + Math.random() * 700 + Math.max(0, 7 - sc[1]) * 40); }
        speed = Math.max(700, 1300 - (sc[0] + sc[1]) * 40);
        later(deal, speed);
      };
      later(deal, 900);
    }
  });
  V8G.snap = m => { GAMES_IMPL.snap.mode = m; GAMES_IMPL.snap.start(m); };

  /* =====================================================================
     4. LABERINTO DEL TORNEO
  ===================================================================== */
  def('laberinto', {
    howto: ['Muévete con las flechas, deslizando el dedo o con los botones.', 'Encuentra la Copa del Torneo. Solo ves cerca de ti.', 'Si un escreguto te toca, vuelves a la entrada.'],
    best: b => b ? `Récord: ${b} s` : '',
    intro: () => intro('laberinto', '🌿', 'Encuentra la Copa de los Tres Magos en el laberinto. Solo ves lo que está cerca. ¡Esquiva a los escregutos!'),
    play() {
      begin('laberinto'); keyHandler();
      const N = 13, cells = Array.from({ length: N * N }, () => ({ w: [1, 1, 1, 1], v: false })); // arriba, derecha, abajo, izquierda
      const at = (x, y) => cells[y * N + x];
      (function carve() { const stack = [[0, 0]]; at(0, 0).v = true; while (stack.length) { const [x, y] = stack[stack.length - 1]; const nb = [[0, -1, 0, 2], [1, 0, 1, 3], [0, 1, 2, 0], [-1, 0, 3, 1]].filter(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < N && ny < N && !at(nx, ny).v; }); if (!nb.length) { stack.pop(); continue; } const [dx, dy, a, b] = V8.pick(nb); at(x, y).w[a] = 0; at(x + dx, y + dy).w[b] = 0; at(x + dx, y + dy).v = true; stack.push([x + dx, y + dy]); } })();
      for (let i = 0; i < 18; i++) { const x = 1 + Math.floor(Math.random() * (N - 2)), y = 1 + Math.floor(Math.random() * (N - 2)), d = Math.floor(Math.random() * 4); const dx = [0, 1, 0, -1][d], dy = [-1, 0, 1, 0][d]; at(x, y).w[d] = 0; at(x + dx, y + dy).w[(d + 2) % 4] = 0; }
      const P = { x: 0, y: 0, rx: 0, ry: 0 }, cup = { x: N - 1, y: N - 1 }, t0 = performance.now();
      const foes = [[N - 1, 0], [0, N - 1], [6, 6]].map(([x, y]) => ({ x, y, rx: x, ry: y, last: 0 }));
      let met = new Set();
      body().innerHTML = wrap(hud([['lbT', '⏱', '0 s'], ['lbH', '🏠 Reinicios', 0]]) + canvasBox('lbCv', '1/1', '', 560) + `<div class="v8-dpad"><button data-d="0">▲</button><button data-d="3">◀</button><button data-d="2">▼</button><button data-d="1">▶</button></div>`);
      const cv = $('lbCv'); let resets = 0;
      const move = d => { const c = at(P.x, P.y); if (c.w[d]) return; P.x += [0, 1, 0, -1][d]; P.y += [-1, 0, 1, 0][d]; sfx('tick'); };
      document.querySelectorAll('.v8-dpad button').forEach(b => { b.onpointerdown = e => { e.preventDefault(); move(+b.dataset.d); }; });
      let sw = null; cv.addEventListener('pointerdown', e => { sw = [e.clientX, e.clientY]; }); cv.addEventListener('pointerup', e => { if (!sw) return; const dx = e.clientX - sw[0], dy = e.clientY - sw[1]; sw = null; if (Math.hypot(dx, dy) < 20) return; move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0)); });
      let kd = 0;
      const loop = now => {
        if (!RUN || RUN.id !== 'laberinto') return; RUN.raf = requestAnimationFrame(loop);
        const k = RUN.keys; if (now - kd > 140) { const d = k.ArrowUp ? 0 : k.ArrowRight ? 1 : k.ArrowDown ? 2 : k.ArrowLeft ? 3 : -1; if (d >= 0) { move(d); kd = now; } }
        P.rx += (P.x - P.rx) * .3; P.ry += (P.y - P.ry) * .3;
        foes.forEach(f => { if (now - f.last > 650) { f.last = now; const opts = [0, 1, 2, 3].filter(d => !at(f.x, f.y).w[d]); const toward = opts.sort((a, b) => { const da = Math.abs(f.x + [0, 1, 0, -1][a] - P.x) + Math.abs(f.y + [-1, 0, 1, 0][a] - P.y), db = Math.abs(f.x + [0, 1, 0, -1][b] - P.x) + Math.abs(f.y + [-1, 0, 1, 0][b] - P.y); return da - db; }); const d = Math.random() < .55 ? toward[0] : V8.pick(opts); f.x += [0, 1, 0, -1][d]; f.y += [-1, 0, 1, 0][d]; } f.rx += (f.x - f.rx) * .2; f.ry += (f.y - f.ry) * .2;
          if (f.x === P.x && f.y === P.y) { P.x = P.y = 0; resets++; set('lbH', resets); sfx('wrong'); flash('rgba(239,68,68,.3)'); if (!met.has('e')) { met.add('e'); V8.discover('escreguto'); } } });
        const secs = Math.round((now - t0) / 1000); set('lbT', secs + ' s');
        if (P.x === cup.x && P.y === cup.y) { RUN.over = true; cancelAnimationFrame(RUN.raf); V8.discover('esfinge'); return end('laberinto', { icon: '🏆', title: `¡Encontraste la Copa en ${secs} s!`, lines: [`Reinicios: ${resets}`], points: Math.max(15, 90 - secs) , record: secs, higher: false }); }
        const [x, w] = fit(cv), c = w / N;
        x.fillStyle = '#0f2a17'; x.fillRect(0, 0, w, w);
        x.strokeStyle = '#2f6b33'; x.lineWidth = c * .32; x.lineCap = 'round';
        for (let yy = 0; yy < N; yy++) for (let xx = 0; xx < N; xx++) { const cl = at(xx, yy), px = xx * c, py = yy * c; x.beginPath(); if (cl.w[0]) { x.moveTo(px, py); x.lineTo(px + c, py); } if (cl.w[1]) { x.moveTo(px + c, py); x.lineTo(px + c, py + c); } if (cl.w[2]) { x.moveTo(px, py + c); x.lineTo(px + c, py + c); } if (cl.w[3]) { x.moveTo(px, py); x.lineTo(px, py + c); } x.stroke(); }
        x.font = `${c * .7}px serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText('🏆', (cup.x + .5) * c, (cup.y + .5) * c);
        foes.forEach(f => x.fillText('🦂', (f.rx + .5) * c, (f.ry + .5) * c));
        x.fillText('🧙', (P.rx + .5) * c, (P.ry + .5) * c);
        // niebla: solo se ve cerca
        const g = x.createRadialGradient((P.rx + .5) * c, (P.ry + .5) * c, c * 1.3, (P.rx + .5) * c, (P.ry + .5) * c, c * 3.6); g.addColorStop(0, 'rgba(5,10,6,0)'); g.addColorStop(1, 'rgba(5,10,6,.97)'); x.fillStyle = g; x.fillRect(0, 0, w, w);
      };
      RUN.raf = requestAnimationFrame(loop);
    }
  });

  /* =====================================================================
     5. DEFENSA CONTRA LAS ARTES OSCURAS
  ===================================================================== */
  const DCAO_FOES = [['boggart', '👤', 'Riddikulus'], ['dementor', '🌫️', 'Expecto Patronum'], ['duendecillo', '🧚', 'Immobilus'], ['gorro', '🧢', 'Expelliarmus'], ['hinkypunk', '🏮', 'Lumos'], ['inferi', '💀', 'Incendio']];
  const ARROWS = ['⬆️', '➡️', '⬇️', '⬅️'];
  def('dcao', {
    howto: ['Aparece una criatura con un gesto: ⬆️ ➡️ ⬇️ ⬅️.', 'Desliza el dedo en esa dirección (o usa las flechas del teclado) antes de que llegue a ti.', 'Tienes 3 vidas. ¡Cada vez son más rápidas!'],
    best: b => b ? `Récord: ${b} criaturas` : '',
    intro: () => intro('dcao', '🛡️', 'Las criaturas oscuras se acercan. Haz el gesto correcto con el dedo para lanzar el hechizo y vencerlas.'),
    play() {
      begin('dcao'); keyHandler();
      let lives = 3, beaten = 0, foe = null, speed = 4200; const rr = V8.rng(Math.floor(Math.random() * 2 ** 31));
      body().innerHTML = wrap(hud([['dcL', '❤️', '❤️❤️❤️'], ['dcB', '⚔️ Vencidas', 0]]) + `<div class="v8-dcao" id="dcBox"><div class="foe" id="dcFoe"></div><div class="need" id="dcNeed"></div><div class="spell" id="dcSpell"></div><p class="text-center text-xs text-stone-400 absolute bottom-2 inset-x-0">Desliza el dedo en la dirección de la flecha</p></div>`);
      const box = $('dcBox');
      const spawn = () => { if (!RUN || RUN.over) return; const [id, e, sp] = V8.pick(DCAO_FOES, rr), n = beaten >= 8 ? 2 : 1, seq = Array.from({ length: n }, () => Math.floor(rr() * 4)); foe = { id, e, sp, seq, t0: performance.now(), dur: speed }; $('dcFoe').textContent = e; $('dcNeed').innerHTML = seq.map(d => `<span>${ARROWS[d]}</span>`).join(''); $('dcFoe').className = 'foe in'; };
      const hit = d => { if (!foe || RUN.over) return; if (foe.seq[0] === d) { foe.seq.shift(); $('dcNeed').firstElementChild && $('dcNeed').firstElementChild.remove(); sfx('spell'); if (!foe.seq.length) { beaten++; set('dcB', beaten); const sp = $('dcSpell'); sp.textContent = foe.sp + '!'; sp.classList.remove('show'); void sp.offsetWidth; sp.classList.add('show'); sfx('zap'); burst(innerWidth / 2, innerHeight / 2, '#93c5fd', 30); V8.discover(foe.id); const spl = V8.SPELLS.find(s => s.n === foe.sp); if (spl) V8.learnSpell(spl.id, true); $('dcFoe').className = 'foe out'; foe = null; speed = Math.max(1500, speed - 180); later(spawn, 500); } } else { sfx('wrong'); flash('rgba(239,68,68,.25)'); } };
      let s0 = null; box.addEventListener('pointerdown', e => { s0 = [e.clientX, e.clientY]; }); box.addEventListener('pointerup', e => { if (!s0) return; const dx = e.clientX - s0[0], dy = e.clientY - s0[1]; s0 = null; if (Math.hypot(dx, dy) < 25) return; hit(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0)); });
      const kd = e => { const m = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key]; if (m != null) { e.preventDefault(); hit(m); } }; addEventListener('keydown', kd); const prevOff = RUN.off; RUN.off = () => { removeEventListener('keydown', kd); prevOff && prevOff(); };
      const loop = now => { if (!RUN || RUN.id !== 'dcao') return; RUN.raf = requestAnimationFrame(loop); if (!foe) return; const k = (now - foe.t0) / foe.dur; $('dcFoe').style.transform = `scale(${.5 + k * 1.6})`; $('dcFoe').style.opacity = Math.min(1, .3 + k);
        if (k >= 1) { lives--; set('dcL', '❤️'.repeat(lives) + '🖤'.repeat(3 - lives)); sfx('wrong'); flash('rgba(0,0,0,.5)'); foe = null; $('dcFoe').className = 'foe out'; if (lives <= 0) { RUN.over = true; return end('dcao', { icon: '🛡️', title: `Venciste ${beaten} criaturas`, points: beaten * 5, record: beaten }); } later(spawn, 700); } };
      later(spawn, 600); RUN.raf = requestAnimationFrame(loop);
    }
  });

  /* =====================================================================
     6. BOSQUE PROHIBIDO
  ===================================================================== */
  def('bosque', {
    howto: ['Mueve el dedo o el mouse: tu varita ilumina con Lumos.', 'Toca las criaturas escondidas que encuentres.', 'Tienes 60 segundos para encontrar 6.'],
    best: b => b ? `Récord: ${b} criaturas` : '',
    intro: () => intro('bosque', '🌲', 'Es de noche en el Bosque Prohibido. Ilumina con Lumos y toca las criaturas escondidas antes de que pase un minuto.'),
    play() {
      begin('bosque');
      const pool = V8.BEASTS.filter(b => b.w === 'bosque'), list = V8.shuffle(pool).slice(0, 6).map(b => ({ ...b, x: .08 + Math.random() * .84, y: .2 + Math.random() * .7, found: false }));
      let t = 60, found = 0, L = { x: .5, y: .5 };
      const trees = Array.from({ length: 40 }, () => ({ x: Math.random(), y: .1 + Math.random() * .9, s: .6 + Math.random() * .8 })).sort((a, b) => a.y - b.y);
      body().innerHTML = wrap(hud([['bqT', '⏱', 60], ['bqF', '🐾', '0/6']]) + canvasBox('bqCv', '4/3'));
      const cv = $('bqCv');
      const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
      cv.addEventListener('pointermove', e => { [L.x, L.y] = pos(e); });
      cv.addEventListener('pointerdown', e => { const [px, py] = pos(e); L.x = px; L.y = py; const r = cv.getBoundingClientRect(); list.forEach(b => { if (!b.found && Math.hypot((b.x - px) * r.width, (b.y - py) * r.height) < 40 && Math.hypot(b.x - L.x, b.y - L.y) < .2) { b.found = true; found++; set('bqF', `${found}/6`); sfx('correct'); V8.discover(b.id); toast(`¡Encontraste un ${b.n}!`, b.e); if (found === 6) finish(); } }); });
      const finish = () => { if (RUN.over) return; RUN.over = true; end('bosque', { icon: found === 6 ? '🏆' : '🌲', title: `Encontraste ${found} de 6 criaturas`, lines: [found === 6 ? `¡Con ${t} segundos de sobra!` : 'El bosque guarda sus secretos…'], points: found * 8 + (found === 6 ? t : 0), record: found }); };
      every(() => { if (RUN.over) return; t--; set('bqT', t); if (t <= 0) finish(); if (Math.random() < .3) tone(80 + Math.random() * 40, .6, 'sine', .02); }, 1000);
      const loop = now => {
        if (!RUN || RUN.id !== 'bosque') return; RUN.raf = requestAnimationFrame(loop);
        const [x, w, h] = fit(cv);
        x.fillStyle = '#04110a'; x.fillRect(0, 0, w, h);
        for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,255,220,${.2 + .2 * Math.sin(now / 500 + i)})`; x.fillRect((i * 97) % w, (i * 53) % (h * .2), 1.5, 1.5); }
        list.forEach(b => { if (b.found) return; x.font = `${w / 14}px serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.globalAlpha = .9; x.fillText(b.e, b.x * w, b.y * h + Math.sin(now / 600 + b.x * 9) * 3); x.globalAlpha = 1; });
        trees.forEach(tr => { const tx = tr.x * w, ty = tr.y * h, s = tr.s * w / 12; x.fillStyle = '#0a2414'; x.beginPath(); x.moveTo(tx, ty - s * 2.2); x.lineTo(tx - s * .8, ty); x.lineTo(tx + s * .8, ty); x.fill(); x.fillStyle = '#2a1608'; x.fillRect(tx - s * .1, ty, s * .2, s * .4); });
        // oscuridad y luz de Lumos
        const lx = L.x * w, ly = L.y * h, r = w * .17;
        x.save(); x.fillStyle = 'rgba(0,0,0,.94)'; x.beginPath(); x.rect(0, 0, w, h); x.arc(lx, ly, r, 0, Math.PI * 2, true); x.fill('evenodd'); x.restore();
        const g = x.createRadialGradient(lx, ly, 0, lx, ly, r); g.addColorStop(0, 'rgba(255,250,210,.25)'); g.addColorStop(.7, 'rgba(255,250,210,.05)'); g.addColorStop(1, 'rgba(0,0,0,.85)'); x.fillStyle = g; x.beginPath(); x.arc(lx, ly, r, 0, 7); x.fill();
        list.forEach(b => { if (b.found) { x.font = `${w / 30}px serif`; x.fillText('✔', b.x * w, b.y * h); } });
      };
      RUN.raf = requestAnimationFrame(loop);
    }
  });

  /* =====================================================================
     7. LAGO NEGRO
  ===================================================================== */
  def('lago', {
    howto: ['Toca o mantén el dedo donde quieres nadar (o usa las flechas).', 'Junta perlas, esquiva a los grindylows y llega hasta tu amigo atado en el fondo.', 'Las branquialgas duran 60 segundos.'],
    best: b => b ? `Récord: ${b} perlas` : '',
    intro: () => { const extra = st().gilly ? ' Tienes branquialgas de tu invernadero: +15 segundos.' : ''; intro('lago', '🌊', 'Comiste branquialgas: puedes respirar bajo el agua por 60 segundos. Rescata a tu amigo en el fondo del Lago Negro.' + extra); },
    play() {
      begin('lago'); keyHandler();
      const s = st(); let t = 60 + (s.gilly ? 15 : 0); if (s.gilly) { s.gilly = 0; save(); }
      const P = { x: .1, y: .15, tx: .1, ty: .15 }, goal = { x: .88, y: .85 }, pearls = Array.from({ length: 12 }, () => ({ x: .1 + Math.random() * .8, y: .2 + Math.random() * .7, got: false }));
      const foes = Array.from({ length: 5 }, (_, i) => ({ x: .25 + i * .14, y: .3 + Math.random() * .5, vx: (Math.random() - .5) * .004, vy: (Math.random() - .5) * .004 }));
      let got = 0, hits = 0, seen = new Set(), hold = false;
      body().innerHTML = wrap(hud([['lgT', '🫧 Aire', t], ['lgP', '🦪 Perlas', 0]]) + canvasBox('lgCv', '16/10'));
      const cv = $('lgCv'), pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
      cv.addEventListener('pointerdown', e => { hold = true; [P.tx, P.ty] = pos(e); }); cv.addEventListener('pointermove', e => { if (hold || e.pointerType === 'mouse') [P.tx, P.ty] = pos(e); }); addEventListener('pointerup', () => hold = false);
      const finish = win => { if (RUN.over) return; RUN.over = true; if (win) { ['grindylow', 'sirena'].forEach(id => V8.discover(id)); } end('lago', { icon: win ? '🏆' : '🌊', title: win ? '¡Rescataste a tu amigo!' : 'Se acabó el aire…', lines: [`Perlas: ${got} · Golpes de grindylow: ${hits}`], points: (win ? 40 : 5) + got * 3, record: got }); };
      every(() => { if (RUN.over) return; t--; set('lgT', t); if (t <= 0) finish(false); }, 1000);
      const loop = now => {
        if (!RUN || RUN.id !== 'lago') return; RUN.raf = requestAnimationFrame(loop);
        const _st = RUN; _st._acc = Math.min(100, (_st._acc || 0) + (now - (_st._t || now))); _st._t = now;
        while (_st._acc >= 16.67 && RUN === _st && !RUN.over) { _st._acc -= 16.67;
        const k = RUN.keys; if (k.ArrowLeft) P.tx = P.x - .05; if (k.ArrowRight) P.tx = P.x + .05; if (k.ArrowUp) P.ty = P.y - .05; if (k.ArrowDown) P.ty = P.y + .05;
        P.x += V8.clamp(P.tx - P.x, -.006, .006); P.y += V8.clamp(P.ty - P.y, -.006, .006); P.x = V8.clamp(P.x, .02, .98); P.y = V8.clamp(P.y, .05, .97);
        pearls.forEach(p => { if (!p.got && Math.hypot(p.x - P.x, (p.y - P.y) * .62) < .04) { p.got = true; got++; set('lgP', got); sfx('correct'); } });
        foes.forEach(f => { f.x += f.vx + (P.x - f.x) * .0015; f.y += f.vy + (P.y - f.y) * .0015; if (f.x < .1 || f.x > .95) f.vx *= -1; if (f.y < .15 || f.y > .95) f.vy *= -1; if (Math.hypot(f.x - P.x, (f.y - P.y) * .62) < .045) { hits++; t = Math.max(0, t - 5); set('lgT', t); P.tx = P.x - .15; sfx('wrong'); flash('rgba(37,99,235,.3)'); f.x += .1; } });
        if (Math.hypot(goal.x - P.x, (goal.y - P.y) * .62) < .06) finish(true);
        [['calamar', .5, .25], ['kelpie', .2, .8], ['plimpy', .7, .55]].forEach(([id, bx, by]) => { if (!seen.has(id) && Math.hypot(bx - P.x, by - P.y) < .12) { seen.add(id); V8.discover(id); } });
        }
        if (!RUN || RUN.id !== 'lago') return;
        const [x, w, h] = fit(cv), g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0e4a6e'); g.addColorStop(1, '#020b1a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
        for (let i = 0; i < 8; i++) { x.strokeStyle = 'rgba(56,189,248,.08)'; x.lineWidth = 30; x.beginPath(); x.moveTo((i * .15 + Math.sin(now / 2000 + i) * .02) * w, 0); x.lineTo((i * .15 - .1) * w, h); x.stroke(); }
        x.fillStyle = '#14532d'; for (let i = 0; i < 14; i++) { const bx = i / 13 * w; x.beginPath(); x.moveTo(bx, h); x.quadraticCurveTo(bx + Math.sin(now / 700 + i) * 15, h * .82, bx + 5, h * .7 - (i % 3) * 20); x.lineTo(bx + 10, h); x.fill(); }
        x.font = `${w / 24}px serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText('🐙', .5 * w, .25 * h); x.fillText('🐎', .2 * w, .8 * h); x.fillText('🐡', .7 * w, .55 * h);
        pearls.forEach(p => { if (!p.got) x.fillText('🦪', p.x * w, p.y * h); });
        foes.forEach(f => x.fillText('🦑', f.x * w, f.y * h));
        x.fillText('🧜', goal.x * w, goal.y * h); x.fillText('🧑‍🦱', goal.x * w + w / 30, goal.y * h);
        x.save(); x.translate(P.x * w, P.y * h); x.scale(P.tx < P.x ? -1 : 1, 1); x.fillText('🏊', 0, 0); x.restore();
        if (Math.random() < .3) { x.fillStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.arc(P.x * w + 8, P.y * h - 14 - Math.random() * 20, 2, 0, 7); x.fill(); }
      };
      RUN.raf = requestAnimationFrame(loop);
    }
  });

  /* =====================================================================
     8. GOBSTONES
  ===================================================================== */
  def('gobstones', {
    howto: ['Arrastra hacia atrás desde tu canica y suelta para lanzarla (como una resortera).', 'Gana puntos cada canica tuya dentro del círculo al final.', 'Cada uno lanza 3 canicas. ¡Puedes sacar las de la IA golpeándolas!'],
    intro: () => intro('gobstones', '🔮', 'El juego de canicas de los magos. Lanza tus 3 canicas al círculo; la IA lanza las suyas. Gana quien tenga más dentro.'),
    play() {
      begin('gobstones');
      body().innerHTML = wrap(hud([['gbM', 'Tú', 0], ['gbA', 'IA 🤖', 0], ['gbN', 'Turno', 'Tú']]) + canvasBox('gbCv', '3/4', '', 460));
      const cv = $('gbCv'), balls = [], ring = { x: .5, y: .38, r: .2 };
      let turn = 0, shots = [0, 0], aim = null, moving = false;
      const launch = (who, vx, vy) => { balls.push({ who, x: .5, y: .9, vx, vy }); shots[who]++; moving = true; sfx('spell'); };
      const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
      cv.addEventListener('pointerdown', e => { if (turn !== 0 || moving || RUN.over) return; aim = pos(e); });
      cv.addEventListener('pointermove', e => { if (aim) aim.cur = pos(e); });
      cv.addEventListener('pointerup', e => { if (!aim) return; const p = pos(e), dx = aim[0] - p[0], dy = aim[1] - p[1]; aim = null; if (Math.hypot(dx, dy) < .03) return; launch(0, dx * .06, dy * .06); });
      const score = who => balls.filter(b => b.who === who && Math.hypot(b.x - ring.x, (b.y - ring.y) * 4 / 3) < ring.r).length;
      const aiShot = () => { const tx = ring.x + (Math.random() - .5) * .2, ty = ring.y + (Math.random() - .5) * .12, dx = tx - .5, dy = ty - .9, k = (.92 + Math.random() * .2) / 40; launch(1, dx * k, dy * k); };
      const nextTurn = () => { set('gbM', score(0)); set('gbA', score(1)); if (shots[0] >= 3 && shots[1] >= 3) { RUN.over = true; const a = score(0), b = score(1); return later(() => end('gobstones', { icon: a > b ? '🏆' : a === b ? '🤝' : '🔮', title: a > b ? '¡Ganaste a Gobstones!' : a === b ? 'Empate' : 'Ganó la IA', lines: [`${a} contra ${b} canicas en el círculo`], points: a > b ? 35 : a === b ? 15 : 5 }), 600); } turn = turn ? 0 : 1; if (turn === 1 && shots[1] >= 3) turn = 0; if (turn === 0 && shots[0] >= 3) turn = 1; set('gbN', turn ? 'IA 🤖' : 'Tú'); if (turn === 1) later(aiShot, 900); };
      const loop = (now = performance.now()) => {
        if (!RUN || RUN.id !== 'gobstones') return; RUN.raf = requestAnimationFrame(loop);
        const _st = RUN; _st._acc = Math.min(100, (_st._acc || 0) + (now - (_st._t || now))); _st._t = now; if (!moving) _st._acc = 0;
        while (moving && _st._acc >= 16.67) { _st._acc -= 16.67;
          let any = false; balls.forEach(b => { b.x += b.vx; b.y += b.vy; b.vx *= .975; b.vy *= .975; if (b.x < .03 || b.x > .97) { b.vx *= -.7; b.x = V8.clamp(b.x, .03, .97); } if (b.y < .03 || b.y > .97) { b.vy *= -.7; b.y = V8.clamp(b.y, .03, .97); } if (Math.hypot(b.vx, b.vy) > .0004) any = true; else { b.vx = b.vy = 0; } });
          for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) { const a = balls[i], b = balls[j], dx = b.x - a.x, dy = (b.y - a.y) * 4 / 3, d = Math.hypot(dx, dy); if (d < .056 && d > 0) { const nx = dx / d, ny = dy / d, p = (a.vx * nx + a.vy * ny) - (b.vx * nx + b.vy * ny); if (p > 0) { a.vx -= p * nx; a.vy -= p * ny; b.vx += p * nx; b.vy += p * ny; sfx('tick'); } const o = (.056 - d) / 2; a.x -= nx * o; b.x += nx * o; a.y -= ny * o * .75; b.y += ny * o * .75; } }
          if (!any) { moving = false; nextTurn(); }
        }
        const [x, w, h] = fit(cv);
        const g = x.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, h); g.addColorStop(0, '#5b3418'); g.addColorStop(1, '#2a1608'); x.fillStyle = g; x.fillRect(0, 0, w, h);
        x.strokeStyle = '#fcd34d'; x.lineWidth = 4; x.setLineDash([10, 8]); x.beginPath(); x.arc(ring.x * w, ring.y * h, ring.r * w, 0, 7); x.stroke(); x.setLineDash([]);
        balls.forEach(b => { const rg = x.createRadialGradient(b.x * w - 4, b.y * h - 4, 2, b.x * w, b.y * h, w * .03); rg.addColorStop(0, b.who ? '#bbf7d0' : '#fecaca'); rg.addColorStop(1, b.who ? '#047857' : '#b91c1c'); x.fillStyle = rg; x.beginPath(); x.arc(b.x * w, b.y * h, w * .028, 0, 7); x.fill(); });
        if (aim && aim.cur) { x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 2; x.beginPath(); x.moveTo(.5 * w, .9 * h); x.lineTo((.5 + (aim[0] - aim.cur[0]) * 2) * w, (.9 + (aim[1] - aim.cur[1]) * 2) * h); x.stroke(); }
        if (turn === 0 && !moving && shots[0] < 3) { x.fillStyle = 'rgba(254,202,202,.8)'; x.beginPath(); x.arc(.5 * w, .9 * h, w * .028, 0, 7); x.fill(); x.fillStyle = '#fde68a'; x.font = '12px sans-serif'; x.textAlign = 'center'; x.fillText('Arrastra hacia atrás y suelta', .5 * w, .97 * h); }
      };
      RUN.raf = requestAnimationFrame(loop);
    }
  });

  /* =====================================================================
     9. ENCANTAMIENTOS AL RITMO
  ===================================================================== */
  const SONG = [0, 1, 2, 1, 0, 2, 1, 1, 0, 0, 2, 2, 1, 0, 1, 2, 0, 1, 2, 2, 1, 0, 0, 1, 2, 1, 0, 2, 1, 0, 2, 2];
  const NOTES = [523.25, 659.25, 783.99];
  def('ritmo', {
    howto: ['Las notas bajan por tres carriles.', 'Toca el carril (o las teclas A, S, D) cuando la nota llegue a la línea dorada.', 'Perfecto, bien o fallo: ¡termina el encantamiento con buena puntería!'],
    best: b => b ? `Récord: ${b}%` : '',
    intro: () => intro('ritmo', '🎵', 'Toca en el momento justo para que el encantamiento salga perfecto. Usa los tres carriles o las teclas A, S y D.'),
    play() {
      begin('ritmo');
      const spb = .5, start = performance.now() + 1500, notes = SONG.map((l, i) => ({ l, t: i * spb * (i > 16 ? .8 : 1) + (i > 16 ? 16 * spb * .2 : 0), hit: 0 }));
      let combo = 0, perfect = 0, good = 0, miss = 0; const word = 'WINGARDIUMLEVIOSA';
      body().innerHTML = wrap(hud([['rtC', 'Combo', 0], ['rtW', 'Hechizo', '…']]) + canvasBox('rtCv', '3/4', '', 460) + `<div class="grid grid-cols-3 gap-2">${['A', 'S', 'D'].map((k, i) => `<button class="btn-ghost !py-3" data-l="${i}">${k}</button>`).join('')}</div>`);
      const cv = $('rtCv'), fb = { t: '', at: 0, c: '' };
      const press = l => { const now = (performance.now() - start) / 1000; let best = null, bd = 9; notes.forEach(n => { if (!n.hit && n.l === l) { const d = Math.abs(n.t - now); if (d < bd) { bd = d; best = n; } } }); if (best && bd < .22) { best.hit = bd < .08 ? 2 : 1; if (best.hit === 2) perfect++; else good++; combo++; tone(NOTES[l] * (best.hit === 2 ? 1 : .5), .2, 'triangle', .12); fb.t = best.hit === 2 ? '¡Perfecto!' : 'Bien'; fb.c = best.hit === 2 ? '#fde047' : '#86efac'; } else { combo = 0; fb.t = 'Fallo'; fb.c = '#fca5a5'; sfx('tick'); } fb.at = performance.now(); set('rtC', combo); set('rtW', word.slice(0, Math.round((perfect + good) / notes.length * word.length)) || '…'); };
      document.querySelectorAll('[data-l]').forEach(b => b.onpointerdown = e => { e.preventDefault(); press(+b.dataset.l); });
      cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(); press(Math.min(2, Math.floor((e.clientX - r.left) / r.width * 3))); });
      const kd = e => { const l = { a: 0, s: 1, d: 2, A: 0, S: 1, D: 2 }[e.key]; if (l != null) press(l); }; addEventListener('keydown', kd); RUN.off = () => removeEventListener('keydown', kd);
      const total = notes[notes.length - 1].t + 1.5;
      const loop = () => {
        if (!RUN || RUN.id !== 'ritmo') return; RUN.raf = requestAnimationFrame(loop);
        const now = (performance.now() - start) / 1000, [x, w, h] = fit(cv), lineY = h * .82;
        notes.forEach(n => { if (!n.hit && now - n.t > .22 && !n.missed) { n.missed = true; miss++; combo = 0; set('rtC', 0); } });
        if (now > total && !RUN.over) { RUN.over = true; const acc = Math.round((perfect + good * .6) / notes.length * 100); if (acc >= 70) V8.learnSpell('wingardiumleviosa'); return end('ritmo', { icon: acc >= 85 ? '🌟' : '🎵', title: `Precisión ${acc}%`, lines: [`Perfectos: ${perfect} · Bien: ${good} · Fallos: ${miss}`, acc >= 70 ? '¡El hechizo Wingardium Leviosa salió perfecto!' : 'La pluma apenas se movió…'], points: Math.round(acc / 2), record: acc }); }
        x.fillStyle = '#1a1028'; x.fillRect(0, 0, w, h);
        ['#7f1d1d', '#065f46', '#1e3a8a'].forEach((c, i) => { x.fillStyle = c + '55'; x.fillRect(i * w / 3 + 4, 0, w / 3 - 8, h); });
        x.fillStyle = '#facc15'; x.fillRect(0, lineY - 2, w, 4);
        notes.forEach(n => { if (n.hit) return; const y = lineY - (n.t - now) * h * .55; if (y < -30 || y > h + 30) return; x.font = `${w / 10}px serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(['🪶', '✨', '🎵'][n.l], (n.l + .5) * w / 3, y); });
        if (performance.now() - fb.at < 500) { x.fillStyle = fb.c; x.font = `bold ${w / 14}px sans-serif`; x.fillText(fb.t, w / 2, h * .5); }
        if (now < 0) { x.fillStyle = '#fde68a'; x.font = `bold ${w / 8}px sans-serif`; x.fillText(Math.ceil(-now), w / 2, h * .4); }
      };
      // acompañamiento musical
      notes.forEach(n => { later(() => tone(NOTES[n.l] / 2, .25, 'sine', .05), start - performance.now() + n.t * 1000); });
      RUN.raf = requestAnimationFrame(loop);
    }
  });

  /* =====================================================================
     10. CLASE DE VUELO
  ===================================================================== */
  def('vuelo', {
    howto: ['Mueve tu escoba con el dedo, el mouse o las flechas.', 'Pasa por el centro de los 15 aros dorados.', 'Medalla de oro con 13 o más aros.'],
    best: b => b ? `Récord: ${b} aros` : '',
    intro: () => intro('vuelo', '🧹', 'Madame Hooch te espera. Pasa por los aros dorados con tu escoba: 15 aros, una medalla según tu puntería.'),
    play() {
      begin('vuelo'); keyHandler();
      const P = { x: 0, y: 0, tx: 0, ty: 0 }; let z = 0, passed = 0, done = 0; const rings = Array.from({ length: 15 }, (_, i) => ({ z: 30 + i * 30, x: (Math.random() - .5) * 1.4, y: (Math.random() - .5) * .9, res: 0 }));
      const clouds = Array.from({ length: 30 }, () => ({ x: (Math.random() - .5) * 8, y: (Math.random() - .5) * 4, z: Math.random() * 480 }));
      body().innerHTML = wrap(hud([['vlR', '⭕ Aros', '0/15']]) + canvasBox('vlCv', '16/10'));
      const cv = $('vlCv'); cv.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); P.tx = ((e.clientX - r.left) / r.width - .5) * 2.2; P.ty = ((e.clientY - r.top) / r.height - .5) * 1.5; });
      const loop = (now = performance.now()) => {
        if (!RUN || RUN.id !== 'vuelo') return; RUN.raf = requestAnimationFrame(loop);
        const _st = RUN; _st._acc = Math.min(100, (_st._acc || 0) + (now - (_st._t || now))); _st._t = now;
        while (_st._acc >= 16.67 && !RUN.over) { _st._acc -= 16.67;
        const k = RUN.keys; if (k.ArrowLeft) P.tx -= .04; if (k.ArrowRight) P.tx += .04; if (k.ArrowUp) P.ty -= .04; if (k.ArrowDown) P.ty += .04; P.tx = V8.clamp(P.tx, -1.1, 1.1); P.ty = V8.clamp(P.ty, -.75, .75);
        P.x += (P.tx - P.x) * .08; P.y += (P.ty - P.y) * .08; z += .55 + passed * .02;
        rings.forEach(r => { if (!r.res && z >= r.z) { done++; r.res = Math.hypot(r.x - P.x, r.y - P.y) < .32 ? 1 : -1; if (r.res > 0) { passed++; sfx('correct'); } else sfx('wrong'); set('vlR', `${passed}/15`); } });
        if (done >= 15 && !RUN.over) { RUN.over = true; const medal = passed >= 13 ? ['🥇', 'oro'] : passed >= 9 ? ['🥈', 'plata'] : passed >= 5 ? ['🥉', 'bronce'] : ['🧹', 'participación']; return end('vuelo', { icon: medal[0], title: `Medalla de ${medal[1]}`, lines: [`Pasaste ${passed} de 15 aros`], points: passed * 4, record: passed }); }
        }
        if (RUN.over) return;
        const [x, w, h] = fit(cv), g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#60a5fa'); g.addColorStop(.6, '#bfdbfe'); g.addColorStop(.6, '#4d7c0f'); g.addColorStop(1, '#365314'); x.fillStyle = g; x.fillRect(0, 0, w, h);
        const proj = (px, py, pz) => { const d = pz - z; if (d <= .5) return null; const s = 2.2 / d; return [w / 2 + (px - P.x) * s * w * .5, h / 2 + (py - P.y) * s * w * .5, s]; };
        clouds.forEach(c => { let cz = c.z; while (cz < z) cz += 480; c.z = cz; const p = proj(c.x, c.y - 1.5, cz); if (!p) return; x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.ellipse(p[0], p[1], p[2] * w * .6, p[2] * w * .25, 0, 0, 7); x.fill(); });
        [...rings].reverse().forEach(r => { if (r.res) return; const p = proj(r.x, r.y, r.z); if (!p) return; x.strokeStyle = '#facc15'; x.lineWidth = Math.max(2, p[2] * w * .05); x.beginPath(); x.arc(p[0], p[1], p[2] * w * .32 * .5 * 1.0, 0, 7); x.stroke(); });
        x.font = `${w / 10}px serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 2; x.beginPath(); x.arc(w / 2, h / 2, 8, 0, 7); x.moveTo(w / 2 - 16, h / 2); x.lineTo(w / 2 - 10, h / 2); x.moveTo(w / 2 + 10, h / 2); x.lineTo(w / 2 + 16, h / 2); x.stroke(); x.save(); x.translate(w / 2, h * .62); x.rotate((P.tx - P.x) * .4); x.fillText('🧹', 0, 0); x.restore();
        x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 1; for (let i = 0; i < 6; i++) { const a = i / 6 * 7 + z * .01; x.beginPath(); x.moveTo(w / 2 + Math.cos(a) * w * .3, h / 2 + Math.sin(a) * h * .3); x.lineTo(w / 2 + Math.cos(a) * w * .6, h / 2 + Math.sin(a) * h * .6); x.stroke(); }
      };
      RUN.raf = requestAnimationFrame(loop);
    }
  });

  /* =====================================================================
     11. POCIONES AVANZADAS
  ===================================================================== */
  const ING = { ala: ['🦇', 'Ala de murciélago'], ojo: ['👁️', 'Ojo de tritón'], pluma: ['🪶', 'Pluma de fénix'], raiz: ['🌿', 'Raíz de mandrágora'], cuerno: ['🦄', 'Pelo de unicornio'], baba: ['🐌', 'Baba de gusarajo'], polvo: ['✨', 'Polvo de luna'], hongo: ['🍄', 'Hongo saltarín'] };
  const RECIPES = [
    { n: 'Poción para curar forúnculos', c: '#22c55e', steps: [['add', 'baba'], ['heat', 2], ['stir', 'cw', 3], ['add', 'hongo']] },
    { n: 'Filtro de la Paz', c: '#93c5fd', steps: [['add', 'polvo'], ['stir', 'ccw', 2], ['heat', 1], ['add', 'pluma'], ['stir', 'cw', 1]] },
    { n: 'Poción Herbovitalizante', c: '#84cc16', steps: [['add', 'raiz'], ['heat', 3], ['add', 'hongo'], ['stir', 'cw', 4]] },
    { n: 'Felix Felicis', c: '#facc15', steps: [['add', 'cuerno'], ['add', 'polvo'], ['heat', 2], ['stir', 'ccw', 3], ['add', 'pluma']] },
    { n: 'Poción de Amortentia', c: '#f472b6', steps: [['add', 'ala'], ['stir', 'cw', 2], ['heat', 1], ['add', 'cuerno'], ['stir', 'ccw', 2]] },
    { n: 'Poción Multijugos', c: '#78716c', steps: [['add', 'ojo'], ['add', 'baba'], ['heat', 3], ['stir', 'cw', 5], ['add', 'raiz']] }
  ];
  def('caldero', {
    howto: ['Sigue la receta paso a paso: echa ingredientes, revuelve y controla el fuego.', 'Si te equivocas, el caldero explota y pierdes estrellas.', 'Haz las 3 pociones de la clase.'],
    best: b => b ? `Récord: ${b} ⭐` : '',
    intro: () => intro('caldero', '⚗️', 'El profesor te pide tres pociones. Lee la receta y haz cada paso en orden: ingredientes, revolver y fuego.'),
    play() {
      begin('caldero');
      const list = V8.shuffle(RECIPES).slice(0, 3); let ri = 0, step = 0, stars = 9, heat = 0, stirN = 0, stirDir = '';
      const render = (msg = '') => {
        const r = list[ri]; if (!r) return;
        body().innerHTML = wrap(`${hud([['cdP', 'Poción', `${ri + 1}/3`], ['cdS', '⭐', stars]])}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="glass-card rounded-3xl p-4"><p class="font-wizard font-bold text-amber-300">📜 ${r.n}</p><ol class="text-sm space-y-1 mt-2">${r.steps.map((s, i) => `<li class="${i < step ? 'line-through text-stone-500' : i === step ? 'text-amber-200 font-bold' : 'text-stone-300'}">${i + 1}. ${s[0] === 'add' ? `Echa ${ING[s[1]][1]} ${ING[s[1]][0]}` : s[0] === 'heat' ? `Pon el fuego en ${['', 'bajo', 'medio', 'alto'][s[1]]}` : `Revuelve ${s[2]} ${s[2] > 1 ? 'veces' : 'vez'} ${s[1] === 'cw' ? '↻ a la derecha' : '↺ a la izquierda'}`}</li>`).join('')}</ol><p class="text-xs mt-2 h-4" id="cdMsg">${msg}</p></div>
            <div class="glass-card rounded-3xl p-4 text-center"><div class="v8-cauldron" style="--pc:${step ? r.c : '#57534e'};--heat:${heat}"><div class="liq"></div><div class="pot">🫕</div><div class="fire">${'🔥'.repeat(heat)}</div></div>
              <div class="flex justify-center gap-2 my-2"><button class="btn-ghost !py-1.5" onclick="V8G.cd('stir','ccw')">↺ Revolver</button><button class="btn-ghost !py-1.5" onclick="V8G.cd('stir','cw')">Revolver ↻</button></div>
              <div class="flex justify-center gap-1 items-center text-xs text-stone-300">Fuego: ${[0, 1, 2, 3].map(h => `<button class="v8-chip ${heat === h ? 'on' : ''}" onclick="V8G.cd('heat',${h})">${['Apagado', 'Bajo', 'Medio', 'Alto'][h]}</button>`).join('')}</div></div></div>
          <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">${Object.entries(ING).map(([k, [e, n]]) => `<button class="v8-ing" onclick="V8G.cd('add','${k}')" title="${n}"><span>${e}</span><small>${n.split(' ')[0]}</small></button>`).join('')}</div>`);
      };
      const fail = () => { stars = Math.max(0, stars - 1); stirN = 0; sfx('wrong'); flash('rgba(34,197,94,.3)'); render('💥 ¡El caldero explotó! Revisa el paso marcado.'); };
      const ok = () => { step++; stirN = 0; sfx('correct'); const r = list[ri]; if (step >= r.steps.length) { V8.emit('potion', {}); ri++; step = 0; heat = 0; fireConfetti({ particleCount: 60, spread: 60 }); if (ri >= 3) { RUN.over = true; return end('caldero', { icon: '⚗️', title: `¡Tres pociones listas! ${stars} ⭐`, lines: [stars >= 8 ? 'El profesor está impresionado.' : 'Bien hecho, con algunas explosiones.'], points: stars * 6, record: stars }); } return render(`✅ ¡${r.n} lista!`); } render('✔ Bien'); };
      V8G.cd = (kind, a) => {
        if (!RUN || RUN.id !== 'caldero' || RUN.over) return; const s = list[ri].steps[step];
        if (kind === 'heat') { heat = a; if (s[0] === 'heat') { if (a === s[1]) ok(); else render(`🔥 Fuego ${['apagado', 'bajo', 'medio', 'alto'][a]}`); } else render(''); return; }
        if (kind === 'add') { if (s[0] === 'add' && s[1] === a) ok(); else fail(); return; }
        if (kind === 'stir') { if (s[0] !== 'stir' || s[1] !== a) return fail(); stirN++; sfx('tick'); if (stirN >= s[2]) ok(); else render(`Revuelves… ${stirN}/${s[2]}`); }
      };
      render();
    }
  });

  /* =====================================================================
     12. HERBOLOGÍA (tu planta crece con los días reales)
  ===================================================================== */
  const PLANTS = { mandragora: { n: 'Mandrágora', e: ['🌰', '🌱', '🌿', '🪴', '👶'], hours: 12, prize: 120 }, branquialga: { n: 'Branquialgas', e: ['🌰', '🌱', '🌿', '🪸'], hours: 8, prize: 60 }, tentacula: { n: 'Tentácula venenosa', e: ['🌰', '🌱', '🌿', '🌵'], hours: 10, prize: 80 } };
  def('herbologia', {
    howto: ['Planta una semilla y cuídala: riégala y dale luz.', 'La planta crece con el paso de las horas reales si está cuidada.', 'Para cosechar la mandrágora, ponte las orejeras antes de jalarla.'],
    intro: () => GAMES_IMPL.herbologia.play(),
    play() {
      begin('herbologia'); const s = st(), p = s.plant, now = Date.now();
      if (!p) { body().innerHTML = wrap(`<div class="glass-card rounded-3xl p-6 text-center space-y-3"><div class="text-6xl">🌱</div><p class="text-sm text-stone-300">La profesora Sprout te da una semilla. ¿Qué quieres plantar? Crece con los días: vuelve a cuidarla.</p><div class="grid grid-cols-1 sm:grid-cols-3 gap-2">${Object.entries(PLANTS).map(([k, v]) => `<button class="glass-card rounded-2xl p-3 hoverable" onclick="V8G.plant('${k}')"><div class="text-4xl">${v.e[v.e.length - 1]}</div><b class="text-amber-200 text-sm">${v.n}</b><p class="text-[11px] text-stone-400">Crece en ~${v.e.length - 1} etapas de ${v.hours} h</p></button>`).join('')}</div></div>`); return; }
      const P = PLANTS[p.type], ready = p.stage >= P.e.length - 1, canWater = now - (p.water || 0) > 4 * 3600000;
      // crece si fue regada en las últimas 24 h
      if (!ready && now - p.grown > P.hours * 3600000 && now - (p.water || 0) < 24 * 3600000) { p.stage++; p.grown = now; save(); }
      const health = Math.max(0, 100 - Math.floor((now - (p.water || p.planted)) / 3600000) * 3);
      body().innerHTML = wrap(`<div class="glass-card rounded-3xl p-6 text-center space-y-3"><p class="font-wizard font-bold text-amber-300 text-lg">${P.n}</p>
        <div class="v8-plant ${p.sun ? 'sun' : ''}"><span class="pl">${P.e[Math.min(p.stage, P.e.length - 1)]}</span><span class="pot">🪴</span></div>
        <p class="text-xs text-stone-400">Etapa ${Math.min(p.stage, P.e.length - 1)}/${P.e.length - 1} · Salud ${health}% · ${ready ? '<b class="text-emerald-300">¡Lista para cosechar!</b>' : `Próxima etapa en ~${Math.max(0, Math.ceil((P.hours * 3600000 - (now - p.grown)) / 3600000))} h (si está regada)`}</p>
        <div class="flex gap-2 justify-center flex-wrap"><button class="btn-ghost" onclick="V8G.water()" ${canWater ? '' : 'disabled'}>💧 Regar ${canWater ? '' : '(ya está húmeda)'}</button><button class="btn-ghost" onclick="V8G.sun()">${p.sun ? '🌥️ Quitar luz' : '☀️ Darle luz'}</button><button class="btn-ghost" onclick="V8G.fert()">🧪 Abono (10 🪙)</button>${ready ? `<button class="btn-gold" onclick="V8G.harvest()">🌾 Cosechar</button>` : ''}</div>
        <p class="text-[11px] text-stone-500">Consejo: riégala al menos una vez al día. El abono la hace crecer de inmediato una etapa.</p></div>`);
    }
  });
  V8G.plant = k => { st().plant = { type: k, planted: Date.now(), grown: Date.now(), water: Date.now(), stage: 0, sun: false }; save(); sfx('correct'); GAMES_IMPL.herbologia.play(); };
  V8G.water = () => { const p = st().plant; p.water = Date.now(); save(); sfx('correct'); toast('Regaste tu planta 💧', '🌱'); V8.emit('pet', {}); GAMES_IMPL.herbologia.play(); };
  V8G.sun = () => { const p = st().plant; p.sun = !p.sun; save(); GAMES_IMPL.herbologia.play(); };
  V8G.fert = () => { const p = st().plant, P = PLANTS[p.type]; if ((S.gold || 0) < 10) return toast('Necesitas 10 galeones.', '🪙'); if (p.stage >= P.e.length - 1) return toast('Ya está lista para cosechar.', '🌾'); S.gold -= 10; p.stage++; p.grown = Date.now(); p.water = Date.now(); save(); updateWallet(); sfx('spell'); GAMES_IMPL.herbologia.play(); };
  V8G.harvest = () => {
    const p = st().plant, P = PLANTS[p.type];
    const reward = () => { const s = st(); s.plant = null; if (p.type === 'branquialga') { s.gilly = 1; toast('Guardaste branquialgas: +15 s de aire en el Lago Negro.', '🌊'); } save(); V8.gold(P.prize, `Cosechaste ${P.n}`); if (p.type === 'mandragora') { V8.discover('mandragora'); unlock('v8mandrake'); } fireConfetti({ particleCount: 80, spread: 80 }); GAMES_IMPL.herbologia.play(); };
    if (p.type !== 'mandragora') return reward();
    let ears = false;
    body().innerHTML = wrap(`<div class="glass-card rounded-3xl p-6 text-center space-y-3"><p class="font-wizard font-bold text-amber-300">¡Cuidado! La mandrágora grita al salir.</p><div class="text-7xl" id="mdE">🪴</div><p class="text-sm text-stone-300">Ponte las orejeras y jala rápido.</p><div class="flex gap-2 justify-center"><button class="btn-ghost" id="mdEar">🎧 Ponerme orejeras</button><button class="btn-gold" id="mdPull">🌾 ¡Jalar!</button></div></div>`);
    const t0 = Date.now();
    $('mdEar').onclick = () => { ears = true; $('mdEar').textContent = '✔ Orejeras puestas'; sfx('tick'); };
    $('mdPull').onclick = () => { $('mdE').textContent = '👶'; if (ears && Date.now() - t0 < 6000) { tone(900, .5, 'sawtooth', .02); reward(); } else { tone(1400, .8, 'sawtooth', .2, 300); flash('rgba(255,255,255,.6)'); toast('¡El grito te desmayó un ratito! Ponte las orejeras primero.', '😵'); later(() => V8G.harvest(), 1600); } };
  };

  /* =====================================================================
     13. ADIVINA EL RETRATO
  ===================================================================== */
  def('retrato', {
    howto: ['El retrato (o la tarjeta con pistas) está tapado por 16 cuadros que se van destapando.', 'Elige quién es antes de que se vea todo: más rápido, más puntos.', 'Puedes poner tus propias imágenes en la carpeta img/personajes (lee la guía).'],
    best: b => b ? `Récord: ${b}` : '',
    intro: () => intro('retrato', '🖼️', 'Ocho retratos tapados. Se destapan de a poco: adivina quién es cuanto antes para ganar más puntos.'),
    play() {
      begin('retrato');
      const rounds = V8.shuffle(V8.CARDS.filter(c => !['nearly', 'fraile', 'dama', 'baron'].includes(c.id))).slice(0, 8); const plans = rounds.map(() => V8.rng(Math.floor(Math.random() * 2 ** 31))); let r = 0, score = 0;
      const next = () => {
        if (!RUN || RUN.id !== 'retrato') return;
        if (r >= rounds.length) return end('retrato', { icon: '🖼️', title: `${score} puntos`, lines: ['¡Buen ojo para los retratos!'], points: Math.round(score / 20), record: score });
        const rr = plans[r], c = rounds[r++], opts = V8.shuffle([c, ...V8.shuffle(V8.CARDS.filter(x => x.id !== c.id), rr).slice(0, 3)], rr);
        const order = V8.shuffle([...Array(16).keys()], rr); let shown = 0, answered = false;
        body().innerHTML = wrap(`${hud([['rtR', 'Retrato', `${r}/8`], ['rtS', 'Puntos', score]])}<div class="v8-portrait-game"><div class="pic" id="rtPic"><div class="clue"><span>${c.sym}</span><b>${c.house || 'Sin casa'}</b><p>${esc(c.info)}</p></div><img alt="" id="rtImg" style="display:none"><div class="tiles">${order.map(i => `<i data-i="${i}"></i>`).join('')}</div></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">${opts.map(o => `<button class="opt-btn" data-id="${o.id}">${esc(o.name)}</button>`).join('')}</div></div>`);
        const img = $('rtImg'); img.onload = () => { img.style.display = 'block'; const cl = $('rtPic').querySelector('.clue'); if (cl) cl.style.display = 'none'; }; img.src = `img/personajes/${c.id}.jpg`;
        const tiles = [...document.querySelectorAll('.v8-portrait-game .tiles i')];
        const reveal = every(() => { if (answered) return; if (shown < 16) { const t = tiles.find(x => +x.dataset.i === order[shown]); t && t.classList.add('off'); shown++; } }, 900);
        document.querySelectorAll('.v8-portrait-game .opt-btn').forEach(b => b.onclick = () => { if (answered) return; answered = true; clearInterval(reveal); const good = b.dataset.id === c.id; tiles.forEach(t => t.classList.add('off')); document.querySelectorAll('.v8-portrait-game .opt-btn').forEach(x => { x.disabled = true; if (x.dataset.id === c.id) x.classList.add('correct'); }); if (!good) b.classList.add('wrong'); if (good) { score += Math.max(10, 100 - shown * 6); set('rtS', score); } sfx(good ? 'correct' : 'wrong'); later(next, 1300); });
      };
      next();
    }
  });

  /* =====================================================================
     14. ESCAPE DEL MES (un capítulo distinto cada mes)
  ===================================================================== */
  const CHAPTERS = [
    { n: 'La biblioteca encantada', i: '📚', p: [
      { t: 'Un libro bloquea la puerta: «Tengo hojas pero no soy árbol, tengo lomo pero no soy animal». ¿Qué soy?', a: ['libro', 'un libro'] },
      { t: 'El candado tiene 3 números: los años en Hogwarts de un alumno (7), las casas (4) y los libros de la saga (7). Escríbelos juntos.', a: ['747'] },
      { t: 'Madame Pince dejó una pista: «Para leer en la oscuridad, di el hechizo de luz».', a: ['lumos'] },
      { t: 'Último acertijo: ¿Qué criatura se transforma en tu mayor miedo?', a: ['boggart', 'un boggart'] }] },
    { n: 'El tren fantasma', i: '🚂', p: [
      { t: '¿Desde qué andén sale el Expreso de Hogwarts? (escribe el número con fracción, por ejemplo 9¾ o 9 3/4)', a: ['9¾', '9 3/4', '93/4', 'nueve tres cuartos'] },
      { t: 'La señora del carrito pregunta: ¿qué dulce trae un cromo de mago?', a: ['rana de chocolate', 'ranas de chocolate', 'rana'] },
      { t: 'Un dementor apaga las luces. ¿Qué hechizo lo aleja?', a: ['expecto patronum'] },
      { t: 'Para abrir la última puerta del vagón suma: hermanos Weasley (7) + fundadores de Hogwarts (4).', a: ['11', 'once'] }] },
    { n: 'La torre de Ravenclaw', i: '🦅', p: [
      { t: 'La aldaba pregunta: «¿Qué fue primero, el fénix o la llama?». Responde como un Ravenclaw: «un círculo no tiene…»', a: ['principio', 'comienzo', 'inicio'] },
      { t: '¿Qué objeto perdido de Rowena Ravenclaw daba sabiduría?', a: ['diadema', 'la diadema'] },
      { t: '¿Qué fantasma vive en la torre de Ravenclaw?', a: ['la dama gris', 'dama gris', 'helena ravenclaw'] },
      { t: 'Clave final: el animal de la casa Ravenclaw.', a: ['aguila', 'águila', 'el aguila', 'el águila'] }] },
    { n: 'Las mazmorras de Snape', i: '🧪', p: [
      { t: 'Hay 7 botellas: una te deja avanzar. «El veneno nunca está a la izquierda del vino de ortiga». Escribe la palabra que más se repite en el acertijo de Snape: ¿lógica o magia?', a: ['logica', 'lógica'] },
      { t: '¿Qué piedra de una cabra te salva de casi todos los venenos?', a: ['bezoar', 'un bezoar'] },
      { t: 'La poción que te da suerte se llama Felix…', a: ['felicis'] },
      { t: 'Clave final: ¿cómo se llamaba el libro del Príncipe Mestizo? Escribe solo la materia: Elaboración de…', a: ['pociones', 'pociones avanzadas'] }] }
  ];
  const nrm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  def('escape2', {
    howto: ['Cada mes hay un capítulo nuevo con 4 acertijos.', 'Escribe la respuesta y toca «Probar». Tienes 5 minutos.', 'Las respuestas no distinguen mayúsculas ni tildes.'],
    best: b => b ? `Récord: ${b} s` : '',
    intro: () => { const c = CHAPTERS[new Date().getMonth() % CHAPTERS.length]; intro('escape2', c.i, `Capítulo del mes: <b>${c.n}</b>. Resuelve 4 acertijos antes de 5 minutos. El premio se gana una vez por mes.`); },
    play() {
      begin('escape2'); const c = CHAPTERS[new Date().getMonth() % CHAPTERS.length]; let i = 0, t = 300, tries = 0; const t0 = Date.now();
      const render = msg => { body().innerHTML = wrap(`${hud([['esT', '⏱', `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`], ['esI', '🔐', `${i + 1}/4`]])}<div class="glass-card rounded-3xl p-5 space-y-3"><p class="font-wizard font-bold text-amber-300">${c.i} ${c.n}</p><p class="text-amber-100">${c.p[i].t}</p><div class="flex gap-2"><input id="esA" class="flex-grow bg-stone-950 border border-amber-700/50 rounded-lg px-3 py-2 text-stone-100" placeholder="Tu respuesta" autocomplete="off"><button class="btn-gold" onclick="V8G.esTry()">Probar</button></div><p class="text-xs h-4">${msg || ''}</p></div>`); const inp = $('esA'); inp.focus(); inp.onkeydown = e => { if (e.key === 'Enter') V8G.esTry(); }; };
      V8G.esTry = () => { const v = nrm(($('esA') || {}).value); if (!v) return; if (c.p[i].a.some(a => nrm(a) === v)) { i++; sfx('correct'); if (i >= 4) { RUN.over = true; const secs = Math.round((Date.now() - t0) / 1000), key = 'esc-' + new Date().getFullYear() + '-' + new Date().getMonth(), first = !st()[key]; if (first) { st()[key] = 1; save(); V8.addFrogs(2); } return end('escape2', { icon: '🗝️', title: `¡Escapaste en ${secs} s!`, lines: [first ? 'Premio del mes: 2 ranas de chocolate 🐸' : 'Ya tenías el premio de este mes.', 'El próximo mes hay un capítulo nuevo.'], points: Math.max(20, 80 - Math.floor(secs / 5)) - tries * 2, record: secs, higher: false }); } render('✔ ¡Correcto! Se abre otra puerta…'); } else { tries++; sfx('wrong'); render('✖ No es eso. Intenta otra vez.'); } };
      every(() => { if (RUN.over) return; t--; set('esT', `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`); if (t <= 0) { RUN.over = true; end('escape2', { icon: '⌛', title: 'Se acabó el tiempo', lines: [`Llegaste al acertijo ${i + 1} de 4.`], points: i * 5 }); } }, 1000);
      render();
    }
  });

  /* =====================================================================
     15. ADIVINACIÓN
  ===================================================================== */
  const PRED = { a: ['Hoy una lechuza te traerá una buena noticia', 'Encontrarás algo que creías perdido', 'Un amigo te pedirá ayuda y serás su héroe', 'Tu varita estará más poderosa que nunca', 'Ganarás un duelo cuando menos lo esperes', 'Alguien de otra casa te sorprenderá', 'Una puerta secreta se abrirá para ti', 'Tu mascota tiene algo importante que decirte'], b: ['si eres valiente como un Gryffindor', 'si usas tu ingenio como un Ravenclaw', 'si eres leal como un Hufflepuff', 'si eres astuto como un Slytherin', 'antes de que se ponga la luna', 'cerca del Gran Salón'], col: ['rojo', 'verde', 'azul', 'dorado', 'plateado', 'violeta'], tip: ['Repasa los hechizos antes de dormir.', 'No le cuentes tus secretos a un diario que habla.', 'Una rana de chocolate mejora cualquier día.', 'Hoy es buen día para retar a un amigo.', 'Escucha a los retratos: saben cosas.'] };
  def('adivinacion', {
    howto: ['Elige una forma de adivinación: té, bola de cristal o cartas.', 'Recibes una predicción para hoy. Cambia cada día.'],
    intro: () => { body().innerHTML = wrap(`<div class="glass-card rounded-3xl p-6 text-center space-y-3"><div class="text-6xl">🔮</div><p class="text-sm text-stone-300">La profesora Trelawney ve algo en tu futuro… Elige cómo quieres saberlo:</p><div class="grid grid-cols-1 sm:grid-cols-3 gap-2">${[['te', '🍵', 'Hojas de té'], ['bola', '🔮', 'Bola de cristal'], ['cartas', '🃏', 'Cartas']].map(([k, e, n]) => `<button class="glass-card rounded-2xl p-4 hoverable" onclick="V8G.fortune('${k}')"><div class="text-5xl">${e}</div><b class="text-amber-200">${n}</b></button>`).join('')}</div></div>`); },
    play() { GAMES_IMPL.adivinacion.intro(); }
  });
  V8G.fortune = k => {
    begin('adivinacion');
    const r = V8.rng(V8.seedOf(V8.day() + k + V8.name())), lucky = 1 + Math.floor(r() * 99);
    const txt = `${V8.pick(PRED.a, r)} ${V8.pick(PRED.b, r)}.`, col = V8.pick(PRED.col, r), tip = V8.pick(PRED.tip, r);
    body().innerHTML = wrap(`<div class="glass-card rounded-3xl p-6 text-center space-y-3"><div class="v8-fortune ${k}">${k === 'te' ? '🍵' : k === 'bola' ? '🔮' : '🃏'}</div><p class="text-xs text-stone-400" id="ftWait">La niebla se mueve…</p><div id="ftOut" class="hidden space-y-2"><p class="font-handwriting text-2xl text-amber-200">«${txt}»</p><p class="text-sm text-stone-300">Número de la suerte: <b class="text-amber-300">${lucky}</b> · Color: <b class="text-amber-300">${col}</b></p><p class="text-xs text-stone-400">Consejo: ${tip}</p><div class="flex gap-2 justify-center"><button class="btn-gold" onclick='V8.share(${JSON.stringify(`🔮 Mi predicción en Hogwarts: «${txt}» Número de la suerte: ${lucky}. ¿Y la tuya?`)}, location.origin + location.pathname)'><i class="fa-brands fa-whatsapp"></i> Compartir</button><button class="btn-ghost" onclick="V8.games.adivinacion.init()">Otra forma</button></div></div></div>`);
    sfx('hat'); if (V8.speak) later(() => V8.speak(txt), 2100);
    later(() => { $('ftWait') && $('ftWait').remove(); $('ftOut') && $('ftOut').classList.remove('hidden'); sfx('spell'); const key = 'adiv-' + V8.day(); if (!st()[key]) { st()[key] = 1; save(); V8.gold(5, 'La profesora Trelawney te da propina'); } }, 2000);
  };

  Object.assign(ACH, { v8mandrake: ['🌱', 'Orejeras puestas', 'Cosecha una mandrágora'] });
})();
