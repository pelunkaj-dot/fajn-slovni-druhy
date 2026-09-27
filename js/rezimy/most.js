// Herní režim STAVBA MOSTU: urči druh každého slova ve větě; každé správně určené slovo je dílek mostu.
// Poslední věta série je nejdelší – „velký most“.
import { DRUHY } from '../druhy.js';
import * as eng from '../engine.js';
import * as srs from '../srs.js';
import { esc, cislo, vysledekSerie, parta } from './spolecne.js';
import { avatar } from '../postavy.js';
import { hlaska } from '../hlasky.js';

export function spustMost(koren, { data, krajina = '', opakovani, hrdina, ulozit, serieHotova, konec }) {
  const pocetSlov = v => v.slova.filter(s => data.aktivni.includes(s.d)).length;
  const vybrane = srs.vyberVety(opakovani, data.vety, data.aktivni, eng.DELKA_SERIE);
  const nejdelsi = vybrane.reduce((a, v) => (pocetSlov(v) > pocetSlov(a) ? v : a), vybrane[0]);
  const vety = [...vybrane.filter(v => v !== nejdelsi), nejdelsi].filter(Boolean);
  const vysledky = [];
  const chybnaSlova = new Map();
  let poradi = 0, body = 0, m = null, start = 0, limit = 0, casovac = 0, dalsiTimeout = 0;

  koren.innerHTML = `
    <section class="lov most-hra">
      <div class="krajina-pruh" aria-hidden="true">${krajina}</div>
      <div class="hud">
        <button type="button" class="zpet">← Mapa</button>
        <ol class="tecky" aria-label="Postup série">${vety.map(() => '<li></li>').join('')}</ol>
        <span class="body" aria-label="Body">0</span>
      </div>
      <div class="ukol"></div>
      <div class="casovac" aria-hidden="true"><i></i></div>
      <p class="veta"></p>
      <div class="stavba" aria-hidden="true"><div class="prkna"></div>${avatar(hrdina, 'postava')}</div>
      <div class="volby" role="group" aria-label="Slovní druhy">
        ${data.aktivni.map(d => `<button type="button" data-d="${d}">${cislo(d)}<span>${DRUHY[d].nazev}</span></button>`).join('')}
      </div>
      <div class="parta"></div>
      <div class="ovladani">
        <button type="button" class="napoveda" hidden>Nápověda</button>
        <button type="button" class="dalsi" hidden>Další věta →</button>
      </div>
    </section>`;
  const $ = s => koren.querySelector(s);
  const rekni = parta($('.parta'), hrdina);

  $('.zpet').onclick = () => { zastav(); konec(null); };
  $('button.napoveda').onclick = () => ukazNapovedu();
  $('.dalsi').onclick = () => dalsiVeta();
  $('.volby').onclick = e => { const b = e.target.closest('button[data-d]'); if (b) zpracujTip(+b.dataset.d); };

  function zastav() { cancelAnimationFrame(casovac); clearTimeout(dalsiTimeout); }

  function vykresliVetu() {
    const v = vety[poradi];
    m = eng.novyMost(v, data.aktivni);
    const boss = poradi === vety.length - 1 && vety.length > 1;
    $('.ukol').innerHTML = boss
      ? '<b>Velký most!</b> Urči slovní druh každého slova.'
      : 'Urči slovní druh <b>zvýrazněného</b> slova.';
    $('.veta').innerHTML = v.slova.map((s, i) => `<span class="skup"><span class="slovo${data.aktivni.includes(s.d) ? '' : ' sede'}" data-i="${i}">`
      + `<span class="nad"></span><span class="t">${esc(s.t)}</span></span>${s.i ? `<span class="interp">${esc(s.i)}</span>` : ''}</span>`).join(' ');
    $('.prkna').innerHTML = m.poradi.map(() => '<i></i>').join('');
    if (boss) rekni(hlaska(hrdina, 'boss'));
    else if (poradi === 0) rekni(hlaska(hrdina, 'uvodMost'));
    $('button.napoveda').hidden = true;
    $('.dalsi').hidden = true;
    koren.querySelectorAll('.volby button').forEach(b => { b.disabled = false; });
    koren.querySelectorAll('.tecky li').forEach((li, i) => li.classList.toggle('ted', i === poradi));
    limit = eng.limitMostu(m);
    start = performance.now();
    oznacAktualni();
    tik();
  }

  function oznacAktualni() {
    koren.querySelectorAll('.slovo.ted').forEach(e => e.classList.remove('ted'));
    const hotovo = m.krok;
    $('.stavba').style.setProperty('--pozice', hotovo / Math.max(1, m.poradi.length));
    if (m.hotovo) return;
    koren.querySelector(`.slovo[data-i="${eng.aktualniSlovo(m)}"]`).classList.add('ted');
  }

  function tik() {
    const zbyva = Math.max(0, 1 - (performance.now() - start) / 1000 / limit);
    $('.casovac i').style.width = `${zbyva * 100}%`;
    if (zbyva > 0 && !m.hotovo) casovac = requestAnimationFrame(tik);
  }

  function polozDilek(i, odhaleno) {
    const s = m.veta.slova[i];
    const el = koren.querySelector(`.slovo[data-i="${i}"]`);
    el.classList.add(odhaleno ? 'odhaleno' : 'chyceno');
    el.style.setProperty('--c', `var(--d${s.d})`);
    el.querySelector('.nad').innerHTML = cislo(s.d);
    const prkno = $('.prkna').children[m.poradi.indexOf(i)];
    prkno.className = odhaleno ? 'prasknute' : 'polozene';
    prkno.style.setProperty('--c', `var(--d${s.d})`);
  }

  function zpracujTip(druh) {
    const i = eng.aktualniSlovo(m);
    const s = m.veta.slova[i];
    const r = eng.tip(m, druh);
    if (r.typ === 'nic') return;
    if (r.typ === 'zasah') {
      polozDilek(i, false);
      if (!m.spatne.includes(i)) srs.uspech(opakovani, srs.klic(s));
      $('button.napoveda').hidden = true;
      if (!m.hotovo && !$('.zprava').classList.contains('odhaleni')) zprava(hlaska(hrdina, 'dilek'), 'dilek');
    } else {
      const el = koren.querySelector(`.slovo[data-i="${i}"]`);
      el.classList.remove('vedle'); void el.offsetWidth; el.classList.add('vedle');
      srs.chyba(opakovani, srs.klic(s));
      chybnaSlova.set(srs.klic(s), s);
      if (r.krok === 1) zprava(`„${s.t}“ není ${DRUHY[druh].nazev}. ${hlaska(hrdina, 'chyba1')}`, 'pozor');
      else if (r.krok === 2) {
        zprava(`„${s.t}“ není ${DRUHY[druh].nazev}. ${hlaska(hrdina, 'chyba2')}`, 'pozor');
        $('button.napoveda').hidden = false;
      } else {
        polozDilek(i, true);
        $('button.napoveda').hidden = true;
        zprava(`„${s.t}“ je ${DRUHY[s.d].nazev}. ${DRUHY[s.d].otazka} ${hlaska(hrdina, 'odhaleniMost')}`, 'odhaleni');
      }
    }
    oznacAktualni();
    if (m.hotovo) dokonciVetu();
  }

  function ukazNapovedu() {
    const s = m.veta.slova[eng.aktualniSlovo(m)];
    const text = s.n || data.aktivni.map(d => `${DRUHY[d].otazka} (${DRUHY[d].nazev})`).join(' · ');
    zprava(`${hlaska(hrdina, 'napoveda')} ${text}`, 'rada');
    $('button.napoveda').hidden = true;
  }

  function zprava(text, druh) {
    rekni(text, { pozor: 'premysli', hura: 'radost', dilek: 'radost' }[druh] || 'zakladni', druh);
  }

  function dokonciVetu() {
    zastav();
    const vysl = eng.vysledekMostu(m);
    vysledky.push(vysl);
    const sekund = (performance.now() - start) / 1000;
    const ziskano = eng.bodyZaMost(m, sekund, limit);
    body += ziskano;
    $('.body').textContent = body;
    koren.querySelectorAll('.tecky li')[poradi].className = vysl;
    srs.zapamatujVetu(opakovani, m.veta.id);
    ulozit();
    koren.querySelectorAll('.volby button').forEach(b => { b.disabled = true; });
    $('button.napoveda').hidden = true;
    if (vysl === 'odhaleno') {
      $('.dalsi').hidden = false;
      $('.dalsi').focus();
    } else {
      const skupina = vysl !== 'ciste' ? 'vetaSChybou' : sekund < limit / 2 ? 'rychle' : 'vetaCista';
      zprava(`${hlaska(hrdina, skupina)} +${ziskano}`, 'hura');
      dalsiTimeout = setTimeout(dalsiVeta, 1200);
    }
  }

  function dalsiVeta() {
    clearTimeout(dalsiTimeout);
    poradi += 1;
    if (poradi < vety.length) vykresliVetu();
    else vysledekSerie(koren, { vysledky, body, chybnaSlova, hrdina, serieHotova, konec });
  }

  if (!vety.length) { koren.innerHTML = '<p class="chyba">V tomto světě zatím nejsou žádné věty.</p>'; return; }
  vykresliVetu();
}
