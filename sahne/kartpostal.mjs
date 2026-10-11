/* KARTPOSTAL SAHNELERİ — dönem raporu kartpostallarının ön yüz çizimleri (viewBox 160×120). Üretim zamanında
 * istanbul.mjs pulSembolleri() bunları <symbol id="kart-…"> olarak sayfaya yazar (sunum öznitelikleriyle).
 * Her sahne raporun içeriğinden: hangar (Pegasus), müze ve kutu oyunu, kabin koltukları (Turkish Technic atölyesi),
 * kapanış mangalı ve genel kurul, geniş gövde (Turkish Technic gezisi), Boğaz'da Lustrum (65. yıl). */
const M = '#141414', K = '#f8f8f6', P = '#056b7a', PA = '#dfeaeb', S = '#f2c200', G = '#cfcdc6', PK = '#03525e', R = '#a4262c', Z = '#ecebe7';
const c = (s) => s.replace(/\s+/g, ' ').trim();
const cizgi = `stroke="${M}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"`;

export const KART_SAHNE = {
  /* Temmuz 2026: Pegasus hangarı, tişört yarışması */
  hangar: c(`<rect width="160" height="120" fill="${PA}"/>
    <path d="M6 110V52Q80 6 154 52V110Z" fill="${K}" ${cizgi}/><path d="M24 110V62Q80 28 136 62V110Z" fill="${M}"/>
    <path d="M24 62Q80 28 136 62M24 74H136M24 88H136" stroke="#2a2a27" stroke-width="1"/>
    <path d="M36 92H124" stroke="${K}" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="80" cy="84" r="17" fill="${K}" ${cizgi}/><path d="M70 79Q80 72 90 79" fill="none" stroke="${M}" stroke-width="3"/>
    <rect x="77.5" y="58" width="5" height="12" rx="2" fill="${P}" ${cizgi}/>
    <circle cx="54" cy="97" r="7" fill="${K}" ${cizgi}/><circle cx="106" cy="97" r="7" fill="${K}" ${cizgi}/><circle cx="54" cy="97" r="2.4" fill="${M}"/><circle cx="106" cy="97" r="2.4" fill="${M}"/>
    <path d="M80 101V110M74 110H86" ${cizgi} fill="none"/>
    <path d="M6 110H154" ${cizgi}/>
    <path d="M14 14l7-4 4 3 4-3 7 4-3 6h-3v12H20V20h-3z" fill="${S}" ${cizgi}/><path d="M28 13v4" ${cizgi}/>`),
  /* Mayıs 2026: havacılık müzesi, model uçak, kutu oyunu */
  muze: c(`<rect width="160" height="120" fill="${Z}"/>
    <path d="M18 46L80 18L142 46Z" fill="${K}" ${cizgi}/><rect x="22" y="46" width="116" height="6" fill="${K}" ${cizgi}/>
    <path d="M30 52V100M50 52V100M110 52V100M130 52V100" stroke="${G}" stroke-width="5"/><path d="M14 100H146V108H14Z" fill="${K}" ${cizgi}/>
    <rect x="48" y="62" width="64" height="5" rx="2" fill="${P}" ${cizgi}/><rect x="52" y="78" width="56" height="5" rx="2" fill="${P}" ${cizgi}/>
    <path d="M58 67V78M102 67V78" ${cizgi}/><path d="M60 72H116L126 66V78L116 74H60Z" fill="${K}" ${cizgi}/>
    <circle cx="58" cy="73" r="2.5" fill="${M}"/><path d="M55 64V82" stroke="${M}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M80 83V100M74 100H86" ${cizgi}/>
    <rect x="124" y="84" width="20" height="20" rx="4" fill="${K}" ${cizgi} transform="rotate(-12 134 94)"/>
    <circle cx="129" cy="90" r="1.8" fill="${M}"/><circle cx="135" cy="95" r="1.8" fill="${M}"/><circle cx="140" cy="99" r="1.8" fill="${M}"/>`),
  /* Temmuz 2025: Turkish Technic kabin atölyesi — koltuk sırası, dolaplar, anahtar */
  kabin: c(`<rect width="160" height="120" fill="${PA}"/>
    <path d="M6 30Q80 4 154 30V120H6Z" fill="${K}" ${cizgi}/>
    <path d="M18 34Q80 14 142 34L136 46Q80 30 24 46Z" fill="${G}" ${cizgi}/>
    <ellipse cx="14" cy="64" rx="4" ry="8" fill="${PA}" ${cizgi}/><ellipse cx="146" cy="64" rx="4" ry="8" fill="${PA}" ${cizgi}/>
    ${[34, 80, 126].map((x) => `<rect x="${x - 18}" y="56" width="36" height="44" rx="9" fill="${P}" ${cizgi}/><rect x="${x - 13}" y="56" width="26" height="12" rx="4" fill="${K}" ${cizgi}/><rect x="${x - 20}" y="94" width="40" height="12" rx="5" fill="${PK}" ${cizgi}/>`).join('')}
    <path d="M6 112H154" ${cizgi}/>
    <path d="M118 16a6 6 0 1 0 8 8l14 14 4-4-14-14a6 6 0 0 0-8-8l4 4-2 2-4-4z" fill="${S}" ${cizgi}/>`),
  /* Eylül 2024: akademik yılın kapanışı — kapanış mangalı, genel kurul, süs ışıkları */
  mangal: c(`<rect width="160" height="120" fill="${Z}"/>
    <path d="M6 16Q43 34 80 16Q117 34 154 16" fill="none" stroke="${M}" stroke-width="1.2"/>
    ${[0.2, 0.42, 0.62, 0.84].flatMap((t) => [6 + 74 * t, 80 + 74 * t].map((x) => `<circle cx="${x.toFixed(1)}" cy="${(16 + 2 * (1 - t) * t * 18 + 3.5).toFixed(1)}" r="3" fill="${S}" ${cizgi}/>`)).join('')}
    <path d="M30 66H96Q96 92 63 92Q30 92 30 66Z" fill="${M}" ${cizgi}/><path d="M28 66H98" ${cizgi}/>
    <path d="M44 92L36 110M82 92L90 110M63 92V110" ${cizgi}/><circle cx="36" cy="110" r="2.6" fill="${K}" ${cizgi}/><circle cx="90" cy="110" r="2.6" fill="${K}" ${cizgi}/>
    <path d="M38 62H88" stroke="${R}" stroke-width="4" stroke-linecap="round"/><path d="M44 62H82" stroke="${S}" stroke-width="4" stroke-dasharray="6 5"/>
    <path d="M48 52q-6-6 0-12t0-12M63 50q-6-6 0-12t0-12M78 52q-6-6 0-12t0-12" fill="none" stroke="${G}" stroke-width="2" stroke-linecap="round"/>
    <rect x="112" y="72" width="34" height="34" fill="${K}" ${cizgi}/><path d="M118 72H140" stroke="${M}" stroke-width="3.2"/><path d="M122 70l6-18h12l-4 18" fill="${K}" ${cizgi}/><path d="M126 60l4 4 6-8" fill="none" stroke="${P}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M112 86H146" stroke="${P}" stroke-width="3"/>`),
  /* Ağustos 2024: Turkish Technic hangarı — geniş gövde yandan */
  genis: c(`<rect width="160" height="120" fill="${PA}"/>
    <path d="M0 30L80 10L160 30" fill="none" stroke="${M}" stroke-width="1.4"/><path d="M0 44L80 24L160 44" fill="none" stroke="${G}" stroke-width="1"/>
    <path d="M20 10V104M60 10V104M100 10V104M140 10V104" stroke="${G}" stroke-width="1"/>
    <path d="M14 74Q14 62 30 62H124L142 40H150L146 66Q150 74 140 78H30Q14 80 14 74Z" fill="${K}" ${cizgi}/>
    <path d="M18 70Q20 64 28 64H32V70Z" fill="${M}"/>
    ${Array.from({ length: 13 }, (_, i) => `<rect x="${38 + i * 7}" y="66" width="3.5" height="4" rx="1.5" fill="${P}"/>`).join('')}
    <path d="M60 76L96 92H106L88 76Z" fill="${K}" ${cizgi}/><rect x="70" y="84" width="22" height="8" rx="4" fill="${K}" ${cizgi}/>
    <path d="M146 42L152 40V66L146 66" fill="${P}"/><path d="M34 78V92M110 78V92" ${cizgi}/><circle cx="34" cy="95" r="3.4" fill="${M}"/><circle cx="110" cy="95" r="3.4" fill="${M}"/>
    <path d="M0 104H160" ${cizgi}/><path d="M8 112h20M40 112h20M72 112h20M104 112h20M136 112h20" stroke="${S}" stroke-width="2"/>`),
  /* Mayıs 2024: Lustrum (EUROAVIA'nın 65. yılı) — Boğaz turu, vapur, havai fişek */
  lustrum: c(`<rect width="160" height="120" fill="${M}"/>
    ${[[30, 26, 10], [128, 20, 12], [96, 36, 7]].map(([x, y, r]) => Array.from({ length: 8 }, (_, k) => { const a = (k * Math.PI) / 4; return `<path d="M${(x + Math.cos(a) * r * 0.4).toFixed(1)} ${(y + Math.sin(a) * r * 0.4).toFixed(1)}L${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)}" stroke="${S}" stroke-width="1.6" stroke-linecap="round"/>`; }).join('')).join('')}
    <path d="M0 74H40M120 74H160" stroke="#3a3a37" stroke-width="2"/><path d="M40 74Q80 92 120 74" fill="none" stroke="#6a6a66" stroke-width="1.2"/><path d="M40 50V80M120 50V80" stroke="#6a6a66" stroke-width="3"/><path d="M40 50Q80 90 120 50" fill="none" stroke="#6a6a66" stroke-width="1.2"/>
    <rect y="84" width="160" height="36" fill="${PK}"/><path d="M8 100q6-3 12 0t12 0M60 108q6-3 12 0t12 0M110 98q6-3 12 0t12 0" fill="none" stroke="${PA}" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M34 90H118L110 102H42Z" fill="${M}" stroke="${K}" stroke-width="1.4"/><rect x="44" y="78" width="62" height="12" fill="${K}" stroke="${K}"/><rect x="56" y="68" width="40" height="10" fill="${K}"/>
    ${Array.from({ length: 8 }, (_, i) => `<rect x="${48 + i * 7}" y="81" width="3.5" height="4" fill="${S}"/>`).join('')}
    <rect x="72" y="56" width="8" height="12" fill="${K}"/><rect x="72" y="60" width="8" height="3" fill="${P}"/>
    <path d="M100 68V44" stroke="${K}" stroke-width="1.4"/><path d="M100 44H124L120 50L124 56H100" fill="${S}"/><text x="110" y="54" font-family="Jost, sans-serif" font-weight="700" font-size="9" fill="${M}" text-anchor="middle">65</text>`),
};
export const KART_ESLEME = {
  'as-istanbul-temmuz-2026': 'hangar', 'as-istanbul-mayis-2026': 'muze', 'as-istanbul-temmuz-2025': 'kabin',
  'akademik-yil-kapanisi-2024': 'mangal', 'turkish-technic-gezisi-2024': 'genis', 'lustrum-emeac-2024': 'lustrum',
};
