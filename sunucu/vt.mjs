/* VT — SQLite (Node'un yerleşik node:sqlite modülü; bağımlılık yok). Şema burada; sürüm `PRAGMA user_version` ile ilerler.
 * Kişisel veri en az tutulur: ad, soyad, okul e-postası, okul numarası, parola özeti. IP adresi saklanmaz. */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const GOCLER = [
  /* 1 — ilk şema */
  `CREATE TABLE kullanici (
     id INTEGER PRIMARY KEY,
     ad TEXT NOT NULL, soyad TEXT NOT NULL,
     eposta TEXT NOT NULL UNIQUE COLLATE NOCASE,
     okul_no TEXT NOT NULL UNIQUE,
     parola TEXT NOT NULL,                       -- scrypt$N$r$p$tuz$özet
     dogrulandi INTEGER NOT NULL DEFAULT 0,
     rol TEXT NOT NULL DEFAULT 'uye' CHECK (rol IN ('uye', 'yonetici')),
     olusturma TEXT NOT NULL
   );
   CREATE TABLE oturum (
     ozet TEXT PRIMARY KEY,                      -- belirtecin sha256'sı; belirtecin kendisi yalnız çerezde
     kullanici_id INTEGER NOT NULL REFERENCES kullanici(id) ON DELETE CASCADE,
     bitis TEXT NOT NULL
   );
   CREATE TABLE belirtec (                        -- e-posta doğrulama ve parola sıfırlama
     ozet TEXT PRIMARY KEY,
     kullanici_id INTEGER NOT NULL REFERENCES kullanici(id) ON DELETE CASCADE,
     tur TEXT NOT NULL CHECK (tur IN ('dogrula', 'sifirla')),
     bitis TEXT NOT NULL
   );
   CREATE TABLE etkinlik (
     id TEXT PRIMARY KEY,                        -- adres dostu kısa ad: ornek "teknik-gezi-2026-11"
     baslik_tr TEXT NOT NULL, baslik_en TEXT NOT NULL DEFAULT '',
     ozet_tr TEXT NOT NULL DEFAULT '', ozet_en TEXT NOT NULL DEFAULT '',
     yer_tr TEXT NOT NULL DEFAULT '', yer_en TEXT NOT NULL DEFAULT '',
     baslangic TEXT NOT NULL,                    -- ISO 8601, Europe/Istanbul yerel saati "2026-11-12T14:00"
     bitis TEXT,
     kontenjan INTEGER CHECK (kontenjan IS NULL OR kontenjan > 0),
     kayit_acik INTEGER NOT NULL DEFAULT 0,
     kayit_son TEXT,                             -- bu andan sonra kayıt alınmaz
     yayinda INTEGER NOT NULL DEFAULT 1,
     olusturma TEXT NOT NULL
   );
   CREATE TABLE kayit (
     id INTEGER PRIMARY KEY,
     etkinlik_id TEXT NOT NULL REFERENCES etkinlik(id) ON DELETE CASCADE,
     kullanici_id INTEGER REFERENCES kullanici(id) ON DELETE SET NULL,   -- misafirde NULL
     ad TEXT NOT NULL, soyad TEXT NOT NULL,
     eposta TEXT NOT NULL COLLATE NOCASE, okul_no TEXT NOT NULL,
     olusturma TEXT NOT NULL,
     UNIQUE (etkinlik_id, eposta), UNIQUE (etkinlik_id, okul_no)
   );
   CREATE TABLE yazi (
     id TEXT PRIMARY KEY,
     tarih TEXT NOT NULL,                        -- YYYY-MM-DD
     baslik_tr TEXT NOT NULL, baslik_en TEXT NOT NULL DEFAULT '',
     ozet_tr TEXT NOT NULL DEFAULT '', ozet_en TEXT NOT NULL DEFAULT '',
     govde_tr TEXT NOT NULL DEFAULT '', govde_en TEXT NOT NULL DEFAULT '',   -- düz metin, paragraflar boş satırla
     baglanti TEXT,                              -- dış yazıysa adresi (ornek EUROAVIA blogu)
     kaynak TEXT NOT NULL DEFAULT '',            -- "EUROAVIA blogu", "AESTRO" …
     yayinda INTEGER NOT NULL DEFAULT 1
   );
   CREATE INDEX kayit_etkinlik ON kayit(etkinlik_id);`,
  /* 2 — üyelerin "sorun bildir / soru sor" mesajları (yönetim adresine e-postayla da gider) */
  `CREATE TABLE bildirim (
     id INTEGER PRIMARY KEY,
     kullanici_id INTEGER REFERENCES kullanici(id) ON DELETE SET NULL,
     ad TEXT NOT NULL, eposta TEXT NOT NULL,
     konu TEXT NOT NULL CHECK (konu IN ('site', 'etkinlik', 'uyelik', 'diger')),
     mesaj TEXT NOT NULL,
     olusturma TEXT NOT NULL
   );`,
];

export function vtAc(yol) {
  if (yol !== ':memory:') mkdirSync(dirname(yol), { recursive: true });
  const vt = new DatabaseSync(yol);
  vt.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 3000;');
  const surum = vt.prepare('PRAGMA user_version').get().user_version;
  for (let i = surum; i < GOCLER.length; i++) {
    vt.exec('BEGIN');
    try { vt.exec(GOCLER[i]); vt.exec(`PRAGMA user_version = ${i + 1}`); vt.exec('COMMIT'); }
    catch (h) { vt.exec('ROLLBACK'); throw h; }
  }
  return vt;
}

/** İşlem: fn içindeki her şey ya hep ya hiç (kontenjan sayımı ve ekleme aynı işlemde) */
export function islem(vt, fn) {
  vt.exec('BEGIN IMMEDIATE');
  try { const r = fn(); vt.exec('COMMIT'); return r; }
  catch (h) { vt.exec('ROLLBACK'); throw h; }
}

export const simdi = () => new Date().toISOString();
