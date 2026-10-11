/* TARİHÇE ÇİZİMLERİ — zaman çizelgesi kayıtlarının küçük resimleri (viewBox 64×64, kendi gökleri ve zeminleriyle). Üretimde
 * gorseller/semboller.svg'ye <symbol id="tarih-…"> olarak yazılır (istanbul.mjs sembolDosyasi); kartpostallarla aynı çizgi dili. */
const M = '#141414', K = '#f8f8f6', P = '#056b7a', PA = '#dfeaeb', S = '#f2c200', G = '#cfcdc6', PK = '#03525e', R = '#a4262c', Z = '#ecebe7', KO = '#2a2a27';
const c = (s) => s.replace(/\s+/g, ' ').trim();
const ana = `stroke="${M}" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"`;
const ince = `stroke="${M}" stroke-width="0.6" stroke-linejoin="round" stroke-linecap="round"`;
const gunes = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${S}"/><circle cx="${x + 1}" cy="${y - 0.8}" r="${r}" fill="none" ${ince}/>`;
const bulut = (x, y, s = 1) => `<path d="M${x} ${y}h${12 * s}a${2.6 * s} ${2.6 * s} 0 0 0-${3.4 * s}-${3.4 * s}a${3.4 * s} ${3.4 * s} 0 0 0-${6 * s}-0.7a${2.6 * s} ${2.6 * s} 0 0 0-${2.6 * s} 4.1z" fill="${K}" ${ince}/>`;
const kisi = (x, y, renk, s = 1) => `<rect x="${x - 1.6 * s}" y="${y - 5.6 * s}" width="${3.2 * s}" height="${5.6 * s}" rx="${1.3 * s}" fill="${renk}" ${ince}/><circle cx="${x}" cy="${y - 7 * s}" r="${1.3 * s}" fill="${K}" ${ince}/>`;

