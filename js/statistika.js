// Statistika a hodnocení: zápis odpovědí, hvězdičky za sérii, zvládnutí druhů, odznaky, heslo rodičů.
// Všechno zůstává v zařízení (localStorage). Po dnech se drží souhrn za DNU dní, chyb jen posledních CHYB.
import { uspesnost } from './engine.js';

export const DNU = 90;          // tolik dní souhrnu se uchovává
export const CHYB = 30;         // tolik posledních chyb vidí rodič
export const OKNO = 30;         // zvládnutí druhu se počítá z tolika posledních odpovědí
export const MAX_SEZENI = 30 * 60e3; // delší sezení (zapomenutá hra) se počítá jen do 30 minut
const DEN = 864e5;

export function novaStatistika() {
  return { dny: {}, okno: {}, celkem: {}, zameny: {}, chyby: [], hvezdy: {}, odznaky: {}, rada: 0, nejRada: 0, spravne: 0, serie: 0, vsuvky: {}, otaznik: { naRade: 0, vyresene: 0 }, rodic: { obnoveno: [] } };
}

// Doplní chybějící části (starší uložený stav, nové položky v budoucnu).
export function doplnit(st) {
  const n = novaStatistika();
  const v = { ...n, ...(st || {}) };
  v.rodic = { ...n.rodic, ...v.rodic };
  return v;
}

