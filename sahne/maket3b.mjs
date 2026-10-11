/* MAKET 3B — "Kabin ekipleri": kaide üstünde, üstü kesilmiş (kesit maket) bir yolcu uçağı; altı bölmede ekiplerin işi küçük
 * dioramalarla (three.js r184, ortografik kamera, gölgeli PBR; Antra Tech / Desilla 2,5B dili).
 * Burun → kuyruk: 1 kokpit · yönetim kurulu (iki koltuk, ışıklı gösterge paneli) · 2 Etkinlik (sahne, mikrofon, sandalyeler, süs
 * ışıkları) · 3 Ar-Ge (tezgâh, dizüstü, 3B yazıcı, uçan dron) · 4 Sponsorluk (kurdeleli koliler, görüşme masası, kupa) · 5 Tanıtım
 * (tripodda kamera, halka ışık, paylaşım ekranı, megafon) · 6 Tasarım (şövalede afiş, standda kulüp tişörtü, boya kutuları).
 * Her bölmenin üstündeki numara HTML'dir (dünyadan ekrana izdüşümle konur); liste ve numara birbirini vurgular.
 * Ekran dışında ya da sekme gizliyken döngü durur; hareket azaltmada tek kare. WebGL yoksa null döner (poster görüntüsü kalır). */
import * as THREE from '../vendor/three-r184/three.module.min.js';

const R = 1.15, YC = R + 0.78, KES = 0.2;          /* gövde yarıçapı, gövde ekseni yüksekliği, kesit yüksekliği (×R) */
const X0 = -5.2, X1 = 4.9;                          /* silindirik gövde; burun X1'den ileri, kuyruk X0'dan geri */
const SINIR = [X1, 2.88, 0.86, -1.16, -3.18, X0];   /* bölmeler (burundan): kokpit burunda, sonra 5 ekip */
const T0 = Math.PI - 0.55, TL = Math.PI / 2 + 1.5;   /* kesit: uzak duvar tam, yakın duvar alçak, tavan açık */
const RENK = { govde: 0xf8f8f6, ic: 0xecebe7, petrol: 0x056b7a, petrolKoyu: 0x03525e, sari: 0xf2c200, gri: 0xcfcdc6, koyu: 0x1a1a1a, kirmizi: 0xa4262c, ten: 0xe8d9c6, kraft: 0xc29a68, beton: 0xdcdad3 };