export const TARIH_IKON = {
  /* 1941 · Makina Fakültesi'nde uçak şubesi: çift kanatlı pervaneli uçak, arkada dişli */
  '1941': c(`<rect width="64" height="64" fill="${PA}"/>${bulut(6, 16, 0.9)}
    <g transform="translate(46 44)"><circle r="14" fill="${G}" ${ince}/>${Array.from({ length: 10 }, (_, i) => `<rect x="-2.2" y="-17" width="4.4" height="5" fill="${G}" ${ince} transform="rotate(${i * 36})"/>`).join('')}<circle r="5" fill="${Z}" ${ince}/></g>
    <g transform="translate(28 30) rotate(-8)"><rect x="-17" y="-9" width="32" height="3" rx="1.2" fill="${P}" ${ince}/><path d="M-10-6V2M7-6V2" ${ince}/>
      <path d="M-20 1L10-1Q15 0 15 2.5Q15 5 10 5.4L-20 4Z" fill="${K}" ${ana}/><path d="M-20 1L-24-6H-21L-15 1Z" fill="${P}" ${ince}/><rect x="-14" y="2" width="28" height="3" rx="1.2" fill="${P}" ${ince}/>
      <path d="M16-5V10" stroke="${M}" stroke-width="1.4"/><circle cx="15.4" cy="2.6" r="1.4" fill="${S}"/><path d="M2 5.4L4 10" ${ince}/><circle cx="4" cy="10.6" r="2" fill="${M}"/><path d="M-6 0.6h5" stroke="${M}" stroke-width="2"/></g>
    <rect y="56" width="64" height="8" fill="${G}"/><path d="M0 56H64" ${ana}/>`),
  /* 1983 · Uçak ve Uzay Bilimleri Fakültesi: fakülte binası, uzay mühendisliği roketi */
  '1983': c(`<rect width="64" height="64" fill="${PA}"/>${gunes(52, 12, 5)}
    <rect x="6" y="26" width="38" height="30" fill="${K}" ${ana}/><path d="M4 26H46L25 16Z" fill="${P}" ${ana}/>
    ${[12, 21, 30, 39].map((x) => `<rect x="${x - 2}" y="30" width="4" height="22" fill="${Z}" ${ince}/>`).join('')}<rect x="22" y="42" width="6" height="14" fill="${KO}" ${ince}/>
    <g transform="translate(54 40)"><path d="M0-22Q5-14 5-2V8H-5V-2Q-5-14 0-22Z" fill="${K}" ${ana}/><circle cx="0" cy="-8" r="2.2" fill="${PA}" ${ince}/><path d="M-5 2L-9 9V12L-5 8ZM5 2L9 9V12L5 8Z" fill="${P}" ${ince}/><path d="M-3 8L0 15 3 8Z" fill="${S}" ${ince}/></g>
    <rect y="56" width="64" height="8" fill="${G}"/><path d="M0 56H64" ${ana}/>`),
  /* 2001 Ekim · Fly-In İstanbul: piste süzülen uçak, karşılama bayrağı */
  '2001-ekim': c(`<rect width="64" height="64" fill="${PA}"/>${gunes(12, 12, 5)}${bulut(36, 14, 0.8)}
    <path d="M0 46H64V64H0Z" fill="${G}"/><path d="M0 46H64" ${ana}/><path d="M22 64L30 46H34L42 64Z" fill="${KO}"/><path d="M32 49V52M32 55V59M32 62V64" stroke="${K}" stroke-width="1.2"/>
    <g transform="translate(40 30) rotate(12)"><path d="M-14-2H8Q14-2 16 1Q14 4 8 4H-12Q-15 4-16 2Z" fill="${K}" ${ana}/><path d="M-12-2L-17-9H-14L-8-2Z" fill="${P}" ${ince}/><path d="M-3 1L-9 8H-6L3 1Z" fill="${P}" ${ince}/><path d="M11.5-0.6h2.4l0.8 1.2h-3.2z" fill="${M}"/>${[-8, -5, -2, 1, 4].map((x) => `<circle cx="${x}" cy="0.6" r="0.5" fill="${P}"/>`).join('')}</g>
    <path d="M24 32q-8 2-16 1" fill="none" stroke="${P}" stroke-width="0.7" stroke-dasharray="1.6 1.6"/>
    <path d="M54 46V32" ${ince}/><path d="M54 32h7l-2 3 2 3h-7z" fill="${S}" ${ince}/>`),
  /* 2003 · İlk EMEAC: kürsü, mikrofon, üç bayrak */
  '2003': c(`<rect width="64" height="64" fill="${Z}"/>
    ${[[14, P], [32, S], [50, R]].map(([x, r]) => `<path d="M${x} 44V10" ${ince}/><path d="M${x} 11h11l-2.4 4 2.4 4h-11z" fill="${r}" ${ince}/>`).join('')}
    <path d="M20 40H44L40 58H24Z" fill="${P}" ${ana}/><rect x="18" y="37" width="28" height="4" rx="1" fill="${K}" ${ana}/><path d="M32 37V30" ${ince}/><rect x="30.6" y="26" width="2.8" height="5" rx="1.4" fill="${M}"/>
    <circle cx="32" cy="48" r="4" fill="${K}" ${ince}/><path d="M32 45.4v5.2M29.4 48h5.2" ${ince}/>
    <rect y="58" width="64" height="6" fill="${G}"/><path d="M0 58H64" ${ana}/>`),
  /* 2012 · ATA İHA Takımı, AIAA DBF: yarış İHA'sı, kupa */
  '2012': c(`<rect width="64" height="64" fill="${PA}"/>${bulut(38, 14, 0.8)}
    <g transform="translate(26 24) rotate(-10)"><rect x="-22" y="-2.4" width="44" height="4.8" rx="2" fill="${K}" ${ana}/><rect x="-22" y="-2.4" width="5" height="4.8" fill="${S}"/><rect x="17" y="-2.4" width="5" height="4.8" fill="${S}"/>
      <path d="M0-12V12" stroke="${M}" stroke-width="3.4" stroke-linecap="round"/><path d="M0-12V12" stroke="${P}" stroke-width="2" stroke-linecap="round"/><path d="M-6 12H6" stroke="${M}" stroke-width="1.6" stroke-linecap="round"/><path d="M-3-13H3" stroke="${M}" stroke-width="1.2"/></g>
    <g transform="translate(46 48)"><path d="M-7-10H7V-6Q7 2 0 3Q-7 2-7-6Z" fill="${S}" ${ana}/><path d="M-7-8H-10Q-10-3-6-2M7-8H10Q10-3 6-2" fill="none" ${ince}/><path d="M-1.6 3V8H1.6V3" fill="${S}" ${ince}/><rect x="-5" y="8" width="10" height="4" fill="${M}"/><text x="0" y="-2.4" text-anchor="middle" font-family="Jost, sans-serif" font-weight="700" font-size="7" fill="${M}">4</text></g>
    <rect y="60" width="64" height="4" fill="${G}"/>`),
  /* 2015 · İTÜ Havacılık Günleri: dumanla ilmek atan iki gösteri uçağı, seyirciler */
  '2015': c(`<rect width="64" height="64" fill="${PA}"/>
    <path d="M6 40C10 14 40 6 44 24S24 40 20 30" fill="none" stroke="${K}" stroke-width="3" stroke-linecap="round"/><path d="M6 40C10 14 40 6 44 24S24 40 20 30" fill="none" stroke="${S}" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="2 2"/>
    <path d="M58 34C52 18 34 16 32 28" fill="none" stroke="${K}" stroke-width="3" stroke-linecap="round"/><path d="M58 34C52 18 34 16 32 28" fill="none" stroke="${P}" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="2 2"/>
    <g transform="translate(20 30) rotate(120)"><path d="M-6-1H4Q7-1 7 0Q7 1 4 1H-6Z" fill="${S}" ${ince}/><path d="M-1-5H1V5H-1Z" fill="${S}" ${ince}/></g>
    <g transform="translate(32 28) rotate(-100)"><path d="M-6-1H4Q7-1 7 0Q7 1 4 1H-6Z" fill="${P}" ${ince}/><path d="M-1-5H1V5H-1Z" fill="${P}" ${ince}/></g>
    <rect y="52" width="64" height="12" fill="${G}"/><path d="M0 52H64" ${ana}/>${kisi(10, 60, P, 0.9)}${kisi(17, 60, S, 0.85)}${kisi(24, 60, K, 0.9)}${kisi(48, 60, R, 0.9)}${kisi(55, 60, P, 0.85)}`),
  /* 2018 · EMEAC 2018 İstanbul: Galata Kulesi, Haliç, kongre yaka kartı */
  '2018': c(`<rect width="64" height="64" fill="${PA}"/>${gunes(52, 12, 5)}
    <path d="M10 50V24L14 14L18 24V50Z" fill="${K}" ${ana}/><path d="M14 8L18 18H10Z" fill="${P}" ${ana}/>${[28, 34, 40].map((y) => `<rect x="12.6" y="${y}" width="2.8" height="3" fill="${M}"/>`).join('')}
    <path d="M0 50H64V64H0Z" fill="${P}"/><path d="M0 50H64" ${ana}/><path d="M6 56h8M30 58h10M48 55h8" stroke="${PA}" stroke-width="1" stroke-linecap="round"/>
    <g transform="translate(40 34) rotate(6)"><path d="M0-16V-8" ${ince}/><rect x="-10" y="-8" width="20" height="24" rx="2" fill="${K}" ${ana}/><rect x="-10" y="-8" width="20" height="6" fill="${P}"/><circle cx="0" cy="3" r="3.4" fill="${G}" ${ince}/><path d="M-6 10H6M-4 13H4" ${ince}/></g>`),
  /* 2019 · Dört Bir Yandan Havacılık paneli: dört konuşmacı, masa, ekran */
  '2019': c(`<rect width="64" height="64" fill="${Z}"/>
    <rect x="12" y="6" width="40" height="20" fill="${K}" ${ana}/><path d="M16 22l8-8 6 5 8-9 10 12" fill="none" stroke="${P}" stroke-width="1.4" stroke-linejoin="round"/>
    ${[[12, P], [25, S], [39, K], [52, R]].map(([x, r]) => kisi(x, 44, r, 1.1)).join('')}
    <rect x="4" y="42" width="56" height="5" rx="1" fill="${P}" ${ana}/><path d="M8 47V58M56 47V58" ${ana}/>${[18, 32, 46].map((x) => `<path d="M${x} 42V38" ${ince}/><circle cx="${x}" cy="37" r="1.2" fill="${M}"/>`).join('')}
    <rect y="58" width="64" height="6" fill="${G}"/><path d="M0 58H64" ${ana}/>`),
  /* 2020 · Masabaşı ve A'dan Z'ye: kulaklık, mikrofon, ses dalgası */
  '2020': c(`<rect width="64" height="64" fill="${PA}"/>
    <path d="M12 34V28a20 20 0 0 1 40 0v6" fill="none" stroke="${M}" stroke-width="3"/><rect x="8" y="32" width="10" height="16" rx="4" fill="${P}" ${ana}/><rect x="46" y="32" width="10" height="16" rx="4" fill="${P}" ${ana}/>
    <rect x="27" y="22" width="10" height="20" rx="5" fill="${K}" ${ana}/><path d="M29 28h6M29 32h6M29 36h6" ${ince}/><path d="M24 36q0 10 8 10t8-10M32 46V54M26 54H38" fill="none" ${ana}/>
    <path d="M4 58h4M10 56v4M14 54v8M18 57v2M46 57v2M50 54v8M54 56v4M58 58h2" stroke="${S}" stroke-width="1.4" stroke-linecap="round"/>`),
};

