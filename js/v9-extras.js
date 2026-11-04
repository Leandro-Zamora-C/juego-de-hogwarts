/* =====================================================================
   HOGWARTS 9.3 · ECONOMÍA, PERFIL Y PROGRESO EN LA NUBE
   Cambio de nombre · ofertas del día · cofre semanal · ruleta premium ·
   ropero · marcos animados · títulos · firma mágica · vitrina 3D ·
   perfil de amigos · modo historia · ajustes en la cuenta · guardado al instante
   ===================================================================== */
(() => {
  const DEFX = { names: [], frames: [], frame: '', robes: [], robe: '', pets: [], pet: '', firma: '', wchest: '', story: { y: 0, p: {} }, offerBuy: {} };
  const st = () => { const o = S.v9x || (S.v9x = {}); for (const k in DEFX) if (o[k] === undefined) o[k] = JSON.parse(JSON.stringify(DEFX[k])); return o; };
  const fmt = n => Number(n).toLocaleString('es-PE');
  const day = () => (window.V8 && V8.day ? V8.day() : new Date().toISOString().slice(0, 10));
  const pay = (cost, what) => { if ((S.gold || 0) < cost) { toast(`Te faltan ${fmt(cost - (S.gold || 0))} galeones.`, '🪙'); return false; } S.gold -= cost; (S.v9shop = S.v9shop || []).push({ t: Date.now(), what, cost }); updateWallet(); V9E.saveNow(); return true; };
  const confirmBuy = (icon, title, body, cost, fn) => showDialog({ icon, title, body: body + `<p class="text-[11px] text-stone-400 mt-2">Tienes ${fmt(S.gold || 0)} galeones.</p>`, actions: [{ label: (S.gold || 0) >= cost ? `Pagar ${fmt(cost)} 🪙` : 'No te alcanza', primary: true, onClick: () => { if (pay(cost, title)) fn(); } }, { label: 'Cancelar' }] });

  const V9E = window.V9E = {};

  /* ---------- 20. guardado inmediato en la nube (compras y cambios importantes) ---------- */
  let chipT = 0;
  V9E.saveNow = () => {
    save();
    if (typeof cloud !== 'undefined' && cloud.user && typeof cloudPush === 'function') { V9E._wantChip = true; cloudPush(); }
  };
  if (typeof setCloudStatus === 'function') {
    const _scs = setCloudStatus;
    window.setCloudStatus = setCloudStatus = function (t) {
      _scs.apply(this, arguments);
      if (V9E._wantChip && /Guardado en la nube/.test(t)) { V9E._wantChip = false; let c = $('v9Cloud'); if (!c) { c = document.createElement('div'); c.id = 'v9Cloud'; c.className = 'v9-cloud'; document.body.appendChild(c); } c.textContent = '☁️ Guardado'; c.classList.remove('out'); clearTimeout(chipT); chipT = setTimeout(() => c.classList.add('out'), 1600); }
    };
  }
  // cualquier compra (los galeones bajan) se sube al momento
  if (typeof updateWallet === 'function') {
    const _uw = updateWallet; let last = S.gold || 0, t = 0;
    window.updateWallet = updateWallet = function () { const r = _uw.apply(this, arguments); const g = S.gold || 0; if (g < last) { clearTimeout(t); t = setTimeout(V9E.saveNow, 250); } last = g; return r; };
  }

  /* ---------- 19. ajustes del dispositivo guardados en tu cuenta ---------- */
  const KEYS = ['hp-fps', 'hp-showfps', 'hp-chess3d', 'hp-gfx3d'];
  const readLS = () => { const o = {}; KEYS.forEach(k => { try { const v = localStorage.getItem(k); if (v != null) o[k] = v; } catch (e) {} }); return o; };
  function settingsToAccount() { const cur = readLS(), prev = S.v9set || {}; if (KEYS.some(k => cur[k] !== undefined && cur[k] !== prev[k])) { S.v9set = Object.assign({}, prev, cur); save(); } }
  function settingsFromAccount() { const s = S.v9set; if (!s) return; KEYS.forEach(k => { try { if (s[k] != null && localStorage.getItem(k) !== s[k]) localStorage.setItem(k, s[k]); } catch (e) {} }); if (window.HPperf && s['hp-fps']) HPperf.pref = +s['hp-fps'] || 60; }
  if (typeof adoptRemote === 'function') { const _ar = adoptRemote; window.adoptRemote = adoptRemote = function () { const r = _ar.apply(this, arguments); try { settingsFromAccount(); } catch (e) {} return r; }; }
  setInterval(settingsToAccount, 15000); addEventListener('visibilitychange', () => { if (document.hidden) settingsToAccount(); });

  /* ---------- 18. cambio de nombre (cada vez más caro) ---------- */
  V9E.renamePrice = () => 1500 * Math.pow(2, Math.min(6, st().names.length));
  V9E.rename = () => {
    const price = V9E.renamePrice(), cur = (S.student || (typeof myName === 'function' && myName()) || '');
    V8.sheet('📜 Registro del Ministerio', `<p class="text-sm text-stone-300">Cambia tu nombre de mago. Se actualiza en el ranking, tu perfil, tus amigos y las salas en línea.</p>
      <p class="text-xs text-stone-400 mt-1">Precio de este cambio: <b class="text-amber-300">${fmt(price)} galeones</b> (cada cambio cuesta el doble que el anterior).</p>
      <input id="v9NewName" maxlength="20" value="${esc(cur)}" class="w-full mt-3 bg-stone-950 border border-amber-700/50 rounded-xl px-3 py-2.5 text-amber-100 text-center font-bold">
      <button class="btn-gold w-full mt-3" onclick="V9E.doRename()">🪶 Firmar el registro · ${fmt(price)} 🪙</button>
      ${st().names.length ? `<p class="text-[11px] text-stone-500 mt-2">Nombres anteriores: ${st().names.map(n => esc(n.from)).join(', ')}</p>` : ''}`);
  };
  V9E.doRename = () => {
    const v = (($('v9NewName') || {}).value || '').trim().replace(/\s+/g, ' '), cur = S.student || '';
    if (v.length < 3) return toast('El nombre debe tener al menos 3 letras.', '✍️');
    if (!/^[\p{L}\p{N} ._-]+$/u.test(v)) return toast('Usa solo letras, números y espacios.', '✍️');
    if (/(put[ao]s?|mierda|carajo|conch[ao]|cojud[ao]s?|huev[oó]n|imb[eé]cil|idiota|est[uú]pid[ao]|pendej[ao]|maric[oó]n|cabr[oó]n|verga|pinga|chucha|csm|ctm|hdp|perra|zorra|malparid[ao]|hitler|nazi)/i.test(v)) return toast('Ese nombre no está permitido.', '🚫');
    if (v === cur) return toast('Ese ya es tu nombre.', '🙂');
    const price = V9E.renamePrice();
    if (!pay(price, 'Cambio de nombre')) return;
    st().names.push({ from: cur, to: v, t: Date.now() }); S.student = v; S.rankName = v.slice(0, 20);
    try { if (typeof gr !== 'undefined') gr.me = v; } catch (e) {}
    V9E.saveNow(); try { publishProfile(); } catch (e) {} try { renderAll(); } catch (e) {}
    V8.closeSheet(); sfx('levelup'); fireConfetti({ particleCount: 70, spread: 80 }); toast(`Ahora eres <b>${esc(v)}</b>`, '📜');
  };

  // la carta de Hogwarts ya no cambia el nombre gratis: después del primero, se cambia en el Ministerio
  if (typeof generateLetter === 'function') {
    const _gl = generateLetter;
    window.generateLetter = generateLetter = function () {
      const inp = $('studentNameInput'), v = inp ? inp.value.trim() : '';
      if (S.student && v && v !== S.student) { inp.value = S.student; V9E.rename(); setTimeout(() => { const n = $('v9NewName'); if (n) n.value = v; }, 50); toast('Para cambiar tu nombre ve al Registro del Ministerio.', '📜'); return; }
      return _gl.apply(this, arguments);
    };
  }

  /* ---------- 23. ofertas del día ---------- */
  const seed = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  V9E.offers = () => {
    const r = window.V8 && V8.rng ? V8.rng(seed('oferta' + day())) : Math.random, pats = (window.V9P ? V9P.list.filter(p => ['r', 'e', 'l'].includes(p.r)) : []);
    const cards = typeof V8 !== 'undefined' && V8.CARDS ? V8.CARDS.filter(c => c.r === 'l') : [];
    const out = [];
    if (pats.length) out.push({ kind: 'pat', id: pats[Math.floor(r() * pats.length)].id, off: .25 });
    if (cards.length) out.push({ kind: 'card', id: cards[Math.floor(r() * cards.length)].id, off: .3 });
    out.push({ kind: 'frame', id: FRAMES[Math.floor(r() * FRAMES.length)].id, off: .4 });
    return out;
  };
  V9E.offer = (kind, id) => { const o = V9E.offers().find(x => x.kind === kind && x.id === id); return o ? o.off : 0; };

  /* ---------- 43. marcos animados · 27. ropero ---------- */
  const FRAMES = [
    { id: 'fuego', n: 'Marco de fuego', p: 1200, cls: 'v9f-fuego' }, { id: 'hielo', n: 'Marco de hielo', p: 1200, cls: 'v9f-hielo' },
    { id: 'estrellas', n: 'Marco de estrellas', p: 1800, cls: 'v9f-estrellas' }, { id: 'casa', n: 'Marco de tu casa', p: 900, cls: 'v9f-casa' },
    { id: 'patronus', n: 'Marco plateado', p: 2500, cls: 'v9f-plata' }, { id: 'oro', n: 'Marco de oro de Gringotts', p: 4000, cls: 'v9f-oro' }
  ];
  const ROBES = [['#1c1917', 'Túnica negra', 0], ['#1e3a8a', 'Túnica azul noche', 600], ['#7f1d1d', 'Túnica carmesí', 600], ['#064e3b', 'Túnica esmeralda', 600], ['#4c1d95', 'Túnica de gala morada', 1200], ['#e7e5e4', 'Túnica blanca de Dumbledore', 2500], ['#78350f', 'Abrigo de Hagrid', 1500]];
  const PETS = [['🦉', 'Lechuza', 800], ['🐈', 'Gato', 800], ['🐸', 'Sapo', 600], ['🐀', 'Rata', 500], ['🐍', 'Serpiente', 1200], ['🐦‍🔥', 'Fénix bebé', 5000]];
  V9E.FRAMES = FRAMES;
  V9E.frameCls = () => { const f = FRAMES.find(x => x.id === st().frame); return f ? f.cls : ''; };
  function applyFrame() {
    const cls = V9E.frameCls();
    document.querySelectorAll('#accountBtn, .v9-framed').forEach(el => { el.classList.remove(...FRAMES.map(f => f.cls)); if (cls) el.classList.add(cls, 'v9-framed'); });
  }
  setInterval(applyFrame, 3000);
  V9E.buyFrame = id => { const f = FRAMES.find(x => x.id === id), s = st(); if (!f) return; if (s.frames.includes(id)) { s.frame = s.frame === id ? '' : id; save(); applyFrame(); renderShop(); return; } const cost = Math.round(f.p * (1 - V9E.offer('frame', id))); confirmBuy('🖼️', f.n, '<p class="text-sm">Un marco animado alrededor de tu foto, en el menú y en tu perfil.</p>', cost, () => { s.frames.push(id); s.frame = id; save(); applyFrame(); sfx('achieve'); renderShop(); }); };
  V9E.buyRobe = i => { const r = ROBES[i], s = st(); if (!r) return; const own = !r[2] || s.robes.includes(r[0]); if (own) { s.robe = r[0]; save(); refreshAvatars(); renderShop(); return; } confirmBuy('🧥', r[1], '<p class="text-sm">Tu avatar la usará en todo el juego.</p>', r[2], () => { s.robes.push(r[0]); s.robe = r[0]; save(); refreshAvatars(); renderShop(); sfx('achieve'); }); };
  V9E.buyPet = i => { const p = PETS[i], s = st(); if (!p) return; if (s.pets.includes(p[0])) { s.pet = s.pet === p[0] ? '' : p[0]; save(); refreshAvatars(); renderShop(); return; } confirmBuy(p[0], p[1], '<p class="text-sm">Te acompañará en tu avatar.</p>', p[2], () => { s.pets.push(p[0]); s.pet = p[0]; save(); refreshAvatars(); renderShop(); sfx('achieve'); }); };
  function refreshAvatars() { try { if (V8.goCol && $('v8ColBody')) V8.goCol('avatar'); } catch (e) {} }
  if (window.V8 && V8.avatarLook) {
    const _al = V8.avatarLook; V8.avatarLook = () => { const a = _al(), s = st(); if (s.robe) a.robe = s.robe; return a; };
    const _svg = V8.avatarSVG; V8.avatarSVG = size => { const svg = _svg(size), pet = st().pet; return pet ? svg.replace('</svg>', `<text x="84" y="112" font-size="24" text-anchor="middle">${pet}</text></svg>`) : svg; };
  }

  /* tiendas nuevas en el Callejón Diagon */
  if (typeof DIAGON !== 'undefined') DIAGON.push({ id: 'ministerio', name: 'Ministerio de Magia', icon: '🏛️', color: '#334155', desc: 'Cambio de nombre, ofertas del día y la ruleta premium.' });
  if (typeof renderShop === 'function') {
    const _rs = renderShop;
    window.renderShop = renderShop = function () {
      _rs.apply(this, arguments);
      const panel = $('diagonPanel'); if (!panel || typeof diagonStore === 'undefined') return; const s = st();
      if (diagonStore === 'ministerio') panel.insertAdjacentHTML('beforeend', offersHTML() + `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="glass-card rounded-2xl p-4 space-y-2 text-center"><div class="text-4xl">📜</div><b class="text-amber-200">Cambio de nombre</b><p class="text-[11px] text-stone-400">Próximo cambio: ${fmt(V9E.renamePrice())} 🪙</p><button class="btn-gold w-full" onclick="V9E.rename()">Cambiar mi nombre</button></div>
        <div class="glass-card rounded-2xl p-4 space-y-2 text-center"><div class="text-4xl">🎰</div><b class="text-amber-200">Ruleta premium</b><p class="text-[11px] text-stone-400">500 🪙 por giro. Puede dar hasta 3.000 galeones, cromos legendarios o patronus.</p><button class="btn-gold w-full" onclick="V9E.premium()">Girar por 500 🪙</button></div></div>`);
      if (diagonStore === 'malkin') panel.insertAdjacentHTML('beforeend', `<div class="space-y-3 mt-3">
        <h3 class="font-wizard font-bold text-amber-300">🖼️ Marcos animados</h3><div class="grid grid-cols-2 sm:grid-cols-3 gap-2">${FRAMES.map(f => { const own = s.frames.includes(f.id), off = V9E.offer('frame', f.id); return `<div class="glass-card rounded-2xl p-3 text-center space-y-2"><span class="v9-fprev ${f.cls}"></span><p class="text-[11px] font-bold text-amber-100">${f.n}</p><button class="${own ? 'btn-ghost' : 'btn-gold'} !py-1 !px-2 !text-[10px] w-full" onclick="V9E.buyFrame('${f.id}')">${own ? (s.frame === f.id ? '✔ En uso' : 'Usar') : `🪙 ${fmt(Math.round(f.p * (1 - off)))}${off ? ' 🔥' : ''}`}</button></div>`; }).join('')}</div>
        <h3 class="font-wizard font-bold text-amber-300">🧥 Ropero del mago</h3><div class="grid grid-cols-2 sm:grid-cols-4 gap-2">${ROBES.map((r, i) => { const own = !r[2] || s.robes.includes(r[0]); return `<div class="glass-card rounded-2xl p-3 text-center space-y-2"><span class="block w-10 h-12 mx-auto rounded-t-full" style="background:linear-gradient(${r[0]},#000)"></span><p class="text-[11px] font-bold text-amber-100">${r[1]}</p><button class="${own ? 'btn-ghost' : 'btn-gold'} !py-1 !px-2 !text-[10px] w-full" onclick="V9E.buyRobe(${i})">${own ? ((s.robe || '#1c1917') === r[0] ? '✔ Puesta' : 'Usar') : `🪙 ${fmt(r[2])}`}</button></div>`; }).join('')}</div>
        <h3 class="font-wizard font-bold text-amber-300">🐾 Mascota en tu avatar</h3><div class="grid grid-cols-3 sm:grid-cols-6 gap-2">${PETS.map((p, i) => { const own = s.pets.includes(p[0]); return `<div class="glass-card rounded-2xl p-3 text-center space-y-1"><div class="text-3xl">${p[0]}</div><p class="text-[10px] font-bold text-amber-100">${p[1]}</p><button class="${own ? 'btn-ghost' : 'btn-gold'} !py-1 !px-1 !text-[10px] w-full" onclick="V9E.buyPet(${i})">${own ? (s.pet === p[0] ? '✔' : 'Usar') : `🪙 ${fmt(p[2])}`}</button></div>`; }).join('')}</div></div>`);
    };
  }
  function offersHTML() {
    const list = V9E.offers(), s = st();
    const item = o => {
      if (o.kind === 'pat') { const p = window.V9P && V9P.byId(o.id); if (!p) return ''; const own = S.v9p && S.v9p.owned.includes(p.id); return `<div class="v9-offer"><span class="tag">-${o.off * 100}%</span><div class="text-4xl">${p.e}</div><b>${p.name}</b><small>Patronus ${V9P.RAR[p.r].n.toLowerCase()}</small><s>${fmt(V9P.RAR[p.r].p)}</s>${own ? '<span class="text-emerald-300 text-xs">✔ Ya lo tienes</span>' : `<button class="btn-gold !py-1 !text-xs w-full" onclick="V9P.buy('${p.id}')">🪙 ${fmt(V9P.priceNow(p))}</button>`}</div>`; }
      if (o.kind === 'card') { const c = V8.CARDS.find(x => x.id === o.id); if (!c) return ''; const price = Math.round((V8.CARD_PRICE ? V8.CARD_PRICE.l : 3500) * (1 - o.off)), done = s.offerBuy[day()] === o.id; return `<div class="v9-offer"><span class="tag">-${o.off * 100}%</span><div class="text-4xl">🃏</div><b>${esc(c.name)}</b><small>Cromo legendario</small><s>${fmt(V8.CARD_PRICE ? V8.CARD_PRICE.l : 3500)}</s>${done ? '<span class="text-emerald-300 text-xs">✔ Comprado hoy</span>' : `<button class="btn-gold !py-1 !text-xs w-full" onclick="V9E.buyOfferCard('${c.id}',${price})">🪙 ${fmt(price)}</button>`}</div>`; }
      const f = FRAMES.find(x => x.id === o.id); return f ? `<div class="v9-offer"><span class="tag">-${o.off * 100}%</span><span class="v9-fprev ${f.cls}"></span><b>${f.n}</b><small>Marco animado</small><s>${fmt(f.p)}</s><button class="btn-gold !py-1 !text-xs w-full" onclick="V9E.buyFrame('${f.id}')">${s.frames.includes(f.id) ? 'Usar' : '🪙 ' + fmt(Math.round(f.p * (1 - o.off)))}</button></div>` : '';
    };
    return `<div class="space-y-2 mb-4"><h3 class="font-wizard font-bold text-amber-300">🔥 Ofertas del día</h3><p class="text-[11px] text-stone-400">Cambian cada día a medianoche.</p><div class="grid grid-cols-1 sm:grid-cols-3 gap-3">${list.map(item).join('')}</div></div>`;
  }
  V9E.buyOfferCard = (id, price) => { const s = st(); if (s.offerBuy[day()] === id) return; confirmBuy('🃏', 'Cromo en oferta', '<p class="text-sm">Un cromo legendario con descuento (una vez al día).</p>', price, () => { s.offerBuy = { [day()]: id }; const v8 = V8.st(); v8.cards[id] = (v8.cards[id] || 0) + 1; save(); const c = V8.CARDS.find(x => x.id === id); if (V8.reveal && c) V8.reveal(c, { frog: false, first: v8.cards[id] === 1, count: v8.cards[id] }); renderShop(); }); };

  /* ---------- 37. ruleta premium ---------- */
  V9E.premium = () => {
    if ((S.gold || 0) < 500) return toast('La ruleta premium cuesta 500 galeones.', '🪙');
    const P = [[28, '200 🪙', () => V8.gold(200)], [20, '600 🪙', () => V8.gold(600)], [12, '1.000 🪙', () => V8.gold(1000)], [4, '3.000 🪙', () => V8.gold(3000)], [16, '5 ranas 🐸', () => V8.addFrogs(5)],
      [8, 'Cromo legendario', () => { const l = V8.CARDS.filter(c => c.r === 'l'), c = l[Math.floor(Math.random() * l.length)], v8 = V8.st(); v8.cards[c.id] = (v8.cards[c.id] || 0) + 1; save(); V8.reveal && V8.reveal(c, { frog: false, first: v8.cards[c.id] === 1, count: v8.cards[c.id] }); }],
      [8, 'Patronus raro', () => { const l = V9P.list.filter(p => p.r === 'r'); V9P.grant(l[Math.floor(Math.random() * l.length)].id, 'La ruleta te dio'); }],
      [3, 'Patronus épico', () => { const l = V9P.list.filter(p => p.r === 'e'); V9P.grant(l[Math.floor(Math.random() * l.length)].id, 'La ruleta te dio'); }],
      [1, '¡LEGENDARIO!', () => { const l = V9P.list.filter(p => p.r === 'l'); V9P.grant(l[Math.floor(Math.random() * l.length)].id, '¡Patronus legendario!'); }]];
    if (!pay(500, 'Ruleta premium')) return;
    const tot = P.reduce((a, p) => a + p[0], 0); let r = Math.random() * tot, idx = 0; for (; idx < P.length; idx++) { r -= P[idx][0]; if (r <= 0) break; }
    const win = P[Math.min(idx, P.length - 1)];
    V8.sheet('🎰 Ruleta premium', `<div class="v9-slot"><div class="reel" id="v9Reel">${Array.from({ length: 24 }, (_, i) => `<span>${P[i % P.length][1]}</span>`).join('')}<span class="win">${win[1]}</span></div></div><p class="text-center text-xs text-stone-400 mt-2">Girando…</p>`);
    sfx('spell'); const reel = $('v9Reel'); requestAnimationFrame(() => { reel.style.transform = `translateY(calc(-${24}00% / ${25}))`; reel.classList.add('go'); });
    setTimeout(() => { V8.closeSheet(); sfx('levelup'); try { V9.buzz([40, 40, 160]); } catch (e) {} toast(`Ruleta premium: <b>${win[1]}</b>`, '🎰'); win[2](); if (diagonStore === 'ministerio') renderShop(); }, 2600);
  };

  /* ---------- 35. cofre legendario semanal ---------- */
  V9E.weekChest = () => {
    const M = V8.missions(), s = st(), w = V8.week();
    if (!M.wlist.every(m => m.got)) return toast('Completa y reclama las 3 misiones semanales para abrirlo.', '📜');
    if (s.wchest === w) return toast('Ya abriste el cofre de esta semana.', '🏆');
    s.wchest = w; const g = 1500 + Math.floor(Math.random() * 7) * 250; V8.gold(g, 'Cofre legendario'); V8.addFrogs(3);
    if (Math.random() < .3) { const l = V8.CARDS.filter(c => c.r === 'l'), c = l[Math.floor(Math.random() * l.length)], v8 = V8.st(); v8.cards[c.id] = (v8.cards[c.id] || 0) + 1; toast(`¡Y un cromo legendario: ${c.name}!`, '🃏'); }
    V9E.saveNow(); sfx('levelup'); fireConfetti({ particleCount: 180, spread: 120, colors: ['#fde047', '#f59e0b', '#fff'] });
    if (window.V9 && V9.homeStrip) V9.homeStrip();
  };
  if (window.V9 && V9.homeStrip) {
    const _hs = V9.homeStrip;
    V9.homeStrip = function () {
      _hs.apply(this, arguments); const strip = document.querySelector('#v9Strip .v9-strip'); if (!strip) return;
      let ok = false, done = false; try { const M = V8.missions(); ok = M.wlist.every(m => m.got); done = st().wchest === V8.week(); } catch (e) {}
      const story = storyState();
      strip.insertAdjacentHTML('beforeend', `<button class="v9-tile ${ok && !done ? 'ready' : ''}" onclick="V9E.weekChest()"><span class="ic">🏆</span><span><b>Cofre semanal</b><small>${done ? 'Abierto esta semana' : ok ? '¡Ábrelo ya!' : 'Completa las misiones'}</small></span></button>
        <button class="v9-tile" onclick="V9E.story()"><span class="ic">📖</span><span><b>Historia</b><small>${story.y >= 7 ? '¡Graduado!' : `${story.y + 1}.º año`}</small></span></button>
        ${window.V9P ? `<button class="v9-tile" onclick="V9P.open()"><span class="ic">🦌</span><span><b>Patronus</b><small>${S.v9p && S.v9p.cur ? V9P.byId(S.v9p.cur).name : 'Descúbrelo gratis'}</small></span></button>` : ''}`);
    };
  }

  /* ---------- 48. modo historia: 7 años en Hogwarts ---------- */
  const YEARS = [
    ['La Piedra Filosofal', 'Llegas a Hogwarts. Aprende lo básico y gánate un lugar en tu casa.', [['answer', 10, 'Acierta 10 preguntas', d => d.ok], ['gamePlayed', 3, 'Juega 3 minijuegos'], ['frog', 1, 'Abre 1 rana de chocolate']], 300],
    ['La Cámara Secreta', 'Algo se mueve en los pasillos. Practica duelos y descubre criaturas.', [['duelWin', 1, 'Gana 1 duelo'], ['gamePlayed', 1, 'Juega Memoria Mágica', d => d.id === 'memory'], ['beast', 1, 'Descubre 1 criatura']], 500],
    ['El Prisionero de Azkaban', 'Los dementores rodean el castillo. Aprende a defenderte.', [['duelPlayed', 5, 'Juega 5 duelos'], ['potion', 1, 'Prepara 1 poción en Pociones Avanzadas'], ['gamePlayed', 1, 'Juega Duelo de Patronus', d => d.id === 'patronus']], 800],
    ['El Cáliz de Fuego', 'El Torneo de los Tres Magos te pone a prueba.', [['answer', 40, 'Acierta 40 preguntas', d => d.ok], ['ludoWin', 1, 'Gana 1 partida de Ludo'], ['gamePlayed', 1, 'Juega Quidditch 3D', d => d.id === 'q3d']], 1200],
    ['La Orden del Fénix', 'Formas el Ejército de Dumbledore con tus amigos.', [['duelWin', 3, 'Gana 3 duelos'], ['frog', 5, 'Abre 5 ranas'], ['gamePlayed', 1, 'Juega Snap Explosivo', d => d.id === 'snap']], 1600],
    ['El Misterio del Príncipe', 'Clases avanzadas y recuerdos guardados en el pensadero.', [['answer', 80, 'Acierta 80 preguntas', d => d.ok], ['gamePlayed', 10, 'Juega 10 minijuegos'], ['patronus', 1, 'Consigue un patronus']], 2200],
    ['Las Reliquias de la Muerte', 'La batalla final. Demuestra todo lo que aprendiste.', [['duelWin', 5, 'Gana 5 duelos'], ['gamePlayed', 3, 'Juega 3 partidas de ajedrez', d => d.id === 'chess'], ['ludoWin', 2, 'Gana 2 partidas de Ludo']], 3000]
  ];
  function storyState() { const s = st(); if (!s.story) s.story = { y: 0, p: {} }; if (!s.story.p) s.story.p = {}; if (s.story.y == null) s.story.y = 0; return s.story; }
  if (window.V8 && V8.on) V8.on('*', (data, type) => {
    const sy = storyState(); if (sy.y >= 7) return; const Y = YEARS[sy.y]; let ch = false;
    Y[2].forEach(([ev, n, , f], i) => { if (ev !== type || (f && !f(data || {}))) return; const k = sy.y + '-' + i; if ((sy.p[k] || 0) < n) { sy.p[k] = (sy.p[k] || 0) + 1; ch = true; if (sy.p[k] >= n) toast(`📖 Historia: ${Y[2][i][2]} ✔`, '📖'); } });
    if (ch) save();
  });
  setInterval(() => { const sy = storyState(); if (sy.y < 7 && S.v9p && S.v9p.owned.length && YEARS[sy.y][2].some(t => t[0] === 'patronus')) { const i = YEARS[sy.y][2].findIndex(t => t[0] === 'patronus'), k = sy.y + '-' + i; if (!sy.p[k]) { sy.p[k] = 1; save(); } } }, 10000);
  V9E.story = () => {
    const sy = storyState();
    V8.sheet('📖 Tus 7 años en Hogwarts', `<div class="space-y-3">${YEARS.map((Y, y) => {
      const state = y < sy.y ? 'done' : y === sy.y ? 'now' : 'lock', all = Y[2].every(([, n], i) => (sy.p[y + '-' + i] || 0) >= n);
      return `<div class="v9-year ${state}"><div class="flex items-center gap-2"><span class="num">${y + 1}</span><div class="flex-grow"><b>${Y[0]}</b><small>${state === 'lock' ? 'Se desbloquea al terminar el año anterior' : Y[1]}</small></div>${state === 'done' ? '<span class="text-emerald-300 text-lg">✔</span>' : ''}</div>
        ${state === 'now' ? `<div class="space-y-1.5 mt-2">${Y[2].map(([, n, t], i) => { const p = Math.min(n, sy.p[y + '-' + i] || 0); return `<div class="text-xs"><div class="flex justify-between"><span>${t}</span><span class="text-stone-400">${p}/${n}</span></div><div class="v9-lvbar"><i style="width:${p / n * 100}%"></i></div></div>`; }).join('')}
          <button class="btn-gold w-full mt-2" ${all ? '' : 'disabled'} onclick="V9E.storyNext()">${all ? `🎓 Terminar el año · +${fmt(Y[3])} 🪙` : 'Completa las tareas'}</button></div>` : ''}</div>`;
    }).join('')}${sy.y >= 7 ? '<p class="text-center font-wizard text-xl text-amber-300">🎓 ¡Eres un Héroe de Hogwarts!</p>' : ''}</div>`);
  };
  V9E.storyNext = () => {
    const sy = storyState(), Y = YEARS[sy.y]; if (!Y || !Y[2].every(([, n], i) => (sy.p[sy.y + '-' + i] || 0) >= n)) return;
    V8.gold(Y[3], `Terminaste ${sy.y + 1}.º año`); V8.addFrogs(2); sy.y++; V9E.saveNow(); sfx('levelup'); fireConfetti({ particleCount: 140, spread: 110 });
    if (sy.y >= 7) { try { unlock('v9hero'); } catch (e) {} V8.gold(3000, '¡Héroe de Hogwarts!'); }
    V9E.story();
  };
  if (typeof ACH !== 'undefined') Object.assign(ACH, { v9hero: ['🎓', 'Héroe de Hogwarts', 'Termina los 7 años del modo historia'] });
  // título nuevo que se puede equipar
  try { if (typeof SHOP !== 'undefined' && SHOP.title && !SHOP.title.items.find(i => i.id === 't-hero')) SHOP.title.items.push({ id: 't-hero', name: 'Héroe de Hogwarts', price: 20000 }); } catch (e) {}

  /* ---------- 44. tu título junto a tu nombre ---------- */
  function showTitle() {
    const t = typeof titleName === 'function' ? titleName() : ''; if (!t) return;
    ['p1DisplayName'].forEach(id => { const el = $(id); if (el && !el.querySelector('.v9-title')) el.insertAdjacentHTML('beforeend', ` <span class="v9-title">«${esc(t)}»</span>`); });
  }
  setInterval(showTitle, 4000);

  /* ---------- 45. firma mágica · 46. vitrina 3D · 28. perfil público ---------- */
  V9E.signature = () => {
    V8.sheet('✍️ Tu firma mágica', `<p class="text-xs text-stone-400">Fírmala con el dedo. Aparecerá en tu tarjeta de mago.</p><canvas id="v9Sig" class="v9-sig"></canvas><div class="flex gap-2 mt-2"><button class="btn-ghost flex-grow" onclick="V9E.signature()">Borrar</button><button class="btn-gold flex-grow" onclick="V9E.saveSig()">Guardar firma</button></div>`);
    const cv = $('v9Sig'), x = cv.getContext('2d'); const r = cv.getBoundingClientRect(); cv.width = r.width * 2; cv.height = r.height * 2; x.scale(2, 2); x.lineCap = x.lineJoin = 'round'; x.strokeStyle = '#fde68a'; x.lineWidth = 3; x.shadowColor = '#f59e0b'; x.shadowBlur = 6;
    let last = null; cv.addEventListener('pointerdown', e => { last = [e.offsetX, e.offsetY]; cv.setPointerCapture(e.pointerId); }); cv.addEventListener('pointermove', e => { if (!last) return; x.beginPath(); x.moveTo(last[0], last[1]); x.lineTo(e.offsetX, e.offsetY); x.stroke(); last = [e.offsetX, e.offsetY]; }); cv.addEventListener('pointerup', () => last = null);
  };
  V9E.saveSig = () => { const cv = $('v9Sig'); if (!cv) return; const t = document.createElement('canvas'); t.width = 360; t.height = 120; t.getContext('2d').drawImage(cv, 0, 0, 360, 120); st().firma = t.toDataURL('image/png'); V9E.saveNow(); V8.closeSheet(); toast('Firma guardada. Ya aparece en tu tarjeta de mago.', '✍️'); try { drawWizardCard(); } catch (e) {} };
  if (typeof drawWizardCard === 'function') {
    const _dw = drawWizardCard;
    let dwT = 0, dwP = null;
    // se dibuja un instante después del cambio de pestaña (la pestaña aparece al toque) y una sola vez aunque la pidan varias veces
    window.drawWizardCard = drawWizardCard = function () { clearTimeout(dwT); return dwP = new Promise(res => { dwT = setTimeout(() => drawNow().then(res, () => res(null)), 160); }); };
    const drawNow = async function () { const c = await _dw.apply(this, arguments); try { const f = st().firma, cv = c || $('wizardCardCanvas'); if (f && cv) { const im = new Image(); im.src = f; await im.decode(); const x = cv.getContext('2d'); x.globalAlpha = .9; x.drawImage(im, cv.width - 380, cv.height - 170, 340, 113); x.globalAlpha = 1; } } catch (e) {} return c; };
  }
  function vitrina() {
    const sec = $('tab-profile'); if (!sec || $('v9Vitrina')) return;
    const list = (S.ach || []).slice(-8).map(k => (typeof ACH !== 'undefined' && ACH[k]) || null).filter(Boolean);
    const d = document.createElement('div'); d.id = 'v9Vitrina'; d.className = 'glass-card rounded-3xl p-4';
    d.innerHTML = `<div class="flex items-center justify-between gap-2 flex-wrap"><p class="font-wizard font-bold text-amber-300">🏆 Vitrina de trofeos</p><div class="flex gap-1.5"><button class="v8-chip" onclick="V9E.signature()">✍️ Mi firma</button><button class="v8-chip" onclick="switchTab('shop');setTimeout(()=>diagonGo('malkin'),200)">🖼️ Marcos y ropero</button></div></div>
      <div class="v9-shelf">${list.length ? list.map(a => `<div class="tro" title="${esc(a[1])}"><span>${a[0]}</span><small>${esc(a[1])}</small></div>`).join('') : '<p class="text-xs text-stone-400 p-4">Gana logros para llenar tu vitrina.</p>'}</div>`;
    const anchor = $('v9ProfShare'); if (anchor) anchor.insertAdjacentElement('afterend', d); else sec.prepend(d);
  }
  if (typeof switchTab === 'function') { const _sw = switchTab; window.switchTab = switchTab = function (tab) { const r = _sw.apply(this, arguments); if (tab === 'profile') setTimeout(() => { const v = $('v9Vitrina'); if (v) v.remove(); vitrina(); }, 120); return r; }; }
  // datos extra del perfil público: cromos, patronus, récords, marco
  if (typeof publishProfile === 'function') {
    const _pp = publishProfile;
    window.publishProfile = publishProfile = async function () {
      await _pp.apply(this, arguments);
      try { if (!cloud.user || !sb) return; const p = S.v9p && S.v9p.cur && window.V9P ? V9P.byId(S.v9p.cur) : null, v8 = S.v8 || {};
        await sb.from('perfiles').update({ extra: { cromos: Object.keys(v8.cards || {}).length, pat: p ? { e: p.e, n: p.name, r: p.r, lv: V9P.level(p.id) } : null, npat: (S.v9p || {}).owned ? S.v9p.owned.length : 0, marco: st().frame, best: v8.best || {}, duelos: (S.stats || {}).duelsWon || 0, historia: storyState().y } }).eq('user_id', cloud.user.id);
      } catch (e) {}
    };
  }
  if (typeof profileCardHtml === 'function') {
    const _pc = profileCardHtml;
    window.profileCardHtml = profileCardHtml = function (p) {
      let h = _pc.apply(this, arguments); const x = p.extra; if (!x) return h;
      const R = window.V9P ? V9P.RAR : {}, pat = x.pat;
      const add = `<div class="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
        <div class="bg-black/30 rounded-lg p-2"><b class="block text-amber-200 text-base">${x.cromos || 0}/60</b>cromos</div>
        <div class="bg-black/30 rounded-lg p-2"><b class="block text-amber-200 text-base">${x.duelos || 0}</b>duelos ganados</div>
        <div class="bg-black/30 rounded-lg p-2"><b class="block text-amber-200 text-base">${x.historia || 0}/7</b>años</div></div>
        ${pat ? `<div class="mt-2 flex items-center gap-3 rounded-xl p-2" style="background:rgba(14,40,70,.5);border:1px solid ${(R[pat.r] || {}).col || '#7dd3fc'}"><span class="text-3xl" style="filter:drop-shadow(0 0 10px #bae6fd)">${pat.e}</span><span class="text-xs"><b class="text-sky-200">${esc(pat.n)}</b><br>${(R[pat.r] || {}).n || ''} · nivel ${pat.lv || 1} · ${x.npat || 1} patronus</span></div>` : ''}
        ${x.best && Object.keys(x.best).length ? `<p class="text-[11px] text-stone-400 mt-2">Récords: ${Object.entries(x.best).slice(0, 6).map(([k, v]) => `${esc((typeof GAMES !== 'undefined' && (GAMES.find(g => g.id === k) || {}).name) || k)} ${v}`).join(' · ')}</p>` : ''}`;
      return h.replace(/<\/div>\s*$/, add + '</div>');
    };
  }

  /* tiendas recién creadas aparecen en la calle aunque ya se haya dibujado */
  if (typeof renderShop === 'function' && typeof currentTab !== 'undefined' && currentTab === 'shop') try { renderShop(); } catch (e) {}
})();
