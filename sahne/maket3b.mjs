/* MAKET 3B — "Kabin ekipleri": sayfanın kâğıdına gölgesiyle oturan, üstü kesilmiş (kesit) bir yolcu uçağı; altı bölmede ekiplerin işi küçük
 * dioramalarla (three.js r184, ortografik kamera, gölgeli PBR; Antra Tech / Desilla 2,5B dili).
 * Burun → kuyruk: kokpit · yönetim kurulu, Etkinlik, Ar-Ge, Sponsorluk, Tanıtım, Tasarım. Bölme numaraları uzak duvarın üstünde
 * küçük HTML düğmeleridir (dünyadan ekrana izdüşümle konur); seçilen bölmeye kamera yaklaşır. Tur ve kartlar site.mjs'te.
 * Zemin (v14): koyu beton apron ve boyalı işaretler (taksi çizgisi, durma çubuğu, park alanı sınırı, servis yolu, A1).
 * Canlılık: koridorda yürüyen iki üye, konuşan/çalışan figürler, değişen ekranlar, uçan dron, dönen motor fanları, yanıp sönen
 * uçak ışıkları, uçağın çevresinde dönen bagaj treni; uçak yavaşça salınır (±4°, 24 sn), seçili bölmenin ışığı nefes alır.
 * yavas: yazılımsal çizici (donanım GPU'su yok): 1x piksel, ~15 kare/sn.
 * Ekran dışında ya da sekme gizliyken döngü durur; hareket azaltmada tek kare. WebGL yoksa null (poster ve aynı düğmeler kalır). */
import { THREE, RENK, cizici, isiklar, araclar, tuvalDoku, cerceve, dongu, birlestir, pikselOrani } from './maket-ortak.mjs';

const R = 1.15, YC = R + 0.78, KES = 0.2;
const X0 = -5.2, X1 = 4.9;
const SINIR = [X1, 2.88, 0.86, -1.16, -3.18, X0];
const T0 = Math.PI - 0.55, TL = Math.PI / 2 + 1.5;
const YF = YC - 0.5 * R, ZF = Math.sqrt(0.75) * R * 0.98, DUVAR = YC + KES * R;
export const BOLME = [[X1 - 0.05, X1 + 1.55], ...SINIR.slice(1).map((s, i) => [s, SINIR[i]])];
const orta = (i) => (BOLME[i][0] + BOLME[i][1]) / 2;
const HALI = [0x34393e, 0xf1e2a9, 0xcfe4e7, 0xe8d6bc, 0xf0d7d3, 0xe2e0d8];
/* apron yolu: bagaj treni bu yuvarlatılmış dikdörtgende döner */
const YOL = { x0: -6.3, x1: 6.5, z: 3.75, r: 1.1 };

function yolNokta(s) {
  const { x0, x1, z, r } = YOL, a = x1 - x0 - 2 * r, b = 2 * z - 2 * r, q = Math.PI * r / 2, L = 2 * a + 2 * b + 4 * q;
  s = ((s % L) + L) % L;
  const parca = [
    [a, (u) => [x0 + r + u, z, 0]],
    [q, (u) => { const t = u / r; return [x1 - r + Math.sin(t) * r, z - r + Math.cos(t) * r, t]; }],
    [b, (u) => [x1, z - r - u, Math.PI / 2]],
    [q, (u) => { const t = u / r; return [x1 - r + Math.cos(t) * r, -z + r - Math.sin(t) * r, Math.PI / 2 + t]; }],
    [a, (u) => [x1 - r - u, -z, Math.PI]],
    [q, (u) => { const t = u / r; return [x0 + r - Math.sin(t) * r, -z + r - Math.cos(t) * r, Math.PI + t]; }],
    [b, (u) => [x0, -z + r + u, Math.PI * 1.5]],
    [q, (u) => { const t = u / r; return [x0 + r - Math.cos(t) * r, z - r + Math.sin(t) * r, Math.PI * 1.5 + t]; }],
  ];
  for (const [uz, f] of parca) { if (s <= uz) return f(s); s -= uz; }
  return parca[0][1](0);
}

