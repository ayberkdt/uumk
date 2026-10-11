#!/usr/bin/env node
/* SUNUCU SINAMASI — kayıt API'sinin uçtan uca davranışı, gerçek HTTP ile, geçici veritabanı ve posta kutusuyla.
 *   node araclar/sunucu-sina.mjs        (çıkış 1 = düşen var; tarayıcı gerekmez, sunucuyu kendisi açar)
 * Sınananlar: alan denetimi (okul e-postası/numarası zorunlu), hesap + doğrulama e-postası, doğrulanmamış hesapla kayıt
 * reddi, tek tık kayıt, yinelenen kayıt, misafir kaydı (her alan yeniden), kontenjan, kayıt kapalı/geçmiş etkinlik, iptal,
 * CSRF başlığı, Origin, yönetici yetkisi, CSV (formül enjeksiyonu kaçışı), parola sıfırlama, hız sınırı, gizli dosyalar. */
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const gecici = mkdtempSync(join(process.env.SINAMA_KLASOR || tmpdir(), 'uumk-sina-'));
process.env.VERI_YOLU = join(gecici, 'sina.db');
process.env.POSTA_KUTUSU = join(gecici, 'posta');
process.env.PORT = '0';
process.env.OKUL_EPOSTA_ALANI = 'itu.edu.tr';
process.env.GUVENILIR_VEKIL = '1';      // sınama farklı istemcileri X-Forwarded-For ile taklit eder
const { sunucuKur } = await import('../sunucu/sunucu.mjs');
const { sunucu, vt } = sunucuKur();
await new Promise((r) => sunucu.listen(0, '127.0.0.1', r));
const KOK = `http://127.0.0.1:${sunucu.address().port}`;

let gecen = 0, dusen = 0;
const sina = (ad, kosul, ayrinti = '') => { if (kosul) gecen++; else { dusen++; console.log(`  ✗ ${ad}${ayrinti ? ' — ' + ayrinti : ''}`); } };

/** çerez kavanozlu istemci */
function istemci(ip = '10.0.0.1') {
  let cerez = '';
  return async (yol, { yontem = 'GET', govde, csrf = true, origin, basliklar = {} } = {}) => {
    const r = await fetch(KOK + yol, {
      method: yontem, redirect: 'manual',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip, ...(csrf ? { 'X-UUMK': '1' } : {}), ...(origin ? { Origin: origin } : {}), ...(cerez ? { Cookie: cerez } : {}), ...basliklar },
      body: govde === undefined ? undefined : JSON.stringify(govde),
    });
    const sc = r.headers.get('set-cookie');
    if (sc) { const [ad_d] = sc.split(';'); cerez = /=$/.test(ad_d) || /Max-Age=0/.test(sc) ? '' : ad_d; }
    const tur = r.headers.get('content-type') || '';
    return { durum: r.status, veri: tur.includes('json') ? await r.json() : await r.text(), r };
  };
}
const postalar = () => { try { return readdirSync(process.env.POSTA_KUTUSU).filter((f) => f.endsWith('.txt')).map((f) => readFileSync(join(process.env.POSTA_KUTUSU, f), 'utf8')); } catch { return []; } };
const sonBaglanti = (desen) => { const p = postalar().reverse().find((m) => desen.test(m)); return p?.match(/https?:\/\/\S+/)?.[0]; };

const KISI = { ad: 'Ayşe', soyad: 'Yılmaz', eposta: 'yilmaz.ayse@itu.edu.tr', okul_no: '110220123', parola: 'kanat-profili-2412', kvkk: true };
const yarin = new Date(Date.now() + 864e5 * 10).toISOString().slice(0, 16);
const dun = new Date(Date.now() - 864e5).toISOString().slice(0, 16);

