// Tlačítko „?“: dítě kdykoli zastaví hru a nechá si vysvětlit slovo.
// Nabídne slovo, které je právě na řadě (jen návod, bez odpovědi), a posledních pár
// vyřešených slov (druh a proč). Nic nestojí – hra se jen zastaví, i s časem.
//
// Položka historie / slovo na řadě:
//   { t, d, p, n, veta: [{t, d, i}] | null, i, vysledek: 'ciste' | 'chyba' | 'odhaleno' }
//   (u slova na řadě chybí d a vysledek; u lovu je místo slova na řadě { cil, poddruh })
import { DRUHY, PODDRUHY, nazevDruhu, mnozneDruhu } from './druhy.js';
import { esc, cislo } from './rezimy/spolecne.js';
import { zvuk } from './zvuky.js';

export const HISTORIE = 4; // kolik vyřešených slov nabídnout

// Tlačítko do lišty hry. volby: { aktivni, vsuvky, naRade(), historie(), zastav(), pokracuj(), pouzito(typ) }
export function pridejOtaznik(hud, volby) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'otaznik';
  b.setAttribute('aria-label', 'Nevím proč – vysvětli mi slovo');
  b.title = 'Nevím proč – vysvětli mi slovo (klávesa ?)';
  b.textContent = '?';
  b.onclick = () => otevri(volby);
  hud.appendChild(b);
  const klavesa = e => {
    if (!b.isConnected) { document.removeEventListener('keydown', klavesa); return; }
    if (e.key === '?' && !document.querySelector('.vsuvka-obal')) { e.preventDefault(); otevri(volby); }
  };
  document.addEventListener('keydown', klavesa);
  return b;
}

const vetaHtml = (veta, i, d) => veta.map((s, j) => {
  const text = esc(s.t) + (s.i ? esc(s.i) : '');
  if (j !== i) return text;
  return `<mark${d ? ` style="--c:var(--d${d})"` : ''}>${esc(s.t)}</mark>${s.i ? esc(s.i) : ''}`;
}).join(' ');

const ZNACKA = { ciste: ['✓', 'správně'], chyba: ['✓', 'napodruhé'], odhaleno: ['!', 'ukázalo se'] };

// Pravidlo a příklady ze schválené vsuvky pro jeden druh (když existuje).
function zVsuvky(vsuvky, d) {
  const v = vsuvky.find(x => x.id === `v-${d}`);
  if (!v) return '';
  const veta = slova => slova.map(s => (s.d ? `<mark style="--c:var(--d${s.d})">${esc(s.t)}</mark>` : esc(s.t))).join(' ').replace(/ ([,.!?:;])/g, '$1');
  return `<div class="pravidlo-druhu">
    <p>${esc(v.pravidlo)}</p>
    <ul>${v.priklady.map(p => `<li><span class="veta-vsuvky">${veta(p.slova)}</span> <small>${esc(p.vysvetleni)}</small></li>`).join('')}</ul>
  </div>`;
}

// Vysvětlení vyřešeného slova: druh, otázka, vlastní nápověda, pravidlo s příklady.
function vysvetleniSlova(x, vsuvky) {
  const d = x.d;
  const pod = x.p && PODDRUHY[d] && PODDRUHY[d][x.p];
  return `
    ${x.veta ? `<p class="veta-vsuvky">${vetaHtml(x.veta, x.i, d)}</p>` : `<p class="veta-vsuvky"><mark style="--c:var(--d${d})">${esc(x.t)}</mark></p>`}
    <p class="verdikt">${cislo(d)} „${esc(x.t)}“ je <b>${esc(nazevDruhu(d, x.p))}</b>.</p>
    <p>${esc(DRUHY[d].otazka)}${zVsuvky(vsuvky, d) ? '' : ` ${esc(DRUHY[d].popis)}`}</p>
    ${pod ? `<p>${esc(pod.otazka)}</p>` : ''}
    ${x.n ? `<p class="vlastni">${esc(x.n)}</p>` : ''}
    ${zVsuvky(vsuvky, d)}`;
}

