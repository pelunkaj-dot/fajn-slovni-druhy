// Herní režim OBRANA HRADU: slova jdou po cestě k hradu, hráč je zastaví věží správného slovního druhu.
// Střílí se na zaměřené slovo (nejblíž hradu, nebo to, na které hráč ťukne).
// Světy 1–2: samostatná jednoznačná slova (jako v Padajících slovech).
// Světy 3–5: slova z vět; nad arénou je celá věta se zvýrazněným zaměřeným slovem (druh určuje kontext).
import { DRUHY } from '../druhy.js';
import * as eng from '../engine.js';
import * as srs from '../srs.js';
import { pridejOtaznik, zeSlova } from '../otaznik.js';
import { esc, cislo, vysledekSerie, parta, zapisovac, textyVety, moznaVsuvka, bezVsuvky } from './spolecne.js';
import { hlaska } from '../hlasky.js';
import { zvuk } from '../zvuky.js';
import { efektZasahu, efektChyby, efektBodu } from '../efekty.js';

// Cesta v poměrných souřadnicích arény: tři řady tam a zpět, na konci hrad.
const CESTA = [[0.07, 0.14], [0.9, 0.14], [0.9, 0.47], [0.1, 0.47], [0.1, 0.8], [0.8, 0.8]];

const HRAD = `<svg class="hrad" viewBox="0 0 60 56" aria-hidden="true">
  <path d="M6 20h8v-8h6v8h6v-8h8v8h6v-8h6v8h8v36H6z" fill="var(--hrad, #9aa3ad)"/>
  <path d="M24 56V40a6 6 0 0 1 12 0v16z" fill="#5a4630"/>
  <rect x="14" y="28" width="6" height="7" rx="2" fill="#ffd54a"/><rect x="40" y="28" width="6" height="7" rx="2" fill="#ffd54a"/>
  <path d="M30 2v10" stroke="#5a4630" stroke-width="2"/><path d="M30 2h12l-4 3 4 3H30z" fill="#e0564f"/></svg>`;

