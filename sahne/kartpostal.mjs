/* KARTPOSTAL SAHNELERİ — dönem raporu kartpostallarının ön yüz çizimleri (viewBox 160×120). Üretim zamanında istanbul.mjs sembolDosyasi()
 * bunları gorseller/semboller.svg'ye <symbol id="kart-…"> olarak yazar (sunum öznitelikleriyle; dış dosyada desen/kırpma kimliği yok,
 * taramalar elle kırpılmış çizgiler). Dil: ince iki kademeli çizgi (1,1 dış hat · 0,6 ayrıntı), 45° tarama gölgeleri, kayık baskı güneş,
 * küçük insanlar, sol üstte bagaj etiketi (AS IST · EUROAVIA — iki dilde aynı). Her sahne raporun içeriğinden:
 * hangar (Temmuz 2026: Pegasus teknik gezisi, tişört yarışması) · müze (Mayıs 2026: müze gezisi, model uçak, kutu oyunu) ·
 * kabin (Temmuz 2025: Turkish Technic kabin modifikasyonu ve kabin güvenliği atölyesi) · mangal (Eylül 2024: genel kurul, seçim, kapanış
 * mangalı) · geniş gövde (Ağustos 2024: Turkish Technic hangarları) · Lustrum (2024: Boğaz turu, 65. yıl). */
const M = '#141414', K = '#f8f8f6', P = '#056b7a', PA = '#dfeaeb', S = '#f2c200', G = '#cfcdc6', PK = '#03525e', R = '#a4262c', Z = '#ecebe7', KO = '#2a2a27', GR = '#6a6a66';
const c = (s) => s.replace(/\s+/g, ' ').trim();
const r = (n) => +n.toFixed(1);
const ana = `stroke="${M}" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round"`;
const ince = `stroke="${M}" stroke-width="0.6" stroke-linejoin="round" stroke-linecap="round"`;

