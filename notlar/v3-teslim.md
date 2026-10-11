# UUMK v3 — teslim notu (11 Ekim 2026 sabah)

Kaynak istek: 8 maddelik /goal (uçak animasyonu, sabit ana yazı, bölümler/metinler, tarihçe, hesap bölümü, header/footer,
EUROAVIA haritası, bölüm geçişleri). v2 `kaynak/v2/` içinde arşivli.

**Kısa özet (sabah 06:55–10:00 turu; ayrıntı aşağıda saat başlıklarıyla):**
- Açılış: ad geçişi bulanıksız, kelime kutusunda kayan harflerle; uçağın önünde soluk "uçuş planı"; dar ekranda uçak metne binmez
  (320 px EN'de yer yoksa çizilmez, dil değişince yeniden ölçülür); açılış sonunda durak satırı ve (geniş ekranda) silüet söner.
- EUROAVIA: koyu "gece haritası" (sarı rotalar/uçaklar, seçimde odak), takvimde geçmiş soluk + 5 tam satır + "Tüm takvim", kenarda etiket
  taşmaz, telefonda seçimde harita görünür alana kayar, dokunmada 28 px seçim yarıçapı; bilgi kartı haritanın altında (seçimde liste kaymaz).
- Tarihçe: anlamlı ikonlar; ≤ 1080 px'te dikey rota (iz kaydırdıkça dolar, ucunda uçak). Kulüp girişi tarihçeyle başlar; "Her yıl" kutusu açık.
- Yazılar 4×3 tam ızgara, öne çıkan kartta İstanbul silüeti; yinelenen EUROAVIA etiketi kalktı; başlık/özetlerde bölünmez boşluk.
- Gündem: tarih yinelenmiyor ("Cuma · 09:30"), .ics RFC 5545 katlamalı; pano sabit sütunlu (harf dönerken kaymaz), telefonda tek satır, "ATÖLYE: TURKISH TECHNIC".
- Hesap: panel yapışkan, doğrulanmış üyeye kurulum adımları yok; telefonda kart çizgisi/uçağı yazıya binmez.
- Başlık/alt bilgi: koyu bölümlerde sarı odak halkası (2,81 → 10,35:1), "Başa dön" ↑, telefon menüsünde ikincil bağlantılar küçük.
- Yeni: 404 sayfası; `siteyi-ac.cmd` artık tam siteyi (hesap + kayıt) açar; e2e sınama verisini kendisi temizler.
- Denetim (son: `.cekim-gecici/uumk/son-v3/son-1000/`): dogrula 855 · sunucu-sina 61 · uçtan uca 25 · axe 0 (7 görünüm) ·
  UX yasa denetimi 0 HATA (tek UYARI Parkinson: kullanıcının istediği zorunlu okul e-postası/numarası). Bütçeler: açılış JS 63,9/64 kB, CSS gzip 9,63/10 kB.
- Açık: aydınlatma metni taslak (kulüp/İTÜ), `og:image` (alan adı), Firefox/Safari/gerçek telefon sınanmadı, palet ince ayar yanıtı gelmedi.

| # | İstek | Yapılan | Kanıt |
|---|---|---|---|
| 1 | Uçak animasyonu kötü | Katlanan kâğıt kaldırıldı. Yeni `sahne/ucus.mjs`: katlanmış kâğıt uçak (iki kat çizgili kanat, omurga, ışıkla gölgelenen yüzler, kâğıt dokusu, kanat ucunda logodaki petrol bant). Yön teğetten, "yukarı" eğrilik + yerçekiminden: dönüşte yatar, yalnız takla penceresinde sırtüstü. Kesikli uçuş izi, ilk açılışta süzülerek giriş, imleçle hafif paralaks, arkada sönümlü seyrüsefer ızgarası | `dogrula.mjs` §6 (yörünge sürekli, takla yalnız penceresinde, silüet geçişi metnin sağında); e2e "açılış" + "hikâye"; `notlar/v3-acilis-akisi.png` |
| 2 | Sol ana yazı değişmesin | h1 ve açıklama sabit; yalnız ad değişir: İTÜ Uçak Uzay Mühendisliği Kulübü → "AS Istanbul" + küçük "EUROAVIA" → "İTÜ UUMK". Harf harf, ardışık (üst üste binmez). Altta 3 durak (UUMK · AS IST · İTÜ) | e2e "açılış": h1 ve açıklama konumu 3 karede aynı, hâller 0→1→2 |
| 3 | Bölümler düz metin, AI slop, iç notlar sızmış | Gündem: tarih kutulu kartlar, doluluk çubuğu, "Takvime ekle" (.ics), etiketli duyurular. Pano: başlık şeridi + canlı İstanbul saati, galeri. Yazılar: kart ızgarası, öne çıkan ilk yazı. Ekipler: ikonlu kartlar. Kaldırılanlar: kaynak satırları ("Kaynak: …", "Fotoğraf: …"), "Kâğıt uçak şablonu", alt bilgideki "son kontrol" notu, ipucu. Üç bağımsız editör okuması (55 + 3 + 24 bulgu) uygulandı | `dogrula.mjs` §11 (yasak sözcükler); e2e "takvime ekle" |
| 4 | Tarihçe | Kaydırdıkça dolan uçuş rotası, 6 nokta (1983, 2001, 2003, 2021, 2024, 2026), geçilen nokta dolar, ucunda uçak | e2e "kuruluş ve tarihçe" (6/6 nokta) |
| 5 | "Hesapla etkinlik kaydı" ve tasarımı | Başlık "Kulüp kartın"; kimlik kartı biçiminde önizleme forma yazdıkça dolar, girişte profil bilgisi ve doğrulama durumu. Numaralı 3 adım | e2e hesap senaryoları; ekran: `.cekim-gecici/uumk/v3c/a/07-kare.png` |
| 6 | Header ve footer | Header: numaralı menü, etkin bölüm altında kayan işaret, sayfa ilerleme izi + uçak, telefonda tam ekran menü (iletişim satırı). Footer: ufuk kavisi, pist ve inen uçak, iki logo + tam üyelik bilgisi, 4 sütun (iletişim, site, kanallar, EUROAVIA), çizilen silüet, koordinat | e2e "header", "footer", "mobil menü" |
| 7 | EUROAVIA haritası | Küre yerine `sahne/harita.mjs`: Lambert eşit alan, Avrupa çerçevesi, kara noktaları (grubu olan ülke ayrı ton), 10° ağ, 500 km ölçek; İstanbul'dan rotalar sırayla çizilir, rotalarda uçaklar, İstanbul nabzı; etkinlik seçince rota çizilir ve uçak hedefe uçar, km sayacı; üzerine gelince rota önizlemesi; tam üye dolu / aday halka; çerçeve dışı grup kenarda okla | e2e "harita" (39 rota, Brugge 2.266 km) |
| 8 | Bölümler arası geçiş | Siyah bölümlere ufuk kavisi kaydırdıkça düzleşir; bölüm etiketlerinde iz uzar, başlık yükselir; ikonlar çizilir, fotoğraflar açılır, kartlar sırayla yükselir; sayfa boyunca aynı kesikli iz | ekran: `.cekim-gecici/uumk/v3d/ufuk/` |

Araştırma: diğer EUROAVIA yerel gruplarının siteleri → `notlar/lg-arastirma.md` (çalışan harita, görsel zaman çizelgesi, rakamların HTML'de gerçek değerle yazılması buradan).

Denetim (son koşular `.cekim-gecici/uumk/son-v3/`): dogrula 851/851 · sunucu-sina 60/60 · uçtan uca 22/22 · axe 0 ihlal (1440, EN, 390, 1024, ?az=1, yönetim, kvkk) · UX yasa denetimi 0 HATA (UYARI: Parkinson — okul e-postası/numarası zorunlu, kullanıcı isteği; Pareto — açılış bilinçli havadar). Tablo: `notlar/ux-denetim.md`.

Bu gece bulunup düzeltilen hatalar: harita görünürlüğü modül yüklenmeden gelince donuk kalıyordu; `[hidden]` CSS tarafından eziliyordu; hesap ilk oturum sorgusu yeni girişi ezebiliyordu; axe betiği port çakışmasıyla takılıyordu; menüye eklenen dış bağlantı betiği durduruyordu; derin bağlantıyla açılan biniş kartı kapanınca pano yerine gündem görünüyordu.

Kulübe açık kalanlar: palet E · Hangar seçildi; kuruluş metni 2001 (kullanıcı onayı); aydınlatma metni taslak (veri sorumlusu/hukuki sebep kulüp ve İTÜ tarafından doldurulacak).

## Bağımsız görsel eleştiri sonrası (06:00–06:10)
Ajan 10 sorun saydı; uygulananlar: açılışın son %10'unda silüet, ızgara ve uçuş izi söner (gündemin üstünde kırıntı kalmıyor);
pano hiyerarşisi (sarı yalnız etkinlik adında, tarih ve yer gri); başlıklarda `text-wrap: balance`, metinde `pretty`;
ekip kartları kutusuz, üst çizgili liste; tarihçe rotası içerik sütununda; hesap düğmesindeki boş daire kalktı (nokta yalnız girişte);
telefonda kart düğmeleri eşit genişlikte; İstanbul kartındaki boşluk; "sıradaki" rozet; EUROAVIA etiketi çerçeveli (hafif).
Uygulanmayan: bölüm geçişlerini tek biçime çekmek (kavis kaydırdıkça bilinçli olarak düzleşir); pano tarih biçimlerini birleştirmek
(kaynakta tarih kesinliği farklı: "Bahar 26" ile "03.03.26"; birleştirmek uydurma kesinlik olur).

## Performans (06:20–06:35)
Ölçüm `.cekim-gecici/uumk/kare-olc.js` (120 kare, açılış kaydırma + harita boşta):
- Gerçek GPU (CEKIM_GPU=1): açılış ort 6,9 ms · harita ort 6,9 ms.
- Yazılımsal çizim (SwiftShader, makine başka bir süreçle yüklü): önce açılış ort 493 ms, harita 117 ms.
Uyarlanabilir kalite eklendi: ilk 10 karenin ortalaması > 40 ms ise bulanık gölge, kâğıt dokusu ve harf bulanıklığı kapanır, tuval 1x piksel;
harita rotaları giriş bitince durağan tampona bir kez çizilir. Sonra (yazılımsal): açılış hafif kipte ort 64 ms, harita ort 33–38 ms.
`?hafif=1` düşük kaliteyi zorlar.

## Ek (06:40)
- Harita: seçimden sonra "İstanbul'a dön" düğmesi (e2e harita senaryosu dönüşü sınar).
- Düzen kayması (CLS): 1440 ve 390'da 0,000 (`.cekim-gecici/uumk/cls.js`). En büyük içerik boyaması yazılımsal GPU'lu, yüklü makinede 2,8–2,9 sn; gerçek cihazda ölçülmedi.

## Bağımsız kod incelemesi (06:45–06:53)
11 bulgu; kaynağında doğrulanıp düzeltilenler: harita hafif kipe geçince çift kare döngüsü; dönen pano dil değişimini eziyordu (ve
ilk Türkçe metin kaydı bozulabiliyordu → kayıt dilKur başında alınır); dil değişimi açık misafir formunu siliyordu; etkinlik listesinde
yanlış aria-live; /api/durum JSON dönmezse formlar kilitli kalıyordu; kare ölçümü boş aralıkları sayıyordu; menü düğmesinin etiketi dil
değişince güncellenmiyordu; tam ekran menüde Tab arkaya kaçıyordu (inert) ve genişlik büyüyünce menü açık kalıyordu; hesap silme hatası
ham anahtar gösterebiliyordu; "sıradaki" UTC tarihine göreydi (İstanbul'a çevrildi). Uygulanmayan: ICS satır katlama (düşük; istemciler tolere eder).
Yeni regresyon senaryosu: "dil değişimi: dönen pano ve açık misafir formu bozulmaz". Son: dogrula 853 · e2e 23/23 · sina 60 · axe 0.

## 06:55–07:40
- Dar ekran açılışı: uçuş bandı derinliğe göre düzeltildi (320×640'ta uçak "15 ülke" yazısının üstüne binmiyor; `.cekim-gecici/uumk/son-v3/dar5/alt3.png`).
- **EUROAVIA gece haritası**: bölüm koyu zemine alındı (üstte ve altta ufuk kavisi; sayfa ritmi açık · koyu · açık · koyu). Harita: kül kara noktaları,
  grubu olan ülkeler petrol, gruplar beyaz, AS Istanbul'un rotaları/uçakları/nabzı sarı; seçili etkinlik sarı rota + takvimde sarı çerçeve;
  geçmiş etkinlikler soluk, sıradaki beyaz + sarı rozet. e2e harita senaryosu artık sarı rota pikseli sayar.
- **Telefon ve tablette tarihçe** (≤1080 px): dağınık 2–3 sütun yerine dikey rota; kesikli iz kaydırdıkça petrolle dolar, ucunda aşağı uçan uçak,
  noktalar iz ulaştıkça dolar. Yeni e2e senaryosu "telefonda tarihçe" (iz 0 → 0,35 → 1; nokta 0 → 2 → 6).
- "Her yıl" kutusu açık zemine alındı (koyu EUROAVIA bölümünden önce erken koyu leke kalmasın); kulüp girişi tarihçeyle başlar
  ("2001'de kurulduk ve aynı yıl EUROAVIA'ya katıldık. Bugün beş ekiple…", EN de).
- Açılış sonu: durak satırı (UUMK · AS IST · İTÜ) silüetle birlikte söner, gündemin üstünde yalnız kalmıyor. Uçuş izi açılışın ilk %4–12'sinde
  yavaşça belirir (kuyruk altındaki kısa kıvrım kalktı).
- Kulüp kartı: kesikli çizgi ve sarı uçak sabit konumda (telefonda "EUROAVIA" yazısının üstüne binmiyordu).
- EUROAVIA'da km sayacı ilk HTML'de gizli (harita yüklenince bölüm 46 px kısalıyordu → düzen kayması).
- Uçtan uca betik sınama etkinliklerini koşudan sonra da siler (yerel sitenin gündeminde "Sınama etkinliği …" kalıyordu).
- Bağımsız görsel eleştiri (3. tur, 10 madde): uygulananlar yukarıda (iz kıvrımı, her yıl kutusu, tarihçe metni, geçmiş etkinlikler).
  Uygulanmayanlar: açılış başlığını "İTÜ UUMK" ile başlatmak (kullanıcı tam adı ana yazı olarak istedi), pano tarih biçimleri (kaynak kesinliği),
  yazılara blog görselleri (indirme izni gerekir), takvim alt kenarına solma maskesi (CSS degrade yasağı).
Son: dogrula 853/853 · e2e 24/24 · sina 60/60 · axe 0 ihlal (1440, 390, EN) · UX denetimi 0 HATA / 1 UYARI (Parkinson).

## 07:35–07:45
- Harita odak kipi: etkinlik seçilince harita (kara, gruplar, rotalar, süzülen uçaklar) %50 geri çekilir, seçili sarı rota öne çıkar
  (`.cekim-gecici/uumk/odak/iki.png`: önce/sonra).
- Pano telefonda: "Durum" sütunu gizli (biniş kartında var), etkinlik adları tek satır.
- Panoda "TURKİSH TECHNİC" hatası: büyük harf dönüşümü Türkçe yerelle yapılıyordu; düğmedeki `all: unset` Chrome'da `lang`
  özniteliğinin yerelini de sıfırladığı için `lang="en"` üst hücreye (`th`) kondu → "ATÖLYE: TURKISH TECHNIC".
- Alt bilgi "Başa dön": imleç gibi okunan döndürülmüş uçak yerine sarı ↑.
dogrula 853 · e2e 24/24.

## 07:50–08:00
- **`siteyi-ac.cmd` artık tam siteyi açar**: önceden yalnız statik PowerShell sunucusunu açıyordu, yani hesap/giriş/etkinlik kaydı hep
  "şu an kapalı" görünüyordu. Şimdi Node 22.13+ varsa `node sunucu/sunucu.mjs --deneme` (PORT 8790, yerel deneme veritabanı; tarayıcı
  ~2 sn sonra açılır), yoksa eski statik sunucu. Sınama: PORT=8790 ile sayfa 200, /api/durum JSON (betik tarayıcı açtığı için cmd'nin
  kendisi burada çalıştırılmadı). Eski hâli: `.cekim-gecici/uumk/yedek-0715/siteyi-ac.cmd`.
- Hesap paneli masaüstünde yapışkan (kartın yanında kalır; "Hesap aç" sekmesinde 503 px, 768 px yükseklikte sığıyor).
- Statik görünüm yeniden kontrol edildi (Python sunucusu 4290, sonra kapatıldı): gündem "kayıt şu an kapalı" kartı, hesap paneli notu; konsolda yalnız beklenen 3 /api 404.
- Yazılar ızgarası: öne çıkan kart 2×2 (9 yazıda 4×3 tam ızgara; önceden son satırda tek kart kalıyordu); boşluğunda açılıştaki İstanbul
  silüeti (`<use href="#silet-cizim">`, petrol, %50) — "AS Istanbul'dan haberler" kartının üstünde ufuk. ≤1080 px'te tek satır.
dogrula 853 · e2e 24/24 (08:00).
- Ölçüm (08:00, `.cekim-gecici/uumk/cls.js`): CLS yüklemede 0,000 (1440 ve 390), 390'da #ag → #hesap kaydırmasında 0,001.
  LCP gerçek GPU ile 640–1004 ms (1440); yazılımsal çizimde 2,5–3,9 sn (makine yükü). Gerçek cihazda ölçülmedi.

## Bağımsız kod incelemesi, 2. tur (08:00–08:10)
6 bulgu (yüksek önem yok); kaynağında doğrulanıp düzeltilenler:
- EUROAVIA takvimi "geçti"/"sıradaki" başlangıç tarihine bakıyordu: 3–8 Kasım Ideathon 4 Kasım'dan itibaren soluk ve rozetsiz kalırdı →
  bitiş tarihi (`TAKVIM[i][1]`).
- Statik (JS'siz / veri gelmeden) ilk yazı kartında silüet yoktu, 2×2 kartta boşluk kalırdı → silüet statik HTML'de de var
  (dogrula'nın yazı eşleştirmesi buna göre güncellendi).
- Harita: rotaların tampona yazıldığı karede tampon önce çiziliyordu (iz bir kare kayboluyordu) → sıra düzeltildi.
- Dar ekran tarihçe: her kaydırma karesinde yaz-oku (zorunlu düzen) → önce oku, sonra yaz.
- `siteyi-ac.cmd`: Node 22.5–22.12'de iletisi yanlıştı → "Node 22.13 veya üstü bulunamadı".
Bilerek bırakılan: panodaki `th lang="en"` (Türkçe kipte ekran okuyucu "Atölye"yi İngilizce sesle okuyabilir; kaldırmak "TURKİSH"i geri getirir,
bölünmüş-harf animasyonu iç `span`ı sildiği için ayrık işaretleme yapılamıyor).
Ek: 320 px'te metin ekranı tamamen dolduruyorsa (EN) uçak çizilmez; bant yazı tipleri yüklenince yeniden ölçülür.
Son: dogrula 854/854 · e2e 24/24 · axe 0 (1440, 390).

## Görsel eleştiri, 4. tur (08:10–08:25)
8 madde; ekranlarla ve kodla karşılaştırıldı. Yanlış çıkanlar: "kulüp kartı forma tepki vermiyor" (veriyor: `kart-canli/02-by=250.png`),
"header yukarı kaydırınca dönmüyor" (dönüyor), "2026 içi boş" (çekim anında iz henüz ulaşmamıştı), alıntılanan gündem notu eski sürümdü.
Uygulananlar:
- Haritada etiket kenara taşarsa diğer yana geçer (telefonda "İstanbul" kesiliyordu; şimdi sağ kenardan 88 px içeride).
- Yazılarda 7 kez yinelenen "EUROAVIA" etiketi kalktı (bölüm girişi kaynağı söylüyor); yalnız farklı kaynak (AESTRO) etiketli.
- Gündem kartında tarih iki kez yazılıyordu ("23 EKİ" + "23 Ekim Cuma 09:30") → satırda "Cuma · 09:30"; gün ve ay ekran okuyucu için satırda gizli metin (kutu aria-hidden).
- Gündem notu yeniden yazıldı: "Hesabınla giriş yaptıysan kayıt tek tıktır. Hesapsız da kaydolabilirsin; o zaman bilgilerini her etkinlikte yeniden yazarsın."
Ek bulgu: e2e her koşuda örnek etkinliğe misafir kaydı ve sınama hesapları bırakıyordu (örnek teknik gezide 24/40 yer dolmuştu) →
koşu öncesi/sonrası temizlik bu kayıtları ve 'uye' rollü sınama hesaplarını da siler (e-posta desenleri misafir./deneme./csv./yon./sil.@itu.edu.tr;
yalnız deneme.db). İlk temizlik: 24 kayıt, 125 hesap. Örnek gezi yeniden 40 boş yer.
Açılış JS bütçesi için ceviri.mjs ve hesap.mjs başlık açıklamaları `notlar/tasarim.md` "Modül notları"na taşındı.
dogrula 854 · e2e 24/24.
- EUROAVIA takvimi yarım satırla kesilmiyor (iki eleştiri turu da işaret etti): 24rem'e sığan tam satırlar (masaüstünde 5) + "Tüm takvim (19)" /
  "Daha az göster" düğmesi (aria-expanded, aria-controls; EN "Full calendar"). Liste yine kaydırılabilir, klavye gezintisi aynı.
  Hick: 19 seçenek yerine 5 + 1. dogrula 854 · e2e 24/24 · axe 0 (1440, 390) · UX denetimi 0 HATA / 1 UYARI (08:22).
- Açılışta uçuş planı: uçağın burnundan ileriye, kaydırınca gideceği yol çok soluk noktalı çizgiyle (sonraki %32'lik yol, uzaklaştıkça
  söner; açılışın sonunda kaybolur). Masaüstünde boş sağ yarıyı anlamlı biçimde doldurur (iki eleştiri turu işaret etmişti).
  `.cekim-gecici/uumk/plan/z0.png`. dogrula 854 · e2e 24/24 (08:26).
- Yeni e2e senaryosu "EUROAVIA takvimi: yarım satır yok…": ilk sürümde 1 px'lik satır görünüyordu (offsetHeight yuvarlaması) ve ölçüm
  ResizeObserver'dan önce yapılıyordu → kesirli yükseklik, kurulumda eşzamanlı sığdırma, yazı tipi yüklenince yeniden sığdırma.
  e2e 25/25 · dogrula 854 (08:30).
- Yerel örnek veri metni (`araclar/ornek-veri.mjs`, yalnız deneme.db; kimlikler aynı): "Örnek: teknik gezi / Örnek yer / Yerel deneme kaydı.
  Gerçek bir etkinlik değildir." iç not gibi okunuyordu ve `siteyi-ac.cmd` artık tam siteyi açtığı için kullanıcı bunu görecek →
  "Teknik gezi (örnek) · Hangar (örnek) · Kayıt akışını denemek için örnek kart. Yayındaki sitede yönetim panelinden eklenen etkinlikler görünür."
  (EN de). deneme.db yeniden tohumlandı (2 etkinlik, 9 yazı).
- .ics satır katlama (RFC 5545, en çok 75 sekizli; UTF-8 karakter bölünmez): önceki incelemede "düşük" diye bırakılmıştı, örnek açıklama
  uzayınca gerçek oldu. e2e "takvime ekle" artık her satırın ≤ 75 sekizli olduğunu ve katlamayı sınar. e2e 25/25 (08:37).

## İngilizce metin incelemesi (08:35–08:42)
Bağımsız İngilizce editör okuması (dil/en.mjs + ag.mjs/hesap.mjs İngilizce dizgeleri, Türkçe kaynakla karşılaştırmalı): 25 öneri, 24'ü uygulandı
(ör. "1 places left" → "Places left: {n}", "Show {n} more events" → "Show {n} more", Türkçedeki "ilgisine göre" ve "mesajla" eksikleri,
yeni tamamlanmış eylemlerde İngiliz kullanımı present perfect). Uygulanmayan: "tekâmül sertifikası"nın İngilizce resmi adı doğrulanmadığı için b3.
- Açılış uçuş planı yavaş (yazılımsal) çizimde kapalı: hafif kipte açılış 71,5 → 64,2 ms/kare; gerçek GPU 6,9 ms (değişmedi).
dogrula 854 · e2e 25/25 (08:42).

## Ad geçişi: bulanıklık yerine kırpılmış kayma (08:44–08:47)
İki eleştiri turu ara karelerdeki bulanık "hayalet" yazıyı işaret etti. Harf başına `filter: blur` kaldırıldı; her kelime kendi kırpma kutusunda
(`clip-path: inset(-0.22em -0.08em -0.26em)`, ascender/descender payı), harfler alttan 1,5 em kayarak girer, üstten çıkar (sırayla). Durağan karede
de net; 1,15 em'de "ç" çengeli ve "y" kuyruğu kutuda kalıyordu → 1,5 em. Kare süresi: GPU 6,9 ms (aynı), yazılımsal hafif kip 63,1 ms (önce 64,2).
Önceki hâl: `.cekim-gecici/uumk/yedek-0845/`. Kareler: `.cekim-gecici/uumk/morf2/`, `morf-m/`. dogrula 854 · e2e 25/25.
- Metin: pano girişi "Ayrıntı için bir satıra tıkla; biniş kartı açılır.", hesap adımı 03 "Kayıt açılınca tek tıkla kaydol; bilgilerin karttan gelir." (EN de).
- Açık kalan (alan adı gerekiyor): paylaşım önizlemesi için `og:image` mutlak adres ister; site adresi belli olunca eklenmeli.
- **404 sayfası** (`404.html`): sunucu (sunucu.mjs `yok()`) bu dosyayı arıyordu ama yoktu → düz "Bulunamadı" metni dönüyordu. Şimdi:
  kesikli rota + uçak çizimi, "404 · Bu rota haritada yok", TR+EN tek cümle, "Ana sayfaya dön" (birincil) + "Gündem". Her yolda (/a/b/c)
  sunulduğu için kaynaklar kökten mutlak; dogrula bunu sınar (855). UX denetimi 0/0, axe 0 (1440, 390). Vercel'in kökteki 404.html'i
  kendiliğinden kullandığı genel bilgi; bu projede yayında denenmedi.
- sunucu-sina: olmayan yol → 404 + kulübün 404 sayfası (61/61).
- Odak halkası koyu bölümlerde sarı: petrol #056b7a / #1a1a1a karşıtlığı 2,81:1 (WCAG 2.2 metin dışı öğe eşiği 3:1 altında; hesap: göreli parlaklık formülü), sarı 10,35:1. dogrula 855.
- Tarihçe noktalarına anlamlı çizgi ikonlar (ekip ikonlarıyla aynı dil): 1983 fakülte binası, 2001 bayrak (kuruluş), 2003 kürsü (kongre),
  2021 dergi, 2024 yıldız (65. yıl), 2026 topluluk (yeni kurul). Rota ulaşmadan gri, ulaşınca petrol. Masaüstünde yılın sağında, dikey
  rotada satırın sağında. `.cekim-gecici/uumk/ikon2/k.png`, `ikon/m/`. dogrula 855 · e2e 25/25 · axe 0. CSS gzip 9,96/10 kB (dar).
- CSS: ad hâllerini gizleyen 6 parçalı seçici (üç html durumu zaten her kipi kapsıyordu) tek seçiciye indi; JS'siz, ?az=1 ve normal kipte görünürlük ölçüldü (aynı). CSS gzip 9,94.
- Harita: dokunmada seçim yarıçapı 28 px (fare 16 px). Sınama: grup noktasından 20 px uzağa fare tıklaması seçim yapmadı, dokunma en yakın grubu seçti. README ve notlar/tasarim.md güncel. e2e 25/25.
- Telefonda takvimden tıklamayla etkinlik seçilince harita görünür alana kayar (haritanın < %60'ı görünüyorsa; klavyeyle seçimde kaymaz).
  Sınama: ?az=1'de (anlık kaydırma) seçimden sonra harita 285–643 px (ekran 844) · masaüstünde kaydırma yok (scrollY aynı).
  Yumuşak kaydırmalı hâl başsız Chrome'da doğrulanamadı (CSS `scroll-behavior: smooth` başsızda ilerlemiyor: 300 ms'de 2 px); gerçek tarayıcıda denenmedi.
  (Uygulamanın tarayıcı panesinde denemek istendi: pane görünür olmadığı için belge 'hidden', harita tembel yüklenmedi → orada da doğrulanamadı.)
- Telefonda pano fotoğraflarının yazıları görselin altında (önce küçük fotoğrafların ~%40'ını örtüyordu). CSS gzip 9,96. dogrula 855.
- Giriş yapılmış hâl görsel denetimi (yerel deneme hesabıyla, `.cekim-gecici/uumk/giris-durum/03-by=200.png`): kart profilden dolar,
  "Doğrulama bekliyor", panelde yeniden gönder. Doğrulanmış üyeye 01–03 kurulum adımları gösterilmez (Occam); e2e hesap senaryosu
  doğrulamadan önce görünür / sonra gizli olduğunu sınar. Görsel için açılan deneme hesabı e2e temizliğinde silindi. e2e 25/25 (09:15).
- Ölçüm (09:20): 390 px, gerçek GPU, işlemci 4× yavaşlatılmış (CEKIM_CPU=4): açılış ort 7,1 ms (en kötü 13,9), harita ort 7,3 ms (en kötü 14,1). Gerçek telefonda ölçülmedi.

## Telefon eleştirisi, 5. tur (09:20–09:27)
8 madde ekranla ve ölçümle karşılaştırıldı. Yanlış çıkan: "EN ve menü düğmesi 44 px altı" (ölçüm: ikisi de 44×44, yalnız çerçevesiz).
Uygulananlar:
- Açılış sonrası ~390 px boşluk (telefon): silüet/ızgara son %10'da sönüyordu; sanat dar ekranda alt bantta olduğu için bant boşalıyordu →
  sönme yalnız geniş ekranda (dar ekranda silüet bantla birlikte kayarak çıkar). Masaüstünde p=0,97'de silüet opaklığı 0,066 (sönme sürüyor).
- Başlık gizlenince üst kenarda yarım uçak ucu kalıyordu → başlık gizliyken ilerleme uçağı görünmez (ilerleme çizgisi kalır).
- "Parolanı mı unuttun?" tek başına bağlantı: dokunma alanı 12 px üst/alt dolgu.
- Telefonda ekip ızgarasında tek kalan son ekip tam genişlik.
Bütçe: CSS'teki 18 bölüm yorumu `notlar/tasarim.md`'ye taşındı (gzip 10095 → 9702 bayt; dogrula ölçümü 9,57 kB → değişikliklerle 9,60),
site.mjs başlığı da. Uygulanmayanlar: 13 px ikincil yazılar (punto ölçeği bütçesi), takvim satır girintisi (seçili satır çizgisi için 3 px sol kenar + dolgu).
dogrula 855 · e2e 25/25 · axe 0 (1440, 390) · UX 0 HATA / 1 UYARI.
- Telefonda pano galerisi tek sütun (fotoğraflar tam genişlik, yazılar tek satır; '·' satır sonunda kalmıyor); yazılarda tarih ve '·' öncesi bölünmez boşluk (TR+EN).
- Yazı başlık ve özetlerinde bölünmez boşluk (sayı + sözcük: "30 kişi"; ay + yıl: "Temmuz 2026"), site.mjs `bag()`. e2e EN senaryosu boşlukları normalize ederek karşılaştırır. dogrula 855 · e2e 25/25 (09:34).
- Tarihçe 2001: "4 Ocak'ta", "7 Mayıs'ta" (EN "4 January", "7 May") bölünmez boşlukla; dogrula ve e2e kuruluş sınamaları boşluğu kabul edecek biçimde güncellendi. dogrula 855 · e2e 25/25 (09:37).
- Telefonda pano başlık şeridi tek satır: ortadaki "Kalkışlar/Departures" ≤ 560 px'te gizli (bölüm başlığı zaten söylüyor; şerit aria-hidden), harf aralığı 0,08em. 320 px'te taşma yok (scrollWidth 270 = clientWidth, TR ve EN).
- Pano dönen harf alfabesi İngilizcede Türkçe harfsiz (ÇĞİÖŞÜ çıkarılır). Düzeltme (10:05): burada önce "EN sözlüğü gelene kadar pano Türkçe metni döndürür" yazmıştım; bu ölçülmemiş bir çıkarımdı. Ölçümde sözlük 150 ms'de yüklü, görülen Türkçe harfler özel adlardan (aşağıya bakın).
- `siteyi-ac.cmd` kuru koşu (tarayıcı/sunucu/ps1 satırları echo ile değiştirilmiş kopya, cmd altında): Node dalı seçildi, PORT=8790, tarayıcı adımı ve sunucu adımı sırayla; çıkış 0. Gerçek tarayıcı açılışı denenmedi (kullanıcının masaüstünde pencere açardı).

## Bağımsız kod incelemesi, 3. tur (09:47–09:55; 08:10 sonrası değişiklikler)
3 gerçek hata, kaynağında doğrulanıp düzeltildi:
- Dil değişince açılış metninin yüksekliği değişiyor ama uçuş bandı yeniden ölçülmüyordu (tuval boyutu değişmediği için) → `dil-degisti`te
  `boyutla()`. Sınama (320×640, p=0,3, tuvalde dolu petrol piksel): TR 146 → EN 0 (yer yok, uçak çizilmez) → TR 159.
- Pano dönerken dil değişirse çevirisiz hücre (TUSAŞ kapı hücresi) karışık harflerle kalıyordu → animasyon durdurulmadan önce çevirisiz
  hücreler asıl metne döner.
- e2e temizliği `deneme.%@…` gibi geniş desenle elle açılmış yerel hesapları da silebilirdi → yalnız betiğin 7 haneli damgalı adresleri
  (`GLOB 'deneme.[0-9]×7@itu.edu.tr'`); deneme.db yoksa boş dosya yaratmaz.
Doğru bulunanlar (inceleyici Node'da koşturdu): .ics katlama (en çok 75 sekizli, geri açınca aynı metin), gündem saat biçimi (tr-TR ve en-GB h23),
takvim bitiş tarihi sırası, `bag()` U+00A0. Açılış JS bütçesi için pano.mjs başlığı da notlar/tasarim.md'ye taşındı.
dogrula 855 · e2e 25/25 (09:57).
- Denendi, geri alındı: EN derin bağlantıda panonun sözlük gelmeden dönmesini erteleme. Ölçümde sözlük 150 ms'de yüklenmişti; panoda görülen Ş/İ/Ü harfleri çevrilmeyen özel adlardan (TUSAŞ, İTÜ Genç Ofis, SİVEK). Sorun ölçümde görünmediği ve açılış JS bütçesini aştığı (64,0) için eklenmedi.

## Masaüstü son eleştiri, 6. tur (10:03–10:12)
6 madde; uygulananlar (ölçümle):
- Etkinlik seçince bilgi kartı 142 → 238–302 px büyüyor, takvim listesi ~160 px aşağı kayıyordu (tıklanan satır imlecin altından kaçıyordu) →
  bilgi kartı haritanın altına taşındı (sol sütun; haritanın açıklaması gibi). Seçimde tıklanan satır yerinde: 332 → 332 → 332 px. Telefonda sıra aynı
  (harita, kart, takvim).
- Sağ sütun hizası: harita ızgarası başlıkla aynı oranda (7fr/5fr); takvim fotoğrafla aynı x'te (835 px).
- Pano sütunları harf dönerken kayıyordu → `table-layout: fixed` + başlıkta genişlik (masaüstü 112/510/256/256, telefon 76/264; satır kırılması 0).
- Adres "Derslik C Blok" bölünmez (TR+EN).
Uygulanmayan: takvim satır girintisi (seçili satır kenarlığı için), alt bilgide iki satırlı bağlantı aralığı ve menü yazılarının 3 px'lik
dikey farkı (düşük; son saatte risk). dogrula 855 · e2e 25/25 · axe 0 (1440, 390).
- Üst menü yazıları diğer başlık öğelerinden 2–3 px aşağıdaydı (yazı merkezi 36 / EN 33 px) → bağlantı üst dolgusu 12 → 9 px; ölçümde menü ve EN aynı yükseklikte. Etkin işaret yerinde.
- Alt bilgi bağlantıları eşit dikey dolgu (10 px): iki satırlı "Masabaşı Seminerleri (podcast)" artık diğerleriyle aynı aralıkta (yükseklikler 46 / iki satırlı 71 px).
