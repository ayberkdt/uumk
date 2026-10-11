/* UUMK — sayfa denetleyicisi (v2).
 * Açılış: kâğıt uçak hikâyesi. Yapışkan sahnenin kaydırma payı p ∈ [0, 1] katlamayı, başlıkları ve ilerleme çizgisini sürer
 * (sahne/kagit.mjs; donanım GPU'su yoksa sahne/kagit2b.mjs). Hareket azaltmada sahne uçak hâlinde durur, başlıklar alt alta.
 * Sonra: gündem + hesap (sahne/hesap.mjs, kayıt sunucusu), kalkış panosu, yazılar (sunucudan; yoksa sayfadaki liste), küre (tembel).
 * URL: ?dil=en · ?az=1 · ?webgl=0|1 · ?p=0.5 (açılışı o karede dondur, sınama) · #etkinlik-<id> · #sifre-yenile=<belirteç> */
import { dilKur, metin, etkinDil } from './ceviri.mjs';
import { panoKur } from './sahne/pano.mjs';
import { hesapKur, api } from './sahne/hesap.mjs';
import { donanimGpu } from './sahne/gpu.mjs';
import { baslikNo } from './sahne/kagit-ortak.mjs';

const AZ = document.documentElement.classList.contains('az');
const prm = new URLSearchParams(location.search);
const $ = (s, k = document) => k.querySelector(s);
const $$ = (s, k = document) => [...k.querySelectorAll(s)];
function gozle(el, { yakin = '200px', ilk, gorunur } = {}) {
  let kuruldu = false;
  new IntersectionObserver((g) => { for (const x of g) { if (x.isIntersecting && !kuruldu) { kuruldu = true; ilk?.(); } gorunur?.(x.isIntersecting); } }, { rootMargin: yakin }).observe(el);
}

await dilKur({ dugme: $('#dil-dugme') });

/* ── üst şerit ── */
const ust = $('#ust');
let sonY = 0, bekliyor = false;
const hikayeIz = $('#hikaye-iz');
function kaydirma() {
  bekliyor = false;
  const y = scrollY;
  ust.classList.toggle('ust--dolu', y > 24);
  if (!ust.classList.contains('ust--menu-acik') && y > hikayeIz.offsetHeight && y > sonY + 4) ust.classList.add('ust--gizli');
  if (y < sonY - 4 || y < hikayeIz.offsetHeight) ust.classList.remove('ust--gizli');
  sonY = y;
  hikayeGuncelle();
}
addEventListener('scroll', () => { if (!bekliyor) { bekliyor = true; requestAnimationFrame(kaydirma); } }, { passive: true });

const menuBag = $$('.menu a');
const etkinIO = new IntersectionObserver((g) => { for (const x of g) if (x.isIntersecting) for (const a of menuBag) a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + x.target.id)); }, { rootMargin: '-45% 0px -50% 0px' });
for (const a of menuBag) { const b = $(a.getAttribute('href')); if (b) etkinIO.observe(b); }
const menuDugme = $('#menu-dugme'), menu = $('#menu');
function menuAyarla(acik) {
  menuDugme.setAttribute('aria-expanded', String(acik));
  menuDugme.setAttribute('aria-label', metin(acik ? 'menuKapat' : 'menuAc'));
  menu.classList.toggle('acik', acik);
  ust.classList.toggle('ust--menu-acik', acik);
}
menuDugme.addEventListener('click', () => menuAyarla(menuDugme.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) menuAyarla(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('acik')) { menuAyarla(false); menuDugme.focus(); } });

/* ── açılış: kâğıt uçak ── */
const adimlar = $$('.hikaye__adim'), cizgiler = $$('.hikaye__ilerleme li');
let sahne = null, sonBaslik = 0;
const SABIT_P = prm.has('p') ? Math.min(1, Math.max(0, Number(prm.get('p')))) : null;
function hikayePayi() {
  if (SABIT_P !== null) return SABIT_P;
  if (AZ) return 0.72;
  const r = hikayeIz.getBoundingClientRect();
  const yol = hikayeIz.offsetHeight - innerHeight;
  return yol > 0 ? Math.min(1, Math.max(0, -r.top / yol)) : 0;
}
function hikayeGuncelle() {
  const p = hikayePayi();
  if (!AZ) {
    const n = baslikNo(p);
    if (n !== sonBaslik) {
      adimlar.forEach((a, i) => (i === n ? a.setAttribute('data-etkin', '') : a.removeAttribute('data-etkin')));
      cizgiler.forEach((c, i) => (i <= n ? c.setAttribute('data-gecti', '') : c.removeAttribute('data-gecti')));
      sonBaslik = n;
    }
  }
  sahne?.ciz(p);
}
(async () => {
  const tuval = $('#kagit-tuval');
  const logo = new Image(); logo.src = 'gorseller/logo-uumk-720.png';
  await Promise.all([logo.decode().catch(() => {}), document.fonts?.load('600 36px "Instrument Sans"').catch(() => {})]);
  if (donanimGpu()) sahne = (await import('./sahne/kagit.mjs')).kagitKur(tuval, { logo, az: AZ });
  if (!sahne) { sahne = (await import('./sahne/kagit2b.mjs')).kagit2bKur(tuval, { logo }); tuval.dataset.cizici = '2b'; } else tuval.dataset.cizici = '3b';
  hikayeGuncelle();
})();
new ResizeObserver(() => hikayeGuncelle()).observe(document.body);
kaydirma();

