/* ÇEVİRİ — TR (index.html) / EN (dil/en.mjs). Ayrıntı: notlar/tasarim.md "Modül notları". */

export const DILLER = ['tr', 'en'];
const ANAHTAR = 'uumk-dil';

export const JS_TR = {
  kayitAcik: 'Kayıt açık', kayitKapali: 'Kayıt kapalı', kontenjanDoldu: 'Kontenjan doldu', kalan: '{n} yer kaldı', kontenjansiz: 'Kontenjan sınırı yok',
  kaydol: 'Kaydol', kayitlisin: 'Kayıtlısın', iptalEt: 'Kaydı iptal et', gonder: 'Kaydı gönder', vazgec: 'Vazgeç',
  misafirNot: 'Misafir kaydında bilgilerini her etkinlikte yeniden girersin.',
  dogrulaNot: 'Tek tıkla kayıt için önce e-postanı doğrula.', dogrulamaGonder: 'Doğrulama e-postasını yeniden gönder', dogrulamaGitti: 'Doğrulama e-postası gönderildi.',
  kayitAlindi: 'Kaydın alındı. Onay e-postası {eposta} adresine gönderildi.', kayitIptal: 'Kaydın iptal edildi.',
  sunucuYok: 'Etkinlik kaydı burada şu an kapalı. Instagram duyurusundaki formdan kaydolabilirsin.',
  etkinlikYok: 'Şu an kayda açık etkinlik yok. Yeni etkinlik açıldığında burada görünür.',
  girisYap: 'Giriş yap', hesabim: 'Hesabım', cikis: 'Çıkış yap', merhaba: 'Merhaba, {ad}',
  hesapAcildi: 'Hesabın açıldı. {eposta} adresine doğrulama bağlantısı gönderildi.', dogrulandi: 'E-postan doğrulandı. Artık etkinliklere tek tıkla kaydolabilirsin.',
  dogrulamaGecersiz: 'Doğrulama bağlantısı geçersiz ya da süresi dolmuş. Hesabından yeni bağlantı iste.',
  sifreGitti: 'Bu adres kayıtlıysa parola yenileme bağlantısı gönderildi.', sifreYenilendi: 'Parolan yenilendi ve giriş yaptın.',
  kayitlarim: 'Kayıtlı olduğun etkinlikler', kayitYok: 'Henüz bir etkinliğe kaydolmadın.',
  yukleniyor: 'Yükleniyor…', okuDevam: 'Yazıyı aç', disBaglanti: '{kaynak} sayfasında açılır',
  menuAc: 'Menüyü aç', menuKapat: 'Menüyü kapat',
  bosBekleme: 'Şu an kayda açık etkinlik yok', bosBeklemeNot: 'Yeni etkinlikler kayda açıldığında burada listelenir; Instagram\'da da duyurulur.', bosKapali: 'Etkinlik kaydı bu sitede şu an kapalı', bosKapaliNot: 'Etkinliklere Instagram duyurusundaki formdan kaydolabilirsin.', bosTakip: 'Instagram: @ituuumk ↗',
  ayrintiKaynak: 'Kaynaklar', ayrintiOnceki: 'Önceki kayıt', ayrintiSonraki: 'Sonraki kayıt', ayrintiGaleri: 'Fotoğraflar ({n})', ayrintiFotoKaynak: 'Fotoğrafın kaynağı',
  sponsorKonu: 'Sponsorluk — İTÜ UUMK', sponsorGovde: 'Merhaba,\n\n[Şirket] adına İTÜ UUMK ile sponsorluk ya da iş birliği hakkında görüşmek istiyoruz.\n\nAd soyad:\nŞirket:\nTelefon:\n',
  adresKopyalandi: '{adres} kopyalandı.', adresKopyalanamadi: 'Kopyalanamadı; adres: {adres}', parolaGoster: 'Göster', parolaGizle: 'Gizle',
  turGezi: 'Teknik gezi', turAtolye: 'Atölye', turKurs: 'Kurs', turYarisma: 'Yarışma', turSosyal: 'Sosyal', ucusKod: 'Uçuş',
  dahaFazla: 'Diğer {n} etkinliği göster', takvimeEkle: 'Takvime ekle', kartAd: 'Ad Soyad', kartTaslak: 'Henüz hesap yok', kartCanli: 'Hesap açılıyor', kartDogrulandi: 'Doğrulandı', kartBekliyor: 'Doğrulama bekliyor',
  'h-ad-gerekli': 'Adını yaz.', 'h-soyad-gerekli': 'Soyadını yaz.', 'h-eposta-gecersiz': 'Geçerli bir e-posta adresi yaz.',
  'h-eposta-okul': 'Okul e-postanı yaz (@{alan}).', 'h-okul-no-gecersiz': 'Okul numaran yalnız rakamlardan oluşmalı.',
  'h-kvkk-gerekli': 'Aydınlatma metnini okuduğunu işaretle.', 'h-parola-kisa': 'Parola en az 8 karakter olmalı.', 'h-parola-uzun': 'Parola çok uzun.',
  'h-eposta-kayitli': 'Bu e-postayla açılmış bir hesap var. Giriş yap.', 'h-okul-no-kayitli': 'Bu okul numarasıyla açılmış bir hesap var.',
  'h-giris-hatali': 'E-posta / okul numarası ya da parola hatalı.', 'h-cok-istek': 'Çok fazla deneme. Birkaç dakika sonra tekrar dene.',
  'h-dogrulanmamis': 'Önce e-postanı doğrula.', 'h-zaten-kayitli': 'Bu etkinliğe bu bilgilerle zaten kayıt var.',
  'h-kayit-kapali': 'Bu etkinliğin kaydı kapandı.', 'h-kontenjan-doldu': 'Kontenjan doldu.', 'h-etkinlik-yok': 'Etkinlik bulunamadı.',
  'h-belirtec-gecersiz': 'Bağlantı geçersiz ya da süresi dolmuş.', 'h-oturum-yok': 'Oturumun kapanmış. Yeniden giriş yap.',
  'h-parola-yanlis': 'Mevcut parola yanlış.', 'h-konu-gecersiz': 'Bir konu seç.', 'h-mesaj-kisa': 'Mesajın en az 10 karakter olmalı.',
  hesapGirisli: 'Hesabın açık. Kayda açık etkinliklere gündemden tek tıkla kaydolursun; bilgilerin karttan gelir.', hesapGirisliBekliyor: 'Hesabın açıldı. Tek tıkla kayıt için önce okul e-postana gelen bağlantıyla hesabını doğrula.',
  rozetDogrulandi: 'E-posta doğrulandı', rozetBekliyor: 'E-posta doğrulanmadı', rozetYonetici: 'Yönetici',
  profilKaydedildi: 'Profilin güncellendi.', parolaDegisti: 'Parolan değiştirildi; diğer cihazlardaki oturumlar kapandı.',
  bildirimGitti: 'Mesajın yönetim ekibine gönderildi. Yanıt okul e-posta adresine gelir.', bildirimKaydedildi: 'Mesajın kaydedildi; e-posta şu an gönderilemedi, yönetim ekibi siteden görecek.',
  'h-sunucu-hatasi': 'Sunucuda bir hata oldu. Biraz sonra tekrar dene.', 'h-genel': 'İşlem tamamlanamadı.',
};

