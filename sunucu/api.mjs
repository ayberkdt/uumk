/* API — /api/* uç noktaları. Yanıtlar JSON; hata gövdesi { hata: '<kod>', alanlar?: { alan: '<kod>' } }.
 * Hata kodlarının iki dilli metinleri istemcidedir (dil/*.mjs ve ceviri.mjs).
 *
 * CSRF: durum değiştiren her istek (POST/DELETE) "X-UUMK: 1" başlığı ister. Bu başlık başka bir siteden ön kontrolsüz
 * gönderilemez; çerez de SameSite=Lax. Origin başlığı varsa sitenin kendisi olmalıdır.
 *
 * Hesap:    POST /api/hesap/kayit · /giris · /cikis · /dogrulama-gonder · /sifre-unuttum · /sifre-yenile · /profil · /parola · DELETE /api/hesap
 * Bildirim: POST /api/bildirim (oturum ister; yönetim adresine e-posta, yanıt adresi üyenin e-postası)
 *           GET  /api/hesap/ben · /api/hesap/dogrula?t=… (e-postadaki bağlantı; siteye yönlendirir)
 * Etkinlik: GET  /api/etkinlikler · POST|DELETE /api/etkinlikler/:id/kayit
 * Yazı:     GET  /api/yazilar
 * Yönetim:  GET|POST /api/yonetim/etkinlikler · GET /api/yonetim/etkinlikler/:id/kayitlar[?bicim=csv] · GET /api/yonetim/bildirimler
 *           POST /api/yonetim/yazilar · DELETE /api/yonetim/yazilar/:id          (rol: yonetici) */
import { AYAR } from './ayar.mjs';
import { islem, simdi } from './vt.mjs';
import { parolaOzetle, parolaDogru, sahteKarsilastir, belirtec, ozet, cerezleriOku, cerezYaz, hizSiniri, kisiDenetle, parolaDenetle } from './guvenlik.mjs';
import { postaGonder } from './posta.mjs';

const CEREZ = 'uumk_oturum';
const girisSiniri = hizSiniri(AYAR.girisSiniri, 10 * 60e3);   // IP başına 10 dakikada giriş/kayıt denemesi (varsayılan 10)
const postaSiniri = hizSiniri(3, 15 * 60e3);        // adres başına 15 dakikada 3 e-posta
const kayitSiniri = hizSiniri(AYAR.girisSiniri * 2, 10 * 60e3);   // IP başına 10 dakikada etkinlik kaydı
const bildirimSiniri = hizSiniri(3, 15 * 60e3);     // üye başına 15 dakikada 3 bildirim
const KONU = { site: ['Site sorunu', 'Website problem'], etkinlik: ['Etkinlik ve kayıt', 'Events and registration'], uyelik: ['Üyelik ve hesap', 'Membership and account'], diger: ['Diğer soru', 'Other question'] };

class ApiHata extends Error { constructor(durum, kod, alanlar) { super(kod); this.durum = durum; this.kod = kod; this.alanlar = alanlar; } }
const hata = (durum, kod, alanlar) => { throw new ApiHata(durum, kod, alanlar); };

