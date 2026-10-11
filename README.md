# İTÜ UUMK · EUROAVIA AS Istanbul — web sitesi (v4)

İTÜ Uçak Uzay Mühendisliği Kulübü'nün sitesi: gündem ve etkinlik kayıtları (hesap ya da misafir), son etkinlikler, yazılar,
kulüp ve EUROAVIA ağı. Türkçe ve İngilizce. Bağımlılık yok: tarayıcı tarafı bağımsız ES modülleri (WebGL gerekmez); sunucu
tarafı Node ve yerleşik SQLite (`node:sqlite`; bayraksız kullanım için 22.13+ önerilir, `siteyi-ac.cmd` modülün yüklenip yüklenmediğini doğrudan dener).

**Açılış.** Solda sabit ana başlık (h1) ve kulübü anlatan sabit açıklama; kaydırdıkça yalnız ad değişir: İTÜ Uçak Uzay
Mühendisliği Kulübü → "AS Istanbul" (altında küçük EUROAVIA) → "İTÜ UUMK"; harfler kelimenin kırpma kutusunda sırayla kayar. Sağda katlanmış kâğıt uçak uçar (tuvalde kendi 3B
izdüşümü, `sahne/ucus.mjs`): dönüşte yatar, taklada sırtüstü döner, arkasında kesikli iz, önünde gideceği yolun soluk uçuş planı; gökte üç küçük kâğıt uçak.
Sahnenin altında blok blok kurulan İstanbul panoraması (`sahne/istanbul.mjs` preseti: Süleymaniye, Yeni Cami, Galata, Boğaz Köprüsü, suyun içinde
Kız Kulesi, Üsküdar, vapur, martılar, dalgalar); açılışta parça parça yükselir, kaydırdıkça katmanlar farklı hızda kayar. Alt bilgide aynı preset gece renkleriyle. Sayfa boyunca aynı iz: üst şeritte ilerleme, bölüm etiketleri, tarihçe rotası,
harita rotaları, alt bilgide pist. Siyah bölümlere (pano, EUROAVIA gece haritası, alt bilgi) geçişte ufuk kavisi kaydırdıkça düzleşir.

**Renk ve yazı.** Palet "E · Hangar" (11 Ekim 2026, yedi seçenek arasından seçildi): beton grisi zemin #ecebe7, vurgu UUMK logosundaki petrol #056b7a, kalkış panosu ve alt bilgi siyah #1a1a1a üstüne sarı #f2c200. Önizlemeler `notlar/palet-secenekleri/`. Başlıklar
Source Serif 4, gövde Instrument Sans (OFL, yerel). Ayrıntı: `notlar/tasarim.md`.

## Çalıştırma

```
node araclar/ornek-veri.mjs                 # yalnız ilk sefer: yerel deneme veritabanı ("(örnek)" etkinlikler + yazılar)
node sunucu/sunucu.mjs --deneme             # http://127.0.0.1:4210/   (yayın veritabanı için --deneme olmadan)
```

E-postalar SMTP tanımlanmadıysa `sunucu/posta-kutusu/` klasörüne yazılır (doğrulama ve parola bağlantıları oradan açılır).
`siteyi-ac.cmd` (çift tıkla): Node 22.13+ varsa tam siteyi yerel deneme veritabanıyla açar (http://127.0.0.1:8790/; hesap, giriş, etkinlik kaydı;
e-postalar `sunucu/posta-kutusu/`); Node yoksa yalnız sayfaları PowerShell sunucusuyla açar (kayıt ve hesap kapalı görünür).

URL anahtarları: `?dil=en` · `?az=1` (hareket azaltma) · `?hafif=1` (düşük çizim kalitesi) · `?p=0.5` (açılışı o karede dondur) · `#etkinlik-<id>`
(biniş kartı açık) · `#sifre-yenile=<belirteç>` · `?olc=1` (sınama kancaları).

## Etkinlik kaydı nasıl çalışır

- **Hesap:** ad, soyad, okul e-postası (`@itu.edu.tr`) ve okul numarası zorunlu; parola scrypt özetiyle saklanır. Hesap e-postayla
  doğrulanır. Doğrulanmış hesapla etkinliğe **tek tıkla** kaydolunur; kayıt hesabın bilgileriyle yazılır, onay e-postası gider.
