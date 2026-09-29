// Opakování s rozestupy (Leitnerovy krabičky).
// Položka = slovo + druh (např. „pes|1“). Chyba vrací položku do krabičky 0,
// takže se objeví hned v dalších větách; úspěch ji posouvá na delší interval.

const MIN = 60e3, DEN = 864e5;
export const INTERVALY = [0, 10 * MIN, DEN, 3 * DEN, 7 * DEN, 21 * DEN];
const NEDAVNE = 15; // tolik posledních vět se neopakuje

export function klic(slovo) {
  return `${(slovo.l || slovo.t).toLowerCase()}|${slovo.d}`;
}

export function novyStav() {
  return { polozky: {}, nedavne: [] };
}

export function uspech(stav, k, ted = Date.now()) {
  const p = stav.polozky[k] || { box: 0, chyby: 0, dalsi: 0 };
  if (ted >= p.dalsi) p.box = Math.min(p.box + 1, INTERVALY.length - 1);
  p.dalsi = ted + INTERVALY[p.box];
  stav.polozky[k] = p;
}

export function chyba(stav, k, ted = Date.now()) {
  const p = stav.polozky[k] || { box: 0, chyby: 0, dalsi: 0 };
  p.box = 0;
  p.chyby += 1;
  p.dalsi = ted;
  stav.polozky[k] = p;
}

// Jak moc slovo „chce“ na řadu: nové 1, splatné 2+ (víc, když je slabé), jinak 0.
export function naleha(stav, k, ted = Date.now()) {
  const p = stav.polozky[k];
  if (!p) return 1;
  if (ted < p.dalsi) return 0;
  return 2 + (p.box === 0 ? 3 : 0) + Math.min(p.chyby, 3) * 0.5;
}

export function skoreVety(stav, veta, aktivni, ted = Date.now()) {
  return veta.slova.reduce((s, sl) => s + (aktivni.includes(sl.d) ? naleha(stav, klic(sl), ted) : 0), 0);
}

// Vybere n vět: přednost mají věty se slovy, která jsou na řadě; nedávné se vynechají.
export function vyberVety(stav, vety, aktivni, n, nahoda = Math.random, ted = Date.now()) {
  const nedavne = new Set(stav.nedavne);
  let kandidati = vety.filter(v => !nedavne.has(v.id) && v.slova.some(s => aktivni.includes(s.d)));
  if (kandidati.length < n) kandidati = vety.filter(v => v.slova.some(s => aktivni.includes(s.d)));
  return kandidati
    .map(v => ({ v, s: skoreVety(stav, v, aktivni, ted) + nahoda() * 1.5 }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map(x => x.v);
}

export function zapamatujVetu(stav, id) {
  stav.nedavne = [id, ...stav.nedavne.filter(x => x !== id)].slice(0, NEDAVNE);
}

// Který druh ve větě lovit: ten, jehož slova jsou nejvíc na řadě.
export function vyberCil(stav, veta, aktivni, nahoda = Math.random, ted = Date.now()) {
  const skore = {};
  for (const s of veta.slova) {
    if (!aktivni.includes(s.d)) continue;
    skore[s.d] = (skore[s.d] || 0) + naleha(stav, klic(s), ted) + nahoda() * 0.8;
  }
  return +Object.entries(skore).sort((a, b) => b[1] - a[1])[0][0];
}

// Svět 5: z lovených slov vybere poddruh (např. přivlastňovací), nebo '' když slova poddruh nemají.
export function vyberPoddruh(veta, cil, nahoda = Math.random) {
  const p = [...new Set(veta.slova.filter(s => s.d === cil && s.p).map(s => s.p))];
  return p.length ? p[Math.floor(nahoda() * p.length)] : '';
}
