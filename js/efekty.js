// Vizuální efekty na jednom plátně přes celou obrazovku (nezasahují do klikání).
// Zásah má 8 druhů efektu, oslava série 7; berou se z „pytlíku“, aby se neopakovaly.
// Při „omezit pohyb“ v systému se efekty nekreslí.

let platno = null, g = null, castice = [], bezi = false, posledni = 0, dpr = 1;
const TAU = Math.PI * 2;
const nahodne = (a, b) => a + Math.random() * (b - a);
const vyber = pole => pole[Math.floor(Math.random() * pole.length)];
const klid = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const ZLATA = '#ffd54a';

function priprav() {
  if (platno) return;
  platno = document.createElement('canvas');
  platno.className = 'efekty';
  platno.setAttribute('aria-hidden', 'true');
  document.body.appendChild(platno);
  g = platno.getContext('2d');
  velikost();
  addEventListener('resize', velikost);
}
function velikost() {
  dpr = Math.min(2, devicePixelRatio || 1);
  platno.width = innerWidth * dpr;
  platno.height = innerHeight * dpr;
}
function barvyDruhu() {
  const cs = getComputedStyle(document.documentElement);
  return Array.from({ length: 10 }, (_, i) => cs.getPropertyValue(`--d${i + 1}`).trim()).filter(Boolean);
}
const barvaDruhu = d => getComputedStyle(document.documentElement).getPropertyValue(`--d${d}`).trim() || ZLATA;
function stred(el) {
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
}

// Částice: x, y, vx, vy, ay (gravitace), max (s), zpozdeni, tvar, vel, barva, odpor, rot, vrot, vlneni …
function pridej(p) {
  castice.push({ zivot: -(p.zpozdeni || 0), ay: 0, odpor: 0, rot: 0, vrot: 0, vel: 4, alfa: 1, rust: 0, ...p });
  if (!bezi) { bezi = true; posledni = performance.now(); requestAnimationFrame(smycka); }
}

function smycka(ted) {
  const dt = Math.min(0.05, (ted - posledni) / 1000);
  posledni = ted;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, innerWidth, innerHeight);
  const nove = [];
  for (const p of castice) {
    p.zivot += dt;
    if (p.zivot < 0) { nove.push(p); continue; }
    if (p.zivot > p.max) { if (p.konec) p.konec(p); continue; }
    if (p.odpor) { const k = Math.exp(-p.odpor * dt); p.vx *= k; p.vy *= k; }
    p.vy += p.ay * dt;
    p.x += p.vx * dt + (p.vlneni ? Math.sin(p.zivot * p.vlneni + p.faze) * 0.6 : 0);
    p.y += p.vy * dt;
    p.rot += p.vrot * dt;
    p.vel += p.rust * dt;
    if (p.stopa && Math.random() < p.stopa) pridej({ x: p.x, y: p.y, vx: nahodne(-15, 15), vy: nahodne(-10, 25), max: 0.45, tvar: 'kruh', vel: nahodne(1, 2.2), barva: p.barvaStopy || p.barva });
    kresli(p);
    nove.push(p);
  }
  castice = nove;
  if (castice.length) requestAnimationFrame(smycka);
  else { bezi = false; g.clearRect(0, 0, innerWidth, innerHeight); }
}

function hvezda(r) {
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
    g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  g.closePath();
}