/* 45° tarama, dikdörtgene kırpılmış */
function tarama(x, y, w, h, d = 2.6, op = 0.4) {
  let s = '';
  for (let k = -h + d / 2; k < w; k += d) {
    let x1 = x + k, y1 = y + h, x2 = x + k + h, y2 = y;
    if (x1 < x) { y1 -= x - x1; x1 = x; }
    if (x2 > x + w) { y2 += x2 - (x + w); x2 = x + w; }
    if (y1 > y2) s += `M${r(x1)} ${r(y1)}L${r(x2)} ${r(y2)}`;
  }
  return `<path d="${s}" stroke="${M}" stroke-width="0.4" opacity="${op}"/>`;
}
const bulut = (x, y, s = 1) => `<path d="M${x} ${y}h${r(18 * s)}a${r(4 * s)} ${r(4 * s)} 0 0 0-${r(5 * s)}-${r(5 * s)}a${r(5 * s)} ${r(5 * s)} 0 0 0-${r(9 * s)}-1a${r(4 * s)} ${r(4 * s)} 0 0 0-${r(4 * s)} 6z" fill="${K}" ${ince}/>`;
/* kayık baskı güneş: sarı disk, yanında hafif kaymış kontur */
const gunes = (x, y, rr) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${S}"/><circle cx="${x + 1.6}" cy="${y - 1.2}" r="${rr}" fill="none" ${ince}/>`;
const kisi = (x, y, renk, s = 1) => `<rect x="${r(x - 2 * s)}" y="${r(y - 7 * s)}" width="${r(4 * s)}" height="${r(7 * s)}" rx="${r(1.6 * s)}" fill="${renk}" ${ince}/><circle cx="${x}" cy="${r(y - 8.8 * s)}" r="${r(1.6 * s)}" fill="${K}" ${ince}/>`;
/* bagaj etiketi: delik, ip, petrol şerit */
const etiket = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M38 10q6 2 9-5" fill="none" ${ince}/><path d="M0 0h32l6 5v10l-6 5H0z" fill="${K}" ${ana}/><circle cx="33" cy="10" r="1.4" fill="${Z}" ${ince}/><rect x="3" y="3" width="3.4" height="14" fill="${P}"/><text x="9.5" y="10" font-family="Jost, sans-serif" font-weight="700" font-size="6.2" fill="${M}">AS IST</text><text x="9.5" y="16" font-family="Jost, sans-serif" font-weight="600" font-size="3.7" letter-spacing="0.3" fill="${P}">EUROAVIA</text></g>`;
/* yandan yolcu uçağı (burun +x, boy ~64): gövde, pencereler, kanat, motor, kuyruk, iniş takımı */
const jet = (x, y, s, kuyruk = P) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-2 3L-13 13H-8L6 3Z" fill="${G}" ${ince}/>
  <path d="M-24-4L-32-19H-27L-15-4Z" fill="${kuyruk}" ${ince}/><path d="M-29.4-14.5H-25.8" stroke="${S}" stroke-width="1.6"/>
  <path d="M-26-4H20Q30-4 34 2Q30 6 20 6H-24Q-28 6-30 3Z" fill="${K}" ${ince}/>
  <path d="M-24 1L-32 4H-28L-21 1Z" fill="${G}" ${ince}/>
  <path d="M26.5-1.2h4.5l1.6 2.2h-6Z" fill="${M}"/>
  ${Array.from({ length: 14 }, (_, i) => `<circle cx="${-18 + i * 3}" cy="-0.4" r="0.75" fill="${P}"/>`).join('')}
  <path d="M-26 2.6H22" stroke="${P}" stroke-width="0.8"/>
  <path d="M12 6V11M-10 6V11" ${ince}/><circle cx="12" cy="11.6" r="1.6" fill="${M}"/><circle cx="-10" cy="11.6" r="1.6" fill="${M}"/>
  <rect x="-7" y="6.6" width="11" height="4.6" rx="2.3" fill="${K}" ${ince}/><path d="M3 7.2v3.4" ${ince}/>
  <path d="M-4 4L-14 14H-9L4 4Z" fill="${K}" ${ince}/></g>`;

/* kabin koltuğu: arka, baş örtüsü, minder */
const koltuk = (x, y, w, h) => `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="${r(w * 0.22)}" fill="${P}" ${ince}/><rect x="${r(x + w * 0.15)}" y="${r(y + h * 0.06)}" width="${r(w * 0.7)}" height="${r(h * 0.2)}" rx="${r(w * 0.08)}" fill="${K}" ${ince}/><rect x="${r(x - w * 0.06)}" y="${r(y + h * 0.8)}" width="${r(w * 1.12)}" height="${r(h * 0.2)}" rx="${r(w * 0.1)}" fill="${PK}" ${ince}/>`;

/* hangar cephesi: oluklu sac (dış kemer ile kapı kemeri arası düşey ince çizgiler) */
const disY = (x) => { const t = (x - 10) / 140; return 58 - 88 * t * (1 - t); };
const kapiY = (x) => { const t = (x - 28) / 104; return 66 - 60 * t * (1 - t); };
let oluk = '';
for (let x = 13; x < 148; x += 3.4) oluk += `M${r(x)} ${r(disY(x) + 1.2)}V${r(x > 28 && x < 132 ? kapiY(x) - 1 : 103.4)}`;

export const KART_SAHNE = {
  /* Temmuz 2026: Pegasus teknik gezisi — hangar, önden jet, teknisyenler; tişört yarışması — standda tişört */
  hangar: c(`<rect width="160" height="120" fill="${PA}"/>${gunes(136, 20, 8)}${bulut(56, 22, 0.8)}${bulut(108, 34, 0.6)}
    <path d="M10 104V58Q80 14 150 58V104Z" fill="${K}" ${ana}/><path d="${oluk}" stroke="${M}" stroke-width="0.35" opacity="0.45"/>
    <rect x="63" y="38.5" width="34" height="8" rx="1" fill="${S}" ${ince}/><text x="80" y="44.6" text-anchor="middle" font-family="Jost, sans-serif" font-weight="700" font-size="5" letter-spacing="0.8" fill="${M}">HANGAR</text>
    <path d="M28 104V66Q80 36 132 66V104Z" fill="${KO}" ${ana}/>
    ${[46, 63, 80, 97, 114].map((x) => `<path d="M${x} ${r(kapiY(x) + 3)}l-7 20h14z" fill="${S}" opacity="0.1"/><circle cx="${x}" cy="${r(kapiY(x) + 3)}" r="1.1" fill="${S}"/>`).join('')}
    <rect x="78.6" y="56" width="2.8" height="17" rx="0.8" fill="${P}" ${ince}/>
    <path d="M34 85L80 81.5L126 85V87.4L80 86L34 87.4Z" fill="${K}" ${ince}/>
    <circle cx="58" cy="92" r="6" fill="${K}" ${ana}/><circle cx="58" cy="92" r="3.4" fill="${M}"/><path d="M58 89.4v5.2M55.4 92h5.2" stroke="${GR}" stroke-width="0.5"/>
    <circle cx="102" cy="92" r="6" fill="${K}" ${ana}/><circle cx="102" cy="92" r="3.4" fill="${M}"/><path d="M102 89.4v5.2M99.4 92h5.2" stroke="${GR}" stroke-width="0.5"/>
    <circle cx="80" cy="84" r="13" fill="${K}" ${ana}/><path d="M71.5 80q8.5-5.4 17 0l-1.6 2.6q-6.9-3.6-13.8 0z" fill="${M}"/><path d="M80 75.5v4" ${ince}/>
    <path d="M80 97V103.4M71 95.5V103.4M89 95.5V103.4" ${ince}/><rect x="77.6" y="102" width="4.8" height="2.4" rx="1" fill="${M}"/><rect x="68.8" y="102" width="4.4" height="2.4" rx="1" fill="${M}"/><rect x="86.8" y="102" width="4.4" height="2.4" rx="1" fill="${M}"/>
    <rect y="104" width="160" height="16" fill="${G}"/><path d="M0 104H160" ${ana}/>
    <path d="M80 105L42 120M80 105L118 120" stroke="${K}" stroke-width="0.7"/><path d="M80 105V120" stroke="${S}" stroke-width="1.6" stroke-dasharray="3 2.4"/>
    <path d="M21 92V104M16.5 104h9" ${ince}/><path d="M14 84.5l4-3h6l4 3-2 3.2-2-1V95H18v-8.3l-2 1z" fill="${P}" ${ana}/><path d="M19 89.5l5-1.6-1.6 1.6 1.6 1.6z" fill="${S}"/>
    ${kisi(122, 104, S)}${kisi(130, 104, K, 0.9)}<rect x="123.4" y="96" width="3.4" height="4.4" fill="${K}" ${ince}/>
    ${etiket(5, 6, -7)}`),

  /* Mayıs 2026: havacılık müzesi gezisi (sütunlu müze, vitrinde çift kanatlı), model uçak atölyesi (fırlatılan planör), kutu oyunu (zarlar, piyon) */
  muze: c(`<rect width="160" height="120" fill="${Z}"/>${gunes(140, 18, 7)}${bulut(92, 18, 0.75)}
    <rect x="36" y="56" width="108" height="36" fill="${G}" ${ince}/>${tarama(36, 56, 108, 36, 3, 0.3)}
    <path d="M30 50L90 28L150 50Z" fill="${K}" ${ana}/><circle cx="90" cy="42" r="4" fill="${PA}" ${ince}/><path d="M90 38v8M86 42h8" ${ince}/>
    <rect x="34" y="50" width="112" height="6" fill="${K}" ${ana}/><path d="M36 53H144" stroke="${M}" stroke-width="0.4" stroke-dasharray="1.4 1.4"/>
    <rect x="86" y="70" width="8" height="22" fill="${KO}" ${ince}/>
    ${[40, 60, 80, 100, 120, 140].map((x) => `<rect x="${x - 3}" y="56" width="6" height="36" fill="${K}" ${ince}/><path d="M${x - 1} 59V90M${x + 1} 59V90" stroke="${M}" stroke-width="0.35" opacity="0.5"/><rect x="${x - 4}" y="55.4" width="8" height="2" fill="${K}" ${ince}/>`).join('')}
    <rect x="30" y="92" width="120" height="4" fill="${K}" ${ince}/><rect x="26" y="96" width="128" height="4" fill="${K}" ${ince}/><rect x="22" y="100" width="136" height="4" fill="${K}" ${ince}/>
    <rect y="104" width="160" height="16" fill="${G}"/><path d="M0 104H160" ${ana}/>
    <rect x="6" y="90" width="26" height="14" fill="${K}" ${ana}/>${tarama(6, 90, 8, 14, 2.2, 0.35)}
    <g transform="translate(19 81)"><rect x="-13" y="-9" width="26" height="2.4" rx="1" fill="${P}" ${ince}/><path d="M-8-6.6V-1M8-6.6V-1" ${ince}/>
      <path d="M-15-1L9-2.5Q13-2 13 0Q13 2 9 2.5L-15 1Z" fill="${K}" ${ince}/><path d="M-15-1L-18-7H-15.5L-12-1.5Z" fill="${P}" ${ince}/>
      <rect x="-11" y="-1" width="22" height="2.4" rx="1" fill="${P}" ${ince}/><path d="M13.8-5V5" stroke="${M}" stroke-width="1.1"/><circle cx="13.4" cy="0" r="1" fill="${S}"/>
      <path d="M2 2L4 6.6" ${ince}/><circle cx="4" cy="7" r="2" fill="${M}"/></g>
    <path d="M152 92C142 70 128 76 124 60" fill="none" stroke="${P}" stroke-width="0.7" stroke-dasharray="2 2"/>
    <g transform="translate(122 57) rotate(-112)"><path d="M-1-10L1-10L1.6 0L1 10L-1 10L-0.6 0Z" fill="${K}" ${ince}/><path d="M-6 0H7" stroke="${M}" stroke-width="0.9" stroke-linecap="round"/><path d="M-6-3V3" stroke="${M}" stroke-width="0.8" stroke-linecap="round"/></g>
    ${kisi(152, 104, P, 0.95)}<path d="M153.6 97.4l1.6-5" stroke="${M}" stroke-width="0.9" stroke-linecap="round"/>
    <g transform="rotate(-12 128 110)"><rect x="124" y="106" width="8" height="8" rx="1.6" fill="${K}" ${ince}/><circle cx="126.2" cy="108.2" r="0.8" fill="${M}"/><circle cx="129.8" cy="111.8" r="0.8" fill="${M}"/></g>
    <g transform="rotate(10 140 112)"><rect x="136" y="108" width="7" height="7" rx="1.4" fill="${S}" ${ince}/><circle cx="139.5" cy="111.5" r="0.8" fill="${M}"/></g>
    <path d="M114 116h6l-1.2-4.2a2.2 2.2 0 1 0-3.6 0Z" fill="${R}" ${ince}/>
    ${etiket(5, 6, -7)}`),

  /* Temmuz 2025: Turkish Technic ile kabin modifikasyonu ve kabin güvenliği — kabin içi perspektif, oksijen maskeleri, çıkış işareti */
  kabin: c(`<rect width="160" height="120" fill="${K}"/>
    <path d="M0 0H160V18Q80 30 0 18Z" fill="${Z}" ${ince}/>
    <rect x="73" y="21" width="14" height="5.4" rx="1.2" fill="${M}"/><circle cx="77" cy="23.7" r="1" fill="${S}"/><path d="M79.6 23.7h4.4" stroke="${S}" stroke-width="0.9"/>
    <path d="M0 44L64 50V70L0 98Z" fill="${K}" ${ince}/><path d="M160 44L96 50V70L160 98Z" fill="${K}" ${ince}/>
    ${[[8, 62, 3.4, 5], [27, 60, 2.6, 3.9], [42, 58.6, 2, 3], [53, 57.6, 1.5, 2.3]].map(([x, y, a, b]) => `<ellipse cx="${x}" cy="${y}" rx="${a}" ry="${b}" fill="${PA}" ${ince}/><ellipse cx="${160 - x}" cy="${y}" rx="${a}" ry="${b}" fill="${PA}" ${ince}/>`).join('')}
    <path d="M0 18L64 42V50L0 44Z" fill="${Z}" ${ana}/><path d="M160 18L96 42V50L160 44Z" fill="${Z}" ${ana}/>
    ${[18, 36, 50].map((x) => { const yu = 18 + 24 * (x / 64), ya = 44 + 6 * (x / 64); return `<path d="M${x} ${r(yu)}V${r(ya)}M${160 - x} ${r(yu)}V${r(ya)}" ${ince}/>`; }).join('')}
    <rect x="64" y="42" width="32" height="28" fill="${PA}" ${ana}/><rect x="73" y="44.6" width="14" height="5" rx="0.8" fill="${S}" ${ince}/><text x="80" y="48.6" text-anchor="middle" font-family="Jost, sans-serif" font-weight="700" font-size="3.8" letter-spacing="0.4" fill="${M}">EXIT</text>
    <rect x="72" y="52" width="16" height="18" rx="1.4" fill="${K}" ${ince}/><path d="M85 61h-2" ${ince}/>
    <path d="M0 120L64 70H96L160 120Z" fill="${G}" ${ince}/><path d="M54 120L76 70H84L106 120Z" fill="${PK}"/>
    <path d="M59 118L77.4 72M101 118L82.6 72" stroke="${S}" stroke-width="0.8" stroke-dasharray="1.6 2"/>
    ${[[44, 62, 9, 14], [53, 62, 9, 14], [22, 70, 13, 21], [36, 70, 13, 21], [4, 82, 20, 34], [26, 82, 20, 34]].map(([x, y, w, h]) => koltuk(x, y, w, h) + koltuk(160 - x - w, y, w, h)).join('')}
    <path d="M30 32V47M130 32V47" ${ince}/><path d="M27 47h6l-1 4h-4z" fill="${S}" ${ince}/><path d="M127 47h6l-1 4h-4z" fill="${S}" ${ince}/>
    ${kisi(80, 104, S, 1.25)}<rect x="81.6" y="92" width="4" height="5" rx="0.6" fill="${M}"/>
    ${etiket(5, 6, -7)}`),

  /* Eylül 2024: akademik yılın kapanışı — gün batımında kapanış mangalı, genel kurul ve seçim (oy sandığı), süs ışıkları */
  mangal: c(`<rect width="160" height="120" fill="${Z}"/>
    <circle cx="120" cy="92" r="24" fill="${S}"/><circle cx="122" cy="90.6" r="24" fill="none" ${ince}/>
    <path d="M0 92Q30 78 60 88T120 84T160 86V96H0Z" fill="${PA}" ${ince}/><rect y="94" width="160" height="26" fill="${G}"/><path d="M0 94H160" ${ana}/>
    ${[8, 22, 84, 148].map((x) => `<path d="M${x} 104l1.4-3 1.4 3M${x + 6} 112l1.4-3 1.4 3" fill="none" ${ince}/>`).join('')}
    <path d="M0 12Q40 30 80 12Q120 30 160 12" fill="none" stroke="${M}" stroke-width="0.7"/>
    ${[0.12, 0.3, 0.5, 0.7, 0.88].flatMap((t) => [0, 80].map((o) => { const x = o + 80 * t, y = 12 + 4 * t * (1 - t) * 18; return `<path d="M${r(x)} ${r(y)}v1.6" ${ince}/><circle cx="${r(x)}" cy="${r(y + 3.4)}" r="2" fill="${t === 0.5 ? K : S}" ${ince}/>`; })).join('')}
    <path d="M84 60q10-2 14-8t12-6" fill="none" stroke="${P}" stroke-width="0.6" stroke-dasharray="1.6 1.8"/><path d="M110 44l7 3-7 3 1.6-3z" fill="${K}" ${ince}/>
    <path d="M42 56q-5-5 0-10t0-10M54 54q-5-5 0-10t0-10M66 56q-5-5 0-10t0-10" fill="none" stroke="${G}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M30 69Q32 50 52 47L54 51Q38 54 36 69Z" fill="${M}" ${ana}/>
    <path d="M30 70H76Q76 92 53 92Q30 92 30 70Z" fill="${M}" ${ana}/><path d="M28 70H78" ${ana}/>
    ${[[36, 66.6], [36, 63]].map(([x, y], j) => `<path d="M${x - 2} ${y + 1}L${x + 36} ${y - 2}" stroke="${GR}" stroke-width="0.6"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${x + 2 + i * 6.4}" y="${r(y - 2.4 - i * 0.48)}" width="4.4" height="4" rx="1" fill="${[R, S, P, R, S][(i + j) % 5]}" ${ince}/>`).join('')}`).join('')}
    <path d="M40 91L33 108M66 91L73 108M53 92V108" ${ana}/><circle cx="33" cy="108.4" r="2.4" fill="${K}" ${ana}/><circle cx="73" cy="108.4" r="2.4" fill="${K}" ${ana}/>
    ${kisi(90, 110, P, 0.95)}${kisi(97, 110, S, 0.9)}${kisi(104, 110, K, 0.95)}<rect x="98.4" y="97.6" width="2.2" height="3" fill="${R}" ${ince}/>
    <rect x="124" y="86" width="26" height="24" fill="${K}" ${ana}/>${tarama(124, 86, 6, 24, 2.2, 0.35)}<rect x="124" y="94" width="26" height="4" fill="${P}"/><path d="M131 86h12" stroke="${M}" stroke-width="1.6"/>
    <g transform="rotate(-10 137 80)"><rect x="132" y="72" width="10" height="13" fill="${K}" ${ince}/><path d="M134.4 78.4l2 2 3.6-4.6" fill="none" stroke="${P}" stroke-width="1.1" stroke-linecap="round"/></g>
    ${etiket(5, 22, -7)}`),

  /* Ağustos 2024: Turkish Technic hangarı — çatı kafesi, geniş gövde, motor iskelesi, gezen öğrenciler */
  genis: c(`<rect width="160" height="120" fill="${Z}"/>
    <rect width="160" height="16" fill="${PA}"/><path d="M0 4H160M0 15H160" ${ince}/>
    <path d="${Array.from({ length: 21 }, (_, i) => `${i ? 'L' : 'M'}${i * 8} ${i % 2 ? 4 : 15}`).join('')}" fill="none" stroke="${M}" stroke-width="0.5"/>
    ${[20, 56, 104, 140].map((x) => `<path d="M${x} 16v3" ${ince}/><path d="M${x} 20l-8 22h16z" fill="${S}" opacity="0.1"/><circle cx="${x}" cy="20.2" r="1.3" fill="${S}" ${ince}/>`).join('')}
    <rect x="10" y="26" width="140" height="28" fill="${PA}" ${ince}/><path d="${Array.from({ length: 9 }, (_, i) => `M${24 + i * 14} 26V54`).join('')}M10 40H150" stroke="${M}" stroke-width="0.45"/>${tarama(10, 26, 140, 28, 5, 0.18)}
    <rect y="86" width="160" height="34" fill="${G}"/><path d="M0 86H160" ${ana}/>
    <path d="M8 120L52 86M152 120L108 86" stroke="${S}" stroke-width="1.2"/><path d="M80 88V120" stroke="${K}" stroke-width="0.8" stroke-dasharray="3 3"/>
    ${jet(80, 66, 1.9)}
    <path d="M92 98V82H104V98M92 88H104M92 93H104" fill="none" stroke="${P}" stroke-width="1"/>${kisi(98, 82, S, 0.7)}
    ${[18, 25, 32, 39, 46].map((x, i) => kisi(x, 114, [P, K, S, P, K][i], 0.8)).join('')}
    ${kisi(56, 114, R, 0.85)}<path d="M57.8 105V99" ${ince}/><path d="M57.8 99l4 1.4-4 1.4z" fill="${S}" ${ince}/>
    ${etiket(5, 22, -7)}`),

  /* Mayıs 2024: Lustrum — EUROAVIA'nın 65. yılı, gece Boğaz turu: köprü ışıkları, havai fişek, vapurda "65" flaması */
  lustrum: c(`<rect width="160" height="120" fill="${M}"/>
    ${[[52, 8, 0.6], [70, 22, 0.5], [88, 6, 0.8], [104, 30, 0.5], [148, 34, 0.6], [20, 40, 0.5], [60, 40, 0.6], [80, 34, 0.5], [154, 8, 0.7], [112, 12, 0.5]].map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${K}" opacity="0.8"/>`).join('')}
    <circle cx="128" cy="20" r="7" fill="${K}"/><circle cx="131.4" cy="17.8" r="6.2" fill="${M}"/>
    ${[[34, 30, 11, S], [96, 18, 9, K], [64, 26, 6, PA]].map(([x, y, rr, renk]) => Array.from({ length: 12 }, (_, k) => { const a = (k * Math.PI) / 6, b = rr * 0.35; return `<path d="M${r(x + Math.cos(a) * b)} ${r(y + Math.sin(a) * b)}L${r(x + Math.cos(a) * rr)} ${r(y + Math.sin(a) * rr)}" stroke="${renk}" stroke-width="1" stroke-linecap="round"/><circle cx="${r(x + Math.cos(a) * (rr + 2))}" cy="${r(y + Math.sin(a) * (rr + 2))}" r="0.6" fill="${renk}"/>`; }).join('')).join('')}
    <path d="M0 70Q24 60 52 67V84H0Z" fill="${KO}"/><path d="M100 74Q124 62 160 66V84H100Z" fill="${KO}"/>
    ${[[8, 72], [14, 76], [22, 70], [30, 74], [40, 72], [112, 76], [122, 72], [134, 74], [146, 70], [152, 76]].map(([x, y]) => `<rect x="${x}" y="${y}" width="1.4" height="1.4" fill="${S}"/>`).join('')}
    <path d="M40 48V84M120 48V84" stroke="${GR}" stroke-width="2.6"/><path d="M0 74H160" stroke="${GR}" stroke-width="1.4"/>
    <path d="M0 62L40 48Q80 78 120 48L160 62" fill="none" stroke="${K}" stroke-width="0.6"/>
    <path d="${[46, 52, 58, 64, 70, 76, 84, 90, 96, 102, 108, 114].map((x) => { const t = (x - 40) / 80, y = (1 - t) ** 2 * 48 + 2 * t * (1 - t) * 78 + t * t * 48; return `M${x} ${r(y)}V74`; }).join('')}" stroke="${K}" stroke-width="0.35" opacity="0.5"/>
    ${Array.from({ length: 20 }, (_, i) => `<circle cx="${4 + i * 8}" cy="74" r="0.8" fill="${S}"/>`).join('')}
    <rect y="84" width="160" height="36" fill="${PK}"/>
    <path d="${Array.from({ length: 20 }, (_, i) => `M${4 + i * 8} 87v${i % 3 ? 3 : 6}`).join('')}M34 88v10M96 88v8" stroke="${S}" stroke-width="0.9" stroke-dasharray="1.4 1.6" opacity="0.55"/>
    <path d="M8 108q6-3 12 0t12 0M118 104q6-3 12 0t12 0M130 114q6-3 12 0t12 0" fill="none" stroke="${PA}" stroke-width="0.8" stroke-linecap="round"/>
    <path d="M30 98H114L106 110H38Z" fill="${K}" ${ana}/><path d="M33 104H111" stroke="${M}" stroke-width="2"/>
    <rect x="40" y="88" width="62" height="10" fill="${K}" ${ana}/><rect x="50" y="81" width="40" height="7" fill="${K}" ${ana}/>
    ${Array.from({ length: 10 }, (_, i) => `<rect x="${43 + i * 5.8}" y="91" width="3.2" height="3.4" rx="0.6" fill="${S}"/>`).join('')}${Array.from({ length: 6 }, (_, i) => `<rect x="${53 + i * 6}" y="83" width="3" height="2.8" rx="0.6" fill="${S}"/>`).join('')}
    <rect x="66" y="71" width="7" height="10" fill="${K}" ${ince}/><rect x="66" y="73.6" width="7" height="2.4" fill="${P}"/>
    <path d="M96 81V58" stroke="${K}" stroke-width="0.9"/><path d="M96 58H120L116 64L120 70H96Z" fill="${S}"/><text x="107" y="67.6" text-anchor="middle" font-family="Jost, sans-serif" font-weight="700" font-size="9" fill="${M}">65</text>
    ${etiket(5, 6, -7)}`),
};
export const KART_ESLEME = {
  'as-istanbul-temmuz-2026': 'hangar', 'as-istanbul-mayis-2026': 'muze', 'as-istanbul-temmuz-2025': 'kabin',
  'akademik-yil-kapanisi-2024': 'mangal', 'turkish-technic-gezisi-2024': 'genis', 'lustrum-emeac-2024': 'lustrum',
};
