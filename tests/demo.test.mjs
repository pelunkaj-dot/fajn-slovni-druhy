import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { vyberVety, novyStav } from '../js/srs.js';
import { serieUspesna } from '../js/engine.js';
import { hvezdy } from '../js/statistika.js';

const json = async p => JSON.parse(await readFile(new URL(p, import.meta.url), 'utf8'));
const demo = await json('../data/demo.json');

test('demo má přesně 12 schválených vět ve třech obtížnostech', async () => {
  assert.deepEqual(Object.keys(demo), ['1', '2', '3']);
  const ids = new Set();
  for (const [n, svet] of Object.entries(demo)) {
    const plna = await json(`../data/svet${n}.json`);
    assert.equal(svet.vety.length, 4);
    assert.deepEqual(svet.aktivni, plna.aktivni);
    for (const veta of svet.vety) {
      assert.ok(!ids.has(veta.id));
      ids.add(veta.id);
      assert.deepEqual(veta, plna.vety.find(v => v.id === veta.id));
    }
  }
  assert.equal(ids.size, 12);
});

test('krátká série vybere všechny čtyři věty a udělí správné hodnocení', () => {
  for (const svet of Object.values(demo)) {
    assert.equal(vyberVety(novyStav(), svet.vety, svet.aktivni, svet.delkaSerie).length, 4);
    const ciste = Array(4).fill('ciste');
    assert.ok(serieUspesna(ciste, svet.delkaSerie));
    assert.equal(hvezdy(ciste, svet.delkaSerie), 3);
    assert.equal(serieUspesna(Array(4).fill('odhaleno'), svet.delkaSerie), false);
  }
});

test('samostatná slova jsou schválená a pocházejí jen z demo vět', async () => {
  const schvalena = await json('../data/slova.json');
  for (const n of ['1', '2']) {
    const klic = s => `${s.t.toLowerCase()}|${s.d}`;
    const veVetach = new Set(demo[n].vety.flatMap(v => v.slova).map(klic));
    const dovolena = new Set(schvalena[n].map(([t, d]) => klic({ t, d })));
    assert.ok(demo[n].slova.length > 0);
    for (const s of demo[n].slova) {
      assert.ok(veVetach.has(klic(s)));
      assert.ok(dovolena.has(klic(s)));
      assert.ok(demo[n].aktivni.includes(s.d));
    }
  }
});
