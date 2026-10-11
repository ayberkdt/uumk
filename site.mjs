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
  isaret.style.width = `${Math.max(12, r.width - 46)}px`;
  isaret.style.transform = `translateX(${(r.left - m.left + 16).toFixed(1)}px)`;
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
const durumlar = $$('.ad__durum'), duraklar = $$('.durak li');
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
  const etkin = p < (PENCERE[0][1][0] + PENCERE[1][0][1]) / 2 ? 0 : p < (PENCERE[1][1][0] + PENCERE[2][0][1]) / 2 ? 1 : 2;
  duraklar.forEach((d, i) => d.toggleAttribute('data-etkin', i === etkin));
  duraklar[0].parentElement.style.opacity = (1 - sinir((p - 0.9) / 0.08)).toFixed(3);
}
const siletYol = $$('#silet path'), silet = $('#silet');
function siletCiz(p) {
  const n = siletYol.length;
  siletYol.forEach((y, i) => { y.style.strokeDashoffset = (1 - sinir(((p - 0.27) / 0.24) * 1.5 - (i / n) * 0.5)).toFixed(3); });
  silet.style.opacity = ((0.7 - 0.48 * sinir((p - 0.62) / 0.12)) * (innerWidth < innerHeight * 1.05 ? 1 : 1 - sinir((p - 0.9) / 0.1))).toFixed(3);
}
let ucus = null, sonP = -1;
function hikayeGuncelle() {
  const p = hikayePayi();
  if (p === sonP) return;
  sonP = p;
  if (!AZ) { adCiz(p); siletCiz(p); }
  ucus?.ciz(p);
}
ucus = ucusKur($('#ucus-tuval'), { az: AZ, metinAlt: () => { const t = $('#ucus-tuval').getBoundingClientRect(), o = $('.giris__olgu').getBoundingClientRect(); return o.bottom - t.top; } });
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

/* ── tarihçe rotası ── */
const rota = $('#rota'), rotaNokta = $$('.rota__nokta'), rotaSvg = $('.rota__yol');
const [rotaIz, rotaDolu] = $$('.rota__yol path');
const rotaUcak = document.createElementNS('http://www.w3.org/2000/svg', 'path');
rotaUcak.setAttribute('class', 'rota__ucak'); rotaUcak.setAttribute('d', 'M9 0L-9-6-2 1.5zM9 0-2 1.5-3 6z'); rotaSvg.append(rotaUcak);
const RY = [42, 32, 46, 34, 42, 34];
let rotaX = [], rotaL = 0;
function rotaKur() {
  rotaNokta.forEach((li, i) => li.style.setProperty('--y', `${RY[i % RY.length]}px`));
  if (getComputedStyle(rotaSvg).display === 'none') { rotaL = 0; return; }
  const rr = rota.getBoundingClientRect();
  const pts = rotaNokta.map((li, i) => [li.getBoundingClientRect().left - rr.left + 8, RY[i % RY.length]]);
  rotaX = pts.map((q) => q[0]);
  const t = [...pts, [rr.width, pts.at(-1)[1] - 8]];
  let d = `M${t[0][0]} ${t[0][1]}`;
  for (let i = 0; i < t.length - 1; i++) {
    const p0 = t[Math.max(0, i - 1)], p1 = t[i], p2 = t[i + 1], p3 = t[Math.min(t.length - 1, i + 2)];
    d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  rotaIz.setAttribute('d', d); rotaDolu.setAttribute('d', d);
  rotaL = rotaDolu.getTotalLength();
  rotaDolu.style.strokeDasharray = `${rotaL}`;
  rotaGuncelle();
}
function rotaGuncelle() {
  const r = rota.getBoundingClientRect();
  if (r.bottom < -100 || r.top > innerHeight + 100) return;
  const t = AZ ? 1 : sinir((innerHeight * 0.85 - r.top) / (innerHeight * 0.55));
  if (!rotaL) {
    const v = AZ ? 1 : sinir((innerHeight * 0.7 - r.top - 15) / (r.height - 30)), ust = rotaNokta.map((li) => li.getBoundingClientRect().top);   /* önce oku, sonra yaz */
    rota.style.setProperty('--rota-t', v.toFixed(3)); rota.style.setProperty('--rota-u', v > 0.01 && v < 0.99 ? 1 : 0);
    rotaNokta.forEach((li, i) => li.toggleAttribute('data-gecti', ust[i] + 15 <= innerHeight * 0.7 + 1)); return;
  }
  rotaDolu.style.strokeDashoffset = (rotaL * (1 - t)).toFixed(1);
  const a = rotaDolu.getPointAtLength(rotaL * t), b = rotaDolu.getPointAtLength(Math.min(rotaL, rotaL * t + 2));
  const aci = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  rotaUcak.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${aci.toFixed(1)})`);
  rotaUcak.style.opacity = t > 0.01 && t < 0.995 ? '1' : '0';
  rotaNokta.forEach((li, i) => li.toggleAttribute('data-gecti', a.x >= rotaX[i] - 4));
}
rotaKur();

let boyutZaman = 0;
new ResizeObserver(() => { cancelAnimationFrame(boyutZaman); boyutZaman = requestAnimationFrame(() => { sonP = -1; rotaKur(); isaretKoy(); kaydirma(); }); }).observe(document.body);
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
function yazilariCiz() {
  if (!yazilar?.length) return;
  const d = etkinDil();
  yaziListe.replaceChildren(...yazilar.map((y, i) => {
    const li = document.createElement('li'); li.className = 'yazi';
    li.innerHTML = (i ? '' : '<svg class="yazi__silet" viewBox="0 0 1200 240" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><use href="#silet-cizim"/></svg>') + '<p class="yazi__ust"><time></time></p><h3><a></a></h3><p></p>';
    li.querySelector('time').textContent = tarihYaz(y.tarih);
    li.querySelector('time').dateTime = y.tarih;
    if (y.kaynak && y.kaynak !== 'EUROAVIA') li.querySelector('.yazi__ust').append(Object.assign(document.createElement('span'), { className: 'etiket', textContent: y.kaynak }));   /* EUROAVIA varsayılan kaynak */
    const a = li.querySelector('a');
    a.textContent = bag((d === 'en' && y.baslik_en) || y.baslik_tr);
    if (y.baglanti) { a.href = y.baglanti; a.target = '_blank'; a.rel = 'noopener'; }
    else { a.href = `#yazi-${y.id}`; a.addEventListener('click', (e) => { e.preventDefault(); yaziAc(y); }); }
    li.querySelector('p:last-child').textContent = bag((d === 'en' && y.ozet_en) || y.ozet_tr);
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

/* yüklemeden sonra yumuşak kaydırma (site.css html.yumusak) */
const yumusakAc = () => requestAnimationFrame(() => document.documentElement.classList.add('yumusak'));
if (document.readyState === 'complete') yumusakAc(); else addEventListener('load', yumusakAc, { once: true });

if (prm.has('olc')) globalThis.__uumk = { hikayePayi, ucus: () => ucus };   /* sınama kancası */
