/* PANO — kalkış panosu ve biniş kartı. Ayrıntı: notlar/tasarim.md. */
import { metin } from '../ceviri.mjs';

const HARF = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ0123456789';

export function panoKur({ tablo, pencere, az = false }) {
  const hucreler = [...tablo.querySelectorAll('[data-flap]')];
  let asil = hucreler.map((h) => h.textContent);

  let nesil = 0;
  addEventListener('dil-degisti', () => {
    if (tablo.hasAttribute('aria-busy')) hucreler.forEach((h, i) => { if (!h.hasAttribute('data-i18n')) h.textContent = asil[i]; });
    nesil++; tablo.removeAttribute('aria-busy'); tablo.classList.remove('flap-dondu');
  });
  function dondur() {
    if (az) return;
    const benim = ++nesil;
    const abc = document.documentElement.lang === 'en' ? HARF.replace(/[ÇĞİÖŞÜ]/g, '') : HARF;
    asil = hucreler.map((h) => h.textContent);
    tablo.setAttribute('aria-busy', 'true');
    tablo.classList.add('flap-dondu');
    const bas = performance.now();
    const plan = hucreler.map((h, i) => {
      const satir = [...tablo.tBodies[0].rows].indexOf(h.closest('tr'));
      return { h, metin: asil[i], gecikme: satir * 45, sure: 380 + 14 * asil[i].length };
    });
    function kare(t) {
      if (benim !== nesil) return;
      let bitmedi = false;
      for (const p of plan) {
        const g = t - bas - p.gecikme;
        if (g >= p.sure) { if (p.h.textContent !== p.metin) p.h.textContent = p.metin; continue; }
        bitmedi = true;
        if (g < 0) continue;
        const otur = Math.floor((g / p.sure) * p.metin.length);
        let s = p.metin.slice(0, otur);
        for (let k = otur; k < p.metin.length; k++) s += p.metin[k] === ' ' ? ' ' : abc[(Math.random() * abc.length) | 0];
        p.h.textContent = s;
      }
      if (bitmedi) requestAnimationFrame(kare);
      else { tablo.removeAttribute('aria-busy'); tablo.classList.remove('flap-dondu'); }
    }
    requestAnimationFrame(kare);
  }

  const metinler = new Map([...document.querySelectorAll('.bilet-metinleri article')].map((a) => [a.dataset.id, a]));
  const alan = (ad) => pencere.querySelector(`[data-alan="${ad}"]`);
  let acan = null;
  function ac(id, { gecmis = true } = {}) {
    const tr = tablo.querySelector(`tr[data-bilet="${id}"]`), m = metinler.get(id);
    if (!tr || !m) return;
    const i = (k) => (tablo.getAttribute('aria-busy') ? asil[hucreler.indexOf(tr.querySelectorAll('[data-flap]')[k])] : tr.querySelectorAll('[data-flap]')[k].textContent);
    const en = document.documentElement.lang === 'en';
    pencere.querySelector('#bilet-ad').textContent = i(1);
    alan('tarih').textContent = (en && m.dataset.tarihEn) || m.dataset.tarih;
    alan('kapi').textContent = alan('kapi2').textContent = i(2);
    alan('kisa').textContent = i(0);
    alan('durum').textContent = alan('damga').textContent = i(3);
    alan('damga').dataset.durum = tr.querySelector('.durum')?.dataset.i18n || '';
    alan('tur').textContent = metin('tur' + m.dataset.tur.charAt(0).toUpperCase() + m.dataset.tur.slice(1));
    alan('ucus').textContent = `UUMK ${String([...tablo.tBodies[0].rows].reverse().indexOf(tr) + 1).padStart(3, '0')}`;
    alan('metin').innerHTML = m.innerHTML;
    const kaynakFoto = m.dataset.foto && document.querySelector(`#fotolar img[src*="${m.dataset.foto}"]`), f = alan('foto');
    f.hidden = !kaynakFoto;
    f.replaceChildren(...(kaynakFoto ? [Object.assign(document.createElement('img'), { src: kaynakFoto.currentSrc || kaynakFoto.src, alt: kaynakFoto.alt, width: 480, height: 360 })] : []));
    const k = alan('kaynak'); k.href = m.dataset.kaynak; k.textContent = en ? 'Open the post' : 'Gönderiyi aç'; k.classList.add('dis');
    k.setAttribute('aria-label', en ? `Open the post on ${m.dataset.kaynakAd} (new tab)` : `Gönderiyi ${m.dataset.kaynakAd}'da aç (yeni sekme)`);
    const kod = `UUMK-${id.toUpperCase()}`;
    alan('kod').textContent = kod;
    import('../lib/sunumatik/boarding_pass/code128.mjs').then(({ code128Svg }) => { alan('barkod').innerHTML = code128Svg(kod, { height: 60, label: `Barkod: ${kod}` }); });
    acan = document.activeElement;
    if (!pencere.open) pencere.showModal();
    if (gecmis) history.replaceState(null, '', `#etkinlik-${id}`);
  }
  let derinden = false;
  function kapat() { if (pencere.open) pencere.close(); }
  pencere.addEventListener('close', () => {
    if (location.hash.startsWith('#etkinlik-')) history.replaceState(null, '', '#etkinlikler');
    if (derinden) { derinden = false; document.getElementById('etkinlikler')?.scrollIntoView({ behavior: 'instant' }); }
    acan?.focus?.({ preventScroll: true });
  });
  pencere.querySelector('.bilet__kapat').addEventListener('click', kapat);
  pencere.addEventListener('click', (e) => { if (e.target === pencere) kapat(); });
  tablo.addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-bilet]');
    if (tr && !e.target.closest('a')) ac(tr.dataset.bilet);
  });
  const h = location.hash.match(/^#etkinlik-([a-z0-9]+)$/);
  if (h) { derinden = true; document.getElementById('etkinlikler')?.scrollIntoView({ behavior: 'instant' }); ac(h[1], { gecmis: false }); }

  return { dondur, ac, kapat };
}