export function maketKur(tuvalEl, { imler = [], az = false, yavas = false, secildi } = {}) {
  const renderer = cizici(tuvalEl); if (!renderer) return null;
  const sahne = new THREE.Scene();
  isiklar(sahne, { boyut: 12 });
  const dunya = new THREE.Group(), ucak = new THREE.Group(); sahne.add(dunya); dunya.add(ucak);
  const dinamik = new Set();
  const { std, isik, ekle, kutu, sil, kure, yuvarlak, kisi, yuru } = araclar(ucak, dinamik);
  const M = { govde: std(RENK.govde, 0.38, 0.1, { side: THREE.DoubleSide }), ic: std(RENK.ic, 0.8), petrol: std(RENK.petrol, 0.5, 0.1), petrolKoyu: std(RENK.petrolKoyu, 0.55, 0.1),
    sari: std(RENK.sari, 0.45), gri: std(RENK.gri, 0.7), koyu: std(RENK.koyu, 0.5, 0.2), kirmizi: std(RENK.kirmizi, 0.5), kraft: std(RENK.kraft, 0.85),
    celik: std(0xc9ccd0, 0.3, 0.6), lastik: std(0x222222, 0.9), cam: std(0xbfdde2, 0.08, 0.1, { transparent: true, opacity: 0.45 }) };
  const canli = [], dokular = [];

  /* ── apron (v14): sahneyi kenardan kenara dolduran koyu beton (uçağın açık gövdesi zeminden ayrışsın; görünür kenarı yok) ve ayrı
   * saydam katmanda boyalı işaretler: arkadan park yerine kıvrılan sarı taksi çizgisi, burun önünde durma çubuğu, kırmızı kesikli park
   * alanı sınırı, bagaj treninin dolaştığı servis yolunun beyaz kesikli kenarları, park yeri numarası. İkisi de uçakla birlikte salınır. ── */
  const plaka = tuvalDoku(128, 128, (g, w, h) => {
    g.fillStyle = '#6a6c69'; g.fillRect(0, 0, w, h);
    let t = 7; const r = () => (t = (t * 16807) % 2147483647) / 2147483647;   /* tohumlu: her yüklemede aynı, düzensiz ince doku */
    for (let k = 0; k < 900; k++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.045)'; g.fillRect(r() * w, r() * h, 1, 1); }
    g.fillStyle = '#525451'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h);
  });
  plaka.wrapS = plaka.wrapT = THREE.RepeatWrapping; plaka.repeat.set(30, 30);
  const zemin = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), std(0xffffff, 0.95, 0, { map: plaka }));
  zemin.rotation.x = -Math.PI / 2; zemin.receiveShadow = true; dunya.add(zemin);
  const AX0 = -15, AX1 = 11, AZ = 8, PU = 56;
  const isaret = tuvalDoku((AX1 - AX0) * PU, 2 * AZ * PU, (g) => {
    const px = (x) => (x - AX0) * PU, pz = (z) => (z + AZ) * PU;
    g.lineCap = 'round'; g.lineJoin = 'round';
    /* servis yolu: bagaj yolunun iki yanında beyaz kesikli kenar */
    g.strokeStyle = 'rgba(242,242,239,0.85)'; g.lineWidth = 0.07 * PU; g.setLineDash([0.5 * PU, 0.4 * PU]);
    for (const d of [-0.5, 0.5]) { const { x0, x1, z, r } = YOL; g.beginPath(); g.roundRect(px(x0 - d), pz(-z - d), (x1 - x0 + 2 * d) * PU, (2 * z + 2 * d) * PU, (r + d) * PU); g.stroke(); }
    /* park alanı sınırı: kırmızı kesikli */
    g.strokeStyle = '#b8323a'; g.lineWidth = 0.09 * PU; g.setLineDash([0.7 * PU, 0.45 * PU]);
    g.strokeRect(px(-10.2), pz(-6.2), 19.6 * PU, 12.4 * PU);
    /* taksi çizgisi: arkadaki taksi yolundan kıvrılıp burun tekerine kadar; durma çubuğu */
    g.setLineDash([]); g.strokeStyle = '#f2c200'; g.lineWidth = 0.13 * PU;
    g.beginPath(); g.moveTo(px(-15), pz(-7.2)); g.lineTo(px(-13.4), pz(-7.2)); g.bezierCurveTo(px(-10.6), pz(-7.2), px(-11.2), pz(0), px(-8.6), pz(0)); g.lineTo(px(X1 + 0.75), pz(0)); g.stroke();
    g.beginPath(); g.moveTo(px(-15), pz(-7.2)); g.lineTo(px(11), pz(-7.2)); g.stroke();
    g.lineWidth = 0.22 * PU; g.beginPath(); g.moveTo(px(X1 + 0.95), pz(-0.7)); g.lineTo(px(X1 + 0.95), pz(0.7)); g.stroke();
    /* park yeri numarası: burnun önünde, kameraya okunur */
    g.fillStyle = '#f2c200'; g.font = `700 ${0.9 * PU}px Futura, 'Century Gothic', 'Segoe UI', sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('A1', px(4.7), pz(2.6));
  });
  const isaretM = ekle(new THREE.PlaneGeometry(AX1 - AX0, 2 * AZ), std(0xffffff, 0.9, 0, { map: isaret, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), (AX0 + AX1) / 2, 0.01, 0, dunya, { golge: false, rx: -Math.PI / 2 });
  isaretM.receiveShadow = true;

  /* ── gövde kabuğu: kesit silindir, burun kubbesi, kuyruk konisi ── */
  const kabuk = new THREE.CylinderGeometry(R, R, X1 - X0, 64, 1, true, T0, TL); kabuk.rotateZ(Math.PI / 2);
  ekle(kabuk, M.govde, (X0 + X1) / 2, YC, 0, ucak);
  const burun = new THREE.SphereGeometry(R, 56, 28, Math.PI / 2, Math.PI, Math.acos(KES), Math.PI - Math.acos(KES)); burun.scale(1.7, 1, 1);
  ekle(burun, M.govde, X1, YC, 0, ucak);
  const kuyruk = new THREE.CylinderGeometry(0.18, R, 3.2, 64, 1, true, T0, TL); kuyruk.rotateZ(Math.PI / 2);
  ekle(kuyruk, M.govde, X0 - 1.6, YC + 0.32, 0, ucak, { rz: -0.2 });
  /* boya: yakın duvarda petrol şerit ve altında ince sarı çizgi; kesit kenarında koyu kenar çizgisi */
  for (const [a, d, mat] of [[2 * Math.PI - 0.52, 0.17, M.petrol], [2 * Math.PI - 0.6, 0.035, M.sari]]) {
    const s = new THREE.CylinderGeometry(R * 1.004, R * 1.004, X1 - X0, 64, 1, true, a, d); s.rotateZ(Math.PI / 2); ekle(s, mat, (X0 + X1) / 2, YC, 0, ucak, { golge: false }); }
  /* kabin tabanı: burnun içinde daralan levha */
  const taban = new THREE.Shape(); taban.moveTo(X0 - 0.3, -ZF); taban.lineTo(X1, -ZF);
  for (let k = 1; k <= 12; k++) { const dx = k / 12 * 1.62, z = R * 0.97 * Math.sqrt(Math.max(0.02, 0.75 - (dx / (1.7 * R)) ** 2)); taban.lineTo(X1 + dx, -z); }
  for (let k = 12; k >= 1; k--) { const dx = k / 12 * 1.62, z = R * 0.97 * Math.sqrt(Math.max(0.02, 0.75 - (dx / (1.7 * R)) ** 2)); taban.lineTo(X1 + dx, z); }
  taban.lineTo(X1, ZF); taban.lineTo(X0 - 0.3, ZF); taban.closePath();
  const tabanG = new THREE.ExtrudeGeometry(taban, { depth: 0.08, bevelEnabled: false }); tabanG.rotateX(Math.PI / 2);
  ekle(tabanG, M.ic, 0, YF, 0, ucak);
  /* bölme halıları ve vurgu katmanı */
  const vurgular = BOLME.map(([a, b], i) => {
    const gen = i === 0 ? 1.15 : b - a - 0.08, gz = i === 0 ? 1.0 : ZF * 2 - 0.08, x = i === 0 ? a + 0.62 : (a + b) / 2;
    ekle(new THREE.PlaneGeometry(gen, gz), std(HALI[i], 0.95), x, YF + 0.004, 0, ucak, { golge: false, rx: -Math.PI / 2 });
    const mat = new THREE.MeshBasicMaterial({ color: RENK.sari, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    return { m: ekle(new THREE.PlaneGeometry(gen, gz), mat, x, YF + 0.008, 0, ucak, { golge: false, rx: -Math.PI / 2 }), hedef: 0 };
  });
  /* uzak duvarda pencereler (içten gök ışığı) ve tavan ışık şeridi */
  for (let x = X0 + 0.45; x < X1 - 0.15; x += 0.56) { if (SINIR.some((s) => Math.abs(s - x) < 0.16)) continue;
    ekle(new THREE.PlaneGeometry(0.22, 0.32), isik(0xd9eef1), x, YC + 0.2, -R * 0.968, ucak, { golge: false });
    ekle(new THREE.PlaneGeometry(0.3, 0.4), std(0xdedcd5, 0.7), x, YC + 0.2, -R * 0.972, ucak, { golge: false }); }
  /* bölme duvarları: kapı boşluklu, üstünde petrol kenar */
  for (const x of SINIR.slice(1, -1)) {
    const h = DUVAR - YF;
    kutu(0.06, h, ZF - 0.36, M.ic, x, YF + h / 2, -(ZF + 0.36) / 2, ucak); kutu(0.06, h, ZF - 0.36, M.ic, x, YF + h / 2, (ZF + 0.36) / 2, ucak);
    kutu(0.075, 0.025, ZF * 2, M.petrol, x, DUVAR, 0, ucak, { golge: false });
  }
  /* ── kanatlar (kanatçık), motorlar (pilon, dönen fan, egzoz), kuyruk, iniş takımı ── */
  const kanatSekli = (kok, uc, acik, ok) => { const s = new THREE.Shape(); s.moveTo(kok[0], 0); s.lineTo(kok[1], 0); s.lineTo(kok[1] - ok + (kok[1] - kok[0] - uc) * 0.2, acik); s.lineTo(kok[1] - ok + (kok[1] - kok[0] - uc) * 0.2 - uc, acik); s.closePath(); return s; };
  const fanlar = [], isiklarU = [];
  const KY = YC - 0.62 * R;
  for (const yon of [1, -1]) {
    const g = new THREE.ExtrudeGeometry(kanatSekli([0.1, 2.9], 0.9, 3.9, 2.2), { depth: 0.12, bevelEnabled: false }); g.rotateX(Math.PI / 2 * yon);
    ekle(g, M.govde, 0, KY + (yon > 0 ? 0.12 : 0), yon * 0.9 * R, ucak);
    const ucZ = yon * (0.9 * R + 3.9), ucX = 2.9 - 2.2 + 1.9 * 0.2 - 0.45;
    const kc = new THREE.Shape(); kc.moveTo(0, 0); kc.lineTo(0.75, 0); kc.lineTo(0.55, 0.5); kc.lineTo(0.3, 0.5); kc.closePath();
    ekle(new THREE.ExtrudeGeometry(kc, { depth: 0.05, bevelEnabled: false }), M.petrol, ucX - 0.42, KY + 0.06, ucZ - 0.025, ucak);
    isiklarU.push({ m: kure(0.06, isik(yon > 0 ? 0x3fe07a : 0xff4040), ucX + 0.38, KY + 0.08, ucZ, ucak, { golge: false }), tur: 'seyir' });
    isiklarU.push({ m: kure(0.05, isik(0xffffff), ucX - 0.42, KY + 0.08, ucZ, ucak, { golge: false }), tur: 'flas' });
    const mz = yon * 2.1, my = KY - 0.48;
    kutu(0.9, 0.34, 0.09, M.gri, 1.25, KY - 0.17, mz, ucak);
    ekle(new THREE.CylinderGeometry(0.4, 0.33, 1.5, 32), M.govde, 1.3, my, mz, ucak, { rz: Math.PI / 2 });
    ekle(new THREE.TorusGeometry(0.38, 0.035, 8, 32), M.celik, 2.05, my, mz, ucak, { ry: Math.PI / 2 });
    ekle(new THREE.CylinderGeometry(0.401, 0.401, 0.12, 32), M.petrol, 1.72, my, mz, ucak, { rz: Math.PI / 2, golge: false });
    ekle(new THREE.ConeGeometry(0.2, 0.42, 20), M.koyu, 0.4, my, mz, ucak, { rz: Math.PI / 2 });
    const fan = new THREE.Group(); fan.position.set(2.0, my, mz); ucak.add(fan);
    ekle(new THREE.CircleGeometry(0.36, 32), M.koyu, 0, 0, 0, fan, { ry: Math.PI / 2, golge: false });
    for (let k = 0; k < 12; k++) { const p = new THREE.Group(); p.rotation.x = k / 12 * Math.PI * 2; fan.add(p); kutu(0.012, 0.3, 0.05, M.celik, 0.01, 0.17, 0, p, { golge: false, ry: 0.5 }); }
    ekle(new THREE.ConeGeometry(0.09, 0.16, 16), M.celik, 0.06, 0, 0, fan, { rz: -Math.PI / 2, golge: false });
    fanlar.push(fan);
    const st = new THREE.ExtrudeGeometry(kanatSekli([0, 1.5], 0.55, 1.7, 0.9), { depth: 0.07, bevelEnabled: false }); st.rotateX(Math.PI / 2 * yon);
    ekle(st, M.govde, X0 - 2.7, YC + 0.38 + (yon > 0 ? 0.07 : 0), yon * 0.22, ucak);
  }
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(2.1, 0); fin.lineTo(0.75, 2.4); fin.lineTo(-0.1, 2.4); fin.closePath();
  ekle(new THREE.ExtrudeGeometry(fin, { depth: 0.1, bevelEnabled: false }), M.petrol, X0 - 2.9, YC + 0.45, -0.05, ucak);
  kutu(1.25, 0.24, 0.115, M.sari, X0 - 2.15, YC + 1.5, 0, ucak, { golge: false });
  isiklarU.push({ m: kure(0.07, isik(0xff3030), X0 - 2.55, YC + 2.88, 0, ucak, { golge: false }), tur: 'tepe' });
  isiklarU.push({ m: kure(0.07, isik(0xff3030), 0.2, YC - R - 0.04, 0, ucak, { golge: false }), tur: 'tepe' });
  const teker = (x, z) => { ekle(new THREE.CylinderGeometry(0.19, 0.19, 0.13, 20), M.lastik, x, 0.19, z, ucak, { rx: Math.PI / 2 }); ekle(new THREE.CylinderGeometry(0.09, 0.09, 0.135, 12), M.celik, x, 0.19, z, ucak, { rx: Math.PI / 2, golge: false }); };
  sil(0.045, 0.045, YF - 0.25, M.celik, X1 + 0.45, (YF + 0.2) / 2, 0, ucak); teker(X1 + 0.45, 0.09); teker(X1 + 0.45, -0.09);
  for (const z of [0.85, -0.85]) { sil(0.06, 0.06, KY - 0.2, M.celik, 0.9, KY / 2 + 0.05, z, ucak); teker(0.82, z + 0.1); teker(0.82, z - 0.1); teker(1.0, z + 0.1); teker(1.0, z - 0.1); }

  /* ── bölmeler ── */
  const sandalye = (x, z, ry = 0, mat = M.petrolKoyu) => { const g = new THREE.Group(); g.position.set(x, YF, z); g.rotation.y = ry; ucak.add(g); kutu(0.26, 0.05, 0.26, mat, 0, 0.22, 0, g); kutu(0.26, 0.28, 0.04, mat, 0, 0.37, -0.12, g); for (const [a, b] of [[-0.1, -0.1], [0.1, -0.1], [-0.1, 0.1], [0.1, 0.1]]) kutu(0.03, 0.22, 0.03, M.koyu, a, 0.11, b, g); return g; };
  const masa = (x, z, w, d, mat = M.gri, h = 0.42) => { kutu(w, 0.05, d, mat, x, YF + h, z, ucak); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) kutu(0.035, h, 0.035, M.koyu, x + a * (w / 2 - 0.05), YF + h / 2, z + b * (d / 2 - 0.05), ucak); };
  const ekran = (w, h, x, y, z, doku, ry = 0, rx = 0) => { kutu(w + 0.04, h + 0.04, 0.03, M.koyu, x, y, z - 0.018 * Math.cos(ry), ucak, { ry, rx, golge: false }); return ekle(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: doku, toneMapped: false }), x, y, z, ucak, { ry, rx, golge: false }); };
  const DUVARZ = -0.92;

  /* 1 · kokpit: iki pilot, ışıklı ekranlar (yapay ufuk), orta konsol */
  { const x = X1 + 0.5;
    for (const z of [-0.33, 0.33]) { kutu(0.32, 0.08, 0.32, M.koyu, x, YF + 0.22, z, ucak); kutu(0.07, 0.48, 0.32, M.koyu, x - 0.17, YF + 0.46, z, ucak); }
    for (const z of [-0.33, 0.33]) { const p = kisi(ucak, x - 0.02, YF, z, { renk: 0x1f2a44, ry: Math.PI / 2, otur: true }); p.solK.rotation.x = p.sagK.rotation.x = -1.1; canli.push({ tur: 'pilot', k: p, faz: z }); }
    kutu(0.12, 0.34, 1.0, M.koyu, x + 0.72, YF + 0.5, 0, ucak, { rz: -0.35 });
    kutu(0.32, 0.18, 0.16, M.koyu, x + 0.3, YF + 0.12, 0, ucak);
    const pfd = tuvalDoku(128, 96, (g, w, h, t) => { const a = Math.sin(t * 0.7) * 0.18, y = h / 2 + Math.sin(t * 0.45) * 8; g.save(); g.translate(w / 2, y); g.rotate(a); g.fillStyle = '#2f8fd0'; g.fillRect(-w, -h * 1.5, w * 2, h * 1.5); g.fillStyle = '#8a5a2b'; g.fillRect(-w, 0, w * 2, h * 1.5); g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(-w, 0); g.lineTo(w, 0); g.stroke(); g.restore(); g.strokeStyle = '#f2c200'; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2 - 26, h / 2); g.lineTo(w / 2 - 8, h / 2); g.moveTo(w / 2 + 8, h / 2); g.lineTo(w / 2 + 26, h / 2); g.stroke(); });
    const nd = tuvalDoku(128, 96, (g, w, h, t) => { g.fillStyle = '#0d1418'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2fb7c7'; g.lineWidth = 2; g.beginPath(); g.arc(w / 2, h + 10, 70, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); g.strokeStyle = '#d0d'; g.beginPath(); g.moveTo(w / 2, h - 6); g.lineTo(w / 2 + Math.sin(t * 0.3) * 30, 20); g.stroke(); g.fillStyle = '#f2c200'; g.fillRect(w / 2 - 4, h - 12, 8, 8); });
    dokular.push(pfd, nd);
    for (const [z, d] of [[-0.42, pfd], [-0.16, nd], [0.16, nd], [0.42, pfd]]) { const e = ekle(new THREE.PlaneGeometry(0.2, 0.15), new THREE.MeshBasicMaterial({ map: d, toneMapped: false }), x + 0.655, YF + 0.56, z, ucak, { golge: false }); e.rotation.set(0, -Math.PI / 2, 0); e.rotateX(-0.35); }
  }
  /* 2 · Etkinlik: sahne, konuşmacı (el hareketi), perde (değişen slaytlar), iki sıra dinleyici, süs ışıkları */
  { const x = orta(1), [, b] = BOLME[1];
    kutu(0.62, 0.12, 0.62, M.petrol, b - 0.4, YF + 0.06, -0.58, ucak);
    sil(0.012, 0.012, 0.5, M.koyu, b - 0.62, YF + 0.37, -0.42, ucak); kure(0.035, M.koyu, b - 0.62, YF + 0.63, -0.42, ucak);
    const kon = kisi(ucak, b - 0.42, YF + 0.12, -0.52, { renk: RENK.sari, ry: -Math.PI / 2 - 0.5 });
    canli.push({ tur: 'konusmaci', k: kon });
    const slayt = tuvalDoku(256, 160, (g, w, h, t) => { const n = Math.floor(t / 4) % 3; g.fillStyle = '#f8f8f6'; g.fillRect(0, 0, w, h); g.fillStyle = '#056b7a'; g.fillRect(0, 0, w, 18);
      g.strokeStyle = '#141414'; g.fillStyle = '#141414'; g.lineWidth = 3;
      if (n === 0) { g.beginPath(); g.moveTo(40, 96); g.bezierCurveTo(70, 52, 170, 56, 220, 92); g.bezierCurveTo(160, 104, 80, 106, 40, 96); g.fill(); g.strokeStyle = '#056b7a'; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(10, 50 + k * 26); g.bezierCurveTo(90, 40 + k * 22, 160, 44 + k * 22, 250, 54 + k * 24); g.stroke(); } }
      else if (n === 1) { [60, 92, 74, 120, 104].forEach((v, k) => { g.fillStyle = k === 3 ? '#f2c200' : '#056b7a'; g.fillRect(36 + k * 40, 146 - v, 26, v); }); g.fillStyle = '#141414'; g.fillRect(30, 146, 200, 3); }
      else { g.fillStyle = '#141414'; g.beginPath(); g.moveTo(128, 30); g.quadraticCurveTo(150, 60, 146, 120); g.lineTo(110, 120); g.quadraticCurveTo(106, 60, 128, 30); g.fill(); g.fillStyle = '#f2c200'; g.beginPath(); g.moveTo(114, 124); g.lineTo(128, 150); g.lineTo(142, 124); g.fill(); g.fillStyle = '#a4262c'; g.fillRect(100, 100, 12, 24); g.fillRect(144, 100, 12, 24); } });
    dokular.push(slayt); ekran(0.86, 0.54, b - 0.95, YC + 0.12, DUVARZ - 0.08, slayt);
    const DOLU = new Set(['0|-0.78', '0|0.46', '0|0.78', '1|-0.46', '1|0.46', '1|-0.78']), GIYSI = [RENK.petrol, 0xf8f8f6, RENK.kirmizi, 0x5c6b73, RENK.sari, RENK.petrolKoyu];
    for (const [dx, sira] of [[-0.75, 0], [-0.3, 1]]) for (const z of [-0.78, -0.46, 0.46, 0.78]) {
      sandalye(x + dx, z, Math.PI / 2);
      if (DOLU.has(`${sira}|${z}`)) { const p = kisi(ucak, x + dx + 0.02, YF, z, { renk: GIYSI[canli.length % 6], ry: Math.PI / 2, otur: true }); canli.push({ tur: 'dinleyici', k: p, faz: z * 3 + sira }); }
    }
    for (let k = 0; k < 9; k++) canli.push({ tur: 'isik', m: kure(0.032, isik(0xf2c200), x - 0.95 + k * 0.24, YC + 0.48 - Math.sin((k / 8) * Math.PI) * 0.12, -R * 0.9, ucak, { golge: false }), k });
  }
  /* 3 · Ar-Ge: beyaz tahtada kanat profili ve yazan mühendis, tezgâhta dizüstü ve 3B yazıcı, rüzgâr tüneli, uçan dron */
  { const x = orta(2);
    const tahta = tuvalDoku(256, 160, (g, w, h) => { g.fillStyle = '#fbfbf9'; g.fillRect(0, 0, w, h); g.strokeStyle = '#03525e'; g.lineWidth = 4; g.beginPath(); g.moveTo(30, 90); g.bezierCurveTo(60, 50, 160, 52, 226, 86); g.bezierCurveTo(160, 98, 70, 104, 30, 90); g.stroke();
      g.strokeStyle = '#a4262c'; g.lineWidth = 3; g.beginPath(); g.moveTo(120, 74); g.lineTo(120, 26); g.lineTo(112, 36); g.moveTo(120, 26); g.lineTo(128, 36); g.stroke(); g.fillStyle = '#141414'; g.font = '700 22px Jost, sans-serif'; g.fillText('L', 132, 38); g.fillText('C', 24, 140); g.font = '700 14px Jost, sans-serif'; g.fillText('L', 40, 146); g.font = '700 22px Jost, sans-serif'; g.fillText('= 2πα', 54, 140); });
    ekran(0.9, 0.56, x - 0.35, YC + 0.12, DUVARZ - 0.08, tahta);
    const muh = kisi(ucak, x - 0.35, YF, -0.55, { renk: RENK.petrolKoyu, ry: Math.PI }); canli.push({ tur: 'yazan', k: muh });
    masa(x + 0.15, 0.74, 1.4, 0.4);
    kutu(0.3, 0.02, 0.2, M.koyu, x - 0.2, YF + 0.455, 0.72, ucak);
    const kod = tuvalDoku(128, 80, (g, w, h, t) => { g.fillStyle = '#0d1418'; g.fillRect(0, 0, w, h); const r = ['#2fb7c7', '#f2c200', '#7fd4a0', '#f8f8f6']; for (let k = 0; k < 8; k++) { const s = (k + Math.floor(t * 3)) % 23; g.fillStyle = r[s % 4]; g.fillRect(8 + (s % 3) * 10, 6 + k * 9, 20 + (s * 37) % 70, 4); } });
    dokular.push(kod); ekle(new THREE.PlaneGeometry(0.28, 0.18), new THREE.MeshBasicMaterial({ map: kod, toneMapped: false }), x - 0.2, YF + 0.56, 0.62, ucak, { golge: false, rx: -0.3, ry: Math.PI });
    const oturan = kisi(ucak, x - 0.2, YF, 0.4, { renk: RENK.sari, ry: 0, otur: true }); sandalye(x - 0.2, 0.4, 0); oturan.solK.rotation.x = oturan.sagK.rotation.x = -1.2; canli.push({ tur: 'klavye', k: oturan });
    kutu(0.32, 0.36, 0.28, M.koyu, x + 0.25, YF + 0.62, 0.68); kutu(0.24, 0.2, 0.2, M.cam, x + 0.25, YF + 0.62, 0.7);
    const parca = kutu(0.07, 0.07, 0.07, M.sari, x + 0.25, YF + 0.56, 0.7);
    kutu(0.46, 0.18, 0.2, M.cam, x + 0.62, YF + 0.56, 0.68); kutu(0.18, 0.012, 0.06, M.govde, x + 0.62, YF + 0.56, 0.68, ucak, { rz: -0.12 });
    const duman = []; for (let k = 0; k < 6; k++) duman.push(kutu(0.05, 0.006, 0.006, isik(0x9fd8df), x + 0.4, YF + 0.5 + (k % 3) * 0.04, 0.64 + (k >> 1) * 0.02, ucak, { golge: false }));
    const dron = new THREE.Group(); dron.position.set(x + 0.2, YC + 0.15, 0.05); ucak.add(dron);
    kutu(0.16, 0.05, 0.16, M.petrol, 0, 0, 0, dron); kutu(0.5, 0.022, 0.035, M.koyu, 0, 0, 0, dron, { ry: Math.PI / 4 }); kutu(0.5, 0.022, 0.035, M.koyu, 0, 0, 0, dron, { ry: -Math.PI / 4 });
    const pervaneler = []; for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) pervaneler.push(kutu(0.2, 0.006, 0.022, M.koyu, a * 0.18, 0.04, b * 0.18, dron, { golge: false }));
    const dronIsik = kure(0.02, isik(0x3fe07a), 0.09, 0, 0, dron, { golge: false });
    canli.push({ tur: 'dron', dron, pervaneler, dronIsik, x0: x + 0.2 }, { tur: 'yazici', m: parca, x0: x + 0.25 }, { tur: 'duman', duman, x0: x + 0.4 });
  }
  /* 4 · Sponsorluk: görüşme masası, el sıkışan iki kişi, kurdeleli koliler, kupa rafı, duvarda çerçeveler */
  { const x = orta(3);
    masa(x, -0.5, 0.62, 0.5, M.petrol); kutu(0.2, 0.01, 0.14, M.govde, x - 0.08, YF + 0.45, -0.5); kutu(0.14, 0.01, 0.1, M.govde, x + 0.12, YF + 0.45, -0.46);
    sandalye(x - 0.48, -0.5, Math.PI / 2); sandalye(x + 0.48, -0.5, -Math.PI / 2);
    const a = kisi(ucak, x - 0.46, YF, -0.5, { renk: RENK.koyu, ry: Math.PI / 2, otur: true }), b = kisi(ucak, x + 0.46, YF, -0.5, { renk: 0xf8f8f6, alt: RENK.petrolKoyu, ry: -Math.PI / 2, otur: true });
    canli.push({ tur: 'el', a, b });
    for (const [dx, dy, dz, s] of [[-0.62, 0, 0.62, 0.34], [-0.26, 0, 0.7, 0.28], [-0.46, 0.34, 0.64, 0.26]]) { kutu(s, s, s, M.kraft, x + dx, YF + dy + s / 2, dz); kutu(s + 0.01, s + 0.01, 0.05, M.petrol, x + dx, YF + dy + s / 2, dz); kutu(0.05, s + 0.012, s + 0.012, M.petrol, x + dx, YF + dy + s / 2, dz); }
    kutu(0.5, 0.04, 0.2, M.kraft, x + 0.55, YF + 0.7, -0.88); kutu(0.5, 0.04, 0.2, M.kraft, x + 0.55, YF + 0.4, -0.88);
    sil(0.06, 0.035, 0.13, std(RENK.sari, 0.2, 0.75), x + 0.45, YF + 0.79, -0.88); kutu(0.1, 0.04, 0.1, M.koyu, x + 0.45, YF + 0.74, -0.88);
    kure(0.06, std(0xc9ccd0, 0.2, 0.8), x + 0.68, YF + 0.48, -0.88);
    const cerceveD = tuvalDoku(192, 64, (g, w, h) => { g.fillStyle = '#f8f8f6'; g.fillRect(0, 0, w, h); ['#056b7a', '#f2c200', '#a4262c'].forEach((r, k) => { g.fillStyle = '#141414'; g.fillRect(6 + k * 62, 6, 56, 52); g.fillStyle = r; g.fillRect(12 + k * 62, 12, 44, 40); }); });
    ekran(0.78, 0.26, x - 0.15, YC + 0.3, DUVARZ - 0.08, cerceveD);
  }
  /* 5 · Tanıtım: tripodda kamera (kayıt ışığı), halka ışık, kameraya konuşan kişi, akan paylaşım ekranı, megafon */
  { const x = orta(4);
    for (const a of [0, 2.1, 4.2]) sil(0.011, 0.011, 0.6, M.koyu, x + 0.25 + Math.cos(a) * 0.1, YF + 0.29, 0.6 + Math.sin(a) * 0.1, ucak, { rz: Math.cos(a) * 0.18, rx: -Math.sin(a) * 0.18 });
    kutu(0.2, 0.15, 0.24, M.koyu, x + 0.25, YF + 0.66, 0.6); ekle(new THREE.CylinderGeometry(0.06, 0.07, 0.14, 16), M.koyu, x + 0.25, YF + 0.66, 0.44, ucak, { rx: Math.PI / 2 });
    const kayit = kure(0.022, isik(0xff3030), x + 0.33, YF + 0.76, 0.62, ucak, { golge: false });
    const halka = ekle(new THREE.TorusGeometry(0.17, 0.022, 8, 32), isik(0xfff6dd), x + 0.6, YF + 0.78, -0.62, ucak, { golge: false, ry: -0.5 });
    sil(0.01, 0.01, 0.6, M.koyu, x + 0.6, YF + 0.3, -0.62, ucak);
    const sunucu = kisi(ucak, x + 0.18, YF, -0.42, { renk: RENK.petrol, ry: 0 }); canli.push({ tur: 'sunucu', k: sunucu });
    const akis = tuvalDoku(160, 256, (g, w, h, t) => { g.fillStyle = '#141414'; g.fillRect(0, 0, w, h); const r = ['#056b7a', '#f2c200', '#dfeaeb', '#a4262c', '#f8f8f6', '#03525e']; const kay = (t * 22) % 70;
      for (let k = -1; k < 5; k++) for (let j = 0; j < 2; j++) { g.fillStyle = r[(k * 2 + j + 60 + Math.floor(t * 22 / 70) * 2) % 6]; g.fillRect(10 + j * 72, 40 + k * 70 - kay, 66, 64); }
      g.fillStyle = '#141414'; g.fillRect(0, 0, w, 34); g.fillStyle = '#f2c200'; g.font = '700 20px Jost, sans-serif'; g.fillText('@ituuumk', 12, 24); });
    dokular.push(akis); ekran(0.48, 0.76, x - 0.55, YC + 0.06, DUVARZ - 0.08, akis);
    ekle(new THREE.CylinderGeometry(0.03, 0.1, 0.24, 16, 1, true), M.sari, x + 0.7, YF + 0.5, 0.62, ucak, { rz: Math.PI / 2 + 0.3 }); kutu(0.22, 0.38, 0.22, M.koyu, x + 0.72, YF + 0.19, 0.62);
    canli.push({ tur: 'kayit', m: kayit }, { tur: 'halka', m: halka });
  }
  /* 6 · Tasarım: şövalede değişen afiş ve boyayan tasarımcı, standda kulüp tişörtü, boya kutuları, tabletle çizen üye */
  { const x = orta(5);
    const afis = tuvalDoku(192, 256, (g, w, h, t) => { const n = Math.floor(t / 5) % 3; g.fillStyle = '#f8f8f6'; g.fillRect(0, 0, w, h);
      if (n === 0) { g.fillStyle = '#056b7a'; g.fillRect(0, h * 0.62, w, h * 0.38); g.fillStyle = '#f2c200'; g.beginPath(); g.arc(w * 0.7, h * 0.3, 34, 0, Math.PI * 2); g.fill(); g.fillStyle = '#141414'; g.beginPath(); g.moveTo(30, 150); g.lineTo(160, 108); g.lineTo(96, 150); g.closePath(); g.fill(); g.font = '700 26px Jost, sans-serif'; g.fillStyle = '#f8f8f6'; g.fillText('AESTRO', 22, 214); }
      else if (n === 1) { g.fillStyle = '#141414'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f2c200'; g.lineWidth = 6; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(w / 2, h * 0.45, 20 + k * 18, Math.PI, Math.PI * 2); g.stroke(); } g.fillStyle = '#f8f8f6'; g.font = '700 30px Jost, sans-serif'; g.fillText('UUMK', 50, 220); }
      else { g.fillStyle = '#f2c200'; g.fillRect(0, 0, w, h); g.fillStyle = '#056b7a'; for (let k = 0; k < 6; k++) g.fillRect(0, 30 + k * 34, w * (0.3 + ((k * 37) % 60) / 100), 18); g.fillStyle = '#141414'; g.font = '700 24px Jost, sans-serif'; g.fillText('2026', 60, 240); } });
    dokular.push(afis);
    const sovale = new THREE.Group(); sovale.position.set(x + 0.4, YF, -0.5); sovale.rotation.y = -0.45; ucak.add(sovale);
    for (const a of [-0.18, 0.18]) kutu(0.03, 0.95, 0.03, M.kraft, a, 0.47, 0, sovale, { rx: -0.12 });
    ekle(new THREE.PlaneGeometry(0.46, 0.62), std(0xffffff, 0.8, 0, { map: afis }), 0, 0.62, 0.04, sovale);
    const tas = kisi(ucak, x + 0.05, YF, -0.18, { renk: RENK.kirmizi, ry: Math.PI - 0.9 }); canli.push({ tur: 'boyayan', k: tas });
    const tisort = new THREE.Shape(); tisort.moveTo(-0.16, 0); tisort.lineTo(0.16, 0); tisort.lineTo(0.16, 0.26); tisort.lineTo(0.26, 0.2); tisort.lineTo(0.31, 0.3); tisort.lineTo(0.16, 0.42); tisort.lineTo(-0.16, 0.42); tisort.lineTo(-0.31, 0.3); tisort.lineTo(-0.26, 0.2); tisort.lineTo(-0.16, 0.26); tisort.closePath();
    const tst = ekle(new THREE.ExtrudeGeometry(tisort, { depth: 0.04, bevelEnabled: false }), M.petrol, x - 0.55, YF + 0.42, -0.72, ucak); sil(0.012, 0.012, 0.86, M.koyu, x - 0.55, YF + 0.43, -0.76, ucak);
    ekle(new THREE.CircleGeometry(0.06, 3), M.sari, x - 0.55, YF + 0.65, -0.675, ucak, { golge: false, rz: Math.PI });
    canli.push({ tur: 'tisort', m: tst });
    for (const [dx, renk] of [[0, RENK.sari], [0.13, RENK.kirmizi], [0.26, RENK.petrol]]) sil(0.05, 0.05, 0.1, std(renk, 0.5), x + 0.2 + dx, YF + 0.05, -0.85, ucak);
    masa(x - 0.3, 0.74, 0.7, 0.36, M.gri); kutu(0.26, 0.012, 0.18, M.koyu, x - 0.3, YF + 0.45, 0.7, ucak, { rx: 0.2 });
    const cizen = kisi(ucak, x - 0.3, YF, 0.42, { renk: 0x5c6b73, ry: 0, otur: true }); sandalye(x - 0.3, 0.42, 0); cizen.sagK.rotation.x = -1.25; cizen.solK.rotation.x = -0.9; canli.push({ tur: 'cizen', k: cizen });
  }
  /* koridorda yürüyen iki üye (bölme kapılarından geçer) */
  const yuruyenler = [kisi(ucak, 0, YF, 0.12, { renk: RENK.sari }), kisi(ucak, 0, YF, -0.12, { renk: 0xf8f8f6, alt: RENK.petrolKoyu })];
  const KORIDOR = [X0 + 0.45, X1 - 0.35];

  /* ── uçağın çevresi: bagaj treni (çekici + iki araba) ve yakıt aracı ── */
  const tren = [];
  { const cek = new THREE.Group(); dunya.add(cek); yuvarlak(0.72, 0.22, 0.44, 0.08, M.sari, 0, 0.14, 0, cek); kutu(0.28, 0.24, 0.4, M.cam, -0.12, 0.47, 0, cek); kutu(0.3, 0.03, 0.42, M.koyu, -0.12, 0.6, 0, cek);
    for (const [a, b] of [[0.24, 0.2], [-0.24, 0.2], [0.24, -0.2], [-0.24, -0.2]]) ekle(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 14), M.lastik, a, 0.1, b, cek, { rx: Math.PI / 2 });
    const tepe = kure(0.04, isik(0xffa020), -0.12, 0.65, 0, cek, { golge: false });
    birlestir(cek, new Set([tepe])); tren.push({ g: cek, gec: 0, tepe });
    for (let k = 1; k <= 2; k++) { const a = new THREE.Group(); dunya.add(a); kutu(0.66, 0.05, 0.42, M.gri, 0, 0.2, 0, a); for (const [p, q] of [[0.24, 0.19], [-0.24, 0.19], [0.24, -0.19], [-0.24, -0.19]]) ekle(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 12), M.lastik, p, 0.07, q, a, { rx: Math.PI / 2 });
      [[-0.16, 0.12, RENK.petrol], [0.12, 0.1, RENK.kirmizi], [-0.02, 0.1, 0x5c6b73], [0.16, 0.14, RENK.sari]].forEach(([p, h, r], j) => kutu(0.22, h, 0.18, std(r, 0.7), p, 0.225 + h / 2 + (j > 1 ? 0.11 : 0), j % 2 ? 0.08 : -0.1, a));
      birlestir(a, new Set()); tren.push({ g: a, gec: k * 0.95 }); }
  }
  { const y = new THREE.Group(); y.position.set(-1.6, 0, 2.75); y.rotation.y = 0.12; dunya.add(y);
    yuvarlak(0.55, 0.36, 0.56, 0.08, M.govde, 0.95, 0.16, 0, y); kutu(0.36, 0.18, 0.5, M.cam, 0.98, 0.42, 0, y);
    ekle(new THREE.CylinderGeometry(0.27, 0.27, 1.25, 24), M.govde, -0.05, 0.48, 0, y, { rz: Math.PI / 2 }); ekle(new THREE.CylinderGeometry(0.275, 0.275, 0.12, 24), M.petrol, -0.05, 0.48, 0, y, { rz: Math.PI / 2, golge: false });
    for (const a of [-0.45, 0.35, 0.95]) for (const b of [0.24, -0.24]) ekle(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 14), M.lastik, a, 0.1, b, y, { rx: Math.PI / 2 });
    kutu(1.8, 0.05, 0.05, M.koyu, -0.05, 0.2, 0.28, y);
    canli.push({ tur: 'tepe2', m: kure(0.04, isik(0xffa020), 0.98, 0.54, 0, y, { golge: false }) });
    const hortum = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.6, 0.3, -0.25), new THREE.Vector3(-0.9, 0.15, -0.9), new THREE.Vector3(-0.5, 0.6, -1.3), new THREE.Vector3(-0.2, 1.12, -1.55)]), 24, 0.025, 6);
    ekle(hortum, M.koyu, 0, 0, 0, y, { golge: false }); }

  /* ── seçim ── */
  let secili = -1, uzerinde = -1;
  const durumYaz = () => vurgular.forEach((v, i) => { v.hedef = i === secili ? 0.42 : i === uzerinde ? 0.18 : 0; });
  function sec(i) { if (i === secili) return; secili = i; durumYaz(); odakHedef(); d.ciz(); }

  /* ── kamera: ortografik; kaide (ve bagaj yolu) tuvalin içinde kalır, hiçbir yer kesilmez ── */
  const kamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const yon = new THREE.Vector3(0.14, 1.05, 0.9).normalize(), hedef = new THREE.Vector3(0, 0.9, 0);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const sinir = [V(X1 + 2.0, YC, 0), V(X1 + 0.45, 0, 0), V(-8.5, YC + 0.6, 0), V(-8.2, YC + 2.95, 0), V(-6.6, YC + 2.95, 0), V(-7.6, YC + 0.45, 2.0), V(-7.6, YC + 0.45, -2.0),
    V(1.1, KY, 5.0), V(0.1, KY, 5.0), V(1.1, KY + 0.6, -5.0), V(0.1, KY + 0.6, -5.0), 
    V(YOL.x0 - 0.3, 0, YOL.z + 0.3), V(YOL.x1 + 0.3, 0, YOL.z + 0.3), V(X1 + 3.1, 0, -1.6)];
  /* dar tuvalde (telefon) uçak köşegene yatar: kuyruk sol üstte, burun sağ altta */
  /* salınımın iki ucundaki konumlar da çerçevede: uçak dönerken hiçbir yeri kesilmez */
  const SALINIM = 0.07, Y = new THREE.Vector3(0, 1, 0), salin = (l) => [...l, ...l.map((p) => p.clone().applyAxisAngle(Y, SALINIM)), ...l.map((p) => p.clone().applyAxisAngle(Y, -SALINIM))];
  const cerGenis = cerceve(kamera, yon, hedef, salin(sinir), 1.04), cerDar = cerceve(kamera, new THREE.Vector3(0.55, 1.2, 0.9).normalize(), hedef, salin([...sinir.slice(0, 11), sinir.at(-1)]), 1.04);
  let cer = cerGenis;
  const kam = { x: 0, y: 0, z: 1 }, kamHedef = { x: 0, y: 0, z: 1 };
  let gen = 1, yuk = 1, ilk = true;
  /* uçak her tuvalde bütün görünür (v12: yakınlaşma uçağı tuval kenarında kesiyordu); seçim zemin ışığı ve numarayla belli olur */
  function odakHedef() { const { mx, my } = cer.yari; Object.assign(kamHedef, { x: mx, y: my, z: 1 }); }
  function boyutla() {
    gen = tuvalEl.clientWidth || 1; yuk = tuvalEl.clientHeight || 1;
    renderer.setPixelRatio(yavas ? 1 : pikselOrani()); renderer.setSize(gen, yuk, false);
    cer = gen / yuk < 1.5 ? cerDar : cerGenis; cer.olc(gen, yuk); odakHedef(); if (ilk || az) { Object.assign(kam, kamHedef); ilk = false; }
    d.ciz();
  }
  const imNokta = BOLME.map((_, i) => new THREE.Vector3(i === 0 ? X1 + 0.75 : orta(i), YC + (i === 0 ? 0.62 : 0.78), -R * (i === 0 ? 0.5 : 0.82)));
  const v = new THREE.Vector3();
  function imleriKoy() { imler.forEach((e, i) => { v.copy(imNokta[i]); ucak.localToWorld(v); v.project(kamera); e.style.transform = `translate(${((v.x + 1) / 2 * gen).toFixed(1)}px, ${((1 - v.y) / 2 * yuk).toFixed(1)}px)`; }); }

  /* tıklama ve üzerine gelme: ışını kabin tabanı yüksekliğindeki düzleme indir, hangi bölmede olduğuna bak */
  const isin = new THREE.Raycaster(), duzlem = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), nokta = new THREE.Vector3();
  function bolmeBul(e) {
    const r = tuvalEl.getBoundingClientRect(); isin.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), kamera);
    for (const yuks of [YF + 0.3, DUVAR]) {
      duzlem.constant = -yuks; if (!isin.ray.intersectPlane(duzlem, nokta)) continue;
      ucak.worldToLocal(nokta); if (Math.abs(nokta.z) > ZF + 0.15) continue;
      const i = BOLME.findIndex(([a, b]) => nokta.x >= a && nokta.x <= b); if (i >= 0) return i;
    }
    return -1;
  }
  tuvalEl.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; const i = bolmeBul(e); if (i !== uzerinde) { uzerinde = i; durumYaz(); tuvalEl.style.cursor = i >= 0 ? 'pointer' : ''; imler.forEach((l, j) => l.toggleAttribute('data-uzerinde', j === i)); d.ciz(); } });
  tuvalEl.addEventListener('pointerleave', () => { uzerinde = -1; durumYaz(); imler.forEach((l) => l.removeAttribute('data-uzerinde')); });
  tuvalEl.addEventListener('click', (e) => secildi?.(bolmeBul(e)));

  let onceki = 0, sonDoku = -1;
  function ciz(t) {
    const dt = Math.min(0.1, Math.max(0, t - onceki)); onceki = t;
    const k = az ? 1 : 1 - Math.exp(-dt * 5.5);
    kam.x += (kamHedef.x - kam.x) * k; kam.y += (kamHedef.y - kam.y) * k; kam.z += (kamHedef.z - kam.z) * k;
    cer.uygula(kam.x, kam.y, kam.z);
    dunya.rotation.y = az ? 0 : Math.sin(t * (Math.PI * 2 / 24)) * SALINIM;
    const nefes = az ? 1 : 0.8 + 0.2 * Math.sin(t * 2.4);
    vurgular.forEach((vv) => { vv.m.material.opacity += (vv.hedef * (vv.hedef > 0.3 ? nefes : 1) - vv.m.material.opacity) * (az ? 1 : 0.2); });
    if (!az && Math.floor(t * 8) !== sonDoku) { sonDoku = Math.floor(t * 8); dokular.forEach((d0) => d0.yeniden(t)); }
    for (const c of canli) {
      if (c.tur === 'dron') { c.dron.position.set(c.x0 + Math.sin(t * 0.5) * 0.45, YC + 0.15 + Math.sin(t * 2.2) * 0.05, Math.sin(t * 1.0) * 0.18); c.dron.rotation.y = Math.sin(t * 0.5) * 0.6; c.pervaneler.forEach((p, i) => { p.rotation.y = t * 40 + i; }); c.dronIsik.visible = az || Math.floor(t * 2) % 2 === 0; }
      else if (c.tur === 'yazici') c.m.position.x = c.x0 + Math.sin(t * 3) * 0.07;
      else if (c.tur === 'duman') c.duman.forEach((m, i) => { m.position.x = c.x0 + ((t * 0.5 + i * 0.17) % 0.45); });
      else if (c.tur === 'isik') c.m.visible = az || ((Math.floor(t * 2) + c.k) % 3 !== 0);
      else if (c.tur === 'kayit') c.m.visible = az || Math.floor(t * 1.5) % 2 === 0;
      else if (c.tur === 'tepe2') c.m.visible = az || Math.floor(t * 2.5) % 2 === 0;
      else if (c.tur === 'halka') c.m.material.color.setScalar(az ? 1 : 0.85 + 0.15 * Math.sin(t * 3));
      else if (c.tur === 'tisort') c.m.rotation.y = az ? 0 : Math.sin(t * 0.8) * 0.12;
      else if (c.tur === 'konusmaci') { c.k.sagK.rotation.x = -0.6 - 0.5 * Math.max(0, Math.sin(t * 1.6)); c.k.sagK.rotation.z = 0.25; c.k.solK.rotation.x = -0.2 - 0.25 * Math.max(0, Math.sin(t * 1.6 + 2)); c.k.bas.rotation.y = Math.sin(t * 0.5) * 0.5; }
      else if (c.tur === 'dinleyici') { c.k.bas.rotation.x = Math.sin(t * 0.9 + c.faz) * 0.08; c.k.bas.rotation.y = Math.sin(t * 0.3 + c.faz) * 0.2; }
      else if (c.tur === 'pilot') c.k.bas.rotation.y = Math.sin(t * 0.25 + c.faz * 3) * 0.4;
      else if (c.tur === 'yazan') { c.k.sagK.rotation.x = -2.2 + Math.sin(t * 2.6) * 0.15; c.k.sagK.rotation.z = Math.sin(t * 1.3) * 0.3; }
      else if (c.tur === 'klavye') { c.k.solK.rotation.x = -1.2 + Math.sin(t * 14) * 0.05; c.k.sagK.rotation.x = -1.2 + Math.sin(t * 14 + 1.5) * 0.05; c.k.bas.rotation.x = Math.sin(t * 0.4) * 0.1; }
      else if (c.tur === 'el') { const s = Math.max(0, Math.sin(t * 0.45)) ** 0.5; c.a.sagK.rotation.x = c.b.sagK.rotation.x = -0.3 - 1.15 * s; c.a.bas.rotation.x = c.b.bas.rotation.x = -0.1 * s + 0.05 * Math.sin(t * 2); }
      else if (c.tur === 'sunucu') { c.k.sagK.rotation.x = -0.5 - 0.5 * Math.max(0, Math.sin(t * 1.3)); c.k.sagK.rotation.z = 0.35; c.k.solK.rotation.z = -0.15 - 0.2 * Math.max(0, Math.sin(t * 1.3 + 1.5)); c.k.bas.rotation.y = Math.sin(t * 0.7) * 0.25; }
      else if (c.tur === 'boyayan') { c.k.sagK.rotation.x = -1.6 + Math.sin(t * 1.8) * 0.35; c.k.sagK.rotation.z = Math.sin(t * 0.9) * 0.25; }
      else if (c.tur === 'cizen') c.k.sagK.rotation.z = Math.sin(t * 2.2) * 0.2;
    }
    /* koridor: iki üye zıt yönlerde gider gelir */
    yuruyenler.forEach((p, i) => {
      const L = KORIDOR[1] - KORIDOR[0], hiz = 0.42, s = (t * hiz + i * L * 0.9) % (2 * L), ileri = s < L, x = ileri ? KORIDOR[0] + s : KORIDOR[1] - (s - L);
      p.g.position.x = x; const hedefRy = (i ? !ileri : ileri) ? Math.PI / 2 : -Math.PI / 2;
      if (i) p.g.position.x = KORIDOR[0] + KORIDOR[1] - x;
      p.g.rotation.y += (hedefRy - p.g.rotation.y) * (az ? 1 : 0.15);
      if (!az) yuru(p, t * 7 + i);
    });
    /* bagaj treni (t = 0 anında, hareket azaltmada ve posterde, yakın kenarın sağında: masaüstü kartı sol altta) */
    tren.forEach((p) => { const [x, z, a] = yolNokta(t * 0.85 - p.gec * 0.95 + 9.7); p.g.position.set(x, 0.02, z); p.g.rotation.y = a; if (p.tepe) p.tepe.visible = az || Math.floor(t * 3) % 2 === 0; });
    /* uçak ışıkları, fanlar */
    for (const l of isiklarU) l.m.visible = az || (l.tur === 'seyir' ? true : l.tur === 'tepe' ? (t % 1.2) < 0.2 : ((t % 1.6) < 0.06 || ((t % 1.6) > 0.16 && (t % 1.6) < 0.22)));
    fanlar.forEach((f) => { f.rotation.x = az ? 0 : t * 7; });
    renderer.render(sahne, kamera); imleriKoy();
  }
  /* hareket edenler birleştirilmez; geri kalan her şey malzemeye göre tek ağ */
  for (const c of canli) for (const o of [c.m, c.dron, c.k?.g, c.a?.g, c.b?.g, ...(c.duman || [])]) if (o) dinamik.add(o);
  for (const o of [...vurgular.map((v) => v.m), ...isiklarU.map((l) => l.m), ...fanlar, ...tren.map((p) => p.g)]) dinamik.add(o);
  birlestir(dunya, dinamik);
  const d = dongu(tuvalEl, ciz, az, yavas ? 66 : undefined);
  new ResizeObserver(boyutla).observe(tuvalEl);
  boyutla();
  tuvalEl.dataset.cizici = '3b';
  /* poster üretimi için: imlerin tuvale göre yüzde konumları */
  const imYuzde = () => imler.map((e) => { const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(e.style.transform); return m ? [(+m[1] / gen * 100).toFixed(2), (+m[2] / yuk * 100).toFixed(2)] : null; });
  return { sec, ciz: () => d.ciz(), kamera, renderer, imYuzde };
}
