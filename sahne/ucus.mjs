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

const N = [0, 0.03, 1.15], C = [0, 0, -0.95];
const SD = [-1.0, 0.17, -0.95], SA = [1.0, 0.17, -0.95];
const SK = [-0.42, 0.035, -0.95], SKa = [0.42, 0.035, -0.95];
const OS = [-0.03, -0.34, -0.95], OA = [0.03, -0.34, -0.95];
const ara = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const BANT_S = [SD, ara(SD, N, 0.24), ara(SK, N, 0.24), SK], BANT_A = [SKa, ara(SKa, N, 0.24), ara(SA, N, 0.24), SA];
const YUZLER = [
  { k: [N, SD, SK], ton: 1, bant: BANT_S }, { k: [N, SK, C], ton: 0.96 }, { k: [N, C, SKa], ton: 0.96 }, { k: [N, SKa, SA], ton: 1, bant: BANT_A },
  { k: [N, C, OS], ton: 0.86 }, { k: [N, OA, C], ton: 0.86 },
];
const KATLAR = [[N, SK], [N, SKa], [N, C]];
const ISIK = birim([-0.35, 0.85, 0.45]);

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

export const TAKLA = [0.67, 0.87];
export const PENCERE = [[null, [0.27, 0.35]], [[0.35, 0.44], [0.61, 0.68]], [[0.68, 0.77], null]];

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

  function eksen(q) {
    const e = 0.004;
    const a = nokta(q - e), o = nokta(q), b = nokta(q + e);
    let ileri = fark(b, a);
    const hiz = boy(ileri) / (2 * e);
    ileri = birim(ileri.every((v) => Math.abs(v) < 1e-9) ? [-1, 0, 0] : ileri);
    const ivme = kat(ek(fark(b, kat(o, 2)), a), 1 / (e * e));
    const dik = fark(ivme, kat(ileri, ic(ivme, ileri)));
    const kavis = kat(dik, 1 / Math.max(hiz * hiz, 1e-6));
    const takla = q > TAKLA[0] && q < TAKLA[1];
    let yukari = ek(kat(kavis, takla ? 1.1 : 0.32), [0, takla ? 0.55 : 0.9, 0]);
    yukari = fark(yukari, kat(ileri, ic(yukari, ileri)));
    yukari = boy(yukari) < 1e-6 ? [0, 1, 0] : birim(yukari);
    return { o, ileri, yukari, sag: birim(dis(yukari, ileri)) };
  }

  return { nokta, eksen };
}

