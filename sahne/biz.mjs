/* BİZ KİMİZ — 01 bölümünün davranışları; bölüme yaklaşınca site.mjs yükler (açılış JS bütçesi). Yüklenmeden önce de sayfa
 * çalışır: ilk kabin kartı HTML'de açık, "Tarihçemizi keşfet" düz bağlantı olarak tarihçeye atlar.
 * · Kimlik paneli: uçak İTÜ UUMK'dan AS Istanbul'a uçar (görününce ve üzerine gelince).
 * · "Tarihçemizi keşfet": düğmenin uçağı kalkar, sayfa tarihçeye kayar, varınca başlığın altında sarı çizgi uzar, odak başlığa geçer.
 * · Kabin turu: kart hep açık; görünürken 7 sn'de bir sonraki ekibe geçer (süre çubuğu CSS animasyonu, bitince ilerler; kartın
 *   üstündeyken durur). Kullanıcı bir ekip seçerse ya da durdurursa tur kapanır; hareket azaltmada baştan kapalı. WebGL varsa
 *   2,5B maket (sahne/maket3b.mjs) posterin yerine geçer. */
import { metin } from '../ceviri.mjs';

const $ = (s, k = document) => k.querySelector(s);
const $$ = (s, k = document) => [...k.querySelectorAll(s)];

export function bizKur({ az, prm, gozle }) {
  const maketEl = $('#maket'), kabinEl = $('#kabin'), imler = $$('.maket__imler > li', maketEl), kabinKart = $$('.kabin__kart', maketEl);
  const kabinSure = $('.kabin__sure', maketEl), kabinTur = $('.kabin__tur', maketEl), kabinBasvur = $('.kabin__basvur', maketEl), kabinNot = $('.kabin__not', maketEl);
  let maket = null, kabinSecili = 0, turAcik = !az, turGorunur = false;
  /* poster üstündeki düğme konumları (geniş ve dar poster, %): satır içi style yerine data-konum → CSS değişkeni */
  imler.forEach((l) => { const [x, y, xm, ym] = l.dataset.konum.split(' '); Object.entries({ x, y, xm, ym }).forEach(([k, v]) => l.style.setProperty('--' + k, v + '%')); });
  const kabinYaz = () => { kabinBasvur.textContent = metin(kabinSecili ? 'kabinBasvur' : 'kabinUyeOl'); kabinNot.textContent = metin(kabinSecili ? 'kabinNot' : 'kabinNotYonetim'); };
  function turYenile() {
    const calis = turAcik && turGorunur;
    maketEl.removeAttribute('data-tur'); void kabinSure.offsetWidth;
    if (calis) maketEl.setAttribute('data-tur', '');
    kabinEl.setAttribute('aria-live', calis ? 'off' : 'polite');
  }
  function kabinSec(i) {
    kabinSecili = i;
    imler.forEach((l, j) => l.firstElementChild.setAttribute('aria-pressed', String(j === i)));
    kabinKart.forEach((k, j) => k.toggleAttribute('data-secili', j === i));
    kabinYaz(); maket?.sec(i); turYenile();
  }
  const turKapat = () => { turAcik = false; kabinTur.setAttribute('aria-pressed', 'true'); };
  kabinSure.addEventListener('animationend', () => kabinSec((kabinSecili + 1) % 6));
  imler.forEach((l, i) => l.firstElementChild.addEventListener('click', () => { turKapat(); kabinSec(i); }));
  kabinEl.addEventListener('click', (e) => {
    const d = e.target.closest('[data-kabin]');
    if (d) { turKapat(); kabinSec((kabinSecili + +d.dataset.kabin + 6) % 6); }
    else if (e.target.closest('.kabin__tur')) { turAcik = !turAcik; kabinTur.setAttribute('aria-pressed', String(!turAcik)); turYenile(); }
  });
  if (az) kabinTur.setAttribute('aria-pressed', 'true');
  kabinYaz(); addEventListener('dil-degisti', kabinYaz);
  new IntersectionObserver(([x]) => { if (turGorunur !== x.isIntersecting) { turGorunur = x.isIntersecting; turYenile(); } }, { threshold: 0.4 }).observe(maketEl);
  gozle(maketEl, { yakin: '700px', ilk: async () => {
    if (!(await import('./gpu.mjs')).donanimGpu()) return;
    maket = (await import('./maket3b.mjs')).maketKur($('#maket-tuval'), { imler, az, secildi: (i) => { if (i >= 0) { turKapat(); kabinSec(i); } } });
    if (!maket) return;
    maketEl.dataset.cizici = '3b'; maket.sec(prm.has('genel') ? -1 : kabinSecili); if (prm.has('olc')) globalThis.__maket = maket;
  } });

  const kimlik = $('.kimlik'), kimlikUcus = $('#kimlik-yay animateMotion');
  const kimlikUc = () => { if (az || !kimlikUcus?.beginElement) return; kimlik.dataset.ucus = ''; kimlikUcus.beginElement(); };
  gozle(kimlik, { yakin: '-25% 0px', ilk: kimlikUc });
  kimlik.addEventListener('pointerenter', kimlikUc);
  const tarihceEl = $('#tarihce');
  $('#tarihce-git').addEventListener('click', (e) => {
    e.preventDefault();
    const dugme = e.currentTarget; dugme.classList.add('kalkis');
    setTimeout(() => {
      tarihceEl.scrollIntoView({ behavior: az ? 'auto' : 'smooth', block: 'start' }); history.replaceState(null, '', '#tarihce');
      setTimeout(() => { tarihceEl.classList.add('varis'); $('#tarihce-baslik').focus({ preventScroll: true }); dugme.classList.remove('kalkis'); }, az ? 0 : 700);
    }, az ? 0 : 260);
  });
  new IntersectionObserver(([x]) => { if (x.isIntersecting) tarihceEl.classList.add('varis'); }, { rootMargin: '0px 0px -40% 0px' }).observe($('#tarihce-baslik'));
}
