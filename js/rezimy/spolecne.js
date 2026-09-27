// Společné části herních režimů: pomocné funkce a obrazovka výsledku série.
import * as eng from '../engine.js';

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const cislo = d => `<span class="num" style="--c:var(--d${d})">${d}</span>`;
export const tvar = (n, a, b, c) => (n === 1 ? a : n > 1 && n < 5 ? b : c);

export function vysledekSerie(koren, { vysledky, body, chybnaSlova, serieHotova, konec }) {
  const uspesna = eng.serieUspesna(vysledky);
  const procent = Math.round(eng.uspesnost(vysledky) * 100);
  const pocet = t => vysledky.filter(v => v === t).length;
  const opakovat = [...chybnaSlova.values()];
  serieHotova(uspesna);
  koren.innerHTML = `
    <section class="vysledek">
      <h2>${uspesna ? 'Nová oblast je tvoje!' : 'Série dokončena'}</h2>
      <p class="procenta"><b>${procent} %</b> úspěšnost</p>
      <p>${uspesna ? 'Na mapě ti přibyl kousek území.' : `Na novou oblast potřebuješ aspoň ${Math.round(eng.PRAH_USPECHU * 100)} %. Zkus další sérii!`}</p>
      <ul class="statistika">
        <li><b>${pocet('ciste')}</b> ${tvar(pocet('ciste'), 'věta', 'věty', 'vět')} bez chyby</li>
        <li><b>${pocet('chyba')}</b> s chybou</li>
        <li><b>${pocet('odhaleno')}</b> s ukázanou odpovědí</li>
        <li><b>${body}</b> bodů</li>
      </ul>
      ${opakovat.length ? `<p>Tahle slova se ti brzy vrátí:</p><p class="opakovat">${opakovat.map(s => `<span>${cislo(s.d)} ${esc(s.t)}</span>`).join('')}</p>` : ''}
      <div class="ovladani">
        <button type="button" class="znovu">Další série</button>
        <button type="button" class="mapa">Na mapu</button>
      </div>
    </section>`;
  koren.querySelector('.znovu').onclick = () => konec({ znovu: true });
  koren.querySelector('.mapa').onclick = () => konec({ znovu: false });
  koren.querySelector('.znovu').focus();
}
