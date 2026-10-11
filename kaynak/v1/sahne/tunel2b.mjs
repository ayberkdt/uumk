/* TÜNEL 2B — donanım GPU'su yoksa (gpu.mjs) aynı akım verisini yandan görünüşle çizer. three.js indirilmez.
 * Taban çizgiler bir kez ekran dışı tuvale çizilir; her karede yalnız darbeler (aynı t → aynı faz) eklenir. */
import { RENK } from './renk.mjs';

const DONEM = 0.5, DONEM_SN = 1.6;
const X0 = -0.75, X1 = 1.95, YA = 0.62;          // görünen pencere (veter birimi)

function karisim(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(',')})`;
}
const hizRengi = (v) => (v < 1 ? karisim(RENK.akimYavas, RENK.akimSerbest, Math.min(1, Math.max(0, (v - 0.4) / 0.6)))
  : karisim(RENK.akimSerbest, RENK.akimHizli, Math.min(1, (v - 1) / 0.6)));

export function tunel2bKur(tuval, { az = false } = {}) {
  const g = tuval.getContext('2d');
  const taban = document.createElement('canvas');
  let veri = null, gen = 0, yuk = 0, dpr = 1, olcek = 1, ox = 0, oy = 0;
  const ekran = (x, y) => [ox + (x - X0) * olcek, oy - y * olcek];

  function tabanCiz() {
    taban.width = tuval.width; taban.height = tuval.height;
    const t = taban.getContext('2d');
    t.clearRect(0, 0, taban.width, taban.height);
    if (!veri) return;
    t.lineWidth = 1 * dpr; t.globalAlpha = 0.16;
    for (const c of veri.cizgiler) {
      t.beginPath();
      for (let i = 0; i < c.length; i += 4) { const [x, y] = ekran(c[i], c[i + 1]); i ? t.lineTo(x, y) : t.moveTo(x, y); }
      t.strokeStyle = RENK.akimSerbest; t.stroke();
    }
    t.globalAlpha = 1; t.beginPath();
    for (let i = 0; i < veri.kanat.length; i += 2) { const [x, y] = ekran(veri.kanat[i], veri.kanat[i + 1]); i ? t.lineTo(x, y) : t.moveTo(x, y); }
    t.closePath(); t.fillStyle = RENK.kanat; t.fill();
  }
  function boyutla() {
    const r = tuval.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (w === gen && h === yuk) return;
    gen = w; yuk = h; tuval.width = w; tuval.height = h;
    olcek = Math.min(w / (X1 - X0), h / (2 * YA));
    ox = (w - (X1 - X0) * olcek) / 2; oy = h / 2;
    tabanCiz(); istek();
  }
  let zaman = 0.62, son = 0, bekliyor = false, gorunur = true, oynuyor = !az;
  function kare(t) {
    bekliyor = false;
    const dt = son ? Math.min(0.05, (t - son) / 1000) : 0; son = t;
    if (oynuyor) zaman += dt / DONEM_SN;
    g.clearRect(0, 0, gen, yuk);
    g.drawImage(taban, 0, 0);
    if (veri) {
      g.lineWidth = 1.6 * dpr;
      for (const c of veri.cizgiler) {
        for (let i = 4; i < c.length; i += 4) {
          const faz = (((c[i + 2] / DONEM - zaman) % 1) + 1) % 1;
          if (faz > 0.16) continue;
          const a = faz < 0.015 ? faz / 0.015 : 1 - (faz - 0.03) / 0.13;
          if (a <= 0) continue;
          const [x0, y0] = ekran(c[i - 4], c[i - 3]), [x1, y1] = ekran(c[i], c[i + 1]);
          g.globalAlpha = Math.min(1, a); g.strokeStyle = hizRengi(c[i + 3]);
          g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
        }
      }
      g.globalAlpha = 1;
    }
    if (oynuyor && gorunur && !document.hidden) istek();
  }
  function istek() { if (!bekliyor) { bekliyor = true; requestAnimationFrame(kare); } }
  const ro = new ResizeObserver(boyutla); ro.observe(tuval);
  boyutla();
  return {
    veriYukle(r) { veri = r; tabanCiz(); istek(); },
    gorunur(b) { gorunur = b; son = 0; if (b) istek(); },
    oynat(b) { oynuyor = b && !az; son = 0; istek(); },
    zamanOlcegi: { DONEM, DONEM_SN },
    dispose() { ro.disconnect(); },
  };
}