/* ── 1. alan denetimi ── */
const a = istemci();
let r = await a('/api/hesap/kayit', { yontem: 'POST', govde: { ...KISI, eposta: 'ayse@gmail.com', okul_no: '12ab', kvkk: false, parola: 'kisa' } });
sina('okul dışı e-posta reddedilir', r.durum === 400 && r.veri.alanlar?.eposta === 'eposta-okul', JSON.stringify(r.veri));
sina('geçersiz okul no reddedilir', r.veri.alanlar?.okul_no === 'okul-no-gecersiz');
sina('KVKK onayı zorunlu', r.veri.alanlar?.kvkk === 'kvkk-gerekli');
sina('kısa parola reddedilir', r.veri.alanlar?.parola === 'parola-kisa');
r = await a('/api/hesap/kayit', { yontem: 'POST', govde: { ...KISI, okul_no: '' } });
sina('okul no boş bırakılamaz', r.durum === 400 && r.veri.alanlar?.okul_no);
r = await a('/api/hesap/kayit', { yontem: 'POST', govde: KISI, csrf: false });
sina('CSRF başlığı olmadan reddedilir', r.durum === 403 && r.veri.hata === 'csrf');
r = await a('/api/hesap/kayit', { yontem: 'POST', govde: KISI, origin: 'https://kotu.example' });
sina('yabancı Origin reddedilir', r.durum === 403);

/* ── 2. hesap ve doğrulama ── */
r = await a('/api/hesap/kayit', { yontem: 'POST', govde: { ...KISI, eposta: 'Yilmaz.Ayse@ITU.edu.tr ' } });
sina('hesap açılır (201) ve e-posta küçük harfe iner', r.durum === 201 && r.veri.kullanici?.eposta === KISI.eposta, JSON.stringify(r.veri));
sina('oturum çerezi HttpOnly + SameSite=Lax', /HttpOnly/.test(r.r.headers.get('set-cookie') || '') && /SameSite=Lax/.test(r.r.headers.get('set-cookie') || ''));
sina('parola düz metin saklanmaz', !JSON.stringify(vt.prepare('SELECT parola FROM kullanici').all()).includes(KISI.parola));
sina('doğrulama e-postası yazıldı', postalar().some((m) => m.includes(KISI.eposta) && /dogrula\?t=/.test(m)));
r = await istemci('10.0.0.2')('/api/hesap/kayit', { yontem: 'POST', govde: { ...KISI, eposta: 'baska@itu.edu.tr' } });
sina('aynı okul numarasıyla ikinci hesap açılmaz', r.durum === 409 && r.veri.hata === 'okul-no-kayitli');
r = await istemci('10.0.0.2')('/api/hesap/kayit', { yontem: 'POST', govde: { ...KISI, okul_no: '110229999' } });
sina('aynı e-postayla ikinci hesap açılmaz', r.durum === 409 && r.veri.hata === 'eposta-kayitli');
r = await a('/api/hesap/ben');
sina('ben: oturum açık, doğrulanmamış', r.durum === 200 && r.veri.kullanici.dogrulandi === false);

/* etkinlikler (yönetici olmadan veritabanına doğrudan; yönetim API'si aşağıda ayrıca sınanır) */
const ekle = vt.prepare(`INSERT INTO etkinlik (id, baslik_tr, baslik_en, yer_tr, baslangic, kontenjan, kayit_acik, kayit_son, olusturma) VALUES (?,?,?,?,?,?,?,?,?)`);
ekle.run('sina-gezi', 'Sınama gezisi', 'Test trip', 'Hangar', yarin, 2, 1, null, new Date().toISOString());
ekle.run('sina-kapali', 'Kapalı etkinlik', '', 'İTÜ', yarin, null, 0, null, new Date().toISOString());
ekle.run('sina-gecmis', 'Geçmiş etkinlik', '', 'İTÜ', dun, null, 1, null, new Date().toISOString());
ekle.run('sina-sonu-gecti', 'Kaydı biten', '', 'İTÜ', yarin, null, 1, dun, new Date().toISOString());

r = await a('/api/etkinlikler/sina-gezi/kayit', { yontem: 'POST', govde: {} });
sina('doğrulanmamış hesapla tek tık kayıt reddedilir', r.durum === 403 && r.veri.hata === 'dogrulanmamis');
const dogrulama = sonBaglanti(/dogrula\?t=/);
r = await a(new URL(dogrulama).pathname + new URL(dogrulama).search);
sina('doğrulama bağlantısı siteye yönlendirir', r.durum === 303 && /dogrulama=tamam/.test(r.r.headers.get('location')));
r = await a(new URL(dogrulama).pathname + new URL(dogrulama).search);
sina('doğrulama bağlantısı tek kullanımlık', /dogrulama=gecersiz/.test(r.r.headers.get('location')));

