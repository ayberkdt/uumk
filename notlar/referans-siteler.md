# Referans siteler — Desilla ve Antra Tech'ten devralınanlar

Kaynak: 2026-10-10 bu oturumda `D:\Masaustu\WebSite\antratech` ve `..\desilla` kod incelemesi (Explore ajanı + elle okuma:
`antratech/sahne/gpu.mjs`, `antratech/sahne/uc-ortak.mjs`, `antratech/index.html` baş, `antratech/site.mjs` 1–80).

## Ortak ilkeler (UUMK'ye taşınacak)

| İlke | Antra/Desilla'daki karşılığı | UUMK'de |
|---|---|---|
| Bağımlılıksız, derlemesiz ES modülleri | README:3 her ikisinde | aynı |
| three r184 gömülü (`vendor/three-r184/`) | Antra: tek kapı `sahne/uc-ortak.mjs`; Desilla: importmap | importmap + `vendor/three-r184` (sunumatik sahneleri `three` adıyla içe aktarıyor) |
| Tembel yükleme | `gozle(el,{yakin,ilk,gorunur})` IO + rootMargin; ekran dışında/sekme gizliyken dur | aynı |
| Yazılımsal GPU tespiti | `gpu.mjs` → swiftshader/llvmpipe ise three hiç inmez, 2B yedek; `?webgl=1` zorlar | aynı |
| Azaltılmış hareket | `?az=1` + prefers-reduced-motion → `html.az`, sahneler son kareyi bir kez çizer | aynı |
| TR tek kaynak index.html | `data-i18n`, `dil/xx.mjs` tembel | TR + EN (EUROAVIA uluslararası) |
| Kaydırmaya bağlı yapışkan sahne | Antra süreç `.surec__iz` 420vh, τ=120 ms üstel yumuşatma; Desilla `?p=` ile deterministik kare | irtifa/uçuş sahnesi |
| Üst şerit | dolu zemin y>24, ilerleme çubuğu + iğne, 640 px sonra aşağı kaydırınca gizlenir, etkin bölüm IO `-45% 0px -50%` | ilerleme = irtifa göstergesi |
| Dialog desenleri | `<dialog>.showModal()`, `#hizmet-<id>` derin bağlantı, ←/→, arka plana tıklama kapatır | etkinlik kartı penceresi |
| Form | mailto, JS'siz `action="mailto:" enctype=text/plain`, "Mesajı kopyala" yedeği | aynı |
| CSS jetonları | `--t-1…7` punto, `--b-1…7` boşluk (8'lik), `--r-*`, `--g-1/2`, hover yalnız `@media (hover:hover)`, print, forced-colors, `html:not(.js)` | aynı düzen |
| CSP | vercel.json, satır içi betik sha256 | aynı |
| Bütçe | açılış JS ≤ 72 kB, CSS gzip ≤ 20 kB, dogrula.mjs sınar | aynı |

## Doğrulama araçları (Antra `araclar/`)
- `cekim.mjs <url> <klasör> [g] [y] [adımlar]` — başsız Chrome + CDP; `#bolum`, `y=`, `p=<ad>:0.5`, `fare=`, `tik=`, `js=`, `bekle=`; `CEKIM_GPU=1` gerçek GPU. En taşınabilir araç.
- `dogrula.mjs` — Node, tarayıcısız: i18n, tekil id, img boyut/alt, başlık sırası, CSP hash, bütçeler.
- `uctan-uca.mjs` — CDP senaryoları (altyapı fonksiyonları 24–77 genel, senaryolar siteye özgü).
- `erisilebilirlik.mjs` — axe-core (yerel kopya: `D:/Masaustu/WebSite/hesap-defteri/node_modules/axe-core/axe.min.js`).
- Siteye özgü sabitler: port 4180, `--user-data-dir` yolu, seçiciler.

## Özgün davranış kalıpları (kopyalanmaz, yöntemi alınır)
- Kahraman = sektörün kendi malzemesi (Antra: dokuma tezgâhı gölgelendiricisi, imleç ışık kaynağı; Desilla: başlık tortillaya basılıp rulo).
  → UUMK: konu havacılık/uzay; malzeme = hava (akım çizgileri, atmosfer katmanları), kanat, yörünge.
- Her sayı bir modelden (Antra harita mesafeleri haversine ile doğrulanır). → ISA atmosfer modeli, gerçek koordinatlar.
- Etkileşim ancak bir iddiayı kanıtlıyorsa (Antra 3. tur dersi: amaçsız oyun, yörünge gibi süs halkaları, tekrar eden olgular reddedildi).
- Her olgu bir kez söylenir.

## Bilinen tuzaklar (Antra hafıza notundan, doğrulanmamış genelleme değil — o projede ölçülmüş)
- PMREM ortam haritası gerçek GPU'da ~2 s derleme → kullanma.
- `compileAsync` yalnız KHR_parallel_shader_compile varsa.
- Browser bölmesi arkadayken boyamıyor → görsel denetim cekim.mjs ile.
- scrollIntoView testlerde `behavior:'instant'`.
- Bash heredoc'ta Türkçe kesme işareti kırılıyor → dosyaları Write ile yaz.
