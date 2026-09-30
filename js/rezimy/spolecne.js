// Společné části herních režimů: pomocné funkce a obrazovka výsledku série.
import * as eng from '../engine.js';
import { avatar, obrazek, POSTAVY } from '../postavy.js';
import { hlaska } from '../hlasky.js';
import { zvuk } from '../zvuky.js';
import { oslava } from '../efekty.js';
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
  const { dokonceno: svetDokoncen, odznaky = [] } = serieHotova(uspesna, { hvezdy, bezZtraty });
  const procent = Math.round(eng.uspesnost(vysledky) * 100);
  const pocet = t => vysledky.filter(v => v === t).length;
  const opakovat = [...chybnaSlova.values()];
  koren.innerHTML = `
    <section class="vysledek">
      <div class="parta"></div>
      <h2>${svetDokoncen ? 'Svět dokončen!' : uspesna ? 'Nová oblast je tvoje!' : 'Série dokončena'}</h2>
      ${hvezdyHtml(hvezdy, true)}
      <p class="procenta"><b>${procent} %</b> úspěšnost</p>
      <p>${svetDokoncen ? 'Na mapě se objevily skryté oblasti.' : uspesna ? 'Na mapě ti přibyl kousek území.' : `Na novou oblast potřebuješ aspoň ${Math.round(eng.PRAH_USPECHU * 100)} %. Zkus další sérii!`}</p>
      <ul class="statistika">
        <li><b>${pocet('ciste')}</b> ${tvar(pocet('ciste'), ...jednotka)} bez chyby</li>
        <li><b>${pocet('chyba')}</b> s chybou</li>
        <li><b>${pocet('odhaleno')}</b> s ukázanou odpovědí</li>
        <li><b>${body}</b> ${tvar(body, 'bod', 'body', 'bodů')}</li>
      </ul>
      ${odznaky.length ? `<div class="nove-odznaky"><p>${odznaky.length === 1 ? 'Nový odznak!' : 'Nové odznaky!'}</p>${odznaky.map(o => odznakHtml(o)).join('')}</div>` : ''}
      ${opakovat.length ? `<p>Tahle slova se ti brzy vrátí:</p><p class="opakovat">${opakovat.map(s => `<span>${cislo(s.d)} ${esc(s.t)}</span>`).join('')}</p>` : ''}
      <div class="ovladani">
        <button type="button" class="znovu">Další série</button>
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
