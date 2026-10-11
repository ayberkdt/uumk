# UUMK v7 — teslim notu (11 Ekim 2026, ~14:50)

Kaynak istek (/goal): kulüp kartında "Burayı düzelt" (ekran görüntüsü); kartpostallar "çok basic"; açılıştaki uçaklar smooth değil,
optimize et; EUROAVIA tarafında oklar yerine mini uçaklar. v6 git'te `48de164`.

| İstek | Neden / yapılan | Kanıt |
|---|---|---|
| Kulüp kartı | Kesik rota çizgisi ve uçak kartın üstüne mutlak konumla, −4° eğik çiziliyordu; çizgi "Ad Soyad"ın içinden geçiyor, uçak "EUROAVIA" yazısına biniyordu. Rota artık kendi satırında (`.kart__rota`: kart boyunca kesik çizgi, üstünde uçak); alttaki şerit dengeli: cami · Galata · köprü · Kız Kulesi | çekim `kart/01`, `kartm/01` (390 px) |
| Kartpostallar | Altı sahne yeniden çizildi (`sahne/kartpostal.mjs`): ince iki kademeli çizgi, elle kırpılmış 45° taramalar, bulutlar, kayık baskı güneş, küçük insanlar, sol üstte bagaj etiketi (AS IST · EUROAVIA). Ayrıntılar raporlardan: oluklu hangar + "HANGAR" levhası + önden jet + tişört standı; sütunlu müze + vitrinde çift kanatlı + fırlatılan planör + zarlar ve piyon; kabin perspektifi + oksijen maskeleri + EXIT + emniyet kemeri işareti; gün batımında mangal + şiş + oy sandığına giren pusula; çatı kafesli hangar + geniş gövde + motor iskelesi + rehberli öğrenci grubu; gece Boğaz + köprü ışıkları + havai fişek + "65" flamalı vapur | e2e "yazılar" (6 sahne, eksik sembol 0); çekim `kp1`, `kp2`, `kpm` |
| Açılış uçakları akıcı değil | Ölçüldü (CEKIM_GPU=1, 1440×900). (1) Uyarlanabilir kalite, ilk 10 kare aralığına bakıyordu; sayfa yükü yüzünden GPU'lu makinede de "hafif" kipe geçiyor, tuval 1x çözünürlüğe düşüyor, gölge ve doku kapanıyordu → artık açılıştan 1,5 sn sonra 30 kare aralığının ortancası > 30 ms ise. (2) Gölge tam tuvalde `filter: blur(9px)` ile çiziliyordu (yazılımsal çizimde kare başına ~480 ms) → çeyrek çözünürlüklü küçük tamponda bulanıklaşıp büyütülerek basılıyor. (3) İz ve uçuş planının kesik çizgileri her karede her parçada desene baştan başlıyor, kıpırdıyordu → desen ekrandaki yay uzunluğuna bağlı (`lineDashOffset`, boyut değişince kurulan 600 noktalı tablo) | GPU: kare ortancası 6,9 ms, hafif kip kapalı (önce: hafif kip açık); yazılımsal: 483 → ~100 ms ve hafif kip artık devreye giriyor |
| Oklar yerine mini uçaklar | Haritadaki süzülen uçaklar, seçilen rotanın ucundaki uçak ve çerçeve dışı grubu gösteren ok üçgendi → üstten görünen mini uçak silüeti (gövde, ok açılı kanatlar, yatay kuyruk; zemin rengi kenarla rotadan ayrılır). Lagos işareti o yöne uçan mini uçak | e2e "harita"; çekim `harita7` |

Bütçe: açılış JS 74,1 kB'a çıktı → `sahne/ucus.mjs`'in 38 satır yorumu bağlamlarıyla `notlar/tasarim.md` "Modül notları"na taşındı → 71,9/72 kB. CSS gzip 16,98/17 kB.
Ölçüm tuzağı: başsız yazılımsal ortamda kare süresi tuvalin çiziminden değil, sayfa her değiştiğinde compositor'ın tam kare çizmesinden geliyor
(tuval gizlenince 90 → 7 ms; `willReadFrequently` ve tuval boyutu fark etmiyor). `ciz()` süresi bunu görmez → hafif kip kararı kare aralığından.
Son denetim: dogrula 1326 · uçtan uca 35/35 · axe 0 (1440 TR/EN, 390) · UX 0 HATA, 4 gerekçeli UYARI (değişmedi).
