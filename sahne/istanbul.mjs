/* İSTANBUL — blok blok kurulan panorama (preset). Tarayıcıda çalışmaz: araclar/istanbul-insa.mjs bu modülle SVG'yi üretip
 * index.html'e yazar (JS'siz de görünür; dogrula.mjs sayfadaki çizimin bu çıktıyla birebir aynı olduğunu sınar).
 * Görünüm: Marmara'dan kuzeye bakış — solda tarihî yarımada (Süleymaniye, Yeni Cami), ortada Galata, uzakta Boğaz Köprüsü,
 * önde Kız Kulesi, sağda Üsküdar; önde dalgalar, vapur, martılar. Her yapı bir BLOK; blok PARÇA'lardan oluşur ve açılışta
 * parça parça (gövde → kubbe → minare) yükselir. Renkler sınıflarla gelir (site.css .ist: gündüz, .ist--gece: gece). */

export const W = 1600, H = 480, SU = 396;

/* deterministik rastgele: her üretim aynı çizimi verir */
function rastgele(tohum) { let t = tohum >>> 0; return () => ((t = (t * 1664525 + 1013904223) >>> 0) / 4294967296); }
const f = (n) => String(+n.toFixed(1));
const R = (x, y, w, h, c) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" class="${c}"/>`;
const P = (d, c) => `<path d="${d}" class="${c}"/>`;
const O = (cx, cy, r, c) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" class="${c}"/>`;

/* ── tepeler: x → taban y ── */
const egri = (noktalar) => (x) => {
  for (let i = 0; i < noktalar.length - 1; i++) {
    const [x0, y0] = noktalar[i], [x1, y1] = noktalar[i + 1];
    if (x >= x0 && x <= x1) { const t = (x - x0) / (x1 - x0); const u = t * t * (3 - 2 * t); return y0 + (y1 - y0) * u; }
  }
  return noktalar.at(-1)[1];
};
const YARIMADA = [[-160, 380], [-20, 376], [120, 342], [330, 336], [470, 372], [560, SU]];
const GALATA = [[540, SU], [640, 352], [730, 331], [800, 331], [900, 360], [990, SU]];
const USKUDAR = [[1240, SU], [1330, 366], [1470, 352], [1620, 360], [1780, 356]];
const tepeYolu = (n) => `M${n.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}L${f(n.at(-1)[0])} ${SU + 2}L${f(n[0][0])} ${SU + 2}Z`;
const tepeYumusak = (n) => { const h = egri(n); let d = `M${f(n[0][0])} ${f(n[0][1])}`; for (let x = n[0][0] + 10; x <= n.at(-1)[0]; x += 10) d += `L${f(x)} ${f(h(x))}`; return `${d}L${f(n.at(-1)[0])} ${SU + 2}L${f(n[0][0])} ${SU + 2}Z`; };

/* ── yapı taşları: her biri parça dizisi döndürür (parça = o anda birlikte yükselen şekiller) ── */
function pencereler(x, y, w, h, r, { aralik = 9, kat = 12, pw = 4, ph = 6 } = {}) {
  const s = [], sut = Math.max(1, Math.floor((w - 4) / aralik)), sat = Math.max(1, Math.floor((h - 6) / kat));
  const bx = x + (w - (sut - 1) * aralik - pw) / 2;
  for (let j = 0; j < sat; j++) for (let i = 0; i < sut; i++) {
    const yan = r() < 0.42 ? ` y${1 + Math.floor(r() * 4)}` : '';
    s.push(R(bx + i * aralik, y + 5 + j * kat, pw, ph, `p${yan}`));
  }
  return s.join('');
}

