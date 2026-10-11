#!/usr/bin/env node
/* TARİHÇE-İNŞA — veri/tarihce.mjs kayıtlarından zaman çizelgesi şeritlerini (index.html) ve İngilizce şerit metinlerini (dil/en.mjs) üretir.
 *   node araclar/tarihce-insa.mjs           (yazar)
 *   node araclar/tarihce-insa.mjs --sina    (yazmaz; dosyalar üretici çıktısıyla aynı değilse çıkış 1)
 * İşaretler: <!-- tarihce:seritler --> … <!-- /tarihce:seritler --> ve en.mjs'te /* tarihce:basla *\/ … /* tarihce:bitir *\/.
 * Ayrıntı sayfaları sayfaya yazılmaz; sahne/ayrinti.mjs ilk tıklamada veri/tarihce.mjs'ten çizer. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KAYITLAR } from '../veri/tarihce.mjs';

const KOK = join(dirname(fileURLToPath(import.meta.url)), '..');
const kac = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tirnak = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
export const anahtar = (k) => 'r' + k.id.replace(/-/g, '');
const KAPAK_Y = { 1: 509, 2: 509, 3: 521 };

function resim(r) {
  if (r.ikon) return `<span class="serit__resim" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path pathLength="1" d="${r.ikon}"/></svg></span>`;
  if (r.logo) return `<span class="serit__resim serit__resim--logo" aria-hidden="true"><img src="${r.logo}" width="${r.g}" height="${r.y}" alt="" loading="lazy"></span>`;
  if (r.foto) return `<span class="serit__resim serit__resim--foto" aria-hidden="true"><img src="gorseller/foto/${r.foto}-480.jpg" width="480" height="360" alt="" loading="lazy"></span>`;
  if (r.dergi) return `<span class="serit__resim serit__resim--kapak" aria-hidden="true"><img src="gorseller/aestro/sayi-${r.dergi}-360.jpg" width="360" height="${KAPAK_Y[r.dergi]}" alt="" loading="lazy"></span>`;
  throw new Error('resim türü yok');
}

export function seritler() {
  return KAYITLAR.map((k) => {
    const a = anahtar(k);
    return `        <li class="serit serit--${k.tur} rota__nokta${k.ana ? ' rota__nokta--ana' : ''}" id="tarih-${k.id}">${resim(k.resim)}<time>${k.yil}</time>`
      + `<p class="serit__kod" data-i18n="${a}k">${kac(k.kod[0])}</p><h4><a class="serit__ac" href="#tarih-${k.id}" data-i18n="${a}b">${kac(k.baslik[0])}</a></h4>`
      + `<p data-i18n="${a}">${kac(k.ozet[0])}</p><span class="serit__devam" aria-hidden="true" data-i18n="seritDevam">Ayrıntılar</span></li>\n`;
  }).join('');
}
export function ingilizce() {
  return KAYITLAR.map((k) => { const a = anahtar(k); return `  ${a}k: ${tirnak(k.kod[1])}, ${a}b: ${tirnak(k.baslik[1])}, ${a}: ${tirnak(k.ozet[1])},\n`; }).join('') + `  seritDevam: 'Details',\n`;
}

const HTML_I = /(<!-- tarihce:seritler -->\n)[\s\S]*?(        <!-- \/tarihce:seritler -->)/;
const EN_I = /(  \/\* tarihce:basla — araclar\/tarihce-insa\.mjs üretir \*\/\n)[\s\S]*?(  \/\* tarihce:bitir \*\/)/;
export const htmlYerlestir = (html) => { if (!HTML_I.test(html)) throw new Error('index.html: tarihce işareti yok'); return html.replace(HTML_I, (_, a, b) => a + seritler() + b); };
export const enYerlestir = (en) => { if (!EN_I.test(en)) throw new Error('en.mjs: tarihce işareti yok'); return en.replace(EN_I, (_, a, b) => a + ingilizce() + b); };

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const hYol = join(KOK, 'index.html'), eYol = join(KOK, 'dil', 'en.mjs');
  const h = readFileSync(hYol, 'utf8'), e = readFileSync(eYol, 'utf8'), hY = htmlYerlestir(h), eY = enYerlestir(e);
  if (process.argv.includes('--sina')) { const ok = h === hY && e === eY; console.log(ok ? 'aynı' : 'FARKLI — node araclar/tarihce-insa.mjs'); process.exit(ok ? 0 : 1); }
  writeFileSync(hYol, hY); writeFileSync(eYol, eY);
  console.log(`tarihçe: ${KAYITLAR.length} şerit yazıldı`);
}
