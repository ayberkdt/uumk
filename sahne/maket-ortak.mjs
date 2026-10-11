/* MAKET ORTAK — kabin maketi (maket3b) ve gündem meydanı (meydan3b) için ortak parçalar: çizici kurulumu, malzemeler, şekil
 * yardımcıları, eklemli insan figürü (yürür, el sallar, oturur), tuval dokusu, sınır kutusuna sığan ortografik çerçeve ve
 * görünürlüğe bağlı çizim döngüsü (ekran dışında ya da sekme gizliyken durur; hareket azaltmada tek kare). */
import * as THREE from '../vendor/three-r184/three.module.min.js';

export { THREE };
/* telefon ve dokunmatik: piksel oranı ≤ 1,5, gölge haritası 1024, 3B sahneler 30 kare/sn (işlemci sınırlı) */
export const MOBIL = globalThis.matchMedia?.('(max-width: 760px), (pointer: coarse)').matches ?? false;
export const pikselOrani = () => Math.min(MOBIL ? 1.5 : 2, devicePixelRatio || 1);
export const RENK = { govde: 0xf8f8f6, ic: 0xecebe7, petrol: 0x056b7a, petrolKoyu: 0x03525e, sari: 0xf2c200, gri: 0xcfcdc6, koyu: 0x1a1a1a, kirmizi: 0xa4262c,
  kraft: 0xc29a68, beton: 0xdcdad3, asfalt: 0x2f2f2c, cam: 0x9fd8df, turuncu: 0xe8792b, yesil: 0x3f8f5a };
const TEN = [0xe8d3bd, 0xd9b48f, 0xb98a63, 0xf0dccb], SAC = [0x2a1d14, 0x5a3a22, 0x161616, 0xa8834a, 0x3b2a1e];

export function cizici(tuvalEl) {
  let r;
  try { r = new THREE.WebGLRenderer({ canvas: tuvalEl, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: new URLSearchParams(location.search).has('olc') }); } catch { return null; }
  if (!r.getContext()) return null;
  r.setClearColor(0x000000, 0); r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
  return r;
}

export function isiklar(sahne, { boyut = 11, golgeBoyu = MOBIL ? 1024 : 2048 } = {}) {
  sahne.add(new THREE.HemisphereLight(0xf6f4ee, 0x2a3236, 1.3));
  const anahtar = new THREE.DirectionalLight(0xfff3e2, 2.5);
  anahtar.position.set(-7, 15, 9); anahtar.castShadow = true; anahtar.shadow.mapSize.set(golgeBoyu, golgeBoyu);
  Object.assign(anahtar.shadow.camera, { left: -boyut, right: boyut, top: boyut, bottom: -boyut, near: 1, far: 50 });
  anahtar.shadow.bias = -0.0005; anahtar.shadow.normalBias = 0.03; anahtar.shadow.radius = 3;
  const dolgu = new THREE.DirectionalLight(0xdfeaeb, 0.55); dolgu.position.set(9, 6, 10);
  sahne.add(anahtar, dolgu);
  return anahtar;
}

