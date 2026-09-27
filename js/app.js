// Mapa světů, motivy, ukládání postupu a spuštění režimu.
import { SVETY } from './druhy.js';
import { nactiSvet } from './data.js';
import * as srs from './srs.js';
import { OBLASTI, DOKONCENI } from './engine.js';
import { spustLov } from './rezimy/lov.js';
import { spustMost } from './rezimy/most.js';
import { avatar } from './postavy.js';
import { KRAJINY } from './krajiny.js';
import { hlaska, nastavHrace } from './hlasky.js';
import { parta } from './rezimy/spolecne.js';

const KLIC = 'fajn-slovni-druhy:v1';
const MOTIVY = { light: 'Světlý', dark: 'Tmavý', girl: 'Dívčí' };
const HRDINOVE = ['Terezka', 'Matýsek'];
const REZIMY = { lov: { nazev: 'Lov', spust: spustLov }, most: { nazev: 'Stavba mostu', spust: spustMost } };
const DOSTUPNE = [1, 2]; // světy, které už mají data
const V_UKAZCE = [1];     // světy hratelné bez ?mode=full
const parametry = new URLSearchParams(location.search);
const PLNA = parametry.get('mode') === 'full';

const app = document.getElementById('app');
const cache = {};

function nacti() {
  try { return JSON.parse(localStorage.getItem(KLIC)) || {}; } catch { return {}; }
}
const stav = { hrdina: HRDINOVE[0], motiv: 'light', rezim: 'lov', svety: {}, opakovani: srs.novyStav(), ...nacti() };
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
const odemceno = n => n === 1 || svetStav(n - 1).uzemi >= DOKONCENI;

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
  parta(app.querySelector('.parta'), stav.hrdina)(hlaska(stav.hrdina, 'otazkaHrac'));
  app.querySelectorAll('.volba-hrace button').forEach(b => b.onclick = () => {
    stav.hrac = b.dataset.k; nastavHrace(stav.hrac); ulozit(); mapa();
  });
}

function mapa() {
  if (!stav.hrac) { otazkaHrac(); return; }
  app.innerHTML = `
    <section class="mapa">
      ${PLNA ? '' : '<p class="ukazka">Ukázková verze: hraješ s malým výběrem vět. Plnou verzi najdeš ve FajnCvičebně.</p>'}
      <div class="volba-hrdiny" role="group" aria-label="S kým vyrazíš?">
        <span>S kým vyrazíš?</span>
        ${HRDINOVE.map(h => `<button type="button" data-h="${h}" aria-pressed="${stav.hrdina === h}">${avatar(h)}${h}</button>`).join('')}
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
  const rekni = parta(app.querySelector('.parta'), stav.hrdina);
  if (pozdrav) { rekni(hlaska(stav.hrdina, pozdrav)); pozdrav = ''; }
  else app.querySelector('.parta').hidden = true;
  app.querySelectorAll('.hraje button').forEach(b => b.onclick = () => {
    stav.hrac = b.dataset.k; nastavHrace(stav.hrac); ulozit(); mapa();
  });
  app.querySelectorAll('.volba-hrdiny button[data-h]').forEach(b => b.onclick = () => {
    if (stav.hrdina === b.dataset.h) return;
    stav.hrdina = b.dataset.h; ulozit();
    pozdrav = 'predstaveni';
    mapa();
  });
  app.querySelectorAll('.svety button[data-svet]').forEach(b => b.onclick = () => hraj(+b.dataset.svet));
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
  if (!odemceno(n)) akce = `<span class="zamek">Odemkneš dokončením světa ${n - 1}</span>`;
  else if (!DOSTUPNE.includes(n)) akce = '<span class="zamek">Připravujeme</span>';
  else if (!PLNA && !V_UKAZCE.includes(n)) akce = '<span class="zamek">Jen v plné verzi</span>';
  else akce = `<button type="button" data-svet="${n}">Vyrazit: ${REZIMY[stav.rezim].nazev}</button>`;
  const procent = Math.round(st.uzemi / OBLASTI * 100);
  return `
    <li class="svet svet-${n}${odemceno(n) ? '' : ' zamceny'}">
      <div class="krajina" aria-hidden="true">${KRAJINY[n]}</div>
      <div class="obsah">
        <h2><span class="poradi">${n}</span>${s.nazev}</h2>
        <p>${s.popis}</p>
        ${odemceno(n) && DOSTUPNE.includes(n) ? `
          <div class="uzemi" role="img" aria-label="Dobyté území ${procent} %">${oblasti}</div>
          <p class="stav">${dokonceno ? 'Svět dokončen! Objevily se skryté oblasti.' : `Území ${procent} %, svět dokončíš při ${Math.round(DOKONCENI / OBLASTI * 100)} %`}</p>` : ''}
        ${akce}
      </div>
    </li>`;
}

async function hraj(n) {
  app.innerHTML = '<p class="nacitani">Načítám svět…</p>';
  try {
    cache[n] ||= await nactiSvet(SVETY[n].data, PLNA);
  } catch (e) {
    app.innerHTML = `<p class="chyba">${e.message} Zkus stránku načíst znovu.</p><button type="button" class="zpet">← Mapa</button>`;
    app.querySelector('.zpet').onclick = mapa;
    return;
  }
  REZIMY[stav.rezim].spust(app, {
    data: cache[n],
    krajina: KRAJINY[n],
    opakovani: stav.opakovani,
    hrdina: stav.hrdina,
    ulozit,
    serieHotova(uspesna) {
      const st = svetStav(n);
      st.serie += 1;
      const predtim = st.uzemi;
      if (uspesna) st.uzemi = Math.min(OBLASTI, st.uzemi + 1);
      stav.rezim = stav.rezim === 'lov' ? 'most' : 'lov'; // režimy se střídají po sérii
      ulozit();
      return predtim < DOKONCENI && st.uzemi >= DOKONCENI ? 'dokonceno' : '';
    },
    konec(v) { if (v && v.znovu) hraj(n); else mapa(); },
  });
}

document.querySelector('.motivy').innerHTML = Object.entries(MOTIVY)
  .map(([m, nazev]) => `<button type="button" data-m="${m}">${nazev}</button>`).join('');
document.querySelectorAll('.motivy button').forEach(b => b.onclick = () => nastavMotiv(b.dataset.m));
document.querySelector('.znacka').onclick = mapa;
nastavMotiv(MOTIVY[parametry.get('theme')] ? parametry.get('theme') : stav.motiv);
ulozit();
mapa();
