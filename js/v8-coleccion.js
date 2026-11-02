/* =====================================================================
   HOGWARTS · VERSIÓN 8 · COLECCIÓN
   Cromos de ranas de chocolate (con intercambio), avatar de mago, sala
   común, libro de hechizos, bestiario, medallas por película, diario
   de Tom Riddle, títulos por logros y diploma de 7.º año.
   Todos los dibujos están hechos en código (SVG): no hay que subir
   imágenes.
===================================================================== */
(() => {
  const V8 = window.V8, st = V8.st;

  /* =====================================================================
     DIBUJO DE MAGOS (cromos, avatar y retratos)
  ===================================================================== */
  let wid = 0;
  V8.wizard = (o = {}, size = 100) => {
    const id = 'w' + (++wid), sk = o.skin || '#f1c8a0', hc = o.hairC || '#4a2c17', robe = o.robe || '#2b2118', s1 = o.scarf1 || '#7f1d1d', s2 = o.scarf2 || '#eab308';
    const hair = {
      short: `<path d="M31 46c0-16 9-24 19-24s19 8 19 24c-4-7-11-10-19-10s-15 3-19 10z" fill="${hc}"/>`,
      messy: `<path d="M30 48c-2-14 6-27 20-27 15 0 22 12 20 27l-4-8-3 6-4-9-4 7-5-8-4 8-4-7-3 7-4-6z" fill="${hc}"/>`,
      long: `<path d="M29 50c-2-18 8-29 21-29s23 11 21 29l1 34c-6 3-10 0-11-4V52c-3-6-7-9-11-9s-8 3-11 9v28c-1 4-5 7-11 4z" fill="${hc}"/>`,
      bun: `<circle cx="50" cy="18" r="8" fill="${hc}"/><path d="M31 47c0-16 9-24 19-24s19 8 19 24c-4-8-11-12-19-12s-15 4-19 12z" fill="${hc}"/>`,
      curly: [[34, 36], [41, 28], [50, 25], [59, 28], [66, 36], [31, 46], [69, 46], [45, 30], [55, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="${hc}"/>`).join(''),
      braid: `<path d="M31 47c0-16 9-24 19-24s19 8 19 24c-4-8-11-12-19-12s-15 4-19 12z" fill="${hc}"/><path d="M66 46c6 10 6 22 2 34" stroke="${hc}" stroke-width="7" stroke-linecap="round" fill="none" stroke-dasharray="5 2"/>`,
      bald: `<path d="M33 40c3-10 10-15 17-15s14 5 17 15" fill="none" stroke="${o.skinD || '#d9a77f'}" stroke-width="2" opacity=".5"/>`,
      white: `<path d="M30 52c-3-18 7-30 20-30s23 12 20 30l2 22c-4 2-8 0-9-3l-1-20c-4-5-8-7-12-7s-8 2-12 7l-1 20c-1 3-5 5-9 3z" fill="#e7e5e4"/>`
    }[o.hair || 'short'] || '';
    const beard = { short: `<path d="M36 58c2 12 8 18 14 18s12-6 14-18c-4 5-9 7-14 7s-10-2-14-7z" fill="${o.beardC || hc}"/>`, long: `<path d="M34 56c0 20 6 44 16 52 10-8 16-32 16-52-4 6-10 9-16 9s-12-3-16-9z" fill="${o.beardC || '#e7e5e4'}"/><path d="M42 66q8 6 16 0" stroke="#a8a29e" fill="none"/>` }[o.beard] || '';
    const glasses = { round: `<g fill="none" stroke="#1c1917" stroke-width="2"><circle cx="43" cy="51" r="6"/><circle cx="57" cy="51" r="6"/><path d="M49 51h2M37 50l-5-2M63 50l5-2"/></g>`, square: `<g fill="none" stroke="#1c1917" stroke-width="2"><rect x="36" y="46" width="12" height="9" rx="2"/><rect x="52" y="46" width="12" height="9" rx="2"/><path d="M48 50h4"/></g>`, half: `<g fill="none" stroke="#a16207" stroke-width="2"><path d="M37 51a6 5 0 0 0 12 0zM51 51a6 5 0 0 0 12 0zM49 51h2"/></g>` }[o.glasses] || '';
    const hat = { pointed: `<path d="M26 34l24-34 24 34z" fill="${o.hatC || '#1e1b4b'}"/><ellipse cx="50" cy="34" rx="30" ry="6" fill="${o.hatC || '#1e1b4b'}"/><path d="M33 31h34" stroke="${o.hatB || '#a16207'}" stroke-width="3"/>`, witch: `<path d="M30 33l26-32-4 14 14 18z" fill="${o.hatC || '#14532d'}"/><ellipse cx="50" cy="33" rx="33" ry="6" fill="${o.hatC || '#14532d'}"/>`, top: `<rect x="34" y="6" width="32" height="26" rx="2" fill="${o.hatC || '#1c1917'}"/><ellipse cx="50" cy="32" rx="26" ry="5" fill="${o.hatC || '#1c1917'}"/><rect x="34" y="24" width="32" height="4" fill="${o.hatB || '#7f1d1d'}"/>`, crown: `<path d="M34 32l3-14 7 8 6-12 6 12 7-8 3 14z" fill="#facc15" stroke="#a16207"/>` }[o.hat] || '';
    const ears = o.elf ? `<path d="M31 50l-12-10 9 16zM69 50l12-10-9 16z" fill="${sk}"/>` : `<ellipse cx="31" cy="52" rx="3.5" ry="5" fill="${sk}"/><ellipse cx="69" cy="52" rx="3.5" ry="5" fill="${sk}"/>`;
    return `<svg viewBox="0 0 100 120" width="${size}" height="${size * 1.2}" aria-hidden="true">
      <defs><radialGradient id="${id}f" cx="45%" cy="40%"><stop offset="0" stop-color="${sk}"/><stop offset="1" stop-color="${o.skinD || '#d9a77f'}"/></radialGradient><linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${robe}"/><stop offset="1" stop-color="#0c0a09"/></linearGradient></defs>
      ${o.hair === 'long' || o.hair === 'white' ? hair : ''}
      <path d="M14 120c2-22 14-34 36-36 22 2 34 14 36 36z" fill="url(#${id}r)"/>
      <path d="M38 86l12 16 12-16" fill="#f5f0e6" opacity=".9"/>
      ${o.house !== false ? `<path d="M40 85q10 10 20 0l4 6q-14 12-28 0z" fill="${s1}"/><path d="M42 89h16" stroke="${s2}" stroke-width="2.5"/><rect x="56" y="88" width="7" height="22" rx="2" fill="${s1}"/><path d="M56 95h7M56 102h7" stroke="${s2}" stroke-width="2.5"/>` : ''}
      <rect x="45" y="70" width="10" height="12" fill="${o.skinD || '#d9a77f'}"/>
      ${ears}<ellipse cx="50" cy="54" rx="19" ry="22" fill="url(#${id}f)"/>
      ${o.hair === 'long' || o.hair === 'white' ? '' : hair}
      <path d="M38 45q5-3 9 0M53 45q5-3 9 0" stroke="${o.hair === 'white' || o.beard === 'long' ? '#a8a29e' : hc}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="43" cy="51" rx="2.2" ry="2.6" fill="#1c1917"/><ellipse cx="57" cy="51" rx="2.2" ry="2.6" fill="#1c1917"/><circle cx="43.7" cy="50.3" r=".8" fill="#fff"/><circle cx="57.7" cy="50.3" r=".8" fill="#fff"/>
      <path d="M50 54q-2 6 0 7" stroke="${o.skinD || '#d9a77f'}" stroke-width="1.5" fill="none"/>
      ${beard || `<path d="M43 64q7 ${o.mood === 'serio' ? 1 : 5} 14 0" stroke="#7c2d12" stroke-width="2" fill="none" stroke-linecap="round"/>`}
      ${o.scar ? '<path d="M52 33l-4 5h4l-4 6" stroke="#b91c1c" stroke-width="1.8" fill="none"/>' : ''}
      <ellipse cx="38" cy="60" rx="4" ry="2.5" fill="#f87171" opacity=".25"/><ellipse cx="62" cy="60" rx="4" ry="2.5" fill="#f87171" opacity=".25"/>
      ${glasses}${hat}</svg>`;
  };
  const HC = { Gryffindor: ['#7f1d1d', '#eab308'], Slytherin: ['#065f46', '#cbd5e1'], Ravenclaw: ['#1e3a8a', '#b45309'], Hufflepuff: ['#ca8a04', '#1c1917'] };
  V8.houseScarf = h => HC[h] || ['#57534e', '#a8a29e'];

  /* =====================================================================
     CROMOS DE RANAS DE CHOCOLATE
  ===================================================================== */
  // [id, nombre, rareza c/r/l, casa, rasgos, símbolo, dato]
  const SK = ['#f6d5b5', '#f1c8a0', '#d9a77f', '#b97f55', '#8a5a3b', '#5e3b26'];
  const CARDS = [
    ['dumbledore', 'Albus Dumbledore', 'l', 'Gryffindor', { hair: 'white', beard: 'long', glasses: 'half', hat: 'pointed', hatC: '#4c1d95', robe: '#4c1d95' }, '🔥', 'Director de Hogwarts y dueño de la Varita de Saúco.'],
    ['merlin', 'Merlín', 'l', 'Slytherin', { hair: 'white', beard: 'long', hat: 'pointed', hatC: '#1e3a8a', robe: '#1e3a8a' }, '✨', 'El mago más famoso de todos los tiempos.'],
    ['godric', 'Godric Gryffindor', 'l', 'Gryffindor', { hair: 'long', hairC: '#9a3412', beard: 'short', beardC: '#9a3412', robe: '#7f1d1d' }, '🦁', 'Fundador de la casa de los valientes.'],
    ['salazar', 'Salazar Slytherin', 'l', 'Slytherin', { hair: 'long', hairC: '#1c1917', beard: 'short', beardC: '#1c1917', robe: '#064e3b', mood: 'serio' }, '🐍', 'Fundador que hablaba pársel.'],
    ['rowena', 'Rowena Ravenclaw', 'l', 'Ravenclaw', { hair: 'long', hairC: '#1c1917', hat: 'crown', robe: '#1e3a8a' }, '🦅', 'Fundadora; su diadema daba sabiduría.'],
    ['helga', 'Helga Hufflepuff', 'l', 'Hufflepuff', { hair: 'curly', hairC: '#b45309', robe: '#a16207' }, '🦡', 'Fundadora que aceptaba a todos.'],
    ['flamel', 'Nicolas Flamel', 'l', false, { hair: 'white', beard: 'long', robe: '#7c2d12' }, '💎', 'Creador de la Piedra Filosofal.'],
    ['newt', 'Newt Scamander', 'l', 'Hufflepuff', { hair: 'messy', hairC: '#9a3412', robe: '#1e3a8a' }, '🧳', 'Magizoólogo y autor de un famoso libro de criaturas.'],
    ['harry', 'Harry Potter', 'r', 'Gryffindor', { hair: 'messy', hairC: '#1c1917', glasses: 'round', scar: true }, '⚡', 'El niño que vivió. Buscador de Gryffindor.'],
    ['hermione', 'Hermione Granger', 'r', 'Gryffindor', { hair: 'curly', hairC: '#7c2d12' }, '📚', 'La bruja más brillante de su generación.'],
    ['ron', 'Ron Weasley', 'r', 'Gryffindor', { hair: 'short', hairC: '#c2410c' }, '♟️', 'Gran jugador de ajedrez mágico y amigo leal.'],
    ['mcgonagall', 'Minerva McGonagall', 'r', 'Gryffindor', { hair: 'bun', hairC: '#57534e', hat: 'witch', hatC: '#14532d', glasses: 'square', robe: '#14532d', mood: 'serio' }, '🐈', 'Profesora de Transformaciones; se convierte en gata.'],
    ['snape', 'Severus Snape', 'r', 'Slytherin', { hair: 'long', hairC: '#1c1917', robe: '#0c0a09', mood: 'serio', skin: '#efd9c3' }, '🧪', 'Profesor de Pociones, el Príncipe Mestizo.'],
    ['hagrid', 'Rubeus Hagrid', 'r', 'Gryffindor', { hair: 'curly', hairC: '#292524', beard: 'long', beardC: '#292524', robe: '#57534e' }, '🐉', 'Guardián de las llaves y amante de las criaturas.'],
    ['sirius', 'Sirius Black', 'r', 'Gryffindor', { hair: 'long', hairC: '#1c1917', beard: 'short', beardC: '#1c1917', robe: '#292524' }, '🐕', 'Padrino de Harry y animago.'],
    ['lupin', 'Remus Lupin', 'r', 'Gryffindor', { hair: 'short', hairC: '#a16207', robe: '#57534e' }, '🌕', 'Profesor de Defensa; sabe convocar un gran patronus.'],
    ['luna', 'Luna Lovegood', 'r', 'Ravenclaw', { hair: 'long', hairC: '#fde68a' }, '🌙', 'Cree en criaturas que nadie más ve.'],
    ['neville', 'Neville Longbottom', 'r', 'Gryffindor', { hair: 'short', hairC: '#78350f' }, '🌱', 'Experto en Herbología y héroe de la batalla.'],
    ['dobby', 'Dobby', 'r', false, { hair: 'bald', elf: true, skin: '#d6c7a1', skinD: '#b8a57a', house: false, robe: '#a8a29e' }, '🧦', '¡Un elfo libre!'],
    ['moody', 'Alastor Moody', 'r', false, { hair: 'long', hairC: '#78716c', mood: 'serio', robe: '#44403c' }, '👁️', 'Auror legendario. ¡Alerta permanente!'],
    ['tonks', 'Nymphadora Tonks', 'r', 'Hufflepuff', { hair: 'short', hairC: '#ec4899' }, '🎨', 'Metamorfomaga: cambia su apariencia a voluntad.'],
    ['cedric', 'Cedric Diggory', 'r', 'Hufflepuff', { hair: 'short', hairC: '#78350f' }, '🏆', 'Campeón de Hogwarts en el Torneo de los Tres Magos.'],
    ['ginny', 'Ginny Weasley', 'r', 'Gryffindor', { hair: 'long', hairC: '#c2410c' }, '🧹', 'Cazadora estrella de Quidditch.'],
    ['fredgeorge', 'Fred y George', 'r', 'Gryffindor', { hair: 'short', hairC: '#ea580c' }, '🎆', 'Bromistas y fundadores de Sortilegios Weasley.'],
    ['voldemort', 'Lord Voldemort', 'r', 'Slytherin', { hair: 'bald', skin: '#e7e5e4', skinD: '#a8a29e', robe: '#0c0a09', mood: 'serio' }, '💀', 'El que no debe ser nombrado.'],
    ['ollivander', 'Garrick Ollivander', 'c', 'Ravenclaw', { hair: 'white', robe: '#44403c' }, '🪄', 'Fabricante de varitas.'],
    ['flitwick', 'Filius Flitwick', 'c', 'Ravenclaw', { hair: 'white', beard: 'short', beardC: '#e7e5e4', robe: '#1e3a8a' }, '🎈', 'Profesor de Encantamientos.'],
    ['sprout', 'Pomona Sprout', 'c', 'Hufflepuff', { hair: 'curly', hairC: '#a8a29e', hat: 'witch', hatC: '#4d7c0f', robe: '#4d7c0f' }, '🌿', 'Profesora de Herbología.'],
    ['slughorn', 'Horace Slughorn', 'c', 'Slytherin', { hair: 'bald', beard: 'short', beardC: '#d6d3d1', robe: '#7c2d12' }, '🍍', 'Profesor de Pociones y coleccionista de alumnos.'],
    ['trelawney', 'Sybill Trelawney', 'c', 'Ravenclaw', { hair: 'curly', hairC: '#a16207', glasses: 'round', robe: '#9d174d' }, '🔮', 'Profesora de Adivinación.'],
    ['lockhart', 'Gilderoy Lockhart', 'c', 'Ravenclaw', { hair: 'short', hairC: '#facc15', robe: '#a21caf' }, '😁', 'Escritor famoso con más sonrisa que talento.'],
    ['hooch', 'Madame Hooch', 'c', false, { hair: 'short', hairC: '#d6d3d1', robe: '#334155' }, '🧹', 'Profesora de Vuelo.'],
    ['pomfrey', 'Madame Pomfrey', 'c', false, { hair: 'bun', hairC: '#78716c', robe: '#e7e5e4' }, '🩹', 'Sanadora de la enfermería.'],
    ['filch', 'Argus Filch', 'c', false, { hair: 'long', hairC: '#78716c', robe: '#57534e', mood: 'serio' }, '🔑', 'Conserje del castillo.'],
    ['molly', 'Molly Weasley', 'c', 'Gryffindor', { hair: 'curly', hairC: '#c2410c', robe: '#9a3412' }, '🧶', 'Teje los suéteres más famosos.'],
    ['arthur', 'Arthur Weasley', 'c', 'Gryffindor', { hair: 'bald', hairC: '#c2410c', glasses: 'square', robe: '#57534e' }, '🔌', 'Fanático de los objetos muggles.'],
    ['kingsley', 'Kingsley Shacklebolt', 'c', false, { hair: 'bald', skin: '#8a5a3b', skinD: '#5e3b26', robe: '#4c1d95' }, '🛡️', 'Auror y luego Ministro de Magia.'],
    ['cho', 'Cho Chang', 'c', 'Ravenclaw', { hair: 'long', hairC: '#1c1917' }, '🦢', 'Buscadora de Ravenclaw.'],
    ['fleur', 'Fleur Delacour', 'c', false, { hair: 'long', hairC: '#fef3c7', robe: '#1e40af' }, '🌸', 'Campeona de Beauxbatons.'],
    ['krum', 'Viktor Krum', 'c', false, { hair: 'short', hairC: '#1c1917', robe: '#7f1d1d', mood: 'serio' }, '🏅', 'Buscador internacional de Durmstrang.'],
    ['draco', 'Draco Malfoy', 'c', 'Slytherin', { hair: 'short', hairC: '#fef3c7', mood: 'serio' }, '🐉', 'Rival de Harry en Slytherin.'],
    ['lucius', 'Lucius Malfoy', 'c', 'Slytherin', { hair: 'long', hairC: '#fef3c7', robe: '#0c0a09', mood: 'serio' }, '🐍', 'Padre de Draco, con bastón de serpiente.'],
    ['bellatrix', 'Bellatrix Lestrange', 'c', 'Slytherin', { hair: 'curly', hairC: '#0c0a09', robe: '#0c0a09', mood: 'serio' }, '🗡️', 'Mortífaga muy peligrosa.'],
    ['umbridge', 'Dolores Umbridge', 'c', 'Slytherin', { hair: 'curly', hairC: '#a16207', robe: '#f472b6' }, '🎀', 'Le encanta el rosado y las reglas.'],
    ['pettigrew', 'Peter Pettigrew', 'c', 'Gryffindor', { hair: 'bald', hairC: '#a8a29e', robe: '#57534e' }, '🐀', 'Animago que se convertía en rata.'],
    ['grindelwald', 'Gellert Grindelwald', 'c', false, { hair: 'white', robe: '#1c1917', mood: 'serio' }, '🔺', 'Mago oscuro que buscó las Reliquias.'],
    ['bagshot', 'Bathilda Bagshot', 'c', false, { hair: 'bun', hairC: '#e7e5e4', robe: '#44403c' }, '📜', 'Historiadora de la magia.'],
    ['bowman', 'Bowman Wright', 'c', false, { hair: 'short', hairC: '#78350f', beard: 'short', robe: '#a16207' }, '🟡', 'Inventor de la snitch dorada.'],
    ['paracelso', 'Paracelso', 'c', false, { hair: 'long', hairC: '#78350f', beard: 'short', robe: '#065f46' }, '⚗️', 'Alquimista famoso.'],
    ['circe', 'Circe', 'c', false, { hair: 'long', hairC: '#1c1917', robe: '#4c1d95' }, '🐖', 'Hechicera de la antigua Grecia.'],
    ['morgana', 'Morgana', 'r', false, { hair: 'long', hairC: '#1c1917', hat: 'crown', robe: '#3b0764' }, '🌑', 'Hechicera rival de Merlín.'],
    ['cliodna', 'Cliodna', 'c', false, { hair: 'long', hairC: '#c2410c', robe: '#0e7490' }, '🐦', 'Druida y animaga.'],
    ['agrippa', 'Agrippa', 'c', false, { hair: 'short', hairC: '#57534e', beard: 'short', robe: '#44403c' }, '📕', 'Mago y escritor del Renacimiento.'],
    ['uric', 'Uric el Raro', 'c', false, { hair: 'messy', hairC: '#65a30d', hat: 'pointed', hatC: '#65a30d', robe: '#3f6212' }, '🪼', 'Usaba una medusa como sombrero.'],
    ['hengist', 'Hengist de Woodcroft', 'c', false, { hair: 'long', hairC: '#78350f', beard: 'long', beardC: '#78350f', robe: '#57534e' }, '🏘️', 'Fundador del pueblo de Hogsmeade.'],
    ['nearly', 'Nick Casi Decapitado', 'c', 'Gryffindor', { hair: 'long', hairC: '#cbd5e1', skin: '#e2e8f0', skinD: '#94a3b8', robe: '#94a3b8' }, '👻', 'Fantasma de la torre de Gryffindor.'],
    ['fraile', 'El Fraile Gordo', 'c', 'Hufflepuff', { hair: 'bald', skin: '#e2e8f0', skinD: '#94a3b8', robe: '#94a3b8' }, '👻', 'Fantasma alegre de Hufflepuff.'],
    ['dama', 'La Dama Gris', 'c', 'Ravenclaw', { hair: 'long', hairC: '#cbd5e1', skin: '#e2e8f0', skinD: '#94a3b8', robe: '#94a3b8' }, '👻', 'Fantasma de la torre de Ravenclaw.'],
    ['baron', 'El Barón Sanguinario', 'c', 'Slytherin', { hair: 'long', hairC: '#cbd5e1', skin: '#e2e8f0', skinD: '#94a3b8', robe: '#94a3b8', mood: 'serio' }, '👻', 'Fantasma de las mazmorras.'],
    ['myrtle', 'Myrtle la Llorona', 'c', 'Ravenclaw', { hair: 'long', hairC: '#cbd5e1', glasses: 'round', skin: '#e2e8f0', skinD: '#94a3b8', robe: '#94a3b8' }, '🚽', 'Vive en el baño del segundo piso.']
  ].map(([id, name, r, house, look, sym, info], i) => ({ id, name, r, house, look: Object.assign({ skin: SK[i % 3], house }, look, house ? { scarf1: HC[house][0], scarf2: HC[house][1] } : { house: false }), sym, info }));
  V8.CARDS = CARDS;
  const RAR = { c: ['Común', '#a16207', 5], r: ['Rara', '#94a3b8', 15], l: ['Legendaria', '#facc15', 50] };
  V8.cardHTML = (c, count = 1, big) => {
    const owned = count > 0;
    return `<div class="v8-card r-${c.r} ${owned ? '' : 'locked'} ${big ? 'big' : ''}" title="${owned ? esc(c.info) : '???'}">
      <div class="art" style="background:radial-gradient(circle at 50% 30%, ${c.house ? HC[c.house][0] : '#57534e'}aa, #0c0a09 75%)">${owned ? `<span class="emb">${c.sym}</span><span class="mono">${c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</span>` + V8.ph('personajes', c.id) : '<span class="q">?</span>'}<span class="sym">${owned ? c.sym : ''}</span></div>
      <div class="nm">${owned ? esc(c.name) : '???'}</div>
      ${big && owned ? `<p class="inf">${esc(c.info)}</p>` : ''}
      <span class="rr">${RAR[c.r][0]}</span>${count > 1 ? `<span class="ct">×${count}</span>` : ''}</div>`;
  };
  function drawCard(rng = Math.random) {
    const x = rng(), r = x < .04 ? 'l' : x < .25 ? 'r' : 'c';
    return V8.pick(CARDS.filter(c => c.r === r), rng);
  }
  V8.addFrogs = (n, why) => { const s = st(); s.frogs = (s.frogs || 0) + n; save(); if (why) toast(`${why}: +${n} rana${n > 1 ? 's' : ''} de chocolate`, '🐸'); renderBadge(); };
  /* ---------- animación para revelar un cromo (rana o compra) ---------- */
  const PRICE = { c: 400, r: 1200, l: 3500 };
  V8.CARD_PRICE = PRICE;
  function afterGet(c) {
    const s = st(), n = Object.keys(s.cards).length;
    if (n >= 10) unlock('v8cards10'); if (n >= 30) unlock('v8cards30'); if (n >= CARDS.length) unlock('v8cardsAll'); if (c.r === 'l') unlock('v8legend');
    renderBadge();
  }
  V8.reveal = (c, { frog = true, first = true, count = 1 } = {}) => {
    const s = st(), reduce = V8.reduced();
    const back = `<div class="v8-cardback"><span>H</span><i></i></div>`;
    V8.sheet(frog ? '🐸 Rana de chocolate' : '🃏 Nuevo cromo', `<div class="v8-rv r-${c.r} ${frog ? 'frog' : 'buy'}" id="v8Rv">
        <div class="rays"></div><div class="glow"></div>
        ${frog ? '<div class="box"><div class="lid"></div><div class="pack">🐸</div></div>' : ''}
        <div class="flip"><div class="face back">${back}</div><div class="face front">${V8.cardHTML(c, 1, true)}</div></div>
        <div class="sparks"></div>
        <div class="info"><span class="badge">${RAR[c.r][0]}${c.r === 'l' ? ' ✨' : ''}</span>
          <p class="${first ? 'text-emerald-300' : 'text-stone-300'}">${first ? '¡Nuevo cromo para tu álbum!' : `Repetido (tienes ${count}). Puedes cambiarlo con un amigo o venderlo.`}</p>
          <div class="flex gap-2 justify-center mt-2 flex-wrap">${frog && s.frogs ? `<button class="btn-gold" onclick="V8.openFrog()">Abrir otra (${s.frogs})</button>` : ''}<button class="btn-ghost" onclick="V8.closeSheet();V8.goCol('cromos')">Ver álbum</button></div></div></div>`);
    const rv = $('v8Rv'); if (!rv) return;
    const T = reduce ? [0, 50, 100] : frog ? [0, 1200, 1800] : [0, 300, 900];
    sfx('spell');
    if (frog && !reduce) { rv.classList.add('shake'); tone(220, .3, 'triangle', .05, 330, .3); tone(330, .3, 'triangle', .05, 440, .7); }
    setTimeout(() => { if (!rv.isConnected) return; rv.classList.add('open'); sfx('zap'); if (c.r !== 'c') flash(c.r === 'l' ? 'rgba(250,204,21,.45)' : 'rgba(203,213,225,.35)', c.r === 'l'); }, T[1]);
    setTimeout(() => {
      if (!rv.isConnected) return; rv.classList.add('show');
      const sp = rv.querySelector('.sparks'), n = reduce ? 0 : c.r === 'l' ? 40 : c.r === 'r' ? 24 : 12;
      for (let i = 0; i < n; i++) { const e = document.createElement('i'); const a = Math.random() * 6.28, d = 90 + Math.random() * 120; e.style.setProperty('--x', Math.cos(a) * d + 'px'); e.style.setProperty('--y', Math.sin(a) * d + 'px'); e.style.animationDelay = Math.random() * .3 + 's'; sp.appendChild(e); }
      sfx(c.r === 'l' ? 'levelup' : c.r === 'r' ? 'achieve' : 'correct');
      if (c.r === 'l') { fireConfetti({ particleCount: 220, spread: 140, colors: ['#fde047', '#f59e0b', '#fff7cc'] }); setTimeout(() => fireConfetti({ particleCount: 120, spread: 160, origin: { y: .3 } }), 500); }
      else if (c.r === 'r') fireConfetti({ particleCount: 90, spread: 90, colors: ['#e2e8f0', '#94a3b8', '#ffffff'] });
      if (window.V8.speak) V8.speak(`¡${c.name}! Cromo ${RAR[c.r][0].toLowerCase()}.`);
    }, T[2]);
  };
  V8.openFrog = () => {
    const s = st(); if (!s.frogs) { toast('No tienes ranas. Cómpralas en Honeydukes o gánalas en misiones.', '🐸'); return; }
    s.frogs--; const c = drawCard(); s.cards[c.id] = (s.cards[c.id] || 0) + 1; save();
    V8.emit('frog', { card: c.id, r: c.r });
    V8.reveal(c, { frog: true, first: s.cards[c.id] === 1, count: s.cards[c.id] });
    afterGet(c);
  };
  // comprar un cromo exacto (caro, para que sea especial)
  V8.buyCard = id => {
    const c = CARDS.find(x => x.id === id), s = st(); if (!c) return;
    const price = PRICE[c.r], have = s.cards[id] || 0;
    showDialog({ icon: '🃏', title: `Comprar ${esc(c.name)}`, body: `<div class="flex justify-center my-2">${V8.cardHTML(c, 1)}</div><p class="text-sm">Cromo <b>${RAR[c.r][0].toLowerCase()}</b> por <b class="text-amber-300">${price.toLocaleString('es-PE')} galeones</b>.${have ? ` <br><span class="text-[11px] text-stone-400">Ya tienes ${have}.</span>` : ''}</p><p class="text-[11px] text-stone-400 mt-1">Tienes ${(S.gold || 0).toLocaleString('es-PE')} galeones.</p>`,
      actions: [{ label: (S.gold || 0) >= price ? `Comprar por ${price.toLocaleString('es-PE')} 🪙` : 'No te alcanza', primary: true, onClick: () => {
        if ((S.gold || 0) < price) { toast(`Te faltan ${(price - (S.gold || 0)).toLocaleString('es-PE')} galeones. ¡Sigue jugando!`, '🪙'); return; }
        S.gold -= price; s.cards[id] = have + 1; save(); updateWallet(); V8.emit('cardBought', { id, r: c.r }); unlock('v8buycard');
        V8.reveal(c, { frog: false, first: !have, count: have + 1 }); afterGet(c);
        if (currentTab === 'shop' && typeof renderShop === 'function') renderShop();
      } }, { label: 'Cancelar' }] });
  };
  V8.cardShopHTML = filter => {
    const s = st(), f = filter || V8._cardFilter || 'faltan';
    const list = CARDS.filter(c => f === 'todos' || (f === 'faltan' && !s.cards[c.id]) || f === c.r);
    return `<div class="space-y-2"><div class="flex flex-wrap items-center justify-between gap-2"><h3 class="font-wizard font-bold text-amber-300">🃏 Cromos uno por uno</h3>
      <div class="flex flex-wrap gap-1.5">${[['faltan', 'Me faltan'], ['l', 'Legendarios'], ['r', 'Raros'], ['c', 'Comunes'], ['todos', 'Todos']].map(([k, l]) => `<button class="v8-chip ${f === k ? 'on' : ''}" onclick="V8._cardFilter='${k}';renderShop()">${l}</button>`).join('')}</div></div>
      <p class="text-[11px] text-stone-400">Elige exactamente el personaje que quieres. Común ${PRICE.c} 🪙 · Raro ${PRICE.r.toLocaleString('es-PE')} 🪙 · Legendario ${PRICE.l.toLocaleString('es-PE')} 🪙.</p>
      <div class="v8-cardgrid">${list.length ? list.map(c => `<button class="v8-shopcard" onclick="V8.buyCard('${c.id}')">${V8.cardHTML(c, s.cards[c.id] ? s.cards[c.id] : 1)}<span class="pr ${(S.gold || 0) >= PRICE[c.r] ? '' : 'no'}">🪙 ${PRICE[c.r].toLocaleString('es-PE')}</span></button>`).join('') : '<p class="text-xs text-emerald-300 col-span-full">¡Ya tienes todos los cromos de esta lista!</p>'}</div></div>`;
  };

  V8.sellDup = id => { const s = st(), c = CARDS.find(x => x.id === id); if (!c || (s.cards[id] || 0) < 2) return; s.cards[id]--; save(); V8.gold(RAR[c.r][2], `Vendiste un ${c.name} repetido`); V8.goCol('cromos'); };

  /* ---------- intercambio de cromos con un amigo (en línea) ---------- */
  const TR = { ch: null, code: '', me: '', mine: null, theirs: null, okMe: false, okThem: false, id: Math.random().toString(36).slice(2) };
  V8.tradeOpen = () => {
    V8.sheet('🔄 Cambiar cromos con un amigo', `<div class="space-y-3 text-sm"><p class="text-stone-300">Los dos entran a la misma sala con un código. Cada uno elige un cromo repetido para dar y, cuando ambos aceptan, se intercambian.</p>
      <div class="flex gap-2"><button class="btn-gold flex-1" onclick="V8.tradeConnect(true)">Crear sala</button></div>
      <div class="flex gap-2"><input id="trCode" maxlength="4" placeholder="CÓDIGO" class="flex-grow uppercase tracking-[.3em] text-center font-bold bg-stone-950 border border-amber-700/50 rounded-lg px-3 py-2 text-amber-200" oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9]/g,'')"><button class="btn-ghost" onclick="V8.tradeConnect(false)">Unirme</button></div>
      <div id="trBox"></div></div>`);
    V8._sheetClose = tradeLeave;
  };
  async function tradeLeave() { if (TR.ch) { try { await TR.ch.unsubscribe(); } catch (e) {} } TR.ch = null; TR.mine = TR.theirs = null; TR.okMe = TR.okThem = false; }
  V8.tradeConnect = async host => {
    if (!supaReady()) return toast('Falta conectar Supabase.', '🌐');
    const code = host ? Array.from({ length: 4 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('') : (($('trCode') || {}).value || '').trim();
    if (code.length !== 4) return toast('El código tiene 4 caracteres.', '🔑');
    const c = await loadSupabase(); await tradeLeave();
    TR.code = code; TR.me = V8.name();
    const ch = c.channel('cromos-' + code, { config: { broadcast: { self: false } } }); TR.ch = ch;
    ch.on('broadcast', { event: 'm' }, ({ payload: m }) => {
      if (m.t === 'hi') { TR.peer = m.name; ch.send({ type: 'broadcast', event: 'm', payload: { t: 'hey', name: TR.me } }); tradeUI(); }
      if (m.t === 'hey') { TR.peer = m.name; tradeUI(); }
      if (m.t === 'offer') { TR.theirs = m.card; TR.okThem = false; TR.okMe = false; tradeUI(); }
      if (m.t === 'ok') { TR.okThem = true; tradeDo(); tradeUI(); }
    });
    ch.subscribe(s => { if (s === 'SUBSCRIBED') { if (!host) ch.send({ type: 'broadcast', event: 'm', payload: { t: 'hi', name: TR.me } }); tradeUI(); } });
  };
  const tsend = p => TR.ch && TR.ch.send({ type: 'broadcast', event: 'm', payload: p });
  function tradeUI() {
    const box = $('trBox'); if (!box) return; const s = st();
    const dups = CARDS.filter(c => (s.cards[c.id] || 0) > 1);
    box.innerHTML = `<p class="text-center">Sala <b class="text-amber-300 tracking-widest">${TR.code}</b> · ${TR.peer ? `con <b>${esc(TR.peer)}</b>` : 'esperando a tu amigo…'}</p>
      ${TR.peer ? `<p class="text-xs text-amber-300 font-bold">Elige un repetido para dar:</p><div class="v8-cardgrid">${dups.length ? dups.map(c => `<button onclick="V8.tradeOffer('${c.id}')" class="${TR.mine === c.id ? 'v8-sel' : ''}">${V8.cardHTML(c, s.cards[c.id])}</button>`).join('') : '<p class="text-xs text-stone-400">No tienes repetidos todavía.</p>'}</div>
      <div class="grid grid-cols-2 gap-2 text-center text-xs"><div>Tú das:<br><b>${TR.mine ? esc(CARDS.find(c => c.id === TR.mine).name) : '—'}</b></div><div>Recibes:<br><b>${TR.theirs ? esc((CARDS.find(c => c.id === TR.theirs) || {}).name || '—') : '—'}</b></div></div>
      <button class="btn-gold w-full" ${TR.mine && TR.theirs && !TR.okMe ? '' : 'disabled'} onclick="V8.tradeOk()">${TR.okMe ? 'Esperando a tu amigo…' : '✅ Aceptar cambio'}</button>` : ''}`;
  }
  V8.tradeOffer = id => { TR.mine = id; TR.okMe = false; tsend({ t: 'offer', card: id }); tradeUI(); };
  V8.tradeOk = () => { TR.okMe = true; tsend({ t: 'ok' }); tradeDo(); tradeUI(); };
  function tradeDo() {
    if (!(TR.okMe && TR.okThem && TR.mine && TR.theirs)) return;
    const s = st(); if ((s.cards[TR.mine] || 0) < 2 || !CARDS.find(c => c.id === TR.theirs)) return;
    s.cards[TR.mine]--; s.cards[TR.theirs] = (s.cards[TR.theirs] || 0) + 1; save();
    const got = CARDS.find(c => c.id === TR.theirs); toast(`¡Cambio hecho! Recibiste ${got.name}.`, '🔄'); sfx('achieve'); unlock('v8trade');
    TR.mine = TR.theirs = null; TR.okMe = TR.okThem = false;
  }

  /* =====================================================================
     LIBRO DE HECHIZOS Y BESTIARIO
  ===================================================================== */
  const SPELLS = [
    ['Lumos', 'LU-mos', 'Enciende una luz en la punta de la varita.', '💡'], ['Nox', 'NOX', 'Apaga la luz de Lumos.', '🌑'], ['Expelliarmus', 'ex-pe-LIAR-mus', 'Desarma al oponente.', '⚡'],
    ['Expecto Patronum', 'ex-PEC-to pa-TRO-num', 'Invoca un patronus contra los dementores.', '🦌'], ['Wingardium Leviosa', 'uin-GAR-dium le-vi-O-sa', 'Hace levitar objetos.', '🪶'], ['Alohomora', 'a-lo-jo-MO-ra', 'Abre cerraduras.', '🔓'],
    ['Accio', 'AK-sio', 'Atrae un objeto hacia ti.', '🧲'], ['Protego', 'pro-TE-go', 'Crea un escudo protector.', '🛡️'], ['Riddikulus', 'ri-DI-ku-lus', 'Convierte a un boggart en algo gracioso.', '🤡'],
    ['Stupefy', 'es-TU-pe-fai', 'Aturde al oponente.', '💫'], ['Petrificus Totalus', 'pe-TRI-fi-cus to-TA-lus', 'Paraliza todo el cuerpo.', '🧍'], ['Obliviate', 'o-BLI-vi-eit', 'Borra recuerdos.', '🌫️'],
    ['Reparo', 're-PA-ro', 'Repara objetos rotos.', '🔧'], ['Incendio', 'in-SEN-dio', 'Produce fuego.', '🔥'], ['Aguamenti', 'a-gua-MEN-ti', 'Hace brotar agua de la varita.', '💧'],
    ['Lumos Maxima', 'LU-mos MAX-i-ma', 'Una luz muy brillante.', '🌟'], ['Episkey', 'e-PIS-ki', 'Cura heridas pequeñas.', '🩹'], ['Rictusempra', 'ric-tu-SEM-pra', 'Hace cosquillas al rival.', '😆'],
    ['Tarantallegra', 'ta-ran-ta-LE-gra', 'Hace bailar las piernas del rival.', '💃'], ['Silencio', 'si-LEN-sio', 'Silencia a alguien.', '🤐'], ['Sonorus', 'so-NO-rus', 'Amplifica la voz.', '📢'],
    ['Muffliato', 'mu-fli-A-to', 'Hace que otros oigan un zumbido.', '🐝'], ['Finite Incantatem', 'fi-NI-te in-can-TA-tem', 'Termina otros hechizos.', '⛔'], ['Engorgio', 'en-GOR-gio', 'Agranda las cosas.', '🔍'],
    ['Reducio', 're-DU-sio', 'Achica las cosas.', '🤏'], ['Impedimenta', 'im-pe-di-MEN-ta', 'Frena al oponente.', '🐢'], ['Confundo', 'con-FUN-do', 'Confunde a alguien.', '😵'],
    ['Diffindo', 'di-FIN-do', 'Corta cosas con precisión.', '✂️'], ['Locomotor', 'lo-co-MO-tor', 'Mueve objetos por el aire.', '🚂'], ['Orchideous', 'or-QUI-deus', 'Hace aparecer flores.', '🌸'],
    ['Avis', 'A-vis', 'Hace salir pájaros de la varita.', '🐦'], ['Serpensortia', 'ser-pen-SOR-tia', 'Hace aparecer una serpiente.', '🐍'], ['Homenum Revelio', 'O-me-num re-VE-lio', 'Revela si hay personas cerca.', '👀'],
    ['Morsmordre', 'mors-MOR-dre', 'Conjura la Marca Tenebrosa (¡hechizo oscuro!).', '☠️'], ['Sectumsempra', 'sec-tum-SEM-pra', 'Hechizo peligroso del Príncipe Mestizo.', '🗡️'], ['Priori Incantatem', 'pri-O-ri in-can-TA-tem', 'Muestra los últimos hechizos de una varita.', '🔁']
  ].map(([n, p, u, i]) => ({ id: n.toLowerCase().replace(/[^a-z]/g, ''), n, p, u, i }));
  V8.SPELLS = SPELLS;
  const BEASTS = [
    ['hipogrifo', 'Hipogrifo', '🦅', 'Mitad águila, mitad caballo. Hay que hacerle una reverencia.', 'bosque'], ['thestral', 'Thestral', '🐴', 'Caballo alado que solo ven quienes vieron la muerte.', 'bosque'], ['unicornio', 'Unicornio', '🦄', 'Su sangre plateada es muy valiosa.', 'bosque'],
    ['centauro', 'Centauro', '🏹', 'Sabios que leen las estrellas.', 'bosque'], ['acromantula', 'Acromántula', '🕷️', 'Araña gigante del Bosque Prohibido.', 'bosque'], ['fenix', 'Fénix', '🔥', 'Renace de sus cenizas; sus lágrimas curan.', 'bosque'],
    ['bowtruckle', 'Bowtruckle', '🌿', 'Pequeño guardián de árboles de varitas.', 'bosque'], ['niffler', 'Escarbato', '🪙', 'Ama todo lo que brilla.', 'bosque'], ['kneazle', 'Kneazle', '🐈', 'Gato mágico muy listo.', 'bosque'],
    ['grindylow', 'Grindylow', '🦑', 'Demonio de agua con largos dedos.', 'lago'], ['sirena', 'Sirena del lago', '🧜', 'Habita el fondo del Lago Negro.', 'lago'], ['calamar', 'Calamar gigante', '🐙', 'Vive tranquilo en el Lago Negro.', 'lago'],
    ['kelpie', 'Kelpie', '🐎', 'Espíritu de agua que cambia de forma.', 'lago'], ['plimpy', 'Plimpy', '🐡', 'Pez redondo con patas.', 'lago'], ['murtlap', 'Murtlap', '🐀', 'Su esencia calma las heridas.', 'lago'],
    ['boggart', 'Boggart', '👤', 'Toma la forma de tu mayor miedo.', 'dcao'], ['dementor', 'Dementor', '🌫️', 'Se alimenta de la felicidad.', 'dcao'], ['duendecillo', 'Duendecillo de Cornualles', '🧚', 'Pequeños y muy traviesos.', 'dcao'],
    ['gorro', 'Gorro rojo', '🧢', 'Criatura que vive donde hubo batallas.', 'dcao'], ['hinkypunk', 'Hinkypunk', '🏮', 'Lleva una linterna para perder a los viajeros.', 'dcao'], ['inferi', 'Inferius', '💀', 'Cuerpo encantado por un mago oscuro.', 'dcao'],
    ['dragon', 'Colacuerno húngaro', '🐉', 'El dragón más peligroso del Torneo.', 'laberinto'], ['escreguto', 'Escreguto de cola explosiva', '🦂', 'Creado por Hagrid. ¡Cuidado!', 'laberinto'], ['esfinge', 'Esfinge', '🦁', 'Hace acertijos; respóndelos bien.', 'laberinto'],
    ['basilisco', 'Basilisco', '🐍', 'Rey de las serpientes; su mirada petrifica.', 'quiz'], ['mandragora', 'Mandrágora', '🌱', 'Su llanto es peligroso: usa orejeras.', 'herbologia'], ['snitch', 'Snidget dorado', '🐤', 'El pájaro que inspiró la snitch.', 'quiz'],
    ['elfo', 'Elfo doméstico', '🧝', 'Sirve en casas mágicas; Dobby fue libre.', 'quiz'], ['duende', 'Duende de Gringotts', '🏦', 'Guardianes del banco de los magos.', 'quiz'], ['gnomo', 'Gnomo de jardín', '🍄', 'Hay que desgnomizar el jardín.', 'quiz']
  ].map(([id, n, e, d, w]) => ({ id, n, e, d, w }));
  V8.BEASTS = BEASTS;
  V8.learnSpell = (id, silent) => { const s = st(); const sp = SPELLS.find(x => x.id === id); if (!sp || s.spells.includes(id)) return false; s.spells.push(id); save(); if (!silent) toast(`Nuevo hechizo en tu libro: <b>${sp.n}</b>`, sp.i); if (s.spells.length >= 10) unlock('v8spells10'); if (s.spells.length >= SPELLS.length) unlock('v8spellsAll'); renderBadge(); return true; };
  V8.discover = (id, silent) => { const s = st(); const b = BEASTS.find(x => x.id === id); if (!b || s.beasts.includes(id)) return false; s.beasts.push(id); save(); if (!silent) toast(`Nueva criatura en tu bestiario: <b>${b.n}</b>`, b.e); if (s.beasts.length >= 15) unlock('v8beasts15'); if (s.beasts.length >= BEASTS.length) unlock('v8beastsAll'); return true; };
  // se aprenden al responder bien preguntas sobre ellos
  const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  V8.on('answer', ({ ok, q, movieId }) => {
    if (!ok || !q) return;
    const t = norm(q.q + ' ' + q.a);
    SPELLS.forEach(sp => { if (t.includes(norm(sp.n))) V8.learnSpell(sp.id); });
    BEASTS.forEach(b => { if (b.w === 'quiz' || b.w === 'herbologia' || b.w === 'dcao') { const k = norm(b.n.split(' ')[0]); if (k.length > 4 && t.includes(k)) V8.discover(b.id); } });
    // medallas por película
    if (movieId && movieId >= 1 && movieId <= 8) { const s = st(), k = hash(q.q).toString(36), arr = s.medals[movieId] = s.medals[movieId] || []; if (!arr.includes(k)) { arr.push(k); save(); const total = MOVIES[movieId - 1].q.length; if (arr.length === total) { unlock('v8medal'); toast(`¡Medalla de oro de ${MOVIES[movieId - 1].title}!`, '🏅'); fireConfetti({ particleCount: 140, spread: 100 }); } } }
  });
  V8.on('spell', ({ name }) => { const sp = SPELLS.find(x => norm(x.n) === norm(name)); if (sp) V8.learnSpell(sp.id); });
  if (typeof toggleLumosMode === 'function') { const _l = toggleLumosMode; toggleLumosMode = function () { const r = _l.apply(this, arguments); V8.learnSpell('lumos'); return r; }; }
  if (typeof castByVoice === 'function') { const _c = castByVoice; castByVoice = function (txt) { const r = _c.apply(this, arguments); if (r) SPELLS.forEach(sp => { if (norm(txt).includes(norm(sp.n))) V8.learnSpell(sp.id); }); return r; }; }

  /* =====================================================================
     DIARIO DE TOM RIDDLE (un capítulo por semana)
  ===================================================================== */
  const DIARY = [
    { t: 'La tinta que responde', lines: ['Escribes «Hola» en la primera página… La tinta desaparece.', 'Aparecen letras que no escribiste: «¿Quién eres? Nadie había escrito aquí en cincuenta años.»', 'El diario quiere saber tu casa. Parece amable… demasiado amable.'], q: ['¿Qué deberías hacer con un diario que responde solo?', 'Contárselo a un profesor', ['Contarle todos tus secretos', 'Esconderlo bajo la cama', 'Regalárselo a un amigo']] },
    { t: 'El recuerdo del pasillo', lines: ['El diario te ofrece «mostrarte algo».', 'Las páginas giran y caes dentro de un recuerdo: un pasillo antiguo, alumnos susurrando.', 'Ves a un prefecto muy serio mirando hacia el baño del segundo piso.'], q: ['¿Quién vive en el baño del segundo piso?', 'Myrtle la Llorona', ['Peeves', 'Nick Casi Decapitado', 'La Dama Gris']] },
    { t: 'La palabra en pársel', lines: ['Esta noche la tinta está inquieta.', 'Aparece un dibujo de una serpiente y una palabra que no entiendes.', '«Solo quien habla con las serpientes puede abrir la puerta», escribe el diario.'], q: ['¿Cómo se llama el idioma de las serpientes?', 'Pársel', ['Sirenio', 'Duendigüense', 'Runas antiguas']] },
    { t: 'Las arañas huyen', lines: ['En el recuerdo de hoy, una fila de arañas sale corriendo del castillo.', 'El diario dice: «Ellas saben lo que vive en las cañerías».', 'Sientes que alguien te observa desde el lavamanos.'], q: ['¿A qué le temen las arañas?', 'Al basilisco', ['A los dementores', 'A los centauros', 'A los gnomos']] },
    { t: 'Un nombre que se reordena', lines: ['Las letras de un nombre flotan sobre la página.', 'Se mueven y forman otra frase, como un anagrama.', 'El diario sonríe, aunque un diario no puede sonreír.'], q: ['¿Qué nombre se esconde en el anagrama del diario?', 'Lord Voldemort', ['Salazar Slytherin', 'Gellert Grindelwald', 'Lucius Malfoy']] },
    { t: 'La Cámara', lines: ['Bajas por un tubo largo y frío.', 'Al fondo, una estatua enorme de un mago antiguo.', 'El diario ya no pregunta: ordena. Es hora de ser valiente.'], q: ['¿Quién construyó la Cámara de los Secretos?', 'Salazar Slytherin', ['Godric Gryffindor', 'Merlín', 'Helga Hufflepuff']] },
    { t: 'El fénix llega', lines: ['Un canto llena la cámara y aparece un ave de fuego.', 'Trae un sombrero viejo… y dentro brilla una espada.', 'La esperanza vuelve.'], q: ['¿Qué espada sale del Sombrero Seleccionador?', 'La espada de Gryffindor', ['La espada de Slytherin', 'La espada de Merlín', 'La espada de Hufflepuff']] },
    { t: 'El final del diario', lines: ['Tomas el colmillo y lo clavas en las páginas.', 'La tinta se derrama como un río negro y el diario grita.', 'Ganaste. El diario ya no volverá a hablar… ¿o sí?'], q: ['¿Con qué se destruyó el diario?', 'Con un colmillo de basilisco', ['Con fuego maldito', 'Con un hechizo Reducto', 'Con la Varita de Saúco']] }
  ];
  V8.DIARY = DIARY;
  const riddleUnlocked = () => { const s = st(); if (!s.riddle.start) { s.riddle.start = Date.now(); save(); } return Math.min(DIARY.length, 1 + Math.floor((Date.now() - s.riddle.start) / (7 * 86400000))); };
  V8.readDiary = i => {
    const ch = DIARY[i], s = st(), done = s.riddle.read.includes(i); if (!ch || i >= riddleUnlocked()) return;
    const opts = V8.shuffle([ch.q[1], ...ch.q[2]]);
    const body = V8.sheet(`📓 Capítulo ${i + 1}: ${ch.t}`, `<div class="v8-diary"><div id="dyLines"></div><div id="dyQ" class="hidden mt-4"><p class="font-bold">${esc(ch.q[0])}</p><div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">${opts.map(o => `<button class="opt-btn !text-sm" onclick="V8.diaryAns(${i}, this, ${o === ch.q[1]})">${esc(o)}</button>`).join('')}</div></div></div>`);
    let k = 0; const box = $('dyLines');
    const next = () => { if (!$('dyLines')) return; if (k >= ch.lines.length) { $('dyQ').classList.remove('hidden'); return; } const p = document.createElement('p'); p.className = 'ink'; p.textContent = ch.lines[k++]; box.appendChild(p); if (window.V8.speak) V8.speak(p.textContent); setTimeout(next, V8.reduced() ? 100 : 1500); };
    next(); void body; void done;
  };
  V8.diaryAns = (i, btn, ok) => {
    const s = st(); [...btn.parentElement.children].forEach(b => b.disabled = true); btn.classList.add(ok ? 'correct' : 'wrong'); sfx(ok ? 'correct' : 'wrong');
    if (ok && !s.riddle.read.includes(i)) { s.riddle.read.push(i); save(); V8.gold(50, 'Capítulo del diario terminado'); if (s.riddle.read.length === DIARY.length) { unlock('v8diary'); V8.discover('basilisco'); } }
    if (!ok) setTimeout(() => V8.readDiary(i), 1200);
  };

  /* =====================================================================
     AVATAR DE MAGO
  ===================================================================== */
  const AV_OPTS = {
    skin: SK, hair: ['short', 'messy', 'long', 'bun', 'curly', 'braid', 'bald'], hairC: ['#1c1917', '#4a2c17', '#7c2d12', '#c2410c', '#fde68a', '#a8a29e', '#ec4899', '#3b82f6'],
    glasses: ['', 'round', 'square', 'half'], hat: ['', 'pointed', 'witch', 'top'], beard: ['', 'short', 'long'], scar: [false, true]
  };
  const AV_LABEL = { skin: 'Piel', hair: 'Peinado', hairC: 'Color de pelo', glasses: 'Lentes', hat: 'Sombrero', beard: 'Barba', scar: 'Cicatriz' };
  const HAIRN = { short: 'Corto', messy: 'Despeinado', long: 'Largo', bun: 'Moño', curly: 'Rizado', braid: 'Trenza', bald: 'Sin pelo' };
  V8.avatarLook = () => { const s = st(), a = Object.assign({ skin: SK[1], hair: 'messy', hairC: '#4a2c17', glasses: '', hat: '', beard: '', scar: false }, s.avatar || {}); const [s1, s2] = HC[S.house] || ['#57534e', '#a8a29e']; return Object.assign({}, a, { robe: '#1c1917', scarf1: s1, scarf2: s2, hatC: s1, house: S.house || false }); };
  V8.avatarSVG = size => V8.wizard(V8.avatarLook(), size);
  V8.avSet = (k, v) => { const s = st(); s.avatar = Object.assign({}, V8.avatarLook(), s.avatar || {}); s.avatar[k] = v === 'true' ? true : v === 'false' ? false : v; save(); unlock('v8avatar'); V8.goCol('avatar'); placeAvatars(); sfx('tick'); };
  function avatarEditor() {
    const a = V8.avatarLook();
    return `<div class="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-start"><div class="v8-avbig">${V8.avatarSVG(180)}<p class="text-xs text-stone-400 text-center mt-1">Tu bufanda y túnica toman los colores de tu casa.</p></div>
      <div class="space-y-3">${Object.entries(AV_OPTS).map(([k, list]) => `<div><p class="text-[11px] font-bold text-amber-300 mb-1">${AV_LABEL[k]}</p><div class="flex flex-wrap gap-1.5">${list.map(v => {
        const on = String(a[k]) === String(v);
        const label = k === 'skin' || k === 'hairC' ? `<span class="v8-sw" style="background:${v}"></span>` : k === 'hair' ? HAIRN[v] : k === 'glasses' ? ({ '': 'Sin lentes', round: 'Redondos', square: 'Cuadrados', half: 'Media luna' })[v] : k === 'hat' ? ({ '': 'Sin sombrero', pointed: 'Mago', witch: 'Bruja', top: 'Copa' })[v] : k === 'beard' ? ({ '': 'Sin barba', short: 'Corta', long: 'Larga' })[v] : v ? 'Sí' : 'No';
        return `<button class="v8-chip ${on ? 'on' : ''}" onclick="V8.avSet('${k}','${v}')">${label}</button>`; }).join('')}</div></div>`).join('')}</div></div>`;
  }
  // el avatar aparece en el perfil, el duelo y la portada
  function placeAvatars() {
    const card = $('p1Card'); if (card && !(typeof od !== 'undefined' && od.running === false && duel.mode === '2p')) { let a = card.querySelector('.v8-duelav'); if (!a) { a = document.createElement('span'); a.className = 'v8-duelav'; card.prepend(a); } a.innerHTML = V8.avatarSVG(40); }
    const pf = document.querySelector('#v7Profile .v7-idcard'); if (pf && !pf.querySelector('.v8-pfav')) { const d = document.createElement('div'); d.className = 'v8-pfav'; d.title = 'Tu avatar (cámbialo en Colección → Avatar)'; d.innerHTML = V8.avatarSVG(64); d.onclick = () => V8.goCol('avatar'); pf.appendChild(d); } else if (pf) pf.querySelector('.v8-pfav').innerHTML = V8.avatarSVG(64);
  }
  V8.placeAvatars = placeAvatars;
  const _rp = renderProfile;
  renderProfile = function () { const r = _rp.apply(this, arguments); if (currentTab === 'profile') placeAvatars(); return r; };

  /* =====================================================================
     SALA COMÚN (se decora con objetos del Callejón Diagon)
  ===================================================================== */
  const DECOR = [
    ['sofa', 'Sofá de terciopelo', '🛋️', 120, [8, 64, 26]], ['alfombra', 'Alfombra de la casa', '🟥', 90, [35, 82, 30]], ['chimenea', 'Chimenea encantada', '🔥', 0, [70, 50, 22]],
    ['estandarte', 'Estandarte de la casa', '🚩', 80, [42, 12, 14]], ['estante', 'Estante de libros', '📚', 110, [4, 30, 16]], ['planta', 'Planta parlante', '🪴', 60, [88, 66, 12]],
    ['lampara', 'Lámpara flotante', '🏮', 70, [30, 8, 10]], ['cuadro', 'Cuadro que se mueve', '🖼️', 100, [60, 14, 14]], ['trofeos', 'Vitrina de trofeos', '🏆', 150, [88, 30, 14]],
    ['piano', 'Piano que toca solo', '🎹', 200, [12, 54, 18]], ['reloj', 'Reloj de puntos', '⌛', 130, [51, 34, 12]], ['telescopio', 'Telescopio', '🔭', 140, [80, 46, 14]],
    ['ajedrez', 'Mesa de ajedrez', '♟️', 160, [44, 62, 14]], ['jaula', 'Jaula de lechuza', '🦉', 90, [20, 18, 12]], ['caldero', 'Caldero burbujeante', '⚗️', 110, [64, 70, 14]]
  ].map(([id, n, e, price, pos]) => ({ id, n, e, price, pos }));
  V8.DECOR = DECOR;
  V8.buyDecor = id => { const d = DECOR.find(x => x.id === id), s = st(); if (!d || s.owned.includes('d-' + id)) return; if ((S.gold || 0) < d.price) return toast('No te alcanzan los galeones.', '🪙'); S.gold -= d.price; s.owned.push('d-' + id); s.room[id] = true; save(); updateWallet(); sfx('achieve'); toast(`Compraste ${d.n} para tu sala común`, d.e); if (DECOR.every(x => s.owned.includes('d-' + x.id) || x.price === 0)) unlock('v8room'); if (typeof renderShop === 'function' && currentTab === 'shop') renderShop(); };
  V8.toggleDecor = id => { const s = st(); if (!s.owned.includes('d-' + id) && DECOR.find(x => x.id === id).price) return; s.room[id] = !s.room[id]; save(); V8.goCol('sala'); };
  function roomHTML() {
    const s = st(), [c1, c2] = HC[S.house] || ['#57534e', '#a8a29e'], pet = S.pet && typeof PETS !== 'undefined' && PETS[S.pet.type];
    const items = DECOR.filter(d => (d.price === 0 || s.owned.includes('d-' + d.id)) && s.room[d.id] !== false);
    return `<div class="v8-room" style="--c1:${c1};--c2:${c2}"><div class="wall"></div><div class="win"><span>🌙</span></div><div class="floor"></div>
      ${items.map(d => `<span class="it it-${d.id}" style="left:${d.pos[0]}%;top:${d.pos[1]}%;font-size:${d.pos[2] / 4}vmin" title="${esc(d.n)}">${d.e}${d.id === 'chimenea' ? '<i class="fl"></i>' : ''}</span>`).join('')}
      ${pet ? `<span class="it pet" style="left:46%;top:70%">${pet.emoji}</span>` : ''}
      <div class="avatar">${V8.avatarSVG(70)}</div><div class="sign">Sala común de ${esc(S.house || 'tu casa')}</div></div>
      <p class="text-xs text-stone-400 mt-2">Compra muebles en <b>Callejón Diagon → Decoración Mágica</b>. Toca un mueble que tengas para mostrarlo u ocultarlo.</p>
      <div class="flex flex-wrap gap-1.5 mt-2">${DECOR.filter(d => d.price === 0 || s.owned.includes('d-' + d.id)).map(d => `<button class="v8-chip ${s.room[d.id] !== false ? 'on' : ''}" onclick="V8.toggleDecor('${d.id}')">${d.e} ${esc(d.n)}</button>`).join('')}</div>`;
  }

  /* =====================================================================
     TÍTULOS POR LOGROS Y DIPLOMA
  ===================================================================== */
  const ACH_TITLES = [
    ['t8-snitch', 'Cazador de Snitch', () => (S.games.snitch || 0) >= 8], ['t8-potion', 'Maestro de Pociones', () => (S.games.potions || []).length >= 3 || (st().best.caldero || 0) >= 5],
    ['t8-ludo', 'Rey del Ludo', () => (st().best.ludo || 0) >= 5], ['t8-duel', 'Duelista Invicto', () => (S.stats.duelsWon || 0) >= 25], ['t8-cards', 'Coleccionista de Cromos', () => Object.keys(st().cards).length >= 30],
    ['t8-spells', 'Enciclopedia de Hechizos', () => st().spells.length >= 20], ['t8-beasts', 'Magizoólogo', () => st().beasts.length >= 15], ['t8-year7', 'Graduado de Hogwarts', () => (S.xp || 0) >= 4500],
    ['t8-chess', 'Gran Maestro de Ajedrez', () => (S.games.chess || 0) >= 10], ['t8-medal', 'Experto en las 8 películas', () => Object.values(st().medals).filter((a, i) => a.length >= 1).length >= 8]
  ];
  function checkTitles() {
    if (typeof SHOP === 'undefined') return;
    ACH_TITLES.forEach(([id, name, ok]) => {
      let got = false; try { got = ok(); } catch (e) {}
      if (got && !S.owned.includes(id)) { S.owned.push(id); save(); toast(`Nuevo título desbloqueado: <b>${name}</b>`, '🎖️'); }
      if (S.owned.includes(id) && !SHOP.title.items.some(i => i.id === id)) SHOP.title.items.push({ id, name: '🏅 ' + name, price: 0, exclusive: true });
    });
  }
  V8.checkTitles = checkTitles; checkTitles(); setInterval(checkTitles, 15000);
  V8.diploma = () => {
    if ((S.xp || 0) < 4500) return toast('El diploma se entrega al llegar a 7.º año (4500 XP).', '🎓');
    const cv = document.createElement('canvas'); cv.width = 1600; cv.height = 1130; const x = cv.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 1130); g.addColorStop(0, '#f6ead0'); g.addColorStop(1, '#e3cfa4'); x.fillStyle = g; x.fillRect(0, 0, 1600, 1130);
    for (let i = 0; i < 1800; i++) { x.fillStyle = `rgba(120,80,30,${Math.random() * .05})`; x.fillRect(Math.random() * 1600, Math.random() * 1130, 2, 2); }
    x.strokeStyle = '#7c2d12'; x.lineWidth = 10; x.strokeRect(40, 40, 1520, 1050); x.strokeStyle = '#b45309'; x.lineWidth = 3; x.strokeRect(62, 62, 1476, 1006);
    x.textAlign = 'center'; x.fillStyle = '#3b2412';
    x.font = 'bold 64px Cinzel, Georgia, serif'; x.fillText('COLEGIO HOGWARTS', 800, 190);
    x.font = 'italic 34px Georgia, serif'; x.fillText('de Magia y Hechicería', 800, 240);
    x.font = 'bold 54px Cinzel, Georgia, serif'; x.fillStyle = '#7c2d12'; x.fillText('Diploma de Graduación', 800, 360);
    x.fillStyle = '#3b2412'; x.font = '32px Georgia, serif'; x.fillText('Se certifica que', 800, 450);
    x.font = 'bold 76px Georgia, serif'; x.fillStyle = V8.houseColor(S.house); x.fillText(V8.name(), 800, 550);
    x.fillStyle = '#3b2412'; x.font = '30px Georgia, serif';
    x.fillText(`de la casa ${S.house || ''}, completó sus siete años de estudios mágicos`, 800, 625);
    x.fillText(`con ${S.xp} puntos de experiencia y ${(S.ach || []).length} logros obtenidos.`, 800, 670);
    x.font = 'italic 26px Georgia, serif'; x.fillText(new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }), 800, 740);
    [[420, 'Directora del Colegio'], [1180, 'Jefe de la casa']].forEach(([px, t]) => { x.strokeStyle = '#3b2412'; x.lineWidth = 2; x.beginPath(); x.moveTo(px - 180, 900); x.lineTo(px + 180, 900); x.stroke(); x.font = 'italic 40px "Brush Script MT", cursive'; x.fillText(px < 800 ? 'M. McGonagall' : 'Firma mágica', px, 885); x.font = '22px Georgia, serif'; x.fillText(t, px, 935); });
    x.beginPath(); x.arc(800, 920, 70, 0, 7); x.fillStyle = '#991b1b'; x.fill(); x.fillStyle = '#fde68a'; x.font = 'bold 54px Georgia, serif'; x.fillText('H', 800, 940);
    x.font = '18px Georgia, serif'; x.fillStyle = '#78350f'; x.fillText('Hogwarts Magic Experience · proyecto de fans sin fines de lucro', 800, 1050);
    const a = document.createElement('a'); a.download = 'diploma-hogwarts.png'; a.href = cv.toDataURL('image/png'); a.click();
    unlock('v8diploma'); sfx('levelup');
  };

  /* =====================================================================
     PESTAÑA «COLECCIÓN»
  ===================================================================== */
  const COL_TABS = [['cromos', '🐸', 'Cromos'], ['hechizos', '📖', 'Hechizos'], ['bestiario', '🐉', 'Bestiario'], ['medallas', '🏅', 'Medallas'], ['diario', '📓', 'Diario'], ['sala', '🛋️', 'Sala común'], ['avatar', '🧙', 'Avatar']];
  let colTab = 'cromos';
  V8.goCol = t => { V8.closeSheet(); colTab = t || colTab; if (currentTab !== 'coleccion') switchTab('coleccion'); else renderCol(); };
  function renderCol() {
    const box = $('tab-coleccion'); if (!box) return; const s = st();
    const nCards = Object.keys(s.cards).length;
    let body = '';
    if (colTab === 'cromos') body = `<div class="flex flex-wrap items-center gap-2 justify-between"><p class="text-sm text-stone-300">Álbum: <b class="text-amber-300">${nCards}/${CARDS.length}</b> cromos · Ranas sin abrir: <b class="text-emerald-300">${s.frogs || 0}</b></p>
        <div class="flex gap-2"><button class="btn-gold !py-1.5 !text-xs" onclick="V8.openFrog()" ${s.frogs ? '' : 'disabled'}>🐸 Abrir rana</button><button class="btn-ghost !py-1.5 !text-xs" onclick="V8.tradeOpen()">🔄 Cambiar con un amigo</button><button class="btn-ghost !py-1.5 !text-xs" onclick="switchTab('shop');setTimeout(()=>diagonGo('honeydukes'),200)">🛒 Comprar ranas</button></div></div>
        <div class="v8-cardgrid mt-3">${CARDS.map(c => `<div class="relative" onclick="${s.cards[c.id] ? `V8.cardZoom('${c.id}')` : `V8.buyCard('${c.id}')`}">${V8.cardHTML(c, s.cards[c.id] || 0)}</div>`).join('')}</div>`;
    if (colTab === 'hechizos') body = `<p class="text-sm text-stone-300">Aprendidos: <b class="text-amber-300">${s.spells.length}/${SPELLS.length}</b>. Los aprendes al responder bien preguntas sobre ellos, al lanzarlos en el Estudio, en misiones y en los juegos.</p>
        <div class="v8-spellgrid mt-3">${SPELLS.map(sp => s.spells.includes(sp.id) ? `<div class="v8-spell">${V8.ph('hechizos', sp.id, 'top')}<span class="ic">${sp.i}</span><b>${sp.n}</b><small>🔊 ${sp.p}</small><p>${sp.u}</p><button onclick="V8.speak && V8.speak('${sp.n}')" class="text-[10px] text-amber-300 underline">Escuchar</button></div>` : `<div class="v8-spell off"><span class="ic">❔</span><b>???</b><p>Hechizo por descubrir</p></div>`).join('')}</div>`;
    if (colTab === 'bestiario') body = `<p class="text-sm text-stone-300">Criaturas descubiertas: <b class="text-amber-300">${s.beasts.length}/${BEASTS.length}</b>. Explora el Bosque Prohibido, el Lago Negro, Defensa Contra las Artes Oscuras y el Laberinto.</p>
        <div class="v8-spellgrid mt-3">${BEASTS.map(b => s.beasts.includes(b.id) ? `<div class="v8-spell">${V8.ph('criaturas', b.id, 'top')}<span class="ic">${b.e}</span><b>${b.n}</b><p>${b.d}</p></div>` : `<div class="v8-spell off"><span class="ic">❔</span><b>???</b><p>Pista: ${({ bosque: 'en el Bosque Prohibido', lago: 'en el Lago Negro', dcao: 'en Defensa Contra las Artes Oscuras', laberinto: 'en el Laberinto del Torneo', quiz: 'respondiendo preguntas', herbologia: 'en Herbología' })[b.w]}</p></div>`).join('')}</div>`;
    if (colTab === 'medallas') body = `<p class="text-sm text-stone-300">Responde bien <b>todas</b> las preguntas de una película (en distintas partidas) para ganar su medalla de oro.</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">${MOVIES.map((m, i) => { const have = (s.medals[i + 1] || []).length, tot = m.q.length, pct = Math.round(have / tot * 100); return `<div class="v8-medal ${pct >= 100 ? 'gold' : ''}" onclick="startQuiz(${i + 1})"><div class="disc" style="--p:${pct}%"><span>${m.icon}</span></div><b>${esc(m.title)}</b><small>${have}/${tot} · ${pct}%</small></div>`; }).join('')}</div>`;
    if (colTab === 'diario') { const un = riddleUnlocked(); body = `<p class="text-sm text-stone-300">Un capítulo nuevo cada semana. Lee la historia y responde el acertijo para seguir.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">${DIARY.map((c, i) => `<button class="v8-dentry ${i < un ? '' : 'off'} ${s.riddle.read.includes(i) ? 'done' : ''}" ${i < un ? `onclick="V8.readDiary(${i})"` : 'disabled'}><span>${s.riddle.read.includes(i) ? '✅' : i < un ? '📖' : '🔒'}</span><b>Capítulo ${i + 1}</b><small>${i < un ? esc(c.t) : `Se abre en ${Math.max(1, Math.ceil(((s.riddle.start || Date.now()) + i * 7 * 86400000 - Date.now()) / 86400000))} días`}</small></button>`).join('')}</div>`; }
    if (colTab === 'sala') body = roomHTML();
    if (colTab === 'avatar') body = avatarEditor() + `<div class="mt-4 text-center">${(S.xp || 0) >= 4500 ? '<button class="btn-gold" onclick="V8.diploma()">🎓 Descargar mi diploma de Hogwarts</button>' : `<p class="text-xs text-stone-400">🎓 Al llegar a 7.º año (4500 XP) podrás descargar tu diploma. Te faltan ${4500 - (S.xp || 0)} XP.</p>`}</div>`;
    box.innerHTML = `<div class="text-center space-y-1"><h2 class="text-2xl sm:text-3xl font-bold text-amber-400 font-wizard">Tu Colección ✨</h2><p class="text-stone-300 text-xs">Cromos, hechizos, criaturas, medallas, el diario misterioso, tu sala común y tu avatar.</p></div>
      <div class="v8-tabs">${COL_TABS.map(([id, e, l]) => `<button class="${colTab === id ? 'on' : ''}" onclick="V8.goCol('${id}')"><span>${e}</span>${l}</button>`).join('')}</div>
      <div class="glass-card rounded-3xl p-4 sm:p-5">${body}</div>`;
  }
  V8.renderCol = renderCol;
  V8.cardZoom = id => { const c = CARDS.find(x => x.id === id), s = st(); V8.sheet('🃏 ' + esc(c.name), `<div class="flex flex-col items-center gap-3">${V8.cardHTML(c, s.cards[id], true)}${(s.cards[id] || 0) > 1 ? `<button class="btn-ghost !text-xs" onclick="V8.sellDup('${id}')">Vender un repetido (+${RAR[c.r][2]} 🪙)</button>` : ''}</div>`); };

  // pestaña nueva en el menú
  const sec = document.createElement('section'); sec.id = 'tab-coleccion'; sec.className = 'hidden space-y-4';
  const home = $('tab-home'); if (home) home.parentElement.appendChild(sec);
  TABS.push('coleccion');
  if (typeof NAV !== 'undefined') { NAV.splice(NAV.findIndex(n => n[0] === 'duel') + 1, 0, ['coleccion', 'fa-book-open', 'Colección']); renderNav(); }
  const _sw = switchTab;
  switchTab = function (tab) { const r = _sw(tab); if (tab === 'coleccion') renderCol(); if (tab === 'duel' || tab === 'profile') setTimeout(placeAvatars, 80); return r; };

  /* ---------- insignia con lo pendiente ---------- */
  function renderBadge() { document.querySelectorAll('[data-tab="coleccion"]').forEach(b => { let n = b.querySelector('.v8-dot'); const f = st().frogs || 0; if (!f) { if (n) n.remove(); return; } if (!n) { n = document.createElement('span'); n.className = 'v8-dot'; b.appendChild(n); } n.textContent = f; }); }
  V8.renderBadge = renderBadge; setTimeout(renderBadge, 500);

  Object.assign(ACH, {
    v8cards10: ['🐸', 'Coleccionista', 'Junta 10 cromos distintos'], v8cards30: ['🃏', 'Álbum a la mitad', 'Junta 30 cromos distintos'], v8cardsAll: ['📒', 'Álbum completo', 'Junta todos los cromos'],
    v8legend: ['🌟', '¡Legendario!', 'Consigue un cromo legendario'], v8trade: ['🔄', 'Buen trato', 'Cambia un cromo con un amigo'], v8spells10: ['📖', 'Aprendiz de hechicero', 'Aprende 10 hechizos'],
    v8spellsAll: ['📚', 'Libro completo', 'Aprende todos los hechizos'], v8beasts15: ['🐾', 'Explorador', 'Descubre 15 criaturas'], v8beastsAll: ['🐉', 'Bestiario completo', 'Descubre todas las criaturas'],
    v8medal: ['🏅', 'Medalla de oro', 'Completa todas las preguntas de una película'], v8diary: ['📓', 'Fin del diario', 'Termina el diario de Tom Riddle'], v8avatar: ['🧙', 'Nuevo look', 'Personaliza tu avatar'], v8buycard: ['🛒', 'Coleccionista exigente', 'Compra un cromo en Honeydukes'],
    v8room: ['🛋️', 'Decorador', 'Compra todos los muebles de la sala común'], v8diploma: ['🎓', 'Diploma en mano', 'Descarga tu diploma de Hogwarts']
  });
})();

