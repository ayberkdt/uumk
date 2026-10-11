/* UUMK — sayfa denetleyicisi. Ayrıntı: notlar/tasarim.md. */
import { dilKur, metin, hataMetni, etkinDil } from './ceviri.mjs';
import { panoKur } from './sahne/pano.mjs';
import { hesapKur, api } from './sahne/hesap.mjs';
import { ucusKur, PENCERE } from './sahne/ucus.mjs';

const AZ = document.documentElement.classList.contains('az');
if (new URLSearchParams(location.search).has('hafif')) document.documentElement.classList.add('hafif');
const prm = new URLSearchParams(location.search);
const $ = (s, k = document) => k.querySelector(s);
const $$ = (s, k = document) => [...k.querySelectorAll(s)];
const sinir = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const yumusak = (t) => 1 - (1 - t) ** 3;
function gozle(el, { yakin = '200px', ilk, gorunur } = {}) {
  let kuruldu = false;
  new IntersectionObserver((g) => { for (const x of g) { if (x.isIntersecting && !kuruldu) { kuruldu = true; ilk?.(); } gorunur?.(x.isIntersecting); } }, { rootMargin: yakin }).observe(el);
}

await dilKur({ dugme: $('#dil-dugme') });

/* ── üst şerit ── */
const ust = $('#ust'), kok = document.documentElement;
const hikayeIz = $('#hikaye-iz');
let sonY = 0, bekliyor = false;
function kaydirma() {
  bekliyor = false;
  const y = scrollY;
  if (!ust.classList.contains('ust--menu-acik') && y > hikayeIz.offsetHeight && y > sonY + 4) ust.classList.add('ust--gizli');
  if (y < sonY - 4 || y < hikayeIz.offsetHeight) ust.classList.remove('ust--gizli');
  sonY = y;
  const yol = kok.scrollHeight - innerHeight;
  ust.style.setProperty('--ilerleme', yol > 0 ? (y / yol).toFixed(4) : '0');
  hikayeGuncelle();
  ufukGuncelle();
  rotaGuncelle();
}
addEventListener('scroll', () => { if (!bekliyor) { bekliyor = true; requestAnimationFrame(kaydirma); } }, { passive: true });

const menu = $('#menu'), menuBag = $$('.menu ul a'), isaret = $('.menu__isaret');
let etkinBag = null;
function isaretKoy() {
  if (!etkinBag || innerWidth <= 860) { isaret.style.opacity = '0'; return; }
  const m = menu.getBoundingClientRect(), r = etkinBag.getBoundingClientRect();
  isaret.style.width = `${r.width.toFixed(1)}px`;
  isaret.style.transform = `translateX(${(r.left - m.left).toFixed(1)}px)`;
  isaret.style.opacity = '1';
}
const etkinIO = new IntersectionObserver((g) => {
  for (const x of g) if (x.isIntersecting) {
    for (const a of menuBag) a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + x.target.id));
    etkinBag = menuBag.find((a) => a.getAttribute('href') === '#' + x.target.id) || null;
    isaretKoy();
  }
}, { rootMargin: '-45% 0px -50% 0px' });
for (const a of menuBag) { const b = $(a.getAttribute('href')); if (b) etkinIO.observe(b); }
etkinIO.observe($('#giris'));
const menuDugme = $('#menu-dugme');
function menuAyarla(acik) {
  menuDugme.setAttribute('aria-expanded', String(acik));
  menuDugme.setAttribute('aria-label', metin(acik ? 'menuKapat' : 'menuAc'));
  menu.classList.toggle('acik', acik);
  ust.classList.toggle('ust--menu-acik', acik);
  $('#icerik').inert = acik;   /* menü açıkken arka inert */
}
addEventListener('dil-degisti', () => menuAyarla(menuDugme.getAttribute('aria-expanded') === 'true'));
matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) menuAyarla(false); });
menuDugme.addEventListener('click', () => menuAyarla(menuDugme.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) menuAyarla(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('acik')) { menuAyarla(false); menuDugme.focus(); } });

