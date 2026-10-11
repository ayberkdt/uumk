/* AKIM — rüzgâr tüneli sahnesinin saf hesabı (DOM yok, three yok; Node'da da çalışır, araclar/dogrula.mjs sınar).
 *
 * Model: sunumatik'in lineer vorteks panel yöntemi (lib/sunumatik/aero_airfoil_flow/airfoil-solver.mjs, Kuethe & Chow + Kutta).
 * Hakikat düzeyi: SAYISAL, potansiyel akım. Viskozite ve akım ayrılması yok; sürükleme teoride sıfır.
 *
 * Çerçeveler: çözücü profili x ekseninde sabit tutar, serbest akım α kadar eğiktir. Ekranda ise akım yataydır ve kanat α kadar
 * burun yukarı döner. Dönüş merkezi çeyrek veter noktası (0,25; 0): ekran = R(−α)(p − pc), profil = R(α)d + pc.
 *
 * Akım çizgileri: tohumlar ekranda x = TOHUM_X dikey hattında, eşit aralıklı. Her çizgi RK2 ile yay uzunluğu adımlarıyla izlenir;
 * her noktada geçen süre t (birimi c/V∞) birikir. Aynı t'deki noktalar aynı anda salınmış duman darbesidir (zaman çizgisi):
 * üst yüzeyden geçen darbe firar kenarına alttakinden önce varır — "eşit geçiş süresi" yanlıştır.
 *
 * Hız: velocityGrid yerine noktasal değerlendirme. Izgara 200 × 124 noktada soğuk 493 ms ölçüldü (2026-10-10, Node);
 * çizgiler yalnız ~3 000 noktada hız istediği için panel sabitleri bir kez hesaplanıp noktada toplanır (aynı katsayılar). */
import { nacaNodes, solveAirfoil, insideAirfoil } from '../lib/sunumatik/aero_airfoil_flow/airfoil-solver.mjs';

export const PROFIL = '2412';
export const PANEL_YARI = 80;                 // 160 panel
export const TOHUM_X = -0.75;                 // ekran çerçevesinde, veter birimi
export const BITIS_X = 1.95;
export const ALFA_ARALIK = [-4, 12];          // kaydırıcı sınırları (derece)
const PC = [0.25, 0];

/** Panel sabitleri (velocityGrid'in iç döngüsüyle aynı katsayılar, noktasal) */
function panelSabitleri(sol) {
  const { nodes, N } = sol;
  const s = { N, PX: new Float64Array(N), PY: new Float64Array(N), CJ: new Float64Array(N), SJ: new Float64Array(N),
    C2: new Float64Array(N), S2: new Float64Array(N), PS: new Float64Array(N) };
  for (let j = 0; j < N; j++) {
    const [Xj, Yj] = nodes[j], [Xj1, Yj1] = nodes[j + 1];
    const ddx = Xj1 - Xj, ddy = Yj1 - Yj, t = Math.atan2(ddy, ddx);
    s.PX[j] = Xj; s.PY[j] = Yj; s.PS[j] = Math.hypot(ddx, ddy);
    s.CJ[j] = Math.cos(t); s.SJ[j] = Math.sin(t); s.C2[j] = Math.cos(2 * t); s.S2[j] = Math.sin(2 * t);
  }
  return s;
}

/** Profil çerçevesinde (x, y) noktasında hız (V∞ birimi) */
export function hiz(sol, sab, x, y) {
  const { gamma, alpha } = sol;
  let uu = Math.cos(alpha), vv = Math.sin(alpha);
  for (let j = 0; j < sab.N; j++) {
    const rx = x - sab.PX[j], ry = y - sab.PY[j];
    const cj = sab.CJ[j], sj = sab.SJ[j], S = sab.PS[j];
    const A = -rx * cj - ry * sj, B = rx * rx + ry * ry, E = rx * sj - ry * cj;
    const C = -sj, D = cj;
    const F = Math.log(Math.max((S * S + 2 * A * S) / B + 1, 1e-12));
    const G = Math.atan2(E * S, B + A * S);
    const P = -rx * sab.S2[j] + ry * sab.C2[j], Q = rx * sab.C2[j] + ry * sab.S2[j];
    const cn2 = D + 0.5 * Q * F / S - (A * C + D * E) * G / S;
    const cn1 = 0.5 * D * F + C * G - cn2;
    const ct2 = C + 0.5 * P * F / S + (A * D - C * E) * G / S;
    const ct1 = 0.5 * C * F - D * G - ct2;
    uu += ct1 * gamma[j] + ct2 * gamma[j + 1];
    vv += cn1 * gamma[j] + cn2 * gamma[j + 1];
  }
  return [uu, vv];
}

