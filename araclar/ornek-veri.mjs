#!/usr/bin/env node
/* ÖRNEK VERİ — yalnız yerel deneme veritabanı (sunucu/veri/deneme.db). Gündem kartlarının ve kayıt akışının nasıl göründüğünü
 * görmek için açıkça "Örnek" diye adlandırılmış etkinlikler ekler; yazılar veri/yazilar.json'dan. Yayın veritabanına dokunmaz.
 *   node araclar/ornek-veri.mjs   →   node sunucu/sunucu.mjs --deneme */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { vtAc, simdi } from '../sunucu/vt.mjs';

const KOK = join(dirname(fileURLToPath(import.meta.url)), '..');
const vt = vtAc(join(KOK, 'sunucu', 'veri', 'deneme.db'));
const gun = (n, saat = '14:00') => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10) + 'T' + saat;
const E = vt.prepare(`INSERT OR REPLACE INTO etkinlik (id, baslik_tr, baslik_en, ozet_tr, ozet_en, yer_tr, yer_en, baslangic, kontenjan, kayit_acik, kayit_son, olusturma) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
E.run('ornek-teknik-gezi', 'Teknik gezi (örnek)', 'Technical trip (example)', 'Kayıt akışını denemek için örnek kart. Yayındaki sitede yönetim panelinden eklenen etkinlikler görünür.', 'An example card for trying the registration flow. The live site shows the events added from the admin page.', 'Hangar (örnek)', 'Hangar (example)', gun(12, '09:30'), 40, 1, gun(9, '23:59'), simdi());
E.run('ornek-seminer', 'Seminer (örnek)', 'Seminar (example)', 'Kontenjansız etkinliğin örnek kartı. Yayındaki sitede yönetim panelinden eklenen etkinlikler görünür.', 'An example card for an event without a capacity limit. The live site shows the events added from the admin page.', 'Fakülte (örnek)', 'Faculty (example)', gun(20, '18:00'), null, 1, null, simdi());
const Y = vt.prepare(`INSERT OR REPLACE INTO yazi (id, tarih, baslik_tr, baslik_en, ozet_tr, ozet_en, govde_tr, govde_en, baglanti, kaynak, yayinda) VALUES (?,?,?,?,?,?,?,?,?,?,1)`);
for (const y of JSON.parse(readFileSync(join(KOK, 'veri', 'yazilar.json'), 'utf8'))) Y.run(y.id, y.tarih, y.baslik.tr, y.baslik.en, y.ozet.tr, y.ozet.en, '', '', y.baglanti, y.kaynak);
console.log('deneme.db hazır:', vt.prepare('SELECT COUNT(*) n FROM etkinlik').get().n, 'etkinlik,', vt.prepare('SELECT COUNT(*) n FROM yazi').get().n, 'yazı');
