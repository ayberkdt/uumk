#!/usr/bin/env node
/* HARİTA-İNŞA — EUROAVIA haritası için ülke çokgenleri: Natural Earth 1:50m (kamu malı) → veri/harita-ulkeler.mjs
 *   node araclar/harita-insa.mjs <ne_50m_admin_0_countries.geojson>
 * Çerçeve: boylam -32…62, enlem 20…74 (Avrupa, Türkiye, Kuzey Afrika kıyısı). Douglas-Peucker sadeleştirme (0,05°),
 * koordinatlar 0,05° tamsayı adımla ve farklarla kodlanır. Üye = veri/ag.mjs'de grubu olan ülke (tek kaynak). */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = join(dirname(fileURLToPath(import.meta.url)), '..');
const kaynak = process.argv[2];
if (!kaynak) { console.error('kullanım: node araclar/harita-insa.mjs <geojson>'); process.exit(2); }
const { GRUPLAR } = await import(new URL('../veri/ag.mjs', import.meta.url));
const NE_AD = { Serbia: 'Republic of Serbia' };
const UYE = new Set(GRUPLAR.map((g) => NE_AD[g[4]] || g[4]));
const C = { b0: -32, b1: 62, e0: 20, e1: 74 }, TOL = 0.05, Q = 20;   /* Q: derece başına adım (0,05°) */

function dp(n, tol) {
  if (n.length < 4) return n;
  const kalan = new Uint8Array(n.length); kalan[0] = kalan[n.length - 1] = 1;
  /* kapalı halka: ilk nokta = son nokta; önce ilk noktaya en uzak noktadan iki parçaya böl */
  let uzak = 1, ud = 0; for (let i = 1; i < n.length - 1; i++) { const d = Math.hypot(n[i][0] - n[0][0], n[i][1] - n[0][1]); if (d > ud) { ud = d; uzak = i; } }
  kalan[uzak] = 1;
  const yigin = [[0, uzak], [uzak, n.length - 1]];
  while (yigin.length) {
    const [a, b] = yigin.pop(); let m = -1, md = 0;
    const [ax, ay] = n[a], [bx, by] = n[b], dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1;
    for (let i = a + 1; i < b; i++) { const d = Math.abs(dy * n[i][0] - dx * n[i][1] + bx * ay - by * ax) / l; if (d > md) { md = d; m = i; } }
    if (md > tol) { kalan[m] = 1; yigin.push([a, m], [m, b]); }
  }
  return n.filter((_, i) => kalan[i]);
}
const veri = JSON.parse(readFileSync(kaynak, 'utf8'));
const ulkeler = [];
let nokta = 0;
for (const ozellik of veri.features) {
  const ad = ozellik.properties.ADMIN, gm = ozellik.geometry;
  const poli = gm.type === 'Polygon' ? [gm.coordinates] : gm.type === 'MultiPolygon' ? gm.coordinates : [];
  const halkalar = [];
  for (const p of poli) for (const h of p.slice(0, 1)) {   /* yalnız dış halka */
    const bx = h.map((q) => q[0]), by = h.map((q) => q[1]);
    if (Math.max(...bx) < C.b0 || Math.min(...bx) > C.b1 || Math.max(...by) < C.e0 || Math.min(...by) > C.e1) continue;
    const s = dp(h.map(([x, y]) => [Math.max(C.b0 - 8, Math.min(C.b1 + 8, x)), Math.max(C.e0 - 6, Math.min(C.e1 + 6, y))]), TOL);
    if (s.length < 4) continue;
    /* tamsayı + fark kodlama */
    let px = 0, py = 0; const kod = [];
    for (const [x, y] of s) { const qx = Math.round(x * Q), qy = Math.round(y * Q); kod.push(qx - px, qy - py); px = qx; py = qy; }
    halkalar.push(kod); nokta += s.length;
  }
  if (halkalar.length) ulkeler.push([UYE.has(ad) ? 1 : 0, ad, halkalar]);
}
const cerceveUye = new Set(GRUPLAR.filter((g) => g[6] >= C.e0 && g[6] <= C.e1 && g[7] >= C.b0 && g[7] <= C.b1).map((g) => NE_AD[g[4]] || g[4]));   /* çerçeve dışı (Lagos) kenarda okla gösterilir */
const eksik = [...cerceveUye].filter((u) => !ulkeler.some((x) => x[1] === u));
if (eksik.length) { console.error('Natural Earth\'te bulunamayan üye ülke:', eksik.join(', ')); process.exit(1); }
const govde = `/* HARİTA ÜLKELERİ — üretildi: araclar/harita-insa.mjs (Natural Earth 1:50m ülkeler, kamu malı). Elle düzenlemeyin.
 * ${ulkeler.length} ülke, ${nokta} nokta; [üye mi, ad (NE ADMIN), halkalar]. Halka: 1/${Q}° adımlı tamsayılar, ilk nokta mutlak, sonrakiler fark (x=boylam, y=enlem). */
export const Q = ${Q};
export const ULKELER = ${JSON.stringify(ulkeler)};
`;
writeFileSync(join(KOK, 'veri', 'harita-ulkeler.mjs'), govde);
console.log(`veri/harita-ulkeler.mjs: ${ulkeler.length} ülke, ${nokta} nokta, ${(govde.length / 1024).toFixed(1)} kB`);