export const ekranaCevir = (x, y, a) => { const c = Math.cos(a), s = Math.sin(a), dx = x - PC[0], dy = y - PC[1]; return [c * dx + s * dy + PC[0], -s * dx + c * dy + PC[1]]; };
export const profileCevir = (x, y, a) => { const c = Math.cos(a), s = Math.sin(a), dx = x - PC[0], dy = y - PC[1]; return [c * dx - s * dy + PC[0], s * dx + c * dy + PC[1]]; };

/**
 * Bir hücum açısı için akım çizgileri.
 * @returns {{ alfa, cl, cm, kanat: Float32Array (ekran x,y çiftleri), cizgiler: Float32Array[] (x, y, t, |V| dörtlüleri), sure }}
 */
export function akimHesapla(alfaDeg, { cizgi = 21, aralik = 0.05, nodes = nacaNodes(PROFIL, PANEL_YARI) } = {}) {
  const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
  const sol = solveAirfoil(nodes, alfaDeg);
  const sab = panelSabitleri(sol);
  const a = sol.alpha;
  const kanat = new Float32Array(nodes.length * 2);
  nodes.forEach(([x, y], i) => { const [ex, ey] = ekranaCevir(x, y, a); kanat[2 * i] = ex; kanat[2 * i + 1] = ey; });

  const cizgiler = [];
  for (let k = 0; k < cizgi; k++) {
    const yd = (k - (cizgi - 1) / 2) * aralik;
    let [px, py] = profileCevir(TOHUM_X, yd, a);
    let t = 0;
    const nokta = [];
    for (let adim = 0; adim < 700; adim++) {
      const [v1x, v1y] = hiz(sol, sab, px, py);
      const s1 = Math.hypot(v1x, v1y);
      const [ex, ey] = ekranaCevir(px, py, a);
      nokta.push(ex, ey, t, s1);
      if (ex > BITIS_X || t > 8) break;
      /* yay uzunluğu adımı: profile yakın ince, uzakta kaba (uzaklık profilin çeyrek veterine göre) */
      const uz = Math.hypot(px - 0.5, py) - 0.5;
      const ds = Math.min(0.045, Math.max(0.006, 0.006 + 0.05 * uz));
      if (s1 < 1e-6) break;
      const hx = px + 0.5 * ds * v1x / s1, hy = py + 0.5 * ds * v1y / s1;
      const [v2x, v2y] = hiz(sol, sab, hx, hy);
      const s2 = Math.hypot(v2x, v2y);
      if (s2 < 1e-6) break;
      const nx = px + ds * v2x / s2, ny = py + ds * v2y / s2;
      if (insideAirfoil(nodes, nx, ny)) break;     // durma noktası çevresinde sayısal sızma: çizgi biter
      t += ds / s2;
      px = nx; py = ny;
    }
    cizgiler.push(new Float32Array(nokta));
  }
  const sure = typeof performance !== 'undefined' ? performance.now() - t0 : 0;
  return { alfa: alfaDeg, cl: sol.cl, cm: sol.cm4, kanat, cizgiler, sure, fark: varisFarki(kanat, cizgiler) };
}

/** Üstten ve alttan geçen çizgilerin firar kenarına varış süreleri farkı (c/V∞): alt medyanı − üst medyanı.
 *  Pozitif: üstten geçen önce varır (kaldırma pozitif). Firar kenarı = kanat dizisinin ilk düğümü. */
export function varisFarki(kanat, cizgiler) {
  const teX = kanat[0], teY = kanat[1];
  const ust = [], alt = [];
  for (const c of cizgiler) {
    const t = varisSuresi(c, teX);
    if (t === null) continue;
    let y = null;
    for (let i = 4; i < c.length; i += 4) if (c[i] >= teX) { y = c[i + 1]; break; }
    (y > teY ? ust : alt).push(t);
  }
  const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[s.length >> 1] : NaN; };
  return med(alt) - med(ust);
}

/** Ekran x'inde bir çizginin t değeri (doğrusal ara değer); çizgi oraya varmadıysa null */
export function varisSuresi(cizgi, x) {
  for (let i = 4; i < cizgi.length; i += 4) {
    if (cizgi[i] >= x) {
      const x0 = cizgi[i - 4], t0 = cizgi[i - 2], k = (x - x0) / (cizgi[i] - x0 || 1);
      return t0 + k * (cizgi[i + 2] - t0);
    }
  }
  return null;
}
