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
  assert.deepEqual(Object.keys(HLASKY['Nikdo']).sort(), Object.keys(HLASKY['Terezka']).sort());
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

const slozena = { id: 's3-x', slova: [{ t: 'Včera', d: 6 }, { t: 'jsem', d: 5, g: 1 }, { t: 'se', d: 3 }, { t: 'učil', d: 5, g: 1 }, { t: 'psát', d: 5 }] };
const VSE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

test('složený tvar: v lovu jeden celek', () => {
  assert.deepEqual(eng.clenove(slozena, 3), [1, 3]);
  const st = eng.novaVeta(slozena, 5, VSE);
  assert.equal(eng.zbyva(st), 2);            // „jsem učil“ + „psát“
  assert.equal(eng.klik(st, 3).typ, 'zasah'); // kliknutí na „učil“ chytí celý tvar
  assert.equal(eng.klik(st, 1).typ, 'nic');   // „jsem“ už je chycené
  assert.equal(eng.zbyva(st), 1);
  assert.equal(eng.klik(st, 4).typ, 'zasah');
  assert.ok(st.hotovo);
});

test('složený tvar: na mostě se určuje jednou', () => {
  const m = eng.novyMost(slozena, VSE);
  assert.deepEqual(m.poradi, [0, 1, 2, 4]);
  eng.tip(m, 6); eng.tip(m, 5);
  assert.equal(eng.aktualniSlovo(m), 2);      // po „jsem učil“ následuje „se“
  eng.tip(m, 3); eng.tip(m, 5);
  assert.ok(m.hotovo);
  assert.equal(eng.vysledekMostu(m), 'ciste');
});

// ---------- Svět 5: poddruhy ----------
const veta5 = { id: 's5-x', slova: [{ t: 'Můj', d: 3, p: 'privlastnovaci' }, { t: 'pes', d: 1 }, { t: 'mě', d: 3, p: 'osobni' }, { t: 'zná', d: 5 }] };
const AKT_VSE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

test('lov poddruhu: cílem jsou jen slova daného poddruhu', () => {
  const st = eng.novaVeta(veta5, 3, AKT_VSE, 'osobni');
  assert.equal(eng.zbyva(st), 1);
  assert.deepEqual(eng.klik(st, 0), { typ: 'chyba', krok: 1 });
  assert.equal(eng.klik(st, 2).typ, 'zasah');
  assert.ok(st.hotovo);
  assert.equal(srs.vyberPoddruh(veta5, 1), '');
  assert.equal(srs.vyberPoddruh(veta5, 3, () => 0), 'privlastnovaci');
});

test('most s poddruhem: dva kroky, postup při chybě pro každý zvlášť', () => {
  const m = eng.novyMost(veta5, AKT_VSE);
  assert.equal(eng.tipPoddruhu(m, 'privlastnovaci').typ, 'nic');
  assert.deepEqual(eng.tip(m, 1), { typ: 'chyba', krok: 1 });
  assert.deepEqual(eng.tip(m, 3), { typ: 'druh', krok: 0 });
  assert.equal(m.krok, 0);
  assert.equal(eng.tip(m, 3).typ, 'nic');
  assert.deepEqual(eng.tipPoddruhu(m, 'osobni'), { typ: 'chyba', krok: 1 });
  assert.deepEqual(eng.tipPoddruhu(m, 'privlastnovaci'), { typ: 'zasah', krok: 0 });
  assert.equal(m.krok, 1);
  assert.equal(eng.tip(m, 1).typ, 'zasah');
  eng.tip(m, 3);
  eng.tipPoddruhu(m, 'zvratne'); eng.tipPoddruhu(m, 'zvratne');
  assert.deepEqual(eng.tipPoddruhu(m, 'zvratne'), { typ: 'chyba', krok: 3 });
  assert.deepEqual(m.odhalene, [2]);
  assert.equal(m.faze, 'druh');
  assert.equal(eng.vysledekMostu(m), 'odhaleno');
});

