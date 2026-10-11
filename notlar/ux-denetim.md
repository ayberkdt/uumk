# YASA DENETİMİ — UUMK v13 (kimlik yayı, ok yerine uçak, kapı çizimi, kabin kartı ve hareketi, telefonda kapı) · 2026-10-11 gece · denetleyici index 0 HATA · 7 UYARI (v12 ile aynı)

Sonuç: 20/20 ölçüldü · 0 HATA · 7 UYARI (hepsi v12'den; gerekçeler değişmedi) · TESLİM

| # | Yasa | Ölçüm | Eşik | Durum | Gerekçe (yalnız UYARI) |
|---|---|---|---|---|---|
| 1 | Hick | kabin bölümü 9 eylem (6 numara + önceki/sonraki/durdur; başvuru bağlantı); sayı değişmedi, gezinti kartın üst satırına taşındı | ≤ 5 | UYARI | 6 numara tek seçim kümesi; gezinti üçlüsü karusel denetimi (v12 gerekçesi) |
| 2 | Fitts | önceki/sonraki/durdur 44×44, başvuru 44 px yükseklik; kart ≥ 1280 px'te sahnenin sol altında, numaralardan uzak | ≥ 44 px | geçti | |
| 3 | Jakob | dış bağlantı imi ↗ yerine −40° uçak (aynı yön, aynı yer: metnin sonu); önceki/sonraki uçakları sola/sağa; "Başa dön" uçağı yukarı | tanıdık desen | geçti | |
| 4 | Seçim Yükü | kabin 6 ekip, varsayılan 1 seçili (değişmedi) | ≤ 5 ya da varsayılan | geçti | |
| 5 | Yakınlık | kabin kartı: üst satır–ekip 12 px, ekip–düğme 12 px, dolgu 16/24 px; kimlik: yay logolara iner (−4 px), logo–ad 8 px | ≤ 1:2 | geçti | |
| 6 | Benzerlik | uçak imi her yerde tek siluet (--ucak); yeni punto, renk, gölge yok; kart gölgesi g-1 | — | geçti | |
| 7 | Tekdüze Bağlılık | sıra numarası, süre çubuğu ve gezinti tek satırda; kimlik yayı iki logoyu bağlar | — | geçti | |
| 8 | Ortak Bölge | kabin kartı sahnenin üstünde tek kutu (iç içe kart yok); boş gündem kartı tek kutu | 0 | geçti | |
| 9 | Prägnanz | degrade 0, cam 0, ışıma 0; kart düz yüzey (backdrop-filter yok) | 0 | geçti | |
| 10 | Von Restorff | kabin görünümünde tek birincil: "Bu ekibe başvur" | 1 | geçti | |
| 11 | Miller | değişmedi | ≤ 7 | geçti | |
| 12 | Sıra Konumu | değişmedi | — | geçti | |
| 13 | Doherty | süre çubuğu 7 sn (zamanlayıcı; ucunda uçak ilerler); kimlik uçuşu 2,6 sn (süs, eylemi beklemez); seçim aynı karede | < 400 ms geri bildirim | UYARI (denetleyici: 7000 ms animasyon) | Zamanlayıcıdır, geri bildirim değil; üstüne gelince durur (v12) |
| 14 | Zeigarnik | tur "n / 6" ve süre çubuğu | — | geçti | |
| 15 | Zirve-Son | boş gündem çizimi telefonda kart genişliğinde (390 px'te 4:3) | 3/3 | geçti | |
| 16 | Parkinson | değişmedi | ≤ %50 | UYARI | Kullanıcı isteği (v12) |
| 17 | Tesler | GPU'suz tarayıcıda sistem kendiliğinden yavaş kipe geçer (1x piksel, ~15 kare/sn); WebGL yoksa poster; kartın yeri genişliğe göre (≥ 1280 px sahnede, altında sahnenin altında) | — | geçti | |
| 18 | Postel | değişmedi | 0 | geçti | |
| 19 | Occam | kabin notu tek satıra kısaldı; ↗ karakterleri CSS imine geçti; yeni bölüm yok | ≤ 900 | UYARI (sayfa öğe sayısı) | Tek sayfalık site; bölümler tembel (v12) |
| 20 | Pareto | ilk ekran değişmedi | ≥ %60 | UYARI (v9 gerekçesi) | |

Risk: GPU'suz yavaş kip yalnız başsız Chrome'un SwiftShader'ında ölçüldü (13,5 ms/kare); kullanıcının tarayıcısının neden yazılımsal çiziciye düştüğü doğrulanmadı.

# YASA DENETİMİ — UUMK v12 (Biz kimiz, Ne yapıyoruz, kabin turu, gündem, sponsorluk, kulüp kartı, hover) · 2026-10-11 akşam · denetleyici index 0 HATA · 7 UYARI · axe 0 (390 TR, 360 EN, 1440 TR, 1440 API'siz)

Sonuç: 20/20 ölçüldü · 0 HATA · 7 UYARI (5'i v11'den: kapak ve tarihçe öğe yoğunluğu, sayfa öğe sayısı, ayrıntı penceresi 6 eylem, hesap formu zorunlu alanlar; yeni 2: kabin 9 eylem, tur süre çubuğu 7 sn) · ara ölçümde 10 UYARI vardı: yarıçap 6 → jetonlara, gölge 6 → 2, kart geçişi 360 → 280 ms ile 3'ü kapandı · karar: TESLİM.

| # | Yasa | Ölçüm | Eşik | Durum | Gerekçe (yalnız UYARI) |
|---|---|---|---|---|---|
| 1 | Hick | nav 7 · kabin bölümü 9 eylem (6 numara + önceki/sonraki/durdur; başvuru bağlantı) · Biz kimiz 1 · gündem boş kart 1 | ≤ 7 · ≤ 5 | UYARI | 6 numara tek bir seçim kümesi (uçağın üstünde uzaya dağılmış sekme gibi), varsayılan seçili ve tur kendiliğinden gezer; kullanıcı seçmek zorunda değil |
| 2 | Fitts | numara düğmesi 44×44 (görsel 28 px), önceki/sonraki/durdur 44×44 (e2e: masaüstü ve 390 px'te min 44) · mobil-denetim 320–1440 px'te < 44 px hedef 0 | ≥ 44 px | geçti | |
| 3 | Jakob | karusel deseni: önceki/sonraki, süre çubuğu, ⏸/▶, üstüne gelince durur · "Tarihçemizi keşfet" gerçek #tarihce bağlantısı (JS'siz de atlar) · kaydırma kaçırılmaz | 0 sapma | geçti | |
| 4 | Seçim Yükü | kabin 6 ekip, varsayılan 1 (Yönetim kurulu) seçili | ≤ 5 ya da varsayılan | geçti | |
| 5 | Yakınlık | Ne yapıyoruz kutu arası 16 px, kutu dolgusu 24 px (1:1,5) · kabin kartı içi 16 px, sahne–kart 16 px · kimlik paneli logo–ad 8 px, panel dolgusu 24 px | ≤ 1:2 | geçti | |
| 6 | Benzerlik | punto ölçek dışı 0 · yarıçap 3 (r-1/r-2/r-3 jetonları; askılı kart 18 px → r-2) · gölge 2 (g-1 ve kart gölgesi; hover'lar g-1) · kutular (iş, biçim, etkinlik, kimlik) aynı çerçeve/zemin/yarıçap | ≤ 8 · ≤ 4 · ≤ 2 | geçti | |
| 7 | Tekdüze Bağlılık | seçili numara sarı + seçili bölme zemini sarı + kartta "n / 6" · kimlik panelinde iki logo kesik yayla bağlı | — | geçti | |
| 8 | Ortak Bölge | tek öğeli kutu 0 · iç içe kart 0 (kabin kartı sahnenin dışında) · künye kutusu kalktı | 0 | geçti | |
| 9 | Prägnanz | degrade 0 · cam 0 · ışıma 0 · parıltı şeridi düz yarı saydam (degrade değil) · uçak gri apron dikdörtgeni olmadan kâğıda oturur | 0 | geçti | |
| 10 | Von Restorff | görünüm başına 1 birincil: Biz kimiz "Tarihçemizi keşfet", kabin "Bu ekibe başvur", tarihçe "Üye alım formu" (kabin ve tarihçe ayrı section) | 1 | geçti | |
| 11 | Miller | form değişmedi (max 6 alan) · Ne yapıyoruz 5 kutu | ≤ 7 | geçti | |
| 12 | Sıra Konumu | nav değişmedi (ilk Biz kimiz, son Sponsorluk) · kutular: ilk Teknik geziler (en sık sorulan), son Kulüp hayatı · kabin burundan kuyruğa | birincil görevler | geçti | |
| 13 | Doherty | numara/ok → kart aynı karede · kart geçişi 280 ms · tur süre çubuğu 7 sn (zamanlayıcı, geri bildirim değil) · düğme uçağı 560 ms, tarihçeye varış ≈ 1 sn (kaydırma) | ≤ 300 · < 400 ms yanıt | UYARI | 7 sn'lik animasyon turun bekleme süresini gösteren çubuk; kullanıcı eylemine yanıt değil, ⏸ ile durur |
| 14 | Zeigarnik | çok adımlı akış yok; tur "n / 6" ve süre çubuğuyla nerede olduğunu gösterir | — | geçti | |
| 15 | Zirve-Son | boş gündem tasarlandı (kapalı kapı çizimi + ne yapılacağı + Instagram) · kabin turu sonda başa döner · kart doluyken baş harf ve barkod | 3/3 | geçti | |
| 16 | Parkinson | hesap formu 6/6 zorunlu (değişmedi) | ≤ %50 | UYARI | Kullanıcı isteği (okul e-postası ve numarası zorunlu) |
| 17 | Tesler | tur kendiliğinden başlar/durur (görünürlük, üstüne gelme, seçim); hareket azaltmada kapalı · GPU yoksa poster ve aynı düğmeler · telefon sürümü medya sorgusuyla | — | geçti | |
| 18 | Postel | değişmedi | 0 | geçti | |
| 19 | Occam | künye (6 satır) ve Güz/Bahar akışı (7 durak), meydan bandı, sponsorlukta foto şeridi + kurum açıklamaları + teklif künyesi kalktı · sayfa 3099 öğe | ≤ 900 | UYARI | Öğe sayısının çoğu kapak panoramasının SVG parçaları (1843); v11'den beri aynı gerekçe |
| 20 | Pareto | ilk ekran değişmedi | ≥ %60 | UYARI (v9 gerekçesi) | |

Risk: tur ve hover gerçek telefonda denenmedi (masaüstü Chrome'un telefon öykünmesi); parıltı şeridi yalnız fareyle görünür.

# YASA DENETİMİ — UUMK v11 (mobil + kapak uçağı) · 2026-10-11 gece · denetleyici index 0 HATA · 6 UYARI (v10 ile aynı) · axe 0 (390 TR, 360 EN, 1440 TR)

Sonuç: 20/20 ölçüldü · 0 HATA · UYARIlar v10'daki gerekçelerle aynı (Hick kulüp 9, Parkinson, Occam, Pareto) · karar: TESLİM. Değişen satırlar (yalnız ≤ 760 px):

| # | Yasa | Ölçüm | Eşik | Durum |
|---|---|---|---|---|
| 2 | Fitts | mobil-denetim.js: 320/360/390/414/740/820 px'te < 44 px hedef 0 (paragraf içi bağlantılar hariç) | ≥ 44 px | geçti |
| 3 | Jakob | şeritler yatay kaydırma + kaydırma yakalama (tanıdık karusel deseni), sonraki kartın kenarı görünür; dikey kaydırma kaçırılmaz (overscroll-behavior-x) | 0 sapma | geçti |
| 5 | Yakınlık | şerit kartları arası 16 px, kart dolgusu 16–24 px; künye satır arası 8 px, bölüm arası 64 px | ≤ 1:2 | geçti |
| 13 | Doherty | kapak uçağı: tek adımda yön değişimi ≤ 3,3°, hız değişimi ≤ %2,4; 3B sahneler telefonda 30 kare/sn (tek kare normal hızda 4,1 ms) | < 400 ms | geçti |
| 17 | Tesler | telefon sürümü otomatik (medya sorgusu), kullanıcıya seçenek sorulmaz; odaklanılabilir içeriği olmayan şerit yalnız kayarken odak alır | — | geçti |
| 19 | Occam | telefonda sayfa 24.318 → 16.099 px (uzun listeler şeritte) | — | geçti (sayfa öğe sayısı UYARIsı değişmedi) |
| 20 | Pareto | ilk ekran değişmedi | ≥ %60 | UYARI (v9 gerekçesi) |

Risk: telefon ölçümleri masaüstü Chrome'da işlemci 4× yavaşlatılarak; gerçek cihazda ölçülmedi.

# YASA DENETİMİ — UUMK v10 · 2026-10-11 akşam · denetleyici index 0 HATA · 6 UYARI · axe 0 ihlal (1440 TR, 390 EN)

Sonuç: 20/20 ölçüldü · 0 HATA · denetleyicinin 6 UYARIsı 3 satırda (Hick, Parkinson, Occam) + Pareto göz testi UYARI, hepsi gerekçeli · karar: TESLİM. Değişen görünümler: kabin maketi + kart, gündem meydanı, kıyı, "Ne yapıyoruz", EUROAVIA seçim kartı ve takvim.

| # | Yasa | Ölçüm | Eşik | Durum | Gerekçe (yalnız UYARI) |
|---|---|---|---|---|---|
| 1 | Hick | nav 7 · kulüp bölümü 9 eylem (6 bölme düğmesi + kartta önceki/sonraki/kapat) · kart açıkken kartta 3 | ≤ 7 · ≤ 5 | UYARI | 6 bölme düğmesi tek bir seçim kümesi (sekme gibi), maketin üstünde uzaya dağılır; kartın 3 düğmesi yalnız kart açıkken görünür. Eski yan liste satırları düğme değildi (yalnız fareyle vurgulanıyordu); bölme seçimi artık klavyeyle de yapılır, bu yüzden sayı arttı |
| 2 | Fitts | bölme düğmesi 44 px yükseklik (e2e: masaüstü ve 390 px'te min 44) · kapat 44×44 · önceki/sonraki ≥ 44 | ≥ 44 px | geçti | |
| 3 | Jakob | Esc kartı kapatır ve odağı düğmeye verir (e2e) · düğmeye ikinci basış kapatır · kaydırma kaçırılmaz | 0 sapma | geçti | |
| 4 | Seçim Yükü | kabin: varsayılan seçimsiz, 6 bölme uzaysal | ≤ 5 ya da varsayılan | geçti | |
| 5 | Yakınlık | iş satırı: çizim–metin 24 px, metin içi 6 px (1:4) · dönem durakları arası 16 px, güz–bahar arası 64 px (1:4) · kart başlık–metin 8 px, kart dolgusu 24 px | ≤ 1:2 | geçti | |
| 6 | Benzerlik | 1 punto ailesi · 3 yarıçap · 2 gölge (düğme gölgesi kaldırıldı: önce 3 → şimdi 2) | ≤ 8 · ≤ 4 · ≤ 2 | geçti | |
| 7 | Tekdüze Bağlılık | bölme düğmesi ile bölme arasında çizgi; seçili bölmenin zemini sarı | — | geçti | |
| 8 | Ortak Bölge | 8 faaliyet kutusu kalktı (tek öğeli kutu yok), iş çizimleri tek çerçeve | 0 | geçti | |
| 9 | Prägnanz | degrade 0 (kenar yumuşatma CSS maskesiyle değil sahne dokusunda) · cam 0 · ışıma 0 | 0 | geçti | |
| 10 | Von Restorff | kabinde tek vurgu: seçili düğme (sarı numara) + seçili bölme | 1 | geçti | |
| 11 | Miller | form değişmedi (max 6 alan) | ≤ 7 | geçti | |
| 12 | Sıra Konumu | nav ilk "Biz kimiz", son "Sponsorluk" (değişmedi) · kabin 1 kokpit … 6 Tasarım (burundan kuyruğa) | birincil görevler | geçti | |
| 13 | Doherty | düğme → kart anında (aynı kare) · kamera yaklaşması üstel, %90'ı ≈ 420 ms (hareket azaltmada anında) | < 400 ms yanıt | geçti | |
| 14 | Zeigarnik | çok adımlı akış yok | — | geçti | |
| 15 | Zirve-Son | boş gündem: sade metin kartı + Instagram (çizim bölüm başındaki meydanda, tekrar yok) · kart kapat | 3/3 | geçti | |
| 16 | Parkinson | hesap formu 6/6 zorunlu | ≤ %50 | UYARI | Kullanıcı isteği (okul e-postası ve numarası zorunlu); değişmedi |
| 17 | Tesler | maket kendiliğinden canlı, kontrol istemez · telefonda adlar karta taşınır · GPU yoksa poster ve aynı düğmeler | — | geçti | |
| 18 | Postel | değişmedi | 0 | geçti | |
| 19 | Occam | sayfa 3132 öğe · açılış 1843 (panorama çizimi) · kulüp 320 | ≤ 900 · ≤ 150 | UYARI | Öğeler SVG panorama ve kıyı çiziminin parçaları; kulüp bölümünde tarihçe şeritleri. "Ne yapıyoruz" 8 kart + 7 yıl maddesinden 4 iş + 7 durağa indi |
| 20 | Pareto | ilk ekran değişmedi | ≥ %60 | UYARI | v9'daki gerekçe: açılış bilinçli olarak havadar |

UYARI listesi (denetleyici): occam-density ×3 (açılış, kulüp, sayfa), hick-actions-per-view ×2 (kulüp 9, tarihçe ayrıntı penceresi 6 — v9'dan), parkinson-required ×1.
Risk: kamera yaklaşmasının süresi koddan hesaplandı (1 − e^(−5,5·t)); tarayıcıda kareyle ölçülmedi.

# YASA DENETİMİ — UUMK v9 · 2026-10-11 · denetleyici index 0 HATA · 5 UYARI (değişmedi), yonetim.html 0 · 0. axe 0 ihlal (1440 TR, 390 EN). Değişen satırlar: Zirve-Son — boş gündem 2,5B maket + düz bilgi metni (slogan yok), bildirim gönderilince "yönetim ekibine gönderildi; yanıt okul e-postana gelir" duyurusu · Hick — hesabım ekranında 2 menü satırı (+ yöneticiye 1) ve tek çıkış · Fitts — menü satırları tam genişlik, ≥ 44 px · Tesler — profil düzenle dolu gelir, gönderen bilgisi oturumdan (formda sorulmaz), yanıt adresi otomatik · Parkinson — bildirim formunda 2 alan (konu varsayılan seçili) · Postel — mesaj 2000 karakter, sayaçla; okul no boşluklar atılarak · Jakob — Esc/geri yok, "Hesabıma dön" düğmesi; alt bilgide "Sorun bildir" bağlantısı.

---

# YASA DENETİMİ — UUMK v8 · 2026-10-11 · denetleyici index 0 HATA · 5 UYARI (4 eski gerekçeli + Hick: ayrıntı penceresinde statik 6 eylem — ışık kutusunun 3 düğmesi yalnız fotoğraf açıkken görünür; bir anda görünen en çok 3 eylem + fotoğraf kareleri). axe 0 ihlal (5 görünüm: 1440 TR/EN, 390, ayrıntı + galeri 1440 TR ve 390 EN; tek BELİRSİZ: afişin üstündeki kapat düğmesi — yarı saydam koyu zemin, ölçüldü değil). Değişen satırlar: Hick — açılış tek ekran, kaydırma hikâyesi yok · Fitts — maket listesinde satırın tamamı hedef, footer kartları 2 büyük hedef · Von Restorff — footer'da tek sarı kart (sponsor), sponsorlukta tek birincil eylem (E-posta yaz) · Doherty — maket three.js yalnız GPU'da ve bölüme 700 px kala; poster anında · Tesler — hafif kip ve WebGL kararı otomatik · Zirve-Son — boş gündem tasarlandı (bekleme turu + Instagram) · Prägnanz — kıyı ve maketlerde süs ışıma yok · Benzerlik — tek uçak dili (açılış, maket, harita, boş gündem).

---

# YASA DENETİMİ — UUMK v7 · 2026-10-11 · denetleyici index 0 HATA · 4 UYARI (değişmedi: Occam ×3 çizim yoğunluğu, Parkinson kayıt formu). axe 0 (1440 TR/EN, 390). Değişen satırlar: Prägnanz — kulüp kartında rota çizgisi metne binmiyor (kendi satırı), dekor öğesi metin üstünde 0 · Doherty — açılış tuvali GPU'da kare ortancası 6,9 ms (< 16,7), yavaşta hafif kip otomatik (Tesler) · Benzerlik — haritada tek uçak dili (açılış, kart, harita: uçak silüeti), yeni punto ve gölge yok.

---

# YASA DENETİMİ — UUMK v6 · 2026-10-11 · denetleyici index 0 HATA · 4 UYARI (önce 1 HATA: gece lambalarının `transition: opacity var(--sure) ease 900ms` kısa yazımında 900 ms gecikme süre sanıldı → `transition-delay` ayrı yazıldı, davranış aynı). axe 0 ihlal (7 görünüm: 1440 ve 390 px TR/EN, ayrıntı sayfası açık 1440 TR ve 390 EN, kvkk).

GÖREV BÜTÇESİ — tarihçe ayrıntı sayfası (#ayrinti, yeni görünüm) · yüzey: web · birincil görev: kaydı okumak, sonra komşu kayda geçmek · birincil eylem: yok (okuma görünümü; "Sonraki kayıt" ikincil) · eylem 4 (kapat, önceki, sonraki, kaynak bağlantıları ≤ 3) · seçenek 0 · form 0 · geri bildirim: modül ilk dokunuşta yüklenir, şerite fare gelince önceden çekilir (yerelde < 400 ms) · stil: mevcut jetonlar, yeni punto yok (t-1, t-2/t-6, t-3, t-4), gölge --g-1 · sisteme yüklenen: kayıt seçimi şeritten gelir, dil etkin dilden, adres çubuğu kendiliğinden #tarih-<kimlik>.

| # | Yasa | Ölçüm (v6'da değişen) | Durum |
|---|---|---|---|
| 1 | Hick | nav 6 (değişmedi); ayrıntı sayfası 4 eylem türü | geçti |
| 2 | Fitts | ayrıntı: kapat 44×44, önceki/sonraki 358×52, kaynak bağlantıları 44 px yükseklik (önce 33 → min-height 44); şeridin tamamı hedef 536×191 (köşedeki nokta da bağlantıya düşer) | geçti (ölçüldü, cekim js) |
| 3 | Jakob | Esc kapatır (dialog), dış tık kapatır, ← → kayıtlar arasında, kapanınca odak açan şeride döner, paylaşılabilir #bağlantı | geçti (e2e) |
| 4 | Seçim Yükü | seçenek kümesi yok | geçti |
| 5 | Yakınlık | ayrıntı gövdesi: madde arası 6 px / blok arası 16 px / gövde → kaynaklar 24 px (oran 1:2,7 ve 1:1,5 kademeli) | geçti (ölçüldü) |
| 6 | Benzerlik | 6 punto (e2e tipografi), 2 gölge; ayrıntı başlık bandı şeridin rengini ve sol kenar kalınlığını taşır | geçti |
| 7 | Tekdüze Bağlılık | şerit ve ayrıntı aynı yapı (resim · yıl · kod · başlık) | geçti |
| 8 | Ortak Bölge | ayrıntıda 3 bölge: başlık bandı, gövde, alt (kaynak + gezinti) | geçti |
| 9 | Prägnanz | cam 0, ışıma 0, degrade 0 (fener halesi düz renk halka) | geçti |
| 10 | Von Restorff | üst şeritte tek dolgun düğme "Giriş yap" (petrol); ayrıntıda dolgun düğme yok | geçti |
| 11 | Miller | form değişmedi (6 alan) | geçti |
| 12 | Sıra Konumu | nav ilk "Biz kimiz", son "Sponsorluk" (değişmedi); tarihçe kronolojik, ilk ve son kayıt kuruluşun kökü ve bugünkü yönetim | geçti |
| 13 | Doherty | geçiş süresi `--sure` 560 ms (denetleyici değişkeni çözmediği için "240 ms" okuyor) — eşik 300'ün üstünde, 600 kırmızı çizginin altında; gerekçe: kullanıcının "Animasyonları daha smooth yap" isteği, üstel yavaşlama eğrisiyle algılanan süre kısalır; hareket azaltmada yok | UYARI (gerekçeli) |
| 14 | Zeigarnik | ayrıntıda sıra göstergesi "6 / 15" | geçti |
| 15 | Zirve-Son | değişmedi | geçti |
| 16 | Parkinson | kayıt formu 6/6 zorunlu (değişmedi; hepsi hesap için gerekli) | UYARI (v2'den beri gerekçeli) |
| 17 | Tesler | değişmedi | geçti |
| 18 | Postel | değişmedi | geçti |
| 19 | Occam | sayfa 3043 öğe, açılış 1843 (panorama SVG), kulüp 410 (uçak SVG) — çizim ayrıntısı kullanıcının isteği; ayrıntı metinleri sayfaya değil tembel modüle yazıldı | UYARI (gerekçeli) |
| 20 | Pareto | ilk ekran değişmedi | geçti |

Sonuç: 0 HATA · 4 UYARI (3 Occam/Parkinson eski gerekçeli + Doherty 560 ms, kullanıcı isteği) · TESLİM.
Risk: Doherty satırında denetleyici değişkenli süreleri ölçmüyor; 560 ms değeri `getComputedStyle(documentElement).getPropertyValue('--sure')` ile tarayıcıda okundu.

---

# YASA DENETİMİ — UUMK v5 · 2026-10-11 · denetleyici index 0 HATA · 4 UYARI (önce 7: 600 ms ikon çizimi → 300, ayrı satırdaki 1,1 sn sonsuz animasyon süresi → kısa yazım, 4 gölge değeri → 2: bayrak ve sekme gölgesi çerçeveye döndü). axe 0 (7 görünüm; önce hareketli görünümde 1: geçilmemiş tarihçe şeritleri %25 opaktı → tam opak, yalnız kayar).

Değişen satırlar (kalanlar v4 tablosuyla aynı): Hick — nav 6, numarasız; üst şerit eylemleri 3 (dil, giriş, menü) · Fitts — telefonda menü/giriş/dil ≥ 44 px (e2e üst şerit, 320–414) · Von Restorff — üst şeritte tek dolgun düğme "Giriş yap" · Benzerlik — 2 gölge (--g-1, kartpostal tabanı) · Doherty — geçişler ≤ 300 ms, kabin girişi 900 ms canlandırma (sayfayı bekletmez, hareket azaltmada yok) · Occam UYARI — sayfa 2986 öğe, çoğu SVG (panorama 1704, uçak); gerekçe: kullanıcının istediği daha ayrıntılı çizim ve gerçekçi uçak · Parkinson UYARI — değişmedi (kullanıcı kararı).

---

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
