# YASA DENETİMİ — UUMK v4 index.html · 2026-10-11 · denetleyici: index "0 HATA · 4 UYARI" (önce 8 UYARI: köşe yarıçapı 8 değer → jetonlara çekildi; dalga animasyonları ayrı satırda süre yazıldığı için "sonlu" görünüyordu → tek kısa yazım, sonsuz)

Ölçüm: denetleyici `--tablo` + canlı DOM (`araclar/cekim.mjs` js adımı, 1440×900 ?az=1) + axe 0 ihlal (1440 TR, 1440 hareketli, 1440 EN, 390, 1024, yönetim, kvkk; önce 1 ihlal: alt bilgideki sarı düğmede `.alt a` rengi eziyordu, 1,49:1 → düzeltildi). Sonuç: 20/20 ölçüldü · 0 HATA · 3 UYARI gerekçeli · TESLİM.

| # | Yasa | Ölçüm | Eşik | Durum | Gerekçe |
|---|---|---|---|---|---|
| 1 | Hick | nav 6 (Biz kimiz, Gündem, Etkinlikler, Yazılar, EUROAVIA, Sponsorluk) · açılış 2 eylem · sponsorluk kartı 2 (E-posta yaz, Adresi kopyala) · alt bilgi 3 · biniş kartı 1 | ≤ 7 · ≤ 5 | geçti | |
| 2 | Fitts | parola → "Giriş yap" 16 px, düğme 50 px yüksek, tam genişlik · "Göster" 44 px · "Adresi kopyala" 44 px · alt bilgi bağlantıları ≥ 44 px | ≥ 44 · ≤ 24 | geçti | |
| 3 | Jakob | logo → başa; Esc biniş kartını/menüyü kapatır; sekmeler ←/→; e-posta düğmesi `mailto:`; kaydırma kaçırılmaz (panorama yalnız katman kayması) | 0 sapma | geçti | |
| 4 | Seçim Yükü | hesap sekmesi 2 (giriş varsayılan) · dil 2 | ≤ 5 / varsayılan | geçti | |
| 5 | Yakınlık | faaliyet kartı başlık→metin 8 / kart↔kart 16 (1:2) · sponsorluk biçimi başlık→metin 4 / biçim↔biçim 24 (1:6) · parola→düğme 16 | ≤ 1:2 | geçti | |
| 6 | Benzerlik | 6 punto (13·16·18·20·40·64 px; e2e tipografi senaryosu) · yarıçap jetonları 6·14·999 (+2 odak, 1 lejant) · 2 gölge · düğme stili 2 (birincil, ikincil; koyu zeminde sarı/koyu karşılıkları aynı iki rol) | ≤ 8 · ≤ 4 · ≤ 2 · ≤ 2 | geçti | |
| 7 | Tekdüze Bağlılık | kart aileleri: faaliyet, kartpostal, dergi, tarihçe şeridi, biniş kartı, sponsorluk kartı; iç içe kart 0 | 0 iç içe | geçti | |
| 8 | Ortak Bölge | tek öğeli kutu 0; görünüm başına bölge ≤ 3 (biz kimiz: künye + faaliyetler + kabin; yazılar: raf + kartpostallar; sponsorluk: biçimler + kart) | ≤ 4 | geçti | |
| 9 | Prägnanz | cam 0 · ışıma 0 · degrade 0 (dogrula sınar) | 0 · 0 · ≤ 3 | geçti | |
| 10 | Von Restorff | birincil 1/görünüm (sponsorluk: "E-posta yaz"; tarihçe: "Üye alım formu"; hesap: "Giriş yap"/"Hesap aç") · doygun ton 2: petrol + sarı (yalnız koyu yüzeyde) | 1 · ≤ 2 | geçti | |
| 11 | Miller | hesap aç 5 alan + onay · biniş kartı 3 alan · künye 6 satır · menü 6 | ≤ 7 | geçti | |
| 12 | Sıra Konumu | nav ilk "Biz kimiz" (görev 1: kulübü anlamak) · son "Sponsorluk" (görev 3) | birincil görevler | geçti | |
| 13 | Doherty | CSS geçişleri ≤ 300 ms; inşa canlandırması 1,9 sn ama sayfa bekletmez (dekor, içerik hemen etkileşimli; hareket azaltmada yok); kopyala → anında bildirim | ≤ 300 ms · gösterge | geçti | |
| 14 | Zeigarnik | hesapta 3 numaralı adım (son adım uçak) · tarihçe omurgası kaydırdıkça dolar · üst şeritte sayfa ilerlemesi | ≥ 3 adımda gösterge | geçti | |
| 15 | Zirve-Son | başarı: kulüp kartı "Doğrulandı", "kopyalandı" bildirimi; boş: kesikli kart "Şu an kayda açık etkinlik yok"; hata: alan altı ileti, kopyalanamazsa adres metinle | 3/3 | geçti | |
| 16 | Parkinson | hesap formu zorunlu 6/6 | ≤ %50 | UYARI | Kullanıcı (v2): "okul maili ve okul numarası girmek zorunlu olsun bence"; ad, soyad, parola, onay hesap için gerekli |
| 17 | Tesler | sponsorluk e-postasının konu satırı ve gövde şablonu hazır gelir (dile göre); biniş kartı tarihi dile göre kendisi seçilir; parola görünürlüğü gönderimde kendiliğinden gizlenir | her girdiye gerekçe | geçti | |
| 18 | Postel | değişmedi (sunucu-sina 61/61: e-posta küçültme, okul no boşluk atma) | normalizasyon | geçti | |
| 19 | Occam | sayfa 2170 öğe, bunun 1249'u SVG çizim (panorama + pullar); SVG hariç 921 · biz kimiz SVG hariç 190 | ≤ 900 · ≤ 150 | UYARI | Panorama kullanıcının istediği "blok blok inşa edilmiş" ayrıntılı İstanbul çizimi (aria-hidden, dekor); Biz kimiz "çok detaylı olması gerekiyor" isteğiyle 8 faaliyet + künye + kabin + tarihçe |
| 20 | Pareto | ilk ekran (1440×900): başlık + açıklama + 2 eylem + olgular + İstanbul panoraması = %100'ü "kulübü anlamak / gündeme git / üye ol" görevlerine | ≥ %60 | geçti | |

