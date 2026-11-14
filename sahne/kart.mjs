/* KULÜP KARTI — kulüp kartının barkodu. Hesap bölümüne yaklaşınca site.mjs yükler. Kart aria-hidden: yalnız görsel; asıl bilgi formda. */
export function kartKur(kart) {
  const svg = kart.querySelector('[data-kart="barkod"]');
  /* barkod: kodun karakterlerinden belirlenen çubuklar (karakter başına iki çubuk, genişlikler bitlerden) */
  function barkod(kod) {
    let x = 0, h = '';
    for (const ch of kod) { const c = ch.charCodeAt(0); for (let b = 0; b < 4; b++) { const w = 1 + ((c >> b) & 1) + ((c >> (b + 2)) & 1) * 0.6; if (b % 2 === 0) h += `<rect x="${x.toFixed(1)}" width="${w.toFixed(1)}" height="24"/>`; x += w + 0.8; } }
    svg.setAttribute('viewBox', `0 0 ${x.toFixed(1)} 24`); svg.innerHTML = h;
  }
  return { barkod };
}