function kresli(p) {
  const t = p.zivot / p.max;
  let a = p.alfa * (p.mizeni === 'konec' ? Math.min(1, (1 - t) * 3) : 1 - t);
  if (p.trpyt) a *= 0.5 + 0.5 * Math.sin(p.zivot * p.trpyt);
  g.globalAlpha = Math.max(0, Math.min(1, a));
  g.save();
  g.translate(p.x, p.y);
  g.rotate(p.rot);
  g.fillStyle = p.barva;
  g.strokeStyle = p.barva;
  const v = p.vel;
  switch (p.tvar) {
    case 'hvezda': hvezda(v); g.fill(); break;
    case 'jiskra': {
      g.rotate(Math.atan2(p.vy, p.vx) - p.rot);
      g.lineWidth = Math.max(1, v * 0.5); g.lineCap = 'round';
      g.beginPath(); g.moveTo(0, 0); g.lineTo(-Math.min(28, Math.hypot(p.vx, p.vy) * 0.05), 0); g.stroke();
      break;
    }
    case 'prsten': g.lineWidth = Math.max(0.5, 4 * (1 - t)); g.beginPath(); g.arc(0, 0, v, 0, TAU); g.stroke(); break;
    case 'bublina':
      g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, v, 0, TAU); g.stroke();
      g.globalAlpha *= 0.6; g.fillStyle = '#fff'; g.beginPath(); g.arc(-v * 0.35, -v * 0.35, v * 0.25, 0, TAU); g.fill();
      break;
    case 'list': g.beginPath(); g.ellipse(0, 0, v, v * 0.45, 0, 0, TAU); g.fill(); break;
    case 'balonek':
      g.rotate(-p.rot);
      g.strokeStyle = 'rgba(120,120,120,.6)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(0, v * 1.2); g.quadraticCurveTo(Math.sin(p.zivot * 3) * 6, v * 2, 0, v * 2.8); g.stroke();
      g.beginPath(); g.ellipse(0, 0, v * 0.85, v * 1.1, 0, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(-v * 0.3, -v * 0.4, v * 0.18, v * 0.3, -0.5, 0, TAU); g.fill();
      break;
    case 'lampion': {
      const r = g.createRadialGradient(0, 0, 0, 0, 0, v * 2.2);
      r.addColorStop(0, p.barva); r.addColorStop(0.35, p.barva); r.addColorStop(1, 'rgba(255,200,80,0)');
      g.fillStyle = r; g.beginPath(); g.arc(0, 0, v * 2.2, 0, TAU); g.fill();
      break;
    }
    case 'duha': {
      const barvy = ['#e0564f', '#f39a3d', '#ffd54a', '#5cc98a', '#4a90e2', '#7d45c4'];
      const podil = Math.min(1, p.zivot / 0.8);
      g.globalAlpha *= 0.7;
      g.lineWidth = v; g.lineCap = 'round';
      barvy.forEach((b, i) => { g.strokeStyle = b; g.beginPath(); g.arc(0, 0, p.polomer - i * v, Math.PI, Math.PI + Math.PI * podil); g.stroke(); });
      break;
    }
    case 'text':
      g.rotate(-p.rot);
      g.font = `800 ${v}px "Baloo 2", system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.9)'; g.strokeText(p.text, 0, 0); g.fillText(p.text, 0, 0);
      break;
    default: g.beginPath(); g.arc(0, 0, v, 0, TAU); g.fill();
  }
  g.restore();
  g.globalAlpha = 1;
}

// ---------- zásah ----------
const ZASAHY = {
  jiskry(x, y, b) { for (let i = 0; i < 20; i++) { const a = nahodne(0, TAU), s = nahodne(160, 420); pridej({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, ay: 500, odpor: 2, max: nahodne(0.4, 0.7), tvar: 'jiskra', vel: 3, barva: i % 3 ? b : ZLATA }); } },
  hvezdy(x, y, b) { for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, s = nahodne(90, 160); pridej({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, odpor: 2.5, vrot: nahodne(-6, 6), max: 0.8, tvar: 'hvezda', vel: nahodne(5, 8), barva: i % 2 ? b : ZLATA }); } },
  prstence(x, y, b) {
    [0, 0.1].forEach((z, i) => pridej({ x, y, vx: 0, vy: 0, max: 0.55, zpozdeni: z, tvar: 'prsten', vel: 6, rust: 110 - i * 30, barva: i ? ZLATA : b }));
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; pridej({ x, y, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, odpor: 4, max: 0.5, tvar: 'kruh', vel: 2.5, barva: b }); }
  },
  bubliny(x, y, b) { for (let i = 0; i < 11; i++) pridej({ x: x + nahodne(-25, 25), y, vx: nahodne(-20, 20), vy: nahodne(-120, -60), vlneni: nahodne(4, 8), faze: nahodne(0, TAU), max: nahodne(0.7, 1.1), tvar: 'bublina', vel: nahodne(3, 8), barva: b }); },
  okvetni(x, y, b) { for (let i = 0; i < 14; i++) { const a = nahodne(-Math.PI, 0); pridej({ x, y, vx: Math.cos(a) * nahodne(60, 160), vy: Math.sin(a) * nahodne(80, 200), ay: 260, odpor: 1.5, vrot: nahodne(-8, 8), vlneni: 5, faze: nahodne(0, TAU), max: nahodne(0.8, 1.2), tvar: 'list', vel: nahodne(4, 7), barva: i % 3 ? b : '#ff9ec4' }); } },
  fontanka(x, y, b) { for (let i = 0; i < 18; i++) pridej({ x, y, vx: nahodne(-110, 110), vy: nahodne(-380, -220), ay: 900, max: nahodne(0.6, 0.9), tvar: 'kruh', vel: nahodne(2, 4), barva: i % 2 ? b : ZLATA, zpozdeni: i * 0.012 }); },
  spirala(x, y, b) { for (let i = 0; i < 16; i++) { const a = i / 16 * TAU * 2, s = 40 + i * 9; pridej({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, odpor: 1, vrot: 4, max: 0.7, zpozdeni: i * 0.015, tvar: 'hvezda', vel: 3.5, barva: i % 2 ? b : ZLATA }); } },
  trpyt(x, y, b) { for (let i = 0; i < 18; i++) pridej({ x: x + nahodne(-45, 45), y: y + nahodne(-30, 30), vx: 0, vy: nahodne(-30, -10), max: nahodne(0.5, 0.9), zpozdeni: nahodne(0, 0.25), trpyt: 25, vrot: 3, tvar: 'hvezda', vel: nahodne(2.5, 5), barva: i % 2 ? '#fff' : ZLATA }); },
};
const OSLAVY = {
  ohnostroj(velka) {
    const barvy = barvyDruhu();
    const n = velka ? 12 : 6;
    for (let i = 0; i < n; i++) {
      const x = nahodne(0.15, 0.85) * innerWidth, cilY = nahodne(0.15, 0.45) * innerHeight, b = vyber(barvy);
      pridej({ x, y: innerHeight + 10, vx: nahodne(-30, 30), vy: -Math.sqrt(2 * 600 * (innerHeight - cilY)), ay: 600, max: Math.sqrt(2 * (innerHeight - cilY) / 600), zpozdeni: i * (velka ? 0.35 : 0.45), tvar: 'kruh', vel: 2.5, barva: '#fff', stopa: 0.6, barvaStopy: ZLATA, mizeni: 'konec',
        konec: p => { for (let k = 0; k < 42; k++) { const a = k / 42 * TAU, s = nahodne(120, 260); pridej({ x: p.x, y: p.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, ay: 160, odpor: 1.8, max: nahodne(0.9, 1.4), tvar: 'kruh', vel: nahodne(1.8, 3), barva: k % 5 ? b : '#fff', trpyt: k % 3 ? 0 : 30 }); } } });
    }
  },
  balonky(velka) {
    const barvy = barvyDruhu();
    for (let i = 0; i < (velka ? 26 : 16); i++) pridej({ x: nahodne(0.05, 0.95) * innerWidth, y: innerHeight + 40, vx: 0, vy: nahodne(-170, -110), vlneni: nahodne(1.5, 3), faze: nahodne(0, TAU), vrot: 0, rot: nahodne(-0.2, 0.2), max: 5.5, zpozdeni: nahodne(0, 1.5), tvar: 'balonek', vel: nahodne(14, 22), barva: vyber(barvy), mizeni: 'konec' });
  },
  hvezdnyDest() {
    for (let i = 0; i < 40; i++) pridej({ x: nahodne(-0.1, 0.8) * innerWidth, y: nahodne(-0.2, 0.3) * innerHeight, vx: nahodne(260, 380), vy: nahodne(160, 260), max: nahodne(1.2, 1.8), zpozdeni: nahodne(0, 1.6), vrot: 5, tvar: 'hvezda', vel: nahodne(6, 10), barva: i % 3 ? ZLATA : '#fff', stopa: 0.7, barvaStopy: '#fff3b0', mizeni: 'konec' });
  },
  lampiony() {
    for (let i = 0; i < 16; i++) pridej({ x: nahodne(0.08, 0.92) * innerWidth, y: innerHeight + 30, vx: 0, vy: nahodne(-90, -55), vlneni: nahodne(1, 2), faze: nahodne(0, TAU), max: 6, zpozdeni: nahodne(0, 2), trpyt: 6, tvar: 'lampion', vel: nahodne(8, 13), barva: vyber(['#ffcc66', '#ffb347', '#ffe08a', '#ff9e6b']), mizeni: 'konec' });
  },
  vodotrysky() {
    const barvy = barvyDruhu();
    for (let i = 0; i < 90; i++) {
      const vlevo = i % 2 === 0;
      pridej({ x: vlevo ? 20 : innerWidth - 20, y: innerHeight, vx: (vlevo ? 1 : -1) * nahodne(120, 300), vy: nahodne(-820, -560), ay: 900, max: 1.6, zpozdeni: i * 0.025, tvar: 'kruh', vel: nahodne(2.5, 4.5), barva: vyber(barvy), mizeni: 'konec' });
    }
  },
  duha() {
    const polomer = Math.min(innerWidth * 0.45, 260);
    pridej({ x: innerWidth / 2, y: innerHeight * 0.6, vx: 0, vy: 0, max: 2.8, tvar: 'duha', vel: 6, polomer, mizeni: 'konec' });
    for (let i = 0; i < 30; i++) { const a = Math.PI + Math.PI * (i / 30); pridej({ x: innerWidth / 2 + Math.cos(a) * polomer, y: innerHeight * 0.6 + Math.sin(a) * polomer, vx: 0, vy: nahodne(-20, 20), max: 1.4, zpozdeni: 0.8 * i / 30, trpyt: 20, tvar: 'hvezda', vel: nahodne(3, 5), barva: i % 2 ? '#fff' : ZLATA }); }
  },
  mydliny() {
    const barvy = barvyDruhu();
    for (let i = 0; i < 34; i++) pridej({ x: nahodne(0.05, 0.95) * innerWidth, y: innerHeight + 30, vx: nahodne(-15, 15), vy: nahodne(-150, -70), vlneni: nahodne(2, 4), faze: nahodne(0, TAU), max: nahodne(4, 6), zpozdeni: nahodne(0, 2), tvar: 'bublina', vel: nahodne(8, 26), barva: vyber(barvy), mizeni: 'konec' });
  },
};

const pytliky = {};
function zPytliku(nazev, klice) {
  if (!pytliky[nazev] || !pytliky[nazev].length) pytliky[nazev] = [...klice].sort(() => Math.random() - 0.5);
  return pytliky[nazev].pop();
}

// Zásah u prvku (slovo, tlačítko). d = slovní druh (barva efektu).
export function efektZasahu(el, d) {
  if (!el || klid()) return;
  priprav();
  const [x, y] = stred(el);
  ZASAHY[zPytliku('zasah', Object.keys(ZASAHY))](x, y, barvaDruhu(d));
}

// Body vyletí nad prvkem („+8“).
export function efektBodu(el, n, d) {
  if (!el || !n || klid()) return;
  priprav();
  const [x, y] = stred(el);
  pridej({ x, y: y - 10, vx: nahodne(-15, 15), vy: -70, odpor: 1.2, max: 0.9, tvar: 'text', text: `+${n}`, vel: 20, barva: barvaDruhu(d), mizeni: 'konec' });
}

// Chyba: malý obláček prachu.
export function efektChyby(el) {
  if (!el || klid()) return;
  priprav();
  const [x, y] = stred(el);
  for (let i = 0; i < 9; i++) { const a = nahodne(0, TAU); pridej({ x, y, vx: Math.cos(a) * nahodne(30, 80), vy: Math.sin(a) * nahodne(20, 60) - 20, odpor: 2, max: 0.5, tvar: 'kruh', vel: nahodne(3, 6), rust: 8, barva: 'rgba(140,140,140,.55)' }); }
}

// Oslava konce série: 'uspech' (jedna ze 7 variant) nebo 'svet' (velká kombinace).
export function oslava(druh) {
  if (klid()) return;
  priprav();
  if (druh === 'svet') { OSLAVY.ohnostroj(true); OSLAVY.balonky(true); setTimeout(() => OSLAVY.duha(), 1800); setTimeout(() => OSLAVY.mydliny(), 3000); return; }
  OSLAVY[zPytliku('oslava', Object.keys(OSLAVY))](false);
}

export const pocetEfektu = { zasah: Object.keys(ZASAHY).length, oslava: Object.keys(OSLAVY).length };
