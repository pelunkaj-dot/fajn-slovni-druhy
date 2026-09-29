// Mapa světů, motivy, ukládání postupu a spuštění režimu.
import { SVETY } from './druhy.js';
import { nactiSvet, nactiSeznam, nactiSlova } from './data.js';
import * as srs from './srs.js';
import { OBLASTI, DOKONCENI } from './engine.js';
import { spustLov } from './rezimy/lov.js';
import { spustMost } from './rezimy/most.js';
import { spustPadani } from './rezimy/padani.js';
import { spustObranu } from './rezimy/obrana.js';
import { avatar } from './postavy.js';
import { KRAJINY } from './krajiny.js';
import { hlaska, nastavHrace } from './hlasky.js';
import { parta } from './rezimy/spolecne.js';
import { nastavZvuk, odemkni } from './zvuky.js';

const KLIC = 'fajn-slovni-druhy:v1';
const MOTIVY = { light: 'Světlý', dark: 'Tmavý', girl: 'Dívčí' };
const HRDINOVE = ['Terezka', 'Matýsek'];
const REZIMY = { lov: { nazev: 'Lov', spust: spustLov }, most: { nazev: 'Stavba mostu', spust: spustMost }, padani: { nazev: 'Padající slova', spust: spustPadani }, obrana: { nazev: 'Obrana hradu', spust: spustObranu } };
let DOSTUPNE = []; // světy, které mají data (z data/svety.json)
let SLOVA = {};    // slova pro Padající slova podle světa (jen světy 1–2)
// Režimy nabízené ve světě: Padající slova a Obrana hradu jen tam, kde jsou schválená samostatná slova.
const rezimySveta = n => Object.entries(REZIMY).filter(([k]) => !['padani', 'obrana'].includes(k) || SLOVA[n]);
const parametry = new URLSearchParams(location.search);
const PLNA = parametry.get('mode') === 'full';

const app = document.getElementById('app');
const cache = {};

function nacti() {
  try { return JSON.parse(localStorage.getItem(KLIC)) || {}; } catch { return {}; }
}
const stav = { hrdina: HRDINOVE[0], postavicky: true, zvuk: true, motiv: 'light', rezim: 'lov', svety: {}, opakovani: srs.novyStav(), ...nacti() };
// Pozdrav podle toho, kdy hráč hrál naposledy (zjistí se jednou při načtení stránky).
const DEN = 864e5;
let pozdrav = !stav.naposledy ? 'pozdravPrvni' : Date.now() - stav.naposledy > 3 * DEN ? 'pozdravPoDlouhe' : 'pozdravZnovu';
stav.naposledy = Date.now();
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
    stav.hrac = b.dataset.k; nastavHrace(stav.hrac); ulozit(); mapa();
  });
}

