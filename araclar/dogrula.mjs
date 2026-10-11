#!/usr/bin/env node
/* DOĞRULA — UUMK sitesinin tarayıcısız denetimi (v2). Çıkış kodu 1 = düşen var.
 *   node araclar/dogrula.mjs
 * Bölümler: EUROAVIA verisi ↔ kaynak tablo · HTML sayıları ↔ hesap · pano ↔ kart metinleri · yazılar ↔ veri/yazilar.json ·
 * bağlantı disiplini (her dış bağlantı notlar/dogrulanmis-olgular.md'de) · açılış uçuşu · iki dil · renk ve kontrast · CSP ·
 * statik erişilebilirlik · metin kuralları (pazarlama dili yasak) · küre maskesi · bütçeler. Sunucu: araclar/sunucu-sina.mjs. */
import { readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const KOK = join(dirname(fileURLToPath(import.meta.url)), '..');
const oku = (p) => readFileSync(join(KOK, p), 'utf8');
const ice = (p) => import(pathToFileURL(join(KOK, p)).href);
let gecen = 0, dusen = 0;
function sina(ad, kosul, ayrinti = '') { if (kosul) gecen++; else { dusen++; console.log(`  ✗ ${ad}${ayrinti ? ' — ' + ayrinti : ''}`); } }
const bolum = (ad) => console.log(`\n${ad}`);
const html = oku('index.html');
const notlar = oku('notlar/dogrulanmis-olgular.md');
const css = oku('site.css');
const metinSaf = (s) => s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const km = new Intl.NumberFormat('tr-TR');

/* ── 1. EUROAVIA verisi ── */
bolum('1. EUROAVIA verisi');
const ag = await ice('veri/ag.mjs');
const tsv = oku('notlar/euroavia-ag.tsv').trim().split('\n').slice(1).map((l) => l.split('\t'));
sina('grup sayısı TSV ile aynı', ag.GRUPLAR.length === tsv.length);
for (const [kod, tur, ad, ulke, en, boy] of tsv) {
  const g = ag.grup(kod);
  sina(`${kod} veride`, !!g && g[1] === tur && g[2] === ad && g[4] === ulke && Math.abs(g[6] - +en) < 1e-3 && Math.abs(g[7] - +boy) < 1e-3);
}
sina('takvim tarih sırasında', ag.TAKVIM.every((t, i) => i === 0 || ag.TAKVIM[i - 1][0] <= t[0]));
sina('takvim satırları 8 alanlı (TR ve EN yer adı)', ag.TAKVIM.every((t) => t.length === 8 && t[7]));
sina('takvim: grup şehrindeki etkinlik grubun ≤ 60 km yakınında', ag.TAKVIM.filter((t) => t[6]).every((t) => { const g = ag.grup(t[6]); return ag.mesafeKoord(g[6], g[7], t[4], t[5]) <= 60; }));
sina('haversine: İTÜ–Ankara 340–360 km', (() => { const d = ag.mesafe(ag.grup('IST'), ag.grup('ANK')); return d > 340 && d < 360; })());

/* ── 2. HTML sayıları ── */
bolum('2. HTML sayıları');
const IST = ag.grup(ag.MERKEZ);
const beklenen = { kardes: ag.GRUPLAR.length - 1, ulke: ag.ulkeSayisi(), grup: ag.GRUPLAR.length, grupsehri: ag.TAKVIM.filter((t) => t[6]).length, etkinlik: ag.TAKVIM.length };
const enS = (await ice('dil/en.mjs')).SAYFA;
for (const [anahtar, deger] of Object.entries(beklenen)) {
  for (const [ad, kaynak] of [['TR', html], ['EN', Object.values(enS).join(' ')]]) for (const x of kaynak.matchAll(new RegExp(`data-ag="${anahtar}">([^<]+)<`, 'g'))) sina(`${ad} data-ag="${anahtar}" = ${deger}`, x[1].trim() === String(deger), x[1]);
}
const sirali = ag.GRUPLAR.filter((g) => g !== IST).map((g) => [g[3], Math.round(ag.mesafe(IST, g))]).sort((a, b) => a[1] - b[1]);
sina('en yakın / en uzak cümlesi', html.includes(`En yakın grup ${sirali[0][0]} (${km.format(sirali[0][1])} km), en uzak ${sirali.at(-1)[0]} (${km.format(sirali.at(-1)[1])} km).`));
const secenekler = [...html.matchAll(/<li role="option" id="olay-(\d+)" data-olay="\1" aria-selected="false"><time datetime="([\d-]+)">[^<]+<\/time><span>([^<]+)<\/span><small>([^<]+)<\/small><\/li>/g)];
sina('takvim listesi her etkinliği içerir', secenekler.length === ag.TAKVIM.length, `${secenekler.length}`);
for (const [, i, tarih, ad, alt] of secenekler) {
  const t = ag.TAKVIM[+i];
  const d = km.format(Math.round(ag.mesafeKoord(IST[6], IST[7], t[4], t[5])));
  sina(`takvim ${i}`, t[0] === tarih && ad.replace(/&amp;/g, '&') === t[2] && alt === `${t[3]} · ${d} km`, `${alt}`);
}

/* ── 3. pano ── */
bolum('3. Son etkinlikler panosu');
const satirlar = [...html.matchAll(/<tr data-bilet="([a-z0-9]+)">/g)].map((m) => m[1]);
const makaleler = [...html.matchAll(/<article (data-id=[^>]+)>/g)].map((m) => Object.fromEntries([...m[1].matchAll(/([\w-]+)="([^"]*)"/g)].map((x) => [x[1], x[2]])));
sina('her satırın kart metni var', satirlar.every((s) => makaleler.some((m) => m['data-id'] === s)));
sina('her kart metninin satırı var', makaleler.every((m) => satirlar.includes(m['data-id'])));
for (const m of makaleler) {
  sina(`${m['data-id']}: kaynak doğrulanmış notlarda`, notlar.includes(m['data-kaynak'].replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '')), m['data-kaynak']);
  sina(`${m['data-id']}: tarih ve İngilizce metin`, !!m['data-tarih'] && !!enS[m['data-i18n-html']]);
}
for (const m of makaleler) {
  sina(`${m['data-id']}: İngilizce tarih (data-tarih-en) ve tür`, !!m['data-tarih-en'] && ['gezi', 'atolye', 'kurs', 'yarisma', 'sosyal'].includes(m['data-tur']), m['data-tarih-en']);
  sina(`${m['data-id']}: İngilizce tarihte Türkçe sözcük yok`, !/Bahar|Güz|Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık|\d\.\d{2}/.test(m['data-tarih-en'] || ''), m['data-tarih-en']);
  if (m['data-foto']) sina(`${m['data-id']}: fotoğraf galeride`, html.includes(`gorseller/foto/${m['data-foto']}-480.jpg`));
}
sina('satır başına 4 döner hücre', [...html.matchAll(/<tr data-bilet[\s\S]*?<\/tr>/g)].every((m) => (m[0].match(/data-flap/g) || []).length === 4));

/* ── 4. yazılar ── */
bolum('4. Yazılar');
const yazilar = JSON.parse(oku('veri/yazilar.json'));
const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const trTarih = (t) => { const p = t.split('-'); return `${p.length === 3 ? +p[2] + ' ' : ''}${AY[+p[1] - 1]} ${p[0]}`; };
const htmlYazi = [...html.matchAll(/<li class="kartpostal"><svg class="kartpostal__resim"[^>]*><use href="gorseller\/semboller\.svg#(?:kart|pul)-[a-z]+"\/><\/svg><div class="kartpostal__yazi"><span class="kartpostal__pul"[^>]*><svg[^>]*><use href="gorseller\/semboller\.svg#pul-[a-z]+"\/><\/svg><\/span><p class="kartpostal__damga"><time datetime="([^"]+)">([^<]+)<\/time><\/p><h3><a href="([^"]+)"[^>]*>([^<]+)<\/a><\/h3><p class="kartpostal__ozet">([^<]+)<\/p>/g)];
{ const { KART_ESLEME, KART_SAHNE } = await ice('sahne/kartpostal.mjs'); const sm = oku('site.mjs').match(/const KART = (\{[^}]+\});/);
  sina('kartpostal sahne eşlemesi site.mjs = sahne/kartpostal.mjs', !!sm && JSON.stringify(Function('return ' + sm[1])()) === JSON.stringify(KART_ESLEME));
  sina('her kartpostal sahnesi sayfada sembol', Object.keys(KART_SAHNE).every((k) => oku('gorseller/semboller.svg').includes(`<symbol id="kart-${k}"`)));
  sina('her EUROAVIA raporunun kendi sahnesi', Object.keys(KART_ESLEME).every((id) => yazilar.some((y) => y.id === id))); }
const rafta = (y) => y.kaynak === 'AESTRO' || y.id === 'aestro-yolculugu';
const kartlik = yazilar.filter((y) => !rafta(y));
sina('kartpostal sayısı = veri/yazilar.json (raf dışı)', htmlYazi.length === kartlik.length, `${htmlYazi.length}/${kartlik.length}`);
for (const y of yazilar.filter(rafta)) sina(`raf: ${y.id} bağlantısı AESTRO kapağında`, new RegExp(`<li class="dergi dergi--\\d"><a href="${y.baglanti.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}"`).test(html));
sina('raf: 3 AESTRO kapağı', (html.match(/<li class="dergi dergi--\d">/g) || []).length === 3);
yazilar.forEach((y) => {
  const h = rafta(y) ? null : htmlYazi[kartlik.indexOf(y)];
  if (h) sina(`yazı ${y.id}: sayfa ile aynı`, h[1] === y.tarih && h[2] === trTarih(y.tarih) && h[3] === y.baglanti && h[4].replace(/&#x27;|&#39;/g, "'") === y.baslik.tr, h?.[4]);
  sina(`yazı ${y.id}: EN başlık ve özet`, !!y.baslik.en && !!y.ozet.en);
  sina(`yazı ${y.id}: bağlantı doğrulanmış notlarda`, notlar.includes(y.baglanti.replace(/^https:\/\//, '').replace(/\/$/, '')), y.baglanti);
  sina(`yazı ${y.id}: tarih YYYY-AA(-GG)`, /^\d{4}-\d{2}(-\d{2})?$/.test(y.tarih));
});
sina('yazılar yeniden eskiye', yazilar.every((y, i) => i === 0 || yazilar[i - 1].tarih >= y.tarih));

/* ── 5. bağlantılar ── */
bolum('5. Bağlantılar');
const tumMetin = html + Object.values(enS).join(' ');
for (const u of new Set([...tumMetin.matchAll(/href="((?:https?:|mailto:)[^"]+)"/g)].map((m) => m[1]))) {
  sina(`notlarda: ${u}`, notlar.includes(u.replace(/^https?:\/\/(www\.)?/, '').replace(/^mailto:([^?]+)\?.*$/, '$1').replace(/^mailto:/, '').replace(/\/$/, '')));
}
sina('target=_blank → rel=noopener (TR+EN)', [...tumMetin.matchAll(/<a [^>]*target="_blank"[^>]*>/g)].every((m) => /rel="[^"]*noopener/.test(m[0])));
for (const m of html.matchAll(/(?:href|src)="(?!https?:|mailto:|#|data:)([^"#?]+)/g)) { let v = true; try { statSync(join(KOK, m[1])); } catch { v = false; } sina(`yerel dosya: ${m[1]}`, v); }
for (const m of html.matchAll(/srcset="([^"]+)"/g)) for (const p of m[1].split(',').map((s) => s.trim().split(' ')[0])) { let v = true; try { statSync(join(KOK, p)); } catch { v = false; } sina(`srcset: ${p}`, v); }
const kimlikler = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
for (const m of html.matchAll(/href="#([^"=]+)"/g)) sina(`çapa #${m[1]}`, kimlikler.includes(m[1]));

/* ── 6. açılış uçuşu ── */
bolum('6. Açılış: uçuş yörüngesi ve adın hâlleri');
const U = await ice('sahne/ucus.mjs');
for (const [ad, A] of [['geniş', U.GENIS], ['dar', U.DAR]]) {
  sina(`${ad}: anahtar kareler 0'dan 1'e artan`, A[0][0] === 0 && A.at(-1)[0] === 1 && A.every((k, i) => i === 0 || k[0] > A[i - 1][0]));
  const y = U.yorunge(A.map(([q, x, yy, z]) => [q, x * 4, yy, z]));
  let sicrama = 0; for (let q = 0.005; q <= 1; q += 0.005) { const a = y.nokta(q - 0.005), b = y.nokta(q); sicrama = Math.max(sicrama, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])); }
  sina(`${ad}: yörünge sürekli (adım başına ≤ 0,35 birim)`, sicrama <= 0.35, sicrama.toFixed(3));
  sina(`${ad}: sonda uçak sahneden aşağı çıkar (y < −4)`, y.nokta(1)[1] < -4, y.nokta(1)[1].toFixed(2));
}
const yg = U.yorunge(U.GENIS.map(([q, x, yy, z]) => [q, x * 6.4, yy, z]));
const ters = []; for (let q = 0; q <= 1.0001; q += 0.01) if (yg.eksen(q).yukari[1] < 0) ters.push(+q.toFixed(2));
sina('takla: uçak yalnız takla penceresinde sırtüstü', ters.length > 0 && ters.every((q) => q > U.TAKLA[0] && q < U.TAKLA[1]), ters.join(','));
sina('silüet geçişi (p 0,45–0,6) metnin sağında (x > 0)', [0.45, 0.5, 0.55, 0.6].every((q) => yg.nokta(q)[0] > 0), [0.45, 0.5, 0.55, 0.6].map((q) => yg.nokta(q)[0].toFixed(2)).join(' '));
sina('adın 3 hâli, pencereler ardışık (yeni ad eskisi çıkınca girer)', U.PENCERE.length === 3 && U.PENCERE[1][0][0] >= U.PENCERE[0][1][1] && U.PENCERE[2][0][0] >= U.PENCERE[1][1][1] && U.PENCERE.every(([g, c]) => (!g || g[0] < g[1]) && (!c || c[0] < c[1])));
sina('HTML: adın 3 hâli, ilki h1', (html.match(/class="ad__durum"/g) || []).length === 3 && /<h1 class="ad__durum" id="giris-baslik" data-durum="0">/.test(html));
sina('HTML: hâl 1 "AS Istanbul" + "EUROAVIA", hâl 2 "İTÜ UUMK"', /data-durum="1"[^>]*><span class="ad__buyuk">AS Istanbul<\/span><span class="ad__kucuk">EUROAVIA<\/span>/.test(html) && /data-durum="2"[^>]*><span class="ad__buyuk" data-i18n="ad2">İTÜ UUMK<\/span>/.test(html));
const insa = await ice('araclar/istanbul-insa.mjs');
sina('İstanbul panoraması: sayfadaki çizim ve gorseller/semboller.svg sahne/istanbul.mjs presetiyle birebir aynı (node araclar/istanbul-insa.mjs)', insa.yerlestir(html) === html && oku('gorseller/semboller.svg') === (await ice('sahne/istanbul.mjs')).sembolDosyasi());
for (const m of html.matchAll(/href="gorseller\/semboller\.svg#([a-z-]+)"/g)) sina(`sembol var: ${m[1]}`, oku('gorseller/semboller.svg').includes(`<symbol id="${m[1]}"`));
sina('panorama blokları: Galata, cami, köprü, Kız Kulesi, martılar, vapur, dalgalar', ['blok--galata', 'blok--cami', 'blok--kopru', 'blok--kiz', 'blok--martilar', 'class="vapur"', 'dalga--4'].every((k) => html.includes(k)));
sina('panorama v5: Ayasofya, Galata Köprüsü, yıldızlar, fener ışığı, tarama deseni', ['blok--ayasofya', 'blok--galata-koprusu', 'blok--yildizlar', 'fener-hale', 'id="tarama-gun"', 'id="tarama-gece"'].every((k) => html.includes(k)));
{ const ist = await ice('sahne/istanbul.mjs'); sina('panorama sahne genişliği site.mjs ile aynı (-400…2000)', ist.SOL === -400 && ist.SAG === 2000 && /SAHNE_SOL = -400, SAHNE_SAG = 2000/.test(oku('site.mjs'))); }
sina('kabin: 2,5B maket (tembel three.js, GPU yoksa poster) ve 6 numaralı ekip', html.includes('id="maket-tuval"') && html.includes('class="maket__poster" src="gorseller/kabin-maket-1200.jpg"') && statSync(join(KOK, 'gorseller/kabin-maket-1200.jpg')).size > 20000 && (html.match(/<ol class="kabin">[\s\S]*?<\/ol>/)?.[0].match(/<li class="kabin__/g) || []).length === 6 && /<ol class="maket__imler"[^>]*>(<li>\d<\/li>){6}<\/ol>/.test(html) && oku('sahne/maket3b.mjs').includes("from '../vendor/three-r184/three.module.min.js'") && !/^import .*maket3b/m.test(oku('site.mjs')));
sina('dil seçici: TR ve EN bayrağı', /<button class="dil" id="dil-dugme"[^>]*>[\s\S]*?data-dil="tr"[\s\S]*?<svg class="bayrak"[\s\S]*?data-dil="en"[\s\S]*?<svg class="bayrak"/.test(html));
sina('menüde numara yok', !html.includes('menu__no'));
{ const { KAYITLAR } = await ice('veri/tarihce.mjs'), insa = await ice('araclar/tarihce-insa.mjs');
  sina(`tarihçe: her şeritte resim karesi (${KAYITLAR.length} kayıt + sıradaki)`, KAYITLAR.length >= 15 && (html.match(/<li class="serit [^"]*"( id="tarih-[a-z0-9-]+")?><span class="serit__resim/g) || []).length === KAYITLAR.length + 1 && html.includes('id="rota-yil"'));
  sina('tarihçe: şeritler ve İngilizce metinleri veri/tarihce.mjs ile aynı (node araclar/tarihce-insa.mjs)', insa.htmlYerlestir(html) === html && insa.enYerlestir(oku('dil/en.mjs')) === oku('dil/en.mjs'));
  sina('tarihçe: her şerit ayrıntıya açılır (#tarih-<kimlik>) ve kimlikler tekil', KAYITLAR.every((k) => html.includes(`id="tarih-${k.id}"`) && html.includes(`href="#tarih-${k.id}"`)) && new Set(KAYITLAR.map((k) => k.id)).size === KAYITLAR.length);
  for (const k of KAYITLAR) {
    sina(`tarihçe ${k.id}: TR ve EN ayrıntı dolu, kaynak var`, k.detay.length === 2 && k.detay.every((p) => p.length >= 2) && k.kod.length === 2 && k.baslik.length === 2 && k.ozet.length === 2 && k.kaynak.length >= 1);
    for (const [u] of k.kaynak) sina(`tarihçe ${k.id}: kaynak notlarda (${u.slice(0, 70)})`, notlar.replace(/:80\//g, '/').includes(u.replace(/^https?:\/\/(web\.archive\.org\/web\/\d+\/)?/, '').replace(/^https?:\/\//, '').replace(/\/$/, '')));
    sina(`tarihçe ${k.id}: kendini pazarlayan dil yok`, !/(eşsiz|benzersiz|muhteşem|harika|unique|amazing|world-class)/i.test(JSON.stringify(k)));
  }
  /* v8: resimli kayıtlar, fotoğraf galerisi (dosyalar diskte, kaynak notlarda), kıyı ve boş gündem */
  const sem = oku('gorseller/semboller.svg'), notN = notlar.replace(/:80\//g, '/');
  for (const k of KAYITLAR) {
    if (k.resim.cizim) sina(`tarihçe ${k.id}: çizimi sembol dosyasında`, sem.includes(`<symbol id="tarih-${k.resim.cizim}"`));
    for (const [ad, tr, en, u] of k.galeri || []) {
      sina(`galeri ${ad}: 480 ve 960 px dosyası, TR/EN altyazı`, [480, 960].every((g) => statSync(join(KOK, `gorseller/tarihce/${ad}-${g}.jpg`)).size > 3000) && tr.length > 3 && en.length > 3);
      sina(`galeri ${ad}: fotoğrafın kaynağı notlarda`, notN.includes(u.replace(/^https?:\/\/(web\.archive\.org\/web\/\d+\/)?/, '').replace(/^https?:\/\//, '').replace(/\/$/, '')));
    }
  }
  sina('kıyı: zemin ve vapur sembolleri dosyada, sayfada yalnız use', ['kiyi-su', 'kiyi-rihtim', 'kiyi-vapur'].every((k) => sem.includes(`<symbol id="${k}"`)) && /<svg class="kiyi" id="kiyi"[^>]*><use href="gorseller\/semboller\.svg#kiyi-su"/.test(html));
  sina('boş gündem: 2,5B havaalanı (tembel three.js, GPU yoksa poster), Instagram bağlantısı', /<template id="bos-sablon">[\s\S]*?class="bos__poster" src="gorseller\/bekleme-800\.jpg"[\s\S]*?<canvas class="bos__tuval"[\s\S]*?href="https:\/\/www\.instagram\.com\/ituuumk\/"[\s\S]*?<\/template>/.test(html) && oku('sahne/hesap.mjs').includes("import('./bekleme3b.mjs')") && statSync(join(KOK, 'gorseller/bekleme-800.jpg')).size > 10000);
  sina('sponsorluk: rakam şeridi ve kurumlar', (html.match(/<dl class="rakamlar">[\s\S]*?<\/dl>/)?.[0].match(/<dt>/g) || []).length === 4 && (html.match(/<div class="kurumlar">[\s\S]*?<\/ul>/)?.[0].match(/<li>/g) || []).length === 5);
  sina('footer: AS Istanbul vektör amblemi (EUROAVIA ist.svg, beyaz)', html.includes('src="gorseller/logo-as-istanbul-beyaz.svg"') && /viewBox="134 112 756 800"/.test(oku('gorseller/logo-as-istanbul-beyaz.svg')) && !oku('gorseller/logo-as-istanbul-beyaz.svg').includes('#003366'));
  sina('tarihçe ayrıntısı: pencere ve tembel modül', html.includes('<dialog class="bilet ayrinti" id="ayrinti"') && oku('site.mjs').includes("import('./sahne/ayrinti.mjs')") && !/^import .*ayrinti/m.test(oku('site.mjs')));
}
sina('panorama: her parça blok içinde sıralı (data-s, data-k)', (html.match(/<g class="parca" data-k="\d+">/g) || []).length > 150);

/* ── 7. iki dil ── */
bolum('7. Türkçe / İngilizce');
const ceviri = await ice('ceviri.mjs');
const enJ = (await ice('dil/en.mjs')).JS;
const anahtarlar = new Set();
for (const t of ['data-i18n', 'data-i18n-html', 'data-i18n-aria', 'data-i18n-alt', 'data-i18n-placeholder', 'data-i18n-title']) for (const m of html.matchAll(new RegExp(`${t}="([^"]+)"`, 'g'))) anahtarlar.add(m[1]);
for (const k of anahtarlar) sina(`EN anahtarı: ${k}`, enS[k] !== undefined);
for (const k of Object.keys(enS)) sina(`EN anahtarı kullanılıyor: ${k}`, k === 'baslik' || anahtarlar.has(k));
for (const k of Object.keys(ceviri.JS_TR)) sina(`JS EN karşılığı: ${k}`, k === 'baslik0' || enJ[k] !== undefined);
for (const k of Object.keys(enJ)) sina(`JS TR karşılığı: ${k}`, ceviri.JS_TR[k] !== undefined);
const bas = html.match(/<script>(\(function\(\)\{var h=document\.documentElement[\s\S]*?)<\/script>/)[1];
sina('baş betiği: ?dil, kayıtlı tercih, bot, tarayıcı dili', /uumk-dil/.test(bas) && /bot\|crawl\|spider\|slurp/.test(bas) && /slice\(0,2\)/.test(bas) && /'en'/.test(bas));
sina('ceviri.mjs aynı kural', /uumk-dil/.test(oku('ceviri.mjs')) && /bot\|crawl\|spider\|slurp/.test(oku('ceviri.mjs')));
sina('EN metinlerde yer tutucu sayısı TR ile aynı', Object.keys(enJ).every((k) => (enJ[k].match(/\{\w+\}/g) || []).sort().join() === (ceviri.JS_TR[k].match(/\{\w+\}/g) || []).sort().join()));

/* ── 8. renk, kontrast ── */
bolum('8. Renk ve kontrast');
const { RENK } = await ice('sahne/renk.mjs');
const jeton = (ad) => css.match(new RegExp(`--${ad}: (#[0-9a-f]{6});`))?.[1];
for (const [ad, j] of [['kagit', 'kagit'], ['murekkep', 'murekkep'], ['soluk', 'soluk'], ['cizgi', 'cizgi'], ['petrol', 'petrol'], ['petrolAcik', 'petrol-acik'], ['lacivert', 'lacivert']]) sina(`--${j} = renk.mjs`, jeton(j) === RENK[ad], jeton(j));
sina('petrol ve lacivert logodan (notlar/tasarim.md)', /056b7a/i.test(oku('notlar/tasarim.md')) && /f2c200/i.test(oku('notlar/tasarim.md')));
const parlak = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const kontrast = (a, b) => { const [x, y] = [parlak(a), parlak(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
for (const [ad, a, b] of [
  ['mürekkep / kâğıt', jeton('murekkep'), jeton('kagit')], ['soluk / kâğıt', jeton('soluk'), jeton('kagit')], ['soluk / beyaz', jeton('soluk'), '#ffffff'],
  ['petrol / kâğıt (bağlantı)', jeton('petrol'), jeton('kagit')], ['beyaz / petrol (düğme)', '#ffffff', jeton('petrol')], ['petrol / petrol-açık', jeton('petrol'), jeton('petrol-acik')],
  ['soluk / petrol-açık', jeton('soluk'), jeton('petrol-acik')], ['gece yazı / lacivert', jeton('gece-yazi'), jeton('lacivert')], ['gece soluk / lacivert', jeton('gece-soluk'), jeton('lacivert')],
  ['gece vurgu / lacivert', jeton('gece-vurgu'), jeton('lacivert')], ['pano yazısı / koyu lacivert', '#f1ead6', jeton('lacivert-koyu')], ['pano tarihi / koyu lacivert', '#d8cfb5', jeton('lacivert-koyu')],
  ['gece soluk / koyu lacivert', jeton('gece-soluk'), jeton('lacivert-koyu')], ['hata / beyaz', jeton('hata'), '#ffffff'], ['beyaz / mürekkep (duyuru)', '#ffffff', jeton('murekkep')],
]) { const k = kontrast(a, b); sina(`kontrast ${ad} ≥ 4,5`, k >= 4.5, k.toFixed(2)); }
sina('kenarlı alan çerçevesi ≥ 3:1 (#85837e / yüzey #f8f8f6 ve zemin #ecebe7)', kontrast('#85837e', '#f8f8f6') >= 3 && kontrast('#85837e', '#ecebe7') >= 3 && css.includes('#85837e'), `${kontrast('#85837e', '#f8f8f6').toFixed(2)} · ${kontrast('#85837e', '#ecebe7').toFixed(2)}`);

/* tipografi: yalnız iki aile; v1'in ve sık görülen "hazır şablon" ailelerinin hiçbiri yok */
const aileler = [...new Set([...css.matchAll(/font-family: '([^']+)'/g)].map((m) => m[1]))];
sina('@font-face yalnız Jost ve IBM Plex Sans (yerel, OFL)', aileler.length === 2 && aileler.includes('Jost') && aileler.includes('IBM Plex Sans'), aileler.join(', '));
for (const y of ['jost/jost-latin.woff2', 'jost/jost-latin-ext.woff2', 'ibm-plex-sans/ibm-plex-sans-latin.woff2', 'ibm-plex-sans/ibm-plex-sans-latin-ext.woff2', 'jost/OFL.txt', 'ibm-plex-sans/LICENSE.txt']) { let v = true; try { statSync(join(KOK, 'yazitipleri', y)); } catch { v = false; } sina(`yazı tipi dosyası: ${y}`, v); }
for (const y of ['Big Shoulders', 'JetBrains', 'Archivo', 'Inter', 'Space Grotesk', 'Montserrat', 'Poppins', 'Roboto', 'Instrument Sans', 'Source Serif', 'Geist', 'Manrope', 'DM Sans']) { const r = new RegExp(`['"]${y}[\w ]*['"]`); sina(`yazı tipi ailesi yok: ${y}`, !r.test(css) && !r.test(html)); }
sina('punto ölçeği 6 kademe (--t-1…--t-6)', [...css.matchAll(/^\s*--t-(\d): /gm)].length === 6);
sina('CSS font-size yalnız ölçekten (var(--t-n), 1em ya da inherit)', [...css.matchAll(/font-size:\s*([^;}]+)/g)].every((m) => /^var\(--t-\d\)|^1em|^inherit/.test(m[1].trim())), [...css.matchAll(/font-size:\s*([^;}]+)/g)].map((m) => m[1]).filter((v) => !/^var\(--t-\d\)|^1em|^inherit/.test(v.trim())).join(' | '));
/* palet: CSS'teki her onaltılık renk izinli kümede (logo türevi ton ailesi); mor/neon yok */
const IZINLI = new Set(['#ecebe7', '#f8f8f6', '#ffffff', '#141414', '#4a4a48', '#cfcdc6', '#056b7a', '#03525e', '#dfeaeb', '#1a1a1a', '#0f0f0f', '#f2f2ef', '#b3b3ae', '#f2c200', '#85837e', '#a4262c', '#8fb7bd', '#2d7c87', '#fff', '#000', '#262624', '#2e2e2b', '#121211', '#20201e']);   /* son dördü: gece İstanbul'u (ay ışığında silüet) */   /* #2d7c87: gece haritasında grubu olan ülke (petrolün koyu zemindeki tonu) */   /* #000: yalnız yazdırma */
const renkler = [...new Set([...css.matchAll(/#[0-9a-f]{3,6}\b/gi)].map((m) => m[0].toLowerCase()))];
sina('CSS renkleri izinli palette', renkler.every((r) => IZINLI.has(r)), renkler.filter((r) => !IZINLI.has(r)).join(' '));
const ton = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return { h: 0, s: 0 }; const hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return { h: (hh * 60 + 360) % 360, s: d / (1 - Math.abs(mx + mn - 1)) }; };
sina('mor/eflatun (260–330°) doygun renk yok', renkler.filter((r) => r.length === 7).every((r) => { const t = ton(r); return !(t.s > 0.35 && t.h >= 260 && t.h <= 330); }));
sina('dekoratif degrade yok', (css.match(/gradient\(/g) || []).length === 0, String((css.match(/gradient\(/g) || []).length));
/* eski kanat profili logosu kalktı: gerçek logo görselleri var */
sina('eski NACA profili logosu yok', !html.includes('logo__isaret') && !html.includes('M100.0 -0.0L99.6') && !oku('gorseller/favicon.svg').includes('100.0'));
sina('header ve footer gerçek logoyu kullanır', html.includes('src="gorseller/logo-uumk-360.png"') && html.includes('src="gorseller/logo-uumk-beyaz-360.png"') && html.includes('src="gorseller/logo-as-istanbul-beyaz-120.png"'));

/* ── 9. CSP ── */
bolum('9. CSP');
const vercel = JSON.parse(oku('vercel.json'));
const csp = vercel.headers.find((h) => h.source === '/(.*)').headers.find((h) => h.key === 'Content-Security-Policy').value;
for (const dosya of ['index.html', 'kvkk.html', 'yonetim.html']) {
  const h = oku(dosya);
  for (const m of h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) sina(`${dosya}: satır içi betik hash'i CSP'de`, csp.includes(`'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`));
  sina(`${dosya}: satır içi style özniteliği yok`, !/\sstyle="/.test(h));
}
sina("connect-src 'self'", /connect-src 'self'/.test(csp));

/* ── 10. erişilebilirlik ── */
bolum('10. Erişilebilirlik (statik)');
for (const dosya of ['index.html', 'kvkk.html', 'yonetim.html']) {
  const h = oku(dosya);
  const ids = [...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  sina(`${dosya}: tekil id`, new Set(ids).size === ids.length, ids.filter((k, i) => ids.indexOf(k) !== i).join(','));
  for (const m of h.matchAll(/aria-(?:controls|labelledby|describedby|activedescendant)="([^"]+)"/g)) for (const k of m[1].split(' ')) sina(`${dosya}: ARIA hedefi #${k}`, ids.includes(k));
  for (const m of h.matchAll(/<label for="([^"]+)"/g)) sina(`${dosya}: etiket hedefi #${m[1]}`, ids.includes(m[1]));
  sina(`${dosya}: tek h1`, (h.match(/<h1[\s>]/g) || []).length === 1);
  sina(`${dosya}: img alt + boyut`, [...h.matchAll(/<img [^>]*>/g)].every((m) => /alt="/.test(m[0]) && /width="\d+"/.test(m[0]) && /height="\d+"/.test(m[0])));
  sina(`${dosya}: her düğmenin adı var`, [...h.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/g)].every((m) => /aria-label="[^"]+"/.test(m[1]) || metinSaf(m[2]).trim()));
  sina(`${dosya}: html lang=tr`, /<html lang="tr">/.test(h));
}
const basliklar = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
sina('index: başlık sırası atlamaz', basliklar.every((h, i) => i === 0 || h <= basliklar[i - 1] + 1), basliklar.join(''));
sina('form alanlarında autocomplete', [...html.matchAll(/<input ([^>]*)>/g)].filter((m) => !/type="(hidden|checkbox)"/.test(m[1])).every((m) => /autocomplete="/.test(m[1])));

/* ── 11. metin kuralları ── */
bolum('11. Metin (kendini pazarlayan dil yasak)');
const gorunurTR = metinSaf(html.replace(/<head>[\s\S]*<\/head>/, '')) + ' ' + Object.values(ceviri.JS_TR).join(' ') + ' ' + metinSaf(oku('kvkk.html'));
const gorunurEN = Object.values(enS).join(' ') + ' ' + Object.values(enJ).join(' ');
const YASAK_TR = ['bekleme turundayız', 'kayıt masası', 'yeni kuşağıyla', 'öğrencilerle tanış', 'ekibini seç', 'her şerit bir kayıt', 'gerçekleştirilmiştir', 'sağlanmaktadır', 'söz konusu', 'kapsamında', 'bulunmaktadır', 'sınıfta bitmez', 'kapısını aç', 'hayalin', 'tutku', 'eşsiz', 'muhteşem', 'en iyi', 'fırsatı kaçırma', 'harika', 'unutulmaz', 'dünya standartlarında', 'öncü', 'vizyoner', 'heyecan verici', 'seni bekliyor', 'sınırları zorla', 'geleceği şekillendir', 'yolculuğa', 'benzersiz', 'olağanüstü', 'mükemmel'];
const YASAK_EN = ['holding pattern', 'registration desk', 'next generation', 'meet the students', 'pick your', 'unforgettable', 'exciting', 'journey', 'passion', 'cutting-edge', 'world-class', 'unlock', 'empower', 'join us', 'amazing', 'awesome', 'unique', 'best-in-class', 'innovative', 'revolution', 'seamless', 'next-level'];
for (const y of YASAK_TR) sina(`TR'de yok: "${y}"`, !gorunurTR.toLocaleLowerCase('tr').includes(y));
for (const y of YASAK_EN) sina(`EN'de yok: "${y}"`, !gorunurEN.toLowerCase().includes(y));
sina('yer tutucu yok', !/lorem|ipsum|TODO|XXX|KURULUS_|YAZILAR|FOTOLAR|TAKVIM</.test(html));
sina('kuruluş tarihi kaynakla aynı (2001: 4 Ocak, 7 Mayıs)', /<time>2001<\/time><p class="serit__kod"[^>]*>4 Ocak · İTÜ<\/p><h4><a[^>]*>Kuruluş<\/a><\/h4><p[^>]*>Kulüp 4 Ocak'ta İTÜ'de kuruldu\./.test(html) && /<time>2001<\/time><p class="serit__kod"[^>]*>7 Mayıs · İTÜ → Varşova<\/p>/.test(html) && notlar.includes('7th of May, 2001') && notlar.includes('(4th of Jan)'));
sina('doğrulanmamış XFLR5 sitede yok (kaynakta görülmedi)', !/XFLR5/.test(html + Object.values(enS).join(' ')));
sina('sponsorluk: e-posta düğmesi doğrulanmış adrese konu satırıyla', /<a class="dugme dugme--birincil" id="sponsor-yaz" href="mailto:istanbul@euroavia\.eu\?subject=/.test(html) && /id="sponsor-kopyala"/.test(html));
sina('meta açıklama 70–170 karakter', (() => { const m = html.match(/<meta name="description" content="([^"]+)"/); return m && m[1].length >= 70 && m[1].length <= 170; })());

/* ── 12. küre maskesi ── */
bolum('12. Küre maskesi');
const { maskeCoz } = await ice('sahne/kure-ortak.mjs');
const mc = maskeCoz(); const say = { 1: 0, 2: 0 }; for (const t of mc.tur) say[t]++;
const ust = oku('veri/kure-maske.mjs').match(/kara (\d+), üye ülke (\d+)/);
sina('maske çözümü başlıktaki sayılarla aynı', ust && +ust[1] === say[1] && +ust[2] === say[2]);

/* ── 13. sunucu ve bütçeler ── */
bolum('13. Sunucu dosyaları ve bütçeler');
const sunucuKod = oku('sunucu/sunucu.mjs');
sina('sunucu/notlar/araclar/kaynak/.db dışarıya kapalı', /sunucu\|notlar\|araclar\|kaynak/.test(sunucuKod) && /db\|db-wal/.test(sunucuKod));
const vi = (() => { try { return oku('.vercelignore'); } catch { return ''; } })();
sina('.vercelignore: sunucu/, notlar/, araclar/, kaynak/', ['sunucu', 'notlar', 'araclar', 'kaynak'].every((k) => vi.includes(k)));
const boyut = (p) => statSync(join(KOK, p)).size;
const acilis = ['site.mjs', 'ceviri.mjs', 'sahne/pano.mjs', 'sahne/hesap.mjs', 'sahne/ucus.mjs', 'sahne/renk.mjs'];   /* code128 (barkod) v9'dan beri biniş kartı açılınca iner */
sina('barkod modülü tembel (biniş kartı açılınca)', oku('sahne/pano.mjs').includes("import('../lib/sunumatik/boarding_pass/code128.mjs')") && !/^import .*code128/m.test(oku('sahne/pano.mjs')));
const acilisKB = acilis.reduce((s, p) => s + boyut(p), 0) / 1024;
sina('açılış JS ≤ 72 kB (ham; v4 bütçesi)', acilisKB <= 72, acilisKB.toFixed(1) + ' kB');
const cssGz = gzipSync(readFileSync(join(KOK, 'site.css'))).length / 1024;
sina('site.css gzip ≤ 17 kB (v5 bütçesi: uçak, üst şerit, tarihçe)', cssGz <= 17, cssGz.toFixed(2) + ' kB');
const htmlGz = gzipSync(readFileSync(join(KOK, 'index.html'))).length / 1024;
sina('index.html gzip ≤ 40 kB (v5: tarama, yansıma, yıldız ayrıntılı panorama ~18 kB dahil)', htmlGz <= 40, htmlGz.toFixed(1) + ' kB');
const gorsel = ['gorseller/logo-uumk-360.png', 'gorseller/foto/pegasus-2026-480.jpg', 'gorseller/foto/kutu-oyun-2026-480.jpg', 'gorseller/foto/modelleme-2026-480.jpg', 'gorseller/foto/lustrum-2024-480.jpg'].reduce((s, p) => s + boyut(p), 0) / 1024;
sina('ilk yüklenen görseller ≤ 220 kB', gorsel <= 220, gorsel.toFixed(0) + ' kB');
sina('three yalnız tembel sahnelerden', acilis.every((p) => !/from 'three'/.test(oku(p))));
/* 404 sayfası her yolda sunulur (/a/b/c): kaynaklar kökten mutlak olmalı */
{ const s = oku('404.html'); sina('404.html: kaynaklar kökten mutlak (/site.css, /gorseller/…)', /href="\/site\.css"/.test(s) && !/(?:href|src)="(?!\/|#|https?:|mailto:)[^"]+"/.test(s)); }

console.log(`\n${gecen} geçti · ${dusen} düştü  (açılış JS ${acilisKB.toFixed(1)} kB · CSS gzip ${cssGz.toFixed(2)} kB · görsel ${gorsel.toFixed(0)} kB)`);
process.exit(dusen ? 1 : 0);
