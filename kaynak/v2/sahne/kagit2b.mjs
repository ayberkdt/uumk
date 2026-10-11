/* KÂĞIT 2B — donanım GPU'su yoksa açılış sahnesi Canvas 2D ile: aynı katlama modeli, aynı poz, perspektif izdüşüm,
 * ressam sıralaması, yüzey normaline göre düz gölgeleme ve üçgen başına afin doku eşlemesi. three.js indirilmez. API kagit.mjs ile aynı. */
import { modelKur, parcaKonum, sekilMerkezi, ADIMLAR } from './katlama.mjs';
import { sablonCiz, ZAMAN, pozHesapla, qDondur, kameraAyari } from './kagit-ortak.mjs';

const KAMERA = [0, 0.15, 4.2], FOV = 30;
const ISIK = (() => { const v = [-1.6, 2.4, 3.2], L = Math.hypot(...v); return v.map((x) => x / L); })();

export function kagit2bKur(tuval, { logo } = {}) {
  const g = tuval.getContext('2d');
  const doku = sablonCiz(document.createElement('canvas'), logo);
  const model = modelKur();
  let gen = 0, yuk = 0, dpr = 1, f = 1, ofset = 0, ofsetY = 0, sonP = -1;
  const tmp = [];

  function izdus(w) { const dz = KAMERA[2] - w[2]; return [gen / 2 + ofset + ((w[0] - KAMERA[0]) * f) / dz, yuk / 2 + ofsetY - ((w[1] - KAMERA[1]) * f) / dz, dz]; }
  /* üçgeni doku üçgeniyle eşle: (u,v) → (x,y) afin dönüşüm */
  function ucgenCiz(p, t, golge) {
    const [[x0, y0], [x1, y1], [x2, y2]] = p, [[u0, v0], [u1, v1], [u2, v2]] = t;
    g.save();
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineTo(x2, y2); g.closePath();
    g.clip();
    const d = u0 * (v1 - v2) + u1 * (v2 - v0) + u2 * (v0 - v1);
    if (Math.abs(d) > 1e-9) {
      const a = (x0 * (v1 - v2) + x1 * (v2 - v0) + x2 * (v0 - v1)) / d, b = (y0 * (v1 - v2) + y1 * (v2 - v0) + y2 * (v0 - v1)) / d;
      const c = (x0 * (u2 - u1) + x1 * (u0 - u2) + x2 * (u1 - u0)) / d, e = (y0 * (u2 - u1) + y1 * (u0 - u2) + y2 * (u1 - u0)) / d;
      const tx = (x0 * (u1 * v2 - u2 * v1) + x1 * (u2 * v0 - u0 * v2) + x2 * (u0 * v1 - u1 * v0)) / d;
      const ty = (y0 * (u1 * v2 - u2 * v1) + y1 * (u2 * v0 - u0 * v2) + y2 * (u0 * v1 - u1 * v0)) / d;
      g.setTransform(a, b, c, e, tx, ty);
      g.drawImage(doku, 0, 0);
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (golge > 0) { g.fillStyle = `rgba(15,30,34,${golge.toFixed(3)})`; g.fill(); }
    g.restore();
  }
  function ciz(p) {
    if (p === sonP || !gen) return;
    sonP = p;
    const poz = pozHesapla(p);
    const m = sekilMerkezi(model, poz.adim, poz.ilerleme);
    const ucgenler = [];
    for (const pr of model.parcalar) {
      const v = parcaKonum(pr, poz.adim, poz.ilerleme, tmp).map((q) => {
        const w = qDondur(poz.dondurme, [(q[0] - m[0]) * poz.olcek, (q[1] - m[1]) * poz.olcek, (q[2] - m[2]) * poz.olcek]);
        return [w[0] + poz.konum[0], w[1] + poz.konum[1], w[2] + poz.konum[2]];
      });
      /* parça normali (dünya) */
      const a = v[0], b = v[1], c = v[2];
      const n = [(b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])];
      const L = Math.hypot(...n) || 1;
      const kameraYon = [KAMERA[0] - a[0], KAMERA[1] - a[1], KAMERA[2] - a[2]];
      const onYuz = n[0] * kameraYon[0] + n[1] * kameraYon[1] + n[2] * kameraYon[2] > 0;
      const isik = Math.abs((n[0] * ISIK[0] + n[1] * ISIK[1] + n[2] * ISIK[2]) / L);
      const golge = 0.22 * (1 - isik) + (onYuz ? 0 : 0.04);
      const ekran = v.map(izdus);
      for (let i = 1; i < v.length - 1; i++) {
        const ids = [0, i, i + 1];
        ucgenler.push({
          z: ids.reduce((s, j) => s + ekran[j][2], 0) / 3,
          p: ids.map((j) => ekran[j]), t: ids.map((j) => [(pr.org[j][0] + 0.5) * doku.width, (1 - pr.org[j][1] / Math.SQRT2) * doku.height]),
          onYuz, golge,
        });
      }
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, gen, yuk);
    ucgenler.sort((a, b) => b.z - a.z);
    for (const u of ucgenler) {
      if (u.onYuz) ucgenCiz(u.p, u.t, u.golge);
      else { g.beginPath(); g.moveTo(...u.p[0]); g.lineTo(...u.p[1]); g.lineTo(...u.p[2]); g.closePath(); g.fillStyle = `rgb(${242 - 60 * u.golge | 0},${242 - 60 * u.golge | 0},${238 - 60 * u.golge | 0})`; g.fill(); }
    }
    if (poz.iz.length > 1) {
      g.setLineDash([6 * dpr, 6 * dpr]); g.strokeStyle = 'rgba(5,107,122,0.55)'; g.lineWidth = 1.5 * dpr;
      g.beginPath(); poz.iz.forEach((w, i) => { const [x, y] = izdus(w); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); g.setLineDash([]);
    }
  }
  function boyutla() {
    const r = tuval.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (w === gen && h === yuk) return;
    gen = w; yuk = h; tuval.width = w; tuval.height = h;
    const k = kameraAyari(r.width, r.height);
    f = (h / 2) / Math.tan((k.fov * Math.PI) / 360);
    ofset = w * k.x; ofsetY = h * k.y;
    const p = sonP; sonP = -1; ciz(Math.max(0, p));
  }
  const ro = new ResizeObserver(boyutla); ro.observe(tuval);
  boyutla();
  return { ciz, adimSayisi: ADIMLAR.length, zaman: ZAMAN, dispose() { ro.disconnect(); } };
}
