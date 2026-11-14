#!/usr/bin/env node
/* KABİN ÇİZİMİ — gorseller/kabin.svg üretir. Yan kesit yolcu uçağı, burun sağda; altı bölme (1 kokpit · 2 etkinlik · 3 Ar-Ge ·
 * 4 sponsorluk · 5 tanıtım · 6 tasarım). Boş gündem çizimiyle (kapi.svg) aynı dil: 2 px mürekkep çizgi, site paleti.
 * Bölme sınırları BOLME dizisinde; index.html'deki numara katmanı (.kabin-plan li) aynı oranları kullanır (site.css).
 * Her nesne bölme duvarından en az 5 birim içeride; pencereler duvar nesnelerinin arkasına düşmez (KACIN).
 * Hareket: bulutlar geçer, rüzgâr çizgileri akar, dron süzülür, kedi uyur, kayıt ışığı ve çakarlar yanar, perdede slayt değişir.
 * Hareket azaltmada hepsi durur.  Kullanım: node araclar/kabin-cizim.mjs  */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const G = 1200, Y = 360;
/* bölme x aralıkları, soldan sağa: 6 tasarım … 1 kokpit */
export const BOLME = [[340, 482], [482, 624], [624, 766], [766, 908], [908, 1050], [1050, 1150]];
export const UST = 128, ALT = 252;
const ZEMIN = 236, DOLAP = 144, S = 0.9;
/* pencere bandını (y 150–168) kesen duvar nesnelerinin x aralıkları, bölme sırasıyla */
const KACIN = [[], [[536, 590]], [[630, 676]], [[846, 906]], [[1004, 1046]], [[1050, 1150]]];

const R = { k: '#141414', s: '#4a4a48', y: '#f8f8f6', p: '#056b7a', pk: '#03525e', pa: '#dfeaeb', sa: '#f2c200', c: '#cfcdc6', g: '#dcdedb', kr: '#a4262c', pan: '#2d3b45', dol: '#e6e8e4' };
const TEN = ['#f1c9a5', '#c68b59', '#e0ac7e', '#8d5a3b'];
const DUVAR = ['#ece8de', '#f3e6e3', '#ede7d8', '#e3eded', '#f3ecd3', '#dde6e6'];

const govde = 'M1040 118C1110 118 1158 156 1166 196C1170 232 1124 262 1056 262H340C262 262 176 214 86 168C70 162 62 156 64 148L72 140C116 126 176 118 240 118Z';
const ic = `M340 ${UST}H1046C1098 ${UST} 1140 160 1150 196C1155 224 1124 251 1066 ${ALT}H340Z`;

