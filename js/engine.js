// Logika jedné věty v lovu a vyhodnocení série. Bez DOM, testovatelné v Node.
//
// Postup při chybě (platí v celé platformě):
//   1. chyba → „Zkus to znovu“ (bez nápovědy)
//   2. chyba → nabídne se tlačítko Nápověda
//   3. chyba → ukáže se správná odpověď

export const DELKA_SERIE = 8;
export const PRAH_USPECHU = 0.8;    // úspěšnost série nutná pro zisk území
export const OBLASTI = 20;          // oblastí ve světě
export const DOKONCENI = 13;        // 65 % území = svět dokončen

// Složený tvar (psal jsem, budu psát) je skupina slov se stejným `g`. Hraje se jako jeden celek,
// zastupuje ho první slovo skupiny.
export function reprezentant(veta, i) {
  const g = veta.slova[i] && veta.slova[i].g;
  return g ? veta.slova.findIndex(s => s.g === g) : i;
}
export function clenove(veta, i) {
  const g = veta.slova[i] && veta.slova[i].g;
  return g ? veta.slova.flatMap((s, j) => (s.g === g ? [j] : [])) : [i];
}

export function novaVeta(veta, cil, aktivni) {
  const cile = new Set();
  veta.slova.forEach((s, i) => { if (s.d === cil) cile.add(reprezentant(veta, i)); });
  return { veta, cil, aktivni, cile, nalezene: new Set(), spatne: [], chyby: 0, hotovo: false, odhaleno: false };
}

// Vrátí { typ, krok } – typ: 'zasah' | 'chyba' | 'nic'; krok: 0 nic, 1 zkus znovu, 2 nabídni nápovědu, 3 odhal
export function klik(stav, j) {
  const i = reprezentant(stav.veta, j);
  const s = stav.veta.slova[i];
  if (stav.hotovo || !s || !stav.aktivni.includes(s.d) || stav.nalezene.has(i)) return { typ: 'nic', krok: 0 };
  if (stav.cile.has(i)) {
    stav.nalezene.add(i);
    if (stav.nalezene.size === stav.cile.size) stav.hotovo = true;
    return { typ: 'zasah', krok: 0 };
  }
  stav.chyby += 1;
  stav.spatne.push(i);
  if (stav.chyby >= 3) { stav.hotovo = true; stav.odhaleno = true; }
  return { typ: 'chyba', krok: Math.min(stav.chyby, 3) };
}

export function zbyva(stav) {
  return stav.cile.size - stav.nalezene.size;
}

// 'ciste' | 'chyba' | 'odhaleno'
export function vysledekVety(stav) {
  if (stav.odhaleno) return 'odhaleno';
  return stav.chyby ? 'chyba' : 'ciste';
}

export function bodyZaVetu(stav, sekund, limit) {
  if (stav.odhaleno) return 0;
  const zaklad = stav.cile.size * 10 - stav.chyby * 5;
  const cas = Math.max(0, Math.round((limit - sekund) / 2));
  return Math.max(0, zaklad) + (stav.chyby ? 0 : cas);
}

export function limitVety(stav) {
  return 6 + 3 * stav.cile.size;
}

// Úspěšnost série: čistá věta 1, věta s chybou 0,5, odhalená 0.
export function uspesnost(vysledky) {
  if (!vysledky.length) return 0;
  const body = vysledky.reduce((s, v) => s + (v === 'ciste' ? 1 : v === 'chyba' ? 0.5 : 0), 0);
  return body / vysledky.length;
}

export function serieUspesna(vysledky) {
  return vysledky.length === DELKA_SERIE && uspesnost(vysledky) >= PRAH_USPECHU;
}

// ---------- Stavba mostu: urči druh každého slova ve větě, zleva doprava ----------

export function novyMost(veta, aktivni) {
  const poradi = [];
  veta.slova.forEach((s, i) => { const r = reprezentant(veta, i); if (aktivni.includes(s.d) && !poradi.includes(r)) poradi.push(r); });
  return { veta, aktivni, poradi, krok: 0, chybyTed: 0, chyby: 0, odhalene: [], spatne: [], hotovo: poradi.length === 0 };
}

export const aktualniSlovo = m => m.poradi[m.krok];

// Vrátí { typ: 'zasah' | 'chyba' | 'nic', krok (u chyby 1–3) }. Po zásahu i po odhalení se jde na další slovo.
export function tip(m, druh) {
  if (m.hotovo) return { typ: 'nic', krok: 0 };
  const i = aktualniSlovo(m);
  if (m.veta.slova[i].d === druh) {
    posun(m);
    return { typ: 'zasah', krok: 0 };
  }
  m.chyby += 1;
  m.chybyTed += 1;
  if (!m.spatne.includes(i)) m.spatne.push(i);
  const krok = Math.min(m.chybyTed, 3);
  if (krok === 3) { m.odhalene.push(i); posun(m); }
  return { typ: 'chyba', krok };
}

function posun(m) {
  m.krok += 1;
  m.chybyTed = 0;
  if (m.krok >= m.poradi.length) m.hotovo = true;
}

export function vysledekMostu(m) {
  if (m.odhalene.length) return 'odhaleno';
  return m.chyby ? 'chyba' : 'ciste';
}

export function bodyZaMost(m, sekund, limit) {
  const zaklad = (m.poradi.length - m.odhalene.length) * 5 - m.chyby * 2;
  const cas = m.chyby ? 0 : Math.max(0, Math.round((limit - sekund) / 2));
  return Math.max(0, zaklad) + cas;
}

export function limitMostu(m) {
  return 4 + 3 * m.poradi.length;
}
