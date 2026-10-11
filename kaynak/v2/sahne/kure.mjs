/* KÜRE — EUROAVIA ağı, three r184. Kara noktaları (üye ülkeler daha açık), 40 grup, İstanbul'dan büyük daire yayları.
 * Döndürme durumu (bak) ve izdüşüm kure-ortak.mjs ile aynıdır; seçim/etiket mantığı sahne/ag.mjs'tedir.
 * Kendiliğinden dönmez: yalnız sürükleme, klavye ya da listeden seçim döndürür. */
import * as THREE from 'three';
import { maskeCoz, kuresel, yay } from './kure-ortak.mjs';
import { RENK } from './renk.mjs';

const KAMERA_Z = 2.75, FOV = 30;

const noktaTepe = /* glsl */`
attribute float aBoy; attribute vec3 aRenk; varying vec3 vRenk; varying float vYuz;
uniform float uDpr;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize(normalMatrix * position);
  vYuz = n.z; vRenk = aRenk;
  gl_PointSize = aBoy * uDpr;
  gl_Position = projectionMatrix * mv;
}`;
const noktaParca = /* glsl */`
varying vec3 vRenk; varying float vYuz;
void main(){
  vec2 p = gl_PointCoord - 0.5; if (dot(p, p) > 0.25) discard;
  float a = smoothstep(-0.05, 0.35, vYuz);
  gl_FragColor = vec4(vRenk, a);
  #include <colorspace_fragment>
}`;   /* three renkleri doğrusal uzayda tutar: çıkışta sRGB'ye çevir (yoksa koyu tonlar zeminde kaybolur) */