/* ── 3. etkinlik kaydı ── */
r = await a('/api/etkinlikler');
const gezi = r.veri.etkinlikler.find((e) => e.id === 'sina-gezi');
sina('etkinlik listesi: açık, kalan 2', gezi?.durum === 'acik' && gezi.kalan === 2, JSON.stringify(gezi));
sina('kapalı / geçmiş / kaydı biten etkinlik "kapali"', ['sina-kapali', 'sina-gecmis', 'sina-sonu-gecti'].every((id) => r.veri.etkinlikler.find((e) => e.id === id)?.durum === 'kapali'));
r = await a('/api/etkinlikler/sina-gezi/kayit', { yontem: 'POST', govde: {} });
sina('hesapla tek tık kayıt (alan girmeden)', r.durum === 201 && r.veri.etkinlik.kayitli === true && r.veri.etkinlik.kalan === 1, JSON.stringify(r.veri));
sina('kayıt hesabın bilgileriyle yazıldı', vt.prepare("SELECT okul_no FROM kayit WHERE etkinlik_id='sina-gezi'").get()?.okul_no === KISI.okul_no);
sina('kayıt onay e-postası', postalar().some((m) => /Kaydın alındı: Sınama gezisi/.test(m)));
r = await a('/api/etkinlikler/sina-gezi/kayit', { yontem: 'POST', govde: {} });
sina('aynı etkinliğe ikinci kayıt reddedilir', r.durum === 409 && r.veri.hata === 'zaten-kayitli');
r = await a('/api/etkinlikler/sina-kapali/kayit', { yontem: 'POST', govde: {} });
sina('kayda kapalı etkinlik reddedilir', r.durum === 409 && r.veri.hata === 'kayit-kapali');
r = await a('/api/etkinlikler/sina-sonu-gecti/kayit', { yontem: 'POST', govde: {} });
sina('son tarihi geçen etkinlik reddedilir', r.durum === 409 && r.veri.hata === 'kayit-kapali');
r = await a('/api/etkinlikler/yok-boyle/kayit', { yontem: 'POST', govde: {} });
sina('olmayan etkinlik 404', r.durum === 404);

/* misafir */
const m = istemci('10.0.0.3');
r = await m('/api/etkinlikler/sina-gezi/kayit', { yontem: 'POST', govde: {} });
sina('misafir: alanlar boşsa reddedilir', r.durum === 400 && r.veri.alanlar?.eposta && r.veri.alanlar?.okul_no && r.veri.alanlar?.kvkk);
r = await m('/api/etkinlikler/sina-gezi/kayit', { yontem: 'POST', govde: { ad: 'Ali', soyad: 'Kaya', eposta: 'kaya.ali@itu.edu.tr', okul_no: '110220124', kvkk: true } });
sina('misafir kaydı (her alan elle)', r.durum === 201 && r.veri.etkinlik.kalan === 0, JSON.stringify(r.veri));
sina('misafir kaydı hesapsız yazıldı', vt.prepare("SELECT kullanici_id FROM kayit WHERE eposta='kaya.ali@itu.edu.tr'").get()?.kullanici_id === null);
r = await istemci('10.0.0.4')('/api/etkinlikler/sina-gezi/kayit', { yontem: 'POST', govde: { ad: 'Can', soyad: 'Ak', eposta: 'ak.can@itu.edu.tr', okul_no: '110220125', kvkk: true } });
sina('kontenjan dolunca reddedilir', r.durum === 409 && r.veri.hata === 'kontenjan-doldu');
r = await istemci('10.0.0.4')('/api/etkinlikler/sina-gezi/kayit', { yontem: 'POST', govde: { ad: 'Ali', soyad: 'Kaya', eposta: 'baska.ali@itu.edu.tr', okul_no: '110220124', kvkk: true } });
sina('misafir aynı okul numarasıyla ikinci kez kaydolamaz', r.durum === 409);

/* iptal */
r = await a('/api/etkinlikler/sina-gezi/kayit', { yontem: 'DELETE' });
sina('hesap kendi kaydını iptal eder, yer açılır', r.durum === 200 && r.veri.etkinlik.kalan === 1);
r = await m('/api/etkinlikler/sina-gezi/kayit', { yontem: 'DELETE' });
sina('misafir iptal edemez (oturum yok)', r.durum === 401);

