// Ilustrace prostředí pěti světů (SVG). Použití: mapa světů a záhlaví hry.
const obal = (obsah, nebe) => `<svg viewBox="0 0 320 110" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs><linearGradient id="n${nebe[0].slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${nebe[0]}"/><stop offset="1" stop-color="${nebe[1]}"/></linearGradient></defs>
<rect width="320" height="110" fill="url(#n${nebe[0].slice(1)})"/>${obsah}</svg>`;

const strom = (x, y, s, barva) => `<rect x="${x - 2 * s}" y="${y}" width="${4 * s}" height="${10 * s}" fill="#7a4e2a"/><circle cx="${x}" cy="${y - 4 * s}" r="${9 * s}" fill="${barva}"/>`;
const smrk = (x, y, s, barva) => `<rect x="${x - 1.5 * s}" y="${y}" width="${3 * s}" height="${7 * s}" fill="#6b4424"/><path d="M${x} ${y - 24 * s} L${x + 10 * s} ${y + 1} L${x - 10 * s} ${y + 1} Z" fill="${barva}"/>`;
const kvet = (x, y, barva) => `<circle cx="${x}" cy="${y}" r="2.2" fill="${barva}"/><circle cx="${x}" cy="${y}" r="0.9" fill="#fff4a8"/>`;

