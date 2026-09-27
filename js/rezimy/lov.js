// Herní režim LOV: ve větě najdi všechna slova daného druhu.
import { DRUHY } from '../druhy.js';
import * as eng from '../engine.js';
import * as srs from '../srs.js';
import { esc, cislo, vysledekSerie, parta } from './spolecne.js';
import { HLASKY, nahodna } from '../hlasky.js';

export function spustLov(koren, { data, krajina = '', opakovani, hrdina, ulozit, serieHotova, konec }) {
  const vety = srs.vyberVety(opakovani, data.vety, data.aktivni, eng.DELKA_SERIE);
  const vysledky = [];
  const chybnaSlova = new Map();
  let poradi = 0, body = 0, st = null, start = 0, limit = 0, casovac = 0, dalsiTimeout = 0;

  koren.innerHTML = `
    <section class="lov">
      <div class="krajina-pruh" aria-hidden="true">${krajina}</div>
      <div class="hud">
        <button type="button" class="zpet">← Mapa</button>
        <ol class="tecky" aria-label="Postup série">${vety.map(() => '<li></li>').join('')}</ol>
        <span class="body" aria-label="Body">0</span>
      </div>
      <div class="cil"></div>
      <div class="casovac" aria-hidden="true"><i></i></div>
      <p class="veta"></p>
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
  $('.veta').onclick = e => { const b = e.target.closest('.slovo'); if (b) zpracujKlik(+b.dataset.i, b); };

  function zastav() { cancelAnimationFrame(casovac); clearTimeout(dalsiTimeout); }

  function vykresliVetu() {
    const v = vety[poradi];
    const cil = srs.vyberCil(opakovani, v, data.aktivni);
    st = eng.novaVeta(v, cil, data.aktivni);
    const d = DRUHY[cil];
    $('.cil').style.setProperty('--c', `var(--d${cil})`);
    $('.cil').innerHTML = `${cislo(cil)}<span>Najdi všechna <b>${d.mnozne}</b></span><span class="zbyva"></span>`;
    $('.veta').innerHTML = v.slova.map((s, i) => {
      const aktivni = data.aktivni.includes(s.d);
      return `<span class="skup"><button type="button" class="slovo${aktivni ? '' : ' sede'}" data-i="${i}"${aktivni ? '' : ' tabindex="-1" aria-disabled="true"'}>`
        + `<span class="nad"></span><span class="t">${esc(s.t)}</span></button>${s.i ? `<span class="interp">${esc(s.i)}</span>` : ''}</span>`;
    }).join(' ');
    if (poradi === 0) rekni(nahodna(HLASKY.uvodLov));
    $('button.napoveda').hidden = true;
    $('.dalsi').hidden = true;
    koren.querySelectorAll('.tecky li').forEach((li, i) => li.classList.toggle('ted', i === poradi));
    aktualizujZbyva();
    limit = eng.limitVety(st);
    start = performance.now();
    tik();
    const prvni = koren.querySelector('.slovo:not(.sede)');
    if (prvni) prvni.focus({ preventScroll: true });
  }

  function tik() {
    const zbyvaCasu = Math.max(0, 1 - (performance.now() - start) / 1000 / limit);
    $('.casovac i').style.width = `${zbyvaCasu * 100}%`;
    if (zbyvaCasu > 0 && !st.hotovo) casovac = requestAnimationFrame(tik);
  }

  function aktualizujZbyva() {
    const n = eng.zbyva(st);
    $('.zbyva').textContent = st.hotovo ? '' : `zbývá ${n}`;
  }

  function zpracujKlik(i, btn) {
    const r = eng.klik(st, i);
    if (r.typ === 'nic') return;
    if (r.typ === 'zasah') {
      btn.classList.add('chyceno');
      btn.style.setProperty('--c', `var(--d${st.cil})`);
      btn.querySelector('.nad').innerHTML = cislo(st.cil);
      aktualizujZbyva();
      if (!st.hotovo && Math.random() < 0.5) rekni(nahodna(HLASKY.zasah), 'radost');
      if (st.hotovo) dokonciVetu();
      return;
    }
    btn.classList.remove('vedle');
    void btn.offsetWidth;
    btn.classList.add('vedle');
    const k = srs.klic(st.veta.slova[i]);
    chybnaSlova.set(k, st.veta.slova[i]);
    const m = DRUHY[st.cil].nazev;
    if (r.krok === 1) {
      zprava(`„${st.veta.slova[i].t}“ není ${m}. ${nahodna(HLASKY.chyba1)}`, 'pozor');
    } else if (r.krok === 2) {
      zprava(`„${st.veta.slova[i].t}“ není ${m}. ${nahodna(HLASKY.chyba2)}`, 'pozor');
      $('button.napoveda').hidden = false;
    } else {
      dokonciVetu();
    }
  }

  function ukazNapovedu() {
    const d = DRUHY[st.cil];
    zprava(`${nahodna(HLASKY.napoveda)} ${d.otazka} ${d.popis}`, 'rada');
    $('button.napoveda').hidden = true;
  }

  function zprava(text, druh) {
    rekni(text, { pozor: 'premysli', hura: 'radost' }[druh] || 'zakladni', druh);
  }

  function dokonciVetu() {
    zastav();
    const sekund = (performance.now() - start) / 1000;
    const vysl = eng.vysledekVety(st);
    vysledky.push(vysl);
    const ziskano = eng.bodyZaVetu(st, sekund, limit);
    body += ziskano;
    $('.body').textContent = body;
    koren.querySelectorAll('.tecky li')[poradi].className = vysl;

    for (const i of st.cile) {
      const s = st.veta.slova[i];
      if (st.nalezene.has(i)) srs.uspech(opakovani, srs.klic(s));
      else { srs.chyba(opakovani, srs.klic(s)); chybnaSlova.set(srs.klic(s), s); }
    }
    for (const i of st.spatne) srs.chyba(opakovani, srs.klic(st.veta.slova[i]));
    srs.zapamatujVetu(opakovani, st.veta.id);
    ulozit();

    $('button.napoveda').hidden = true;
    $('.zbyva').textContent = '';
    if (vysl === 'odhaleno') {
      for (const i of st.cile) {
        if (st.nalezene.has(i)) continue;
        const b = koren.querySelector(`.slovo[data-i="${i}"]`);
        b.classList.add('odhaleno');
        b.style.setProperty('--c', `var(--d${st.cil})`);
        b.querySelector('.nad').innerHTML = cislo(st.cil);
      }
      zprava(`Tady jsou všechna ${DRUHY[st.cil].mnozne}. ${nahodna(HLASKY.odhaleniLov)}`, 'odhaleni');
      $('.dalsi').hidden = false;
      $('.dalsi').focus();
    } else {
      zprava(`${nahodna(vysl === 'ciste' ? HLASKY.vetaCista : HLASKY.vetaSChybou)} +${ziskano}`, 'hura');
      dalsiTimeout = setTimeout(dalsiVeta, 1100);
    }
  }

  function dalsiVeta() {
    clearTimeout(dalsiTimeout);
    poradi += 1;
    if (poradi < vety.length) vykresliVetu();
    else vyhodnot();
  }

  function vyhodnot() {
    vysledekSerie(koren, { vysledky, body, chybnaSlova, hrdina, serieHotova, konec });
  }

  if (!vety.length) { koren.innerHTML = '<p class="chyba">V tomto světě zatím nejsou žádné věty.</p>'; return; }
  vykresliVetu();
}
