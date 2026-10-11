/* KULÜP KARTI — askılı kartın süsleri; hesap bölümüne yaklaşınca site.mjs yükler (açılış JS bütçesi). Koddan barkod çizer;
 * fareyle imleci izleyerek eğilir (parıltı şeridi imleçle kayar), bırakınca ya da dokununca askısında sallanır.
 * Kart aria-hidden: yalnız görsel; asıl bilgi formda. Hareket azaltmada eğim ve sallanma yok. */
export function kartKur(kart, az) {
  const svg = kart.querySelector('[data-kart="barkod"]');
  /* barkod: kodun karakterlerinden belirlenen çubuklar (karakter başına iki çubuk, genişlikler bitlerden) */
  function barkod(kod) {
    let x = 0, h = '';
    for (const ch of kod) { const c = ch.charCodeAt(0); for (let b = 0; b < 4; b++) { const w = 1 + ((c >> b) & 1) + ((c >> (b + 2)) & 1) * 0.6; if (b % 2 === 0) h += `<rect x="${x.toFixed(1)}" width="${w.toFixed(1)}" height="24"/>`; x += w + 0.8; } }
    svg.setAttribute('viewBox', `0 0 ${x.toFixed(1)} 24`); svg.innerHTML = h;
  }
  if (!az) {
    kart.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = kart.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      kart.style.setProperty('--ry', `${(x * 16).toFixed(2)}deg`); kart.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`); kart.style.setProperty('--parlak', `${((x + 0.5) * 320 - 60).toFixed(0)}%`);
    });
    const salla = () => { kart.style.removeProperty('--rx'); kart.style.removeProperty('--ry'); kart.classList.remove('salin'); void kart.offsetWidth; kart.classList.add('salin'); };
    kart.addEventListener('pointerleave', salla); kart.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') salla(); });
  }
  return { barkod };
}
