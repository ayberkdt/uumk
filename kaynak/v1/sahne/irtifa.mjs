/* İRTİFA — kaydırma konumunu irtifaya çevirir ve sağ kenardaki irtifa şeridini günceller.
 *
 * Çapa: data-irtifa (metre) taşıyan öğeler. Başvuru çizgisi bir çapanın üst kenarındayken irtifa o çapanın değeridir.
 * Başvuru çizgisi ekranın üstünden (sayfa başı) altına (sayfa sonu) kaydırma oranıyla kayar: başta 0 km, sonda tavan;
 * iki çapa arasında log(1 + h/H0) doğrusal ara değerle (alçakta metreler, yüksekte yüz kilometreler okunur kalsın).
 * T ve p ABD Standart Atmosferi 1976'dan (lib/sunumatik/core/astro-atmosphere.mjs) — sayılar elle yazılmaz.
 * Saf kısım (sayfaKonumundanIrtifa, irtifadanSayfaKonumu, olcekKesri) Node'da sınanır. */
import { atmosphere } from '../lib/sunumatik/core/astro-atmosphere.mjs';

export const H0 = 300;                 // m — log ölçeğinin dizi; alçak irtifada çözünürlük
export const TAVAN = 400000;           // m — şeridin tepesi (alçak yörünge)
const L = (h) => Math.log1p(Math.max(0, h) / H0);
const Lt = (v) => H0 * Math.expm1(v);

/** çapalar: [{ y (sayfa px), h (m) }] artan y ile */
export function sayfaKonumundanIrtifa(capalar, y) {
  if (!capalar.length) return 0;
  if (y <= capalar[0].y) return capalar[0].h;
  for (let i = 1; i < capalar.length; i++) {
    const a = capalar[i - 1], b = capalar[i];
    if (y <= b.y) { const k = (y - a.y) / Math.max(1, b.y - a.y); return Lt(L(a.h) + k * (L(b.h) - L(a.h))); }
  }
  return capalar[capalar.length - 1].h;
}
export function irtifadanSayfaKonumu(capalar, h) {
  for (let i = 1; i < capalar.length; i++) {
    const a = capalar[i - 1], b = capalar[i];
    if (h <= b.h) { const k = (L(h) - L(a.h)) / Math.max(1e-9, L(b.h) - L(a.h)); return a.y + Math.max(0, Math.min(1, k)) * (b.y - a.y); }
  }
  return capalar.length ? capalar[capalar.length - 1].y : 0;
}
/** şerit üzerindeki konum, 0 (yer) … 1 (tavan) */
export const olcekKesri = (h) => Math.min(1, L(h) / L(TAVAN));

/** Jeopotansiyel → geometrik yükseklik (US76 yarıçapı) */
const R = 6356766;
export const geometrik = (hj) => (R * hj) / (R - hj);

/** Şeridin çentikleri: katman sınırları US76 tablosundan, Kármán FAI tanımından, hava ışıması gözlemden (notlar/dogrulanmis-olgular.md) */
export const CENTIKLER = [
  { h: 0, ad: 'Yer' },
  { h: geometrik(11000), ad: 'Tropopoz' },
  { h: geometrik(47000), ad: 'Stratopoz' },
  { h: geometrik(84852), ad: 'Mezopoz', etiketsiz: true },   // Kármán'a log ölçekte çok yakın: yalnız çentik
  { h: 100000, ad: 'Kármán hattı' },
  { h: TAVAN, ad: 'Alçak yörünge' },
];
export const ISIMA = { h: 95000, yari: 6000 };   // yeşil hava ışıması tepe yüksekliği ve yarı kalınlığı

const sayi = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const tam = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
/** US76'nın tanımlı olduğu tavan. Modül 86 km üstünü sabit ölçek yüksekliğiyle uzatır (kendi başlığı: "ayrıntılı model DEĞİLDİR");
 *  bu uzatma 400 km'de gerçeğin çok altında basınç verir, o yüzden 86 km üstünde T ve p gösterilmez. */
export const MODEL_TAVAN = geometrik(84852);
const ondalik2 = new Intl.NumberFormat('tr-TR', { maximumSignificantDigits: 2 });
/** Okunuş: irtifa, sıcaklık, basınç (kPa ya da Pa); model dışında null */
export function okunus(h) {
  const km = h / 1000;
  const irt = km < 10 ? `${sayi.format(km)} km` : `${tam.format(km)} km`;
  if (h > MODEL_TAVAN) return { irt, sic: '—', bas: '—' };
  const { T, p } = atmosphere(h);
  const sic = `${tam.format(T - 273.15)} °C`.replace('-', '−');
  const bas = p >= 1000 ? `${sayi.format(p / 1000)} kPa` : `${ondalik2.format(p)} Pa`;
  return { irt, sic, bas };
}

/** DOM kurulumu: çapaları ölç, kaydırmada irtifayı bildir */
export function irtifaKur({ capaSecici = '[data-irtifa]', serit, bildir }) {
  let capalar = [];
  const els = [...document.querySelectorAll(capaSecici)];
  function olc() {
    capalar = els.map((e) => ({ y: e.getBoundingClientRect().top + scrollY, h: Number(e.dataset.irtifa) })).sort((a, b) => a.y - b.y);
  }
  const imlec = serit?.querySelector('.irtifa__imlec');
  const deger = { irt: serit?.querySelector('[data-irt]'), sic: serit?.querySelector('[data-sic]'), bas: serit?.querySelector('[data-bas]') };
  /* çentikleri şeride yerleştir */
  if (serit) {
    const ray = serit.querySelector('.irtifa__ray');
    for (const c of CENTIKLER) {
      const li = document.createElement('li');
      li.style.setProperty('--k', olcekKesri(c.h).toFixed(4));
      li.innerHTML = c.etiketsiz ? '' : `<span>${c.ad}</span><b>${tam.format(c.h / 1000)} km</b>`;
      if (c.etiketsiz) li.title = c.ad;
      ray.append(li);
    }
    const isima = document.createElement('li');
    isima.className = 'irtifa__isima';
    isima.style.setProperty('--k', olcekKesri(ISIMA.h - ISIMA.yari).toFixed(4));
    isima.style.setProperty('--k2', olcekKesri(ISIMA.h + ISIMA.yari).toFixed(4));
    ray.append(isima);
  }
  let sonMetin = '';
  function guncelle() {
    const tavan = document.documentElement.scrollHeight - innerHeight;
    const oran = tavan > 0 ? Math.min(1, Math.max(0, scrollY / tavan)) : 0;
    const h = sayfaKonumundanIrtifa(capalar, scrollY + innerHeight * oran);
    if (imlec) imlec.style.setProperty('--k', olcekKesri(h).toFixed(4));
    const o = okunus(h);
    const metin = o.irt + o.sic + o.bas;
    if (metin !== sonMetin && deger.irt) { deger.irt.textContent = o.irt; deger.sic.textContent = o.sic; deger.bas.textContent = o.bas; sonMetin = metin; }
    bildir?.(h, capalar);
  }
  olc();
  return { olc, guncelle, capalar: () => capalar };
}
