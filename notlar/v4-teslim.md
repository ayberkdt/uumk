# UUMK v4 — teslim notu (11 Ekim 2026)

Kaynak istek: 9 maddelik /goal (kapak, İstanbul çizimi, Biz kimiz, sponsorluk, footer, kayıt/giriş, tarihçe, biniş kartları, dönem raporları/AESTRO).
v3 durumu git'te (`8966351`). Ekran kanıtları `.cekim-gecici/uumk/v4*/`.

| # | İstek | Yapılan | Kanıt |
|---|---|---|---|
| 1 | Kapak boş ve çirkin | Seyrüsefer ızgarası kalktı. Sahnenin alt yarısında tam genişlik İstanbul panoraması; gökte üç küçük kâğıt uçak kesikli izleriyle (uçuş tuvalinde); büyük kâğıt uçak ve ad hâlleri aynı. Kaydırdıkça katmanlar farklı hızda kayar. İngilizce üç satırlık başlıkta yapılar metne binmesin diye şehir ölçülüp gerektiği kadar aşağı iner; kısa telefonda (≤700 px yükseklik) olgu satırı gizlenir | e2e "açılış İstanbul'u" (198 parça, gökte uçak pikseli), "hikâye" (panorama kayması ‰ 0→500→1000), "taşma yok"; ekran v4b, v4c, v4e |
| 2 | Detaylı İstanbul, dalga, Kız Kulesi, kâğıt uçak; blok blok preset, görsel üretme yok | `sahne/istanbul.mjs`: elle yazılmış yapı taşları (ev + cumba, minare + şerefe, kubbe, kemer dizisi) ve bunlardan kurulan bloklar — Süleymaniye, Yeni Cami, Galata Kulesi, uzakta Boğaz Köprüsü (gece tabliye ışıkları), suyun içinde Kız Kulesi (kaya, fener, bayrak), Üsküdar, selviler, vapur, martılar, bulutlar, dört sıra dalga. Deterministik rastgelelik (tohum 2001). `araclar/istanbul-insa.mjs` SVG'yi index.html'e yazar; dogrula birebir aynılığı sınar. Açılışta blok blok "inşa": her blok parça parça (gövde → kubbe → minare) yükselir. Alt bilgide aynı preset gece renkleriyle | dogrula "panorama … birebir aynı"; e2e kademe 0→5→71→146→194/198 (0/300/700/1100/1600 ms) |
| 3 | Biz kimiz çok detaylı | Yeni 01 "Biz kimiz": giriş metni, 6 satır künye, 8 faaliyet kartı (teknik geziler, seminer ve paneller, Masabaşı/A'dan Z'ye, model uçak, yazılım eğitimleri, AESTRO, EUROAVIA, kulüp hayatı), uçak gövdesi biçiminde "kabin ekipleri" (kokpit = yönetim kurulu + 5 ekip; kanat ve kuyruk), Güz/Bahar "bir yılımız" çizelgesi. Olgular `notlar/dogrulanmis-olgular.md` "v4 eki"nde kaynaklarıyla | dogrula bağlantı/olgu sınamaları |
| 4 | Sponsor olun + doğrudan e-posta düğmesi | 06 "Sponsorluk": 4 iş birliği biçimi, her birinde doğrulanmış geçmiş örnek (Pegasus/TUSAŞ/Turkish Technic, IGA Academy, Dasal Havacılık); koyu kartta adres, "E-posta yaz" (konu ve gövde şablonu dile göre hazır) ve "Adresi kopyala" | e2e "sponsorluk" (mailto adresi, konu TR/EN, kopyala bildirimi) |
| 6 | Footer akılda kalıcı | Gece İstanbul'u (aynı preset; görününce kurulur, pencereler sırayla yanar, köprü ışıkları, ay), büyük beyaz UUMK logosu, sarı "Sponsorluk" ve "Üye alım formu", canlı İstanbul saati, "4 Ocak 2001'den beri · Ayazağa" | e2e "footer" (pencere rgb(15,15,15) → rgb(242,194,0)) |
| 7 | Kayıt/giriş sıkıcı | "Check-in" şeritli panel, hap biçimli sekme, ikonlu alanlar (50 px), parola göster/gizle, tam genişlik birincil düğme; kulüp kartının altında İstanbul bandı (pullar), adımlar numaralı rota | e2e "parola göster/gizle", hesap senaryoları; ekran v4p |
| 8 | Tarihçe banal | Koyu bantta "uçuş şeritleri" (hava trafik kontrolü şeritleri): ortada kaydırdıkça sarıyla dolan omurga ve ucunda uçak, iki yanda 11 kayıt (1941 → 2026; fakülte / kulüp / EUROAVIA renkli tutucular), sonda kesikli "Sıradaki kayıt: Üye alım formu". Telefonda tek sütun, omurga solda | e2e "kuruluş ve tarihçe" (0 → 11/11), "telefonda tarihçe" |
| 9 | Biniş kartları; EN'de "Bahar" | Neden: kart tarihi `data-tarih`'ten geliyordu, hiçbir makalede `data-tarih-en` yoktu. Her makaleye İngilizce tarih + tür + (varsa) fotoğraf eklendi. Kart: petrol başlık (logo, "Biniş kartı · tür"), büyük rota İTÜ ✈ yer, uçuş kodu, fotoğraf, "YAPILDI/HELD" damgası (basılma canlandırması), koçanda tarih/varış/barkod | dogrula: her makalede İngilizce tarih, İngilizce tarihte Türkçe sözcük yok; e2e "biniş kartı" ("Spring 2026", "Technical trip", "Held") |
| 10 | Dönem raporları ve AESTRO görsel olsun | AESTRO rafı: üç tasarlanmış kapak (Sayı 1 yörünge, Sayı 2 kâğıt uçak, Sayı 3 doğrulanmış konu başlıklarıyla), raf çizgisi, üzerine gelince kalkar. Dönem raporları kartpostal: solda İstanbul pulu (Kız Kulesi, Galata, köprü, cami, vapur, evler), sağ üstte damga tarihi | dogrula: kartpostal = yazilar.json (raf dışı), raf bağlantıları; ekran v4g |

