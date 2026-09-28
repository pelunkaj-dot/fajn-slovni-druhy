// Společné části herních režimů: pomocné funkce a obrazovka výsledku série.
import * as eng from '../engine.js';
import { avatar, obrazek } from '../postavy.js';
import { hlaska } from '../hlasky.js';

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const cislo = d => `<span class="num" style="--c:var(--d${d})">${d}</span>`;
export const tvar = (n, a, b, c) => (n === 1 ? a : n > 1 && n < 5 ? b : c);

// Postavička s bublinou. Vrací funkci rekni(text, vyraz, druh).
export function parta(el, hrdina) {
  el.innerHTML = `${avatar(hrdina, 'velky')}<p class="zprava bublina" aria-live="polite"></p>`;
  const obr = el.querySelector('.avatar');
  const z = el.querySelector('.zprava');
  return (text, vyraz = 'zakladni', druh = '') => {
    obr.innerHTML = obrazek(hrdina, vyraz);
    z.textContent = text;
    z.className = `zprava bublina ${druh}`;
  };
}

const BARVY_KONFET = ['#ff6b8a', '#ffd54a', '#5cc98a', '#6d9bf2', '#c77dff', '#ffb13d'];
function konfety() {
  const kusy = Array.from({ length: 40 }, (_, i) => {
    const x = Math.random() * 100, zpozdeni = Math.random() * 1.2, doba = 2 + Math.random() * 1.5;
    return `<i style="left:${x}%;background:${BARVY_KONFET[i % BARVY_KONFET.length]};animation-delay:${zpozdeni}s;animation-duration:${doba}s"></i>`;
  }).join('');
  return `<div class="konfety" aria-hidden="true">${kusy}</div>`;
}

export function vysledekSerie(koren, { vysledky, body, chybnaSlova, hrdina, serieHotova, konec }) {
  const uspesna = eng.serieUspesna(vysledky);
  const svetDokoncen = serieHotova(uspesna) === 'dokonceno';
  const procent = Math.round(eng.uspesnost(vysledky) * 100);
  const pocet = t => vysledky.filter(v => v === t).length;
  const opakovat = [...chybnaSlova.values()];
  koren.innerHTML = `
    <section class="vysledek">
      <div class="parta"></div>
      ${svetDokoncen ? konfety() : ''}
      <h2>${svetDokoncen ? 'Svět dokončen!' : uspesna ? 'Nová oblast je tvoje!' : 'Série dokončena'}</h2>
      <p class="procenta"><b>${procent} %</b> úspěšnost</p>
      <p>${svetDokoncen ? 'Odemkl se další svět a na mapě se objevily skryté oblasti.' : uspesna ? 'Na mapě ti přibyl kousek území.' : `Na novou oblast potřebuješ aspoň ${Math.round(eng.PRAH_USPECHU * 100)} %. Zkus další sérii!`}</p>
      <ul class="statistika">
        <li><b>${pocet('ciste')}</b> ${tvar(pocet('ciste'), 'věta', 'věty', 'vět')} bez chyby</li>
        <li><b>${pocet('chyba')}</b> s chybou</li>
        <li><b>${pocet('odhaleno')}</b> s ukázanou odpovědí</li>
        <li><b>${body}</b> ${tvar(body, 'bod', 'body', 'bodů')}</li>
      </ul>
      ${opakovat.length ? `<p>Tahle slova se ti brzy vrátí:</p><p class="opakovat">${opakovat.map(s => `<span>${cislo(s.d)} ${esc(s.t)}</span>`).join('')}</p>` : ''}
      <div class="ovladani">
        <button type="button" class="znovu">Další série</button>
        <button type="button" class="mapa">Na mapu</button>
      </div>
    </section>`;
  parta(koren.querySelector('.parta'), hrdina)(hlaska(hrdina, svetDokoncen ? 'oslavaSveta' : uspesna ? 'serieUspech' : 'serieNeuspech'), uspesna ? 'radost' : 'zakladni');
  koren.querySelector('.znovu').onclick = () => konec({ znovu: true });
  koren.querySelector('.mapa').onclick = () => konec({ znovu: false });
  koren.querySelector('.znovu').focus();
}
