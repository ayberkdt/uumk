# UUMK sitesi — tasarım (v3, 11.10.2026 gece; v2 kaynak/v2)

Kullanıcı geri bildirimi (v1): renk "AI slop", yazı tipleri sıradan, kendini pazarlayan cümleler, kanat profili logosu ucuz.

## Renk — E · Hangar (kullanıcı seçimi, 11 Ekim 2026; önizlemeler notlar/palet-secenekleri/)
Sıra: v1 koyu+neon → v2 açık gri #f6f7f5 + petrol/lacivert → B petrol blok → kullanıcı "renk yine değişsin" → 4 yeni yön (D–G) → E seçildi.
- Zemin beton grisi #ecebe7, yüzey #f8f8f6, mürekkep #141414, soluk #4a4a48 (6,9:1), çizgi #cfcdc6, alan kenarı #85837e (3,56:1).
- Petrol #056b7a (UUMK logosu) → birincil eylem, bağlantı, etkin durum, açılış adım etiketi, uçuş izi.
- Siyah #1a1a1a → kalkış panosu ve alt bilgi; pano yazısı sarı #f2c200 (10,35:1), gerçek kalkış panoları gibi.
- Bölüm etiketleri mürekkep; koyu bölümlerde sarı.

## Yazı
- v6 (11 Ekim 2026; kullanıcı: "Kullanılan fontlar da direkt AI SLOP"): başlık Jost 600 (Futura soyundan geometrik grotesk; havacılık afişleri ve
  eski uçuş kartlarının dili, Türkçe harfleri tam), gövde IBM Plex Sans (mühendislik kökenli, okunaklı, sayıları düzgün). İkisi de OFL, değişken, yerel.
  Kalkış panosu ve kartpostal başlıkları da Jost; ayrı bir "vurgu serifi" yok — iki aile, 6 punto.
- Bırakılanlar: Source Serif 4 + Instrument Sans (v5; kullanıcı "AI slop" buldu), B612 (Türkçe harfleri eksik), Big Shoulders, JetBrains Mono, Archivo;
  doğrulayıcı yasak listesi: Instrument Sans, Source Serif, Geist, Manrope, DM Sans.
- Hareket (v6, "daha smooth"): ortak eğri `--egri: cubic-bezier(0.16, 1, 0.3, 1)` (üstel yavaşlama), süre `--sure: 560ms` (600 ms kırmızı çizginin altında);
  kaydırmaya bağlı açılış hikâyesi rAF'te üstel yumuşatmayla (τ ≈ 110 ms) hedefe yaklaşır; kaydırmayı izleyen omurga/uçak/ilerleme çubuğu kısa doğrusal.

