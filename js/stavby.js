// Stavby na mapě: za každou úspěšnou sérii přibude jeden díl stavby světa.
// Prvních DOKONCENI dílů je stavba sama (nepostavené díly jsou vidět jako čárkovaný plán,
// takže dítě tuší, co přijde), zbylé díly jsou ozdoby – ukážou se jako plán až po dokončení stavby.
//
// Obrázek má souřadnice 400 × 170, zem je na y = 140. Díly se kreslí v pořadí pole `dily`
// (kvůli překrývání), stavět se ale smí v jiném pořadí – to určuje `krok` (1 … 20).
import { DOKONCENI, OBLASTI } from './engine.js';

const OBRYS = 'stroke="#4a3322" stroke-width="2" stroke-linejoin="round"';
const kvet = (x, y, barva) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${barva}" ${OBRYS} stroke-width="1"/><circle cx="${x}" cy="${y}" r="1.1" fill="#ffd84d"/>`;
const tramy = (y, v) => `<rect x="134" y="${y}" width="132" height="${v}" fill="#c98a4b" ${OBRYS}/>
  <line x1="136" y1="${y + v / 2}" x2="264" y2="${y + v / 2}" stroke="#9a6231" stroke-width="1.5"/>
  <circle cx="134" cy="${y + v / 2}" r="4.5" fill="#e0b27a" ${OBRYS} stroke-width="1.5"/><circle cx="266" cy="${y + v / 2}" r="4.5" fill="#e0b27a" ${OBRYS} stroke-width="1.5"/>`;
const okno = x => `<rect x="${x}" y="88" width="26" height="22" rx="2" fill="#cfe9f7" stroke="#fff" stroke-width="3"/>
  <rect x="${x}" y="88" width="26" height="22" rx="2" fill="none" ${OBRYS}/>
  <line x1="${x + 13}" y1="89" x2="${x + 13}" y2="109" stroke="#fff" stroke-width="2.5"/><line x1="${x + 1}" y1="99" x2="${x + 25}" y2="99" stroke="#fff" stroke-width="2.5"/>
  <path d="M${x + 4} 96l6 -7" stroke="#fff" stroke-width="1.5" opacity=".8"/>`;
// smrk: tři patra trojúhelníků, v = výška, y = spodek
const smrk = (x, y, v, barva, obrys) => [0, 1, 2].map(i => {
  const s = v * (0.5 - i * 0.1), top = y - v + i * v * 0.22, dole = y - i * v * 0.24;
  return `<path d="M${x} ${top.toFixed(1)} L${(x - s * 0.7).toFixed(1)} ${dole.toFixed(1)} L${(x + s * 0.7).toFixed(1)} ${dole.toFixed(1)}Z" fill="${barva}" ${obrys}/>`;
}).reverse().join('');
const truhlik = x => `<rect x="${x - 2}" y="110" width="30" height="6" rx="1.5" fill="#8a5a33" ${OBRYS} stroke-width="1.5"/>
  ${[4, 11, 18, 25].map((d, i) => kvet(x + d, 107, ['#e2475a', '#f7a531', '#b35fd0', '#e2475a'][i])).join('')}`;