const g = (x, yon = 1) => `transform="translate(${x} ${ZEMIN}) scale(${S * yon} ${S})"`;
const koltuk = (x) => `<g ${g(x)}><rect class="c" x="0" y="-50" width="11" height="42" rx="4" fill="${R.p}"/><rect class="c" x="0" y="-19" width="30" height="10" rx="3" fill="${R.p}"/><rect class="c" x="13" y="-9" width="5" height="9" fill="${R.pk}"/></g>`;
const oturan = (x, gomlek, ten, sac = R.k, ek = '') => `<g ${g(x)}>
<rect class="c" x="14" y="-24" width="22" height="8" rx="4" fill="${R.pan}"/><rect class="c" x="30" y="-20" width="7" height="18" rx="3" fill="${R.pan}"/><rect class="c" x="29" y="-4" width="12" height="5" rx="2" fill="${R.k}"/>
<rect class="c" x="5" y="-49" width="17" height="31" rx="7" fill="${gomlek}"/>
<circle class="c" cx="15" cy="-58" r="8.5" fill="${ten}"/><path d="M6.6 -59.5A8.5 8.5 0 0 1 22.4 -62Q16 -63 12 -59Q10 -55 7.4 -54.5Q6.3 -57 6.6 -59.5Z" fill="${sac}"/>
<rect class="c" x="14" y="-41" width="19" height="6" rx="3" fill="${gomlek}"/><circle class="c" cx="34" cy="-38" r="3" fill="${ten}"/>${ek}</g>`;
const ayakta = (x, gomlek, ten, yon = 1, kol = '', sac = R.k) => `<g ${g(x, yon)}>
<rect class="c" x="-7" y="-34" width="6" height="32" rx="3" fill="${R.pan}"/><rect class="c" x="1" y="-34" width="6" height="32" rx="3" fill="${R.pan}"/>
<rect class="c" x="-8" y="-4" width="9" height="5" rx="2" fill="${R.k}"/><rect class="c" x="0" y="-4" width="10" height="5" rx="2" fill="${R.k}"/>
<rect class="c" x="-9" y="-66" width="18" height="34" rx="8" fill="${gomlek}"/>
<circle class="c" cx="0" cy="-75" r="9" fill="${ten}"/><path d="M-8.9 -76.5A9 9 0 0 1 7.8 -79.5Q1 -80 -2.5 -76Q-4.5 -71.5 -7.5 -70.5Q-9.2 -73 -8.9 -76.5Z" fill="${sac}"/>
${kol || `<rect class="c" x="-3" y="-62" width="6" height="25" rx="3" fill="${gomlek}"/>`}</g>`;
/* omuzdan uzanan kol ve el */
const kol = (renk, ten, dx, dy) => `<path class="c" d="M0 -60l${dx} ${dy}" stroke="${renk}" stroke-width="6" fill="none"/><circle class="c" cx="${dx}" cy="${-60 + dy}" r="3.2" fill="${ten}"/>`;

function pencereler(i) {
  const [a, b] = BOLME[i]; let s = '';
  if (i === 5) return s;
  for (let x = a + 16; x + 12 <= b - 8; x += 36) if (!KACIN[i].some(([p, q]) => x + 12 > p && x < q)) s += `<rect class="i" x="${x}" y="150" width="12" height="18" rx="6" fill="${R.pa}"/>`;
  return s;
}
function dolaplar(i) {
  const [a, b] = BOLME[i]; if (i === 5) return '';
  let s = `<rect class="i" x="${a + 3}" y="${UST}" width="${b - a - 6}" height="${DOLAP - UST}" fill="${R.dol}"/>`;
  for (let x = a + 3 + 34; x < b - 20; x += 34) s += `<path class="i" d="M${x} ${UST}V${DOLAP}" fill="none"/>`;
  for (let x = a + 3 + 11; x < b - 16; x += 34) s += `<rect x="${x}" y="${DOLAP - 5}" width="12" height="2" rx="1" fill="${R.s}"/>`;
  return s;
}

