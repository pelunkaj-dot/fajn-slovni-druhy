// Společné části herních režimů: pomocné funkce a obrazovka výsledku série.
import * as eng from '../engine.js';
import { avatar, obrazek, POSTAVY } from '../postavy.js';
import { hlaska } from '../hlasky.js';
import { DRUHY } from '../druhy.js';
import { zvuk } from '../zvuky.js';
import { oslava, efektZasahu } from '../efekty.js';
import { hvezdy as hvezdyZa } from '../statistika.js';

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const cislo = d => `<span class="num" style="--c:var(--d${d})">${d}</span>`;
export const tvar = (n, a, b, c) => (n === 1 ? a : n > 1 && n < 5 ? b : c);

// Postavička s bublinou. Vrací funkci rekni(text, vyraz, druh).
export function parta(el, hrdina) {
  const bez = !POSTAVY[hrdina];
  el.classList.toggle('bez-postav', bez);
  el.innerHTML = `${bez ? '' : avatar(hrdina, 'velky')}<p class="zprava bublina" aria-live="polite"></p>`;
  const obr = el.querySelector('.avatar');
  const z = el.querySelector('.zprava');
  return (text, vyraz = 'zakladni', druh = '') => {
    if (obr) obr.innerHTML = obrazek(hrdina, vyraz);
    z.textContent = text;
    z.className = `zprava bublina ${druh}`;
  };
}

// Zapisovač odpovědí do statistiky: u každého slova se počítá jen první pokus.
// novy() se volá u každé nové věty (klíčem je pak index slova), zapis(klic, odpoved) zapíše jen poprvé.
export function zapisovac(zaznam = () => {}) {
  let zapsano = new Set();
  return {
    novy() { zapsano = new Set(); },
    zapis(klic, odpoved) {
      if (zapsano.has(klic)) return;
      zapsano.add(klic);
      zaznam(odpoved);
    },
  };
}
// s.i = interpunkce za slovem (čárka, tečka)
export const textyVety = veta => veta.slova.map(s => s.t + (s.i || ''));

// Řádek hvězdiček (0–3); získané se rozsvítí postupně.
export const hvezdyHtml = (n, velke = false) =>
  `<span class="hvezdicky${velke ? ' velke' : ''}" role="img" aria-label="${n} ${tvar(n, 'hvězda', 'hvězdy', 'hvězd')} ze 3">${[1, 2, 3].map(i => `<i class="${i <= n ? 'ma' : ''}" style="--i:${i}">★</i>`).join('')}</span>`;

export const odznakHtml = (o, ziskany = true) =>
  `<span class="odznak${ziskany ? '' : ' chybi'}" title="${esc(o.popis)}"><b aria-hidden="true">${esc(o.znak)}</b><span>${esc(o.nazev)}</span></span>`;

// jednotka: tvary pro počet ve statistice (věta/věty/vět, u Padajících slov slovo/slova/slov)
// bezZtraty: obrana hradu bez ztráty života (odznak)
export function vysledekSerie(koren, { vysledky, body, chybnaSlova, hrdina, serieHotova, konec, delka = eng.DELKA_SERIE, jednotka = ['věta', 'věty', 'vět'], bezZtraty = false }) {
  const uspesna = eng.serieUspesna(vysledky, delka);
  const hvezdy = hvezdyZa(vysledky, delka);
  const { dokonceno: svetDokoncen, odznaky = [], demo = null } = serieHotova(uspesna, { hvezdy, bezZtraty });
  const procent = Math.round(eng.uspesnost(vysledky) * 100);
  const pocet = t => vysledky.filter(v => v === t).length;
  const opakovat = [...chybnaSlova.values()];
  koren.innerHTML = `
    <section class="vysledek">
      <div class="parta"></div>
      <h2>${demo ? 'Ukázka dokončena!' : svetDokoncen ? 'Svět dokončen!' : uspesna ? 'Stavba povyrostla!' : 'Série dokončena'}</h2>
      ${hvezdyHtml(hvezdy, true)}
      <p class="procenta"><b>${procent} %</b> úspěšnost</p>
      <p>${demo ? `Tohle byla malá ukázka Fajn Slovních druhů. Vyzkoušeno ${demo.pocet} ze 3 obtížností. V plné FajnCvičebně tě čeká mnohem více vět, více obtížností a dlouhodobé procvičování.` : svetDokoncen ? 'Stavba je hotová! Na mapě se objevil plán ozdob.' : uspesna ? 'Na mapě přibyl další díl stavby.' : `Na další díl stavby potřebuješ aspoň ${Math.round(eng.PRAH_USPECHU * 100)} %. Zkus další sérii!`}</p>
      <ul class="statistika">
        <li><b>${pocet('ciste')}</b> ${tvar(pocet('ciste'), ...jednotka)} bez chyby</li>
        <li><b>${pocet('chyba')}</b> s chybou</li>
        <li><b>${pocet('odhaleno')}</b> s ukázanou odpovědí</li>
        <li><b>${body}</b> ${tvar(body, 'bod', 'body', 'bodů')}</li>
      </ul>
      ${odznaky.length ? `<div class="nove-odznaky"><p>${odznaky.length === 1 ? 'Nový odznak!' : 'Nové odznaky!'}</p>${odznaky.map(o => odznakHtml(o)).join('')}</div>` : ''}
      ${opakovat.length ? `<p>Tahle slova se ti brzy vrátí:</p><p class="opakovat">${opakovat.map(s => `<span>${cislo(s.d)} ${esc(s.t)}</span>`).join('')}</p>` : ''}
      ${demo ? '<a class="demo-cta" href="https://fajndoucko.cz/fajncvicebna/" target="_blank" rel="noopener">Chci plnou verzi</a>' : ''}
      <div class="ovladani">
        <button type="button" class="znovu">${demo ? 'Zkusit znovu' : 'Další série'}</button>
        <button type="button" class="mapa">Na mapu</button>
      </div>
    </section>`;
  parta(koren.querySelector('.parta'), hrdina)(hlaska(hrdina, svetDokoncen ? 'oslavaSveta' : uspesna ? 'serieUspech' : 'serieNeuspech'), uspesna ? 'radost' : 'zakladni');
  zvuk(svetDokoncen ? 'svet' : uspesna || odznaky.length ? 'uspech' : 'neuspech');
  if (svetDokoncen || uspesna || odznaky.length) oslava(svetDokoncen ? 'svet' : 'uspech');
  koren.querySelector('.znovu').onclick = () => konec({ znovu: true });
  koren.querySelector('.mapa').onclick = () => konec({ znovu: false });
  koren.querySelector('.znovu').focus();
}