export const STAVBY = {
  1: {
    nazev: 'Chaloupka',
    hotova: 'hotová', // shoda s názvem stavby
    pozadi: `<defs><linearGradient id="st1-nebe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9eefa"/><stop offset="1" stop-color="#fbf5e2"/></linearGradient></defs>
      <rect width="400" height="170" fill="url(#st1-nebe)"/>
      <circle cx="362" cy="28" r="15" fill="#ffd66b"/>
      <path d="M0 120 Q60 88 130 108 T260 100 T400 112 V170 H0Z" fill="#b9d99a"/>
      <path d="M0 138 Q100 132 200 138 T400 136 V170 H0Z" fill="#8cc267"/>
      <path d="M0 150 Q100 146 200 151 T400 149 V170 H0Z" fill="#79b456"/>`,
    dily: [
      // --- ozdoby za domem ---
      { krok: 17, nazev: 'studna', svg: `<rect x="22" y="114" width="34" height="26" rx="3" fill="#b3ada4" ${OBRYS}/>
        <path d="M24 122h30M24 131h30M33 114v8M45 122v9M33 131v9" stroke="#8d877e" stroke-width="1.5"/>
        <path d="M26 114V90M52 114V90" stroke="#7a5230" stroke-width="4"/><path d="M18 92 L39 76 L60 92Z" fill="#c4473a" ${OBRYS}/>
        <line x1="39" y1="92" x2="39" y2="106" stroke="#4a3322" stroke-width="1.5"/><rect x="34" y="104" width="10" height="8" fill="#7a5230" ${OBRYS} stroke-width="1.5"/>` },
      { krok: 15, nazev: 'jabloň', svg: `<path d="M328 140 V104 M328 118 l-9 -8 M328 112 l8 -7" stroke="#7a5230" stroke-width="7" stroke-linecap="round"/>
        <circle cx="328" cy="86" r="26" fill="#5fa04e" ${OBRYS}/><circle cx="310" cy="96" r="14" fill="#6cb15a" ${OBRYS}/><circle cx="347" cy="95" r="15" fill="#6cb15a" ${OBRYS}/>
        ${[[318, 80], [336, 74], [340, 96], [312, 98], [328, 92]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#e0443a" stroke="#4a3322" stroke-width="1"/>`).join('')}` },
      { krok: 14, nazev: 'plot', svg: `<path d="M70 124 H124 M70 133 H124" stroke="#8a5a33" stroke-width="3"/>
        ${[72, 83, 94, 105, 116].map(x => `<path d="M${x} 141 V119 l4 -5 l4 5 V141Z" fill="#e9d2a8" ${OBRYS} stroke-width="1.5"/>`).join('')}` },
      // --- chaloupka ---
      { krok: 1, nazev: 'základy', svg: `<rect x="126" y="127" width="148" height="13" rx="2" fill="#a9a39a" ${OBRYS}/>
        <path d="M150 127v13M178 127v13M206 127v13M234 127v13M262 127v13" stroke="#8d877e" stroke-width="1.5"/>` },
      { krok: 2, nazev: 'spodní trámy', svg: tramy(110, 17) },
      { krok: 3, nazev: 'prostřední trámy', svg: tramy(93, 17) },
      { krok: 4, nazev: 'horní trámy', svg: tramy(77, 16) },
      { krok: 5, nazev: 'dveře', svg: `<rect x="188" y="99" width="24" height="28" rx="3" fill="#7a4a26" ${OBRYS}/>
        <path d="M194 104v19M200 104v19M206 104v19" stroke="#5e381c" stroke-width="1.5"/><circle cx="207" cy="114" r="1.8" fill="#ffd84d"/>` },
      { krok: 6, nazev: 'levé okno', svg: okno(148) },
      { krok: 7, nazev: 'pravé okno', svg: okno(226) },
      { krok: 8, nazev: 'krov', svg: `<path d="M124 80 L200 33 L276 80" fill="none" stroke="#6b4526" stroke-width="5" stroke-linejoin="round"/>
        <path d="M150 64 V80 M175 49 V80 M200 33 V80 M225 49 V80 M250 64 V80" stroke="#8a5a33" stroke-width="3"/>` },
      { krok: 9, nazev: 'levá půlka střechy', svg: `<path d="M118 82 L200 30 L200 82Z" fill="#c4473a" ${OBRYS}/>
        <path d="M146 64 H200 M168 50 H200 M132 74 H200" stroke="#9e3329" stroke-width="1.5"/>` },
      { krok: 10, nazev: 'pravá půlka střechy', svg: `<path d="M200 30 L282 82 L200 82Z" fill="#cf5243" ${OBRYS}/>
        <path d="M200 64 H254 M200 50 H232 M200 74 H268" stroke="#9e3329" stroke-width="1.5"/>` },
      { krok: 11, nazev: 'komín', svg: `<rect x="234" y="36" width="15" height="26" fill="#9c5a44" ${OBRYS}/><rect x="231" y="32" width="21" height="6" fill="#86493a" ${OBRYS} stroke-width="1.5"/>` },
      { krok: 12, nazev: 'truhlíky s kytkami', svg: truhlik(146) + truhlik(224) },
      { krok: 13, nazev: 'kouř z komína a praporek', svg: `<g class="kour"><circle cx="242" cy="24" r="5" fill="#e8e8e8"/><circle cx="248" cy="14" r="7" fill="#efefef"/><circle cx="256" cy="3" r="8" fill="#f5f5f5"/></g>
        <path d="M200 30 V12" stroke="#4a3322" stroke-width="2"/><path d="M200 12 L214 16 L200 21Z" fill="#2f7fd0" ${OBRYS} stroke-width="1.5"/>` },
      // --- ozdoby před domem ---
      { krok: 16, nazev: 'záhonek', svg: `<path d="M284 142 Q302 132 322 142Z" fill="#7a5230" ${OBRYS} stroke-width="1.5"/>
        ${[[289, 133, '#e2475a'], [297, 129, '#f7a531'], [305, 131, '#b35fd0'], [313, 128, '#e2475a'], [318, 134, '#f7a531']].map(([x, y, b]) => `<path d="M${x} ${y + 2} V${y + 9}" stroke="#3f8a3a" stroke-width="1.5"/>${kvet(x, y, b)}`).join('')}` },
      { krok: 18, nazev: 'lavička', svg: `<rect x="346" y="124" width="42" height="5" rx="2" fill="#a86b3c" ${OBRYS} stroke-width="1.5"/><rect x="346" y="114" width="42" height="5" rx="2" fill="#a86b3c" ${OBRYS} stroke-width="1.5"/>
        <path d="M351 129 V141 M383 129 V141 M351 119 V124 M383 119 V124" stroke="#4a3322" stroke-width="2.5"/>` },
      { krok: 19, nazev: 'kočka na střeše', svg: `<g transform="translate(152 52) rotate(-32)"><ellipse cx="0" cy="0" rx="9" ry="6" fill="#f0a24a" ${OBRYS} stroke-width="1.5"/>
        <circle cx="8" cy="-6" r="5" fill="#f0a24a" ${OBRYS} stroke-width="1.5"/><path d="M5 -10 l1 -5 l3 4 M9 -10 l3 -4 l1 5" fill="#f0a24a" ${OBRYS} stroke-width="1.2"/>
        <path d="M-9 1 q-8 -2 -6 -10" fill="none" stroke="#4a3322" stroke-width="2"/></g>` },
      { krok: 20, nazev: 'motýli', svg: `<g class="motyl"><path d="M300 60 q-8 -8 -4 2 q4 6 4 -2 q8 -8 4 2 q-4 6 -4 -2" fill="#f7a531" ${OBRYS} stroke-width="1"/></g>
        <g class="motyl motyl2"><path d="M100 70 q-8 -8 -4 2 q4 6 4 -2 q8 -8 4 2 q-4 6 -4 -2" fill="#8fc8ef" ${OBRYS} stroke-width="1"/></g>` },
    ],
  },
  2: {
    nazev: 'Hájovna',
    hotova: 'hotová',
    pozadi: `<defs><linearGradient id="st2-nebe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6ecdc"/><stop offset="1" stop-color="#f3f0d8"/></linearGradient></defs>
      <rect width="400" height="170" fill="url(#st2-nebe)"/>
      ${[[20, 118, 70], [58, 124, 58], [96, 116, 74], [300, 120, 66], [262, 126, 52], [372, 116, 76], [150, 128, 44], [236, 130, 40]].map(([x, y, v]) => smrk(x, y + 12, v, '#5e8f5f', '')).join('')}
      <path d="M0 136 Q100 130 200 136 T400 134 V170 H0Z" fill="#6fa84f"/>
      <path d="M0 150 Q100 146 200 151 T400 149 V170 H0Z" fill="#5f9744"/>`,
    dily: [
      { krok: 15, nazev: 'krmelec', svg: `<path d="M14 140 V108 M54 140 V108" stroke="#7a5230" stroke-width="4"/>
        <rect x="16" y="118" width="36" height="16" fill="#d9b25f" ${OBRYS} stroke-width="1.5"/><path d="M18 122 H50 M18 127 H50" stroke="#b58f3f" stroke-width="1.2"/>
        <path d="M8 110 L34 94 L60 110Z" fill="#7a5230" ${OBRYS}/>` },
      { krok: 18, nazev: 'smrk', svg: `<rect x="336" y="116" width="8" height="26" fill="#7a5230" ${OBRYS} stroke-width="1.5"/>${smrk(340, 124, 92, '#3f7a4a', OBRYS)}` },
      { krok: 19, nazev: 'budka a veverka', svg: `<rect x="331" y="66" width="18" height="16" fill="#c08a50" ${OBRYS} stroke-width="1.5"/><path d="M328 67 L340 57 L352 67Z" fill="#8a5a33" ${OBRYS} stroke-width="1.5"/><circle cx="340" cy="74" r="3" fill="#4a3322"/>
        <g transform="translate(356 92)"><path d="M0 10 q12 -2 10 -16 q-2 -8 -8 -4 q4 6 -2 12Z" fill="#c8662d" ${OBRYS} stroke-width="1.2"/><ellipse cx="-4" cy="10" rx="6" ry="5" fill="#d9773a" ${OBRYS} stroke-width="1.2"/><circle cx="-9" cy="4" r="3.5" fill="#d9773a" ${OBRYS} stroke-width="1.2"/></g>` },
      { krok: 1, nazev: 'podezdívka', svg: `<rect x="128" y="127" width="144" height="13" rx="2" fill="#a9a39a" ${OBRYS}/><path d="M152 127v13M180 127v13M208 127v13M236 127v13M262 127v13" stroke="#8d877e" stroke-width="1.5"/>` },
      { krok: 2, nazev: 'kamenné přízemí', svg: `<rect x="136" y="100" width="128" height="27" fill="#c2bcb1" ${OBRYS}/>
        ${[[146, 106, 7], [164, 112, 6], [182, 104, 5], [150, 120, 6], [226, 106, 6], [244, 116, 7], [256, 104, 5], [218, 121, 5], [174, 121, 5]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.7}" fill="#aaa397" stroke="#8d877e" stroke-width="1"/>`).join('')}` },
      { krok: 3, nazev: 'dřevěné patro', svg: `<rect x="136" y="74" width="128" height="26" fill="#b07a44" ${OBRYS}/>${Array.from({ length: 15 }, (_, i) => `<path d="M${144 + i * 8} 75 V99" stroke="#8a5a33" stroke-width="1.2"/>`).join('')}` },
      { krok: 4, nazev: 'štít', svg: `<path d="M136 74 L200 42 L264 74Z" fill="#c08a50" ${OBRYS}/>${Array.from({ length: 15 }, (_, i) => { const x = 144 + i * 8; return `<path d="M${x} 73 V${Math.round(74 - 32 * (1 - Math.abs(x - 200) / 64)) + 2}" stroke="#9a6a38" stroke-width="1.2"/>`; }).join('')}` },
      { krok: 5, nazev: 'dveře', svg: `<path d="M189 127 V111 A11 11 0 0 1 211 111 V127Z" fill="#6b3f22" ${OBRYS}/><path d="M196 104 V126 M204 104 V126" stroke="#54301a" stroke-width="1.5"/><circle cx="207" cy="117" r="1.8" fill="#ffd84d"/>` },
      { krok: 6, nazev: 'okna v přízemí', svg: [148, 228].map(x => `<rect x="${x - 6}" y="104" width="6" height="15" fill="#3f7a4a" ${OBRYS} stroke-width="1.2"/><rect x="${x + 24}" y="104" width="6" height="15" fill="#3f7a4a" ${OBRYS} stroke-width="1.2"/>
        <rect x="${x}" y="104" width="24" height="15" fill="#cfe9f7" ${OBRYS} stroke-width="1.5"/><path d="M${x + 12} 104v15M${x} 111.5h24" stroke="#fff" stroke-width="2"/>`).join('') },
      { krok: 7, nazev: 'okna v patře', svg: [158, 226].map(x => `<rect x="${x}" y="79" width="16" height="15" fill="#cfe9f7" ${OBRYS} stroke-width="1.5"/><path d="M${x + 8} 79v15M${x} 86.5h16" stroke="#fff" stroke-width="2"/>`).join('') },
      { krok: 8, nazev: 'levá půlka střechy', svg: `<path d="M116 80 L200 26 L200 38 L128 84Z" fill="#4f6b52" ${OBRYS}/><path d="M140 70 l6 5 M160 57 l6 5 M180 44 l6 5" stroke="#3b523e" stroke-width="1.5"/>` },
      { krok: 9, nazev: 'pravá půlka střechy', svg: `<path d="M284 80 L200 26 L200 38 L272 84Z" fill="#587a5b" ${OBRYS}/><path d="M260 70 l-6 5 M240 57 l-6 5 M220 44 l-6 5" stroke="#3b523e" stroke-width="1.5"/>` },
      { krok: 10, nazev: 'komín', svg: `<rect x="236" y="30" width="15" height="24" fill="#a9a39a" ${OBRYS}/><path d="M236 38h15M236 46h15" stroke="#8d877e" stroke-width="1.2"/><rect x="233" y="27" width="21" height="5" fill="#8d877e" ${OBRYS} stroke-width="1.5"/>` },
      { krok: 11, nazev: 'parohy', svg: `<g fill="none" stroke="#e9dcc0" stroke-width="3.5" stroke-linecap="round"><path d="M196 64 q-10 -4 -12 -16 M190 58 l-8 2 M186 52 l-6 -4"/><path d="M204 64 q10 -4 12 -16 M210 58 l8 2 M214 52 l6 -4"/></g>
        <g fill="none" stroke="#4a3322" stroke-width="1" opacity=".5"><path d="M196 64 q-10 -4 -12 -16"/><path d="M204 64 q10 -4 12 -16"/></g><circle cx="200" cy="65" r="4" fill="#8a5a33" ${OBRYS} stroke-width="1.2"/>` },
      { krok: 12, nazev: 'cedule', svg: `<rect x="178" y="89" width="44" height="10" rx="2" fill="#e9d2a8" ${OBRYS} stroke-width="1.5"/><text x="200" y="97" text-anchor="middle" font-size="7" font-weight="700" font-family="sans-serif" fill="#4a3322">HÁJOVNA</text>` },
      { krok: 13, nazev: 'kouř a lucerna', svg: `<g class="kour"><circle cx="244" cy="20" r="5" fill="#e8e8e8"/><circle cx="250" cy="10" r="7" fill="#efefef"/><circle cx="258" cy="0" r="8" fill="#f5f5f5"/></g>
        <path d="M218 104 h4" stroke="#4a3322" stroke-width="1.5"/><rect x="219" y="104" width="7" height="10" rx="1.5" fill="#ffd66b" ${OBRYS} stroke-width="1.2"/>` },
      { krok: 14, nazev: 'hromada dřeva', svg: [[92, 134], [104, 134], [116, 134], [98, 124], [110, 124], [104, 114]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#c98a4b" ${OBRYS} stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="2.5" fill="none" stroke="#9a6231" stroke-width="1"/>`).join('') },
      { krok: 16, nazev: 'srnka', svg: `<g transform="translate(70 118)"><path d="M-10 22 V8 M-4 22 V9 M8 22 V8 M13 22 V9" stroke="#7a4a26" stroke-width="2.5"/>
        <ellipse cx="2" cy="6" rx="15" ry="7" fill="#c48245" ${OBRYS} stroke-width="1.5"/><path d="M13 3 L18 -10 L24 -9 L20 4Z" fill="#c48245" ${OBRYS} stroke-width="1.5"/>
        <ellipse cx="23" cy="-11" rx="6" ry="4" fill="#c48245" ${OBRYS} stroke-width="1.5"/><path d="M19 -14 l-2 -5 M22 -14 l1 -5" stroke="#4a3322" stroke-width="1.5"/><circle cx="-12" cy="3" r="2.5" fill="#fff"/></g>` },
      { krok: 17, nazev: 'houby', svg: [[284, 136, 7, '#b5402f'], [298, 134, 9, '#8a5a33'], [312, 137, 6, '#b5402f']].map(([x, y, r, b]) => `<rect x="${x - 2}" y="${y}" width="4" height="6" fill="#f3ead6" ${OBRYS} stroke-width="1"/><path d="M${x - r} ${y + 1} A${r} ${r * 0.8} 0 0 1 ${x + r} ${y + 1}Z" fill="${b}" ${OBRYS} stroke-width="1.2"/>
        ${b === '#b5402f' ? `<circle cx="${x - 2}" cy="${y - 2}" r="1.2" fill="#fff"/><circle cx="${x + 2}" cy="${y - 3}" r="1" fill="#fff"/>` : ''}`).join('') },
      { krok: 20, nazev: 'zajíc', svg: `<g transform="translate(372 130)"><ellipse cx="0" cy="4" rx="10" ry="7" fill="#b89a7a" ${OBRYS} stroke-width="1.5"/><circle cx="-9" cy="-3" r="5" fill="#b89a7a" ${OBRYS} stroke-width="1.5"/>
        <path d="M-10 -7 q-2 -12 1 -13 q3 1 1 13 M-7 -7 q1 -12 4 -12 q2 2 -2 12" fill="#b89a7a" ${OBRYS} stroke-width="1.2"/><circle cx="10" cy="2" r="3" fill="#fff" ${OBRYS} stroke-width="1"/></g>` },
    ],
  },
  3: {
    nazev: 'Rozhledna',
    hotova: 'hotová',
    pozadi: `<defs><linearGradient id="st3-nebe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2e8e6"/><stop offset="1" stop-color="#eef0e4"/></linearGradient></defs>
      <rect width="400" height="170" fill="url(#st3-nebe)"/>
      ${[[40, 112, 30], [90, 116, 24], [360, 110, 34], [210, 118, 20]].map(([x, y, v]) => smrk(x, y + 10, v, '#9fb3a8', '')).join('')}
      <path d="M0 132 Q100 126 200 132 T400 130 V170 H0Z" fill="#8fa874"/>
      <ellipse cx="120" cy="150" rx="110" ry="12" fill="#8fb3bf"/><ellipse cx="330" cy="156" rx="70" ry="8" fill="#8fb3bf"/>
      <path d="M0 162 Q100 158 200 163 T400 161 V170 H0Z" fill="#7d9664"/>
      <ellipse class="mlha-pas" cx="200" cy="120" rx="240" ry="10" fill="#fff" opacity=".45"/>`,
    dily: [
      { krok: 17, nazev: 'volavka', svg: `<g transform="translate(40 128)"><path d="M0 22 V6 M4 22 V6" stroke="#6b6b6b" stroke-width="1.8"/><ellipse cx="2" cy="2" rx="9" ry="6" fill="#c9d2d6" ${OBRYS} stroke-width="1.5"/>
        <path d="M8 -1 q6 -8 2 -18 q-2 -3 2 -5" fill="none" stroke="#4a3322" stroke-width="5" stroke-linecap="round"/><path d="M8 -1 q6 -8 2 -18 q-2 -3 2 -5" fill="none" stroke="#c9d2d6" stroke-width="3" stroke-linecap="round"/><path d="M12 -24 l9 1 l-9 2Z" fill="#e0a13a" stroke="#4a3322" stroke-width="1"/></g>` },
      { krok: 15, nazev: 'rákosí', svg: [[70, 0], [76, 4], [82, -2], [300, 2], [306, -3], [312, 1], [370, 0], [376, 3]].map(([x, d]) => `<path d="M${x} 150 q${d} -18 ${d * 0.5} -30" fill="none" stroke="#5f7a3a" stroke-width="2"/><rect x="${x + d * 0.5 - 2}" y="116" width="4" height="10" rx="2" fill="#7a5230"/>`).join('') },
      { krok: 1, nazev: 'kůly chodníku', svg: [40, 76, 112, 148, 184, 220].map(x => `<rect x="${x - 3}" y="136" width="6" height="18" fill="#7a5230" ${OBRYS} stroke-width="1.5"/>`).join('') },
      { krok: 2, nazev: 'prkna chodníku', svg: `<rect x="28" y="132" width="214" height="6" fill="#c98a4b" ${OBRYS} stroke-width="1.5"/>${Array.from({ length: 17 }, (_, i) => `<path d="M${40 + i * 12} 132 v6" stroke="#9a6231" stroke-width="1"/>`).join('')}` },
      { krok: 3, nazev: 'zábradlí chodníku', svg: `<path d="M30 132 V118 M78 132 V118 M126 132 V118 M174 132 V118 M222 132 V118 M30 119 H242" stroke="#8a5a33" stroke-width="2.5"/>` },
      { krok: 4, nazev: 'nohy rozhledny', svg: `<path d="M258 150 L274 58 M338 150 L322 58" stroke="#8a5a33" stroke-width="6" stroke-linecap="round"/><path d="M258 150 L274 58 M338 150 L322 58" stroke="#4a3322" stroke-width="1" opacity=".4"/>` },
      { krok: 5, nazev: 'vzpěry', svg: `<path d="M262 128 L334 104 M334 128 L262 104 M267 100 L329 78 M329 100 L267 78 M262 128 H334 M266 102 H330 M270 78 H326" stroke="#a8743f" stroke-width="3"/>` },
      { krok: 6, nazev: 'schody', svg: `<path d="M242 138 L262 126 L290 118 L266 108 L292 98 L270 88 L296 78 L276 66" fill="none" stroke="#e0a86a" stroke-width="5" stroke-linejoin="round"/><path d="M242 138 L262 126 L290 118 L266 108 L292 98 L270 88 L296 78 L276 66" fill="none" stroke="#4a3322" stroke-width="1" opacity=".5"/>` },
      { krok: 7, nazev: 'plošina', svg: `<rect x="262" y="54" width="72" height="7" fill="#c98a4b" ${OBRYS} stroke-width="1.5"/><path d="M274 54v7M286 54v7M298 54v7M310 54v7M322 54v7" stroke="#9a6231" stroke-width="1"/>` },
      { krok: 8, nazev: 'zábradlí plošiny', svg: `<path d="M264 54 V42 M280 54 V42 M296 54 V42 M312 54 V42 M332 54 V42 M262 43 H334" stroke="#8a5a33" stroke-width="2.5"/>` },
      { krok: 9, nazev: 'sloupky stříšky', svg: `<path d="M268 42 V26 M328 42 V26" stroke="#7a5230" stroke-width="4"/>` },
      { krok: 10, nazev: 'stříška', svg: `<path d="M256 28 L298 8 L340 28Z" fill="#6b4a36" ${OBRYS}/><path d="M270 22 L298 8 L326 22" stroke="#553a2a" stroke-width="1.5" fill="none"/>` },
      { krok: 11, nazev: 'cedule', svg: `<rect x="190" y="104" width="46" height="11" rx="2" fill="#e9d2a8" ${OBRYS} stroke-width="1.5"/><path d="M213 115 V132" stroke="#7a5230" stroke-width="3"/><text x="213" y="112.5" text-anchor="middle" font-size="7" font-weight="700" font-family="sans-serif" fill="#4a3322">ROZHLEDNA</text>` },
      { krok: 12, nazev: 'dalekohled', svg: `<g transform="translate(314 42) rotate(-20)"><rect x="-4" y="-4" width="18" height="7" rx="2" fill="#4c5a66" ${OBRYS} stroke-width="1.2"/></g><path d="M314 44 V53" stroke="#4a3322" stroke-width="2"/>` },
      { krok: 13, nazev: 'praporek', svg: `<path d="M337 27 V10" stroke="#4a3322" stroke-width="2"/><path d="M337 10 L351 14 L337 19Z" fill="#2f7fd0" ${OBRYS} stroke-width="1.5"/>` },
      { krok: 14, nazev: 'lekníny', svg: [[70, 152], [104, 148], [150, 153], [180, 149], [320, 158]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="3.5" fill="#5f9744" stroke="#3f6b2e" stroke-width="1"/>`).join('') + `<circle cx="104" cy="146" r="3" fill="#f7c2d6" stroke="#b35f86" stroke-width="1"/>` },
      { krok: 16, nazev: 'žába', svg: `<g transform="translate(150 149)"><ellipse cx="0" cy="0" rx="6" ry="4" fill="#7cc04e" ${OBRYS} stroke-width="1.2"/><circle cx="-3" cy="-4" r="2.2" fill="#7cc04e" ${OBRYS} stroke-width="1"/><circle cx="3" cy="-4" r="2.2" fill="#7cc04e" ${OBRYS} stroke-width="1"/><circle cx="-3" cy="-4.3" r=".8" fill="#222"/><circle cx="3" cy="-4.3" r=".8" fill="#222"/></g>` },
      { krok: 18, nazev: 'loďka', svg: `<path d="M318 152 H356 L350 160 H324Z" fill="#b5673a" ${OBRYS} stroke-width="1.5"/><path d="M340 152 l14 -10" stroke="#7a5230" stroke-width="2"/>` },
      { krok: 19, nazev: 'vážky', svg: `<g class="motyl"><path d="M130 100 h14 M134 97 l3 3 l3 -3 M134 103 l3 -3 l3 3" stroke="#2f7fd0" stroke-width="1.5" fill="none"/></g><g class="motyl motyl2"><path d="M200 90 h14 M204 87 l3 3 l3 -3 M204 93 l3 -3 l3 3" stroke="#3aa37a" stroke-width="1.5" fill="none"/></g>` },
      { krok: 20, nazev: 'kachny', svg: [[210, 154], [230, 156]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><path d="M-8 0 q0 -6 8 -6 q6 0 8 -2 q2 4 -2 8Z" fill="${i ? '#c9a57a' : '#e8e2d2'}" ${OBRYS} stroke-width="1.2"/><circle cx="-6" cy="-7" r="3.5" fill="${i ? '#c9a57a' : '#3f8a5a'}" ${OBRYS} stroke-width="1.2"/><path d="M-9.5 -7 h-4 l4 2Z" fill="#e0a13a"/></g>`).join('') },
    ],
  },
  4: {
    nazev: 'Horská chata',
    hotova: 'hotová',
    pozadi: `<defs><linearGradient id="st4-nebe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe3f4"/><stop offset="1" stop-color="#eef3f6"/></linearGradient></defs>
      <rect width="400" height="170" fill="url(#st4-nebe)"/>
      <path d="M-10 124 L60 40 L110 92 L170 30 L240 100 L300 44 L410 124Z" fill="#9aa9b8"/>
      <path d="M60 40 L78 62 L66 58 L56 66 L46 57Z M170 30 L190 54 L176 50 L166 58 L154 50Z M300 44 L320 66 L306 62 L296 70 L286 62Z" fill="#fff"/>
      <path d="M0 132 Q120 116 220 128 T400 124 V170 H0Z" fill="#a9c47f"/>
      <path d="M0 152 Q100 146 200 152 T400 150 V170 H0Z" fill="#94b36a"/>`,
    dily: [
      { krok: 18, nazev: 'smrčky', svg: smrk(40, 142, 58, '#3f7a4a', OBRYS) + smrk(66, 144, 42, '#4a8a55', OBRYS) },
      { krok: 17, nazev: 'kozorožec', svg: `<path d="M330 142 l10 -24 h22 l10 24Z" fill="#9aa4ab" ${OBRYS} stroke-width="1.5"/>
        <g transform="translate(350 104)"><path d="M-8 14 V6 M-3 14 V7 M6 14 V6 M10 14 V7" stroke="#6b5a48" stroke-width="2.2"/><ellipse cx="1" cy="4" rx="12" ry="6" fill="#a08870" ${OBRYS} stroke-width="1.5"/>
        <path d="M10 2 l4 -8 l5 1 l-3 8Z" fill="#a08870" ${OBRYS} stroke-width="1.2"/><path d="M15 -6 q-4 -12 -12 -12" fill="none" stroke="#6b5a48" stroke-width="3" stroke-linecap="round"/></g>` },
      { krok: 1, nazev: 'kamenné základy', svg: `<rect x="128" y="127" width="144" height="13" rx="2" fill="#9ca0a4" ${OBRYS}/><path d="M152 127v13M180 127v13M208 127v13M236 127v13M262 127v13" stroke="#7e8286" stroke-width="1.5"/>` },
      { krok: 2, nazev: 'kamenné přízemí', svg: `<rect x="136" y="100" width="128" height="27" fill="#b8b4ac" ${OBRYS}/>
        ${[[146, 108, 8], [168, 116, 7], [186, 106, 6], [232, 108, 7], [252, 118, 7], [216, 120, 6], [154, 122, 5]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.65}" fill="#a29d93" stroke="#85807a" stroke-width="1"/>`).join('')}` },
      { krok: 3, nazev: 'dřevěné patro', svg: `<rect x="136" y="72" width="128" height="28" fill="#9c6536" ${OBRYS}/><path d="M138 79 H262 M138 86 H262 M138 93 H262" stroke="#7a4c26" stroke-width="1.2"/>` },
      { krok: 4, nazev: 'balkon', svg: `<rect x="130" y="96" width="140" height="4" fill="#7a4c26" ${OBRYS} stroke-width="1.2"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${134 + i * 12} 96 V86" stroke="#7a4c26" stroke-width="2"/>`).join('')}<path d="M130 86 H270" stroke="#7a4c26" stroke-width="2.5"/>` },
      { krok: 5, nazev: 'dveře', svg: `<rect x="189" y="104" width="22" height="23" rx="2" fill="#6b3f22" ${OBRYS}/><path d="M189 115 H211" stroke="#54301a" stroke-width="1.5"/><circle cx="207" cy="116" r="1.8" fill="#ffd84d"/>` },
      { krok: 6, nazev: 'okna v přízemí', svg: [150, 228].map(x => `<rect x="${x}" y="105" width="22" height="15" fill="#cfe9f7" ${OBRYS} stroke-width="1.5"/><path d="M${x + 11} 105v15M${x} 112.5h22" stroke="#fff" stroke-width="2"/>`).join('') },
      { krok: 7, nazev: 'okna s okenicemi', svg: [156, 226].map(x => `<rect x="${x - 7}" y="74" width="7" height="12" fill="#d24b3a" ${OBRYS} stroke-width="1.2"/><rect x="${x + 18}" y="74" width="7" height="12" fill="#d24b3a" ${OBRYS} stroke-width="1.2"/>
        <path d="M${x - 6} 77 l5 6 M${x + 19} 77 l5 6" stroke="#fff" stroke-width="1.5"/><rect x="${x}" y="74" width="18" height="12" fill="#cfe9f7" ${OBRYS} stroke-width="1.5"/>`).join('') },
      { krok: 8, nazev: 'krov', svg: `<path d="M126 74 L200 22 L274 74" fill="none" stroke="#6b4526" stroke-width="5" stroke-linejoin="round"/><path d="M200 22 V72 M163 48 V72 M237 48 V72" stroke="#8a5a33" stroke-width="3"/>` },
      { krok: 9, nazev: 'levá půlka střechy', svg: `<path d="M118 76 L200 18 L200 74Z" fill="#6f7780" ${OBRYS}/><path d="M146 58 H200 M170 41 H200 M132 68 H200" stroke="#59606a" stroke-width="1.5"/>` },
      { krok: 10, nazev: 'pravá půlka střechy', svg: `<path d="M200 18 L282 76 L200 74Z" fill="#7b848e" ${OBRYS}/><path d="M200 58 H254 M200 41 H230 M200 68 H268" stroke="#59606a" stroke-width="1.5"/>` },
      { krok: 11, nazev: 'komín', svg: `<rect x="232" y="26" width="15" height="28" fill="#9ca0a4" ${OBRYS}/><path d="M232 34h15M232 43h15" stroke="#7e8286" stroke-width="1.2"/><rect x="229" y="23" width="21" height="5" fill="#7e8286" ${OBRYS} stroke-width="1.5"/>` },
      { krok: 12, nazev: 'sníh na střeše', svg: `<path d="M121 74 L200 18 L279 74 L266 73 Q258 64 252 66 Q244 56 240 56 Q232 48 226 48 Q218 38 212 38 Q206 42 200 40 Q194 42 188 38 Q182 38 174 48 Q168 48 160 56 Q156 56 148 66 Q142 64 134 73Z" fill="#fff" ${OBRYS} stroke-width="1.2" opacity=".95"/>` },
      { krok: 13, nazev: 'kouř a vlajka', svg: `<g class="kour"><circle cx="240" cy="16" r="5" fill="#e8e8e8"/><circle cx="246" cy="6" r="7" fill="#efefef"/><circle cx="254" cy="-4" r="8" fill="#f5f5f5"/></g>
        <path d="M200 18 V0" stroke="#4a3322" stroke-width="2"/><path d="M200 0 h16 v4 h-16Z" fill="#fff" ${OBRYS} stroke-width="1"/><path d="M200 4 h16 v4 h-16Z" fill="#d24b3a" ${OBRYS} stroke-width="1"/><path d="M200 0 L207 4 L200 8Z" fill="#2f5fb0" ${OBRYS} stroke-width="1"/>` },
      { krok: 14, nazev: 'rozcestník', svg: `<path d="M100 142 V100" stroke="#7a5230" stroke-width="4"/>
        <path d="M84 102 h32 l6 5 l-6 5 h-32Z" fill="#fff" ${OBRYS} stroke-width="1.5"/><path d="M88 105.5 h24 M88 108.5 h24" stroke="#d24b3a" stroke-width="2"/>
        <path d="M116 116 h-32 l-6 5 l6 5 h32Z" fill="#fff" ${OBRYS} stroke-width="1.5"/><path d="M88 119.5 h24 M88 122.5 h24" stroke="#2f7fd0" stroke-width="2"/>` },
      { krok: 15, nazev: 'stůl s lavicemi', svg: `<rect x="286" y="118" width="36" height="4" fill="#a86b3c" ${OBRYS} stroke-width="1.2"/><path d="M292 122 L288 138 M316 122 L320 138" stroke="#4a3322" stroke-width="2.5"/>
        <rect x="280" y="130" width="48" height="3" fill="#a86b3c" ${OBRYS} stroke-width="1"/>` },
      { krok: 16, nazev: 'kamenný mužík', svg: [[372, 136, 12, 5], [372, 128, 9, 4], [373, 121, 7, 3.5], [372, 115, 4.5, 3]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#b8b4ac" ${OBRYS} stroke-width="1.2"/>`).join('') },
      { krok: 19, nazev: 'lyže u zdi', svg: `<path d="M126 128 L134 70 M131 128 L139 71" stroke="#2f7fd0" stroke-width="3" stroke-linecap="round"/><path d="M122 124 l4 5 M127 124 l4 5" stroke="#4a3322" stroke-width="1.5"/>` },
      { krok: 20, nazev: 'orel', svg: `<g class="motyl"><path d="M80 30 q10 -8 20 0 q10 -8 20 0 q-10 -2 -20 4 q-10 -6 -20 -4Z" fill="#6b4a36" ${OBRYS} stroke-width="1"/></g>` },
    ],
  },
  5: {
    nazev: 'Hrad',
    hotova: 'hotový',
    pozadi: `<defs><linearGradient id="st5-nebe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3d6ef"/><stop offset=".7" stop-color="#f8dcc4"/><stop offset="1" stop-color="#fbe9d2"/></linearGradient></defs>
      <rect width="400" height="170" fill="url(#st5-nebe)"/>
      <circle cx="56" cy="30" r="12" fill="#fff6d8" opacity=".9"/>
      <path d="M0 140 Q60 110 120 118 T240 112 T400 132 V170 H0Z" fill="#9dbb7c"/>
      <path d="M0 156 Q100 150 200 156 T400 154 V170 H0Z" fill="#86a766"/>`,
    dily: [
      { krok: 18, nazev: 'dub', svg: `<path d="M44 150 V112 M44 124 l-8 -6 M44 118 l8 -6" stroke="#6b4a2e" stroke-width="7" stroke-linecap="round"/><circle cx="44" cy="96" r="22" fill="#5c8f45" ${OBRYS}/><circle cx="28" cy="106" r="12" fill="#6a9e51" ${OBRYS}/><circle cx="60" cy="106" r="13" fill="#6a9e51" ${OBRYS}/>` },
      { krok: 1, nazev: 'skála', svg: `<path d="M110 150 Q120 126 150 124 L250 124 Q282 126 292 150Z" fill="#a39f98" ${OBRYS}/><path d="M130 140 l12 -6 M170 134 l14 4 M230 136 l14 -4 M262 142 l10 -4" stroke="#85807a" stroke-width="1.5"/>` },
      { krok: 10, nazev: 'hlavní věž', svg: `<rect x="186" y="44" width="30" height="82" fill="#c9bfae" ${OBRYS}/>${[186, 196, 206].map(x => `<rect x="${x}" y="38" width="10" height="8" fill="#c9bfae" ${OBRYS} stroke-width="1.5"/>`).join('')}<path d="M188 70 h26 M188 96 h26" stroke="#b0a592" stroke-width="1.2"/>` },
      { krok: 11, nazev: 'střecha hlavní věže', svg: `<path d="M182 40 L201 6 L220 40Z" fill="#3f5aa0" ${OBRYS}/><path d="M190 30 h22 M195 20 h12" stroke="#304780" stroke-width="1.5"/>` },
      { krok: 2, nazev: 'levá hradba', svg: `<rect x="140" y="92" width="50" height="34" fill="#d5ccbc" ${OBRYS}/>${[140, 152, 164, 176].map(x => `<rect x="${x}" y="85" width="9" height="8" fill="#d5ccbc" ${OBRYS} stroke-width="1.5"/>`).join('')}<path d="M142 104 h46 M142 116 h46 M156 92 v12 M172 104 v12 M160 116 v10" stroke="#b9ae9b" stroke-width="1.2"/>` },
      { krok: 3, nazev: 'pravá hradba', svg: `<rect x="212" y="92" width="50" height="34" fill="#d5ccbc" ${OBRYS}/>${[215, 227, 239, 251].map(x => `<rect x="${x}" y="85" width="9" height="8" fill="#d5ccbc" ${OBRYS} stroke-width="1.5"/>`).join('')}<path d="M214 104 h46 M214 116 h46 M228 92 v12 M244 104 v12 M232 116 v10" stroke="#b9ae9b" stroke-width="1.2"/>` },
      { krok: 4, nazev: 'brána', svg: `<rect x="188" y="92" width="26" height="34" fill="#d5ccbc" ${OBRYS}/><path d="M192 126 V110 A9 9 0 0 1 210 110 V126Z" fill="#4a3322"/><path d="M195 110 V126 M201 102 V126 M207 110 V126 M192 116 H210" stroke="#7a6a5a" stroke-width="1.5"/>` },
      { krok: 5, nazev: 'padací most', svg: `<path d="M190 126 L186 146 L216 146 L212 126Z" fill="#a86b3c" ${OBRYS} stroke-width="1.5"/><path d="M189 134 h24 M188 140 h26" stroke="#7a4c26" stroke-width="1.2"/><path d="M192 104 L187 140 M210 104 L215 140" stroke="#555" stroke-width="1.2" stroke-dasharray="2 1.5"/>` },
      { krok: 6, nazev: 'levá věž', svg: `<rect x="120" y="70" width="26" height="56" fill="#c9bfae" ${OBRYS}/>${[120, 129, 138].map(x => `<rect x="${x}" y="64" width="8" height="8" fill="#c9bfae" ${OBRYS} stroke-width="1.5"/>`).join('')}<path d="M122 90 h22 M122 108 h22" stroke="#b0a592" stroke-width="1.2"/>` },
      { krok: 7, nazev: 'pravá věž', svg: `<rect x="256" y="70" width="26" height="56" fill="#c9bfae" ${OBRYS}/>${[256, 265, 274].map(x => `<rect x="${x}" y="64" width="8" height="8" fill="#c9bfae" ${OBRYS} stroke-width="1.5"/>`).join('')}<path d="M258 90 h22 M258 108 h22" stroke="#b0a592" stroke-width="1.2"/>` },
      { krok: 8, nazev: 'střecha levé věže', svg: `<path d="M116 66 L133 32 L150 66Z" fill="#b5402f" ${OBRYS}/><path d="M123 56 h20 M128 46 h10" stroke="#8e3024" stroke-width="1.5"/>` },
      { krok: 9, nazev: 'střecha pravé věže', svg: `<path d="M252 66 L269 32 L286 66Z" fill="#b5402f" ${OBRYS}/><path d="M259 56 h20 M264 46 h10" stroke="#8e3024" stroke-width="1.5"/>` },
      { krok: 12, nazev: 'okna', svg: [[129, 80], [129, 98], [265, 80], [265, 98], [197, 54], [197, 76]].map(([x, y]) => `<path d="M${x} ${y + 10} V${y + 3} A4 4 0 0 1 ${x + 8} ${y + 3} V${y + 10}Z" fill="#ffd66b" ${OBRYS} stroke-width="1.2"/>`).join('') },
      { krok: 13, nazev: 'prapory', svg: [[133, 32, '#d24b3a'], [269, 32, '#d24b3a'], [201, 6, '#f2c14e']].map(([x, y, b]) => `<path d="M${x} ${y} V${y - 14}" stroke="#4a3322" stroke-width="2"/><path d="M${x} ${y - 14} L${x + 14} ${y - 10} L${x} ${y - 5}Z" fill="${b}" ${OBRYS} stroke-width="1.2"/>`).join('') },
      { krok: 14, nazev: 'příkop s vodou', svg: `<path d="M100 150 Q200 142 300 150 Q300 160 200 158 Q100 160 100 150Z" fill="#7fb0d0" ${OBRYS} stroke-width="1.5"/><path d="M130 152 q10 -3 20 0 M240 151 q10 -3 20 0" stroke="#fff" stroke-width="1.5" fill="none" opacity=".7"/>` },
      { krok: 15, nazev: 'pochodně', svg: [182, 218].map(x => `<path d="M${x} 118 V104" stroke="#6b4a2e" stroke-width="2.5"/><path class="plamen" d="M${x} 104 q-5 -5 0 -12 q5 7 0 12Z" fill="#f59a2b" stroke="#c0470f" stroke-width="1"/>`).join('') },
      { krok: 16, nazev: 'rytíř', svg: `<g transform="translate(236 132)"><rect x="-5" y="-6" width="10" height="14" rx="2" fill="#aab3bd" ${OBRYS} stroke-width="1.2"/><circle cx="0" cy="-11" r="5.5" fill="#aab3bd" ${OBRYS} stroke-width="1.2"/><path d="M-3 -11 h6" stroke="#4a3322" stroke-width="1.5"/>
        <path d="M-3 8 V14 M3 8 V14" stroke="#4a3322" stroke-width="2"/><path d="M8 -16 V12" stroke="#6b4a2e" stroke-width="1.8"/><path d="M8 -16 l-3 5 h6Z" fill="#aab3bd" stroke="#4a3322" stroke-width="1"/><path d="M-12 -4 h7 v9 l-3.5 3 l-3.5 -3Z" fill="#d24b3a" ${OBRYS} stroke-width="1"/></g>` },
      { krok: 17, nazev: 'kůň', svg: `<g transform="translate(330 128)"><path d="M-12 20 V6 M-6 20 V7 M8 20 V6 M13 20 V7" stroke="#5a3a24" stroke-width="3"/><ellipse cx="0" cy="4" rx="17" ry="8" fill="#8a5a33" ${OBRYS} stroke-width="1.5"/>
        <path d="M13 0 L20 -14 L27 -12 L21 2Z" fill="#8a5a33" ${OBRYS} stroke-width="1.5"/><ellipse cx="27" cy="-13" rx="7" ry="4" fill="#8a5a33" ${OBRYS} stroke-width="1.5"/><path d="M18 -12 q-4 6 -6 12" stroke="#3a2416" stroke-width="3" fill="none"/><path d="M-17 2 q-6 6 -4 12" stroke="#3a2416" stroke-width="3" fill="none"/></g>` },
      { krok: 19, nazev: 'havrani', svg: `<g class="motyl"><path d="M300 40 q5 -5 10 0 q5 -5 10 0" fill="none" stroke="#3a3a3a" stroke-width="2"/></g><g class="motyl motyl2"><path d="M330 56 q4 -4 8 0 q4 -4 8 0" fill="none" stroke="#3a3a3a" stroke-width="2"/></g>` },
      { krok: 20, nazev: 'ohňostroj', svg: [[90, 36, '#f2c14e'], [330, 22, '#e2475a'], [360, 70, '#8fc8ef']].map(([x, y, b], i) => `<g class="ohnostroj" style="animation-delay:-${i * 0.9}s">${Array.from({ length: 8 }, (_, k) => { const u = k * Math.PI / 4; return `<path d="M${x} ${y} l${Math.round(Math.cos(u) * 12)} ${Math.round(Math.sin(u) * 12)}" stroke="${b}" stroke-width="2" stroke-linecap="round"/>`; }).join('')}</g>`).join('') },
    ],
  },
};

// Díl, který přijde jako příští (podle kroku), nebo null.
export function pristiDil(n, hotovo) {
  const s = STAVBY[n];
  if (!s || hotovo >= OBLASTI) return null;
  return s.dily.find(d => d.krok === hotovo + 1) || null;
}

// SVG stavby. hotovo = postavené díly, videno = kolik z nich už dítě na mapě vidělo
// (zbytek se dostaví animací v app.js – dostanou třídu „ceka“ a pak „nova“).
export function stavbaSvg(n, hotovo, videno = hotovo) {
  const s = STAVBY[n];
  if (!s) return '';
  const ozdobyVidet = Math.min(videno, hotovo) >= DOKONCENI;
  const dily = s.dily.map(d => {
    let trida;
    if (d.krok <= Math.min(videno, hotovo)) trida = 'hotovo';
    else if (d.krok <= hotovo) trida = 'hotovo ceka';
    else if (d.krok <= DOKONCENI || ozdobyVidet) trida = 'plan';
    else trida = 'skryto';
    if (d.krok > DOKONCENI) trida += ' ozdoba';
    return `<g class="dil ${trida}" data-krok="${d.krok}"><title>${d.nazev}</title>${d.svg}</g>`;
  }).join('');
  return `<svg class="stavba-svg" viewBox="0 0 400 170" role="img" aria-label="${s.nazev}: ${Math.min(hotovo, DOKONCENI)} z ${DOKONCENI} dílů">${s.pozadi}${dily}</svg>`;
}

// Text pod stavbou.
export function stavbaPopis(n, hotovo) {
  const s = STAVBY[n];
  if (!s) return '';
  if (hotovo < DOKONCENI) {
    const pristi = pristiDil(n, hotovo);
    return `<b>${s.nazev}</b> · ${hotovo} z ${DOKONCENI} dílů${pristi ? ` · příště: ${pristi.nazev}` : ''}`;
  }
  const ozdob = hotovo - DOKONCENI, vsech = OBLASTI - DOKONCENI;
  const pristi = pristiDil(n, hotovo);
  return ozdob >= vsech ? `<b>${s.nazev} je ${s.hotova} i se všemi ozdobami!</b>`
    : `<b>${s.nazev} je ${s.hotova}!</b> · ozdoby ${ozdob} z ${vsech}${pristi ? ` · příště: ${pristi.nazev}` : ''}`;
}