/* ── açılış: ad, silüet, uçuş ── */
const SABIT_P = prm.has('p') ? sinir(Number(prm.get('p'))) : null;
function hikayePayi() {
  if (SABIT_P !== null) return SABIT_P;
  if (AZ) return 0;
  const r = hikayeIz.getBoundingClientRect();
  const yol = hikayeIz.offsetHeight - innerHeight;
  return yol > 0 ? sinir(-r.top / yol) : 0;
}
/* adın hâlleri */
const durumlar = $$('.ad__durum');
function bol(el) {
  for (const p of el.querySelectorAll('.ad__buyuk, .ad__kucuk')) {
    const yazi = p.textContent;
    p.replaceChildren(...yazi.split(/(\s+)/).filter(Boolean).map((parca) => {
      if (/^\s+$/.test(parca)) return document.createTextNode(parca);
      const k = document.createElement('span'); k.className = 'kelime';
      for (const h of parca) k.append(Object.assign(document.createElement('span'), { className: 'harf', textContent: h }));
      return k;
    }));
  }
  el.classList.add('bolundu');
  el.harfler = $$('.harf', el);
  el.harfler.forEach((h, i) => h.style.setProperty('--i', i));
}
function adKur() {
  if (AZ) return;
  durumlar.forEach(bol);
  $('#giris-baslik').setAttribute('aria-label', $('#giris-baslik .ad__buyuk').textContent);
  sonP = -1; hikayeGuncelle();
}
const yerel = (p, [a, b], j, n) => sinir(((p - a) / (b - a) - (0.45 * j) / Math.max(1, n - 1)) / 0.55);
function adCiz(p) {
  durumlar.forEach((el, i) => {
    const [gir, cik] = PENCERE[i], h = el.harfler || [], n = h.length;
    let gorunen = 0;
    h.forEach((s, j) => {
      /* harf kelimenin kırpma kutusunda alttan girer, üstten çıkar (bulanıklık yok: durağan karede de net) */
      let op = 1, y = 0;
      if (gir) { const e = yumusak(yerel(p, gir, j, n)); op = e; y = (1 - e) * 1.5; }
      if (cik) { const u = yerel(p, cik, j, n); if (u > 0) { const e = yumusak(u); op = Math.min(op, 1 - e); y = -e * 1.5; } }
      s.style.opacity = (op ** 0.5).toFixed(3);
      s.style.transform = y ? `translateY(${y.toFixed(3)}em)` : '';
      if (op > 0.01) gorunen++;
    });
    el.dataset.gorunur = gorunen ? '1' : '0';
  });
}
/* İstanbul panoraması: blok blok inşa (site.css .ist--kur); --s blok gecikmesi, --k blok içi sıra */
function istKur(svg, { sure = 1100, sonra } = {}) {
  const bloklar = svg.querySelectorAll('.blok');
  bloklar.forEach((b, i) => b.style.setProperty('--s', `${Math.round((i / bloklar.length) * sure)}ms`));
  for (const p of svg.querySelectorAll('.parca')) p.style.setProperty('--k', p.dataset.k);
  if (AZ) { svg.classList.add('ist--kuruldu'); sonra?.(); return; }
  svg.classList.add('ist--kur');
  setTimeout(() => { svg.classList.add('ist--kuruldu'); svg.classList.remove('ist--kur'); sonra?.(); }, sure + 1000);
}
const ist = $('#istanbul');
istKur(ist);
/* panorama kutuya sığar: görüş kutusu (viewBox) kutunun oranına göre sahnenin -400…2000 aralığında açılır, kesilmez.
 * Açılışta şehir yüksekliği, metin sütununun altına düşen yapıların tepesi metne binmeyecek kadar seçilir. */
