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

// `poddruh` (svět 5): lovit jen slova daného poddruhu, např. přivlastňovací zájmena.
export function novaVeta(veta, cil, aktivni, poddruh = '') {
  const cile = new Set();
  veta.slova.forEach((s, i) => { if (s.d === cil && (!poddruh || s.p === poddruh)) cile.add(reprezentant(veta, i)); });
  return { veta, cil, poddruh, aktivni, cile, nalezene: new Set(), spatne: [], chyby: 0, hotovo: false, odhaleno: false };
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

export function serieUspesna(vysledky, delka = DELKA_SERIE) {
  return vysledky.length === delka && uspesnost(vysledky) >= PRAH_USPECHU;
}

// ---------- Stavba mostu: urči druh každého slova ve větě, zleva doprava ----------

export function novyMost(veta, aktivni) {
  const poradi = [];
  veta.slova.forEach((s, i) => { const r = reprezentant(veta, i); if (aktivni.includes(s.d) && !poradi.includes(r)) poradi.push(r); });
  return { veta, aktivni, poradi, krok: 0, faze: 'druh', chybyTed: 0, chyby: 0, odhalene: [], spatne: [], hotovo: poradi.length === 0 };
}

export const aktualniSlovo = m => m.poradi[m.krok];

// Vrátí { typ: 'zasah' | 'druh' | 'chyba' | 'nic', krok (u chyby 1–3) }. Po zásahu i po odhalení se jde na další slovo.
// Slovo s poddruhem (svět 5) se určuje ve dvou krocích: nejdřív druh (typ 'druh'), pak poddruh (tipPoddruhu).
// Postup při chybě platí pro každý krok zvlášť.
export function tip(m, druh) {
  if (m.hotovo || m.faze !== 'druh') return { typ: 'nic', krok: 0 };
  const i = aktualniSlovo(m);
  const s = m.veta.slova[i];
  if (s.d === druh) {
    if (s.p) { m.faze = 'poddruh'; m.chybyTed = 0; return { typ: 'druh', krok: 0 }; }
    posun(m);
    return { typ: 'zasah', krok: 0 };
  }
  return chybaMostu(m, i);
}

export function tipPoddruhu(m, poddruh) {
  if (m.hotovo || m.faze !== 'poddruh') return { typ: 'nic', krok: 0 };
  const i = aktualniSlovo(m);
  if (m.veta.slova[i].p === poddruh) {
    posun(m);
    return { typ: 'zasah', krok: 0 };
  }
  return chybaMostu(m, i);
}

function chybaMostu(m, i) {
  m.chyby += 1;
  m.chybyTed += 1;
  if (!m.spatne.includes(i)) m.spatne.push(i);
  const krok = Math.min(m.chybyTed, 3);
  if (krok === 3) { m.odhalene.push(i); posun(m); }
  return { typ: 'chyba', krok };
}

function posun(m) {
  m.krok += 1;
  m.faze = 'druh';
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

// ---------- Padající slova: slovo padá, hráč ho chytí do koše správného druhu ----------

export const DELKA_PADANI = 16;     // slov v jedné sérii

export function novePadani(slova) {
  return { slova, i: 0, chybyTed: 0, vysledky: [], hotovo: slova.length === 0 };
}

export const padajici = p => p.slova[p.i];

// Vrátí { typ: 'zasah' | 'chyba' | 'nic', krok (u chyby 1–3) }. Po třetí chybě se slovo odhalí.
export function tipPadani(p, druh) {
  if (p.hotovo) return { typ: 'nic', krok: 0 };
  if (padajici(p).d === druh) {
    dalsiSlovo(p, p.chybyTed ? 'chyba' : 'ciste');
    return { typ: 'zasah', krok: 0 };
  }
  p.chybyTed += 1;
  const krok = Math.min(p.chybyTed, 3);
  if (krok === 3) dalsiSlovo(p, 'odhaleno');
  return { typ: 'chyba', krok };
}

// Slovo dopadlo na zem, aniž ho hráč chytil – odpověď se ukáže.
export function dopad(p) {
  if (!p.hotovo) dalsiSlovo(p, 'odhaleno');
}

function dalsiSlovo(p, vysledek) {
  p.vysledky.push(vysledek);
  p.i += 1;
  p.chybyTed = 0;
  if (p.i >= p.slova.length) p.hotovo = true;
}

// zbyva = kolik dráhy slovu zbývalo (0–1); rychlé chycení bez chyby dá víc bodů
export function bodyZaSlovo(vysledek, zbyva) {
  if (vysledek === 'ciste') return 5 + Math.round(5 * Math.max(0, Math.min(1, zbyva)));
  return vysledek === 'chyba' ? 2 : 0;
}

// Doba pádu v sekundách: slova se během série zrychlují.
export function dobaPadu(i, n) {
  return 9 - 4.5 * (n > 1 ? i / (n - 1) : 0);
}

// ---------- Obrana hradu: slova jdou po cestě k hradu, věž správného druhu je zastaví ----------

export const VLNY = [5, 6, 7];      // slov ve vlnách jedné série
export const DELKA_OBRANY = VLNY.reduce((a, b) => a + b, 0);
export const ZIVOTY = 5;
const DOBA_CESTY = [18, 15, 12];    // sekund, než slovo dojde k hradu (podle vlny)
const ROZESTUP = [3.5, 2.8, 2.2];   // sekund mezi slovy ve vlně

export function novaObrana(slova, vlny = VLNY) {
  const fronta = [];
  let k = 0;
  vlny.forEach((n, v) => { for (let j = 0; j < n && k < slova.length; j++) fronta.push({ id: k, s: slova[k++], vlna: v }); });
  return { fronta, aktivni: [], vysledky: [], zivoty: ZIVOTY, vlna: 0, pocetVln: vlny.length, cas: 0, dalsi: 0, cekaNaVlnu: false, hotovo: fronta.length === 0 };
}

// Posune hru o dt sekund. Vrátí události: { typ: 'nove' | 'hrad' | 'vlna' | 'konec', slovo }.
export function krokObrany(o, dt) {
  const udalosti = [];
  if (o.hotovo || o.cekaNaVlnu) return udalosti;
  o.cas += dt;
  const dalsiVeVlne = o.fronta[0] && o.fronta[0].vlna === o.vlna;
  if (dalsiVeVlne && o.cas >= o.dalsi) {
    const w = { ...o.fronta.shift(), x: 0, chyby: 0 };
    o.aktivni.push(w);
    o.dalsi = o.cas + ROZESTUP[Math.min(o.vlna, ROZESTUP.length - 1)];
    udalosti.push({ typ: 'nove', slovo: w });
  }
  for (const w of [...o.aktivni]) {
    w.x += dt / DOBA_CESTY[Math.min(w.vlna, DOBA_CESTY.length - 1)];
    if (w.x >= 1) {
      odeber(o, w, 'odhaleno');
      o.zivoty -= 1;
      udalosti.push({ typ: 'hrad', slovo: w });
    }
  }
  udalosti.push(...kontrolaKonce(o));
  return udalosti;
}

function kontrolaKonce(o) {
  if (o.hotovo) return [];
  if (o.zivoty <= 0 || (!o.fronta.length && !o.aktivni.length)) { o.hotovo = true; return [{ typ: 'konec' }]; }
  if (!o.aktivni.length && o.fronta[0].vlna !== o.vlna) { o.cekaNaVlnu = true; return [{ typ: 'vlna' }]; }
  return [];
}

export function dalsiVlna(o) {
  if (!o.cekaNaVlnu) return;
  o.cekaNaVlnu = false;
  o.vlna += 1;
  o.dalsi = o.cas + 1;
}

// Zaměřené slovo: to, které je nejblíž hradu.
export const cilObrany = o => o.aktivni.reduce((a, w) => (!a || w.x > a.x ? w : a), null);

// Výstřel věže druhu `druh` na slovo `id`. Vrátí { typ: 'zasah' | 'chyba' | 'nic', krok, vysledek, udalosti }.
export function vystrel(o, id, druh) {
  const w = o.aktivni.find(x => x.id === id);
  if (o.hotovo || !w) return { typ: 'nic', krok: 0 };
  if (w.s.d === druh) {
    const vysledek = w.chyby ? 'chyba' : 'ciste';
    odeber(o, w, vysledek);
    return { typ: 'zasah', krok: 0, vysledek, udalosti: kontrolaKonce(o) };
  }
  w.chyby += 1;
  const krok = Math.min(w.chyby, 3);
  if (krok < 3) return { typ: 'chyba', krok };
  odeber(o, w, 'odhaleno');
  return { typ: 'chyba', krok, vysledek: 'odhaleno', udalosti: kontrolaKonce(o) };
}

function odeber(o, w, vysledek) {
  o.aktivni = o.aktivni.filter(x => x !== w);
  o.vysledky.push(vysledek);
}

// Obrana hradu ve světech 3–5: z každé věty jedno slovo (u složeného tvaru celá skupina) s odkazem na větu,
// aby hra mohla ukázat kontext. skore(slovo) říká, jak moc slovo „chce“ na řadu (opakování).
export function jednotkyZVet(vety, aktivni, skore = () => 0, nahoda = Math.random) {
  return vety.map(veta => {
    let nej = -1, nejSkore = -Infinity;
    veta.slova.forEach((s, i) => {
      if (!aktivni.includes(s.d) || reprezentant(veta, i) !== i) return;
      const k = skore(s) + (s.v ? 0.5 : 0) + nahoda();
      if (k > nejSkore) { nej = i; nejSkore = k; }
    });
    if (nej < 0) return null;
    const s = veta.slova[nej];
    return { t: clenove(veta, nej).map(j => veta.slova[j].t).join(' '), d: s.d, slovo: s, veta, i: nej };
  }).filter(Boolean);
}
