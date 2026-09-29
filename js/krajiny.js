// Ilustrace prostředí pěti světů (SVG). Použití: mapa světů a záhlaví hry.
// Vrstvy od oblohy po popředí: vzdálené vrstvy světlejší a modřejší (vzdušná perspektiva),
// světlo z jedné strany, jemné animace (mraky, voda, mlha, listí, vlajky – třídy .a-* ve style.css).
// Důležité prvky jsou uprostřed: na úzkém pásu se obrázek ořízne po stranách.

const W = 400, H = 160;
const obal = (n, defs, obsah) => `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="krajina-svg">
<defs>${defs}<filter id="k${n}rozmaz" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter><filter id="k${n}zar" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter></defs>
${obsah}</svg>`;

const prechod = (id, barvy, svisly = true) => `<linearGradient id="${id}" x1="0" y1="0" x2="${svisly ? 0 : 1}" y2="${svisly ? 1 : 0}">${barvy.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
const zare = (id, c) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset=".25" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;

// mrak z několika elips, rozmazaný
const mrak = (n, x, y, s, a = 0.9) => `<g filter="url(#k${n}rozmaz)" opacity="${a}" fill="#fff"><ellipse cx="${x}" cy="${y}" rx="${22 * s}" ry="${6 * s}"/><ellipse cx="${x + 9 * s}" cy="${y - 5 * s}" rx="${12 * s}" ry="${7 * s}"/><ellipse cx="${x - 10 * s}" cy="${y - 3 * s}" rx="${9 * s}" ry="${5 * s}"/></g>`;
// listnatý strom: kmen, koruna ze tří koulí, světlo zleva nahoře
const strom = (x, y, s, [tma, stred, svetlo], kmen = '#6b4a2e') => `<g><path d="M${x - 1.6 * s} ${y} L${x - 0.9 * s} ${y - 12 * s} L${x + 0.9 * s} ${y - 12 * s} L${x + 1.6 * s} ${y} Z" fill="${kmen}"/>
<circle cx="${x + 3 * s}" cy="${y - 15 * s}" r="${7.5 * s}" fill="${tma}"/><circle cx="${x - 4 * s}" cy="${y - 16 * s}" r="${7 * s}" fill="${stred}"/><circle cx="${x}" cy="${y - 22 * s}" r="${7.5 * s}" fill="${stred}"/>
<circle cx="${x - 3 * s}" cy="${y - 24 * s}" r="${4.2 * s}" fill="${svetlo}"/><circle cx="${x - 6.5 * s}" cy="${y - 18 * s}" r="${3 * s}" fill="${svetlo}" opacity=".8"/></g>`;
// smrk: tři patra, světlá levá polovina
const smrk = (x, y, s, [tma, svetlo], kmen = '#4e3522') => `<g><rect x="${x - 1.2 * s}" y="${y - 4 * s}" width="${2.4 * s}" height="${4 * s}" fill="${kmen}"/>
${[0, 1, 2].map(i => { const v = y - 3 * s - i * 8 * s, sir = (10 - i * 2.6) * s; return `<path d="M${x} ${v - 12 * s} L${x + sir} ${v} L${x - sir} ${v} Z" fill="${tma}"/><path d="M${x} ${v - 12 * s} L${x} ${v} L${x - sir} ${v} Z" fill="${svetlo}"/>`; }).join('')}</g>`;
const ptak = (x, y, s) => `<path d="M${x - 5 * s} ${y} Q${x - 2.5 * s} ${y - 3 * s} ${x} ${y} Q${x + 2.5 * s} ${y - 3 * s} ${x + 5 * s} ${y}" fill="none" stroke="#3a4a52" stroke-width="${1.1 * s}" stroke-linecap="round"/>`;
const kvet = (x, y, c) => `<circle cx="${x}" cy="${y}" r="1.7" fill="${c}"/><circle cx="${x}" cy="${y}" r=".7" fill="#fff6b8"/>`;

// ---------- 1 Zelené údolí: jarní ráno, zvlněné kopce, potok ----------
const udoli = obal(1, `
${prechod('k1nebe', [[0, '#9fd6f7'], [0.55, '#dff3ff'], [1, '#fff4d6']])}${zare('k1slunce', '#fff2a8')}
${prechod('k1k1', [[0, '#b9dfc0'], [1, '#a3d3b0']])}${prechod('k1k2', [[0, '#9fd585'], [1, '#7fc46c']])}
${prechod('k1k3', [[0, '#7fc463'], [1, '#5aa449']])}${prechod('k1k4', [[0, '#5fae4b'], [1, '#3f8a38']])}
${prechod('k1voda', [[0, '#d9f3ff'], [1, '#79c3ec']])}`, `
<rect width="${W}" height="${H}" fill="url(#k1nebe)"/>
<circle cx="300" cy="36" r="70" fill="url(#k1slunce)"/><circle cx="300" cy="36" r="15" fill="#fff6c4"/>
<g opacity=".18" fill="#fff"><path d="M300 36 L150 160 L185 160Z"/><path d="M300 36 L240 160 L262 160Z"/><path d="M300 36 L340 160 L360 160Z"/></g>
<g class="a-mraky">${mrak(1, 70, 30, 1.2)}${mrak(1, 190, 20, 0.8, 0.8)}${mrak(1, 470, 28, 1)}</g>
<g class="a-ptaci">${ptak(120, 44, 1)}${ptak(134, 50, 0.8)}</g>
<path d="M0 82 Q50 58 110 70 T230 62 T400 66 V160 H0Z" fill="url(#k1k1)"/>
${[40, 70, 330, 360].map((x, i) => strom(x, 76 - (i % 2) * 3, 0.45, ['#88b89a', '#9cc8a8', '#b5d9bd'])).join('')}
<path d="M0 98 Q80 74 170 92 T320 84 T400 90 V160 H0Z" fill="url(#k1k2)"/>
<path d="M190 92 C200 104 170 112 186 124 S230 140 214 160 H258 C264 144 236 132 244 120 S222 100 206 92Z" fill="url(#k1voda)"/>
<path class="a-voda" d="M196 108 h10 M200 120 h14 M222 136 h16 M230 150 h12" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>
<path d="M0 118 Q60 100 130 116 T190 122 L186 160 H0Z" fill="url(#k1k3)"/><path d="M252 122 Q320 104 400 112 V160 H258Z" fill="url(#k1k3)"/>
${strom(60, 118, 1.25, ['#3f8a3a', '#57a94b', '#8fd06a'])}${strom(96, 124, 0.9, ['#3f8a3a', '#62b150', '#9ad874'])}
${strom(330, 116, 1.1, ['#3f8a3a', '#57a94b', '#8fd06a'])}${strom(370, 122, 0.8, ['#3f8a3a', '#62b150', '#9ad874'])}
<path d="M0 142 Q90 128 190 146 L190 160 H0Z" fill="url(#k1k4)"/><path d="M250 150 Q320 132 400 140 V160 H250Z" fill="url(#k1k4)"/>
${[[20, 150, '#ff8fb1'], [44, 146, '#fff'], [130, 150, '#ffd54a'], [150, 154, '#ff8fb1'], [280, 152, '#fff'], [300, 148, '#ffd54a'], [350, 150, '#c9a0ff'], [384, 146, '#fff']].map(([x, y, c]) => kvet(x, y, c)).join('')}`);

// ---------- 2 Pestrý les: podzimní odpoledne, barevné koruny, padající listí ----------
const listy = [[60, 0], [140, 1.5], [230, 0.8], [300, 2.2], [350, 3]];
const les = obal(2, `
${prechod('k2nebe', [[0, '#ffd9a8'], [0.6, '#ffe9c9'], [1, '#fff3de']])}${zare('k2slunce', '#fff0b3')}
${prechod('k2zem', [[0, '#c98a4b'], [1, '#9c6334']])}${prechod('k2paprsek', [[0, '#fff6d8', 0.55], [1, '#fff6d8', 0]])}`, `
<rect width="${W}" height="${H}" fill="url(#k2nebe)"/>
<circle cx="110" cy="40" r="80" fill="url(#k2slunce)"/>
<path d="M0 86 Q40 60 80 78 Q120 56 160 76 Q200 54 240 74 Q280 58 320 76 Q360 60 400 74 V160 H0Z" fill="#d9b3a0" opacity=".8"/>
${[20, 70, 120, 170, 220, 270, 320, 370].map((x, i) => strom(x, 98, 0.9, i % 2 ? ['#c98a6a', '#d9a07c', '#ebbf98'] : ['#b89a7c', '#cbb08e', '#e0caa6'])).join('')}
<path d="M0 104 Q100 92 200 102 T400 100 V160 H0Z" fill="#b87a44"/>
<g fill="url(#k2paprsek)"><path d="M90 0 L130 0 L230 160 L170 160Z"/><path d="M150 0 L170 0 L290 160 L262 160Z"/></g>
${strom(30, 132, 1.5, ['#b8401f', '#dd5a2b', '#f6934a'], '#5a3a22')}${smrk(85, 136, 1.5, ['#2f5a3c', '#3f7550'])}
${strom(140, 134, 1.3, ['#c9861a', '#e8a827', '#ffd35c'], '#5a3a22')}${strom(330, 132, 1.5, ['#9b2f2f', '#c9443a', '#ef7a55'], '#5a3a22')}
${smrk(372, 138, 1.3, ['#2f5a3c', '#3f7550'])}${strom(282, 136, 1.1, ['#c96f1a', '#e98d2a', '#ffc15c'], '#5a3a22')}
<path d="M0 138 Q120 126 200 136 T400 134 V160 H0Z" fill="url(#k2zem)"/>
<path d="M170 160 C186 150 196 144 210 138 C222 142 228 150 248 160Z" fill="#e2b77f"/>
${[[60, 146, '#e8a827'], [110, 150, '#dd5a2b'], [270, 148, '#c9443a'], [320, 152, '#e8a827'], [150, 156, '#f6934a']].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="1.4" fill="${c}" transform="rotate(-20 ${x} ${y})"/>`).join('')}
<g><rect x="302" y="144" width="3" height="6" fill="#f3e6cf"/><path d="M297 145 Q303.5 136 310 145Z" fill="#d23c2f"/><circle cx="301" cy="142" r=".9" fill="#fff"/><circle cx="305" cy="141" r=".8" fill="#fff"/></g>
${listy.map(([x, d], i) => `<ellipse class="a-list" style="animation-delay:-${d}s" cx="${x}" cy="-6" rx="3" ry="1.4" fill="${['#e8a827', '#dd5a2b', '#c9443a', '#f6934a', '#ffd35c'][i]}"/>`).join('')}`);

