// Testy statistiky a hodnocení. Spuštění: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import * as stat from '../js/statistika.js';

const T = new Date(2026, 8, 30, 15, 0).getTime(); // 30. 9. 2026 odpoledne
const DEN = 864e5;

test('hvězdičky podle úspěšnosti série', () => {
  assert.equal(stat.hvezdy(Array(8).fill('ciste')), 3);
  assert.equal(stat.hvezdy([...Array(7).fill('ciste'), 'chyba']), 2);
  assert.equal(stat.hvezdy([...Array(7).fill('ciste'), 'odhaleno']), 2);
  assert.equal(stat.hvezdy([...Array(5).fill('ciste'), 'odhaleno', 'odhaleno', 'odhaleno']), 1);
  assert.equal(stat.hvezdy(['odhaleno', 'odhaleno', 'ciste', 'chyba']), 0);
  // ztracený hrad: chybějící výsledky se počítají jako nula
  assert.equal(stat.hvezdy(Array(9).fill('ciste'), 18), 0);
  // 3 hvězdy nejdou, když se nějaká odpověď ukázala
  assert.equal(stat.hvezdy([...Array(19).fill('ciste'), 'odhaleno'], 20), 2);
});

test('úrovně zvládnutí druhu', () => {
  assert.equal(stat.uroven([]), 'novacek');
  assert.equal(stat.uroven(Array(9).fill(1)), 'novacek');
  assert.equal(stat.uroven([...Array(5).fill(1), ...Array(5).fill(0)]), 'ucen');
  assert.equal(stat.uroven([...Array(7).fill(1), ...Array(3).fill(0)]), 'pokrocily');
  assert.equal(stat.uroven(Array(20).fill(1)), 'jistota'); // mistr až po 30 odpovědích
  assert.equal(stat.uroven(Array(30).fill(1)), 'mistr');
  assert.equal(stat.uroven([...Array(28).fill(1), 0, 0]), 'jistota');
});

test('odpovědi: okno, záměny, chyby, řada', () => {
  const st = stat.novaStatistika();
  for (let i = 0; i < 35; i++) stat.odpoved(st, { d: 1, ok: true, text: 'pes' }, T);
  assert.equal(st.okno[1].length, stat.OKNO);
  assert.equal(st.celkem[1].ok, 35);
  assert.equal(st.nejRada, 35);
  stat.odpoved(st, { d: 6, zvoleno: 2, ok: false, text: 'rychle', veta: ['Běží', 'rychle', '.'], i: 1 }, T);
  assert.equal(st.rada, 0);
  assert.equal(st.nejRada, 35);
  assert.deepEqual(stat.zameny(st), [{ d: 6, z: 2, n: 1 }]);
  assert.equal(st.chyby[0].t, 'rychle');
  assert.equal(st.dny[stat.den(T)].zle, 1);
  for (let i = 0; i < 40; i++) stat.odpoved(st, { d: 1, ok: false, text: 'x' }, T);
  assert.equal(st.chyby.length, stat.CHYB);
});

test('odznaky se udělí jen jednou', () => {
  const st = stat.novaStatistika();
  let nove = [];
  for (let i = 0; i < 10; i++) nove = nove.concat(stat.odpoved(st, { d: 5, ok: true, text: 'běží' }, T));
  assert.deepEqual(nove.map(o => o.id), ['rada10']);
  const s1 = stat.serie(st, { svet: 1, hvezdy: 3, uspesna: true, dokoncene: [1] }, T).map(o => o.id);
  assert.deepEqual(s1, ['prvni-serie', 'tri-hvezdy', 'uzemi', 'svet1']);
  assert.deepEqual(stat.serie(st, { svet: 1, hvezdy: 3, uspesna: true, dokoncene: [1] }, T), []);
  assert.equal(stat.hvezdCelkem(st), 6);
  assert.deepEqual(stat.serie(st, { svet: 5, hvezdy: 1, dokoncene: [1, 2, 3, 4, 5] }, T).map(o => o.id), ['svet2', 'svet3', 'svet4', 'svet5', 'vsechny-svety']);
});

test('dny v kuse a čas', () => {
  const st = stat.novaStatistika();
  for (let i = 0; i < 3; i++) stat.odpoved(st, { d: 1, ok: true, text: 'a' }, T - i * DEN);
  assert.equal(stat.dnyVKuse(st, T), 3);
  assert.equal(stat.dnyVKuse(st, T + DEN), 3); // dnes ještě nehrál – počítá se do včerejška
  assert.equal(stat.dnyVKuse(st, T + 2 * DEN), 0);
  stat.cas(st, 2 * 3600e3, T);
  assert.equal(st.dny[stat.den(T)].ms, stat.MAX_SEZENI);
  const dny = stat.posledniDny(st, 28, T);
  assert.equal(dny.length, 28);
  assert.equal(dny[27].den, stat.den(T));
});

test('staré dny se mažou, týdny se sčítají', () => {
  const st = stat.novaStatistika();
  stat.odpoved(st, { d: 1, ok: true, text: 'a' }, T - 100 * DEN);
  stat.odpoved(st, { d: 1, ok: false, text: 'a' }, T);
  assert.equal(Object.keys(st.dny).length, 1);
  stat.odpoved(st, { d: 1, ok: true, text: 'a' }, T);
  const t = stat.tydny(st, 8, T);
  assert.equal(t.length, 8);
  assert.equal(t[7].podil, 0.5);
  assert.equal(t[0].podil, null);
});

test('heslo rodičů a jeho obnova', async () => {
  const st = stat.novaStatistika();
  assert.equal(stat.maHeslo(st), false);
  await stat.nastavHeslo(st, 'tajne');
  assert.equal(await stat.overHeslo(st, 'tajne'), true);
  assert.equal(await stat.overHeslo(st, 'jine'), false);
  stat.obnovHeslo(st, T);
  assert.equal(stat.maHeslo(st), false);
  assert.deepEqual(st.rodic.obnoveno, [T]);
});