test('názvy poddruhů se shodují s druhem', async () => {
  const { nazevDruhu, mnozneDruhu, PODDRUHY } = await import('../js/druhy.js');
  assert.equal(nazevDruhu(3, 'zvratne'), 'zvratné zájmeno');
  assert.equal(mnozneDruhu(4, 'radova'), 'řadové číslovky');
  assert.equal(mnozneDruhu(2, 'tvrde'), 'tvrdá přídavná jména');
  assert.equal(nazevDruhu(5, ''), 'sloveso');
  const zdroj = { 2: ['tvrde', 'mekke', 'privlastnovaci'], 3: ['osobni', 'zvratne', 'privlastnovaci', 'ukazovaci', 'tazaci', 'vztazne', 'neurcite', 'zaporne'], 4: ['zakladni', 'radova', 'druhova', 'nasobna'] };
  for (const d of [2, 3, 4]) assert.deepEqual(Object.keys(PODDRUHY[d]), zdroj[d]);
});

// ---------- Padající slova ----------
test('padání: zásah, chyby a odhalení', () => {
  const p = eng.novePadani([{ t: 'pes', d: 1 }, { t: 'běží', d: 5 }, { t: 'malý', d: 2 }, { t: 'kočka', d: 1 }]);
  assert.deepEqual(eng.tipPadani(p, 1), { typ: 'zasah', krok: 0 });
  assert.deepEqual(eng.tipPadani(p, 1), { typ: 'chyba', krok: 1 });
  assert.deepEqual(eng.tipPadani(p, 5), { typ: 'zasah', krok: 0 });
  eng.tipPadani(p, 1); eng.tipPadani(p, 5);
  assert.deepEqual(eng.tipPadani(p, 1), { typ: 'chyba', krok: 3 });
  eng.dopad(p);
  assert.ok(p.hotovo);
  assert.deepEqual(p.vysledky, ['ciste', 'chyba', 'odhaleno', 'odhaleno']);
  assert.equal(eng.tipPadani(p, 1).typ, 'nic');
  assert.equal(eng.bodyZaSlovo('ciste', 1), 10);
  assert.equal(eng.bodyZaSlovo('odhaleno', 1), 0);
  assert.ok(eng.dobaPadu(0, 16) > eng.dobaPadu(15, 16));
  assert.ok(eng.serieUspesna(Array(16).fill('ciste'), 16));
  assert.ok(!eng.serieUspesna(Array(16).fill('ciste')));
});

test('padání: výběr slov upřednostní slabá slova', () => {
  const st = srs.novyStav(), t = 1e12;
  const slova = [{ t: 'pes', d: 1 }, { t: 'kočka', d: 1 }, { t: 'běží', d: 5 }];
  slova.forEach(s => srs.uspech(st, srs.klic(s), t));
  srs.chyba(st, 'kočka|1', t);
  assert.deepEqual(srs.vyberSlova(st, slova, 1, () => 0, t + 1), [{ t: 'kočka', d: 1 }]);
  assert.equal(srs.vyberSlova(st, slova, 5, Math.random, t + 1).length, 3);
});

// ---------- Obrana hradu ----------
const slovaObrany = [{ t: 'pes', d: 1 }, { t: 'běží', d: 5 }, { t: 'malý', d: 2 }, { t: 'kočka', d: 1 }, { t: 'spí', d: 5 }];

test('obrana: vlny, zásah, chyby a odhalení', () => {
  const o = eng.novaObrana(slovaObrany, [2, 3]);
  assert.equal(eng.krokObrany(o, 0.1)[0].typ, 'nove');
  eng.krokObrany(o, 4);
  assert.equal(o.aktivni.length, 2);
  assert.equal(eng.cilObrany(o).s.t, 'pes');
  assert.deepEqual(eng.vystrel(o, 0, 5), { typ: 'chyba', krok: 1 });
  assert.equal(eng.vystrel(o, 0, 1).vysledek, 'chyba');
  const r = eng.vystrel(o, 1, 5);
  assert.equal(r.vysledek, 'ciste');
  assert.deepEqual(r.udalosti, [{ typ: 'vlna' }]);
  assert.deepEqual(eng.krokObrany(o, 5), []);
  eng.dalsiVlna(o);
  eng.krokObrany(o, 1.1);
  const w = eng.cilObrany(o);
  eng.vystrel(o, w.id, 1); eng.vystrel(o, w.id, 1);
  assert.equal(eng.vystrel(o, w.id, 1).vysledek, 'odhaleno');
  assert.deepEqual(o.vysledky, ['chyba', 'ciste', 'odhaleno']);
});

