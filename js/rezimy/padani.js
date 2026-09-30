// Herní režim PADAJÍCÍ SLOVA: slovo padá shora, hráč ho chytí do koše správného slovního druhu.
// Slova jsou bez věty, proto jen jednoznačná (korpus/slova.txt, světy 1–2).
import { DRUHY } from '../druhy.js';
import * as eng from '../engine.js';
import * as srs from '../srs.js';
import { pridejOtaznik, zeSlova } from '../otaznik.js';
import { esc, cislo, vysledekSerie, parta, zapisovac, textyVety, moznaVsuvka, bezVsuvky } from './spolecne.js';
import { hlaska } from '../hlasky.js';
import { zvuk } from '../zvuky.js';
import { efektZasahu, efektChyby, efektBodu } from '../efekty.js';

export function spustPadani(koren, { data, slova, krajina = '', opakovani, hrdina, ulozit, serieHotova, konec, zaznam, vsuvka, pomoc = {} }) {
  const vybrana = srs.vyberSlova(opakovani, slova || [], eng.DELKA_PADANI);
  srs.zapamatujSlova(opakovani, vybrana.map(srs.klic));
  const stat = zapisovac(zaznam); // klíčem je pořadí slova v sérii
  const p = eng.novePadani(vybrana);
  const chybnaSlova = new Map();
  // stav jednoho slova: 'pada' | 'pauza' (nápověda) | 'ceka' (odhaleno, čeká na „Pokračovat“) | 'mezi'
  let rada = 0; // chycená slova bez chyby za sebou (zvedají tón)
  let faze = 'mezi', y = 0, doba = 1, posledni = 0, casovac = 0, dalsiTimeout = 0, body = 0;

  koren.innerHTML = `
    <section class="lov padani">
      <div class="krajina-pruh" aria-hidden="true">${krajina}</div>
      <div class="hud">
        <button type="button" class="zpet">← Mapa</button>
        <ol class="tecky" aria-label="Postup série">${vybrana.map(() => '<li></li>').join('')}</ol>
        <span class="body" aria-label="Body">0</span>
      </div>
      <div class="parta"></div>
      <div class="arena">
        <div class="padajici" aria-live="polite"><span class="slovo"><span class="nad"></span><span class="t"></span></span></div>
        <button type="button" class="napoveda" hidden>Nápověda</button>
      </div>
      <div class="volby kose${data.aktivni.length > 4 ? ' male' : ''}" role="group" aria-label="Koše podle slovních druhů">
        ${data.aktivni.map(d => `<button type="button" data-d="${d}" style="--c:var(--d${d})">${cislo(d)}<span>${DRUHY[d].nazev}</span></button>`).join('')}
      </div>
      <div class="ovladani"><button type="button" class="dalsi" hidden>Pokračovat →</button></div>
    </section>`;
  const $ = s => koren.querySelector(s);
  const rekni = parta($('.parta'), hrdina);
  const slovoEl = $('.padajici .slovo');

  $('.zpet').onclick = () => { zastav(); konec(null); };
  $('.kose').onclick = e => { const b = e.target.closest('button[data-d]'); if (b) zpracujTip(+b.dataset.d); };
  $('.arena .napoveda').onclick = () => ukazNapovedu();
  $('.dalsi').onclick = () => dalsiSlovo();
  const klavesy = e => {
    if (!koren.contains($('.padani'))) { document.removeEventListener('keydown', klavesy); return; }
    if (!bezVsuvky()) return;
    const d = e.key === '0' ? 10 : +e.key;
    if (d && data.aktivni.includes(d)) zpracujTip(d);
  };
  document.addEventListener('keydown', klavesy);

  // „?“: slovo přestane padat; naplánovaný krok počká
  const historie = [];
  let zastaveno = false, odlozeno = null, dalsiKrok = null;
  const naplanuj = (f, ms) => { dalsiKrok = f; dalsiTimeout = setTimeout(() => { dalsiTimeout = 0; f(); }, ms); };
  pridejOtaznik($('.hud'), {
    aktivni: data.aktivni, vsuvky: pomoc.vsuvky, pouzito: pomoc.pouzito || (() => {}),
    naRade: () => (faze === 'pada' || faze === 'pauza' ? { t: eng.padajici(p).t } : null),
    historie: () => historie,
    zastav() {
      zastaveno = true;
      if (dalsiTimeout) { clearTimeout(dalsiTimeout); dalsiTimeout = 0; odlozeno = dalsiKrok; }
    },
    pokracuj() {
      zastaveno = false;
      if (odlozeno) { const f = odlozeno; odlozeno = null; f(); }
    },
  });

  function zastav() {
    cancelAnimationFrame(casovac); clearTimeout(dalsiTimeout);
    document.removeEventListener('keydown', klavesy);
  }

  const drahaMax = () => $('.arena').clientHeight - $('.padajici').offsetHeight;

  function spustSlovo() {
    const s = eng.padajici(p);
    slovoEl.className = 'slovo';
    slovoEl.style.removeProperty('--c');
    slovoEl.querySelector('.nad').innerHTML = '';
    slovoEl.querySelector('.t').textContent = s.t;
    $('.padajici').style.left = `${22 + Math.random() * 56}%`;
    $('.arena .napoveda').hidden = true;
    $('.dalsi').hidden = true;
    koren.querySelectorAll('.tecky li').forEach((li, i) => li.classList.toggle('ted', i === p.i));
    koren.querySelectorAll('.kose button').forEach(b => { b.disabled = false; b.classList.remove('spravny'); });
    y = 0;
    doba = eng.dobaPadu(p.i, p.slova.length);
    faze = 'pada';
    nakresli();
    posledni = performance.now();
    casovac = requestAnimationFrame(tik);
  }

  function tik(ted) {
    if (faze === 'pada' && !zastaveno) {
      y += (ted - posledni) / 1000 / doba;
      if (y >= 1) { y = 1; nakresli(); zpracujDopad(); return; }
      nakresli();
    }
    posledni = ted;
    if (faze === 'pada' || faze === 'pauza') casovac = requestAnimationFrame(tik);
  }

  function nakresli() {
    $('.padajici').style.transform = `translate(-50%, ${Math.round(y * drahaMax())}px)`;
  }

  function zpracujTip(druh) {
    if (faze !== 'pada' && faze !== 'pauza') return;
    const s = eng.padajici(p);
    const i = p.i;
    const zbyva = 1 - y;
    const r = eng.tipPadani(p, druh);
    if (r.typ === 'nic') return;
    stat.zapis(i, r.typ === 'zasah' ? { d: s.d, ok: true, text: s.t } : { d: s.d, zvoleno: druh, ok: false, text: s.t });
    if (faze === 'pauza') faze = 'pada';
    if (r.typ === 'zasah') {
      const vysl = p.vysledky[i];
      oznac(s.d, 'chyceno');
      const ziskano = eng.bodyZaSlovo(vysl, zbyva);
      body += ziskano;
      $('.body').textContent = body;
      if (vysl === 'ciste') srs.uspech(opakovani, srs.klic(s));
      zvuk('zasah', { rada: vysl === 'ciste' ? rada++ : (rada = 0) });
      efektZasahu(slovoEl, s.d);
      efektBodu(slovoEl, ziskano, s.d);
      koren.querySelectorAll('.tecky li')[i].className = vysl;
      koren.querySelector(`.kose button[data-d="${s.d}"]`).classList.add('spravny');
      if (Math.random() < 0.4) rekni(hlaska(hrdina, 'zasah'), 'radost');
      faze = 'mezi';
      historie.push({ t: s.t, d: s.d, veta: null, vysledek: vysl });
      naplanuj(dalsiSlovo, 450);
      return;
    }
    slovoEl.classList.remove('vedle'); void slovoEl.offsetWidth; slovoEl.classList.add('vedle');
    rada = 0;
    zvuk(r.krok === 3 ? 'odhaleni' : 'chyba');
    efektChyby(slovoEl);
    if (r.krok === 1) {
      srs.chyba(opakovani, srs.klic(s));
      chybnaSlova.set(srs.klic(s), s);
    }
    if (r.krok === 3) { odhal(s, i); return; }
    rekni(`„${s.t}“ není ${DRUHY[druh].nazev}. ${hlaska(hrdina, r.krok === 1 ? 'chyba1' : 'chyba2')}`, 'premysli', 'pozor');
    if (r.krok === 2) $('.arena .napoveda').hidden = false;
  }

  function zpracujDopad() {
    const s = eng.padajici(p);
    const i = p.i;
    eng.dopad(p);
    stat.zapis(i, { d: s.d, ok: false, text: s.t });
    rada = 0;
    zvuk('odhaleni');
    efektChyby(slovoEl);
    if (!chybnaSlova.has(srs.klic(s))) { srs.chyba(opakovani, srs.klic(s)); chybnaSlova.set(srs.klic(s), s); }
    odhal(s, i);
  }

  // Odpověď se ukáže a hra počká, až si ji hráč přečte.
  function odhal(s, i) {
    faze = 'ceka';
    historie.push({ t: s.t, d: s.d, veta: null, vysledek: 'odhaleno' });
    oznac(s.d, 'odhaleno');
    koren.querySelectorAll('.tecky li')[i].className = 'odhaleno';
    koren.querySelectorAll('.kose button').forEach(b => { b.disabled = +b.dataset.d !== s.d; b.classList.toggle('spravny', +b.dataset.d === s.d); });
    $('.arena .napoveda').hidden = true;
    rekni(`„${s.t}“ je ${DRUHY[s.d].nazev}. ${DRUHY[s.d].otazka} ${hlaska(hrdina, 'odhaleniMost')}`, 'zakladni', 'odhaleni');
    ulozit();
    $('.dalsi').hidden = false;
    $('.dalsi').focus();
  }

  function oznac(d, trida) {
    slovoEl.classList.add(trida);
    slovoEl.style.setProperty('--c', `var(--d${d})`);
    slovoEl.querySelector('.nad').innerHTML = cislo(d);
  }

  function ukazNapovedu() {
    if (faze !== 'pada') return;
    faze = 'pauza';
    zvuk('napoveda');
    $('.arena .napoveda').hidden = true;
    const text = data.aktivni.map(d => `${DRUHY[d].otazka} (${DRUHY[d].nazev})`).join(' · ');
    rekni(`${hlaska(hrdina, 'napoveda')} ${text}`, 'zakladni', 'rada');
  }

  function dalsiSlovo() {
    clearTimeout(dalsiTimeout);
    ulozit();
    if (p.hotovo) {
      zastav();
      vysledekSerie(koren, { vysledky: p.vysledky, body, chybnaSlova, hrdina, serieHotova, konec, delka: eng.DELKA_PADANI, jednotka: ['slovo', 'slova', 'slov'] });
      return;
    }
    moznaVsuvka(koren, vsuvka, hrdina, spustSlovo);
  }

  if (!vybrana.length) { koren.innerHTML = '<p class="chyba">V tomto světě zatím nejsou žádná slova.</p>'; return; }
  rekni(hlaska(hrdina, 'uvodPadani'));
  naplanuj(spustSlovo, 900);
}
