# Sunumatik — UUMK sitesinde kullanılacaklar

Kaynak: 2026-10-10 bu oturumda `C:\Users\ayber\Desktop\Custom Yetenekler\sunumatik` incelemesi (README, KATALOG.md, Explore ajanı raporu).
Depo kullanıcının kendi deposu (github.com/ayberkdt/sunumatik); README lisans: "© Ayberk — tüm hakları saklıdır".

## Yapısal gerçekler
- three r184 tek kopya: `presets/moon_advanced/vendor/three.module.min.js` (+ `three.core.min.js`). Preset'ler çıplak `'three'` içe aktarır → importmap gerekir.
- Bütün preset'ler göreli içe aktarım kullanır (`../core/…`). Tek klasör taşınırsa kırılır → gereken dosyaları KARDEŞ DÜZENİ KORUYARAK `UUMK/lib/` altına kopyala.
- aero_* preset'lerinin mount fonksiyonu YOK (mantık index.html'de). Ama ÇÖZÜCÜLER SAF ve bağımlılıksız:
  - `aero_airfoil_flow/airfoil-solver.mjs`: `nacaNodes(code,nHalf)`, `solveAirfoil(nodes, alphaDeg,{kutta})`, `velocityAt`, `velocityGrid`, `boundaryLayer(sol,Re)`, `prandtlGlauert`, `criticalMach`, `thinAirfoil` (lineer vorteks panel yöntemi + Kutta + Thwaites/Head).
  - `aero_shock_waves/shock-solver.mjs`: `normalShock`, `obliqueShock`, `prandtlMeyer`, `isa(h)`, `machAngle`… (γ=1,4).
  - `aero_vortex_street/lbm-solver.mjs`: D2Q9 LBM, `createLBM`, `maskeProfil` (+ worker).
- `aircraft_blocks/aircraft-blocks.mjs`: saf three kurucuları (+X ileri, +Z yukarı, ~1×scale): `buildAirliner`, `buildFighter`, `buildDelta`, `buildGlider`, `buildFlyingWing`, `buildTurbofan({cutaway})`… NACA kesitten loft; `root.userData.metrics` (S, b, AR, MAC). Bağımlılık: `core/geometry-axis.mjs`.
- `core/astro-atmosphere.mjs` (US76 saf), `core/astro-orbit.mjs` (Kepler+J2 saf), `core/tr-bicim.mjs`.
- `boarding_pass`: `renderBoardingPass(data)` → HTML; Code128 SVG. 1920×1080 slayt için tasarlanmış — site düzeninde CSS uyarlaması gerekir (sınanmadı).
- `cosmos_advanced` Samanyolu dokusu 1,7 MB, kredi "ESO/S. Brunier" zorunlu. `earth_advanced` dokular ~900 KB.
- Paletler: `color_themes/palette-library.css` 61 palet; koyu adaylar `prussian-amber` (#0E1B26/#EAF1F5/#E8A33D), `midnight-tangerine` (#1E223D/#F54F1F), `ionosphere`.
- Yazı tipleri (OFL, yerel woff2): `color_themes/typefaces/` — Archivo, Big Shoulders Display, Fraunces, Space Grotesk, Source Sans 3, Source Serif 4, JetBrains Mono.

## Beceri kuralları (skills/) — sitede uygulanacak
- write-turkish-slide-copy: cümle düzeni büyük harf; somut iddialı başlık; "gerçekleştirilmiştir, sağlanmaktadır, söz konusu, kapsamında, bulunmaktadır" YASAK; etken çatı; çıplak isim yığını yok; kısaltma ilk geçişte açılır; ondalık virgül, SI.
- select-presets-for-topic: ≤ 3 canlı WebGL sahnesi, aynı anda 1 aktif; sahne başına tek anlatı hareketi; truth level aşılmaz.
- design-scientific-motion: truth level beyanı (illustrative/analytic/numerical/data-driven); süs autoplay bir döngüden sonra durur; reduced-motion'da açıklayıcı statik hâl; glass/bloom/neon/sürekli yıldız akışı/amaçsız kamera YOK; sayılar modelden.
- create-scientific-visuals: birim ve taban çizgisi korunur; data-1 gözlem, data-2 model, accent eşik; renk körü dostu.
- design-space-science-deck: kontrast ≥ 4,5:1; 8/16/24/40/64 boşluk; mat düzlemler, editoryal ızgara, büyük tipografi, ince çizgiler; mor-mavi AI degradesi yasak.
- apply-design-tactics: önce beyan — 3 hizalama ekseni, 6–8 basamak punto, 2 gölge, 2 yarıçap, sahne başına tek hareket.
