/* UUMK — sayfa denetleyicisi. Ayrıntı: notlar/tasarim.md. */
import { dilKur, metin, hataMetni, etkinDil } from './ceviri.mjs';
import { panoKur } from './sahne/pano.mjs';
import { hesapKur, api } from './sahne/hesap.mjs';
import { ucusKur } from './sahne/ucus.mjs';

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

const ust = $('#ust'), kok = document.documentElement, kiyi = $('#kiyi');
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
  ufukGuncelle();
  rotaGuncelle();
  kiyiGuncelle();
}
function kiyiGuncelle() {
  const r = kiyi.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) return;
  kiyi.style.setProperty('--gecis', AZ ? '0.5' : sinir((innerHeight - r.top) / (innerHeight + r.height)).toFixed(4));
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
  $('#icerik').inert = acik;
}
addEventListener('dil-degisti', () => menuAyarla(menuDugme.getAttribute('aria-expanded') === 'true'));
matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) menuAyarla(false); });
menuDugme.addEventListener('click', () => menuAyarla(menuDugme.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) menuAyarla(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('acik')) { menuAyarla(false); menuDugme.focus(); } });

const SABIT_P = prm.has('p') ? sinir(Number(prm.get('p'))) : null;
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
  $$('.harf', el).forEach((h, i) => h.style.setProperty('--i', i));
}
let adNo = 0, adZaman = 0, girisGorunur = true;
function adGoster(i) {
  durumlar.forEach((el, j) => {
    if (j === i) { el.removeAttribute('data-cikis'); el.setAttribute('data-etkin', ''); }
    else if (el.hasAttribute('data-etkin')) { el.removeAttribute('data-etkin'); el.setAttribute('data-cikis', ''); setTimeout(() => el.removeAttribute('data-cikis'), 1600); }
  });
  $('#ad').dataset.hal = i;
}
function adDongu() {
  clearTimeout(adZaman);
  adZaman = setTimeout(() => { if (!document.hidden && girisGorunur) { adNo = (adNo + 1) % durumlar.length; adGoster(adNo); } adDongu(); }, adNo === 0 ? 8000 : 5500);
}
function adKur() {
  if (AZ) return;
  durumlar.forEach(bol);
  $('#giris-baslik').setAttribute('aria-label', $('#giris-baslik .ad__buyuk').textContent);
  durumlar.forEach((el, j) => { if (j !== adNo) el.removeAttribute('data-etkin'); });
  requestAnimationFrame(() => requestAnimationFrame(() => adGoster(adNo)));
}
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
const SAHNE_SOL = -400, SAHNE_SAG = 2000;
const SEHIR_TEPE = [[-242, 226], [-58, 226], [116, 206], [148, 190], [316, 190], [348, 206], [426, 283], [534, 283], [762, 140]];
function sigdir(svg, gen, yuk, merkez) {
  let k = yuk / 480, vb = gen / k, kes = false;
  if (vb > SAHNE_SAG - SAHNE_SOL) { vb = SAHNE_SAG - SAHNE_SOL; k = gen / vb; kes = true; }
  const x0 = Math.min(SAHNE_SAG - vb, Math.max(SAHNE_SOL, merkez - vb / 2));
  svg.setAttribute('viewBox', `${x0.toFixed(1)} 0 ${vb.toFixed(1)} 480`);
  svg.setAttribute('preserveAspectRatio', kes ? 'xMidYMax slice' : 'xMidYMax meet');
  return { x0, k };
}
function sehirYerlestir() {
  const sahne = $('.giris__sahne').getBoundingClientRect(), gen = sahne.width, S = sahne.height, dar = innerWidth <= 860;
  const kisa = matchMedia('(max-height: 520px) and (orientation: landscape)').matches;
  let h = kisa ? Math.min(gen * 0.3, 300) : dar ? Math.min(S * 0.56, gen * 0.92) : Math.min(S * 0.56, gen * 0.36);
  if (!kisa) {
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
let ucus = null;
ucus = ucusKur($('#ucus-tuval'), { az: AZ, metinAlt: () => { const t = $('#ucus-tuval').getBoundingClientRect(), o = ($('.giris__olgu').offsetParent ? $('.giris__olgu') : $('.giris__eylem')).getBoundingClientRect(); return o.bottom - t.top; }, sehirUst: () => ist.getBoundingClientRect().top - $('#ucus-tuval').getBoundingClientRect().top });
$('#ucus-tuval').dataset.cizici = '2b';
if (SABIT_P !== null) ucus.ciz(SABIT_P); else ucus.oto();
adKur(); if (!AZ) adDongu();
addEventListener('dil-degisti', adKur);
new IntersectionObserver(([x]) => { girisGorunur = x.isIntersecting; }).observe($('#giris'));

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

const maketEl = $('#maket');
gozle(maketEl, { yakin: '700px', ilk: async () => {
  if (!(await import('./sahne/gpu.mjs')).donanimGpu()) return;
  const liste = $$('.kabin > li', maketEl), imler = $$('.maket__imler li', maketEl);
  const m = (await import('./sahne/maket3b.mjs')).maketKur($('#maket-tuval'), { imler, az: AZ, secildi: (i) => liste.forEach((l, j) => l.toggleAttribute('data-secili', j === i)) });
  if (!m) return;
  maketEl.dataset.cizici = '3b'; if (prm.has('olc')) globalThis.__maket = m;
  liste.forEach((l, i) => { l.addEventListener('pointerenter', () => m.sec(i)); l.addEventListener('pointerleave', () => m.sec(-1)); l.addEventListener('click', () => m.sec(i)); });
} });

const rota = $('#rota'), rotaNokta = $$('#rota .serit:not(.serit--sirada)'), rotaYil = $('#rota-yil');
function rotaGuncelle() {
  const r = rota.getBoundingClientRect();
  if (r.bottom < -100 || r.top > innerHeight + 100) return;
  const cizgi = innerHeight * 0.62, ust = rotaNokta.map((li) => li.getBoundingClientRect().top);
  const v = AZ ? 1 : sinir((cizgi - r.top) / r.height);
  rota.style.setProperty('--rota-t', v.toFixed(3)); rota.style.setProperty('--rota-u', v > 0.01 && v < 0.99 ? 1 : 0);
  let son = -1;
  rotaNokta.forEach((li, i) => { const g = AZ || ust[i] + 24 <= cizgi + 1; li.toggleAttribute('data-gecti', g); if (g) son = i; });
  rotaYil.textContent = rotaNokta[Math.max(0, son)].querySelector('time').textContent;
  rotaYil.style.top = `${(rota.offsetTop + v * rota.offsetHeight).toFixed(1)}px`;
  rotaYil.style.opacity = !AZ && v > 0.01 && v < 0.99 ? '1' : '0';
}

const ayrinti = () => import('./sahne/ayrinti.mjs');
rota.addEventListener('click', (e) => { const a = e.target.closest('.serit__ac'); if (a) { e.preventDefault(); ayrinti().then((m) => m.ac(a.hash.slice(7))); } });
rota.addEventListener('pointerover', ayrinti, { once: true });
const tarihAdres = () => { if (location.hash.startsWith('#tarih-')) ayrinti().then((m) => m.ac(decodeURIComponent(location.hash.slice(7)))); };
addEventListener('hashchange', tarihAdres); tarihAdres();

let boyutZaman = 0;
new ResizeObserver(() => { cancelAnimationFrame(boyutZaman); boyutZaman = requestAnimationFrame(() => { isaretKoy(); sehirYerlestir(); kaydirma(); }); }).observe(document.body);
kaydirma();

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
const hesapGiris = $('[data-i18n="hesapGiris"]'), hesapGirisli = $('#hesap-girisli');
const hesapGirisYaz = () => { hesapGiris.hidden = !!kartKullanici; hesapGirisli.hidden = !kartKullanici; if (kartKullanici) hesapGirisli.textContent = metin(kartKullanici.dogrulandi ? 'hesapGirisli' : 'hesapGirisliBekliyor'); };
addEventListener('dil-degisti', hesapGirisYaz);
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
addEventListener('hesap-degisti', (e) => { kartKullanici = e.detail; $('.hesap__adimlar').hidden = !!kartKullanici?.dogrulandi; hesapGirisYaz(); if (kartKullanici) kartYaz(kartKullanici, 'profil'); else formdanKart(); });
addEventListener('dil-degisti', () => { if (kartKullanici) kartYaz(kartKullanici, 'profil'); else formdanKart(); });
formdanKart();

const pano = panoKur({ tablo: $('#pano'), pencere: $('#bilet'), az: AZ });
new IntersectionObserver((g, io) => { if (g[0].isIntersecting) { io.disconnect(); pano.dondur(); } }, { threshold: 0.35 }).observe($('#pano'));
const saat = $('#pano-saat'), saatBicim = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
const saatYaz = () => { saat.textContent = `IST ${saatBicim.format(new Date())}`; };
saatYaz(); setInterval(saatYaz, 20000);

const yaziListe = $('#yazi-listesi');
const tarihYaz = (t) => new Intl.DateTimeFormat(etkinDil() === 'en' ? 'en-GB' : 'tr-TR', t.length === 7 ? { month: 'long', year: 'numeric', timeZone: 'UTC' } : { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  .format(new Date(t.length === 7 ? `${t}-01T00:00:00Z` : `${t}T00:00:00Z`));
let yazilar = null;
const bag = (s) => s.replace(/(\d) (?=\p{L})/gu, '$1 ').replace(/ (\d{4})/g, ' $1');
const PUL = ['kiz', 'galata', 'kopru', 'cami', 'vapur', 'ev'];
const KART = { 'as-istanbul-temmuz-2026': 'hangar', 'as-istanbul-mayis-2026': 'muze', 'as-istanbul-temmuz-2025': 'kabin', 'akademik-yil-kapanisi-2024': 'mangal', 'turkish-technic-gezisi-2024': 'genis', 'lustrum-emeac-2024': 'lustrum' };
function yazilariCiz() {
  if (!yazilar?.length) return;
  const d = etkinDil();
  yaziListe.replaceChildren(...yazilar.filter((y) => y.kaynak !== 'AESTRO' && y.id !== 'aestro-yolculugu').map((y, i) => {
    const li = document.createElement('li'); li.className = 'kartpostal';
    const pul = PUL[i % PUL.length];
    li.innerHTML = `<svg class="kartpostal__resim" viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><use href="gorseller/semboller.svg#${KART[y.id] ? 'kart-' + KART[y.id] : 'pul-' + pul}"/></svg><div class="kartpostal__yazi"><span class="kartpostal__pul" aria-hidden="true"><svg viewBox="0 0 100 100" focusable="false"><use href="gorseller/semboller.svg#pul-${pul}"/></svg></span><p class="kartpostal__damga"><time></time></p><h3><a></a></h3><p class="kartpostal__ozet"></p><p class="kartpostal__adres" aria-hidden="true" lang="fr">Par avion · AS Istanbul → EUROAVIA</p></div>`;
    li.querySelector('time').textContent = tarihYaz(y.tarih);
    li.querySelector('time').dateTime = y.tarih;
    if (y.kaynak && y.kaynak !== 'EUROAVIA') li.querySelector('.kartpostal__damga').after(Object.assign(document.createElement('span'), { className: 'etiket', textContent: y.kaynak }));
    const a = li.querySelector('a');
    a.textContent = bag((d === 'en' && y.baslik_en) || y.baslik_tr);
    if (y.baglanti) { a.href = y.baglanti; a.target = '_blank'; a.rel = 'noopener'; }
    else { a.href = `#yazi-${y.id}`; a.addEventListener('click', (e) => { e.preventDefault(); yaziAc(y); }); }
    li.querySelector('.kartpostal__ozet').textContent = bag((d === 'en' && y.ozet_en) || y.ozet_tr);
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
    try { yazilar = (await (await fetch('veri/yazilar.json')).json()).map((y) => ({ id: y.id, tarih: y.tarih, kaynak: y.kaynak, baglanti: y.baglanti, baslik_tr: y.baslik.tr, baslik_en: y.baslik.en, ozet_tr: y.ozet.tr, ozet_en: y.ozet.en, govde_tr: y.govde?.tr || '', govde_en: y.govde?.en || '' })); } catch { }
  }
  yazilariCiz();
});
addEventListener('dil-degisti', yazilariCiz);

const izIO = new IntersectionObserver((g) => { for (const x of g) if (x.isIntersecting) { x.target.classList.add('gorundu'); izIO.unobserve(x.target); } }, { rootMargin: '0px 0px -20% 0px' });
for (const b of [...$$('.bolum'), $('.alt')]) izIO.observe(b);

let ag = null, agGorunur = false;
gozle($('#ag'), {
  yakin: '600px',
  async ilk() { ag = await (await import('./sahne/ag.mjs')).agKur({ kap: $('#harita'), liste: $('#takvim'), secim: $('#ag-secim'), km: $('#ag-km'), az: AZ }); ag.gorunur(agGorunur); },
  gorunur: (b) => { agGorunur = b; ag?.gorunur(b); },
});

const sponsorAdres = $('#sponsor-adres').textContent.trim(), sponsorYaz = $('#sponsor-yaz');
function sponsorBagla() { sponsorYaz.href = `mailto:${sponsorAdres}?subject=${encodeURIComponent(metin('sponsorKonu'))}&body=${encodeURIComponent(metin('sponsorGovde'))}`; }
sponsorBagla(); addEventListener('dil-degisti', sponsorBagla);
$('#sponsor-kopyala').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(sponsorAdres); duyuru.textContent = metin('adresKopyalandi', { adres: sponsorAdres }); }
  catch { duyuru.textContent = metin('adresKopyalanamadi', { adres: sponsorAdres }); }
});

for (const g of $$('#hesap-panel input[type="password"]')) {
  const kutu = document.createElement('span'); kutu.className = 'alan__kutu';
  g.replaceWith(kutu); kutu.append(g);
  const d = Object.assign(document.createElement('button'), { type: 'button', className: 'alan__goster' });
  const yaz = () => { const acik = g.type === 'text'; d.textContent = metin(acik ? 'parolaGizle' : 'parolaGoster'); d.setAttribute('aria-pressed', String(acik)); };
  d.addEventListener('click', () => { g.type = g.type === 'password' ? 'text' : 'password'; yaz(); g.focus(); });
  g.form?.addEventListener('submit', () => { g.type = 'password'; yaz(); });
  kutu.append(d); yaz(); addEventListener('dil-degisti', yaz);
}

gozle($('.alt'), { yakin: '0px', ilk() {
  const gece = ist.cloneNode(true);
  gece.id = 'istanbul-gece'; gece.setAttribute('class', 'ist ist--gece'); gece.removeAttribute('style');
  $('.alt__sehir').append(gece); sehirYerlestir();
  istKur(gece, { sure: 900, sonra: () => gece.classList.add('ist--isik') });
} });
const altSaat = $('#alt-saat'), altSaatYaz = () => { altSaat.textContent = saatBicim.format(new Date()); };
altSaatYaz(); setInterval(altSaatYaz, 20000);

const yumusakAc = () => requestAnimationFrame(() => document.documentElement.classList.add('yumusak'));
if (document.readyState === 'complete') yumusakAc(); else addEventListener('load', yumusakAc, { once: true });

if (prm.has('olc')) globalThis.__uumk = { ucus: () => ucus, adNo: () => adNo };