function mapa() {
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
      <div class="parta"></div>
      <ol class="svety">
        ${Object.entries(SVETY).map(([n, s]) => kartaSveta(+n, s)).join('')}
      </ol>
    </section>`;
  const rekni = parta(app.querySelector('.parta'), mluvci());
  const text = pozdrav ? hlaska(mluvci(), pozdrav) : '';
  pozdrav = '';
  if (text) rekni(text); else app.querySelector('.parta').hidden = true;
  app.querySelector('.prepinac-postav').onclick = () => {
    stav.postavicky = !stav.postavicky; ulozit();
    pozdrav = stav.postavicky ? 'predstaveni' : '';
    mapa();
  };
  app.querySelectorAll('.hraje button').forEach(b => b.onclick = () => {
    stav.hrac = b.dataset.k; nastavHrace(stav.hrac); ulozit(); mapa();
  });
  app.querySelectorAll('.volba-hrdiny button[data-h]').forEach(b => b.onclick = () => {
    if (stav.hrdina === b.dataset.h) return;
    stav.hrdina = b.dataset.h; ulozit();
    pozdrav = 'predstaveni';
    mapa();
  });
  app.querySelectorAll('.svety button[data-svet]').forEach(b => b.onclick = () => hraj(+b.dataset.svet, b.dataset.rezim || ''));
}

function kartaSveta(n, s) {
  const st = svetStav(n);
  const dokonceno = st.uzemi >= DOKONCENI;
  const oblasti = Array.from({ length: OBLASTI }, (_, i) => {
    const skryta = i >= DOKONCENI;
    if (skryta && !dokonceno) return '';
    return `<i class="${i < st.uzemi ? 'moje' : ''}${skryta ? ' skryta' : ''}"></i>`;
  }).join('');
  let akce;
  if (!DOSTUPNE.includes(n)) akce = '<span class="zamek">Připravujeme</span>';
  else akce = `<div class="akce-sveta">
      <button type="button" data-svet="${n}">Vyrazit</button>
      <span class="jiny-rezim">nebo jen: ${rezimySveta(n).map(([k, r]) => `<button type="button" class="odkaz" data-svet="${n}" data-rezim="${k}">${r.nazev}</button>`).join(' · ')}</span>
    </div>`;
  const procent = Math.round(st.uzemi / OBLASTI * 100);
  return `
    <li class="svet svet-${n}${hratelny(n) ? '' : ' zamceny'}">
      <div class="krajina" aria-hidden="true">${KRAJINY[n]}</div>
      <div class="obsah">
        <h2><span class="poradi">${n}</span>${s.nazev}</h2>
        <p class="hvezdy" aria-label="Obtížnost ${s.hvezdy} z 5">${'★'.repeat(s.hvezdy)}<span>${'★'.repeat(5 - s.hvezdy)}</span></p>
        <p class="komu">${s.komu}</p>
        <p>${s.popis}</p>
        ${hratelny(n) ? `
          <div class="uzemi" role="img" aria-label="Dobyté území ${procent} %">${oblasti}</div>
          <p class="stav">${dokonceno ? 'Svět dokončen! Objevily se skryté oblasti.' : `Území ${procent} %, svět dokončíš při ${Math.round(DOKONCENI / OBLASTI * 100)} %`}</p>` : ''}
        ${akce}
      </div>
    </li>`;
}

// rezim = '' → režimy se po sérii střídají; 'lov'/'most' → hraje se jen zvolený režim
async function hraj(n, rezim = '') {
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
    slova: SLOVA[n],
    krajina: KRAJINY[n],
    opakovani: stav.opakovani,
    hrdina: mluvci(),
    ulozit,
    serieHotova(uspesna) {
      const st = svetStav(n);
      st.serie += 1;
      const predtim = st.uzemi;
      if (uspesna) st.uzemi = Math.min(OBLASTI, st.uzemi + 1);
      if (!rezim) stav.rezim = stav.rezim === 'lov' ? 'most' : 'lov'; // režimy se střídají po sérii
      ulozit();
      return predtim < DOKONCENI && st.uzemi >= DOKONCENI ? 'dokonceno' : '';
    },
    konec(v) { if (v && v.znovu) hraj(n, rezim); else mapa(); },
  });
}

document.querySelector('.motivy').innerHTML = Object.entries(MOTIVY)
  .map(([m, nazev]) => `<button type="button" data-m="${m}">${nazev}</button>`).join('');
document.querySelectorAll('.motivy button').forEach(b => b.onclick = () => nastavMotiv(b.dataset.m));
document.querySelector('.znacka').onclick = mapa;
function ukazZvuk() {
  const b = document.querySelector('.prepinac-zvuku');
  b.setAttribute('aria-pressed', stav.zvuk);
  b.textContent = stav.zvuk ? 'Zvuk: zapnutý' : 'Zvuk: vypnutý';
  nastavZvuk(stav.zvuk);
}
document.querySelector('.prepinac-zvuku').onclick = () => { stav.zvuk = !stav.zvuk; ulozit(); ukazZvuk(); };
ukazZvuk();
// prohlížeč pustí zvuk až po první interakci
document.addEventListener('pointerdown', () => { if (stav.zvuk) odemkni(); }, { once: true });
nastavMotiv(MOTIVY[parametry.get('theme')] ? parametry.get('theme') : stav.motiv);
ulozit();
Promise.all([nactiSeznam(), nactiSlova(PLNA)]).then(([s, slova]) => { DOSTUPNE = Object.keys(s).map(Number); SLOVA = slova; mapa(); });
