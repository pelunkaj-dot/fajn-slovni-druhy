// Mapa světů, motivy, ukládání postupu a spuštění režimu.
import { SVETY } from './druhy.js';
import { nactiSvet, nactiSeznam, nactiSlova, nactiVsuvky } from './data.js';
import * as srs from './srs.js';
import { OBLASTI, DOKONCENI } from './engine.js';
import { spustLov } from './rezimy/lov.js';
import { spustMost } from './rezimy/most.js';
import { spustPadani } from './rezimy/padani.js';
import { spustObranu } from './rezimy/obrana.js';
import { avatar } from './postavy.js';
import { KRAJINY, KOTVY, VYHLED } from './krajiny.js';
import { hlaska, nastavHrace } from './hlasky.js';
import { parta } from './rezimy/spolecne.js';
import { nastavZvuk, odemkni, zvuk } from './zvuky.js';
import { efektZasahu } from './efekty.js';
import * as statistika from './statistika.js';
import { ukazSbirku, ukazRodice } from './prehled.js';
import * as vsuvky from './vsuvky.js';

const KLIC = 'fajn-slovni-druhy:v1';
const MOTIVY = { light: 'Světlý', dark: 'Tmavý', girl: 'Dívčí' };
const HRDINOVE = ['Terezka', 'Matýsek'];
const REZIMY = { lov: { nazev: 'Lov', spust: spustLov }, most: { nazev: 'Stavba mostu', spust: spustMost }, padani: { nazev: 'Padající slova', spust: spustPadani }, obrana: { nazev: 'Obrana hradu', spust: spustObranu } };
let DOSTUPNE = []; // světy, které mají data (z data/svety.json)
let VSUVKY = []; // didaktické vsuvky (data/vsuvky.json)
const pametVsuvek = vsuvky.novaPamet(); // co se v tomto sezení plete
let SLOVA = {};    // slova pro Padající slova podle světa (jen světy 1–2)
// Režimy nabízené ve světě: Padající slova jen tam, kde jsou schválená samostatná slova.
// Obrana hradu jde všude: ve světech 1–2 se samostatnými slovy, ve vyšších se slovy z vět.
const rezimySveta = n => Object.entries(REZIMY).filter(([k]) => k !== 'padani' || SLOVA[n]);
const parametry = new URLSearchParams(location.search);
const PLNA = parametry.get('mode') === 'full';

const app = document.getElementById('app');
// url() v CSS proměnné by se bral vůči css/style.css – proto úplná adresa vůči stránce
const cssUrl = cesta => `url("${new URL(cesta, document.baseURI).href}")`;
const cache = {};

function nacti() {
  try { return JSON.parse(localStorage.getItem(KLIC)) || {}; } catch { return {}; }
}
const stav = { hrdina: HRDINOVE[0], postavicky: true, zvuk: true, motiv: 'light', rezim: 'lov', svety: {}, opakovani: srs.novyStav(), ...nacti() };
// Pozdrav podle toho, kdy hráč hrál naposledy (zjistí se jednou při načtení stránky).
const DEN = 864e5;
let pozdrav = !stav.naposledy ? 'pozdravPrvni' : Date.now() - stav.naposledy > 3 * DEN ? 'pozdravPoDlouhe' : 'pozdravZnovu';
stav.naposledy = Date.now();
stav.stat = statistika.doplnit(stav.stat);
nastavHrace(stav.hrac);

function ulozit() {
  try { localStorage.setItem(KLIC, JSON.stringify(stav)); } catch { /* bez úložiště se postup neuchová */ }
}

function nastavMotiv(m) {
  if (!MOTIVY[m]) return;
  stav.motiv = m;
  document.documentElement.dataset.theme = m;
  document.querySelectorAll('.motivy button').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === m));
  ulozit();
}