export function araclar(varsayilan, dinamik = new Set()) {
  const onbellek = new Map();
  const std = (renk, roughness = 0.6, metalness = 0.05, ek = {}) => {
    const anah = Object.keys(ek).length ? null : `${renk}|${roughness}|${metalness}`;
    if (anah && onbellek.has(anah)) return onbellek.get(anah);
    const m = new THREE.MeshStandardMaterial({ color: renk, roughness, metalness, ...ek }); if (anah) onbellek.set(anah, m); return m;
  };
  const isik = (renk) => new THREE.MeshBasicMaterial({ color: renk, toneMapped: false });
  const ekle = (geo, mat, x, y, z, eb = varsayilan, { golge = true, rx = 0, ry = 0, rz = 0 } = {}) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = golge; m.receiveShadow = true; eb.add(m); return m; };
  const kutu = (w, h, d, mat, x, y, z, eb, s) => ekle(new THREE.BoxGeometry(w, h, d), mat, x, y, z, eb, s);
  const sil = (r1, r2, h, mat, x, y, z, eb, s, seg = 20) => ekle(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, eb, s);
  const kure = (r, mat, x, y, z, eb, s) => ekle(new THREE.SphereGeometry(r, 16, 12), mat, x, y, z, eb, s);
  /* yuvarlatılmış kutu: kaideler ve araç gövdeleri */
  const yuvarlak = (w, h, d, r, mat, x, y, z, eb, s) => {
    const sk = new THREE.Shape(), a = w / 2 - r, b = d / 2 - r;
    sk.moveTo(-a, -d / 2); sk.lineTo(a, -d / 2); sk.quadraticCurveTo(w / 2, -d / 2, w / 2, -b); sk.lineTo(w / 2, b); sk.quadraticCurveTo(w / 2, d / 2, a, d / 2);
    sk.lineTo(-a, d / 2); sk.quadraticCurveTo(-w / 2, d / 2, -w / 2, b); sk.lineTo(-w / 2, -b); sk.quadraticCurveTo(-w / 2, -d / 2, -a, -d / 2);
    const g = new THREE.ExtrudeGeometry(sk, { depth: h, bevelEnabled: false, curveSegments: 6 }); g.rotateX(-Math.PI / 2);
    return ekle(g, mat, x, y, z, eb, s);
  };

  /* eklemli kişi: kalça ve omuz eklemleri döner. Boy ≈ 0,62. ry: bakış yönü (0 = +z). Her eklem tek ağ: parçaların renkleri
   * köşe rengi olarak işlenir ve bütün kişiler tek malzemeyi paylaşır (kişi başına 6 çizim çağrısı; önce 12 ayrı ağdı). */
  let sira = 0;
  const kisiMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0.02 });
  const renkli = (parcalar) => {
    const liste = parcalar.map(([geo, renk, x, y, z, rx = 0]) => { const g = (geo.index ? geo.toNonIndexed() : geo); if (rx) g.rotateX(rx); g.translate(x, y, z);
      const c = new THREE.Color(renk).convertSRGBToLinear(), n = g.attributes.position.count, r = new Float32Array(n * 3); for (let i = 0; i < n; i++) r.set([c.r, c.g, c.b], i * 3); g.setAttribute('color', new THREE.BufferAttribute(r, 3)); return g; });
    const n = liste.reduce((t, g) => t + g.attributes.position.count, 0), at = { position: new Float32Array(n * 3), normal: new Float32Array(n * 3), color: new Float32Array(n * 3) };
    let i = 0; for (const g of liste) { for (const k of Object.keys(at)) at[k].set(g.attributes[k].array, i * 3); i += g.attributes.position.count; g.dispose(); }
    const geo = new THREE.BufferGeometry(); for (const k of Object.keys(at)) geo.setAttribute(k, new THREE.BufferAttribute(at[k], 3)); return geo;
  };
  function kisi(eb, x, y, z, { renk = RENK.petrol, alt = 0x2b2f33, ry = 0, otur = false, olcek = 1 } = {}) {
    const n = sira++, g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.scale.setScalar(olcek); eb.add(g); dinamik.add(g);
    const ten = TEN[n % TEN.length], sac = SAC[(n * 3) % SAC.length];
    const eklem = (eb2, px, py, parcalar, golge = true) => { const p = new THREE.Group(); p.position.set(px, py, 0); eb2.add(p); const m = new THREE.Mesh(renkli(parcalar), kisiMat); m.castShadow = golge && !MOBIL; m.receiveShadow = !MOBIL; p.add(m); return p; };
    const bacak = (sx) => eklem(g, sx, 0.27, [[new THREE.BoxGeometry(0.075, 0.25, 0.085), alt, 0, -0.125, 0], [new THREE.BoxGeometry(0.08, 0.04, 0.12), 0x1a1a1a, 0, -0.25, 0.02]]);
    const kol = (sx) => eklem(g, sx, 0.53, [[new THREE.CapsuleGeometry(0.03, 0.17, 3, 8), renk, 0, -0.1, 0], [new THREE.SphereGeometry(0.032, 10, 8), ten, 0, -0.21, 0]], false);
    const solB = bacak(-0.05), sagB = bacak(0.05);
    eklem(g, 0, 0, [[new THREE.CapsuleGeometry(0.095, 0.15, 4, 12), renk, 0, 0.42, 0]]);
    const bas = eklem(g, 0, 0.66, [[new THREE.SphereGeometry(0.085, 16, 12), ten, 0, 0, 0], [new THREE.SphereGeometry(0.09, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), sac, 0, 0.012, -0.012, -0.25]]);
    const solK = kol(-0.125), sagK = kol(0.125);
    if (otur) { g.position.y = y - 0.04; solB.rotation.x = sagB.rotation.x = -1.5; }
    return { g, solB, sagB, solK, sagK, bas, otur };
  }
  function yuru(k, faz, genlik = 0.55) {
    const s = Math.sin(faz) * genlik;
    k.solB.rotation.x = s; k.sagB.rotation.x = -s; k.solK.rotation.x = -s * 0.8; k.sagK.rotation.x = s * 0.8;
    k.bas.position.y = 0.66 + Math.abs(Math.cos(faz)) * 0.012;
  }
  return { std, isik, ekle, kutu, sil, kure, yuvarlak, kisi, yuru };
}

