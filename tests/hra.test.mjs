// Testy herní logiky. Spuštění: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import * as eng from '../js/engine.js';
import * as srs from '../js/srs.js';

const veta = { id: 's1-0001', slova: [{ t: 'Malý', d: 2 }, { t: 'pes', d: 1 }, { t: 'na', d: 7 }, { t: 'dvoře', d: 1 }, { t: 'štěká', d: 5 }] };
const AKT = [1, 2, 5];

test('zásahy dokončí větu', () => {
  const st = eng.novaVeta(veta, 1, AKT);
  assert.equal(eng.klik(st, 1).typ, 'zasah');
  assert.equal(eng.zbyva(st), 1);
  assert.equal(eng.klik(st, 1).typ, 'nic');
  assert.equal(eng.klik(st, 3).typ, 'zasah');
  assert.ok(st.hotovo);
  assert.equal(eng.vysledekVety(st), 'ciste');
});

test('zašedlé slovo nic neudělá', () => {
  const st = eng.novaVeta(veta, 1, AKT);
  assert.equal(eng.klik(st, 2).typ, 'nic');
  assert.equal(st.chyby, 0);
});

test('postup při chybě: nabídka, nápověda, odhalení', () => {
  const st = eng.novaVeta(veta, 1, AKT);
  assert.deepEqual(eng.klik(st, 0), { typ: 'chyba', krok: 1 });
  assert.deepEqual(eng.klik(st, 4), { typ: 'chyba', krok: 2 });
  assert.equal(st.hotovo, false);
  assert.deepEqual(eng.klik(st, 0), { typ: 'chyba', krok: 3 });
  assert.ok(st.hotovo && st.odhaleno);
  assert.equal(eng.vysledekVety(st), 'odhaleno');
  assert.equal(eng.bodyZaVetu(st, 1, 10), 0);
});

test('úspěšnost série nejde proklikat', () => {
  assert.ok(eng.serieUspesna(Array(8).fill('ciste')));
  assert.ok(eng.serieUspesna([...Array(6).fill('ciste'), 'chyba', 'chyba']));
  assert.ok(!eng.serieUspesna([...Array(6).fill('ciste'), 'odhaleno', 'odhaleno']));
  assert.ok(!eng.serieUspesna(Array(8).fill('chyba')));
  assert.ok(!eng.serieUspesna(Array(5).fill('ciste')));
});

test('opakování: chyba vrací slovo hned, úspěch ho odkládá', () => {
  const st = srs.novyStav(), t = 1e12, k = srs.klic(veta.slova[1]);
  assert.equal(k, 'pes|1');
  assert.equal(srs.naleha(st, k, t), 1);
  srs.uspech(st, k, t);
  assert.equal(srs.naleha(st, k, t + 1000), 0);
  srs.chyba(st, k, t);
  assert.ok(srs.naleha(st, k, t) > 2);
});

test('výběr vět upřednostní slabá slova a vynechá nedávné', () => {
  const st = srs.novyStav(), t = 1e12;
  const a = { id: 'a', slova: [{ t: 'kočka', d: 1 }] }, b = { id: 'b', slova: [{ t: 'pes', d: 1 }] }, c = { id: 'c', slova: [{ t: 'myš', d: 1 }] };
  [a, b, c].forEach(v => srs.uspech(st, srs.klic(v.slova[0]), t));
  srs.chyba(st, 'pes|1', t);
  assert.deepEqual(srs.vyberVety(st, [a, b, c], AKT, 1, () => 0, t + 1).map(v => v.id), ['b']);
  srs.zapamatujVetu(st, 'b');
  assert.notEqual(srs.vyberVety(st, [a, b, c], AKT, 1, () => 0, t + 1)[0].id, 'b');
});

test('cíl je druh, který ve větě opravdu je', () => {
  const st = srs.novyStav();
  for (let i = 0; i < 20; i++) assert.ok([1, 2, 5].includes(srs.vyberCil(st, veta, AKT)));
});

test('most: slova se určují postupně, zašedlá se přeskočí', () => {
  const m = eng.novyMost(veta, AKT);
  assert.deepEqual(m.poradi, [0, 1, 3, 4]);
  assert.equal(eng.tip(m, 2).typ, 'zasah');
  assert.equal(eng.aktualniSlovo(m), 1);
  assert.deepEqual(eng.tip(m, 5), { typ: 'chyba', krok: 1 });
  assert.equal(eng.tip(m, 1).typ, 'zasah');
  assert.equal(eng.vysledekMostu(m), 'chyba');
});

test('most: třetí chyba ukáže odpověď a pokračuje dál', () => {
  const m = eng.novyMost(veta, AKT);
  eng.tip(m, 1); eng.tip(m, 5);
  assert.deepEqual(eng.tip(m, 1), { typ: 'chyba', krok: 3 });
  assert.deepEqual(m.odhalene, [0]);
  assert.equal(eng.aktualniSlovo(m), 1);
  ['1', '1', '5'].forEach(d => eng.tip(m, +d));
  assert.ok(m.hotovo);
  assert.equal(eng.vysledekMostu(m), 'odhaleno');
});

test('hlášky: celé kolo bez opakování a bez stejné hlášky na přelomu kol', async () => {
  const { HLASKY, hlaska } = await import('../js/hlasky.js');
  for (const hrdina of ['Matýsek', 'Terezka']) {
    const n = HLASKY[hrdina].vetaCista.length;
    let predchozi = null;
    for (let kolo = 0; kolo < 5; kolo++) {
      const videne = new Set();
      for (let i = 0; i < n; i++) {
        const h = hlaska(hrdina, 'vetaCista');
        assert.ok(!videne.has(h), `${hrdina}: opakování v kole`);
        assert.notEqual(h, predchozi);
        videne.add(h); predchozi = h;
      }
    }
  }
});

test('hlášky: obě postavičky mají všechny skupiny', async () => {
  const { HLASKY } = await import('../js/hlasky.js');
  assert.deepEqual(Object.keys(HLASKY['Matýsek']).sort(), Object.keys(HLASKY['Terezka']).sort());
});

test('hlášky: tvary podle toho, kdo hraje', async () => {
  const { HLASKY, tvar } = await import('../js/hlasky.js');
  assert.equal(tvar('{Zvládl|Zvládla} jsi to!', 'kluk'), 'Zvládl jsi to!');
  assert.equal(tvar('{Zvládl|Zvládla} jsi to!', 'holka'), 'Zvládla jsi to!');
  for (const hrdina of Object.values(HLASKY)) for (const seznam of Object.values(hrdina)) for (const t of seznam) {
    for (const kdo of ['kluk', 'holka']) assert.ok(!/[{}|]/.test(tvar(t, kdo)), `nevyřešený tvar: ${t}`);
  }
});

test('čeština: shoda „všechna/všechny“, „zbývá/zbývají“', async () => {
  const { DRUHY, zbyvaText } = await import('../js/druhy.js');
  const zenske = [4, 7, 8, 9]; // číslovky, předložky, spojky, částice
  for (const [d, x] of Object.entries(DRUHY)) assert.equal(x.vse, zenske.includes(+d) ? 'všechny' : 'všechna', x.mnozne);
  assert.deepEqual([1, 2, 4, 5, 0].map(zbyvaText), ['zbývá 1', 'zbývají 2', 'zbývají 4', 'zbývá 5', 'zbývá 0']);
});