function ev(x, taban, w, h, r) {
  const govde = [R(x, taban - h, w, h + 3, 'g'), pencereler(x, taban - h, w, h - 4, r)];
  if (w >= 26 && h >= 30 && r() < 0.45) govde.push(R(x + 3, taban - h + 5, w - 6, 13, 'g'), pencereler(x + 3, taban - h + 3, w - 6, 13, r, { aralik: 7, pw: 3 }));   /* cumba */
  const t = r(), ust = taban - h;
  const cati = t < 0.5 ? P(`M${f(x - 2)} ${f(ust)}L${f(x + w / 2)} ${f(ust - 7 - w * 0.12)}L${f(x + w + 2)} ${f(ust)}Z`, 'c')
    : t < 0.82 ? P(`M${f(x - 2)} ${f(ust)}L${f(x + 5)} ${f(ust - 7)}H${f(x + w - 5)}L${f(x + w + 2)} ${f(ust)}Z`, 'c')
      : R(x - 1.5, ust - 3, w + 3, 3, 'c');
  return [govde.join(''), cati];
}

function minare(x, taban, boy, serefe, w = 6) {
  const ust = taban - boy, s = [R(x - w / 2, ust, w, boy, 'g')];
  for (let i = 0; i < serefe; i++) { const y = ust + 10 + i * 16; s.push(R(x - w / 2 - 2, y, w + 4, 3, 'g')); }
  s.push(P(`M${f(x - w / 2 - 0.5)} ${f(ust)}L${f(x)} ${f(ust - boy * 0.2)}L${f(x + w / 2 + 0.5)} ${f(ust)}Z`, 'c'), P(`M${f(x)} ${f(ust - boy * 0.2)}v-6`, 'l'));
  return s.join('');
}
const kubbe = (cx, y, rx, ry, c = 'k') => P(`M${f(cx - rx)} ${f(y)}A${f(rx)} ${f(ry)} 0 0 1 ${f(cx + rx)} ${f(y)}Z`, c);
const alem = (x, y, boy) => P(`M${f(x)} ${f(y)}v${f(-boy)}`, 'l') + O(x, y - boy - 2, 1.8, 'l');
const kemerler = (x, y, w, n, h = 7) => { let d = ''; const a = w / n; for (let i = 0; i < n; i++) { const cx = x + a * (i + 0.5); d += `M${f(cx - a * 0.22)} ${f(y + h)}V${f(y + 3)}A${f(a * 0.22)} ${f(a * 0.22)} 0 0 1 ${f(cx + a * 0.22)} ${f(y + 3)}V${f(y + h)}Z`; } return P(d, 'p'); };