const icerik = [
  /* 6 · tasarım: askıda tişört, şövalede afiş, çizen tasarımcı */
  `<path class="c" d="M355 181h22M366 176v5" fill="none"/>
   <path class="c" d="M353 187l8-5h10l8 5-4 7-3-2v17h-12v-17l-3 2z" fill="${R.p}"/><circle cx="366" cy="194" r="2.6" fill="${R.sa}"/>
   <path class="c" d="M444 236l12-58 12 58M456 178v58" fill="none"/>
   <rect class="c" x="438" y="170" width="36" height="34" rx="2" fill="${R.y}"/>
   <rect x="442" y="174" width="14" height="14" fill="${R.p}"/><rect x="458" y="174" width="12" height="7" fill="${R.sa}"/><rect x="458" y="183" width="12" height="5" fill="${R.k}"/><rect x="442" y="191" width="28" height="8" fill="${R.sa}"/>
   ${ayakta(418, R.sa, TEN[0], 1, kol(R.sa, TEN[0], 19, -8))}`,
  /* 5 · tanıtım: halka ışıkta telefon, poz veren üye, beğeni balonu */
  `<path class="c" d="M500 236l12-38 12 38M512 198v38" fill="none"/>
   <circle cx="512" cy="182" r="15" fill="none" stroke="${R.k}" stroke-width="6"/><circle cx="512" cy="182" r="15" fill="none" stroke="${R.sa}" stroke-width="3"/>
   <rect class="c" x="506" y="172" width="12" height="20" rx="2" fill="${R.k}"/><circle class="rec" cx="512" cy="176" r="2" fill="${R.kr}"/>
   ${ayakta(598, R.p, TEN[2], -1, kol(R.p, TEN[2], -12, -16))}
   <g class="balon"><path class="c" d="M546 150h34a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6h-6l-6 6v-6h-22a6 6 0 0 1-6-6v-10a6 6 0 0 1 6-6z" fill="${R.y}"/>
   <path d="M556 158c-3-4-9-1-6 4l6 6 6-6c3-5-3-8-6-4z" fill="${R.kr}"/><rect x="566" y="158" width="12" height="3" rx="1.5" fill="${R.c}"/><rect x="566" y="164" width="8" height="3" rx="1.5" fill="${R.c}"/></g>`,
  /* 4 · sponsorluk: koli yığını, el sıkışan iki kişi */
  `<rect class="c" x="636" y="210" width="34" height="26" fill="#d9b98a"/><rect class="c" x="640" y="186" width="26" height="24" fill="#e4c799"/><rect class="c" x="644" y="168" width="18" height="18" fill="#d9b98a"/>
   <path d="M653 210v26M653 186v24M653 168v18" stroke="${R.sa}" stroke-width="4"/>
   ${ayakta(700, R.k, TEN[1], 1, `<path class="c" d="M0 -60l20 14" stroke="${R.k}" stroke-width="6" fill="none"/>`)}
   ${ayakta(744, R.y, TEN[3], -1, `<path class="c" d="M0 -60l20 14" stroke="${R.y}" stroke-width="6" fill="none"/>`)}
   <circle class="c" cx="722" cy="195" r="5" fill="${TEN[1]}"/>`,
  /* 3 · Ar-Ge: kanat profili çizili tahta, masada dizüstü, süzülen dron */
  `<rect class="c" x="776" y="176" width="42" height="28" rx="2" fill="${R.y}"/><path d="M781 194c8-10 24-10 33-2c-11-2-22 0-33 2z" fill="none" stroke="${R.p}" stroke-width="2"/><path d="M782 184h12M804 186l7-3" stroke="${R.s}" stroke-width="1.5"/>
   ${koltuk(826)}${oturan(826, R.sa, TEN[3], '#3a2a1e')}
   <rect class="c" x="854" y="206" width="46" height="6" fill="${R.c}"/><path class="c" d="M866 212v24M896 212v24" fill="none"/>
   <path class="c" d="M864 206l6-17h20l-4 17z" fill="${R.k}"/><path d="M873 194h10" stroke="${R.pa}" stroke-width="2"/>
   <g class="dron"><rect class="c" x="866" y="159" width="22" height="8" rx="3" fill="${R.k}"/><path class="c" d="M866 163h-8M888 163h8M858 163v-5M896 163v-5" fill="none"/>
   <path class="pervane" d="M852 157h12M890 157h12" stroke="${R.s}" stroke-width="2"/><circle cx="877" cy="163" r="1.6" fill="#33c46a"/></g>`,
  /* 2 · etkinlik: perde, üç koltuk, iki dinleyici, ortadaki koltukta uyuyan kedi */
  `<path class="c" d="M1025 ${DOLAP}v24" fill="none"/><rect class="c" x="1010" y="168" width="30" height="30" rx="2" fill="${R.y}"/>
   <g class="perde1"><path d="M1014 185l11-4 10-6 2 2-8 7 7 2-1 2-9-1-6 3z" fill="${R.p}"/><rect x="1014" y="191" width="22" height="2.5" fill="${R.c}"/></g>
   <g class="perde2"><path d="M1015 190c5-12 13-12 19 0" fill="none" stroke="${R.p}" stroke-width="2.5"/><rect x="1014" y="192" width="22" height="2.5" fill="${R.c}"/><circle cx="1021" cy="175" r="3" fill="${R.sa}"/></g>
   ${koltuk(918)}${oturan(918, R.p, TEN[0], '#6b3e1f')}
   ${koltuk(952)}
   <g transform="translate(955 219) scale(1.15)"><path class="c" d="M2 0c0-9 8-14 16-12c7 1 9 6 7 12z" fill="#7c7f86"/><path class="c" d="M18 -12l2-5 3 4" fill="#7c7f86"/><path class="c" d="M2 0c-4 0-6-3-4-5" fill="none"/></g>
   <text class="z z1" x="964" y="198" font-family="sans-serif" font-weight="700" font-size="11" fill="${R.p}">z</text><text class="z z2" x="964" y="198" font-family="sans-serif" font-weight="700" font-size="9" fill="${R.p}">z</text><text class="z z3" x="964" y="198" font-family="sans-serif" font-weight="700" font-size="8" fill="${R.p}">z</text>
   ${koltuk(986)}${oturan(986, R.k, TEN[1])}`,
  /* 1 · kokpit: ön cam, gösterge paneli ve dümen, kaptan şapkalı pilot, duvarda kontrol listesi */
  `<path class="c" d="M1078 142h28l26 32h-54z" fill="${R.pa}"/><path d="M1086 154h10M1084 164h16" stroke="${R.y}" stroke-width="2"/>
   <rect class="c" x="1056" y="150" width="11" height="15" rx="1" fill="${R.y}"/><path d="M1058 155h7M1058 159h5" stroke="${R.s}" stroke-width="1.2"/>
   <path class="c" d="M1100 204H1128L1144 220V236H1100Z" fill="${R.k}"/>
   <rect class="gosterge" x="1105" y="209" width="9" height="6" fill="${R.sa}"/><rect x="1117" y="209" width="9" height="6" fill="${R.p}"/>
   <path class="c" d="M1100 214l-9-8" fill="none"/>
   ${koltuk(1060)}${oturan(1060, R.y, TEN[2], '#2a1a10', `<path class="c" d="M6 -65h18v-5h-18z" fill="${R.k}"/><path class="c" d="M4 -64.5h22" fill="none"/>`)}`,
];

