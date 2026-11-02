// Revisión automática: se ejecuta en GitHub cada vez que subes cambios.
// Comprueba que ningún archivo de código tenga errores de sintaxis y que
// las preguntas estén bien armadas (sin repetidas y con 4 opciones distintas).
import fs from 'fs';
import path from 'path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
let fails = 0; const bad = m => { fails++; console.error('✖', m); }; const ok = m => console.log('✔', m);

// 1. JavaScript de la carpeta js/
for (const f of fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js'))) {
  try { new Function(fs.readFileSync(path.join(root, 'js', f), 'utf8')); ok(`js/${f} sin errores de sintaxis`); }
  catch (e) { bad(`js/${f}: ${e.message}`); }
}
// 2. Scripts dentro de index.html
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
inline.forEach((code, i) => { try { new Function(code); } catch (e) { bad(`index.html, script ${i + 1}: ${e.message}`); } });
ok(`index.html: ${inline.length} scripts revisados`);
// 3. Archivos que index.html necesita
for (const [, src] of html.matchAll(/(?:src|href)="((?:js|css)\/[^"?]+)"/g)) if (!fs.existsSync(path.join(root, src))) bad(`Falta el archivo ${src}`);
ok('Archivos enlazados presentes');
// 4. Banco de preguntas del duelo
globalThis.window = globalThis;
for (const f of ['preguntas-duelo-1.js', 'preguntas-duelo-2.js']) { const p = path.join(root, 'js', f); if (fs.existsSync(p)) new Function(fs.readFileSync(p, 'utf8'))(); }
const seen = new Set(); let n = 0;
for (const [tema, rows] of Object.entries(globalThis.DUELO_Q || {})) rows.forEach(r => {
  n++; const [q, a, w1, w2, w3, lvl] = r;
  if (seen.has(q)) bad(`Pregunta repetida: ${q}`); seen.add(q);
  if (new Set([a, w1, w2, w3]).size !== 4) bad(`Opciones repetidas en: ${q}`);
  if (![1, 2, 3].includes(lvl)) bad(`Nivel inválido en: ${q}`);
  if (!q || !a) bad(`Pregunta incompleta en el tema ${tema}`);
});
ok(`${n} preguntas del duelo revisadas`);
console.log(fails ? `\n${fails} problema(s) encontrado(s)` : '\nTodo en orden ✨');
process.exit(fails ? 1 : 0);
