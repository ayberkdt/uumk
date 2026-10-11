/* AYRINTI — tarihçe şeridine basınca açılan kayıt sayfası (#ayrinti). Tembel: site.mjs ilk tıklamada (ya da #tarih-… bağlantısıyla) yükler.
 * Kayıtlar veri/tarihce.mjs'ten; dil değişince açık sayfa yeniden çizilir. Önceki/sonraki düğmeleri ve ← → tuşları kayıtlar arasında gezer;
 * adres çubuğu #tarih-<kimlik> olur, kapanınca temizlenir. */
import { KAYITLAR } from '../veri/tarihce.mjs';
import { metin, etkinDil } from '../ceviri.mjs';

const dlg = document.getElementById('ayrinti'), kart = dlg.querySelector('.ayrinti__kart');
const [geri, ileri] = dlg.querySelectorAll('.ayrinti__yon');
let no = 0;
const el = (ad, yazi) => { const e = document.createElement(ad); if (yazi != null) e.textContent = yazi; return e; };

function resim(r) {
  if (r.ikon) return `<svg viewBox="0 0 24 24" focusable="false"><path d="${r.ikon}"/></svg>`;
  if (r.logo) return `<img src="${r.logo}" width="${r.g}" height="${r.y}" alt="">`;
  if (r.foto) return `<img src="gorseller/foto/${r.foto}-960.jpg" width="960" height="720" alt="">`;
  return `<img src="gorseller/aestro/sayi-${r.dergi}-360.jpg" srcset="gorseller/aestro/sayi-${r.dergi}-360.jpg 360w, gorseller/aestro/sayi-${r.dergi}-720.jpg 720w" sizes="10rem" width="360" height="509" alt="">`;
}
function yon(b, k, ad, d) {
  b.disabled = !k;
  b.replaceChildren(el('small', metin(ad)), el('span', k ? `${k.yil} · ${k.baslik[d]}` : '—'));
}
function ciz() {
  const k = KAYITLAR[no], d = etkinDil() === 'en' ? 1 : 0;
  kart.dataset.tur = k.tur;
  const r = dlg.querySelector('.ayrinti__resim');
  r.className = `ayrinti__resim ayrinti__resim--${Object.keys(k.resim)[0]}`; r.innerHTML = resim(k.resim);
  dlg.querySelector('.ayrinti__yil').textContent = k.yil;
  dlg.querySelector('.ayrinti__kod').textContent = k.kod[d];
  dlg.querySelector('h2').textContent = k.baslik[d];
  /* '•' ile başlayan ardışık satırlar tek liste olur */
  const govde = []; let liste = null;
  for (const s of k.detay[d]) {
    if (s.startsWith('• ')) { if (!liste) govde.push(liste = el('ul')); liste.append(el('li', s.slice(2))); }
    else { liste = null; govde.push(el('p', s)); }
  }
  dlg.querySelector('.ayrinti__govde').replaceChildren(...govde);
  dlg.querySelector('.ayrinti__kaynak-bas').textContent = metin('ayrintiKaynak');
  dlg.querySelector('.ayrinti__kaynaklar').replaceChildren(...k.kaynak.map(([u, tr, en]) => {
    const a = el('a', `${(d && en) || tr} ↗`); a.href = u; a.target = '_blank'; a.rel = 'noopener';
    const li = el('li'); li.append(a); return li;
  }));
  yon(geri, KAYITLAR[no - 1], 'ayrintiOnceki', d); yon(ileri, KAYITLAR[no + 1], 'ayrintiSonraki', d);
  dlg.querySelector('.ayrinti__sira').textContent = `${no + 1} / ${KAYITLAR.length}`;
}

export function ac(id) {
  const i = KAYITLAR.findIndex((k) => k.id === id);
  if (i < 0) return;
  const kayma = dlg.open ? Math.sign(i - no) * 16 : 0;
  no = i; ciz(); dlg.scrollTop = 0;
  if (!dlg.open) dlg.showModal();
  /* kayıt değişince kart gidilen yönden hafifçe kayarak gelir */
  if (kayma && !document.documentElement.classList.contains('az')) kart.animate([{ opacity: 0.35, transform: `translateX(${kayma}px)` }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
  history.replaceState(null, '', `#tarih-${id}`);
}
function git(adim) {
  const k = KAYITLAR[no + adim];
  if (!k) return;
  ac(k.id);
  /* uçtaki düğme kapanınca odak öbürüne geçer */
  if (document.activeElement?.disabled || !dlg.contains(document.activeElement)) (adim < 0 ? (geri.disabled ? ileri : geri) : (ileri.disabled ? geri : ileri)).focus();
}
dlg.addEventListener('click', (e) => {
  const b = e.target.closest('.ayrinti__yon');
  if (b) { git(Number(b.dataset.yon)); return; }
  /* perdeye tık kapatır; pencerenin kendi kaydırma çubuğuna tık (hedefi yine dialog) kapatmaz */
  const r = dlg.getBoundingClientRect(), disarida = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  if ((e.target === dlg && disarida) || e.target.closest('.ayrinti__kapat')) { adresTemizle(); dlg.close(); }
});
dlg.addEventListener('keydown', (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest('a')) return;
  if (e.key === 'ArrowLeft') { e.preventDefault(); git(-1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); git(1); }
});
/* adres kapanırken eşzamanlı temizlenir (close olayı görev kuyruğunda gecikebilir); Esc için cancel, kalan yollar için close */
const adresTemizle = () => { if (location.hash.startsWith('#tarih-')) history.replaceState(null, '', location.pathname + location.search); };
dlg.addEventListener('cancel', adresTemizle);
dlg.addEventListener('close', adresTemizle);
addEventListener('dil-degisti', () => { if (dlg.open) ciz(); });
