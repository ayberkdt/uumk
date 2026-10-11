/* AYRINTI — tarihçe şeridine basınca açılan kayıt sayfası (#ayrinti): fotoğrafı olan kayıtta üstte afiş, hikâye, fotoğraf ızgarası
 * (kareye basınca pencere içinde büyür; ← → gezer, Esc önce büyütmeyi kapatır), kaynaklar, önceki/sonraki. Tembel: site.mjs ilk tıklamada (ya da #tarih-… bağlantısıyla) yükler.
 * Kayıtlar veri/tarihce.mjs'ten; dil değişince açık sayfa yeniden çizilir. Önceki/sonraki düğmeleri ve ← → tuşları kayıtlar arasında gezer;
 * adres çubuğu #tarih-<kimlik> olur, kapanınca temizlenir. */
import { KAYITLAR } from '../veri/tarihce.mjs';
import { metin, etkinDil } from '../ceviri.mjs';

const dlg = document.getElementById('ayrinti'), kart = dlg.querySelector('.ayrinti__kart');
const [geri, ileri] = dlg.querySelectorAll('.ayrinti__yon');
let no = 0;
const el = (ad, yazi) => { const e = document.createElement(ad); if (yazi != null) e.textContent = yazi; return e; };

function resim(r) {
  if (r.cizim) return `<svg viewBox="0 0 64 64" focusable="false"><use href="gorseller/semboller.svg#tarih-${r.cizim}"/></svg>`;
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
  /* afiş ve fotoğraf ızgarası */
  const galeri = k.galeri || [], afis = dlg.querySelector('.ayrinti__afis'), gb = dlg.querySelector('.ayrinti__galeri');
  const ilk = galeri.find(([ad]) => !ad.startsWith('2003'));   /* küçük arşiv görseli afiş olmaz */
  afis.hidden = !ilk; if (ilk) { afis.src = `gorseller/tarihce/${ilk[0]}-960.jpg`; }
  dlg.querySelector('.ayrinti__bas').toggleAttribute('data-resimsiz', !!ilk && !!k.resim.foto);   /* afiş aynı fotoğrafsa küçük kare tekrar etmez */
  gb.hidden = !galeri.length;
  gb.querySelector('h3').textContent = metin('ayrintiGaleri', { n: galeri.length });
  gb.querySelector('ul').replaceChildren(...galeri.map((g, i) => {
    const li = el('li'), b = el('button'); b.type = 'button'; b.dataset.foto = i; b.setAttribute('aria-label', g[1 + d]);
    const im = el('img'); im.src = `gorseller/tarihce/${g[0]}-480.jpg`; im.alt = ''; im.loading = 'lazy'; b.append(im); li.append(b, el('span', g[1 + d])); return li;
  }));
  isikKapat();
  dlg.querySelector('.ayrinti__kaynak-bas').textContent = metin('ayrintiKaynak');
  dlg.querySelector('.ayrinti__kaynaklar').replaceChildren(...k.kaynak.map(([u, tr, en]) => {
    const a = el('a', `${(d && en) || tr} ↗`); a.href = u; a.target = '_blank'; a.rel = 'noopener';
    const li = el('li'); li.append(a); return li;
  }));
  yon(geri, KAYITLAR[no - 1], 'ayrintiOnceki', d); yon(ileri, KAYITLAR[no + 1], 'ayrintiSonraki', d);
  dlg.querySelector('.ayrinti__sira').textContent = `${no + 1} / ${KAYITLAR.length}`;
}

/* ışık kutusu: pencerenin içinde büyük fotoğraf, altyazı ve kaynak bağlantısı */
const isik = dlg.querySelector('.ayrinti__isik');
let foto = -1, fotoDonus = null;
function isikAc(i) {
  const g = KAYITLAR[no].galeri, d = etkinDil() === 'en' ? 1 : 0;
  if (!g?.[i]) return;
  foto = i; isik.hidden = false;
  isik.querySelector('img').src = `gorseller/tarihce/${g[i][0]}-960.jpg`; isik.querySelector('img').alt = g[i][1 + d];
  const a = el('a', `${metin('ayrintiFotoKaynak')} ↗`); a.href = g[i][3]; a.target = '_blank'; a.rel = 'noopener';
  isik.querySelector('figcaption').replaceChildren(el('span', `${i + 1} / ${g.length} · ${g[i][1 + d]}`), a);
  isik.querySelectorAll('.ayrinti__isik-yon').forEach((b) => { b.disabled = !g[i + Number(b.dataset.isik)]; });
  isik.querySelector('.ayrinti__isik-kapat').focus();
}
function isikKapat() { if (isik.hidden) return; isik.hidden = true; foto = -1; fotoDonus?.focus(); fotoDonus = null; }

export function ac(id) {
  const i = KAYITLAR.findIndex((k) => k.id === id);
  if (i < 0) return;
  const kayma = dlg.open ? Math.sign(i - no) * 16 : 0;
  no = i; ciz(); dlg.scrollTop = 0;
  if (!dlg.open) dlg.showModal();
  dlg.scrollTop = 0;   /* showModal odağı ilk odaklanabilir öğeye verip pencereyi kaydırabilir */
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
  const f = e.target.closest('[data-foto]');
  if (f) { fotoDonus = f; isikAc(Number(f.dataset.foto)); return; }
  const iy = e.target.closest('[data-isik]');
  if (iy) { isikAc(foto + Number(iy.dataset.isik)); return; }
  if (e.target.closest('.ayrinti__isik-kapat') || e.target === isik) { isikKapat(); return; }
  const b = e.target.closest('.ayrinti__yon');
  if (b) { git(Number(b.dataset.yon)); return; }
  /* perdeye tık kapatır; pencerenin kendi kaydırma çubuğuna tık (hedefi yine dialog) kapatmaz */
  const r = dlg.getBoundingClientRect(), disarida = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  if ((e.target === dlg && disarida) || e.target.closest('.ayrinti__kapat')) { adresTemizle(); dlg.close(); }
});
dlg.addEventListener('keydown', (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest('a')) return;
  const adim = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
  if (!adim) return;
  e.preventDefault();
  if (foto >= 0) isikAc(foto + adim); else git(adim);
});
/* adres kapanırken eşzamanlı temizlenir (close olayı görev kuyruğunda gecikebilir); Esc için cancel, kalan yollar için close */
const adresTemizle = () => { if (location.hash.startsWith('#tarih-')) history.replaceState(null, '', location.pathname + location.search); };
dlg.addEventListener('cancel', (e) => { if (foto >= 0) { e.preventDefault(); isikKapat(); return; } adresTemizle(); });
dlg.addEventListener('close', adresTemizle);
addEventListener('dil-degisti', () => { if (dlg.open) ciz(); });
