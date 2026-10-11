# UUMK v14 — teslim notu (11 Ekim 2026 gece)

Kaynak istek: 1) kabin animasyonlu ama uçak zeminden ayrışmıyor; zemine apron teması · 2) gece İstanbulunda bazı bölümler gelişigüzel
çizilmiş, toparla · 3) altbilgide e-posta sıkışık ve farklı bir adres verilmiş gibi duruyor, kafa karıştırıcı.
(Önceki istekteki kimlik uçuşu düzeltmesi de bu teslimde; bkz. `v13-teslim.md` "Ek 2".)

| # | İstek | Bulunan | Yapılan | Kanıt |
|---|---|---|---|---|
| 1 | Apron | v12'de "ekran görüntüsü gibi" şikâyeti üzerine zemin yalnız gölge alan saydam düzleme çevrilmişti; uçak kâğıt renginde zemine oturuyor, beyaz gövde ayrışmıyordu | Sahneyi kenardan kenara dolduran koyu beton apron (120×120 birim, görünür kenarı yok; 4 birimlik plaka ve derz dokusu, gölge alır) + ayrı saydam katmanda boyalı işaretler: arkadaki taksi yolundan park yerine kıvrılan sarı çizgi, burun tekerinde durma çubuğu, kırmızı kesikli park alanı sınırı, bagaj treninin dolaştığı servis yolunun beyaz kesikli kenarları, "A1". Zemin uçakla birlikte salınır. Masaüstünde sahne köşeleri yuvarlak (r-2), telefonda kenardan kenara. Posterler yeniden üretildi (1800: 101 → 160 kB; tembel yüklenir, ilk yükleme bütçesine girmez) | çekim `.cekim-gecici/uumk/apron/` |
| 2 | Gece İstanbulu | Kök neden: `site.css` `.alt svg { fill: none; stroke: var(--gece-vurgu); stroke-width: 1.6 }` altbilgi simgeleri için yazılmıştı ama altbilgideki gece panoraması da bir svg; kendi çizgi rengi olmayan her parça (uzak siluet dikdörtgenleri, köprü kuleleri ve viyadüğü, bulutlar) bu sarı 1,6 px çizgiyi miras alıyordu: üst üste binen sarı kutular | Kural `.alt svg:not(.ist)` oldu. Gece panoraması gündüzle aynı çizimi gece paletiyle gösterir: uzak siluet koyu ve çerçevesiz, köprü gri çizgili ve tabliyesinde sarı ışıklar, bulutlar koyu | çekim `gece4/` (önce `gece/`) |
| 3 | Altbilgi e-postası | `istanbul@euroavia.eu` adresin hemen altında, büyük (t-3) ve kalın, etiketsizdi. Adres doğru: EUROAVIA'nın AS Istanbul sayfasında kulübün adresi (`arastirma.md:53`, `dogrulanmis-olgular.md:9`); kaynaklarda doğrulanmış başka bir kulüp adresi yok | Zarf simgeli ayrı satır (adresle aynı düzen, 16 px ara), normal punto, altında açıklama: "Kulübün e-postası; EUROAVIA'da AS Istanbul adıyla kayıtlı" (EN: "The club's email, registered with EUROAVIA as AS Istanbul"); bağlantının dokunma yüksekliği 44 px | çekim `alt/m.png` |

Testler: dogrula 1572/0 (apron ve telefon denetimleri yeni yapıya göre) · e2e tam koşu 38/39 (`.cekim-gecici/uumk/e2e-v14.txt`): düşen "açılış İstanbul'u" (kapak panoramasının ilk ölçümü yükleme süresine bağlı; bu işte dokunulmadı) tek başına 2/2 geçti · axe 0 ihlal (390 TR, 1440 EN) · mobil-denetim 320/390/1440: taşma 0, < 44 px hedef 0 (320'deki tek çakışma ekran dışı "İçeriğe geç") · UX 0 HATA / 7 UYARI.
Bütçe: CSS gzip 17,97 / 18 kB — sınırda. Sonraki görsel işte sınır ya yükseltilmeli ya da başka yerden kısılmalı.
Risk: apronun rengi ışık ve ton eşlemesiyle hafif sıcak (bej-gri) çıkıyor; daha soğuk/koyu istenirse `plaka` dokusunun taban rengi tek satır.

## Ek: geri bildirim sonrası (gece İstanbulu, apron)
- Gece İstanbulu "eskiden daha estetikti": v13 öncesindeki ışıklı görünüm, altbilgi simge kuralından panoramaya sızan sarı 1,6 px çizgiydi (pencere
  çerçeveleri, köprü, siluet, bulutlar). Kullanıcı tercihi bu: aynı çizgi artık bilerek ve yalnız gece panoramasına yazılı (`.ist--gece { fill: none;
  stroke: var(--gece-vurgu); stroke-width: 1.6 … }`); en dağınık kısım olan üst üste binen uzak siluet kutuları %55 çizgi opaklığında. Karşılaştırma:
  `.cekim-gecici/uumk/gece5/karsi.png` (üst v12, alt şimdi).
- Apron "konteyner gibi": sahne masaüstünde ekran genişliğinde (100vw, 2,2:1; köşe yuvarlaklığı yok), telefonda 4:3 kenardan kenara.
  "Garip çizgiler": (1) plaka dokusundaki her plakada aynı yerde tekrarlanan kısa tire lekeleri → tohumlu, düzensiz 1 px doku; (2) kanat arkasındaki üç
  flap rayı, koyu zeminde kanattan kopuk beyaz çubuk gibi duruyordu → kaldırıldı. Kart sahne üstüne ≥ 1360 px'te biner (1280'de gövdeye ~20 px
  biniyordu); daha dar ekranda altta. Posterler 2,2:1 yeniden üretildi (1800×818, 1200×545, 800×363), numara konumları yeni çerçeveden.
- Testler: dogrula 1572/0 · e2e 39/39 (`e2e-v14b.txt`) · axe 0 (1440) · mobil-denetim 390/1047/1366: taşma 0, çakışma 0, küçük hedef 0, sayfa genişliği = ekran ·
  UX 0 HATA / 7 UYARI · CSS gzip 17,97 / 18 kB.