/* Süleymaniye: dört minare (iki uzun, üç şerefeli; iki kısa, iki şerefeli), yarım kubbeler, kasnak, ana kubbe */
function suleymaniye(cx, taban) {
  return [
    R(cx - 62, taban - 40, 124, 43, 'g') + kemerler(cx - 58, taban - 30, 116, 9, 10),
    kubbe(cx - 34, taban - 40, 18, 15) + kubbe(cx + 34, taban - 40, 18, 15) + R(cx - 44, taban - 52, 88, 12, 'g'),
    R(cx - 30, taban - 66, 60, 14, 'g') + kemerler(cx - 28, taban - 64, 56, 7, 8),
    kubbe(cx, taban - 66, 34, 30) + alem(cx, taban - 96, 10),
    minare(cx - 84, taban, 118, 3) + minare(cx + 84, taban, 118, 3),
    minare(cx - 116, taban + 6, 84, 2, 5) + minare(cx + 116, taban + 6, 84, 2, 5),
  ];
}
/* Yeni Cami (Eminönü, kıyıda): kademeli kubbeler, iki minare */
function yeniCami(cx, taban) {
  return [
    R(cx - 44, taban - 30, 88, 33, 'g') + kemerler(cx - 40, taban - 22, 80, 7, 9),
    kubbe(cx - 26, taban - 30, 12, 10) + kubbe(cx + 26, taban - 30, 12, 10) + R(cx - 22, taban - 42, 44, 12, 'g'),
    kubbe(cx, taban - 42, 22, 20) + alem(cx, taban - 62, 8),
    minare(cx - 54, taban, 86, 3, 5) + minare(cx + 54, taban, 86, 3, 5),
  ];
}
/* Galata Kulesi: daralan gövde, mazgal pencereler, kemerli seyir katı, konik külah */
function galata(cx, taban) {
  const g = 16, u = 14.5, ust = taban - 118;
  let mazgal = '';
  for (let k = 0; k < 5; k++) mazgal += R(cx - 1.5, taban - 24 - k * 18, 3, 8, 'p');
  return [
    P(`M${f(cx - g)} ${taban + 3}L${f(cx - u)} ${f(ust)}H${f(cx + u)}L${f(cx + g)} ${taban + 3}Z`, 'g') + mazgal + P(`M${f(cx - 15.6)} ${taban - 40}H${f(cx + 15.6)}M${f(cx - 15)} ${taban - 80}H${f(cx + 15)}`, 'l'),
    R(cx - 19, ust - 14, 38, 14, 'g') + kemerler(cx - 17, ust - 13, 34, 5, 10) + R(cx - 21, ust - 2, 42, 3, 'g'),
    P(`M${f(cx - 20)} ${f(ust - 14)}L${f(cx)} ${f(ust - 62)}L${f(cx + 20)} ${f(ust - 14)}Z`, 'c') + alem(cx, ust - 62, 9),
  ];
}
/* Kız Kulesi: kayalık ada, kemerli alt yapı, sekizgen kule, fener, külah, bayrak */
function kizKulesi(cx, taban) {
  return [
    P(`M${f(cx - 66)} ${taban + 12}Q${f(cx - 58)} ${taban - 6} ${f(cx - 40)} ${taban - 4}L${f(cx + 46)} ${taban - 5}Q${f(cx + 62)} ${taban - 2} ${f(cx + 70)} ${taban + 12}Z`, 'kaya'),
    R(cx - 48, taban - 30, 96, 26, 'g') + kemerler(cx - 46, taban - 26, 92, 8, 12) + R(cx - 50, taban - 32, 100, 3, 'g') + R(cx + 26, taban - 44, 16, 12, 'g') + kubbe(cx + 34, taban - 44, 8, 8),
    R(cx - 14, taban - 104, 28, 72, 'g') + R(cx - 3, taban - 96, 6, 10, 'p y2') + R(cx - 3, taban - 74, 6, 10, 'p') + R(cx - 3, taban - 52, 6, 10, 'p y4') + R(cx - 17, taban - 108, 34, 4, 'g'),
    R(cx - 9, taban - 124, 18, 16, 'g') + R(cx - 5, taban - 121, 10, 10, 'fener') + P(`M${f(cx - 12)} ${taban - 124}L${f(cx)} ${taban - 146}L${f(cx + 12)} ${taban - 124}Z`, 'c') + P(`M${f(cx)} ${taban - 146}v-16`, 'l') + P(`M${f(cx)} ${taban - 162}h12l-3 4 3 4h-12z`, 'v'),
  ];
}
/* Boğaz Köprüsü (uzakta): asma köprü, iki kule, ana kablo, askılar; gece tabliyede ışıklar */
function kopru(x0, x1, k0, k1, tabliye, kuleUst) {
  const orta = (k0 + k1) / 2, sarkma = tabliye - 8;
  const kablo = `M${x0} ${tabliye}Q${f((x0 + k0) / 2)} ${f(tabliye - 30)} ${k0} ${kuleUst}Q${f(orta)} ${f(sarkma + (sarkma - kuleUst))} ${k1} ${kuleUst}Q${f((k1 + x1) / 2)} ${f(tabliye - 30)} ${x1} ${tabliye}`;
  let aski = '', isik = '';
  const kab = (x) => { const t = (x - k0) / (k1 - k0); return (1 - t) * (1 - t) * kuleUst + 2 * (1 - t) * t * (sarkma + (sarkma - kuleUst)) + t * t * kuleUst; };
  for (let x = k0 + 9; x < k1 - 4; x += 9) aski += `M${f(x)} ${f(kab(x))}V${tabliye}`;
  for (let x = x0 + 6; x < x1; x += 11) isik += R(x, tabliye - 1, 3, 2, `p y${1 + (Math.round(x) % 4)}`);
  const kule = (x) => R(x - 5, kuleUst, 3, tabliye - kuleUst + 22, 'uk') + R(x + 2, kuleUst, 3, tabliye - kuleUst + 22, 'uk') + R(x - 5, kuleUst + 6, 10, 2.5, 'uk') + R(x - 5, kuleUst + 40, 10, 2.5, 'uk');
  return [
    kule(k0) + kule(k1),
    R(x0, tabliye, x1 - x0, 4, 'uk') + isik,
    P(kablo, 'uc') + P(aski, 'uc ince'),
  ];
}
/* vapur (Şehir Hatları biçimi): gövde, iki güverte, baca */
function vapur() {
  return P('M0 0H132L122 16H10Z', 'vg') + R(14, -14, 104, 14, 'g') + R(28, -25, 76, 11, 'g') + pencereler(14, -18, 104, 12, rastgele(9), { aralik: 8, pw: 4, ph: 4 })
    + R(60, -42, 12, 17, 'g') + R(60, -36, 12, 5, 'v') + R(60, -42, 12, 3, 'c') + P('M0 0H132', 'l') + P('M8 6H124', 'vb');
}
function marti(x, y, s = 1) { return P(`M${f(x - 9 * s)} ${f(y)}q${f(4.5 * s)} ${f(-6 * s)} ${f(9 * s)} 0q${f(4.5 * s)} ${f(-6 * s)} ${f(9 * s)} 0`, 'mk'); }
function bulut(x, y, w) {
  const b = (bx, by, bw, bh) => `<rect x="${f(bx)}" y="${f(by)}" width="${f(bw)}" height="${f(bh)}" rx="${f(bh / 2)}" class="bl"/>`;
  return b(x, y, w, 16) + b(x + w * 0.14, y - 11, w * 0.48, 18) + b(x + w * 0.48, y - 6, w * 0.32, 12);
}
function selvi(x, taban, h) { return P(`M${f(x)} ${f(taban - h)}C${f(x + 6)} ${f(taban - h * 0.6)} ${f(x + 6)} ${f(taban - 4)} ${f(x)} ${f(taban)}C${f(x - 6)} ${f(taban - 4)} ${f(x - 6)} ${f(taban - h * 0.6)} ${f(x)} ${f(taban - h)}Z`, 'a'); }
function dalga(y, dalgaBoy, genlik, ofset) {
  let d = `M${f(-200 - dalgaBoy * 2 + ofset)} ${y}`;
  for (let x = -200 - dalgaBoy * 2 + ofset; x < W + 200 + dalgaBoy * 2; x += dalgaBoy) d += `q${f(dalgaBoy / 4)} ${f(-genlik)} ${f(dalgaBoy / 2)} 0t${f(dalgaBoy / 2)} 0`;
  return d;
}

