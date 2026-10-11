/* KÂĞIT ORTAK — açılış sahnesinin three'siz parçaları: zaman çizelgesi, poz (konum, dönme, ölçek, uçuş izi), şablon dokusu.
 * three sürümü (kagit.mjs) ve 2B yedek (kagit2b.mjs) aynı pozu kullanır. Kuaterniyonlar [x, y, z, w]. */
import { BOY, ADIMLAR } from './katlama.mjs';

/** İlerleme p'nin bölümleri. Adım başlıkları (HTML'de data-adim) baslik sınırlarıyla eşlenir. */
export const ZAMAN = {
  adimlar: [[0.10, 0.26], [0.26, 0.42], [0.42, 0.56], [0.56, 0.70]],   // ADIMLAR sırası
  donus: [0.40, 0.76],                                                   // kâğıt duruşundan uçuş duruşuna
  ucus: [0.78, 1.0],                                                     // kalkış ve çıkış
  baslik: [0, 0.18, 0.34, 0.49, 0.72],                                   // 5 başlığın başladığı p
};
export const yumusak = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const kes = (p, [a, b]) => Math.min(1, Math.max(0, (p - a) / (b - a)));
export const baslikNo = (p) => ZAMAN.baslik.reduce((n, s, i) => (p >= s ? i : n), 0);

/* ── kuaterniyon ── */
const qCarp = (a, b) => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];
const qEksen = (x, y, z, aci) => { const s = Math.sin(aci / 2); return [x * s, y * s, z * s, Math.cos(aci / 2)]; };
function qMatris(m) {   // m: sütunlar [X, Y, Z] (dünyadaki görüntüleri)
  const [[a, d, g], [b, e, h], [c, f, i]] = m;   // m[0] = X sütunu = (a, d, g)…  satır-sütun düzenine çevrilir
  const m00 = a, m10 = d, m20 = g, m01 = b, m11 = e, m21 = h, m02 = c, m12 = f, m22 = i;
  const iz = m00 + m11 + m22;
  if (iz > 0) { const s = 0.5 / Math.sqrt(iz + 1); return [(m21 - m12) * s, (m02 - m20) * s, (m10 - m01) * s, 0.25 / s]; }
  if (m00 > m11 && m00 > m22) { const s = 2 * Math.sqrt(1 + m00 - m11 - m22); return [0.25 * s, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s]; }
  if (m11 > m22) { const s = 2 * Math.sqrt(1 + m11 - m00 - m22); return [(m01 + m10) / s, 0.25 * s, (m12 + m21) / s, (m02 - m20) / s]; }
  const s = 2 * Math.sqrt(1 + m22 - m00 - m11); return [(m02 + m20) / s, (m12 + m21) / s, 0.25 * s, (m10 - m01) / s];
}
function qSlerp(a, b, t) {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  const b2 = d < 0 ? b.map((x) => -x) : b; d = Math.abs(d);
  if (d > 0.9995) { const r = a.map((x, i) => x + (b2[i] - x) * t); const L = Math.hypot(...r); return r.map((x) => x / L); }
  const th = Math.acos(d), s = Math.sin(th);
  return a.map((x, i) => (Math.sin((1 - t) * th) * x + Math.sin(t * th) * b2[i]) / s);
}
export const qDondur = (q, v) => {   // v'yi q ile döndür
  const p = qCarp(qCarp(q, [v[0], v[1], v[2], 0]), [-q[0], -q[1], -q[2], q[3]]);
  return [p[0], p[1], p[2]];
};

/* kâğıt duruşu: burun yukarı, izleyiciye hafif yatık */
const KAGIT = qCarp(qEksen(0, 0, 1, 0.06), qCarp(qEksen(0, 1, 0, 0.22), qEksen(1, 0, 0, -0.3)));
/* uçuş duruşu: model Y (burun) → dünya +X, model X (omurgadan kanada) → dünya +Y, model Z → dünya −Z; sonra üstten 3/4 bakış */
const UCUS_TEMEL = qMatris([[0, 1, 0], [1, 0, 0], [0, 0, -1]]);
const UCUS = qCarp(qEksen(1, 0, 0, 0.42), qCarp(qEksen(0, 1, 0, 0.5), UCUS_TEMEL));

/** Uçuş yolu (dünya): kalkış noktası → sağ üst, hafif kavis */
const yol = (t) => [0.15 + 3.6 * t * t + 0.6 * t, 0.2 * t + 1.6 * t * t, -1.2 * t * t];

/**
 * p → { adim, ilerleme, konum, dondurme, olcek, iz }
 * adim/ilerleme: katlama.parcaKonum'a verilecek (son adım tamamlanınca adim = 3, ilerleme = 1)
 */
export function pozHesapla(p) {
  let adim = 0, ilerleme = 0;
  ZAMAN.adimlar.forEach(([a, b], i) => { if (p >= a) { adim = i; ilerleme = yumusak(kes(p, [a, b])); } });
  const td = yumusak(kes(p, ZAMAN.donus));
  let dondurme = qSlerp(KAGIT, UCUS, td);
  const tu = kes(p, ZAMAN.ucus), tuy = yumusak(tu);
  let konum = [0, -0.05 * td, 0], olcek = 1 - 0.12 * td;
  const iz = [];
  if (tu > 0) {
    /* yatış: dönüşte kanat hafif sallanır */
    dondurme = qCarp(qEksen(1, 0, 0, 0.18 * Math.sin(tu * Math.PI * 1.5)), dondurme);
    const y = yol(tuy);
    konum = [y[0], y[1] - 0.05, y[2]];
    olcek *= 1 - 0.35 * tuy;
    /* iz: burnun geçtiği yerler (kalkıştan bu yana) */
    const burun = (t) => { const yy = yol(t); const b = qDondur(UCUS, [0, (BOY / 2) * (1 - 0.12) * (1 - 0.35 * t), 0]); return [yy[0] + b[0], yy[1] - 0.05 + b[1], yy[2] + b[2]]; };
    const N = 40;
    for (let i = 0; i <= N; i++) iz.push(burun((tuy * i) / N));
  }
  return { adim, ilerleme, konum, dondurme, olcek, iz };
}