const bulut = (x, y, o) => `<path class="i" d="M${x} ${y}h${62 * o}a${12 * o} ${12 * o} 0 0 0-${14 * o}-${14 * o}a${17 * o} ${17 * o} 0 0 0-${30 * o}-${4 * o}a${13 * o} ${13 * o} 0 0 0-${18 * o} ${18 * o}z" fill="${R.y}"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${G} ${Y}" width="${G}" height="${Y}">
<style>
.c{stroke:${R.k};stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.i{stroke:${R.k};stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round}
.bulut{animation:bulut 46s linear infinite}.b2{animation-delay:-15s}.b3{animation-delay:-31s}
.ruzgar{stroke-dasharray:18 70;animation:ruzgar 1.4s linear infinite}.r2{animation-delay:-.5s}.r3{animation-delay:-.9s}
.dron{animation:dron 1.6s ease-in-out infinite alternate}
.pervane{transform-box:fill-box;transform-origin:50% 50%;animation:pervane .18s linear infinite}
.z{opacity:0;animation:z 3.6s ease-out infinite}.z2{animation-delay:1.2s}.z3{animation-delay:2.4s}
.rec,.flas{animation:flas 1.3s linear infinite}.flas2{animation-delay:.65s}
.balon{transform-box:fill-box;transform-origin:80% 100%;animation:balon 3.2s ease-in-out infinite}
.perde2{opacity:0;animation:perde 9s steps(1) infinite}.perde1{animation:perde 9s steps(1) infinite reverse}
.gosterge{animation:flas 2.6s steps(2) infinite}
@keyframes bulut{from{transform:translateX(0)}to{transform:translateX(-1700px)}}
@keyframes ruzgar{to{stroke-dashoffset:-88}}
@keyframes dron{to{transform:translateY(-4px)}}
@keyframes pervane{50%{transform:scaleX(.2)}}
@keyframes z{0%{opacity:0;transform:translate(0,0)}25%{opacity:1}100%{opacity:0;transform:translate(10px,-24px)}}
@keyframes flas{0%,40%{opacity:1}50%,100%{opacity:.15}}
@keyframes balon{0%,60%,100%{transform:scale(1)}70%{transform:scale(1.08)}}
@keyframes perde{0%{opacity:0}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}.z1{opacity:1}.perde2{opacity:0}}
</style>
<defs><clipPath id="ic"><path d="${ic}"/></clipPath><clipPath id="govde"><path d="${govde}"/></clipPath></defs>
<g class="bulut">${bulut(1260, 70, 1.1)}${bulut(1560, 336, 0.8)}</g>
<g class="bulut b2">${bulut(1300, 44, 0.8)}${bulut(1500, 320, 1)}</g>
<g class="bulut b3">${bulut(1240, 92, 0.7)}${bulut(1700, 58, 1)}</g>
<path class="ruzgar" d="M54 196H4" stroke="${R.c}" stroke-width="3" stroke-linecap="round"/><path class="ruzgar r2" d="M70 214H16" stroke="${R.c}" stroke-width="3" stroke-linecap="round"/><path class="ruzgar r3" d="M48 178H10" stroke="${R.c}" stroke-width="3" stroke-linecap="round"/>
<path class="c" d="M330 118C306 116 284 108 266 96L170 20H114L94 138Z" fill="${R.p}"/><path d="M256 100L162 24H150L244 100Z" fill="${R.sa}"/>
<circle class="flas flas2" cx="116" cy="20" r="3.5" fill="${R.y}" stroke="${R.k}" stroke-width="1.2"/>
<path class="c" d="${govde}" fill="${R.y}"/>
<g clip-path="url(#govde)"><rect x="0" y="250" width="${G}" height="6" fill="${R.p}"/><rect x="0" y="256" width="${G}" height="3" fill="${R.sa}"/></g>
<rect class="c" x="306" y="132" width="18" height="62" rx="5" fill="none"/><circle cx="310" cy="164" r="1.6" fill="${R.s}"/>
<path class="c" d="M236 172L128 150L106 152L190 180Z" fill="${R.g}"/>
<g clip-path="url(#ic)">
  ${BOLME.map(([a, b], i) => `<rect x="${a}" y="${UST}" width="${b - a}" height="${ZEMIN - UST}" fill="${DUVAR[i]}"/>${pencereler(i)}${dolaplar(i)}`).join('\n  ')}
  <rect x="340" y="${ZEMIN}" width="820" height="16" fill="${R.c}"/><path class="c" d="M340 ${ZEMIN}H1160" fill="none"/>
  ${icerik.join('\n  ')}
  ${BOLME.slice(1).map(([a]) => `<rect class="c" x="${a - 3}" y="${UST}" width="6" height="${ZEMIN - UST}" fill="${R.p}"/>`).join('')}
</g>
<path class="c" d="${ic}" fill="none"/>
<path class="c" d="${govde}" fill="none"/>
<circle class="flas" cx="760" cy="116" r="4" fill="${R.kr}" stroke="${R.k}" stroke-width="1.2"/>
<path class="c" d="M560 261C600 275 800 275 844 261Z" fill="${R.y}"/>
<path class="c" d="M820 262H592L492 312H562Z" fill="${R.g}"/>
<path class="c" d="M730 264H800L790 276H740Z" fill="${R.g}"/>
<rect class="c" x="700" y="274" width="132" height="34" rx="17" fill="${R.y}"/><rect x="714" y="284" width="80" height="4" fill="${R.p}"/>
<ellipse class="c" cx="830" cy="291" rx="7" ry="16" fill="${R.k}"/><circle cx="831" cy="291" r="3" fill="${R.c}"/>
<path class="c" d="M700 284L686 291L700 298" fill="${R.c}"/>
</svg>
`;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(new URL('../gorseller/kabin.svg', import.meta.url), svg.replace(/\n\s+/g, '\n'));
  console.log('gorseller/kabin.svg', svg.length, 'bayt');
}
