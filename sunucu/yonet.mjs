#!/usr/bin/env node
/* YÖNET — sunucu tarafı komutları (yönetim sayfasına ilk girişten önce gerekenler).
 *   node sunucu/yonet.mjs yonetici <eposta>          hesabı yönetici yapar (önce sitede hesap açılmış olmalı)
 *   node sunucu/yonet.mjs uye <eposta>               yöneticiliği geri alır
 *   node sunucu/yonet.mjs etkinlik <dosya.json>      etkinlik ekler/günceller (alanlar: sunucu/api.mjs etkinlikDenetle)
 *   node sunucu/yonet.mjs yazilar <dosya.json>       yazı dizisi ekler/günceller (veri/yazilar.json biçimi)
 *   node sunucu/yonet.mjs kayitlar <etkinlik-id>     kayıtları CSV olarak yazdırır
 *   node sunucu/yonet.mjs ozet                       hesap / etkinlik / kayıt sayıları
 * VERI_YOLU ortam değişkeni hangi veritabanının kullanılacağını belirler (varsayılan sunucu/veri/uumk.db). */
import { readFileSync } from 'node:fs';
import { AYAR } from './ayar.mjs';
import { vtAc, simdi } from './vt.mjs';

const [komut, arg] = process.argv.slice(2);
const vt = vtAc(AYAR.veriYolu);
const cik = (m, k = 1) => { console.error(m); process.exit(k); };

switch (komut) {
  case 'yonetici': case 'uye': {
    if (!arg) cik('eposta gerekli');
    const r = vt.prepare('UPDATE kullanici SET rol = ? WHERE eposta = ?').run(komut === 'yonetici' ? 'yonetici' : 'uye', arg.toLowerCase());
    if (!r.changes) cik(`hesap yok: ${arg}`);
    console.log(`${arg} → ${komut}`);
    break;
  }
  case 'etkinlik': {
    const e = JSON.parse(readFileSync(arg, 'utf8'));
    for (const x of Array.isArray(e) ? e : [e]) {
      vt.prepare(`INSERT INTO etkinlik (id, baslik_tr, baslik_en, ozet_tr, ozet_en, yer_tr, yer_en, baslangic, bitis, kontenjan, kayit_acik, kayit_son, yayinda, olusturma)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET baslik_tr=excluded.baslik_tr, baslik_en=excluded.baslik_en, ozet_tr=excluded.ozet_tr,
        ozet_en=excluded.ozet_en, yer_tr=excluded.yer_tr, yer_en=excluded.yer_en, baslangic=excluded.baslangic, bitis=excluded.bitis, kontenjan=excluded.kontenjan,
        kayit_acik=excluded.kayit_acik, kayit_son=excluded.kayit_son, yayinda=excluded.yayinda`)
        .run(x.id, x.baslik_tr, x.baslik_en || '', x.ozet_tr || '', x.ozet_en || '', x.yer_tr || '', x.yer_en || '', x.baslangic, x.bitis || null,
          x.kontenjan ?? null, x.kayit_acik ? 1 : 0, x.kayit_son || null, x.yayinda === false ? 0 : 1, simdi());
      console.log(`etkinlik: ${x.id}`);
    }
    break;
  }
  case 'yazilar': {
    const liste = JSON.parse(readFileSync(arg, 'utf8'));
    const s = vt.prepare(`INSERT INTO yazi (id, tarih, baslik_tr, baslik_en, ozet_tr, ozet_en, govde_tr, govde_en, baglanti, kaynak, yayinda) VALUES (?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET tarih=excluded.tarih, baslik_tr=excluded.baslik_tr, baslik_en=excluded.baslik_en, ozet_tr=excluded.ozet_tr, ozet_en=excluded.ozet_en,
      govde_tr=excluded.govde_tr, govde_en=excluded.govde_en, baglanti=excluded.baglanti, kaynak=excluded.kaynak, yayinda=excluded.yayinda`);
    for (const y of liste) { s.run(y.id, y.tarih, y.baslik.tr, y.baslik.en || '', y.ozet.tr || '', y.ozet.en || '', y.govde?.tr || '', y.govde?.en || '', y.baglanti || null, y.kaynak || '', 1); console.log(`yazı: ${y.id}`); }
    break;
  }
  case 'kayitlar': {
    const rows = vt.prepare('SELECT ad, soyad, eposta, okul_no, kullanici_id IS NULL AS misafir, olusturma FROM kayit WHERE etkinlik_id = ? ORDER BY olusturma').all(arg);
    console.log('ad,soyad,eposta,okul_no,misafir,kayit_zamani');
    for (const r of rows) console.log([r.ad, r.soyad, r.eposta, r.okul_no, r.misafir ? 'evet' : 'hayır', r.olusturma].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    break;
  }
  case 'ozet': {
    const say = (t) => vt.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
    console.log({ hesap: say('kullanici'), etkinlik: say('etkinlik'), kayit: say('kayit'), yazi: say('yazi'), veri: AYAR.veriYolu });
    break;
  }
  default: cik('komutlar: yonetici <eposta> · uye <eposta> · etkinlik <json> · yazilar <json> · kayitlar <id> · ozet', 2);
}
