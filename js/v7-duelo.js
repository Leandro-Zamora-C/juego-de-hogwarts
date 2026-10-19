/* =====================================================================
   HOGWARTS · VERSIÓN 7 · DUELO
   20-30 s por pregunta · 800+ preguntas · dificultad y temas · sin repetir
   comodines · reloj de arena · rayos animados · chat en vivo · apuestas de
   galeones (solo dinero del juego) · revancha en línea · historial
===================================================================== */
(() => {
  const V = window.V7 = window.V7 || {};
  const st = () => { S.v7 = Object.assign({ duelT: 25, duelDiff: 'all', duelTopic: 'all', cpuBet: 0, usedQ: [], history: [], chatSent: 0, betsWon: 0, jokers: 0 }, S.v7 || {}); return S.v7; };
  V.st = st;

  /* ---------- logros nuevos ---------- */
  Object.assign(ACH, {
    v7bet: ['🪙', 'Apostador', 'Gana una apuesta en un duelo'],
    v7chat: ['💬', 'Lechuza parlanchina', 'Escribe en el chat de un duelo en línea'],
    v7joker: ['⏳', 'Giratiempo', 'Usa un comodín en un duelo'],
    v7expert: ['🧠', 'Duelista experto', 'Gana un duelo en dificultad Experto'],
    v7rematch: ['🔁', 'Sin rencores', 'Juega una revancha en línea'],
    v7streak: ['🔥', 'Racha de duelos', 'Gana 3 duelos seguidos']
  });

  /* ---------- historial de partidas ---------- */
  V.addHistory = (icon, text, result, gold) => {
    const s = st(); s.history.unshift({ t: Date.now(), i: icon, x: text, r: result, g: gold || 0 }); s.history = s.history.slice(0, 40); save();
  };

  /* =====================================================================
     BANCO DE PREGUNTAS (carga por partes: solo al abrir el duelo)
  ===================================================================== */
  const TOPICS = { all: 'Todos los temas', peliculas: 'Las 8 películas', hechizos: 'Hechizos', criaturas: 'Criaturas', personajes: 'Personajes', profesores: 'Profesores y clases', pociones: 'Pociones', lugares: 'Lugares', objetos: 'Objetos mágicos', quidditch: 'Quidditch y juegos', historia: 'Historia y películas' };
  const TOPIC_KEYS = ['hechizos', 'criaturas', 'personajes', 'profesores', 'pociones', 'lugares', 'objetos', 'quidditch', 'historia'];
  const DMAP = { 1: 'e', 2: 'm', 3: 'h' };
  let POOL = null, loading = null;
  const qkey = q => hash(q.q).toString(36);
  function buildPool() {
    const out = ALL_Q.map(q => Object.assign({}, q, { topic: 'peliculas', d: q.d || 'm' }));
    const B = window.DUELO_Q || {};
    TOPIC_KEYS.forEach(k => (B[k] || []).forEach(r => out.push({ q: r[0], a: r[1], w: [r[2], r[3], r[4]], d: DMAP[r[5]] || 'm', movie: TOPICS[k], topic: k })));
    POOL = out; V.POOL = POOL; return POOL;
  }
  V.loadDuelQ = () => {
    if (POOL) return Promise.resolve(POOL);
    if (!loading) loading = Promise.all(['js/preguntas-duelo-1.js', 'js/preguntas-duelo-2.js'].map(src => loadScript(src).catch(() => null))).then(buildPool);
    return loading;
  };
  const pool = () => POOL || buildPool();
  function pickQ(used, cfg) {
    const P = pool(), s = st(), recent = new Set(s.usedQ);
    const diff = (cfg && cfg.diff) || s.duelDiff, topic = (cfg && cfg.topic) || s.duelTopic;
    let cand = [];
    P.forEach((q, i) => { if ((diff === 'all' || q.d === diff) && (topic === 'all' || q.topic === topic)) cand.push(i); });
    if (!cand.length) cand = P.map((_, i) => i);
    let free = cand.filter(i => !used.has(i) && !recent.has(qkey(P[i])));
    if (!free.length) { free = cand.filter(i => !used.has(i)); s.usedQ = []; }
    if (!free.length) { used.clear(); free = cand; }
    const i = free[Math.floor(Math.random() * free.length)];
    used.add(i); s.usedQ.push(qkey(P[i])); if (s.usedQ.length > 500) s.usedQ = s.usedQ.slice(-500);
    return i;
  }

  /* =====================================================================
     INTERFAZ: opciones, apuesta contra la IA, reloj de arena, comodines, escenario
  ===================================================================== */
  const BETS = [0, 10, 25, 50, 100, 200];
  const CPU_MULT = { '0.45': 1, '0.65': 1.5, '0.85': 2 };
  function buildSetupUI() {
    if ($('v7DuelOpts')) return;
    const s = st(), btn = $('startDuelBtn');
    btn.insertAdjacentHTML('beforebegin', `
      <div id="v7DuelOpts" class="v7-duelopts">
        <label>⏳ Tiempo por pregunta<select id="v7T">${[20, 25, 30].map(t => `<option value="${t}" ${s.duelT === t ? 'selected' : ''}>${t} segundos</option>`).join('')}</select></label>
        <label>🎚️ Dificultad<select id="v7D">${[['all', 'Todas'], ['e', '🟢 Fácil'], ['m', '🟡 Normal'], ['h', '🔴 Experto']].map(([v, l]) => `<option value="${v}" ${s.duelDiff === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label>📚 Tema<select id="v7Tp">${Object.entries(TOPICS).map(([v, l]) => `<option value="${v}" ${s.duelTopic === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      </div>
      <div id="v7CpuBet" class="v7-bet hidden">
        <p class="text-[11px] font-bold text-amber-300 text-center">🪙 ¿Apuestas galeones contra la IA? <span class="text-stone-400 font-normal">(ganas más contra una IA más difícil)</span></p>
        <div class="chips" id="v7CpuBetChips"></div>
        <p class="text-[10px] text-stone-400 text-center mt-1" id="v7CpuBetInfo"></p>
      </div>`);
    $('v7T').onchange = e => { st().duelT = +e.target.value; save(); };
    $('v7D').onchange = e => { st().duelDiff = e.target.value; save(); };
    $('v7Tp').onchange = e => { st().duelTopic = e.target.value; save(); };
    $('cpuLevel').addEventListener('change', renderCpuBet);
    const intro = document.querySelector('#tab-duel > div:first-child p');
    if (intro) intro.innerHTML = 'Acierta para lanzar un hechizo: 20 de daño, <b class="text-amber-300">30 si respondes en menos de 5 s</b> (crítico). Tienes de 20 a 30 segundos por pregunta.';
  }
  function renderCpuBet() {
    const box = $('v7CpuBetChips'); if (!box) return;
    const s = st(), gold = S.gold || 0, mult = CPU_MULT[$('cpuLevel').value] || 1.5;
    if (s.cpuBet > gold) s.cpuBet = 0;
    box.innerHTML = BETS.slice(0, 5).map(b => `<button class="${s.cpuBet === b ? 'on' : ''}" ${b > gold ? 'disabled' : ''} onclick="V7.setCpuBet(${b})">${b ? '🪙 ' + b : 'Sin apuesta'}</button>`).join('');
    $('v7CpuBetInfo').textContent = s.cpuBet ? `Si ganas: +${Math.round(s.cpuBet * mult)} 🪙 · Si pierdes: −${s.cpuBet} 🪙 · Tienes ${gold} 🪙` : `Tienes ${gold} galeones. Solo es dinero del juego.`;
  }
  V.setCpuBet = b => { st().cpuBet = b; save(); renderCpuBet(); sfx('tick'); };

  function buildArenaUI() {
    if ($('v7DuelStage')) return;
    const arena = $('duelArena');
    arena.insertAdjacentHTML('afterbegin', '<div id="v7DuelStage"><canvas></canvas></div>');
    const tl = $('duelTimeLeft');
    tl.parentElement.insertAdjacentHTML('beforebegin', '<span id="v7Pot" class="v7-pot hidden"></span>');
    tl.parentElement.insertAdjacentHTML('afterbegin', `<span class="v7-hourglass" id="v7Hg"><svg viewBox="0 0 20 30"><path d="M3 2H17M3 28H17" stroke="#fcd34d" stroke-width="2.4" stroke-linecap="round"/><path d="M5 3C5 10 9 12 10 15C11 18 15 20 15 27H5C5 20 9 18 10 15C11 12 15 10 15 3Z" fill="rgba(255,255,255,.08)" stroke="#fcd34d" stroke-width="1.2"/><clipPath id="v7hgT"><path d="M5 3C5 10 9 12 10 15C11 12 15 10 15 3Z"/></clipPath><clipPath id="v7hgB"><path d="M5 27C5 20 9 18 10 15C11 18 15 20 15 27Z"/></clipPath><rect id="v7SandT" x="0" y="3" width="20" height="12" fill="#f5c451" clip-path="url(#v7hgT)"/><rect id="v7SandB" x="0" y="27" width="20" height="0" fill="#f5c451" clip-path="url(#v7hgB)"/><rect id="v7SandS" x="9.5" y="15" width="1" height="12" fill="#f5c451"/></svg></span>`);
    $('duelOptionsGrid').insertAdjacentHTML('afterend', '<div class="v7-jokers" id="v7Jokers"></div>');
    stageInit();
  }
  function setSand(frac) {
    const t = $('v7SandT'), b = $('v7SandB'), hg = $('v7Hg'); if (!t) return;
    frac = Math.max(0, Math.min(1, frac));
    t.setAttribute('y', 3 + 12 * (1 - frac)); t.setAttribute('height', 12 * frac);
    b.setAttribute('y', 27 - 12 * (1 - frac)); b.setAttribute('height', 12 * (1 - frac));
    $('v7SandS').style.opacity = frac > 0 && frac < 1 ? 1 : 0;
    hg.classList.toggle('hurry', frac < .2);
  }
  V.setSand = setSand;

  /* ---------- comodines ---------- */
  const JOK = { t: ['⏳', 'Giratiempo', '+10 s'], f: ['✂️', '50/50', 'quita 2'], h: ['🧙', 'Pista', 'de Dumbledore'] };
  function renderJokers(who, can, set, online) {
    const box = $('v7Jokers'); if (!box) return;
    if (!can) { box.innerHTML = ''; return; }
    box.innerHTML = Object.entries(JOK).map(([k, [ic, nm, sub]]) => `<button class="v7-joker" ${set[k] ? '' : 'disabled'} onclick="V7.useJoker('${k}')" title="${nm}">${ic} ${nm} <small class="opacity-60">${sub}</small></button>`).join('');
  }
  V.useJoker = k => {
    const online = od.running, set = online ? od.jok : duel.jok && duel.jok[duel.turn];
    if (!set || !set[k]) return;
    const q = online ? od.q : duel.q; if (!q) return;
    if (online ? (od.mine || od.resolved) : (duel.locked || !isHumanTurn())) return;
    set[k] = 0; st().jokers++; unlock('v7joker'); sfx('spell');
    const grid = [...$('duelOptionsGrid').children];
    if (k === 't') { if (online) { if (od.host) bumpOnlineTime(); else sendOnline({ type: 'gira' }); } else { duel.t += 10; duel.T += 10; $('duelTimeLeft').textContent = duel.t; } toast('¡Giratiempo! +10 segundos', '⏳'); }
    if (k === 'f') { const wrong = grid.map((b, i) => i).filter(i => q.opts[i] !== q.a); shuffle(wrong).slice(0, 2).forEach(i => grid[i].classList.add('v7-gone')); }
    if (k === 'h') { const a = String(q.a); $('duelLog').innerHTML = `🧙 <i>Pista de Dumbledore:</i> empieza con <b class="text-amber-200">«${esc(a.charAt(0) === '¡' || a.charAt(0) === '«' ? a.charAt(1) : a.charAt(0))}»</b> y tiene ${a.split(' ').length} ${a.split(' ').length === 1 ? 'palabra' : 'palabras'}.`; }
    renderJokers(null, true, set, online);
  };

  /* =====================================================================
     ESCENARIO ANIMADO: varitas, chispas y rayos que chocan
  ===================================================================== */
  const SG = { cv: null, x: null, raf: 0, beams: [], parts: [], t0: performance.now(), clash: .5 };
  function stageInit() {
    SG.cv = document.querySelector('#v7DuelStage canvas'); SG.x = SG.cv.getContext('2d');
    const loop = now => {
      SG.raf = requestAnimationFrame(loop);
      if (document.hidden || !SG.cv.isConnected || $('duelArena').classList.contains('hidden')) return;
      stageDraw(now);
    };
    cancelAnimationFrame(SG.raf); SG.raf = requestAnimationFrame(loop);
  }
  function stageDraw(now) {
    const cv = SG.cv, dpr = Math.min(window.devicePixelRatio || 1, V.quality && V.quality() === 'low' ? 1 : 2), W = cv.clientWidth, H = cv.clientHeight;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const x = SG.x; x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
    const t = (now - SG.t0) / 1000, hp = od.running ? [od.hp[od.host ? 0 : 1], od.hp[od.host ? 1 : 0]] : duel.hp;
    SG.clash += ((.5 + ((hp[0] || 0) - (hp[1] || 0)) / 400) - SG.clash) * .05;
    // suelo con brillo
    const g = x.createRadialGradient(W / 2, H * 1.2, 10, W / 2, H * 1.2, W * .7); g.addColorStop(0, 'rgba(160,110,255,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    // estrellas
    for (let i = 0; i < 26; i++) { const sx = (i * 97.3) % W, sy = (i * 41.7) % (H * .6), a = .25 + .25 * Math.sin(t * 2 + i); x.fillStyle = `rgba(255,240,200,${a})`; x.fillRect(sx, sy, 1.6, 1.6); }
    const L = [W * .12, H * .62], R = [W * .88, H * .62];
    const wand = (p, dir, col) => {
      const ang = dir * (-.35 + Math.sin(t * 1.6 + dir) * .04);
      x.save(); x.translate(p[0], p[1]); x.rotate(ang);
      const len = Math.min(70, W * .12), gr = x.createLinearGradient(0, 0, dir * len, 0); gr.addColorStop(0, '#3b2412'); gr.addColorStop(.6, '#7a4f2a'); gr.addColorStop(1, '#c79a5b');
      x.strokeStyle = gr; x.lineWidth = 6; x.lineCap = 'round'; x.beginPath(); x.moveTo(-dir * 10, 6); x.lineTo(dir * len, 0); x.stroke();
      const tip = [dir * len, 0], gl = x.createRadialGradient(tip[0], tip[1], 0, tip[0], tip[1], 18); gl.addColorStop(0, col); gl.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = gl; x.beginPath(); x.arc(tip[0], tip[1], 18, 0, 7); x.fill(); x.restore();
      return [p[0] + Math.cos(ang) * dir * len, p[1] + Math.sin(ang) * dir * len];
    };
    const tL = wand(L, 1, 'rgba(239,68,68,.9)'), tR = wand(R, -1, 'rgba(16,185,129,.9)');
    // rayos activos
    SG.beams = SG.beams.filter(b => {
      const age = (now - b.t) / 1000; if (age > 1.1) return false;
      const from = b.left ? tL : tR, to = b.left ? [R[0] - 20, R[1] - 30] : [L[0] + 20, L[1] - 30];
      const k = Math.min(1, age / .28), cx = from[0] + (to[0] - from[0]) * k, cy = from[1] + (to[1] - from[1]) * k;
      x.save(); x.globalCompositeOperation = 'lighter';
      for (let w = 3; w >= 1; w--) { x.strokeStyle = w === 1 ? '#fff' : b.col; x.globalAlpha = (w === 1 ? .9 : .35) * (1 - Math.max(0, age - .6) * 2); x.lineWidth = w * 5; x.beginPath(); x.moveTo(from[0], from[1]);
        for (let s = 1; s <= 10; s++) { const f = s / 10; x.lineTo(from[0] + (cx - from[0]) * f + (Math.random() - .5) * 6, from[1] + (cy - from[1]) * f + (Math.random() - .5) * 6); } x.stroke(); }
      x.restore();
      if (k >= 1 && !b.hit) { b.hit = true; for (let i = 0; i < (V.quality && V.quality() === 'low' ? 14 : 36); i++) { const a = Math.random() * 6.28, sp = 1 + Math.random() * 4; SG.parts.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1, l: 1, c: b.col }); } }
      return true;
    });
    // choque central cuando ambos tienen vida (Priori Incantatem)
    const cx = W * SG.clash, cy = H * .48, pulse = 10 + Math.sin(t * 7) * 3;
    x.save(); x.globalCompositeOperation = 'lighter';
    [[tL, 'rgba(239,68,68,.22)'], [tR, 'rgba(16,185,129,.22)']].forEach(([p, c]) => { x.strokeStyle = c; x.lineWidth = 3; x.beginPath(); x.moveTo(p[0], p[1]); x.quadraticCurveTo((p[0] + cx) / 2, cy - 10 + Math.sin(t * 5) * 6, cx, cy); x.stroke(); });
    const cg = x.createRadialGradient(cx, cy, 0, cx, cy, pulse * 2.4); cg.addColorStop(0, 'rgba(255,240,180,.9)'); cg.addColorStop(.4, 'rgba(250,204,21,.35)'); cg.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = cg; x.beginPath(); x.arc(cx, cy, pulse * 2.4, 0, 7); x.fill();
    SG.parts = SG.parts.filter(p => { p.x += p.vx; p.y += p.vy; p.vy += .06; p.l -= .025; if (p.l <= 0) return false; x.fillStyle = p.c; x.globalAlpha = p.l; x.beginPath(); x.arc(p.x, p.y, 2.2 * p.l + .6, 0, 7); x.fill(); return true; });
    x.restore();
  }
  const _beam = beam;
  beam = function (fromLeft, color) { SG.beams.push({ left: fromLeft, col: color, t: performance.now() }); try { _beam(fromLeft, color); } catch (e) {} if (navigator.vibrate && V.vib && V.vib()) navigator.vibrate(30); };

  /* =====================================================================
     DUELO LOCAL (2 jugadores y contra la IA)
  ===================================================================== */
  const _startDuel = startDuel;
  startDuel = function () {
    const s = st();
    if (duel.mode === 'cpu' && s.cpuBet > (S.gold || 0)) { toast('No te alcanzan los galeones para esa apuesta.', '🪙'); s.cpuBet = 0; renderCpuBet(); return; }
    duel.qused = new Set(); duel.jok = [{ t: 1, f: 1, h: 1 }, { t: 1, f: 1, h: 1 }];
    duel.bet = duel.mode === 'cpu' ? s.cpuBet : 0; duel.diffAtStart = s.duelDiff;
    const pot = $('v7Pot'); if (pot) { pot.classList.toggle('hidden', !duel.bet); pot.textContent = `🪙 Apuesta: ${duel.bet}`; }
    V.loadDuelQ().then(() => _startDuel());
  };
  nextDuelTurn = function () {
    if (!duel.running) return;
    clearDuelTimers(); duel.locked = false;
    const i = pickQ(duel.qused || (duel.qused = new Set())), base = pool()[i];
    duel.q = { ...base, opts: shuffle([base.a, ...base.w]) };
    $('duelRound').textContent = duel.round;
    const cur = $('currentDuelPlayer'); cur.textContent = duel.names[duel.turn]; cur.className = duel.turn === 0 ? 'text-red-400' : 'text-emerald-400';
    updateHp();
    $('duelMovie').textContent = (duel.q.movie || '') + (duel.q.d ? ' · ' + ({ e: 'Fácil', m: 'Normal', h: 'Experto' })[duel.q.d] : '');
    $('duelQuestionText').textContent = duel.q.q;
    const grid = $('duelOptionsGrid'); grid.innerHTML = '';
    duel.q.opts.forEach((opt, idx) => {
      const b = document.createElement('button'); b.className = 'opt-btn text-xs sm:text-sm';
      b.innerHTML = `<span class="key-hint">${idx + 1}</span><span>${esc(opt)}</span>`;
      b.onclick = () => { if (isHumanTurn()) answerDuel(idx); }; b.disabled = !isHumanTurn(); grid.appendChild(b);
    });
    renderJokers(duel.turn, isHumanTurn(), duel.jok[duel.turn], false);
    duel.T = st().duelT; duel.t = duel.T; $('duelTimeLeft').textContent = duel.t; setSand(1);
    duel.timer = setInterval(() => {
      duel.t--; $('duelTimeLeft').textContent = Math.max(0, duel.t); setSand(duel.t / duel.T);
      if (duel.t <= 3 && duel.t > 0) sfx('tick');
      if (duel.t <= 0) { clearInterval(duel.timer); answerDuel(-1); }
    }, 1000);
    if (!isHumanTurn()) {
      $('duelLog').innerHTML = `<span class="text-emerald-300">${esc(duel.names[1])} está pensando…</span>`;
      const acc = parseFloat($('cpuLevel').value) - (duel.q.d === 'h' ? .12 : duel.q.d === 'e' ? -.08 : 0);
      duel.cpuTimer = setTimeout(() => {
        const ok = Math.random() < acc, ci = duel.q.opts.indexOf(duel.q.a), wr = [0, 1, 2, 3].filter(k => k !== ci);
        answerDuel(ok ? ci : wr[Math.floor(Math.random() * 3)]);
      }, 1800 + Math.random() * Math.min(9000, duel.T * 280));
    } else $('duelLog').innerHTML = '<span class="text-stone-400">Elige la respuesta correcta para lanzar tu hechizo.</span>';
  };
  answerDuel = function (idx) {
    if (!duel.running || duel.locked) return;
    duel.locked = true; clearDuelTimers();
    const atk = duel.turn, def = 1 - atk, ok = idx >= 0 && duel.q.opts[idx] === duel.q.a;
    [...$('duelOptionsGrid').children].forEach((b, i) => { b.disabled = true; if (duel.q.opts[i] === duel.q.a) b.classList.add('correct'); else if (i === idx) b.classList.add('wrong'); });
    renderJokers(null, false);
    const color = atk === 0 ? '#ef4444' : '#10b981';
    if (ok) {
      const crit = (duel.T - duel.t) <= 5, dmg = crit ? 30 : 20;
      duel.hp[def] = Math.max(0, duel.hp[def] - dmg);
      beam(atk === 0, color); flash(atk === 0 ? 'rgba(239,68,68,.35)' : 'rgba(16,185,129,.35)'); sfx('zap');
      const card = $(`p${def + 1}Card`).getBoundingClientRect(); burst(card.left + card.width / 2, card.top + card.height / 2, color, 50);
      $('duelLog').innerHTML = `<span style="color:${color}" class="font-bold">${esc(duel.names[atk])}</span> lanza un hechizo: <b>-${dmg} HP</b>${crit ? ' <span class="text-amber-300 font-bold">¡CRÍTICO!</span>' : ''}`;
      if (isHumanTurn()) { addXp(crit ? 6 : 4); if (V.spellSound) V.spellSound('expelliarmus'); }
    } else {
      sfx('wrong');
      $('duelLog').innerHTML = `<span class="text-stone-300">${idx < 0 ? '⏰ ¡Se acabó el tiempo!' : '¡El hechizo falla!'}</span> Era: <b class="text-amber-200">${esc(duel.q.a)}</b>`;
    }
    updateHp();
    duel.nextTimer = setTimeout(() => { if (duel.hp[def] <= 0) return endDuel(atk); duel.turn = def; duel.round++; nextDuelTurn(); }, 1900);
  };
  const _endDuel = endDuel;
  endDuel = function (winner) {
    const s = st(), cpu = duel.mode === 'cpu', humanWon = !cpu || winner === 0;
    let gold = 0;
    if (cpu) {
      if (duel.bet) { const mult = CPU_MULT[$('cpuLevel').value] || 1.5; gold = humanWon ? Math.round(duel.bet * mult) : -duel.bet; S.gold = Math.max(0, (S.gold || 0) + gold); updateWallet(); if (gold > 0) { s.betsWon++; unlock('v7bet'); coinRain(); } }
      if (humanWon) { s.winRow = (s.winRow || 0) + 1; if (s.winRow >= 3) unlock('v7streak'); if (duel.diffAtStart === 'h') unlock('v7expert'); } else s.winRow = 0;
      V.addHistory(humanWon ? '🏆' : '🤖', `Duelo vs IA (${$('cpuLevel').selectedOptions[0].textContent})`, humanWon ? 'Ganaste' : 'Perdiste', gold);
    } else V.addHistory('⚔️', `Duelo local: ${duel.names[0]} vs ${duel.names[1]}`, `Ganó ${duel.names[winner]}`, 0);
    save(); renderJokers(null, false);
    _endDuel(winner);
    if (gold) setTimeout(() => toast(gold > 0 ? `¡Ganaste la apuesta! +${gold} galeones` : `Perdiste la apuesta: −${-gold} galeones`, '🪙'), 600);
  };
  function coinRain() { if (document.documentElement.classList.contains('reduce-motion')) return; for (let i = 0; i < 26; i++) { const c = document.createElement('div'); c.className = 'v7-coinrain'; c.textContent = '🪙'; c.style.left = Math.random() * 100 + 'vw'; c.style.animationDelay = Math.random() * .7 + 's'; document.body.appendChild(c); setTimeout(() => c.remove(), 2400); } }
  V.coinRain = coinRain;

  /* =====================================================================
     DUELO EN LÍNEA: sala de espera con chat y apuestas, preguntas nuevas, revancha
  ===================================================================== */
  const BAD = /\b(put[ao]s?|mierda|carajo|conch[ao]|cojud[ao]s?|huev[oó]n|imb[eé]cil|idiota|est[uú]pid[ao]|pendej[ao]|maric[oó]n|cabr[oó]n|verga|pinga|chucha|csm|ctm|hdp|perra|zorra|malparid[ao])\w*/gi;
  const clean = t => String(t).replace(BAD, m => '★'.repeat(Math.min(5, m.length))).slice(0, 120);
  const CHIPS = ['¡Buena suerte! 🍀', '¡Expelliarmus! ⚡', '¡Buena esa! 👏', 'Uff, casi 😅', '¡No me ganarás! 😤', 'GG 🏆', '¡Revancha! ⚔️', '🦁', '🐍', '🦅', '🦡', '😂', '😱'];
  const chat = { log: [], last: 0, el: null };
  function chatUI() {
    if (chat.el) return chat.el;
    const el = document.createElement('div'); el.className = 'v7-chat'; el.id = 'v7Chat';
    el.innerHTML = `<div class="v7-chat-head"><span>💬 Chat del duelo</span><span class="text-[10px] text-stone-400 font-normal">Sé amable · los mensajes no se guardan</span></div>
      <div class="v7-chat-log" id="v7ChatLog"></div>
      <div class="v7-chips">${CHIPS.map(c => `<button onclick="V7.chatSend(this.textContent)">${c}</button>`).join('')}</div>
      <form class="v7-chat-input" onsubmit="event.preventDefault();V7.chatSend($('v7ChatIn').value);$('v7ChatIn').value=''"><input id="v7ChatIn" maxlength="120" autocomplete="off" placeholder="Escribe un mensaje…"><button class="btn-gold !py-1.5 !px-3 !text-xs" aria-label="Enviar"><i class="fa-solid fa-paper-plane"></i> Enviar</button></form>`;
    chat.el = el; return el;
  }
  function chatPlace(where) {
    const el = chatUI();
    if (where === 'lobby') { const box = $('onlinePanel'); if (el.parentElement !== box) box.appendChild(el); }
    else if (where === 'arena') { const a = $('duelArena'); const ref = a.lastElementChild; if (el.parentElement !== a) a.insertBefore(el, ref); }
    el.style.display = where ? '' : 'none';
    const log = $('v7ChatLog'); if (log) log.scrollTop = log.scrollHeight;
  }
  function chatAdd(kind, who, text) {
    chat.log.push({ kind, who, text }); chat.log = chat.log.slice(-60);
    const log = $('v7ChatLog'); if (!log) return;
    const d = document.createElement('div'); d.className = 'v7-msg ' + kind; d.innerHTML = kind === 'sys' ? esc(text) : `<b>${esc(who)}</b>${esc(text)}`;
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    if (kind !== 'sys' && od.running) bubble(kind === 'me' ? 'p1Card' : 'p2Card', text);
  }
  function bubble(cardId, text) { const card = $(cardId); if (!card) return; card.querySelectorAll('.v7-bubble').forEach(b => b.remove()); const b = document.createElement('div'); b.className = 'v7-bubble'; b.textContent = text; card.appendChild(b); setTimeout(() => b.remove(), 3500); }
  V.chatSend = text => {
    text = clean((text || '').trim()); if (!text || !od.ch) return;
    if (Date.now() - chat.last < 1100) { toast('Espera un segundito para enviar otro mensaje.', '🦉'); return; }
    chat.last = Date.now(); sendOnline({ type: 'chat', name: od.me, text }); chatAdd('me', od.me, text); sfx('tick');
    const s = st(); s.chatSent++; unlock('v7chat'); save();
  };

  /* ---------- sala de espera: apuestas ---------- */
  const lob = { oppGold: null, bet: 0, betState: 'none', autoT: null };
  function lobbyRender() {
    if (!od.ch || od.running) return;
    const maxBet = Math.min(S.gold || 0, lob.oppGold == null ? 0 : lob.oppGold);
    let html = `<div class="space-y-2 text-left">
      <p class="text-center"><b class="text-emerald-300">${esc(od.opp || '…')}</b> está en la sala <b class="text-amber-300 tracking-widest">${esc(od.code)}</b></p>
      <div class="v7-bet">`;
    if (od.host) {
      html += `<p class="text-[11px] font-bold text-amber-300 text-center">🪙 Apuesta de galeones (opcional)</p>
        <div class="chips">${BETS.map(b => `<button class="${lob.bet === b ? 'on' : ''}" ${b > maxBet && b ? 'disabled' : ''} onclick="V7.proposeBet(${b})">${b ? '🪙 ' + b : 'Sin apuesta'}</button>`).join('')}</div>
        <p class="text-[10px] text-stone-400 text-center mt-1">${lob.bet ? (lob.betState === 'ok' ? `✅ ${esc(od.opp)} aceptó. El ganador se lleva ${lob.bet * 2} 🪙.` : lob.betState === 'no' ? `❌ ${esc(od.opp)} no aceptó la apuesta.` : `Esperando que ${esc(od.opp)} acepte…`) : `Tú tienes ${S.gold || 0} 🪙 · ${esc(od.opp)} tiene ${lob.oppGold == null ? '…' : lob.oppGold} 🪙`}</p></div>
        <button class="btn-gold w-full" onclick="V7.hostStart()" ${lob.bet && lob.betState !== 'ok' ? 'disabled' : ''}><i class="fa-solid fa-wand-sparkles"></i> ¡Empezar el duelo!</button>
        <p class="text-[10px] text-stone-500 text-center">Tiempo: ${st().duelT} s · ${({ all: 'todas las dificultades', e: 'fácil', m: 'normal', h: 'experto' })[st().duelDiff]} · ${TOPICS[st().duelTopic]}</p>`;
    } else {
      html += lob.betState === 'asked' ? `<p class="text-center text-sm text-amber-200">🪙 <b>${esc(od.opp)}</b> te propone apostar <b>${lob.bet}</b> galeones.<br><span class="text-[11px] text-stone-400">Si ganas te llevas ${lob.bet * 2}. Si pierdes, pierdes ${lob.bet}.</span></p>
          <div class="chips"><button class="on" onclick="V7.answerBet(true)">✅ Acepto</button><button onclick="V7.answerBet(false)">❌ No, gracias</button></div>`
        : `<p class="text-center text-[12px] text-stone-300">${lob.bet && lob.betState === 'ok' ? `✅ Apuesta aceptada: <b>${lob.bet} 🪙</b>. ` : ''}Esperando a que <b>${esc(od.opp)}</b> empiece el duelo…</p>`;
      html += '</div>';
    }
    html += '</div>';
    onlineStatus(html); chatPlace('lobby');
  }
  V.proposeBet = b => {
    const maxBet = Math.min(S.gold || 0, lob.oppGold || 0); if (b > maxBet) return;
    lob.bet = b; lob.betState = b ? 'wait' : 'none'; sendOnline({ type: 'bet', amt: b }); lobbyRender(); sfx('tick');
    if (b) chatAdd('sys', '', `Propusiste apostar ${b} galeones.`);
  };
  V.answerBet = yes => {
    if (yes && (S.gold || 0) < lob.bet) { toast('No te alcanzan los galeones.', '🪙'); yes = false; }
    lob.betState = yes ? 'ok' : 'none'; if (!yes) lob.bet = 0;
    sendOnline({ type: yes ? 'betok' : 'betno' }); lobbyRender(); chatAdd('sys', '', yes ? 'Aceptaste la apuesta.' : 'Rechazaste la apuesta.');
  };
  V.hostStart = () => {
    if (!od.host || od.running || !od.opp) return;
    clearTimeout(lob.autoT);
    const bet = lob.betState === 'ok' ? lob.bet : 0;
    sendOnline({ type: 'start', host: od.me, guest: od.opp, bet, T: st().duelT }); od.bet = bet; od.T = st().duelT;
    startOnlineArena(); setTimeout(hostNextQuestion, 1500);
  };
  function resetLobby() { Object.assign(lob, { oppGold: null, bet: 0, betState: 'none' }); clearTimeout(lob.autoT); }

  /* ---------- mensajes nuevos ---------- */
  const _onMsg = onOnlineMsg;
  onOnlineMsg = function (m) {
    if (!m || !m.type) return;
    switch (m.type) {
      case 'hello':
        if (!od.host) return;
        if (od.opp && od.running) { sendOnline({ type: 'full' }); return; }
        resetLobby(); od.opp = m.name; od.rematch = {};
        sendOnline({ type: 'welcome', name: od.me }); sendOnline({ type: 'gold', g: S.gold || 0 });
        if (m.g != null) lob.oppGold = m.g;
        chatAdd('sys', '', `${m.name} entró a la sala.`); sfx('spell'); lobbyRender();
        clearTimeout(lob.autoT); lob.autoT = setTimeout(() => { if (od.ch && !od.running && od.opp && (!lob.bet || lob.betState !== 'wait')) V.hostStart(); }, 60000);
        return;
      case 'welcome':
        if (od.host) return; od.opp = m.name; resetLobby(); od.rematch = {}; sendOnline({ type: 'gold', g: S.gold || 0 }); chatAdd('sys', '', `Conectado con ${m.name}.`); lobbyRender(); return;
      case 'gold': lob.oppGold = +m.g || 0; lobbyRender(); return;
      case 'chat': chatAdd('them', m.name || od.opp, clean(m.text)); if (!od.running) sfx('tick'); return;
      case 'bet': if (od.host) return; lob.bet = +m.amt || 0; lob.betState = lob.bet ? 'asked' : 'none'; lobbyRender(); if (lob.bet) { sfx('spell'); chatAdd('sys', '', `${od.opp} propone apostar ${lob.bet} galeones.`); } return;
      case 'betok': if (!od.host) return; lob.betState = 'ok'; lobbyRender(); chatAdd('sys', '', `${od.opp} aceptó la apuesta.`); sfx('levelup'); return;
      case 'betno': if (!od.host) return; lob.betState = 'no'; lob.bet = 0; lobbyRender(); chatAdd('sys', '', `${od.opp} no quiso apostar.`); return;
      case 'gira': if (od.host) bumpOnlineTime(); return;
      case 'time': if (!od.host) { od.t = m.t; od.T = Math.max(od.T || 0, m.t); $('duelTimeLeft').textContent = od.t; } return;
      case 'rematch': od.rematch = od.rematch || {}; od.rematch.them = true; chatAdd('sys', '', `${od.opp} quiere la revancha.`); tryRematch(); return;
      case 'start':
        if (od.host) return; od.bet = +m.bet || 0; od.T = +m.T || 25;
        V.loadDuelQ().then(() => { od.opp = m.host; startOnlineArena(); }); return;
      case 'q': V.loadDuelQ().then(() => showOnlineQuestion(m)); return;
    }
    _onMsg(m);
  };
  // el invitado manda sus galeones junto con el saludo
  const _send = sendOnline;
  sendOnline = function (p) { if (p && p.type === 'hello') p = Object.assign({ g: S.gold || 0 }, p); return _send(p); };
  function bumpOnlineTime() { if (!od.running || od.resolved) return; od.t += 10; od.T += 10; $('duelTimeLeft').textContent = od.t; sendOnline({ type: 'time', t: od.t }); }

  const _joinRoom = joinRoom;
  joinRoom = async function (code, host, me) { chat.log = []; resetLobby(); od.bet = 0; const r = await V.loadDuelQ().then(() => _joinRoom(code, host, me)); const log = $('v7ChatLog'); if (log) log.innerHTML = ''; if (!od.ch) return r; chatPlace('lobby'); chatAdd('sys', '', host ? `Sala ${code} creada. Comparte el código.` : `Entrando a la sala ${code}…`); return r; };

  const _startArena = startOnlineArena;
  startOnlineArena = function () {
    _startArena(); od.jok = { t: 1, f: 1, h: 1 }; od.qused = new Set();
    const pot = $('v7Pot'); if (pot) { pot.classList.toggle('hidden', !od.bet); pot.textContent = `🪙 Bote: ${od.bet * 2}`; }
    chatPlace('arena'); chatAdd('sys', '', od.bet ? `¡Comienza el duelo! Se juegan ${od.bet * 2} galeones.` : '¡Comienza el duelo!');
  };
  hostNextQuestion = function () {
    if (!od.running || !od.host) return;
    od.round++; const qi = pickQ(od.qused || (od.qused = new Set())), order = shuffle([0, 1, 2, 3]);
    const msg = { type: 'q', round: od.round, qi, order, T: od.T || st().duelT };
    sendOnline(msg); showOnlineQuestion(msg);
  };
  showOnlineQuestion = function (m) {
    clearInterval(od.timer);
    const base = pool()[m.qi]; if (!base) return; const all = [base.a, ...base.w];
    od.round = m.round; od.q = { ...base, opts: m.order.map(i => all[i]) };
    od.mine = null; od.theirs = null; od.resolved = false; od.shownAt = performance.now();
    $('duelRound').textContent = m.round;
    const cur = $('currentDuelPlayer'); cur.textContent = '¡Ambos a la vez!'; cur.className = 'text-amber-300';
    $('duelMovie').textContent = (base.movie || '') + (base.d ? ' · ' + ({ e: 'Fácil', m: 'Normal', h: 'Experto' })[base.d] : ''); $('duelQuestionText').textContent = base.q;
    $('duelLog').innerHTML = '<span class="text-stone-400">El primero que acierte lanza el hechizo.</span>';
    const grid = $('duelOptionsGrid'); grid.innerHTML = '';
    od.q.opts.forEach((opt, idx) => { const b = document.createElement('button'); b.className = 'opt-btn text-xs sm:text-sm'; b.innerHTML = `<span class="key-hint">${idx + 1}</span><span>${esc(opt)}</span>`; b.onclick = () => answerOnline(idx); grid.appendChild(b); });
    od.jok = od.jok || { t: 1, f: 1, h: 1 }; renderJokers(null, true, od.jok, true);
    od.T = m.T || od.T || 25; od.t = od.T; $('duelTimeLeft').textContent = od.t; setSand(1);
    od.timer = setInterval(() => {
      od.t--; $('duelTimeLeft').textContent = Math.max(0, od.t); setSand(od.t / od.T);
      if (od.t <= 3 && od.t > 0) sfx('tick');
      if (od.t <= 0) { clearInterval(od.timer); if (!od.mine) answerOnline(-1); if (od.host) { od.theirs = od.theirs || { ok: false, ms: 999999 }; hostTryResolve(true); } }
    }, 1000);
  };
  const _answerOnline = answerOnline;
  answerOnline = function (idx) { _answerOnline(idx); if (od.mine) renderJokers(null, false); };
  hostTryResolve = function (timeout) {
    if (od.resolved) return;
    const h = od.mine, g = od.theirs;
    let attacker = -1;
    if (h && h.ok && (!g || !g.ok || h.ms <= g.ms)) attacker = 0; else if (g && g.ok) attacker = 1;
    if (attacker === -1 && !(timeout || (h && g))) return;
    od.resolved = true;
    let dmg = 0, crit = false;
    if (attacker >= 0) { const ms = attacker === 0 ? h.ms : g.ms; crit = ms < 5000; dmg = crit ? 30 : 20; od.hp[1 - attacker] = Math.max(0, od.hp[1 - attacker] - dmg); }
    const res = { type: 'res', round: od.round, attacker, dmg, crit, hp: od.hp.slice(), answer: od.q.a };
    sendOnline(res); applyOnlineResult(res);
    clearTimeout(od.nextT);
    od.nextT = setTimeout(() => {
      if (od.hp[0] <= 0 || od.hp[1] <= 0) { const winner = od.hp[0] > 0 ? 0 : 1; sendOnline({ type: 'end', winner }); endOnline(winner); }
      else hostNextQuestion();
    }, 2300);
  };
  const _apply = applyOnlineResult;
  applyOnlineResult = function (m) { _apply(m); renderJokers(null, false); };

  endOnline = function (winner, reason) {
    clearInterval(od.timer); clearTimeout(od.nextT);
    const wasRunning = od.running; od.running = false; setDuck('duel', false); renderJokers(null, false);
    if (winner === null || winner === undefined) {
      if (wasRunning || od.opp) { chatAdd('sys', '', reason || 'Se perdió la conexión.'); showDialog({ icon: '🔌', title: 'Duelo interrumpido', body: esc(reason || 'Se perdió la conexión.') + (od.bet && wasRunning ? '<br><span class="text-[11px] text-stone-400">La apuesta se canceló: nadie pierde galeones.</span>' : ''), actions: [{ label: 'Aceptar', primary: true, onClick: () => { leaveRoom(); cancelDuel(false); } }] }); }
      return;
    }
    const iWon = winner === myIdx(), bet = od.bet || 0, s = st();
    if (iWon) { S.stats.duelsWon++; addPoints(40); unlock('online'); unlock('duel'); fireConfetti({ particleCount: 140, spread: 100 }); sfx('levelup'); s.winRow = (s.winRow || 0) + 1; if (s.winRow >= 3) unlock('v7streak'); }
    else { addXp(5); sfx('wrong'); s.winRow = 0; }
    if (bet && wasRunning) { S.gold = Math.max(0, (S.gold || 0) + (iWon ? bet : -bet)); updateWallet(); if (iWon) { s.betsWon++; unlock('v7bet'); coinRain(); } }
    V.addHistory(iWon ? '🏆' : '💀', `Duelo en línea vs ${od.opp}`, iWon ? 'Ganaste' : 'Perdiste', bet ? (iWon ? bet : -bet) : 0);
    save();
    chatAdd('sys', '', iWon ? '¡Ganaste el duelo!' : `${od.opp} ganó el duelo.`);
    od.rematch = {};
    showDialog({
      icon: iWon ? '🏆' : '💀', title: iWon ? '¡Ganaste el duelo en línea!' : `${esc(od.opp)} ganó el duelo`,
      body: (iWon ? '+40 puntos y galeones.' : '+5 XP por intentarlo.') + (bet ? `<br><b class="text-amber-300">${iWon ? `¡Ganaste la apuesta! +${bet} 🪙` : `Perdiste la apuesta: −${bet} 🪙`}</b>` : '') + '<br><span class="text-[11px] text-stone-400">Puedes seguir chateando mientras decides.</span>',
      actions: [{ label: '🔁 Revancha', primary: true, onClick: askRematch }, { label: 'Salir', onClick: () => { leaveRoom(); cancelDuel(false); } }]
    });
  };
  function askRematch() {
    if (!od.ch) return; od.rematch = od.rematch || {}; od.rematch.me = true;
    sendOnline({ type: 'rematch' }); chatAdd('sys', '', 'Pediste la revancha. Esperando a tu rival…');
    onlineStatus('🔁 Esperando la revancha…'); tryRematch();
  }
  function tryRematch() {
    if (!od.rematch || !od.rematch.me || !od.rematch.them || od.running) return;
    od.rematch = {}; unlock('v7rematch'); st();
    if (od.bet && ((S.gold || 0) < od.bet)) od.bet = 0;
    if (od.host) { od.hp = [100, 100]; od.round = 0; setTimeout(() => { sendOnline({ type: 'start', host: od.me, guest: od.opp, bet: od.bet || 0, T: od.T || st().duelT }); startOnlineArena(); setTimeout(hostNextQuestion, 1500); }, 600); }
    toast('¡Revancha! Que gane el mejor.', '🔁');
  }
  const _cancel = cancelDuel;
  cancelDuel = function (manual) {
    if (manual && od.running && od.bet) { S.gold = Math.max(0, (S.gold || 0) - od.bet); updateWallet(); V.addHistory('🏳️', `Abandonaste el duelo vs ${od.opp}`, 'Perdiste', -od.bet); save(); toast(`Abandonaste: pierdes ${od.bet} galeones de la apuesta.`, '🪙'); }
    _cancel(manual); renderJokers(null, false); if (chat.el) chat.el.style.display = 'none';
  };
  const _setMode = setDuelMode;
  setDuelMode = function (mode) { _setMode(mode); buildSetupUI(); const cb = $('v7CpuBet'); if (cb) { cb.classList.toggle('hidden', mode !== 'cpu'); renderCpuBet(); } if (chat.el) chat.el.style.display = mode === 'online' && od.ch ? '' : 'none'; };

  /* ---------- montar al abrir la pestaña del duelo ---------- */
  const _switch = switchTab;
  switchTab = function (tab) { const r = _switch(tab); if (tab === 'duel') { buildSetupUI(); buildArenaUI(); setDuelMode(duel.mode || '2p'); V.loadDuelQ(); } return r; };
  if (typeof currentTab !== 'undefined' && currentTab === 'duel') { buildSetupUI(); buildArenaUI(); }
})();
