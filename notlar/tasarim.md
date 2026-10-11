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

### ceviri.mjs — satır yorumları (v8, 11 Ekim 2026; açılış JS bütçesi için kaynaktan taşındı, sırayla)
- * JS'in kullandığı Türkçe metinler (İngilizceleri dil/en.mjs → JS)  — `export const JS_TR = {`
- sunucu hata kodları  — `'h-ad-gerekli': 'Adını yaz.', 'h-soyad-gerekli': 'Soyadını yaz.', 'h-e`
- * Baş betiğiyle aynı karar (araclar/dogrula.mjs eşitliği sınar)  — `export function dilSec() {`
- İngilizce metinler sitenin kendi statik dosyasından (dil/en.mjs) gelir; dışarıdan girdi değildir.  — `function anlik() {`
- gizli pencere  — `let k = null; try { k = localStorage.getItem(ANAHTAR); } catch { /* gi`
- Türkçe asıl metin, hiçbir animasyon DOM'a dokunmadan kaydedilir  — `anlik();   /* Türkçe asıl metin, hiçbir animasyon DOM'a dokunmadan kay`
- yok  — `if (kaydet) { try { localStorage.setItem(ANAHTAR, yeni); } catch { /* `

### sahne/pano.mjs — satır yorumları (v8, 11 Ekim 2026; açılış JS bütçesi için kaynaktan taşındı, sırayla)
- her hücre: satır sırasına göre gecikme, her karakter kendi süresinde yerine oturur  — `const plan = hucreler.map((h, i) => {`
- biniş kartı  — `const metinler = new Map([...document.querySelectorAll('.bilet-metinle`
- fotoğrafı olan etkinlik: galerideki görsel (dile göre alt metniyle)  — `const kaynakFoto = m.dataset.foto && document.querySelector(`#fotolar `
- derin bağlantıyla açıldıysa: kart kapanınca pano görünsün (gündem sonradan yüklenip konumu kaydırmış olabilir)  — `if (derinden) { derinden = false; document.getElementById('etkinlikler`
- derin bağlantı  — `const h = location.hash.match(/^#etkinlik-([a-z0-9]+)$/);`
- o anki dilde  — `asil = hucreler.map((h) => h.textContent);      /* o anki dilde */`
- dil değişti: çeviri hücreleri yazdı, animasyon durur  — `if (benim !== nesil) return;   /* dil değişti: çeviri hücreleri yazdı,`
- arka plana tıklama  — `pencere.addEventListener('click', (e) => { if (e.target === pencere) k`

### sahne/hesap.mjs — satır yorumları (v8, 11 Ekim 2026; açılış JS bütçesi için kaynaktan taşındı, sırayla)
- ── alan hataları ──  — `function hatalariGoster(form, veri) {`
- ── panel ──  — `function paneliCiz() {`
- düzenle görünümüne her girişte alanlar hesabın güncel bilgisiyle dolar  — `if (gorunum === 'duzenle' && sonGorunum !== 'duzenle') { const f = $('`
- #bildir-form bağlantısı (alt bilgi) bildirim formunu açar; oturum yoksa giriş görünür  — `const adresBak = () => { if (location.hash === '#bildir-form') { panel`
- ── etkinlik kartları ──  — `function kartCiz(e) {`
- gün/ay kutuda; satırda yalnız ekran okuyucuya  — `const p = tarihBicim().formatToParts(yerelTarih(e.baslangic)), k = (t)`
- doluluk çubuğu  — `if (e.kontenjan) {`
- .ics: İstanbul → UTC; bitiş yoksa 2 saat  — `function icsIndir(e, d) {`
- RFC 5545 satır katlama (75 sekizli)  — `const katla = (l) => { let o = '', n = 0; for (const c of l) { const b`
- boş gündem: bekleme turundaki uçak (index.html #bos-sablon; hareket azaltmada durur)  — `function bos(baslik, aciklama) {`
- ilk 4 kart; kalanı tek düğmeyle açılır (Hick)  — `kartlar.forEach((k, i) => { if (i >= ILK && !tumu) k.hidden = true; })`
- açık misafir formu varsa kartları yeniden kurma (girilen bilgiler silinmesin)  — `addEventListener('dil-degisti', () => { if (!liste.querySelector('form`
- geç gelen "oturum yok" yeni girişi ezmesin  — `try { await hazir; r = await api(yol, { yontem: 'POST', govde: formVer`
- hesaplı/misafir notu yalnız kayıt açıkken anlamlı  — `const not = document.querySelector('.gundem__not'); if (not) not.hidde`
- oturum yoksa kullanici: null  — `async function benYukle() { const r = await api('/api/hesap/ben'); kul`

### site.css — bölüm yorumları (v8, 11 Ekim 2026; CSS gzip bütçesi için kaynaktan taşındı, sırayla)
- yazı tipleri (OFL, yerel, değişken): Jost — başlık ve vurgu (Futura soyu); IBM Plex Sans — gövde  — `@font-face { font-family: 'Jost'; src: url('yazitipleri/jost/jost-lati`
- manşet: Jost (geometrik, Futura soyu); gövde IBM Plex Sans  — `h1, h2 { font-family: var(--f-baslik); font-weight: 600; letter-spacin`
- bizim kıyı: açılıştaki denizin devamı, rıhtımda biter; vapur kaydırmayla karşıya geçer  — `.kiyi-kap { overflow: hidden; margin-top: -1px; }`
- İstanbul panoraması (sahne/istanbul.mjs): renkler katman sınıflarıyla, gündüz / gece  — `.ist { --i-g: #f8f8f6; --i-c: #141414; --i-r: #056b7a; --i-k: #dfeaeb;`
- gece pencereleri: sıcak sarı, farklı parlaklık; bazıları soğuk beyaz (ekran ışığı); hafif hale (dış çizgi)  — `.ist--gece .p:is(.y1, .y2, .y3), .ist--gece .fener { fill: var(--gece-`
- v5: tarama gölgesi, pus, sırt çizgisi, yansımalar, gök  — `.ist .gy { fill: url(#tarama-gun); stroke: var(--i-c); stroke-width: 0`
- inşa: her blok parça parça yükselir (--s blok sırası, --k blok içi sıra; site.mjs)  — `@keyframes parca-kur { from { opacity: 0; transform: translateY(18px) `
- ad kendiliğinden döner: etkin hâlin harfleri sırayla alttan girer, çıkan hâlinkiler üstten çıkar  — `html.js:not(.az) .ad__durum.bolundu .harf { opacity: 0; transform: tra`
- boş gündem: bekleme turu çizimi + açıklama + Instagram  — `.bos { display: grid; grid-template-columns: minmax(0, 15rem) minmax(0`
- tarihçe ayrıntısı: şeridin büyümüş hâli  — `.ayrinti { max-width: min(60rem, calc(100% - 2rem)); }`
- fotoğraflar: ızgara; kareye basınca ekran boyu büyür  — `.ayrinti__galeri { padding: var(--b-4) var(--b-3) 0; }`
- ── 01 biz kimiz: künye, faaliyetler, kabin, yıl, tarihçe ──  — `.bolum--biz { padding-bottom: 0; }`
- kanat ve kuyruk: üstten görünüş  — ``
- kabin ekipleri: 2,5B kesit maket (sahne/maket3b.mjs; GPU yoksa aynı maketin poster görüntüsü) + numaralı liste; tek ekrana sığar  — `.maket { margin-top: var(--b-4); display: grid; grid-template-columns:`
- şerit rafı: ortada omurga (kesikli iz, kaydırdıkça dolan sarı, ucunda uçak); şeritler iki yanda  — `.seritler { position: relative; margin-top: var(--b-5); display: grid;`
- başlık bağlantısı şeridi kaplar  — `.serit__ac { color: inherit; text-decoration: none; }`
- şeritten omurgaya bağ ve düğüm  — `.serit::before { content: ''; position: absolute; top: 1.6rem; width: `
- ── 04 yazılar: AESTRO rafı, kartpostallar ──  — `.raf { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, `
- kartpostal: ön yüzde rapora özel sahne, arkada pul + dalgalı damga + adres; hava postası çerçevesi  — `.dergi a { position: relative; display: grid; gap: var(--b-1); color: `
- ── 06 sponsorluk ──  — `.sponsor { display: grid; grid-template-columns: minmax(0, 7fr) minmax`
- rakam şeridi: doğrulanmış dört sayı  — `.rakamlar { grid-column: 1 / -1; margin-bottom: var(--b-4); display: g`
- ── 07 hesap: kulüp kartı + check-in paneli ──  — `.kart { position: relative; display: grid; grid-template-rows: auto au`
- rota kendi satırında: kesik çizgi kart boyunca, uçak üzerinde; ada ve yazılara binmez  — `.kart__rota { position: relative; height: 18px; margin: 0 calc(-1 * va`
- ── biniş kartı ──  — `.bilet__kart { position: relative; display: grid; grid-template-column`
- ── alt bilgi: gece İstanbul'u, büyük logo ──  — `.alt { position: relative; background: var(--lacivert); color: var(--g`
- marka: iki logo eşit ağırlıkta, arada ince çizgi; altında öğrenci ve şirket için iki büyük kart  — `.alt__marka { display: flex; flex-wrap: wrap; align-items: center; jus`
- gece: ışıklar inşadan sonra sırayla yanar  — `.ist--gece .p { transition: fill var(--sure) ease; }`
- kısa yatay ekran (telefon yatay): açılış akışta — metin üstte, şehir altında tam görünür  — `@media (max-height: 520px) and (orientation: landscape) {`

### site.mjs — satır yorumları (v8, 11 Ekim 2026; açılış JS bütçesi için kaynaktan taşındı, sırayla)
- ── üst şerit ──  — `const ust = $('#ust'), kok = document.documentElement, kiyi = $('#kiyi`
- ── açılış: ad, silüet, uçuş — kaydırmaya bağlı değil: ad kendiliğinden sırayla değişir, uçak yörüngesini zamanla uçar ──  — `const SABIT_P = prm.has('p') ? sinir(Number(prm.get('p'))) : null;   /`
- hâller: İTÜ Uçak Uzay Mühendisliği Kulübü (8 sn) → AS Istanbul / EUROAVIA (5,5 sn) → İTÜ UUMK (5,5 sn) → başa; harfler alttan girer, eskisi üstten çıkar  — `let adNo = 0, adZaman = 0, girisGorunur = true;`
- İstanbul panoraması: blok blok inşa (site.css .ist--kur); --s blok gecikmesi, --k blok içi sıra  — `function istKur(svg, { sure = 1100, sonra } = {}) {`
- panorama kutuya sığar: görüş kutusu (viewBox) kutunun oranına göre sahnenin -400…2000 aralığında açılır, kesilmez. Açılışta şehir yüksekliği, metin sütununun altına düşen yapıların tepesi metne binmeyecek kadar seçilir.  — `const SAHNE_SOL = -400, SAHNE_SAG = 2000;`
- ── bölümler arası ufuk: kavis kaydırdıkça düzleşir ──  — `const ufuklar = $$('.ufuk').map((el) => ({ yol: el.querySelector('path`
- ── kabin ekipleri: 2,5B maket — three.js yalnız donanım GPU'sunda ve bölüme yaklaşınca iner; yoksa poster görüntüsü kalır ──  — `const maketEl = $('#maket');`
- ── tarihçe: şerit rafı; omurga kaydırdıkça dolar, uçak ucunda, geçilen şerit yerine oturur ──  — `const rota = $('#rota'), rotaNokta = $$('#rota .serit:not(.serit--sira`
- uçağın yanındaki yıl rozeti: geçilen son kaydın yılı  — `rotaYil.textContent = rotaNokta[Math.max(0, son)].querySelector('time'`
- şerite basınca kaydın ayrıntı sayfası; modül ilk dokunuşta yüklenir, #tarih-<kimlik> bağlantısı doğrudan açar  — `const ayrinti = () => import('./sahne/ayrinti.mjs');`
- ── gündem, hesap ve kulüp kartı ──  — `const duyuru = $('#duyuru');`
- ── kalkış panosu (+ İstanbul saati) ──  — `const pano = panoKur({ tablo: $('#pano'), pencere: $('#bilet'), az: AZ`
- ── yazılar: sunucu → veri/yazilar.json → sayfadaki liste ──  — `const yaziListe = $('#yazi-listesi');`
- bölünmez boşluklar  — `const bag = (s) => s.replace(/(\d) (?=\p{L})/gu, '$1 ').replace(/ (\d{`
- yazıya özel kartpostal sahnesi (sahne/kartpostal.mjs KART_ESLEME ile aynı; dogrula sınar); bilinmeyen yazıda pul çizimi  — `const KART = { 'as-istanbul-temmuz-2026': 'hangar', 'as-istanbul-mayis`
- AESTRO sayıları ve üçüncü sayının yazısı raftadır  — `yaziListe.replaceChildren(...yazilar.filter((y) => y.kaynak !== 'AESTR`
- bölüm görününce (site.css .gorundu)  — `const izIO = new IntersectionObserver((g) => { for (const x of g) if (`
- ── EUROAVIA haritası ──  — `let ag = null, agGorunur = false;   /* görünürlük harita yüklenmeden g`
- ── sponsorluk: e-posta konu satırı dile göre, adresi kopyala ──  — `const sponsorAdres = $('#sponsor-adres').textContent.trim(), sponsorYa`
- ── parola alanları: göster / gizle ──  — `for (const g of $$('#hesap-panel input[type="password"]')) {`
- ── alt bilgi: gece İstanbul'u görününce kurulur, ışıklar yanar; İstanbul saati ──  — `gozle($('.alt'), { yakin: '0px', ilk() {`
- yüklemeden sonra yumuşak kaydırma (site.css html.yumusak)  — `const yumusakAc = () => requestAnimationFrame(() => document.documentE`
- menü açıkken arka inert  — `$('#icerik').inert = acik;   /* menü açıkken arka inert */`
- sınama/çekim: uçağı sabit bir noktada çiz  — `const SABIT_P = prm.has('p') ? sinir(Number(prm.get('p'))) : null;   /`
- [x, tepe y] viewBox birimi  — `const SEHIR_TEPE = [[-242, 226], [-58, 226], [116, 206], [148, 190], [`
- çok geniş: üstten (gökten) kırpılır  — `if (vb > SAHNE_SAG - SAHNE_SOL) { vb = SAHNE_SAG - SAHNE_SOL; k = gen `
- akış düzeni: şehir metnin altında  — `const kisa = matchMedia('(max-height: 520px) and (orientation: landsca`
- sınama ve poster üretimi  — `maketEl.dataset.cizici = '3b'; if (prm.has('olc')) globalThis.__maket `
- önce oku, sonra yaz  — `const cizgi = innerHeight * 0.62, ust = rotaNokta.map((li) => li.getBo`
- doğrulanmışa adım yok  — `addEventListener('hesap-degisti', (e) => { kartKullanici = e.detail; $`
- sayfadaki liste kalır  — `try { yazilar = (await (await fetch('veri/yazilar.json')).json()).map(`
- görünürlük harita yüklenmeden gelebilir  — `let ag = null, agGorunur = false;   /* görünürlük harita yüklenmeden g`
- aynı preset, gece renkleri (site.css .ist--gece)  — `const gece = ist.cloneNode(true);   /* aynı preset, gece renkleri (sit`
- sınama kancası  — `if (prm.has('olc')) globalThis.__uumk = { ucus: () => ucus, adNo: () =`

### sahne/ucus.mjs — satır yorumları (v7, 11 Ekim 2026; açılış JS bütçesi için kaynaktan taşındı, sırayla)
- yerel eksenler: x sağ kanat, y yukarı, z burun. Kanat açıklığı 2.  — `const N = [0, 0.03, 1.15], C = [0, 0, -0.95];`
- kanat ucunda logodaki petrol bant  — `const ara = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1`
- anahtar kareler [p, x, y, z]  — `export const GENIS = [`
- adın hâlleri: [giriş, çıkış] pencereleri (p)  — `/* takla penceresi */`
- takla penceresi  — `export const TAKLA = [0.67, 0.87];`
- ardışık: yeni ad eskisi çıkınca girer  — `export const PENCERE = [[null, [0.27, 0.35]], [[0.35, 0.44], [0.61, 0.`
- * yörünge: nokta(q), eksen(q)  — `export function yorunge(anahtar) {`
- konum ve eksenler: teğet + (eğrilik + yerçekimi) → yatış ve takla  — `function eksen(q) {`
- takla penceresinde sırtüstü olabilir  — `const takla = q > TAKLA[0] && q < TAKLA[1];`
- açılıştan 1,5 sn sonra 30 kare aralığının ortancası > 30 ms ise (GPU yok) doku ve uçuş planı kapanır, tuval 1x olur. Açılış yükü sayılmaz: önceki ölçüm ilk kareleri sayıp GPU'lu makinede de hafif kipe geçiyordu.  — `let hafif = new URLSearchParams(location.search).has('hafif'), sonKare`
- imleç paralaksı (yalnız fare)  — `const fare = { x: 0, y: 0, hx: 0, hy: 0 };`
- dar ekranda yörünge açılış metninin altındaki banda sığar  — `const alt = dar && metinAlt ? metinAlt() : null;`
- ekran uzayında: derinlik düzeltmesi  — `anahtar = anahtar.map(([q, x, y, z]) => [q, x, y > -4 ? (dip + ((y - y`
- yörünge yalnız boyut değişince kurulur  — `let yrgOn = null, yrgAnahtar = null;`
- gölge tamponu: gölge çokgenleri çeyrek çözünürlükte, yalnız kendi kutusunda bulanıklaşır ve büyütülerek basılır. Tam tuvalde filter: blur yazılımsal çizimde kare başına ~480 ms tutuyordu.  — `const GK = 0.25, golgeT = document.createElement('canvas'), gg = golge`
- kesik çizgiler dünyaya bağlı: her parça deseni ekrandaki yay uzunluğundan sürdürür (yoksa her karede yeniden başlayıp kıpırdıyordu)  — `let yayAnahtar = null, yayIz = null, yayPlan = null;`
- kâğıt dokusu  — `const doku = (() => {`
- gökteki küçük kâğıt uçaklar: [hız, yükseklik payı, genlik, faz, ölçek]  — `const SURU = [[0.045, 0.18, 0.05, 0.0, 1.25], [0.032, 0.33, 0.04, 2.1,`
- iz  — `g.setLineDash([3, 5]); g.lineWidth = 1; g.strokeStyle = 'rgba(5, 107, `
- boşta süzülme: hafif inip kalkma ve yalpa  — `fare.x += (fare.hx - fare.x) * 0.06; fare.y += (fare.hy - fare.y) * 0.`
- ilk açılış: sağ üstten süzülür  — `let gir = [0, 0, 0];`
- uçuş planı: önümüzdeki yol, soluk  — `yaylar();`
- uçuş izi  — `const bas = Math.max(0, p - 0.16), adim = 40;`
- gölge  — `const golge = YUZLER.slice(0, 4).map((y) => y.k.map((l) => { const w =`
- yüzler: arkadan öne  — `const kamera = [0, 0, D];`
- kat çizgileri: ince petrol  — `g.strokeStyle = 'rgba(5, 107, 122, 0.55)'; g.lineWidth = 0.9;`
- sınama: p'deki uçağın ekran konumu ve yatışı  — `olc(q = p) { const e = eksen(q); const [x, y] = izdus(e.o); return { x`
- kanat uçları (dihedral)  — `const SD = [-1.0, 0.17, -0.95], SA = [1.0, 0.17, -0.95];`
- kanattaki kat çizgisi  — `const SK = [-0.42, 0.035, -0.95], SKa = [0.42, 0.035, -0.95];`
- omurga  — `const OS = [-0.03, -0.34, -0.95], OA = [0.03, -0.34, -0.95];`
- yatay telefon: açılış akışta, uçak metnin altındaki bantta  — `const KISA = globalThis.matchMedia?.('(max-height: 520px) and (orienta`
- metin ekranı dolduruyorsa uçak metnin üstüne binmez, çizilmez  — `yer = alt === null || yuk - alt > 40;`
- bant çok darsa uçak küçülür  — `if ((yuk / 2 - alt) / S + 4 < 2.2) olcek *= 0.6;`
- kenarda belirir / söner  — `const sol = Math.min(1, u * 8, (1 - u) * 8);`
- yavaş çizimde yok  — `for (let i = 0, onceki = null; !hafif && i <= 36; i++) {`
- başta kısa iz kıvrılmasın, çıkışta söner  — `g.strokeStyle = `rgba(5, 107, 122, ${(0.75 * (i / adim) ** 1.6 * (1 - `
- metin yüksekliği yazı tipi ve dille değişir  — `document.fonts?.ready.then(() => { boyutla(); ciz(); });`
- durup dönen döngünün aradaki boşluğu ölçülmez  — `gorunur = x.isIntersecting; sonKare = 0;`

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