/* ── gündem ve hesap ── */
const duyuru = $('#duyuru');
let duyuruZaman = 0;
new MutationObserver(() => { clearTimeout(duyuruZaman); if (duyuru.textContent) duyuruZaman = setTimeout(() => { duyuru.textContent = ''; }, 6000); }).observe(duyuru, { childList: true, characterData: true, subtree: true });
hesapKur({ panel: $('#hesap-panel'), ustDugme: $('#hesap-dugme'), liste: $('#etkinlik-listesi'), durumAlani: duyuru });
$('#sil-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.currentTarget, g = f.elements.parola;
  const r = await api('/api/hesap', { yontem: 'DELETE', govde: { parola: g.value } });
  if (r.durum === 200) { location.hash = '#hesap'; location.reload(); return; }
  g.setAttribute('aria-invalid', 'true');
  f.querySelector('.form__durum').textContent = metin('h-' + (r.veri?.hata || 'genel'));
});

/* ── kalkış panosu ── */
const pano = panoKur({ tablo: $('#pano'), pencere: $('#bilet'), az: AZ });
new IntersectionObserver((g, io) => { if (g[0].isIntersecting) { io.disconnect(); pano.dondur(); } }, { threshold: 0.35 }).observe($('#pano'));

/* ── yazılar: sunucu varsa oradan (kulübün kendi yazıları dahil), yoksa sayfadaki liste ── */
const yaziListe = $('#yazi-listesi');
const yaziTarih = () => new Intl.DateTimeFormat(etkinDil() === 'en' ? 'en-GB' : 'tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
let yazilar = null;
/* 'YYYY-AA-GG' ya da gün bilinmiyorsa 'YYYY-AA' */
const tarihYaz = (t) => (t.length === 7
  ? new Intl.DateTimeFormat(etkinDil() === 'en' ? 'en-GB' : 'tr-TR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${t}-01T00:00:00Z`))
  : yaziTarih().format(new Date(`${t}T00:00:00Z`)));
function yazilariCiz() {
  if (!yazilar?.length) return;
  const d = etkinDil();
  yaziListe.replaceChildren(...yazilar.map((y) => {
    const li = document.createElement('li'); li.className = 'yazi';
    li.innerHTML = '<p class="yazi__ust"></p><h3><a></a></h3><p></p>';
    li.querySelector('.yazi__ust').textContent = `${tarihYaz(y.tarih)}${y.kaynak ? ' · ' + y.kaynak : ''}`;
    const a = li.querySelector('a');
    a.textContent = (d === 'en' && y.baslik_en) || y.baslik_tr;
    if (y.baglanti) { a.href = y.baglanti; a.target = '_blank'; a.rel = 'noopener'; }
    else { a.href = `#yazi-${y.id}`; a.addEventListener('click', (e) => { e.preventDefault(); yaziAc(y); }); }
    li.querySelector('p:last-child').textContent = (d === 'en' && y.ozet_en) || y.ozet_tr;
    return li;
  }));
}
function yaziAc(y) {
  const d = etkinDil(), dlg = $('#okuyucu');
  dlg.querySelector('h2').textContent = (d === 'en' && y.baslik_en) || y.baslik_tr;
  dlg.querySelector('.okuyucu__ust').textContent = tarihYaz(y.tarih);
  const govde = (d === 'en' && y.govde_en) || y.govde_tr;
  dlg.querySelector('.okuyucu__govde').replaceChildren(...govde.split(/\n\s*\n/).map((p) => Object.assign(document.createElement('p'), { textContent: p.trim() })));
  dlg.showModal();
}
$('#okuyucu')?.addEventListener('click', (e) => { if (e.target === e.currentTarget || e.target.closest('.okuyucu__kapat')) e.currentTarget.close(); });
/* sunucu yoksa sayfadaki listenin kaynağı veri/yazilar.json (iki dilli) */
api('/api/yazilar').then(async (r) => {
  if (r.durum === 200 && r.veri.yazilar.length) yazilar = r.veri.yazilar;
  else {
    try { yazilar = (await (await fetch('veri/yazilar.json')).json()).map((y) => ({ id: y.id, tarih: y.tarih, kaynak: y.kaynak, baglanti: y.baglanti, baslik_tr: y.baslik.tr, baslik_en: y.baslik.en, ozet_tr: y.ozet.tr, ozet_en: y.ozet.en, govde_tr: y.govde?.tr || '', govde_en: y.govde?.en || '' })); } catch { /* sayfadaki liste kalır */ }
  }
  if (etkinDil() === 'en' || r.durum === 200) yazilariCiz();
});
addEventListener('dil-degisti', yazilariCiz);

/* bölüm görününce etiketteki uçuş izi uzar (site.css .bolum.gorundu) */
const izIO = new IntersectionObserver((g) => { for (const x of g) if (x.isIntersecting) { x.target.classList.add('gorundu'); izIO.unobserve(x.target); } }, { rootMargin: '0px 0px -25% 0px' });
for (const b of $$('.bolum')) izIO.observe(b);

/* ── EUROAVIA küresi ── */
let ag = null;
gozle($('#ag'), {
  yakin: '600px',
  async ilk() { ag = await (await import('./sahne/ag.mjs')).agKur({ kap: $('#kure'), liste: $('#takvim'), secim: $('#ag-secim'), az: AZ }); },
  gorunur: (b) => ag?.gorunur(b),
});

/* yüklemeden sonra yumuşak kaydırma (site.css html.yumusak) */
const yumusakAc = () => requestAnimationFrame(() => document.documentElement.classList.add('yumusak'));
if (document.readyState === 'complete') yumusakAc(); else addEventListener('load', yumusakAc, { once: true });

if (prm.has('olc')) globalThis.__uumk = { hikayePayi, sahne: () => sahne };   /* sınama kancası */
