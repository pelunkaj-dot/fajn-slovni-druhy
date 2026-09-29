// Zvuky hry. Všechny se skládají za běhu přes Web Audio (bez zvukových souborů).
// Každá kategorie má desítky variant: motiv × nástroj × tónina. Motivy se berou z „pytlíku“
// (neopakují se, dokud nezazní všechny), nástroj se nestřídá sám se sebou.
// Úspěch zní vysoko a durově, chyba hluboko a měkce, postup (řada zásahů bez chyby) zvedá tóninu.

let ctx = null, vystup = null, zapnuto = true, sum = null;
const HLASITOST = 0.32;

export function nastavZvuk(zap) { zapnuto = !!zap; }
export const zvukZapnut = () => zapnuto;

// Prohlížeč pustí zvuk až po kliknutí; volá se při první interakci.
export function odemkni() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  const komp = ctx.createDynamicsCompressor();
  komp.threshold.value = -18; komp.ratio.value = 4;
  vystup = ctx.createGain();
  vystup.gain.value = HLASITOST;
  vystup.connect(komp); komp.connect(ctx.destination);
}

const hz = m => 440 * 2 ** ((m - 69) / 12);
const nahodne = (a, b) => a + Math.random() * (b - a);
const vyber = pole => pole[Math.floor(Math.random() * pole.length)];