- **Misafir:** her etkinlikte ad, soyad, okul e-postası, okul numarası ve aydınlatma onayını yeniden girer.
- Aynı etkinliğe aynı e-posta ya da okul numarasıyla ikinci kayıt alınmaz; kontenjan ve son kayıt anı sunucuda denetlenir.
- Hesap sahibi kaydını iptal edebilir, hesabını silebilir (başlamamış etkinliklerdeki kayıtları da silinir).
- **Yönetim** (`yonetim.html`, rol: yönetici): etkinlik ekle/düzenle, kaydı aç/kapat, kayıt listesini CSV indir, yazı ekle/sil.
  İlk yönetici sunucuda atanır: `node sunucu/yonet.mjs yonetici <eposta>` (diğer komutlar: `yonet.mjs` başlığı).
- Güvenlik: HttpOnly + SameSite=Lax oturum çerezi, durum değiştiren isteklerde `X-UUMK: 1` başlığı ve Origin denetimi (CSRF),
  giriş/kayıt/e-posta hız sınırı (IP yalnız GUVENILIR_VEKIL=1 iken X-Forwarded-For'dan), CSV'de formül kaçışı, gizli klasörler (sunucu/, notlar/, araclar/, kaynak/, .db) 404.

### Yayına alma (kulübün kararı)
Sunucu tek bir Node süreci; bir ters vekil (nginx/Caddy) arkasında HTTPS ile çalıştırılır:
`PORT=4210 SITE_ADRESI=https://… GUVENLI_CEREZ=1 GUVENILIR_VEKIL=1 SMTP_URL=smtps://kullanici:parola@sunucu:465 POSTA_GONDEREN="İTÜ UUMK <…>" node sunucu/sunucu.mjs`.
Veritabanı tek dosya (`sunucu/veri/uumk.db`); yedeklemek için dosyayı kopyalamak yeterli. Vercel gibi yalnız statik barındırmada
site açılır, kayıt bölümü "sunucuya ulaşılamıyor" der ve yazılar `veri/yazilar.json`'dan gelir.

## Bölümler

| Bölüm | İçerik |
|---|---|
| Açılış | Sabit ana başlık, adın üç hâli (UUMK · AS Istanbul/EUROAVIA · İTÜ UUMK), kâğıt uçaklar, blok blok kurulan İstanbul panoraması, "Gündem" + "Üye ol" |
| 01 Biz kimiz | Künye, 8 faaliyet, uçak gövdesi biçiminde kabin ekipleri (kokpit = yönetim kurulu), Güz/Bahar çizelgesi; koyu bantta "uçuş şeritleri" tarihçesi (11 kayıt, 1941–2026, kaydırdıkça dolan omurga) |
| 02 Gündem | Kayda açık etkinlikler (sunucudan; ilk 4, kalanı "göster") + duyurular (2026–27 programı, yeni öğrenciler, EUROAVIA Ideathon 2026) |
| 03 Son etkinlikler | Kalkış panosu (10 etkinlik) + biniş kartı (rota, tür, uçuş kodu, damga, fotoğraf, dile göre tarih) + 3 fotoğraf |
| 04 Yazılar | AESTRO rafı (3 kapak) + AS Istanbul'un 6 EUROAVIA dönem raporu kartpostal olarak; yönetimden eklenen yazılar sitenin kendi okuyucusunda açılır |
| 05 EUROAVIA | Koyu "gece haritası": 40 grup / 15 ülke, İstanbul'dan sarı rotalar ve uçaklar, seçimde odak + km sayacı; ağın 2025–26 takvimi (5 tam satır + "Tüm takvim", geçmişler soluk) |
| 06 Sponsorluk | 4 iş birliği biçimi (doğrulanmış geçmiş örnekleriyle), "E-posta yaz" (konu satırı hazır) + "Adresi kopyala" |
| 07 Hesap | "Check-in" paneli, parola göster/gizle, "Kulüp kartın" (forma yazdıkça dolar), giriş / hesap aç / parola / profil, kayıtlarım, hesabı sil |

## Kaynak disiplini

Sitedeki her olgu `notlar/dogrulanmis-olgular.md`'dedir (kaynağından okunanlar, adresleriyle). Doğrulayıcı sayfadaki her dış
bağlantının, her pano kaynağının ve her yazının bu notta olduğunu; HTML'deki sayıların veriden hesaplananla aynı olduğunu sınar.
**Kuruluş:** kulübün 2001–2002 sayfaları kuruluşu 4 Ocak 2001 (İTÜ) ve EUROAVIA'ya girişi 7 Mayıs 2001 (Varşova, aday üye) olarak
veriyor; EUROAVIA'nın bugünkü sitesindeki "1999" gerekçesiz ve EUROAVIA'nın Eylül 2000 listesiyle çelişiyor (`notlar/logo-foto-kurulus.md`).

## Araçlar

```
node araclar/dogrula.mjs                     # ~1150 sınama, tarayıcısız (açılış yörüngesi, panorama = preset dahil)
node araclar/istanbul-insa.mjs [--sina]      # İstanbul panoramasını ve pulları sahne/istanbul.mjs'ten index.html'e yazar (preset değişince)
node araclar/sunucu-sina.mjs                 # 61 sınama: API, güvenlik, kayıt akışları, 404 sayfası (geçici veritabanıyla)
node araclar/uctan-uca.mjs                   # 29 senaryo, başsız Chrome (sunucu --deneme ile açık olmalı; sınama etkinliklerini önce ve sonra siler)
node araclar/erisilebilirlik.mjs 1440x900    # axe-core
node araclar/cekim.mjs <adres> <klasör> [g] [y] [adım…]
node "C:\Users\ayber\Desktop\Custom Yetenekler\ux-yasalari\scripts\ux-yasa-denetimi.mjs" index.html --tablo
```

## Dosyalar

| Yol | Görev |
|---|---|
| `index.html` · `kvkk.html` · `yonetim.html` · `404.html` | Türkçe metnin tek kaynağı · aydınlatma metni (taslak) · yönetim · bulunamadı sayfası (kökten mutlak yollar) |
| `site.css` · `site.mjs` · `ceviri.mjs` · `dil/en.mjs` | Tasarım sistemi · denetleyici · dil altyapısı · İngilizce |
| `sahne/ucus.mjs` | Açılıştaki uçak: yörünge, koordineli uçuş yönü, çizim; gökteki küçük kâğıt uçaklar; adın hâl pencereleri |
| `sahne/istanbul.mjs` | İstanbul panoraması preseti (yapı taşları → bloklar → sahne); yalnız üretim zamanında (`araclar/istanbul-insa.mjs`) çalışır |
| `sahne/hesap.mjs` | Hesap paneli, etkinlik kartları, misafir formu |
| `sahne/pano.mjs` · `ag.mjs` · `harita.mjs` · `renk.mjs` | Pano + biniş kartı · EUROAVIA denetleyicisi · harita · palet |
| `sunucu/` | `sunucu.mjs` (HTTP + statik), `api.mjs`, `vt.mjs` (şema), `guvenlik.mjs`, `posta.mjs`, `ayar.mjs`, `yonet.mjs` |
| `veri/` | `ag.mjs` (EUROAVIA), `kure-maske.mjs`, `yazilar.json` |
| `gorseller/` | Logolar (kulübün 2023 site logosundan kırpıldı; beyaz sürümler alt bilgi için), fotoğraflar, favicon |
| `kaynak/v1/` · `kaynak/v2/` | Önceki sürümler (v2: katlanan kâğıt, küre); yayına girmez |

## Bilinen sınırlar ve kulübe sorulacaklar

- Aydınlatma metni taslak; köşeli parantezli yerler kulübün kararını bekliyor (saklama süresi, barındırma, başvuru adresi).
- Okul numarası biçimi şimdilik "8–11 rakam" (`OKUL_NO_DESENI`); İTÜ'nün kesin biçimi teyit edilmeli.
- Fotoğraflarda kişiler seçiliyor; kulübün paylaşım onayı alınmalı. Logo vektör değil (2048 px PNG); vektör dosya kulüpten istenmeli.
- Güz 2026 için tarihli etkinlik bilgisi yok; gündem "hazırlanıyor" der.
- Ayrı bir sponsorluk e-posta adresi bulunamadı; sponsorluk düğmesi istanbul@euroavia.eu'ya "Sponsorluk" konulu e-posta açar. ATA İHA Takımı'nın bugünkü durumu doğrulanmadı (sitede yalnız 2021 sonucu ve sponsoru, yılıyla).
- Firefox ve Safari'de ve gerçek telefonda sınanmadı (ölçümler başsız Chrome'da; işlemci 4× yavaşlatılarak da). Telefonda takvimden seçimde haritaya
  yumuşak kaydırma başsız Chrome'da doğrulanamadı (yalnız hareket azaltma kipinde anlık kaydırma sınandı).
- Paylaşım önizlemesi görseli (`og:image`) mutlak adres ister; alan adı belli olunca eklenmeli.