## Açılış (v3, 11 Ekim 2026 gece; kullanıcı: "uçak animasyonu çok kötü", "sol taraftaki ana yazı neden değişiyor")
- Sol: ana başlık sabit h1 "İTÜ Uçak Uzay Mühendisliği Kulübü" ve UUMK'yi anlatan sabit açıklama. Kaydırdıkça yalnız ad değişir:
  İTÜ UUMK (uzun ad) → "AS Istanbul" + küçük "EUROAVIA" → "İTÜ UUMK" + küçük tam ad. Harf harf; her kelime kendi kırpma kutusunda, harfler alttan kayarak girer, üstten çıkar (bulanıklık yok; 08:45'ten beri; site.mjs, PENCERE).
- Sağ: katlanmış kâğıt uçak (sahne/ucus.mjs; tuval 2B, kendi 3B izdüşümü; WebGL yok). Yön teğetten, "yukarı" eğrilik+yerçekiminden:
  dönüşte yatar; yalnız takla penceresinde sırtüstü (dogrula sınar). Kesikli uçuş izi; önünde gideceği yolun soluk uçuş planı (hafif kipte yok). Boşta süzülür.
- AS Istanbul hâlinde İstanbul silüeti çizilir (AS Istanbul amblemindeki öğeler: Galata, cami, Boğaz Köprüsü, Kız Kulesi, martılar).
- Sonda uçak aşağı süzülür; Gündem etiketindeki küçük uçak izi sürdürür.

## Bütüncül sayfa (geçişler)
- Üst şeritte sayfa ilerlemesi: kesikli iz, dolu kısım petrol, ucunda uçak. Etkin bölümün altında kayan işaret (ucunda uçak).
- Bölüm etiketleri: numara + kesikli iz + uçak; bölüm görününce iz uzar, başlık yükselir.
- Ufuk kavisleri: açık → siyah bölüm geçişlerinde (pano, EUROAVIA gece haritası, alt bilgi) kavis kaydırdıkça düzleşir; sayfa ritmi açık · koyu · açık · koyu.
- Tarihçe: noktalardan geçen rota kaydırdıkça dolar, ucunda uçak; geçilen nokta ve ikonu dolar. ≤ 1080 px'te dikey rota (--rota-t).
- Harita (gece): İstanbul'dan gruplara sarı rotalar sırayla çizilir; rotalarda uçaklar; seçilen etkinliğe uçak uçar, km sayacı; seçimde harita geri çekilir (odak).
- Alt bilgi: pist (kesikli), uçak iner; silüet tekrar (açılışla aynı çizim, <use>).

## Hesap
"Kulüp kartın": kimlik kartı biçiminde önizleme (siyah, sarı uçak); kayıt formuna yazdıkça dolar, giriş yapılınca profil bilgisi.

## Metin kuralı
Düz ve bilgi veren cümle. Yasak liste araclar/dogrula.mjs'de (TR + EN).

## Son ayrıntılar (11 Ekim 2026 sabah)
- Açılış: ilk yüklemede uçak sağ üstten süzülür, ana başlığın harfleri sırayla yükselir; imleçle hafif paralaks; sahnenin altında 3 durak
  (UUMK · AS IST · İTÜ). Ad hâlleri ardışık (yeni ad eskisi çıkınca girer).
- Uçağın dış kanat uçlarında petrol bant (logodaki eğik kuyruk bandı).
- Gündem: tarih kutusu, kontenjan doluluk çubuğu, ilk 4 kart + "Diğer N etkinliği göster".
- Harita: tam üye dolu nokta, aday grup halka; çerçeve dışı grup (Lagos) kenarda okla; 500 km ölçek; İstanbul seçiliyken km gizli.
- Görününce: ekip ikonları çizilir, fotoğraflar alttan açılır, yazı kartları sırayla yükselir, alt bilgi silüeti soldan sağa (hepsi 300 ms).
- JS yokken: ad tek hâl, silüet çizili, harita gizli, takvim tam genişlik.
Önizleme: notlar/v3-acilis-akisi.png.


## Modül notları (kaynak başlıklarından taşındı, 11 Ekim 08:15 — açılış JS bütçesi)

### ceviri.mjs
```
/* ÇEVİRİ — TR / EN. Türkçe sayfa metninin tek kaynağı index.html; İngilizce dil/en.mjs (yalnız seçilince iner).
 * HTML: data-i18n="anahtar" (düz metin), data-i18n-html (izinli satır içi işaretleme: <a>, <b>, <em>, <br>),
 *       data-i18n-aria / -alt / -placeholder / -title (öznitelikler). JS metinleri: metin('anahtar', { degisken }).
 * Seçim sırası: ?dil= → kayıtlı tercih (localStorage 'uumk-dil') → tarayıcı dili (tr ise tr, değilse en). Botlar her zaman tr.
 * Baş betiği (index.html) aynı kuralla <html lang>'ı ilk boyamadan önce kurar; araclar/dogrula.mjs iki kuralın aynı olduğunu sınar. */
```

### sahne/hesap.mjs
```
/* HESAP — kayıt sunucusuyla (sunucu/api.mjs) konuşan istemci: hesap paneli ve gündemdeki etkinlik kartları.
 * Hesaplı ve doğrulanmış kullanıcı etkinliğe tek tıkla kaydolur; misafir her etkinlikte ad, soyad, okul e-postası, okul numarası
 * ve aydınlatma onayını yeniden girer. Sunucu yoksa (statik barındırma) kartlar yerine dürüst bir not gösterilir.
 * Metinler ceviri.mjs → metin(); dil değişince kartlar ve panel yeniden çizilir. */
```

### sahne/ucus.mjs
```
/* UÇUŞ — açılıştaki kâğıt uçak (tuval 2B, kendi 3B izdüşümü). Yön teğetten, "yukarı" eğrilik + yerçekiminden:
 * dönüşte yatar, yalnız takla penceresinde sırtüstü. Ayrıntı: notlar/tasarim.md. */
```

### site.css bölüm başlıkları (09:25'te CSS bütçesi için koddan çıkarıldı)
- ── düğmeler: 2 stil ──
- ── üst şerit ──
- ── açılış: ad ve uçuş ──
- ── bölüm iskeleti ──
- bölümler arası ufuk (site.mjs)
- ── 01 gündem ──
- ── 02 son etkinlikler: kalkış panosu ──
- ── 03 yazılar ──
- ── 04 kulüp: tarihçe rotası, ekipler, yıllık program ──
- ── 05 EUROAVIA ──
- JS yoksa yalnız takvim
- ── 06 hesap: kulüp kartı + panel ──
- ── alt bilgi ──
- ── metin sayfaları ve yönetim ──
- ── dar ekran ──
- dikey tarihçe
- ── hareket azaltma, yazdırma, zorlanmış renkler ──
- yumuşak kaydırma yüklemeden sonra

### site.mjs
```
/* UUMK — sayfa denetleyicisi (v3). Ayrıntı: notlar/tasarim.md.
 * URL: ?dil=en · ?az=1 · ?p=0.5 (açılış karesi) · ?olc=1 (sınama) · ?hafif=1 (düşük kalite) · #etkinlik-<id> · #sifre-yenile=<belirteç> */
```

### sahne/pano.mjs
```
/* PANO — kalkış panosu (bir kez döner harf, ~1 s; hareket azaltmada durağan) ve biniş kartı (<dialog>, #etkinlik-<id>, Code 128-B). */
```

## v4 (11 Ekim 2026; ayrıntı notlar/v4-teslim.md)
- Açılış: ızgara yok; altta İstanbul panoraması (sahne/istanbul.mjs → araclar/istanbul-insa.mjs → index.html), gökte 3 küçük kâğıt uçak (ucus.mjs suru()).
  Panorama renkleri sınıflarla: .ist (gündüz: yüzey #f8f8f6, mürekkep çizgi, petrol çatı/su, #dfeaeb kubbe/güneş), .ist--gece (#141414 gövde, sarı pencere/fener).
  İnşa: .blok (--s gecikme, site.mjs istKur) > .parca (--k sıra); 420 ms parça, toplam ~1,9 sn; hareket azaltmada yok. Katman kayması --ist-p × --kay.
  Metin uzunsa (EN) şehir --sehir-in kadar iner (site.mjs sehirYerlestir, SEHIR_TEPE noktaları).
- Bölüm sırası: Açılış · 01 Biz kimiz (+ koyu tarihçe bandı) · 02 Gündem · 03 Etkinlikler (koyu) · 04 Yazılar · 05 EUROAVIA (koyu) · 06 Sponsorluk · 07 Hesap · alt bilgi (koyu, gece şehri).
- Tarihçe: "uçuş şeritleri" (ATC strip), tutucu rengi --serit-r: fakülte gri, kulüp sarı, EUROAVIA #2d7c87; omurga --rota-t.
- Biniş kartı: petrol başlık, rota İTÜ ✈ yer, damga (petrol = yapıldı, gri = duyuruldu), koçan petrol-açık.
- Yazılar: AESTRO kapakları (petrol / siyah-sarı / kâğıt), kartpostallar (pul = istanbul.mjs simgeler(), <symbol id="pul-…"> sunum öznitelikleriyle; use gölge ağacında belge seçicileri eşleşmez).
- Yeni jetonlar: --kanat, --kuyruk (kabin üstten görünüşü), --ucak-b (beyaz uçak).
