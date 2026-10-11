/* GÜVENLİK — parola özeti (scrypt), rastgele belirteç, çerez, hız sınırı, girdi denetimi. Yalnız node:crypto. */
import { scryptSync, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { AYAR } from './ayar.mjs';

const N = 16384, R = 8, P = 1, UZ = 64;
export function parolaOzetle(parola) {
  const tuz = randomBytes(16);
  const ozet = scryptSync(parola.normalize('NFC'), tuz, UZ, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${tuz.toString('base64')}$${ozet.toString('base64')}`;
}
export function parolaDogru(parola, kayitli) {
  const [ad, n, r, p, tuz, ozet] = String(kayitli).split('$');
  if (ad !== 'scrypt') return false;
  const beklenen = Buffer.from(ozet, 'base64');
  const hesap = scryptSync(parola.normalize('NFC'), Buffer.from(tuz, 'base64'), beklenen.length, { N: +n, r: +r, p: +p });
  return timingSafeEqual(hesap, beklenen);
}
/** Parola yokken de aynı süre: kullanıcı yokken sahte karşılaştırma (e-posta var mı sızmasın) */
const SAHTE = parolaOzetle('uumk-sahte-parola');
export const sahteKarsilastir = (p) => { parolaDogru(String(p || ''), SAHTE); return false; };

export const belirtec = () => randomBytes(32).toString('base64url');
export const ozet = (b) => createHash('sha256').update(String(b)).digest('hex');

export function cerezleriOku(istek) {
  const sonuc = {};
  for (const parca of String(istek.headers.cookie || '').split(';')) {
    const i = parca.indexOf('=');
    if (i > 0) sonuc[parca.slice(0, i).trim()] = decodeURIComponent(parca.slice(i + 1).trim());
  }
  return sonuc;
}
export function cerezYaz(istek, ad, deger, saniye) {
  const guvenli = AYAR.guvenliCerez ?? (istek.headers['x-forwarded-proto'] === 'https' || !!istek.socket.encrypted);
  return `${ad}=${encodeURIComponent(deger)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${saniye}${guvenli ? '; Secure' : ''}`;
}

/** Kayan pencere hız sınırı (bellekte): anahtar başına `pencere` ms'de en çok `sinir` deneme */
export function hizSiniri(sinir, pencere) {
  const kova = new Map();
  return (anahtar) => {
    const t = Date.now();
    const liste = (kova.get(anahtar) || []).filter((x) => t - x < pencere);
    if (liste.length >= sinir) { kova.set(anahtar, liste); return false; }
    liste.push(t); kova.set(anahtar, liste);
    if (kova.size > 5000) for (const [k, v] of kova) if (!v.some((x) => t - x < pencere)) kova.delete(k);
    return true;
  };
}

/* ── girdi denetimi: kullanıcıya gidecek hata kodları (metinler istemcide, iki dilde) ── */
const temiz = (s, uz = 80) => String(s ?? '').normalize('NFC').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, uz);
export function kisiDenetle(g) {
  const veri = {
    ad: temiz(g.ad, 60), soyad: temiz(g.soyad, 60),
    eposta: temiz(g.eposta, 120).toLowerCase(),
    okul_no: temiz(g.okul_no, 20).replace(/\s+/g, ''),
  };
  const hata = {};
  if (veri.ad.length < 2) hata.ad = 'ad-gerekli';
  if (veri.soyad.length < 2) hata.soyad = 'soyad-gerekli';
  if (!/^[^\s@]+@[^\s@]+$/.test(veri.eposta)) hata.eposta = 'eposta-gecersiz';
  else if (!veri.eposta.endsWith('@' + AYAR.okulAlani)) hata.eposta = 'eposta-okul';
  if (!AYAR.okulNoDeseni.test(veri.okul_no)) hata.okul_no = 'okul-no-gecersiz';
  if (g.kvkk !== true) hata.kvkk = 'kvkk-gerekli';
  return { veri, hata };
}
export function parolaDenetle(p) {
  const s = String(p ?? '');
  if (s.length < AYAR.parolaEnAz) return 'parola-kisa';
  if (s.length > 200) return 'parola-uzun';
  return null;
}