const svetStav = n => (stav.svety[n] ||= { uzemi: 0, serie: 0 });
// Všechny světy jsou otevřené od začátku – starší žák nemusí procházet lehčí světy.
const hratelny = n => DOSTUPNE.includes(n);
// Kdo mluví: vybraná postavička, nebo nikdo (postavičky vypnuté).
const mluvci = () => (stav.postavicky ? stav.hrdina : 'Nikdo');

// Při prvním spuštění se postavička zeptá, kdo hraje.
function otazkaHrac() {
  app.innerHTML = `
    <section class="mapa uvitani">
      <div class="parta"></div>
      <div class="volba-hrace" role="group" aria-label="Kdo hraje?">
        <button type="button" data-k="holka">Jsem holka</button>
        <button type="button" data-k="kluk">Jsem kluk</button>
      </div>
    </section>`;
  parta(app.querySelector('.parta'), mluvci())(hlaska(mluvci(), 'otazkaHrac'));
  app.querySelectorAll('.volba-hrace button').forEach(b => b.onclick = () => {
    zvuk('vyber');
    stav.hrac = b.dataset.k; nastavHrace(stav.hrac); ulozit(); mapa();
  });
}

function mapa() {
  ukonciSezeni();
  if (!stav.hrac) { otazkaHrac(); return; }
  app.innerHTML = `
    <section class="mapa">
      ${PLNA ? '' : '<p class="ukazka">Ukázková verze: z každého světa si zahraješ malý výběr vět. Plnou verzi najdeš ve FajnCvičebně.</p>'}
      <div class="volba-hrdiny" role="group" aria-label="S kým vyrazíš?">
        ${stav.postavicky ? `<span>S kým vyrazíš?</span>
        ${HRDINOVE.map(h => `<button type="button" data-h="${h}" aria-pressed="${stav.hrdina === h}">${avatar(h)}${h}</button>`).join('')}` : ''}
        <button type="button" class="prepinac-postav" aria-pressed="${!stav.postavicky}">${stav.postavicky ? 'Hrát bez postaviček' : 'Zapnout postavičky'}</button>
        <span class="hraje">Hraje:
          <button type="button" data-k="holka" aria-pressed="${stav.hrac === 'holka'}">holka</button>
          <button type="button" data-k="kluk" aria-pressed="${stav.hrac === 'kluk'}">kluk</button>
        </span>
      </div>
      <div class="sbirka-lista">
        <button type="button" class="otevri-sbirku"><span aria-hidden="true">★</span> ${statistika.hvezdCelkem(stav.stat)} · Moje sbírka</button>
        <button type="button" class="odkaz pro-rodice">Pro rodiče</button>
      </div>
      <div class="parta"></div>
      <div class="cesta-mapou">
        ${VYHLED}
        <svg class="silnice" aria-hidden="true"><path class="okraj"/><path class="povrch"/><path class="stred"/></svg>
        <ol class="svety">
          ${Object.entries(SVETY).map(([n, s]) => kartaSveta(+n, s)).join('')}
        </ol>
      </div>
    </section>`;
  const rekni = parta(app.querySelector('.parta'), mluvci());
  const text = pozdrav ? hlaska(mluvci(), pozdrav) : '';
  pozdrav = '';
  if (text) rekni(text); else app.querySelector('.parta').hidden = true;
  app.querySelector('.prepinac-postav').onclick = () => {
    zvuk('klik');
    stav.postavicky = !stav.postavicky; ulozit();
    pozdrav = stav.postavicky ? 'predstaveni' : '';
    mapa();
  };
  app.querySelectorAll('.hraje button').forEach(b => b.onclick = () => {
    zvuk('klik');
    stav.hrac = b.dataset.k; nastavHrace(stav.hrac); ulozit(); mapa();
  });
  app.querySelectorAll('.volba-hrdiny button[data-h]').forEach(b => b.onclick = () => {
    if (stav.hrdina === b.dataset.h) return;
    zvuk('vyber');
    stav.hrdina = b.dataset.h; ulozit();
    pozdrav = 'predstaveni';
    mapa();
  });
  app.querySelector('.otevri-sbirku').onclick = () => { zvuk('vyber'); ukazSbirku(app, { st: stav.stat, dostupne: DOSTUPNE, zpet: mapa }); };
  app.querySelector('.pro-rodice').onclick = () => { zvuk('klik'); ukazRodice(app, { st: stav.stat, hrac: stav.hrac, vsuvky: VSUVKY, ulozit, zpet: mapa }); };
  app.querySelectorAll('.svety button[data-svet]').forEach(b => b.onclick = () => { zvuk('start'); hraj(+b.dataset.svet, b.dataset.rezim || ''); });
  delete app.dataset.svet;
  app.style.removeProperty('--foto');
  app.style.setProperty('--mapa-pozadi', cssUrl('obrazky/mapa-pozadi.webp'));
  nakresliSilnici();
  if (document.fonts) document.fonts.ready.then(nakresliSilnici);
  animujPostup();
}