const SAHNE_SOL = -400, SAHNE_SAG = 2000;
const SEHIR_TEPE = [[-242, 226], [-58, 226], [116, 206], [148, 190], [316, 190], [348, 206], [426, 283], [534, 283], [762, 140]];   /* [x, tepe y] viewBox birimi */
function sigdir(svg, gen, yuk, merkez) {
  let k = yuk / 480, vb = gen / k, kes = false;
  if (vb > SAHNE_SAG - SAHNE_SOL) { vb = SAHNE_SAG - SAHNE_SOL; k = gen / vb; kes = true; }   /* çok geniş: üstten (gökten) kırpılır */
  const x0 = Math.min(SAHNE_SAG - vb, Math.max(SAHNE_SOL, merkez - vb / 2));
  svg.setAttribute('viewBox', `${x0.toFixed(1)} 0 ${vb.toFixed(1)} 480`);
  svg.setAttribute('preserveAspectRatio', kes ? 'xMidYMax slice' : 'xMidYMax meet');
  return { x0, k };
}
function sehirYerlestir() {
  const sahne = $('.giris__sahne').getBoundingClientRect(), gen = sahne.width, S = sahne.height, dar = innerWidth <= 860;
  let h = dar ? Math.min(S * 0.56, gen * 0.92) : Math.min(S * 0.56, gen * 0.36);
  {
    const m = $('.giris__metin > .ad').getBoundingClientRect(), o = ($('.giris__olgu').offsetParent ? $('.giris__olgu') : $('.giris__eylem')).getBoundingClientRect();
    const T = o.bottom - sahne.top + 18, sol = dar ? -1 : m.left - sahne.left - 12, sag = dar ? gen + 1 : Math.max(o.right, m.left + 640) - sahne.left + 12;
    for (let i = 0; i < 5; i++) {
      const k = h / 480, vb = Math.min(SAHNE_SAG - SAHNE_SOL, gen / k), x0 = Math.min(SAHNE_SAG - vb, Math.max(SAHNE_SOL, (dar ? 956 : 800) - vb / 2)), kk = gen / vb;
      let sinir = Infinity;
      for (const [x, y] of SEHIR_TEPE) { const sx = (x - x0) * kk; if (sx > sol && sx < sag) sinir = Math.min(sinir, (S - T) / (1 - y / 480)); }
      if (sinir < h) h = Math.max(sinir, S * (dar ? 0.2 : 0.3));
    }
  }
  ist.style.setProperty('--sehir-h', `${Math.round(h)}px`);
  sigdir(ist, gen, Math.round(h), dar ? 956 : 800);
  const g = $('#istanbul-gece');
  if (g) { const r = g.getBoundingClientRect(); sigdir(g, r.width, r.height, 1000); }
}
sehirYerlestir(); addEventListener('dil-degisti', sehirYerlestir); document.fonts?.ready.then(sehirYerlestir);
let ucus = null, sonP = -1;
function hikayeGuncelle() {
  const p = hikayePayi();
  if (p === sonP) return;
  sonP = p;
  if (!AZ) { adCiz(p); ist.style.setProperty('--ist-p', p.toFixed(3)); }
  ucus?.ciz(p);
}
ucus = ucusKur($('#ucus-tuval'), { az: AZ, metinAlt: () => { const t = $('#ucus-tuval').getBoundingClientRect(), o = ($('.giris__olgu').offsetParent ? $('.giris__olgu') : $('.giris__eylem')).getBoundingClientRect(); return o.bottom - t.top; }, sehirUst: () => ist.getBoundingClientRect().top - $('#ucus-tuval').getBoundingClientRect().top });
$('#ucus-tuval').dataset.cizici = '2b';
adKur();
if (!AZ && hikayePayi() < 0.02) { $('#ad').classList.add('ad--ilk'); setTimeout(() => $('#ad').classList.remove('ad--ilk'), 1400); }
addEventListener('dil-degisti', adKur);

