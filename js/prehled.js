// Obrazovky „Moje sbírka“ (pro dítě: hvězdy, zvládnutí druhů, odznaky) a „Pro rodiče“ (za heslem).
import { DRUHY, SVETY } from './druhy.js';
import * as stat from './statistika.js';
import { esc, cislo, tvar, hvezdyHtml, odznakHtml } from './rezimy/spolecne.js';
import { zvuk } from './zvuky.js';

const MESICE = d => { const x = new Date(d); return `${x.getDate()}. ${x.getMonth() + 1}.`; };
const denZKlice = k => { const [r, m, d] = k.split('-').map(Number); return new Date(r, m - 1, d, 12); };
const minut = ms => (ms <= 0 ? '0 min' : ms < 60e3 ? '< 1 min' : `${Math.round(ms / 60e3)} min`);
const procenta = p => (p == null ? '–' : `${Math.round(p * 100)} %`);

// Ukazatel zvládnutí: 4 dílky, rozsvítí se podle úrovně (nováček žádný, mistr všechny).
const meric = (d, u) => `<span class="meric" style="--c:var(--d${d})" aria-hidden="true">${[1, 2, 3, 4].map(k => `<i class="${k <= stat.UROVNE[u].krok ? 'ma' : ''}"></i>`).join('')}</span>`;

// ---------- Moje sbírka ----------
export function ukazSbirku(koren, { st, dostupne, zpet }) {
  const celkem = stat.hvezdCelkem(st);
  const ziskane = stat.ODZNAKY.filter(o => st.odznaky[o.id]).length;
  koren.innerHTML = `
    <section class="sbirka">
      <div class="hud"><button type="button" class="zpet">← Mapa</button></div>
      <h2>Moje sbírka</h2>
      <div class="karta-sbirky">
        <h3>Hvězdy <span class="pocet">★ ${celkem}</span></h3>
        <p class="vysvetlivka">Za každou sérii získáš až tři hvězdy. Tři dostaneš, když všechno uhodneš bez nápovědy.</p>
        <ul class="hvezdy-svetu">
          ${Object.entries(SVETY).filter(([n]) => dostupne.includes(+n)).map(([n, s]) => `<li><span class="poradi">${n}</span>${esc(s.nazev)}<b>★ ${st.hvezdy[n] || 0}</b></li>`).join('')}
        </ul>
      </div>
      <div class="karta-sbirky">
        <h3>Jak umím slovní druhy</h3>
        <p class="vysvetlivka">Nováček → Učeň → Pokročilý → Jistota → Mistr. Počítá se posledních ${stat.OKNO} odpovědí u každého druhu.</p>
        <ul class="zvladnuti">
          ${Object.entries(DRUHY).map(([d, x]) => {
            const u = stat.uroven(st.okno[d]);
            return `<li>${cislo(d)}<span class="nazev">${esc(x.nazev)}</span>${meric(d, u)}<span class="uroven u-${u}">${stat.UROVNE[u].nazev}</span></li>`;
          }).join('')}
        </ul>
      </div>
      <div class="karta-sbirky">
        <h3>Odznaky <span class="pocet">${ziskane} z ${stat.ODZNAKY.length}</span></h3>
        <div class="odznaky">
          ${stat.ODZNAKY.map(o => odznakHtml(o, !!st.odznaky[o.id])).join('')}
        </div>
      </div>
    </section>`;
  koren.querySelector('.zpet').onclick = () => { zvuk('klik'); zpet(); };
}

// ---------- Pro rodiče ----------
let odemceno = false; // platí do zavření stránky