export const KRAJINY = {
  // Zelené údolí: slunce, kopce, potok, stromy a kytky
  1: obal(`
<circle cx="268" cy="26" r="14" fill="#ffd54a"/><circle cx="268" cy="26" r="20" fill="#ffd54a" opacity=".25"/>
<ellipse cx="70" cy="22" rx="22" ry="7" fill="#fff" opacity=".9"/><ellipse cx="86" cy="18" rx="14" ry="7" fill="#fff" opacity=".9"/>
<path d="M0 70 Q60 40 130 64 T260 58 T320 62 V110 H0Z" fill="#8fd16f"/>
<path d="M0 84 Q90 62 180 82 T320 76 V110 H0Z" fill="#6cbf57"/>
<path d="M150 110 Q170 96 200 92 T260 84 L270 86 Q230 96 214 104 T190 110Z" fill="#7cc8ee"/>
${strom(40, 62, 1, '#3f9a45')}${strom(62, 66, .8, '#4aa84f')}${strom(292, 60, 1.1, '#3f9a45')}
${kvet(100, 92, '#ff6b8a')}${kvet(112, 98, '#ffb13d')}${kvet(126, 90, '#c77dff')}${kvet(236, 100, '#ff6b8a')}${kvet(300, 96, '#ffb13d')}`, ['#bfe6ff', '#e8f7ff']),

  // Pestrý les: barevné stromy, houby
  2: obal(`
<path d="M0 60 Q80 48 160 58 T320 52 V110 H0Z" fill="#2f7a45"/>
${smrk(22, 70, 1.3, '#1f5a33')}${smrk(58, 74, 1, '#2a6b3c')}${strom(96, 70, 1.3, '#e0892a')}${smrk(134, 76, 1.2, '#1f5a33')}
${strom(176, 68, 1.4, '#c9452f')}${smrk(214, 74, 1.1, '#2a6b3c')}${strom(252, 70, 1.2, '#e8b923')}${smrk(292, 72, 1.4, '#1f5a33')}
<path d="M0 88 Q160 76 320 88 V110 H0Z" fill="#3c8a4b"/>
<rect x="74" y="96" width="4" height="7" fill="#f3e6cf"/><path d="M69 97 Q76 86 83 97Z" fill="#d93a2b"/><circle cx="74" cy="93" r="1.2" fill="#fff"/><circle cx="78" cy="95" r="1" fill="#fff"/>
<rect x="232" y="98" width="3.4" height="6" fill="#f3e6cf"/><path d="M228 99 Q234 90 239 99Z" fill="#b5651d"/>`, ['#d9f0c4', '#f4fbe9']),

  // Mlžné bažiny: tůně, rákosí, mlha
  3: obal(`
<path d="M0 64 Q80 56 160 62 T320 60 V110 H0Z" fill="#6f8a74"/>
<ellipse cx="90" cy="88" rx="60" ry="10" fill="#4f7a78"/><ellipse cx="240" cy="96" rx="52" ry="8" fill="#4f7a78"/>
<g stroke="#3f5a44" stroke-width="2" stroke-linecap="round">
<path d="M30 92 V70"/><path d="M36 94 V66"/><path d="M42 92 V74"/><path d="M168 96 V72"/><path d="M174 98 V68"/><path d="M296 94 V70"/><path d="M302 96 V64"/></g>
<g fill="#6b4a2a"><rect x="33.5" y="62" width="5" height="11" rx="2.5"/><rect x="171.5" y="64" width="5" height="11" rx="2.5"/><rect x="299.5" y="60" width="5" height="11" rx="2.5"/></g>
<ellipse cx="80" cy="60" rx="90" ry="6" fill="#fff" opacity=".45"/><ellipse cx="250" cy="72" rx="100" ry="7" fill="#fff" opacity=".4"/>
<ellipse cx="160" cy="46" rx="120" ry="5" fill="#fff" opacity=".35"/>`, ['#c9d4cf', '#e8eeeb']),

  // Horský průsmyk: hory se sněhem, cesta
  4: obal(`
<path d="M0 80 L50 34 L86 62 L140 18 L196 70 L240 30 L320 78 V110 H0Z" fill="#7d8ba0"/>
<path d="M140 18 L126 32 L134 30 L140 36 L147 30 L156 34Z" fill="#fff"/><path d="M240 30 L228 41 L236 39 L242 44 L248 40 L256 44Z" fill="#fff"/><path d="M50 34 L40 43 L47 42 L52 46 L58 43Z" fill="#fff"/>
<path d="M0 90 L70 66 L130 84 L200 70 L270 86 L320 76 V110 H0Z" fill="#56647a"/>
<path d="M150 110 Q160 96 176 90 T206 80 L210 82 Q188 92 178 100 T166 110Z" fill="#c9b48a"/>
${smrk(30, 92, .9, '#2f4f3a')}${smrk(44, 96, .7, '#2f4f3a')}${smrk(282, 92, .9, '#2f4f3a')}`, ['#dfe9f5', '#f6f9fd']),

  // Hrad mistrů: hrad na kopci při západu slunce
  5: obal(`
<circle cx="60" cy="46" r="16" fill="#ffb347" opacity=".9"/>
<path d="M0 84 Q100 58 200 70 T320 66 V110 H0Z" fill="#9c7a4a"/>
<g fill="#5a3f28">
<rect x="170" y="40" width="80" height="34"/><rect x="160" y="28" width="18" height="46"/><rect x="242" y="28" width="18" height="46"/><rect x="200" y="20" width="20" height="54"/>
<path d="M160 28 L169 16 L178 28Z"/><path d="M242 28 L251 16 L260 28Z"/><path d="M200 20 L210 6 L220 20Z"/>
<rect x="170" y="36" width="6" height="5"/><rect x="182" y="36" width="6" height="5"/><rect x="232" y="36" width="6" height="5"/></g>
<path d="M203 74 V62 Q210 54 217 62 V74Z" fill="#2e1f14"/>
<g fill="#ffd54a"><rect x="165" y="40" width="4" height="6"/><rect x="247" y="40" width="4" height="6"/><rect x="206" y="32" width="4" height="6"/></g>
<path d="M251 16 V5" stroke="#5a3f28" stroke-width="1.5"/><path d="M251 5 L263 8 L251 11Z" fill="#d93a2b"/>
<path d="M0 96 Q160 84 320 96 V110 H0Z" fill="#7a5b35"/>`, ['#f4c38e', '#fbe8cf']),
};