function obalka(g, t, hlas, utok, dur) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(hlas, 0.0002), t + utok);
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, utok + 0.02));
}
function kanal(pan) {
  if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; p.connect(vystup); return p; }
  return vystup;
}
function osc(typ, f, t, dur, hlas, { utok = 0.005, glide = 0, pan = 0, detune = 0, filtr = 0 } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = typ;
  o.frequency.setValueAtTime(f, t);
  if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * 2 ** (glide / 12)), t + dur);
  o.detune.value = detune;
  obalka(g, t, hlas, utok, dur);
  let posl = o;
  if (filtr) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = filtr; o.connect(fl); posl = fl; }
  posl.connect(g); g.connect(kanal(pan));
  o.start(t); o.stop(t + dur + 0.05);
  return o;
}
function sum_(t, dur, hlas, { od = 1000, do: k = 1000, typ = 'bandpass', q = 1.2, pan = 0, utok = 0.005 } = {}) {
  if (!sum) {
    sum = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = sum.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = sum; s.loop = true;
  f.type = typ; f.Q.value = q;
  f.frequency.setValueAtTime(od, t); f.frequency.exponentialRampToValueAtTime(k, t + dur);
  obalka(g, t, hlas, utok, dur);
  s.connect(f); f.connect(g); g.connect(kanal(pan));
  s.start(t); s.stop(t + dur + 0.05);
}
function fm(f, t, dur, hlas, pomer, hloubka, pan) {
  const c = ctx.createOscillator(), m = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
  c.frequency.value = f; m.frequency.value = f * pomer;
  mg.gain.setValueAtTime(f * hloubka, t); mg.gain.exponentialRampToValueAtTime(1, t + dur);
  m.connect(mg); mg.connect(c.frequency);
  obalka(g, t, hlas, 0.003, dur);
  c.connect(g); g.connect(kanal(pan));
  c.start(t); m.start(t); c.stop(t + dur + 0.05); m.stop(t + dur + 0.05);
}

// ---------- nástroje: (čas, midi, délka, hlasitost, pan) ----------
const NASTROJE = {
  sinus: (t, m, d, h, p) => osc('sine', hz(m), t, d * 1.6, h, { pan: p }),
  trojuhelnik: (t, m, d, h, p) => osc('triangle', hz(m), t, d * 1.5, h * 0.9, { pan: p }),
  zvon: (t, m, d, h, p) => fm(hz(m), t, d * 3 + 0.3, h * 0.7, 3.5, 2, p),
  zvonek: (t, m, d, h, p) => { fm(hz(m), t, d * 2.5 + 0.2, h * 0.6, 2, 1.2, p); osc('sine', hz(m + 24), t, 0.15, h * 0.12, { pan: p }); },
  marimba: (t, m, d, h, p) => { osc('sine', hz(m), t, 0.35 + d, h, { pan: p }); osc('sine', hz(m) * 4, t, 0.08, h * 0.25, { pan: p }); },
  brnk: (t, m, d, h, p) => { osc('triangle', hz(m), t, 0.5 + d, h, { filtr: 2400, pan: p }); osc('sawtooth', hz(m), t, 0.06, h * 0.15, { filtr: 3000, pan: p }); },
  fletna: (t, m, d, h, p) => { const o = osc('sine', hz(m), t, d * 1.3 + 0.1, h * 0.9, { utok: 0.04, pan: p }); const v = ctx.createOscillator(), vg = ctx.createGain(); v.frequency.value = 5.5; vg.gain.value = 6; v.connect(vg); vg.connect(o.frequency); v.start(t); v.stop(t + d * 1.3 + 0.2); },
  varhany: (t, m, d, h, p) => { osc('sine', hz(m), t, d * 1.2 + 0.1, h * 0.6, { utok: 0.02, pan: p }); osc('sine', hz(m + 12), t, d * 1.2 + 0.1, h * 0.25, { utok: 0.02, pan: p }); osc('sine', hz(m + 19), t, d + 0.1, h * 0.12, { utok: 0.02, pan: p }); },
  retro: (t, m, d, h, p) => osc('square', hz(m), t, d * 1.1 + 0.05, h * 0.35, { filtr: 2600, pan: p }),
  zeste: (t, m, d, h, p) => { osc('sawtooth', hz(m), t, d * 1.1 + 0.1, h * 0.5, { utok: 0.03, filtr: 1800, pan: p }); osc('sawtooth', hz(m), t, d * 1.1 + 0.1, h * 0.3, { utok: 0.03, filtr: 1800, detune: 8, pan: p }); },
};

// ---------- zvláštní efekty (bez melodie) ----------
const EFEKTY = {
  pop: (t, m, h) => { osc('sine', hz(m - 12), t, 0.12, h, { glide: 14 }); sum_(t, 0.03, h * 0.3, { od: 3000, do: 3000 }); },
  bublina: (t, m, h) => { osc('sine', hz(m - 10), t, 0.18, h, { glide: 19 }); osc('sine', hz(m - 3), t + 0.09, 0.14, h * 0.6, { glide: 12 }); },
  kapka: (t, m, h) => { osc('sine', hz(m + 7), t, 0.06, h, { glide: -9 }); osc('sine', hz(m), t + 0.05, 0.18, h * 0.8, { glide: 7 }); },
  mince: (t, m, h) => { NASTROJE.retro(t, m + 11, 0.07, h); NASTROJE.retro(t + 0.07, m + 16, 0.25, h); },
  trylek: (t, m, h) => { for (let i = 0; i < 6; i++) NASTROJE.sinus(t + i * 0.045, m + (i % 2 ? 4 : 0) + (i > 3 ? 3 : 0), 0.05, h * 0.8); },
  svist: (t, m, h) => { sum_(t, 0.18, h * 0.4, { od: 600, do: 6000, q: 3 }); NASTROJE.zvon(t + 0.14, m + 12, 0.15, h); },
  zvonkohra: (t, m, h) => { [12, 7, 4, 12].forEach((o, i) => NASTROJE.zvonek(t + i * 0.06, m + o, 0.08, h * 0.8, (i - 1.5) * 0.3)); },
  // chyby
  bonk: (t, m, h) => osc('sine', hz(m + 5), t, 0.28, h, { glide: -12 }),
  plop: (t, m, h) => { osc('sine', hz(m), t, 0.2, h, { glide: -7 }); osc('sine', hz(m - 5), t + 0.1, 0.25, h * 0.7, { glide: -5 }); },
  tuk: (t, m, h) => { osc('sine', hz(m - 12), t, 0.22, h * 1.2, { glide: -10 }); sum_(t, 0.08, h * 0.4, { od: 400, do: 150, typ: 'lowpass' }); },
  fouk: (t, m, h) => sum_(t, 0.35, h * 0.5, { od: 1800, do: 300, q: 2 }),
  pruzina: (t, m, h) => { const o = osc('sine', hz(m + 3), t, 0.4, h, { glide: -8 }); const v = ctx.createOscillator(), vg = ctx.createGain(); v.frequency.value = 14; vg.gain.value = 18; v.connect(vg); vg.connect(o.frequency); v.start(t); v.stop(t + 0.45); },
  klapka: (t, m, h) => { [0, 0.13].forEach((z, i) => { osc('sine', hz(m - 7 - i * 3), t + z, 0.09, h); sum_(t + z, 0.03, h * 0.3, { od: 1200, do: 1200 }); }); },
  bzuk: (t, m, h) => osc('sawtooth', hz(m - 12), t, 0.25, h * 0.45, { filtr: 700, glide: -2 }),
  // střely
  zap: (t, m, h) => osc('square', hz(m + 12), t, 0.14, h * 0.35, { glide: -24, filtr: 3500 }),
  pju: (t, m, h) => osc('sine', hz(m + 19), t, 0.16, h, { glide: -17 }),
  vzum: (t, m, h) => sum_(t, 0.2, h * 0.6, { od: 500, do: 5000, q: 4 }),
  laser: (t, m, h) => osc('sawtooth', hz(m + 7), t, 0.18, h * 0.3, { glide: -19, filtr: 2500 }),
  fuk: (t, m, h) => sum_(t, 0.1, h * 0.6, { od: 2500, do: 900, q: 1.5 }),
  tetiva: (t, m, h) => { osc('triangle', hz(m - 5), t, 0.2, h, { glide: 2 }); sum_(t, 0.05, h * 0.3, { od: 4000, do: 2000 }); },
  siu: (t, m, h) => osc('sine', hz(m), t, 0.15, h * 0.8, { glide: 12 }),
  cvak: (t, m, h) => { sum_(t, 0.02, h * 0.6, { od: 5000, do: 5000, q: 3 }); osc('triangle', hz(m + 12), t + 0.01, 0.08, h * 0.5, { glide: -5 }); },
  vrr: (t, m, h) => { for (let i = 0; i < 4; i++) sum_(t + i * 0.03, 0.03, h * 0.4, { od: 1500 + i * 400, do: 1500 + i * 400, q: 5 }); },
  sip: (t, m, h) => { sum_(t, 0.12, h * 0.4, { od: 3000, do: 8000, q: 6 }); osc('sine', hz(m + 24), t + 0.08, 0.06, h * 0.3); },
  // hrad
  dunivy: (t, m, h) => { osc('sine', 90, t, 0.5, h * 1.4, { glide: -12 }); sum_(t, 0.5, h * 0.6, { od: 300, do: 60, typ: 'lowpass' }); },
  hrom: (t, m, h) => sum_(t, 0.9, h * 0.9, { od: 250, do: 50, typ: 'lowpass', utok: 0.03 }),
  gong: (t, m, h) => fm(hz(38), t, 1.2, h, 1.4, 3, 0),
  buben: (t, m, h) => { [0, 0.16].forEach(z => { osc('sine', 110, t + z, 0.3, h * 1.3, { glide: -10 }); sum_(t + z, 0.1, h * 0.4, { od: 600, do: 100, typ: 'lowpass' }); }); },
  nararz: (t, m, h) => { sum_(t, 0.4, h * 0.7, { od: 2000, do: 200, typ: 'lowpass' }); osc('triangle', hz(40), t, 0.4, h, { glide: -7 }); },
  tuba: (t, m, h) => { NASTROJE.zeste(t, 43, 0.2, h); NASTROJE.zeste(t + 0.22, 38, 0.4, h); },
};

// ---------- kategorie ----------
// motiv: pole [půltón, začátek (s), délka (s)] nebo název efektu
const KATEGORIE = {
  zasah: {
    zaklad: [74, 76, 77, 79, 81], hlas: 0.32, nastroje: ['zvonek', 'marimba', 'sinus', 'trojuhelnik', 'zvon', 'brnk'],
    motivy: [
      [[0, 0, .12], [4, .07, .18]], [[0, 0, .1], [7, .06, .2]], [[0, 0, .08], [4, .05, .08], [7, .1, .2]],
      [[7, 0, .08], [12, .06, .22]], [[0, 0, .08], [2, .05, .08], [4, .1, .08], [7, .15, .2]],
      [[12, 0, .1], [7, .07, .1], [12, .14, .25]], [[0, 0, .06], [12, .06, .2]], [[4, 0, .1], [7, .08, .1], [11, .16, .25]],
      [[0, 0, .12], [5, .08, .12], [9, .16, .22]], [[0, 0, .35], [4, .025, .33], [7, .05, .31], [12, .075, .3]],
      [[7, 0, .07], [9, .05, .07], [12, .1, .25]], [[0, 0, .07], [0, .08, .07], [7, .16, .22]], [[2, 0, .1], [4, .06, .1], [9, .12, .24]],
      'pop', 'bublina', 'kapka', 'mince', 'trylek', 'svist', 'zvonkohra',
    ],
  },
  chyba: {
    zaklad: [50, 52, 53, 55, 57], hlas: 0.3, nastroje: ['sinus', 'trojuhelnik', 'marimba', 'varhany', 'retro'],
    motivy: [
      [[0, 0, .16], [-1, .12, .25]], [[0, 0, .12], [-3, .1, .28]], [[3, 0, .1], [0, .08, .1], [-4, .16, .3]],
      [[0, 0, .1], [-6, .1, .3]], [[0, 0, .18], [-2, .16, .18], [-5, .32, .3]], [[0, 0, .3], [1, 0, .3]],
      [[5, 0, .08], [0, .1, .25]], [[0, 0, .1], [0, .12, .1], [-5, .24, .3]],
      'bonk', 'plop', 'tuk', 'fouk', 'pruzina', 'klapka', 'bzuk',
    ],
  },
  odhaleni: {
    zaklad: [60, 62, 64, 65, 67], hlas: 0.26, nastroje: ['fletna', 'varhany', 'zvonek', 'sinus'],
    motivy: [
      [[0, 0, .2], [5, .18, .2], [7, .36, .4]], [[0, 0, .2], [2, .2, .2], [4, .4, .4]], [[7, 0, .2], [5, .2, .2], [2, .4, .45]],
      [[0, 0, .5], [5, 0, .5], [10, 0, .5]], [[0, 0, .15], [7, .15, .15], [5, .3, .4]], [[0, 0, .25], [3, .25, .25], [2, .5, .4]],
      [[12, 0, .2], [7, .2, .2], [9, .4, .45]], [[0, 0, .3], [4, .3, .2], [2, .5, .45]],
    ],
  },
  napoveda: {
    zaklad: [76, 77, 79, 81, 84], hlas: 0.22, nastroje: ['zvonek', 'zvon', 'sinus', 'trojuhelnik'],
    motivy: [
      [[0, 0, .1], [4, .05, .1], [7, .1, .1], [11, .15, .1], [14, .2, .3]], [[0, 0, .08], [2, .05, .08], [4, .1, .08], [6, .15, .08], [8, .2, .3]],
      [[12, 0, .08], [7, .05, .08], [4, .1, .08], [7, .15, .08], [12, .2, .08], [16, .25, .3]], [[0, 0, .1], [7, .07, .1], [14, .14, .1], [19, .21, .3]],
      [[0, 0, .06], [5, .05, .06], [9, .1, .06], [12, .15, .06], [17, .2, .3]], [[4, 0, .1], [11, .06, .1], [7, .12, .1], [14, .18, .35]],
      [[0, 0, .1], [4, .1, .1], [9, .2, .1], [16, .3, .35]], [[2, 0, .08], [9, .06, .08], [14, .12, .08], [21, .18, .3]],
    ],
  },
  hotovo: {
    zaklad: [67, 69, 70, 72, 74], hlas: 0.28, nastroje: ['marimba', 'zvonek', 'trojuhelnik', 'brnk', 'fletna'],
    motivy: [
      [[0, 0, .1], [4, .1, .1], [7, .2, .1], [12, .3, .35]], [[0, 0, .1], [7, .1, .1], [4, .2, .1], [12, .3, .35]],
      [[7, 0, .08], [9, .08, .08], [11, .16, .08], [12, .24, .35]], [[0, 0, .12], [2, .12, .12], [4, .24, .12], [5, .36, .12], [7, .48, .4]],
      [[12, 0, .1], [11, .1, .1], [12, .2, .1], [16, .3, .1], [19, .4, .4]], [[0, 0, .15], [4, .15, .15], [0, .3, .1], [7, .4, .4]],
      [[5, 0, .1], [4, .1, .1], [2, .2, .1], [7, .3, .1], [12, .4, .4]], [[0, 0, .1], [0, .12, .1], [7, .24, .1], [7, .36, .1], [9, .48, .1], [7, .6, .35]],
      [[4, 0, .1], [7, .1, .1], [12, .2, .1], [7, .3, .1], [16, .4, .4]],
      [[0, 0, .2], [4, 0, .2], [7, 0, .2], [5, .22, .2], [9, .22, .2], [12, .22, .2], [7, .44, .45], [11, .44, .45], [14, .44, .45]],
    ],
  },
  strela: { zaklad: [67, 69, 72, 74, 76], hlas: 0.22, nastroje: [], motivy: ['zap', 'pju', 'vzum', 'laser', 'fuk', 'tetiva', 'siu', 'cvak', 'vrr', 'sip'] },
  hrad: { zaklad: [48], hlas: 0.35, nastroje: [], motivy: ['dunivy', 'hrom', 'gong', 'buben', 'nararz', 'tuba'] },
  vlna: {
    zaklad: [60, 62, 63, 65, 67], hlas: 0.3, nastroje: ['zeste', 'retro', 'varhany', 'trojuhelnik'],
    motivy: [
      [[0, 0, .12], [0, .14, .12], [7, .28, .5]], [[0, 0, .1], [4, .12, .1], [7, .24, .1], [12, .36, .5]], [[7, 0, .15], [12, .15, .5]],
      [[0, 0, .12], [5, .14, .12], [9, .28, .12], [12, .42, .5]], [[0, 0, .3], [7, .3, .12], [12, .44, .5]], [[12, 0, .1], [7, .12, .1], [12, .24, .1], [16, .36, .5]],
    ],
  },
  uspech: {
    zaklad: [60, 62, 64, 65, 67], hlas: 0.3, nastroje: ['marimba', 'zvonek', 'zeste', 'fletna', 'brnk', 'trojuhelnik'], akord: true,
    motivy: [
      [[0, 0, .15], [4, .15, .15], [7, .3, .15], [12, .45, .3], [7, .75, .15], [12, .9, .6]],
      [[7, 0, .12], [7, .14, .12], [7, .28, .12], [4, .42, .3], [9, .72, .12], [7, .86, .12], [12, 1.0, .6]],
      [[0, 0, .1], [2, .1, .1], [4, .2, .1], [5, .3, .1], [7, .4, .3], [9, .7, .1], [11, .8, .1], [12, .9, .6]],
      [[12, 0, .2], [11, .2, .1], [9, .3, .1], [7, .4, .2], [9, .6, .1], [11, .7, .1], [12, .8, .6]],
      [[0, 0, .15], [7, .15, .15], [5, .3, .15], [4, .45, .15], [2, .6, .15], [4, .75, .15], [0, .9, .1], [12, 1.0, .6]],
      [[4, 0, .1], [7, .1, .1], [12, .2, .2], [11, .4, .1], [12, .5, .1], [16, .6, .2], [19, .8, .6]],
      [[0, 0, .3], [4, .3, .15], [7, .45, .15], [12, .6, .3], [16, .9, .6]],
      [[9, 0, .15], [7, .15, .15], [4, .3, .15], [7, .45, .15], [12, .6, .15], [14, .75, .15], [16, .9, .6]],
      [[0, 0, .1], [4, .1, .1], [7, .2, .1], [4, .3, .1], [7, .4, .1], [12, .5, .1], [7, .6, .1], [12, .7, .1], [16, .8, .6]],
      [[5, 0, .2], [9, .2, .2], [12, .4, .2], [7, .6, .2], [11, .8, .2], [14, 1.0, .2], [12, 1.2, .7]],
    ],
  },
  // mapa
  uzemi: {
    zaklad: [67, 69, 70, 72, 74], hlas: 0.3, nastroje: ['zvon', 'marimba', 'zvonek', 'brnk', 'zeste'], akord: true,
    motivy: [
      [[0, 0, .1], [7, .1, .1], [12, .2, .45]], [[0, 0, .08], [4, .08, .08], [7, .16, .08], [12, .24, .45]], [[7, 0, .12], [12, .12, .12], [16, .24, .45]],
      [[0, 0, .15], [12, .15, .5]], [[5, 0, .1], [9, .1, .1], [12, .2, .1], [17, .3, .45]], [[0, 0, .1], [2, .1, .1], [7, .2, .1], [12, .3, .45]],
      [[4, 0, .1], [7, .1, .1], [11, .2, .1], [12, .3, .45]], [[12, 0, .1], [7, .1, .1], [12, .2, .1], [19, .3, .45]],
    ],
  },
  odkryti: {
    zaklad: [72, 74, 76, 77, 79], hlas: 0.22, nastroje: ['zvonek', 'zvon', 'sinus'],
    motivy: [
      [[0, 0, .08], [7, .06, .08], [12, .12, .3]], [[12, 0, .08], [16, .06, .08], [19, .12, .3]], [[0, 0, .06], [4, .05, .06], [9, .1, .06], [14, .15, .3]],
      [[7, 0, .1], [14, .08, .3]], [[0, 0, .08], [5, .06, .08], [12, .12, .3]], [[2, 0, .08], [9, .06, .08], [16, .12, .3]], 'zvonkohra', 'trylek',
    ],
  },
  start: {
    zaklad: [60, 62, 64, 65, 67], hlas: 0.26, nastroje: ['zeste', 'marimba', 'retro', 'trojuhelnik'],
    motivy: [
      [[0, 0, .08], [4, .08, .08], [7, .16, .3]], [[0, 0, .1], [0, .12, .1], [12, .24, .3]], [[7, 0, .08], [9, .08, .08], [12, .16, .3]],
      [[0, 0, .06], [2, .06, .06], [4, .12, .06], [5, .18, .06], [7, .24, .3]], [[12, 0, .08], [7, .08, .08], [12, .16, .3]], [[0, 0, .15], [7, .15, .3]],
      'svist', 'vzum', 'siu',
    ],
  },
  vyber: {
    zaklad: [69, 71, 72, 74, 76], hlas: 0.24, nastroje: ['marimba', 'zvonek', 'fletna', 'brnk'],
    motivy: [[[0, 0, .1], [4, .1, .25]], [[7, 0, .1], [4, .1, .25]], [[0, 0, .1], [7, .1, .25]], [[4, 0, .08], [7, .08, .08], [12, .16, .25]], [[12, 0, .1], [9, .1, .25]], [[0, 0, .08], [5, .08, .25]], 'kapka', 'bublina'],
  },
  klik: {
    zaklad: [72, 76, 79, 81, 84], hlas: 0.14, nastroje: ['sinus', 'trojuhelnik', 'marimba'],
    motivy: [[[0, 0, .04]], [[7, 0, .04]], [[12, 0, .03]], [[0, 0, .03], [5, .03, .03]], [[5, 0, .03], [0, .03, .03]], 'cvak', 'pop', 'kapka'],
  },
  neuspech: {
    zaklad: [60, 62, 64, 65], hlas: 0.26, nastroje: ['fletna', 'sinus', 'marimba', 'varhany'],
    motivy: [
      [[7, 0, .2], [5, .2, .2], [4, .4, .2], [2, .6, .5]], [[0, 0, .25], [2, .25, .25], [0, .5, .5]], [[4, 0, .2], [2, .2, .2], [4, .4, .2], [7, .6, .5]],
      [[5, 0, .3], [4, .3, .3], [2, .6, .5]], [[0, 0, .2], [4, .2, .2], [2, .4, .2], [-1, .6, .2], [0, .8, .5]], [[7, 0, .25], [4, .25, .25], [5, .5, .25], [2, .75, .5]],
    ],
  },
};

const pytliky = {}, posledniNastroj = {};
function zPytliku(kat) {
  const k = KATEGORIE[kat];
  if (!pytliky[kat] || !pytliky[kat].length) {
    const n = k.motivy.map((_, i) => i);
    for (let i = n.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [n[i], n[j]] = [n[j], n[i]]; }
    pytliky[kat] = n;
  }
  return k.motivy[pytliky[kat].pop()];
}
function nastrojPro(kat) {
  const moznosti = KATEGORIE[kat].nastroje.filter(n => n !== posledniNastroj[kat]);
  const n = vyber(moznosti.length ? moznosti : KATEGORIE[kat].nastroje);
  posledniNastroj[kat] = n;
  return n;
}

function zahrajMotiv(kat, t, posun = 0) {
  const k = KATEGORIE[kat];
  const motiv = zPytliku(kat);
  const zaklad = vyber(k.zaklad) + posun;
  if (typeof motiv === 'string') { EFEKTY[motiv](t, zaklad, k.hlas); return 0.4; }
  const nastroj = NASTROJE[nastrojPro(kat)];
  const pan = nahodne(-0.25, 0.25);
  let konec = 0;
  for (const [o, z, d] of motiv) { nastroj(t + z, zaklad + o, d, k.hlas, pan); konec = Math.max(konec, z + d); }
  if (k.akord) { // podklad pod poslední tón
    const [o, z, d] = motiv[motiv.length - 1];
    for (const a of [0, 4, 7]) NASTROJE.varhany(t + z, zaklad + o - 12 + a, d + 0.3, k.hlas * 0.35, 0);
  }
  return konec;
}

// kat: zasah | chyba | odhaleni | napoveda | hotovo | strela | hrad | vlna | uspech | neuspech | svet
//      mapa: uzemi | odkryti | start | vyber | klik
// rada: kolik zásahů bez chyby za sebou – zvedá tóninu (slyšitelný postup)
export function zvuk(kat, { rada = 0 } = {}) {
  if (!zapnuto) return;
  odemkni();
  if (!ctx) return;
  const t = ctx.currentTime + 0.01;
  if (kat === 'svet') {
    const d = zahrajMotiv('uspech', t);
    const d2 = zahrajMotiv('uspech', t + d + 0.15, 5);
    zahrajMotiv('napoveda', t + d + d2 + 0.3, 12);
    return;
  }
  if (!KATEGORIE[kat]) return;
  zahrajMotiv(kat, t, kat === 'zasah' ? Math.min(rada, 8) : 0);
}

// Počet variant v kategorii (pro testy a přehled).
export const variant = kat => KATEGORIE[kat].motivy.length * Math.max(1, KATEGORIE[kat].nastroje.length) * KATEGORIE[kat].zaklad.length;