/* ── bölümler arası ufuk: kavis kaydırdıkça düzleşir ── */
const ufuklar = $$('.ufuk').map((el) => ({ yol: el.querySelector('path'), alt: el.classList.contains('ufuk--alt'), kap: el.parentElement }));
function ufukGuncelle() {
  const rs = ufuklar.map((u) => u.kap.getBoundingClientRect());
  for (const [i, u] of ufuklar.entries()) {
    const r = rs[i];
    if (r.bottom < -200 || r.top > innerHeight + 200) continue;
    const t = AZ ? 1 : u.alt ? sinir((innerHeight * 0.95 - r.bottom) / (innerHeight * 0.6)) : sinir((innerHeight - r.top) / (innerHeight * 0.7));
    const d = 44 + 76 * (1 - yumusak(t));
    u.yol.setAttribute('d', u.alt ? `M0 120H1440V120Q720 ${(120 - d).toFixed(1)} 0 120Z` : `M0 0H1440V0Q720 ${d.toFixed(1)} 0 0Z`);
  }
}

/* ── tarihçe: şerit rafı; omurga kaydırdıkça dolar, uçak ucunda, geçilen şerit yerine oturur ── */
const rota = $('#rota'), rotaNokta = $$('#rota .serit:not(.serit--sirada)'), rotaYil = $('#rota-yil');
function rotaGuncelle() {
  const r = rota.getBoundingClientRect();
  if (r.bottom < -100 || r.top > innerHeight + 100) return;
  const cizgi = innerHeight * 0.62, ust = rotaNokta.map((li) => li.getBoundingClientRect().top);   /* önce oku, sonra yaz */
  const v = AZ ? 1 : sinir((cizgi - r.top) / r.height);
  rota.style.setProperty('--rota-t', v.toFixed(3)); rota.style.setProperty('--rota-u', v > 0.01 && v < 0.99 ? 1 : 0);
  let son = -1;
  rotaNokta.forEach((li, i) => { const g = AZ || ust[i] + 24 <= cizgi + 1; li.toggleAttribute('data-gecti', g); if (g) son = i; });
  /* uçağın yanındaki yıl rozeti: geçilen son kaydın yılı */
  rotaYil.textContent = rotaNokta[Math.max(0, son)].querySelector('time').textContent;
  rotaYil.style.top = `${(rota.offsetTop + v * rota.offsetHeight).toFixed(1)}px`;
  rotaYil.style.opacity = !AZ && v > 0.01 && v < 0.99 ? '1' : '0';
}

let boyutZaman = 0;
new ResizeObserver(() => { cancelAnimationFrame(boyutZaman); boyutZaman = requestAnimationFrame(() => { sonP = -1; isaretKoy(); sehirYerlestir(); kaydirma(); }); }).observe(document.body);
kaydirma();

/* ── gündem, hesap ve kulüp kartı ── */
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
  f.querySelector('.form__durum').textContent = hataMetni(r.veri?.hata || 'genel');
});
const kart = $('#kulup-karti'), kartAlan = (k) => kart.querySelector(`[data-kart="${k}"]`);
let kartKullanici = null;
function kartYaz(v, durum) {
  kart.dataset.durum = durum;
  const ad = `${v.ad || ''} ${v.soyad || ''}`.trim();
  kartAlan('ad').textContent = ad || metin('kartAd');
  kartAlan('okul_no').textContent = v.okul_no || '— — — — — — — —';
  kartAlan('eposta').textContent = v.eposta || '…@itu.edu.tr';
  kartAlan('kod').textContent = `UUMK-${String(v.okul_no || '').replace(/\D/g, '').slice(-4).padStart(4, '0')}`;
  kartAlan('durum').textContent = durum === 'profil' ? metin(v.dogrulandi ? 'kartDogrulandi' : 'kartBekliyor') : durum === 'canli' ? metin('kartCanli') : metin('kartTaslak');
}
const kayitForm = $('#kayit-form');
function formdanKart() {
  if (kartKullanici) return;
  const v = Object.fromEntries(new FormData(kayitForm));
  kartYaz(v, ['ad', 'soyad', 'eposta', 'okul_no'].some((k) => v[k]) ? 'canli' : 'taslak');
}
kayitForm.addEventListener('input', formdanKart);
kayitForm.addEventListener('reset', () => setTimeout(formdanKart));
addEventListener('hesap-degisti', (e) => { kartKullanici = e.detail; $('.hesap__adimlar').hidden = !!kartKullanici?.dogrulandi; if (kartKullanici) kartYaz(kartKullanici, 'profil'); else formdanKart(); });   /* doğrulanmışa adım yok */
addEventListener('dil-degisti', () => { if (kartKullanici) kartYaz(kartKullanici, 'profil'); else formdanKart(); });
formdanKart();