/* =====================================================================
   FOTOS EN LA BIBLIOTECA Y EN EL LUDO (usa tus imágenes de img/)
===================================================================== */
(() => {
  const V8 = window.V8;
  const n = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
  const CHAR_ID = {}; (V8.CARDS || []).forEach(c => { CHAR_ID[n(c.name)] = c.id; });
  Object.assign(CHAR_ID, { fredygeorgeweasley: 'fredgeorge', nymphadoratonks: 'tonks', dolores: 'umbridge' });
  const BEAST_ID = { basilisco: 'basilisco', dragon: 'dragon', acromantula: 'acromantula', fenix: 'fenix', unicornio: 'unicornio', thestral: 'thestral', centauro: 'centauro', gentedelagua: 'sirena', hipogrifo: 'hipogrifo', duendecillodecornualles: 'duendecillo', grindylow: 'grindylow', dementor: 'dementor', boggart: 'boggart', inferius: 'inferi', elfodomestico: 'elfo', mandragora: 'mandragora' };
  function photos() {
    const body = $('libBody'); if (!body) return;
    body.querySelectorAll('.glass-card').forEach(card => {
      if (card.dataset.v8) return; card.dataset.v8 = 1;
      const nameEl = card.querySelector('.font-wizard'); if (!nameEl) return;
      const key = n(nameEl.textContent), cid = CHAR_ID[key], bid = BEAST_ID[key];
      if (cid) { const av = card.querySelector('span.rounded-full'); if (av) { av.classList.add('v8-libav'); av.insertAdjacentHTML('beforeend', V8.ph('personajes', cid)); } }
      else if (bid) card.insertAdjacentHTML('afterbegin', `<div class="v8-libimg">${V8.ph('criaturas', bid)}</div>`);
    });
  }
  if (typeof renderLibrary === 'function') { const _rl = renderLibrary; renderLibrary = function () { const r = _rl.apply(this, arguments); photos(); return r; }; }
})();