export function spustObranu(koren, { data, slova, krajina = '', opakovani, hrdina, ulozit, serieHotova, konec, zaznam, vsuvka, pomoc = {} }) {
  const veVetach = !slova;
  const vybrana = veVetach
    ? eng.jednotkyZVet(srs.vyberVety(opakovani, data.vety, data.aktivni, eng.DELKA_OBRANY), data.aktivni, s => srs.naleha(opakovani, srs.klic(s)))
    : srs.vyberSlova(opakovani, slova, eng.DELKA_OBRANY);
  const klic = s => srs.klic(s.slovo || s);
  const stat = zapisovac(zaznam); // klíčem je id slova na cestě
  // ve světech 3–5 má jednotka odkaz na větu (kontext pro rodiče)
  const odp = (s, ok, zvoleno = null) => ({ d: s.d, ok, zvoleno, text: s.t, veta: s.veta ? textyVety(s.veta) : null, i: s.veta ? s.i : null });
  const o = eng.novaObrana(vybrana);
  const chybnaSlova = new Map();
  const prvky = new Map();          // id slova → prvek na cestě
  let faze = 'hra';                 // 'hra' | 'pauza' (nápověda) | 'ceka' (ukázaná odpověď) | 'vlna' | 'konec'
  let rada = 0; // zničená slova bez chyby za sebou (zvedají tón)
  let zamereno = null, posledni = 0, casovac = 0, odlozene = 0, body = 0, odhalene = null;

  koren.innerHTML = `
    <section class="lov obrana${veVetach ? ' ve-vetach' : ''}">
      <div class="krajina-pruh" aria-hidden="true">${krajina}</div>
      <div class="hud">
        <button type="button" class="zpet">← Mapa</button>
        <span class="zivoty" aria-label="Životy hradu"></span>
        <span class="vlna-cislo"></span>
        <span class="body" aria-label="Body">0</span>
      </div>
      <div class="parta"></div>
      ${veVetach ? '<p class="kontext" aria-live="polite"></p>' : ''}
      <div class="arena">
        <svg class="cesta" aria-hidden="true"><polyline /></svg>
        ${HRAD}
        <div class="slova-na-ceste"></div>
        <button type="button" class="napoveda" hidden>Nápověda</button>
        <i class="strela" hidden></i>
      </div>
      <div class="volby kose veze${data.aktivni.length > 4 ? ' male' : ''}" role="group" aria-label="Věže podle slovních druhů">
        ${data.aktivni.map(d => `<button type="button" data-d="${d}" style="--c:var(--d${d})">${cislo(d)}<span>${DRUHY[d].nazev}</span></button>`).join('')}
      </div>
      <div class="ovladani"><button type="button" class="dalsi" hidden>Pokračovat →</button></div>
    </section>`;
  const $ = s => koren.querySelector(s);
  const rekni = parta($('.parta'), hrdina);
  const arena = $('.arena');

  $('.zpet').onclick = () => { zastav(); konec(null); };
  $('.veze').onclick = e => { const b = e.target.closest('button[data-d]'); if (b) strel(+b.dataset.d, b); };
  $('.slova-na-ceste').onclick = e => { const el = e.target.closest('.na-ceste'); if (el) { zamereno = +el.dataset.id; oznacCil(); } };
  $('.arena .napoveda').onclick = () => ukazNapovedu();
  $('.dalsi').onclick = () => pokracuj();
  const klavesy = e => {
    if (!koren.contains(arena)) { document.removeEventListener('keydown', klavesy); return; }
    if (!bezVsuvky()) return;
    const d = e.key === '0' ? 10 : +e.key;
    if (d && data.aktivni.includes(d)) strel(d, koren.querySelector(`.veze button[data-d="${d}"]`));
  };
  document.addEventListener('keydown', klavesy);
  addEventListener('resize', nakresliCestu);

  // „?“: slova na cestě se zastaví
  const historie = [];
  let zastaveno = false;
  const polozka = (s, vysledek) => ({ t: s.t, d: s.d, p: s.slovo?.p || '', n: s.slovo?.n || '', veta: s.veta ? s.veta.slova : null, i: s.i, vysledek });
  pridejOtaznik($('.hud'), {
    aktivni: data.aktivni, vsuvky: pomoc.vsuvky, pouzito: pomoc.pouzito || (() => {}),
    naRade() {
      const w = faze === 'hra' || faze === 'pauza' ? aktualniCil() : null;
      return w ? { t: w.s.t, n: w.s.slovo?.n || '', veta: w.s.veta ? w.s.veta.slova : null, i: w.s.i } : null;
    },
    historie: () => historie,
    zastav() { zastaveno = true; },
    pokracuj() { zastaveno = false; },
  });

  function zastav() {
    faze = 'konec';
    cancelAnimationFrame(casovac); clearTimeout(odlozene);
    document.removeEventListener('keydown', klavesy);
    removeEventListener('resize', nakresliCestu);
  }

  // ---------- cesta ----------
  function body2px() {
    const w = arena.clientWidth, h = arena.clientHeight;
    return CESTA.map(([x, y]) => [x * w, y * h]);
  }
  function nakresliCestu() {
    if (!koren.contains(arena)) return;
    const b = body2px();
    $('.cesta').setAttribute('viewBox', `0 0 ${arena.clientWidth} ${arena.clientHeight}`);
    $('.cesta polyline').setAttribute('points', b.map(p => p.join(',')).join(' '));
    prvky.forEach(umisti);
  }
  function bodNaCeste(x) {
    const b = body2px();
    const useky = b.slice(1).map((p, i) => Math.hypot(p[0] - b[i][0], p[1] - b[i][1]));
    let zbyva = x * useky.reduce((a, c) => a + c, 0);
    for (let i = 0; i < useky.length; i++) {
      if (zbyva <= useky[i]) {
        const t = useky[i] ? zbyva / useky[i] : 0;
        return [b[i][0] + (b[i + 1][0] - b[i][0]) * t, b[i][1] + (b[i + 1][1] - b[i][1]) * t];
      }
      zbyva -= useky[i];
    }
    return b[b.length - 1];
  }
  function umisti(el) {
    const w = o.aktivni.find(x => x.id === +el.dataset.id);
    if (!w) return;
    const [x, y] = bodNaCeste(w.x);
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -50%)`;
  }

  // ---------- hlavní smyčka ----------
  function tik(ted) {
    const dt = Math.min(0.1, (ted - posledni) / 1000);
    posledni = ted;
    if (faze === 'hra' && !zastaveno) {
      for (const u of eng.krokObrany(o, dt)) zpracujUdalost(u);
      prvky.forEach(umisti);
    }
    if (faze !== 'konec') casovac = requestAnimationFrame(tik);
  }

  function zpracujUdalost(u) {
    if (u.typ === 'nove') {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'slovo na-ceste';
      el.dataset.id = u.slovo.id;
      el.innerHTML = `<span class="nad"></span><span class="t">${esc(u.slovo.s.t)}</span>`;
      $('.slova-na-ceste').appendChild(el);
      prvky.set(u.slovo.id, el);
      umisti(el);
      oznacCil();
    } else if (u.typ === 'hrad') {
      arena.classList.remove('zasah-hradu'); void arena.offsetWidth; arena.classList.add('zasah-hradu');
      rada = 0;
      zvuk('hrad');
      efektChyby($('.hrad'));
      zapisChybu(u.slovo.s);
      stat.zapis(u.slovo.id, odp(u.slovo.s, false));
      ukazZivoty();
      odhal(u.slovo, `Slovo „${u.slovo.s.t}“ došlo až k hradu!`);
    } else if (u.typ === 'vlna') {
      if (faze === 'ceka') return; // vlna začne po „Pokračovat“
      faze = 'vlna';
      zvuk('vlna');
      rekni(`Vlna ${o.vlna + 2} z ${o.pocetVln}! Slova budou rychlejší.`, 'radost');
      odlozene = setTimeout(() => { eng.dalsiVlna(o); ukazVlnu(); faze = 'hra'; }, 2200);
    } else if (u.typ === 'konec') {
      if (faze === 'ceka') return; // výsledek až po přečtení odpovědi
      dokonci();
    }
  }

  function aktualniCil() {
    if (zamereno != null && o.aktivni.some(w => w.id === zamereno)) return o.aktivni.find(w => w.id === zamereno);
    zamereno = null;
    return eng.cilObrany(o);
  }
  function oznacCil() {
    const c = aktualniCil();
    prvky.forEach((el, id) => el.classList.toggle('cil', !!c && c.id === id));
    if (veVetach) ukazKontext(c);
  }

  // Věta zaměřeného slova, slovo (nebo složený tvar) zvýrazněné.
  function ukazKontext(w) {
    const el = $('.kontext');
    if (!w) { el.innerHTML = '<span class="prazdny">Tady uvidíš větu zaměřeného slova.</span>'; return; }
    const cl = eng.clenove(w.s.veta, w.s.i);
    el.innerHTML = w.s.veta.slova.map((s, j) => `${cl.includes(j) ? `<mark>${esc(s.t)}</mark>` : esc(s.t)}${s.i ? esc(s.i) : ''}`).join(' ');
  }

  // ---------- střelba ----------
  function strel(druh, vez) {
    if (faze !== 'hra' && faze !== 'pauza') return;
    const w = aktualniCil();
    if (!w) return;
    if (faze === 'pauza') faze = 'hra';
    const el = prvky.get(w.id);
    const zbyva = 1 - w.x;
    letStrely(vez, el, druh);
    zvuk('strela');
    const r = eng.vystrel(o, w.id, druh);
    if (r.typ === 'nic') return;
    stat.zapis(w.id, r.typ === 'zasah' ? odp(w.s, true) : odp(w.s, false, druh));
    if (r.typ === 'zasah') {
      if (r.vysledek === 'ciste') srs.uspech(opakovani, klic(w.s));
      const ziskano = eng.bodyZaSlovo(r.vysledek, zbyva);
      body += ziskano;
      $('.body').textContent = body;
      const r2 = r.vysledek === 'ciste' ? rada++ : (rada = 0);
      setTimeout(() => { zvuk('zasah', { rada: r2 }); efektZasahu(el, w.s.d); efektBodu(el, ziskano, w.s.d); }, 170);
      historie.push(polozka(w.s, r.vysledek));
      znic(w, el, 'chyceno');
      if (Math.random() < 0.35) rekni(hlaska(hrdina, 'zasah'), 'radost');
      $('.arena .napoveda').hidden = true;
      zamereno = null;
      oznacCil();
      for (const u of r.udalosti) zpracujUdalost(u);
      return;
    }
    el.classList.remove('vedle'); void el.offsetWidth; el.classList.add('vedle');
    rada = 0;
    setTimeout(() => { zvuk(r.krok === 3 ? 'odhaleni' : 'chyba'); efektChyby(el); }, 170);
    if (r.krok === 1) zapisChybu(w.s);
    if (r.krok === 3) { odhal(w, ''); for (const u of r.udalosti) zpracujUdalost(u); return; }
    rekni(`„${w.s.t}“ není ${DRUHY[druh].nazev}. ${hlaska(hrdina, r.krok === 1 ? 'chyba1' : 'chyba2')}`, 'premysli', 'pozor');
    if (r.krok === 2) $('.arena .napoveda').hidden = false;
  }

  function letStrely(vez, cil, druh) {
    const s = $('.strela');
    if (!vez || !cil) return;
    const a = arena.getBoundingClientRect(), v = vez.getBoundingClientRect(), c = cil.getBoundingClientRect();
    s.hidden = false;
    s.style.setProperty('--c', `var(--d${druh})`);
    s.style.transition = 'none';
    s.style.transform = `translate(${v.left + v.width / 2 - a.left}px, ${a.height}px)`;
    void s.offsetWidth;
    s.style.transition = '';
    s.style.transform = `translate(${c.left + c.width / 2 - a.left}px, ${c.top + c.height / 2 - a.top}px)`;
    clearTimeout(s._t);
    s._t = setTimeout(() => { s.hidden = true; }, 220);
  }

  function zapisChybu(s) {
    const k = klic(s);
    if (!chybnaSlova.has(k)) { srs.chyba(opakovani, k); chybnaSlova.set(k, s); }
  }

  function znic(w, el, trida) {
    prvky.delete(w.id);
    el.classList.remove('cil');
    el.classList.add(trida);
    el.style.setProperty('--c', `var(--d${w.s.d})`);
    el.querySelector('.nad').innerHTML = cislo(w.s.d);
    el.disabled = true;
    setTimeout(() => el.remove(), trida === 'chyceno' ? 450 : 0);
  }

  // Ukáže správnou odpověď a počká na „Pokračovat“.
  function odhal(w, uvod) {
    faze = 'ceka';
    historie.push(polozka(w.s, 'odhaleno'));
    if (odhalene) odhalene.remove();
    const el = prvky.get(w.id);
    if (el) {
      prvky.delete(w.id);
      el.classList.remove('cil');
      el.classList.add('odhaleno');
      el.style.setProperty('--c', `var(--d${w.s.d})`);
      el.querySelector('.nad').innerHTML = cislo(w.s.d);
      el.disabled = true;
    }
    odhalene = el;
    koren.querySelectorAll('.veze button').forEach(b => b.classList.toggle('spravny', +b.dataset.d === w.s.d));
    $('.arena .napoveda').hidden = true;
    rekni(`${uvod ? uvod + ' ' : ''}„${w.s.t}“ je ${DRUHY[w.s.d].nazev}. ${DRUHY[w.s.d].otazka} ${hlaska(hrdina, 'odhaleniMost')}`, 'zakladni', 'odhaleni');
    ulozit();
    $('.dalsi').hidden = false;
    $('.dalsi').focus();
  }

  // Po odhaleném slově hra stojí – vhodná chvíle na vsuvku.
  function pokracuj() {
    $('.dalsi').hidden = true;
    moznaVsuvka(koren, vsuvka, hrdina, pokracujDal);
  }

  function pokracujDal() {
    if (odhalene) { odhalene.remove(); odhalene = null; }
    koren.querySelectorAll('.veze button').forEach(b => b.classList.remove('spravny'));
    zamereno = null;
    oznacCil();
    if (o.hotovo) { dokonci(); return; }
    faze = o.cekaNaVlnu ? 'vlna' : 'hra';
    if (o.cekaNaVlnu) zpracujUdalost({ typ: 'vlna' });
    posledni = performance.now();
  }

  function ukazNapovedu() {
    if (faze !== 'hra') return;
    faze = 'pauza';
    zvuk('napoveda');
    $('.arena .napoveda').hidden = true;
    const w = aktualniCil();
    const vlastni = w && w.s.slovo && w.s.slovo.n;
    rekni(`${hlaska(hrdina, 'napoveda')} ${vlastni || data.aktivni.map(d => `${DRUHY[d].otazka} (${DRUHY[d].nazev})`).join(' · ')}`, 'zakladni', 'rada');
  }

  function ukazZivoty() {
    $('.zivoty').innerHTML = Array.from({ length: eng.ZIVOTY }, (_, i) => `<i class="${i < o.zivoty ? 'plny' : ''}">♥</i>`).join('');
    $('.zivoty').setAttribute('aria-label', `Životy hradu: ${o.zivoty} z ${eng.ZIVOTY}`);
  }
  function ukazVlnu() { $('.vlna-cislo').textContent = `Vlna ${o.vlna + 1}/${o.pocetVln}`; }

  function dokonci() {
    zastav();
    if (veVetach) vybrana.forEach(j => srs.zapamatujVetu(opakovani, j.veta.id));
    ulozit();
    // při ztrátě hradu je výsledků méně než slov v sérii, takže série není úspěšná
    vysledekSerie(koren, { vysledky: o.vysledky, body, chybnaSlova, hrdina, serieHotova, konec, delka: eng.DELKA_OBRANY, jednotka: ['slovo', 'slova', 'slov'], bezZtraty: o.zivoty === eng.ZIVOTY && o.vysledky.length === eng.DELKA_OBRANY });
  }

  if (!vybrana.length) { koren.innerHTML = '<p class="chyba">V tomto světě zatím nejsou žádná slova.</p>'; return; }
  ukazZivoty();
  ukazVlnu();
  nakresliCestu();
  rekni(hlaska(hrdina, 'uvodObrana'));
  zvuk('vlna');
  faze = 'vlna';
  odlozene = setTimeout(() => { faze = 'hra'; posledni = performance.now(); }, 1500);
  posledni = performance.now();
  casovac = requestAnimationFrame(tik);
}
