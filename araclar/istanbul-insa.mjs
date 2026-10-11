#!/usr/bin/env node
/* İSTANBUL-İNŞA — sahne/istanbul.mjs presetinden SVG'leri üretip index.html'deki işaretlerin arasına yazar.
 *   node araclar/istanbul-insa.mjs           (yazar)
 *   node araclar/istanbul-insa.mjs --sina    (yazmaz; sayfadaki çizim üretici çıktısıyla aynı değilse çıkış 1)
 * İşaretler: <!-- istanbul:gun --> (açılış; alt bilgideki gece sürümü site.mjs'te bundan klonlanır), <!-- istanbul:pul --> (yazı pulları). */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { istanbulSvg, pulSembolleri } from '../sahne/istanbul.mjs';

const yol = join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
export const PARCALAR = {
  gun: () => istanbulSvg({ tema: 'gun', kimlik: 'istanbul' }),
  pul: () => pulSembolleri(),
};
export function yerlestir(html) {
  let sonuc = html;
  for (const [ad, uret] of Object.entries(PARCALAR)) {
    const desen = new RegExp(`(<!-- istanbul:${ad} -->)[\\s\\S]*?(<!-- /istanbul:${ad} -->)`);
    if (!desen.test(sonuc)) throw new Error(`index.html'de işaret yok: istanbul:${ad}`);
    sonuc = sonuc.replace(desen, (_, a, b) => `${a}${uret()}${b}`);
  }
  return sonuc;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const html = readFileSync(yol, 'utf8'), yeni = yerlestir(html);
  if (process.argv.includes('--sina')) { console.log(html === yeni ? 'aynı' : 'FARKLI — node araclar/istanbul-insa.mjs'); process.exit(html === yeni ? 0 : 1); }
  writeFileSync(yol, yeni);
  console.log(`index.html güncellendi (${(Buffer.byteLength(yeni) / 1024).toFixed(0)} kB; çizim ${(Object.values(PARCALAR).reduce((s, u) => s + u().length, 0) / 1024).toFixed(0)} kB)`);
}
