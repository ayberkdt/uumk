/* KÂĞIT — açılış sahnesi (three r184): kulübün kâğıt uçak şablonu kaydırdıkça katlanır, uçak olur ve sağa uçar.
 * Katlama modeli: sahne/katlama.mjs (saf, Node'da sınanır). Bu dosya yalnız çizer.
 * İlerleme p ∈ [0, 1] dışarıdan verilir (yapışkan sahnenin kaydırma payı). Zaman çizelgesi ZAMAN'da; adım başlıkları HTML'de.
 * Ön yüz: CanvasTexture (logo, kulüp adı, kesikli katlama çizgileri ve adım numaraları); arka yüz düz kâğıt. */
import * as THREE from 'three';
import { modelKur, parcaKonum, sekilMerkezi, ADIMLAR, BOY } from './katlama.mjs';
import { sablonCiz, ZAMAN, pozHesapla, kameraAyari } from './kagit-ortak.mjs';

export function kagitKur(tuval, { logo, az = false } = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: tuval, antialias: true, alpha: true }); } catch { return null; }
  if (!renderer.getContext()) return null;
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const sahne = new THREE.Scene();
  const kamera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
  kamera.position.set(0, 0.15, 4.2);
  kamera.lookAt(0, 0, 0);
  sahne.add(new THREE.HemisphereLight(0xffffff, 0xb7c4c8, 1.45));   /* yüzler arasında ton farkı kalsın: kat yerleri okunur */
  const gunes = new THREE.DirectionalLight(0xffffff, 1.9);
  gunes.position.set(-1.6, 2.4, 3.2);
  sahne.add(gunes);

  const model = modelKur();
  /* geometri: her parça kendi köşeleriyle (düz gölgeleme), yelpaze üçgenleme (parçalar dışbükey) */
  let ucgen = 0;
  for (const p of model.parcalar) ucgen += p.org.length - 2;
  const konum = new Float32Array(ucgen * 9), uv = new Float32Array(ucgen * 6);
  let k = 0;
  for (const p of model.parcalar) for (let i = 1; i < p.org.length - 1; i++) for (const j of [0, i, i + 1]) {
    uv[2 * k] = p.org[j][0] + 0.5; uv[2 * k + 1] = p.org[j][1] / BOY; k++;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(konum, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const doku = new THREE.CanvasTexture(sablonCiz(document.createElement('canvas'), logo));
  doku.colorSpace = THREE.SRGBColorSpace; doku.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const on = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: doku, roughness: 0.92, metalness: 0, side: THREE.FrontSide }));
  const arka = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.95, metalness: 0, side: THREE.BackSide }));
  const ic = new THREE.Group(); ic.add(on, arka); ic.position.y = -BOY / 2;     // dönme merkezi kâğıdın ortası
  const kok = new THREE.Group(); kok.add(ic); sahne.add(kok);

  /* uçuş izi: kesikli çizgi, uçak kalktıktan sonra görünür */
  const izNok = new Float32Array(64 * 3);
  const izGeo = new THREE.BufferGeometry(); izGeo.setAttribute('position', new THREE.BufferAttribute(izNok, 3));
  const iz = new THREE.Line(izGeo, new THREE.LineDashedMaterial({ color: 0x056b7a, dashSize: 0.05, gapSize: 0.05, transparent: true, opacity: 0.55 }));
  iz.frustumCulled = false; sahne.add(iz);

  const gecici = [];
  function geometriYaz(ai, p) {
    let n = 0;
    for (const pr of model.parcalar) {
      const v = parcaKonum(pr, ai, p, gecici);
      for (let i = 1; i < v.length - 1; i++) for (const j of [0, i, i + 1]) { konum[n++] = v[j][0]; konum[n++] = v[j][1]; konum[n++] = v[j][2]; }
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
  }

  let sonP = -1, gen = 0, yuk = 0;
  function ciz(p) {
    if (p === sonP) return;
    sonP = p;
    const poz = pozHesapla(p);
    geometriYaz(poz.adim, poz.ilerleme);
    const m = sekilMerkezi(model, poz.adim, poz.ilerleme); ic.position.set(-m[0], -m[1], -m[2]);
    kok.position.set(...poz.konum);
    kok.quaternion.set(...poz.dondurme);
    kok.scale.setScalar(poz.olcek);
    /* iz: kalkış noktasından şimdiki konuma eğri */
    if (poz.iz.length) {
      poz.iz.forEach((q, i) => izNok.set(q, 3 * i));
      izGeo.setDrawRange(0, poz.iz.length); izGeo.attributes.position.needsUpdate = true; iz.computeLineDistances(); iz.visible = true;
    } else iz.visible = false;
    renderer.render(sahne, kamera);
  }
  function boyutla() {
    const r = tuval.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w === gen && h === yuk) return;
    gen = w; yuk = h;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    kamera.aspect = w / h;
    const k = kameraAyari(w, h);
    kamera.fov = k.fov;
    if (k.x || k.y) kamera.setViewOffset(w, h, -Math.round(w * k.x), -Math.round(h * k.y), w, h); else kamera.clearViewOffset();
    kamera.updateProjectionMatrix();
    const p = sonP; sonP = -1; ciz(Math.max(0, p));
  }
  const ro = new ResizeObserver(boyutla); ro.observe(tuval);
  boyutla();
  return { ciz, adimSayisi: ADIMLAR.length, zaman: ZAMAN, dispose() { ro.disconnect(); renderer.dispose(); doku.dispose(); } };
}