export function ukazRodice(koren, { st, hrac, vsuvky = [], ulozit, zpet }) {
  const obal = obsah => {
    koren.innerHTML = `<section class="rodice"><div class="hud"><button type="button" class="zpet">← Mapa</button></div>${obsah}</section>`;
    koren.querySelector('.zpet').onclick = () => { zvuk('klik'); zpet(); };
  };
  const znovu = () => ukazRodice(koren, { st, hrac, vsuvky, ulozit, zpet });

  if (!stat.maHeslo(st)) {
    obal(`
      <form class="brana">
        <h2>Pro rodiče</h2>
        <p>Přehled je chráněný heslem, aby do něj dítě nechodilo. Nastavte si ho, stačí jednoduché.</p>
        <label>Heslo <input type="password" name="a" autocomplete="new-password" required minlength="4"></label>
        <label>Heslo znovu <input type="password" name="b" autocomplete="new-password" required minlength="4"></label>
        <p class="chyba-formulare" aria-live="polite"></p>
        <button type="submit">Nastavit heslo</button>
        <p class="vysvetlivka">Heslo i všechna data zůstávají jen v tomto zařízení.</p>
      </form>`);
    const f = koren.querySelector('form');
    f.a.focus();
    f.onsubmit = async e => {
      e.preventDefault();
      if (f.a.value !== f.b.value) { f.querySelector('.chyba-formulare').textContent = 'Hesla se neshodují.'; return; }
      await stat.nastavHeslo(st, f.a.value);
      ulozit();
      odemceno = true;
      znovu();
    };
    return;
  }

  if (!odemceno) {
    obal(`
      <form class="brana">
        <h2>Pro rodiče</h2>
        <label>Heslo <input type="password" name="h" autocomplete="current-password" required></label>
        <p class="chyba-formulare" aria-live="polite"></p>
        <button type="submit">Otevřít přehled</button>
        <button type="button" class="odkaz zapomenute">Zapomněl(a) jsem heslo</button>
        <div class="obnova" hidden>
          <p>Heslo se smaže a nastavíte nové. Statistika zůstane, ale v přehledu bude vidět, kdy se heslo obnovovalo.</p>
          <button type="button" class="potvrdit-obnovu">Obnovit heslo</button>
        </div>
      </form>`);
    const f = koren.querySelector('form');
    f.h.focus();
    f.onsubmit = async e => {
      e.preventDefault();
      if (await stat.overHeslo(st, f.h.value)) { odemceno = true; znovu(); return; }
      f.querySelector('.chyba-formulare').textContent = 'Heslo nesouhlasí.';
      f.h.select();
    };
    // potvrzení přímo ve stránce (okno confirm() může být v náhledu zablokované)
    f.querySelector('.zapomenute').onclick = () => { f.querySelector('.obnova').hidden = false; };
    f.querySelector('.potvrdit-obnovu').onclick = () => {
      stat.obnovHeslo(st);
      ulozit();
      znovu();
    };
    return;
  }

  obal(prehled(st, hrac, vsuvky));
  koren.querySelector('.zmenit-heslo').onclick = () => {
    delete st.rodic.hash;
    delete st.rodic.sul;
    ulozit();
    znovu();
  };
}