const KISA = globalThis.matchMedia?.('(max-height: 520px) and (orientation: landscape)') ?? { matches: false };
export function ucusKur(tuval, { az = false, metinAlt = null, sehirUst = null } = {}) {
  const g = tuval.getContext('2d');
  let gen = 0, yuk = 0, dpr = 1, S = 100, hw = 4, anahtar = GENIS, olcek = 0.85, yer = true, sehirY = 0, metinY = 0;
  let p = 0, zaman = 0, gorunur = true, dongu = 0, girisT0 = null, girisVar = !az;
  let hafif = new URLSearchParams(location.search).has('hafif'), sonKare = 0;
  const aralik = [];
  const fare = { x: 0, y: 0, hx: 0, hy: 0 };
  if (!az && matchMedia('(hover: hover) and (pointer: fine)').matches) addEventListener('pointermove', (e) => { fare.hx = (e.clientX / innerWidth) * 2 - 1; fare.hy = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
  const D = 14;

  function boyutla() {
    dpr = hafif ? 1 : Math.min(2, devicePixelRatio || 1);
    gen = tuval.clientWidth; yuk = tuval.clientHeight; sehirY = sehirUst ? sehirUst() : yuk * 0.7;
    tuval.width = Math.round(gen * dpr); tuval.height = Math.round(yuk * dpr);
    S = yuk / 8; hw = gen / (2 * S);
    const dar = gen / yuk < 1.05 || KISA.matches;
    anahtar = (dar ? DAR : GENIS).map(([q, x, y, z]) => [q, x * hw, y, z]);
    olcek = dar ? Math.min(0.62, hw * 0.3) : Math.min(0.9, 0.55 + hw * 0.05);
    const alt = dar && metinAlt ? metinAlt() : null;
    metinY = alt ?? 0;
    yer = alt === null || yuk - alt > 40;
    if (alt !== null) {
      if ((yuk / 2 - alt) / S + 4 < 2.2) olcek *= 0.6;
      const ust = (yuk / 2 - alt) / S - 0.5 - olcek, dip = -4 + olcek * 0.6;
      const ys = DAR.filter((k) => k[2] > -4).map((k) => k[2]), y0 = Math.min(...ys), y1 = Math.max(...ys), bant = ust - dip < 0.6 ? 0 : ust - dip;
      anahtar = anahtar.map(([q, x, y, z]) => [q, x, y > -4 ? (dip + ((y - y0) / (y1 - y0 || 1)) * bant) * (D - z) / D : y, z]);
    }
  }

  let yrgOn = null, yrgAnahtar = null;
  const yrg = () => { if (yrgAnahtar !== anahtar) { yrgOn = yorunge(anahtar); yrgAnahtar = anahtar; } return yrgOn; };
  const nokta = (q) => yrg().nokta(q), eksen = (q) => yrg().eksen(q);

  const izdus = (v) => { const s = D / (D - v[2]); return [gen / 2 + v[0] * S * s, yuk / 2 - v[1] * S * s, s]; };

  const GK = 0.25, golgeT = document.createElement('canvas'), gg = golgeT.getContext('2d');
  function golgeBas(cokgenler, alfa) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const c of cokgenler) for (const [x, y] of c) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    x0 -= 28; y0 -= 28; x1 += 28; y1 += 28;
    const w = Math.ceil((x1 - x0) * GK), h = Math.ceil((y1 - y0) * GK);
    if (!(w > 0 && h > 0) || w > 1200 || h > 1200) return;
    if (golgeT.width < w || golgeT.height < h) { golgeT.width = Math.max(w, golgeT.width); golgeT.height = Math.max(h, golgeT.height); }
    gg.setTransform(1, 0, 0, 1, 0, 0); gg.clearRect(0, 0, w + 1, h + 1);
    gg.filter = 'blur(2.25px)'; gg.fillStyle = `rgba(20, 20, 20, ${alfa})`;
    gg.setTransform(GK, 0, 0, GK, -x0 * GK, -y0 * GK);
    for (const c of cokgenler) { gg.beginPath(); c.forEach(([x, y], i) => (i ? gg.lineTo(x, y) : gg.moveTo(x, y))); gg.closePath(); gg.fill(); }
    gg.filter = 'none';
    g.drawImage(golgeT, 0, 0, w, h, x0, y0, w / GK, h / GK);
  }

  let yayAnahtar = null, yayIz = null, yayPlan = null;
  const yayTablo = (f) => { const n = 600, L = new Float32Array(n + 1); let o = f(0); for (let i = 1; i <= n; i++) { const k = f(i / n); L[i] = L[i - 1] + Math.hypot(k[0] - o[0], k[1] - o[1]); o = k; } return (q) => { const u = sinir(q) * n, i = Math.min(n - 1, Math.floor(u)); return L[i] + (L[i + 1] - L[i]) * (u - i); }; };
  function yaylar() {
    if (yayAnahtar !== anahtar) {
      yayAnahtar = anahtar;
      yayIz = yayTablo((q) => { const e = eksen(q); return izdus(ek(e.o, kat(e.ileri, -0.9 * olcek))); });
      yayPlan = yayTablo((q) => izdus(nokta(q)));
    }
  }

  const doku = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d');
    let t = 7; const r = () => ((t = (t * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 140; i++) { x.strokeStyle = `rgba(20, 20, 20, ${0.08 + r() * 0.12})`; x.lineWidth = 0.6; x.beginPath(); const a = r() * Math.PI, l = 3 + r() * 9, px = r() * 96, py = r() * 96; x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
    return g.createPattern(c, 'repeat');
  })();

  const SURU = [[0.045, 0.18, 0.05, 0.0, 1.25], [0.032, 0.33, 0.04, 2.1, 0.9], [0.058, 0.08, 0.035, 4.0, 0.75]];
  function suru() {
    const dar = gen / yuk < 1.05 || KISA.matches, x0 = dar ? 0 : gen * 0.5, gw = gen - x0 + 120;
    const y0 = dar ? Math.max(sehirY + 14, metinY + 30) : yuk * 0.1, yh = dar ? 46 : yuk * 0.34;
    const t = az ? 20 : zaman;
    (dar ? SURU.slice(0, 2) : SURU).forEach(([v, yp, a, faz, o], i) => {
      const yer = (q) => { const u = (((q * v + faz * 0.17 + p * 0.25) % 1) + 1) % 1; return [x0 - 60 + u * gw, y0 + yh * yp + Math.sin(q * 0.9 + faz) * (dar ? 18 : yuk * a), u]; };
      const [x, y, u] = yer(t), [x2, y2] = yer(t + 0.05), aci = Math.atan2(y2 - y, x2 - x);
      const sol = Math.min(1, u * 8, (1 - u) * 8);
      if (sol <= 0) return;
      g.save(); g.globalAlpha = sol;
      g.setLineDash([3, 5]); g.lineWidth = 1; g.strokeStyle = 'rgba(5, 107, 122, 0.35)'; g.beginPath();
      for (let k = 0; k <= 10; k++) { const [ix, iy] = yer(t - k * 0.9); if (Math.abs(ix - x) > gw * 0.5) break; k ? g.lineTo(ix, iy) : g.moveTo(ix, iy); }
      g.stroke(); g.setLineDash([]);
      g.translate(x, y); g.rotate(aci); g.scale(o * (dar ? 0.8 : 1), o * (dar ? 0.8 : 1));
      g.lineJoin = 'round'; g.lineWidth = 0.9; g.strokeStyle = 'rgba(20, 20, 20, 0.55)';
      g.fillStyle = '#fbfbf8'; g.beginPath(); g.moveTo(14, 0); g.lineTo(-12, -9); g.lineTo(-6, 0); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#d9d8d1'; g.beginPath(); g.moveTo(14, 0); g.lineTo(-6, 0); g.lineTo(-10, 6); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#056b7a'; g.beginPath(); g.moveTo(-12, -9); g.lineTo(-9.4, -7.2); g.lineTo(-5.2, -0.6); g.lineTo(-6, 0); g.closePath(); g.fill();
      g.restore(); void i;
    });
  }

  function ciz() {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, gen, yuk);
    suru();
    if (!yer) return;
    const ex = eksen(p);
    fare.x += (fare.hx - fare.x) * 0.06; fare.y += (fare.hy - fare.y) * 0.06;
    const yalpa = az ? 0 : 0.07 * Math.sin(zaman * 1.15) - fare.x * 0.14;
    const salin = az ? 0 : 0.07 * Math.sin(zaman * 1.6);
    const cy = Math.cos(yalpa), sy = Math.sin(yalpa);
    const yuk2 = ek(kat(ex.yukari, cy), kat(ex.sag, sy)), sag2 = ek(kat(ex.sag, cy), kat(ex.yukari, -sy));
    let gir = [0, 0, 0];
    if (girisVar) { const u = sinir((zaman - (girisT0 ?? zaman)) / 1.1), k = (1 - u) ** 3; gir = [hw * 0.8 * k, 1.6 * k, -1.2 * k]; if (u >= 1) girisVar = false; }
    const merkez = ek(ex.o, [fare.x * 0.22 + gir[0], salin - fare.y * 0.14 + gir[1], gir[2]]);
    const dunya = (l) => ek(merkez, ek(ek(kat(sag2, l[0] * olcek), kat(yuk2, l[1] * olcek)), kat(ex.ileri, l[2] * olcek)));

    yaylar();
    g.lineWidth = 1.2; g.setLineDash([1, 7]); g.lineCap = 'round';
    for (let i = 0, onceki = null; !hafif && i <= 36; i++) {
      const q = p + 0.03 + i * 0.009, k = q <= 1 && izdus(nokta(q));
      if (onceki && k) { g.lineDashOffset = yayPlan(q - 0.009); g.strokeStyle = `rgba(5, 107, 122, ${(0.3 * (1 - i / 36) * (1 - sinir((p - 0.8) / 0.12))).toFixed(3)})`; g.beginPath(); g.moveTo(onceki[0], onceki[1]); g.lineTo(k[0], k[1]); g.stroke(); }
      onceki = k;
    }
    g.setLineDash([]);
    const bas = Math.max(0, p - 0.16), adim = 40;
    if (p - bas > 0.002) {
      let onceki = null;
      g.lineWidth = 1.6; g.setLineDash([5, 6]); g.lineCap = 'round';
      for (let i = 0; i <= adim; i++) {
        const q = bas + ((p - bas) * i) / adim;
        const e = eksen(q);
        const k = izdus(ek(e.o, kat(e.ileri, -0.9 * olcek)));
        if (onceki) {
          g.lineDashOffset = yayIz(bas + ((p - bas) * (i - 1)) / adim);
          g.strokeStyle = `rgba(5, 107, 122, ${(0.75 * (i / adim) ** 1.6 * (1 - sinir((p - 0.96) / 0.04)) * sinir((p - 0.04) / 0.08)).toFixed(3)})`;
          g.beginPath(); g.moveTo(onceki[0], onceki[1]); g.lineTo(k[0], k[1]); g.stroke();
        }
        onceki = k;
      }
      g.setLineDash([]); g.lineDashOffset = 0;
    }
    g.lineDashOffset = 0;

    const golge = YUZLER.slice(0, 4).map((y) => y.k.map((l) => { const w = dunya(l); return izdus([w[0] + 0.25, w[1] - 0.7, w[2] - 0.2]); }));
    golgeBas(golge, ex.yukari[1] > 0 ? 0.08 : 0.03);

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
    g.strokeStyle = 'rgba(5, 107, 122, 0.55)'; g.lineWidth = 0.9;
    for (const [a, b] of KATLAR) { const [x1, y1] = izdus(dunya(a)), [x2, y2] = izdus(dunya(b)); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
  }

  function kare(t) {
    zaman = t / 1000;
    if (girisT0 === null) girisT0 = zaman;
    ciz();
    if (!hafif && aralik.length < 30 && sonKare && zaman - girisT0 > 1.5 && document.visibilityState === 'visible') {
      aralik.push(t - sonKare);
      if (aralik.length === 30 && aralik.sort((a, b) => a - b)[15] > 30) { hafif = true; document.documentElement.classList.add('hafif'); boyutla(); }
    }
    sonKare = t;
    dongu = gorunur && !az ? requestAnimationFrame(kare) : 0;
  }
  boyutla();
  new ResizeObserver(() => { boyutla(); ciz(); }).observe(tuval);
  addEventListener('dil-degisti', () => { boyutla(); ciz(); });
  document.fonts?.ready.then(() => { boyutla(); ciz(); });
  new IntersectionObserver(([x]) => {
    gorunur = x.isIntersecting; sonKare = 0;
    if (gorunur && !dongu && !az) dongu = requestAnimationFrame(kare);
  }).observe(tuval);
  ciz();
  return {
    ciz(yeniP) { p = sinir(yeniP); if (p > 0.02) girisVar = false; if (az || !dongu) ciz(); },
    olc(q = p) { const e = eksen(q); const [x, y] = izdus(e.o); return { x, y, yatis: Math.atan2(e.sag[1], e.yukari[1]), ters: e.yukari[1] < 0 }; },
    renk: RENK.petrol,
  };
}