// ---------- 3 Mlžné bažiny: svítání v mlze, rákosí, odrazy ve vodě ----------
const rakos = (x, s, d) => `<g class="a-rakos" style="animation-delay:-${d}s;transform-origin:${x}px 160px"><path d="M${x} 160 Q${x - 2 * s} ${130 - 10 * s} ${x + 1} ${108 - 20 * s}" stroke="#3d5a47" stroke-width="${1.4 * s}" fill="none"/><rect x="${x - 1.6 * s}" y="${110 - 20 * s}" width="${3.2 * s}" height="${11 * s}" rx="${1.6 * s}" fill="#6b4a33"/></g>`;
const bazina = obal(3, `
${prechod('k3nebe', [[0, '#bcd5d1'], [0.55, '#e3ece6'], [1, '#f4eedd']])}${zare('k3slunce', '#fff8dc')}
${prechod('k3voda', [[0, '#cfe0da'], [1, '#7ea79d']])}${prechod('k3mlha', [[0, '#ffffff', 0], [0.5, '#ffffff', 0.85], [1, '#ffffff', 0]], false)}`, `
<rect width="${W}" height="${H}" fill="url(#k3nebe)"/>
<circle cx="250" cy="58" r="60" fill="url(#k3slunce)"/><circle cx="250" cy="58" r="11" fill="#fffbe8" opacity=".9"/>
<g filter="url(#k3rozmaz)" opacity=".6">${[10, 50, 90, 290, 330, 370].map((x, i) => smrk(x, 92, 0.9 + (i % 2) * 0.2, ['#8fb0a8', '#a3c0b8'])).join('')}</g>
<path d="M0 90 Q100 84 200 90 T400 88 V160 H0Z" fill="url(#k3voda)"/>
<g opacity=".25" transform="translate(0 182) scale(1 -1)">${[10, 50, 90, 290, 330, 370].map((x, i) => smrk(x, 92, 0.9 + (i % 2) * 0.2, ['#6f948a', '#6f948a'])).join('')}</g>
<ellipse cx="250" cy="104" rx="26" ry="3" fill="#fff8dc" opacity=".5"/>
<path class="a-voda" d="M60 110 h26 M150 118 h18 M250 112 h30 M310 124 h20 M120 132 h24" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".7"/>
<g fill="#5f8a64">${[[110, 140, 9], [132, 146, 6], [300, 142, 8]].map(([x, y, r]) => `<path d="M${x} ${y} m-${r} 0 a${r} ${r * 0.4} 0 1 0 ${2 * r} 0 l-${r} 0Z"/>`).join('')}</g>
<circle cx="112" cy="138" r="2" fill="#f7c6dc"/>
<g><path d="M200 128 q-3 -10 1 -18 q3 -5 8 -4 q-3 2 -3 6 q0 8 -2 16Z" fill="#8a9aa3"/><path d="M204 106 q3 -4 7 -3 l7 1 l-7 1.5" fill="#8a9aa3"/><path d="M202 128 l-1 12 M205 128 l1 12" stroke="#5d6a70" stroke-width=".8"/></g>
<g class="a-mlha"><rect x="-60" y="74" width="300" height="22" fill="url(#k3mlha)" filter="url(#k3rozmaz)"/><rect x="200" y="100" width="320" height="18" fill="url(#k3mlha)" filter="url(#k3rozmaz)" opacity=".8"/></g>
<g class="a-mlha2"><rect x="-120" y="120" width="360" height="16" fill="url(#k3mlha)" filter="url(#k3rozmaz)" opacity=".7"/></g>
<path d="M0 150 Q60 140 120 152 L120 160 H0Z" fill="#4b6b52"/><path d="M290 152 Q350 138 400 146 V160 H290Z" fill="#4b6b52"/>
${[[14, 1.3, 0], [28, 1, 1.2], [44, 1.2, 0.6], [66, 0.9, 2], [340, 1.2, 0.3], [356, 1, 1.6], [376, 1.4, 0.9], [392, 1, 2.4]].map(([x, s, d]) => rakos(x, s, d)).join('')}`);

