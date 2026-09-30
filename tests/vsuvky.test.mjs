// Testy výběru didaktických vsuvek. Spuštění: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import * as vs from '../js/vsuvky.js';

const VSUVKY = [{ id: 'v-2-6', druhy: [2, 6] }, { id: 'v-6', druhy: [6] }, { id: 'v-1', druhy: [1] }];
const chyba = (d, zvoleno = null) => ({ d, zvoleno, ok: false });

test('opakovaná stejná záměna spustí vysvětlení dvojice (v obou směrech)', () => {
  const p = vs.novaPamet();
  vs.sleduj(p, chyba(6, 2));
  vs.sleduj(p, chyba(2, 6));
  assert.equal(vs.vyber(p, VSUVKY), null);
  vs.sleduj(p, chyba(6, 2));
  assert.equal(vs.vyber(p, VSUVKY).id, 'v-2-6');
});

test('chyby v jednom druhu bez společné dvojice spustí vysvětlení druhu', () => {
  const p = vs.novaPamet();
  vs.sleduj(p, chyba(6, 2));
  vs.sleduj(p, chyba(6, 1));
  vs.sleduj(p, chyba(6)); // slovo se ukázalo, nic nezvolil
  assert.equal(vs.vyber(p, VSUVKY).id, 'v-6');
});

test('po ukázání se chyby zapomenou a vsuvka se v sezení neopakuje', () => {
  const p = vs.novaPamet();
  for (let i = 0; i < 3; i++) vs.sleduj(p, chyba(6, 2));
  const v = vs.vyber(p, VSUVKY);
  vs.ukazano(p, v);
  assert.equal(vs.vyber(p, VSUVKY), null);
  for (let i = 0; i < 3; i++) vs.sleduj(p, chyba(6, 2));
  // dvojice už byla, zbývá vysvětlení druhu 6
  assert.equal(vs.vyber(p, VSUVKY).id, 'v-6');
});

test('staré chyby vypadnou z okna, neexistující vsuvka se přeskočí', () => {
  const p = vs.novaPamet();
  for (let i = 0; i < 2; i++) vs.sleduj(p, chyba(1, 5));
  for (let i = 0; i < vs.OKNO; i++) vs.sleduj(p, { d: 5, ok: true });
  vs.sleduj(p, chyba(1, 5));
  assert.equal(vs.vyber(p, VSUVKY), null);
  const q = vs.novaPamet();
  for (let i = 0; i < 3; i++) vs.sleduj(q, chyba(1, 5)); // v-1-5 v datech není → v-1
  assert.equal(vs.vyber(q, VSUVKY).id, 'v-1');
});

test('ve světě 1 se nenabízí druh, který se tam nehraje', () => {
  const V = [{ id: 'v-2', druhy: [2], moznosti: [2, 6] }, { id: 'v-2-6', druhy: [2, 6], moznosti: [2, 6] }];
  const p = vs.novaPamet();
  for (let i = 0; i < 3; i++) vs.sleduj(p, chyba(2, 5));
  const v = vs.vyber(p, V, [1, 2, 5]);
  assert.equal(v.id, 'v-2');
  assert.deepEqual(v.moznosti, [2, 5]); // místo příslovce nejčastější záměna
  assert.deepEqual(V[0].moznosti, [2, 6]); // data se nemění
  const q = vs.novaPamet();
  for (let i = 0; i < 3; i++) vs.sleduj(q, chyba(2, 6));
  assert.equal(vs.vyber(q, V, [1, 2, 5]).id, 'v-2'); // dvojice s příslovcem ve světě 1 ne
});