/* ── preset: sahnenin blokları (sıra = kurulma sırası) ── */
function sahne() {
  const r = rastgele(2001);
  const B = [];   /* { katman, parcalar[] , sinif? } */
  const ekle = (katman, parcalar, sinif = '') => B.push({ katman, parcalar: Array.isArray(parcalar) ? parcalar : [parcalar], sinif });

  /* uzak: Anadolu yakasının sırtları ve uzaktaki şehir, Boğaz'ın uzak suyu */
  ekle('uzak', [P('M930 343Q1090 338 1290 344V396H930Z', 'su2') + P('M1010 352h60M1120 358h44M1060 368h70M1180 350h36', 'ys2')]);
  {
    const sirt = [[1080, 352], [1180, 318], [1300, 306], [1420, 312], [1520, 300], [1620, 310], [1780, 318]];
    let sehir = ''; const h = egri(sirt);
    for (let x = 1150; x < 1760; x += 9 + r() * 12) { const w = 7 + r() * 10, hh = 6 + r() * 16; sehir += R(x, h(x) - hh + 2, w, hh, 'u2'); }
    ekle('uzak', [P(tepeYumusak(sirt), 'u'), sehir]);
    const avrupa = [[-180, 352], [-20, 350], [200, 330], [420, 340], [700, 322], [900, 336], [1000, 344]];
    let s2 = ''; const h2 = egri(avrupa);
    for (let x = -170; x < 990; x += 10 + r() * 14) { const w = 6 + r() * 9, hh = 5 + r() * 12; s2 += R(x, h2(x) - hh + 2, w, hh, 'u2'); }
    ekle('uzak', [P(tepeYumusak(avrupa), 'u'), s2]);
  }
  ekle('uzak', kopru(890, 1300, 960, 1220, 330, 242), 'kopru');

  /* tarihî yarımada */
  ekle('orta', [P(tepeYumusak(YARIMADA), 't')]);
  ekle('orta', suleymaniye(232, 338), 'cami');
  const yh = egri(YARIMADA);
  const evDizisi = (x0, x1, hEk = 0, ust = false) => { for (let x = x0; x < x1;) { const w = 20 + Math.floor(r() * 16), h = 20 + Math.floor(r() * 22) + hEk; const t = Math.max(yh(x), yh(x + w)) + (ust ? -10 : 8); ekle('orta', ev(x, t, w, h, r)); x += w + 2 + Math.floor(r() * 6); } };
  evDizisi(-150, 102, 6, true);
  evDizisi(352, 418, 4, true);
  ekle('orta', [selvi(110, 346, 40) + selvi(124, 346, 32) + selvi(346, 342, 38)]);
  evDizisi(-146, 150);
  evDizisi(300, 418);
  ekle('orta', yeniCami(480, 392), 'cami');

  /* Galata: tepe, iki sıra ev, kule */
  ekle('orta', [P(tepeYumusak(GALATA), 't')]);
  const gh = egri(GALATA);
  const galataEv = (x0, x1, kay, hEk) => { for (let x = x0; x < x1;) { const w = 18 + Math.floor(r() * 14), h = 22 + Math.floor(r() * 20) + hEk; ekle('orta', ev(x, Math.max(gh(x), gh(x + w)) + kay, w, h, r)); x += w + 2 + Math.floor(r() * 4); } };
  galataEv(600, 724, -2, 8);
  galataEv(800, 900, -2, 6);
  ekle('orta', galata(762, 333), 'galata');
  galataEv(566, 980, 14, 0);

  /* Üsküdar: tepe, evler, küçük cami, selviler */
  ekle('orta', [P(tepeYumusak(USKUDAR), 't')]);
  const uh = egri(USKUDAR);
  for (let x = 1300; x < 1760;) { const w = 20 + Math.floor(r() * 14), h = 20 + Math.floor(r() * 18); ekle('orta', ev(x, Math.max(uh(x), uh(x + w)) + 4, w, h, r)); x += w + 3 + Math.floor(r() * 5); if (x > 1420 && x < 1470) x = 1486; }
  ekle('orta', [R(1440 - 24, 358 - 22, 48, 25, 'g') + kemerler(1418, 344, 44, 4, 9), kubbe(1440, 336, 17, 16) + alem(1440, 320, 7), minare(1408, 360, 64, 2, 5) + minare(1472, 360, 64, 2, 5)], 'cami');
  ekle('orta', [selvi(1352, 372, 36) + selvi(1364, 370, 28) + selvi(1580, 364, 34)]);
  for (let x = 1268; x < 1760;) { const w = 18 + Math.floor(r() * 12), h = 16 + Math.floor(r() * 14); ekle('orta', ev(x, Math.max(uh(x), uh(x + w)) + 20, w, h, r)); x += w + 2 + Math.floor(r() * 5); }

  /* ön: su, dalgalar, Kız Kulesi, vapur, kayıklar, martılar */
  ekle('yakin', [R(-200, SU, W + 400, H - SU + 10, 's') + P(`M-200 ${SU}H${W + 200}`, 'kiyi')]);
  ekle('yakin', kizKulesi(1150, 436), 'kiz');
  let yansima = ''; for (let i = 0; i < 5; i++) yansima += R(1150 - 9 + (i % 2) * 5 - i, 452 + i * 6, 14 - i * 2, 2, 'ys');
  ekle('yakin', [yansima]);
  ekle('gok', [bulut(1290, 92, 150) + bulut(1010, 58, 92) + bulut(1470, 172, 96)], 'bulutlar');
  ekle('gok', [O(1120, 168, 54, 'gunes')], 'gunes-k');
  ekle('gok', [marti(1218, 214) + marti(1252, 196, 0.8) + marti(980, 236, 0.9) + marti(1380, 248, 0.7)], 'martilar');
  return B;
}