Riskler: yoğunluk eşiği SVG düğümlerini de sayar; panorama çizimi sayfaya 57,8 kB ham (gzip 10,2 kB), pullar 12,8 kB (gzip 2,0 kB) ekler (sahne/istanbul.mjs çıktısı ölçüldü). Gerçek telefonda inşa canlandırmasının akıcılığı ölçülmedi (yalnız başsız Chrome; zaman çizelgesi elle ilerletilerek kademe doğrulandı).

---

# YASA DENETİMİ — UUMK v3 index.html · 2026-10-11 ~06:00 · denetleyici: index "0 HATA · 1 UYARI" (parkinson), yonetim/kvkk 0 · 0

09:57 tam denetim (`.cekim-gecici/uumk/son-v3/son-1000/`): aynı sonuç — index 0 HATA · 1 UYARI, kvkk/yonetim/404 0/0; axe 0 (7 görünüm); dogrula 855 · sina 61 · e2e 25.
09:20 tam denetim (`.cekim-gecici/uumk/son-v3/son-0920/`): denetleyici index 0 HATA · 1 UYARI (parkinson, 786 öğe), kvkk 0/0, yonetim 0/0, 404 0/0; axe 0 ihlal (1440, 390, 1024, EN, kvkk, yönetim, 404); dogrula 855 · sina 61 · e2e 25.
08:00 ek: telefon menüsünde Instagram/e-posta ikincil biçimde (16 px gövde yazısı, hedef 44 px; önce ana menüyle aynı 28 px serif — Von Restorff); yazılar ızgarası boşluksuz 4×3 (Prägnanz); hesap paneli yapışkan (Yakınlık: form kartın yanında kalır).
07:15 güncellemesi: EUROAVIA bölümü koyu (gece haritası) — denetleyici yeniden koşuldu: index 0 HATA · 1 UYARI (parkinson), axe 0 ihlal (1440, 390, EN).

Ölçüm: `araclar/ux-olc.js` (canlı DOM, 1440×900 ve 390×844, ?p=0.05) + denetleyici `--tablo`. Sonuç: 20/20 ölçüldü · 0 HATA · 2 UYARI gerekçeli · TESLİM.

