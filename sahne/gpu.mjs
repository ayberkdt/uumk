/* GPU — 3B sahneler (three.js, ~190 kB gzip) yüklenmeden önce donanım hızlandırmalı WebGL var mı? Tek kullanımlık küçük bir
 * bağlam açar, çizici adını okur, kapatır. Yazılımsal çizici (SwiftShader, llvmpipe, Microsoft Basic Render) ya da WebGL yoksa
 * false. webglVar(): yazılımsal da olsa WebGL var mı (kabin maketi bu durumda düşük kare hızıyla yine çizilir; WebGL hiç yoksa
 * poster kalır). ?webgl=1 zorlar (ekran görüntüsü araçları), ?webgl=0 kapatır.
 * (Antra Tech sitesindeki sahne/gpu.mjs ile aynı yöntem.) */
let sonuc = null, webgl = false;
export function donanimGpu() {
  if (sonuc !== null) return sonuc;
  const prm = new URLSearchParams(location.search).get('webgl');
  if (prm === '0') return (sonuc = false);
  if (prm === '1') return (webgl = sonuc = true);
  try {
    const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
    if (!gl) return (sonuc = false);
    webgl = true;
    const bilgi = gl.getExtension('WEBGL_debug_renderer_info');
    const ad = bilgi ? String(gl.getParameter(bilgi.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    sonuc = !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(ad);
  } catch { sonuc = false; }
  document.documentElement.dataset.cizici = sonuc ? 'donanim' : 'yazilim';
  return sonuc;
}

export const webglVar = () => donanimGpu() || webgl;
