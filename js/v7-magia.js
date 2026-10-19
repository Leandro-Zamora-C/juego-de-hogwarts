/* =====================================================================
   HOGWARTS · VERSIÓN 7 · MAGIA, CUENTA OBLIGATORIA Y EXPERIENCIA
   Gran Salón 3D · varita 3D · patronus de luz · estela · antorchas
   sonido ambiente y de hechizos · vibración · lechuzas · transiciones
   inicio de sesión con Google obligatorio · tutorial · accesos rápidos
   perfil completo · años 1.º a 7.º · logros · tema claro · letra · calidad
===================================================================== */
(() => {
  const V = window.V7 = window.V7 || {};
  const st = V.st || (() => { S.v7 = Object.assign({}, S.v7 || {}); return S.v7; });
  const opt = () => { const s = st(); s.opt = Object.assign({ theme: 'dark', font: 1, quality: 'auto', ambient: true, vib: true, trail: true, trans: true }, s.opt || {}); return s.opt; };
  const reduced = () => typeof reduceMotion !== 'undefined' && reduceMotion;

  /* =====================================================================
     CALIDAD GRÁFICA AUTOMÁTICA
  ===================================================================== */
  let autoQ = (() => {
    const mem = navigator.deviceMemory || 4, cores = navigator.hardwareConcurrency || 4, save = navigator.connection && navigator.connection.saveData;
    if (save || mem <= 2 || cores <= 2) return 'low';
    if (matchMedia('(pointer: coarse)').matches) return 'med';
    return 'high';
  })();
  V.quality = () => { const q = opt().quality; return q === 'auto' ? autoQ : q; };
  const DPR = { low: 1, med: 1.5, high: 2 };
  const _create = M3.create;
  M3.create = function (canvas, o) { o = Object.assign({}, o || {}); o.maxDpr = Math.min(o.maxDpr || 2, DPR[V.quality()] || 1.5); return _create(canvas, o); };
  V.vib = () => opt().vib && !!navigator.vibrate;
  const buzz = p => { if (V.vib()) try { navigator.vibrate(p); } catch (e) {} };

  /* =====================================================================
     AJUSTES NUEVOS: tema claro, letra, calidad, sonido ambiente, vibración…
  ===================================================================== */
  function applyV7() {
    const o = opt(), h = document.documentElement;
    h.classList.toggle('v7-light', o.theme === 'light');
    h.classList.toggle('v7-font-2', +o.font === 2); h.classList.toggle('v7-font-3', +o.font === 3);
    h.classList.toggle('v7-low', V.quality() === 'low');
    if (o.theme === 'light') { unlock('v7light'); const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', '#efe2c6'); }
    ambient.update();
  }
  V.apply = applyV7;
  V.set = (k, v) => { opt()[k] = v; save(); applyV7(); if (k === 'quality') toast('Calidad gráfica: ' + ({ auto: 'automática', low: 'baja', med: 'media', high: 'alta' })[v] + '. Se aplica al abrir cada juego 3D.', '⚙️'); };
  const _applySettings = applySettings;
  applySettings = function () { _applySettings(); try { applyV7(); } catch (e) {} };
  const _renderSettings = renderSettings;
  renderSettings = function () {
    _renderSettings();
    const box = $('settingsToggles'); if (!box) return;
    const o = opt(), sel = (k, list) => `<select onchange="V7.set('${k}', this.value)" class="bg-stone-950 border border-amber-800/50 rounded-lg px-2 py-1 text-xs text-amber-100">${list.map(([v, l]) => `<option value="${v}" ${String(o[k]) === String(v) ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
    const sw = (k, label, hint) => `<label class="flex items-center justify-between gap-3 py-2.5 cursor-pointer"><span><span class="block text-sm text-stone-200 font-semibold">${label}</span><span class="block text-[11px] text-stone-500">${hint}</span></span><span class="switch"><input type="checkbox" ${o[k] ? 'checked' : ''} onchange="V7.set('${k}', this.checked)"><span></span></span></label>`;
    const row = (label, hint, ctl) => `<div class="flex items-center justify-between gap-3 py-2.5"><span><span class="block text-sm text-stone-200 font-semibold">${label}</span><span class="block text-[11px] text-stone-500">${hint}</span></span>${ctl}</div>`;
    box.insertAdjacentHTML('beforeend', `<div class="pt-3 mt-2 border-t border-amber-900/40"><p class="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Versión 7</p>
      ${row('Tema', 'Oscuro (castillo) o claro (pergamino).', sel('theme', [['dark', '🌙 Oscuro'], ['light', '📜 Claro']]))}
      ${row('Tamaño de letra', 'Para leer más cómodo.', sel('font', [[1, 'Normal'], [2, 'Grande'], [3, 'Muy grande']]))}
      ${row('Calidad gráfica', 'Automática según tu celular o computadora.', sel('quality', [['auto', `Automática (${({ low: 'baja', med: 'media', high: 'alta' })[autoQ]})`], ['low', 'Baja (ahorra batería)'], ['med', 'Media'], ['high', 'Alta']]))}
      ${sw('ambient', 'Sonido ambiente', 'Fuego, viento y campanitas según la sala.')}
      ${sw('vib', 'Vibración', 'El celular vibra con los hechizos y respuestas.')}
      ${sw('trail', 'Estela de la varita', 'Chispas que siguen a tu dedo o al mouse.')}
      ${sw('trans', 'Transiciones mágicas', 'Destello al cambiar de sala.')}
      <button onclick="closeSettings();V7.tutorial(true)" class="btn-ghost w-full mt-2 !text-xs"><i class="fa-solid fa-graduation-cap"></i> Ver el recorrido guiado otra vez</button></div>`);
  };

  /* =====================================================================
     NOTIFICACIONES CON LECHUZA
  ===================================================================== */
  const _toast = toast;
  toast = function (html, icon) {
    _toast(html, icon);
    const el = $('toasts') && $('toasts').lastElementChild;
    if (el && !reduced()) { el.classList.add('v7-owl'); el.insertAdjacentHTML('afterbegin', '<span class="v7-owlbird" aria-hidden="true">🦉</span>'); }
  };

  /* =====================================================================
     SONIDOS DE HECHIZOS, AMBIENTE Y VIBRACIÓN
  ===================================================================== */
  let noiseBuf = null;
  const noise = ac => { if (noiseBuf) return noiseBuf; noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return noiseBuf; };
  function whoosh(from = 300, to = 3000, dur = .45, vol = .18) {
    if (!S.sound) return; const ac = audio(); if (!ac) return;
    const t = ac.currentTime, src = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = noise(ac); bp.type = 'bandpass'; bp.Q.value = 2.5; bp.frequency.setValueAtTime(from, t); bp.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * .3); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t); src.stop(t + dur + .05);
  }
  V.spellSound = kind => {
    if (!S.sound) return;
    if (kind === 'expelliarmus') { whoosh(500, 4000, .35, .2); tone(880, .25, 'sawtooth', .05, 1760, .12); }
    else if (kind === 'lumos') { tone(660, .5, 'sine', .1, 1320); tone(990, .6, 'sine', .06, 1980, .1); }
    else if (kind === 'patronus') { whoosh(200, 1200, 1.2, .12); [523, 659, 784, 1046].forEach((f, i) => tone(f, .9, 'sine', .07, null, i * .12)); }
    else whoosh();
  };
  const _sfx = sfx;
  sfx = function (name) {
    _sfx(name);
    if (name === 'spell') whoosh(250, 2600, .5, .12);
    if (name === 'zap') whoosh(800, 5000, .3, .16);
    if (name === 'correct') buzz(25); else if (name === 'wrong') buzz([40, 50, 40]); else if (name === 'levelup' || name === 'achieve') buzz([30, 40, 30, 40, 60]); else if (name === 'zap') buzz(35);
  };

  const ZONES = { home: 'fire', movies: 'room', games: 'chimes', duel: 'wind', studio: 'chimes', wand: 'room', letter: 'fire', library: 'room', ranking: 'fire', shop: 'room', profile: 'fire' };
  const ambient = {
    zone: null, nodes: null, timer: null,
    update() {
      const want = opt().ambient && S.sound && !document.hidden && AC && (typeof currentTab !== 'undefined') ? ZONES[currentTab] : null;
      if (want === this.zone) return; this.stop(); if (want) this.start(want);
    },
    stop() {
      clearInterval(this.timer); this.timer = null;
      if (this.nodes) { const n = this.nodes, t = AC.currentTime; try { n.g.gain.cancelScheduledValues(t); n.g.gain.setTargetAtTime(0, t, .4); setTimeout(() => { try { n.src.stop(); n.lfo && n.lfo.stop(); n.drone && n.drone.stop(); } catch (e) {} }, 1600); } catch (e) {} }
      this.nodes = null; this.zone = null;
    },
    start(zone) {
      const ac = AC; if (!ac || ac.state !== 'running') return;
      this.zone = zone;
      const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); src.buffer = noise(ac); src.loop = true;
      const n = { src, g }; let base = .02;
      if (zone === 'fire') { f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = .6; base = .018; const d = ac.createOscillator(), dg = ac.createGain(); d.frequency.value = 55; dg.gain.value = .012; d.connect(dg); dg.connect(g); d.start(); n.drone = d;
        this.timer = setInterval(() => { if (Math.random() < .6) { const t = ac.currentTime; g.gain.setValueAtTime(base * (2 + Math.random() * 3), t); g.gain.setTargetAtTime(base, t + .02, .05); } }, 180); }
      else if (zone === 'wind') { f.type = 'lowpass'; f.frequency.value = 420; base = .05; const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .13; lg.gain.value = 260; lfo.connect(lg); lg.connect(f.frequency); lfo.start(); n.lfo = lfo; }
      else if (zone === 'chimes') { f.type = 'highpass'; f.frequency.value = 6000; base = .004; const notes = [1046, 1174, 1318, 1568, 1760, 2093]; this.timer = setInterval(() => { if (Math.random() < .35) tone(notes[Math.floor(Math.random() * notes.length)], 1.4, 'sine', .018); }, 1400); }
      else { f.type = 'lowpass'; f.frequency.value = 260; base = .03; }
      g.gain.value = 0; g.gain.setTargetAtTime(base, ac.currentTime, .8);
      src.connect(f); f.connect(g); g.connect(master); src.start(); this.nodes = n;
    }
  };
  V.ambient = ambient;
  document.addEventListener('visibilitychange', () => ambient.update());
  document.addEventListener('pointerdown', () => setTimeout(() => ambient.update(), 300), { passive: true });

  /* =====================================================================
     TRANSICIÓN MÁGICA ENTRE SALAS
  ===================================================================== */
  const veil = document.createElement('div'); veil.id = 'v7Veil'; document.body.appendChild(veil);
  let lastPt = [innerWidth / 2, innerHeight / 2];
  document.addEventListener('pointerdown', e => { lastPt = [e.clientX, e.clientY]; }, { passive: true, capture: true });

  /* =====================================================================
     CUENTA DE GOOGLE OBLIGATORIA
  ===================================================================== */
  const gate = { el: null, checked: false, offlineOk: false };
  const needGate = () => typeof authEnabled === 'function' && authEnabled() && !cloud.user && !gate.offlineOk;
  function gateHTML(state) {
    const prov = (CONFIG.AUTH_PROVIDERS || ['google']).filter(p => PROVIDERS[p]);
    const inApp = inAppBrowser(), had = hasProgress(S), wasUser = !!S._owner;
    if (state === 'check') return `<div class="box"><div class="crest">🦉</div><h2>Abriendo las puertas…</h2><p><i class="fa-solid fa-spinner fa-spin"></i> Revisando tu cuenta de mago</p></div>`;
    if (state === 'offline') return `<div class="box"><div class="crest">🌧️</div><h2>Sin conexión</h2><p>Para entrar la primera vez necesitas internet, así iniciamos sesión con tu cuenta de Google y tu progreso queda guardado.</p><button class="gbtn" onclick="V7.gateCheck()"><i class="fa-solid fa-rotate"></i> Reintentar</button></div>`;
    return `<div class="box">
      <div class="crest">🏰</div>
      <h2>${wasUser ? 'Vuelve a entrar a Hogwarts' : 'Inicia sesión para jugar'}</h2>
      <p>${wasUser ? 'Inicia sesión otra vez para seguir con tu progreso.' : 'Desde esta versión, todos los juegos necesitan tu cuenta de Google. Así tu progreso queda guardado y puedes jugar en cualquier celular o computadora.'}</p>
      ${had && !wasUser ? `<div class="prog">📦 <b>Tu progreso de este dispositivo no se pierde:</b><br>${esc(S.house || 'Sin casa')} · ${S.xp || 0} XP · ${S.points || 0} puntos · ${S.gold || 0} galeones · ${(S.ach || []).length} logros<br><span style="opacity:.8">Se pasará a tu cuenta al iniciar sesión.</span></div>` : ''}
      ${inApp ? `<div class="warn">⚠️ Estás dentro de Facebook, Instagram u otra app. Google no deja iniciar sesión aquí.<br><b>Toca ⋮ o ··· y elige «Abrir en el navegador»</b> (Chrome o Safari).<br><button onclick="V7.copyLink()" style="margin-top:6px;text-decoration:underline">Copiar el enlace</button></div>` : ''}
      ${prov.map(p => `<button class="gbtn" ${inApp && p === 'google' ? 'disabled style="opacity:.45"' : ''} onclick="V7.gateLogin('${p}')">${PROVIDERS[p].icon}<span>${PROVIDERS[p].label}</span></button>`).join('')}
      <p id="v7GateMsg" class="note"></p>
      <p class="note">Solo usamos tu nombre, foto y correo para guardar tu progreso. <a href="privacidad.html" target="_blank" rel="noopener" style="text-decoration:underline">Política de privacidad</a></p>
    </div>`;
  }
  function showGate(state) {
    if (!gate.el) { gate.el = document.createElement('div'); gate.el.id = 'v7Gate'; gate.el.setAttribute('role', 'dialog'); gate.el.setAttribute('aria-modal', 'true'); document.body.appendChild(gate.el); }
    gate.el.innerHTML = gateHTML(state); gate.el.style.display = '';
  }
  function hideGate() { if (gate.el) gate.el.style.display = 'none'; }
  V.gateLogin = async p => {
    const m = $('v7GateMsg'); if (m) m.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Abriendo Google…';
    try { const c = await loadSupabase(); const { error } = await c.auth.signInWithOAuth({ provider: p, options: { redirectTo: authRedirect() } }); if (error) throw error; }
    catch (e) { if (m) m.innerHTML = `<span style="color:#fca5a5">No se pudo abrir el inicio de sesión. ${esc(e.message || 'Revisa tu internet.')}</span>`; }
  };
  V.copyLink = () => { const u = location.origin + location.pathname; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => toast('Enlace copiado. Pégalo en Chrome o Safari.', '📋')).catch(() => prompt('Copia este enlace y ábrelo en tu navegador:', u)); };
  V.gateCheck = async () => {
    if (!(typeof authEnabled === 'function' && authEnabled())) { gate.checked = true; afterGate(); return; }
    if (cloud.user) { gate.checked = true; hideGate(); afterGate(); return; }
    showGate('check');
    try {
      const c = await Promise.race([loadSupabase(), new Promise((_, r) => setTimeout(() => r(new Error('t')), 9000))]);
      const { data } = await c.auth.getSession();
      gate.checked = true;
      if (data && data.session) { if (!cloud.user) onSignedIn(data.session.user); hideGate(); afterGate(); return; }
      showGate('login');
    } catch (e) {
      gate.checked = true;
      if (S._owner) { gate.offlineOk = true; hideGate(); toast('Sin conexión: juegas con tu progreso guardado y se subirá cuando vuelva el internet.', '🌧️'); afterGate(); }
      else showGate(navigator.onLine === false ? 'offline' : 'login');
    }
  };
  const _onSignedIn = onSignedIn;
  onSignedIn = async function (user) { const r = _onSignedIn(user); hideGate(); gate.offlineOk = false; unlock('v7login'); setTimeout(afterGate, 400); renderV7Profile(); return r; };
  const _signOut = signOut;
  signOut = async function () { await _signOut(); if (authEnabled()) showGate('login'); };
  window.addEventListener('online', () => { if (gate.offlineOk && !cloud.user) { gate.offlineOk = false; V.gateCheck(); } });
  let afterDone = false;
  function afterGate() {
    if (afterDone) { return; } afterDone = true;
    setTimeout(() => { if (S.house && !opt().tutDone && !needGate()) V.tutorial(); }, 1200);
  }
  const guard = () => { if (gate.checked && needGate()) { showGate('login'); return true; } return false; };

  /* =====================================================================
     SWITCHTAB: puerta, transición, ambiente, perfil
  ===================================================================== */
  const _switch = switchTab;
  switchTab = function (tab) {
    if (guard()) return;
    const changing = tab !== currentTab;
    if (changing && opt().trans && !reduced() && veilReady) {
      veil.style.setProperty('--vx', lastPt[0] + 'px'); veil.style.setProperty('--vy', lastPt[1] + 'px');
      veil.classList.add('on'); setTimeout(() => veil.classList.remove('on'), 230);
      try { burst(lastPt[0], lastPt[1], S.sparkColor, V.quality() === 'low' ? 10 : 22); } catch (e) {}
    }
    const r = _switch(tab);
    ambient.update();
    if (tab === 'profile') renderV7Profile();
    if (tab === 'home') hall.wake();
    return r;
  };
  let veilReady = false; setTimeout(() => { veilReady = true; }, 1500);
  const _openGame = openGame;
  openGame = function (id) { if (guard()) return; return _openGame(id); };

  /* =====================================================================
     AÑOS EN HOGWARTS (1.º a 7.º) Y LOGROS NUEVOS
  ===================================================================== */
  const YEARS = [0, 200, 500, 1000, 1800, 3000, 4500];
  const YEAR_NAMES = ['1.er año', '2.º año', '3.er año', '4.º año', '5.º año · TIMOs', '6.º año', '7.º año · ÉXTASIS'];
  V.year = xp => { let y = 0; YEARS.forEach((t, i) => { if ((xp || 0) >= t) y = i; }); return y; };
  V.yearName = y => YEAR_NAMES[y];
  Object.assign(ACH, {
    v7y2: ['📘', 'Segundo año', 'Llega a 2.º año en Hogwarts'],
    v7y3: ['📗', 'Tercer año', 'Llega a 3.er año'],
    v7y5: ['📙', 'TIMOs aprobados', 'Llega a 5.º año'],
    v7y7: ['🎓', 'ÉXTASIS', 'Llega a 7.º año: ¡mago completo!'],
    v7rich: ['💰', 'Cámara de Gringotts', 'Junta 1000 galeones'],
    v7login: ['☁️', 'Mago con cuenta', 'Inicia sesión con Google'],
    v7tut: ['🦉', 'Primer día de clases', 'Completa el recorrido guiado'],
    v7light: ['📜', 'Lumos Maxima', 'Prueba el tema claro'],
    v7hall: ['🕯️', 'Cena en el Gran Salón', 'Visita el Gran Salón en 3D'],
    v7patronus: ['🦌', 'Expecto Patronum', 'Invoca tu patronus de luz'],
    v7wand3d: ['🪄', 'Ollivanders', 'Mira tu varita en 3D']
  });
  const _addXp = addXp;
  addXp = function (n) {
    const before = V.year(S.xp); const r = _addXp(n); const after = V.year(S.xp);
    if (after > before) {
      [[1, 'v7y2'], [2, 'v7y3'], [4, 'v7y5'], [6, 'v7y7']].forEach(([y, id]) => { if (after >= y) unlock(id); });
      setTimeout(() => {
        fireConfetti({ particleCount: 160, spread: 110, origin: { y: .4 } }); sfx('levelup');
        showDialog({ icon: '🦉', title: `¡Pasaste a ${YEAR_NAMES[after]}!`, body: `<p class="font-handwriting text-xl text-amber-200">Querido/a ${esc(S.student || 'alumno/a')}:</p><p class="text-sm">Nos complace informarle que ha sido aceptado/a en <b>${YEAR_NAMES[after]}</b> del Colegio Hogwarts de Magia y Hechicería.</p>${after < 6 ? `<p class="text-[11px] text-stone-400 mt-2">Siguiente año: ${YEARS[after + 1]} XP</p>` : ''}` });
      }, 700);
    }
    return r;
  };
  const _addPoints = addPoints;
  addPoints = function (n) {
    const r = _addPoints(n);
    if (n > 0 && !reduced()) { const p = document.createElement('div'); p.className = 'v7-shieldpop'; p.style.left = '50%'; p.style.top = '84px'; p.innerHTML = `+${n} ${S.house && HOUSES[S.house] ? HOUSES[S.house].emoji : '🏆'}`; document.body.appendChild(p); setTimeout(() => p.remove(), 1600); }
    return r;
  };
  setInterval(() => { if ((S.gold || 0) >= 1000) unlock('v7rich'); }, 5000);

  /* =====================================================================
     COPA DE LAS CASAS ANIMADA
  ===================================================================== */
  const cupObs = new MutationObserver(() => {
    const box = $('houseCupBox'); if (!box || reduced()) return;
    box.querySelectorAll('.rounded-full[style*="width"]').forEach((b, i) => {
      if (b.dataset.v7) return; b.dataset.v7 = 1; const w = b.style.width; b.style.width = '0%'; b.classList.add('v7-cupbar');
      setTimeout(() => { b.style.width = w; }, 60 + i * 120);
    });
    box.querySelectorAll('svg').forEach((s, i) => { if (!s.dataset.v7) { s.dataset.v7 = 1; s.style.animation = `v7ShieldIn .6s ${i * .1}s cubic-bezier(.3,1.5,.5,1) both`; } });
  });
  if ($('houseCupBox')) cupObs.observe($('houseCupBox'), { childList: true });

  /* =====================================================================
     SOMBRERO SELECCIONADOR ANIMADO
  ===================================================================== */
  const hatM = $('sortingHatModal');
  if (hatM) {
    hatM.querySelectorAll('.hat-think').forEach(h => h.classList.add('v7-hat'));
    new MutationObserver(() => {
      const thinking = !$('sortingThinking').classList.contains('hidden');
      hatM.querySelectorAll('.hat-think').forEach(h => h.classList.toggle('talk', thinking));
    }).observe(hatM, { subtree: true, attributes: true, attributeFilter: ['class'] });
    const title = $('assignedHouseTitle');
    if (title) new MutationObserver(() => { title.classList.remove('v7-shout'); void title.offsetWidth; title.classList.add('v7-shout'); buzz([60, 40, 120]); }).observe(title, { childList: true, characterData: true, subtree: true });
  }

  /* =====================================================================
     ESTELA DE LA VARITA
  ===================================================================== */
  const trail = { cv: null, x: null, p: [], raf: 0 };
  function trailOn() { return opt().trail && !reduced() && V.quality() !== 'low' && !(S.settings && S.settings.contrast); }
  function trailLoop() {
    const { cv, x } = trail; trail.raf = 0;
    if (cv.width !== innerWidth || cv.height !== innerHeight) { cv.width = innerWidth; cv.height = innerHeight; }
    x.clearRect(0, 0, cv.width, cv.height); x.globalCompositeOperation = 'lighter';
    trail.p = trail.p.filter(p => { p.x += p.vx; p.y += p.vy; p.vy += .03; p.l -= .03; if (p.l <= 0) return false; x.globalAlpha = p.l; x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, p.r * p.l + .5, 0, 7); x.fill(); return true; });
    if (trail.p.length) trail.raf = requestAnimationFrame(trailLoop);
  }
  document.addEventListener('pointermove', e => {
    if (!trailOn() || (e.pointerType === 'mouse' && e.buttons === 0 && Math.random() < .5)) return;
    if (!trail.cv) { trail.cv = document.createElement('canvas'); trail.cv.id = 'v7Trail'; document.body.appendChild(trail.cv); trail.x = trail.cv.getContext('2d'); }
    const c = S.sparkColor || '#fcd34d';
    for (let i = 0; i < 2; i++) trail.p.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - .5) * 1.2, vy: (Math.random() - .5) * 1.2, l: 1, r: 1.5 + Math.random() * 2.2, c: Math.random() < .3 ? '#fff7d6' : c });
    if (trail.p.length > 160) trail.p.splice(0, trail.p.length - 160);
    if (!trail.raf) trail.raf = requestAnimationFrame(trailLoop);
  }, { passive: true });

  /* =====================================================================
     ANTORCHAS EN LOS COSTADOS (pantallas grandes)
  ===================================================================== */
  ['l', 'r'].forEach(s => { const t = document.createElement('div'); t.className = 'v7-torch ' + s; t.setAttribute('aria-hidden', 'true'); t.innerHTML = '<div class="glow"></div><div class="stick"></div><div class="cup"></div><div class="flame"></div>'; document.body.appendChild(t); });

  /* =====================================================================
     GRAN SALÓN 3D EN LA PORTADA
  ===================================================================== */
  const hall = { R: null, raf: 0, vis: true, t0: 0, flames: [], stars: [], built: false, frames: 0 };
  function hallBuild() {
    if (hall.built) return; hall.built = true;
    const home = $('tab-home'); if (!home) return;
    home.insertAdjacentHTML('afterbegin', `<div id="v7Hall" class="v7-stone"><canvas aria-hidden="true"></canvas><div class="cap"><div><h3>El Gran Salón</h3><p id="v7HallLine"></p></div><button class="btn-gold !py-1.5 !px-3 !text-xs" onclick="switchTab('movies')"><i class="fa-solid fa-utensils"></i> ¡A cenar trivia!</button></div></div>
      <div id="v7Quick" class="v7-quick">${[['🎬', 'Trivia', 'movies'], ['⚔️', 'Duelo', 'duel'], ['🎲', 'Juegos', 'games'], ['🪄', 'Varita', 'wand'], ['✨', 'Hechizos', 'studio'], ['📚', 'Biblioteca', 'library'], ['🛒', 'Tienda', 'shop'], ['🧙', 'Mi perfil', 'profile']].map(([e, l, t]) => `<button onclick="switchTab('${t}')"><span>${e}</span>${l}</button>`).join('')}</div>`);
    hallLine();
    if (!M3.supported()) { $('v7Hall').querySelector('canvas').remove(); $('v7Hall').style.background = 'radial-gradient(ellipse at 50% 30%, rgba(255,190,90,.35), transparent 60%), linear-gradient(#120b22, #2a1a0c)'; return; }
    const cv = $('v7Hall').querySelector('canvas'), R = M3.create(cv, { maxDpr: 1.75 });
    if (!R) return; hall.R = R; unlock('v7hall');
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); hall.lost = true; });
    const G = M3.G, mat = R.mat;
    R.clear = [.03, .03, .09]; R.sky = [.25, .22, .4]; R.ground = [.12, .07, .04]; R.light.dir = M3.norm([.3, -1, .4]); R.light.color = [.35, .35, .55];
    R.fog = { color: [.05, .04, .1], density: .022 }; R.cam.fov = 55; R.cam.far = 140;
    R.pl[0] = { pos: [0, 6, 0], color: [1.3, .8, .35], range: 14 }; R.pl[1] = { pos: [0, 4, -24], color: [1.1, .7, .3], range: 10 };
    // suelo y muros de piedra
    R.add(R.node(R.mesh(G.plane(22, 70, 1, 1)), mat({ color: [.32, .27, .23], pat: 3, spec: .35, shin: 30 }), { cast: false }));
    const wallG = G.box(1, 16, 70); [-11, 11].forEach(x => R.add(R.node(R.mesh(wallG), mat({ color: [.38, .34, .31], pat: 5, patS: .6, spec: .05 }), { pos: [x, 8, 0], cast: false })));
    R.add(R.node(R.mesh(G.box(22, 16, 1)), mat({ color: [.34, .3, .28], pat: 5, patS: .6 }), { pos: [0, 8, -34], cast: false }));
    // ventanales con luz de luna
    const winG = []; for (let z = -28; z <= 24; z += 8) [-10.45, 10.45].forEach(x => winG.push([G.box(.1, 5, 1.8), G.at(x, 7.5, z)]));
    R.add(R.node(R.mesh(G.merge(winG)), mat({ color: [.24, .3, .58], unlit: true }), { cast: false }));
    R.add(R.node(R.mesh(G.box(6, 7, .1)), mat({ color: [.55, .6, 1], unlit: true }), { pos: [0, 9, -33.4], cast: false }));
    // mesas largas, bancas y la mesa de profesores
    const tbl = [], bench = [];
    [-6.3, -2.1, 2.1, 6.3].forEach(x => {
      tbl.push([G.box(1.5, .14, 40), G.at(x, .85, 0)]);
      for (let z = -18; z <= 18; z += 6) tbl.push([G.box(.14, .8, .14), G.at(x, .42, z)]);
      [-1, 1].forEach(s => bench.push([G.box(.5, .1, 40), G.at(x + s * 1.15, .48, 0)]));
    });
    tbl.push([G.box(14, .16, 1.6), G.at(0, 1.55, -25)]);
    R.add(R.node(R.mesh(G.merge(tbl)), mat({ color: [.45, .27, .13], pat: 1, patS: 1.2, spec: .5, shin: 40 })));
    R.add(R.node(R.mesh(G.merge(bench)), mat({ color: [.35, .2, .1], pat: 1, spec: .3 })));
    R.add(R.node(R.mesh(G.box(16, .7, 5)), mat({ color: [.3, .26, .24], pat: 5 }), { pos: [0, .35, -25], cast: false }));
    // platos dorados y copas sobre las mesas
    const plates = []; [-6.3, -2.1, 2.1, 6.3].forEach(x => { for (let z = -17; z <= 17; z += 2.2) [-.42, .42].forEach(s => plates.push([G.cyl(.2, .17, .03, 12), G.at(x + s, .93, z + (s > 0 ? 1 : 0))])); });
    R.add(R.node(R.mesh(G.merge(plates)), mat({ color: [.95, .75, .3], spec: 1.4, shin: 90 }), { cast: false }));
    // estandartes de las cuatro casas
    const HC = [['#7f1d1d', '#eab308'], ['#065f46', '#cbd5e1'], ['#1e3a8a', '#b45309'], ['#a16207', '#1c1917']];
    [-6.3, -2.1, 2.1, 6.3].forEach((x, i) => {
      const side = x < 0 ? -10.4 : 10.4, z = -12 + i * 7;
      R.add(R.node(R.mesh(G.box(.06, 5, 2.2)), mat({ color: M3.hex(HC[i][0]), spec: .2, ds: true }), { pos: [side, 9, z], cast: false }));
      R.add(R.node(R.mesh(G.box(.08, .7, 1)), mat({ color: M3.hex(HC[i][1]), spec: .8 }), { pos: [side + (x < 0 ? .04 : -.04), 9.5, z], cast: false }));
      R.add(R.node(R.mesh(G.box(.07, 5, 2.4)), mat({ color: M3.hex(HC[i][0]), spec: .2, ds: true }), { pos: [0 + (i - 1.5) * 3.6, 11, -33.3], rot: [0, Math.PI / 2, 0], cast: false }));
    });
    // velas flotantes
    const cand = [];
    for (let i = 0; i < (V.quality() === 'low' ? 40 : 90); i++) {
      const p = [(Math.random() - .5) * 19, 4.6 + Math.random() * 3.6, -30 + Math.random() * 56];
      cand.push([G.cyl(.07, .08, .55, 8), G.at(p[0], p[1], p[2])]); hall.flames.push({ p: [p[0], p[1] + .64, p[2]], ph: Math.random() * 6, y0: p[1] });
    }
    hall.candles = R.add(R.node(R.mesh(G.merge(cand)), mat({ color: [1, .95, .82], em: [.35, .3, .2], spec: .2 }), { cast: false }));
    // techo encantado: estrellas
    for (let i = 0; i < 160; i++) hall.stars.push({ p: [(Math.random() - .5) * 40, 14 + Math.random() * 10, -40 + Math.random() * 75], s: .08 + Math.random() * .16, ph: Math.random() * 6 });
    let px = 0, py = 0; cv.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); px = (e.clientX - r.left) / r.width - .5; py = (e.clientY - r.top) / r.height - .5; }, { passive: true });
    hall.par = () => [px, py];
    new IntersectionObserver(es => { hall.vis = es[0].isIntersecting; if (hall.vis) hall.wake(); }).observe($('v7Hall'));
    window.addEventListener('resize', () => R.resize());
    hall.t0 = performance.now(); hall.wake();
  }
  function hallLine() { const el = $('v7HallLine'); if (el) el.textContent = `${S.student ? esc(S.student).slice(0, 20) + ' · ' : ''}${S.house || 'Sin casa'} · ${YEAR_NAMES[V.year(S.xp)]}`; }
  function hallRebuild() {
    ['v7Hall', 'v7Quick'].forEach(id => { const el = $(id); if (el) el.remove(); });
    Object.assign(hall, { R: null, raf: 0, flames: [], stars: [], built: false, lost: false, candles: null }); hallBuild();
  }
  hall.wake = () => { if (hall.lost) { hallRebuild(); return; } hallLine(); if (hall.R && !hall.raf) hall.raf = requestAnimationFrame(hallLoop); };
  function hallLoop(now) {
    hall.raf = 0;
    if (!hall.R || document.hidden || !hall.vis || currentTab !== 'home') return; // se pausa sola
    hall.raf = requestAnimationFrame(hallLoop);
    if (V.quality() === 'low' && (hall.frames++ & 1)) return;
    const R = hall.R, t = (now - hall.t0) / 1000, [px, py] = hall.par();
    R.tick(now);
    const k = reduced() ? 0 : (Math.sin(t * .045 - Math.PI / 2) + 1) / 2, z = 24 - k * 34;
    R.cam.pos = [Math.sin(t * .11) * 1.2 + px * 2, 3.1 + Math.sin(t * .2) * .25 - py, z];
    R.cam.target = [px * 4 + Math.sin(t * .07) * 1.5, 3.4 - py * 2, z - 14];
    R.pl[0].pos = [Math.sin(t * .3) * 4, 6.5, z - 8];
    const pts = [];
    hall.flames.forEach(f => { const fl = .75 + .25 * Math.sin(t * 9 + f.ph) * Math.sin(t * 5.3 + f.ph * 2); const yb = Math.sin(t * .8 + f.ph) * .12; pts.push({ p: [f.p[0], f.p[1] + yb, f.p[2]], c: [1, .72, .3, .9 * fl], s: .32 }); pts.push({ p: [f.p[0], f.p[1] + yb - .02, f.p[2]], c: [1, .95, .7, 1], s: .12 }); pts.push({ p: [f.p[0], f.p[1] + yb, f.p[2]], c: [1, .55, .2, .18], s: 1.1 }); });
    if (hall.candles) hall.candles.pos = [0, Math.sin(t * .8) * .12, 0];
    hall.stars.forEach(s => pts.push({ p: s.p, c: [.85, .9, 1, .5 + .5 * Math.sin(t * 2 + s.ph)], s: s.s }));
    R.render(pts);
  }

  /* =====================================================================
     VARITA 3D EN OLLIVANDERS
  ===================================================================== */
  const wand3 = { R: null, node: null, raf: 0, core: [1, .6, .2], drag: null, rx: 0, ry: -.25, vis: true };
  function wandBuild() {
    const wrap = $('wandSvgWrap'); if (!wrap || $('v7Wand') || !M3.supported()) return;
    wrap.insertAdjacentHTML('beforebegin', '<canvas id="v7Wand" aria-label="Tu varita en 3D" style="touch-action:none"></canvas>');
    const R = M3.create($('v7Wand'), { maxDpr: 2 }); if (!R) { $('v7Wand').remove(); return; }
    wand3.R = R; wrap.style.display = 'none';
    $('v7Wand').addEventListener('webglcontextlost', e => { e.preventDefault(); $('v7Wand').remove(); wand3.R = null; wand3.node = null; wrap.style.display = ''; });
    R.clear = [.07, .05, .04]; R.sky = [.5, .45, .4]; R.ground = [.15, .1, .08]; R.light.dir = M3.norm([-.3, -.8, -.6]); R.light.color = [1.1, 1, .9];
    R.cam.pos = [0, .3, 4.3]; R.cam.target = [0, 0, 0]; R.cam.fov = 40;
    R.pl[0] = { pos: [2, 2, 3], color: [1, .8, .5], range: 6 };
    const cv = $('v7Wand');
    cv.addEventListener('pointerdown', e => { wand3.drag = [e.clientX, e.clientY, wand3.rx, wand3.ry]; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (!wand3.drag) return; wand3.rx = wand3.drag[2] + (e.clientX - wand3.drag[0]) * .02; wand3.ry = wand3.drag[3] + (e.clientY - wand3.drag[1]) * .01; });
    cv.addEventListener('pointerup', () => { wand3.drag = null; });
    new IntersectionObserver(es => { wand3.vis = es[0].isIntersecting; if (wand3.vis && !wand3.raf) wand3.raf = requestAnimationFrame(wandLoop); }).observe(cv);
    window.addEventListener('resize', () => R.resize());
    unlock('v7wand3d');
  }
  function wandGeo(len) {
    const L = 1.6 + (len - 9) * .28 + 2.2, prof = [[0, 0], [.13, 0], [.16, .06], [.14, .16], [.17, .32], [.15, .5], [.13, .62], [.165, .78], [.16, 1], [.13, 1.18], [.17, 1.3], [.12, 1.45], [.105, 1.6]];
    for (let k = 1; k <= 8; k++) { const f = k / 8; prof.push([.105 - .07 * f + Math.sin(f * 12) * .004, 1.6 + (L - 1.6) * f]); }
    prof.push([0, L + .02]);
    prof.forEach(q => { q[0] *= 1.45; }); return { g: M3.G.lathe(prof, 20), L };
  }
  function wandUpdate() {
    if (!wand3.R || currentTab !== 'wand') return;
    const R = wand3.R, w = WOODS[+$('wandWood').value], c = CORES[+$('wandCore').value], len = parseFloat($('wandLength').value) || 11;
    if (wand3.node) R.remove(wand3.node);
    const { g, L } = wandGeo(len); wand3.L = L; wand3.core = M3.hex(c[1]);
    wand3.node = R.add(R.node(null, null)); wand3.inner = R.add(R.node(R.mesh(g), R.mat({ color: M3.hex(w[1]).map(v => Math.min(1, v * 1.35 + .05)), pat: 1, patS: .7, spec: .8, shin: 60, rim: .3, rimC: wand3.core }), { pos: [0, -L / 2, 0] }), wand3.node);
    wand3.node.rot = [0, 0, -Math.PI / 2 + .12];
    R.resize(); if (!wand3.raf) wand3.raf = requestAnimationFrame(wandLoop);
  }
  function wandLoop(now) {
    wand3.raf = 0; if (!wand3.R || document.hidden || currentTab !== 'wand' || !wand3.vis) return;
    wand3.raf = requestAnimationFrame(wandLoop);
    const R = wand3.R, t = now / 1000; R.tick(now);
    if (!wand3.drag && !reduced()) wand3.rx += .008;
    wand3.node.rot = [wand3.rx, wand3.ry, -Math.PI / 2 + .12 + Math.sin(t * .8) * .04];
    wand3.node.pos = [0, Math.sin(t * 1.3) * .06, 0];
    // la punta (tras rotar) y chispas del núcleo
    const tip = M3.M.xf(M3.M.compose(wand3.node.pos, wand3.node.rot, [1, 1, 1]), [0, wand3.L / 2 + .05, 0]);
    const pts = [{ p: tip, c: [...wand3.core, .8], s: .35 + Math.sin(t * 6) * .05 }, { p: tip, c: [1, 1, 1, .9], s: .1 }];
    for (let i = 0; i < 10; i++) { const ph = t * 1.4 + i * .63, r = (ph % 1); pts.push({ p: [tip[0] + r * .9 * Math.cos(i * 2.4), tip[1] + r * .6 * Math.sin(i * 1.7) + r * .3, tip[2] + r * .4 * Math.sin(i)], c: [...wand3.core, (1 - r) * .8], s: .09 }); }
    R.render(pts);
  }
  const _uwp = updateWandPreview;
  updateWandPreview = function () { _uwp(); if (currentTab === 'wand') { wandBuild(); wandUpdate(); } };
  const _sw2 = switchTab;
  switchTab = function (tab) { const r = _sw2(tab); if (tab === 'wand') setTimeout(() => { wandBuild(); wandUpdate(); }, 60); return r; };

  /* =====================================================================
     PATRONUS DE LUZ
  ===================================================================== */
  const _patronus = summonPatronus;
  summonPatronus = function () {
    _patronus(); V.spellSound('patronus'); unlock('v7patronus'); buzz([20, 30, 60]);
    if (reduced()) return;
    const cv = document.createElement('canvas'); cv.id = 'v7Patronus'; document.body.appendChild(cv);
    const dpr = Math.min(devicePixelRatio || 1, V.quality() === 'low' ? 1 : 1.5); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cv.style.width = '100%'; cv.style.height = '100%';
    const x = cv.getContext('2d'); x.scale(dpr, dpr);
    const ps = [], t0 = performance.now(), N = V.quality() === 'low' ? 3 : 7;
    const loop = now => {
      const t = now - t0; if (t > 5200) { cv.remove(); return; }
      requestAnimationFrame(loop);
      const fly = document.querySelector('.patronus-fly');
      let cx = innerWidth / 2, cy = innerHeight * .45;
      if (fly) { const r = fly.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
      if (t < 4200) for (let i = 0; i < N; i++) { const a = Math.random() * 6.28, d = Math.random() * 46; ps.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * .7, vx: -1.5 - Math.random() * 2, vy: (Math.random() - .5) * .8, l: 1, r: 1 + Math.random() * 2.6 }); }
      x.clearRect(0, 0, innerWidth, innerHeight);
      const fade = t > 4200 ? 1 - (t - 4200) / 1000 : Math.min(1, t / 300);
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, 160); g.addColorStop(0, `rgba(220,240,255,${.45 * fade})`); g.addColorStop(.5, `rgba(150,200,255,${.15 * fade})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(cx - 170, cy - 170, 340, 340);
      x.globalCompositeOperation = 'lighter';
      for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i]; p.x += p.vx; p.y += p.vy + Math.sin((p.x + t * .2) * .02) * .4; p.l -= .012; if (p.l <= 0) { ps.splice(i, 1); continue; } x.globalAlpha = p.l * fade; x.fillStyle = i % 4 ? '#cfe8ff' : '#ffffff'; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill(); }
      x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    };
    requestAnimationFrame(loop);
  };

  /* =====================================================================
     EFECTOS EXTRA PARA AJEDREZ, ESCOBA Y SNITCH 3D
  ===================================================================== */
  function fxOverlay(host, kind) {
    if (!host || host.querySelector('.v7-fxover') || reduced()) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const cv = document.createElement('canvas'); cv.className = 'v7-fxover'; host.appendChild(cv);
    const x = cv.getContext('2d'), P = [], low = V.quality() === 'low';
    const loop = now => {
      if (!cv.isConnected) return; requestAnimationFrame(loop);
      if (document.hidden) return;
      const W = cv.clientWidth, H = cv.clientHeight; if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      x.clearRect(0, 0, W, H);
      if (kind === 'broom') {
        if (P.length < (low ? 14 : 34) && Math.random() < .5) P.push({ t: 'line', y: Math.random() * H, x: W + 20, v: 9 + Math.random() * 10, w: 30 + Math.random() * 80 });
        if (Math.random() < (low ? .01 : .025)) P.push({ t: 'cloud', y: Math.random() * H * .7, x: W + 120, v: 1.2 + Math.random() * 1.5, r: 50 + Math.random() * 70 });
        for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; p.x -= p.v; if (p.x < -200) { P.splice(i, 1); continue; }
          if (p.t === 'line') { x.strokeStyle = 'rgba(220,230,255,.28)'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x + p.w, p.y); x.stroke(); }
          else { const g = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); g.addColorStop(0, 'rgba(200,205,235,.16)'); g.addColorStop(1, 'rgba(200,205,235,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(p.x, p.y, p.r * 1.8, p.r, 0, 0, 7); x.fill(); } }
        const v = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,8,30,.45)'); x.fillStyle = v; x.fillRect(0, 0, W, H);
      } else {
        const gold = kind === 'snitch';
        if (P.length < (low ? 20 : 50) && Math.random() < .4) P.push({ x: Math.random() * W, y: gold ? Math.random() * H : H + 5, vx: (Math.random() - .5) * .4, vy: gold ? (Math.random() - .5) * .3 : -.4 - Math.random() * .8, l: 1, r: 1 + Math.random() * 2 });
        x.globalCompositeOperation = 'lighter';
        for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; p.x += p.vx + Math.sin(now / 700 + i) * .2; p.y += p.vy; p.l -= gold ? .006 : .004; if (p.l <= 0 || p.y < -10) { P.splice(i, 1); continue; } x.globalAlpha = p.l * (gold ? .8 : .6); x.fillStyle = gold ? '#fde68a' : (i % 3 ? '#fb923c' : '#fde047'); x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill(); }
        x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
        const v = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .4, W / 2, H / 2, Math.max(W, H) * .78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, gold ? 'rgba(20,12,0,.35)' : 'rgba(0,0,0,.4)'); x.fillStyle = v; x.fillRect(0, 0, W, H);
      }
    };
    requestAnimationFrame(loop);
  }
  const wrapMount = (name, host, kind) => { const f = window[name]; if (typeof f !== 'function') return; window[name] = function () { const r = f.apply(this, arguments); try { if (r) fxOverlay(host(), kind); } catch (e) {} return r; }; };
  wrapMount('c3Mount', () => $('c3wrap'), 'chess');
  wrapMount('b3Mount', () => $('broom3d') && $('broom3d').parentElement, 'broom');
  wrapMount('s3dMount', () => $('snitch3d') && $('snitch3d').parentElement, 'snitch');

  /* =====================================================================
     PERFIL COMPLETO DEL MAGO
  ===================================================================== */
  function renderV7Profile() {
    const tab = $('tab-profile'); if (!tab) return;
    let box = $('v7Profile');
    if (!box) { const first = tab.firstElementChild; first.insertAdjacentHTML('afterend', '<div id="v7Profile" class="v7-profile"></div>'); box = $('v7Profile'); }
    const u = cloud.user, meta = (u && u.user_metadata) || {}, avatar = meta.avatar_url || meta.picture;
    const y = V.year(S.xp), next = YEARS[y + 1], prevT = YEARS[y];
    const pat = (() => { try { return patronusFor(S.student || myName()); } catch (e) { return ['—', '✨']; } })();
    const wand = S.wand ? `${WOODS[S.wand.wood][0]}, ${CORES[S.wand.core][0].toLowerCase()}, ${String(S.wand.len).replace('.', ',')}″` : 'Aún no tienes varita';
    const s = st(), stt = S.stats || {}, acc = stt.answered ? Math.round(stt.correct / stt.answered * 100) : 0;
    const hist = (s.history || []).slice(0, 15);
    const ago = t => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'ahora' : m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${Math.round(m / 60)} h` : `hace ${Math.round(m / 1440)} d`; };
    box.innerHTML = `
      <div class="v7-idcard">
        <div class="av">${avatar ? `<img src="${esc(avatar)}" alt="" referrerpolicy="no-referrer" loading="lazy">` : (S.house && HOUSES[S.house] ? HOUSES[S.house].emoji : '🧙')}</div>
        <div class="min-w-0 flex-grow">
          <p class="font-wizard font-bold text-amber-200 text-lg truncate">${esc(meta.full_name || S.student || 'Mago')}</p>
          <p class="text-[11px] text-stone-400 truncate">${u ? '☁️ ' + esc(u.email || 'Cuenta conectada') : '⚠️ Sin iniciar sesión'}</p>
          <div class="flex flex-wrap gap-1.5 mt-1"><span class="v7-year">🎓 ${YEAR_NAMES[y]}</span>${S.house ? `<span class="v7-year" style="background:linear-gradient(180deg,#e7e5e4,#a8a29e)">${HOUSES[S.house].emoji} ${S.house}</span>` : ''}</div>
          <div class="w-full bg-stone-950 h-1.5 rounded-full overflow-hidden mt-2"><div class="h-full bg-gradient-to-r from-amber-500 to-yellow-300" style="width:${next ? Math.min(100, ((S.xp || 0) - prevT) / (next - prevT) * 100) : 100}%"></div></div>
          <p class="text-[10px] text-stone-500 mt-0.5">${next ? `${next - (S.xp || 0)} XP para ${YEAR_NAMES[y + 1]}` : '¡Terminaste Hogwarts!'}</p>
        </div>
      </div>
      <div class="v7-facts">
        <div class="v7-fact"><b>🪄</b><span>${esc(wand)}</span><small>Varita</small></div>
        <div class="v7-fact"><b>${pat[1]}</b><span>${esc(pat[0])}</span><small>Patronus</small></div>
        <div class="v7-fact"><b>⚔️</b><span>${stt.duelsWon || 0}</span><small>Duelos ganados</small></div>
        <div class="v7-fact"><b>🎯</b><span>${acc}%</span><small>Aciertos (${stt.answered || 0} preguntas)</small></div>
        <div class="v7-fact"><b>🪙</b><span>${S.gold || 0}</span><small>Galeones</small></div>
        <div class="v7-fact"><b>🔥</b><span>${stt.bestStreak || 0}</span><small>Mejor racha</small></div>
        <div class="v7-fact"><b>🎲</b><span>${s.betsWon || 0}</span><small>Apuestas ganadas</small></div>
        <div class="v7-fact"><b>🏅</b><span>${(S.ach || []).length}/${Object.keys(ACH).length}</span><small>Logros</small></div>
      </div>
      <div class="glass-card rounded-3xl p-4 space-y-2">
        <h3 class="font-wizard font-bold text-amber-300">🏆 Vitrina de trofeos</h3>
        <div class="v7-shelf">${Object.entries(ACH).map(([id, a]) => `<div class="${(S.ach || []).includes(id) ? '' : 'off'}" title="${esc(a[2])}"><span>${a[0]}</span>${esc(a[1])}</div>`).join('')}</div>
      </div>
      <div class="glass-card rounded-3xl p-4 space-y-2">
        <h3 class="font-wizard font-bold text-amber-300">📜 Historial de duelos</h3>
        ${hist.length ? `<div class="v7-hist">${hist.map(h => `<div><span>${h.i}</span><span class="min-w-0 truncate">${esc(h.x)} · <b>${esc(h.r)}</b>${h.g ? ` <span class="${h.g > 0 ? 'text-emerald-300' : 'text-red-300'}">${h.g > 0 ? '+' : ''}${h.g} 🪙</span>` : ''}</span><em>${ago(h.t)}</em></div>`).join('')}</div>` : '<p class="text-xs text-stone-400">Todavía no juegas duelos. ¡Ve a la Arena!</p>'}
      </div>`;
  }
  V.renderProfile = renderV7Profile;
  const _rp = renderProfile;
  renderProfile = function () { _rp(); if (currentTab === 'profile') renderV7Profile(); };

  /* =====================================================================
     TUTORIAL GUIADO
  ===================================================================== */
  const visible = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
  const pick = sel => [...document.querySelectorAll(sel)].find(visible);
  V.tutorial = force => {
    if (force) { if (currentTab !== 'home') switchTab('home'); }
    const steps = [
      ['#v7Hall', '¡Bienvenido/a al Gran Salón de Hogwarts! Soy tu lechuza y te mostraré el castillo.'],
      ['#v7Quick', 'Estos son los accesos rápidos: toca un ícono grande para ir directo a cada sala.'],
      ['[data-tab="duel"]', 'En la Arena del Duelo juegas contra la IA, contra alguien a tu lado o en línea con amigos, con chat y apuestas de galeones.'],
      ['[data-tab="games"]', 'En la Sala de Juegos están el ajedrez mágico, la escoba, la snitch y más.'],
      ['#accountBtn', 'Aquí está tu cuenta de Google. Tu progreso se guarda solo en la nube.'],
      ['button[onclick="openSettings()"]', 'En Ajustes puedes poner el tema claro, letra más grande, la calidad gráfica, los sonidos y la vibración.']
    ].map(([s, t]) => [pick(s), t]).filter(([el]) => el);
    if (!steps.length) return;
    let i = 0; const box = document.createElement('div'); box.id = 'v7Tut'; document.body.appendChild(box);
    const end = done => { box.remove(); opt().tutDone = 1; save(); if (done) { unlock('v7tut'); sfx('achieve'); } };
    const show = () => {
      const [el, text] = steps[i]; el.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
      setTimeout(() => {
        const r = el.getBoundingClientRect(), pad = 6, below = r.bottom + 190 < innerHeight;
        box.innerHTML = `<div class="hole" style="left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px"></div>
          <div class="tip" style="left:${Math.max(16, Math.min(innerWidth - Math.min(320, innerWidth - 32) - 16, r.left))}px;top:${below ? r.bottom + 14 : Math.max(16, r.top - 180)}px">
            <div class="who"><span>🦉</span> Hedwig, tu guía <small style="margin-left:auto;font-family:inherit;color:#a8a29e">${i + 1}/${steps.length}</small></div>
            <p>${text}</p><div class="row"><button class="skip">Saltar</button><button class="next">${i < steps.length - 1 ? 'Siguiente ➜' : '¡Listo! 🎉'}</button></div></div>`;
        box.querySelector('.skip').onclick = () => end(false);
        box.querySelector('.next').onclick = () => { sfx('tick'); if (++i >= steps.length) end(true); else show(); };
      }, reduced() ? 30 : 380);
    };
    show();
  };

  /* =====================================================================
     PANTALLA DE CARGA, IMÁGENES DIFERIDAS Y ARRANQUE
  ===================================================================== */
  const loader = $('loader');
  if (loader && !loader.classList.contains('gone')) loader.insertAdjacentHTML('beforeend', `<svg class="v7-castle" viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><path fill="#0b0716" d="M0 120V92h20V70h8v-8h6v8h8v22h26V50l10-16 10 16v42h18V60h6V44l9-14 9 14v16h6v32h22V30l12-22 12 22v62h16V58h8V46h4v12h8v34h20V40l10-18 10 18v52h22V66h6V54l8-12 8 12v12h6v26h18V74h8v-8h8v8h8v46z"/><g fill="#fbbf24" opacity=".85"><rect x="100" y="52" width="3" height="5"/><rect x="171" y="40" width="3" height="6"/><rect x="176" y="60" width="3" height="5"/><rect x="226" y="66" width="3" height="5"/><rect x="267" y="56" width="3" height="6"/><rect x="314" y="74" width="3" height="5"/></g></svg>`);
  const lazyImgs = root => (root.querySelectorAll ? root.querySelectorAll('img:not([loading])') : []).forEach(i => { i.loading = 'lazy'; i.decoding = 'async'; });
  lazyImgs(document);
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && lazyImgs(n)))).observe(document.body, { childList: true, subtree: true });

  document.querySelectorAll('[style*="rgba(12,10,9"]').forEach(el => el.classList.add('v7-keepdark'));
  applyV7();
  hallBuild();
  const startGate = () => V.gateCheck();
  if (loader && !loader.classList.contains('gone')) {
    const _enter = enterCastle;
    enterCastle = function () { const r = _enter(); setTimeout(startGate, 300); return r; };
    const lb = $('loaderEnter'); if (lb) lb.onclick = () => enterCastle();
  } else startGate();
  if (currentTab === 'profile') renderV7Profile();
})();