// Klikatá cesta krajinou: vede od zastávky ke zastávce (kulaté značky na kartách světů).
function nakresliSilnici() {
  const obal = app.querySelector('.cesta-mapou');
  if (!obal) return;
  const r0 = obal.getBoundingClientRect();
  // zastávka = [x, y středu, spodek karty]; mezi kartami se cesta stáčí k další zastávce
  const body = [...obal.querySelectorAll('.zastavka')].map(z => {
    const r = z.getBoundingClientRect(), k = z.parentElement.getBoundingClientRect();
    return [r.left + r.width / 2 - r0.left, r.top + r.height / 2 - r0.top, k.bottom - r0.top];
  });
  if (body.length < 2) return;
  let d = `M${body[0][0]} ${body[0][1] - 40} L${body[0][0]} ${body[0][1]}`;
  for (let i = 1; i < body.length; i++) {
    const [x0, , dole] = body[i - 1], [x1, y1] = body[i], mezera = y1 - dole;
    d += ` L${x0} ${dole} C${x0} ${dole + mezera * 0.9} ${x1} ${y1 - mezera * 0.9} ${x1} ${y1}`;
  }
  const svg = obal.querySelector('.silnice');
  svg.setAttribute('viewBox', `0 0 ${r0.width} ${r0.height}`);
  svg.querySelectorAll('path').forEach(p => p.setAttribute('d', d));
}
addEventListener('resize', () => { clearTimeout(nakresliSilnici.t); nakresliSilnici.t = setTimeout(nakresliSilnici, 150); });

// Po návratu z úspěšné série se nové oblasti „dobudou“ (zvuk + efekt), po dokončení světa se odkryjí skryté.
// st.videno = kolik oblastí už hráč na mapě viděl.
let casovaceMapy = [];
function animujPostup() {
  casovaceMapy.forEach(clearTimeout);
  casovaceMapy = [];
  let cas = 600;
  const pozdeji = (fn, za) => casovaceMapy.push(setTimeout(fn, za));
  for (const n of DOSTUPNE) {
    const st = svetStav(n);
    const od = st.videno ?? st.uzemi;
    st.videno = st.uzemi;
    if (st.uzemi <= od) continue;
    const karta = app.querySelector(`.svet-${n}`);
    if (!karta) continue;
    pozdeji(() => karta.scrollIntoView({ behavior: 'smooth', block: 'center' }), cas - 500);
    const dlazdice = i => { const el = karta.querySelector(`.uzemi i[data-i="${i}"]`); return el && el.isConnected ? el : null; };
    for (let i = od; i < st.uzemi; i++) {
      pozdeji(() => { const el = dlazdice(i); if (!el) return; el.classList.add('moje', 'nova'); zvuk('uzemi'); efektZasahu(el, n); }, cas);
      cas += 500;
    }
    if (od < DOKONCENI && st.uzemi >= DOKONCENI) {
      for (let i = DOKONCENI; i < OBLASTI; i++) {
        pozdeji(() => { const el = dlazdice(i); if (!el) return; el.classList.remove('ceka'); el.classList.add('odkryta'); zvuk('odkryti'); }, cas);
        cas += 260;
      }
    }
  }
  ulozit();
}