// ---------- 4 Horský průsmyk: jasný den, zasněžené štíty, cesta do sedla ----------
const vrch = (body, tma, svetlo, sp) => `<path d="${body}" fill="${tma}"/>${svetlo ? `<path d="${svetlo}" fill="${sp}"/>` : ''}`;
const hory = obal(4, `
${prechod('k4nebe', [[0, '#7fb6e8'], [0.6, '#c3e0fa'], [1, '#eaf5ff']])}${zare('k4slunce', '#ffffff')}
${prechod('k4dal', [[0, '#a8bfd6'], [1, '#c6d6e6']])}${prechod('k4stred', [[0, '#7c8fa8'], [1, '#95a7bd']])}
${prechod('k4bliz', [[0, '#5e6e84'], [1, '#4a586b']])}${prechod('k4louka', [[0, '#8fb776'], [1, '#6e9a5c']])}`, `
<rect width="${W}" height="${H}" fill="url(#k4nebe)"/>
<circle cx="80" cy="30" r="55" fill="url(#k4slunce)" opacity=".8"/>
<path d="M0 96 L40 60 L70 76 L110 38 L150 70 L190 44 L230 72 L270 34 L310 66 L350 48 L400 80 V160 H0Z" fill="url(#k4dal)"/>
<path d="M110 38 L100 48 L108 46 L114 52 L120 44 Z M270 34 L258 46 L268 44 L274 50 L282 42 Z M190 44 L182 52 L190 50 L196 54 Z" fill="#f4f8ff"/>
<g class="a-mraky">${mrak(4, 60, 70, 1.1, 0.75)}${mrak(4, 300, 62, 0.9, 0.7)}</g>
${vrch('M0 120 L60 74 L96 100 L150 58 L200 104 L250 66 L300 98 L350 70 L400 104 V160 H0Z', 'url(#k4stred)', 'M150 58 L200 104 L172 104 L162 80 Z M250 66 L300 98 L276 98 L262 78Z M350 70 L400 104 L380 104 L364 84Z', '#6a7c94')}
<path d="M150 58 L140 70 L150 67 L156 74 L162 66Z M250 66 L241 76 L250 73 L256 79 L260 72Z M60 74 L52 82 L60 80 L64 84Z" fill="#fbfdff"/>
<g class="a-orel" style="transform-origin:200px 40px"><path d="M214 40 q4 -4 8 0 q4 -4 8 0" fill="none" stroke="#2f3a44" stroke-width="1.3" stroke-linecap="round"/></g>
${vrch('M0 140 L70 108 L120 128 L180 112 L230 130 L300 104 L400 132 V160 H0Z', 'url(#k4bliz)', 'M300 104 L400 132 L360 132 L330 116Z M70 108 L120 128 L96 128 L84 118Z', '#3e4a5b')}
<path d="M0 150 Q100 136 200 146 T400 144 V160 H0Z" fill="url(#k4louka)"/>
<path d="M186 160 L204 150 L190 144 L210 136 L200 128 L214 122" stroke="#e4d8bf" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<g><path d="M214 122 v-10" stroke="#5a3e28" stroke-width="1.2"/><path class="a-vlajka" d="M214 112 l10 2.5 l-10 2.5Z" fill="#e0564f"/></g>
${[30, 50, 340, 362, 384].map((x, i) => smrk(x, 152 - (i % 2) * 3, 0.9 + (i % 3) * 0.15, ['#2d4a3a', '#3f6650'])).join('')}`);

