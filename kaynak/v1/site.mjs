/* UUMK — sayfa denetleyicisi.
 * Açılışta: üst şerit, irtifa şeridi + gökyüzü (kaydırma = tırmanış), kalkış panosu. Tembel: rüzgâr tüneli (kahraman görünür
 * olunca; donanım GPU'su varsa three, yoksa 2B), ağ küresi (bölüme 600 px kala). Döngülü sahneler ekran dışında durur.
 * URL: ?az=1 (azaltılmış hareket) · ?webgl=0|1 (2B'yi / 3B'yi zorla) · #etkinlik-<id> (biniş kartı açık gelir) */
import { irtifaKur } from './sahne/irtifa.mjs';
import { gokyuzuKur } from './sahne/gokyuzu.mjs';
import { panoKur } from './sahne/pano.mjs';
import { donanimGpu } from './sahne/gpu.mjs';

const AZ = document.documentElement.classList.contains('az');
const $ = (s, k = document) => k.querySelector(s);
const $$ = (s, k = document) => [...k.querySelectorAll(s)];

function gozle(el, { yakin = '200px', ilk, gorunur } = {}) {
  let kuruldu = false;
  new IntersectionObserver((girdiler) => {
    for (const g of girdiler) {
      if (g.isIntersecting && !kuruldu) { kuruldu = true; ilk?.(); }
      gorunur?.(g.isIntersecting);
    }
  }, { rootMargin: yakin }).observe(el);
}

/* ── irtifa + gökyüzü ── */
const gok = gokyuzuKur($('#gok'));
const irtifa = irtifaKur({ serit: $('#irtifa'), bildir: (h, capalar) => gok.ciz(h, capalar) });
if (new URLSearchParams(location.search).has('olc')) globalThis.__irtifa = irtifa;   /* sınama kancası */

/* ── üst şerit ── */
const ust = $('#ust');
const giris = $('#giris');
let sonY = 0, bekliyor = false;
function kaydirma() {
  bekliyor = false;
  const y = scrollY;
  ust.classList.toggle('ust--dolu', y > 24);
  document.documentElement.classList.toggle('giris-gecildi', y > giris.offsetHeight * 0.55);
  const menuAcik = ust.classList.contains('ust--menu-acik');
  if (!menuAcik && y > 720 && y > sonY + 4) ust.classList.add('ust--gizli');
  if (y < sonY - 4 || y < 720) ust.classList.remove('ust--gizli');
  sonY = y;
  irtifa.guncelle();
}
addEventListener('scroll', () => { if (!bekliyor) { bekliyor = true; requestAnimationFrame(kaydirma); } }, { passive: true });
/* çapa konumları yerleşim değişince yeniden ölçülür (yazı tipi, görsel, pencere) */
new ResizeObserver(() => { irtifa.olc(); kaydirma(); }).observe(document.body);
document.fonts?.ready.then(() => { irtifa.olc(); kaydirma(); });
kaydirma();

const menuBag = $$('.menu a');
const etkinIO = new IntersectionObserver((girdiler) => {
  for (const g of girdiler) {
    if (!g.isIntersecting) continue;
    for (const a of menuBag) a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + g.target.id));
  }
}, { rootMargin: '-45% 0px -50% 0px' });
for (const a of menuBag) { const b = $(a.getAttribute('href')); if (b) etkinIO.observe(b); }

/* dar ekran menüsü */
const menuDugme = $('#menu-dugme'), menu = $('#menu');
function menuAyarla(acik) {
  menuDugme.setAttribute('aria-expanded', String(acik));
  menuDugme.setAttribute('aria-label', acik ? 'Menüyü kapat' : 'Menüyü aç');
  menu.classList.toggle('acik', acik);
  ust.classList.toggle('ust--menu-acik', acik);
}
menuDugme.addEventListener('click', () => menuAyarla(menuDugme.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) menuAyarla(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('acik')) { menuAyarla(false); menuDugme.focus(); } });

