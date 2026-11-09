/* =====================================================================
   HOGWARTS 9.3 · PATRONUS
   Tienda (5 rarezas + míticos por logros + de evento), test gratis,
   ceremonia «Expecto Patronum», patronus 3D de partículas plateadas,
   evolución por uso, álbum, escudo en el duelo, Duelo de Patronus,
   invasión de dementores los fines de semana.
   ===================================================================== */
(() => {
  const RAR = {
    c: { n: 'Común', p: 1000, col: '#cbd5e1' }, r: { n: 'Raro', p: 2500, col: '#7dd3fc' }, e: { n: 'Épico', p: 5000, col: '#c4b5fd' },
    l: { n: 'Legendario', p: 10000, col: '#fde68a' }, m: { n: 'Mítico', p: 0, col: '#f9a8d4' }, ev: { n: 'De evento', p: 3000, col: '#fdba74' }
  };
  const P = [
    // comunes
    ['nutria', 'Nutria', '🦦', 'c', 'Juguetona y brillante, como la de cierta bruja muy lista.'],
    ['liebre', 'Liebre', '🐇', 'c', 'Salta entre los sueños de quienes ven lo que otros no.'],
    ['gato', 'Gato atigrado', '🐈', 'c', 'Sereno y estricto, con marcas alrededor de los ojos.'],
    ['perro', 'Perro fiel', '🐕', 'c', 'Nunca abandona a quien protege.'],
    ['buho', 'Búho', '🦉', 'c', 'Sabio y silencioso en la noche.'],
    ['zorro', 'Zorro', '🦊', 'c', 'Astuto: encuentra salida donde nadie la ve.'],
    ['ardilla', 'Ardilla', '🐿️', 'c', 'Inquieta y valiente pese a su tamaño.'],
    ['erizo', 'Erizo', '🦔', 'c', 'Pequeño, pero ningún dementor se le acerca.'],
    ['mapache', 'Mapache', '🦝', 'c', 'Curioso y lleno de travesuras.'],
    ['gorrion', 'Gorrión', '🐦', 'c', 'Alegre mensajero de las mañanas.'],
    ['tortuga', 'Tortuga', '🐢', 'c', 'Paciente: su escudo de luz es de los más firmes.'],
    ['raton', 'Ratón', '🐁', 'c', 'Diminuto, rápido y sorprendente.'],
    // raros
    ['lobo', 'Lobo', '🐺', 'r', 'Leal a su manada, aúlla a la luna plateada.'],
    ['cisne', 'Cisne', '🦢', 'r', 'Elegante y protector con los suyos.'],
    ['caballo', 'Caballo', '🐎', 'r', 'Corre libre por los terrenos del castillo.'],
    ['delfin', 'Delfín', '🐬', 'r', 'Salta entre las olas del Lago Negro.'],
    ['oso', 'Oso', '🐻', 'r', 'Fuerza tranquila que todo lo resiste.'],
    ['foca', 'Foca', '🦭', 'r', 'Nada en aguas heladas sin miedo al frío.'],
    ['pavo', 'Pavo real', '🦚', 'r', 'Despliega una cola de luz plateada.'],
    ['flamenco', 'Flamenco', '🦩', 'r', 'Equilibrio perfecto sobre una sola pata.'],
    ['jabali', 'Jabalí', '🐗', 'r', 'Embiste a la oscuridad sin dudar.'],
    ['terrier', 'Jack Russell', '🐕‍🦺', 'r', 'Pequeño perro que persigue a los lobos.'],
    // épicos
    ['ciervo', 'Ciervo', '🦌', 'e', 'Noble y poderoso, como el de un buscador famoso.'],
    ['cierva', 'Cierva', '🦌', 'e', 'Siempre fiel, incluso después de mucho tiempo.'],
    ['lince', 'Lince', '🐆', 'e', 'Ágil y misterioso, digno de un auror.'],
    ['tigre', 'Tigre blanco', '🐅', 'e', 'Rugido de plata que hace huir a cualquier sombra.'],
    ['aguila', 'Águila', '🦅', 'e', 'Vuela más alto que la Torre de Astronomía.'],
    ['leon', 'León', '🦁', 'e', 'Valor puro de Gryffindor.'],
    ['ballena', 'Ballena', '🐋', 'e', 'Inmensa y serena, canta en las profundidades.'],
    ['elefante', 'Elefante', '🐘', 'e', 'Memoria eterna y paso firme.'],
    // legendarios
    ['fenix', 'Fénix', '🔥', 'l', 'Renace de sus cenizas. Muy pocos magos lo han conjurado.'],
    ['dragon', 'Dragón plateado', '🐉', 'l', 'Escamas de luz que espantan a un ejército de dementores.'],
    ['unicornio', 'Unicornio', '🦄', 'l', 'Pureza absoluta: ni la magia oscura puede tocarlo.'],
    ['thestral', 'Thestral', '🐴', 'l', 'Solo lo ven quienes han conocido la pérdida.'],
    ['hipogrifo', 'Hipogrifo', '🦅', 'l', 'Orgulloso: inclínate antes de acercarte.'],
    ['kraken', 'Calamar gigante', '🦑', 'l', 'Guardián del Lago Negro, ahora hecho de luz.'],
    // míticos (solo por logros)
    ['grifo', 'Grifo dorado', '🦁', 'm', 'Aparece ante quien completa los 60 cromos.', s => Object.keys((S.v8 || {}).cards || {}).length >= 60, 'Completa los 60 cromos de ranas'],
    ['pegaso', 'Abraxan alado', '🦄', 'm', 'Caballo alado de Beauxbatons para los graduados.', s => (window.V7 && V7.year ? V7.year(S.xp) : 0) >= 6, 'Llega a 7.º año en Hogwarts'],
    ['trueno', 'Ave del trueno', '🦅', 'm', 'Desata tormentas de luz. Para duelistas legendarios.', s => (S.stats || {}).duelsWon >= 50, 'Gana 50 duelos'],
    ['quimera', 'Quimera', '🐲', 'm', 'Solo los grandes coleccionistas de patronus la invocan.', s => (s.owned || []).length >= 20, 'Ten 20 patronus'],
    ['occamy', 'Occamy', '🐍', 'm', 'Cambia de tamaño para llenar cualquier espacio de luz.', s => ((S.v8 || {}).best || {}).snap >= 4 || (S.games || {}).chessDumbledore, 'Gana al Snap en «Gran Mago» o al ajedrez contra Dumbledore'],
    // de evento
    ['calabaza', 'Calabaza fantasma', '🎃', 'ev', 'Solo aparece en Halloween.', null, 'Halloween (20 oct – 2 nov)', (m, d) => (m === 10 && d >= 20) || (m === 11 && d <= 2)],
    ['pinguino', 'Pingüino de las nieves', '🐧', 'ev', 'Se desliza por los pasillos en Navidad.', null, 'Navidad (15 dic – 6 ene)', (m, d) => (m === 12 && d >= 15) || (m === 1 && d <= 6)],
    ['lechuza', 'Lechuza blanca', '🦉', 'ev', 'Llega con cartas el cumpleaños del niño que vivió.', null, 'Cumpleaños de Harry (25 jul – 5 ago)', (m, d) => (m === 7 && d >= 25) || (m === 8 && d <= 5)],
    ['estrella', 'Estrella fugaz', '🌠', 'ev', 'Cruza el cielo en Año Nuevo.', null, 'Año Nuevo (28 dic – 3 ene)', (m, d) => (m === 12 && d >= 28) || (m === 1 && d <= 3)]
  ].map(([id, name, e, r, lore, cond, how, when]) => ({ id, name, e, r, lore, cond, how, when }));
  const byId = id => P.find(p => p.id === id);
  const DEFP = { owned: [], cur: null, casts: {}, test: false, myth: [] };
  const st = () => { const o = S.v9p || (S.v9p = {}); for (const k in DEFP) if (o[k] === undefined) o[k] = JSON.parse(JSON.stringify(DEFP[k])); return o; };
  const LV = [0, 5, 15, 35, 70];
  const level = id => { const n = (st().casts || {})[id] || 0; let l = 1; LV.forEach((t, i) => { if (n >= t) l = i + 1; }); return Math.min(5, l); };
  const price = p => p.r === 'm' ? 0 : RAR[p.r].p;
  const evOpen = p => { if (!p.when) return true; const d = new Date(); return p.when(d.getMonth() + 1, d.getDate()) || new URLSearchParams(location.search).get('evento'); };
  const fmt = n => Number(n).toLocaleString('es-PE');

  /* ---------- el patronus elegido aparece en la tarjeta, el perfil y Expecto Patronum ---------- */
  if (typeof patronusFor === 'function') {
    const _pf = patronusFor;
    patronusFor = name => { const s = st(), p = s.cur && byId(s.cur); return p ? [p.name, p.e] : _pf(name); };
  }

  /* ---------- partículas plateadas con la forma del patronus ---------- */
  const shapeCache = {};
  function shape(emoji, n) {
    const key = emoji + n; if (shapeCache[key]) return shapeCache[key];
    const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d', { willReadFrequently: true });
    x.font = '128px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(emoji, 80, 86);
    const d = x.getImageData(0, 0, 160, 160).data, pts = [];
    for (let y = 0; y < 160; y += 2) for (let xx = 0; xx < 160; xx += 2) { const a = d[(y * 160 + xx) * 4 + 3]; if (a > 120) { const l = (d[(y * 160 + xx) * 4] + d[(y * 160 + xx) * 4 + 1] + d[(y * 160 + xx) * 4 + 2]) / 765; pts.push([(xx - 80) / 70, (y - 80) / 70, l]); } }
    const out = []; for (let i = 0; i < n; i++) { const p = pts.length ? pts[Math.floor(Math.random() * pts.length)] : [0, 0, .5]; out.push({ x: p[0] + (Math.random() - .5) * .02, y: p[1] + (Math.random() - .5) * .02, z: (p[2] - .5) * .45 + (Math.random() - .5) * .12, ph: Math.random() * 6.28 }); }
    return (shapeCache[key] = out);
  }
  const sprite = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(200,235,255,.85)'); g.addColorStop(1, 'rgba(120,190,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return c; })();
  const goldSprite = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,240,1)'); g.addColorStop(.3, 'rgba(255,220,140,.85)'); g.addColorStop(1, 'rgba(255,170,60,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return c; })();
  // dibuja una nube de partículas girada en 3D
  function drawCloud(x, pts, cx, cy, scale, ang, t, opt = {}) {
    const ca = Math.cos(ang), sa = Math.sin(ang), f = 3.2, size = (opt.size || 1) * scale * .045, spr = opt.gold ? goldSprite : sprite;
    x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], wob = Math.sin(t * 2 + p.ph) * .012;
      const px = p.x + wob, pz = p.z, rx = px * ca - pz * sa, rz = px * sa + pz * ca, k = f / (f + rz);
      const sx = cx + rx * scale * k, sy = cy + (p.y + Math.cos(t * 1.7 + p.ph) * .01) * scale * k, s = size * k * (opt.grow || 1);
      x.globalAlpha = (opt.alpha == null ? 1 : opt.alpha) * (.45 + .55 * (.5 + .5 * Math.sin(t * 3 + p.ph)));
      x.drawImage(spr, sx - s, sy - s, s * 2, s * 2);
    }
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  }

  /* ---------- visor 3D (se gira con el dedo) ---------- */
  function viewer(canvas, p) {
    const x = canvas.getContext('2d'); let ang = .3, vel = .006, drag = null, raf = 0;
    const lv = level(p.id), pts = shape(p.e, 500 + lv * 220), gold = p.r === 'l' || p.r === 'm';
    const size = () => { const r = canvas.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); canvas.width = r.width * d; canvas.height = r.height * d; x.setTransform(d, 0, 0, d, 0, 0); };
    size();
    canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, a: ang }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => { if (!drag) return; const na = drag.a + (e.clientX - drag.x) * .012; vel = (na - ang) * .5; ang = na; });
    canvas.addEventListener('pointerup', () => { drag = null; });
    const loop = now => {
      if (!canvas.isConnected) return; raf = requestAnimationFrame(loop);
      const W = canvas.clientWidth, H = canvas.clientHeight, t = now / 1000; if (!drag) { ang += vel; vel += (.006 - vel) * .02; }
      x.clearRect(0, 0, W, H);
      const g = x.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * .6); g.addColorStop(0, `rgba(150,200,255,${.1 + lv * .04})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      drawCloud(x, pts, W / 2, H / 2 + Math.sin(t) * 4, Math.min(W, H) * (.36 + lv * .015), ang, t, { gold, size: .9 + lv * .08 });
    };
    raf = requestAnimationFrame(loop);
  }

  /* ---------- ceremonia «Expecto Patronum» ---------- */
  function ceremony(p, done) {
    const legend = p.r === 'l' || p.r === 'm', dur = legend ? 6200 : 4600;
    const ov = document.createElement('div'); ov.className = 'v9-cere'; ov.innerHTML = `<canvas></canvas><div class="v9-cere-txt"><small>${RAR[p.r].n}</small><b>${p.name}</b><p>${p.lore}</p><button class="btn-gold">✨ ¡Es mío!</button></div>`;
    document.body.appendChild(ov); document.documentElement.classList.add('v9-ingame');
    const cv = ov.querySelector('canvas'), x = cv.getContext('2d'), d = Math.min(2, devicePixelRatio || 1);
    const W = innerWidth, H = innerHeight; cv.width = W * d; cv.height = H * d; x.setTransform(d, 0, 0, d, 0, 0);
    const pts = shape(p.e, legend ? 1500 : 1000), start = pts.map(() => ({ x: (Math.random() - .5) * 4, y: (Math.random() - .5) * 4 }));
    const mist = Array.from({ length: 14 }, () => ({ x: Math.random() * W, y: H * (.5 + Math.random() * .5), r: 120 + Math.random() * 160, v: .2 + Math.random() * .5 }));
    const t0 = performance.now(); sfx('spell'); setTimeout(() => sfx('levelup'), legend ? 2600 : 2000);
    try { if (window.V9 && V9.buzz) setTimeout(() => V9.buzz(legend ? [80, 60, 80, 60, 300] : [60, 40, 160]), 2000); } catch (e) {}
    if (window.V8 && V8.speak) V8.speak('¡Expecto Patronum!');
    const loop = now => {
      if (!ov.isConnected) return; requestAnimationFrame(loop);
      const t = (now - t0) / 1000, k = Math.min(1, (now - t0) / dur);
      x.fillStyle = `rgba(3,5,14,${Math.min(.92, t * 1.4)})`; x.fillRect(0, 0, W, H);
      x.globalCompositeOperation = 'lighter';
      mist.forEach(m => { m.x += m.v; if (m.x - m.r > W) m.x = -m.r; const g = x.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r); g.addColorStop(0, `rgba(140,180,230,${.05 * Math.min(1, t)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(m.x - m.r, m.y - m.r, m.r * 2, m.r * 2); });
      x.globalCompositeOperation = 'source-over';
      if (legend && t > 1.6) { x.save(); x.translate(W / 2, H * .42); x.rotate(t * .25); x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 18; i++) { x.rotate(Math.PI * 2 / 18); x.fillStyle = `rgba(255,230,160,${.05 + .03 * Math.sin(t * 2 + i)})`; x.beginPath(); x.moveTo(0, 0); x.lineTo(-30, -Math.max(W, H)); x.lineTo(30, -Math.max(W, H)); x.fill(); } x.restore(); }
      // fase 1: la luz se junta · fase 2: el patronus corre y llega al centro
      const gather = Math.min(1, Math.max(0, (t - .6) / 1.6)), e = 1 - Math.pow(1 - gather, 3);
      const run = Math.min(1, Math.max(0, (t - 2.2) / 1.8)), er = 1 - Math.pow(1 - run, 3);
      const cx = W / 2 + (1 - er) * (-W * .32) * (gather >= 1 ? 1 : 0), cy = H * .42 + Math.sin(t * 5) * (run < 1 ? 10 : 3);
      const scale = Math.min(W, H) * (.24 + er * .08), lerp = pts.map((p, i) => ({ x: start[i].x + (p.x - start[i].x) * e, y: start[i].y + (p.y - start[i].y) * e, z: p.z, ph: p.ph }));
      drawCloud(x, lerp, cx, cy, scale, Math.sin(t * .8) * .5, t, { gold: legend && t > 2.6, size: 1.1 });
      if (k >= 1 && !ov.classList.contains('show')) { ov.classList.add('show'); fireConfetti({ particleCount: legend ? 200 : 90, spread: 120, colors: legend ? ['#fde68a', '#fff', '#fbbf24'] : ['#e0f2fe', '#bae6fd', '#fff'] }); }
    };
    requestAnimationFrame(loop);
    ov.querySelector('button').onclick = () => { ov.remove(); if (typeof V9 !== 'undefined' && V9.inGame) V9.inGame(); else document.documentElement.classList.remove('v9-ingame'); done && done(); };
  }

  /* ---------- tienda, álbum y mi patronus ---------- */
  const card = p => {
    const s = st(), own = s.owned.includes(p.id), cur = s.cur === p.id, R = RAR[p.r];
    const locked = p.r === 'm' ? !own : p.r === 'ev' && !evOpen(p) && !own;
    const btn = cur ? '<span class="text-[10px] font-bold text-emerald-300">✔ Tu patronus</span>'
      : own ? `<button class="btn-ghost !py-1 !px-2 !text-[10px] w-full" onclick="V9P.equip('${p.id}')">Elegir</button>`
      : p.r === 'm' ? `<span class="text-[10px] text-pink-300 leading-tight block">${p.how}</span>`
      : locked ? `<span class="text-[10px] text-orange-300 leading-tight block">${p.how}</span>`
      : `<button class="btn-gold !py-1 !px-2 !text-[10px] w-full" ${(S.gold || 0) < price(p) ? 'disabled' : ''} onclick="V9P.buy('${p.id}')">🪙 ${fmt(V9P.priceNow(p))}</button>`;
    return `<div class="v9-pcard r-${p.r} ${own ? 'own' : ''} ${cur ? 'cur' : ''}" style="--rc:${R.col}"><div class="em">${p.e}</div><b>${p.name}</b><small>${R.n}${own ? ' · nivel ' + level(p.id) : ''}</small>${btn}</div>`;
  };
  window.V9P = {
    list: P, byId, RAR, level, ceremony,
    priceNow: p => { const off = (window.V9E && V9E.offer && V9E.offer('pat', p.id)) || 0; return Math.round(price(p) * (1 - off)); },
    html(filter = V9P._f || 'all') {
      const s = st(), cur = s.cur && byId(s.cur);
      const groups = ['c', 'r', 'e', 'l', 'm', 'ev'].filter(r => filter === 'all' || filter === r || (filter === 'mine' && P.some(p => p.r === r && s.owned.includes(p.id))));
      return `<div class="space-y-4">
        <div class="v9-pat-hero">${cur ? `<canvas id="v9PatView" aria-label="Tu patronus en 3D"></canvas><div><p class="text-[10px] uppercase tracking-widest text-sky-300">Tu patronus · nivel ${level(cur.id)}/5</p><b class="font-wizard text-2xl text-sky-100">${cur.name}</b><p class="text-xs text-stone-300 mt-1">${cur.lore}</p>
            <div class="v9-lvbar"><i style="width:${Math.min(100, ((s.casts[cur.id] || 0) / 70) * 100)}%"></i></div><p class="text-[10px] text-stone-400">Lánzalo para que brille más: ${s.casts[cur.id] || 0}/70 conjuros</p>
            <button class="btn-gold mt-2" onclick="V9P.cast()">✨ Expecto Patronum</button></div>`
          : `<div class="text-center w-full space-y-2"><div class="text-6xl">🌫️</div><p class="text-sm text-stone-300">Aún no has conjurado tu patronus.</p>${s.test ? '' : '<button class="btn-gold" onclick="V9P.test()">🔮 Descubrir mi patronus (gratis)</button>'}</div>`}</div>
        <div class="flex flex-wrap gap-1.5">${[['all', 'Todos'], ['mine', `Míos (${s.owned.length})`], ['c', 'Comunes'], ['r', 'Raros'], ['e', 'Épicos'], ['l', 'Legendarios'], ['m', 'Míticos'], ['ev', 'De evento']].map(([k, l]) => `<button class="v8-chip ${filter === k ? 'on' : ''}" onclick="V9P._f='${k}';V9P.refresh()">${l}</button>`).join('')}</div>
        ${groups.map(r => `<div><p class="text-xs font-bold mb-1.5" style="color:${RAR[r].col}">${RAR[r].n}${RAR[r].p && r !== 'ev' ? ` · ${fmt(RAR[r].p)} 🪙` : r === 'm' ? ' · solo con logros' : ' · solo en su fecha'}</p><div class="v9-pgrid">${P.filter(p => p.r === r && (filter !== 'mine' || s.owned.includes(p.id))).map(card).join('')}</div></div>`).join('')}
        <p class="text-[11px] text-stone-500">Si un logro te da un patronus que ya tienes, recibes la mitad de su valor en galeones.</p></div>`;
    },
    open() { V8.sheet('🦌 Patronus', `<div id="v9PatBox">${V9P.html()}</div>`, { wide: true }); V9P.mount(); },
    refresh() { const b = $('v9PatBox'); if (b) { b.innerHTML = V9P.html(); V9P.mount(); } const panel = $('v9PatShop'); if (panel) { panel.innerHTML = V9P.html(); V9P.mount(); } },
    mount() { const c = $('v9PatView'), s = st(); if (c && s.cur) viewer(c, byId(s.cur)); },
    equip(id) { const s = st(); if (!s.owned.includes(id)) return; s.cur = id; if (window.V9E && V9E.saveNow) V9E.saveNow(); else save(); sfx('spell'); toast(`Tu patronus ahora es: ${byId(id).name}`, byId(id).e); V9P.refresh(); },
    buy(id) {
      const p = byId(id), s = st(); if (!p || s.owned.includes(id) || p.r === 'm') return;
      if (p.r === 'ev' && !evOpen(p)) return toast('Este patronus solo aparece en su fecha.', '📅');
      const cost = V9P.priceNow(p);
      showDialog({ icon: p.e, title: `Conjurar ${p.name}`, body: `<p class="text-sm">Patronus <b>${RAR[p.r].n.toLowerCase()}</b> por <b class="text-amber-300">${fmt(cost)} galeones</b>.</p><p class="text-[11px] text-stone-400 mt-1">Tienes ${fmt(S.gold || 0)} galeones.</p>`,
        actions: [{ label: (S.gold || 0) >= cost ? `Comprar por ${fmt(cost)} 🪙` : 'No te alcanza', primary: true, onClick: () => {
          if ((S.gold || 0) < cost) return toast(`Te faltan ${fmt(cost - (S.gold || 0))} galeones.`, '🪙');
          S.gold -= cost; s.owned.push(id); s.cur = id; (S.v9shop = S.v9shop || []).push({ t: Date.now(), what: 'Patronus ' + p.name, cost }); updateWallet();
          if (window.V9E && V9E.saveNow) V9E.saveNow(); else save();
          achievements(); ceremony(p, () => V9P.refresh());
        } }, { label: 'Cancelar' }] });
    },
    grant(id, why) {
      const p = byId(id), s = st(); if (!p) return;
      if (s.owned.includes(id)) { const g = Math.round((RAR[p.r].p || 5000) / 2); V8.gold(g, `${p.name} repetido`); return; }
      s.owned.push(id); if (!s.cur) s.cur = id; save(); toast(`${why || 'Nuevo patronus'}: ${p.name}`, p.e); achievements(); ceremony(p, () => V9P.refresh());
    },
    cast() {
      const s = st(), p = s.cur && byId(s.cur); if (!p) return;
      const now = Date.now(); if (now - (s.lastCast || 0) > 30000) { s.casts[p.id] = (s.casts[p.id] || 0) + 1; s.lastCast = now; const before = level(p.id); save(); if (level(p.id) > before) toast(`¡Tu ${p.name} subió a nivel ${level(p.id)}!`, '✨'); }
      if (typeof summonPatronus === 'function') { try { summonPatronus(); } catch (e) { miniCast(p); } } else miniCast(p);
      V9P.refresh();
    },
    // test gratis: 5 preguntas
    test() {
      const Q = [['¿Qué te da más fuerza?', [['Mis amigos', 'perro'], ['Saber cosas', 'buho'], ['La libertad', 'caballo'], ['Ser astuto', 'zorro']]],
        ['Tu lugar favorito de Hogwarts', [['El Lago Negro', 'nutria'], ['La biblioteca', 'buho'], ['El Bosque Prohibido', 'lobo'], ['La sala común', 'gato']]],
        ['Ante un dementor, tú…', [['Protejo a los demás', 'perro'], ['Pienso un plan', 'zorro'], ['Corro a enfrentarlo', 'lobo'], ['Mantengo la calma', 'tortuga']]],
        ['Tu recuerdo más feliz tiene…', [['Risas', 'nutria'], ['Una aventura', 'liebre'], ['Música', 'gorrion'], ['Mi familia', 'cisne']]],
        ['Elige una hora del día', [['Amanecer', 'gorrion'], ['Mediodía', 'ardilla'], ['Atardecer', 'zorro'], ['Medianoche', 'buho']]]];
      let i = 0; const score = {};
      const show = () => {
        if (i >= Q.length) { const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0]; st().test = true; save(); V8.closeSheet(); V9P.grant(best, 'Tu patronus es'); return; }
        V8.sheet('🔮 Descubre tu patronus', `<p class="text-xs text-stone-400">Pregunta ${i + 1} de ${Q.length}</p><p class="font-wizard text-lg text-sky-200 my-2">${Q[i][0]}</p><div class="grid gap-2">${Q[i][1].map(([t, id]) => `<button class="btn-ghost w-full" onclick="V9P._ans('${id}')">${t}</button>`).join('')}</div>`);
      };
      V9P._ans = id => { score[id] = (score[id] || 0) + 1; i++; show(); }; show();
    },
    checkMyth: achievements
  };
  function miniCast(p) { const el = document.createElement('div'); el.className = 'patronus-fly'; el.innerHTML = `<span>${p.e}</span><small>${p.name}</small>`; document.body.appendChild(el); sfx('spell'); setTimeout(() => el.remove(), 4200); }

  /* ---------- logros y míticos ---------- */
  if (typeof ACH !== 'undefined') Object.assign(ACH, {
    v9pat1: ['🦌', 'Expecto Patronum', 'Consigue tu primer patronus'], v9pat10: ['✨', 'Coleccionista de luz', 'Ten 10 patronus'],
    v9patL: ['🔥', 'Luz legendaria', 'Consigue un patronus legendario'], v9patM: ['🌟', 'Mito viviente', 'Consigue un patronus mítico'], v9patLv: ['💫', 'Patronus pleno', 'Sube un patronus a nivel 5']
  });
  function achievements() {
    const s = st(), un = k => { try { unlock(k); } catch (e) {} };
    if (s.owned.length) un('v9pat1'); if (s.owned.length >= 10) un('v9pat10');
    if (s.owned.some(id => byId(id) && byId(id).r === 'l')) un('v9patL'); if (s.owned.some(id => byId(id) && byId(id).r === 'm')) un('v9patM');
    if (s.owned.some(id => level(id) >= 5)) un('v9patLv');
    // míticos: se entregan solos al cumplir su logro
    P.filter(p => p.r === 'm' && !s.owned.includes(p.id) && !s.myth.includes(p.id)).forEach(p => { try { if (p.cond(s)) { s.myth.push(p.id); setTimeout(() => V9P.grant(p.id, '¡Desbloqueaste un patronus mítico!'), 1200); } } catch (e) {} });
  }
  setInterval(() => { if (!document.hidden && !activeGame) achievements(); }, 20000);

  /* ---------- tienda en el Callejón Diagon y botón en el perfil ---------- */
  if (typeof DIAGON !== 'undefined') DIAGON.push({ id: 'patronus', name: 'Gabinete Plateado', icon: '🦌', color: '#0369a1', desc: 'Patronus de luz: comunes, raros, épicos, legendarios y míticos.' });
  if (typeof renderShop === 'function') {
    const _rs = renderShop;
    window.renderShop = renderShop = function () { _rs.apply(this, arguments); const panel = $('diagonPanel'); if (panel && typeof diagonStore !== 'undefined' && diagonStore === 'patronus') { panel.insertAdjacentHTML('beforeend', `<div id="v9PatShop">${V9P.html()}</div>`); V9P.mount(); } };
  }
  const profBtn = () => { const box = $('v9ProfShare'); if (box && !$('v9PatBtn')) box.insertAdjacentHTML('beforeend', '<button id="v9PatBtn" class="btn-ghost" onclick="V9P.open()">🦌 Mi patronus</button>'); };
  setInterval(profBtn, 2000);

  /* ---------- patronus que te acompaña en la portada ---------- */
  function companion() {
    const s = st(), p = s.cur && byId(s.cur), home = $('tab-home'); let el = $('v9Comp');
    if (!p || !home) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('button'); el.id = 'v9Comp'; el.className = 'v9-comp'; el.onclick = () => V9P.open(); el.setAttribute('aria-label', 'Tu patronus'); }
    el.innerHTML = `<span>${p.e}</span>`; el.style.setProperty('--glow', 6 + level(p.id) * 4 + 'px');
    const hero = home.querySelector('.glass-card'); if (hero && el.parentElement !== hero) hero.appendChild(el);
  }
  setInterval(() => { if (typeof currentTab !== 'undefined' && currentTab === 'home') companion(); }, 3000);

  /* ---------- escudo de patronus en el duelo (una vez por duelo) ---------- */
  if (typeof answerDuel === 'function') {
    const _ad = answerDuel;
    window.answerDuel = answerDuel = function () {
      const before = duel.hp[0], r = _ad.apply(this, arguments);
      if (duel._shield && duel.hp[0] < before) {
        duel.hp[0] = before; duel._shield = false; duel._shieldUsed = true; updateHp(); const p = byId(st().cur);
        const el = $('duelLog'); if (el) el.innerHTML += ` <span class="text-sky-300 font-bold">🛡️ ¡Tu ${p ? p.name : 'patronus'} bloqueó el hechizo!</span>`;
        miniCast(p || { e: '✨', name: 'Patronus' }); try { V9.buzz([40, 30, 120]); } catch (e) {}
        const b = $('v9Shield'); if (b) b.remove();
      }
      return r;
    };
  }
  new MutationObserver(() => {
    const grid = $('duelOptionsGrid'), s = st(); if (!grid || !s.cur || !duel.running) return;
    if (duel._round0 !== duel.round && duel.round === 1) { duel._shieldUsed = false; duel._shield = false; }
    duel._round0 = duel.round;
    if (duel._shieldUsed || $('v9Shield')) return;
    const b = document.createElement('button'); b.id = 'v9Shield'; b.className = 'v8-chip mb-2 ml-1'; b.textContent = `🛡️ Escudo de ${byId(s.cur).name}`;
    b.onclick = () => { duel._shield = true; b.textContent = '🛡️ Escudo activo: bloqueará el próximo golpe'; b.classList.add('on'); b.disabled = true; sfx('spell'); };
    grid.parentNode.insertBefore(b, grid);
  }).observe(document.body, { childList: true, subtree: true });

  /* ---------- 49. Duelo de Patronus (minijuego) ---------- */
  if (window.V8 && V8.reg) V8.reg({
    id: 'patronus', name: 'Duelo de Patronus', icon: '🦌', g: ['#0c4a6e', '#020617'],
    desc: 'Tu patronus contra un dementor: responde rápido para empujar su luz. ¡Gana quien domine el centro!',
    best: b => b ? `Récord: ${b} dementores` : '',
    init(body) {
      V8.started('patronus');
      const s = st(), p = (s.cur && byId(s.cur)) || byId('nutria'); let pos = .5, won = 0, over = false, q = null, raf = 0, t0 = performance.now();
      body.innerHTML = `<div class="max-w-xl mx-auto space-y-3"><canvas id="pdCv" class="w-full rounded-3xl border-2 border-sky-800/60" style="aspect-ratio:16/10;background:#020617"></canvas>
        <p id="pdQ" class="text-center font-bold text-sky-100 min-h-[3rem]"></p><div id="pdO" class="grid grid-cols-2 gap-2"></div><p class="text-center text-[11px] text-stone-400">Cada acierto empuja la luz hacia el dementor. Si fallas o tardas, el dementor avanza.</p></div>`;
      const cv = $('pdCv'), x = cv.getContext('2d'), pts = shape(p.e, 700);
      const bank = (typeof ALL_Q !== 'undefined' ? ALL_Q : []).filter(r => Array.isArray(r) && Array.isArray(r[2])); if (!bank.length) bank.push(null);
      const next = () => {
        if (over) return;
        let qq; if (bank[0]) { const r = bank[Math.floor(Math.random() * bank.length)]; qq = { t: r[0], a: r[1], o: V8.shuffle([r[1], ...r[2]]) }; } else qq = { t: '¿Qué hechizo ahuyenta dementores?', a: 'Expecto Patronum', o: V8.shuffle(['Expecto Patronum', 'Lumos', 'Accio', 'Alohomora']) };
        q = Object.assign(qq, { at: performance.now() }); $('pdQ').textContent = q.t;
        $('pdO').innerHTML = q.o.map((o, i) => `<button class="btn-ghost !text-xs !py-2.5 w-full" data-i="${i}">${esc(o)}</button>`).join('');
        const cur = q; $('pdO').querySelectorAll('button').forEach(b => b.onclick = () => { if (q !== cur) return; answer(cur.o[+b.dataset.i] === cur.a); });
      };
      const answer = ok => { if (over || !q) return; const fast = (performance.now() - q.at) < 5000; pos += ok ? (fast ? .14 : .09) : -.12; sfx(ok ? 'correct' : 'wrong'); try { V9.buzz(ok ? 20 : [40, 40]); } catch (e) {} q = null; check(); setTimeout(next, 450); };
      const check = () => {
        if (pos >= .95) { won++; pos = .5; sfx('levelup'); burst(innerWidth / 2, innerHeight / 3, '#bae6fd', 60); if (won % 3 === 0) toast(`¡${won} dementores ahuyentados!`, '🦌'); }
        if (pos <= .05) { over = true; cancelAnimationFrame(raf); V8.record('patronus', won); const pts2 = won * 12; if (pts2) gameReward(pts2, 'Duelo de Patronus'); body.innerHTML = `<div class="glass-card rounded-3xl p-6 text-center space-y-3"><div class="text-6xl">${won ? '🦌' : '🥶'}</div><p class="font-wizard text-2xl text-sky-200">${won} dementores ahuyentados</p><button class="btn-gold" onclick="openGame('patronus')">Otra vez</button></div>`; }
      };
      const tick = setInterval(() => { if (over) return clearInterval(tick); pos -= .006 + won * .0012; check(); }, 120);
      V8.games.patronus.stop = () => { over = true; clearInterval(tick); cancelAnimationFrame(raf); };
      const loop = now => {
        if (over || !cv.isConnected) return; raf = requestAnimationFrame(loop);
        const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); if (cv.width !== Math.round(r.width * d)) { cv.width = r.width * d; cv.height = r.height * d; }
        x.setTransform(d, 0, 0, d, 0, 0); const W = r.width, H = r.height, t = (now - t0) / 1000;
        x.fillStyle = '#020617'; x.fillRect(0, 0, W, H);
        const front = W * pos, g = x.createLinearGradient(front - 80, 0, front + 80, 0); g.addColorStop(0, 'rgba(150,200,255,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g; x.fillRect(0, 0, front + 80, H);
        x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(180,220,255,.5)'; x.beginPath(); x.moveTo(W * .1, H * .55); x.quadraticCurveTo(front * .6, H * .5 + Math.sin(t * 6) * 10, front, H * .5); x.lineWidth = 0; x.lineTo(front, H * .6); x.quadraticCurveTo(front * .6, H * .6, W * .1, H * .6); x.fill(); x.globalCompositeOperation = 'source-over';
        drawCloud(x, pts, W * .16, H * .5, H * .3, Math.sin(t) * .4, t, { size: .8 });
        // dementor: capa rasgada
        const dx = W * .84 + Math.sin(t * 1.3) * 6, dy = H * .45 + Math.sin(t * 2) * 8; x.save(); x.translate(dx, dy);
        const cg = x.createLinearGradient(0, -H * .3, 0, H * .35); cg.addColorStop(0, '#111827'); cg.addColorStop(1, 'rgba(17,24,39,0)'); x.fillStyle = cg;
        x.beginPath(); x.moveTo(0, -H * .3); x.quadraticCurveTo(H * .18, -H * .2, H * .2, H * .1); for (let i = 0; i <= 6; i++) x.lineTo(H * .2 - i * H * .066, H * .35 + Math.sin(t * 4 + i) * 10 * (i % 2 ? 1 : -.5)); x.quadraticCurveTo(-H * .18, -H * .2, 0, -H * .3); x.fill();
        x.fillStyle = '#000'; x.beginPath(); x.ellipse(0, -H * .17, H * .06, H * .08, 0, 0, 7); x.fill(); x.restore();
        x.fillStyle = 'rgba(186,230,253,.9)'; x.font = '600 12px Montserrat,sans-serif'; x.fillText(`Dementores ahuyentados: ${won}`, 12, 20);
      };
      raf = requestAnimationFrame(loop); next();
    }
  });

  /* ---------- 50. Invasión de dementores (fines de semana, en la portada) ---------- */
  function invasion() {
    const day = new Date().getDay(), force = new URLSearchParams(location.search).get('evento') === 'dementores';
    if (!force && day !== 0 && day !== 6) return;
    const s = st(), today = new Date().toISOString().slice(0, 10); s.inv = s.inv || {}; if (!force && (s.inv[today] || 0) >= 10) return;
    if ($('v9Inv') || activeGame || currentTab !== 'home' || document.hidden) return;
    const ov = document.createElement('div'); ov.id = 'v9Inv'; ov.className = 'v9-inv'; ov.innerHTML = '<canvas></canvas><p>🥶 ¡Invasión de dementores! Tócalos para lanzar tu patronus</p>'; document.body.appendChild(ov);
    const cv = ov.querySelector('canvas'), x = cv.getContext('2d'), d = Math.min(2, devicePixelRatio || 1); let W = innerWidth, H = innerHeight; cv.width = W * d; cv.height = H * d; x.setTransform(d, 0, 0, d, 0, 0);
    const p = (s.cur && byId(s.cur)) || byId('nutria'), pts = shape(p.e, 400);
    const dem = Array.from({ length: 5 }, (_, i) => ({ x: W * (.15 + Math.random() * .7), y: H * (.15 + i * .14), vx: (Math.random() - .5) * .8, vy: (Math.random() - .5) * .5, s: 40 + Math.random() * 30, hit: 0 }));
    const fx = []; const t0 = performance.now(); let gone = 0;
    cv.addEventListener('pointerdown', e => {
      const tgt = dem.find(m => !m.hit && Math.hypot(e.clientX - m.x, e.clientY - m.y) < m.s * 1.2); if (!tgt) return;
      tgt.hit = performance.now(); fx.push({ x: e.clientX, y: e.clientY, t: performance.now() }); sfx('spell'); try { V9.buzz(30); } catch (er) {}
      s.inv[today] = (s.inv[today] || 0) + 1; if (s.inv[today] <= 10) V8.gold(15); gone++; save();
    });
    const loop = now => {
      if (!ov.isConnected) return; requestAnimationFrame(loop);
      const t = (now - t0) / 1000; x.clearRect(0, 0, W, H);
      x.fillStyle = `rgba(10,20,40,${Math.min(.35, t * .2)})`; x.fillRect(0, 0, W, H);
      dem.forEach(m => {
        if (m.hit) { if (now - m.hit > 600) return; x.globalAlpha = 1 - (now - m.hit) / 600; } else { m.x += m.vx + Math.sin(t + m.s) * .4; m.y += m.vy + Math.cos(t * .7 + m.s) * .3; if (m.x < 30 || m.x > W - 30) m.vx *= -1; if (m.y < 60 || m.y > H - 120) m.vy *= -1; }
        x.save(); x.translate(m.x, m.y); const g = x.createLinearGradient(0, -m.s, 0, m.s * 1.4); g.addColorStop(0, '#0b0f19'); g.addColorStop(1, 'rgba(11,15,25,0)'); x.fillStyle = g;
        x.beginPath(); x.moveTo(0, -m.s); x.quadraticCurveTo(m.s * .9, -m.s * .5, m.s * .8, m.s * .4); for (let i = 0; i <= 5; i++) x.lineTo(m.s * .8 - i * m.s * .32, m.s * 1.4 + Math.sin(t * 5 + i) * 8); x.quadraticCurveTo(-m.s * .9, -m.s * .5, 0, -m.s); x.fill();
        x.fillStyle = '#000'; x.beginPath(); x.ellipse(0, -m.s * .55, m.s * .22, m.s * .28, 0, 0, 7); x.fill(); x.restore(); x.globalAlpha = 1;
      });
      fx.forEach(f => { const k = (now - f.t) / 900; if (k > 1) return; drawCloud(x, pts, f.x, f.y - k * 40, 50 + k * 30, k * 2, t, { alpha: 1 - k, size: .8 }); });
      if (t > 40 || dem.every(m => m.hit)) { ov.classList.add('out'); setTimeout(() => ov.remove(), 600); if (gone) toast(`Ahuyentaste ${gone} dementores 🦌 (+${Math.min(gone, 10) * 15} 🪙)`, '✨'); }
    };
    requestAnimationFrame(loop);
  }
  setTimeout(() => { invasion(); setInterval(() => { if (Math.random() < .25) invasion(); }, 120000); }, 25000);
  V9P.invasion = invasion;
})();