function prehled(st, hrac, vsuvky) {
  const ted = Date.now();
  const zvolil = hrac === 'holka' ? 'zvolila' : hrac === 'kluk' ? 'zvolil' : 'zvolil(a)';
  const dny = stat.posledniDny(st, 28, ted);
  const tyden = dny.slice(-7);
  const dnes = dny[dny.length - 1];
  const obnoveno = st.rodic.obnoveno || [];
  const posledniObnova = obnoveno[obnoveno.length - 1];

  // souhrn
  const dnuTydne = tyden.filter(d => d.ms > 0 || d.ok + d.zle > 0).length;
  const souhrn = `
    <div class="dlazdice">
      <div><span>Dnes</span><b>${minut(dnes.ms)}</b><small>${dnes.ok + dnes.zle} ${tvar(dnes.ok + dnes.zle, 'odpověď', 'odpovědi', 'odpovědí')}</small></div>
      <div><span>Posledních 7 dní</span><b>${minut(tyden.reduce((a, d) => a + d.ms, 0))}</b><small>hrál${hrac === 'holka' ? 'a' : ''} ${dnuTydne} ${tvar(dnuTydne, 'den', 'dny', 'dní')}</small></div>
      <div><span>Dny v kuse</span><b>${stat.dnyVKuse(st, ted)}</b><small>nejdelší řada správně: ${st.nejRada}</small></div>
      <div><span>Správně celkem</span><b>${st.spravne}</b><small>${st.serie} ${tvar(st.serie, 'série', 'série', 'sérií')} · ★ ${stat.hvezdCelkem(st)}</small></div>
    </div>`;

  // úspěšnost po druzích
  const druhy = Object.entries(DRUHY).map(([d, x]) => {
    const c = st.celkem[d] || { ok: 0, zle: 0 };
    const p = stat.podil(st.okno[d]);
    const u = stat.uroven(st.okno[d]);
    return `<tr>
      <th scope="row">${cislo(d)} ${esc(x.nazev)}</th>
      <td><div class="sloupec-pruh"><span class="pruh" aria-hidden="true"><i style="--c:var(--d${d});width:${p == null ? 0 : Math.round(p * 100)}%"></i></span><span class="hodnota">${procenta(p)}</span></div></td>
      <td>${stat.UROVNE[u].nazev}</td>
      <td class="cislo">${c.ok + c.zle}</td>
    </tr>`;
  }).join('');

  // záměny
  const zam = stat.zameny(st, 5);
  const zamenyHtml = zam.length
    ? `<ul class="zameny">${zam.map(z => `<li><span>správně ${cislo(z.d)} <b>${esc(DRUHY[z.d].nazev)}</b></span><span>${zvolil} ${cislo(z.z)} <b>${esc(DRUHY[z.z].nazev)}</b></span><span class="kolikrat">${z.n}×</span></li>`).join('')}</ul>`
    : '<p class="prazdne">Zatím žádné záměny. Výborně!</p>';

  // kalendář 4 týdnů: řádky = týdny, sloupce = po–ne; stupeň podle minut
  const stupen = ms => (ms <= 0 ? 0 : ms < 10 * 60e3 ? 1 : ms < 20 * 60e3 ? 2 : 3);
  const prvni = denZKlice(dny[0].den);
  const posun = (prvni.getDay() + 6) % 7; // prázdná políčka před prvním dnem, aby sloupce seděly na dny v týdnu
  const policka = [...Array(posun).fill('<span class="prazdny"></span>'), ...dny.map(d => {
    const titul = `${MESICE(denZKlice(d.den))}: ${minut(d.ms)}, ${d.ok + d.zle} ${tvar(d.ok + d.zle, 'odpověď', 'odpovědi', 'odpovědí')}`;
    return `<span class="st${stupen(d.ms)}${d.den === dnes.den ? ' dnes' : ''}" title="${titul}" aria-label="${titul}"><small>${denZKlice(d.den).getDate()}</small></span>`;
  })].join('');
  const kalendar = `
    <div class="kalendar">
      ${['po', 'út', 'st', 'čt', 'pá', 'so', 'ne'].map(d => `<b aria-hidden="true">${d}</b>`).join('')}
      ${policka}
    </div>
    <p class="legenda-kalendare" aria-hidden="true"><span class="st0"></span> bez hraní <span class="st1"></span> do 10 min <span class="st2"></span> 10–20 min <span class="st3"></span> přes 20 min</p>`;

  // vývoj po týdnech: sloupce s popiskem hodnoty
  const t = stat.tydny(st, 8, ted);
  const vyvoj = `
    <div class="vyvoj" role="table" aria-label="Úspěšnost po týdnech">
      ${t.map(w => `<div class="tyden" role="row" title="Týden od ${MESICE(denZKlice(w.od))}: ${procenta(w.podil)} (${w.ok + w.zle} ${tvar(w.ok + w.zle, 'odpověď', 'odpovědi', 'odpovědí')})">
        <span class="hodnota" role="cell">${procenta(w.podil)}</span>
        <span class="sloupec" aria-hidden="true"><i style="height:${w.podil == null ? 0 : Math.max(2, Math.round(w.podil * 100))}%"></i></span>
        <span class="od" role="rowheader">${MESICE(denZKlice(w.od))}</span>
      </div>`).join('')}
    </div>
    <p class="vysvetlivka">Podíl odpovědí správně napoprvé, po týdnech (pondělí–neděle).</p>`;

  // konkrétní chyby
  const vetaHtml = c => {
    if (!c.veta) return `<span class="veta-chyby"><mark>${esc(c.t)}</mark></span>`;
    // u složeného tvaru (např. „budu číst“) se zvýrazní všechny jeho části
    const casti = new Set(c.t.split(' '));
    const oznacit = j => j === c.i || (casti.size > 1 && casti.has(c.veta[j].replace(/[,.!?:;]+$/, '')) && Math.abs(j - c.i) <= 4);
    const bez = c.veta.map((w, j) => (oznacit(j) ? `<mark>${esc(w)}</mark>` : esc(w)));
    return `<span class="veta-chyby">${bez.join(' ')}</span>`;
  };
  const chyby = st.chyby.length
    ? seznamChyb(st.chyby.slice(0, 10)) + (st.chyby.length > 10 ? `<details class="dalsi-chyby"><summary>Zobrazit dalších ${st.chyby.length - 10}</summary>${seznamChyb(st.chyby.slice(10), 11)}</details>` : '')
    : '<p class="prazdne">Zatím žádné chyby.</p>';
  function seznamChyb(seznam, start = 1) {
    return `<ol class="chyby" start="${start}">${seznam.map(c => `<li>${vetaHtml(c)}<small>${MESICE(c.kdy)} · ${c.z ? `${zvolil}: ${esc(DRUHY[c.z].nazev)} · ` : ''}správně: <b>${esc(DRUHY[c.d].nazev)}</b></small></li>`).join('')}</ol>`;
  }

  return `
    <h2>Přehled pro rodiče</h2>
    ${posledniObnova ? `<p class="upozorneni">Heslo bylo obnoveno ${new Date(posledniObnova).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}${obnoveno.length > 1 ? ` (celkem ${obnoveno.length}×)` : ''}. Pokud jste to nebyli vy, heslo možná obnovilo dítě.</p>` : ''}
    ${souhrn}
    <div class="karta-sbirky">
      <h3>Úspěšnost po slovních druzích</h3>
      <p class="vysvetlivka">Úspěšnost je z posledních ${stat.OKNO} odpovědí u každého druhu, počítá se jen první pokus.</p>
      <table class="tabulka-druhu">
        <thead><tr><th scope="col">Druh</th><th scope="col">Úspěšnost</th><th scope="col">Úroveň</th><th scope="col" class="cislo">Odpovědí</th></tr></thead>
        <tbody>${druhy}</tbody>
      </table>
    </div>
    <div class="karta-sbirky">
      <h3>Co si nejčastěji plete</h3>
      ${zamenyHtml}
    </div>
    <div class="dva-sloupce">
      <div class="karta-sbirky">
        <h3>Čas a pravidelnost</h3>
        <p class="vysvetlivka">Posledních 28 dní.</p>
        ${kalendar}
      </div>
      <div class="karta-sbirky">
        <h3>Vývoj úspěšnosti</h3>
        ${vyvoj}
      </div>
    </div>
    ${vysvetleni(st, vsuvky)}
    <div class="karta-sbirky">
      <h3>Poslední chyby</h3>
      <p class="vysvetlivka">Posledních ${stat.CHYB} slov, ve kterých se dítě spletlo. Hodí se k procvičení spolu.</p>
      ${chyby}
    </div>
    <p class="vysvetlivka">Všechna data jsou uložená jen v tomto zařízení a prohlížeči. Souhrn po dnech se drží ${stat.DNU} dní.</p>
    <p><button type="button" class="odkaz zmenit-heslo">Změnit heslo</button></p>`;
}

