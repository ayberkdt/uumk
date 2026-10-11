/* GÖKYÜZÜ — sabit zemin tuvali (2B). Gece uçuşu: gökyüzü rengi değişmez; değişen, havanın yoğunluğuna bağlı iki şeydir.
 *  1. Şehir ışığının havada saçılması: alçakta zeminde sıcak bir pus; tonu ρ(h)/ρ0 ile söner (US76 yoğunluğu).
 *  2. Yıldızların sönümü: soluk yıldızlar yoğun havada görünmez; görünürlük çarpanı 1 − (ρ/ρ0)^0,35 (temsilî eğri, nicel değil).
 * Yeşil hava ışıması bandı (OI 557,7 nm, ~95 km) sayfada 95 km'ye karşılık gelen konumda çizilir: kaydırdıkça içinden geçilir.
 * Kaydırma dışında hiçbir şey hareket etmez (sürekli yıldız akışı yok). Yıldızlar tohumlu: her açılışta aynı gök. */
import { density, SEA_LEVEL } from '../lib/sunumatik/core/astro-atmosphere.mjs';
import { ISIMA, irtifadanSayfaKonumu } from './irtifa.mjs';
import { RENK } from './renk.mjs';

function tohumlu(s) { return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function gokyuzuKur(tuval) {
  const g = tuval.getContext('2d');
  let gen = 0, yuk = 0, dpr = 1;
  const yildizKatman = document.createElement('canvas');
  const rnd = tohumlu(1959);                      // EUROAVIA'nın kuruluş yılı — yalnız tohum
  const YILDIZ = Array.from({ length: 900 }, () => {
    const p = rnd();
    return { x: rnd(), y: rnd(), b: p * p * p, r: 0.4 + 0.9 * rnd() };   // b: parlaklık, çoğu soluk
  });
  function yildizCiz(esik) {
    yildizKatman.width = gen; yildizKatman.height = yuk;
    const y = yildizKatman.getContext('2d');
    y.fillStyle = '#dfe8f2';
    for (const s of YILDIZ) {
      const a = Math.max(0, Math.min(1, (s.b - esik) / (1 - esik + 1e-6))) * 0.9;
      if (a < 0.02) continue;
      y.globalAlpha = a;
      y.beginPath(); y.arc(s.x * gen, s.y * yuk, s.r * dpr * (0.6 + s.b), 0, Math.PI * 2); y.fill();
    }
  }
  function boyutla() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    gen = Math.round(innerWidth * dpr); yuk = Math.round(innerHeight * dpr);
    tuval.width = gen; tuval.height = yuk;
    sonEsik = -1;
  }
  let sonEsik = -1;
  /**
   * @param h irtifa (m, ekranın orta çizgisinde)
   * @param capalar irtifa.mjs çapaları — hava ışıması bandının sayfa konumu için
   */
  function ciz(h, capalar) {
    if (!gen || !yuk) { boyutla(); if (!gen || !yuk) return; }     /* gizli sekme / sıfır boyutlu pencere */
    const oran = density(h) / SEA_LEVEL.rho;
    const gorunurluk = 1 - Math.pow(Math.min(1, oran), 0.35);
    const esik = Math.round((0.92 - 0.9 * gorunurluk) * 50) / 50;     // 0,02 adımlı: katman yalnız eşik değişince yeniden çizilir
    if (esik !== sonEsik) { yildizCiz(esik); sonEsik = esik; }
    g.clearRect(0, 0, gen, yuk);
    g.drawImage(yildizKatman, 0, 0);
    /* şehir ışığı pusu */
    const pus = 0.22 * Math.min(1, oran * 1.15);
    if (pus > 0.004) {
      const d = g.createLinearGradient(0, yuk, 0, yuk * 0.35);
      d.addColorStop(0, `rgba(214, 150, 92, ${pus.toFixed(3)})`);
      d.addColorStop(0.45, `rgba(70, 92, 130, ${(pus * 0.45).toFixed(3)})`);
      d.addColorStop(1, 'rgba(10, 18, 32, 0)');
      g.fillStyle = d; g.fillRect(0, 0, gen, yuk);
    }
    /* hava ışıması bandı — sayfada yüksek irtifa AŞAĞIDADIR: kenarlar sıralanır */
    if (capalar?.length > 1) {
      const y1 = irtifadanSayfaKonumu(capalar, ISIMA.h - ISIMA.yari) - scrollY;
      const tepe = irtifadanSayfaKonumu(capalar, ISIMA.h) - scrollY;
      const y2 = irtifadanSayfaKonumu(capalar, ISIMA.h + ISIMA.yari) - scrollY;
      const [ust, alt] = [Math.min(y1, y2), Math.max(y1, y2)];
      if (alt > -40 && ust < innerHeight + 40 && alt - ust > 2) {
        const d = g.createLinearGradient(0, ust * dpr, 0, alt * dpr);
        const k = Math.max(0.05, Math.min(0.95, (tepe - ust) / (alt - ust)));
        d.addColorStop(0, 'rgba(124, 240, 160, 0)');
        d.addColorStop(k, 'rgba(124, 240, 160, 0.16)');
        d.addColorStop(1, 'rgba(124, 240, 160, 0)');
        g.fillStyle = d; g.fillRect(0, ust * dpr, gen, (alt - ust) * dpr);
      }
    }
  }
  addEventListener('resize', boyutla);
  boyutla();
  return { ciz, renk: RENK.isima };
}