function tuval(w, h, ciz) { const c = document.createElement('canvas'); c.width = w; c.height = h; ciz(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

export function maketKur(tuvalEl, { imler = [], az = false, secildi } = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: tuvalEl, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { return null; }
  if (!renderer.getContext()) return null;
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  const sahne = new THREE.Scene();
  sahne.add(new THREE.HemisphereLight(0xf6f4ee, 0x2a3236, 1.35));
  const anahtar = new THREE.DirectionalLight(0xfff6ea, 2.4);
  anahtar.position.set(-6, 14, 9); anahtar.castShadow = true; anahtar.shadow.mapSize.set(2048, 2048);
  Object.assign(anahtar.shadow.camera, { left: -11, right: 11, top: 8, bottom: -8, near: 1, far: 40 });
  anahtar.shadow.bias = -0.0006; anahtar.shadow.normalBias = 0.03;
  const dolgu = new THREE.DirectionalLight(0xdfeaeb, 0.6); dolgu.position.set(8, 5, 10);
  sahne.add(anahtar, dolgu);

  const std = (renk, roughness = 0.6, metalness = 0.05, ek = {}) => new THREE.MeshStandardMaterial({ color: renk, roughness, metalness, ...ek });
  const M = { govde: std(RENK.govde, 0.42, 0.08, { side: THREE.DoubleSide }), ic: std(RENK.ic, 0.8), petrol: std(RENK.petrol, 0.5, 0.1), petrolKoyu: std(RENK.petrolKoyu, 0.55, 0.1),
    sari: std(RENK.sari, 0.45), gri: std(RENK.gri, 0.7), koyu: std(RENK.koyu, 0.5, 0.2), kirmizi: std(RENK.kirmizi, 0.5), ten: std(RENK.ten, 0.8), kraft: std(RENK.kraft, 0.85),
    celik: std(0xc9ccd0, 0.35, 0.5), cam: std(0xbfdde2, 0.1, 0.1, { transparent: true, opacity: 0.55 }),
    isik: (renk) => new THREE.MeshBasicMaterial({ color: renk, toneMapped: false }) };
  const ekle = (geo, mat, x, y, z, eb = sahne, { golge = true, rx = 0, ry = 0, rz = 0 } = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = golge; m.receiveShadow = true; eb.add(m); return m; };
  const kutu = (w, h, d, mat, x, y, z, eb, sec) => ekle(new THREE.BoxGeometry(w, h, d), mat, x, y, z, eb, sec);
  const sil = (r1, r2, h, mat, x, y, z, eb, sec, seg = 20) => ekle(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, eb, sec);
  const kure = (r, mat, x, y, z, eb) => ekle(new THREE.SphereGeometry(r, 16, 12), mat, x, y, z, eb);

  /* ── kaide: koyu gövde, petrol kenar, beton apron, sarı yanaşma çizgisi, TC-UUMK levhası ── */
  const KX0 = -9.4, KX1 = 8.4, KZ = 5.3;
  kutu(KX1 - KX0, 0.5, KZ * 2, std(RENK.koyu, 0.75), (KX0 + KX1) / 2, -0.25, 0, sahne, { golge: false });
  kutu(KX1 - KX0 + 0.04, 0.06, KZ * 2 + 0.04, M.petrol, (KX0 + KX1) / 2, -0.02, 0, sahne, { golge: false });
  const apron = tuval(512, 384, (g, w, h) => {
    g.fillStyle = '#dcdad3'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(20,20,20,.08)'; g.lineWidth = 2; for (let x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = '#f2c200'; g.lineWidth = 6; g.setLineDash([]); g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
    g.lineWidth = 4; g.beginPath(); g.moveTo(w * 0.86, h * 0.3); g.lineTo(w * 0.86, h * 0.7); g.stroke();
  });
  ekle(new THREE.PlaneGeometry(KX1 - KX0, KZ * 2), std(0xffffff, 0.9, 0, { map: apron }), (KX0 + KX1) / 2, 0.012, 0, sahne, { golge: false, rx: -Math.PI / 2 });
  const levha = tuval(512, 96, (g, w, h) => { g.fillStyle = '#141414'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c200'; g.font = '700 52px Jost, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TC-UUMK · AS IST', w / 2, h / 2 + 2); });
  ekle(new THREE.PlaneGeometry(4.2, 0.78), std(0xffffff, 0.6, 0, { map: levha }), 4.2, 0.016, KZ - 0.7, sahne, { golge: false, rx: -Math.PI / 2 });

  const ucak = new THREE.Group(); sahne.add(ucak);
  /* ── gövde kabuğu: kesit silindir, burun kubbesi, kuyruk konisi (aynı kesitle) ── */
  const kabuk = new THREE.CylinderGeometry(R, R, X1 - X0, 56, 1, true, T0, TL); kabuk.rotateZ(Math.PI / 2);
  ekle(kabuk, M.govde, (X0 + X1) / 2, YC, 0, ucak);
  const burun = new THREE.SphereGeometry(R, 48, 24, Math.PI / 2, Math.PI, Math.acos(KES), Math.PI - Math.acos(KES)); burun.scale(1.7, 1, 1);
  ekle(burun, M.govde, X1, YC, 0, ucak);
  const kuyruk = new THREE.CylinderGeometry(0.18, R, 3.2, 56, 1, true, T0, TL); kuyruk.rotateZ(Math.PI / 2);
  ekle(kuyruk, M.govde, X0 - 1.6, YC + 0.32, 0, ucak, { rz: -0.2 });
  /* yakın duvarda petrol şerit; kabuk kenarında ince petrol kenar */
  const serit = new THREE.CylinderGeometry(R * 1.004, R * 1.004, X1 - X0, 56, 1, true, 2 * Math.PI - 0.5, 0.16); serit.rotateZ(Math.PI / 2);
  ekle(serit, M.petrol, (X0 + X1) / 2, YC, 0, ucak, { golge: false });
  /* zemin (kabin tabanı) ve kesit çizgisinde tavan kenarı yok: içi görünür */
  const YF = YC - 0.5 * R, ZF = Math.sqrt(1 - 0.25) * R * 0.98;
  kutu(X1 - X0 + 1.2, 0.08, ZF * 2, M.ic, (X0 + X1) / 2 + 0.6, YF - 0.04, 0, ucak);
  /* uzak duvarda pencereler (içten, gök mavisi ışık) */
  for (let x = X0 + 0.5; x < X1 - 0.2; x += 0.62) ekle(new THREE.PlaneGeometry(0.26, 0.36), M.isik(0xcfe6ea), x, YC + 0.18, -R * 0.965, ucak, { golge: false });
  /* bölme duvarları: kapı boşluklu */
  const duvarY = YC + KES * R;
  for (const x of SINIR.slice(1, -1)) {
    const h = duvarY - YF, zz = ZF;
    kutu(0.06, h, zz - 0.36, M.ic, x, YF + h / 2, -(zz + 0.36) / 2, ucak); kutu(0.06, h, zz - 0.36, M.ic, x, YF + h / 2, (zz + 0.36) / 2, ucak);
    kutu(0.07, 0.02, zz * 2, M.petrol, x, duvarY, 0, ucak, { golge: false });
  }
  /* kanatlar, motorlar, kuyruk dikmesi, yatay dengeleyiciler, iniş takımı */
  const kanatSekli = (kok, uc, acik, ok) => { const s = new THREE.Shape(); s.moveTo(kok[0], 0); s.lineTo(kok[1], 0); s.lineTo(kok[1] - ok + (kok[1] - kok[0] - uc) * 0.2, acik); s.lineTo(kok[1] - ok + (kok[1] - kok[0] - uc) * 0.2 - uc, acik); s.closePath(); return s; };
  for (const yon of [1, -1]) {
    const g = new THREE.ExtrudeGeometry(kanatSekli([0.1, 2.9], 0.9, 3.9, 2.2), { depth: 0.12, bevelEnabled: false }); g.rotateX(Math.PI / 2 * yon);
    ekle(g, M.govde, 0, YC - 0.62 * R + (yon > 0 ? 0.12 : 0), yon * 0.9 * R, ucak);
    const mz = yon * 2.1;
    ekle(new THREE.CylinderGeometry(0.4, 0.34, 1.5, 28), M.govde, 1.3, YC - 0.62 * R - 0.48, mz, ucak, { rz: Math.PI / 2 });
    ekle(new THREE.CylinderGeometry(0.33, 0.33, 0.04, 28), M.koyu, 2.06, YC - 0.62 * R - 0.48, mz, ucak, { rz: Math.PI / 2, golge: false });
    kutu(0.9, 0.3, 0.08, M.gri, 1.25, YC - 0.62 * R - 0.15, mz, ucak);
    ekle(new THREE.CylinderGeometry(0.401, 0.401, 0.12, 28), M.petrol, 1.75, YC - 0.62 * R - 0.48, mz, ucak, { rz: Math.PI / 2, golge: false });
    const st = new THREE.ExtrudeGeometry(kanatSekli([0, 1.5], 0.55, 1.7, 0.9), { depth: 0.07, bevelEnabled: false }); st.rotateX(Math.PI / 2 * yon);
    ekle(st, M.govde, X0 - 2.7, YC + 0.38 + (yon > 0 ? 0.07 : 0), yon * 0.22, ucak);
  }
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(2.1, 0); fin.lineTo(0.75, 2.4); fin.lineTo(-0.1, 2.4); fin.closePath();
  ekle(new THREE.ExtrudeGeometry(fin, { depth: 0.1, bevelEnabled: false }), M.petrol, X0 - 2.9, YC + 0.45, -0.05, ucak);
  kutu(1.25, 0.24, 0.115, M.sari, X0 - 2.15, YC + 1.5, 0, ucak, { golge: false });
  for (const [x, z] of [[X1 + 0.4, 0], [0.9, 0.85], [0.9, -0.85]]) { sil(0.05, 0.05, 0.7, M.celik, x, 0.5, z, ucak); ekle(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 18), M.koyu, x, 0.2, z, ucak, { rx: Math.PI / 2 }); }

  /* ── insanlar ── */
  const kisi = (x, z, renk, eb = ucak, otur = false) => { const g = new THREE.Group(); g.position.set(x, YF, z); const boy = otur ? 0.16 : 0.32;
    ekle(new THREE.CapsuleGeometry(0.11, boy, 4, 10), std(renk, 0.6), 0, 0.11 + boy / 2 + (otur ? 0.16 : 0), 0, g); kure(0.1, M.ten, 0, 0.11 * 2 + boy + 0.1 + (otur ? 0.16 : 0), 0, g); eb.add(g); return g; };
  const sandalye = (x, z, ry = 0, mat = M.petrolKoyu) => { const g = new THREE.Group(); g.position.set(x, YF, z); g.rotation.y = ry; kutu(0.26, 0.05, 0.26, mat, 0, 0.2, 0, g); kutu(0.26, 0.26, 0.04, mat, 0, 0.34, -0.12, g); for (const [a, b] of [[-0.1, -0.1], [0.1, -0.1], [-0.1, 0.1], [0.1, 0.1]]) kutu(0.03, 0.2, 0.03, M.koyu, a, 0.1, b, g); ucak.add(g); return g; };
  const masa = (x, z, w, d, mat = M.gri) => { kutu(w, 0.05, d, mat, x, YF + 0.42, z); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) kutu(0.04, 0.4, 0.04, M.koyu, x + a * (w / 2 - 0.05), YF + 0.2, z + b * (d / 2 - 0.05)); };
  const orta = (n) => (SINIR[n - 1] + SINIR[n]) / 2;   /* n: 1 Etkinlik … 5 Tasarım */
  const canli = [];

  /* 1 · kokpit: iki koltuk, gösterge paneli (ışıklı ekranlar), iki pilot */
  { const x = X1 + 0.55;
    for (const z of [-0.36, 0.36]) { kutu(0.34, 0.08, 0.34, M.koyu, x, YF + 0.22, z, ucak); kutu(0.08, 0.5, 0.34, M.koyu, x - 0.17, YF + 0.45, z, ucak); }
    kisi(x - 0.02, -0.36, RENK.petrol, ucak, true); kisi(x - 0.02, 0.36, RENK.petrol, ucak, true);
    kutu(0.12, 0.36, 1.2, M.koyu, x + 0.72, YF + 0.5, 0, ucak, { rz: -0.35 });
    for (const [z, renk] of [[-0.38, 0x2fb7c7], [-0.12, 0xf2c200], [0.12, 0x2fb7c7], [0.38, 0x7fd4a0]]) ekle(new THREE.PlaneGeometry(0.2, 0.15), M.isik(renk), x + 0.65, YF + 0.56, z, ucak, { ry: -Math.PI / 2, rz: 0, golge: false }).rotation.set(0, -Math.PI / 2, 0.35);
  }
  /* 2 · Etkinlik: sahne, mikrofon, konuşmacı, iki sıra sandalye ve izleyiciler, uzak duvarda süs ışıkları */
  { const x = orta(1);
    kutu(0.9, 0.14, 0.7, M.petrol, x + 0.5, YF + 0.07, -0.5, ucak); sil(0.015, 0.015, 0.5, M.koyu, x + 0.3, YF + 0.39, -0.34, ucak); kure(0.04, M.koyu, x + 0.3, YF + 0.66, -0.34, ucak);
    kisi(x + 0.62, -0.52, RENK.sari).position.y = YF + 0.14;
    for (const [dx, dz] of [[-0.55, -0.05], [-0.55, 0.35], [-0.1, -0.05], [-0.1, 0.35]]) sandalye(x + dx, dz, -Math.PI / 2 - 0.5);
    kisi(x - 0.55, 0.35, RENK.petrol, ucak, true); kisi(x - 0.1, -0.05, RENK.govde, ucak, true);
    for (let k = 0; k < 7; k++) canli.push({ tur: 'isik', m: kure(0.035, M.isik(0xf2c200), x - 0.85 + k * 0.28, YC + 0.08 - Math.sin((k / 6) * Math.PI) * 0.12, -R * 0.9, ucak), k });
  }
  /* 3 · Ar-Ge: tezgâh, dizüstü, 3B yazıcı, uçan dron */
  { const x = orta(2);
    masa(x - 0.1, -0.45, 1.2, 0.5);
    kutu(0.32, 0.02, 0.22, M.koyu, x - 0.4, YF + 0.455, -0.45); ekle(new THREE.PlaneGeometry(0.3, 0.2), M.isik(0x9fd8df), x - 0.4, YF + 0.56, -0.56, ucak, { golge: false, rx: -0.25 });
    kutu(0.34, 0.4, 0.3, M.koyu, x + 0.25, YF + 0.65, -0.45); kutu(0.24, 0.2, 0.22, M.cam, x + 0.25, YF + 0.66, -0.43); const parca = kutu(0.08, 0.08, 0.08, M.sari, x + 0.25, YF + 0.6, -0.43);
    kisi(x - 0.35, 0.05, RENK.sari);
    const dron = new THREE.Group(); dron.position.set(x + 0.1, YC + 0.1, 0.25); ucak.add(dron);
    kutu(0.18, 0.06, 0.18, M.petrol, 0, 0, 0, dron); kutu(0.56, 0.025, 0.04, M.koyu, 0, 0, 0, dron, { ry: Math.PI / 4 }); kutu(0.56, 0.025, 0.04, M.koyu, 0, 0, 0, dron, { ry: -Math.PI / 4 });
    const pervaneler = [];
    for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const p = ekle(new THREE.BoxGeometry(0.22, 0.008, 0.025), M.koyu, a * 0.2, 0.045, b * 0.2, dron, { golge: false }); pervaneler.push(p); }
    canli.push({ tur: 'dron', dron, pervaneler, y0: YC + 0.1 }, { tur: 'yazici', m: parca, x0: x + 0.25 });
  }
  /* 4 · Sponsorluk: kurdeleli koliler, görüşme masası, iki kişi, kupa */
  { const x = orta(3);
    for (const [dx, dy, dz, s] of [[-0.55, 0, -0.5, 0.36], [-0.2, 0, -0.55, 0.3], [-0.4, 0.36, -0.5, 0.28]]) { kutu(s, s, s, M.kraft, x + dx, YF + dy + s / 2, dz); kutu(s + 0.01, s + 0.01, 0.06, M.petrol, x + dx, YF + dy + s / 2, dz); kutu(0.06, s + 0.012, s + 0.012, M.petrol, x + dx, YF + dy + s / 2, dz); }
    masa(x + 0.35, 0.1, 0.5, 0.5, M.petrol); kutu(0.2, 0.01, 0.14, M.govde, x + 0.35, YF + 0.45, 0.1);
    kisi(x + 0.02, 0.1, RENK.koyu); kisi(x + 0.68, 0.1, RENK.sari);
    sil(0.07, 0.04, 0.14, std(RENK.sari, 0.25, 0.6), x + 0.45, YF + 0.52, -0.45); kutu(0.14, 0.05, 0.14, M.koyu, x + 0.45, YF + 0.45, -0.45); masa(x + 0.45, -0.45, 0.3, 0.3);
  }
  /* 5 · Tanıtım: tripodda kamera, halka ışık, kişi, paylaşım ekranı (uzak duvarda), megafon */
  { const x = orta(4);
    for (const a of [0, 2.1, 4.2]) sil(0.012, 0.012, 0.6, M.koyu, x + 0.35 + Math.cos(a) * 0.1, YF + 0.29, 0.25 + Math.sin(a) * 0.1, ucak, { rz: Math.cos(a) * 0.18, rx: -Math.sin(a) * 0.18 });
    kutu(0.22, 0.16, 0.14, M.koyu, x + 0.35, YF + 0.66, 0.25); ekle(new THREE.CylinderGeometry(0.06, 0.07, 0.14, 16), M.koyu, x + 0.23, YF + 0.66, 0.25, ucak, { rz: Math.PI / 2 });
    const kayit = kure(0.025, M.isik(0xa4262c), x + 0.42, YF + 0.76, 0.25, ucak);
    const halka = ekle(new THREE.TorusGeometry(0.2, 0.025, 8, 32), M.isik(0xfff6dd), x + 0.05, YF + 0.75, -0.25, ucak, { ry: Math.PI / 2, golge: false });
    sil(0.012, 0.012, 0.55, M.koyu, x + 0.05, YF + 0.27, -0.25, ucak);
    kisi(x - 0.45, 0.05, RENK.petrol);
    const ekran = tuval(192, 256, (g, w, h) => { g.fillStyle = '#141414'; g.fillRect(0, 0, w, h); const r = ['#056b7a', '#f2c200', '#dfeaeb', '#a4262c', '#f8f8f6', '#03525e']; for (let i = 0; i < 9; i++) { g.fillStyle = r[(i * 5) % 6]; g.fillRect(14 + (i % 3) * 58, 50 + Math.floor(i / 3) * 62, 52, 56); } g.fillStyle = '#f2c200'; g.font = '700 22px Jost, sans-serif'; g.fillText('@ituuumk', 16, 34); });
    ekle(new THREE.PlaneGeometry(0.62, 0.82), new THREE.MeshBasicMaterial({ map: ekran, toneMapped: false }), x - 0.15, YC - 0.05, -R * 0.94, ucak, { golge: false });
    ekle(new THREE.CylinderGeometry(0.03, 0.11, 0.26, 16, 1, true), M.sari, x - 0.62, YF + 0.5, 0.32, ucak, { rz: Math.PI / 2 + 0.3 });
    canli.push({ tur: 'kayit', m: kayit }, { tur: 'halka', m: halka });
  }
  /* 6 · Tasarım: şövalede afiş, standda kulüp tişörtü, boya kutuları, tasarımcı */
  { const x = orta(5);
    const afis = tuval(192, 256, (g, w, h) => { g.fillStyle = '#f8f8f6'; g.fillRect(0, 0, w, h); g.fillStyle = '#056b7a'; g.fillRect(0, h * 0.62, w, h * 0.38); g.fillStyle = '#f2c200'; g.beginPath(); g.arc(w * 0.7, h * 0.3, 34, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#141414'; g.beginPath(); g.moveTo(30, 150); g.lineTo(160, 108); g.lineTo(96, 150); g.closePath(); g.fill(); g.font = '700 26px Jost, sans-serif'; g.fillStyle = '#f8f8f6'; g.fillText('AESTRO', 22, 214); });
    const sovale = new THREE.Group(); sovale.position.set(x + 0.35, YF, -0.35); sovale.rotation.y = 0.5; ucak.add(sovale);
    for (const a of [-0.18, 0.18]) kutu(0.03, 0.95, 0.03, M.kraft, a, 0.47, 0, sovale, { rx: -0.12 });
    ekle(new THREE.PlaneGeometry(0.5, 0.66), std(0xffffff, 0.8, 0, { map: afis }), 0, 0.62, 0.04, sovale);
    const tisort = new THREE.Shape(); tisort.moveTo(-0.16, 0); tisort.lineTo(0.16, 0); tisort.lineTo(0.16, 0.26); tisort.lineTo(0.26, 0.2); tisort.lineTo(0.31, 0.3); tisort.lineTo(0.16, 0.42); tisort.lineTo(-0.16, 0.42); tisort.lineTo(-0.31, 0.3); tisort.lineTo(-0.26, 0.2); tisort.lineTo(-0.16, 0.26); tisort.closePath();
    ekle(new THREE.ExtrudeGeometry(tisort, { depth: 0.04, bevelEnabled: false }), M.petrol, x - 0.5, YF + 0.42, -0.62, ucak); sil(0.012, 0.012, 0.86, M.koyu, x - 0.5, YF + 0.43, -0.66, ucak);
    ekle(new THREE.CircleGeometry(0.06, 3), M.sari, x - 0.5, YF + 0.65, -0.575, ucak, { golge: false, rz: Math.PI });
    for (const [dx, renk] of [[0, RENK.sari], [0.14, RENK.kirmizi], [0.28, RENK.petrol]]) sil(0.05, 0.05, 0.1, std(renk, 0.5), x - 0.1 + dx, YF + 0.05, 0.4, ucak);
    kisi(x + 0.2, 0.2, RENK.kirmizi);
  }

  /* bölme vurgusu: zeminde sarı ışıklı dikdörtgen (seçili bölme) */
  const vurguMat = new THREE.MeshBasicMaterial({ color: RENK.sari, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const vurgu = ekle(new THREE.PlaneGeometry(1, ZF * 2 - 0.1), vurguMat, 0, YF + 0.006, 0, ucak, { golge: false, rx: -Math.PI / 2 });
  const BOLME = [[X1, X1 + 1.6], ...SINIR.slice(1).map((s, i) => [s, SINIR[i]])];   /* [x0, x1] burundan */
  let secili = -1, vurguHedef = 0;
  function sec(i) {
    if (i === secili) return; secili = i;
    if (i >= 0) { const [a, b] = BOLME[i]; vurgu.scale.x = Math.abs(b - a) - 0.08; vurgu.position.x = (a + b) / 2; }
    vurguHedef = i >= 0 ? 0.32 : 0; imler.forEach((e, j) => e.toggleAttribute('data-secili', j === i)); secildi?.(i); ciz();
  }

  /* ── kamera: ortografik, sağ ön üstten; tuval oranına göre maket sığar ── */
  const kamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const yon = new THREE.Vector3(0.28, 1.1, 0.8).normalize(), hedef = new THREE.Vector3(-0.4, 1.2, 0);
  /* çerçeve gövdeye göre: kanat uçları ve kaide kenarı taşabilir (yakın maket çekimi) */
  const kutuSinir = new THREE.Box3(new THREE.Vector3(X0 - 3.3, 0, -2.9), new THREE.Vector3(X1 + 2.1, YC + R + 1.4, 2.9));
  let gen = 1, yuk = 1;
  function boyutla() {
    gen = tuvalEl.clientWidth || 1; yuk = tuvalEl.clientHeight || 1;
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(gen, yuk, false);
    kamera.position.copy(hedef).addScaledVector(yon, 40); kamera.lookAt(hedef); kamera.updateMatrixWorld();
    /* sınır kutusunun köşeleri kamera uzayında → en dar sığan çerçeve */
    const ters = kamera.matrixWorldInverse, v = new THREE.Vector3(); let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let k = 0; k < 8; k++) { v.set(k & 1 ? kutuSinir.max.x : kutuSinir.min.x, k & 2 ? kutuSinir.max.y : kutuSinir.min.y, k & 4 ? kutuSinir.max.z : kutuSinir.min.z).applyMatrix4(ters); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
    const oran = gen / yuk, w = x1 - x0, h = y1 - y0, pay = 1.02;
    let yw = w / 2 * pay, yh = h / 2 * pay; if (yw / yh > oran) yh = yw / oran; else yw = yh * oran;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    Object.assign(kamera, { left: cx - yw, right: cx + yw, top: cy + yh, bottom: cy - yh }); kamera.updateProjectionMatrix();
    ciz();
  }
  /* numaralar: bölmenin kesit çizgisi üstü */
  const imNokta = BOLME.map(([a, b], i) => new THREE.Vector3((a + b) / 2 + (i === 0 ? 0.1 : 0), YC + KES * R + 0.25, -R * 1.05));
  function imleriKoy() { const v = new THREE.Vector3(); imler.forEach((e, i) => { v.copy(imNokta[i]); ucak.localToWorld(v); v.project(kamera); e.style.transform = `translate(${((v.x + 1) / 2 * gen).toFixed(1)}px, ${((1 - v.y) / 2 * yuk).toFixed(1)}px)`; }); }

  let zaman = 0, dongu = 0, gorunur = false;
  function ciz() {
    const t = zaman;
    for (const c of canli) {
      if (c.tur === 'dron') { c.dron.position.y = c.y0 + Math.sin(t * 2.2) * 0.06; c.dron.rotation.y = Math.sin(t * 0.6) * 0.5; c.pervaneler.forEach((p, i) => { p.rotation.y = t * 38 + i; }); }
      else if (c.tur === 'yazici') c.m.position.x = c.x0 + Math.sin(t * 3) * 0.07;
      else if (c.tur === 'isik') c.m.visible = az || ((Math.floor(t * 2) + c.k) % 3 !== 0);
      else if (c.tur === 'kayit') c.m.visible = az || Math.floor(t * 1.5) % 2 === 0;
      else if (c.tur === 'halka') c.m.material.color.setScalar(az ? 1 : 0.85 + 0.15 * Math.sin(t * 3));
    }
    vurguMat.opacity += (vurguHedef - vurguMat.opacity) * (az ? 1 : 0.2);
    ucak.rotation.y = az ? 0 : Math.sin(t * 0.25) * 0.025;
    renderer.render(sahne, kamera); imleriKoy();
  }
  function kare(t) { zaman = t / 1000; ciz(); dongu = gorunur && !az && !document.hidden ? requestAnimationFrame(kare) : 0; }
  const baslat = () => { if (!dongu && gorunur && !az) dongu = requestAnimationFrame(kare); };
  new IntersectionObserver(([x]) => { gorunur = x.isIntersecting; baslat(); if (az && gorunur) ciz(); }).observe(tuvalEl);
  document.addEventListener('visibilitychange', baslat);
  new ResizeObserver(boyutla).observe(tuvalEl);
  boyutla();
  tuvalEl.dataset.cizici = '3b';
  return { sec, ciz: () => ciz(), kamera, renderer };
}