export function tuvalDoku(w, h, ciz) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); ciz(g, w, h, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  t.yeniden = (zaman) => { ciz(g, w, h, zaman); t.needsUpdate = true; };
  return t;
}

/* ortografik kamera: yon'dan bakar; sinir (Box3 ya da nokta dizisi) tuval oranında, pay kadar boşlukla sığar. odak({x,y}, z): kamera uzayında
 * merkez ve yakınlaşma; bölme seçilince yumuşakça oraya gider. */
export function cerceve(kamera, yon, hedef, sinir, pay = 1.04) {
  const ters = () => kamera.matrixWorldInverse;
  let yw = 1, yh = 1, mx = 0, my = 0;
  return {
    olc(gen, yuk) {
      kamera.position.copy(hedef).addScaledVector(yon, 40); kamera.lookAt(hedef); kamera.updateMatrixWorld();
      const v = new THREE.Vector3(); let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      const noktalar = Array.isArray(sinir) ? sinir : Array.from({ length: 8 }, (_, k) => new THREE.Vector3(k & 1 ? sinir.max.x : sinir.min.x, k & 2 ? sinir.max.y : sinir.min.y, k & 4 ? sinir.max.z : sinir.min.z));
      for (const n of noktalar) { v.copy(n).applyMatrix4(ters()); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
      const oran = gen / yuk; yw = (x1 - x0) / 2 * pay; yh = (y1 - y0) / 2 * pay; if (yw / yh > oran) yh = yw / oran; else yw = yh * oran;
      mx = (x0 + x1) / 2; my = (y0 + y1) / 2;
      return { yw, yh, mx, my };
    },
    uygula(cx, cy, z) { Object.assign(kamera, { left: cx - yw / z, right: cx + yw / z, top: cy + yh / z, bottom: cy - yh / z }); kamera.updateProjectionMatrix(); },
    kameraUzayi(v) { return v.clone().applyMatrix4(ters()); },
    get yari() { return { yw, yh, mx, my }; },
  };
}

/* duran parçaları birleştir: hareket etmeyen ağlar malzemelerine (ve gölge düşürüp düşürmemelerine) göre tek ağda toplanır;
 * dinamik kümesindeki nesneler ve altları dokunulmadan kalır. Çizim çağrısı yüzlerce azdan onlarcaya iner. */
export function birlestir(kok, dinamik) {
  kok.updateMatrixWorld(true);
  const ters = new THREE.Matrix4().copy(kok.matrixWorld).invert(), m4 = new THREE.Matrix4(), gruplar = new Map(), sok = [];
  kok.traverse((o) => {
    if (!o.isMesh || Array.isArray(o.material)) return;
    for (let p = o; p && p !== kok; p = p.parent) if (dinamik.has(p)) return;
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.applyMatrix4(m4.multiplyMatrices(ters, o.matrixWorld));
    const anah = o.material.uuid + '|' + o.castShadow;
    if (!gruplar.has(anah)) gruplar.set(anah, { mat: o.material, golge: o.castShadow, liste: [] });
    gruplar.get(anah).liste.push(g); sok.push(o);
  });
  for (const o of sok) o.parent.remove(o);
  for (const { mat, golge, liste } of gruplar.values()) {
    const n = liste.reduce((t, g) => t + g.attributes.position.count, 0), pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
    let i = 0;
    for (const g of liste) { const c = g.attributes.position.count; pos.set(g.attributes.position.array, i * 3); if (g.attributes.normal) nor.set(g.attributes.normal.array, i * 3); if (g.attributes.uv) uv.set(g.attributes.uv.array, i * 2); i += c; g.dispose(); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    const m = new THREE.Mesh(geo, mat); m.castShadow = golge; m.receiveShadow = true; kok.add(m);
  }
}

/* çizim döngüsü: görünürken ve sekme açıkken requestAnimationFrame; hareket azaltmada yalnız istenince tek kare */
export function dongu(tuvalEl, ciz, az) {
  let id = 0, gorunur = false, son = 0;
  let onceki = 0;
  const kare = (t) => { if (!MOBIL || t - onceki > 30) { onceki = t; son = t / 1000; ciz(son); } id = gorunur && !az && !document.hidden ? requestAnimationFrame(kare) : 0; };
  const baslat = () => { if (!id && gorunur && !az && !document.hidden) id = requestAnimationFrame(kare); };
  new IntersectionObserver(([g]) => { gorunur = g.isIntersecting; baslat(); if (az && gorunur) ciz(son); }).observe(tuvalEl);
  document.addEventListener('visibilitychange', baslat);
  return { ciz: () => ciz(son), get zaman() { return son; } };
}