// Didaktické vsuvky, které hra dítěti ukázala (když se mu něco opakovaně pletlo).
function vysvetleni(st, vsuvky) {
  const nazvy = new Map(vsuvky.map(v => [v.id, v]));
  const ukazane = Object.entries(st.vsuvky || {}).sort((a, b) => b[1].kdy - a[1].kdy);
  const druhy = id => id.slice(2).split('-').map(d => cislo(+d)).join(' ');
  return `
    <div class="karta-sbirky">
      <h3>Vysvětlení</h3>
      <p class="vysvetlivka">Když se dítěti něco opakovaně plete, hra se zastaví, vysvětlí rozdíl a dá mu malý úkol na ověření.</p>
      ${(() => { const o = st.otaznik || {}; const n = (o.naRade || 0) + (o.vyresene || 0);
        return `<p class="otaznik-pocet">Samo si vysvětlení otevřelo (tlačítko ?): <b>${n}×</b>${n ? ` – ke slovu na řadě ${o.naRade || 0}×, k už vyřešenému slovu ${o.vyresene || 0}×` : ''}.</p>`; })()}
      ${ukazane.length ? `<ul class="vysvetleni">${ukazane.map(([id, x]) => `<li>
        <span class="druhy">${druhy(id)}</span>
        <span class="nazev">${esc(nazvy.get(id)?.nadpis || id)}</span>
        <small>${x.n}× · úkol správně ${x.ok}× · naposledy ${MESICE(x.kdy)}</small>
      </li>`).join('')}</ul>` : '<p class="prazdne">Hra zatím sama nic vysvětlovat nemusela.</p>'}
    </div>`;
}