// Místní datum „2026-09-30“ (ne UTC – den má končit o půlnoci u dítěte).
export function den(t) {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// poledne daného dne – krokování po dnech pak nepřeskočí den při změně letního času
const poledne = t => { const d = new Date(t); d.setHours(12, 0, 0, 0); return d.getTime(); };
const denSt = (st, ted) => (st.dny[den(ted)] ||= { ok: 0, zle: 0, ms: 0, serie: 0 });

function prorezat(st, ted) {
  const hranice = den(poledne(ted) - DNU * DEN);
  for (const k of Object.keys(st.dny)) if (k < hranice) delete st.dny[k];
}

// Jedna odpověď = první pokus u jednoho slova.
// d = správný druh, zvoleno = druh, který dítě zvolilo (null = nezvolilo nic, slovo se ukázalo),
// veta = texty slov věty (nebo null u samostatných slov), i = index slova ve větě.
export function odpoved(st, { d, zvoleno = null, ok, text, veta = null, i = null, svet = null }, ted = Date.now()) {
  const dd = denSt(st, ted);
  if (ok) dd.ok += 1; else dd.zle += 1;
  const okno = (st.okno[d] ||= []);
  okno.push(ok ? 1 : 0);
  if (okno.length > OKNO) okno.splice(0, okno.length - OKNO);
  const c = (st.celkem[d] ||= { ok: 0, zle: 0 });
  if (ok) c.ok += 1; else c.zle += 1;
  if (ok) {
    st.rada += 1;
    st.nejRada = Math.max(st.nejRada, st.rada);
    st.spravne += 1;
  } else {
    st.rada = 0;
    if (zvoleno && zvoleno !== d) st.zameny[`${d}>${zvoleno}`] = (st.zameny[`${d}>${zvoleno}`] || 0) + 1;
    st.chyby.unshift({ kdy: ted, t: text, d, z: zvoleno, veta, i, svet });
    st.chyby.length = Math.min(st.chyby.length, CHYB);
  }
  prorezat(st, ted);
  return kontrolaOdznaku(st, {}, ted);
}

export function cas(st, ms, ted = Date.now()) {
  if (!(ms > 0)) return;
  denSt(st, ted).ms += Math.min(ms, MAX_SEZENI);
  prorezat(st, ted);
}

// Hvězdičky za sérii. Chybějící výsledky (ztracený hrad) se počítají jako nula.
export function hvezdy(vysledky, delka = vysledky.length) {
  const u = uspesnost(vysledky) * vysledky.length / Math.max(delka, vysledky.length, 1);
  if (u >= 0.95 && !vysledky.includes('odhaleno')) return 3;
  if (u >= 0.8) return 2;
  if (u >= 0.6) return 1;
  return 0;
}

// Zapíše dohranou sérii. kontext: { svet, hvezdy, uspesna, bezZtraty, dokoncene: [čísla dokončených světů] }
export function serie(st, kontext, ted = Date.now()) {
  st.serie += 1;
  denSt(st, ted).serie += 1;
  if (kontext.svet) st.hvezdy[kontext.svet] = (st.hvezdy[kontext.svet] || 0) + (kontext.hvezdy || 0);
  return kontrolaOdznaku(st, kontext, ted);
}

// Ukázaná didaktická vsuvka: kolikrát, kdy naposledy, kolikrát dítě mini-úkol zvládlo.
export function vsuvka(st, id, ok, ted = Date.now()) {
  const v = (st.vsuvky[id] ||= { n: 0, ok: 0, kdy: 0 });
  v.n += 1;
  if (ok) v.ok += 1;
  v.kdy = ted;
}

// Dítě si samo otevřelo vysvětlení („?“): ke slovu na řadě, nebo k už vyřešenému.
export function otaznik(st, typ) {
  st.otaznik = { naRade: 0, vyresene: 0, ...st.otaznik };
  st.otaznik[typ] = (st.otaznik[typ] || 0) + 1;
}

export const hvezdCelkem = st => Object.values(st.hvezdy).reduce((a, b) => a + b, 0);

// ---------- zvládnutí slovních druhů ----------
export const UROVNE = {
  novacek: { nazev: 'Nováček', krok: 0 },
  ucen: { nazev: 'Učeň', krok: 1 },
  pokrocily: { nazev: 'Pokročilý', krok: 2 },
  jistota: { nazev: 'Jistota', krok: 3 },
  mistr: { nazev: 'Mistr', krok: 4 },
};

export function uroven(okno = []) {
  const n = okno.length;
  if (n < 10) return 'novacek';
  const p = okno.reduce((a, b) => a + b, 0) / n;
  if (p < 0.6) return 'ucen';
  if (p < 0.8) return 'pokrocily';
  if (p < 0.95 || n < OKNO) return 'jistota';
  return 'mistr';
}

export const podil = okno => (okno && okno.length ? okno.reduce((a, b) => a + b, 0) / okno.length : null);

// ---------- dny v kuse ----------
// Kolik dní v kuse (končících dnes nebo včera) dítě hrálo.
export function dnyVKuse(st, ted = Date.now()) {
  const hral = k => { const d = st.dny[k]; return d && (d.ok + d.zle > 0 || d.ms > 0); };
  let t = poledne(ted);
  if (!hral(den(t))) t -= DEN;
  let n = 0;
  for (; hral(den(t)); t -= DEN) n += 1;
  return n;
}

// ---------- odznaky ----------
export const ODZNAKY = [
  { id: 'prvni-serie', nazev: 'První výprava', popis: 'Dohraj první sérii.', znak: '⚑', splneno: st => st.serie >= 1 },
  { id: 'tri-hvezdy', nazev: 'Tři hvězdy', popis: 'Získej v sérii tři hvězdy.', znak: '★', splneno: (st, k) => k.hvezdy === 3 },
  { id: 'rada10', nazev: 'Deset v řadě', popis: '10 správných odpovědí za sebou.', znak: '10', splneno: st => st.nejRada >= 10 },
  { id: 'rada25', nazev: 'Pětadvacet v řadě', popis: '25 správných odpovědí za sebou.', znak: '25', splneno: st => st.nejRada >= 25 },
  { id: 'uzemi', nazev: 'Dobyvatel', popis: 'Získej první kousek území.', znak: '◆', splneno: (st, k) => !!k.uspesna },
  ...[1, 2, 3, 4, 5].map(n => ({ id: `svet${n}`, nazev: `Svět ${n} dobyt`, popis: `Dokonči svět ${n}.`, znak: String(n), splneno: (st, k) => (k.dokoncene || []).includes(n) })),
  { id: 'vsechny-svety', nazev: 'Pán všech světů', popis: 'Dokonči všech pět světů.', znak: '♛', splneno: st => [1, 2, 3, 4, 5].every(n => st.odznaky[`svet${n}`]) },
  { id: 'dny3', nazev: 'Tři dny v kuse', popis: 'Hraj tři dny za sebou.', znak: '3d', splneno: (st, k, ted) => dnyVKuse(st, ted) >= 3 },
  { id: 'dny7', nazev: 'Celý týden', popis: 'Hraj sedm dní za sebou.', znak: '7d', splneno: (st, k, ted) => dnyVKuse(st, ted) >= 7 },
  { id: 'sto', nazev: 'Stovka', popis: '100 správných odpovědí.', znak: '100', splneno: st => st.spravne >= 100 },
  { id: 'petset', nazev: 'Pětistovka', popis: '500 správných odpovědí.', znak: '500', splneno: st => st.spravne >= 500 },
  { id: 'tisic', nazev: 'Tisícovka', popis: '1 000 správných odpovědí.', znak: '1k', splneno: st => st.spravne >= 1000 },
  { id: 'mistr1', nazev: 'První mistrovství', popis: 'Dosáhni u jednoho slovního druhu úrovně Mistr.', znak: 'M', splneno: st => Object.values(st.okno).some(o => uroven(o) === 'mistr') },
  { id: 'mistr10', nazev: 'Velmistr', popis: 'Dosáhni úrovně Mistr u všech deseti druhů.', znak: 'VM', splneno: st => Array.from({ length: 10 }, (_, i) => uroven(st.okno[i + 1])).every(u => u === 'mistr') },
  { id: 'obrance', nazev: 'Neprostupný hrad', popis: 'Ubraň hrad bez ztráty jediného života.', znak: '♜', splneno: (st, k) => !!k.bezZtraty },
];

// Udělí nově splněné odznaky, vrátí je (pro oslavu na obrazovce výsledku).
export function kontrolaOdznaku(st, kontext = {}, ted = Date.now()) {
  const nove = [];
  for (const o of ODZNAKY) {
    if (st.odznaky[o.id] || !o.splneno(st, kontext, ted)) continue;
    st.odznaky[o.id] = ted;
    nove.push(o);
  }
  return nove;
}

// ---------- přehled pro rodiče ----------
// Nejčastější záměny: [{ d, z, n }] seřazené sestupně.
export function zameny(st, kolik = 5) {
  return Object.entries(st.zameny)
    .map(([k, n]) => { const [d, z] = k.split('>').map(Number); return { d, z, n }; })
    .sort((a, b) => b.n - a.n)
    .slice(0, kolik);
}

// Posledních n dní (nejstarší první): [{ den, ms, ok, zle }]
export function posledniDny(st, n = 28, ted = Date.now()) {
  const out = [], t = poledne(ted);
  for (let i = n - 1; i >= 0; i--) {
    const k = den(t - i * DEN);
    const d = st.dny[k] || {};
    out.push({ den: k, ms: d.ms || 0, ok: d.ok || 0, zle: d.zle || 0 });
  }
  return out;
}

// Úspěšnost po týdnech (pondělí–neděle), nejstarší první: [{ od, ok, zle, podil|null }]
export function tydny(st, n = 8, ted = Date.now()) {
  const d = new Date(ted);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // pondělí tohoto týdne
  const out = [];
  for (let w = n - 1; w >= 0; w--) {
    const zacatek = new Date(d);
    zacatek.setDate(d.getDate() - 7 * w);
    let ok = 0, zle = 0;
    for (let i = 0; i < 7; i++) {
      const x = new Date(zacatek);
      x.setDate(zacatek.getDate() + i);
      const s = st.dny[den(x.getTime())];
      if (s) { ok += s.ok; zle += s.zle; }
    }
    out.push({ od: den(zacatek.getTime()), ok, zle, podil: ok + zle ? ok / (ok + zle) : null });
  }
  return out;
}

// ---------- heslo rodičů ----------
// Nejde o bezpečnost dat (ta jsou v zařízení), jen o to, aby přehled neotevřelo dítě.
async function otisk(heslo, sul) {
  const data = new TextEncoder().encode(`${sul}:${heslo}`);
  const h = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export const maHeslo = st => !!(st.rodic && st.rodic.hash);

export async function nastavHeslo(st, heslo) {
  const sul = [...crypto.getRandomValues(new Uint8Array(8))].map(b => b.toString(16).padStart(2, '0')).join('');
  st.rodic.sul = sul;
  st.rodic.hash = await otisk(heslo, sul);
}

export async function overHeslo(st, heslo) {
  return maHeslo(st) && (await otisk(heslo, st.rodic.sul)) === st.rodic.hash;
}

// Zapomenuté heslo: smaže ho a zapíše kdy – rodič to pak v přehledu uvidí.
export function obnovHeslo(st, ted = Date.now()) {
  delete st.rodic.hash;
  delete st.rodic.sul;
  st.rodic.obnoveno = [...(st.rodic.obnoveno || []), ted].slice(-5);
}