export function kureKur(tuval, { gruplar, merkez, bak, boyutDegisti }) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: tuval, antialias: true, alpha: true }); } catch { return null; }
  if (!renderer.getContext()) return null;
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const sahne = new THREE.Scene();
  const kamera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 20);
  kamera.position.set(0, 0, KAMERA_Z);
  const dunya = new THREE.Group();
  sahne.add(dunya);

  /* gövde: arka yüzdeki noktaları örter */
  dunya.add(new THREE.Mesh(new THREE.SphereGeometry(0.995, 64, 48), new THREE.MeshBasicMaterial({ color: RENK.kureGovde })));

  const nokMat = (dpr) => new THREE.ShaderMaterial({ vertexShader: noktaTepe, fragmentShader: noktaParca, transparent: true, uniforms: { uDpr: { value: dpr } } });
  const dpr0 = Math.min(devicePixelRatio || 1, 2);

  /* kara */
  const { konum, tur } = maskeCoz();
  const kara = new THREE.BufferGeometry();
  kara.setAttribute('position', new THREE.BufferAttribute(konum, 3));
  const renk = new Float32Array(tur.length * 3), boy = new Float32Array(tur.length);
  const c1 = new THREE.Color(RENK.kara), c2 = new THREE.Color(RENK.uyeKara);
  for (let i = 0; i < tur.length; i++) { const c = tur[i] === 2 ? c2 : c1; renk.set([c.r, c.g, c.b], 3 * i); boy[i] = tur[i] === 2 ? 2.4 : 2.0; }
  kara.setAttribute('aRenk', new THREE.BufferAttribute(renk, 3));
  kara.setAttribute('aBoy', new THREE.BufferAttribute(boy, 1));
  const karaMat = nokMat(dpr0);
  dunya.add(new THREE.Points(kara, karaMat));

  /* gruplar */
  const merkezG = gruplar.find((g) => g[0] === merkez);
  const mv = kuresel(merkezG[6], merkezG[7]);
  const gPos = new Float32Array(gruplar.length * 3), gRenk = new Float32Array(gruplar.length * 3), gBoy = new Float32Array(gruplar.length);
  const beyaz = new THREE.Color(RENK.lacivert), acik = new THREE.Color(RENK.petrol);
  gruplar.forEach((g, i) => {
    gPos.set(kuresel(g[6], g[7], 1.004), 3 * i);
    const ana = g[0] === merkez;
    const c = ana ? acik : beyaz; gRenk.set([c.r, c.g, c.b], 3 * i);
    gBoy[i] = ana ? 11 : g[1] === 'AS' ? 6 : 4.5;
  });
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
  gGeo.setAttribute('aRenk', new THREE.BufferAttribute(gRenk, 3));
  gGeo.setAttribute('aBoy', new THREE.BufferAttribute(gBoy, 1));
  const grupMat = nokMat(dpr0);
  const grupNok = new THREE.Points(gGeo, grupMat); grupNok.renderOrder = 3;
  dunya.add(grupNok);

  /* yaylar: hepsi tek LineSegments (soluk), seçili yay ayrı (parlak) */
  const yayNok = [];
  for (const g of gruplar) {
    if (g[0] === merkez) continue;
    const p = yay(mv, kuresel(g[6], g[7]));
    for (let i = 3; i < p.length; i += 3) yayNok.push(p[i - 3], p[i - 2], p[i - 1], p[i], p[i + 1], p[i + 2]);
  }
  const yGeo = new THREE.BufferGeometry(); yGeo.setAttribute('position', new THREE.Float32BufferAttribute(yayNok, 3));
  dunya.add(new THREE.LineSegments(yGeo, new THREE.LineBasicMaterial({ color: RENK.petrol, transparent: true, opacity: 0.28, depthWrite: false })));
  const seciliMat = new THREE.LineBasicMaterial({ color: RENK.lacivert, transparent: true, opacity: 0.95, depthWrite: false });
  let secili = null;
  const halka = new THREE.Mesh(new THREE.RingGeometry(0.022, 0.03, 32), new THREE.MeshBasicMaterial({ color: RENK.lacivert, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
  halka.visible = false; dunya.add(halka);

  let gen = 0, yuk = 0;
  function boyutla() {
    const r = tuval.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w === gen && h === yuk) return;
    gen = w; yuk = h;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
    boyutDegisti?.();
    karaMat.uniforms.uDpr.value = dpr; grupMat.uniforms.uDpr.value = dpr;
    kamera.aspect = w / h;
    /* dar kapta küre sığsın: düşey değil, dar kenar ölçü */
    kamera.fov = w < h ? (2 * Math.atan(Math.tan((FOV * Math.PI) / 360) / (w / h)) * 180) / Math.PI : FOV;
    kamera.updateProjectionMatrix();
    istek();
  }
  const ro = new ResizeObserver(boyutla); ro.observe(tuval);

  let bekliyor = false, gorunur = true;
  function kare() {
    bekliyor = false;
    dunya.rotation.set((bak.enlem * Math.PI) / 180, (-bak.boylam * Math.PI) / 180, 0, 'XYZ');
    renderer.render(sahne, kamera);
  }
  function istek() { if (!bekliyor && gorunur) { bekliyor = true; requestAnimationFrame(kare); } }

  const v3 = new THREE.Vector3();
  boyutla();
  return {
    istek,
    /** dünya vektörü → [ekran x, ekran y (CSS px), önde mi] */
    izdus(v) {
      dunya.rotation.set((bak.enlem * Math.PI) / 180, (-bak.boylam * Math.PI) / 180, 0, 'XYZ');
      dunya.updateMatrixWorld();
      kamera.updateMatrixWorld();          /* ilk çizimden önce (bölüm ekran dışındayken) de doğru izdüşüm */
      v3.set(v[0], v[1], v[2]).applyMatrix4(dunya.matrixWorld);
      const onde = v3.z > 0.12;
      v3.project(kamera);
      return [(v3.x * 0.5 + 0.5) * gen, (-v3.y * 0.5 + 0.5) * yuk, onde];
    },
    /** seçili hedef: { enlem, boylam } ya da null — İstanbul'dan yay + halka */
    vurgula(h) {
      if (secili) { dunya.remove(secili); secili.geometry.dispose(); secili = null; }
      halka.visible = !!h;
      if (h) {
        const hv = kuresel(h.enlem, h.boylam);
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(yay(mv, hv, 64), 3));
        secili = new THREE.Line(g, seciliMat); secili.renderOrder = 4; dunya.add(secili);
        halka.position.set(...kuresel(h.enlem, h.boylam, 1.006));
        halka.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...hv));   /* yerel uzayda yüzeye teğet */
      }
      istek();
    },
    gorunur(b) { gorunur = b; if (b) istek(); },
    dispose() { ro.disconnect(); renderer.dispose(); },
  };
}
