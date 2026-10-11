/* MOBİL DENETİM — sayfada çalışır (cekim.mjs "js=" adımı ya da tarayıcı konsolu). Dört tür kusur arar ve listeler:
 * taşma (yatay olarak görünüm alanının dışına çıkan, kırpan bir atası olmayan öğe), kesik metin (overflow gizli kutuda metin
 * sığmıyor), çakışma (iki farklı metin öğesinin kutuları belirgin biçimde üst üste) ve küçük dokunma hedefi (< 44 px; paragraf içi
 * bağlantılar hariç). Gizli ve saydam öğeler, aria-hidden süsler sayılmaz. Sonuç: { tasma, kesik, cakisma, kucuk } dizileri. */
(() => {
  const W = innerWidth, sY = scrollY;
  const gorunur = (e) => { if (!e.isConnected) return false; const c = getComputedStyle(e); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.05) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const gizliAta = (e) => { for (let p = e; p; p = p.parentElement) { if (p.hidden || p.closest?.('[aria-hidden="true"], dialog:not([open]), template')) return true; const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.05) return true; } return false; };
  const kirpanAta = (e) => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const c = getComputedStyle(p); if (/(hidden|clip|auto|scroll)/.test(c.overflowX)) return p; } return null; };
  const ad = (e) => { let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id; const k = (e.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2); if (k.length) s += '.' + k.join('.'); const t = (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30); return t ? `${s} «${t}»` : s; };
  const hepsi = [...document.body.querySelectorAll('*')].filter((e) => !gizliAta(e) && gorunur(e) && !e.closest('.gorunmez, .maket__ad'));
  /* kırpan atanın (kaydırma kutusu, overflow gizli) dışında kalan kısım görünmez: çakışma sayılmaz */
  const kirpilmis = (e, r) => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const c = getComputedStyle(p); if (/(hidden|clip|auto|scroll)/.test(c.overflowY + c.overflowX)) { const q = p.getBoundingClientRect(); if (r.bottom <= q.top + 1 || r.top >= q.bottom - 1 || r.right <= q.left + 1 || r.left >= q.right - 1) return true; } } return false; };
  const tasma = [], kesik = [], cakisma = [], kucuk = [];
  for (const e of hepsi) {
    const r = e.getBoundingClientRect();
    if ((r.right > W + 1 || r.left < -1) && !kirpanAta(e) && getComputedStyle(e).position !== 'fixed') tasma.push(`${ad(e)} [${Math.round(r.left)}…${Math.round(r.right)}]`);
    const c = getComputedStyle(e);
    /* taşan içerik: kutu kırpmıyor ama içerik genişliği kutuyu aşıyor (yan sütunun üstüne biner) */
    if (c.overflowX === 'visible' && /^(block|table-cell|flex|grid|list-item|inline-block)$/.test(c.display) && e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 2 && (e.textContent || '').trim() && !e.closest('svg') && ![...e.children].some((k) => /absolute|fixed/.test(getComputedStyle(k).position))) kesik.push('TAŞAN ' + ad(e) + ' (' + e.scrollWidth + ' > ' + e.clientWidth + ')');
    if (/(hidden|clip)/.test(c.overflowX) && e.scrollWidth > e.clientWidth + 2 && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && c.textOverflow !== 'ellipsis') kesik.push(`${ad(e)} (${e.scrollWidth} > ${e.clientWidth})`);
    if (e.matches('a, button, input:not([type=hidden]), select, textarea, [role=button], [role=option], [role=tab], summary')) {
      const satirIci = e.matches('a') && c.display === 'inline' && e.closest('p, li, dd, figcaption, td, small, span') && !e.closest('nav');
      if (!satirIci && (r.height < 43.5 || r.width < 43.5) && !e.matches('input[type=checkbox], input[type=radio]')) kucuk.push(`${ad(e)} ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
  }
  /* metin yaprakları: doğrudan metin düğümü taşıyan, görünür öğeler */
  const yaprak = hepsi.filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1) && !e.closest('svg, canvas'));
  /* satır satır kutular: iki satıra bölünen satır içi öğe tek büyük kutu sayılmasın */
  const kutu = yaprak.flatMap((e) => { const rr = document.createRange(); rr.selectNodeContents(e); return [...rr.getClientRects()].filter((r) => r.width > 1 && r.height > 1 && !kirpilmis(e, r)).map((r) => ({ e, r: { l: r.left, t: r.top + sY, rr: r.right, b: r.bottom + sY } })); });
  kutu.sort((a, b) => a.r.t - b.r.t);
  for (let i = 0; i < kutu.length; i++) {
    const a = kutu[i];
    for (let j = i + 1; j < kutu.length && kutu[j].r.t < a.r.b; j++) {
      const b = kutu[j];
      if (a.e === b.e || a.e.contains(b.e) || b.e.contains(a.e)) continue;
      const x = Math.min(a.r.rr, b.r.rr) - Math.max(a.r.l, b.r.l), y = Math.min(a.r.b, b.r.b) - Math.max(a.r.t, b.r.t);
      if (x <= 2 || y <= 2) continue;
      const kucukAlan = Math.min((a.r.rr - a.r.l) * (a.r.b - a.r.t), (b.r.rr - b.r.l) * (b.r.b - b.r.t));
      if (y > 6 && x * y > kucukAlan * 0.15) cakisma.push(`${ad(a.e)} ↔ ${ad(b.e)} (${Math.round(x)}×${Math.round(y)} @y${Math.round(a.r.t)})`);
    }
  }
  return { W, sayfa: document.documentElement.scrollWidth, tasma: tasma.slice(0, 40), kesik: kesik.slice(0, 40), cakisma: cakisma.slice(0, 60), kucuk: [...new Set(kucuk)].slice(0, 60) };
})()
