/* =====================================================================
   HOGWARTS · VERSIÓN 8 · LUDO MÁGICO
   Tablero 3D de las cuatro casas (con versión 2D si el celular no
   tiene 3D). 2, 3 o 4 jugadores: contra la IA, en el mismo celular o
   en línea con amigos (el que crea la sala manda la partida).
   Reglas: sale con 6, el 6 repite (tres 6 seguidos pierden el turno),
   comer una ficha o llegar a la meta da otro tiro, casillas con
   estrella y de salida son seguras, a la meta se llega con el número
   exacto.
===================================================================== */
(() => {
  const V8 = window.V8;
  const SEATS = [
    { house: 'Gryffindor', color: '#c0262d', light: '#f3a3a0', emoji: '🦁' },
    { house: 'Slytherin', color: '#0f7a4d', light: '#9ee0bf', emoji: '🐍' },
    { house: 'Hufflepuff', color: '#d6a419', light: '#f6e09a', emoji: '🦡' },
    { house: 'Ravenclaw', color: '#2346b0', light: '#a9bdf3', emoji: '🦅' }
  ];
  const HOUSE_SEAT = { Gryffindor: 0, Slytherin: 1, Hufflepuff: 2, Ravenclaw: 3 };

  /* ---------- geometría del tablero (cuadrícula 15×15) ---------- */
  const rot = ([x, y]) => [14 - y, x];
  const rotN = (c, n) => { for (let i = 0; i < n; i++) c = rot(c); return c; };
  const Q0 = [[1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0], [7, 0], [8, 0]];
  const PATH = [0, 1, 2, 3].flatMap(s => Q0.map(c => rotN(c, s)));
  const HOMECOL = s => [1, 2, 3, 4, 5].map(i => rotN([i, 7], s));
  const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
  const YARD = s => [[1.5, 1.5], [3.5, 1.5], [1.5, 3.5], [3.5, 3.5]].map(([x, y]) => { const r = rotN([x + .5, y + .5].map(v => v - .5), s); return r; });
  const FINISH = s => rotN([6, 7], s);
  const absCell = (seat, p) => p >= 0 && p <= 50 ? (seat * 13 + p) % 52 : -1;
  const cellOf = (seat, p, k) => {
    if (p < 0) return YARD(seat)[k];
    if (p <= 50) return PATH[absCell(seat, p)];
    if (p <= 55) return HOMECOL(seat)[p - 51];
    const f = FINISH(seat), off = [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]][k];
    return [f[0] + .35 + off[0], f[1] + off[1]].map((v, i) => v); // se corrige al rotar abajo
  };
  // posición en el mundo (centro de casilla); la meta se acomoda hacia el centro
  const world = (seat, p, k) => {
    if (p >= 56) { const c = rotN([6.55, 7], seat), off = [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]][k]; return [c[0] - 7 + off[0], c[1] - 7 + off[1]]; }
    const c = cellOf(seat, p, k); return [c[0] - 7, c[1] - 7];
  };

  /* =====================================================================
     MOTOR DEL JUEGO (igual para IA, mismo celular y en línea)
  ===================================================================== */
  const newGame = players => ({ players, pieces: players.map(() => [-1, -1, -1, -1]), turn: 0, dice: 0, phase: 'roll', sixes: 0, winner: -1, log: '¡Que empiece el juego!', mv: 0, last: null });
  const curP = G => G.players[G.turn];
  const movable = (G, pi, d) => G.pieces[pi].map((p, k) => (p < 0 ? d === 6 : p + d <= 56) ? k : -1).filter(k => k >= 0);
  const occupants = (G, abs) => { const out = []; G.players.forEach((pl, pi) => G.pieces[pi].forEach((p, k) => { if (absCell(pl.seat, p) === abs) out.push([pi, k]); })); return out; };
  function doRoll(G, forced) {
    if (G.phase !== 'roll') return false;
    G.dice = forced || 1 + Math.floor(Math.random() * 6); G.mv++;
    const pl = curP(G);
    if (G.dice === 6) G.sixes++; else G.sixes = 0;
    if (G.sixes >= 3) { G.log = `${pl.name} sacó tres 6 seguidos y pierde el turno.`; G.sixes = 0; nextTurn(G, true); G.phase = 'roll'; G.last = { kind: 'skip' }; return true; }
    const opts = movable(G, G.turn, G.dice);
    if (!opts.length) { G.log = `${pl.name} sacó ${G.dice} y no puede mover.`; G.last = { kind: 'nomove' }; nextTurn(G); return true; }
    G.phase = 'move'; G.log = `${pl.name} sacó ${G.dice}.`; G.last = { kind: 'roll' };
    return true;
  }
  function doMove(G, k) {
    if (G.phase !== 'move') return false;
    const pi = G.turn, pl = curP(G), d = G.dice, from = G.pieces[pi][k];
    if (!movable(G, pi, d).includes(k)) return false;
    const to = from < 0 ? 0 : from + d;
    G.pieces[pi][k] = to; G.mv++;
    let extra = d === 6, captured = [];
    const abs = absCell(pl.seat, to);
    if (abs >= 0 && !SAFE.has(abs)) occupants(G, abs).forEach(([oi, ok]) => { if (oi !== pi) { G.pieces[oi][ok] = -1; captured.push([oi, ok]); } });
    if (captured.length) extra = true;
    if (to === 56) extra = true;
    G.last = { kind: 'move', pi, k, from, to, captured };
    G.log = captured.length ? `¡${pl.name} atrapó una ficha de ${G.players[captured[0][0]].name}! Tira otra vez.` : to === 56 ? `¡Una ficha de ${pl.name} llegó a la meta!` : from < 0 ? `${pl.name} saca una ficha del patio.` : `${pl.name} avanza ${d}.`;
    if (G.pieces[pi].every(p => p === 56)) { G.winner = pi; G.phase = 'over'; G.log = `🏆 ¡${pl.name} gana la partida!`; return true; }
    if (extra) { G.phase = 'roll'; if (!captured.length && to !== 56) G.log += ' ¡Sacó 6, tira otra vez!'; }
    else nextTurn(G);
    return true;
  }
  function nextTurn(G, keepSixes) { G.turn = (G.turn + 1) % G.players.length; G.phase = 'roll'; if (!keepSixes) G.sixes = 0; else G.sixes = 0; }

  // IA: elige la mejor ficha
  function aiPick(G) {
    const pi = G.turn, seat = G.players[pi].seat, d = G.dice, opts = movable(G, pi, d);
    const danger = (absC) => { if (absC < 0 || SAFE.has(absC)) return 0; let n = 0; G.players.forEach((pl, oi) => { if (oi === pi) return; G.pieces[oi].forEach(p => { if (p < 0 || p > 50) return; const a = absCell(pl.seat, p); const dist = (absC - a + 52) % 52; if (dist >= 1 && dist <= 6) n++; }); }); return n; };
    let best = opts[0], bs = -1e9;
    opts.forEach(k => {
      const from = G.pieces[pi][k], to = from < 0 ? 0 : from + d, abs = absCell(seat, to);
      let s = to * .6;
      if (from < 0) s += 55;
      if (to === 56) s += 90; else if (to > 50) s += 45;
      if (abs >= 0 && !SAFE.has(abs) && occupants(G, abs).some(([oi]) => oi !== pi)) s += 110;
      if (abs >= 0 && SAFE.has(abs)) s += 20;
      s -= danger(abs) * 28; s += danger(absCell(seat, from)) * 18;
      s += Math.random() * 4;
      if (s > bs) { bs = s; best = k; }
    });
    return best;
  }

  /* =====================================================================
     DIBUJO 3D DEL TABLERO
  ===================================================================== */
  const hex = h => M3.hex(h);
  function build3D(L, canvas) {
    const R = M3.create(canvas, { maxDpr: 2 }); if (!R) return null;
    const G = M3.G, mat = R.mat;
    R.clear = [.03, .02, .06]; R.sky = [.3, .27, .4]; R.ground = [.1, .075, .06];
    R.light.dir = M3.norm([-.5, -1, -.6]); R.light.color = [1.0, .9, .76];
    R.fog = { color: [.04, .03, .08], density: .016 }; R.cam.fov = 40; R.cam.far = 200;
    R.pl[0] = { pos: [0, 7, 0], color: [.32, .22, .12], range: 11 };
    R.setShadow(V8.low() ? 0 : (window.innerWidth < 700 ? 1024 : 2048), [0, 0, 0], 9);
    if (typeof c3SkyGeo === 'function') R.add(R.node(R.mesh(c3SkyGeo([.02, .02, .07], [.22, .12, .3], [.04, .03, .06])), mat({ unlit: true, bg: true, fog: false, ds: true }), { cast: false, scl: [2, 2, 2] }));
    // mesa y base de madera
    R.add(R.node(R.mesh(G.plane(80, 80, 1, 1)), mat({ color: [.13, .08, .05], pat: 1, patS: .25, spec: .3, shin: 30 }), { pos: [0, -.62, 0], cast: false }));
    R.add(R.node(R.mesh(G.box(16.4, .5, 16.4)), mat({ color: [.38, .2, .09], pat: 1, patS: .8, spec: .9, shin: 90, env: .15 }), { pos: [0, -.3, 0] }));
    R.add(R.node(R.mesh(G.merge([[G.box(16.6, .16, .3), G.at(0, .02, 8.15)], [G.box(16.6, .16, .3), G.at(0, .02, -8.15)], [G.box(.3, .16, 16.6), G.at(8.15, .02, 0)], [G.box(.3, .16, 16.6), G.at(-8.15, .02, 0)]])), mat({ color: [.95, .74, .3], spec: 1.3, shin: 90 })));
    // casillas
    const parts = [], parch = hex('#e9dcbc'), tile = G.box(.92, .1, .92);
    const put = (c, col, h = .1, s = .92) => parts.push([s === .92 && h === .1 ? tile : G.box(s, h, s), G.at(c[0] - 7, h / 2, c[1] - 7), col]);
    PATH.forEach((c, i) => { const startSeat = [0, 13, 26, 39].indexOf(i); put(c, startSeat >= 0 ? hex(SEATS[startSeat].color) : parch); });
    [0, 1, 2, 3].forEach(s => {
      HOMECOL(s).forEach(c => put(c, hex(SEATS[s].light)));
      // patio
      const o = rotN([0, 0], s), corner = [[0, 0], [9, 0], [9, 9], [0, 9]][s];
      parts.push([G.box(5.9, .12, 5.9), G.at(corner[0] + 3 - 7.5 + .0, .06, corner[1] + 3 - 7.5), hex(SEATS[s].color)]);
      parts.push([G.box(4.2, .14, 4.2), G.at(corner[0] + 3 - 7.5, .08, corner[1] + 3 - 7.5), parch]);
      YARD(s).forEach(c => parts.push([G.cyl(.38, .42, .06, 20), G.at(c[0] - 7, .16, c[1] - 7), hex(SEATS[s].light)]));
      void o;
    });
    R.add(R.node(R.mesh(G.merge(parts)), mat({ color: [.92, .9, .88], spec: .75, shin: 110, env: .14, bump: 0 })));
    // centro: cuatro triángulos
    const tri = [[[-1.5, -1.5], [-1.5, 1.5], [0, 0]], [[-1.5, -1.5], [1.5, -1.5], [0, 0]], [[1.5, -1.5], [1.5, 1.5], [0, 0]], [[1.5, 1.5], [-1.5, 1.5], [0, 0]]];
    tri.forEach((t, s) => { const g = G.extrude(t.map(([x, y]) => [x, y]), .14); R.add(R.node(R.mesh(g), mat({ color: hex(SEATS[s].color), spec: .6, shin: 50 }), { pos: [0, .07, 0], rot: [Math.PI / 2, 0, 0] })); });
    R.add(R.node(R.mesh(G.cyl(0, .55, .9, 24)), mat({ color: [.98, .8, .32], spec: 1.4, shin: 100, em: [.08, .06, .02] }), { pos: [0, .14, 0] }));
    // estrellas seguras
    const star = []; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? .14 : .33; star.push([Math.cos(a) * r, Math.sin(a) * r]); }
    const starG = G.extrude(star, .05), starParts = [];
    [8, 21, 34, 47].forEach(i => { const c = PATH[i]; starParts.push([starG, M3.M.mul(G.at(c[0] - 7, .13, c[1] - 7), G.at(0, 0, 0, Math.PI / 2, 0, 0))]); });
    R.add(R.node(R.mesh(G.merge(starParts)), mat({ color: [.98, .78, .25], spec: 1.2, shin: 80 }), { cast: false }));
    // fichas: peones como los del ajedrez
    // figuras talladas: pedestal + animal de cada casa (mira hacia +z)
    const SEG = V8.low() ? 24 : 48;
    const ped = G.lathe([[0, 0], [.32, 0], [.335, .02], [.33, .05], [.3, .09], [.24, .12], [.2, .16], [.17, .22], [.155, .3], [.2, .33], [.215, .35], [.2, .37], [0, .37]], SEG);
    const lt = [1.35, 1.3, 1.25], dk = [.55, .55, .55];
    const FIG = {
      Gryffindor: G.merge([[ped], [G.sphere(.2, 32, 22), G.at(0, .62, 0, 0, 0, 0, 1, 1, .8)], [G.torus(.2, .085, 36, 14), G.at(0, .62, -.02, Math.PI / 2, 0, 0)], [G.sphere(.15, 28, 18), G.at(0, .62, .07), lt], [G.sphere(.075, 12, 10), G.at(0, .58, .2), lt], [G.sphere(.035, 8, 6), G.at(0, .6, .27), dk], [G.sphere(.06, 10, 8), G.at(-.13, .78, .02)], [G.sphere(.06, 10, 8), G.at(.13, .78, .02)], [G.sphere(.024, 8, 6), G.at(-.06, .68, .2), dk], [G.sphere(.024, 8, 6), G.at(.06, .68, .2), dk]]),
      Slytherin: G.merge([[ped], [G.torus(.17, .07, 36, 14), G.at(0, .45, 0)], [G.torus(.13, .062, 32, 12), G.at(0, .55, 0)], [G.torus(.09, .055, 28, 12), G.at(0, .64, 0)], [G.cyl(.05, .06, .2, 12), G.at(0, .66, .02)], [G.sphere(.1, 16, 12), G.at(0, .86, .06, 0, 0, 0, 1, .75, 1.35)], [G.sphere(.022, 8, 6), G.at(-.06, .9, .14), [2, 1.8, .4]], [G.sphere(.022, 8, 6), G.at(.06, .9, .14), [2, 1.8, .4]], [G.box(.015, .01, .1), G.at(0, .85, .24), [1.6, .3, .3]]]),
      Hufflepuff: G.merge([[ped], [G.sphere(.19, 30, 20), G.at(0, .55, 0, 0, 0, 0, 1, .85, 1.05)], [G.sphere(.15, 28, 18), G.at(0, .72, .1, 0, 0, 0, 1, .9, 1.3)], [G.box(.07, .05, .34), G.at(0, .82, .1), lt], [G.sphere(.05, 10, 8), G.at(0, .7, .3), dk], [G.sphere(.045, 10, 8), G.at(-.11, .82, .0)], [G.sphere(.045, 10, 8), G.at(.11, .82, .0)], [G.sphere(.022, 8, 6), G.at(-.07, .76, .22), dk], [G.sphere(.022, 8, 6), G.at(.07, .76, .22), dk]]),
      Ravenclaw: G.merge([[ped], [G.sphere(.15, 28, 20), G.at(0, .55, 0, 0, 0, 0, .9, 1.25, .9)], [G.box(.34, .05, .16), G.at(-.2, .66, -.03, 0, 0, .55)], [G.box(.34, .05, .16), G.at(.2, .66, -.03, 0, 0, -.55)], [G.box(.22, .04, .12), G.at(-.33, .78, -.04, 0, 0, .9)], [G.box(.22, .04, .12), G.at(.33, .78, -.04, 0, 0, -.9)], [G.sphere(.1, 24, 16), G.at(0, .78, .03), lt], [G.cyl(0, .045, .1, 10), G.at(0, .76, .12, Math.PI / 2, 0, 0), [1.6, 1.3, .4]], [G.sphere(.02, 8, 6), G.at(-.05, .81, .1), dk], [G.sphere(.02, 8, 6), G.at(.05, .81, .1), dk]])
    };
    const figM = {}; Object.keys(FIG).forEach(k => figM[k] = R.mesh(FIG[k]));
    const ringM = R.mesh(G.torus(.215, .022, SEG, 10)), goldM = mat({ color: [1, .78, .32], spec: 1.6, shin: 140, env: .7 });
    // velas reales en las esquinas de la mesa
    const candleG = R.mesh(G.cyl(.14, .17, 1.2, 16)), flameG = R.mesh(G.sphere(.11, 12, 8));
    const wax = mat({ color: [.95, .9, .78], spec: .2, em: [.14, .09, .03] }), fl = mat({ color: [1, .7, .25], unlit: true, add: true, op: .95, fog: false });
    L.flames = [[-8.9, -8.9], [8.9, -8.9], [8.9, 8.9], [-8.9, 8.9]].map(([x, z]) => { R.add(R.node(candleG, wax, { pos: [x, -.05, z] })); return R.add(R.node(flameG, fl, { pos: [x, 1.32, z], scl: [1, 1.9, 1], cast: false })); });
    R.pl[1] = { pos: [-8.9, 1.6, 8.9], color: [.9, .55, .25], range: 9 };
    L.p3 = []; L.mats = [];
    L.G.players.forEach((pl, pi) => {
      const sm = SEATS[pl.seat], m = mat({ color: hex(sm.color).map(v => Math.min(1, v * 1.1)), spec: .9, shin: 60, rim: .35, rimC: hex(sm.light) });
      L.mats[pi] = m;
      m.env = .35; m.spec = 1.3; m.shin = 130; m.rim = .22;
      L.p3[pi] = [0, 1, 2, 3].map(k => { const w = world(pl.seat, L.G.pieces[pi][k], k); const n = R.add(R.node(figM[sm.house] || figM.Gryffindor, m, { pos: [w[0], .12, w[1]], scl: [1.15, 1.15, 1.15] })); R.add(R.node(ringM, goldM, { pos: [0, .355, 0], cast: false }), n); if (window.M3ao) { const ao = M3ao(R); R.add(R.node(ao.mesh, ao.mat, { pos: [0, .01, 0], scl: [.8, 1, .8], cast: false }), n); } return n; });
    });
    return R;
  }
  function camFor(L) {
    const me = L.mySeat ?? 0, a = -Math.PI / 2 - me * Math.PI / 2; // el patio propio queda abajo a la izquierda
    L.az = L.az ?? a; L.el = L.el ?? 1.0; L.dist = L.dist ?? 23;
  }

  /* =====================================================================
     DIBUJO 2D (si no hay 3D o se elige «clásico»)
  ===================================================================== */
  function draw2D(L) {
    const cv = L.canvas, x = L.ctx, W = cv.clientWidth, dpr = Math.min(devicePixelRatio || 1, 2);
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(W * dpr); }
    x.setTransform(dpr, 0, 0, dpr, 0, 0); const c = W / 15; L.cell = c;
    const rotView = L.mySeat ? (4 - L.mySeat + 3) % 4 : 3; // gira para que tu patio quede abajo a la izquierda
    L.view = rotView;
    const T = ([cx, cy]) => { let p = [cx, cy]; for (let i = 0; i < rotView; i++) p = [14 - p[1], p[0]]; return p; };
    const Tf = ([cx, cy]) => { let p = [cx - 7.5, cy - 7.5]; for (let i = 0; i < rotView; i++) p = [-p[1], p[0]]; return [p[0] + 7.5, p[1] + 7.5]; };
    L.T2 = Tf;
    x.fillStyle = '#5b3418'; x.fillRect(0, 0, W, W);
    const sq = (cc, fill) => { const [px, py] = T(cc); x.fillStyle = fill; x.fillRect(px * c + 1, py * c + 1, c - 2, c - 2); };
    PATH.forEach((cc, i) => sq(cc, [0, 13, 26, 39].includes(i) ? SEATS[[0, 13, 26, 39].indexOf(i)].color : '#f1e4c4'));
    [0, 1, 2, 3].forEach(s => {
      HOMECOL(s).forEach(cc => sq(cc, SEATS[s].light));
      const corner = [[0, 0], [9, 0], [9, 9], [0, 9]][s];
      const p0 = Tf([corner[0] + .1, corner[1] + .1]), p1 = Tf([corner[0] + 5.9, corner[1] + 5.9]);
      const rx = Math.min(p0[0], p1[0]) * c, ry = Math.min(p0[1], p1[1]) * c, rw = Math.abs(p1[0] - p0[0]) * c;
      x.fillStyle = SEATS[s].color; x.fillRect(rx, ry, rw, rw); x.fillStyle = '#f1e4c4'; x.fillRect(rx + c * .8, ry + c * .8, rw - c * 1.6, rw - c * 1.6);
      YARD(s).forEach(cc => { const p = Tf([cc[0] + .5, cc[1] + .5]); x.fillStyle = SEATS[s].light; x.beginPath(); x.arc(p[0] * c, p[1] * c, c * .4, 0, 7); x.fill(); });
      const tri = [[[6, 6], [6, 9], [7.5, 7.5]], [[6, 6], [9, 6], [7.5, 7.5]], [[9, 6], [9, 9], [7.5, 7.5]], [[9, 9], [6, 9], [7.5, 7.5]]][s];
      x.fillStyle = SEATS[s].color; x.beginPath(); tri.forEach((pt, i) => { const p = Tf(pt); i ? x.lineTo(p[0] * c, p[1] * c) : x.moveTo(p[0] * c, p[1] * c); }); x.fill();
    });
    [8, 21, 34, 47].forEach(i => { const p = Tf([PATH[i][0] + .5, PATH[i][1] + .5]); x.font = `${c * .6}px serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('⭐', p[0] * c, p[1] * c); });
    // fichas
    L.screen = [];
    const anim = L.anim || {};
    L.G.players.forEach((pl, pi) => L.G.pieces[pi].forEach((p, k) => {
      let w = anim[pi + '-' + k] || world(pl.seat, p, k);
      const stack = L.G.pieces.flatMap((arr, oi) => arr.map((q, kk) => [oi, kk, q])).filter(([oi, kk, q]) => q >= 0 && q < 56 && (oi !== pi || kk !== k) && absOrHome(L.G, oi, q) === absOrHome(L.G, pi, p) && (oi * 4 + kk) < (pi * 4 + k)).length;
      const pc = Tf([w[0] + 7.5, w[1] + 7.5]), px = pc[0] * c + stack * c * .14, py = pc[1] * c - stack * c * .14;
      const mov = L.opts && L.G.turn === pi && L.opts.includes(k) && L.canAct;
      if (mov) { x.fillStyle = `rgba(255,236,150,${.4 + .3 * Math.sin(performance.now() / 160)})`; x.beginPath(); x.arc(px, py, c * .5, 0, 7); x.fill(); }
      const g = x.createRadialGradient(px - c * .1, py - c * .12, 1, px, py, c * .38); g.addColorStop(0, SEATS[pl.seat].light); g.addColorStop(1, SEATS[pl.seat].color);
      x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.arc(px + 2, py + 3, c * .36, 0, 7); x.fill();
      x.fillStyle = g; x.beginPath(); x.arc(px, py, c * .36, 0, 7); x.fill(); x.strokeStyle = '#fff8'; x.lineWidth = 1.5; x.stroke();
      x.font = `${c * .38}px serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(SEATS[pl.seat].emoji, px, py + 1);
      L.screen.push({ pi, k, x: px, y: py });
    }));
  }
  const absOrHome = (G, pi, p) => p <= 50 ? absCell(G.players[pi].seat, p) : 100 + pi * 10 + p;

  /* =====================================================================
     PARTIDA EN PANTALLA
  ===================================================================== */
  let L = null; // partida activa
  const NET = { ch: null, code: '', host: false, myId: (crypto.randomUUID ? crypto.randomUUID() : String(Math.random())), lobby: [], fillAI: false, started: false };

  function shell(body) { return `<div class="max-w-5xl mx-auto space-y-3 v8-ludo">
      <div class="flex justify-center gap-2 flex-wrap">${[['ia', '🤖 Contra la IA'], ['local', '👥 En este celular'], ['online', '🌐 En línea con amigos']].map(([m, l]) => `<button onclick="V8L.mode('${m}')" class="${(L && L.mode || V8L._mode) === m ? 'btn-gold' : 'btn-ghost'} !py-1.5 !px-3 !text-xs">${l}</button>`).join('')}</div>
      ${body}</div>`; }
  const input = 'w-full bg-stone-950 border border-amber-700/50 rounded-lg px-3 py-2 text-sm text-stone-200';
  function setupIA(local) {
    const n = V8L._n || 4;
    const names = V8L._names || [V8.name(), 'Mago 2', 'Mago 3', 'Mago 4'];
    return shell(`<div class="glass-card v8-ludobg rounded-3xl p-5 max-w-md mx-auto space-y-3 text-left">
      <p class="font-wizard font-bold text-lg text-amber-300">${local ? '👥 Varios jugadores en este celular' : '🤖 Contra la IA'}</p>
      <p class="text-xs text-stone-400">${local ? 'Se pasan el celular por turnos. Cada uno juega con una casa.' : 'Tú juegas con tu casa y la IA con las demás.'}</p>
      <div><p class="text-[11px] font-bold text-amber-300 mb-1">¿Cuántos jugadores?</p><div class="flex gap-2">${[2, 3, 4].map(k => `<button onclick="V8L._n=${k};V8L.mode('${local ? 'local' : 'ia'}')" class="${n === k ? 'btn-gold' : 'btn-ghost'} flex-1 !py-2">${k}</button>`).join('')}</div></div>
      ${local ? `<div class="space-y-2">${Array.from({ length: n }, (_, i) => `<label class="flex items-center gap-2"><span class="text-xl">${SEATS[seatsFor(n)[i]].emoji}</span><input id="lnm${i}" maxlength="14" class="${input}" value="${esc(names[i] || 'Mago ' + (i + 1))}"></label>`).join('')}</div>`
        : `<div><p class="text-[11px] font-bold text-amber-300 mb-1">Nivel de la IA</p><select id="laiLvl" class="${input}"><option value="1">Fácil</option><option value="2" selected>Normal</option><option value="3">Difícil</option><option value="4">Gran Mago</option></select></div>`}
      <button onclick="V8L.startLocal(${local})" class="btn-gold w-full"><i class="fa-solid fa-dice"></i> ¡Empezar!</button></div>`);
  }
  // asientos según cantidad: 2 = casas enfrentadas
  function seatsFor(n, prefer) {
    const base = n === 2 ? [0, 2] : n === 3 ? [0, 1, 2] : [0, 1, 2, 3];
    if (prefer != null && n === 2) return prefer % 2 === 0 ? [0, 2] : [1, 3];
    return base;
  }

  window.V8L = {
    _mode: 'ia',
    mode(m) {
      this._mode = m;
      if (L) endGame(true);
      if (m !== 'online') netLeave();
      const body = $('gameBody'); if (!body) return;
      if (m === 'online') body.innerHTML = shell(onlineHTML());
      else body.innerHTML = setupIA(m === 'local');
      sfx('tick');
    },
    startLocal(local) {
      const n = this._n || 4, mine = HOUSE_SEAT[S.house] ?? 0;
      const seats = local ? seatsFor(n) : (n === 2 ? [mine, (mine + 2) % 4] : Array.from({ length: n }, (_, i) => (mine + i) % 4));
      const lvl = local ? 2 : +(($('laiLvl') || {}).value || 2);
      const players = seats.map((seat, i) => local ? { seat, name: (($(`lnm${i}`) || {}).value || `Mago ${i + 1}`).trim().slice(0, 14) || `Mago ${i + 1}`, kind: 'human', id: 'local' + i }
        : i === 0 ? { seat, name: V8.name(), kind: 'human', id: NET.myId } : { seat, name: ['Draco', 'Luna', 'Cedric', 'Cho'][seat] + ' 🤖', kind: 'ai', lvl, id: 'ai' + i });
      if (local) this._names = players.map(p => p.name);
      startGame({ mode: local ? 'local' : 'ia', G: newGame(players), mySeat: local ? null : players[0].seat });
    },
    roll() { act('roll'); },
    move(k) { act('move', k); },
    emo(e) { if (!NET.ch) return; netSend({ t: 'emo', id: NET.myId, e }); showEmo(NET.myId, e); },
    gfx() { setGfx3d(!gfx3d()); if (L) { const st = { mode: L.mode, G: L.G, mySeat: L.mySeat }; teardown(); startGame(st, true); } },
    again() { if (!L) return; if (L.mode === 'online') { if (NET.host) netStart(); return; } const pl = L.G.players; startGame({ mode: L.mode, G: newGame(pl), mySeat: L.mySeat }); },
    exit() { endGame(true); netLeave(); this.mode(this._mode); },
    create: () => netCreate(), join: () => netJoin(), start: () => netStart(), leave: () => { netLeave(); V8L.mode('online'); },
    fill(v) { NET.fillAI = v; netLobby(); }
  };

  function startGame(st, keepView) {
    teardown();
    const body = $('gameBody');
    L = Object.assign({ canvas: null, R: null, anim: {}, opts: [], canAct: false, busy: false, tmr: 0, raf: 0 }, st);
    L.mode = st.mode; V8L._mode = st.mode === 'local' ? 'local' : st.mode;
    const use3d = gfx3d() && M3.supported();
    body.innerHTML = shell(`<div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3 items-start">
      <div class="relative rounded-2xl overflow-hidden border-2 border-amber-800/50 shadow-2xl shadow-black/70 mx-auto w-full" style="max-width:min(78vh,720px);aspect-ratio:1/1" id="ludoBoard">
        <canvas id="ludoCv" class="block w-full h-full" style="touch-action:none"></canvas>
        <div id="ludoEmo" class="absolute inset-x-0 top-2 flex justify-center pointer-events-none"></div>
        <span class="absolute bottom-2 left-2 text-[10px] text-amber-100/70 bg-black/40 rounded-full px-2 py-0.5 pointer-events-none">${use3d ? 'Arrastra para girar · toca una ficha que brille' : 'Toca una ficha que brille'}</span>
      </div>
      <div class="space-y-3">
        <div id="ludoPlayers" class="space-y-1.5"></div>
        <div class="glass-card rounded-2xl p-3 flex items-center gap-3">
          <div class="v8-dice-wrap"><div class="v8-dice" id="ludoDice">${[1, 2, 3, 4, 5, 6].map(n => `<div class="f f${n}">${pips(n)}</div>`).join('')}</div></div>
          <div class="flex-grow space-y-1.5"><button id="ludoRoll" onclick="V8L.roll()" class="btn-gold w-full"><i class="fa-solid fa-dice"></i> Lanzar dado</button><p id="ludoMsg" class="text-[11px] text-stone-300 leading-snug min-h-[2.2em]"></p></div>
        </div>
        ${st.mode === 'online' ? `<div class="v7-chips justify-center">${['👍', '😂', '😱', '😤', '🍀', '⚡', 'GG'].map(e => `<button onclick="V8L.emo('${e}')">${e}</button>`).join('')}</div>` : ''}
        <div class="flex gap-2 justify-center flex-wrap">${M3.supported() ? `<button onclick="V8L.gfx()" class="btn-ghost !py-1 !px-2.5 !text-[10px]"><i class="fa-solid ${use3d ? 'fa-image' : 'fa-cube'}"></i> ${use3d ? 'Gráficos clásicos' : 'Gráficos 3D'}</button>` : ''}<button onclick="V8L.exit()" class="btn-ghost !py-1 !px-2.5 !text-[10px]"><i class="fa-solid fa-arrow-left"></i> Salir</button></div>
      </div></div>`);
    L.canvas = $('ludoCv');
    if (use3d) { L.R = build3D(L, L.canvas); if (!L.R) { setGfx3d(false); } }
    if (!L.R) L.ctx = L.canvas.getContext('2d');
    camFor(L);
    bindInput();
    V8.started('ludo');
    renderUI();
    L.raf = requestAnimationFrame(loop);
    step();
  }
  function teardown() { if (!L) return; cancelAnimationFrame(L.raf); clearTimeout(L.tmr); if (L.R) L.R.dispose(); L = null; }
  function endGame() { teardown(); }
  V8.impl('ludo', { init: () => { V8L.mode(V8L._mode === 'online' && NET.ch ? 'online' : (V8L._mode || 'ia')); }, stop: () => { teardown(); netLeave(); }, best: b => b ? `Victorias: ${b}` : '', howto: ['Toca «Lanzar dado». Con 6 sacas una ficha del patio y vuelves a tirar.', 'Toca la ficha que brilla para moverla.', 'Si caes sobre una ficha rival, la mandas a su patio (menos en estrellas ⭐ y salidas).', 'Lleva tus 4 fichas al centro con el número exacto para ganar.'] });

  function pips(n) { const P = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] }[n]; return Array.from({ length: 9 }, (_, i) => `<i class="${P.includes(i + 1) ? 'on' : ''}"></i>`).join(''); }
  const FACE = { 1: [0, 0], 2: [0, -90], 3: [-90, 0], 4: [90, 0], 5: [0, 90], 6: [0, 180] };
  function showDice(n, spin) {
    const d = $('ludoDice'); if (!d || !n) return;
    const [rx, ry] = FACE[n], extra = spin ? 720 : 0;
    d.style.transition = spin && !V8.reduced() ? 'transform .9s cubic-bezier(.2,.8,.25,1)' : 'none';
    if (spin && !V8.reduced()) { const w = d.parentElement; w.classList.remove('v9-throw'); void w.offsetWidth; w.classList.add('v9-throw'); if (window.V9 && V9.buzz) V9.buzz([20, 40, 20]); }
    d.style.transform = `rotateX(${rx + extra}deg) rotateY(${ry + extra}deg)`;
  }

  /* ---------- quién puede actuar en este dispositivo ---------- */
  function myTurn() {
    if (!L || L.G.phase === 'over') return false;
    const p = curP(L.G);
    if (L.mode === 'online') return p.id === NET.myId;
    return p.kind === 'human';
  }
  function act(kind, k) {
    if (!L || L.busy || !myTurn()) return;
    if (L.mode === 'online' && !NET.host) { netSend({ t: kind, id: NET.myId, k, mv: L.G.mv }); L.canAct = false; renderUI(); return; }
    apply(kind, k);
  }
  // aplica una acción en el motor (modo local o anfitrión en línea)
  function apply(kind, k) {
    const G = L.G, prev = JSON.parse(JSON.stringify(G));
    const ok = kind === 'roll' ? doRoll(G) : doMove(G, k);
    if (!ok) return;
    commit(prev);
  }
  function commit(prev) {
    if (L.mode === 'online' && NET.host) netSend({ t: 'state', g: L.G });
    onState(prev);
  }
  // reacciona a un cambio de estado (animaciones, sonidos y siguiente paso)
  function onState(prev) {
    const G = L.G, last = G.last || {};
    clearTimeout(L.tmr);
    if (last.kind === 'roll' || last.kind === 'nomove' || last.kind === 'skip') { showDice(G.dice, true); sfx('tick'); setTimeout(() => sfx('spell'), 500); }
    let wait = 0;
    if (last.kind === 'move' && prev) { wait = animateMove(prev, last); }
    if (last.kind === 'nomove' || last.kind === 'skip') wait = 1100;
    if (last.kind === 'roll') wait = 750;
    L.busy = true; renderUI();
    L.tmr = setTimeout(() => { L.busy = false; if (G.phase === 'over') return finish(); step(); }, wait);
  }
  function animateMove(prev, m) {
    const pl = L.G.players[m.pi], seat = pl.seat, from = m.from, to = m.to;
    const steps = []; if (from < 0) steps.push(0); else for (let p = from + 1; p <= to; p++) steps.push(p);
    const key = m.pi + '-' + m.k, dur = 170;
    let i = 0, start = world(seat, from, m.k);
    const hop = () => {
      if (!L) return;
      if (i >= steps.length) { delete L.anim[key]; L.anim3 = null; if (m.captured.length) { sfx('zap'); m.captured.forEach(([oi, ok]) => burstAt(oi, ok)); V8.emit('ludoCapture', {}); } if (to === 56) { sfx('levelup'); burstAt(m.pi, m.k); } if (L.R && L.R.shadow) L.R.shadow.dirty = true; return; }
      const end = world(seat, steps[i], m.k), t0 = performance.now(), s0 = start;
      L.hop = { key, s0, end, t0, dur }; sfx('tick');
      setTimeout(() => { start = end; i++; hop(); }, dur);
    };
    hop();
    return steps.length * dur + 380;
  }
  function burstAt(pi, k) {
    try {
      const w = world(L.G.players[pi].seat, L.G.pieces[pi][k], k), r = $('ludoCv').getBoundingClientRect();
      let sx, sy; if (L.R) { const p = L.R.project([w[0], .5, w[1]]); sx = p.x; sy = p.y; } else { const pc = L.T2([w[0] + 7.5, w[1] + 7.5]); sx = pc[0] * L.cell; sy = pc[1] * L.cell; }
      burst(r.left + sx, r.top + sy, SEATS[L.G.players[pi].seat].light, 40);
    } catch (e) {}
  }

  // siguiente paso: IA, movimiento automático o esperar al jugador
  function step() {
    if (!L) return;
    const G = L.G; L.opts = G.phase === 'move' ? movable(G, G.turn, G.dice) : [];
    L.canAct = myTurn();
    renderUI();
    if (G.phase === 'over') return;
    const p = curP(G), driver = L.mode !== 'online' || NET.host;
    if (!driver) return;
    if (p.kind === 'ai') {
      L.tmr = setTimeout(() => { if (!L) return; if (G.phase === 'roll') apply('roll'); else apply('move', aiChoose(G, p.lvl || 2)); }, G.phase === 'roll' ? 700 : 500);
      return;
    }
    // humano: si solo hay una ficha posible, se mueve sola
    if (G.phase === 'move' && L.opts.length === 1 && (L.mode !== 'online' || p.id === NET.myId)) L.tmr = setTimeout(() => { if (L && L.G.phase === 'move') apply('move', L.opts[0]); }, 650);
    // en línea: si alguien no juega en 25 s, se juega solo
    if (L.mode === 'online' && p.id !== NET.myId) L.tmr = setTimeout(() => { if (!L || L.G.phase === 'over') return; if (L.G.phase === 'roll') apply('roll'); else apply('move', aiPick(L.G)); }, 25000);
  }
  function aiChoose(G, lvl) { const opts = movable(G, G.turn, G.dice); if (lvl === 1 && Math.random() < .5) return V8.pick(opts); if (lvl === 2 && Math.random() < .15) return V8.pick(opts); if (lvl >= 4) return aiPick4(G); return aiPick(G); }
  // Gran Mago: prueba cada jugada y mira cuántas de sus fichas quedarían a tiro de un rival
  function aiPick4(G) {
    const pi = G.turn, seat = G.players[pi].seat, d = G.dice, opts = movable(G, pi, d), base = aiPick(G);
    const threat = pieces => { let t = 0; pieces.forEach(p => { if (p < 0 || p > 50) return; const a = absCell(seat, p); if (SAFE.has(a)) return; G.players.forEach((pl, oi) => { if (oi === pi) return; G.pieces[oi].forEach(q => { if (q < 0 || q > 50) return; const b = absCell(pl.seat, q), dist = (a - b + 52) % 52; if (dist >= 1 && dist <= 6) t += 1; }); }); }); return t; };
    let best = base, bs = -1e9;
    opts.forEach(k => { const from = G.pieces[pi][k], to = from < 0 ? 0 : from + d, after = G.pieces[pi].slice(); after[k] = to; const abs = absCell(seat, to);
      let sc = (k === base ? 40 : 0) - threat(after) * 35 + to * .5 + (to === 56 ? 120 : 0) + (abs >= 0 && !SAFE.has(abs) && occupants(G, abs).some(([oi]) => oi !== pi) ? 150 : 0);
      if (sc > bs) { bs = sc; best = k; } });
    return best;
  }

  function finish() {
    const G = L.G, w = G.players[G.winner];
    renderUI();
    const iWon = L.mode === 'online' ? w.id === NET.myId : L.mode === 'ia' ? w.kind === 'human' : true;
    if (iWon && L.mode !== 'local') { addPoints(L.mode === 'online' ? 60 : 40); const s = V8.st(); s.best.ludo = (s.best.ludo || 0) + 1; save(); refreshBest(); V8.emit('ludoWin', { online: L.mode === 'online' }); fireConfetti({ particleCount: 160, spread: 110 }); sfx('levelup'); }
    else if (L.mode === 'local') { fireConfetti({ particleCount: 120, spread: 100 }); sfx('levelup'); }
    else { sfx('wrong'); addXp(5); }
    V8.emit('ludoPlayed', {});
    const canAgain = L.mode !== 'online' || NET.host;
    showDialog({ icon: SEATS[w.seat].emoji, title: `¡${esc(w.name)} gana el Ludo!`, body: iWon && L.mode !== 'local' ? `+${L.mode === 'online' ? 60 : 40} puntos para tu casa.` : L.mode === 'local' ? `¡Felicitaciones, ${esc(w.name)}!` : 'Esta vez no fue. ¡La revancha te espera!',
      actions: [canAgain ? { label: '🔁 Otra partida', primary: true, onClick: () => V8L.again() } : { label: 'Esperar revancha', primary: true }, { label: 'Salir', onClick: () => V8L.exit() }] });
  }

  /* ---------- interfaz lateral ---------- */
  function renderUI() {
    if (!L) return;
    const G = L.G, box = $('ludoPlayers'); if (!box) return;
    box.innerHTML = G.players.map((p, i) => {
      const home = G.pieces[i].filter(q => q === 56).length, out = G.pieces[i].filter(q => q >= 0 && q < 56).length, sm = SEATS[p.seat];
      return `<div class="v8-lplayer ${G.turn === i && G.phase !== 'over' ? 'on' : ''}" style="--c:${sm.color}" data-pid="${esc(p.id)}"><span class="e">${sm.emoji}</span><span class="min-w-0 flex-grow"><b class="truncate block">${esc(p.name)}${(L.mode === 'online' && p.id === NET.myId) || (L.mode === 'ia' && p.kind === 'human') ? ' (tú)' : ''}</b><small>${sm.house} · ${'●'.repeat(home)}${'◐'.repeat(out)}${'○'.repeat(4 - home - out)}</small></span>${G.winner === i ? '🏆' : ''}</div>`;
    }).join('');
    const btn = $('ludoRoll'), msg = $('ludoMsg'), p = curP(G);
    const can = L.canAct && !L.busy;
    btn.disabled = !(can && G.phase === 'roll');
    btn.innerHTML = G.phase === 'over' ? '🏆 Terminó' : can && G.phase === 'roll' ? `<i class="fa-solid fa-dice"></i> Lanzar dado` : G.phase === 'move' && can ? '👆 Elige una ficha' : `<i class="fa-solid fa-hourglass-half"></i> Turno de ${esc(p.name)}`;
    msg.textContent = G.log;
    if (G.dice) showDice(G.dice, false);
  }

  /* ---------- toques sobre el tablero ---------- */
  function bindInput() {
    const cv = L.canvas; let drag = null;
    cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, az: L.az, el: L.el, moved: false }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (!drag || !L.R) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.hypot(dx, dy) > 6) drag.moved = true; L.az = drag.az - dx * .008; L.el = V8.clamp(drag.el + dy * .006, .45, 1.45); });
    cv.addEventListener('pointerup', e => { const d = drag; drag = null; if (d && d.moved) return; tap(e); });
    cv.addEventListener('wheel', e => { if (!L.R) return; e.preventDefault(); L.dist = V8.clamp(L.dist + e.deltaY * .01, 12, 28); }, { passive: false });
  }
  function tap(e) {
    if (!L || !L.canAct || L.busy || L.G.phase !== 'move') { if (L && L.canAct && L.G.phase === 'roll') V8L.roll(); return; }
    const r = L.canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    let best = -1, bd = 1e9;
    L.opts.forEach(k => {
      const pos = piecePos(L.G.turn, k); let sx, sy;
      if (L.R) { const p = L.R.project([pos[0], .5, pos[1]]); sx = p.x; sy = p.y; } else { const s = (L.screen || []).find(q => q.pi === L.G.turn && q.k === k); if (!s) return; sx = s.x; sy = s.y; }
      const d = Math.hypot(sx - px, sy - py); if (d < bd) { bd = d; best = k; }
    });
    if (best >= 0 && bd < Math.max(48, r.width / 9)) V8L.move(best);
    else if (L.opts.length) toast('Toca una de las fichas que brillan.', '👆');
  }
  function piecePos(pi, k) {
    const key = pi + '-' + k;
    if (L.hop && L.hop.key === key) { const h = L.hop, t = V8.clamp((performance.now() - h.t0) / h.dur, 0, 1); return [h.s0[0] + (h.end[0] - h.s0[0]) * t, h.s0[1] + (h.end[1] - h.s0[1]) * t, Math.sin(t * Math.PI) * .7]; }
    const p = L.G.pieces[pi][k], w = world(L.G.players[pi].seat, p, k);
    // fichas en la misma casilla: se apilan un poco
    if (p >= 0 && p < 56) { const id = absOrHome(L.G, pi, p); let n = 0; L.G.pieces.forEach((arr, oi) => arr.forEach((q, kk) => { if ((oi * 4 + kk) < (pi * 4 + k) && q >= 0 && q < 56 && absOrHome(L.G, oi, q) === id) n++; })); if (n) return [w[0] + n * .16, w[1] - n * .16, n * .12]; }
    return [w[0], w[1], 0];
  }

  /* ---------- bucle de dibujo ---------- */
  function loop(now) {
    if (!L) return; L.raf = requestAnimationFrame(loop);
    if (document.hidden || !L.canvas.isConnected) return;
    if (L.hop && performance.now() - L.hop.t0 > L.hop.dur + 40) L.hop = null;
    if (!L.R) { if (L.hop) { const h = L.hop, t = V8.clamp((performance.now() - h.t0) / h.dur, 0, 1); L.anim[h.key] = [h.s0[0] + (h.end[0] - h.s0[0]) * t, h.s0[1] + (h.end[1] - h.s0[1]) * t]; } draw2D(L); return; }
    const R = L.R; R.tick(now); { const cw = L.canvas.clientWidth, ch = L.canvas.clientHeight; if (Math.abs(cw - R.w) > 1 || Math.abs(ch - R.h) > 1) R.resize(); }
    const d = L.dist, el = L.el, az = L.az;
    R.cam.pos = [Math.sin(az) * Math.cos(el) * d, Math.sin(el) * d, Math.cos(az) * Math.cos(el) * d]; R.cam.target = [0, 0, 0];
    const pts = [], t = now / 1000;
    L.G.players.forEach((pl, pi) => L.p3[pi].forEach((n, k) => {
      const p = piecePos(pi, k); n.pos = [p[0], .12 + p[2], p[1]]; n.rot = [0, Math.atan2(R.cam.pos[0] - p[0], R.cam.pos[2] - p[1]), 0];
      const mov = L.canAct && !L.busy && L.G.turn === pi && L.opts.includes(k);
      if (mov) pts.push({ p: [p[0], .25, p[1]], c: [1, .9, .5, .45 + .35 * Math.sin(t * 6)], s: .9 }, { p: [p[0], 1.05 + Math.sin(t * 5) * .08, p[1]], c: [1, .95, .7, .9], s: .22 });
    }));
    L.mats.forEach((m, pi) => { m.em = L.G.turn === pi && L.G.phase !== 'over' ? [.05 + .04 * Math.sin(t * 4), .04, .02] : [0, 0, 0]; });
    if (L.hop && R.shadow) R.shadow.dirty = true;
    if (L.flames) { L.flames.forEach((f, i) => { const k = 1 + Math.sin(t * 9 + i * 2) * .08 + Math.sin(t * 23 + i) * .05; f.scl = [k, 1.9 * k, k]; }); R.pl[1].color = [.9 * (1 + Math.sin(t * 11) * .08), .55, .25]; R.pl[0].color = [.6 + Math.sin(t * 7) * .04, .45, .25]; }
    // velas flotantes alrededor
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * .05, rr = 10.5; pts.push({ p: [Math.cos(a) * rr, 3.2 + Math.sin(t + i) * .3, Math.sin(a) * rr], c: [1, .7, .3, .8], s: .35 }, { p: [Math.cos(a) * rr, 3.2 + Math.sin(t + i) * .3, Math.sin(a) * rr], c: [1, .55, .2, .15], s: 1.6 }); }
    R.render(pts);
  }


  /* =====================================================================
     EN LÍNEA: sala con código para 2 a 4 jugadores
  ===================================================================== */
  function onlineHTML() {
    if (NET.ch) return lobbyHTML();
    return `<div class="glass-card v8-ludobg rounded-3xl p-5 space-y-3 max-w-md mx-auto text-left">
      <p class="font-wizard font-bold text-lg text-amber-300">🌐 Ludo en línea</p>
      <p class="text-xs text-stone-400">Juega con 1, 2 o 3 amigos desde sus celulares. Uno crea la sala y les pasa el código. Pueden empezar desde 2 jugadores.</p>
      <label class="block text-[11px] text-stone-400">Tu nombre de mago<input id="lnName" maxlength="14" class="${input} mt-1" value="${esc(V8.name())}"></label>
      <button onclick="V8L.create()" class="btn-gold w-full"><i class="fa-solid fa-wand-sparkles"></i> Crear sala</button>
      <div class="flex items-center gap-2 text-[11px] text-stone-500"><span class="flex-grow h-px bg-stone-700"></span>o únete con un código<span class="flex-grow h-px bg-stone-700"></span></div>
      <div class="flex gap-2"><input id="lnCode" maxlength="4" placeholder="CÓDIGO" class="${input} w-24 flex-grow uppercase tracking-[.3em] text-center font-bold !text-amber-200" oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9]/g,'')"><button onclick="V8L.join()" class="btn-ghost">Unirme</button></div>
      <p id="lnStatus" class="text-center text-sm text-stone-300"></p></div>`;
  }
  function lobbyHTML() {
    const pl = NET.lobby;
    return `<div class="glass-card rounded-3xl p-5 space-y-3 max-w-md mx-auto text-left">
      <p class="font-wizard font-bold text-lg text-amber-300 text-center">Sala <span class="tracking-[.3em]">${NET.code}</span></p>
      ${NET.host ? `<div class="flex gap-2 justify-center"><button onclick="V8.ludoShare()" class="btn-gold !py-1.5 !text-xs"><i class="fa-brands fa-whatsapp"></i> Invitar</button><button onclick="navigator.clipboard&&navigator.clipboard.writeText('${NET.code}');toast('Código copiado','📋')" class="btn-ghost !py-1.5 !text-xs">Copiar código</button></div>` : ''}
      <div class="space-y-1.5">${[0, 1, 2, 3].map(i => { const p = pl[i]; return p ? `<div class="v8-lplayer" style="--c:${SEATS[p.seat].color}"><span class="e">${SEATS[p.seat].emoji}</span><b class="flex-grow truncate">${esc(p.name)}${p.id === NET.myId ? ' (tú)' : ''}${i === 0 ? ' 👑' : ''}</b><small>${SEATS[p.seat].house}</small></div>` : `<div class="v8-lplayer empty"><span class="e">⏳</span><span class="flex-grow text-stone-500">${NET.host && NET.fillAI ? 'Puesto libre: lo jugará la IA' : 'Puesto libre'}</span></div>`; }).join('')}</div>
      ${NET.host ? `<label class="flex items-center gap-2 text-xs text-stone-300"><input type="checkbox" ${NET.fillAI ? 'checked' : ''} onchange="V8L.fill(this.checked)"> Completar los puestos libres con la IA (4 jugadores)</label>
        <button onclick="V8L.start()" class="btn-gold w-full" ${pl.length < 2 && !NET.fillAI ? 'disabled' : ''}><i class="fa-solid fa-dice"></i> Empezar (${pl.length} ${pl.length === 1 ? 'jugador' : 'jugadores'})</button>
        <p class="text-[10px] text-stone-500 text-center">Pueden jugar 2, 3 o 4. No hace falta esperar a 4.</p>`
        : '<p class="text-center text-xs text-stone-400"><i class="fa-solid fa-hourglass-half"></i> Esperando a que el anfitrión empiece…</p>'}
      <button onclick="V8L.leave()" class="btn-ghost w-full !text-xs">Salir de la sala</button></div>`;
  }
  V8.ludoUrl = () => `${(CONFIG.SITE_URL || (location.origin + location.pathname)).replace(/\?.*$/, '')}?ludo=${NET.code}`;
  V8.ludoShare = () => {
    const url = `${(CONFIG.SITE_URL || (location.origin + location.pathname)).replace(/\?.*$/, '')}?ludo=${NET.code}`, txt = `🎲 ¡Juguemos Ludo Mágico en Hogwarts! Entra aquí (sala ${NET.code}):`;
    if (navigator.share) navigator.share({ title: 'Ludo Mágico', text: txt, url }).catch(() => {}); else window.open('https://wa.me/?text=' + encodeURIComponent(txt + ' ' + url), '_blank');
  };
  const status = h => { const el = $('lnStatus'); if (el) el.innerHTML = h; };
  function lobbyRefresh() { if (!L && V8L._mode === 'online' && activeGame === 'ludo') { const b = $('gameBody'); if (b) b.innerHTML = shell(onlineHTML()); } }
  function netName() { const n = (($('lnName') || {}).value || V8.name()).trim().slice(0, 14); if (!n) { toast('Escribe tu nombre de mago', '✍️'); return null; } return n; }
  function netCreate() { const me = netName(); if (!me) return; const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; netConnect(Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''), true, me); }
  function netJoin() { const me = netName(); if (!me) return; const code = (($('lnCode') || {}).value || '').trim().toUpperCase(); if (code.length !== 4) { toast('El código tiene 4 caracteres', '🔑'); return; } netConnect(code, false, me); }
  async function netConnect(code, host, me) {
    if (!supaReady()) { showDialog({ icon: '🌐', title: 'Juego en línea sin conectar', body: SETUP_HTML }); return; }
    status('<i class="fa-solid fa-spinner fa-spin"></i> Conectando…');
    let client; try { client = await loadSupabase(); } catch (e) { status('<span class="text-red-300">No se pudo conectar. Revisa tu internet.</span>'); return; }
    await netLeave(true);
    Object.assign(NET, { code, host, me, lobby: host ? [{ id: NET.myId, name: me, seat: HOUSE_SEAT[S.house] ?? 0 }] : [], started: false, hostId: host ? NET.myId : null });
    const ch = client.channel('ludo-' + code, { config: { broadcast: { self: false }, presence: { key: NET.myId } } });
    NET.ch = ch;
    ch.on('broadcast', { event: 'm' }, ({ payload }) => netMsg(payload));
    ch.on('presence', { event: 'leave' }, () => setTimeout(() => netPresence(ch), 300));
    ch.subscribe(async st => {
      if (st === 'SUBSCRIBED') {
        await ch.track({ name: me });
        if (host) lobbyRefresh();
        else { netSend({ t: 'hi', id: NET.myId, name: me, house: S.house }); status(`Entrando a la sala <b class="text-amber-300">${code}</b>…`); setTimeout(() => { if (NET.ch === ch && !NET.lobby.length) status('<span class="text-amber-200">Nadie respondió en esa sala.</span> Revisa el código.'); }, 6000); }
      } else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') status('<span class="text-red-300">No se pudo abrir la sala. Revisa que Realtime esté activo en Supabase.</span>');
    });
  }
  function netSend(p) { if (NET.ch) NET.ch.send({ type: 'broadcast', event: 'm', payload: p }); }
  async function netLeave(silent) {
    if (NET.ch) { try { if (!silent) netSend({ t: 'bye', id: NET.myId }); await NET.ch.unsubscribe(); if (sb) sb.removeChannel(NET.ch); } catch (e) {} }
    NET.ch = null; NET.lobby = []; NET.started = false;
  }
  function netLobby() { if (!NET.host) return; netSend({ t: 'lobby', players: NET.lobby, fill: NET.fillAI }); lobbyRefresh(); }
  function pickSeat(house) { const used = NET.lobby.map(p => p.seat), pref = HOUSE_SEAT[house]; if (pref != null && !used.includes(pref)) return pref; return [0, 2, 1, 3].find(s => !used.includes(s)); }
  function netMsg(m) {
    if (!m || !m.t) return;
    if (m.t === 'state' && document.hidden) setTimeout(() => { try { const G = L && L.G, p = G && G.players[G.turn]; if (p && p.id === NET.myId && G.phase !== 'over' && Date.now() - (NET._nt || 0) > 30000) { NET._nt = Date.now(); V8.notify && V8.notify('🎲 ¡Te toca en el Ludo!', 'Tus amigos esperan tu jugada.'); } } catch (e) {} }, 80);
    if (m.t === 'hi' && NET.host) {
      if (NET.started || NET.lobby.length >= 4) { netSend({ t: 'full', to: m.id }); return; }
      if (!NET.lobby.find(p => p.id === m.id)) NET.lobby.push({ id: m.id, name: String(m.name || 'Mago').slice(0, 14), seat: pickSeat(m.house) });
      sfx('spell'); toast(`${esc(m.name)} entró a la sala`, '🎲'); netLobby(); return;
    }
    if (m.t === 'full' && m.to === NET.myId) { status('<span class="text-red-300">Esa sala está llena o ya empezó.</span>'); netLeave(true); return; }
    if (m.t === 'lobby' && !NET.host) { NET.lobby = m.players; NET.fillAI = m.fill; NET.hostId = m.players[0] && m.players[0].id; lobbyRefresh(); return; }
    if (m.t === 'state' && !NET.host) {
      const prev = L ? L.G : null;
      if (!L || L.mode !== 'online') { NET.started = true; startGame({ mode: 'online', G: m.g, mySeat: (m.g.players.find(p => p.id === NET.myId) || {}).seat }); return; }
      if (m.g.mv < L.G.mv) return;
      const newer = m.g.mv !== L.G.mv || m.g.turn !== L.G.turn || m.g.players.length !== L.G.players.length;
      L.G = m.g; if (newer) onState(prev); else step();
      return;
    }
    if ((m.t === 'roll' || m.t === 'move') && NET.host && L && L.mode === 'online') { const p = curP(L.G); if (p.id !== m.id || L.busy) return; apply(m.t, m.k); return; }
    if (m.t === 'emo') { showEmo(m.id, String(m.e).slice(0, 4)); return; }
    if (m.t === 'bye') { setTimeout(() => netPresence(NET.ch, m.id), 50); return; }
  }
  function netStart() {
    if (!NET.host) return;
    const players = NET.lobby.map(p => ({ seat: p.seat, name: p.name, kind: 'human', id: p.id }));
    if (NET.fillAI) [0, 1, 2, 3].filter(s => !players.some(p => p.seat === s)).forEach(s => players.push({ seat: s, name: ['Draco', 'Luna', 'Cedric', 'Cho'][s] + ' 🤖', kind: 'ai', lvl: 2, id: 'ai' + s }));
    if (players.length < 2) { toast('Se necesitan al menos 2 jugadores.', '🎲'); return; }
    players.sort((a, b) => a.seat - b.seat);
    NET.started = true;
    const G = newGame(players);
    startGame({ mode: 'online', G, mySeat: players.find(p => p.id === NET.myId).seat });
    netSend({ t: 'state', g: G });
  }
  // alguien se fue: si es un jugador, lo reemplaza la IA; si es el anfitrión, termina
  function netPresence(ch, goneId) {
    if (!NET.ch || ch !== NET.ch) return;
    const here = Object.keys(ch.presenceState()), gone = id => id !== NET.myId && (goneId === id || !here.includes(id));
    if (!NET.started) {
      if (NET.host) { const before = NET.lobby.length; NET.lobby = NET.lobby.filter(p => !gone(p.id)); if (NET.lobby.length !== before) netLobby(); }
      else if (NET.hostId && gone(NET.hostId)) { toast('El anfitrión cerró la sala.', '🚪'); netLeave(true); lobbyRefresh(); }
      return;
    }
    if (!L) return;
    if (NET.host) {
      let changed = false; L.G.players.forEach(p => { if (p.kind === 'human' && gone(p.id)) { p.kind = 'ai'; p.lvl = 2; p.name = p.name.replace(/ 🤖$/, '') + ' 🤖'; changed = true; toast(`${esc(p.name)} salió; ahora juega la IA.`, '🤖'); } });
      if (changed) { L.G.mv++; netSend({ t: 'state', g: L.G }); step(); }
    } else if (NET.hostId && gone(NET.hostId)) { showDialog({ icon: '🔌', title: 'El anfitrión salió', body: 'La partida terminó porque se fue quien creó la sala.', actions: [{ label: 'Aceptar', primary: true, onClick: () => V8L.exit() }] }); netLeave(true); }
  }
  function showEmo(id, e) {
    const p = L && L.G.players.find(q => q.id === id); const box = $('ludoEmo'); if (!box) return;
    const el = document.createElement('div'); el.className = 'v8-emo'; el.innerHTML = `${p ? SEATS[p.seat].emoji + ' ' : ''}${esc(e)}`; box.appendChild(el); setTimeout(() => el.remove(), 2200); sfx('tick');
  }
  window.addEventListener('pagehide', () => { if (NET.ch) try { NET.ch.send({ type: 'broadcast', event: 'm', payload: { t: 'bye', id: NET.myId } }); } catch (e) {} });
  // enlace ?ludo=CODIGO abre la sala
  try {
    const code = (new URLSearchParams(location.search).get('ludo') || '').toUpperCase();
    if (/^[A-Z0-9]{4}$/.test(code)) {
      history.replaceState(null, '', location.pathname);
      const go = () => { if (!S.house || (V8.signed && !V8.signed() && window.V7 && V7.guardPlay)) { setTimeout(go, 1500); return; } switchTab('games'); openGame('ludo'); setTimeout(() => { V8L.mode('online'); const c = $('lnCode'); if (c) { c.value = code; setTimeout(() => V8L.join(), 300); } }, 500); };
      setTimeout(go, 1500);
    }
  } catch (e) {}

  // para las pruebas automáticas
  V8.ludoEngine = { newGame, doRoll, doMove, movable, aiPick, PATH, HOMECOL, absCell, SAFE };
})();
