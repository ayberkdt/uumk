/* TÜNEL — kahramandaki 3B rüzgâr tüneli (three r184).
 * NACA 2412 kanat kesiti açıklık boyunca uzatılır; üç açıklık düzleminde aynı akım çizgileri çizilir (akım iki boyutlu).
 * Çizgilerde duman darbeleri: aynı t'de salınan darbeler zaman çizgisi oluşturur (akim.mjs başlığı).
 * Hareket azaltmada darbeler durur; durağan kare yine zaman çizgilerini gösterir. Görünmezken çizim durur. */
import * as THREE from 'three';
import { RENK } from './renk.mjs';

const ACIKLIK = 2.4;                    // veter birimi
const DUZLEMLER = [-0.8, 0, 0.8];
const DONEM = 0.5;                      // darbe aralığı, c/V∞
const DONEM_SN = 1.6;                   // bir darbe aralığının ekrandaki süresi (zaman ölçeği; HUD'da yazılı)

const tepe = /* glsl */`
attribute float aT; attribute float aV; attribute float aK;
varying float vT; varying float vV; varying float vK; varying float vX;
void main(){ vT = aT; vV = aV; vK = aK; vX = position.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const parca = /* glsl */`
uniform float uZaman; uniform float uDonem; uniform vec3 uYavas; uniform vec3 uSerbest; uniform vec3 uHizli;
varying float vT; varying float vV; varying float vK; varying float vX;
void main(){
  float faz = fract(vT / uDonem - uZaman);
  float darbe = smoothstep(0.0, 0.015, faz) * (1.0 - smoothstep(0.03, 0.16, faz));
  vec3 renk = vV < 1.0 ? mix(uYavas, uSerbest, clamp((vV - 0.4) / 0.6, 0.0, 1.0)) : mix(uSerbest, uHizli, clamp((vV - 1.0) / 0.6, 0.0, 1.0));
  float kenar = smoothstep(-0.75, -0.45, vX) * (1.0 - smoothstep(1.55, 1.95, vX));
  float a = (0.2 + 0.8 * darbe) * vK * kenar;
  gl_FragColor = vec4(renk, a);
  #include <colorspace_fragment>
}`;

export function tunelKur(tuval, { az = false } = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: tuval, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { return null; }
  if (!renderer.getContext()) return null;
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const sahne = new THREE.Scene();
  const kamera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  kamera.position.set(2.15, 0.95, 3.55);
  const hedef = new THREE.Vector3(0.62, -0.06, 0);
  kamera.lookAt(hedef);

  sahne.add(new THREE.HemisphereLight(0xdfe8f0, 0x0a1220, 1.35));
  const anahtar = new THREE.DirectionalLight(0xffffff, 2.1); anahtar.position.set(1.5, 3, 4); sahne.add(anahtar);
  const arka = new THREE.DirectionalLight(0x9fb7cc, 0.6); arka.position.set(-2, 1, -3); sahne.add(arka);

  /* tünel tabanı: ince ızgara (ölçek: çizgiler 0,25 veter aralıklı) */
  const izgara = new THREE.Group();
  const izMat = new THREE.LineBasicMaterial({ color: RENK.cizgi, transparent: true, opacity: 0.55 });
  const izNok = [];
  const Y = -0.62;
  for (let x = -0.75; x <= 1.951; x += 0.25) izNok.push(x, Y, -1.4, x, Y, 1.4);
  for (let z = -1.25; z <= 1.251; z += 0.25) izNok.push(-0.75, Y, z, 1.95, Y, z);
  const izGeo = new THREE.BufferGeometry(); izGeo.setAttribute('position', new THREE.Float32BufferAttribute(izNok, 3));
  izgara.add(new THREE.LineSegments(izGeo, izMat));
  sahne.add(izgara);

  const kanatMat = new THREE.MeshStandardMaterial({ color: RENK.kanat, roughness: 0.48, metalness: 0.18 });
  let kanat = null;
  const cizgiMat = new THREE.ShaderMaterial({
    vertexShader: tepe, fragmentShader: parca, transparent: true, depthWrite: false,
    uniforms: { uZaman: { value: 0 }, uDonem: { value: DONEM }, uYavas: { value: new THREE.Color(RENK.akimYavas) },
      uSerbest: { value: new THREE.Color(RENK.akimSerbest) }, uHizli: { value: new THREE.Color(RENK.akimHizli) } },
  });
  let cizgiler = null;

  function veriYukle(r) {
    /* kanat: ekran çerçevesindeki profil çokgeni açıklık boyunca */
    const sekil = new THREE.Shape();
    for (let i = 0; i < r.kanat.length; i += 2) (i ? sekil.lineTo : sekil.moveTo).call(sekil, r.kanat[i], r.kanat[i + 1]);
    const geo = new THREE.ExtrudeGeometry(sekil, { depth: ACIKLIK, bevelEnabled: false, curveSegments: 1 });
    geo.translate(0, 0, -ACIKLIK / 2); geo.computeVertexNormals();
    if (kanat) { kanat.geometry.dispose(); kanat.geometry = geo; } else { kanat = new THREE.Mesh(geo, kanatMat); sahne.add(kanat); }

    /* akım çizgileri: tek LineSegments; uzak düzlem soluk (derinlik ipucu) */
    let toplam = 0;
    for (const c of r.cizgiler) toplam += Math.max(0, c.length / 4 - 1);
    toplam *= DUZLEMLER.length;
    const pos = new Float32Array(toplam * 6), aT = new Float32Array(toplam * 2), aV = new Float32Array(toplam * 2), aK = new Float32Array(toplam * 2);
    let k = 0;
    for (const z of DUZLEMLER) {
      const kat = z < 0 ? 0.45 : z === 0 ? 0.8 : 1;
      for (const c of r.cizgiler) {
        for (let i = 4; i < c.length; i += 4) {
          for (const j of [i - 4, i]) {
            pos[3 * k] = c[j]; pos[3 * k + 1] = c[j + 1]; pos[3 * k + 2] = z;
            aT[k] = c[j + 2]; aV[k] = c[j + 3]; aK[k] = kat; k++;
          }
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
    g.setAttribute('aV', new THREE.BufferAttribute(aV, 1));
    g.setAttribute('aK', new THREE.BufferAttribute(aK, 1));
    if (cizgiler) { cizgiler.geometry.dispose(); cizgiler.geometry = g; } else { cizgiler = new THREE.LineSegments(g, cizgiMat); cizgiler.renderOrder = 2; sahne.add(cizgiler); }
    istek();
  }

  /* boyut: geniş ekranda sahne sağa kayar (metin solda); görüş kaydırması kamerayı oynatmadan */
  let gen = 0, yuk = 0;
  function boyutla() {
    const r = tuval.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w === gen && h === yuk) return;
    gen = w; yuk = h;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    kamera.aspect = w / h;
    const oran = w / h, genis = oran > 1.25 && w > 700;   /* tek sütun düzende metin üstte: kaydırma yok */
    if (genis) kamera.setViewOffset(w, h, -Math.round(w * 0.2), 0, w, h); else kamera.clearViewOffset();
    /* yatay görüş açısı sabit (~37,6°, oran 1,6'da düşey 24°): dar ya da kare tuvalde kanat kırpılmaz */
    kamera.fov = Math.min(48, Math.max(22, (2 * Math.atan(0.34 / oran) * 180) / Math.PI));
    kamera.updateProjectionMatrix();
    istek();
  }
  const ro = new ResizeObserver(boyutla); ro.observe(tuval);

  let gorunur = true, cizimBekliyor = false, son = 0, zaman = 0.62, oynuyor = !az;
  function kare(t) {
    cizimBekliyor = false;
    const dt = son ? Math.min(0.05, (t - son) / 1000) : 0; son = t;
    if (oynuyor) zaman += dt / DONEM_SN;
    cizgiMat.uniforms.uZaman.value = zaman;
    renderer.render(sahne, kamera);
    if (oynuyor && gorunur && !document.hidden) istek();
  }
  function istek() { if (!cizimBekliyor) { cizimBekliyor = true; requestAnimationFrame(kare); } }
  document.addEventListener('visibilitychange', () => { son = 0; if (!document.hidden) istek(); });

  boyutla();
  return {
    veriYukle,
    gorunur(b) { gorunur = b; son = 0; if (b) istek(); },
    oynat(b) { oynuyor = b && !az; son = 0; istek(); },
    zamanOlcegi: { DONEM, DONEM_SN },
    dispose() { ro.disconnect(); renderer.dispose(); },
  };
}