/* tek tek yapılar (yazı kartlarındaki pullar için): [kimlik, viewBox, parçalar] */
export function simgeler() {
  const r = rastgele(7);
  return [
    ['galata', '718 138 88 198', galata(762, 333)],
    ['kiz', '1078 270 146 182', kizKulesi(1150, 436)],
    ['cami', '100 216 264 132', suleymaniye(232, 338)],
    ['kopru', '880 228 430 128', kopru(890, 1300, 960, 1220, 330, 242)],
    ['vapur', '-6 -48 146 70', [vapur()]],
    ['ev', '0 330 120 70', [ev(4, 392, 30, 40, r), ev(36, 392, 26, 30, r), ev(64, 392, 34, 44, r), ev(100, 392, 18, 24, r)].flat()],
  ];
}

/** SVG metni. tema: 'gun' | 'gece'. Parçalar data-s (blok sırası) ve data-k (blok içi sıra) taşır; site.mjs bunları
 * CSS değişkenine çevirip "inşa" canlandırmasını oynatır. */
export function istanbulSvg({ tema = 'gun', kimlik = 'istanbul', etiket = '' } = {}) {
  const B = sahne();
  const katmanlar = { gok: [], uzak: [], orta: [], yakin: [] };
  B.forEach((b, s) => {
    const parca = b.parcalar.map((p, k) => `<g class="parca" data-k="${k}">${p}</g>`).join('');
    katmanlar[b.katman].push(`<g class="blok${b.sinif ? ' blok--' + b.sinif : ''}" data-s="${s}">${parca}</g>`);
  });
  const dalgalar = [[414, 64, 3.2, 0], [430, 92, 4, 30], [448, 120, 5, 10], [468, 150, 6, 60]]
    .map(([y, l, g, o], i) => `<path class="dalga dalga--${i + 1}" d="${dalga(y, l, g, o)}"/>`).join('');
  const vapurG = `<g class="vapur-yol"><g class="vapur" transform="translate(560 420)">${vapur()}</g></g>`;
  const baslik = etiket ? `<title id="${kimlik}-baslik">${etiket}</title>` : '';
  return `<svg class="ist ist--${tema}" id="${kimlik}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" ${etiket ? `role="img" aria-labelledby="${kimlik}-baslik"` : 'aria-hidden="true"'} focusable="false">${baslik}`
    + `<g class="ist__gok">${katmanlar.gok.join('')}</g><g class="ist__uzak">${katmanlar.uzak.join('')}</g><g class="ist__orta">${katmanlar.orta.join('')}</g>`
    + `<g class="ist__yakin">${katmanlar.yakin.join('')}<g class="ist__dalgalar">${dalgalar}</g>${vapurG}</g></svg>`;
}