function kartaSveta(n, s) {
  const st = svetStav(n);
  const dokonceno = st.uzemi >= DOKONCENI;
  const videno = st.videno ?? st.uzemi; // nové oblasti se dobarví až animací (animujPostup)
  const oblasti = Array.from({ length: OBLASTI }, (_, i) => {
    const skryta = i >= DOKONCENI;
    if (skryta && !dokonceno) return '';
    const tridy = [i < Math.min(st.uzemi, videno) ? 'moje' : '', skryta ? 'skryta' : '', skryta && videno < DOKONCENI ? 'ceka' : ''];
    return `<i data-i="${i}" class="${tridy.filter(Boolean).join(' ')}"></i>`;
  }).join('');
  let akce;
  if (!DOSTUPNE.includes(n)) akce = '<span class="zamek">Připravujeme</span>';
  else akce = `<div class="akce-sveta">
      <button type="button" data-svet="${n}">Vyrazit</button>
      <span class="jiny-rezim">nebo jen: ${rezimySveta(n).map(([k, r]) => `<button type="button" class="odkaz" data-svet="${n}" data-rezim="${k}">${r.nazev}</button>`).join(' · ')}</span>
    </div>`;
  const procent = Math.round(st.uzemi / OBLASTI * 100);
  return `
    <li class="svet svet-${n}${hratelny(n) ? '' : ' zamceny'}${dokonceno ? ' dokonceny' : ''}">
      <span class="zastavka" aria-hidden="true">${n}${dokonceno ? '<i class="prapor"></i>' : ''}</span>
      ${stav.posledniSvet === n ? `<span class="tady" title="Tady jsi byl${stav.hrac === 'holka' ? 'a' : ''} naposledy">${avatar(stav.postavicky ? stav.hrdina : '', 'maly')}</span>` : ''}
      <div class="krajina" aria-hidden="true">${KRAJINY[n]}</div>
      <div class="obsah">
        <h2><span class="poradi">${n}</span>${s.nazev}</h2>
        <p class="hvezdy" aria-label="Obtížnost ${s.hvezdy} z 5">${'★'.repeat(s.hvezdy)}<span>${'★'.repeat(5 - s.hvezdy)}</span></p>
        <p class="komu">${s.komu}</p>
        <p>${s.popis}</p>
        ${hratelny(n) ? `
          <div class="uzemi" role="img" aria-label="Dobyté území ${procent} %">${oblasti}</div>
          <p class="ziskane-hvezdy" aria-label="Získané hvězdy: ${stav.stat.hvezdy[n] || 0}">★ ${stav.stat.hvezdy[n] || 0}</p>
          <p class="stav">${dokonceno ? 'Svět dokončen! Objevily se skryté oblasti.' : `Území ${procent} %, svět dokončíš při ${Math.round(DOKONCENI / OBLASTI * 100)} %`}</p>` : ''}
        ${akce}
      </div>
    </li>`;
}

// Čas hraní: sezení běží od spuštění světa do návratu na mapu; při skrytí stránky se přeruší.
let sezeni = 0;
function ukonciSezeni() {
  if (sezeni <= 0) { sezeni = 0; return; }
  statistika.cas(stav.stat, Date.now() - sezeni);
  sezeni = 0;
  ulozit();
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (sezeni) { ukonciSezeni(); sezeni = -1; } }
  else if (sezeni === -1) sezeni = Date.now();
});