/** İstanbul yerel saati "YYYY-MM-DDTHH:MM" → zaman damgası (Türkiye 2016'dan beri yıl boyu UTC+3) */
export function yerelZaman(s) {
  if (!s) return NaN;
  if (/[zZ]$|[+-]\d\d:\d\d$/.test(s)) return Date.parse(s);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return Date.parse(`${s}:00+03:00`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return Date.parse(`${s}T00:00:00+03:00`);
  return NaN;
}
/** İstemci IP'si. X-Forwarded-For yalnız güvenilir ters vekil arkasında okunur; aksi hâlde başlık sahtelenip hız sınırı atlanırdı. */
export const ipAl = (i) => String((AYAR.vekilGuven && i.headers['x-forwarded-for']) || i.socket.remoteAddress || '').split(',')[0].trim();

async function govdeOku(istek, sinir = 64 * 1024) {
  let boy = 0; const parcalar = [];
  for await (const p of istek) { boy += p.length; if (boy > sinir) hata(413, 'govde-buyuk'); parcalar.push(p); }
  if (!boy) return {};
  try { return JSON.parse(Buffer.concat(parcalar).toString('utf8')); } catch { hata(400, 'json-gecersiz'); }
}

export function apiKur(vt) {
  const S = {
    oturumKullanici: vt.prepare(`SELECT k.id, k.ad, k.soyad, k.eposta, k.okul_no, k.dogrulandi, k.rol FROM oturum o JOIN kullanici k ON k.id = o.kullanici_id WHERE o.ozet = ? AND o.bitis > ?`),
    oturumEkle: vt.prepare('INSERT INTO oturum (ozet, kullanici_id, bitis) VALUES (?, ?, ?)'),
    oturumSil: vt.prepare('DELETE FROM oturum WHERE ozet = ?'),
    oturumTemizle: vt.prepare('DELETE FROM oturum WHERE bitis <= ?'),
    kullaniciEkle: vt.prepare('INSERT INTO kullanici (ad, soyad, eposta, okul_no, parola, olusturma) VALUES (?, ?, ?, ?, ?, ?)'),
    kullaniciEposta: vt.prepare('SELECT * FROM kullanici WHERE eposta = ?'),
    kullaniciGiris: vt.prepare('SELECT * FROM kullanici WHERE eposta = ? OR okul_no = ?'),
    kullaniciVarMi: vt.prepare('SELECT eposta = ? AS ayni_eposta FROM kullanici WHERE eposta = ? OR okul_no = ?'),
    belirtecEkle: vt.prepare('INSERT INTO belirtec (ozet, kullanici_id, tur, bitis) VALUES (?, ?, ?, ?)'),
    belirtecAl: vt.prepare('SELECT * FROM belirtec WHERE ozet = ? AND tur = ? AND bitis > ?'),
    belirtecSil: vt.prepare('DELETE FROM belirtec WHERE kullanici_id = ? AND tur = ?'),
    dogrula: vt.prepare('UPDATE kullanici SET dogrulandi = 1 WHERE id = ?'),
    parolaYaz: vt.prepare('UPDATE kullanici SET parola = ? WHERE id = ?'),
    oturumlariSil: vt.prepare('DELETE FROM oturum WHERE kullanici_id = ?'),
    profilYaz: vt.prepare('UPDATE kullanici SET ad = ?, soyad = ?, okul_no = ? WHERE id = ?'),
    okulNoBaskasi: vt.prepare('SELECT 1 FROM kullanici WHERE okul_no = ? AND id != ?'),
    bildirimEkle: vt.prepare('INSERT INTO bildirim (kullanici_id, ad, eposta, konu, mesaj, olusturma) VALUES (?, ?, ?, ?, ?, ?)'),
    bildirimler: vt.prepare('SELECT id, ad, eposta, konu, mesaj, olusturma FROM bildirim ORDER BY olusturma DESC LIMIT 200'),
    etkinlikler: vt.prepare(`SELECT e.*, (SELECT COUNT(*) FROM kayit k WHERE k.etkinlik_id = e.id) AS dolu FROM etkinlik e WHERE e.yayinda = 1 ORDER BY e.baslangic`),
    etkinlik: vt.prepare(`SELECT e.*, (SELECT COUNT(*) FROM kayit k WHERE k.etkinlik_id = e.id) AS dolu FROM etkinlik e WHERE e.id = ?`),
    kullaniciKayitlari: vt.prepare('SELECT etkinlik_id FROM kayit WHERE kullanici_id = ?'),
    kayitEkle: vt.prepare('INSERT INTO kayit (etkinlik_id, kullanici_id, ad, soyad, eposta, okul_no, olusturma) VALUES (?, ?, ?, ?, ?, ?, ?)'),
    kayitVarMi: vt.prepare('SELECT 1 FROM kayit WHERE etkinlik_id = ? AND (eposta = ? OR okul_no = ?)'),
    kayitSil: vt.prepare('DELETE FROM kayit WHERE etkinlik_id = ? AND kullanici_id = ?'),
    kayitlar: vt.prepare('SELECT ad, soyad, eposta, okul_no, CASE WHEN kullanici_id IS NULL THEN 1 ELSE 0 END AS misafir, olusturma FROM kayit WHERE etkinlik_id = ? ORDER BY olusturma'),
    etkinlikYaz: vt.prepare(`INSERT INTO etkinlik (id, baslik_tr, baslik_en, ozet_tr, ozet_en, yer_tr, yer_en, baslangic, bitis, kontenjan, kayit_acik, kayit_son, yayinda, olusturma)
      VALUES ($id, $baslik_tr, $baslik_en, $ozet_tr, $ozet_en, $yer_tr, $yer_en, $baslangic, $bitis, $kontenjan, $kayit_acik, $kayit_son, $yayinda, $olusturma)
      ON CONFLICT(id) DO UPDATE SET baslik_tr = excluded.baslik_tr, baslik_en = excluded.baslik_en, ozet_tr = excluded.ozet_tr, ozet_en = excluded.ozet_en,
        yer_tr = excluded.yer_tr, yer_en = excluded.yer_en, baslangic = excluded.baslangic, bitis = excluded.bitis, kontenjan = excluded.kontenjan,
        kayit_acik = excluded.kayit_acik, kayit_son = excluded.kayit_son, yayinda = excluded.yayinda`),
    yazilar: vt.prepare('SELECT id, tarih, baslik_tr, baslik_en, ozet_tr, ozet_en, govde_tr, govde_en, baglanti, kaynak FROM yazi WHERE yayinda = 1 ORDER BY tarih DESC'),
    yaziYaz: vt.prepare(`INSERT INTO yazi (id, tarih, baslik_tr, baslik_en, ozet_tr, ozet_en, govde_tr, govde_en, baglanti, kaynak, yayinda)
      VALUES ($id, $tarih, $baslik_tr, $baslik_en, $ozet_tr, $ozet_en, $govde_tr, $govde_en, $baglanti, $kaynak, $yayinda)
      ON CONFLICT(id) DO UPDATE SET tarih = excluded.tarih, baslik_tr = excluded.baslik_tr, baslik_en = excluded.baslik_en, ozet_tr = excluded.ozet_tr,
        ozet_en = excluded.ozet_en, govde_tr = excluded.govde_tr, govde_en = excluded.govde_en, baglanti = excluded.baglanti, kaynak = excluded.kaynak, yayinda = excluded.yayinda`),
    yaziSil: vt.prepare('DELETE FROM yazi WHERE id = ?'),
  };

  const kimlik = (istek) => {
    const b = cerezleriOku(istek)[CEREZ];
    return b ? S.oturumKullanici.get(ozet(b), simdi()) || null : null;
  };
  const disa = (k) => k && { ad: k.ad, soyad: k.soyad, eposta: k.eposta, okul_no: k.okul_no, dogrulandi: !!k.dogrulandi, rol: k.rol };

  function oturumAc(istek, yanit, kullaniciId) {
    S.oturumTemizle.run(simdi());
    const b = belirtec();
    S.oturumEkle.run(ozet(b), kullaniciId, new Date(Date.now() + AYAR.oturumGun * 864e5).toISOString());
    yanit.setHeader('Set-Cookie', cerezYaz(istek, CEREZ, b, AYAR.oturumGun * 86400));
  }
  async function belirtecGonder(k, tur, dil) {
    if (!postaSiniri(k.eposta)) return { tamam: false, hata: 'cok-istek' };
    S.belirtecSil.run(k.id, tur);
    const b = belirtec();
    const saat = tur === 'dogrula' ? AYAR.dogrulamaSaat : AYAR.sifirlamaSaat;
    S.belirtecEkle.run(ozet(b), k.id, tur, new Date(Date.now() + saat * 36e5).toISOString());
    const en = dil === 'en';
    const adres = tur === 'dogrula' ? `${AYAR.siteAdresi}/api/hesap/dogrula?t=${b}` : `${AYAR.siteAdresi}/${en ? '?dil=en' : ''}#sifre-yenile=${b}`;
    const konu = tur === 'dogrula' ? (en ? 'Confirm your İTÜ UUMK account' : 'İTÜ UUMK hesabını doğrula') : (en ? 'Reset your İTÜ UUMK password' : 'İTÜ UUMK parolanı yenile');
    const metin = tur === 'dogrula'
      ? (en ? `Hello ${k.ad},\n\nOpen this link to confirm your account (valid for ${saat} hours):\n${adres}\n\nIf you did not create an account, ignore this e-mail.` : `Merhaba ${k.ad},\n\nHesabını doğrulamak için bu bağlantıyı aç (${saat} saat geçerli):\n${adres}\n\nHesap açmadıysan bu e-postayı yok say.`)
      : (en ? `Hello ${k.ad},\n\nOpen this link to set a new password (valid for ${saat} hours):\n${adres}\n\nIf you did not ask for this, ignore this e-mail.` : `Merhaba ${k.ad},\n\nYeni parola belirlemek için bu bağlantıyı aç (${saat} saat geçerli):\n${adres}\n\nBunu sen istemediysen bu e-postayı yok say.`);
    return postaGonder({ kime: k.eposta, konu, metin });
  }
  const etkinlikDisa = (e, kayitli) => {
    const son = e.kayit_son ? yerelZaman(e.kayit_son) : null;
    const acik = !!e.kayit_acik && (son === null || Date.now() < son) && yerelZaman(e.baslangic) > Date.now();
    const doldu = e.kontenjan !== null && e.dolu >= e.kontenjan;
    return {
      id: e.id, baslik: { tr: e.baslik_tr, en: e.baslik_en || e.baslik_tr }, ozet: { tr: e.ozet_tr, en: e.ozet_en || e.ozet_tr },
      yer: { tr: e.yer_tr, en: e.yer_en || e.yer_tr }, baslangic: e.baslangic, bitis: e.bitis, kayit_son: e.kayit_son,
      kontenjan: e.kontenjan, kalan: e.kontenjan === null ? null : Math.max(0, e.kontenjan - e.dolu),
      durum: !acik ? 'kapali' : doldu ? 'doldu' : 'acik', kayitli: !!kayitli,
    };
  };

  const yollar = [
    ['GET', /^\/api\/durum$/, () => ({ surum: 1, okulAlani: AYAR.okulAlani })],

    /* ── hesap ── */
    ['POST', /^\/api\/hesap\/kayit$/, async (istek, yanit) => {
      if (!girisSiniri(ipAl(istek))) hata(429, 'cok-istek');
      const g = await govdeOku(istek);
      const { veri, hata: alanlar } = kisiDenetle(g);
      const ph = parolaDenetle(g.parola);
      if (ph) alanlar.parola = ph;
      if (Object.keys(alanlar).length) hata(400, 'alan-hatasi', alanlar);
      const var_ = S.kullaniciVarMi.get(veri.eposta, veri.eposta, veri.okul_no);
      if (var_) hata(409, var_.ayni_eposta ? 'eposta-kayitli' : 'okul-no-kayitli');
      const id = Number(S.kullaniciEkle.run(veri.ad, veri.soyad, veri.eposta, veri.okul_no, parolaOzetle(String(g.parola)), simdi()).lastInsertRowid);
      oturumAc(istek, yanit, id);
      const posta = await belirtecGonder({ id, ...veri }, 'dogrula', g.dil);
      yanit.statusCode = 201;
      return { kullanici: { ...veri, dogrulandi: false, rol: 'uye' }, posta: posta.tamam };
    }],
    ['POST', /^\/api\/hesap\/giris$/, async (istek, yanit) => {
      if (!girisSiniri(ipAl(istek))) hata(429, 'cok-istek');
      const g = await govdeOku(istek);
      const kim = String(g.kim ?? '').trim().toLowerCase().slice(0, 120);
      const k = kim ? S.kullaniciGiris.get(kim, kim) : null;
      if (!k) { sahteKarsilastir(g.parola); hata(401, 'giris-hatali'); }
      if (!parolaDogru(String(g.parola ?? ''), k.parola)) hata(401, 'giris-hatali');
      oturumAc(istek, yanit, k.id);
      return { kullanici: disa(k) };
    }],
    ['POST', /^\/api\/hesap\/cikis$/, (istek, yanit) => {
      const b = cerezleriOku(istek)[CEREZ];
      if (b) S.oturumSil.run(ozet(b));
      yanit.setHeader('Set-Cookie', cerezYaz(istek, CEREZ, '', 0));
      return { tamam: true };
    }],
    ['GET', /^\/api\/hesap\/ben$/, (istek) => {
      const k = kimlik(istek);
      if (!k) return { kullanici: null, kayitlar: [] };              /* oturum yok: hata değil, boş yanıt (konsol kirlenmesin) */
      return { kullanici: disa(k), kayitlar: S.kullaniciKayitlari.all(k.id).map((r) => r.etkinlik_id) };
    }],
    ['GET', /^\/api\/hesap\/dogrula$/, (istek, yanit, url) => {
      const b = url.searchParams.get('t') || '';
      const r = S.belirtecAl.get(ozet(b), 'dogrula', simdi());
      if (r) { S.dogrula.run(r.kullanici_id); S.belirtecSil.run(r.kullanici_id, 'dogrula'); }
      yanit.statusCode = 303;
      yanit.setHeader('Location', `/?dogrulama=${r ? 'tamam' : 'gecersiz'}#hesap`);
      return null;
    }],
    ['POST', /^\/api\/hesap\/dogrulama-gonder$/, async (istek) => {
      const k = kimlik(istek);
      if (!k) hata(401, 'oturum-yok');
      if (k.dogrulandi) return { tamam: true, zaten: true };
      const g = await govdeOku(istek);
      const p = await belirtecGonder(k, 'dogrula', g.dil);
      if (p.hata === 'cok-istek') hata(429, 'cok-istek');
      return { tamam: p.tamam };
    }],
    ['DELETE', /^\/api\/hesap$/, async (istek, yanit) => {
      /* hesabı sil: parola ister; başlamamış etkinliklerdeki kayıtlar silinir, geçmiş kayıtlar hesaptan koparılır (kullanici_id NULL) */
      const k = kimlik(istek);
      if (!k) hata(401, 'oturum-yok');
      const g = await govdeOku(istek);
      const tam = S.kullaniciEposta.get(k.eposta);
      if (!parolaDogru(String(g.parola ?? ''), tam.parola)) hata(401, 'giris-hatali');
      islem(vt, () => {
        const gelecek = vt.prepare('SELECT k.id, e.baslangic FROM kayit k JOIN etkinlik e ON e.id = k.etkinlik_id WHERE k.kullanici_id = ?').all(k.id).filter((r) => yerelZaman(r.baslangic) > Date.now());
        for (const r of gelecek) vt.prepare('DELETE FROM kayit WHERE id = ?').run(r.id);
        vt.prepare('DELETE FROM kullanici WHERE id = ?').run(k.id);
      });
      yanit.setHeader('Set-Cookie', cerezYaz(istek, CEREZ, '', 0));
      return { tamam: true };
    }],
    ['POST', /^\/api\/hesap\/profil$/, async (istek) => {
      /* ad, soyad, okul numarası; e-posta değişmez (doğrulanmış okul adresi kimliğin kendisi) */
      const k = kimlik(istek);
      if (!k) hata(401, 'oturum-yok');
      const g = await govdeOku(istek);
      const { veri, hata: alanlar } = kisiDenetle({ ...g, eposta: k.eposta, kvkk: true });
      if (Object.keys(alanlar).length) hata(400, 'alan-hatasi', alanlar);
      if (S.okulNoBaskasi.get(veri.okul_no, k.id)) hata(409, 'alan-hatasi', { okul_no: 'okul-no-kayitli' });
      S.profilYaz.run(veri.ad, veri.soyad, veri.okul_no, k.id);
      return { kullanici: { ...disa(k), ad: veri.ad, soyad: veri.soyad, okul_no: veri.okul_no } };
    }],
    ['POST', /^\/api\/hesap\/parola$/, async (istek, yanit) => {
      /* parola değiştir: mevcut parola ister; diğer oturumlar kapanır, bu tarayıcıda yeni oturum açılır */
      const k = kimlik(istek);
      if (!k) hata(401, 'oturum-yok');
      const g = await govdeOku(istek);
      const tam = S.kullaniciEposta.get(k.eposta);
      if (!parolaDogru(String(g.eski ?? ''), tam.parola)) hata(400, 'alan-hatasi', { eski: 'parola-yanlis' });
      const ph = parolaDenetle(g.yeni);
      if (ph) hata(400, 'alan-hatasi', { yeni: ph });
      S.parolaYaz.run(parolaOzetle(String(g.yeni)), k.id);
      S.oturumlariSil.run(k.id);
      oturumAc(istek, yanit, k.id);
      return { tamam: true };
    }],
    ['POST', /^\/api\/hesap\/sifre-unuttum$/, async (istek) => {
      if (!girisSiniri(ipAl(istek))) hata(429, 'cok-istek');
      const g = await govdeOku(istek);
      const k = S.kullaniciEposta.get(String(g.eposta ?? '').trim().toLowerCase());
      if (k) await belirtecGonder(k, 'sifirla', g.dil);
      return { tamam: true };                                   // adres kayıtlı mı sızmasın: her zaman aynı yanıt
    }],
    ['POST', /^\/api\/hesap\/sifre-yenile$/, async (istek, yanit) => {
      const g = await govdeOku(istek);
      const r = S.belirtecAl.get(ozet(String(g.t ?? '')), 'sifirla', simdi());
      if (!r) hata(400, 'belirtec-gecersiz');
      const ph = parolaDenetle(g.parola);
      if (ph) hata(400, 'alan-hatasi', { parola: ph });
      S.parolaYaz.run(parolaOzetle(String(g.parola)), r.kullanici_id);
      S.belirtecSil.run(r.kullanici_id, 'sifirla');
      S.oturumlariSil.run(r.kullanici_id);                     // eski oturumlar kapanır
      S.dogrula.run(r.kullanici_id);                            // sıfırlama bağlantısı e-postaya ulaşıldığını da kanıtlar
      oturumAc(istek, yanit, r.kullanici_id);
      return { tamam: true };
    }],

    /* ── bildirim: sorun bildir / soru sor → yönetim adresi ── */
    ['POST', /^\/api\/bildirim$/, async (istek) => {
      const k = kimlik(istek);
      if (!k) hata(401, 'oturum-yok');
      if (!bildirimSiniri(String(k.id))) hata(429, 'cok-istek');
      const g = await govdeOku(istek);
      const konu = String(g.konu ?? ''), mesaj = metin(g.mesaj, 2000);
      const alanlar = {};
      if (!KONU[konu]) alanlar.konu = 'konu-gecersiz';
      if (mesaj.length < 10) alanlar.mesaj = 'mesaj-kisa';
      if (Object.keys(alanlar).length) hata(400, 'alan-hatasi', alanlar);
      const ad = `${k.ad} ${k.soyad}`;
      S.bildirimEkle.run(k.id, ad, k.eposta, konu, mesaj, simdi());
      const p = await postaGonder({
        kime: AYAR.yonetimEposta, yanitla: k.eposta,
        konu: `[UUMK sitesi] ${KONU[konu][0]} — ${ad}`,
        metin: `Konu: ${KONU[konu][0]}\nGönderen: ${ad} <${k.eposta}>, okul no ${k.okul_no}\nTarih: ${simdi()}\n\n${mesaj}\n\n— Bu ileti sitenin "Sorun bildir / soru sor" formundan geldi; yanıtla dersen doğrudan üyeye gider.`,
      });
      return { tamam: true, posta: p.tamam };
    }],

    /* ── etkinlik ── */
    ['GET', /^\/api\/etkinlikler$/, (istek) => {
      const k = kimlik(istek);
      const benim = new Set(k ? S.kullaniciKayitlari.all(k.id).map((r) => r.etkinlik_id) : []);
      return { etkinlikler: S.etkinlikler.all().map((e) => etkinlikDisa(e, benim.has(e.id))) };
    }],
    ['POST', /^\/api\/etkinlikler\/([a-z0-9-]{1,64})\/kayit$/, async (istek, yanit, url, [, id]) => {
      if (!kayitSiniri(ipAl(istek))) hata(429, 'cok-istek');
      const k = kimlik(istek);
      const g = await govdeOku(istek);
      let kisi;
      if (k) {
        if (!k.dogrulandi) hata(403, 'dogrulanmamis');
        kisi = { ad: k.ad, soyad: k.soyad, eposta: k.eposta, okul_no: k.okul_no };
      } else {
        const { veri, hata: alanlar } = kisiDenetle(g);
        if (Object.keys(alanlar).length) hata(400, 'alan-hatasi', alanlar);
        kisi = veri;
      }
      const sonuc = islem(vt, () => {
        const e = S.etkinlik.get(id);
        if (!e || !e.yayinda) hata(404, 'etkinlik-yok');
        const d = etkinlikDisa(e, false);
        if (d.durum === 'kapali') hata(409, 'kayit-kapali');
        if (d.durum === 'doldu') hata(409, 'kontenjan-doldu');
        if (S.kayitVarMi.get(id, kisi.eposta, kisi.okul_no)) hata(409, 'zaten-kayitli');
        S.kayitEkle.run(id, k ? k.id : null, kisi.ad, kisi.soyad, kisi.eposta, kisi.okul_no, simdi());
        return etkinlikDisa(S.etkinlik.get(id), true);
      });
      const en = g.dil === 'en';
      postaGonder({
        kime: kisi.eposta,
        konu: en ? `Registration received: ${sonuc.baslik.en}` : `Kaydın alındı: ${sonuc.baslik.tr}`,
        metin: en ? `Hello ${kisi.ad},\n\nYou are registered for "${sonuc.baslik.en}" (${sonuc.baslangic.replace('T', ' ')}, ${sonuc.yer.en}).\n\nİTÜ UUMK`
          : `Merhaba ${kisi.ad},\n\n"${sonuc.baslik.tr}" etkinliğine kaydın alındı (${sonuc.baslangic.replace('T', ' ')}, ${sonuc.yer.tr}).\n\nİTÜ UUMK`,
      });
      yanit.statusCode = 201;
      return { etkinlik: sonuc };
    }],
    ['DELETE', /^\/api\/etkinlikler\/([a-z0-9-]{1,64})\/kayit$/, (istek, yanit, url, [, id]) => {
      const k = kimlik(istek);
      if (!k) hata(401, 'oturum-yok');
      const r = S.kayitSil.run(id, k.id);
      if (!r.changes) hata(404, 'kayit-yok');
      const e = S.etkinlik.get(id);
      return { etkinlik: e ? etkinlikDisa(e, false) : null };
    }],

    /* ── yazılar ── */
    ['GET', /^\/api\/yazilar$/, () => ({ yazilar: S.yazilar.all() })],

    /* ── yönetim ── */
    ['GET', /^\/api\/yonetim\/etkinlikler$/, (istek) => {
      yonetici(istek);
      return { etkinlikler: vt.prepare(`SELECT e.*, (SELECT COUNT(*) FROM kayit k WHERE k.etkinlik_id = e.id) AS dolu FROM etkinlik e ORDER BY e.baslangic DESC`).all() };
    }],
    ['POST', /^\/api\/yonetim\/etkinlikler$/, async (istek, yanit) => {
      yonetici(istek);
      const g = await govdeOku(istek);
      const e = etkinlikDenetle(g);
      S.etkinlikYaz.run({ ...e, $olusturma: simdi() });
      yanit.statusCode = 201;
      return { etkinlik: S.etkinlik.get(e.$id) };
    }],
    ['GET', /^\/api\/yonetim\/etkinlikler\/([a-z0-9-]{1,64})\/kayitlar$/, (istek, yanit, url, [, id]) => {
      yonetici(istek);
      const liste = S.kayitlar.all(id);
      if (url.searchParams.get('bicim') !== 'csv') return { kayitlar: liste };
      const hucre = (v) => { const s = String(v ?? ''); return /^[=+\-@\t\r]/.test(s) ? `"'${s.replace(/"/g, '""')}"` : `"${s.replace(/"/g, '""')}"`; };
      const csv = '\ufeff' + ['ad,soyad,eposta,okul_no,misafir,kayit_zamani', ...liste.map((r) => [r.ad, r.soyad, r.eposta, r.okul_no, r.misafir ? 'evet' : 'hayır', r.olusturma].map(hucre).join(','))].join('\r\n');
      yanit.setHeader('Content-Type', 'text/csv; charset=utf-8');
      yanit.setHeader('Content-Disposition', `attachment; filename="kayitlar-${id}.csv"`);
      return { ham: csv };
    }],
    ['GET', /^\/api\/yonetim\/bildirimler$/, (istek) => {
      yonetici(istek);
      return { bildirimler: S.bildirimler.all().map((b) => ({ ...b, konuAd: KONU[b.konu]?.[0] || b.konu })) };
    }],
    ['POST', /^\/api\/yonetim\/yazilar$/, async (istek, yanit) => {
      yonetici(istek);
      const g = await govdeOku(istek, 256 * 1024);
      const y = yaziDenetle(g);
      S.yaziYaz.run(y);
      yanit.statusCode = 201;
      return { tamam: true, id: y.$id };
    }],
    ['DELETE', /^\/api\/yonetim\/yazilar\/([a-z0-9-]{1,80})$/, (istek, yanit, url, [, id]) => {
      yonetici(istek);
      if (!S.yaziSil.run(id).changes) hata(404, 'yazi-yok');
      return { tamam: true };
    }],
  ];
  function yonetici(istek) {
    const k = kimlik(istek);
    if (!k) hata(401, 'oturum-yok');
    if (k.rol !== 'yonetici') hata(403, 'yetki-yok');
    return k;
  }

  /** İstek → yanıt; /api dışı için false döner */
  return async function api(istek, yanit) {
    const url = new URL(istek.url, 'http://yerel');
    if (!url.pathname.startsWith('/api/')) return false;
    yanit.setHeader('Cache-Control', 'no-store');
    try {
      const yol = yollar.find(([y, d]) => y === istek.method && d.test(url.pathname));
      if (!yol) hata(yollar.some(([, d]) => d.test(url.pathname)) ? 405 : 404, 'yol-yok');
      if (istek.method !== 'GET') {
        if (istek.headers['x-uumk'] !== '1') hata(403, 'csrf');
        const kaynak = istek.headers.origin;
        if (kaynak && new URL(kaynak).host !== istek.headers.host) hata(403, 'csrf');
      }
      const sonuc = await yol[2](istek, yanit, url, url.pathname.match(yol[1]));
      if (sonuc === null) { yanit.end(); return true; }
      if (sonuc?.ham !== undefined) { yanit.end(sonuc.ham); return true; }
      yanit.setHeader('Content-Type', 'application/json; charset=utf-8');
      yanit.end(JSON.stringify(sonuc));
    } catch (h) {
      if (!(h instanceof ApiHata)) {
        if (/UNIQUE constraint/.test(h.message)) h = new ApiHata(409, 'zaten-kayitli');
        else { console.error(h); h = new ApiHata(500, 'sunucu-hatasi'); }
      }
      yanit.statusCode = h.durum;
      yanit.setHeader('Content-Type', 'application/json; charset=utf-8');
      yanit.end(JSON.stringify({ hata: h.kod, ...(h.alanlar ? { alanlar: h.alanlar } : {}) }));
    }
    return true;
  };
}

/* ── yönetim girdileri ── */
const metin = (s, uz) => String(s ?? '').normalize('NFC').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, uz);
const ISO_YEREL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
function etkinlikDenetle(g) {
  const alan = {};
  const e = {
    $id: metin(g.id, 64).toLowerCase(), $baslik_tr: metin(g.baslik_tr, 140), $baslik_en: metin(g.baslik_en, 140),
    $ozet_tr: metin(g.ozet_tr, 600), $ozet_en: metin(g.ozet_en, 600), $yer_tr: metin(g.yer_tr, 120), $yer_en: metin(g.yer_en, 120),
    $baslangic: metin(g.baslangic, 16), $bitis: metin(g.bitis, 16) || null,
    $kontenjan: g.kontenjan === '' || g.kontenjan == null ? null : Number(g.kontenjan),
    $kayit_acik: g.kayit_acik ? 1 : 0, $kayit_son: metin(g.kayit_son, 16) || null, $yayinda: g.yayinda === false ? 0 : 1,
  };
  if (!/^[a-z0-9-]{3,64}$/.test(e.$id)) alan.id = 'id-gecersiz';
  if (e.$baslik_tr.length < 3) alan.baslik_tr = 'baslik-gerekli';
  if (!ISO_YEREL.test(e.$baslangic)) alan.baslangic = 'tarih-gecersiz';
  if (e.$bitis && !ISO_YEREL.test(e.$bitis)) alan.bitis = 'tarih-gecersiz';
  if (e.$kayit_son && !ISO_YEREL.test(e.$kayit_son)) alan.kayit_son = 'tarih-gecersiz';
  if (e.$kontenjan !== null && !(Number.isInteger(e.$kontenjan) && e.$kontenjan > 0 && e.$kontenjan < 100000)) alan.kontenjan = 'kontenjan-gecersiz';
  if (Object.keys(alan).length) hata(400, 'alan-hatasi', alan);
  return e;
}
function yaziDenetle(g) {
  const alan = {};
  const y = {
    $id: metin(g.id, 80).toLowerCase(), $tarih: metin(g.tarih, 10), $baslik_tr: metin(g.baslik_tr, 160), $baslik_en: metin(g.baslik_en, 160),
    $ozet_tr: metin(g.ozet_tr, 500), $ozet_en: metin(g.ozet_en, 500), $govde_tr: metin(g.govde_tr, 60000), $govde_en: metin(g.govde_en, 60000),
    $baglanti: metin(g.baglanti, 400) || null, $kaynak: metin(g.kaynak, 80), $yayinda: g.yayinda === false ? 0 : 1,
  };
  if (!/^[a-z0-9-]{3,80}$/.test(y.$id)) alan.id = 'id-gecersiz';
  if (!/^\d{4}-\d{2}(-\d{2})?$/.test(y.$tarih)) alan.tarih = 'tarih-gecersiz';   /* gün bilinmiyorsa YYYY-AA */
  if (y.$baslik_tr.length < 3) alan.baslik_tr = 'baslik-gerekli';
  if (y.$baglanti && !/^https:\/\//.test(y.$baglanti)) alan.baglanti = 'baglanti-gecersiz';
  if (!y.$baglanti && y.$govde_tr.length < 20) alan.govde_tr = 'govde-gerekli';
  if (Object.keys(alan).length) hata(400, 'alan-hatasi', alan);
  return y;
}
