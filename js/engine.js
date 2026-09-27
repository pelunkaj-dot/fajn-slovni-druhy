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

export function novaVeta(veta, cil, aktivni) {
  const cile = new Set();
  veta.slova.forEach((s, i) => { if (s.d === cil) cile.add(i); });
  return { veta, cil, aktivni, cile, nalezene: new Set(), spatne: [], chyby: 0, hotovo: false, odhaleno: false };
}

// Vrátí { typ, krok } – typ: 'zasah' | 'chyba' | 'nic'; krok: 0 nic, 1 zkus znovu, 2 nabídni nápovědu, 3 odhal
export function klik(stav, i) {
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