/* ── kalkış panosu ── */
const pano = panoKur({ tablo: $('#pano'), pencere: $('#bilet'), az: AZ });
new IntersectionObserver((g, io) => { if (g[0].isIntersecting) { io.disconnect(); pano.dondur(); } }, { threshold: 0.35 }).observe($('#pano'));

/* ── rüzgâr tüneli ── */
const tunel = $('#tunel');
const alfaGir = $('#alfa');
const sayi2 = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
gozle(tunel, {
  yakin: '100px',
  async ilk() {
    const tuval = $('#tunel-tuval');
    let sahne = null;
    if (donanimGpu()) sahne = (await import('./sahne/tunel.mjs')).tunelKur(tuval, { az: AZ });
    if (!sahne) { sahne = (await import('./sahne/tunel2b.mjs')).tunel2bKur(tuval, { az: AZ }); tunel.dataset.cizici = '2b'; } else tunel.dataset.cizici = '3b';
    tunel._sahne = sahne;
    /* hesap işçide; işçi açılamazsa ana iş parçacığında */
    let isci = null, sira = 0;
    try { isci = new Worker(new URL('./sahne/akim-isci.mjs', import.meta.url), { type: 'module' }); } catch { isci = null; }
    const yaz = (r) => {
      sahne.veriYukle(r);
      tunel.classList.add('tunel--hazir');
      tunel.classList.remove('tunel--hesapliyor');
      $('#alfa-cikti').textContent = `${r.alfa}°`;
      $('#cl-cikti').textContent = sayi2.format(r.cl);
      const ustOnce = r.fark >= 0;
      $('#fark-metin').firstChild.textContent = `Aynı anda salınan duman darbelerinden ${ustOnce ? 'üstten' : 'alttan'} geçen, firar kenarına ${ustOnce ? 'alttakinden' : 'üsttekinden'} `;
      $('#fark-cikti').textContent = sayi2.format(Math.abs(r.fark));
    };
    if (isci) isci.onmessage = (e) => { if (e.data.id === sira) yaz(e.data); };
    let zamanlayici = 0;
    async function iste(alfa) {
      sira++;
      clearTimeout(zamanlayici);
      zamanlayici = setTimeout(() => tunel.classList.add('tunel--hesapliyor'), 150);   /* uzun sürerse gösterge */
      if (isci) isci.postMessage({ id: sira, alfa });
      else { const { akimHesapla } = await import('./sahne/akim.mjs'); yaz({ id: sira, ...akimHesapla(alfa) }); }
    }
    /* hareket: etkileşim yoksa 15 s sonra durur (WCAG 2.2.2; sunumatik: süs döngüsü bir geçişten sonra durur); düğme ve kaydırıcı yeniden oynatır */
    const oynatDugme = $('#tunel-oynat');
    let durTimer = 0;
    function oynat(b) {
      sahne.oynat(b);
      oynatDugme.setAttribute('aria-pressed', String(b));
      oynatDugme.textContent = b ? 'Durdur' : 'Oynat';
      clearTimeout(durTimer);
      if (b) durTimer = setTimeout(() => oynat(false), 15000);
    }
    oynatDugme.addEventListener('click', () => oynat(oynatDugme.getAttribute('aria-pressed') !== 'true'));
    if (!AZ) oynat(true);
    let girTimer = 0;
    alfaGir.addEventListener('input', () => { clearTimeout(girTimer); girTimer = setTimeout(() => iste(Number(alfaGir.value)), 40); if (!AZ) oynat(true); });
    iste(Number(alfaGir.value));
  },
  gorunur: (b) => tunel._sahne?.gorunur(b),
});

/* ── EUROAVIA küresi ── */
const agBolum = $('#ag');
let ag = null;
gozle(agBolum, {
  yakin: '600px',
  async ilk() {
    const { agKur } = await import('./sahne/ag.mjs');
    ag = await agKur({ kap: $('#kure'), liste: $('#takvim'), secim: $('#ag-secim'), az: AZ });
  },
  gorunur: (b) => ag?.gorunur(b),
});
