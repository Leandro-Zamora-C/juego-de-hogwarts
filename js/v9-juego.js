/* =====================================================================
   HOGWARTS 9.3 · ARREGLOS DE JUEGOS
   - IA del ajedrez en segundo plano (la pantalla ya no se congela) + nivel Dumbledore
   - Botón «Reportar un problema» en cada juego
   - Registro automático de errores (llega al panel del administrador)
   ===================================================================== */
(() => {
  /* ---------- toques simulados o perdidos no rompen los juegos ---------- */
  const _spc = Element.prototype.setPointerCapture;
  if (_spc) Element.prototype.setPointerCapture = function (id) { try { return _spc.call(this, id); } catch (e) { /* puntero ya liberado */ } };

  /* ---------- 1. IA del ajedrez en un «trabajador» aparte ---------- */
  let worker = null, job = 0;
  function makeWorker() {
    if (worker !== null) return worker;
    try {
      const fns = { isW, colorOf, cloneState, findKing, attacked, pseudoMoves, legalMoves, applyMove, evaluate };
      const src = `const PIECE_VAL = ${JSON.stringify(PIECE_VAL)};\n` + Object.entries(fns).map(([k, f]) => `const ${k} = (${f.toString()});`).join('\n') + `
        const capV = (bd, m) => bd[m.tr][m.tc] ? PIECE_VAL[bd[m.tr][m.tc].toLowerCase()] : (m.promo ? 800 : 0);
        function negamax(st, depth, a, b, side) {
          if (depth <= 0) return evaluate(st.board) * (side === 'w' ? 1 : -1);
          const moves = legalMoves(st, side);
          if (!moves.length) { const k = findKing(st.board, side); return k && attacked(st.board, k[0], k[1], side === 'w' ? 'b' : 'w') ? -99999 - depth : 0; }
          moves.sort((x, y) => capV(st.board, y) - capV(st.board, x));
          let best = -Infinity;
          for (const m of moves) { const s2 = cloneState(st); applyMove(s2, m); const v = -negamax(s2, depth - 1, -b, -a, side === 'w' ? 'b' : 'w'); if (v > best) best = v; if (best > a) a = best; if (a >= b) break; }
          return best;
        }
        onmessage = e => {
          const { id, st, level } = e.data, moves = legalMoves(st, 'b'); if (!moves.length) return postMessage({ id, move: null });
          moves.sort((x, y) => capV(st.board, y) - capV(st.board, x));
          let best = moves[0], bs = -Infinity, a = -Infinity;
          for (const m of moves) { const s2 = cloneState(st); applyMove(s2, m); const v = -negamax(s2, level - 1, -Infinity, -a, 'w') + (level === 1 ? Math.random() * 120 : Math.random() * 8); if (v > bs) { bs = v; best = m; } if (level >= 3 && bs > a) a = bs - 8; }
          postMessage({ id, move: best });
        };`;
      worker = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
      worker.onerror = () => { worker = false; };
    } catch (e) { worker = false; }
    return worker;
  }
  if (typeof chessAI === 'function') {
    const _ai = chessAI;
    window.chessAI = chessAI = function () {
      if (CH.mode !== 'ai' || CH.over || !$('chStatus')) { CH.thinking = false; return; }
      const w = makeWorker(); if (!w) return _ai.apply(this, arguments);
      const id = ++job, t0 = performance.now();
      w.onmessage = e => {
        if (e.data.id !== job || CH.mode !== 'ai' || CH.over || CH.turn !== 'b') return;
        const wait = Math.max(0, 450 - (performance.now() - t0)); // que no responda «al instante»
        setTimeout(() => { if (id !== job || CH.over || CH.turn !== 'b') return; CH.thinking = false; if (e.data.move) chessDo(e.data.move); }, wait);
      };
      w.postMessage({ id, level: Math.min(4, CH.level || 2), st: { board: CH.board, castle: CH.castle, ep: CH.ep, turn: CH.turn } });
    };
  }

  // ganar al ajedrez contra Dumbledore desbloquea un patronus mítico
  if (typeof chessCheckEnd === 'function') { const _ce = chessCheckEnd; window.chessCheckEnd = chessCheckEnd = function () { const r = _ce.apply(this, arguments); try { if (CH.over && CH.mode === 'ai' && CH.level === 4 && /Ganaste/.test(($('chStatus') || {}).textContent || '')) { S.games.chessDumbledore = true; save(); } } catch (e) {} return r; }; }

  /* ---------- 2. Registro de errores y reportes ---------- */
  const device = () => { const ua = navigator.userAgent; const m = ua.match(/\(([^)]+)\)/); return `${(m ? m[1] : ua).slice(0, 90)} · ${screen.width}x${screen.height}@${devicePixelRatio} · ${window.HPperf ? HPperf.fps + 'fps' : ''}`; };
  const sent = new Set(); let sentCount = 0;
  async function send(tipo, juego, mensaje, detalle) {
    try {
      if (typeof supaReady !== 'function' || !supaReady()) return false;
      const c = await loadSupabase();
      const { error } = await c.rpc('registrar_error', { p_tipo: tipo, p_juego: juego || '', p_mensaje: String(mensaje || '').slice(0, 300), p_detalle: String(detalle || '').slice(0, 1500), p_equipo: device(), p_version: window.HP_BUILD || '' });
      return !error;
    } catch (e) { return false; }
  }
  const auto = (msg, stack) => {
    const key = String(msg).slice(0, 120); if (sent.has(key) || sentCount >= 8) return; sent.add(key); sentCount++;
    if (/ResizeObserver|Script error|extension|setPointerCapture|AbortError|NotAllowedError|play\(\)/i.test(msg)) return;
    send('auto', typeof activeGame !== 'undefined' && activeGame ? activeGame : (typeof currentTab !== 'undefined' ? 'pestaña:' + currentTab : ''), msg, stack);
  };
  addEventListener('error', e => auto(e.message || 'error', (e.error && e.error.stack) || `${e.filename}:${e.lineno}`));
  addEventListener('unhandledrejection', e => { const r = e.reason || {}; auto(r.message || String(r), r.stack || ''); });

  window.V9J = {
    report() {
      const g = typeof activeGame !== 'undefined' && activeGame ? activeGame : '', name = g && typeof GAMES !== 'undefined' ? (GAMES.find(x => x.id === g) || {}).name : '';
      V8.sheet('🚩 Reportar un problema', `<p class="text-sm text-stone-300">${name ? `Juego: <b class="text-amber-200">${esc(name)}</b>. ` : ''}Cuéntanos qué pasó. Le llega al administrador con el modelo de tu celular.</p>
        <div class="flex flex-wrap gap-1.5 my-2">${['No carga', 'Se congela', 'No responde al tocar', 'Se ve mal', 'Va lento', 'Error en las reglas', 'Otro'].map(t => `<button class="v8-chip" onclick="this.classList.toggle('on')">${t}</button>`).join('')}</div>
        <textarea id="v9RepTxt" maxlength="500" rows="4" class="w-full bg-stone-950 border border-amber-800/50 rounded-xl p-3 text-sm text-stone-200" placeholder="Ej.: en Snap toqué cuando salieron dos rayos y me quitó un punto."></textarea>
        <button class="btn-gold w-full mt-2" onclick="V9J.sendReport('${g}')"><i class="fa-solid fa-paper-plane"></i> Enviar reporte</button>`);
    },
    async sendReport(g) {
      const tags = [...document.querySelectorAll('#v8SheetBody .v8-chip.on')].map(b => b.textContent).join(', '), txt = ($('v9RepTxt') || {}).value || '';
      if (!tags && txt.trim().length < 4) { toast('Escribe qué pasó o elige una opción.', '✍️'); return; }
      const ok = await send('reporte', g, tags || 'Reporte', txt);
      V8.closeSheet(); toast(ok ? '¡Gracias! El reporte llegó al administrador.' : 'No se pudo enviar ahora. Revisa tu internet.', ok ? '🦉' : '⚠️');
    },
    send
  };
  // botón dentro de cada juego (junto al título)
  const addBtn = () => {
    const t = $('gameTitle'); if (!t || $('v9RepBtn')) return;
    const b = document.createElement('button'); b.id = 'v9RepBtn'; b.className = 'v9-repbtn'; b.title = 'Reportar un problema'; b.setAttribute('aria-label', 'Reportar un problema'); b.innerHTML = '🚩'; b.onclick = () => V9J.report();
    t.insertAdjacentElement('afterend', b);
  };
  const _og = window.openGame;
  if (typeof _og === 'function') window.openGame = openGame = function () { const r = _og.apply(this, arguments); setTimeout(addBtn, 50); return r; };

  /* ---------- 3. Panel del administrador: reportes, errores y trampas ---------- */
  if (typeof renderAdmin === 'function') {
    const _ra = renderAdmin;
    window.renderAdmin = renderAdmin = async function () {
      await _ra.apply(this, arguments);
      if (typeof isAdmin === 'undefined' || !isAdmin) return;
      const tabs = document.querySelector('#v8Admin .v8-tabs'); if (!tabs || tabs.querySelector('[data-k="err"]')) return;
      tabs.insertAdjacentHTML('beforeend', `<button onclick="V9J.adm('err')" data-k="err">🐞 Errores y reportes</button><button onclick="V9J.adm('tra')" data-k="tra">🛡️ Trampas</button>`);
    };
  }
  V9J.adm = async k => {
    document.querySelectorAll('#v8Admin .v8-tabs button').forEach(b => b.classList.toggle('on', b.dataset.k === k));
    const box = $('v8AdmBody'); if (!box) return; box.innerHTML = '<p class="text-xs text-stone-400"><i class="fa-solid fa-spinner fa-spin"></i> Cargando…</p>';
    try {
      const c = await loadSupabase();
      if (k === 'err') {
        const { data, error } = await c.from('errores').select('*').eq('resuelto', false).order('creado', { ascending: false }).limit(80); if (error) throw error;
        box.innerHTML = data.length ? `<div class="space-y-2">${data.map(r => `<div class="bg-stone-950/70 rounded-xl p-3 text-xs border ${r.tipo === 'reporte' ? 'border-amber-700/50' : 'border-red-800/50'}">
          <div class="flex justify-between gap-2"><b class="${r.tipo === 'reporte' ? 'text-amber-300' : 'text-red-300'}">${r.tipo === 'reporte' ? '🚩 Reporte' : '🐞 Error automático'} · ${esc(r.juego || '—')}</b><span class="text-stone-500">${new Date(r.creado).toLocaleString('es-PE')}</span></div>
          <p class="text-stone-200 mt-1">${esc(r.mensaje || '')}</p>${r.detalle ? `<p class="text-stone-400 mt-1 whitespace-pre-wrap break-words">${esc(r.detalle).slice(0, 600)}</p>` : ''}
          <p class="text-stone-500 mt-1">${esc(r.equipo || '')} · v${esc(r.version || '')}</p>
          <button class="btn-ghost !py-1 !px-2 !text-[10px] mt-2" onclick="V9J.done(${r.id}, this)">✔ Marcar como resuelto</button></div>`).join('')}</div>` : '<p class="text-sm text-emerald-300">✔ No hay errores ni reportes pendientes.</p>';
      } else {
        const { data, error } = await c.from('trampas').select('*').order('creado', { ascending: false }).limit(60); if (error) throw error;
        box.innerHTML = `<p class="text-[11px] text-stone-400 mb-2">Cuando alguien sube galeones o puntos imposibles, la base de datos los limita sola y lo anota aquí.</p>` + (data.length ? data.map(r => `<div class="bg-stone-950/70 rounded-xl p-2 text-xs mb-1.5"><b class="text-red-300">${esc(r.nombre || r.user_id || '')}</b> · ${esc(r.detalle)} <span class="text-stone-500">${new Date(r.creado).toLocaleString('es-PE')}</span></div>`).join('') : '<p class="text-sm text-emerald-300">✔ Nadie ha hecho trampa.</p>');
      }
    } catch (e) { box.innerHTML = '<p class="text-sm text-amber-200">Falta ejecutar <b>supabase-v9.sql</b> en Supabase para ver esta sección.</p>'; }
  };
  V9J.done = async (id, btn) => { try { const c = await loadSupabase(); await c.from('errores').update({ resuelto: true }).eq('id', id); btn.closest('div').remove(); } catch (e) { toast('No se pudo marcar.', '⚠️'); } };
})();