/* ── kalkış panosu (+ İstanbul saati) ── */
const pano = panoKur({ tablo: $('#pano'), pencere: $('#bilet'), az: AZ });
new IntersectionObserver((g, io) => { if (g[0].isIntersecting) { io.disconnect(); pano.dondur(); } }, { threshold: 0.35 }).observe($('#pano'));
const saat = $('#pano-saat'), saatBicim = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
const saatYaz = () => { saat.textContent = `IST ${saatBicim.format(new Date())}`; };
saatYaz(); setInterval(saatYaz, 20000);

/* ── yazılar: sunucu → veri/yazilar.json → sayfadaki liste ── */
const yaziListe = $('#yazi-listesi');
const tarihYaz = (t) => new Intl.DateTimeFormat(etkinDil() === 'en' ? 'en-GB' : 'tr-TR', t.length === 7 ? { month: 'long', year: 'numeric', timeZone: 'UTC' } : { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  .format(new Date(t.length === 7 ? `${t}-01T00:00:00Z` : `${t}T00:00:00Z`));
let yazilar = null;
/* bölünmez boşluklar */
const bag = (s) => s.replace(/(\d) (?=\p{L})/gu, '$1 ').replace(/ (\d{4})/g, ' $1');
const PUL = ['kiz', 'galata', 'kopru', 'cami', 'vapur', 'ev'];
function yazilariCiz() {
  if (!yazilar?.length) return;
  const d = etkinDil();
  /* AESTRO sayıları ve üçüncü sayının yazısı raftadır */
  yaziListe.replaceChildren(...yazilar.filter((y) => y.kaynak !== 'AESTRO' && y.id !== 'aestro-yolculugu').map((y, i) => {
    const li = document.createElement('li'); li.className = 'kartpostal';
    li.innerHTML = `<svg class="kartpostal__resim" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><use href="#pul-${PUL[i % PUL.length]}"/></svg><div class="kartpostal__yazi"><p class="kartpostal__damga"><time></time></p><h3><a></a></h3><p></p></div>`;
    li.querySelector('time').textContent = tarihYaz(y.tarih);
    li.querySelector('time').dateTime = y.tarih;
    if (y.kaynak && y.kaynak !== 'EUROAVIA') li.querySelector('.kartpostal__yazi').prepend(Object.assign(document.createElement('span'), { className: 'etiket', textContent: y.kaynak }));
    const a = li.querySelector('a');
    a.textContent = bag((d === 'en' && y.baslik_en) || y.baslik_tr);
    if (y.baglanti) { a.href = y.baglanti; a.target = '_blank'; a.rel = 'noopener'; }
    else { a.href = `#yazi-${y.id}`; a.addEventListener('click', (e) => { e.preventDefault(); yaziAc(y); }); }
    li.querySelector('.kartpostal__yazi > p:last-child').textContent = bag((d === 'en' && y.ozet_en) || y.ozet_tr);
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
api('/api/yazilar').then(async (r) => {
  if (r.durum === 200 && r.veri.yazilar.length) yazilar = r.veri.yazilar;
  else {
    try { yazilar = (await (await fetch('veri/yazilar.json')).json()).map((y) => ({ id: y.id, tarih: y.tarih, kaynak: y.kaynak, baglanti: y.baglanti, baslik_tr: y.baslik.tr, baslik_en: y.baslik.en, ozet_tr: y.ozet.tr, ozet_en: y.ozet.en, govde_tr: y.govde?.tr || '', govde_en: y.govde?.en || '' })); } catch { /* sayfadaki liste kalır */ }
  }
  yazilariCiz();
});
addEventListener('dil-degisti', yazilariCiz);

/* bölüm görününce (site.css .gorundu) */
const izIO = new IntersectionObserver((g) => { for (const x of g) if (x.isIntersecting) { x.target.classList.add('gorundu'); izIO.unobserve(x.target); } }, { rootMargin: '0px 0px -20% 0px' });
for (const b of [...$$('.bolum'), $('.alt')]) izIO.observe(b);

/* ── EUROAVIA haritası ── */
let ag = null, agGorunur = false;   /* görünürlük harita yüklenmeden gelebilir */
gozle($('#ag'), {
  yakin: '600px',
  async ilk() { ag = await (await import('./sahne/ag.mjs')).agKur({ kap: $('#harita'), liste: $('#takvim'), secim: $('#ag-secim'), km: $('#ag-km'), az: AZ }); ag.gorunur(agGorunur); },
  gorunur: (b) => { agGorunur = b; ag?.gorunur(b); },
});

/* ── sponsorluk: e-posta konu satırı dile göre, adresi kopyala ── */
const sponsorAdres = $('#sponsor-adres').textContent.trim(), sponsorYaz = $('#sponsor-yaz');
function sponsorBagla() { sponsorYaz.href = `mailto:${sponsorAdres}?subject=${encodeURIComponent(metin('sponsorKonu'))}&body=${encodeURIComponent(metin('sponsorGovde'))}`; }
sponsorBagla(); addEventListener('dil-degisti', sponsorBagla);
$('#sponsor-kopyala').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(sponsorAdres); duyuru.textContent = metin('adresKopyalandi', { adres: sponsorAdres }); }
  catch { duyuru.textContent = metin('adresKopyalanamadi', { adres: sponsorAdres }); }
});

/* ── parola alanları: göster / gizle ── */
for (const g of $$('#hesap-panel input[type="password"]')) {
  const kutu = document.createElement('span'); kutu.className = 'alan__kutu';
  g.replaceWith(kutu); kutu.append(g);
  const d = Object.assign(document.createElement('button'), { type: 'button', className: 'alan__goster' });
  const yaz = () => { const acik = g.type === 'text'; d.textContent = metin(acik ? 'parolaGizle' : 'parolaGoster'); d.setAttribute('aria-pressed', String(acik)); };
  d.addEventListener('click', () => { g.type = g.type === 'password' ? 'text' : 'password'; yaz(); g.focus(); });
  g.form?.addEventListener('submit', () => { g.type = 'password'; yaz(); });
  kutu.append(d); yaz(); addEventListener('dil-degisti', yaz);
}

/* ── alt bilgi: gece İstanbul'u görününce kurulur, ışıklar yanar; İstanbul saati ── */
gozle($('.alt'), { yakin: '0px', ilk() {
  const gece = ist.cloneNode(true);   /* aynı preset, gece renkleri (site.css .ist--gece) */
  gece.id = 'istanbul-gece'; gece.setAttribute('class', 'ist ist--gece'); gece.removeAttribute('style');
  $('.alt__sehir').append(gece); sehirYerlestir();
  istKur(gece, { sure: 900, sonra: () => gece.classList.add('ist--isik') });
} });
const altSaat = $('#alt-saat'), altSaatYaz = () => { altSaat.textContent = saatBicim.format(new Date()); };
altSaatYaz(); setInterval(altSaatYaz, 20000);

/* yüklemeden sonra yumuşak kaydırma (site.css html.yumusak) */
const yumusakAc = () => requestAnimationFrame(() => document.documentElement.classList.add('yumusak'));
if (document.readyState === 'complete') yumusakAc(); else addEventListener('load', yumusakAc, { once: true });

if (prm.has('olc')) globalThis.__uumk = { hikayePayi, ucus: () => ucus };   /* sınama kancası */