// Návod ke slovu na řadě – bez odpovědi.
function navod(x, aktivni, vsuvky) {
  if (x.cil) {
    // lov: dítě hledá všechna slova jednoho druhu – vysvětlí se, co hledá
    return `
      <p class="verdikt">${cislo(x.cil)} Hledáš ${esc(DRUHY[x.cil].vse)} <b>${esc(mnozneDruhu(x.cil, x.poddruh))}</b>.</p>
      <p>${esc(DRUHY[x.cil].otazka)}${zVsuvky(vsuvky, x.cil) ? '' : ` ${esc(DRUHY[x.cil].popis)}`}</p>
      ${x.poddruh && PODDRUHY[x.cil]?.[x.poddruh] ? `<p>${esc(PODDRUHY[x.cil][x.poddruh].otazka)}</p>` : ''}
      ${zVsuvky(vsuvky, x.cil)}
      <p class="rada">Projdi slova ve větě jedno po druhém a u každého se zeptej.</p>`;
  }
  if (x.poddruhy) {
    // most ve světě 5: druh už je určený, zbývá poddruh
    return `
      ${x.veta ? `<p class="veta-vsuvky">${vetaHtml(x.veta, x.i, x.d)}</p>` : ''}
      <p class="verdikt">${cislo(x.d)} „${esc(x.t)}“ už víš: je to ${esc(DRUHY[x.d].nazev)}. Teď urči, jaké.</p>
      <ul class="otazky">${Object.values(PODDRUHY[x.d]).map(p => `<li><b>${esc(p.jed)}</b> – ${esc(p.otazka)}</li>`).join('')}</ul>`;
  }
  return `
    ${x.veta ? `<p class="veta-vsuvky">${vetaHtml(x.veta, x.i, null)}</p>` : `<p class="veta-vsuvky"><mark>${esc(x.t)}</mark></p>`}
    ${x.n ? `<p class="vlastni">${esc(x.n)}</p>` : ''}
    <p class="rada">Zeptej se na slovo „${esc(x.t)}“ postupně. Na kterou otázku odpovídá?</p>
    <ul class="otazky">${aktivni.map(d => `<li>${cislo(d)} <span>${esc(DRUHY[d].otazka)}</span> <small>→ ${esc(DRUHY[d].nazev)}</small></li>`).join('')}</ul>`;
}

function otevri({ aktivni, vsuvky = [], naRade, historie, zastav, pokracuj, pouzito }) {
  if (document.querySelector('.vsuvka-obal')) return;
  const ted = naRade();
  const hist = historie().slice(-HISTORIE).reverse(); // nejnovější první
  if (!ted && !hist.length) return;
  zastav();
  zvuk('napoveda');
  const volby = [
    ...(ted ? [{ klic: 'ted', popis: ted.cil ? 'Co hledám?' : `„${ted.t}“`, pozn: 'na řadě', x: ted }] : []),
    ...hist.map((x, k) => ({ klic: `h${k}`, popis: `„${x.t}“`, pozn: ZNACKA[x.vysledek]?.[1] || '', znak: ZNACKA[x.vysledek]?.[0] || '', x })),
  ];
  const obal = document.createElement('div');
  obal.className = 'vsuvka-obal otaznik-obal';
  obal.innerHTML = `
    <section class="vsuvka otaznik-okno" role="dialog" aria-modal="true" aria-labelledby="otaznik-nadpis">
      <h2 id="otaznik-nadpis">Které slovo ti mám vysvětlit?</h2>
      <div class="volba-slova" role="tablist">
        ${volby.map(v => `<button type="button" role="tab" data-k="${v.klic}" class="${v.klic === 'ted' ? 'na-rade' : `v-${v.x.vysledek}`}">
          ${v.znak ? `<i aria-hidden="true">${v.znak}</i>` : ''}<span>${esc(v.popis)}</span><small>${esc(v.pozn)}</small></button>`).join('')}
      </div>
      <div class="obsah-vysvetleni" role="tabpanel" aria-live="polite"></div>
      <button type="button" class="hrajeme-dal">Zpět do hry →</button>
    </section>`;
  document.body.appendChild(obal);
  const videno = new Set(); // do statistiky jen jednou za otevření a typ
  const ukaz = klic => {
    const v = volby.find(x => x.klic === klic);
    obal.querySelectorAll('.volba-slova button').forEach(b => b.setAttribute('aria-selected', b.dataset.k === klic));
    obal.querySelector('.obsah-vysvetleni').innerHTML = klic === 'ted' ? navod(v.x, aktivni, vsuvky) : vysvetleniSlova(v.x, vsuvky);
    const typ = klic === 'ted' ? 'naRade' : 'vyresene';
    if (!videno.has(typ)) { videno.add(typ); pouzito(typ); }
  };
  obal.querySelectorAll('.volba-slova button').forEach(b => b.onclick = () => { zvuk('klik'); ukaz(b.dataset.k); });
  ukaz(volby[0].klic);
  const zavri = () => {
    document.removeEventListener('keydown', klavesou);
    obal.remove();
    zvuk('klik');
    pokracuj();
  };
  const klavesou = e => { if (e.key === 'Escape') zavri(); };
  document.addEventListener('keydown', klavesou);
  obal.querySelector('.hrajeme-dal').onclick = zavri;
  obal.onclick = e => { if (e.target === obal) zavri(); };
  obal.querySelector('.hrajeme-dal').focus({ preventScroll: true });
}

// Položka historie ze slova věty (u složeného tvaru celý tvar).
export const zeSlova = (veta, i, t, vysledek) => {
  const s = veta.slova[i];
  return { t, d: s.d, p: s.p || '', n: s.n || '', veta: veta.slova, i, vysledek };
};
