/* KÜRE ORTAK — ağ küresinin saf parçaları (three'siz): maske çözümü, küresel koordinat, büyük daire yayı, döndürme ve izdüşüm.
 * three sürümü (kure.mjs) ve 2B yedek (kure2b.mjs) aynı döndürme durumunu ve aynı izdüşümü kullanır; etiketler ikisinde de aynı yere düşer.
 * Eksenler: y yukarı; boylam 0 kameraya (+z) bakar. */
import { MASKE, ADIM, ENLEM0 } from '../veri/kure-maske.mjs';

export const rad = (d) => (d * Math.PI) / 180;
/** enlem/boylam (derece) → birim vektör */
export function kuresel(enlem, boylam, r = 1) {
  const f = rad(enlem), l = rad(boylam);
  return [r * Math.cos(f) * Math.sin(l), r * Math.sin(f), r * Math.cos(f) * Math.cos(l)];
}

/** Maske → { konum: Float32Array (x,y,z), tur: Uint8Array (1 kara, 2 üye ülke) } — deniz noktaları atlanır */
export function maskeCoz() {
  const satirlar = MASKE.split('|');
  const konum = [], tur = [];
  satirlar.forEach((s, i) => {
    const enlem = ENLEM0 + (i + 0.5) * ADIM;
    const n = Math.max(1, Math.round((360 * Math.cos(rad(enlem))) / ADIM));
    let j = 0;
    for (const [, h, say] of s.matchAll(/([abc])(\d+)/g)) {
      const k = Number(say);
      if (h !== 'a') for (let q = 0; q < k; q++) { konum.push(...kuresel(enlem, -180 + ((j + q + 0.5) * 360) / n)); tur.push(h === 'c' ? 2 : 1); }
      j += k;
    }
  });
  return { konum: new Float32Array(konum), tur: new Uint8Array(tur) };
}

/** İki nokta arasında büyük daire yayı; uç noktalardan yükselir (yükseklik açıyla orantılı). n+1 nokta, düz dizi */
export function yay(a, b, n = 48) {
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const om = Math.acos(dot), so = Math.sin(om) || 1e-6;
  const tepe = 0.04 + 0.22 * (om / Math.PI);
  const out = new Float32Array((n + 1) * 3);
  for (let i = 0; i <= n; i++) {
    const t = i / n, ka = Math.sin((1 - t) * om) / so, kb = Math.sin(t * om) / so;
    const r = 1.003 + tepe * Math.sin(Math.PI * t);
    out[3 * i] = (ka * a[0] + kb * b[0]) * r; out[3 * i + 1] = (ka * a[1] + kb * b[1]) * r; out[3 * i + 2] = (ka * a[2] + kb * b[2]) * r;
  }
  return out;
}

/** Döndürme durumu: bakılan enlem/boylam. Dünya → görünüm: önce −boylam (y ekseni), sonra +enlem (x ekseni). */
export function dondur(v, bak) {
  const l = rad(-bak.boylam), f = rad(bak.enlem);
  const x1 = Math.cos(l) * v[0] + Math.sin(l) * v[2], z1 = -Math.sin(l) * v[0] + Math.cos(l) * v[2];
  const y2 = Math.cos(f) * v[1] - Math.sin(f) * z1, z2 = Math.sin(f) * v[1] + Math.cos(f) * z1;
  return [x1, y2, z2];
}

/** Sürükleme + klavye + yumuşak geçiş. Durum değişince degisti() çağrılır. */
export function dondurmeKur(el, { bak, degisti, az = false }) {
  let hedef = null, surukle = null;
  const sinirla = () => { bak.enlem = Math.max(-20, Math.min(72, bak.enlem)); bak.boylam = ((bak.boylam + 540) % 360) - 180; };
  el.addEventListener('pointerdown', (e) => { surukle = { x: e.clientX, y: e.clientY, b: bak.boylam, e: bak.enlem, oynadi: false }; hedef = null; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', (e) => {
    if (!surukle) return;
    const r = el.getBoundingClientRect(), k = 180 / Math.min(r.width, r.height);
    const dx = e.clientX - surukle.x, dy = e.clientY - surukle.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) surukle.oynadi = true;
    bak.boylam = surukle.b - dx * k; bak.enlem = surukle.e + dy * k; sinirla(); degisti();
  });
  const birak = () => { const o = surukle?.oynadi; surukle = null; return o; };
  /* sürükleme sonrası gelen click seçim yapmasın: işaret yalnız gerçekten oynayınca, bir görev turu boyunca */
  el.addEventListener('pointerup', () => { if (birak()) { el.dataset.surukledi = '1'; setTimeout(() => delete el.dataset.surukledi, 0); } });
  el.addEventListener('pointercancel', birak);
  el.addEventListener('keydown', (e) => {
    const adim = { ArrowLeft: [0, -8], ArrowRight: [0, 8], ArrowUp: [8, 0], ArrowDown: [-8, 0] }[e.key];
    if (!adim) return;
    e.preventDefault(); hedef = null; bak.enlem += adim[0]; bak.boylam += adim[1]; sinirla(); degisti();
  });
  let son = 0;
  function adimla(t) {
    if (!hedef) return;
    const dt = son ? (t - son) / 1000 : 0; son = t;
    const k = 1 - Math.exp(-dt / 0.12);
    let db = hedef.boylam - bak.boylam; db = ((db + 540) % 360) - 180;
    bak.boylam += db * k; bak.enlem += (hedef.enlem - bak.enlem) * k;
    if (Math.abs(db) < 0.05 && Math.abs(hedef.enlem - bak.enlem) < 0.05) { bak.boylam = hedef.boylam; bak.enlem = hedef.enlem; hedef = null; }
    sinirla(); degisti();
    if (hedef) requestAnimationFrame(adimla);
  }
  return {
    git(enlem, boylam) {
      const e = Math.max(-20, Math.min(72, enlem - 4)), b = boylam;   /* hedef biraz yukarıda kalsın (etiket ve yay görünsün) */
      if (az) { bak.enlem = e; bak.boylam = b; sinirla(); degisti(); return; }
      hedef = { enlem: e, boylam: b }; son = 0; requestAnimationFrame(adimla);
    },
  };
}
