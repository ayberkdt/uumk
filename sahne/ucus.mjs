/* UÇUŞ — açılıştaki kâğıt uçak (tuval 2B, kendi 3B izdüşümü). Ayrıntı: notlar/tasarim.md "Modül notları". */
import { RENK } from './renk.mjs';

const ek = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const fark = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const kat = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const ic = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const dis = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const boy = (a) => Math.hypot(a[0], a[1], a[2]);
const birim = (a) => { const l = boy(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const sinir = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/* yerel eksenler: x sağ kanat, y yukarı, z burun. Kanat açıklığı 2. */
const N = [0, 0.03, 1.15], C = [0, 0, -0.95];
const SD = [-1.0, 0.17, -0.95], SA = [1.0, 0.17, -0.95];          /* kanat uçları (dihedral) */
const SK = [-0.42, 0.035, -0.95], SKa = [0.42, 0.035, -0.95];     /* kanattaki kat çizgisi */
const OS = [-0.03, -0.34, -0.95], OA = [0.03, -0.34, -0.95];      /* omurga */
/* kanat ucunda logodaki petrol bant */
const ara = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const BANT_S = [SD, ara(SD, N, 0.24), ara(SK, N, 0.24), SK], BANT_A = [SKa, ara(SKa, N, 0.24), ara(SA, N, 0.24), SA];
const YUZLER = [
  { k: [N, SD, SK], ton: 1, bant: BANT_S }, { k: [N, SK, C], ton: 0.96 }, { k: [N, C, SKa], ton: 0.96 }, { k: [N, SKa, SA], ton: 1, bant: BANT_A },
  { k: [N, C, OS], ton: 0.86 }, { k: [N, OA, C], ton: 0.86 },
];
const KATLAR = [[N, SK], [N, SKa], [N, C]];
const ISIK = birim([-0.35, 0.85, 0.45]);

/* anahtar kareler [p, x, y, z] */
export const GENIS = [
  [0.00, 0.40, 0.55, 0.8], [0.10, 0.50, 0.80, 0.4], [0.21, 0.80, 1.75, -1.0], [0.31, 0.88, 0.55, -2.6],
  [0.40, 0.62, -1.20, -2.4], [0.49, 0.30, -2.15, -1.6], [0.57, 0.12, -1.95, -0.6], [0.65, 0.20, -0.45, 0.4],
  [0.69, 0.40, 0.15, 0.6], [0.73, 0.62, 1.05, 0.6], [0.77, 0.46, 2.05, 0.6], [0.81, 0.26, 1.15, 0.6], [0.85, 0.42, 0.20, 0.7],
  [0.89, 0.62, -0.35, 1.0], [0.945, 0.34, -2.10, 1.4], [1.00, -0.10, -4.60, 1.8],
];
export const DAR = [
  [0.00, 0.30, -2.25, 0.5], [0.12, 0.50, -1.85, 0.1], [0.26, 0.62, -1.35, -1.6], [0.38, 0.15, -2.75, -2.0],
  [0.50, -0.45, -2.95, -0.9], [0.60, -0.62, -2.15, 0.3], [0.70, -0.05, -1.70, 0.6], [0.80, 0.50, -2.30, 0.6],
  [0.90, 0.10, -3.30, 1.0], [1.00, -0.40, -5.60, 1.6],
];

/* adın hâlleri: [giriş, çıkış] pencereleri (p) */
/* takla penceresi */
export const TAKLA = [0.67, 0.87];
/* ardışık: yeni ad eskisi çıkınca girer */
export const PENCERE = [[null, [0.27, 0.35]], [[0.35, 0.44], [0.61, 0.68]], [[0.68, 0.77], null]];

/** yörünge: nokta(q), eksen(q) */
export function yorunge(anahtar) {
  function nokta(q) {
    q = sinir(q);
    let i = 0;
    while (i < anahtar.length - 2 && q > anahtar[i + 1][0]) i++;
    const a = anahtar[i], b = anahtar[i + 1];
    const t = (q - a[0]) / (b[0] - a[0] || 1);
    const p0 = anahtar[Math.max(0, i - 1)], p3 = anahtar[Math.min(anahtar.length - 1, i + 2)];
    const cr = (k) => 0.5 * ((2 * a[k]) + (-p0[k] + b[k]) * t + (2 * p0[k] - 5 * a[k] + 4 * b[k] - p3[k]) * t * t + (-p0[k] + 3 * a[k] - 3 * b[k] + p3[k]) * t * t * t);
    return [cr(1), cr(2), cr(3)];
  }

  /* konum ve eksenler: teğet + (eğrilik + yerçekimi) → yatış ve takla */
  function eksen(q) {
    const e = 0.004;
    const a = nokta(q - e), o = nokta(q), b = nokta(q + e);
    let ileri = fark(b, a);
    const hiz = boy(ileri) / (2 * e);
    ileri = birim(ileri.every((v) => Math.abs(v) < 1e-9) ? [-1, 0, 0] : ileri);
    const ivme = kat(ek(fark(b, kat(o, 2)), a), 1 / (e * e));
    const dik = fark(ivme, kat(ileri, ic(ivme, ileri)));
    const kavis = kat(dik, 1 / Math.max(hiz * hiz, 1e-6));
    /* takla penceresinde sırtüstü olabilir */
    const takla = q > TAKLA[0] && q < TAKLA[1];
    let yukari = ek(kat(kavis, takla ? 1.1 : 0.32), [0, takla ? 0.55 : 0.9, 0]);
    yukari = fark(yukari, kat(ileri, ic(yukari, ileri)));
    yukari = boy(yukari) < 1e-6 ? [0, 1, 0] : birim(yukari);
    return { o, ileri, yukari, sag: birim(dis(yukari, ileri)) };
  }

  return { nokta, eksen };
}

export function ucusKur(tuval, { az = false, metinAlt = null } = {}) {
  const g = tuval.getContext('2d');
  let gen = 0, yuk = 0, dpr = 1, S = 100, hw = 4, anahtar = GENIS, olcek = 0.85, yer = true;
  let p = 0, zaman = 0, gorunur = true, dongu = 0, girisT0 = null, girisVar = !az;
  /* ilk kareler > 40 ms ise gölge ve doku kapanır */
  let hafif = new URLSearchParams(location.search).has('hafif'), kareSay = 0, kareTop = 0, sonKare = 0;
  /* imleç paralaksı (yalnız fare) */
  const fare = { x: 0, y: 0, hx: 0, hy: 0 };
  if (!az && matchMedia('(hover: hover) and (pointer: fine)').matches) addEventListener('pointermove', (e) => { fare.hx = (e.clientX / innerWidth) * 2 - 1; fare.hy = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
  const D = 14;

  function boyutla() {
    dpr = hafif ? 1 : Math.min(2, devicePixelRatio || 1);
    gen = tuval.clientWidth; yuk = tuval.clientHeight;
    tuval.width = Math.round(gen * dpr); tuval.height = Math.round(yuk * dpr);
    S = yuk / 8; hw = gen / (2 * S);
    const dar = gen / yuk < 1.05;
    anahtar = (dar ? DAR : GENIS).map(([q, x, y, z]) => [q, x * hw, y, z]);
    olcek = dar ? Math.min(0.62, hw * 0.3) : Math.min(0.9, 0.55 + hw * 0.05);
    /* dar ekranda yörünge açılış metninin altındaki banda sığar */
    const alt = dar && metinAlt ? metinAlt() : null;
    yer = alt === null || yuk - alt > 40;   /* metin ekranı dolduruyorsa uçak metnin üstüne binmez, çizilmez */
    if (alt !== null) {
      if ((yuk / 2 - alt) / S + 4 < 2.2) olcek *= 0.6;   /* bant çok darsa uçak küçülür */
      const ust = (yuk / 2 - alt) / S - 0.5 - olcek, dip = -4 + olcek * 0.6;
      const ys = DAR.filter((k) => k[2] > -4).map((k) => k[2]), y0 = Math.min(...ys), y1 = Math.max(...ys), bant = ust - dip < 0.6 ? 0 : ust - dip;
      /* ekran uzayında: derinlik düzeltmesi */
      anahtar = anahtar.map(([q, x, y, z]) => [q, x, y > -4 ? (dip + ((y - y0) / (y1 - y0 || 1)) * bant) * (D - z) / D : y, z]);
    }
  }

  /* yörünge yalnız boyut değişince kurulur */
  let yrgOn = null, yrgAnahtar = null;
  const yrg = () => { if (yrgAnahtar !== anahtar) { yrgOn = yorunge(anahtar); yrgAnahtar = anahtar; } return yrgOn; };
  const nokta = (q) => yrg().nokta(q), eksen = (q) => yrg().eksen(q);

  const izdus = (v) => { const s = D / (D - v[2]); return [gen / 2 + v[0] * S * s, yuk / 2 - v[1] * S * s, s]; };

  /* kâğıt dokusu */
  const doku = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d');
    let t = 7; const r = () => ((t = (t * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 140; i++) { x.strokeStyle = `rgba(20, 20, 20, ${0.08 + r() * 0.12})`; x.lineWidth = 0.6; x.beginPath(); const a = r() * Math.PI, l = 3 + r() * 9, px = r() * 96, py = r() * 96; x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
    return g.createPattern(c, 'repeat');
  })();

  /* seyrüsefer ızgarası */
  function izgara() {
    const ara = gen < 700 ? 72 : 96, oy = -(p * 90) % ara, ox = -(p * 30) % ara;
    /* metnin olduğu yerde sönümlenir */
    const dar = gen / yuk < 1.05;
    const egim = (a) => { const r = dar ? g.createLinearGradient(0, yuk * 0.45, 0, yuk * 0.75) : g.createLinearGradient(gen * 0.32, 0, gen * 0.7, 0); r.addColorStop(0, 'rgba(5, 107, 122, 0)'); r.addColorStop(1, `rgba(5, 107, 122, ${a})`); return r; };
    const son = dar ? 1 : 1 - sinir((p - 0.9) / 0.1); if (son <= 0) return;
    g.strokeStyle = egim(0.06 * son); g.lineWidth = 1; g.beginPath();
    for (let x = ox; x <= gen; x += ara) { g.moveTo(Math.round(x) + 0.5, 0); g.lineTo(Math.round(x) + 0.5, yuk); }
    for (let y = oy; y <= yuk; y += ara) { g.moveTo(0, Math.round(y) + 0.5); g.lineTo(gen, Math.round(y) + 0.5); }
    g.stroke();
    g.strokeStyle = egim(0.18 * son); g.beginPath();
    for (let x = ox; x <= gen; x += ara * 2) for (let y = oy; y <= yuk; y += ara * 2) { g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.moveTo(x, y - 4); g.lineTo(x, y + 4); }
    g.stroke();
  }

  function ciz() {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, gen, yuk);
    izgara();
    if (!yer) return;
    const ex = eksen(p);
    /* boşta süzülme: hafif inip kalkma ve yalpa */
    fare.x += (fare.hx - fare.x) * 0.06; fare.y += (fare.hy - fare.y) * 0.06;
    const yalpa = az ? 0 : 0.07 * Math.sin(zaman * 1.15) - fare.x * 0.14;
    const salin = az ? 0 : 0.07 * Math.sin(zaman * 1.6);
    const cy = Math.cos(yalpa), sy = Math.sin(yalpa);
    const yuk2 = ek(kat(ex.yukari, cy), kat(ex.sag, sy)), sag2 = ek(kat(ex.sag, cy), kat(ex.yukari, -sy));
    /* ilk açılış: sağ üstten süzülür */
    let gir = [0, 0, 0];
    if (girisVar) { const u = sinir((zaman - (girisT0 ?? zaman)) / 1.1), k = (1 - u) ** 3; gir = [hw * 0.8 * k, 1.6 * k, -1.2 * k]; if (u >= 1) girisVar = false; }
    const merkez = ek(ex.o, [fare.x * 0.22 + gir[0], salin - fare.y * 0.14 + gir[1], gir[2]]);
    const dunya = (l) => ek(merkez, ek(ek(kat(sag2, l[0] * olcek), kat(yuk2, l[1] * olcek)), kat(ex.ileri, l[2] * olcek)));

    /* uçuş planı: önümüzdeki yol, soluk */
    g.lineWidth = 1.2; g.setLineDash([1, 7]); g.lineCap = 'round';
    for (let i = 0, onceki = null; !hafif && i <= 36; i++) {   /* yavaş çizimde yok */
      const q = p + 0.03 + i * 0.009, k = q <= 1 && izdus(nokta(q));
      if (onceki && k) { g.strokeStyle = `rgba(5, 107, 122, ${(0.3 * (1 - i / 36) * (1 - sinir((p - 0.8) / 0.12))).toFixed(3)})`; g.beginPath(); g.moveTo(onceki[0], onceki[1]); g.lineTo(k[0], k[1]); g.stroke(); }
      onceki = k;
    }
    g.setLineDash([]);
    /* uçuş izi */
    const bas = Math.max(0, p - 0.16), adim = 40;
    if (p - bas > 0.002) {
      let onceki = null;
      g.lineWidth = 1.6; g.setLineDash([5, 6]); g.lineCap = 'round';
      for (let i = 0; i <= adim; i++) {
        const q = bas + ((p - bas) * i) / adim;
        const e = eksen(q);
        const k = izdus(ek(e.o, kat(e.ileri, -0.9 * olcek)));
        if (onceki) {
          g.strokeStyle = `rgba(5, 107, 122, ${(0.75 * (i / adim) ** 1.6 * (1 - sinir((p - 0.96) / 0.04)) * sinir((p - 0.04) / 0.08)).toFixed(3)})`;   /* başta kısa iz kıvrılmasın, çıkışta söner */
          g.beginPath(); g.moveTo(onceki[0], onceki[1]); g.lineTo(k[0], k[1]); g.stroke();
        }
        onceki = k;
      }
      g.setLineDash([]);
    }

    /* gölge */
    const golge = YUZLER.slice(0, 4).map((y) => y.k.map((l) => { const w = dunya(l); return izdus([w[0] + 0.25, w[1] - 0.7, w[2] - 0.2]); }));
    if (!hafif) {   /* bulanıksız sert çokgen olurdu */
    g.save();
    g.filter = 'blur(9px)';
    g.fillStyle = `rgba(20, 20, 20, ${ex.yukari[1] > 0 ? 0.08 : 0.03})`;
    for (const ucgen of golge) { g.beginPath(); ucgen.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); }
    g.restore();
    }

    /* yüzler: arkadan öne */
    const kamera = [0, 0, D];
    const yuzler = YUZLER.map((y) => {
      const w = y.k.map(dunya);
      const n = birim(dis(fark(w[1], w[0]), fark(w[2], w[0])));
      const orta = kat(ek(ek(w[0], w[1]), w[2]), 1 / 3);
      const bakis = birim(fark(kamera, orta));
      const arka = ic(n, bakis) < 0;
      const parlak = (0.6 + 0.4 * Math.abs(ic(n, ISIK))) * y.ton * (arka ? 0.9 : 1);
      return { iz: w.map(izdus), derin: orta[2], parlak, bant: y.bant?.map((l) => izdus(dunya(l))) };
    }).sort((a, b) => a.derin - b.derin);
    const kagit = [251, 251, 248], koyu = [196, 195, 188];
    g.lineJoin = 'round';
    for (const y of yuzler) {
      const t = sinir(y.parlak);
      const r = kagit.map((c, i) => Math.round(koyu[i] + (c - koyu[i]) * t));
      g.fillStyle = `rgb(${r[0]}, ${r[1]}, ${r[2]})`;
      g.strokeStyle = 'rgba(20, 20, 20, 0.28)'; g.lineWidth = 0.8;
      g.beginPath(); y.iz.forEach(([x, yy], i) => (i ? g.lineTo(x, yy) : g.moveTo(x, yy))); g.closePath(); g.fill(); g.stroke();
      if (doku && !hafif) { g.save(); g.globalAlpha = 0.35; g.fillStyle = doku; g.fill(); g.restore(); }
      if (y.bant) {
        const k = 0.55 + 0.45 * t;
        g.fillStyle = `rgb(${Math.round(5 * k + 20 * (1 - k))}, ${Math.round(107 * k + 40 * (1 - k))}, ${Math.round(122 * k + 46 * (1 - k))})`;
        g.beginPath(); y.bant.forEach(([x, yy], i) => (i ? g.lineTo(x, yy) : g.moveTo(x, yy))); g.closePath(); g.fill();
      }
    }
    /* kat çizgileri: ince petrol */
    g.strokeStyle = 'rgba(5, 107, 122, 0.55)'; g.lineWidth = 0.9;
    for (const [a, b] of KATLAR) { const [x1, y1] = izdus(dunya(a)), [x2, y2] = izdus(dunya(b)); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
  }

  function kare(t) {
    if (sonKare && kareSay < 10 && !hafif && t - sonKare < 250) { kareTop += t - sonKare; if (++kareSay === 10 && kareTop / 10 > 40) { hafif = true; document.documentElement.classList.add('hafif'); boyutla(); } }
    sonKare = t;
    zaman = t / 1000;
    if (girisT0 === null) girisT0 = zaman;
    ciz();
    dongu = gorunur && !az ? requestAnimationFrame(kare) : 0;
  }
  boyutla();
  new ResizeObserver(() => { boyutla(); ciz(); }).observe(tuval);
  addEventListener('dil-degisti', () => { boyutla(); ciz(); });
  document.fonts?.ready.then(() => { boyutla(); ciz(); });   /* metin yüksekliği yazı tipi ve dille değişir */
  new IntersectionObserver(([x]) => {
    gorunur = x.isIntersecting;
    if (gorunur && !dongu && !az) dongu = requestAnimationFrame(kare);
  }).observe(tuval);
  ciz();
  return {
    ciz(yeniP) { p = sinir(yeniP); if (p > 0.02) girisVar = false; if (az || !dongu) ciz(); },
    /* sınama: p'deki uçağın ekran konumu ve yatışı */
    olc(q = p) { const e = eksen(q); const [x, y] = izdus(e.o); return { x, y, yatis: Math.atan2(e.sag[1], e.yukari[1]), ters: e.yukari[1] < 0 }; },
    renk: RENK.petrol,
  };
}
