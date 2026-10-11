/* KÜRE 2B — donanım GPU'su yoksa ağ küresi ortografik izdüşümle tuvale çizilir (three indirilmez). API kure.mjs ile aynı. */
import { maskeCoz, kuresel, yay, dondur } from './kure-ortak.mjs';
import { RENK } from './renk.mjs';

export function kure2bKur(tuval, { gruplar, merkez, bak, boyutDegisti }) {
  const g = tuval.getContext('2d');
  const { konum, tur } = maskeCoz();
  const merkezG = gruplar.find((x) => x[0] === merkez);
  const mv = kuresel(merkezG[6], merkezG[7]);
  const yaylar = gruplar.filter((x) => x[0] !== merkez).map((x) => yay(mv, kuresel(x[6], x[7]), 32));
  let gen = 0, yuk = 0, dpr = 1, r = 1, cx = 0, cy = 0, hedef = null, bekliyor = false, gorunur = true;

  const izdusHam = (v) => { const d = dondur(v, bak); return [cx + d[0] * r, cy - d[1] * r, d[2]]; };
  function boyutla() {
    const b = tuval.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(b.width * dpr), h = Math.round(b.height * dpr);
    if (w === gen && h === yuk) return;
    gen = w; yuk = h; tuval.width = w; tuval.height = h;
    r = Math.min(w, h) * 0.6; cx = w / 2; cy = h / 2;
    istek();
    boyutDegisti?.();
  }
  function cizgiCiz(p, renk, kal, alfa) {
    g.strokeStyle = renk; g.lineWidth = kal * dpr; g.globalAlpha = alfa; g.beginPath();
    let acik = false;
    for (let i = 0; i < p.length; i += 3) {
      const [x, y, z] = izdusHam([p[i], p[i + 1], p[i + 2]]);
      if (z < 0) { acik = false; continue; }
      acik ? g.lineTo(x, y) : g.moveTo(x, y); acik = true;
    }
    g.stroke(); g.globalAlpha = 1;
  }
  function kare() {
    bekliyor = false;
    g.clearRect(0, 0, gen, yuk);
    g.fillStyle = RENK.kureGovde; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
    const s = 1.8 * dpr;
    for (let i = 0; i < tur.length; i++) {
      const d = dondur([konum[3 * i], konum[3 * i + 1], konum[3 * i + 2]], bak);
      if (d[2] <= 0) continue;
      g.globalAlpha = Math.min(1, d[2] * 3);
      g.fillStyle = tur[i] === 2 ? RENK.uyeKara : RENK.kara;
      g.fillRect(cx + d[0] * r - s / 2, cy - d[1] * r - s / 2, s, s);
    }
    g.globalAlpha = 1;
    for (const p of yaylar) cizgiCiz(p, RENK.petrol, 1, 0.3);
    if (hedef) cizgiCiz(yay(mv, kuresel(hedef.enlem, hedef.boylam), 48), RENK.lacivert, 1.5, 0.95);
    for (const x of gruplar) {
      const [px, py, z] = izdusHam(kuresel(x[6], x[7]));
      if (z <= 0.05) continue;
      const ana = x[0] === merkez;
      g.fillStyle = ana ? RENK.petrol : RENK.lacivert;
      g.beginPath(); g.arc(px, py, (ana ? 5 : x[1] === 'AS' ? 2.8 : 2.1) * dpr, 0, Math.PI * 2); g.fill();
    }
    if (hedef) {
      const [px, py, z] = izdusHam(kuresel(hedef.enlem, hedef.boylam));
      if (z > 0) { g.strokeStyle = RENK.lacivert; g.lineWidth = 1.5 * dpr; g.beginPath(); g.arc(px, py, 8 * dpr, 0, Math.PI * 2); g.stroke(); }
    }
  }
  function istek() { if (!bekliyor && gorunur) { bekliyor = true; requestAnimationFrame(kare); } }
  const ro = new ResizeObserver(boyutla); ro.observe(tuval);
  boyutla();
  return {
    istek,
    izdus(v) { const [x, y, z] = izdusHam(v); return [x / dpr, y / dpr, z > 0.12]; },
    vurgula(h) { hedef = h; istek(); },
    gorunur(b) { gorunur = b; if (b) istek(); },
    dispose() { ro.disconnect(); },
  };
}