// ---------- 5 Hrad mistrů: soumrak, hvězdy, hrad s rozsvícenými okny ----------
const vez = (x, y, sir, vys, strecha) => `<rect x="${x - sir / 2}" y="${y - vys}" width="${sir}" height="${vys}" fill="#3a2f55"/><rect x="${x - sir / 2}" y="${y - vys}" width="${sir / 2}" height="${vys}" fill="#4a3d6a"/>
<path d="M${x - sir / 2 - 2} ${y - vys} L${x} ${y - vys - strecha} L${x + sir / 2 + 2} ${y - vys}Z" fill="#6b3a5e"/><path d="M${x - sir / 2 - 2} ${y - vys} L${x} ${y - vys - strecha} L${x} ${y - vys}Z" fill="#8a4a72"/>
<rect class="a-okno" x="${x - 1.6}" y="${y - vys + 8}" width="3.2" height="5" rx="1.6" fill="#ffd36b"/>`;
const hrad = obal(5, `
${prechod('k5nebe', [[0, '#26285e'], [0.45, '#6a4a9a'], [0.8, '#e98f6d'], [1, '#ffcf8a']])}${zare('k5slunce', '#ffcf7a')}
${prechod('k5kopec', [[0, '#5a3f78'], [1, '#3b2a55']])}${prechod('k5bliz', [[0, '#2f2446'], [1, '#1f1830']])}`, `
<rect width="${W}" height="${H}" fill="url(#k5nebe)"/>
${[[30, 14], [70, 30], [110, 10], [150, 24], [300, 12], [340, 28], [380, 16], [200, 8], [250, 20], [20, 40], [360, 44]].map(([x, y], i) => `<circle class="a-hvezda" style="animation-delay:-${i * 0.37}s" cx="${x}" cy="${y}" r="${i % 3 ? 0.9 : 1.3}" fill="#fff"/>`).join('')}
<circle cx="200" cy="112" r="90" fill="url(#k5slunce)" opacity=".85"/>
<path d="M0 110 Q70 88 140 104 T280 98 T400 106 V160 H0Z" fill="#8a5a8a" opacity=".7"/>
<path d="M60 160 Q120 100 200 96 Q280 100 340 160Z" fill="url(#k5kopec)"/>
<g>
<rect x="160" y="76" width="80" height="24" fill="#3a2f55"/><rect x="160" y="76" width="40" height="24" fill="#4a3d6a"/>
<path d="M160 76 ${Array.from({ length: 10 }, () => 'h4 v-4 h4 v4').join(' ')}" fill="#3a2f55"/>
${vez(160, 100, 14, 40, 16)}${vez(240, 100, 14, 36, 14)}${vez(200, 88, 18, 44, 20)}
<path d="M194 100 v-10 a6 6 0 0 1 12 0 v10Z" fill="#1f1830"/>
<rect class="a-okno" x="176" y="86" width="3" height="4" rx="1" fill="#ffd36b"/><rect class="a-okno" x="221" y="86" width="3" height="4" rx="1" fill="#ffd36b" style="animation-delay:-1.3s"/>
<g filter="url(#k5zar)" opacity=".8"><circle cx="200" cy="54" r="3" fill="#ffd36b"/><circle cx="160" cy="68" r="2.5" fill="#ffd36b"/><circle cx="240" cy="72" r="2.5" fill="#ffd36b"/></g>
<path d="M200 24 v-12" stroke="#2a2040" stroke-width="1"/><path class="a-vlajka" d="M200 12 l12 3 l-12 3Z" fill="#ffcf5a"/>
</g>
<path d="M186 160 C192 140 196 118 200 100" stroke="#caa06a" stroke-width="3" fill="none" opacity=".7"/>
${[[190, 146], [196, 124]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#ffd36b" filter="url(#k5zar)"/>`).join('')}
<path d="M0 136 Q60 120 110 138 L110 160 H0Z" fill="url(#k5bliz)"/><path d="M300 140 Q350 122 400 130 V160 H300Z" fill="url(#k5bliz)"/>
${[[20, 140, 1.4], [50, 146, 1.1], [80, 150, 0.9], [330, 146, 1.2], [360, 140, 1.5], [388, 148, 1]].map(([x, y, s]) => smrk(x, y, s, ['#1b1428', '#261d38'])).join('')}`);

const KRESBY = { 1: udoli, 2: les, 3: bazina, 4: hory, 5: hrad };

// ---------- Fotky (Janovy) s animovanou vrstvou ----------
// Fotka (obrazky/svetN-*.webp, poměr 2:1) a nad ní SVG vrstva ve stejných souřadnicích (800 × 400):
// img object-fit: cover + object-position a SVG preserveAspectRatio se stejným svislým ukotvením,
// takže efekty sedí na místech fotky (mlha nad polem, hrad na obzoru).
const hejno = (x, y, s, pocet, zpozdeni, trida = 'f-let') => `<g class="${trida}" style="animation-delay:-${zpozdeni}s">${Array.from({ length: pocet }, (_, i) => {
  const dx = x + [0, 14, 26, -12, 36][i] * s, dy = y + [0, 7, -5, 9, 4][i] * s;
  return `<g transform="translate(${dx} ${dy}) scale(${s})"><path class="f-kridla" style="animation-delay:-${i * 0.13}s" d="M-6 0 Q-3 -4 0 0 Q3 -4 6 0" fill="none" stroke="#1d2226" stroke-width="1.5" stroke-linecap="round"/></g>`;
}).join('')}</g>`;
const motyl = (x, y, barva, zpozdeni) => `<g class="f-motyl" style="animation-delay:-${zpozdeni}s"><g transform="translate(${x} ${y})"><g class="f-mava"><ellipse cx="-3" cy="0" rx="3.2" ry="2.4" fill="${barva}"/><ellipse cx="3" cy="0" rx="3.2" ry="2.4" fill="${barva}"/></g><rect x="-.5" y="-2" width="1" height="4" fill="#2b2b2b"/></g></g>`;
const mlha = (y, v, zpozdeni, a = 0.7) => `<g class="f-mlha" style="animation-delay:-${zpozdeni}s" opacity="${a}">${[[-60, 0, 1], [180, 6, 0.8], [420, -4, 1.1], [660, 3, 0.9]].map(([x, dy, s]) => `<ellipse cx="${x}" cy="${y + v / 2 + dy}" rx="${190 * s}" ry="${v * s}" fill="url(#fmlhavy)"/>`).join('')}</g>`;
const jiskry = (body, trida) => body.map(([x, y, r], i) => `<circle class="${trida}" style="animation-delay:-${(i * 0.53) % 3}s" cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`).join('');
const svetlaVez = (x, y, sir, vys, strecha) => `<rect x="${x - sir / 2}" y="${y - vys}" width="${sir}" height="${vys}" fill="#07080d"/><path d="M${x - sir / 2 - 3} ${y - vys} L${x} ${y - vys - strecha} L${x + sir / 2 + 3} ${y - vys}Z" fill="#07080d"/><rect class="f-okno" x="${x - 2}" y="${y - vys + 10}" width="4" height="7" rx="2" fill="#ffc861"/>`;

const DEFS = `<defs><linearGradient id="fmlha" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="fzare"><stop offset="0" stop-color="#fff6d0" stop-opacity=".9"/><stop offset=".3" stop-color="#ffe7a0" stop-opacity=".35"/><stop offset="1" stop-color="#ffe7a0" stop-opacity="0"/></radialGradient>
<filter id="frozmaz" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="6"/></filter><radialGradient id="fmlhavy"><stop offset="0" stop-color="#f4f6f5" stop-opacity=".95"/><stop offset=".55" stop-color="#f4f6f5" stop-opacity=".5"/><stop offset="1" stop-color="#f4f6f5" stop-opacity="0"/></radialGradient>
<linearGradient id="fkopec" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27401f" stop-opacity="0"/><stop offset=".35" stop-color="#27401f" stop-opacity=".85"/><stop offset="1" stop-color="#1c2e17"/></linearGradient><filter id="fzar" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.5"/></filter></defs>`;