// ---------- didaktická vsuvka ----------
// Věta vsuvky: [{t}, {t, d}] – slovo s druhem je zvýrazněné. Interpunkce se připojí k předchozímu slovu.
const vetaVsuvky = slova => slova.map(s => (s.d ? `<mark${s.d === 'x' ? '' : ` style="--c:var(--d${s.d})"`}>${esc(s.t)}</mark>` : esc(s.t)))
  .join(' ').replace(/ ([,.!?:;])/g, '$1');
const druhVety = slova => slova.find(s => s.d).d;

// vsuvka = { dalsi(): vsuvka na řadě nebo null, hotovo(v, ok) } – dodává app.js.
// Když je nějaká na řadě, ukáže ji a pak zavolá dal(); jinak dal() hned.
export function moznaVsuvka(koren, vsuvka, hrdina, dal) {
  const v = vsuvka && vsuvka.dalsi();
  if (!v) { dal(); return; }
  prestavka(koren, v, hrdina).then(ok => { vsuvka.hotovo(v, ok); dal(); });
}
// Klávesy hry se během vsuvky nepočítají.
export const bezVsuvky = () => !document.querySelector('.vsuvka-obal');

// Zastaví hru a vysvětlí, co se plete: pravidlo, dva příklady, mini-úkol.
// Vrací Promise, který se splní po „Hrajeme dál“ (hodnota: mini-úkol napoprvé správně). Hra mezitím stojí.
export function prestavka(koren, v, hrdina) {
  return new Promise(hotovo => {
    let vysledek = false;
    const obal = document.createElement('div');
    obal.className = 'vsuvka-obal';
    const spravne = druhVety(v.ukol.slova);
    obal.innerHTML = `
      <section class="vsuvka" role="dialog" aria-modal="true" aria-labelledby="vsuvka-nadpis">
        <div class="parta"></div>
        <h2 id="vsuvka-nadpis">${esc(v.nadpis)}</h2>
        <p class="pravidlo">${esc(v.pravidlo)}</p>
        <div class="priklady">
          ${v.priklady.map(p => `<div class="priklad" style="--c:var(--d${druhVety(p.slova)})">
            <p class="veta-vsuvky">${vetaVsuvky(p.slova)}</p>
            <p class="proc">${cislo(druhVety(p.slova))} ${esc(p.vysvetleni)}</p>
          </div>`).join('')}
        </div>
        <div class="ukol-vsuvky">
          <p class="zadani"><b>Zkus to:</b> jaký slovní druh je zvýrazněné slovo?</p>
          <p class="veta-vsuvky">${vetaVsuvky(v.ukol.slova.map(s => (s.d ? { t: s.t, d: 'x' } : s)))}</p>
          <div class="moznosti">${v.moznosti.map(d => `<button type="button" data-d="${d}">${cislo(d)} ${esc(DRUHY[d].nazev)}</button>`).join('')}</div>
          <p class="odezva" aria-live="polite"></p>
        </div>
        <button type="button" class="hrajeme-dal" hidden>Hrajeme dál →</button>
      </section>`;
    koren.appendChild(obal);
    const $ = s => obal.querySelector(s);
    const rekni = parta($('.parta'), hrdina);
    const uvod = hlaska(hrdina, 'vsuvka');
    if (uvod) rekni(uvod); else $('.parta').hidden = true;
    zvuk('napoveda');
    obal.querySelector('.moznosti button').focus({ preventScroll: true });
    obal.querySelectorAll('.moznosti button').forEach(b => b.onclick = () => {
      const d = +b.dataset.d;
      const ok = d === spravne;
      vysledek = ok;
      obal.querySelectorAll('.moznosti button').forEach(x => {
        x.disabled = true;
        if (+x.dataset.d === spravne) x.classList.add('spravna');
      });
      if (!ok) b.classList.add('spatna');
      const mark = obal.querySelector('.ukol-vsuvky mark');
      mark.style.setProperty('--c', `var(--d${spravne})`);
      mark.classList.add('odhaleno');
      zvuk(ok ? 'zasah' : 'chyba');
      if (ok) efektZasahu(b, d);
      const reakce = hlaska(hrdina, ok ? 'vsuvkaSpravne' : 'vsuvkaChyba');
      if (reakce) rekni(reakce, ok ? 'radost' : 'premysli');
      $('.odezva').innerHTML = `${cislo(spravne)} ${esc(v.ukol.vysvetleni)}`;
      $('.hrajeme-dal').hidden = false;
      $('.hrajeme-dal').focus();
    });
    $('.hrajeme-dal').onclick = () => { zvuk('klik'); obal.remove(); hotovo(vysledek); };
  });
}