/* ── 4. yönetim ── */
r = await a('/api/yonetim/etkinlikler');
sina('üye yönetim listesine erişemez', r.durum === 403 && r.veri.hata === 'yetki-yok');
vt.prepare("UPDATE kullanici SET rol='yonetici' WHERE eposta=?").run(KISI.eposta);
r = await a('/api/yonetim/etkinlikler', { yontem: 'POST', govde: { id: 'Kotu Id!', baslik_tr: '', baslangic: 'yarın' } });
sina('yönetim: geçersiz etkinlik alanları', r.durum === 400 && r.veri.alanlar?.id && r.veri.alanlar?.baslik_tr && r.veri.alanlar?.baslangic);
r = await a('/api/yonetim/etkinlikler', { yontem: 'POST', govde: { id: 'teknik-gezi-ornek', baslik_tr: 'Örnek gezi', baslangic: yarin, kontenjan: 30, kayit_acik: true } });
sina('yönetim: etkinlik eklenir', r.durum === 201 && r.veri.etkinlik?.kontenjan === 30);
vt.prepare("INSERT INTO kayit (etkinlik_id, ad, soyad, eposta, okul_no, olusturma) VALUES ('sina-gezi','=HYPERLINK(\"x\")','Kaya','x@itu.edu.tr','110220199',?)").run(new Date().toISOString());
r = await a('/api/yonetim/etkinlikler/sina-gezi/kayitlar?bicim=csv');
sina('CSV: başlık satırı ve kayıtlar', r.durum === 200 && /ad,soyad,eposta,okul_no/.test(r.veri) && r.veri.includes('kaya.ali@itu.edu.tr'));
sina('CSV: formül enjeksiyonu kaçışlı', r.veri.includes(`"'=HYPERLINK`));
r = await a('/api/yonetim/yazilar', { yontem: 'POST', govde: { id: 'ornek-yazi', tarih: '2026-10-10', baslik_tr: 'Örnek yazı', govde_tr: 'Bu bir sınama yazısıdır, yayına girmez.' } });
sina('yönetim: yazı eklenir ve listede görünür', r.durum === 201 && (await a('/api/yazilar')).veri.yazilar.some((y) => y.id === 'ornek-yazi'));

/* ── 5. parola sıfırlama, çıkış, giriş ── */
r = await istemci('10.0.0.5')('/api/hesap/sifre-unuttum', { yontem: 'POST', govde: { eposta: 'yok@itu.edu.tr' } });
const r2 = await istemci('10.0.0.5')('/api/hesap/sifre-unuttum', { yontem: 'POST', govde: { eposta: KISI.eposta } });
sina('şifre unuttum: kayıtlı olsun olmasın aynı yanıt', r.durum === 200 && r2.durum === 200 && JSON.stringify(r.veri) === JSON.stringify(r2.veri));
const sifirla = sonBaglanti(/sifre-yenile=/);
const t = sifirla?.split('sifre-yenile=')[1];
const yeni = istemci('10.0.0.6');
r = await yeni('/api/hesap/sifre-yenile', { yontem: 'POST', govde: { t, parola: 'yeni-parola-1234' } });
sina('parola yenilenir ve oturum açılır', r.durum === 200 && !!(await yeni('/api/hesap/ben')).veri.kullanici);
r = await a('/api/hesap/ben');
sina('parola yenilenince eski oturumlar kapanır', r.veri.kullanici === null);
r = await a('/api/hesap/giris', { yontem: 'POST', govde: { kim: KISI.eposta, parola: KISI.parola } });
sina('eski parola artık geçmez', r.durum === 401 && r.veri.hata === 'giris-hatali');
r = await a('/api/hesap/giris', { yontem: 'POST', govde: { kim: KISI.okul_no, parola: 'yeni-parola-1234' } });
sina('okul numarasıyla giriş', r.durum === 200 && r.veri.kullanici.eposta === KISI.eposta);
r = await a('/api/hesap/cikis', { yontem: 'POST' });
sina('çıkış sonrası oturum yok', (await a('/api/hesap/ben')).veri.kullanici === null);

