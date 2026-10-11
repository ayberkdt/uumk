/* Code 128-B kodlayıcı — saf, DOM'suz, deterministik.
 *
 *   encode128B('SNM042')  → { values, widths, modules, checksum }
 *   code128Svg('SNM042', { height: 96 }) → '<svg …>' (viewBox birim = modül)
 *
 * Code 128: her sembol 3 çubuk + 3 boşluktan oluşur, toplam 11 modül;
 * bitiş sembolü 4 çubuk + 3 boşluk, 13 modül. B kümesi ASCII 32–127'yi
 * kodlar (değer = kod − 32). Sağlama: (başlangıç + Σ değer·konum) mod 103.
 * Desen tablosu ve test vektörleri scripts/validate-page-presets.mjs'te
 * bağımsız bir kodlayıcının (reportlab 5.0) çıktısına karşı sabitlenmiştir.
 */

export const PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
];

const START_B = 104;
const STOP = 106;
export const QUIET = 10; // her iki yanda en az 10 modül sessiz bölge

export function encode128B(text) {
  const value = String(text);
  if (!value.length) throw new RangeError('code128: boş metin kodlanamaz');
  const values = [START_B];
  for (const ch of value) {
    const code = ch.codePointAt(0);
    if (code < 32 || code > 127) {
      throw new RangeError(`code128: "${ch}" (U+${code.toString(16).toUpperCase().padStart(4, '0')}) B kümesinde yok — yalnız ASCII 32–127`);
    }
    values.push(code - 32);
  }
  let sum = START_B;
  for (let i = 1; i < values.length; i++) sum += values[i] * i;
  const checksum = sum % 103;
  values.push(checksum, STOP);
  const widths = values.map(v => PATTERNS[v]).join('');
  let modules = 0;
  for (const w of widths) modules += Number(w);
  return { values, widths, modules, checksum };
}

/* SVG: çubuklar <rect>; genişlik modül biriminde, dış ölçek CSS'ten gelir. */
export function code128Svg(text, { height = 60, label } = {}) {
  const { widths, modules } = encode128B(text);
  const total = modules + QUIET * 2;
  let x = QUIET;
  const rects = [];
  for (let i = 0; i < widths.length; i++) {
    const w = Number(widths[i]);
    if (i % 2 === 0) rects.push(`<rect x="${x}" y="0" width="${w}" height="${height}"/>`);
    x += w;
  }
  /* ekran okuyucu etiketi sayfanın dilinde; Node'da (doğrulayıcı) belge yok */
  const en = typeof document !== 'undefined' && (document.documentElement.lang || 'tr').startsWith('en');
  const aria = label ?? `${en ? 'Barcode' : 'Barkod'}: ${text}`;
  return `<svg class="bp-barkod-svg" viewBox="0 0 ${total} ${height}" preserveAspectRatio="none" role="img" aria-label="${escapeAttr(aria)}" fill="currentColor">${rects.join('')}</svg>`;
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
