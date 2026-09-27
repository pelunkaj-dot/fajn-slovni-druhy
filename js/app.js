// Mapa světů, motivy, ukládání postupu a spuštění režimu.
import { SVETY } from './druhy.js';
import { nactiSvet } from './data.js';
import * as srs from './srs.js';
import { OBLASTI, DOKONCENI } from './engine.js';
import { spustLov } from './rezimy/lov.js';

const KLIC = 'fajn-slovni-druhy:v1';
const MOTIVY = { light: 'Světlý', dark: 'Tmavý', girl: 'Dívčí' };
const HRDINOVE = ['Terezka', 'Matýsek'];
const DOSTUPNE = [1, 2]; // světy, které už mají data
const V_UKAZCE = [1];     // světy hratelné bez ?mode=full
const parametry = new URLSearchParams(location.search);
const PLNA = parametry.get('mode') === 'full';

const app = document.getElementById('app');
const cache = {};

function nacti() {
  try { return JSON.parse(localStorage.getItem(KLIC)) || {}; } catch { return {}; }
}
const stav = { hrdina: HRDINOVE[0], motiv: 'light', svety: {}, opakovani: srs.novyStav(), ...nacti() };
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

function mapa() {
  app.innerHTML = `
    <section class="mapa">
      ${PLNA ? '' : '<p class="ukazka">Ukázková verze: hraješ s malým výběrem vět. Plnou verzi najdeš ve FajnCvičebně.</p>'}
      <div class="volba-hrdiny" role="group" aria-label="S kým půjdeš na lov?">
        <span>S kým půjdeš na lov?</span>
        ${HRDINOVE.map(h => `<button type="button" data-h="${h}" aria-pressed="${stav.hrdina === h}"><span class="avatar">${h[0]}</span>${h}</button>`).join('')}
      </div>
      <ol class="svety">
        ${Object.entries(SVETY).map(([n, s]) => kartaSveta(+n, s)).join('')}
      </ol>
    </section>`;
  app.querySelectorAll('.volba-hrdiny button').forEach(b => b.onclick = () => {
    stav.hrdina = b.dataset.h; ulozit(); mapa();
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
  else akce = `<button type="button" data-svet="${n}">${st.serie ? 'Pokračovat v lovu' : 'Vyrazit na lov'}</button>`;
  const procent = Math.round(st.uzemi / OBLASTI * 100);
  return `
    <li class="svet svet-${n}${odemceno(n) ? '' : ' zamceny'}">
      <div class="krajina" aria-hidden="true"></div>
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
  spustLov(app, {
    data: cache[n],
    opakovani: stav.opakovani,
    hrdina: stav.hrdina,
    ulozit,
    serieHotova(uspesna) {
      const st = svetStav(n);
      st.serie += 1;
      if (uspesna) st.uzemi = Math.min(OBLASTI, st.uzemi + 1);
      ulozit();
    },
    konec(v) { if (v && v.znovu) hraj(n); else mapa(); },
  });
}

document.querySelector('.motivy').innerHTML = Object.entries(MOTIVY)
  .map(([m, nazev]) => `<button type="button" data-m="${m}">${nazev}</button>`).join('');
document.querySelectorAll('.motivy button').forEach(b => b.onclick = () => nastavMotiv(b.dataset.m));
document.querySelector('.znacka').onclick = mapa;
nastavMotiv(MOTIVY[parametry.get('theme')] ? parametry.get('theme') : stav.motiv);
mapa();
