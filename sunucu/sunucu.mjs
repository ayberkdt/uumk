#!/usr/bin/env node
/* SUNUCU — UUMK sitesi + kayıt API'si, tek süreç, bağımlılık yok (Node 22.5+; node:sqlite).
 *   node sunucu/sunucu.mjs                 → http://127.0.0.1:4210/
 * Ayarlar: sunucu/ayar.mjs (ortam değişkenleri). Statik dosyalar proje kökünden; yayına girmeyen klasörler (sunucu/, notlar/,
 * araclar/, kaynak/, .claude/) 404 döner. Güvenlik başlıkları vercel.json'daki "/(.*)" kümesinden okunur (tek kaynak).
 * Yayında bir ters vekilin (nginx/Caddy) arkasında HTTPS ile çalıştırılır; GUVENLI_CEREZ=1, SITE_ADRESI=https://… verilir. */
import { createServer } from 'node:http';
import { readFileSync, statSync, createReadStream } from 'node:fs';
import { join, normalize, extname, sep } from 'node:path';
import { gzipSync } from 'node:zlib';
import { AYAR } from './ayar.mjs';
import { vtAc } from './vt.mjs';
import { apiKur } from './api.mjs';

const TUR = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8' };
const SIKISTIR = new Set(['.html', '.css', '.mjs', '.js', '.json', '.svg', '.txt', '.xml']);
const GIZLI = /^\/(sunucu|notlar|araclar|kaynak|\.claude|\.git|node_modules)(\/|$)|\/\.|\.(db|db-wal|db-shm|md|py|ps1|cmd|eml)$/i;

function basliklar() {
  try { return JSON.parse(readFileSync(join(AYAR.kok, 'vercel.json'), 'utf8')).headers.find((b) => b.source === '/(.*)').headers; } catch { return []; }
}

export function sunucuKur({ vt = vtAc(AYAR.veriYolu), onbellek = process.env.NODE_ENV === 'production' } = {}) {
  const api = apiKur(vt);
  const genel = basliklar();
  const sunucu = createServer(async (istek, yanit) => {
    for (const b of genel) yanit.setHeader(b.key, b.value);
    try {
      if (await api(istek, yanit)) return;
      if (istek.method !== 'GET' && istek.method !== 'HEAD') { yanit.statusCode = 405; return yanit.end(); }
      let yol = decodeURIComponent(new URL(istek.url, 'http://yerel').pathname);
      if (GIZLI.test(yol)) return yok(yanit);
      if (yol.endsWith('/')) yol += 'index.html';
      const dosya = normalize(join(AYAR.kok, yol));
      if (!dosya.startsWith(AYAR.kok + sep) && dosya !== AYAR.kok) return yok(yanit);
      let bilgi;
      try { bilgi = statSync(dosya); } catch { return yok(yanit); }
      if (bilgi.isDirectory()) { yanit.statusCode = 301; yanit.setHeader('Location', yol + '/'); return yanit.end(); }
      const uz = extname(dosya).toLowerCase();
      yanit.setHeader('Content-Type', TUR[uz] || 'application/octet-stream');
      yanit.setHeader('Cache-Control', !onbellek ? 'no-store' : /^\/(vendor|yazitipleri)\//.test(yol) ? 'public, max-age=31536000, immutable' : 'public, max-age=300');
      if (SIKISTIR.has(uz) && /gzip/.test(istek.headers['accept-encoding'] || '')) {
        const veri = gzipSync(readFileSync(dosya), { level: 6 });
        yanit.setHeader('Content-Encoding', 'gzip'); yanit.setHeader('Vary', 'Accept-Encoding'); yanit.setHeader('Content-Length', veri.length);
        return yanit.end(istek.method === 'HEAD' ? undefined : veri);
      }
      yanit.setHeader('Content-Length', bilgi.size);
      if (istek.method === 'HEAD') return yanit.end();
      createReadStream(dosya).pipe(yanit);
    } catch (h) {
      console.error(h);
      if (!yanit.headersSent) { yanit.statusCode = 500; yanit.end(); }
    }
  });
  function yok(yanit) {
    yanit.statusCode = 404;
    try { yanit.setHeader('Content-Type', TUR['.html']); yanit.end(readFileSync(join(AYAR.kok, '404.html'))); }
    catch { yanit.setHeader('Content-Type', TUR['.txt']); yanit.end('Bulunamadı'); }
  }
  return { sunucu, vt };
}

if (import.meta.main) {
  const { sunucu } = sunucuKur();
  sunucu.listen(AYAR.port, '127.0.0.1', () => console.log(`UUMK sunucusu: http://127.0.0.1:${AYAR.port}/  (veri: ${AYAR.veriYolu}${AYAR.smtpUrl ? '' : ' · e-postalar: sunucu/posta-kutusu/'})`));
}