| # | Yasa | Ölçüm | Eşik | Durum | Gerekçe |
|---|---|---|---|---|---|
| 1 | Hick | nav 5 · açılış 2 eylem (Gündem, Üye ol) · etkinlik kartı 1 · gündemde ilk 4 kart, kalanı tek düğme · EUROAVIA takvimi 19 yerine 5 tam satır + "Tüm takvim" | ≤ 7 · ≤ 5 | geçti | |
| 2 | Fitts | en küçük hedef 44 px (EN 44×44, menü 119×44) · alan → gönder 16 px | ≥ 44 · ≤ 24 | geçti | |
| 3 | Jakob | logo → başa; Esc kart/okuyucu/menü kapatır; sekmeler ←/→; takvim ok/Enter; kaydırma kaçırılmaz (yapışkan sahne yerel kaydırma) | 0 sapma | geçti | |
| 4 | Seçim Yükü | dil 2 · hesap sekmesi 2 (giriş varsayılan) · harita İstanbul seçili | ≤ 5 / varsayılan | geçti | |
| 5 | Yakınlık | ekip başlık→metin 4 / ekip↔ekip 16 (1:4) · h2→giriş 16 / giriş→içerik 40 (1:2,5) · yazı kartı iç 8 / kart↔kart 16 (1:2) · etiket→alan 4 / alan→alan 16 | ≤ 1:2 | geçti | |
| 6 | Benzerlik | 6 punto (13·16·18·20·40·64 px; telefonda 28·36) · 4 yarıçap (2·6·14·999) · 1 gölge · 2 düğme stili | ≤ 8 · ≤ 4 · ≤ 2 · ≤ 2 | geçti | |
| 7 | Tekdüze Bağlılık | kartlar: etkinlik, yazı, ekip, harita, seçim paneli, hesap paneli, kulüp kartı; iç içe kart 0 | 0 iç içe | geçti | |
| 8 | Ortak Bölge | tek öğeli kutu 0; görünüm başına bölge ≤ 2 (gündem: etkinlikler + duyurular; EUROAVIA: harita + takvim) | ≤ 4 | geçti | |
| 9 | Prägnanz | cam 0 · ışıma 0 · degrade 0 (dogrula sınar) | 0 · 0 · ≤ 3 | geçti | |
| 10 | Von Restorff | birincil 1/görünüm · doygun ton 2: petrol (eylem, etkin) + sarı (yalnız koyu yüzeyde: pano yazısı; 07:15'ten beri EUROAVIA gece haritasında yalnız İstanbul, seçili rota/satır, "sıradaki" ve km sayacı = etkin durum) | 1 · ≤ 2 | geçti | |
| 11 | Miller | hesap formu 5 alan + onay · pano 4 sütun · menü 5 | ≤ 7 | geçti | |
| 12 | Sıra Konumu | nav ilk "Gündem" (birincil görev: kayıt) · son "EUROAVIA"; hesap düğmesi sağda ayrı | birincil görevler | geçti | |
| 13 | Doherty | CSS geçişleri ≤ 300 ms (önce 1400/600/500 → hepsi 300); harita rotası seçimle anında başlar (1,2 sn çizim = ilerleme göstergesi) | ≤ 300 ms | geçti | |
| 14 | Zeigarnik | açılışta 3 durak (UUMK · AS IST · İTÜ) · üst şeritte sayfa ilerlemesi · tarihçe rotası · hesapta 3 numaralı adım | ≥ 3 adımda gösterge | geçti | |
| 15 | Zirve-Son | başarı: duyuru + kulüp kartı "Doğrulandı"; boş: kesikli kart + uçak ikonu "Şu an kayda açık etkinlik yok"; hata: alan altı ileti + odak; sunucu yok notu | 3/3 | geçti | |
| 16 | Parkinson | hesap formu zorunlu 6/6 · misafir 5/5 | ≤ %50 | UYARI | Kullanıcı: "okul maili ve okul numarası girmek zorunlu olsun bence"; ad, soyad, parola ve onay hesap için gerekli |
| 17 | Tesler | okul e-postası (kimlik, İTÜ denetimi), okul no (yinelenen kayıt), ad-soyad (katılımcı listesi); hesaplıda hiçbiri yeniden sorulmaz; kulüp kartı forma yazdıkça dolar | her girdiye gerekçe | geçti | |
| 18 | Postel | e-posta büyük harf/boşluk kabul edilip küçültülür, okul no boşlukları atılır (sunucu-sina 60/60) | normalizasyon | geçti | |
| 19 | Occam | sayfa 786 öğe · görünüm max 116 (09:38 denetleyici --tablo) · görünüm max 109; silinen: v2 adım başlıkları, kaynak satırları, ipucu, "Fotoğraf: …", alt bilgi "son kontrol" notu | ≤ 900 · ≤ 150 | geçti | |
| 20 | Pareto | ilk ekran birincil (ad + açıklama + eylem + olgular) 1440: %13,8 + uçak %2,3 · 390: %35,2 + %4,1 | ≥ %60 | UYARI | Açılış bilinçli olarak havadar (uçak ve silüet için alan); birincil eylem "Gündem" ilk ekranda, 2 eylem |

---

# YASA DENETİMİ — UUMK v2 index.html (+ yonetim.html, kvkk.html) · 2026-10-11 (son güncelleme aşağıda) · denetleyici koşuldu: index "0 HATA · 1 UYARI", yönetim ve kvkk "0 HATA · 0 UYARI"

Sonuç: 20/20 yasa ölçüldü · 0 HATA · 3 UYARI (3 gerekçeli) · karar: TESLİM

Ölçüm kaynakları: `ux-yasa-denetimi.mjs` · canlı DOM `araclar/ux-olc.js` (1440×900, 1024×768, 1920×1080, 390×844; 2B çiziciyle,
`.cekim-gecici/uumk/ux-olc-v2.txt` ve `ux-olc-v2-son.txt`) · API süreleri (`.cekim-gecici/uumk/son-v2/doherty.txt`) · uçtan uca 12/12, axe 0 ihlal.
Denetleyici harici CSS'i okumadığı için punto/yarıçap/gölge canlı DOM'dan ölçüldü. v1 tablosu `kaynak/v1/` sürümüne aitti.

| # | Yasa | Ölçüm (sayı/gözlem) | Eşik | Durum | Gerekçe (yalnız UYARI) |
|---|---|---|---|---|---|
| 1 | Hick | nav 5 · açılış görünümü 1 eylem (Gündeme git) · etkinlik kartı 1 (Kaydol) · hesap paneli 1 birincil + 1 bağlantı · pano 10 aynı tür satır | ≤ 7 · ≤ 5 | UYARI | Pano satırları tek bir seçimin seçenekleri (tablo): her satır aynı eylemi (biniş kartını aç) yapar |
| 2 | Fitts | en küçük hedef yüksekliği 44 px (cümle içi "arşiv" bağlantısı 28×44: WCAG cümle içi istisnası); alan → gönder düğmesi 16 px | ≥ 44 px · ≤ 24 px | geçti | |
| 3 | Jakob | logo → başa; Esc kart/okuyucu kapatır, odak döner (sınandı); sekmeler ←/→; liste ok/Enter; "Parolanı mı unuttun?" formun altında | 0 sapma | geçti | |
| 4 | Seçim Yükü | dil 2 (tek düğme), hesap sekmesi 2 (giriş varsayılan), takvimde İstanbul seçili | ≤ 5 ya da varsayılan | geçti | |
| 5 | Yakınlık | ekip başlık→metin 4 / ekip↔ekip 24 (1:6) · h2→giriş 16 / giriş→içerik 40 (1:2,5) · etiket→alan 4 / alan→alan 16 (1:4) | ≤ 1:2 | geçti | |
| 6 | Benzerlik | 6 punto (13·16·18·20·40·60 px) · 3 yarıçap (2·6·14) · 1 gölge · 2 düğme stili | ≤ 8 · ≤ 4 · ≤ 2 · ≤ 2 | geçti | |
| 7 | Tekdüze Bağlılık | kutular: etkinlik kartı, hesap paneli, biniş kartı; iç içe kutu 0 | ≤ 12 · 0 | geçti | |
| 8 | Ortak Bölge | tek öğeli kutu 0; görünüm başına bölge ≤ 2 (gündem: etkinlikler + duyurular) | 0 · ≤ 4 | geçti | |
| 9 | Prägnanz | cam 0 · ışıma 0 · CSS degrade 1 (hesap panelinin katlanmış köşesi) | 0 · 0 · ≤ 3 | geçti | |
| 10 | Von Restorff | birincil 1/görünüm · doygun ton 1 (petrol #056a79; lacivert yalnız yüzey) | 1 · ≤ 2 | geçti | |
| 11 | Miller | hesap formu 5 alan + onay · misafir formu 4 alan + onay · yönetim formu 3–4 alanlık gruplar · pano 4 sütun | ≤ 7 · ≤ 7 | geçti | |
| 12 | Sıra Konumu | nav ilk "Gündem" (birincil görev: etkinliğe kaydol) · son "EUROAVIA"; hesap düğmesi sağda ayrı | birincil görevler | geçti | |
| 13 | Doherty | en uzun geçiş 300 ms (iz çizgisi) · etkinlik listesi 2–6 ms (ilk çağrı 165) · kayıt 7–40 ms · giriş 152–171 ms (scrypt) · gönderirken düğme kilitli + aria-busy | ≤ 300 · < 400 ms | geçti | |
| 14 | Zeigarnik | açılışta 5 parçalı ilerleme çizgisi; hesap 3 numaralı adım; profilde "doğrulama bekliyor" açık iş | ≥ 3 adımda gösterge | geçti | |
| 15 | Zirve-Son | başarı: "Kaydın alındı… onay e-postası"; boş: "Şu an kayda açık etkinlik yok"; hata: alan altı iletiler + odak ilk hatalı alana (sınandı); sunucu yoksa açıklayıcı not | 3/3 | geçti | |
| 16 | Parkinson | hesap formu zorunlu 6/6 = %100 · misafir 5/5 | ≤ %50 | UYARI | Kullanıcı isteği: "okul maili ve okul numarası girmek zorunlu olsun bence"; ad, soyad, parola ve aydınlatma onayı hesabın kendisi için gerekli |
| 17 | Tesler | okul e-postası (kimlik, İTÜ öğrencisi denetimi), okul no (yinelenen kayıt denetimi), ad-soyad (katılımcı listesi): sistem bilemez; hesaplı kayıtta hiçbiri yeniden sorulmaz | her girdiye gerekçe | geçti | |
| 18 | Postel | e-posta büyük harf/boşluk kabul edilip küçültülür; okul no boşlukları atılır (sunucu-sina sınar) | 0 · normalizasyon | geçti | |
| 19 | Occam | sayfa 623 öğe · görünüm max ~110 · eşlenemeyen öğe 0 | ≤ 900 · ≤ 150 · 0 | geçti | |
| 20 | Pareto | ilk ekran (etkin başlık + kâğıt + üst şerit): 1440 %42,7 · 1024 %55,8 · 1920 %34,6 · 390 %62,5 | ≥ %60 | UYARI | Açılış kaydırmalı hikâye sahnesi; A4 kâğıt dar bir dikdörtgen ve katlandıkça yer değiştirir, çevresindeki boşluk bilinçli. Birincil eylem "Gündeme git" ilk ekranda |

Riskler: Pareto ve hedef ölçümleri 2B çiziciyle yapıldı (three ile kâğıt boyutu aynı; ikisi de `kagit-ortak.kameraAyari`). Dokunmatik cihazda elle denenmedi.

## Güncelleme — 11 Ekim 2026, metin düzeltmesi + bölüm bağlantısı + yönetim başlığı

Denetleyici yeniden koşuldu (`.cekim-gecici/uumk/son-v2e/ux-*.txt`): index "0 HATA · 1 UYARI (parkinson-required)", yonetim "0 HATA · 0 UYARI", kvkk "0 HATA · 0 UYARI". 20 satırın 17'si değişmedi; değişen üçü:

| # | Yasa | Önce | Şimdi | Durum |
|---|---|---|---|---|
| 3 | Jakob | `/#ag` bağlantısı sayfa yüklenirken `scroll-behavior: smooth` yüzünden 8000 px'i canlandırıyordu; arka plan sekmesinde hiç inmiyordu (ölçüm: scrollY 0, #ag üstü 8496 px) | yumuşak kaydırma `load` sonrası açılıyor (`html.yumusak`); açılışta doğrudan atlar (ölçüm: 600 ms içinde scrollY 9096, #ag üstü 84 px = scroll-padding); uctan-uca "bölüm bağlantısı" senaryosu | geçti |
| 12 | Sıra Konumu | hikâye adım etiketleri katlama adımını söylüyordu ("1 · Köşeler"…) | kartın konusunu söylüyor: Kuruluş · Ekipler · EUROAVIA · Gündem | geçti |
| 19 | Occam | gövdede tekrarlar: "tam üye" 3×, misafir uyarısı 3×, meta cümleler ("Yeni yazılar yönetim sayfasından eklenir.") | birer kez; meta cümleler silindi (bağımsız editör incelemesi: TR 27 + EN 28 öneri, 1'i gerekçeyle uygulanmadı) | geçti |

Ek: yonetim.html'de girişsiz görünümde h1 yoktu (axe page-has-heading-one); üst şeritteki "Yönetim" h1 oldu, bölüm başlıkları h2. axe şimdi 0.

## Güncelleme — 11 Ekim 2026, palet B (Petrol blok) + ipucu kaldırıldı

Kullanıcı kararı: renk değişsin → üç seçenek gerçek sitede çekildi (`notlar/palet-secenekleri/`), "B · Petrol blok" seçildi; ipucu "Kaldırılsın".
Denetleyici (`.cekim-gecici/uumk/son-v2f/ux-*.txt`): index 0 HATA · 1 UYARI (parkinson-required), yonetim 0 · 0, kvkk 0 · 0. 17 satır değişmedi; değişenler:

| # | Yasa | Ölçüm | Durum |
|---|---|---|---|
| 6 | Benzerlik | 6 punto · 3 yarıçap · 1 gölge · 2 düğme stili (açılıştaki birincil düğme beyaz zemin + #03525e: aynı stil, ters renk) | geçti |
| 10 | Von Restorff | görünüm başına 1 birincil; petrol açılışta yüzey, öbür görünümlerde yalnız birincil eylem ve etkin durum; doygun ton 1 (petrol), lacivert yalnız yüzey | geçti |
| 9 | Prägnanz | cam 0 · ışıma 0 · degrade 1 (katlanmış köşe) | geçti |
| — | Kontrast | en düşük oran 4,64:1 (açılış adım etiketi #bfe6eb / #056b7a); gövde 5,15; düğme 8,85; gece soluk 6,57 | geçti |
| — | Telefon | açılış başlığı şeride yapışıktı (h1 üstü 68 px = şerit altı) → 108 px (`.hikaye__adimlar { margin-top }`) | düzeltildi |

## Güncelleme — 11 Ekim 2026, palet E (Hangar) + ikinci editör okuması

Kullanıcı B'yi de beğenmedi ("Renk yine değişsin"); dört yeni yön (D–G) gerçek sitede çekildi, "E · Hangar" seçildi. Kuruluş metni kullanıcı onayıyla 2001 kaldı.
Denetleyici (`.cekim-gecici/uumk/son-v2g/ux-*.txt`): index 0 HATA · 1 UYARI (parkinson-required), yonetim 0 · 0, kvkk 0 · 0.

| # | Yasa | Ölçüm | Durum |
|---|---|---|---|
| 10 | Von Restorff | görünüm başına 1 birincil (petrol #056b7a); doygun tonlar 2: petrol (eylem) + sarı #f2c200 (yalnız siyah panoda yazı) | geçti |
| 6 | Benzerlik | 6 punto · 3 yarıçap · 1 gölge · 2 düğme stili; açılış düğmesi yine standart birincil | geçti |
| 19 | Occam | ikinci editör: 3 ihlal (açılış 4. adımda yönlendirme cümlesi, misafir formunda "tek tıkla" tekrarı, "basman yeterli") → düzeltildi | geçti |
| — | Kontrast | soluk 6,9:1 · petrol/zemin 5,19 · beyaz/petrol 6,19 · sarı/siyah 10,35 · alan kenarı 3,56 (yüzey) / 3,17 (zemin) | geçti |
