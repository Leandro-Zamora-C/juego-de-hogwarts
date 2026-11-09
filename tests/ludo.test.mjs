// Prueba del motor del Ludo: el recorrido y 300 partidas completas con la IA.
import fs from 'fs';
const src = fs.readFileSync(new URL('../js/v8-ludo.js', import.meta.url), 'utf8');
const g = { V8: { impl() {}, st: () => ({ best: {} }), reg() {} }, M3: { supported: () => false }, location: { search: '' }, crypto: {}, S: {} };
g.window = g; g.addEventListener = () => {}; g.esc = s => s; g.history = { replaceState() {} }; g.URLSearchParams = URLSearchParams;
new Function(...Object.keys(g), src)(...Object.values(g));
const E = g.V8.ludoEngine; let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FALLA:', m); } };
ok(E.PATH.length === 52, 'el recorrido tiene 52 casillas');
ok(new Set(E.PATH.map(String)).size === 52, 'casillas sin repetir');
for (let i = 0; i < 52; i++) { const a = E.PATH[i], b = E.PATH[(i + 1) % 52]; ok(Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) <= 2, 'casillas vecinas ' + i); }
for (let s = 0; s < 4; s++) { const last = E.PATH[E.absCell(s, 50)], hc = E.HOMECOL(s)[0]; ok(Math.abs(last[0] - hc[0]) + Math.abs(last[1] - hc[1]) === 1, 'entrada a la recta final ' + s); }
for (const n of [2, 3, 4]) for (let t = 0; t < 100; t++) {
  const seats = n === 2 ? [0, 2] : n === 3 ? [0, 1, 2] : [0, 1, 2, 3];
  const G = E.newGame(seats.map((seat, i) => ({ seat, name: 'J' + i, kind: 'ai' })));
  let guard = 0;
  while (G.phase !== 'over' && guard++ < 20000) { if (G.phase === 'roll') E.doRoll(G); else E.doMove(G, E.aiPick(G)); }
  ok(G.phase === 'over', `partida de ${n} termina`);
  ok(G.pieces[G.winner].every(p => p === 56), 'el ganador tiene las 4 fichas en la meta');
  ok(G.pieces.flat().every(p => p >= -1 && p <= 56), 'posiciones válidas');
}
// modos de juego estilo Ludo Club
for (const mode of ['rapido', 'maestro', 'equipos']) for (let t = 0; t < 100; t++) {
  const n = mode === 'equipos' ? 4 : [2, 3, 4][t % 3], seats = n === 2 ? [0, 2] : n === 3 ? [0, 1, 2] : [0, 1, 2, 3];
  const G = E.newGame(seats.map((seat, i) => ({ seat, name: 'J' + i, kind: 'ai' })), { mode });
  let guard = 0, enteredBeforeKill = false;
  while (G.phase !== 'over' && guard++ < 40000) {
    if (G.phase === 'roll') E.doRoll(G); else E.doMove(G, E.aiPick(G));
    if (mode === 'maestro') G.pieces.forEach((arr, pi) => { if (!G.kills[pi] && arr.some(p => p > 50)) enteredBeforeKill = true; });
    if (mode === 'equipos' && G.last && G.last.captured) G.last.captured.forEach(([oi]) => { if (G.players[oi].seat % 2 === G.players[G.last.pi].seat % 2) ok(false, 'en equipos no se atrapa al compañero'); });
  }
  ok(G.phase === 'over', `${mode}: la partida termina`);
  if (mode === 'rapido') ok(G.pieces[G.winner].filter(p => p === 56).length >= 2, 'rápido: el ganador tiene 2 en la meta');
  if (mode === 'maestro') ok(!enteredBeforeKill, 'maestro: nadie entra a la meta sin haber atrapado');
  if (mode === 'equipos') { const w = G.players[G.winner].seat % 2; ok(G.players.every((p, i) => p.seat % 2 !== w || G.pieces[i].every(q => q === 56)), 'equipos: los dos del equipo ganador terminaron'); }
}
console.log(fails ? `${fails} fallas` : 'Ludo OK: recorrido correcto, 300 partidas clásicas y 300 de los modos Rápido, Maestro y Equipos');
process.exit(fails ? 1 : 0);