test('obrana: slovo u hradu ubere život, bez životů konec', () => {
  const o = eng.novaObrana(slovaObrany, [5]);
  let hrad = 0, konec = false;
  for (let t = 0; t < 200 && !o.hotovo; t++) for (const u of eng.krokObrany(o, 1)) { if (u.typ === 'hrad') hrad++; if (u.typ === 'konec') konec = true; }
  assert.ok(konec && o.hotovo);
  assert.equal(hrad, 5);
  assert.equal(o.zivoty, 0);
  assert.ok(!eng.serieUspesna(o.vysledky, eng.DELKA_OBRANY));
});

// ---------- Zvuky a efekty: dostatek variant ----------
test('zvuky: každá kategorie má desítky variant', async () => {
  const { variant } = await import('../js/zvuky.js');
  for (const kat of ['zasah', 'chyba']) assert.ok(variant(kat) >= 100, kat);
  for (const kat of ['odhaleni', 'napoveda', 'hotovo', 'uspech', 'neuspech', 'vlna', 'strela']) assert.ok(variant(kat) >= 20, kat);
});

test('obrana ve vyšších světech: z věty jedno slovo, složený tvar vcelku', () => {
  const v = { id: 's3-x', slova: [{ t: 'Včera', d: 6 }, { t: 'jsem', d: 5, g: 1 }, { t: 'psal', d: 5, g: 1 }, { t: 'dopis', d: 1 }] };
  const j = eng.jednotkyZVet([v], [5], () => 0, () => 0);
  assert.equal(j.length, 1);
  assert.equal(j[0].t, 'jsem psal');
  assert.equal(j[0].d, 5);
  assert.equal(j[0].i, 1);
  const k = eng.jednotkyZVet([v], [1, 5, 6], s => (s.t === 'dopis' ? 5 : 0), () => 0);
  assert.equal(k[0].t, 'dopis');
  assert.equal(eng.jednotkyZVet([v], [9]).length, 0);
});

test('obrana ve větách: stejné slovo se v sérii neopakuje', () => {
  const v = id => ({ id, slova: [{ t: 'Pes', d: 1 }, { t: 'se', d: 3 }, { t: 'myje', d: 5 }] });
  const w = { id: 'x', slova: [{ t: 'Kočka', d: 1 }, { t: 'se', d: 3 }, { t: 'myje', d: 5 }] };
  // skóre nutí vybrat „se“ – smí jen jednou
  const j = eng.jednotkyZVet([v('a'), w, v('b')], [1, 3, 5], s => (s.t === 'se' ? 10 : 0), () => 0);
  const klice = j.map(x => `${x.t.toLowerCase()}|${x.d}`);
  assert.equal(new Set(klice).size, klice.length);
  assert.equal(klice.filter(k => k === 'se|3').length, 1);
});

test('padající slova: nedávná slova dostanou přestávku, chybná se vracejí', () => {
  const st = srs.novyStav(), t = 1e12;
  const slova = ['pes', 'kočka', 'strom', 'dům', 'les', 'řeka'].map(x => ({ t: x, d: 1 }));
  const prvni = srs.vyberSlova(st, slova, 3, () => 0, t);
  srs.zapamatujSlova(st, prvni.map(srs.klic));
  prvni.forEach(s => srs.uspech(st, srs.klic(s), t));
  srs.chyba(st, srs.klic(prvni[0]), t);
  const druha = srs.vyberSlova(st, slova, 3, () => 0, t + 1).map(s => s.t);
  assert.ok(druha.includes(prvni[0].t), 'slovo s chybou se vrací');
  assert.ok(!druha.includes(prvni[1].t) && !druha.includes(prvni[2].t), 'správně určená slova mají přestávku');
  // duplicitní tvar v seznamu se vybere jen jednou
  const dvakrat = srs.vyberSlova(srs.novyStav(), [{ t: 'Pes', d: 1 }, { t: 'pes', d: 1 }, { t: 'les', d: 1 }], 3, () => 0, t);
  assert.equal(dvakrat.length, 2);
});