/* ── şablon dokusu: kâğıt uçak şablonu gibi basılı ön yüz ── */
export const KIRISIK_CIZGILERI = (() => {
  /* özgün kâğıt koordinatlarında: 1. adım köşegenleri, 2. adım çizgileri, orta çizgi, kanat çizgileri */
  const t22 = Math.tan((22.5 * Math.PI) / 180);
  return [
    { no: 1, ab: [[0, BOY], [-0.5, BOY - 0.5]] }, { no: 1, ab: [[0, BOY], [0.5, BOY - 0.5]] },
    { no: 2, ab: [[0, BOY], [-0.5, BOY - 0.5 / t22]] }, { no: 2, ab: [[0, BOY], [0.5, BOY - 0.5 / t22]] },
    { no: 3, ab: [[0, 0], [0, BOY]] },
    { no: 4, ab: [[0, BOY], [-0.12, 0]] }, { no: 4, ab: [[0, BOY], [0.12, 0]] },
  ];
})();

/**
 * @param tuval  <canvas> (boyutlandırılır)
 * @param logo   yüklenmiş <img> ya da null
 * @param metin  { ad, alt, ag } — sayfadaki dilde
 */
export function sablonCiz(tuval, logo, metin = { ad: 'İTÜ Uçak Uzay Mühendisliği Kulübü', alt: 'EUROAVIA · AS Istanbul', not: 'Kâğıt uçak şablonu' }) {
  const G = 1024, Y = Math.round(G * BOY);
  tuval.width = G; tuval.height = Y;
  const g = tuval.getContext('2d');
  const X = (x) => (x + 0.5) * G, Yp = (y) => (1 - y / BOY) * Y;
  g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, G, Y);
  /* lif dokusu: çok hafif rastgele benek (tohumlu) */
  let s = 2412;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(15,30,34,${0.012 + 0.02 * r()})`; g.fillRect(r() * G, r() * Y, 1 + r() * 2, 1); }
  /* kesikli kırışık çizgileri ve adım numaraları */
  g.setLineDash([14, 12]); g.lineWidth = 3; g.strokeStyle = 'rgba(7,104,117,0.42)';
  for (const c of KIRISIK_CIZGILERI) { g.beginPath(); g.moveTo(X(c.ab[0][0]), Yp(c.ab[0][1])); g.lineTo(X(c.ab[1][0]), Yp(c.ab[1][1])); g.stroke(); }
  g.setLineDash([]);
  const yazi = (s, x, y, punto, renk = '#0f1e22', agirlik = 600, aile = '"Instrument Sans Variable", "Instrument Sans", system-ui, sans-serif', hiza = 'center') => {
    g.fillStyle = renk; g.font = `${agirlik} ${punto}px ${aile}`; g.textAlign = hiza; g.textBaseline = 'middle'; g.fillText(s, x, y);
  };
  for (const c of KIRISIK_CIZGILERI.filter((c, i, d) => d.findIndex((x) => x.no === c.no) === i)) {
    const t = c.no === 3 ? 0.5 : 0.62, x = X(c.ab[0][0] + (c.ab[1][0] - c.ab[0][0]) * t) + (c.no === 3 ? 26 : -26), y = Yp(c.ab[0][1] + (c.ab[1][1] - c.ab[0][1]) * t);
    g.beginPath(); g.arc(x, y, 18, 0, Math.PI * 2); g.fillStyle = '#fbfbf8'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = 'rgba(7,104,117,0.7)'; g.stroke();
    yazi(String(c.no), x, y + 1, 20, '#076875', 650);
  }
  /* kimlik: alt yarıda (katlanınca gövdenin iki yanına düşer) */
  const ly = Yp(0.5);
  if (logo && logo.naturalWidth) {
    const w = 360, h = (w * logo.naturalHeight) / logo.naturalWidth;
    g.drawImage(logo, G / 2 - w / 2, ly - h / 2 - 40, w, h);
  } else yazi('UUMK', G / 2, ly - 40, 120, '#076875', 700);
  yazi(metin.ad, G / 2, ly + 90, 36, '#0f1e22', 600);
  yazi(metin.alt, G / 2, ly + 140, 30, '#4e5f63', 500);
  yazi(metin.not, G - 40, Y - 40, 24, '#4e5f63', 500, undefined, 'right');
  return tuval;
}
void ADIMLAR;

/** Kamera ayarı (three ve 2B aynı): geniş ekranda sahne sağ yarıda (metin solda), dar ekranda kâğıt genişliğin ~%70'i ve metnin altında.
 *  Döner: düşey görüş açısı (derece), yatay ve düşey kaydırma (tuval boyunun kesri; artı → sahne sağa / aşağı). */
export function kameraAyari(w, h) {
  const oran = w / h;
  if (oran > 1.2 && w > 760) return { fov: Math.max(27, (2 * Math.atan(Math.tan((15 * Math.PI) / 180) / oran) * 180) / Math.PI), x: 0.22, y: 0 };
  if (oran < 1) return { fov: (2 * Math.atan(0.2 / oran) * 180) / Math.PI, x: 0, y: 0.13 };
  return { fov: Math.max(30, (2 * Math.atan(Math.tan((16 * Math.PI) / 180) / oran) * 180) / Math.PI), x: 0, y: 0.08 };
}