/** pul sembolleri: <symbol id="pul-…"> */
const PUL = { g: 'fill="#f8f8f6" stroke="#141414" stroke-width="1.6"', c: 'fill="#056b7a" stroke="#141414" stroke-width="1.6"', k: 'fill="#dfeaeb" stroke="#141414" stroke-width="1.6"',
  p: 'fill="#141414"', l: 'fill="none" stroke="#141414" stroke-width="1.6"', uk: 'fill="#141414"', uc: 'fill="none" stroke="#141414" stroke-width="2"', a: 'fill="#03525e"',
  kaya: 'fill="#b3b3ae" stroke="#141414" stroke-width="1.6"', v: 'fill="#056b7a"', vg: 'fill="#141414"', vb: 'fill="none" stroke="#056b7a" stroke-width="2"', fener: 'fill="#141414"' };
const pulBoya = (s) => s.replace(/class="([^"]+)"/g, (_, c) => PUL[c.split(' ')[0]] || '');
export function pulSembolleri() {
  return `<svg class="pul-kaynak" width="0" height="0" aria-hidden="true" focusable="false"><defs>${simgeler().map(([k, vb, p]) => `<symbol id="pul-${k}" viewBox="${vb}">${pulBoya(p.join(''))}</symbol>`).join('')}</defs></svg>`;
}
