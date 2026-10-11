/* BEKLEME 3B — gündemde kayda açık etkinlik yokken: kaide üstünde küçük bir havaalanı maketi (three.js r184, ortografik, gölgeli;
 * kabin maketiyle aynı dil). Pist, kenar ve yaklaşma ışıkları, kontrol kulesi (yanıp sönen ikaz), hangar, rüzgâr tulumu; bekleme
 * yörüngesinde dönen ve viraja yatan küçük bir yolcu uçağı, arkasında kesikli yörünge çizgisi. Ekranda değilse ya da sekme gizliyse
 * döngü durur; hareket azaltmada tek kare. WebGL yoksa null (kartta poster görüntüsü kalır). */
import * as THREE from '../vendor/three-r184/three.module.min.js';

const RENK = { kaide: 0x1a1a1a, petrol: 0x056b7a, petrolKoyu: 0x03525e, sari: 0xf2c200, beton: 0xdcdad3, asfalt: 0x2a2a27, beyaz: 0xf8f8f6, gri: 0xcfcdc6, kirmizi: 0xa4262c, cam: 0x9fd8df };

export function beklemeKur(tuvalEl, { az = false } = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: tuvalEl, antialias: true, alpha: true }); } catch { return null; }
  if (!renderer.getContext()) return null;
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  const sahne = new THREE.Scene();
  sahne.add(new THREE.HemisphereLight(0xf6f4ee, 0x2a3236, 1.4));
  const gunes = new THREE.DirectionalLight(0xfff6ea, 2.3);
  gunes.position.set(-5, 10, 6); gunes.castShadow = true; gunes.shadow.mapSize.set(1024, 1024);
  Object.assign(gunes.shadow.camera, { left: -8, right: 8, top: 6, bottom: -6, near: 1, far: 30 }); gunes.shadow.bias = -0.0008;
  sahne.add(gunes);

  const std = (renk, r = 0.6, m = 0.05) => new THREE.MeshStandardMaterial({ color: renk, roughness: r, metalness: m });
  const isik = (renk) => new THREE.MeshBasicMaterial({ color: renk, toneMapped: false });
  const ekle = (geo, mat, x, y, z, eb = sahne, { golge = true, rx = 0, ry = 0, rz = 0 } = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = golge; m.receiveShadow = true; eb.add(m); return m; };
  const kutu = (w, h, d, mat, x, y, z, eb, s) => ekle(new THREE.BoxGeometry(w, h, d), mat, x, y, z, eb, s);
  const sil = (r1, r2, h, mat, x, y, z, eb, s, seg = 20) => ekle(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, eb, s);

  /* kaide ve zemin */
  kutu(12, 0.4, 7, std(RENK.kaide, 0.75), 0, -0.2, 0, sahne, { golge: false });
  kutu(12.04, 0.05, 7.04, std(RENK.petrol), 0, 0.005, 0, sahne, { golge: false });
  kutu(11.8, 0.04, 6.8, std(RENK.beton, 0.9), 0, 0.04, 0, sahne, { golge: false });
  /* pist: asfalt, orta çizgi, eşik çizgileri, kenar ışıkları */
  kutu(10.6, 0.03, 1.3, std(RENK.asfalt, 0.85), 0, 0.075, 1.6, sahne, { golge: false });
  for (let x = -4.6; x <= 4.6; x += 0.9) kutu(0.42, 0.005, 0.06, std(RENK.beyaz), x, 0.093, 1.6, sahne, { golge: false });
  for (const sx of [-5, 5]) for (let k = -2; k <= 2; k++) kutu(0.28, 0.005, 0.12, std(RENK.beyaz), sx, 0.093, 1.6 + k * 0.2, sahne, { golge: false });
  const kenar = [];
  for (let x = -5.1; x <= 5.1; x += 0.85) for (const z of [0.92, 2.28]) kenar.push(ekle(new THREE.SphereGeometry(0.045, 8, 6), isik(RENK.sari), x, 0.12, z, sahne, { golge: false }));
  /* taksi yolu ve apron */
  kutu(0.7, 0.03, 1.7, std(0x8a8984, 0.85), 2.2, 0.07, 0.1, sahne, { golge: false });
  kutu(3.4, 0.03, 1.6, std(0x9a9893, 0.85), 2.4, 0.07, -1.6, sahne, { golge: false });
  kutu(0.04, 0.005, 1.7, std(RENK.sari), 2.2, 0.088, 0.1, sahne, { golge: false });
  /* kontrol kulesi */
  sil(0.32, 0.4, 2.2, std(RENK.beyaz, 0.5), 4.6, 1.15, -1.9);
  sil(0.62, 0.48, 0.12, std(RENK.gri), 4.6, 2.3, -1.9);
  sil(0.66, 0.56, 0.5, new THREE.MeshStandardMaterial({ color: RENK.cam, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.85 }), 4.6, 2.6, -1.9, sahne, {}, 8);
  sil(0.72, 0.62, 0.1, std(RENK.petrol), 4.6, 2.9, -1.9, sahne, {}, 8);
  sil(0.02, 0.02, 0.5, std(RENK.gri), 4.6, 3.2, -1.9);
  const ikaz = ekle(new THREE.SphereGeometry(0.07, 10, 8), isik(RENK.kirmizi), 4.6, 3.47, -1.9, sahne, { golge: false });
  /* hangar (yarım silindir), kapı */
  const hangar = new THREE.CylinderGeometry(1.1, 1.1, 2.4, 24, 1, false, 0, Math.PI); hangar.rotateZ(Math.PI / 2); hangar.rotateY(Math.PI / 2);
  ekle(hangar, std(RENK.beyaz, 0.55), -3.6, 0.06, -1.9);
  kutu(1.5, 0.95, 0.02, std(RENK.asfalt, 0.8), -3.6, 0.5, -0.69, sahne, { golge: false });
  kutu(2.2, 0.06, 0.06, std(RENK.petrol), -3.6, 1.12, -0.7, sahne, { golge: false });
  /* rüzgâr tulumu, ağaçlar */
  sil(0.02, 0.02, 0.9, std(RENK.gri), -5.2, 0.5, 0.2);
  const tulum = ekle(new THREE.ConeGeometry(0.12, 0.45, 12, 1, true), std(RENK.sari, 0.6), -5.0, 0.92, 0.2, sahne, { rz: Math.PI / 2 });
  for (const [x, z, s] of [[-1.2, -2.6, 1], [-0.5, -2.9, 0.8], [0.4, -2.7, 0.9], [-5.3, -2.7, 0.85]]) { sil(0.04, 0.05, 0.3, std(0x6a5a44, 0.9), x, 0.2, z); ekle(new THREE.ConeGeometry(0.26 * s, 0.7 * s, 10), std(RENK.petrolKoyu, 0.8), x, 0.35 + 0.35 * s, z); }

  /* bekleme yörüngesi: elips, kesikli çizgi */
  const RX = 3.6, RZ = 1.7, YY = 2.2, CX = -0.3, CZ = 0.3;
  const yol = []; for (let i = 0; i <= 96; i++) { const a = (i / 96) * Math.PI * 2; yol.push(new THREE.Vector3(CX + Math.cos(a) * RX, YY, CZ + Math.sin(a) * RZ)); }
  const cizgi = new THREE.Line(new THREE.BufferGeometry().setFromPoints(yol), new THREE.LineDashedMaterial({ color: RENK.petrol, dashSize: 0.18, gapSize: 0.14, transparent: true, opacity: 0.7 }));
  cizgi.computeLineDistances(); sahne.add(cizgi);
  /* küçük yolcu uçağı (burun +x yerelde) */
  const ucak = new THREE.Group(), govde = new THREE.Group(); ucak.add(govde); sahne.add(ucak); ucak.scale.setScalar(1.9);
  ekle(new THREE.CapsuleGeometry(0.11, 0.7, 6, 14), std(RENK.beyaz, 0.4, 0.1), 0, 0, 0, govde, { rz: Math.PI / 2 });
  kutu(0.24, 0.02, 1.1, std(RENK.beyaz, 0.45), -0.02, -0.03, 0, govde);
  kutu(0.12, 0.02, 0.42, std(RENK.beyaz, 0.45), -0.42, 0.02, 0, govde);
  kutu(0.16, 0.22, 0.02, std(RENK.petrol), -0.42, 0.13, 0, govde);
  for (const z of [-0.26, 0.26]) sil(0.04, 0.04, 0.16, std(RENK.gri, 0.4, 0.3), 0.04, -0.07, z, govde, { rz: Math.PI / 2 }, 12);
  const golgeYer = ekle(new THREE.CircleGeometry(0.6, 20), new THREE.MeshBasicMaterial({ color: 0x141414, transparent: true, opacity: 0.16, depthWrite: false }), 0, 0.09, 0, sahne, { golge: false, rx: -Math.PI / 2 });

  /* kamera */
  const kamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const yon = new THREE.Vector3(0.35, 0.95, 1).normalize(), hedef = new THREE.Vector3(0, 1.1, 0);
  const sinirK = new THREE.Box3(new THREE.Vector3(-6, -0.4, -2.6), new THREE.Vector3(6, 3, 3.5));
  let gen = 1, yuk = 1;
  function boyutla() {
    gen = tuvalEl.clientWidth || 1; yuk = tuvalEl.clientHeight || 1;
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(gen, yuk, false);
    kamera.position.copy(hedef).addScaledVector(yon, 30); kamera.lookAt(hedef); kamera.updateMatrixWorld();
    const v = new THREE.Vector3(); let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let k = 0; k < 8; k++) { v.set(k & 1 ? sinirK.max.x : sinirK.min.x, k & 2 ? sinirK.max.y : sinirK.min.y, k & 4 ? sinirK.max.z : sinirK.min.z).applyMatrix4(kamera.matrixWorldInverse); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
    let yw = (x1 - x0) / 2 * 1.02, yh = (y1 - y0) / 2 * 1.02; const oran = gen / yuk; if (yw / yh > oran) yh = yw / oran; else yw = yh * oran;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    Object.assign(kamera, { left: cx - yw, right: cx + yw, top: cy + yh, bottom: cy - yh }); kamera.updateProjectionMatrix();
    ciz(zaman);
  }
  let zaman = 0, dongu = 0, gorunur = false;
  function ciz(t) {
    const a = (az ? 1.1 : t * 0.55) % (Math.PI * 2);
    const x = CX + Math.cos(a) * RX, z = CZ + Math.sin(a) * RZ, dx = -Math.sin(a) * RX, dz = Math.cos(a) * RZ;
    ucak.position.set(x, YY, z); ucak.rotation.set(0, Math.atan2(-dz, dx), 0); govde.rotation.x = 0.42;   /* viraja yatış */
    golgeYer.position.set(x + 0.35, 0.09, z - 0.25);
    ikaz.visible = az || Math.floor(t * 1.4) % 2 === 0;
    const sira = Math.floor(t * 6);
    kenar.forEach((m, i) => { m.material.color.setHex(az || (i >> 1) % 12 !== sira % 12 ? RENK.sari : RENK.beyaz); });
    tulum.rotation.y = az ? 0 : Math.sin(t * 1.3) * 0.15;
    renderer.render(sahne, kamera);
  }
  function kare(t) { zaman = t / 1000; ciz(zaman); dongu = gorunur && !az && !document.hidden ? requestAnimationFrame(kare) : 0; }
  const baslat = () => { if (!dongu && gorunur && !az) dongu = requestAnimationFrame(kare); };
  new IntersectionObserver(([g]) => { gorunur = g.isIntersecting; baslat(); }).observe(tuvalEl);
  document.addEventListener('visibilitychange', baslat);
  new ResizeObserver(boyutla).observe(tuvalEl);
  boyutla();
  tuvalEl.dataset.cizici = '3b';
  return { ciz: () => ciz(zaman), renderer };
}
