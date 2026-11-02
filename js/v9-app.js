/* =====================================================================
   HOGWARTS 9 · EXPERIENCIA EN EL CELULAR
   Accesos directos, velas, día/noche, instalar, continuar, vibración,
   gestos, ruleta, cofre, racha, fin de semana, QR, stickers, tarjeta
   de mago e historias, rivales, giroscopio, agitar, soplar y más.
   ===================================================================== */
(() => {
  const V9 = window.V9 = window.V9 || {};
  V9.version = '9.0';
  const st = () => { S.v9 = Object.assign({ wheel: '', chest: 0, last: null, tabAt: 0, tab: '', rivals: {}, dismiss: {}, gyroPlay: false, wand: false, taps: true }, S.v9 || {}); return S.v9; };
  const today = () => new Date().toISOString().slice(0, 10);
  const coarse = matchMedia('(pointer: coarse)').matches;
  const reduced = () => (window.V8 && V8.reduced && V8.reduced()) || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const low = () => window.V7 && V7.quality && V7.quality() === 'low';
  const fmt = n => Number(n).toLocaleString('es-PE');
  V9.buzz = p => { try { if (window.V7 && V7.vib ? V7.vib() : navigator.vibrate) navigator.vibrate(p); } catch (e) {} };
  const loadJS = src => new Promise((ok, ko) => { if (document.querySelector(`script[src="${src}"]`)) return ok(); const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });

  /* ---------- 1. Vibración en momentos clave ---------- */
  if (window.V8 && V8.on) {
    V8.on('answer', ({ ok }) => V9.buzz(ok ? 25 : [40, 60, 40]));
    V8.on('frog', ({ r }) => setTimeout(() => V9.buzz(r === 'l' ? [60, 50, 60, 50, 160] : r === 'r' ? [40, 40, 90] : 35), 1500));
    V8.on('cardBought', ({ r }) => setTimeout(() => V9.buzz(r === 'l' ? [60, 50, 160] : 60), 600));
    V8.on('gameWin', () => V9.buzz([30, 40, 30, 40, 120]));
    V8.on('ludoCapture', () => V9.buzz([80, 30, 80]));
  }

  /* ---------- 2. Día y noche según la hora real ---------- */
  function daylight() {
    const h = new Date().getHours(), c = h >= 6 && h < 17 ? 'day' : h >= 17 && h < 19 ? 'dusk' : h >= 19 || h < 5 ? 'night' : 'dawn';
    const R = document.documentElement; ['day', 'dusk', 'night', 'dawn'].forEach(k => R.classList.toggle('v9-' + k, k === c));
  }
  daylight(); setInterval(daylight, 600000);

  /* ---------- 3. Velas flotantes del Gran Salón ---------- */
  function candles() {
    if ($('v9Candles')) return;
    const box = document.createElement('div'); box.id = 'v9Candles'; box.setAttribute('aria-hidden', 'true');
    const n = coarse ? 7 : 12;
    box.innerHTML = Array.from({ length: n }, (_, i) => `<span class="v9-candle" style="--x:${(i + .5) / n * 100 + (Math.random() * 6 - 3)}%;--y:${8 + Math.random() * 55}%;--d:${5 + Math.random() * 4}s;--s:${.55 + Math.random() * .6};animation-delay:-${Math.random() * 6}s"><i></i></span>`).join('');
    document.body.prepend(box);
  }

  /* ---------- 4. Cartas que se inclinan y brillan al tocarlas ---------- */
  const TILT = '.v8-gamecard, .glass-card.hoverable, .v8-shopcard, .v8-cardgrid > div';
  if (!coarse) {
    document.addEventListener('pointermove', e => {
      const el = e.target.closest && e.target.closest(TILT); if (!el || reduced()) return;
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.classList.add('v9-tilt'); el.style.setProperty('--rx', (-y * 9).toFixed(2) + 'deg'); el.style.setProperty('--ry', (x * 11).toFixed(2) + 'deg'); el.style.setProperty('--gx', (x + .5) * 100 + '%'); el.style.setProperty('--gy', (y + .5) * 100 + '%');
    }, { passive: true });
    document.addEventListener('pointerout', e => { const el = e.target.closest && e.target.closest(TILT); if (el && !el.contains(e.relatedTarget)) { el.classList.remove('v9-tilt'); el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); } });
  } else {
    // en el celular: brillo al tocar y efecto 3D corto
    document.addEventListener('pointerdown', e => { const el = e.target.closest && e.target.closest(TILT); if (!el || reduced()) return; const r = el.getBoundingClientRect(); el.style.setProperty('--gx', (e.clientX - r.left) / r.width * 100 + '%'); el.style.setProperty('--gy', (e.clientY - r.top) / r.height * 100 + '%'); el.classList.add('v9-press'); setTimeout(() => el.classList.remove('v9-press'), 380); }, { passive: true });
  }
  // cromos legendarios y fondo: se mueven al inclinar el celular (si el giroscopio está activo)
  let gyroOn = false;
  function gyroListen() {
    if (gyroOn) return; gyroOn = true; let raf = 0, g = null;
    addEventListener('deviceorientation', e => {
      g = e; if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0; if (!g || g.gamma == null || reduced()) return;
        const x = Math.max(-1, Math.min(1, g.gamma / 30)), y = Math.max(-1, Math.min(1, (g.beta - 45) / 30));
        const R = document.documentElement.style; R.setProperty('--tx', x.toFixed(3)); R.setProperty('--ty', y.toFixed(3));
        gyroKeys(g);
      });
    }, { passive: true });
  }
  V9.askGyro = async () => {
    try { if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) { const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') { toast('Sin permiso para el giroscopio.', '📱'); return false; } } } catch (e) { return false; }
    gyroListen(); return true;
  };
  if ((S.settings && S.settings.gyro) || (coarse && typeof DeviceOrientationEvent !== 'undefined' && !DeviceOrientationEvent.requestPermission)) gyroListen();

  /* ---------- 5. Volar inclinando el celular (juegos con flechas) ---------- */
  const held = {};
  const setKey = (k, on) => { if (!!held[k] === on) return; held[k] = on; dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { key: k })); };
  function gyroKeys(g) {
    const s = st();
    if (!s.gyroPlay || !activeGame || !['vuelo', 'laberinto', 'dcao', 'bosque', 'lago'].includes(activeGame)) { ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].forEach(k => setKey(k, false)); return; }
    const lr = g.gamma, ud = g.beta - (s.gyroBase || 40);
    setKey('ArrowLeft', lr < -11); setKey('ArrowRight', lr > 11); setKey('ArrowUp', ud < -11); setKey('ArrowDown', ud > 11);
  }
  V9.gyroPlay = async on => {
    if (on && !(await V9.askGyro())) return;
    st().gyroPlay = on; save();
    if (on) { const once = e => { if (e.beta != null) { st().gyroBase = Math.round(e.beta); save(); } removeEventListener('deviceorientation', once); }; addEventListener('deviceorientation', once); }
    toast(on ? 'Inclina el celular para moverte en Clase de Vuelo, Laberinto y más.' : 'Control por inclinación apagado.', '📱'); V9.gameBar();
  };

  /* ---------- 6. Agitar para revolver y soplar para bajar el fuego (Pociones) ---------- */
  let lastShake = 0;
  addEventListener('devicemotion', e => {
    if (activeGame !== 'caldero' || !window.V8G || !V8G.cd) return;
    const a = e.accelerationIncludingGravity, r = e.rotationRate; if (!a) return;
    const f = Math.hypot(a.x || 0, a.y || 0, a.z || 0); const now = Date.now();
    if (f > 22 && now - lastShake > 650) { lastShake = now; const dir = r && r.alpha != null ? (r.alpha > 0 ? 'ccw' : 'cw') : 'cw'; V8G.cd('stir', dir); V9.buzz(25); }
  });
  // Ludo: agita el celular para lanzar el dado
  let lastRoll = 0;
  addEventListener('devicemotion', e => {
    if (activeGame !== 'ludo') return; const a = e.accelerationIncludingGravity; if (!a) return;
    const f = Math.hypot(a.x || 0, a.y || 0, a.z || 0), b = $('ludoRoll');
    if (f > 24 && Date.now() - lastRoll > 1500 && b && !b.disabled && /Lanzar/.test(b.textContent)) { lastRoll = Date.now(); b.click(); }
  });
  let mic = null;
  V9.blow = async () => {
    if (mic) { mic.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const ac = new (window.AudioContext || window.webkitAudioContext)(), an = ac.createAnalyser();
      ac.createMediaStreamSource(stream).connect(an); an.fftSize = 512; const d = new Uint8Array(an.frequencyBinCount); let loud = 0, raf = 0;
      mic = { stop() { cancelAnimationFrame(raf); stream.getTracks().forEach(t => t.stop()); ac.close(); mic = null; const b = $('v9Blow'); if (b) b.classList.remove('on'); } };
      const b = $('v9Blow'); if (b) b.classList.add('on'); toast('Sopla fuerte cerca del micrófono para bajar el fuego.', '🌬️');
      const t0 = Date.now();
      const tick = () => {
        raf = requestAnimationFrame(tick); an.getByteFrequencyData(d); let s = 0; for (let i = 1; i < 14; i++) s += d[i]; s /= 13;
        loud = s > 150 ? loud + 1 : Math.max(0, loud - 2);
        if (loud > 18) { loud = 0; const c = document.querySelector('.v8-cauldron'), h = c ? +getComputedStyle(c).getPropertyValue('--heat') || 0 : 0; if (h > 0 && window.V8G) { V8G.cd('heat', h - 1); V9.buzz(40); } }
        if (Date.now() - t0 > 20000 || activeGame !== 'caldero') mic && mic.stop();
      };
      tick();
    } catch (e) { toast('No se pudo usar el micrófono.', '🎤'); }
  };

  /* barra de controles extra dentro de los juegos */
  V9.gameBar = () => {
    const stage = $('gameStage'); if (!stage) return; let bar = $('v9GameBar');
    const g = activeGame, s = st(), tilt = coarse && ['vuelo', 'laberinto', 'dcao', 'bosque', 'lago'].includes(g), pot = g === 'caldero';
    if (!tilt && !pot) { if (bar) bar.remove(); return; }
    if (!bar) { bar = document.createElement('div'); bar.id = 'v9GameBar'; bar.className = 'v9-gamebar'; const body = $('gameBody'); body.parentNode.insertBefore(bar, body); }
    bar.innerHTML = (tilt ? `<button class="v8-chip ${s.gyroPlay ? 'on' : ''}" onclick="V9.gyroPlay(${!s.gyroPlay})">📱 ${s.gyroPlay ? 'Inclinación activada' : 'Mover inclinando el celular'}</button>` : '')
      + (pot ? `<span class="text-[11px] text-stone-400">🫨 Gira el celular como si revolvieras</span><button id="v9Blow" class="v8-chip" onclick="V9.blow()">🌬️ Soplar al micrófono</button>` : '');
  };

  /* ---------- 7. Continuar donde lo dejaste + accesos directos ---------- */
  const _og = window.openGame;
  if (typeof _og === 'function') {
    window.openGame = openGame = function (id) {
      const r = _og.apply(this, arguments);
      try { const g = (typeof GAMES !== 'undefined' && GAMES.find(x => x.id === id)); if (g) { st().last = { id, name: g.name, icon: g.icon, at: Date.now() }; save(); } } catch (e) {}
      setTimeout(V9.gameBar, 60); return r;
    };
  }
  const _cg = window.closeGame;
  if (typeof _cg === 'function') window.closeGame = closeGame = function () { const r = _cg.apply(this, arguments); const b = $('v9GameBar'); if (b) b.remove(); return r; };
  function shortcut() {
    let to = ''; try { to = new URLSearchParams(location.search).get('ir') || ''; } catch (e) {}
    if (!to) return;
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
    setTimeout(() => {
      if (to === 'duelo') switchTab('duel');
      else if (to === 'ludo') { switchTab('games'); setTimeout(() => openGame('ludo'), 300); }
      else if (to === 'rana') { switchTab('home'); setTimeout(() => V8.openFrog && V8.openFrog(), 400); }
    }, 900);
  }

  /* ---------- 8. Premios: racha, ruleta diaria, cofre cada 4 horas, fin de semana ---------- */
  const CHEST_MS = 4 * 3600000;
  const FEATURED = ['mixta', 'snap', 'laberinto', 'dcao', 'bosque', 'lago', 'gobstones', 'ritmo', 'vuelo', 'caldero', 'retrato', 'q3d'];
  const isWeekend = () => [0, 6].includes(new Date().getDay());
  const week = () => { const d = new Date(), y = new Date(d.getFullYear(), 0, 1); return Math.floor((d - y) / 604800000); };
  V9.featured = () => FEATURED[week() % FEATURED.length];
  const gameName = id => { try { const g = GAMES.find(x => x.id === id); return g ? g.icon + ' ' + g.name : id; } catch (e) { return id; } };
  // galeones dobles el fin de semana en el juego destacado
  if (window.V8 && V8.gold) {
    const _gold = V8.gold;
    V8.gold = (n, why) => { _gold(n, why); if (n > 0 && isWeekend() && activeGame === V9.featured() && !V9._noBonus) { V9._noBonus = true; _gold(n, '🎉 Bono de fin de semana'); V9._noBonus = false; } };
  }
  const _gr = window.gameReward;
  if (typeof _gr === 'function') window.gameReward = gameReward = function (points, label) { const r = _gr.apply(this, arguments); if (isWeekend() && activeGame === V9.featured() && points > 0 && window.V8 && V8.gold) V8.gold(Math.max(5, Math.round(points / 4)), '🎉 Galeones dobles del fin de semana'); return r; };

  const streak = () => { try { const d = V8.st().daily || {}, y = V8.day(new Date(Date.now() - 86400000)); return d.last === V8.day() || d.last === y ? d.streak || 0 : 0; } catch (e) { return 0; } };
  function homeStrip() {
    const home = $('tab-home'); if (!home) return;
    let box = $('v9Strip'); if (!box) { box = document.createElement('div'); box.id = 'v9Strip'; const anchor = $('v8HomeCard') || $('v7Quick'); if (anchor) anchor.insertAdjacentElement('beforebegin', box); else home.prepend(box); }
    const s = st(), left = Math.max(0, (s.chest || 0) + CHEST_MS - Date.now()), wheelOk = s.wheel !== today(), last = s.last && Date.now() - s.last.at < 7 * 86400000 ? s.last : null;
    const hm = ms => { const h = Math.floor(ms / 3600000), m = Math.ceil(ms % 3600000 / 60000); return h ? `${h} h ${m} min` : `${m} min`; };
    const k = streak();
    box.innerHTML = `<div class="v9-strip">
      ${last ? `<button class="v9-tile v9-continue" onclick="switchTab('games');setTimeout(()=>openGame('${last.id}'),250)"><span class="ic">${last.icon}</span><span><b>Continuar</b><small>${esc(last.name)}</small></span></button>` : ''}
      <button class="v9-tile" onclick="V8.openDaily && V8.openDaily()"><span class="ic v9-flame" style="--k:${Math.min(1, k / 7)}">🔥</span><span><b>${k} ${k === 1 ? 'día' : 'días'}</b><small>${k >= 7 ? '¡Racha legendaria!' : `Racha · cofre al día 7`}</small></span></button>
      <button class="v9-tile ${wheelOk ? 'ready' : ''}" onclick="V9.wheel()"><span class="ic">🎡</span><span><b>Ruleta</b><small>${wheelOk ? '¡Gírala hoy!' : 'Vuelve mañana'}</small></span></button>
      <button class="v9-tile ${left ? '' : 'ready'}" onclick="V9.chest()"><span class="ic">🎁</span><span><b>Cofre</b><small>${left ? 'En ' + hm(left) : '¡Listo para abrir!'}</small></span></button>
      ${isWeekend() ? `<button class="v9-tile ready" onclick="switchTab('games');setTimeout(()=>openGame('${V9.featured()}'),250)"><span class="ic">🎉</span><span><b>Fin de semana</b><small>Galeones dobles en ${gameName(V9.featured())}</small></span></button>` : ''}
      </div>${installCard()}`;
  }
  V9.homeStrip = homeStrip;
  setInterval(() => { if (typeof currentTab !== 'undefined' && currentTab === 'home' && !document.hidden) homeStrip(); }, 60000);

  // cofre cada 4 horas
  V9.chest = () => {
    const s = st(), left = (s.chest || 0) + CHEST_MS - Date.now();
    if (left > 0) { toast(`El cofre se abre en ${Math.ceil(left / 60000)} minutos.`, '🎁'); return; }
    s.chest = Date.now(); save();
    const frog = Math.random() < .15, g = 15 + Math.floor(Math.random() * 6) * 5;
    V8.sheet('🎁 Cofre mágico', `<div class="v9-chestbox"><div class="lid"></div><div class="base"></div><div class="glow"></div></div><p class="text-center font-wizard text-2xl text-amber-300 mt-3" id="v9ChestTxt">&nbsp;</p><p class="text-center text-xs text-stone-400">Vuelve en 4 horas para el siguiente.</p>`);
    sfx('spell');
    setTimeout(() => { const b = document.querySelector('.v9-chestbox'); if (b) b.classList.add('open'); sfx('achieve'); V9.buzz([30, 30, 90]); fireConfetti({ particleCount: 70, spread: 70, origin: { y: .55 } });
      if (frog) { V8.addFrogs(1); $('v9ChestTxt').textContent = '¡Una rana de chocolate! 🐸'; } else { V8.gold(g); $('v9ChestTxt').textContent = `+${g} galeones 🪙`; } homeStrip(); }, 900);
    notifyLater();
  };
  function notifyLater() {
    clearTimeout(V9._nt); V9._nt = setTimeout(() => { if (document.hidden && V8.notify) V8.notify('🎁 ¡Tu cofre está listo!', 'Entra a Hogwarts para abrirlo.'); homeStrip(); }, CHEST_MS);
  }
  if (st().chest) { const left = st().chest + CHEST_MS - Date.now(); if (left > 0) V9._nt = setTimeout(() => { if (document.hidden && V8.notify) V8.notify('🎁 ¡Tu cofre está listo!', 'Entra a Hogwarts para abrirlo.'); homeStrip(); }, left); }

  // ruleta diaria que se gira con el dedo
  const PRIZES = [['20 🪙', () => V8.gold(20)], ['🐸 x1', () => V8.addFrogs(1)], ['40 🪙', () => V8.gold(40)], ['15 🪙', () => V8.gold(15)], ['🐸 x2', () => V8.addFrogs(2)], ['60 🪙', () => V8.gold(60)], ['25 🪙', () => V8.gold(25)], ['100 🪙', () => V8.gold(100)]];
  const COLS = ['#7f1d1d', '#14532d', '#1e3a8a', '#854d0e', '#7f1d1d', '#14532d', '#1e3a8a', '#854d0e'];
  V9.wheel = () => {
    const ok = st().wheel !== today();
    V8.sheet('🎡 Ruleta mágica', `<div class="v9-wheelbox"><div class="pin"></div><canvas id="v9Wheel" width="640" height="640"></canvas></div>
      <p class="text-center text-sm mt-2 ${ok ? 'text-amber-200' : 'text-stone-400'}" id="v9WheelTxt">${ok ? 'Desliza la ruleta con el dedo para girarla (una vez al día).' : 'Ya giraste hoy. ¡Vuelve mañana!'}</p>`);
    const cv = $('v9Wheel'), x = cv.getContext('2d'), N = PRIZES.length; let ang = 0, vel = 0, spinning = false, done = !ok;
    const draw = () => {
      x.clearRect(0, 0, 640, 640); x.save(); x.translate(320, 320); x.rotate(ang);
      for (let i = 0; i < N; i++) {
        const a0 = i / N * Math.PI * 2, a1 = (i + 1) / N * Math.PI * 2, g = x.createRadialGradient(0, 0, 40, 0, 0, 300); g.addColorStop(0, '#fde68a33'); g.addColorStop(1, COLS[i]);
        x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, 290, a0, a1); x.closePath(); x.fillStyle = COLS[i]; x.fill(); x.fillStyle = g; x.fill(); x.strokeStyle = '#fcd34d'; x.lineWidth = 4; x.stroke();
        x.save(); x.rotate((a0 + a1) / 2); x.fillStyle = '#fff7e0'; x.font = 'bold 38px Cinzel, Georgia, serif'; x.textAlign = 'right'; x.textBaseline = 'middle'; x.fillText(PRIZES[i][0], 265, 0); x.restore();
      }
      x.beginPath(); x.arc(0, 0, 296, 0, 7); x.lineWidth = 14; x.strokeStyle = '#b8860b'; x.stroke();
      for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; x.beginPath(); x.arc(Math.cos(a) * 296, Math.sin(a) * 296, 6, 0, 7); x.fillStyle = i % 2 ? '#fff8dc' : '#fbbf24'; x.fill(); }
      x.beginPath(); x.arc(0, 0, 48, 0, 7); const c = x.createRadialGradient(-10, -10, 4, 0, 0, 48); c.addColorStop(0, '#fff3b0'); c.addColorStop(1, '#a16207'); x.fillStyle = c; x.fill();
      x.restore();
    };
    draw();
    const finish = () => {
      done = true; st().wheel = today(); save();
      const a = ((-Math.PI / 2 - ang) % (Math.PI * 2) + Math.PI * 4) % (Math.PI * 2), i = Math.floor(a / (Math.PI * 2) * N) % N;
      PRIZES[i][1](); sfx('levelup'); V9.buzz([40, 40, 120]); fireConfetti({ particleCount: 110, spread: 90 });
      const t = $('v9WheelTxt'); if (t) { t.className = 'text-center font-wizard text-xl text-amber-300 mt-2'; t.textContent = `¡Ganaste ${PRIZES[i][0]}!`; }
      homeStrip();
    };
    const spin = v => {
      if (done || spinning) return; spinning = true;
      const dir = v < 0 ? -1 : 1, total = dir * (Math.PI * 2 * (4 + Math.random() * 3) + Math.random() * Math.PI * 2), a0 = ang, t0 = performance.now(), dur = reduced() ? 600 : 4600; let lastSeg = -1;
      const step = now => {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); ang = a0 + total * e;
        const seg = Math.floor(((ang % 6.283) + 6.283) % 6.283 / (6.283 / N)); if (seg !== lastSeg) { lastSeg = seg; if (k < .97) { sfx('tick'); V9.buzz(5); } }
        draw(); if (!cv.isConnected) return; if (k < 1) requestAnimationFrame(step); else finish();
      };
      requestAnimationFrame(step);
    };
    const pos = e => { const r = cv.getBoundingClientRect(); return Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2); };
    let drag = null;
    cv.addEventListener('pointerdown', e => { if (done || spinning) return; drag = { a: pos(e), t: performance.now(), base: ang, v: 0 }; try { cv.setPointerCapture(e.pointerId); } catch (er) {} });
    cv.addEventListener('pointermove', e => { if (!drag || spinning) return; const now = performance.now(), na = drag.base + (pos(e) - drag.a); drag.v = (na - ang) / Math.max(1, now - drag.t) * 16; drag.t = now; ang = na; draw(); });
    cv.addEventListener('pointerup', () => { if (!drag) return; const v = drag.v; drag = null; spin(v || 1); });
    cv.addEventListener('pointercancel', () => { drag = null; });
  };

  /* ---------- 9. Botón «Instalar app» ---------- */
  function installCard() {
    const s = st(); if ((typeof isStandalone === 'function' && isStandalone()) || s.dismiss.install > Date.now()) return '';
    const ios = typeof isIOS === 'function' && isIOS();
    return `<div class="v9-install"><img src="img/app/icon-192.png" alt="" width="52" height="52"><div class="flex-grow"><b>Instala Hogwarts en tu celular</b><small>${ios ? 'Toca <i class="fa-solid fa-arrow-up-from-bracket"></i> Compartir y luego «Agregar a inicio».' : 'Ábrelo como app, con su propio ícono y sin barra del navegador.'}</small></div>
      ${ios ? '' : '<button class="btn-gold !py-1.5 !px-3 !text-xs" onclick="installApp()">Instalar</button>'}<button class="v9-x" aria-label="Ocultar" onclick="V9.hideInstall()">✕</button></div>`;
  }
  V9.hideInstall = () => { st().dismiss.install = Date.now() + 7 * 86400000; save(); homeStrip(); };

  /* ---------- 10. Recordar la pestaña al volver a abrir ---------- */
  if (typeof switchTab === 'function') {
    const _sw = switchTab;
    window.switchTab = switchTab = function (tab) {
      const prev = typeof currentTab !== 'undefined' ? currentTab : '';
      const r = _sw.apply(this, arguments);
      try { const s = st(); s.tab = currentTab; s.tabAt = Date.now(); save(); } catch (e) {}
      if (tab === 'home') homeStrip();
      if (tab === 'ranking') rivalsBox();
      if (tab === 'profile') setTimeout(profileShareBtn, 50);
      if (prev !== tab && st().taps !== false) V9.buzz(8);
      return r;
    };
  }
  function restoreTab() {
    const s = st(); if (location.hash && location.hash.length > 1) return;
    if (s.tab && s.tab !== 'home' && Date.now() - (s.tabAt || 0) < 30 * 60000 && ['games', 'duel', 'quiz', 'castle', 'shop', 'profile', 'ranking', 'library', 'movies'].includes(s.tab)) setTimeout(() => { try { switchTab(s.tab); } catch (e) {} }, 400);
  }

  /* ---------- 11. Gestos: deslizar entre pestañas y bajar para cerrar ---------- */
  const navTabs = () => [...document.querySelectorAll('#mobileNav [data-tab]')].map(b => b.dataset.tab);
  let sw = null;
  document.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return; const t = e.target;
    if (t.closest('input,textarea,select,canvas,#gameStage,.v8-sheet,#dialog,.overflow-x-auto,.no-swipe,[data-noswipe]') || (typeof activeGame !== 'undefined' && activeGame)) { sw = null; return; }
    sw = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (!sw) return; const c = e.changedTouches[0], dx = c.clientX - sw.x, dy = c.clientY - sw.y, dt = Date.now() - sw.t; sw = null;
    if (dt > 600 || Math.abs(dx) < 80 || Math.abs(dy) > Math.abs(dx) * .5) return;
    const list = navTabs(), i = list.indexOf(currentTab); if (i < 0) return;
    const j = i + (dx < 0 ? 1 : -1); if (j < 0 || j >= list.length) return;
    document.documentElement.classList.add(dx < 0 ? 'v9-slide-l' : 'v9-slide-r'); setTimeout(() => document.documentElement.classList.remove('v9-slide-l', 'v9-slide-r'), 400);
    switchTab(list[j]);
  }, { passive: true });
  // bajar para cerrar hojas y ventanas
  function pullToClose(panelSel, close) {
    let p = null;
    document.addEventListener('touchstart', e => { const el = e.target.closest(panelSel); const sc = el && (el.querySelector('.v8-sheet-body') || el); if (!el || sc.scrollTop > 0 || e.target.closest('canvas,input,textarea,.v9-wheelbox')) { p = null; return; } p = { el, y: e.touches[0].clientY, dy: 0 }; }, { passive: true });
    document.addEventListener('touchmove', e => { if (!p) return; p.dy = Math.max(0, e.touches[0].clientY - p.y); if (p.dy > 6) { p.el.style.transform = `translateY(${p.dy}px)`; p.el.style.transition = 'none'; } }, { passive: true });
    document.addEventListener('touchend', () => { if (!p) return; const { el, dy } = p; p = null; el.style.transition = 'transform .25s'; if (dy > 110) { el.style.transform = 'translateY(100%)'; setTimeout(() => { el.style.transform = ''; close(); }, 220); } else el.style.transform = ''; });
  }
  if (coarse) { pullToClose('#v8Sheet .v8-sheet-box', () => V8.closeSheet && V8.closeSheet()); pullToClose('#dialog > div', () => closeDialog()); }

  /* ---------- 12. Ahorro de batería automático ---------- */
  if (navigator.getBattery) navigator.getBattery().then(b => {
    const chk = () => { const lowB = !b.charging && b.level <= .2; document.documentElement.classList.toggle('v9-saver', lowB); if (lowB && !V9._saverToast) { V9._saverToast = true; toast('Batería baja: activé el modo ahorro (menos efectos).', '🔋'); } };
    b.addEventListener('levelchange', chk); b.addEventListener('chargingchange', chk); chk();
  }).catch(() => {});

  /* ---------- 13. Imágenes livianas y con carga elegante ---------- */
  if (window.V8 && V8.ph) {
    const _ph = V8.ph;
    V8.ph = function () { return _ph.apply(this, arguments).replace('<img ', '<img loading="lazy" decoding="async" onload="this.classList.add(\'ok\')" '); };
  }

  /* ---------- 14. QR para invitar y escanear ---------- */
  const QR_LIB = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  V9.qrShow = async url => {
    V8.sheet('📱 Escanea para unirte', `<div class="flex flex-col items-center gap-3"><div id="v9Qr" class="v9-qr"></div><p class="text-xs text-stone-400 text-center break-all">${esc(url)}</p><p class="text-sm text-amber-200 text-center">Tu amigo abre la cámara de su celular (o «📷 Escanear» en la página) y apunta aquí.</p></div>`);
    try { await loadJS(QR_LIB); new QRCode($('v9Qr'), { text: url, width: 240, height: 240, colorDark: '#1c0f05', colorLight: '#fff7e0', correctLevel: QRCode.CorrectLevel.M }); }
    catch (e) { $('v9Qr').innerHTML = '<p class="text-xs text-red-300">No se pudo crear el QR sin internet.</p>'; }
  };
  V9.qrScan = async () => {
    V8.sheet('📷 Escanear QR', `<div class="v9-scan"><video id="v9Cam" playsinline muted></video><div class="frame"></div></div><p id="v9ScanTxt" class="text-center text-sm text-stone-300 mt-2">Apunta al código QR de tu amigo.</p>`);
    let stream; try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); } catch (e) { $('v9ScanTxt').textContent = 'No se pudo abrir la cámara. Puedes escribir el código a mano.'; return; }
    const v = $('v9Cam'); v.srcObject = stream; await v.play().catch(() => {});
    const stop = () => stream.getTracks().forEach(t => t.stop());
    let det = null; if ('BarcodeDetector' in window) { try { det = new BarcodeDetector({ formats: ['qr_code'] }); } catch (e) {} }
    if (!det) { try { await loadJS('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'); } catch (e) {} }
    const cv = document.createElement('canvas'), x = cv.getContext('2d', { willReadFrequently: true });
    const look = async () => {
      if (!v.isConnected) return stop();
      let txt = '';
      try {
        if (det) { const r = await det.detect(v); if (r[0]) txt = r[0].rawValue; }
        else if (window.jsQR && v.videoWidth) { cv.width = v.videoWidth; cv.height = v.videoHeight; x.drawImage(v, 0, 0); const d = x.getImageData(0, 0, cv.width, cv.height), r = jsQR(d.data, d.width, d.height); if (r) txt = r.data; }
      } catch (e) {}
      if (txt) { stop(); V9.buzz(60); sfx('correct'); try { const u = new URL(txt, location.href); if (u.origin === location.origin) { location.href = u.href; return; } } catch (e) {} $('v9ScanTxt').textContent = 'Ese QR no es de esta página.'; return; }
      setTimeout(look, 250);
    };
    look();
  };
  // botones de QR en las salas (2 jugadores y Ludo)
  const _grs = window.grStatus;
  if (typeof _grs === 'function') window.grStatus = grStatus = function (html) {
    if (/grShare\(\)/.test(html) && !/V9\.qrShow/.test(html)) html = html.replace(/(<button onclick="grCopy\(\)")/, '<button onclick="V9.qrShow(grInviteUrl())" class="btn-ghost !py-1.5 !text-xs"><i class="fa-solid fa-qrcode"></i> QR</button>$1');
    return _grs.call(this, html);
  };
  const addScan = root => {
    root.querySelectorAll('#grCode, #lnCode').forEach(inp => { if (inp.dataset.v9) return; inp.dataset.v9 = 1; const b = document.createElement('button'); b.type = 'button'; b.className = 'btn-ghost !py-1.5 !px-2.5 !text-xs shrink-0'; b.innerHTML = '<i class="fa-solid fa-camera"></i>'; b.title = 'Escanear QR'; b.setAttribute('aria-label', 'Escanear código QR'); b.onclick = V9.qrScan; inp.insertAdjacentElement('afterend', b); });
    root.querySelectorAll('[onclick="V8.ludoShare()"]').forEach(b => { if (b.dataset.v9) return; b.dataset.v9 = 1; const q = document.createElement('button'); q.className = 'btn-ghost !py-1.5 !text-xs'; q.innerHTML = '<i class="fa-solid fa-qrcode"></i> QR'; q.onclick = () => { V9.qrShow(V8.ludoUrl()); }; b.insertAdjacentElement('afterend', q); });
  };
  new MutationObserver(() => { const gb = $('gameBody'); if (gb) addScan(gb); }).observe(document.body, { childList: true, subtree: true });

  /* ---------- 15. Stickers en partidas en línea ---------- */
  const STK = ['⚡ ¡Expelliarmus!', '😂', '😱', '🔥 ¡Buena!', '🧙 ¡Te gané!', '🔁 ¡Revancha!', '👏', '🐸'];
  function stickerBar() {
    let bar = $('v9Stk'); const on = typeof gr !== 'undefined' && gr.ch && gr.opp && activeGame;
    if (!on) { if (bar) bar.remove(); return; }
    if (bar) return;
    bar = document.createElement('div'); bar.id = 'v9Stk'; bar.className = 'v9-stk';
    bar.innerHTML = `<button class="v9-stk-btn" onclick="this.parentNode.classList.toggle('open')" aria-label="Stickers">😀</button><div class="list">${STK.map((s, i) => `<button onclick="V9.sticker(${i})">${s}</button>`).join('')}</div>`;
    document.body.appendChild(bar);
  }
  setInterval(stickerBar, 1500);
  let stkAt = 0;
  V9.sticker = i => { if (Date.now() - stkAt < 1500) return; stkAt = Date.now(); grSend({ type: 'v9stk', i }); showSticker(STK[i], true); const b = $('v9Stk'); if (b) b.classList.remove('open'); };
  function showSticker(t, mine) {
    const el = document.createElement('div'); el.className = 'v9-bubble ' + (mine ? 'me' : 'them'); el.innerHTML = `<small>${esc(mine ? 'Tú' : (gr.opp || 'Rival'))}</small>${esc(t)}`;
    document.body.appendChild(el); if (!mine) { sfx('tick'); V9.buzz(30); } setTimeout(() => el.remove(), 2600);
  }
  const _gom = window.grOnMsg;
  if (typeof _gom === 'function') window.grOnMsg = grOnMsg = function (m) { if (m && m.type === 'v9stk') { if (STK[m.i]) showSticker(STK[m.i], false); return; } return _gom.apply(this, arguments); };

  /* ---------- 16. Ranking entre amigos (tus rivales en línea) ---------- */
  const _grh = window.grResultHTML;
  if (typeof _grh === 'function') window.grResultHTML = grResultHTML = function (o) {
    try { if (gr.opp && !o._v9) { const key = String(gr.opp).slice(0, 20), r = st().rivals[key] = st().rivals[key] || { w: 0, l: 0, t: 0, at: 0 }; if (r.round !== gr.round + gr.game) { r.round = gr.round + gr.game; o.tie ? r.t++ : o.win ? r.w++ : r.l++; r.at = Date.now(); save(); } } } catch (e) {}
    return _grh.apply(this, arguments);
  };
  function rivalsBox() {
    const sec = $('tab-ranking'); if (!sec) return; let box = $('v9Rivals');
    const list = Object.entries(st().rivals).sort((a, b) => (b[1].w - b[1].l) - (a[1].w - a[1].l) || b[1].at - a[1].at).slice(0, 12);
    if (!box) { box = document.createElement('div'); box.id = 'v9Rivals'; box.className = 'glass-card rounded-3xl p-4 max-w-2xl mx-auto'; const h = sec.firstElementChild; h.insertAdjacentElement('afterend', box); }
    box.innerHTML = `<p class="font-wizard font-bold text-amber-300">🧙 Entre amigos</p><p class="text-[11px] text-stone-400 mb-2">Tus partidas en línea contra cada amigo (ajedrez, memoria, escoba y juegos en línea).</p>
      ${list.length ? `<div class="space-y-1.5">${list.map(([n, r], i) => `<div class="flex items-center gap-2 bg-stone-950/50 rounded-xl px-3 py-2"><span class="w-6 text-center font-bold ${i === 0 ? 'text-amber-300' : 'text-stone-400'}">${i + 1}</span><span class="flex-grow text-sm font-semibold truncate">${esc(n)}</span><span class="text-xs text-emerald-300">${r.w} G</span><span class="text-xs text-red-300">${r.l} P</span>${r.t ? `<span class="text-xs text-stone-400">${r.t} E</span>` : ''}</div>`).join('')}</div>`
      : '<p class="text-sm text-stone-400">Aún no juegas en línea. Reta a un amigo desde Juegos → «En línea» y aquí verás quién va ganando.</p>'}`;
  }

  /* ---------- 17. Tarjeta de mago e historias para compartir ---------- */
  const HC = { Gryffindor: ['#7f1d1d', '#d4a017', '🦁'], Slytherin: ['#064e3b', '#c0c0c0', '🐍'], Ravenclaw: ['#1e3a8a', '#b08d57', '🦅'], Hufflepuff: ['#a16207', '#1c1917', '🦡'] };
  V9.card = async (story = false) => {
    const W = 1080, H = story ? 1920 : 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
    const h = HC[S.house] || ['#3b1a4a', '#d4a017', '🏰'];
    const bg = x.createRadialGradient(W * .7, H * .2, 50, W / 2, H / 2, H); bg.addColorStop(0, h[0]); bg.addColorStop(.6, '#12091c'); bg.addColorStop(1, '#05030a'); x.fillStyle = bg; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(255,248,225,${Math.random() * .8})`; x.beginPath(); x.arc(Math.random() * W, Math.random() * H * .6, Math.random() * 2.2 + .4, 0, 7); x.fill(); }
    try { const im = new Image(); im.src = 'img/app/icon-512.png'; await im.decode(); x.globalAlpha = .16; x.drawImage(im, W - 620, H - 700, 760, 760); x.globalAlpha = 1; } catch (e) {}
    const gold = x.createLinearGradient(0, 0, W, H); gold.addColorStop(0, '#fff3b0'); gold.addColorStop(.3, '#e5b33a'); gold.addColorStop(.6, '#8a5a12'); gold.addColorStop(1, '#f5cf5a');
    x.strokeStyle = gold; x.lineWidth = 16; x.beginPath(); x.roundRect ? x.roundRect(30, 30, W - 60, H - 60, 50) : x.rect(30, 30, W - 60, H - 60); x.stroke();
    x.textAlign = 'center'; x.fillStyle = '#fcd34d'; x.font = '600 34px Cinzel, Georgia, serif'; x.fillText('HOGWARTS MAGIC EXPERIENCE', W / 2, story ? 200 : 140);
    x.font = '200px serif'; x.fillText(h[2], W / 2, story ? 520 : 380);
    x.fillStyle = gold; x.font = '900 92px Cinzel, Georgia, serif'; x.fillText((V8.name() || 'Mago').slice(0, 16), W / 2, story ? 700 : 530);
    x.fillStyle = '#fff7e0'; x.font = '48px Georgia, serif'; x.fillText(`${S.house || 'Sin casa aún'}${window.V7 && V7.year ? ' · ' + V7.yearName(V7.year(S.xp)) : ''}`, W / 2, story ? 790 : 610);
    const v8 = V8.st(), cards = Object.keys(v8.cards || {}).length;
    const stats = [['⭐', fmt(S.xp || 0), 'puntos'], ['🃏', `${cards}/60`, 'cromos'], ['🪙', fmt(S.gold || 0), 'galeones'], ['🔥', streak(), 'días seguidos']];
    stats.forEach(([e, v, l], i) => {
      const cx = story ? (i % 2 ? W * .72 : W * .28) : (i % 2 ? W * .72 : W * .28), cy = (story ? 1000 : 740) + Math.floor(i / 2) * (story ? 300 : 230);
      x.fillStyle = 'rgba(0,0,0,.35)'; x.strokeStyle = 'rgba(252,211,77,.5)'; x.lineWidth = 3; x.beginPath(); x.roundRect ? x.roundRect(cx - 210, cy - 90, 420, 190, 30) : x.rect(cx - 210, cy - 90, 420, 190); x.fill(); x.stroke();
      x.font = '64px serif'; x.fillStyle = '#fff'; x.fillText(e, cx, cy - 10); x.font = 'bold 54px Georgia, serif'; x.fillStyle = '#fde68a'; x.fillText(v, cx, cy + 58); x.font = '28px Georgia, serif'; x.fillStyle = '#d6d3d1'; x.fillText(l, cx, cy + 92);
    });
    x.fillStyle = '#e9d5ff'; x.font = 'italic 44px Georgia, serif'; x.fillText('¿A qué casa perteneces tú?', W / 2, H - (story ? 330 : 190));
    x.fillStyle = '#fcd34d'; x.font = 'bold 40px Georgia, serif'; x.fillText((CONFIG.SITE_URL || location.host).replace(/^https?:\/\//, '').replace(/\/$/, ''), W / 2, H - (story ? 250 : 120));
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    const file = new File([blob], story ? 'mi-historia-hogwarts.png' : 'mi-tarjeta-hogwarts.png', { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    V8.sheet(story ? '📱 Historia para tu estado' : '🪪 Tu tarjeta de mago', `<img src="${url}" class="mx-auto rounded-2xl shadow-2xl" style="max-height:60vh" alt="Tu tarjeta"><div class="flex gap-2 justify-center mt-3 flex-wrap">
      <button class="btn-gold" id="v9ShareImg"><i class="fa-solid fa-share-nodes"></i> Compartir</button><a class="btn-ghost" href="${url}" download="${file.name}"><i class="fa-solid fa-download"></i> Guardar</a>
      <button class="btn-ghost" onclick="V9.card(${!story})">${story ? '🪪 Tarjeta' : '📱 Formato historia'}</button></div>`);
    $('v9ShareImg').onclick = () => { if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file], text: '¡Mira mi perfil de mago en Hogwarts Magic Experience! 🪄' }).catch(() => {}); else { const a = document.createElement('a'); a.href = url; a.download = file.name; a.click(); toast('Imagen guardada. Súbela a tu estado o historia.', '📱'); } };
  };
  function profileShareBtn() {
    const sec = $('tab-profile'); if (!sec || $('v9ProfShare')) return;
    const d = document.createElement('div'); d.id = 'v9ProfShare'; d.className = 'flex gap-2 justify-center flex-wrap';
    d.innerHTML = '<button class="btn-gold" onclick="V9.card(false)"><i class="fa-solid fa-id-card"></i> Mi tarjeta de mago</button><button class="btn-ghost" onclick="V9.card(true)"><i class="fa-solid fa-mobile-screen"></i> Historia para estados</button>';
    sec.prepend(d);
  }

  /* ---------- 18. Duelo con la varita: dibuja la forma para elegir ---------- */
  const SHAPES = [['⚡', 'rayo', 'zigzag'], ['◯', 'círculo', 'circle'], ['V', 'uve', 'v'], ['—', 'línea', 'line']];
  function classify(pts) {
    if (pts.length < 6) return null;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys), sz = Math.max(w, h);
    if (sz < 40) return null;
    const a = pts[0], b = pts[pts.length - 1], close = Math.hypot(a[0] - b[0], a[1] - b[1]) < sz * .35;
    let len = 0, rev = 0, ld = 0; for (let i = 1; i < pts.length; i++) { len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); }
    const step = Math.max(1, Math.floor(pts.length / 24)); for (let i = step; i < pts.length; i += step) { const dx = pts[i][0] - pts[i - step][0]; const d = Math.sign(Math.round(dx / 4)); if (d && ld && d !== ld) rev++; if (d) ld = d; }
    if (close && len > sz * 2.2) return 'circle';
    if (h < w * .35 && rev === 0) return 'line';
    if (rev >= 2) return 'zigzag';
    const mi = ys.indexOf(Math.max(...ys)); if (mi > pts.length * .2 && mi < pts.length * .8 && rev <= 1) return 'v';
    return rev >= 1 ? 'zigzag' : 'line';
  }
  V9.wandMode = on => { st().wand = on; save(); wandDecor(); toast(on ? 'Modo varita: dibuja la forma de tu respuesta en el pergamino.' : 'Modo varita apagado: toca las respuestas.', '🪄'); };
  function wandDecor() {
    const grid = $('duelOptionsGrid'); if (!grid) return;
    let tg = $('v9WandTg');
    if (!tg) { tg = document.createElement('button'); tg.id = 'v9WandTg'; tg.className = 'v8-chip mb-2'; grid.parentNode.insertBefore(tg, grid); }
    tg.textContent = st().wand ? '🪄 Modo varita: activado' : '🪄 Lanzar dibujando con el dedo'; tg.classList.toggle('on', !!st().wand); tg.onclick = () => V9.wandMode(!st().wand);
    [...grid.children].forEach((b, i) => { const sh = SHAPES[i]; if (!sh) return; let tag = b.querySelector('.v9-shape'); if (st().wand) { if (!tag) { tag = document.createElement('span'); tag.className = 'v9-shape'; b.prepend(tag); } tag.textContent = sh[0]; } else if (tag) tag.remove(); });
    let pad = $('v9Pad');
    if (!st().wand) { if (pad) pad.remove(); return; }
    if (!pad) {
      pad = document.createElement('div'); pad.id = 'v9Pad'; pad.className = 'v9-pad'; pad.innerHTML = '<canvas></canvas><span>Dibuja aquí: ⚡ rayo · ◯ círculo · V uve · — línea</span>'; grid.parentNode.insertBefore(pad, grid.nextSibling);
      const cv = pad.querySelector('canvas'), x = cv.getContext('2d'); let pts = null;
      const size = () => { const r = cv.getBoundingClientRect(); cv.width = r.width * 2; cv.height = r.height * 2; x.setTransform(2, 0, 0, 2, 0, 0); };
      setTimeout(size, 30);
      cv.addEventListener('pointerdown', e => { size(); pts = [[e.offsetX, e.offsetY]]; cv.setPointerCapture(e.pointerId); x.clearRect(0, 0, cv.width, cv.height); });
      cv.addEventListener('pointermove', e => { if (!pts) return; const p = [e.offsetX, e.offsetY], q = pts[pts.length - 1]; pts.push(p); x.strokeStyle = '#fde68a'; x.shadowColor = '#f59e0b'; x.shadowBlur = 12; x.lineWidth = 5; x.lineCap = 'round'; x.beginPath(); x.moveTo(q[0], q[1]); x.lineTo(p[0], p[1]); x.stroke(); });
      cv.addEventListener('pointerup', () => {
        const kind = classify(pts || []); pts = null; setTimeout(() => x.clearRect(0, 0, cv.width, cv.height), 400);
        const i = SHAPES.findIndex(s => s[2] === kind), btn = $('duelOptionsGrid') && $('duelOptionsGrid').children[i];
        if (i < 0 || !btn || btn.disabled) { toast('No reconocí la forma. Inténtalo otra vez.', '🪄'); V9.buzz([20, 30, 20]); return; }
        V9.buzz(40); btn.click();
      });
    }
  }
  if (typeof window.answerDuel === 'function') new MutationObserver(() => { if (!$('duelOptionsGrid') || !$('duelOptionsGrid').children.length) return; clearTimeout(V9._wd); V9._wd = setTimeout(wandDecor, 30); }).observe(document.body, { childList: true, subtree: true });

  /* ---------- 19. Novedades con lechuza ---------- */
  if (window.V8) {
    V8.version = '9.0';
    V8.news = force => {
      const s = V8.st(); if (!force && (s.seenNews === '9.0' || !S.house)) return;
      const dlg = $('dialog');
      if (!force && ($('v7Tut') || $('v8Sheet') || currentTab !== 'home' || activeGame || (dlg && !dlg.classList.contains('hidden')))) { V9._nt2 = (V9._nt2 || 0) + 1; if (V9._nt2 < 20) setTimeout(() => V8.news(), 4000); return; }
      s.seenNews = '9.0'; save();
      const owl = document.createElement('div'); owl.className = 'v9-owl'; owl.innerHTML = '<span>🦉</span><i>✉️</i>'; document.body.appendChild(owl); sfx('spell');
      setTimeout(() => {
        owl.remove();
        showDialog({ icon: '🦉', title: '¡Llegó una lechuza: Hogwarts 9!', body: `<ul class="text-left text-sm space-y-1.5">
          <li>🏰 <b>Nuevo ícono</b> y gráficos 3D más realistas (ajedrez de mármol, Ludo con figuras de las casas).</li>
          <li>🎡 <b>Ruleta diaria</b>, 🎁 <b>cofre cada 4 horas</b> y 🔥 racha en la portada.</li>
          <li>📱 Desliza entre pestañas, baja para cerrar y <b>escanea un QR</b> para unirte a una sala.</li>
          <li>🪄 <b>Duelo con la varita</b>: dibuja la forma de tu respuesta.</li>
          <li>😀 <b>Stickers</b> en partidas en línea y ranking <b>entre amigos</b>.</li>
          <li>🪪 <b>Tu tarjeta de mago</b> e historias para tus estados.</li>
          <li>⚙️ Calidad gráfica <b>Ultra</b> en Ajustes.</li></ul>`, actions: [{ label: '¡A explorar!', primary: true }] });
      }, reduced() ? 50 : 1700);
    };
  }

  /* ---------- 20. Ajustes nuevos ---------- */
  if (typeof renderSettings === 'function') {
    const _rs = renderSettings;
    window.renderSettings = renderSettings = function () {
      _rs.apply(this, arguments);
      const box = $('settingsToggles'); if (!box) return; const s = st();
      const sw = (on, fn, label, hint) => `<label class="flex items-center justify-between gap-3 py-2.5 cursor-pointer"><span><span class="block text-sm text-stone-200 font-semibold">${label}</span><span class="block text-[11px] text-stone-500">${hint}</span></span><span class="switch"><input type="checkbox" ${on ? 'checked' : ''} onchange="${fn}(this.checked)"><span></span></span></label>`;
      box.insertAdjacentHTML('beforeend', `<div class="pt-3 mt-2 border-t border-amber-900/40"><p class="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Versión 9</p>
        ${sw(s.wand, 'V9.wandMode', 'Duelo con la varita', 'Elige tu respuesta dibujando su forma.')}
        ${coarse ? sw(s.gyroPlay, 'V9.gyroPlay', 'Mover inclinando el celular', 'En Clase de Vuelo, Laberinto, Defensa, Bosque y Lago.') : ''}
        ${sw(s.taps !== false, 'V9.setTaps', 'Vibración al cambiar de sala', 'Un toque suave al tocar el menú.')}</div>`);
    };
  }
  V9.setTaps = on => { st().taps = on; save(); };

  /* ---------- arranque ---------- */
  function boot() {
    if (!low()) candles();
    shortcut(); restoreTab();
    if (typeof currentTab !== 'undefined' && currentTab === 'home') homeStrip();
    setTimeout(() => { if (window.V8 && V8.news) V8.news(); }, 6000);
  }
  if (document.readyState === 'complete') setTimeout(boot, 200); else addEventListener('load', () => setTimeout(boot, 200));
})();