Bu turda bulunan ve düzeltilen hatalar:
- İnşa canlandırması ilk hâliyle hiç oynamıyordu: gizleme kuralı animasyon kuralından daha özgüldü (parçalar 2,1 sn opak 0 kalıp birden beliriyordu) ve gecikme `ms × ms` ile geçersizdi. e2e yalnız başı/sonu ölçtüğü için yakalamamıştı → senaryoya zaman çizelgesini elle ilerleten kademe ölçümü eklendi.
- Telefon kadrajı: genel `svg { max-width: 100% }` %180 genişliği kırpıyordu.
- Döndürülmüş kartpostallar 320 px'te 1 px yatay taşma yapıyordu.
- Alt bilgideki sarı düğmede `.alt a` rengi eziyordu (axe 1,49:1).
- `String.replace` ikinci argümanında `$$` → `$` (iki kez); betik yamalarında artık işlev biçimi kullanılıyor.
- Doğrulanmamış "XFLR5" siteden çıkarıldı (kaynakta görülmemişti; v3'te vardı); dogrula artık sınar.

Kaynak notu — sponsorluk adresi: ayrı bir sponsorluk e-postası kaynaklarda bulunamadı (Wayback 11 Ekim'de kapalıydı). Düğme doğrulanmış `istanbul@euroavia.eu` adresine "Sponsorluk — İTÜ UUMK" konulu e-posta açar; kulübün ayrı bir adresi varsa `index.html` `#sponsor-adres`, `#sponsor-yaz` ve alt bilgi değiştirilir.

Bütçeler (dogrula 13): açılış JS 64 → 72 kB (67,6), CSS gzip 10 → 15 kB (13,7), yeni: index.html gzip ≤ 32 kB (28,1; panorama 10,2 + pullar 2,0 gzip). Gece şehri HTML'e ikinci kez yazılmaz, alt bilgi yaklaşınca gündüz çiziminden klonlanır (JS'siz ziyaretçi alt bilgide şehri görmez).

Son denetim: dogrula 1152/1152 · sunucu-sina 61/61 · uçtan uca 29/29 · axe 0 ihlal (7 görünüm) · UX yasa denetimi 0 HATA, 3 gerekçeli UYARI (`notlar/ux-denetim.md`).
