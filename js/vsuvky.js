// Didaktické vsuvky: kdy hru zastavit a vysvětlit, co se dítěti opakovaně plete.
// Texty jsou v data/vsuvky.json (zdroj korpus/vsuvky.txt, kontroluje Jan).
//
// Sleduje se posledních OKNO odpovědí v tomto sezení (od načtení stránky).
// Přednost má vysvětlení dvojice (např. příslovce × přídavné jméno), když se stejná
// záměna objevila PRAH-krát; jinak vysvětlení druhu, u kterého bylo PRAH chyb.
// Stejná vsuvka se v jednom sezení ukáže nejvýš jednou.

export const PRAH = 3;
export const OKNO = 20;

export function novaPamet() {
  return { odpovedi: [], ukazane: new Set() };
}

// odpoved: { d, zvoleno, ok } – stejná jako do statistiky
export function sleduj(pamet, { d, zvoleno = null, ok }) {
  pamet.odpovedi.push({ d, z: ok || zvoleno === d ? null : zvoleno, ok });
  if (pamet.odpovedi.length > OKNO) pamet.odpovedi.splice(0, pamet.odpovedi.length - OKNO);
}

const klicDvojice = (a, b) => `v-${Math.min(a, b)}-${Math.max(a, b)}`;

function kandidati(pamet) {
  const dvojice = {}, druhy = {};
  for (const o of pamet.odpovedi) {
    if (o.ok) continue;
    if (o.z) { const k = klicDvojice(o.d, o.z); dvojice[k] = (dvojice[k] || 0) + 1; }
    druhy[`v-${o.d}`] = (druhy[`v-${o.d}`] || 0) + 1;
  }
  const serad = m => Object.entries(m).filter(([, n]) => n >= PRAH).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  return [...serad(dvojice), ...serad(druhy)];
}

// Vsuvka, která je na řadě, nebo null. vsuvky = pole z data/vsuvky.json,
// aktivni = druhy hrané v tomto světě (úkol nesmí nabízet druh, který dítě ve světě nezná).
export function vyber(pamet, vsuvky, aktivni = null) {
  const podleId = new Map(vsuvky.map(v => [v.id, v]));
  for (const id of kandidati(pamet)) {
    const v = podleId.get(id);
    if (!v || pamet.ukazane.has(id)) continue;
    if (aktivni && !v.druhy.every(d => aktivni.includes(d))) continue;
    return aktivni ? { ...v, moznosti: moznosti(pamet, v, aktivni) } : v;
  }
  return null;
}

// U vysvětlení jednoho druhu: když druhá nabízená možnost ve světě není, nabídne se druh,
// se kterým si ho dítě nejčastěji pletlo (jinak první jiný hraný druh).
function moznosti(pamet, v, aktivni) {
  if (v.moznosti.every(d => aktivni.includes(d))) return v.moznosti;
  const d = v.druhy[0];
  const cetnost = {};
  for (const o of pamet.odpovedi) if (o.d === d && o.z && aktivni.includes(o.z)) cetnost[o.z] = (cetnost[o.z] || 0) + 1;
  const jiny = +(Object.entries(cetnost).sort((a, b) => b[1] - a[1])[0]?.[0] || aktivni.find(x => x !== d));
  return v.moznosti.map(x => (x === d ? x : jiny));
}

// Po ukázání: zapamatovat a zapomenout chyby, které vsuvku spustily (ať se hned nespustí další o tomtéž).
export function ukazano(pamet, v) {
  pamet.ukazane.add(v.id);
  const [a, b] = v.druhy;
  pamet.odpovedi = pamet.odpovedi.filter(o => o.ok || (b ? !(o.z && klicDvojice(o.d, o.z) === v.id) : o.d !== a));
}
