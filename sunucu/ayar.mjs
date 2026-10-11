/* AYAR — sunucunun bütün ayarları ortam değişkenlerinden; varsayılanlar yerel geliştirme içindir.
 *
 *   PORT                 4210   (4190 kullanılmaz: fetch standardının yasaklı port listesinde, Node fetch reddetti)
 *   VERI_YOLU            sunucu/veri/uumk.db           (SQLite; klasör yoksa açılır)
 *   SITE_ADRESI          http://127.0.0.1:<PORT>       (e-postadaki bağlantılar bu köke göre kurulur)
 *   OKUL_EPOSTA_ALANI    itu.edu.tr                    (hesap ve misafir kaydında zorunlu alan adı)
 *   OKUL_NO_DESENI       ^[0-9]{8,11}$                 (İTÜ öğrenci numarası biçimi kulüpçe teyit edilmeli; şimdilik geniş)
 *   GUVENLI_CEREZ        1 ise çerez Secure (HTTPS arkasında yayında 1 olmalı); boşsa istek HTTPS ise kendiliğinden
 *   SMTP_URL             smtps://kullanici:parola@sunucu:465   (boşsa e-postalar sunucu/posta-kutusu/ klasörüne yazılır)
 *   POSTA_GONDEREN       "İTÜ UUMK <istanbul@euroavia.eu>"
 *   GUVENILIR_VEKIL      1 ise istemci IP'si X-Forwarded-For'dan alınır (yalnız nginx/Caddy arkasında; yoksa başlık sahtelenip hız sınırı atlanabilir)
 *   GIRIS_SINIRI         IP başına 10 dakikada giriş/hesap açma denemesi (varsayılan 10; --deneme modunda 200)
 *   YONETIM_EPOSTA       istanbul@euroavia.eu          (üyelerin "sorun bildir / soru sor" mesajlarının gittiği yönetim adresi; kulüpçe teyit edilmeli)
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const KLASOR = dirname(fileURLToPath(import.meta.url));
const e = process.env;

export const AYAR = {
  port: Number(e.PORT || 4210),
  kok: join(KLASOR, '..'),
  /* --deneme: yerel deneme veritabanı (araclar/ornek-veri.mjs doldurur; yayına girmez) */
  veriYolu: e.VERI_YOLU || join(KLASOR, 'veri', process.argv.includes('--deneme') ? 'deneme.db' : 'uumk.db'),
  postaKutusu: e.POSTA_KUTUSU || join(KLASOR, 'posta-kutusu'),
  get siteAdresi() { return (e.SITE_ADRESI || `http://127.0.0.1:${this.port}`).replace(/\/$/, ''); },
  okulAlani: (e.OKUL_EPOSTA_ALANI || 'itu.edu.tr').toLowerCase(),
  okulNoDeseni: new RegExp(e.OKUL_NO_DESENI || '^[0-9]{8,11}$'),
  guvenliCerez: e.GUVENLI_CEREZ === '1' ? true : e.GUVENLI_CEREZ === '0' ? false : null,
  smtpUrl: e.SMTP_URL || '',
  vekilGuven: e.GUVENILIR_VEKIL === '1',
  girisSiniri: Number(e.GIRIS_SINIRI || (process.argv.includes('--deneme') ? 200 : 10)),
  postaGonderen: e.POSTA_GONDEREN || 'İTÜ UUMK <istanbul@euroavia.eu>',
  yonetimEposta: e.YONETIM_EPOSTA || 'istanbul@euroavia.eu',
  oturumGun: 30,
  dogrulamaSaat: 48,
  sifirlamaSaat: 2,
  parolaEnAz: 8,
};