// kotva: svislé ukotvení fotky i vrstvy (0 = nahoře, 50 = střed, 100 = dole)
const FOTKY = {
  1: { kotva: 50, vrstva: `${hejno(-60, 60, 1.8, 5, 0)}${hejno(-60, 36, 1.3, 3, 11)}
      ${motyl(430, 300, '#f7f1a8', 0)}${motyl(610, 280, '#fff', 3)}${motyl(250, 320, '#ffd9f2', 6)}
      ${jiskry([[520, 250, 1.2], [600, 230, 1], [680, 260, 1.3], [470, 270, 1], [720, 240, 1.1]], 'f-pyl')}` },
  // vodopád v lese: padající voda, tříšť, kruhy na hladině, odlesky, vážka, listí
  2: { kotva: 0, vrstva: `${Array.from({ length: 14 }, (_, i) => `<rect class="f-kapka" style="animation-delay:-${(i * 0.23) % 1.4}s" x="${215 + i * 17}" y="${92 + (i % 3) * 6}" width="2" height="${10 + (i % 4) * 3}" rx="1" fill="#fff" opacity=".75"/>`).join('')}
      <ellipse class="f-trist" cx="330" cy="168" rx="120" ry="12" fill="#fff" filter="url(#frozmaz)"/>
      ${[[330, 190, 0], [520, 215, 1.3], [250, 205, 2.4]].map(([x, y, d]) => `<ellipse class="f-kruh" style="animation-delay:-${d}s" cx="${x}" cy="${y}" rx="12" ry="3" fill="none" stroke="#fff" stroke-width="1.2"/>`).join('')}
      ${jiskry([[300, 290, 1.4], [450, 262, 1.2], [620, 300, 1.5], [700, 250, 1.1], [380, 240, 1.2], [560, 330, 1.3]], 'f-pyl')}
      <g class="f-vazka"><g transform="translate(560 120)"><ellipse cx="0" cy="0" rx="9" ry="1.3" fill="#2a5d7a"/><g class="f-mava"><ellipse cx="-2" cy="-3" rx="5" ry="2" fill="#dff4ff" opacity=".7"/><ellipse cx="-2" cy="3" rx="5" ry="2" fill="#dff4ff" opacity=".7"/></g></g></g>
      ${[[620, 0], [700, 2.5], [480, 5]].map(([x, d]) => `<ellipse class="f-listek" style="animation-delay:-${d}s" cx="${x}" cy="-8" rx="4" ry="1.8" fill="#8ccf4d"/>`).join('')}` },
  // mlžná louka: husté pásy mlhy, pomalé hejno, rosa v trávě
  3: { kotva: 50, vrstva: `${mlha(110, 50, 0, 0.4)}${mlha(175, 40, 7, 0.35)}${mlha(235, 34, 13, 0.3)}${mlha(55, 40, 19, 0.25)}
      ${hejno(-80, 70, 1.5, 5, 3, 'f-let f-pomalu')}
      ${jiskry([[120, 340, 1], [260, 360, 1.1], [400, 330, 0.9], [520, 370, 1], [640, 350, 1.1], [720, 380, 0.9]], 'f-pyl')}` },
  // štíty mezi svahy: plující oblaka, krouživý orel, hejno
  4: { kotva: 100, vrstva: `${[[160, 60, 70, 0], [560, 110, 55, 12], [380, 40, 45, 24]].map(([x, y, r, d]) => `<ellipse class="f-mrak" style="animation-delay:-${d}s" cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.28}" fill="#fff" opacity=".55" filter="url(#frozmaz)"/>`).join('')}
      <g class="f-orel"><g transform="translate(470 110) scale(2)"><path class="f-kridla" d="M-8 0 Q-4 -5 0 0 Q4 -5 8 0" fill="none" stroke="#1d2226" stroke-width="1.3" stroke-linecap="round"/></g></g>
      ${hejno(-60, 150, 1.3, 3, 8)}` },
  // pevnost: kroužící hejno kavek, vlajky na věžích, plující mraky
  5: { kotva: 0, vrstva: `<rect x="0" y="250" width="800" height="150" fill="url(#fkopec)"/>${[[140, 40, 90, 0], [520, 60, 110, 10], [330, 20, 80, 20]].map(([x, y, r, d]) => `<ellipse class="f-mrak" style="animation-delay:-${d}s" cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.3}" fill="#f2f4f6" opacity=".35" filter="url(#frozmaz)"/>`).join('')}
      ${[[500, 104], [199, 128], [598, 118]].map(([x, y], i) => `<path d="M${x} ${y} v-16" stroke="#3a3a3a" stroke-width="1.2"/><path class="f-vlajka" style="animation-delay:-${i * 0.4}s" d="M${x} ${y - 16} l12 3 l-12 3Z" fill="#c8323c"/>`).join('')}
      <g class="f-kavky">${Array.from({ length: 6 }, (_, i) => `<g transform="rotate(${i * 60} 420 120) translate(${420 + 150 + (i % 2) * 30} 120)"><path class="f-kridla" style="animation-delay:-${i * 0.11}s" d="M-5 0 Q-2.5 -3.5 0 0 Q2.5 -3.5 5 0" fill="none" stroke="#1d1d1f" stroke-width="1.5" stroke-linecap="round"/></g>`).join('')}</g>` },
};
const ZAROVNANI = { 0: 'YMin', 50: 'YMid', 100: 'YMax' };
const foto = n => {
  const f = FOTKY[n];
  return `<div class="foto-krajina" style="--kotva:${f.kotva}%">
<img src="obrazky/svet${n}-800.webp" srcset="obrazky/svet${n}-800.webp 800w, obrazky/svet${n}-1600.webp 1600w" sizes="(max-width: 700px) 100vw, 640px" alt="" loading="lazy" decoding="async">
<svg class="foto-vrstva" viewBox="0 0 800 400" preserveAspectRatio="xMid${ZAROVNANI[f.kotva]} slice" aria-hidden="true">${(DEFS + f.vrstva).replace(/#?\bf(mlha|mlhavy|zare|rozmaz|zar|kopec)\b/g, (m, id) => (m[0] === '#' ? '#' : '') + `f${n}${id}`)}</svg></div>`;
};

// Svislé ukotvení fotky světa (pro pozadí her) a výhled nad mapou (panorama s přelétajícími ptáky).
export const KOTVY = Object.fromEntries(Object.entries(FOTKY).map(([n, f]) => [n, f.kotva]));
export const VYHLED = `<div class="vyhled" aria-hidden="true">
<img src="obrazky/mapa-800.webp" srcset="obrazky/mapa-800.webp 800w, obrazky/mapa-1600.webp 1600w" sizes="(max-width: 700px) 100vw, 640px" alt="" decoding="async">
<svg class="foto-vrstva" viewBox="0 0 1600 339" preserveAspectRatio="xMidYMid slice">${hejno(-80, 60, 3, 5, 4).replace('f-let', 'f-let f-vyhled')}${hejno(-80, 110, 2.2, 3, 16).replace('f-let', 'f-let f-vyhled')}</svg></div>`;

export const KRAJINY = Object.fromEntries(Object.entries(KRESBY).map(([n, kresba]) => [n, FOTKY[n] ? foto(n) : kresba]));
