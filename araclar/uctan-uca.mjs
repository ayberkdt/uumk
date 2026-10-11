#!/usr/bin/env node
/* UÇTAN UCA — başsız Chrome'da gerçek etkileşim sınamaları (CDP, bağımlılık yok).
 *   node araclar/uctan-uca.mjs [adres]      (varsayılan http://127.0.0.1:4210/; sunucu açık olmalı)
 * Her senaryo temiz bir sekmede koşar; konsol hatası da düşüş sayılır. Çıkış 1 = en az biri düştü.
 * CEKIM_GPU=1 gerçek GPU ile koşturur (varsayılan swiftshader). Altyapı Antra Tech araclar/uctan-uca.mjs ile aynı.
 * Sunucu deneme veritabanıyla açık olmalı: node araclar/ornek-veri.mjs && node sunucu/sunucu.mjs --deneme
 */
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ADRES = process.argv[2] || 'http://127.0.0.1:4210/';
const ADAY = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'];
const chrome = ADAY.find(existsSync);
const port = 9700 + Math.floor(Math.random() * 200);
const gecici = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '.cekim-gecici');
if (existsSync(gecici)) for (const ad of readdirSync(gecici)) if (ad.startsWith('profil-')) { try { rmSync(join(gecici, ad), { recursive: true, force: true }); } catch { /* kilitli */ } }
const profil = join(gecici, `profil-${port}`);
mkdirSync(profil, { recursive: true });
const gpu = process.env.CEKIM_GPU === '1' ? ['--use-angle=d3d11'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const surec = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profil}`, '--hide-scrollbars', '--enable-webgl', '--ignore-gpu-blocklist', ...gpu, '--window-size=1440,900', 'about:blank'], { stdio: 'ignore' });
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

async function sekmeAc() {
  for (let i = 0; i < 200; i++) {
    try { await fetch(`http://127.0.0.1:${port}/json/version`); break; } catch { await bekle(150); }
  }
  const h = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(h.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let no = 0; const bekleyen = new Map(); const hatalar = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && bekleyen.has(m.id)) { bekleyen.get(m.id)(m); bekleyen.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') hatalar.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) hatalar.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !/favicon/.test(m.params.entry.url || '')) hatalar.push(m.params.entry.text);
  });
  const cdp = (method, params = {}) => new Promise((r) => { const id = ++no; bekleyen.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
  await cdp('Runtime.enable'); await cdp('Log.enable'); await cdp('Page.enable');
  /* başsız Chrome'da yeni sekme odaklı sayılmayabilir: :focus ve document.hasFocus() kararlı olsun */
  await cdp('Page.bringToFront'); await cdp('Emulation.setFocusEmulationEnabled', { enabled: true });
  /* profil sekmeler arasında ortak: önceki senaryonun yerel deposu sızmasın */
  await cdp('Storage.clearDataForOrigin', { origin: new URL(ADRES).origin, storageTypes: 'local_storage,cookies' });
  const js = async (ifade) => {
    const r = await cdp('Runtime.evaluate', { expression: ifade, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'ifade hatası');
    return r.result?.result?.value;
  };
  const git = async (yol, g = 1440, y = 900) => {
    await cdp('Emulation.setDeviceMetricsOverride', { width: g, height: y, deviceScaleFactor: 1, mobile: g < 700 });
    await cdp('Page.navigate', { url: new URL(yol, ADRES).href });
    await bekle(1800);
  };
  const tikla = async (x, y) => { for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await cdp('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 }); };
  /* Enter/Boşluk için text alanı şart: yoksa tarayıcı düğmeyi etkinleştirmez (keypress üretilmez) */
  const tus = async (key, code = key, kod = 0) => {
    const text = key === 'Enter' ? String.fromCharCode(13) : key === ' ' ? ' ' : undefined;
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: kod, ...(text ? { text, unmodifiedText: text } : {}) });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: kod });
  };
  /* tembel yüklenen modüllerin kurduğu öğeyi bekle */
  const bekleOge = async (secici, sure = 4000) => { const t0 = Date.now(); while (Date.now() - t0 < sure) { if (await js(`!!document.querySelector(${JSON.stringify(secici)})`)) return true; await bekle(100); } return false; };
  const dokun = async (type, x, y) => {
    await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await cdp('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  };
  /* sekme gerçekten kapanır: yalnız soketi kapatmak sayfayı (ve 3B döngülerini) arka planda çalışır bırakıyor, sonraki senaryoları yavaşlatıyordu */
  const kapat = async () => { ws.close(); try { await fetch(`http://127.0.0.1:${port}/json/close/${h.id}`); } catch { /* zaten kapalı */ } };
  return { js, git, tikla, tus, dokun, bekleOge, cdp, hatalar, kapat };
}

/* düzen ölçen senaryolar önce otursun: yazı tipleri insin, iki kare geçsin (yedek yazının satır yüksekliği ölçümü bozar) */
const OTUR = 'document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(true)))))';

/* koşulu en çok `sure` ms bekle */
const kosulBekle = async (s, ifade, sure = 6000) => { const t0 = Date.now(); while (Date.now() - t0 < sure) { if (await s.js(ifade)) return true; await bekle(100); } return false; };
const POSTA = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'sunucu', 'posta-kutusu');
const { readdirSync: dizin, readFileSync: dosyaOku } = await import('node:fs');
const { execFileSync } = await import('node:child_process');
const sonPosta = (desen) => { try { const f = dizin(POSTA).filter((x) => x.endsWith('.txt')).sort().reverse().map((x) => dosyaOku(join(POSTA, x), 'utf8')).find((m) => desen.test(m)); return f?.match(/https?:\/\/\S+/)?.[0]; } catch { return null; } };
const DAMGA = Date.now().toString().slice(-7);
/* sınama etkinlikleri koşudan önce ve sonra silinir: yerel sitenin gündeminde "Sınama etkinliği …" kalmasın (yalnız deneme.db) */
const { DatabaseSync } = await import('node:sqlite');
function sinamaTemizle(ne) {
  const yol = join(dirname(fileURLToPath(import.meta.url)), '..', 'sunucu', 'veri', 'deneme.db');
  if (!existsSync(yol)) return;   /* boş dosya yaratmasın */
  const db = new DatabaseSync(yol);
  db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;');
  db.prepare("DELETE FROM kayit WHERE etkinlik_id LIKE 'sinama-%'").run();
  const silinen = db.prepare("DELETE FROM etkinlik WHERE id LIKE 'sinama-%'").run().changes;
  /* betiğin açtığı kayıtlar ve üye hesapları (örnek etkinliklerin kontenjanı sınamalarla dolmasın); yönetici rolüne dokunmaz */
  /* yalnız betiğin 7 haneli damgalı adresleri (elle açılmış "deneme.ad@" gibi hesaplar silinmez) */
  const desen = ['misafir', 'deneme', 'csv', 'yon', 'sil', 'prf'].map((p) => `eposta GLOB '${p}.[0-9][0-9][0-9][0-9][0-9][0-9][0-9]@itu.edu.tr'`).join(' OR ');
  const kayit = db.prepare(`DELETE FROM kayit WHERE ${desen}`).run().changes;
  const kisi = db.prepare(`DELETE FROM kullanici WHERE rol = 'uye' AND (${desen})`).run().changes;
  db.close();
  if (silinen || kayit || kisi) console.log(`  (deneme.db: ${ne} ${silinen} sınama etkinliği, ${kayit} sınama kaydı, ${kisi} sınama hesabı silindi)`);
}
sinamaTemizle('önceki koşulardan');
const KISI = { ad: 'Deneme', soyad: 'Kullanıcı', eposta: `deneme.${DAMGA}@itu.edu.tr`, okul_no: `11${DAMGA}`, parola: 'deneme-parola-1' };
const doldur = (s, form, v) => s.js(`(() => { const f = document.querySelector('${form}'); for (const [k, d] of Object.entries(${JSON.stringify(v)})) { const g = f.elements[k]; if (g.type === 'checkbox') g.checked = d; else g.value = d; } })()`);

const SENARYO = {
  async 'açılış: ad kaydırmaya bağlı değil, kendiliğinden döner (İTÜ Uçak Uzay Mühendisliği Kulübü → AS Istanbul → İTÜ UUMK); h1 ve açıklama sabit; uçak zamanla uçar'(s) {
    await s.git('./?olc=1');
    if (!(await kosulBekle(s, `document.querySelector('#ucus-tuval').dataset.cizici === '2b' && !!document.querySelector('.ad__durum.bolundu')`, 8000))) throw new Error('sahne kurulmadı');
    const durum = `(() => { const a = document.querySelector('.giris__aciklama'), u = __uumk.ucus().olc(); return { hal: document.querySelector('#ad').dataset.hal, etkin: [...document.querySelectorAll('.ad__durum[data-etkin]')].map((e) => e.dataset.durum).join(), h1: document.querySelector('h1').getAttribute('aria-label'), aciklamaUst: Math.round(a.getBoundingClientRect().top + scrollY), x: Math.round(u.x), y: Math.round(u.y), iz: document.querySelector('#hikaye-iz').offsetHeight, ekran: innerHeight }; })()`;
    const k0 = await s.js(durum);
    /* kaydırmak adı değiştirmez */
    await s.js(`scrollTo({ top: 300, behavior: 'instant' })`); await bekle(400);
    const kk = await s.js(durum); await s.js(`scrollTo({ top: 0, behavior: 'instant' })`);
    const bir = await kosulBekle(s, `document.querySelector('#ad').dataset.hal === '1'`, 11000); const k1 = await s.js(durum);
    const iki = await kosulBekle(s, `document.querySelector('#ad').dataset.hal === '2'`, 8000); const k2 = await s.js(durum);
    const sorun = [];
    if (k0.hal !== '0' || kk.hal !== '0' || !bir || !iki || k1.etkin !== '1' || k2.etkin !== '2') sorun.push(`hâller ${k0.hal}/${kk.hal}/${k1.hal}/${k2.hal}`);
    if (new Set([k0.h1, k1.h1, k2.h1]).size !== 1 || !k0.h1.startsWith('İTÜ Uçak Uzay')) sorun.push(`h1 ${k0.h1}`);
    if (new Set([k0.aciklamaUst, k1.aciklamaUst, k2.aciklamaUst]).size !== 1) sorun.push('açıklama kaydı');
    if (Math.hypot(k2.x - k0.x, k2.y - k0.y) < 60) sorun.push('uçak zamanla yer değiştirmedi');
    if (k0.iz > k0.ekran + 2) sorun.push(`açılış izi uzun (${k0.iz} > ${k0.ekran})`);
    if (sorun.length) throw new Error(sorun.join(' · ') + ' ' + JSON.stringify({ k0, kk, k1, k2 }));
    console.log(`      açılış: hâl 0 (kaydırınca da 0) → 1 → 2 kendiliğinden · h1 "${k0.h1}" sabit · açılış ${k0.iz} px (tek ekran) · uçak (${k0.x},${k0.y}) → (${k2.x},${k2.y})`);
  },
  async 'hesap: aç, doğrula, tek tıkla kaydol, iptal et (tarayıcıda)'(s) {
    await s.git('./#hesap');
    if (!(await kosulBekle(s, `!document.querySelector('#giris-form fieldset').disabled`, 6000))) throw new Error('sunucu yok (fieldset kapalı)');
    await s.js(`document.querySelector('#sekme-kayit').click()`);
    await doldur(s, '#kayit-form', { ad: KISI.ad, soyad: KISI.soyad, eposta: 'yanlis@gmail.com', okul_no: KISI.okul_no, parola: KISI.parola, kvkk: true });
    await s.js(`document.querySelector('#kayit-form button[type=submit]').click()`);
    if (!(await kosulBekle(s, `document.querySelector('#kayit-form-eposta').getAttribute('aria-invalid') === 'true'`))) throw new Error('okul dışı e-posta reddedilmedi');
    const hataMetni = await s.js(`document.querySelector('#kayit-form-eposta-hata').textContent`);
    await doldur(s, '#kayit-form', { eposta: KISI.eposta });
    await s.js(`document.querySelector('#kayit-form button[type=submit]').click()`);
    if (!(await kosulBekle(s, `!document.querySelector('.profil').hidden`, 6000))) throw new Error('profil açılmadı');
    const ust = await s.js(`document.querySelector('#hesap-dugme').textContent`);
    const dogrulamaNotu = await s.js(`!document.querySelector('.profil__dogrula').hidden`);
    const kartNotu = await s.js(`[...document.querySelectorAll('.etkinlik__mesaj')].some((m) => m.textContent.includes('doğrula'))`);
    const adimOnce = await s.js(`document.querySelector('.hesap__adimlar').hidden`);   /* doğrulanmamış: adımlar görünür */
    const baglanti = sonPosta(new RegExp(KISI.eposta.replace('.', '\\.') + '[\\s\\S]*dogrula\\?t='));
    if (!baglanti) throw new Error('doğrulama e-postası posta kutusunda yok');
    await s.git(new URL(baglanti).pathname + new URL(baglanti).search);
    if (!(await kosulBekle(s, `document.querySelector('#duyuru').textContent.includes('doğrulandı')`, 6000))) throw new Error('doğrulama duyurusu yok');
    if (adimOnce || !(await kosulBekle(s, `document.querySelector('.hesap__adimlar').hidden`, 4000))) throw new Error('kurulum adımları: doğrulanmadan gizli ya da doğrulandıktan sonra görünür');
    await s.js(`document.querySelector('#gundem').scrollIntoView({ behavior: 'instant' })`);
    if (!(await kosulBekle(s, `!!document.querySelector('#etkinlik-kart-ornek-seminer .dugme--birincil')`, 6000))) throw new Error('kaydol düğmesi yok');
    await s.js(`document.querySelector('#etkinlik-kart-ornek-seminer .dugme--birincil').click()`);
    if (!(await kosulBekle(s, `document.querySelector('#etkinlik-kart-ornek-seminer .etkinlik__durum')?.dataset.durum === 'kayitli'`, 6000))) throw new Error('tek tık kayıt olmadı');
    const formYok = await s.js(`!document.querySelector('#etkinlik-kart-ornek-seminer form')`);
    await s.js(`document.querySelector('#etkinlik-kart-ornek-seminer .dugme--ikincil').click()`);
    if (!(await kosulBekle(s, `document.querySelector('#etkinlik-kart-ornek-seminer .etkinlik__durum')?.dataset.durum === 'acik'`, 6000))) throw new Error('iptal olmadı');
    if (!hataMetni.includes('itu.edu.tr') || ust !== KISI.ad || !dogrulamaNotu || !kartNotu || !formYok) throw new Error(`hata "${hataMetni}" üst ${ust} not ${dogrulamaNotu}/${kartNotu} form ${formYok}`);
  },
  async 'misafir: boş form hata verir, dolu form kaydeder'(s) {
    await s.git('./#gundem');
    if (!(await kosulBekle(s, `!!document.querySelector('#etkinlik-kart-ornek-teknik-gezi .dugme--birincil')`, 6000))) throw new Error('kart yok');
    await s.js(`document.querySelector('#etkinlik-kart-ornek-teknik-gezi .dugme--birincil').click()`);
    await s.js(`document.querySelector('#misafir-ornek-teknik-gezi button[type=submit]').click()`);
    if (!(await kosulBekle(s, `document.querySelectorAll('#misafir-ornek-teknik-gezi [aria-invalid=true]').length >= 4`))) throw new Error('boş alan hataları gösterilmedi');
    const odak = await s.js(`document.activeElement.id`);
    const g = `misafir.${DAMGA}@itu.edu.tr`;
    await doldur(s, '#misafir-ornek-teknik-gezi', { ad: 'Misafir', soyad: 'Kişi', eposta: g, okul_no: `12${DAMGA}`, kvkk: true });
    await s.js(`document.querySelector('#misafir-ornek-teknik-gezi button[type=submit]').click()`);
    if (!(await kosulBekle(s, `document.querySelector('#duyuru').textContent.includes('${g}')`, 6000))) throw new Error('misafir kaydı duyurusu yok');
    if (odak !== 'misafir-ornek-teknik-gezi-ad') throw new Error(`ilk hatalı alana odak gitmedi: ${odak}`);
  },
  async 'dil: EN geçişi metinleri değiştirir, tercih kalır, TR geri döner'(s) {
    await s.git('./');
    await s.js(`document.querySelector('#dil-dugme').click()`);
    if (!(await kosulBekle(s, `document.documentElement.lang === 'en' && document.querySelector('#giris-baslik').textContent.startsWith('ITU Aeronautical')`))) throw new Error('EN olmadı');
    const nav = await s.js(`document.querySelector('.menu a [data-i18n]').textContent`);
    const adres = await s.js('location.search');
    await s.git('./');
    const kalici = await s.js(`document.documentElement.lang`);
    await s.js(`document.querySelector('#ag').scrollIntoView({ behavior: 'instant' })`);
    await kosulBekle(s, `!!document.querySelector('#harita[data-cizici]')`, 8000);
    const takvim = await s.js(`document.querySelector('#olay-4 small').textContent`);
    await s.js(`document.querySelector('#dil-dugme').click()`);
    if (!(await kosulBekle(s, `document.documentElement.lang === 'tr' && document.querySelector('#giris-baslik').textContent.startsWith('İTÜ')`))) throw new Error('TR dönmedi');
    if (nav !== 'About us' || adres !== '?dil=en' || kalici !== 'en' || !takvim.startsWith('Munich')) throw new Error(`${nav} ${adres} ${kalici} ${takvim}`);
  },
  async 'takvime ekle: kart .ics üretir (UTC saat, başlık, yer)'(s) {
    await s.git('./#gundem');
    if (!(await kosulBekle(s, `!!document.querySelector('#etkinlik-kart-ornek-teknik-gezi .etkinlik__eylem .dugme--ikincil')`, 6000))) throw new Error('düğme yok');
    const r = await s.js(`(async () => {
      let yakalanan = null; const asil = URL.createObjectURL;
      URL.createObjectURL = (b) => { yakalanan = b; return asil.call(URL, b); };
      HTMLAnchorElement.prototype.click = function () {};
      const b = [...document.querySelectorAll('#etkinlik-kart-ornek-teknik-gezi .etkinlik__eylem button')].find((x) => x.textContent === 'Takvime ekle'); b.click();
      URL.createObjectURL = asil;
      return { tur: yakalanan?.type, metin: yakalanan ? await yakalanan.text() : '' };
    })()`);
    const m = r.metin;
    if (r.tur !== 'text/calendar' || !/^BEGIN:VCALENDAR\r\n/.test(m) || !/DTSTART:\d{8}T063000Z/.test(m) || !m.includes('SUMMARY:Teknik gezi (örnek)') || !m.includes('LOCATION:Hangar (örnek)') || m.split('\r\n').some((l) => new TextEncoder().encode(l).length > 75) || !m.includes('\r\n ')) throw new Error(JSON.stringify(r).slice(0, 400));
    console.log(`      takvim: ${r.tur}, ${m.split('\r\n').length} satır, ${m.match(/DTSTART:\S+/)[0]} (09:30 İstanbul)`);
  },
  async 'dil değişimi: dönen pano ve açık misafir formu bozulmaz'(s) {
    await s.git('./#etkinlikler');
    await s.js(`document.querySelector('#dil-dugme').click()`);   /* pano dönerken */
    await kosulBekle(s, `document.documentElement.lang === 'en'`, 5000); await bekle(1800);
    const en = await s.js(`document.querySelector('tr[data-bilet=pegasus] button').textContent`);
    await s.js(`document.querySelector('#dil-dugme').click()`);
    await kosulBekle(s, `document.documentElement.lang === 'tr'`, 5000); await bekle(300);
    const tr = await s.js(`document.querySelector('tr[data-bilet=pegasus] button').textContent`);
    await s.js(`document.querySelector('#gundem').scrollIntoView({ behavior: 'instant' })`);
    await kosulBekle(s, `!!document.querySelector('#etkinlik-kart-ornek-teknik-gezi .dugme--birincil')`, 6000);
    await s.js(`document.querySelector('#etkinlik-kart-ornek-teknik-gezi .dugme--birincil').click()`);
    await doldur(s, '#misafir-ornek-teknik-gezi', { ad: 'Kalıcı' });
    await s.js(`document.querySelector('#dil-dugme').click()`);
    await kosulBekle(s, `document.documentElement.lang === 'en'`, 5000); await bekle(300);
    const form = await s.js(`document.querySelector('#misafir-ornek-teknik-gezi')?.elements.ad.value`);
    await s.js(`document.querySelector('#dil-dugme').click()`);
    if (en !== 'Pegasus technical trip' || tr !== 'Pegasus teknik gezisi' || form !== 'Kalıcı') throw new Error(JSON.stringify({ en, tr, form }));
    console.log(`      dil: pano "${en}" → "${tr}" · misafir formu korundu ("${form}")`);
  },
  async 'pano: Enter biniş kartını açar, Esc kapatır, odak döner'(s) {
    await s.git('./#etkinlikler');
    await s.js(`document.querySelector('tr[data-bilet=pegasus] button').focus()`);
    await s.tus('Enter', 'Enter', 13); await bekle(300);
    const ad = await s.js(`document.querySelector('#bilet').open && document.querySelector('#bilet-ad').textContent`);
    await s.tus('Escape', 'Escape', 27); await bekle(300);
    const odak = await s.js(`document.activeElement === document.querySelector('tr[data-bilet=pegasus] button')`);
    if (ad !== 'Pegasus teknik gezisi' || !odak) throw new Error(`${ad} ${odak}`);
  },
  async 'takvim: ok tuşu + Enter seçer, panel güncellenir'(s) {
    await s.git('./#ag');
    if (!(await s.bekleOge('#harita[data-cizici]', 8000))) throw new Error('harita kurulmadı');
    await s.js(`document.querySelector('#takvim').focus()`);
    await s.tus('ArrowDown', 'ArrowDown', 40); await s.tus('ArrowDown', 'ArrowDown', 40); await s.tus('Enter', 'Enter', 13); await bekle(400);
    const ad = await s.js(`document.querySelector('.ag__secim-ad').textContent`);
    if (!ad.startsWith('Rzeszów')) throw new Error(ad);
  },
  async 'bölüm bağlantısı: /#ag ile açılış bölüme doğrudan atlar (yumuşak kaydırma yüklemeden sonra)'(s) {
    await s.git('./?yeniden=bag#ag');
    await bekle(600);
    const r = await s.js(`({ y: Math.round(scrollY), ust: Math.round(document.querySelector('#ag').getBoundingClientRect().top), pad: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) })`);
    await kosulBekle(s, `document.documentElement.classList.contains('yumusak')`, 3000);
    const davranis = await s.js(`getComputedStyle(document.documentElement).scrollBehavior`);
    if (r.y < 4000 || Math.abs(r.ust - r.pad) > 4 || davranis !== 'smooth') throw new Error(JSON.stringify({ ...r, davranis }));
    console.log(`      bölüm bağlantısı: 600 ms içinde scrollY ${r.y}, #ag üstü ${r.ust} px (scroll-padding ${r.pad}), sonra kaydırma "${davranis}"`);
  },
  async 'yönetim: yönetici sayfası etkinlikleri listeler'(s) {
    await s.git('./#hesap');
    await kosulBekle(s, `!document.querySelector('#giris-form fieldset').disabled`, 6000);
    await doldur(s, '#giris-form', { kim: KISI.eposta, parola: KISI.parola });
    await s.js(`document.querySelector('#giris-form button[type=submit]').click()`);
    if (!(await kosulBekle(s, `!document.querySelector('.profil').hidden`, 6000))) throw new Error('giriş olmadı');
    execFileSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), '..', 'sunucu', 'yonet.mjs'), 'yonetici', KISI.eposta, '--deneme']);
    await s.git('./yonetim.html');
    if (!(await kosulBekle(s, `!document.querySelector('#etkinlik-bolum').hidden && document.querySelectorAll('#etkinlik-tablo tr').length >= 2`, 6000))) throw new Error('yönetim tablosu yok');
    execFileSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), '..', 'sunucu', 'yonet.mjs'), 'uye', KISI.eposta, '--deneme']);
  },
  async 'mobil menü: açılır, bağlantı kapatır'(s) {
    await s.git('./', 390, 844);
    await s.js(`document.querySelector('#menu-dugme').click()`);
    const acik = await s.js(`getComputedStyle(document.querySelector('#menu')).display !== 'none'`);
    await s.js(`document.querySelector('#menu a[href="#ag"]').click()`); await bekle(200);
    const kapali = await s.js(`document.querySelector('#menu-dugme').getAttribute('aria-expanded') === 'false'`);
    if (!acik || !kapali) throw new Error(`${acik} ${kapali}`);
  },
  async 'taşma yok: 320 · 390 · 768 · 1024 · 1440 px'(s) {
    const tasan = [];
    for (const g of [320, 390, 768, 1024, 1440]) { await s.git('./', g, 800); await s.js(OTUR); const w = await s.js('document.documentElement.scrollWidth'); if (w > g) tasan.push(`${g}: ${w}`); }
    if (tasan.length) throw new Error(tasan.join(', '));
  },
  async 'hareket azaltma: ?az=1 yapışkan sahne yok, ad tek hâlde, İstanbul hemen tam çizili, uçak durağan'(s) {
    await s.git('./?az=1');
    await bekle(400);
    const r = await s.js(`(() => ({ konum: getComputedStyle(document.querySelector('.giris__sahne')).position, gorunen: [...document.querySelectorAll('.ad__durum')].map((e) => getComputedStyle(e).visibility).join(),
      silet: document.querySelector('#istanbul').classList.contains('ist--kuruldu') && [...document.querySelectorAll('#istanbul .parca')].every((p) => getComputedStyle(p).opacity === '1' && getComputedStyle(p).animationName === 'none'), iz: document.querySelector('#hikaye-iz').offsetHeight < innerHeight * 1.5 }))()`);
    if (r.konum !== 'relative' || r.gorunen !== 'visible,hidden,hidden' || !r.silet || !r.iz) throw new Error(JSON.stringify(r));
  },
  async 'klavye: ilk Tab "İçeriğe geç" görünür'(s) {
    await s.git('./');
    await s.tus('Tab', 'Tab', 9);
    const r = await s.js(`(() => { const a = document.activeElement; const b = a.getBoundingClientRect(); return [a.className, b.top >= 0]; })()`);
    if (r[0] !== 'atla' || !r[1]) throw new Error(JSON.stringify(r));
  },
  async 'harita: İstanbul’dan rotalar, etkinlik seçince rota çizilir, uçak hedefe varır, km sayacı mesafeyi gösterir'(s) {
    await s.git('./?olc=1#ag');
    if (!(await kosulBekle(s, `!!document.querySelector('#harita[data-cizici]') && !!globalThis.__ag`, 8000))) throw new Error('harita kurulmadı');
    await s.js(`document.querySelector('#olay-18').click()`);
    await kosulBekle(s, `__ag.cizici.durum().secili?.ilerleme === 1`, 5000);
    await bekle(1300);
    const r = await s.js(`(() => { const t = document.querySelector('#harita-tuval'); const d = t.getContext('2d').getImageData(0, 0, t.width, t.height).data; let petrol = 0; for (let j = 0; j < d.length; j += 16) if (d[j] > 215 && d[j + 1] > 170 && d[j + 1] < 215 && d[j + 2] < 60 && d[j + 3] > 200) petrol++;   /* seçili rota: gece sarısı */
      return { durum: __ag.cizici.durum(), km: document.querySelector('#ag-km').textContent, ad: document.querySelector('.ag__secim-ad').textContent, etiket: [...document.querySelectorAll('.harita__etiket:not([hidden])')].map((e) => e.textContent), petrol }; })()`);
    if (r.durum.rota < 30 || r.durum.kara < 1000 || (r.durum.ulke ?? 0) < 80 || r.durum.secili?.ilerleme !== 1 || r.km !== '2.266' || !r.ad.startsWith('Brugge') || !r.etiket.includes('Brugge') || r.petrol < 50) throw new Error(JSON.stringify(r));
    const donGorundu = await s.js(`!document.querySelector('.ag__don').hidden`);
    await s.js(`document.querySelector('.ag__don').click()`);
    const don = await s.js(`[document.querySelector('.ag__secim-ad').textContent, document.querySelector('.ag__don').hidden, __ag.cizici.durum().secili]`);
    if (!donGorundu || !don[0].startsWith('İstanbul') || !don[1] || don[2] !== null) throw new Error('dönüş: ' + JSON.stringify(don));
    console.log(`      harita: ${r.durum.rota} rota, ${r.durum.ulke} ülke (${r.durum.kara} sınır noktası) · Ideathon seçildi → rota tamam, sayaç ${r.km} km, etiketler [${r.etiket.join(', ')}], sarı rota piksel ${r.petrol}`);
  },
  async 'EN: her çevrilebilir öğe sözlükteki İngilizce metinle aynı, kart ve küre İngilizce'(s) {
    await s.git('./?dil=en');
    if (!(await kosulBekle(s, `document.documentElement.lang === 'en' && !document.documentElement.classList.contains('dil-bekle')`, 6000))) throw new Error('EN açılmadı');
    await kosulBekle(s, `document.querySelector('#hesap-dugme').textContent === 'Sign in' && !!document.querySelector('.etkinlik__durum span')`, 8000);   /* hesap modülü sunucudan yanıt alınca yazar */
    const sonuc = await s.js(`(async () => {
      const { SAYFA, JS } = await import('/dil/en.mjs');
      const fark = [];
      for (const e of document.querySelectorAll('[data-i18n]')) if (e.textContent.trim() !== SAYFA[e.dataset.i18n].trim()) fark.push(e.dataset.i18n);
      const div = document.createElement('div');
      for (const e of document.querySelectorAll('[data-i18n-html]')) { div.innerHTML = SAYFA[e.dataset.i18nHtml]; if (e.textContent.trim() !== div.textContent.trim()) fark.push(e.dataset.i18nHtml); }
      for (const e of document.querySelectorAll('[data-i18n-aria]')) if (e.getAttribute('aria-label') !== SAYFA[e.dataset.i18nAria]) fark.push('aria:' + e.dataset.i18nAria);
      for (const e of document.querySelectorAll('[data-i18n-alt]')) if (e.getAttribute('alt') !== SAYFA[e.dataset.i18nAlt]) fark.push('alt:' + e.dataset.i18nAlt);
      const say = document.querySelectorAll('[data-i18n],[data-i18n-html],[data-i18n-aria],[data-i18n-alt]').length;
      return { fark, say, baslik: document.title, hesap: document.querySelector('#hesap-dugme').textContent, kart: document.querySelector('.etkinlik__durum span')?.textContent || '', bos: JS.etkinlikYok };
    })()`);
    await s.js(`document.querySelector('tr[data-bilet=tusas] button').click()`); await bekle(300);
    const bilet = await s.js(`[document.querySelector('#bilet-ad').textContent, document.querySelector('[data-alan=durum]').textContent, document.querySelector('[data-alan=metin]').textContent]`);
    await s.js(`document.querySelector('#bilet').close()`);
    await s.js(`document.querySelector('#ag').scrollIntoView({ behavior: 'instant' })`);
    await kosulBekle(s, `!!document.querySelector('#harita[data-cizici]')`, 8000);
    const panel = await s.js(`document.querySelector('.ag__secim-alt').textContent`);
    const yazi = (await s.js(`document.querySelector('.kartpostal h3 a').textContent`)).replace(/ /g, ' ');   /* başlıkta ay–yıl arası bölünmez boşluk */
    if (sonuc.fark.length) throw new Error('çevrilmemiş: ' + sonuc.fark.join(', '));
    if (!sonuc.baslik.startsWith('ITU UUMK') || sonuc.hesap !== 'Sign in' || !['Registration open', 'Registration closed', 'Full'].includes(sonuc.kart)) throw new Error(JSON.stringify(sonuc));
    if (bilet[0] !== 'TUSAŞ technical trip' || bilet[1] !== 'Held' || !bilet[2].startsWith('We toured the production lines')) throw new Error(JSON.stringify(bilet));
    if (!panel.startsWith('Türkiye') && !panel.startsWith('Turkey')) throw new Error(panel);
    if (!panel.includes('Nearest group') || !yazi.startsWith('AS Istanbul July 2026')) throw new Error(`${panel} | ${yazi}`);
    console.log(`      EN: ${sonuc.say} çevrilebilir öğe, fark 0 · kart "${sonuc.kart}" · bilet "${bilet[0]}" · harita "${panel.slice(0, 60)}…" · yazı "${yazi}"`);
  },
  async 'hesap silme: tarayıcıda parolayla silinir, sonra aynı bilgilerle giriş reddedilir'(s) {
    const k = { ad: 'Silinecek', soyad: 'Hesap', eposta: `sil.${DAMGA}@itu.edu.tr`, okul_no: `14${DAMGA}`, parola: 'silinecek-parola-1' };
    await s.git('./#hesap');
    await kosulBekle(s, `!document.querySelector('#giris-form fieldset').disabled`, 6000);
    await s.js(`document.querySelector('#sekme-kayit').click()`);
    await doldur(s, '#kayit-form', { ...k, kvkk: true });
    await s.js(`document.querySelector('#kayit-form button[type=submit]').click()`);
    if (!(await kosulBekle(s, `!document.querySelector('.profil').hidden`, 6000))) throw new Error('hesap açılmadı');
    await s.js(`document.querySelector('.profil__sil').open = true`);
    await doldur(s, '#sil-form', { parola: 'yanlis-parola-1' });
    await s.js(`document.querySelector('#sil-form button[type=submit]').click()`);
    if (!(await kosulBekle(s, `document.querySelector('#sil-form-parola').getAttribute('aria-invalid') === 'true'`, 4000))) throw new Error('yanlış parola reddedilmedi');
    await doldur(s, '#sil-form', { parola: k.parola });
    await s.js(`document.querySelector('#sil-form button[type=submit]').click()`);
    await bekle(1500);
    await kosulBekle(s, `document.readyState === 'complete' && !document.querySelector('#giris-form fieldset').disabled && document.querySelector('.profil').hidden`, 10000);
    const profilGizli = await s.js(`document.querySelector('.profil').hidden`);
    const r = await s.js(`fetch('/api/hesap/giris', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-UUMK': '1' }, body: JSON.stringify({ kim: '${k.eposta}', parola: '${k.parola}' }) }).then((x) => x.status)`);
    if (!profilGizli || r !== 401) throw new Error(`profil gizli ${profilGizli} giriş ${r}`);
    console.log(`      silme: yanlış parola reddedildi, doğru parolayla silindi, sonraki giriş ${r}`);
  },
  async 'kıyı: açılıştaki deniz rıhtımda biter, vapur kaydırmayla karşıya geçer, semboller dosyada'(s) {
    await s.git('./?olc=1');
    const olc = `(() => { const k = document.querySelector('#kiyi'), r = k.getBoundingClientRect(), v = k.querySelector('.kiyi__vapur').getBoundingClientRect(), s = document.querySelector('.giris__sahne').getBoundingClientRect(); return { gecis: +(k.style.getPropertyValue('--gecis') || 0), vx: Math.round(v.left), bitisik: Math.round(r.top - s.bottom), gen: Math.round(r.width), ic: innerWidth }; })()`;
    await s.js(`document.querySelector('#kiyi').scrollIntoView({ block: 'end', behavior: 'instant' })`); await bekle(300);
    const a = await s.js(olc);
    await s.js(`scrollBy({ top: 300, behavior: 'instant' })`); await kosulBekle(s, `+(document.querySelector('#kiyi').style.getPropertyValue('--gecis') || 0) > ${a.gecis}`, 4000); await bekle(200);
    const b = await s.js(olc);
    const svg = await s.js(`fetch('gorseller/semboller.svg').then((r) => r.text()).then((t) => ['kiyi-su', 'kiyi-rihtim', 'kiyi-vapur'].every((k) => t.includes('<symbol id="' + k + '"')))`);
    if (!(b.gecis > a.gecis) || !(b.vx > a.vx) || Math.abs(a.bitisik) > 2 || a.gen !== a.ic || !svg) throw new Error(JSON.stringify({ a, b, svg }));
    console.log(`      kıyı: açılışa bitişik (${a.bitisik} px), tam genişlik · vapur ${a.vx} → ${b.vx} px (geçiş ${a.gecis} → ${b.gecis}) · semboller dosyada`);
  },
  async 'yönetim arayüzü: etkinlik ekle → gündemde görünür → misafir kaydı CSV dosyasında'(s) {
    const y = { ad: 'Yonetici', soyad: 'Deneme', eposta: `yon.${DAMGA}@itu.edu.tr`, okul_no: `15${DAMGA}`, parola: 'yonetici-parola-1' };
    await s.git('./#hesap');
    await kosulBekle(s, `!document.querySelector('#giris-form fieldset').disabled`, 6000);
    await s.js(`document.querySelector('#sekme-kayit').click()`);
    await doldur(s, '#kayit-form', { ...y, kvkk: true });
    await s.js(`document.querySelector('#kayit-form button[type=submit]').click()`);
    if (!(await kosulBekle(s, `!document.querySelector('.profil').hidden`, 6000))) throw new Error('hesap açılmadı');
    execFileSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), '..', 'sunucu', 'yonet.mjs'), 'yonetici', y.eposta, '--deneme']);
    await s.git('./yonetim.html');
    if (!(await kosulBekle(s, `!document.querySelector('#etkinlik-bolum').hidden`, 6000))) throw new Error('yönetim açılmadı');
    const id = `sinama-${DAMGA}`;
    const tarih = new Date(Date.now() + 15 * 864e5).toISOString().slice(0, 10) + 'T10:00';
    await doldur(s, '#etkinlik-form', { id, baslangic: tarih, baslik_tr: `Sınama etkinliği ${DAMGA}`, baslik_en: `Test event ${DAMGA}`, yer_tr: 'Sınama', kontenjan: '5', kayit_acik: true, yayinda: true });
    await s.js(`document.querySelector('#etkinlik-form button[type=submit]').click()`);
    if (!(await kosulBekle(s, `[...document.querySelectorAll('#etkinlik-tablo th')].some((t) => t.textContent.includes('${id}'))`, 6000))) throw new Error('etkinlik tabloya gelmedi');
    await s.git('./#gundem');
    if (!(await kosulBekle(s, `!!document.querySelector('#etkinlik-kart-${id}')`, 6000))) throw new Error('gündemde görünmedi');
    await s.js(`fetch('/api/hesap/cikis', { method: 'POST', headers: { 'X-UUMK': '1' } })`);
    await s.git('./?yeniden=1#gundem');          /* aynı adrese gitmek yalnız çapaya atlar; yeniden yükleme şart */
    await kosulBekle(s, `!!document.querySelector('#etkinlik-kart-${id} .dugme--birincil')`, 6000);
    await s.js(`document.querySelector('#etkinlik-kart-${id} .dugme--birincil').click()`);
    const misafir = `csv.${DAMGA}@itu.edu.tr`;
    await doldur(s, '#misafir-' + id, { ad: 'Csv', soyad: 'Misafir', eposta: misafir, okul_no: `16${DAMGA}`, kvkk: true });
    await s.js(`document.querySelector('#misafir-${id} button[type=submit]').click()`);
    if (!(await kosulBekle(s, `document.querySelector('#etkinlik-kart-${id} .etkinlik__durum')?.textContent.includes('4')`, 6000))) throw new Error('kalan 4 olmadı');
    await s.js(`fetch('/api/hesap/giris', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-UUMK': '1' }, body: JSON.stringify({ kim: '${y.eposta}', parola: '${y.parola}' }) })`);
    const csv = await s.js(`fetch('/api/yonetim/etkinlikler/${id}/kayitlar?bicim=csv').then((r) => r.text())`);
    execFileSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), '..', 'sunucu', 'yonet.mjs'), 'uye', y.eposta, '--deneme']);
    if (!csv.includes(misafir) || !csv.includes('"evet"')) throw new Error('CSV: ' + csv.slice(0, 200));
    console.log(`      yönetim: "${id}" arayüzden eklendi, gündemde göründü, misafir kaydı CSV'de (${csv.trim().split('\n').length - 1} satır)`);
  },
  async 'header: gerçek logo, dil ve hesap düğmesi, etkin menü, aşağı kaydırınca gizlenir, yukarıda döner'(s) {
    await s.git('./');
    await s.js(OTUR);
    const ust = await s.js(`(() => { const u = document.querySelector('#ust'); const logo = u.querySelector('.ust__logo img'); return {
      logo: logo.getAttribute('src'), logoY: Math.round(logo.getBoundingClientRect().height), logoYuklu: logo.complete && logo.naturalWidth >= 2 * logo.getBoundingClientRect().width,   /* en az 2 kat çözünürlük */
      nav: [...u.querySelectorAll('.menu ul a')].map((a) => a.lastElementChild.textContent), dil: u.querySelector('#dil-dugme').dataset.etkin + '/' + u.querySelectorAll('#dil-dugme svg.bayrak').length, hesap: u.querySelector('#hesap-dugme').textContent,
      h: Math.round(u.getBoundingClientRect().height), konum: getComputedStyle(u).position, kenar: getComputedStyle(u).borderBottomColor }; })()`);
    await s.js(`document.querySelector('#yazilar').scrollIntoView({ behavior: 'instant' })`);
    await kosulBekle(s, `document.querySelector('.menu a[href="#yazilar"]').getAttribute('aria-current') === 'true'`, 3000);
    const etkin = await s.js(`[...document.querySelectorAll('.menu a[aria-current=true]')].map((a) => a.lastElementChild.textContent)`);
    await s.js(`window.__iz = []; addEventListener('scroll', () => __iz.push([Math.round(scrollY), document.documentElement.scrollHeight, document.querySelector('#ust').classList.contains('ust--gizli') ? 'G' : '-', Math.round(performance.now())]))`);
    await s.js(`window.scrollBy({ top: 600, behavior: 'instant' })`); await bekle(250);
    await s.js(`window.scrollBy({ top: 300, behavior: 'instant' })`);
    const gizli = await kosulBekle(s, `document.querySelector('#ust').classList.contains('ust--gizli')`, 3000);
    await s.js(OTUR);   /* iki kare: +300 ile -200 aynı karede birleşirse net +100 olur ve şerit haklı olarak gizli kalır */
    await s.js(`window.scrollBy({ top: -200, behavior: 'instant' })`);
    const dondu = await kosulBekle(s, `!document.querySelector('#ust').classList.contains('ust--gizli')`, 3000);
    const yler = await s.js(`Math.round(scrollY)`);
    const dolu = await kosulBekle(s, `parseFloat(getComputedStyle(document.querySelector('#ust')).getPropertyValue('--ilerleme')) > 0.3 && getComputedStyle(document.querySelector('.menu__isaret')).opacity === '1'`, 3000);
    if (ust.logo !== 'gorseller/logo-uumk-360.png' || !ust.logoYuklu || ust.logoY < 30 || ust.nav.length !== 6 || ust.dil !== 'tr/2' || ust.hesap !== 'Giriş yap' || ust.konum !== 'fixed') throw new Error(JSON.stringify(ust));
    if (etkin.join() !== 'Yazılar' || !gizli || !dondu || !dolu) throw new Error(`etkin ${etkin} gizli ${gizli} döndü ${dondu} dolu ${dolu} scrollY ${yler} sınıf ${await s.js(`document.querySelector('#ust').className`)} iz ${JSON.stringify(await s.js(`__iz`))}`);
    console.log(`      header: logo ${ust.logoY} px (asıl ${ust.logo}), menü ${ust.nav.length} madde, etkin "${etkin}", aşağıda gizlendi, yukarıda döndü, kaydırınca alt çizgi`);
  },
  async 'footer: gece İstanbul’u kurulur ve ışıklar yanar, iki beyaz logo (AS Istanbul vektör, ≥ 72 px), adres, e-posta, üye ol / sponsor ol kartları, site ve kanal bağlantıları, siyah zemin'(s) {
    await s.git('./');
    await s.js(`document.querySelector('.alt').scrollIntoView({ behavior: 'instant' })`);
    await kosulBekle(s, `[...document.querySelectorAll('.alt__marka img')].every((i) => i.complete && i.naturalWidth > 0)`, 5000);   /* logolar loading=lazy */
    const isikOnce = await s.js(`(() => { const g = document.querySelector('#istanbul-gece'); return g ? getComputedStyle(g.querySelector('.p.y1')).fill : 'yok'; })()`);
    const isikli = await kosulBekle(s, `document.querySelector('#istanbul-gece')?.classList.contains('ist--isik')`, 6000); await bekle(300);
    await s.js(`document.querySelector('#istanbul-gece').getAnimations({ subtree: true }).forEach((x) => { if (x instanceof CSSTransition) x.finish(); })`);   /* gizli sekmede geçişler ilerlemez: sınıf geldikten sonra son değer ölçülür */
    const gece = await s.js(`(() => { const g = document.querySelector('#istanbul-gece'); return { sinif: g.getAttribute('class'), yanik: getComputedStyle(g.querySelector('.p.y1')).fill, blok: g.querySelectorAll('.blok').length, kopru: !!g.querySelector('.blok--kopru'), kiz: !!g.querySelector('.blok--kiz') }; })()`);
    if (!isikli || gece.yanik !== 'rgb(242, 194, 0)' || isikOnce === gece.yanik || gece.blok < 50 || !gece.kopru || !gece.kiz) throw new Error('gece: ' + JSON.stringify({ isikOnce, gece }));
    const a = await s.js(`(() => { const f = document.querySelector('.alt'); return {
      zemin: getComputedStyle(f).backgroundColor, logolar: [...f.querySelectorAll('.alt__marka img')].map((i) => [i.getAttribute('src'), i.complete && i.naturalWidth > 0]),
      adres: f.querySelector('.alt__adres').textContent.includes('Katar Cad.'), eposta: f.querySelector('.alt__eposta a')?.getAttribute('href'), sponsor: f.querySelector('a[href="#sponsor"]')?.textContent,
      site: [...f.querySelectorAll('nav[aria-labelledby=alt-site] a')].map((x) => x.getAttribute('href')), kanal: [...f.querySelectorAll('nav[aria-labelledby=alt-kanal] a')].map((x) => new URL(x.href).hostname),
      hedef: Math.min(...[...f.querySelectorAll('ul a')].map((x) => x.getBoundingClientRect().height)), logoAs: Math.round(f.querySelector('.alt__logo-as').getBoundingClientRect().height), dip: f.querySelector('.alt__dip').textContent.includes('© 2026') }; })()`);
    const kvkk = await s.js(`fetch('kvkk.html').then((r) => r.status)`);
    if (a.zemin !== 'rgb(26, 26, 26)' || a.logolar.length !== 2 || !a.logolar.every((l) => l[1] && l[0].includes('beyaz')) || !a.adres || a.eposta !== 'mailto:istanbul@euroavia.eu' || !/Sponsorluk ve iş birliği/.test(a.sponsor || '') || a.logoAs < 72) throw new Error(JSON.stringify(a));
    if (!a.site.includes('kvkk.html') || a.kanal.length !== 4 || a.hedef < 44 || !a.dip || kvkk !== 200) throw new Error(JSON.stringify(a) + ' kvkk ' + kvkk);
    console.log(`      footer: gece İstanbul'u ${gece.blok} blok, pencere ${isikOnce} → ${gece.yanik} · zemin ${a.zemin} (#1a1a1a), ${a.logolar.length} beyaz logo, adres + ${a.eposta}, site ${a.site.length} · kanal ${a.kanal.length} bağlantı (en küçük ${Math.round(a.hedef)} px), kvkk.html ${kvkk}`);
  },
  async 'tipografi ve palet (tarayıcıda): yalnız iki yazı tipi yüklenir, 6 punto, başlık Jost, gövde IBM Plex Sans'(s) {
    await s.git('./?p=1');
    await s.js(OTUR);
    for (const sec of ['#gundem', '#etkinlikler', '#yazilar', '#kulup', '#ag', '#hesap']) { await s.js(`document.querySelector('${sec}').scrollIntoView({ behavior: 'instant' })`); await bekle(150); }
    await s.js(`document.fonts.ready`);
    const r = await s.js(`(() => {
      const yuklu = [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')))];
      const gor = (e) => { const b = e.getBoundingClientRect(); const c = getComputedStyle(e); return b.width > 0 && b.height > 0 && c.visibility !== 'hidden' && c.display !== 'none'; };
      const metinli = [...document.querySelectorAll('body *')].filter((e) => !e.closest('dialog:not([open]),[hidden]') && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && gor(e));
      const punto = [...new Set(metinli.map((e) => getComputedStyle(e).fontSize))];
      const aile = [...new Set(metinli.map((e) => getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g, '').trim()))];
      return { yuklu, punto, aile, h1g: getComputedStyle(document.querySelector('h1')).fontStretch, h1w: getComputedStyle(document.querySelector('h1')).fontWeight, h1: getComputedStyle(document.querySelector('h1')).fontFamily.split(',')[0], h2: getComputedStyle(document.querySelector('#gundem h2')).fontFamily.split(',')[0], govde: getComputedStyle(document.body).fontFamily.split(',')[0],
        birincil: getComputedStyle(document.querySelector('#giris-form .dugme--birincil')).backgroundColor };
    })()`);
    const izinli = ['IBM Plex Sans', 'Jost'];
    if (!r.yuklu.every((f) => izinli.includes(f)) || !r.aile.every((f) => izinli.includes(f)) || r.punto.length > 6) throw new Error(JSON.stringify(r));
    if (!/Jost/.test(r.h1) || !/Jost/.test(r.h2) || r.h1w !== '600' || !/IBM Plex Sans/.test(r.govde) || r.birincil !== 'rgb(5, 107, 122)') throw new Error(JSON.stringify(r));
    console.log(`      tipografi: yüklenen [${r.yuklu.join(', ')}] · kullanılan aileler [${r.aile.join(', ')}] · ${r.punto.length} punto (${r.punto.join(' ')}) · birincil düğme ${r.birincil} (#056b7a)`);
  },
  async 'kuruluş ve tarihçe: 2001 iki dilde, rota kaydırdıkça dolar, noktalar sırayla işaretlenir'(s) {
    await s.git('./');
    const nokta = `({ textContent: [...document.querySelectorAll('.rota__nokta')].filter((l) => l.querySelector('time').textContent === '2001').map((l) => l.textContent).join(' ') })`;
    let tr = await s.js(`${nokta}.textContent`);
    await s.js(`document.querySelector('#kulup').scrollIntoView({ behavior: 'instant' })`); await bekle(300);
    const r = await s.js(`(() => { const r = document.querySelector('#rota').getBoundingClientRect(); return { ust: Math.round(r.top), gecti: document.querySelectorAll('.rota__nokta[data-gecti]').length }; })()`);
    await s.js(`document.querySelector('#rota').scrollIntoView({ block: 'end', behavior: 'instant' }); window.scrollBy({ top: 400, behavior: 'instant' })`);
    await kosulBekle(s, `document.querySelectorAll('.rota__nokta[data-gecti]').length === document.querySelectorAll('.rota__nokta').length`, 4000);
    const r2 = await s.js(`document.querySelectorAll('.rota__nokta[data-gecti]').length`), toplam = await s.js(`document.querySelectorAll('.rota__nokta').length`);
    await s.js(`document.querySelector('#dil-dugme').click()`);
    await kosulBekle(s, `document.documentElement.lang === 'en'`, 5000);
    let en = await s.js(`${nokta}.textContent`);
    [tr, en] = [tr, en].map((m) => m.replace(/ /g, ' '));   /* tarihlerde bölünmez boşluk */
    if (!tr.includes('4 Ocak') || !tr.includes('7 Mayıs') || !tr.includes('EUROAVIA') || !en.includes('4 January') || !en.includes('7 May') || r2 < r.gecti || toplam < 15 || r2 !== toplam) throw new Error(JSON.stringify({ tr, en, r, r2 }));
    console.log(`      kuruluş: TR "${tr.slice(0, 70)}…" · EN "${en.slice(0, 60)}…" · tarihçe şeritleri ${r.gecti} → ${r2}/${toplam}`);
  },
  async 'EUROAVIA takvimi: yarım satır yok, "Tüm takvim" açar/kapatır'(s) {
    await s.git('./#ag');
    if (!(await kosulBekle(s, `!!document.querySelector('.takvim__tum')?.textContent`, 8000))) throw new Error('düğme yok');
    const r = await s.js(`(() => { const l = document.querySelector('#takvim'), b = document.querySelector('.takvim__tum'), alt = l.getBoundingClientRect().bottom;
      const yarim = [...l.children].filter((x) => { const q = x.getBoundingClientRect(); return q.top < alt - 1 && q.bottom > alt + 1; }).length;
      const ilk = { yuk: l.clientHeight, yarim, metin: b.textContent, acik: b.getAttribute('aria-expanded') };
      b.click(); const ac = { kaydir: l.scrollHeight - l.clientHeight, acik: b.getAttribute('aria-expanded') }; b.click();
      return { ilk, ac, son: l.clientHeight }; })()`);
    if (r.ilk.yarim || r.ilk.acik !== 'false' || !/19/.test(r.ilk.metin) || r.ac.kaydir > 1 || r.ac.acik !== 'true' || r.son !== r.ilk.yuk) throw new Error(JSON.stringify(r));
    console.log(`      takvim: ${r.ilk.yuk} px, yarım satır ${r.ilk.yarim}, "${r.ilk.metin}" → açık (taşma ${r.ac.kaydir}) → kapalı`);
  },
  async 'telefonda tarihçe: dikey iz kaydırdıkça dolar, şeritler izin ucuyla birlikte işaretlenir'(s) {
    await s.git('./', 390, 844);
    const olc = `(() => { const r = document.querySelector('#rota'); return { t: Number(r.style.getPropertyValue('--rota-t') || 0), gecti: r.querySelectorAll('[data-gecti]').length, cizgi: getComputedStyle(r, '::before').borderLeftStyle }; })()`;
    await s.js(`document.querySelector('#rota').scrollIntoView({ block: 'end', behavior: 'instant' }); scrollBy({ top: -500, behavior: 'instant' })`); await bekle(250);
    const a = await s.js(olc);
    await s.js(`scrollBy({ top: 400, behavior: 'instant' })`); await bekle(250);
    const b = await s.js(olc);
    await s.js(`document.querySelector('#rota').scrollIntoView({ block: 'end', behavior: 'instant' }); scrollBy({ top: 700, behavior: 'instant' })`); await kosulBekle(s, `document.querySelectorAll('.rota__nokta[data-gecti]').length === document.querySelectorAll('.rota__nokta').length`, 3000);
    const c = await s.js(olc), toplam = await s.js(`document.querySelectorAll('.rota__nokta').length`);
    if (a.cizgi !== 'dashed' || !(b.t > a.t) || !(b.gecti >= a.gecti) || c.t !== 1 || toplam < 15 || c.gecti !== toplam) throw new Error(JSON.stringify({ a, b, c }));
    console.log(`      telefonda tarihçe: iz ${a.t} → ${b.t} → ${c.t}, işaretli şerit ${a.gecti} → ${b.gecti} → ${c.gecti}/${toplam}`);
  },
  async 'açılış İstanbul’u: blok blok kurulur (parçalar önce görünmez, sonra hepsi), dalgalar ve vapur akar, gökte kâğıt uçaklar'(s) {
    await s.git('./?olc=1');
    const ilk = await s.js(`(() => { const p = [...document.querySelectorAll('#istanbul .parca')]; return { n: p.length, gorunen: p.filter((e) => +getComputedStyle(e).opacity > 0.99).length, kur: document.querySelector('#istanbul').classList.contains('ist--kur') }; })()`);
    await kosulBekle(s, `document.querySelector('#istanbul').classList.contains('ist--kuruldu')`, 6000);
    const son = await s.js(`(() => { const ist = document.querySelector('#istanbul'), p = [...ist.querySelectorAll('.parca')];
      const d = ist.querySelector('.dalga--1'), v = ist.querySelector('.vapur-yol'), m1 = getComputedStyle(d).transform, v1 = getComputedStyle(v).transform;
      return new Promise((r) => setTimeout(() => r({ gorunen: p.filter((e) => getComputedStyle(e).opacity === '1').length, n: p.length, dalga: getComputedStyle(d).animationName === 'dalga-ak' && document.getAnimations().some((x) => x.animationName === 'dalga-ak' && x.playState === 'running'), vapur: getComputedStyle(v).animationName === 'vapur-git' && document.getAnimations().some((x) => x.animationName === 'vapur-git' && x.playState === 'running'),
        yer: ['galata', 'kiz', 'kopru', 'cami'].map((k) => { const b = ist.querySelector('.blok--' + k).getBoundingClientRect(); return b.width > 10 && b.bottom > 0 && b.top < innerHeight; }) }), 600)); })()`);
    /* kademe: inşayı yeniden başlat, animasyon zamanını elle ilerlet (gizli sekmede zaman çizelgesi durabilir) */
    const kademe = await s.js(`(() => { const ist = document.querySelector('#istanbul'), p = [...ist.querySelectorAll('.parca')];
      ist.classList.remove('ist--kuruldu', 'ist--kur'); void ist.getBoundingClientRect(); ist.classList.add('ist--kur');
      const an = document.getAnimations().filter((a) => a.animationName === 'parca-kur'), o = [];
      for (const t of [0, 300, 700, 1100, 1600, 2400]) { an.forEach((a) => { a.pause(); a.currentTime = t; }); o.push(p.filter((e) => +getComputedStyle(e).opacity > 0.95).length); }
      an.forEach((a) => a.finish()); ist.classList.add('ist--kuruldu'); ist.classList.remove('ist--kur'); return o; })()`);
    const kademeli = kademe[0] === 0 && kademe.every((v, i) => i === 0 || v >= kademe[i - 1]) && kademe.slice(1, 4).some((v) => v > 0 && v < ilk.n * 0.9) && kademe.at(-1) >= ilk.n - 5;
    /* gökteki küçük uçaklar: tuvalin üst sağ çeyreğinde koyu piksel */
    const gok = await s.js(`(() => { const t = document.querySelector('#ucus-tuval'), g = t.getContext('2d'), w = t.width, h = t.height; const d = g.getImageData(Math.round(w * 0.5), Math.round(h * 0.08), Math.round(w * 0.5), Math.round(h * 0.3)).data; let n = 0; for (let i = 3; i < d.length; i += 16) if (d[i] > 120) n++; return n; })()`);
    if (ilk.n < 150 || ilk.gorunen > ilk.n * 0.6 || !kademeli || son.gorunen !== son.n || !son.dalga || !son.vapur || !son.yer.every(Boolean) || gok < 20) throw new Error(JSON.stringify({ ilk, son, gok, kademe }));
    console.log(`      İstanbul: ${ilk.n} parça, açılışta görünen ${ilk.gorunen} → kurulunca ${son.gorunen}/${son.n} · kademe (0/300/700/1100/1600/2400 ms) ${kademe.join(' → ')} · dalga akıyor ${son.dalga}, vapur ${son.vapur} · Galata/Kız Kulesi/köprü/cami ekranda · gökte uçak pikseli ${gok}`);
  },
  async 'biniş kartı: İngilizcede tarih, tür ve damga İngilizce; fotoğraflı etkinlikte fotoğraf'(s) {
    await s.git('./?dil=en#etkinlikler');
    await kosulBekle(s, `document.documentElement.lang === 'en'`, 5000); await bekle(1600);   /* pano dönüşü biter */
    const kart = async (id) => { await s.js(`document.querySelector('tr[data-bilet=${id}] button').click()`); await bekle(250);
      const r = await s.js(`(() => { const b = document.querySelector('#bilet'); const a = (k) => b.querySelector('[data-alan=' + k + ']').textContent; return { ac: b.open, tarih: a('tarih'), tur: a('tur'), damga: a('damga'), ucus: a('ucus'), kapi: a('kapi'), foto: b.querySelector('[data-alan=foto] img')?.alt || null, kalkis: b.querySelector('[data-i18n=kalkis]').textContent }; })()`);
      await s.js(`document.querySelector('#bilet').close()`); return r; };
    const p = await kart('pegasus'), m = await kart('muze'), t = await kart('ttechnic');
    const tr = /Bahar|Ocak|Şubat|Mart|Nisan|Mayıs|Yapıldı|Teknik gezi|Atölye/;
    if (!p.ac || p.tarih !== 'Spring 2026' || p.tur !== 'Technical trip' || p.damga !== 'Held' || !p.foto || p.kalkis !== 'Departure' || m.foto !== null || t.tarih !== '13 May 2025 · 13:30–16:30' || t.tur !== 'Workshop' || [p, m, t].some((x) => tr.test(Object.values(x).join(' '))))
      throw new Error(JSON.stringify({ p, m, t }));
    console.log(`      biniş kartı EN: "${p.tarih}" · ${p.tur} · damga ${p.damga} · ${p.ucus} · foto "${p.foto.slice(0, 40)}…" · Turkish Technic "${t.tarih}"`);
  },
  async 'sponsorluk: menüden bölüme gider, e-posta bağlantısı doğrulanmış adrese konu satırıyla, adresi kopyala bildirim verir'(s) {
    await s.git('./?az=1');   /* başsız Chrome'da yumuşak kaydırma ilerlemiyor */
    await s.cdp('Browser.grantPermissions', { permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'], origin: new URL(ADRES).origin });
    await s.js(`document.querySelector('.menu a[href="#sponsor"]').click()`); await bekle(900);
    const r = await s.js(`(() => { const a = document.querySelector('#sponsor-yaz'), u = new URL(a.href); return { ust: Math.round(document.querySelector('#sponsor').getBoundingClientRect().top), adres: u.pathname, konu: u.searchParams.get('subject'), govde: (u.searchParams.get('body') || '').slice(0, 20) }; })()`);
    await s.js(`document.querySelector('#sponsor-kopyala').click()`);
    await kosulBekle(s, `!!document.querySelector('#duyuru').textContent`, 3000);
    const bildirim = await s.js(`document.querySelector('#duyuru').textContent`);
    await s.js(`document.querySelector('#dil-dugme').click()`); await kosulBekle(s, `document.documentElement.lang === 'en'`, 4000);
    const en = await s.js(`new URL(document.querySelector('#sponsor-yaz').href).searchParams.get('subject')`);
    if (r.ust > 200 || r.adres !== 'istanbul@euroavia.eu' || r.konu !== 'Sponsorluk — İTÜ UUMK' || !r.govde.startsWith('Merhaba') || !bildirim.includes('istanbul@euroavia.eu') || en !== 'Sponsorship — ITU UUMK') throw new Error(JSON.stringify({ r, bildirim, en }));
    console.log(`      sponsorluk: bölüm üstü ${r.ust} px · mailto:${r.adres} konu "${r.konu}" (EN "${en}") · bildirim "${bildirim}"`);
  },
  async 'hesap: parola göster/gizle düğmesi, gönderimde gizlenir'(s) {
    await s.git('./#hesap');
    const r = await s.js(`(() => { const g = document.querySelector('#giris-form-parola'), d = g.parentElement.querySelector('.alan__goster'); const a = [g.type, d.textContent, d.getAttribute('aria-pressed')]; d.click(); const b = [g.type, d.textContent, d.getAttribute('aria-pressed')]; d.click(); return { a, b, c: g.type, hedef: Math.round(d.getBoundingClientRect().height) }; })()`);
    if (r.a.join() !== 'password,Göster,false' || r.b.join() !== 'text,Gizle,true' || r.c !== 'password' || r.hedef < 44) throw new Error(JSON.stringify(r));
    console.log(`      parola: ${r.a.join('/')} → ${r.b.join('/')} → ${r.c} · düğme ${r.hedef} px`);
  },
  async 'panorama sığar: 1366×768 · 1920×950 · 1440×900 · 2560×1440 · 390×844 · yatay 844×390 — su bandı görünür, görüş kutusu sahnede, metin altındaki yapılar metne binmez'(s) {
    const sonuc = [];
    for (const [g, y] of [[1366, 768], [1920, 950], [1440, 900], [2560, 1440], [390, 844], [844, 390]]) {
      await s.git('./?az=1', g, y); await s.js(OTUR);
      const r = await s.js(`(() => { const ist = document.querySelector('#istanbul'), sah = document.querySelector('.giris__sahne').getBoundingClientRect(), b = ist.getBoundingClientRect();
        const [x0, , vw] = ist.getAttribute('viewBox').split(' ').map(Number), su = ist.querySelector('.ist__yakin rect.s').getBoundingClientRect();
        const metin = document.querySelector(innerWidth > 860 ? '.giris__olgu' : '.giris__olgu').offsetParent ? document.querySelector('.giris__olgu') : document.querySelector('.giris__eylem');
        const alt = metin.getBoundingClientRect().bottom, m = document.querySelector('.giris__metin > .ad').getBoundingClientRect();
        const ust = ['.blok--galata', '.blok--cami', '.blok--ayasofya'].map((k) => [...ist.querySelectorAll(k)]).flat().map((e) => e.getBoundingClientRect())
          .filter((q) => q.width && q.right > m.left && q.left < Math.max(m.right, metin.getBoundingClientRect().right) && q.right > 0 && q.left < innerWidth).map((q) => Math.round(q.top));
        return { altFark: Math.round(sah.bottom - b.bottom), suGorunen: Math.round(Math.min(su.bottom, sah.bottom) - su.top), x0, son: x0 + vw, metinAlt: Math.round(alt), enUst: ust.length ? Math.min(...ust) : null }; })()`);
      sonuc.push(`${g}×${y}: su ${r.suGorunen} px, görüş ${Math.round(r.x0)}…${Math.round(r.son)}, metin altı ${r.metinAlt} / yapı tepesi ${r.enUst}`);
      if (Math.abs(r.altFark) > 1 || r.suGorunen < 40 || r.x0 < -400.5 || r.son > 2000.5 || (r.enUst !== null && r.enUst < r.metinAlt)) throw new Error(`${g}×${y} ${JSON.stringify(r)}`);
    }
    console.log('      ' + sonuc.join(' · '));
  },
  async 'kabin maketi: 6 numaralı ekip; GPU yoksa poster, WebGL ile 2,5B maket çizilir ve liste numarayı vurgular; telefonda taşma yok'(s) {
    await s.git('./', 1440, 900);
    await s.js(`document.querySelector('#maket').scrollIntoView({ block: 'center', behavior: 'instant' })`);
    const poster = await kosulBekle(s, `(() => { const i = document.querySelector('.maket__poster'); return i.complete && i.naturalWidth > 0; })()`, 6000);
    const a = await s.js(`({ n: document.querySelectorAll('.kabin > li').length, cizici: document.querySelector('#maket').dataset.cizici || 'yok', posterOp: getComputedStyle(document.querySelector('.maket__poster')).opacity, sigar: document.querySelector('.maket').getBoundingClientRect().height <= innerHeight })`);
    /* yazılımsal GPU'da maketi zorla kur (?webgl=1): tuval dolar, listeye gelince numara vurgulanır */
    await s.git('./?webgl=1&az=1', 1440, 900);
    await s.js(`document.querySelector('#maket').scrollIntoView({ block: 'center', behavior: 'instant' })`);
    const kuruldu = await kosulBekle(s, `document.querySelector('#maket').dataset.cizici === '3b'`, 20000);
    let b = {};
    if (kuruldu) {
      await s.js(`document.querySelectorAll('.kabin > li')[2].dispatchEvent(new PointerEvent('pointerenter'))`); await bekle(400);
      b = await s.js(`({ li: document.querySelectorAll('.kabin > li[data-secili]').length, im: [...document.querySelectorAll('.maket__imler li')].findIndex((e) => e.hasAttribute('data-secili')), imKonum: [...document.querySelectorAll('.maket__imler li')].every((e) => /translate\\(/.test(e.style.transform)) })`);
    }
    await s.git('./', 390, 844);
    await s.js(`document.querySelector('#maket').scrollIntoView({ behavior: 'instant' })`); await bekle(400);
    const t = await s.js(`({ sw: document.documentElement.scrollWidth, gen: Math.round(document.querySelector('.maket__sahne').getBoundingClientRect().width) })`);
    if (!poster || a.n !== 6 || a.cizici !== 'yok' || a.posterOp !== '1' || !a.sigar || !kuruldu || b.li !== 1 || b.im !== 2 || !b.imKonum || t.sw > 390) throw new Error(JSON.stringify({ poster, a, kuruldu, b, t }));
    console.log(`      kabin: 6 ekip, GPU yokken poster görünür · ?webgl=1 ile maket kuruldu, 3. ekibe gelince 3. numara vurgulandı · telefonda ${t.gen} px, taşma yok`);
  },
  async 'üst şerit: bayraklı dil anahtarı etkin dili gösterir; 320–414 px telefonda menü ve hesap düğmesi ekranda, hedefler ≥ 44 px'(s) {
    await s.git('./', 1440, 900);
    const once = await s.js(`document.querySelector('#dil-dugme').dataset.etkin`);
    await s.js(`document.querySelector('#dil-dugme').click()`); await kosulBekle(s, `document.documentElement.lang === 'en'`, 4000);
    const sonra = await s.js(`[document.querySelector('#dil-dugme').dataset.etkin, document.querySelector('#dil-dugme [data-dil=en]').matches('.dil[data-etkin="en"] [data-dil="en"]'), document.querySelector('#dil-dugme').getAttribute('aria-label')]`);
    const olc = [];
    for (const g of [320, 360, 390, 414]) {
      await s.git('./', g, 740);
      olc.push(await s.js(`(() => { const r = (q) => document.querySelector(q).getBoundingClientRect(); const m = r('#menu-dugme'), h = r('#hesap-dugme'), d = r('#dil-dugme');
        return { g: innerWidth, menuSag: Math.round(m.right), hesapSag: Math.round(h.right), min: Math.round(Math.min(m.height, h.height, h.width, d.height)), cakisma: h.right > m.left || d.right > h.left }; })()`));
    }
    const kotu = olc.filter((o) => o.menuSag > o.g || o.min < 44 || o.cakisma);
    if (once !== 'tr' || sonra[0] !== 'en' || sonra[1] !== true || sonra[2] !== 'Türkçeye geç' || kotu.length) throw new Error(JSON.stringify({ once, sonra, olc }));
    console.log(`      dil: ${once} → ${sonra[0]} (etkin bayrak koyu) · telefon: ${olc.map((o) => `${o.g}px menü sağ ${o.menuSag}`).join(', ')} · en küçük hedef ${Math.min(...olc.map((o) => o.min))} px`);
  },
  async 'tarihçe: her kayıtta resim karesi (ikon/logo/fotoğraf), yıl rozeti uçakla ilerler'(s) {
    await s.git('./', 1440, 900);
    await s.js(`document.querySelector('#rota').scrollIntoView({ behavior: 'instant' }); scrollBy({ top: 200, behavior: 'instant' })`); await kosulBekle(s, `document.querySelector('#rota-yil').style.opacity === '1'`, 5000);
    const a = await s.js(`[document.querySelector('#rota-yil').textContent, document.querySelector('#rota-yil').style.opacity, document.querySelectorAll('.serit .serit__resim').length, document.querySelectorAll('.serit__resim img').length]`);
    const y0 = await s.js(`document.querySelector('#rota-yil').textContent`); await s.js(`scrollBy({ top: 600, behavior: 'instant' })`); await kosulBekle(s, `document.querySelector('#rota-yil').textContent !== '${y0}'`, 5000);
    const b = await s.js(`[document.querySelector('#rota-yil').textContent, Math.round(document.querySelector('#rota-yil').getBoundingClientRect().top)]`);
    const yuklu = await kosulBekle(s, `[...document.querySelectorAll('.serit__resim img')].every((i) => i.complete && i.naturalWidth > 0)`, 5000);
    if (a[2] < 16 || a[2] !== (await s.js(`document.querySelectorAll('.rota__nokta').length`)) + 1 || a[3] < 6 || a[1] !== '1' || !(+b[0] > +a[0]) || !yuklu) throw new Error(JSON.stringify({ a, b, yuklu }));
    console.log(`      tarihçe: ${a[2]} resim karesi (${a[3]} görsel) · rozet ${a[0]} → ${b[0]}`);
  },
  async 'yazılar: AESTRO rafında gerçek kapaklar yüklenir, kartpostallarda sahne ve pul sembolleri dosyada bulunur'(s) {
    await s.git('./?az=1#yazilar', 1440, 900);
    await kosulBekle(s, `document.querySelectorAll('.kartpostal').length >= 6`, 8000);
    await s.js(`document.querySelector('.dergi').scrollIntoView({ block: 'center', behavior: 'instant' })`);
    const kapak = await kosulBekle(s, `[...document.querySelectorAll('.dergi img')].every((i) => i.complete && i.naturalWidth > 0 && /sayi-[123]-(360|720)\\.jpg$/.test(i.currentSrc))`, 8000);
    const r = await s.js(`(async () => {
      const kapaklar = [...document.querySelectorAll('.dergi img')].map((i) => [i.currentSrc.split('/').pop(), i.width, i.height]);   /* naturalWidth srcset yoğunluğuna bölünür; görünen boyut yazılır */
      const kullan = [...document.querySelectorAll('.kartpostal use')].map((u) => u.getAttribute('href'));
      const svg = await (await fetch('gorseller/semboller.svg')).text();
      const eksik = kullan.filter((h) => !svg.includes('<symbol id="' + h.split('#')[1] + '"'));
      return { kapaklar, kullan: kullan.length, kart: kullan.filter((h) => h.includes('#kart-')).length, eksik };
    })()`);
    if (!kapak || r.kapaklar.length !== 3 || !r.kapaklar.every(([ad], i) => ad.startsWith(`sayi-${i + 1}-`)) || r.kart < 6 || r.eksik.length) throw new Error(JSON.stringify({ kapak, r }));
    console.log(`      yazılar: kapaklar ${r.kapaklar.map(([a, g, y]) => `${a} ${g}×${y}`).join(', ')} · kartpostal sembolleri ${r.kullan} (${r.kart} sahne), eksik ${r.eksik.length}`);
  },
  async 'giriş sonrası: profil menüsü, profili düzenle (dolu gelir, kaydeder), parola değiştir, sorun bildir (yönetim adresine), alt bilgiden bildirim bağlantısı'(s) {
    await s.git('./?az=1#hesap', 1440, 900);
    if (!(await kosulBekle(s, `!document.querySelector('#giris-form fieldset').disabled`, 6000))) throw new Error('sunucu yok');
    const k = { ad: 'Profil', soyad: 'Deneme', eposta: `prf.${DAMGA}@itu.edu.tr`, okul_no: `17${DAMGA}`, parola: 'profil-parola-1' };
    await s.js(`document.querySelector('#sekme-kayit').click()`);
    await doldur(s, '#kayit-form', { ...k, kvkk: true });
    await s.js(`document.querySelector('#kayit-form button[type=submit]').click()`);
    if (!(await kosulBekle(s, `!document.querySelector('.profil').hidden`, 6000))) throw new Error('profil açılmadı: ' + await s.js(`[document.querySelector('#kayit-form .form__durum').textContent, ...[...document.querySelectorAll('#kayit-form .alan__hata')].map((p) => p.textContent).filter(Boolean), document.querySelector('#hesap-dugme').textContent].join(' | ')`));
    const p = await s.js(`({ menu: [...document.querySelectorAll('.profil__menu li:not([hidden]) b')].map((b) => b.textContent), rozet: document.querySelector('[data-profil="durum"]').textContent, giris: [document.querySelector('[data-i18n="hesapGiris"]').hidden, document.querySelector('#hesap-girisli').textContent] })`);
    await s.js(`document.querySelector('[data-git="duzenle"]').click()`); await bekle(200);
    const d = await s.js(`(() => { const f = document.querySelector('#duzenle-form'); return { gorunur: !f.closest('[data-gorunum-blok]').hidden, ad: f.elements.ad.value, no: f.elements.okul_no.value }; })()`);
    await doldur(s, '#duzenle-form', { ad: 'Profil Yeni' });
    await s.js(`document.querySelector('#duzenle-form button[type=submit]').click()`);
    const kaydetti = await kosulBekle(s, `!document.querySelector('.profil').hidden && document.querySelector('[data-profil="ad"]').textContent === 'Profil Yeni Deneme'`, 5000);
    await s.js(`document.querySelector('[data-git="duzenle"]').click()`); await bekle(150);
    await doldur(s, '#parola-form', { eski: 'yanlis-parola', yeni: 'profil-parola-2' });
    await s.js(`document.querySelector('#parola-form button[type=submit]').click()`);
    const parolaHata = await kosulBekle(s, `document.querySelector('#parola-form-eski').getAttribute('aria-invalid') === 'true'`, 4000);
    await doldur(s, '#parola-form', { eski: k.parola, yeni: 'profil-parola-2' });
    await s.js(`document.querySelector('#parola-form button[type=submit]').click()`);
    const parolaTamam = await kosulBekle(s, `/Parolan değiştirildi/.test(document.querySelector('#duyuru').textContent)`, 5000);
    await s.js(`document.querySelector('#duzenle-form [data-git="profil"]').click(); document.querySelector('[data-git="bildir"]').click()`); await bekle(150);
    await s.js(`document.querySelector('#bildir-form-konu').value = 'site'`);
    await doldur(s, '#bildir-form', { mesaj: 'Sınama: profil sayfasındaki bildirim formu çalışıyor mu?' });
    await s.js(`document.querySelector('#bildir-form-mesaj').dispatchEvent(new Event('input'))`);
    const sayac = await s.js(`document.querySelector('#bildir-form-sayac').textContent`);
    await s.js(`document.querySelector('#bildir-form button[type=submit]').click()`);
    const gitti = await kosulBekle(s, `!document.querySelector('.profil').hidden && /yönetim ekibine/.test(document.querySelector('#duyuru').textContent)`, 5000);
    await s.js(`location.hash = '#bildir-form'`); await bekle(300);
    const bag = await s.js(`!document.querySelector('#bildir-form').hidden`);
    if (p.menu.length !== 2 || !/doğrulanmadı/.test(p.rozet) || !p.giris[0] || !/doğrula/.test(p.giris[1]) || !d.gorunur || d.ad !== k.ad || d.no !== k.okul_no || !kaydetti || !parolaHata || !parolaTamam || !/\d+ \/ 2000/.test(sayac) || sayac.startsWith('0 ') || !gitti || !bag)
      throw new Error(JSON.stringify({ p, d, kaydetti, parolaHata, parolaTamam, sayac, gitti, bag }));
    console.log(`      giriş sonrası: menü [${p.menu.join(' · ')}], rozet "${p.rozet}" · düzenle dolu geldi, ad kaydedildi · yanlış parola reddedildi, yeni parola kaydedildi · bildirim gönderildi (${sayac}) · alt bilgi bağlantısı formu açar`);
  },
  async 'tarihçe ayrıntısı: şerite basınca kaydın sayfası açılır; önceki/sonraki, ← →, dil, kapatınca odak şeride döner, #tarih- bağlantısı doğrudan açar'(s) {
    await s.git('./?az=1', 1440, 900);
    const durum = `(() => { const d = document.querySelector('#ayrinti'); return { acik: d.open, h2: d.querySelector('h2').textContent, yil: d.querySelector('.ayrinti__yil').textContent, madde: d.querySelectorAll('.ayrinti__govde li').length, paragraf: d.querySelectorAll('.ayrinti__govde p').length, kaynak: [...d.querySelectorAll('.ayrinti__kaynaklar a')].map((a) => a.href), sira: d.querySelector('.ayrinti__sira').textContent, geri: d.querySelector('.ayrinti__yon[data-yon="-1"]').disabled, adres: location.hash, odak: document.activeElement?.className || '' }; })()`;
    await s.js(`document.querySelector('#tarih-2003').scrollIntoView({ block: 'center', behavior: 'instant' })`); await bekle(200);
    await s.js(`document.querySelector('#tarih-2003 .serit__ac').focus(); document.querySelector('#tarih-2003 .serit__ac').click()`);
    await kosulBekle(s, `document.querySelector('#ayrinti').open`, 5000);
    const a = await s.js(durum);
    await s.js(`document.querySelector('.ayrinti__yon[data-yon="1"]').click()`); const b = await s.js(durum);
    await s.js(`document.querySelector('#ayrinti').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))`); const c = await s.js(durum);
    await s.js(`document.querySelector('#dil-dugme').click()`); await kosulBekle(s, `document.documentElement.lang === 'en' && document.querySelector('#ayrinti h2').textContent === 'First time as hosts'`, 5000);
    const d = await s.js(durum);
    await s.js(`document.querySelector('.ayrinti__kapat').click()`); await kosulBekle(s, `!document.querySelector('#ayrinti').open && location.hash === ''`, 3000);
    const e = await s.js(durum);
    /* ilk kayıtta "önceki" kapalı */
    await s.js(`document.querySelector('#tarih-1941 .serit__ac').click()`); await kosulBekle(s, `document.querySelector('#ayrinti').open`, 3000);
    const f = await s.js(durum);
    /* pencere kenarına (kaydırma çubuğu) tık kapatmaz, perdeye tık kapatır */
    const perde = await s.js(`(() => { const d = document.querySelector('#ayrinti'), r = d.getBoundingClientRect(); const tik = (x, y) => d.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y })); tik(r.right - 4, r.top + 60); const kenar = d.open; tik(4, 4); return { kenar, dis: d.open }; })()`);
    if (!perde.kenar || perde.dis) throw new Error('perde: ' + JSON.stringify(perde));
    if (!a.acik || a.yil !== '2003' || a.madde !== 7 || !a.kaynak.length || !/^#tarih-2003$/.test(a.adres) || b.yil !== '2012' || b.adres !== '#tarih-2012' || c.yil !== '2003'
      || d.h2 !== 'First time as hosts' || e.acik || e.adres !== '' || !/serit__ac/.test(e.odak) || !f.geri || f.sira !== '1 / ' + (await s.js(`document.querySelectorAll('.rota__nokta').length`))) throw new Error(JSON.stringify({ a, b, c, d, e, f }));
    /* doğrudan bağlantı */
    await s.git('./?az=1#tarih-2024', 390, 844);
    await kosulBekle(s, `document.querySelector('#ayrinti').open`, 5000);
    const g = await s.js(`(() => { const d = document.querySelector('#ayrinti'), r = d.getBoundingClientRect(); return { ...${durum}, g: Math.round(r.width), taşma: document.documentElement.scrollWidth > innerWidth, resim: d.querySelector('.ayrinti__resim img')?.getAttribute('src') }; })()`);
    if (!g.acik || g.yil !== '2024' || g.madde < 5 || g.g > 390 || g.taşma || !/lustrum-2024-960/.test(g.resim || '')) throw new Error(JSON.stringify(g));
    console.log(`      ayrıntı: 2003 "${a.h2}" (${a.madde} madde, ${a.kaynak.length} kaynak, ${a.sira}) → sonraki ${b.yil} → ← ${c.yil} → EN "${d.h2}" → kapandı, odak şeritte, adres temiz · 1941'de önceki kapalı · #tarih-2024 telefonda doğrudan açıldı (${g.g} px)`);
  },
};

let gecen = 0, dusen = 0;
for (const [ad, fn] of Object.entries(SENARYO).filter(([ad]) => !process.env.SENARYO || ad.includes(process.env.SENARYO))) {
  const s = await sekmeAc();
  try {
    await fn(s);
    const konsol = s.hatalar.filter((h) => !/Failed to load resource.*(400|401|404|409)/.test(h));   /* bilerek tetiklenen hatalı istekler */
    if (konsol.length) throw new Error(`konsol: ${konsol.join(' | ')}`);
    gecen++; console.log(`  ✓ ${ad}`);
  } catch (h) { dusen++; console.log(`  ✗ ${ad} — ${h.message}`); }
  await s.kapat();
}
sinamaTemizle('bu koşudan');
console.log(`\n${gecen} geçti · ${dusen} düştü`);
surec.once('exit', () => { try { rmSync(profil, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }); } catch { /* sonraki koşu siler */ } });
surec.kill();
process.exitCode = dusen ? 1 : 0;
