/* MEYDAN 3B — "Kayıtlar ve duyurular" bölümünün başındaki geniş havaalanı maketi (three.js r184, ortografik, gölgeli; kabin
 * maketiyle aynı dil, maket-ortak.mjs). Uzakta pist, ortada paralel taksi yolu, önde apron ve terminal. Döngü (26 sn):
 * bir uçak soldan alçalıp piste iner, yavaşlar, hızlı çıkıştan taksi yoluna geçip sağdan çıkar; ardından başka bir uçak soldan
 * taksi edip piste girer, kalkar ve sağa tırmanır. Kapılarda iki uçak (yükleme bandı, bagaj arabası), dönen radar, yanıp sönen
 * kule ikazı, sırayla yanan yaklaşma ışıkları, rüzgâr tulumu, gölgesi zemine düşen bulutlar, havada bekleme turunda bir uçak.
 * Ekranda değilse ya da sekme gizliyse döngü durur; hareket azaltmada tek kare. WebGL yoksa null (poster görüntüsü kalır). */
import { THREE, RENK, cizici, isiklar, araclar, tuvalDoku, cerceve, dongu, birlestir, pikselOrani } from './maket-ortak.mjs';

const PIST_Z = -1.6, TAKSI_Z = 0.35, APRON_Z = 2.2, PERIYOT = 26;
const yumusa = (t) => t * t * (3 - 2 * t), ara = (a, b, t) => a + (b - a) * t, kis = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));