let dil = 'tr', sozluk = null, ilkHal = null;
export const etkinDil = () => dil;

export function dilSec() {
  const p = new URLSearchParams(location.search).get('dil');
  let k = null; try { k = localStorage.getItem(ANAHTAR); } catch { }
  if (/bot|crawl|spider|slurp/i.test(navigator.userAgent)) return 'tr';
  if (DILLER.includes(p)) return p;
  if (DILLER.includes(k)) return k;
  return String(navigator.language || 'tr').slice(0, 2).toLowerCase() === 'tr' ? 'tr' : 'en';
}

export function metin(anahtar, d = {}) {
  const kaynak = (dil === 'en' && sozluk?.JS?.[anahtar]) || JS_TR[anahtar] || anahtar;
  return kaynak.replace(/\{(\w+)\}/g, (_, k) => d[k] ?? '');
}
export const hataMetni = (kod, d) => metin('h-' + kod, d) === 'h-' + kod ? metin('h-genel') : metin('h-' + kod, d);

function anlik() {
  if (!ilkHal) {
    ilkHal = new Map([['baslik', document.title]]);
    for (const e of document.querySelectorAll('[data-i18n]')) ilkHal.set(e, e.textContent);
    for (const e of document.querySelectorAll('[data-i18n-html]')) ilkHal.set(e, e.innerHTML);
    for (const t of ['aria', 'alt', 'placeholder', 'title']) for (const e of document.querySelectorAll(`[data-i18n-${t}]`)) ilkHal.set(`${t}|${e.getAttribute(`data-i18n-${t}`)}`, e.getAttribute(t === 'aria' ? 'aria-label' : t));
  }
}
function uygula(s) {
  const nesne = s ? s.SAYFA : null;
  anlik();
  for (const e of document.querySelectorAll('[data-i18n]')) e.textContent = nesne?.[e.dataset.i18n] ?? ilkHal.get(e) ?? e.textContent;
  for (const e of document.querySelectorAll('[data-i18n-html]')) e.innerHTML = nesne?.[e.dataset.i18nHtml] ?? ilkHal.get(e) ?? e.innerHTML;
  for (const t of ['aria', 'alt', 'placeholder', 'title']) for (const e of document.querySelectorAll(`[data-i18n-${t}]`)) {
    const k = e.getAttribute(`data-i18n-${t}`);
    e.setAttribute(t === 'aria' ? 'aria-label' : t, nesne?.[k] ?? ilkHal.get(`${t}|${k}`));
  }
  document.title = nesne?.baslik ?? ilkHal.get('baslik') ?? document.title;
}

export async function dilKur({ dugme }) {
  anlik();
  const yaz = async (yeni, kaydet) => {
    if (yeni === 'en' && !sozluk) sozluk = await import('./dil/en.mjs');
    dil = yeni;
    document.documentElement.lang = yeni;
    uygula(yeni === 'en' ? sozluk : null);
    document.documentElement.classList.remove('dil-bekle');
    if (dugme) { dugme.dataset.etkin = yeni; dugme.setAttribute('aria-label', yeni === 'en' ? 'Türkçeye geç' : 'Switch to English'); }
    if (kaydet) { try { localStorage.setItem(ANAHTAR, yeni); } catch { } }
    const u = new URL(location.href);
    if (kaydet) { if (yeni === 'en') u.searchParams.set('dil', 'en'); else u.searchParams.delete('dil'); history.replaceState(null, '', u); }
    dispatchEvent(new CustomEvent('dil-degisti', { detail: yeni }));
  };
  dugme?.addEventListener('click', () => yaz(dil === 'en' ? 'tr' : 'en', true));
  dugme?.addEventListener('pointerenter', () => { if (!sozluk) import('./dil/en.mjs').then((m) => { sozluk = m; }); }, { once: true });
  const ilk = dilSec();
  if (ilk !== 'tr') await yaz(ilk, false); else document.documentElement.classList.remove('dil-bekle');
}