/* ── 5b. hesap silme ── */
const sil = istemci('10.0.0.7');
await sil('/api/hesap/kayit', { yontem: 'POST', govde: { ad: 'Deniz', soyad: 'Sil', eposta: 'sil.deniz@itu.edu.tr', okul_no: '110220777', parola: 'silinecek-hesap-1', kvkk: true } });
vt.prepare("UPDATE kullanici SET dogrulandi = 1 WHERE eposta = 'sil.deniz@itu.edu.tr'").run();
await sil('/api/etkinlikler/teknik-gezi-ornek/kayit', { yontem: 'POST', govde: {} });
const silId = vt.prepare("SELECT id FROM kullanici WHERE eposta='sil.deniz@itu.edu.tr'").get().id;
vt.prepare("INSERT INTO kayit (etkinlik_id, kullanici_id, ad, soyad, eposta, okul_no, olusturma) VALUES ('sina-gecmis', ?, 'Deniz', 'Sil', 'sil.deniz@itu.edu.tr', '110220777', ?)").run(silId, new Date().toISOString());
r = await sil('/api/hesap', { yontem: 'DELETE', govde: { parola: 'yanlis-parola-x' } });
sina('hesap silme yanlış parolayla reddedilir', r.durum === 401);
r = await sil('/api/hesap', { yontem: 'DELETE', govde: { parola: 'silinecek-hesap-1' } });
sina('hesap silinir', r.durum === 200 && !vt.prepare("SELECT 1 FROM kullanici WHERE eposta='sil.deniz@itu.edu.tr'").get());
sina('silinen hesabın gelecekteki kaydı silinir', !vt.prepare("SELECT 1 FROM kayit WHERE etkinlik_id='teknik-gezi-ornek' AND eposta='sil.deniz@itu.edu.tr'").get());
sina('geçmiş kayıt kalır, hesaptan kopar', vt.prepare("SELECT kullanici_id FROM kayit WHERE etkinlik_id='sina-gecmis' AND eposta='sil.deniz@itu.edu.tr'").get()?.kullanici_id === null);
sina('silme sonrası oturum yok', (await sil('/api/hesap/ben')).veri.kullanici === null);

/* ── 6. hız sınırı ve statik güvenlik ── */
const k = istemci('10.0.0.9');
let son;
for (let i = 0; i < 11; i++) son = await k('/api/hesap/giris', { yontem: 'POST', govde: { kim: 'x@itu.edu.tr', parola: 'yanlis-parola' } });
sina('giriş denemesi hız sınırı (11. deneme 429)', son.durum === 429);
/* vekil güveni kapalıyken X-Forwarded-For dikkate alınmaz (sahte başlıkla hız sınırı atlanamaz) */
{
  const { AYAR } = await import('../sunucu/ayar.mjs');
  const { ipAl } = await import('../sunucu/api.mjs');
  const sahte = { headers: { 'x-forwarded-for': '6.6.6.6' }, socket: { remoteAddress: '127.0.0.1' } };
  AYAR.vekilGuven = false; const kapali = ipAl(sahte); AYAR.vekilGuven = true; const acik = ipAl(sahte);
  sina('vekil güveni kapalıyken X-Forwarded-For yok sayılır', kapali === '127.0.0.1' && acik === '6.6.6.6', `${kapali} / ${acik}`);
}
for (const yol of ['/sunucu/ayar.mjs', '/notlar/arastirma.md', '/sunucu/veri/uumk.db', '/araclar/dogrula.mjs', '/README.md', '/.claude/sunucu.py'])
  sina(`gizli: ${yol} 404`, (await fetch(KOK + yol)).status === 404);
const ana = await fetch(KOK + '/');
sina('ana sayfa 200 + CSP başlığı', ana.status === 200 && !!ana.headers.get('content-security-policy'));
sina('yol aşımı engellenir', (await fetch(KOK + '/..%2F..%2Fantratech/index.html')).status === 404);
{ const y = await fetch(KOK + '/a/b/olmayan-sayfa'), m = await y.text();
  sina('olmayan sayfa: 404 + kulübün 404 sayfası (HTML)', y.status === 404 && /text\/html/.test(y.headers.get('content-type')) && m.includes('Bu rota haritada yok')); }

console.log(`\n${gecen} geçti · ${dusen} düştü`);
sunucu.close(); vt.close();
try { rmSync(gecici, { recursive: true, force: true }); } catch { /* Windows kilidi */ }
process.exit(dusen ? 1 : 0);