export function meydanKur(tuvalEl, { az = false } = {}) {
  const renderer = cizici(tuvalEl); if (!renderer) return null;
  const sahne = new THREE.Scene();
  isiklar(sahne, { boyut: 14 });
  const dunya = new THREE.Group(); sahne.add(dunya);
  const dinamik = new Set();
  const { std, isik, ekle, kutu, sil, kure, yuvarlak, kisi } = araclar(dunya, dinamik);
  const M = { beyaz: std(RENK.govde, 0.4, 0.1), petrol: std(RENK.petrol, 0.5, 0.1), petrolKoyu: std(RENK.petrolKoyu, 0.6), sari: std(RENK.sari, 0.45), gri: std(RENK.gri, 0.7),
    koyu: std(RENK.koyu, 0.55, 0.2), asfalt: std(RENK.asfalt, 0.9), cam: std(RENK.cam, 0.12, 0.2, { transparent: true, opacity: 0.8 }), lastik: std(0x222222, 0.9), celik: std(0xc9ccd0, 0.3, 0.6),
    agac: std(0x2f6b5c, 0.85), govdeA: std(0x6a5a44, 0.9) };

  /* ── zemin: kenarları kâğıda karışan çim ve beton ── */
  const GX = 30, GZ = 14;
  const zemin = tuvalDoku(1536, 720, (g, w, h) => {
    const yx = (x) => (x + GX / 2) / GX * w, yz = (z) => (z + GZ / 2) / GZ * h;
    g.fillStyle = '#c9d4c3'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#d9d7d0'; g.fillRect(yx(-11), yz(4.7), yx(11) - yx(-11), yz(6.4) - yz(4.7)); g.fillStyle = '#3a3a37'; g.fillRect(0, yz(5.45), w, yz(6.15) - yz(5.45));
    g.fillStyle = '#f2f2ef'; for (let x = 0; x < w; x += 46) g.fillRect(x, yz(5.8) - 1.5, 24, 3);
    for (let i = 0; i < 420; i++) { g.fillStyle = `rgba(40,70,60,${0.03 + (i % 4) * 0.012})`; g.beginPath(); g.ellipse((i * 431) % w, (i * 173) % h, 10 + (i % 5) * 6, 5 + (i % 3) * 3, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#d9d7d0'; g.fillRect(yx(-6.2), yz(APRON_Z - 1.1), yx(9) - yx(-6.2), yz(4.6) - yz(APRON_Z - 1.1));
    g.strokeStyle = 'rgba(20,20,20,.08)'; g.lineWidth = 2; for (let x = yx(-6.2); x <= yx(9); x += 40) { g.beginPath(); g.moveTo(x, yz(APRON_Z - 1.1)); g.lineTo(x, yz(4.6)); g.stroke(); }
    g.strokeStyle = '#f2c200'; g.lineWidth = 3; for (const gx of [-2.2, 2.4]) { g.beginPath(); g.moveTo(yx(gx), yz(TAKSI_Z + 0.4)); g.quadraticCurveTo(yx(gx), yz(APRON_Z - 0.4), yx(gx), yz(3.3)); g.stroke(); }
    const veri = g.getImageData(0, 0, w, h), d = veri.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const ax = Math.max(0, (Math.abs(x / w - 0.5) * 2 - 0.62) / 0.17), az2 = Math.max(0, (Math.abs(y / h - 0.47) * 2 - 0.6) / 0.36), r = Math.min(1, Math.hypot(ax, az2));
      d[(y * w + x) * 4 + 3] *= 1 - r * r * (3 - 2 * r);
    }
    g.putImageData(veri, 0, 0);
  });
  ekle(new THREE.PlaneGeometry(GX, GZ), std(0xffffff, 0.95, 0, { map: zemin, transparent: true, depthWrite: false }), 0, 0, 0, dunya, { golge: false, rx: -Math.PI / 2 });
  /* pist: asfalt, orta çizgi, eşik çizgileri, eşik numarası yerine sarı ok; kenar ışıkları, yaklaşma ışıkları */
  const pistDoku = tuvalDoku(2048, 96, (g, w, h) => {
    g.fillStyle = '#2f2f2c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(255,255,255,${0.015 + (i % 3) * 0.01})`; g.fillRect((i * 523) % w, (i * 37) % h, 30, 2); }
    g.fillStyle = '#f2f2ef'; for (let x = 160; x < w - 160; x += 72) g.fillRect(x, h / 2 - 2, 40, 4);
    for (const x0 of [24, w - 104]) for (let k = 0; k < 6; k++) g.fillRect(x0, 10 + k * 13.5, 80, 7);
    g.fillRect(200, 22, 70, 14); g.fillRect(200, h - 36, 70, 14); g.fillRect(w - 270, 22, 70, 14); g.fillRect(w - 270, h - 36, 70, 14);
  });
  ekle(new THREE.PlaneGeometry(22, 1.05), std(0xffffff, 0.85, 0, { map: pistDoku }), 0, 0.01, PIST_Z, dunya, { golge: false, rx: -Math.PI / 2 });
  ekle(new THREE.PlaneGeometry(22, 0.5), M.asfalt, 0, 0.008, TAKSI_Z, dunya, { golge: false, rx: -Math.PI / 2 });
  ekle(new THREE.PlaneGeometry(0.03, 22), M.sari, 0, 0.012, TAKSI_Z, dunya, { golge: false, rx: -Math.PI / 2, rz: Math.PI / 2 });
  for (const [x, a] of [[-9.6, 0], [3.4, -0.55], [8.6, 0]]) { const u = (TAKSI_Z - PIST_Z); ekle(new THREE.PlaneGeometry(0.5, u / Math.cos(a) + 0.2), M.asfalt, x - Math.tan(a) * u / 2, 0.009, (PIST_Z + TAKSI_Z) / 2, dunya, { golge: false, rx: -Math.PI / 2, rz: a }); }
  for (const gx of [-2.2, 2.4]) ekle(new THREE.PlaneGeometry(0.5, APRON_Z - TAKSI_Z - 0.6), M.asfalt, gx, 0.009, (TAKSI_Z + APRON_Z) / 2 - 0.3, dunya, { golge: false, rx: -Math.PI / 2 });
  const kenar = [];
  for (let x = -10.8; x <= 10.8; x += 0.9) for (const z of [PIST_Z - 0.58, PIST_Z + 0.58]) kenar.push(kure(0.04, isik(0xf2f2ef), x, 0.05, z, dunya, { golge: false }));
  const yaklasma = []; for (let k = 0; k < 5; k++) { kutu(0.04, 0.12, 0.04, M.koyu, -11.25 - k * 0.22, 0.06, PIST_Z, dunya); yaklasma.push(kure(0.05, isik(0xf2f2ef), -11.25 - k * 0.22, 0.14, PIST_Z, dunya, { golge: false })); }
  for (let x = -10; x <= 11; x += 1.1) kure(0.03, isik(0x3fa0e0), x, 0.04, TAKSI_Z + 0.32, dunya, { golge: false });

  /* ── terminal: uzun alçak bina, cam cephe, petrol çatı, iki körük ── */
  kutu(9.6, 0.7, 1.3, M.beyaz, 1.4, 0.35, 4.15); kutu(9.4, 0.42, 0.04, M.cam, 1.4, 0.4, 3.49);
  kutu(9.9, 0.1, 1.5, M.gri, 1.4, 0.75, 4.15); kutu(9.92, 0.05, 0.06, M.petrol, 1.4, 0.78, 3.42); kutu(9.92, 0.05, 0.06, M.petrol, 1.4, 0.78, 4.88);
  kutu(9.4, 0.36, 0.04, M.cam, 1.4, 0.36, 4.81); kutu(1.4, 0.06, 0.5, M.petrol, 1.4, 0.55, 5.05); for (const x of [0.8, 2.0]) sil(0.02, 0.02, 0.52, M.gri, x, 0.27, 5.25); for (let x = -3.2; x <= 6.0; x += 0.6) kutu(0.03, 0.44, 0.05, M.gri, x, 0.4, 3.47);
  kutu(1.6, 0.36, 0.9, M.beyaz, 1.4, 0.98, 4.2); kutu(1.62, 0.06, 0.92, M.gri, 1.4, 1.17, 4.2);
  const tabela = tuvalDoku(256, 48, (g, w, h) => { g.fillStyle = '#141414'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c200'; g.font = '700 30px Jost, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('İTÜ · UUMK', w / 2, h / 2 + 2); });
  ekle(new THREE.PlaneGeometry(1.3, 0.24), new THREE.MeshBasicMaterial({ map: tabela, toneMapped: false }), 1.4, 0.98, 4.655, dunya, { golge: false });
  for (const gx of [-2.2, 2.4]) { kutu(0.24, 0.22, 1.0, M.gri, gx + 0.55, 0.62, 3.0); sil(0.05, 0.05, 0.5, M.celik, gx + 0.55, 0.26, 2.6); kutu(0.3, 0.3, 0.3, M.beyaz, gx + 0.55, 0.62, 2.5); }
  /* kule: gövde, cam kabin, dönen radar, ikaz ışığı */
  sil(0.26, 0.34, 2.2, M.beyaz, 7.4, 1.1, 3.4); sil(0.52, 0.4, 0.1, M.gri, 7.4, 2.2, 3.4); sil(0.56, 0.46, 0.42, M.cam, 7.4, 2.46, 3.4, dunya, {}, 8); sil(0.6, 0.52, 0.08, M.petrol, 7.4, 2.71, 3.4, dunya, {}, 8);
  const radar = new THREE.Group(); radar.position.set(7.4, 2.95, 3.4); dunya.add(radar); sil(0.02, 0.02, 0.24, M.gri, 0, -0.1, 0, radar); kutu(0.42, 0.12, 0.03, M.koyu, 0, 0.04, 0, radar);
  const ikaz = kure(0.05, isik(0xff3030), 7.4, 2.8, 3.4, dunya, { golge: false });
  /* hangar: yarım silindir, açık kapıda küçük bir uçak */
  const hangar = new THREE.CylinderGeometry(1.2, 1.2, 2.6, 28, 1, true, 0, Math.PI); hangar.rotateZ(Math.PI / 2); hangar.rotateY(Math.PI / 2);
  ekle(hangar, std(RENK.govde, 0.5, 0.1, { side: THREE.DoubleSide }), -8.2, 0.02, 3.2);
  ekle(new THREE.CircleGeometry(1.2, 28, 0, Math.PI), M.koyu, -8.2, 0.02, 1.9, dunya, { golge: false }).scale.set(0.95, 0.95, 1);
  kutu(2.5, 0.08, 0.08, M.petrol, -8.2, 1.2, 1.92, dunya, { golge: false });
  for (const z of [2.5, 3.2, 3.9]) ekle(new THREE.TorusGeometry(1.21, 0.03, 6, 28, Math.PI), M.petrol, -8.2, 0.02, z, dunya, { golge: false });
  /* rüzgâr tulumu, ağaç sırası */
  sil(0.02, 0.02, 0.9, M.gri, -10.6, 0.45, -0.4); const tulum = ekle(new THREE.ConeGeometry(0.11, 0.42, 12, 1, true), std(RENK.turuncu, 0.6, 0, { side: THREE.DoubleSide }), -10.4, 0.85, -0.4, dunya, { rz: Math.PI / 2 });
  for (let k = 0; k < 16; k++) { const x = -11 + k * 1.45 + ((k * 37) % 5) * 0.12, z = -3.6 - ((k * 13) % 4) * 0.22, s = 0.75 + ((k * 7) % 5) * 0.08;
    sil(0.04, 0.05, 0.28, M.govdeA, x, 0.14, z); ekle(new THREE.ConeGeometry(0.28 * s, 0.75 * s, 9), M.agac, x, 0.28 + 0.37 * s, z); }
  for (const [x, z] of [[-6, 4.6], [-5.2, 4.9], [8.6, 4.6], [9.3, 4.3]]) { sil(0.04, 0.05, 0.25, M.govdeA, x, 0.12, z); kure(0.3, M.agac, x, 0.45, z); }

  /* ── uçaklar: aynı model, kuyruk rengi farklı ── */
  function ucak(kuyrukMat) {
    const u = new THREE.Group(), g = new THREE.Group(); u.add(g);
    ekle(new THREE.CapsuleGeometry(0.15, 1.15, 6, 16), M.beyaz, 0, 0.32, 0, g, { rz: Math.PI / 2 });
    ekle(new THREE.CapsuleGeometry(0.152, 1.0, 4, 16), M.petrol, -0.02, 0.29, 0, g, { rz: Math.PI / 2, golge: false }).scale.set(1, 0.25, 1);
    const kn = new THREE.Shape(); kn.moveTo(0.18, 0); kn.lineTo(-0.12, 0); kn.lineTo(-0.38, 0.78); kn.lineTo(-0.24, 0.78); kn.closePath();
    for (const y of [1, -1]) { const geo = new THREE.ExtrudeGeometry(kn, { depth: 0.03, bevelEnabled: false }); geo.rotateX(Math.PI / 2 * y); ekle(geo, M.beyaz, 0.05, 0.24 + (y > 0 ? 0.03 : 0), y * 0.1, g);
      sil(0.055, 0.05, 0.22, M.gri, 0.05, 0.17, y * 0.36, g, { rz: Math.PI / 2 }, 14); }
    const kk = new THREE.Shape(); kk.moveTo(0, 0); kk.lineTo(0.32, 0); kk.lineTo(0.1, 0.38); kk.lineTo(-0.04, 0.38); kk.closePath();
    ekle(new THREE.ExtrudeGeometry(kk, { depth: 0.025, bevelEnabled: false }), kuyrukMat, -0.74, 0.4, -0.012, g);
    for (const y of [1, -1]) { const geo = new THREE.ExtrudeGeometry(kn, { depth: 0.02, bevelEnabled: false }); geo.rotateX(Math.PI / 2 * y); geo.scale(0.5, 1, 0.38); ekle(geo, M.beyaz, -0.66, 0.36, y * 0.05, g); }
    for (const [x, z] of [[0.48, 0], [-0.02, 0.1], [-0.02, -0.1]]) ekle(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 10), M.lastik, x, 0.06, z, g, { rx: Math.PI / 2 });
    const yanip = kure(0.025, isik(0xff3030), 0, 0.48, 0, g, { golge: false });
    birlestir(g, new Set([yanip])); u.userData = { g, yanip }; dunya.add(u); return u;
  }
  const inen = ucak(M.petrol), kalkan = ucak(M.sari), bekleyen = ucak(M.petrolKoyu);
  const kapi = [ucak(M.petrol), ucak(std(RENK.kirmizi, 0.5))];
  kapi.forEach((u, i) => { u.position.set([-2.2, 2.4][i] + 0.05, 0, 2.15); u.rotation.y = -Math.PI / 2; });
  /* kapıdaki uçaklara bagaj: yükleme bandı ve gidip gelen bagaj arabası */
  for (const gx of [-2.2, 2.4]) { kutu(0.08, 0.04, 0.5, M.koyu, gx - 0.22, 0.17, 1.42, dunya, { rx: 0.4 }); kutu(0.18, 0.1, 0.3, M.sari, gx - 0.22, 0.06, 1.18); }
  const arabalar = [-2.2, 2.4].map((gx, i) => { const a = new THREE.Group(); dunya.add(a); yuvarlak(0.34, 0.12, 0.22, 0.05, M.sari, 0, 0.06, 0, a); kutu(0.12, 0.12, 0.2, M.cam, -0.06, 0.24, 0, a);
    kutu(0.32, 0.03, 0.2, M.gri, -0.38, 0.1, 0, a); kutu(0.12, 0.08, 0.1, std([RENK.petrol, RENK.kirmizi][i], 0.7), -0.42, 0.16, 0, a); kutu(0.1, 0.06, 0.1, M.koyu, -0.3, 0.15, 0, a);
    birlestir(a, new Set()); return { a, gx, faz: i * 3 }; });
  const insanlar = [[0.2, 5.2, RENK.sari], [0.55, 5.15, RENK.petrol], [3.5, 5.2, 0xf8f8f6], [-1.0, 5.22, RENK.kirmizi], [4.6, 5.18, RENK.petrolKoyu]].map(([x, z, renk], i) => ({ k: kisi(dunya, x, 0, z, { renk, olcek: 0.42, ry: i % 2 ? -Math.PI / 2 : Math.PI / 2 }), x0: x, faz: i * 1.7 }));
  /* terminal önündeki yolda akan arabalar */
  const yolArac = [[RENK.sari, 0, 1], [0xf8f8f6, 7, 1], [RENK.petrol, 3, -1], [RENK.kirmizi, 11, -1]].map(([renk, faz, yn]) => { const a = new THREE.Group(); dunya.add(a);
    yuvarlak(0.46, 0.12, 0.22, 0.06, std(renk, 0.45, 0.2), 0, 0.05, 0, a); kutu(0.24, 0.1, 0.2, M.cam, -0.02, 0.21, 0, a);
    for (const [p, q] of [[0.15, 0.1], [-0.15, 0.1], [0.15, -0.1], [-0.15, -0.1]]) ekle(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 10), M.lastik, p, 0.045, q, a, { rx: Math.PI / 2 });
    birlestir(a, new Set()); return { a, faz, yn }; });
  /* bulutlar: yumuşak küre kümeleri, gölgeleri zemine düşer */
  const bulutMat = std(0xffffff, 1, 0, { transparent: true, opacity: 0.92 });
  const bulutlar = [[-6, 2.5, 0.6, 0.9], [3, 2.8, 1.6, 0.75], [10, 2.6, -0.4, 0.85]].map(([x, y, z, s]) => { const b = new THREE.Group(); b.position.set(x, y, z); b.scale.setScalar(s); dunya.add(b);
    for (const [a, c, r] of [[0, 0, 0.55], [0.55, -0.1, 0.42], [-0.5, -0.12, 0.4], [0.2, 0.25, 0.38]]) { const m = kure(r, bulutMat, a, c, 0, b); m.castShadow = true; m.receiveShadow = false; m.scale.set(1.3, 0.8, 1); }
    birlestir(b, new Set()); return { b, x0: x }; });

  /* ── yollar ── */
  function yerlestir(u, x, y, z, yon, yunuslama = 0, yatis = 0) { u.position.set(x, y, z); u.rotation.set(0, yon, 0); u.userData.g.rotation.set(yatis, 0, yunuslama); }
  function inenKonum(t) {
    if (t < 7) { const k = yumusa(kis(t, 0, 7)); return [ara(-17, -5.5, kis(t, 0, 7)), ara(3.2, 0, kis(t, 0, 7) ** 0.9) + 0.0, PIST_Z, 0, 0.06 * (1 - k * 0.3), 0]; }
    if (t < 12) { const k = kis(t, 7, 12), s = 1 - (1 - k) ** 2; return [ara(-5.5, 3.0, s), 0, PIST_Z, 0, 0, 0]; }
    if (t < 14) { const k = yumusa(kis(t, 12, 14)); return [ara(3.0, 3.0 + (TAKSI_Z - PIST_Z) * 0.62, k), 0, ara(PIST_Z, TAKSI_Z, k), -0.55 * Math.sin(k * Math.PI), 0, 0]; }
    const k = kis(t, 14, 22); return [ara(4.2, 17, k), 0, TAKSI_Z, 0, 0, 0];
  }
  function kalkanKonum(t) {
    if (t < 12) return [-17, 0, TAKSI_Z, 0, 0, 0];
    if (t < 15.5) { const k = kis(t, 12, 15.5); return [ara(-15, -9.6, k), 0, TAKSI_Z, 0, 0, 0]; }
    if (t < 17) { const k = yumusa(kis(t, 15.5, 17)); return [-9.6 + Math.sin(k * Math.PI / 2) * 0.3, 0, ara(TAKSI_Z, PIST_Z, k), Math.PI / 2 * Math.sin(k * Math.PI), 0, 0]; }
    if (t < 17.8) return [-9.3, 0, PIST_Z, 0, 0, 0];
    if (t < 22) { const k = kis(t, 17.8, 22), s = k * k; return [ara(-9.3, 1.5, s), 0, PIST_Z, 0, 0.1 * kis(k, 0.85, 1), 0]; }
    const k = kis(t, 22, 26); return [ara(1.5, 17, k ** 0.85), 3.4 * k ** 1.3, PIST_Z, 0, 0.14, 0];
  }

  /* ── kamera ── */
  const kamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const yon = new THREE.Vector3(0.12, 1.0, 1.15).normalize(), hedef = new THREE.Vector3(0, 0.6, 0.6);
  const sinir = new THREE.Box3(new THREE.Vector3(-11.6, 0, -3.8), new THREE.Vector3(11.6, 1.6, 6.8));
  const cerGenis = cerceve(kamera, yon, hedef, sinir, 1.0), cerDar = cerceve(kamera, yon, hedef, new THREE.Box3(new THREE.Vector3(-6.5, 0, -3.2), new THREE.Vector3(8.2, 1.6, 6.8)), 1.0);
  let gen = 1, yuk = 1;
  function boyutla() {
    gen = tuvalEl.clientWidth || 1; yuk = tuvalEl.clientHeight || 1;
    renderer.setPixelRatio(pikselOrani()); renderer.setSize(gen, yuk, false);
    const cer = gen / yuk < 2.4 ? cerDar : cerGenis, { mx, my } = cer.olc(gen, yuk); cer.uygula(mx, my, 1); d.ciz();
  }

  function ciz(t0) {
    const t = az ? 9 : t0;
    const p = t % PERIYOT;
    const [ix, iy, iz, ir, ip] = inenKonum(p); yerlestir(inen, ix, iy, iz, ir, ip);
    const [kx, ky, kz, kr, kp] = kalkanKonum(p); yerlestir(kalkan, kx, ky, kz, kr, kp);
    const a = az ? 1.2 : t * 0.32; yerlestir(bekleyen, Math.cos(a) * 6.5 + 1, 2.4, Math.sin(a) * 2.0 + 0.6, Math.atan2(-Math.cos(a) * 2.2, -Math.sin(a) * 6.5), 0, -0.35);
    for (const u of [inen, kalkan, bekleyen, ...kapi]) u.userData.yanip.visible = az || (t * 1.1 + u.id * 0.37) % 1 < 0.15;
    radar.rotation.y = az ? 0.6 : t * 1.4;
    ikaz.visible = az || Math.floor(t * 1.4) % 2 === 0;
    const sira = Math.floor(t * 9) % 9; yaklasma.forEach((m, i) => { m.material.color.setHex(az || 4 - i === sira % 5 ? 0xffffff : 0x8a8a86); });
    tulum.rotation.y = az ? 0 : Math.sin(t * 1.3) * 0.18; tulum.rotation.x = az ? 0 : Math.sin(t * 2.1) * 0.06;
    arabalar.forEach(({ a: ar, gx, faz }) => { const s = (Math.sin((t + faz) * 0.45) + 1) / 2; ar.position.set(gx - 1.05, 0.02, ara(1.2, 3.05, s)); ar.rotation.y = -Math.PI / 2 + (Math.cos((t + faz) * 0.45) > 0 ? 0 : Math.PI); });
    insanlar.forEach(({ k, x0, faz }) => { const s = Math.sin(t * 0.25 + faz); k.g.position.x = x0 + s * 0.6; k.g.rotation.y = Math.cos(t * 0.25 + faz) > 0 ? Math.PI / 2 : -Math.PI / 2; const f = t * 6 + faz; k.solB.rotation.x = Math.sin(f) * 0.5; k.sagB.rotation.x = -Math.sin(f) * 0.5; });
    yolArac.forEach(({ a: ar, faz, yn }) => { const x = ((faz * 2.1 + (az ? 0 : t * 1.1)) % 22) - 11; ar.position.set(yn * x, 0.01, yn > 0 ? 5.98 : 5.62); ar.rotation.y = yn > 0 ? 0 : Math.PI; ar.visible = Math.abs(x) < 8.6; });
    bulutlar.forEach(({ b, x0 }) => { b.position.x = ((x0 + 14 + (az ? 0 : t * 0.25)) % 28) - 14; });
    renderer.render(sahne, kamera);
  }
  for (const o of [inen, kalkan, bekleyen, ...kapi, radar, ikaz, ...yaklasma, tulum, ...arabalar.map((a) => a.a), ...bulutlar.map((b) => b.b), ...yolArac.map((a) => a.a)]) dinamik.add(o);
  birlestir(dunya, dinamik);
  const d = dongu(tuvalEl, ciz, az);
  new ResizeObserver(boyutla).observe(tuvalEl);
  boyutla();
  tuvalEl.dataset.cizici = '3b';
  return { ciz: () => d.ciz(), renderer, kamera };
}
