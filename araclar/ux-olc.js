/* UX ÖLÇÜMÜ — canlı DOM'dan ux-yasalari göz testlerinin sayıları (v3). cekim.mjs ile: js=<bu dosyanın içeriği>
 * İlk ekran payı: başlık bloğu + uçağın kapladığı alan (tuvalin boyanmış piksellerinin sınır kutusu). */
(() => {
  const gorunur = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0'; };
  const tum = [...document.querySelectorAll('body *')].filter((e) => !e.closest('dialog:not([open])') && !e.closest('[hidden]'));
  const metinli = tum.filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && gorunur(e));
  const punto = [...new Set(metinli.map((e) => getComputedStyle(e).fontSize))].sort((a, b) => parseFloat(a) - parseFloat(b));
  const yaricap = [...new Set(tum.map((e) => getComputedStyle(e).borderTopLeftRadius).filter((r) => r !== '0px' && !r.endsWith('%')))];
  const golge = [...new Set(tum.map((e) => getComputedStyle(e).boxShadow).filter((s) => s !== 'none' && !/inset/.test(s)))];
  const hedefler = [...document.querySelectorAll('a[href], button, input:not([type=hidden]), [role="option"], [tabindex="0"]')].filter(gorunur)
    .filter((e) => !(e.tagName === 'A' && e.closest('p, li, dd') && !e.classList.contains('dugme') && getComputedStyle(e).display === 'inline'));
  const enKucuk = hedefler.map((e) => { const r = e.getBoundingClientRect(); return { ad: (e.textContent || e.getAttribute('aria-label') || e.id || e.tagName).trim().slice(0, 24), g: Math.round(r.width), y: Math.round(r.height) }; })
    .sort((a, b) => Math.min(a.g, a.y) - Math.min(b.g, b.y)).slice(0, 4);
  const ekran = innerWidth * innerHeight;
  const alan = (e) => { if (!e) return 0; const r = e.getBoundingClientRect(); return Math.max(0, Math.min(innerWidth, r.right) - Math.max(0, r.left)) * Math.max(0, Math.min(innerHeight, r.bottom) - Math.max(0, r.top)); };
  /* kâğıt: 2B tuvalde boyanmış piksellerin sınır kutusu */
  let kagit = 0;
  const t = document.querySelector('#ucus-tuval');
  try {
    const g = t.getContext('2d');
    if (g) {
      const d = g.getImageData(0, 0, t.width, t.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let y = 0; y < t.height; y += 4) for (let x = 0; x < t.width; x += 4) if (d[(y * t.width + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      const k = t.getBoundingClientRect().width / t.width;
      if (x1 > 0) kagit = (x1 - x0) * k * (y1 - y0) * k;
    }
  } catch { kagit = -1; }
  const pay = { baslik: alan(document.querySelector('.giris__metin .ad')) / ekran, metin: (alan(document.querySelector('.ad')) + alan(document.querySelector('.giris__aciklama')) + alan(document.querySelector('.giris__eylem')) + alan(document.querySelector('.giris__olgu'))) / ekran, kagit: kagit / ekran, ust: alan(document.querySelector('.ust')) / ekran };
  const bosluk = (a, b) => Math.round(document.querySelector(b).getBoundingClientRect().top - document.querySelector(a).getBoundingClientRect().bottom);
  const ekip = [...document.querySelectorAll('.ekip')];
  const yakinlik = {
    'ekip başlık→metin': bosluk('.ekip h3', '.ekip p'),
    'ekip↔ekip (yatay)': Math.round(ekip[1].getBoundingClientRect().left - ekip[0].getBoundingClientRect().right),
    'h2→giriş': bosluk('#yazilar h2', '#yazilar .bolum__giris'),
    'giriş→içerik': bosluk('#yazilar .bolum__bas', '#yazilar .yazilar'),
    'kart iç (tarih→başlık)': bosluk('.yazi .yazi__ust', '.yazi h3'),
    'kart↔kart': Math.round(document.querySelectorAll('.yazi')[2].getBoundingClientRect().top - document.querySelectorAll('.yazi')[0].getBoundingClientRect().bottom),
    'etiket→alan': bosluk('#giris-form label', '#giris-form-kim'),
    'alan→alan': bosluk('#giris-form-kim', '#giris-panel .alan--ara label'),
  };
  return JSON.stringify({ punto, yaricap, golge, enKucuk, pay, yakinlik, nav: [...document.querySelectorAll('.menu ul a')].map((a) => a.lastElementChild.textContent), eylemKahraman: document.querySelectorAll('.giris__eylem a, .giris__eylem button').length });
})()