// rezim = '' → režimy se po sérii střídají; 'lov'/'most' → hraje se jen zvolený režim
async function hraj(n, rezim = '') {
  casovaceMapy.forEach(clearTimeout);
  ukonciSezeni();
  sezeni = Date.now();
  let odznakyBehem = []; // odznaky získané během série (např. 10 v řadě) se ukážou ve výsledku
  stav.posledniSvet = n;
  app.dataset.svet = n;
  // fotka světa jako pozadí her
  app.style.setProperty('--foto', cssUrl(`obrazky/svet${n}-800.webp`));
  app.style.setProperty('--foto-y', `${KOTVY[n] ?? 50}%`);
  app.innerHTML = '<p class="nacitani">Načítám svět…</p>';
  try {
    cache[n] ||= await nactiSvet(n, PLNA);
  } catch (e) {
    app.innerHTML = `<p class="chyba">${e.message} Zkus stránku načíst znovu.</p><button type="button" class="zpet">← Mapa</button>`;
    app.querySelector('.zpet').onclick = mapa;
    return;
  }
  REZIMY[rezim || stav.rezim].spust(app, {
    data: cache[n],
    slova: (rezim === 'padani' || rezim === 'obrana') && n <= 2 ? SLOVA[n] : undefined,
    krajina: KRAJINY[n],
    opakovani: stav.opakovani,
    hrdina: mluvci(),
    ulozit,
    zaznam(odpoved) {
      odznakyBehem.push(...statistika.odpoved(stav.stat, { ...odpoved, svet: n }));
      vsuvky.sleduj(pametVsuvek, odpoved);
    },
    vsuvka: {
      dalsi() {
        const v = vsuvky.vyber(pametVsuvek, VSUVKY, cache[n].aktivni);
        if (v) vsuvky.ukazano(pametVsuvek, v);
        return v;
      },
      hotovo(v, ok) { statistika.vsuvka(stav.stat, v.id, ok); ulozit(); },
    },
    serieHotova(uspesna, { hvezdy = 0, bezZtraty = false } = {}) {
      const st = svetStav(n);
      st.serie += 1;
      const predtim = st.uzemi;
      if (uspesna) st.uzemi = Math.min(OBLASTI, st.uzemi + 1);
      if (!rezim) stav.rezim = stav.rezim === 'lov' ? 'most' : 'lov'; // režimy se střídají po sérii
      const dokoncene = DOSTUPNE.filter(k => svetStav(k).uzemi >= DOKONCENI);
      const odznaky = [...odznakyBehem, ...statistika.serie(stav.stat, { svet: n, hvezdy, uspesna, bezZtraty, dokoncene })];
      odznakyBehem = [];
      ulozit();
      return { dokonceno: predtim < DOKONCENI && st.uzemi >= DOKONCENI, odznaky };
    },
    konec(v) { ukonciSezeni(); if (v && v.znovu) hraj(n, rezim); else mapa(); },
  });
}

document.querySelector('.motivy').innerHTML = Object.entries(MOTIVY)
  .map(([m, nazev]) => `<button type="button" data-m="${m}">${nazev}</button>`).join('');
document.querySelectorAll('.motivy button').forEach(b => b.onclick = () => { zvuk('klik'); nastavMotiv(b.dataset.m); });
document.querySelector('.znacka').onclick = mapa;
function ukazZvuk() {
  const b = document.querySelector('.prepinac-zvuku');
  b.setAttribute('aria-pressed', stav.zvuk);
  b.textContent = stav.zvuk ? 'Zvuk: zapnutý' : 'Zvuk: vypnutý';
  nastavZvuk(stav.zvuk);
}
document.querySelector('.prepinac-zvuku').onclick = () => { stav.zvuk = !stav.zvuk; ulozit(); ukazZvuk(); zvuk('klik'); };
ukazZvuk();
// prohlížeč pustí zvuk až po první interakci
document.addEventListener('pointerdown', () => { if (stav.zvuk) odemkni(); }, { once: true });
nastavMotiv(MOTIVY[parametry.get('theme')] ? parametry.get('theme') : stav.motiv);
ulozit();
Promise.all([nactiSeznam(), nactiSlova(PLNA), nactiVsuvky()]).then(([s, slova, v]) => { DOSTUPNE = Object.keys(s).map(Number); SLOVA = slova; VSUVKY = v; mapa(); });