/* NE YAPIYORUZ çizimleri (64×64, aynı çizgi dili): teknik gezi, seminer, model uçak atölyesi, yazılım eğitimi.
 * semboller.svg'ye <symbol id="is-…"> olarak yazılır. */
export const IS_IKON = {
  /* teknik gezi: hangarda sehpasında jet motoru, baretli üç ziyaretçi, tavanda kiriş */
  gezi: c(`<rect width="64" height="64" fill="${PA}"/>
    <path d="M0 14L32 4L64 14" fill="none" ${ana}/><path d="M0 18L32 8L64 18" fill="none" ${ince}/>${[8, 20, 32, 44, 56].map((x) => `<path d="M${x} ${x < 32 ? 11.5 - (x / 32) * 6 : 5.5 + ((x - 32) / 32) * 6}V${x < 32 ? 16 - (x / 32) * 6 : 10 + ((x - 32) / 32) * 6}" ${ince}/>`).join('')}
    <g transform="translate(25 34)"><rect x="-15" y="-9" width="26" height="18" rx="8" fill="${K}" ${ana}/><ellipse cx="11" cy="0" rx="4" ry="9" fill="${G}" ${ana}/>${[0, 45, 90, 135].map((a) => `<path d="M11 0l${(Math.cos(a / 57.3) * 3.2).toFixed(1)} ${(Math.sin(a / 57.3) * 7.4).toFixed(1)}M11 0l${(-Math.cos(a / 57.3) * 3.2).toFixed(1)} ${(-Math.sin(a / 57.3) * 7.4).toFixed(1)}" ${ince}/>`).join('')}<circle cx="11" cy="0" r="1.6" fill="${M}"/>
      <path d="M-15-4h-4v8h4" fill="${G}" ${ana}/><rect x="-6" y="-9.5" width="4" height="19" fill="${P}" ${ince}/></g>
    <path d="M12 44L16 53M36 44L32 53M10 53H40" fill="none" ${ana}/>
    ${[[46, P], [52, S], [58, K]].map(([x, r]) => kisi(x, 56, r, 1.25) + `<path d="M${x - 2.2} ${56 - 8.6}a2.2 2.2 0 0 1 4.4 0z" fill="${S}" ${ince}/>`).join('')}
    <rect y="56" width="64" height="8" fill="${G}"/><path d="M0 56H64" ${ana}/><path d="M4 60h10M22 60h10M40 60h10" stroke="${S}" stroke-width="1.2"/>`),
  /* seminer: perdede kanat profili ve akım çizgileri, kürsüde konuşmacı, ön sırada dinleyiciler */
  seminer: c(`<rect width="64" height="64" fill="${Z}"/>
    <rect x="8" y="5" width="40" height="25" fill="${K}" ${ana}/><path d="M8 8H48" ${ince}/>
    <path d="M14 21q6-7 18-6q8 1 12 4q-8 3-30 2z" fill="${P}" ${ince}/>${[12, 17, 26].map((y) => `<path d="M10 ${y}q12-3 22-2t14 2" fill="none" stroke="${P}" stroke-width="0.6" opacity="0.7"/>`).join('')}
    <path d="M44 11l3-3" stroke="${R}" stroke-width="1.2"/>
    ${kisi(55, 40, S, 1.3)}<path d="M50 40h11v10h-11z" fill="${PK}" ${ana}/><path d="M53 40l-2-5" ${ince}/><circle cx="51" cy="34.6" r="1" fill="${M}"/>
    ${[6, 15, 24, 33, 42].map((x, i) => `<circle cx="${x}" cy="52" r="3.6" fill="${[K, P, G, S, K][i]}" ${ince}/><path d="M${x - 5} 64q0-8 5-8t5 8z" fill="${[P, K, PK, K, R][i]}" ${ince}/>`).join('')}`),
  /* model uçak atölyesi: tezgâhta balsa model, maket bıçağı ve cetvel; gökte kumandayla uçan model */
  atolye: c(`<rect width="64" height="64" fill="${PA}"/>${bulut(4, 14, 0.8)}
    <g transform="translate(44 15) rotate(-12)"><path d="M-12 0L10-1Q13 0 10 1.4L-12 2z" fill="${K}" ${ana}/><path d="M-3-7h6l1 8h-8z" fill="${S}" ${ince}/><path d="M-3 9h6l1-8h-8z" fill="${S}" ${ince}/><path d="M-12 0l-2-5h3l3 5z" fill="${P}" ${ince}/><path d="M11.4-3v7" ${ince}/></g>
    <path d="M38 22q-6 6-12 10" fill="none" stroke="${M}" stroke-width="0.5" stroke-dasharray="1.5 1.5"/>
    <rect x="18" y="30" width="10" height="7" rx="1.4" fill="${KO}" ${ana}/><path d="M21 30v-4M25 30v-3" ${ince}/><circle cx="21" cy="33.4" r="1" fill="${S}"/><circle cx="25" cy="33.4" r="1" fill="${S}"/>
    <rect x="4" y="42" width="56" height="5" fill="${G}" ${ana}/><path d="M8 47v12M56 47v12" ${ana}/>
    <g transform="translate(22 39)"><path d="M-12 0L12 0L10 2L-12 2z" fill="${K}" ${ince}/><path d="M-4-1L6-1L8 3L-6 3z" fill="${K}" ${ince}/>${[-2, 1, 4].map((x) => `<path d="M${x}-1V3" ${ince}/>`).join('')}</g>
    <path d="M40 41l12-2" stroke="${M}" stroke-width="1.4"/><path d="M40 41l-3 .6" stroke="${S}" stroke-width="1.6"/><rect x="44" y="42.6" width="12" height="1.6" fill="${S}" ${ince}/>
    <rect y="59" width="64" height="5" fill="${G}"/><path d="M0 59H64" ${ana}/>`),
  /* yazılım eğitimi: ekranda ağ örgülü kanat ve renk ölçeği, klavye, kupa */
  yazilim: c(`<rect width="64" height="64" fill="${Z}"/>
    <rect x="6" y="6" width="52" height="34" rx="2" fill="${KO}" ${ana}/><rect x="9" y="9" width="46" height="26" fill="#0f0f0f"/>
    <path d="M13 28L44 15L52 18L22 31z" fill="${P}" stroke="${PA}" stroke-width="0.4"/>${[0.2, 0.4, 0.6, 0.8].map((t) => `<path d="M${13 + 31 * t} ${28 - 13 * t}L${22 + 30 * t} ${31 - 13 * t}" stroke="${PA}" stroke-width="0.4"/>`).join('')}<path d="M17.5 29.5L48 16.5" stroke="${PA}" stroke-width="0.4"/>
    <path d="M38 19L44 15L52 18L46 21z" fill="${S}" opacity="0.8"/><path d="M28 23L38 19L46 21L36 25z" fill="${R}" opacity="0.55"/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="11" y="${11 + i * 3}" width="3" height="3" fill="${[R, S, K, PA, P][i]}"/>`).join('')}
    <path d="M28 40v6h8v-6" fill="${G}" ${ince}/><path d="M22 47h20" ${ana}/>
    <rect x="6" y="50" width="40" height="8" rx="1.4" fill="${K}" ${ana}/>${Array.from({ length: 12 }, (_, i) => `<rect x="${8.4 + i * 3.1}" y="52" width="2.2" height="1.8" fill="${G}"/><rect x="${8.4 + i * 3.1}" y="54.6" width="2.2" height="1.8" fill="${G}"/>`).join('')}
    <path d="M51 49h7v9q0 2-2 2h-3q-2 0-2-2z" fill="${P}" ${ana}/><path d="M58 51q3 0 3 3t-3 3" fill="none" ${ince}/><path d="M53 46q1-2 0-3M56 46q1-2 0-3" ${ince}/>
    <rect y="60" width="64" height="4" fill="${G}"/>`),
};
