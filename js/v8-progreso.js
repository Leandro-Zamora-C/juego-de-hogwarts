/* =====================================================================
   HOGWARTS · VERSIÓN 8 · PROGRESO DIARIO Y COMUNIDAD
   Misiones diarias y semanales, premio por entrar cada día, efectos de
   varita, ranas en Honeydukes, decoración, Gringotts a plazo fijo,
   club de tu casa, casa ganadora del mes y retos a un amigo.
===================================================================== */
(() => {
  const V8 = window.V8, st = V8.st;

  /* =====================================================================
     MISIONES
  ===================================================================== */
  // [id, texto, evento, cantidad diaria, cantidad semanal, filtro]
  const TPL = [
    ['ok', 'Acierta {n} preguntas', 'answer', [8, 12, 15], [60, 80], d => d.ok],
    ['duelw', 'Gana {n} duelo(s)', 'duelWin', [1, 2], [5, 7]],
    ['duelp', 'Juega {n} duelos', 'duelPlayed', [2, 3], [10]],
    ['games', 'Juega {n} minijuegos', 'gamePlayed', [2, 3], [10, 15]],
    ['ludo', 'Juega {n} partida(s) de Ludo', 'ludoPlayed', [1], [4]],
    ['ludow', 'Gana {n} partida(s) de Ludo', 'ludoWin', [1], [3]],
    ['frog', 'Abre {n} rana(s) de chocolate', 'frog', [1], [5]],
    ['pet', 'Cuida a tu mascota {n} veces', 'pet', [2], [8]],
    ['daily', 'Responde el desafío diario', 'daily', [1], [5]],
    ['cap', 'Atrapa {n} fichas en el Ludo', 'ludoCapture', [2], [8]],
    ['score', 'Gana puntos en {n} minijuegos', 'gameScore', [2, 3], [12], d => d.points > 0],
    ['beast', 'Descubre {n} criatura(s)', 'beast', [1], [3]]
  ];
  function makeList(key, weekly) {
    const r = V8.rng(V8.seedOf(key + (S.playerId || S.student || '')));
    return V8.shuffle(TPL.filter(t => !(t[0] === 'pet' && !S.pet)), r).slice(0, 3).map(t => { const n = V8.pick(weekly ? t[4] : t[3], r); return { id: t[0], n, p: 0, done: false, got: false }; });
  }
  function missions() {
    const s = st(), d = V8.day(), w = V8.week();
    if (!s.missions || s.missions.day !== d) s.missions = Object.assign({}, s.missions || {}, { day: d, list: makeList('d' + d, false) });
    if (s.missions.week !== w) Object.assign(s.missions, { week: w, wlist: makeList('w' + w, true) });
    return s.missions;
  }
  V8.missions = missions;
  const label = m => { const t = TPL.find(x => x[0] === m.id); return t ? t[1].replace('{n}', m.n) : m.id; };
  const evMap = {}; TPL.forEach(t => (evMap[t[2]] = evMap[t[2]] || []).push(t));
  V8.on('*', (data, type) => {
    if (!evMap[type]) return;
    const M = missions(); let changed = false;
    [...M.list, ...M.wlist].forEach(m => {
      const t = evMap[type].find(x => x[0] === m.id); if (!t || m.done) return;
      if (t[5] && !t[5](data)) return;
      m.p = Math.min(m.n, m.p + 1); changed = true;
      if (m.p >= m.n) { m.done = true; toast(`¡Misión cumplida! ${label(m)}. Reclama tu premio.`, '📜'); sfx('achieve'); }
    });
    if (changed) { save(); renderMissionCard(); }
  });
  V8.on('frog', () => {});
  const _disc = V8.discover; V8.discover = (id, silent) => { const r = _disc(id, silent); if (r) V8.emit('beast', { id }); return r; };
  V8.claim = (weekly, i) => {
    const M = missions(), m = (weekly ? M.wlist : M.list)[i]; if (!m || !m.done || m.got) return;
    m.got = true; save();
    if (weekly) { V8.gold(600, 'Misión semanal'); V8.addFrogs(3); } else { V8.gold(90, 'Misión diaria'); if (i === 2) V8.addFrogs(1); }
    if (Math.random() < .5) { const sp = V8.pick(V8.SPELLS.filter(x => !st().spells.includes(x.id))); if (sp) V8.learnSpell(sp.id); }
    fireConfetti({ particleCount: 60, spread: 70 }); sfx('levelup');
    if (M.list.every(x => x.got)) { unlock('v8missions'); toast('¡Completaste las 3 misiones de hoy! La Sala de los Menesteres apareció en el mapa del castillo.', '🚪'); }
    renderMissionCard(); if ($('v8Sheet')) V8.openMissions();
  };
  const row = (m, i, weekly) => `<div class="v8-mission ${m.got ? 'got' : m.done ? 'done' : ''}"><div class="flex-grow min-w-0"><b>${label(m)}</b><div class="bar"><i style="width:${m.p / m.n * 100}%"></i></div><small>${m.p}/${m.n} · Premio: ${weekly ? '600 🪙 + 3 🐸' : i === 2 ? '90 🪙 + 1 🐸' : '90 🪙'}</small></div>${m.got ? '<span class="ok">✔</span>' : m.done ? `<button class="btn-gold !py-1 !px-3 !text-xs" onclick="V8.claim(${weekly},${i})">Reclamar</button>` : ''}</div>`;
  V8.openMissions = () => { const M = missions(); V8.sheet('📜 Misiones', `<p class="text-xs text-stone-400 mb-2">Se renuevan cada día y cada semana.</p><h4 class="v8-h4">Hoy</h4>${M.list.map((m, i) => row(m, i, false)).join('')}<h4 class="v8-h4 mt-4">Esta semana</h4>${M.wlist.map((m, i) => row(m, i, true)).join('')}`); };
  function renderMissionCard() {
    const box = $('v8HomeCard'); if (!box) return; const M = missions(), s = st();
    const todo = M.list.filter(m => m.done && !m.got).length + M.wlist.filter(m => m.done && !m.got).length;
    box.innerHTML = `<div class="v8-homegrid">
      <button class="v8-hbtn" onclick="V8.openMissions()"><span>📜</span><b>Misiones</b><small>${M.list.filter(m => m.got).length}/3 hoy${todo ? ` · <em>${todo} por reclamar</em>` : ''}</small></button>
      <button class="v8-hbtn" onclick="V8.openDaily()"><span>🎁</span><b>Premio diario</b><small>${s.daily.last === V8.day() ? 'Ya lo reclamaste' : '<em>¡Disponible!</em>'}</small></button>
      <button class="v8-hbtn" onclick="V8.openFrog()"><span>🐸</span><b>Ranas</b><small>${s.frogs || 0} sin abrir</small></button>
      <button class="v8-hbtn" onclick="V8.openCastle ? V8.openCastle() : switchTab('castillo')"><span>🏰</span><b>Castillo</b><small>Explora y busca secretos</small></button>
      <button class="v8-hbtn" onclick="V8.retoNew()"><span>⚔️</span><b>Reta a un amigo</b><small>10 preguntas, sin estar conectados</small></button>
      <button class="v8-hbtn" onclick="V8.goCol('cromos')"><span>📒</span><b>Colección</b><small>${Object.keys(s.cards).length}/${V8.CARDS.length} cromos</small></button></div>`;
  }
  V8.renderMissionCard = renderMissionCard;

  /* =====================================================================
     PREMIO POR ENTRAR CADA DÍA
  ===================================================================== */
  const DAILY = [['20 🪙', s => V8.gold(20)], ['30 🪙', s => V8.gold(30)], ['1 🐸', s => V8.addFrogs(1)], ['50 🪙', s => V8.gold(50)], ['2 🐸', s => V8.addFrogs(2)], ['80 🪙', s => V8.gold(80)], ['🎁 Cofre', s => { V8.gold(150); V8.addFrogs(3); const leg = V8.CARDS.filter(c => c.r !== 'c' && !(st().cards[c.id])); const c = V8.pick(leg.length ? leg : V8.CARDS); st().cards[c.id] = (st().cards[c.id] || 0) + 1; save(); toast(`El cofre trae el cromo ${c.name}`, '🃏'); }]];
  function dailyState() { const s = st(), d = V8.day(), y = V8.day(new Date(Date.now() - 86400000)); let streak = s.daily.streak || 0; if (s.daily.last !== d && s.daily.last !== y) streak = 0; return { claimed: s.daily.last === d, streak, idx: streak % 7 }; }
  V8.openDaily = () => {
    const ds = dailyState(), cur = ds.claimed ? (ds.streak - 1) % 7 : ds.idx;
    V8.sheet('🎁 Premio diario', `<p class="text-sm text-stone-300 text-center">Entra cada día seguido para llegar al cofre del día 7. Si faltas un día, vuelves al día 1.</p>
      <div class="v8-days">${DAILY.map((d, i) => `<div class="${i < cur || (ds.claimed && i === cur) ? 'got' : i === cur ? 'now' : ''}"><small>Día ${i + 1}</small><b>${d[0]}</b></div>`).join('')}</div>
      <div class="text-center mt-3">${ds.claimed ? '<p class="text-emerald-300 text-sm">✔ Ya reclamaste el premio de hoy. ¡Vuelve mañana!</p>' : '<button class="btn-gold" onclick="V8.claimDaily()">Reclamar premio del día ' + (cur + 1) + '</button>'}</div>
      <p class="text-center text-xs text-stone-500 mt-2">Racha actual: ${ds.streak} días 🔥</p>`);
  };
  V8.claimDaily = () => { const ds = dailyState(); if (ds.claimed) return; const s = st(); s.daily = { last: V8.day(), streak: ds.streak + 1 }; save(); DAILY[ds.idx][1](s); sfx('levelup'); fireConfetti({ particleCount: 90, spread: 80 }); if (ds.idx === 6) unlock('v8chest'); V8.openDaily(); renderMissionCard(); };
  V8.autoDaily = () => { if (V8._dailyShown || dailyState().claimed || !S.house || !V8.signed()) return; setTimeout(() => { const dlg = $('dialog'); if (activeGame || $('v8Sheet') || $('v7Tut') || (dlg && !dlg.classList.contains('hidden')) || currentTab !== 'home') return; V8._dailyShown = true; V8.openDaily(); }, 900); };

  /* =====================================================================
     TIENDAS NUEVAS: Honeydukes y Decoración Mágica · Efectos de varita
  ===================================================================== */
  const FX = [['fx-none', 'Sin efecto', '✨', 0], ['fx-stars', 'Lluvia de estrellas', '⭐', 120], ['fx-hearts', 'Corazones', '💖', 120], ['fx-snow', 'Copos de nieve', '❄️', 150], ['fx-fire', 'Fuego de dragón', '🔥', 180], ['fx-butter', 'Mariposas', '🦋', 200], ['fx-bolt', 'Rayos', '⚡', 220], ['fx-music', 'Notas musicales', '🎵', 160]];
  const FROG_PACKS = [[1, 25], [5, 110], [12, 240]];
  if (typeof DIAGON !== 'undefined') { DIAGON.push({ id: 'honeydukes', name: 'Honeydukes', icon: '🐸', color: '#be185d', desc: 'Ranas de chocolate con cromos coleccionables.' }, { id: 'decor', name: 'Decoración Mágica', icon: '🛋️', color: '#0f766e', desc: 'Muebles para tu sala común.' }); }
  V8.buyFrogs = i => { const [n, p] = FROG_PACKS[i]; if ((S.gold || 0) < p) return toast('No te alcanzan los galeones.', '🪙'); S.gold -= p; save(); updateWallet(); V8.addFrogs(n, 'Compraste'); sfx('achieve'); renderShop(); };
  V8.buyFx = id => { const f = FX.find(x => x[0] === id), s = st(); if (!f) return; if (!s.owned.includes(id) && f[3]) { if ((S.gold || 0) < f[3]) return toast('No te alcanzan los galeones.', '🪙'); S.gold -= f[3]; s.owned.push(id); updateWallet(); sfx('achieve'); unlock('v8fx'); } s.effect = id; save(); renderShop(); toast(`Efecto de varita: ${f[1]}`, f[2]); };
  if (typeof renderShop === 'function') {
    const _rs = renderShop;
    renderShop = function () {
      _rs();
      const panel = $('diagonPanel'); if (!panel || typeof diagonStore === 'undefined') return;
      const s = st(); let extra = '';
      if (diagonStore === 'weasley') extra = `<div class="space-y-2"><h3 class="font-wizard font-bold text-amber-300">🪄 Efectos de varita</h3><p class="text-[11px] text-stone-400">Se ven en la estela de tu varita y en tus rayos del duelo.</p><div class="grid grid-cols-2 sm:grid-cols-4 gap-2">${FX.map(f => { const own = !f[3] || s.owned.includes(f[0]), on = (s.effect || 'fx-none') === f[0]; return `<div class="glass-card rounded-2xl p-3 text-center space-y-1 ${on ? '!border-emerald-500/70' : ''}"><div class="text-3xl">${f[2]}</div><p class="text-[11px] font-bold text-amber-100">${f[1]}</p>${on ? '<span class="text-[10px] font-bold text-emerald-300">✔ En uso</span>' : `<button class="${own ? 'btn-ghost' : 'btn-gold'} !py-1 !px-2 !text-[10px] w-full" onclick="V8.buyFx('${f[0]}')" ${!own && S.gold < f[3] ? 'disabled' : ''}>${own ? 'Usar' : '🪙 ' + f[3]}</button>`}</div>`; }).join('')}</div></div>`;
      if (diagonStore === 'honeydukes') extra = `<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">${FROG_PACKS.map(([n, p], i) => `<div class="glass-card rounded-2xl p-4 text-center space-y-2"><div class="text-5xl">🐸</div><p class="font-bold text-amber-100">${n === 1 ? '1 rana' : `Caja de ${n} ranas`}</p><p class="text-[11px] text-stone-400">${n >= 5 ? 'Más barato por rana' : 'Trae un cromo al azar'}</p><button class="btn-gold w-full !py-1.5" onclick="V8.buyFrogs(${i})" ${S.gold < p ? 'disabled' : ''}>🪙 ${p}</button></div>`).join('')}</div><p class="text-xs text-stone-400">Tienes ${s.frogs || 0} ranas sin abrir. <button class="underline text-amber-300" onclick="V8.goCol('cromos')">Ver álbum</button></p>`;
      if (diagonStore === 'honeydukes' && V8.cardShopHTML) extra += V8.cardShopHTML();
      if (diagonStore === 'decor') extra = `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">${V8.DECOR.filter(d => d.price).map(d => { const own = s.owned.includes('d-' + d.id); return `<div class="glass-card rounded-2xl p-3 text-center space-y-1"><div class="text-3xl">${d.e}</div><p class="text-[11px] font-bold text-amber-100 min-h-[2rem]">${esc(d.n)}</p>${own ? '<span class="text-[10px] font-bold text-emerald-300">✔ En tu sala</span>' : `<button class="btn-gold !py-1 !px-2 !text-[10px] w-full" onclick="V8.buyDecor('${d.id}')" ${S.gold < d.price ? 'disabled' : ''}>🪙 ${d.price}</button>`}</div>`; }).join('')}</div><p class="text-xs text-stone-400"><button class="underline text-amber-300" onclick="V8.goCol('sala')">Ver mi sala común</button></p>`;
      if (diagonStore === 'gringotts') extra = depositsHTML();
      if (extra) panel.insertAdjacentHTML('beforeend', extra);
    };
  }
  // estela con figuras del efecto elegido
  const fxc = { cv: null, x: null, p: [], raf: 0 };
  document.addEventListener('pointermove', e => {
    const s = st(), f = FX.find(x => x[0] === s.effect); if (!f || f[0] === 'fx-none' || V8.reduced() || V8.low()) return;
    if (e.pointerType === 'mouse' && Math.random() < .7) return;
    if (!fxc.cv) { fxc.cv = document.createElement('canvas'); fxc.cv.id = 'v8Fx'; document.body.appendChild(fxc.cv); fxc.x = fxc.cv.getContext('2d'); }
    if (fxc.p.length < 60) fxc.p.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - .5) * 1.4, vy: f[0] === 'fx-fire' ? -1.2 : f[0] === 'fx-snow' ? .8 : -.4, l: 1, s: 12 + Math.random() * 10, e: f[2], r: Math.random() * 6 });
    if (!fxc.raf) fxc.raf = requestAnimationFrame(fxLoop);
  }, { passive: true });
  function fxLoop() {
    fxc.raf = 0; const { cv, x } = fxc; if (cv.width !== innerWidth || cv.height !== innerHeight) { cv.width = innerWidth; cv.height = innerHeight; }
    x.clearRect(0, 0, cv.width, cv.height); x.textAlign = 'center'; x.textBaseline = 'middle';
    fxc.p = fxc.p.filter(p => { p.x += p.vx; p.y += p.vy; p.l -= .025; p.r += .05; if (p.l <= 0) return false; x.globalAlpha = p.l; x.font = `${p.s}px serif`; x.save(); x.translate(p.x, p.y); x.rotate(p.r * .2); x.fillText(p.e, 0, 0); x.restore(); return true; });
    x.globalAlpha = 1; if (fxc.p.length) fxc.raf = requestAnimationFrame(fxLoop);
  }
  // los rayos del duelo toman el color del efecto
  const FXCOL = { 'fx-stars': '#fde047', 'fx-hearts': '#f472b6', 'fx-snow': '#bae6fd', 'fx-fire': '#f97316', 'fx-butter': '#a78bfa', 'fx-bolt': '#60a5fa', 'fx-music': '#34d399' };
  if (typeof beam === 'function') { const _b = beam; beam = function (fromLeft, color) { const c = fromLeft && FXCOL[st().effect] ? FXCOL[st().effect] : color; return _b(fromLeft, c); }; }

  /* ---------- Gringotts: depósitos a plazo fijo ---------- */
  const PLAZOS = [[1, .05, '1 día'], [3, .15, '3 días'], [7, .4, '7 días'], [14, .9, '14 días'], [30, 2.2, '30 días']];
  function depositsHTML() {
    const s = st(), now = Date.now();
    return `<div class="glass-card rounded-2xl p-4 space-y-3"><h3 class="font-wizard font-bold text-amber-300">📈 Plazo fijo</h3><p class="text-[11px] text-stone-400">Deja tus galeones guardados un tiempo y recíbelos con intereses. No puedes sacarlos antes.</p>
      <div class="flex gap-2"><input id="dpAmt" type="number" min="10" placeholder="Cantidad" class="flex-grow bg-stone-950 border border-amber-800/50 rounded-xl px-3 py-2 text-center text-amber-100"><select id="dpTerm" class="bg-stone-950 border border-amber-800/50 rounded-xl px-2 text-amber-100 text-sm">${PLAZOS.map(([d, r, l], i) => `<option value="${i}">${l} · +${Math.round(r * 100)}%</option>`).join('')}</select></div>
      <button class="btn-gold w-full" onclick="V8.deposit()">Depositar a plazo fijo</button>
      ${s.deposits.length ? s.deposits.map((d, i) => { const ready = now >= d.until; return `<div class="v8-mission"><div class="flex-grow"><b>${d.amt} 🪙 → ${d.amt + d.gain} 🪙</b><small>${ready ? '¡Listo para cobrar!' : `Faltan ${Math.ceil((d.until - now) / 3600000)} horas`}</small></div>${ready ? `<button class="btn-gold !py-1 !px-3 !text-xs" onclick="V8.collect(${i})">Cobrar</button>` : '⏳'}</div>`; }).join('') : ''}</div>`;
  }
  V8.deposit = () => { const n = Math.floor(+($('dpAmt') || {}).value || 0), t = PLAZOS[+($('dpTerm') || {}).value || 0]; if (n < 10) return toast('Mínimo 10 galeones.', '🏦'); if (n > (S.gold || 0)) return toast('No tienes tantos galeones.', '🪙'); if (st().deposits.length >= 3) return toast('Puedes tener hasta 3 depósitos a la vez.', '🏦'); S.gold -= n; st().deposits.push({ amt: n, gain: Math.min(400, Math.round(n * t[1])), until: Date.now() + t[0] * 86400000 }); save(); updateWallet(); sfx('correct'); renderShop(); };
  V8.collect = i => { const s = st(), d = s.deposits[i]; if (!d || Date.now() < d.until) return; s.deposits.splice(i, 1); save(); V8.gold(d.amt + d.gain, 'Cobraste tu plazo fijo'); unlock('v8bank'); renderShop(); };

  /* =====================================================================
     CLUB DE TU CASA Y CASA GANADORA DEL MES (Supabase)
  ===================================================================== */
  const REACTS = ['👏', '🔥', '⭐', '💪'];
  async function renderClub() {
    const box = $('v8Club'); if (!box) return;
    if (!supaReady() || !S.house) { box.innerHTML = '<p class="text-xs text-stone-400">El club se activa con Supabase y una casa elegida.</p>'; return; }
    box.innerHTML = '<p class="text-xs text-stone-400"><i class="fa-solid fa-spinner fa-spin"></i> Cargando…</p>';
    try {
      const c = await loadSupabase(), sem = weekId();
      const { data } = await c.from('torneo').select('nombre,puntos').eq('semana', sem).eq('casa', S.house).order('puntos', { ascending: false }).limit(10);
      let reacts = {}; try { const r = await rpc('club_reacciones', { p_semana: sem, p_casa: S.house }); (r || []).forEach(x => { reacts[x.nombre] = reacts[x.nombre] || {}; reacts[x.nombre][x.emoji] = x.n; }); } catch (e) {}
      const list = data || [];
      box.innerHTML = list.length ? list.map((p, i) => `<div class="v8-clubrow"><span class="pos">${['🥇', '🥈', '🥉'][i] || i + 1}</span><b class="truncate">${esc(p.nombre)}</b><small>${p.puntos} pts</small><span class="rx">${REACTS.map(e => `<button onclick="V8.react('${esc(p.nombre).replace(/'/g, '')}','${e}')">${e}<i>${(reacts[p.nombre] || {})[e] || ''}</i></button>`).join('')}</span></div>`).join('')
        : '<p class="text-xs text-stone-400">Nadie de tu casa sumó puntos esta semana. ¡Sé el primero!</p>';
    } catch (e) { box.innerHTML = '<p class="text-xs text-stone-400">No se pudo cargar el club.</p>'; }
  }
  V8.react = async (nombre, e) => { const k = 'r-' + weekId() + nombre + e, s = st(); s.reacted = s.reacted || {}; if (s.reacted[k]) return toast('Ya reaccionaste con ese emoji.', '🙂'); try { await rpc('club_reaccionar', { p_semana: weekId(), p_casa: S.house, p_nombre: nombre, p_emoji: e }); s.reacted[k] = 1; save(); sfx('tick'); renderClub(); } catch (err) { toast('Para reaccionar falta ejecutar supabase-v8.sql.', '⚠️'); } };
  if (typeof renderCommunity === 'function') {
    const _rc = renderCommunity;
    renderCommunity = function () {
      _rc();
      const sec = $('tab-community'); if (!sec) return;
      if (!$('v8ClubCard')) sec.insertAdjacentHTML('beforeend', `<div id="v8ClubCard" class="max-w-5xl mx-auto glass-card rounded-3xl p-5 space-y-2"><div class="flex items-center justify-between"><h3 class="font-wizard font-bold text-amber-300">🏠 Club de ${esc(S.house || 'tu casa')} · esta semana</h3><span class="text-[10px] text-stone-500">Reacciona con emojis</span></div><div id="v8Club"></div></div>`);
      renderClub();
    };
  }
  // casa ganadora del mes anterior: decora el Gran Salón
  async function season() {
    if (!supaReady()) return;
    try {
      const r = await rpc('copa_temporada'); if (!r) return;
      const prev = r.anterior, hall = $('v7Hall');
      if (prev && hall && !$('v8Season')) {
        const H = { Gryffindor: '🦁', Slytherin: '🐍', Ravenclaw: '🦅', Hufflepuff: '🦡' };
        hall.insertAdjacentHTML('beforeend', `<div id="v8Season" class="v8-season" style="--c:${V8.houseColor(prev)}">${H[prev] || '🏆'} ${esc(prev)} ganó la Copa del mes pasado</div>`);
        hall.style.boxShadow = `0 0 0 2px ${V8.houseColor(prev)}, 0 18px 40px rgba(0,0,0,.45)`;
        if (prev === S.house && !st()['season' + r.mes]) { st()['season' + r.mes] = 1; save(); V8.gold(100, `¡Tu casa ganó la Copa de ${r.mes}!`); V8.addFrogs(1); }
      }
    } catch (e) {}
  }

  /* =====================================================================
     RETA A UN AMIGO (10 preguntas, cada uno cuando pueda)
  ===================================================================== */
  const R = { list: [], i: 0, ok: 0, t0: 0, timer: 0, code: null, mode: 'new', left: 20 };
  V8.retoNew = async () => {
    if (window.V7 && V7.guardPlay && V7.guardPlay()) return;
    await V8.loadPool(); const P = V8.pool();
    const idx = V8.shuffle(P.map((_, i) => i)).slice(0, 10);
    startReto(idx, null);
  };
  function startReto(idx, reto) {
    const P = V8.pool();
    Object.assign(R, { list: idx.map(i => { const q = P[i]; return q ? { ...q, opts: V8.shuffle([q.a, ...q.w]) } : null; }).filter(Boolean), idx, i: 0, ok: 0, t0: performance.now(), reto, ans: [] });
    if (R.list.length < 10) { toast('Este reto es de otra versión del juego.', '⚠️'); return; }
    V8.sheet(reto ? `⚔️ Reto de ${esc(reto.nombre)}` : '⚔️ Reta a un amigo', '<div id="rtBox"></div>');
    V8._sheetClose = () => clearInterval(R.timer);
    retoQ();
  }
  function retoQ() {
    const box = $('rtBox'); if (!box) return; clearInterval(R.timer);
    if (R.i >= R.list.length) return retoEnd();
    const q = R.list[R.i]; R.left = 20;
    box.innerHTML = `<div class="flex justify-between text-xs text-stone-400"><span>Pregunta ${R.i + 1}/10</span><span>⏳ <b id="rtT">20</b> s · ✔ ${R.ok}</span></div>
      <p class="text-[10px] uppercase tracking-widest text-amber-500 font-bold mt-2">${esc(q.movie || '')}</p><p class="font-bold text-amber-100 text-lg my-2">${esc(q.q)}</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${q.opts.map((o, i) => `<button class="opt-btn !text-sm" onclick="V8.retoAns(${i})">${esc(o)}</button>`).join('')}</div>`;
    R.timer = setInterval(() => { R.left--; const t = $('rtT'); if (t) t.textContent = R.left; if (R.left <= 0) V8.retoAns(-1); }, 1000);
  }
  V8.retoAns = i => {
    clearInterval(R.timer); const q = R.list[R.i], ok = i >= 0 && q.opts[i] === q.a; if (ok) R.ok++;
    const btns = [...document.querySelectorAll('#rtBox .opt-btn')]; btns.forEach((b, k) => { b.disabled = true; if (q.opts[k] === q.a) b.classList.add('correct'); else if (k === i) b.classList.add('wrong'); });
    sfx(ok ? 'correct' : 'wrong'); V8.emit('answer', { ok, q, source: 'reto' });
    R.i++; setTimeout(retoQ, 900);
  };
  async function retoEnd() {
    const secs = Math.round((performance.now() - R.t0) / 1000), box = $('rtBox');
    addXp(R.ok * 2);
    if (!R.reto) {
      box.innerHTML = `<div class="text-center space-y-3"><div class="text-5xl">📜</div><p class="font-wizard text-xl text-amber-300">Acertaste ${R.ok}/10 en ${secs} s</p><p class="text-sm text-stone-300">Ahora manda el reto a un amigo: jugará las mismas 10 preguntas cuando pueda.</p><p id="rtMsg" class="text-xs text-stone-400"><i class="fa-solid fa-spinner fa-spin"></i> Creando el reto…</p></div>`;
      try {
        const code = await rpc('reto_crear', { p_nombre: V8.name(), p_casa: S.house || null, p_preguntas: R.idx, p_aciertos: R.ok, p_segundos: secs });
        const url = `${(CONFIG.SITE_URL || (location.origin + location.pathname)).replace(/\?.*$/, '')}?reto=${code}`;
        const txt = `⚔️ Te reto en Hogwarts: acerté ${R.ok}/10. ¿Me superas? Juega aquí:`;
        $('rtMsg').innerHTML = `<div class="flex gap-2 justify-center"><button class="btn-gold" onclick='V8.share(${JSON.stringify(txt)}, ${JSON.stringify(url)})'><i class="fa-brands fa-whatsapp"></i> Enviar reto</button><button class="btn-ghost" onclick="V8.retoView('${code}')">Ver resultados</button></div><p class="mt-2">Código del reto: <b class="text-amber-300 tracking-widest">${code}</b></p>`;
        V8.emit('retoCreado', {});
      } catch (e) { $('rtMsg').innerHTML = '<span class="text-red-300">No se pudo guardar el reto. ¿Ejecutaste supabase-v8.sql?</span>'; }
    } else {
      box.innerHTML = `<div class="text-center space-y-2"><div class="text-5xl">${R.ok > R.reto.aciertos || (R.ok === R.reto.aciertos && secs < R.reto.segundos) ? '🏆' : R.ok === R.reto.aciertos ? '🤝' : '💪'}</div><p class="font-wizard text-xl text-amber-300">Tú: ${R.ok}/10 (${secs} s) · ${esc(R.reto.nombre)}: ${R.reto.aciertos}/10 (${R.reto.segundos} s)</p><p id="rtMsg" class="text-xs text-stone-400">Guardando…</p></div>`;
      try { await rpc('reto_jugar', { p_codigo: R.reto.codigo, p_nombre: V8.name(), p_aciertos: R.ok, p_segundos: secs }); } catch (e) {}
      if (R.ok > R.reto.aciertos || (R.ok === R.reto.aciertos && secs < R.reto.segundos)) { V8.gold(30, 'Superaste el reto'); unlock('v8reto'); }
      V8.retoView(R.reto.codigo, true);
    }
  }
  V8.share = (txt, url) => { if (navigator.share) navigator.share({ title: 'Hogwarts Magic Experience', text: txt, url }).catch(() => {}); else window.open('https://wa.me/?text=' + encodeURIComponent(txt + ' ' + url), '_blank'); };
  V8.retoView = async (code, keep) => {
    try {
      const r = await rpc('reto_ver', { p_codigo: code }); if (!r) throw 0;
      const rows = [{ nombre: r.nombre + ' (creador)', aciertos: r.aciertos, segundos: r.segundos }, ...(r.jugadas || [])].sort((a, b) => b.aciertos - a.aciertos || a.segundos - b.segundos);
      const html = `<h4 class="v8-h4 mt-3">🏆 Resultados del reto ${code}</h4>${rows.map((x, i) => `<div class="v8-clubrow"><span class="pos">${['🥇', '🥈', '🥉'][i] || i + 1}</span><b class="truncate">${esc(x.nombre)}</b><small>${x.aciertos}/10 · ${x.segundos} s</small></div>`).join('')}`;
      if (keep && $('rtBox')) $('rtBox').insertAdjacentHTML('beforeend', html); else V8.sheet('⚔️ Reto', html);
    } catch (e) { if (!keep) toast('No se encontró ese reto.', '🔍'); else { const m = $('rtMsg'); if (m) m.textContent = ''; } }
  };
  // enlace ?reto=CODIGO
  try {
    const code = (new URLSearchParams(location.search).get('reto') || '').toUpperCase();
    if (/^[A-Z0-9]{6}$/.test(code)) {
      history.replaceState(null, '', location.pathname);
      const go = async () => {
        if (!S.house || !V8.signed()) { setTimeout(go, 1500); return; }
        try { const r = await rpc('reto_ver', { p_codigo: code }); if (!r) throw 0; await V8.loadPool(); showDialog({ icon: '⚔️', title: `${esc(r.nombre)} te reta`, body: `Acertó ${r.aciertos}/10 en ${r.segundos} s. ¿Puedes superarlo? Son las mismas 10 preguntas.`, actions: [{ label: '¡Acepto!', primary: true, onClick: () => startReto(r.preguntas, Object.assign({ codigo: code }, r)) }, { label: 'Ahora no' }] }); if (V8.notify) V8.notify('⚔️ Te retaron en Hogwarts', `${r.nombre} acertó ${r.aciertos}/10. ¿Lo superas?`); }
        catch (e) { toast('Ese reto ya no existe.', '🔍'); }
      };
      setTimeout(go, 2500);
    }
  } catch (e) {}

  /* =====================================================================
     TARJETA EN LA PORTADA Y ARRANQUE
  ===================================================================== */
  function homeCard() {
    if ($('v8HomeCard')) return; const q = $('v7Quick'), home = $('tab-home'); if (!home) return;
    const div = document.createElement('div'); div.id = 'v8HomeCard';
    if (q) q.insertAdjacentElement('afterend', div); else home.prepend(div);
    renderMissionCard();
  }
  const _sw = switchTab;
  switchTab = function (tab) { const r = _sw(tab); if (tab === 'home') { homeCard(); renderMissionCard(); } return r; };
  Object.assign(ACH, {
    v8missions: ['📜', 'Alumno aplicado', 'Completa las 3 misiones del día'], v8chest: ['🎁', 'Constancia mágica', 'Llega al cofre del día 7'], v8fx: ['🪄', 'Varita con estilo', 'Compra un efecto de varita'],
    v8bank: ['📈', 'Inversionista', 'Cobra un plazo fijo en Gringotts'], v8reto: ['⚔️', 'Reto superado', 'Supera el reto de un amigo']
  });
  setTimeout(() => { homeCard(); season(); }, 600);
  window.addEventListener('load', () => setTimeout(V8.autoDaily, 4000));
  V8.on('signedIn', () => setTimeout(V8.autoDaily, 1500));
})();
