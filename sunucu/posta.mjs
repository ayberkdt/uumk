/* POSTA — doğrulama, parola sıfırlama ve kayıt onayı e-postaları.
 * SMTP_URL tanımlıysa (smtps://kullanici:parola@sunucu:465) örtük TLS üzerinden SMTP ile gönderilir; değilse ileti
 * sunucu/posta-kutusu/ klasörüne .eml olarak yazılır (yerel geliştirme ve sınama; bağlantılar oradan açılır). */
import { connect } from 'node:tls';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { AYAR } from './ayar.mjs';

const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const baslikKodla = (s) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`);
function adresKodla(a) {
  const m = String(a).match(/^(.*)<(.+)>$/);
  return m ? `${baslikKodla(m[1].trim())} <${m[2]}>` : a;
}

function ileti({ kime, konu, metin }) {
  const kimden = AYAR.postaGonderen;
  const alan = (kimden.match(/@([^>]+)/) || [, 'uumk.local'])[1];
  return [
    `From: ${adresKodla(kimden)}`, `To: ${kime}`, `Subject: ${baslikKodla(konu)}`,
    `Date: ${new Date().toUTCString()}`, `Message-ID: <${randomBytes(12).toString('hex')}@${alan}>`,
    'MIME-Version: 1.0', 'Content-Type: text/plain; charset=utf-8', 'Content-Transfer-Encoding: base64', '',
    b64(metin).replace(/.{76}/g, '$&\r\n'),
  ].join('\r\n');
}

function smtpGonder(url, kimden, kime, govde) {
  const u = new URL(url);
  return new Promise((coz, reddet) => {
    const s = connect({ host: u.hostname, port: Number(u.port || 465), servername: u.hostname });
    let tampon = '', adim = 0;
    const komutlar = [
      () => `EHLO uumk`, () => 'AUTH LOGIN', () => b64(decodeURIComponent(u.username)), () => b64(decodeURIComponent(u.password)),
      () => `MAIL FROM:<${(kimden.match(/<(.+)>/) || [, kimden])[1]}>`, () => `RCPT TO:<${kime}>`, () => 'DATA',
      () => govde.replace(/^\./gm, '..') + '\r\n.', () => 'QUIT',
    ];
    const zaman = setTimeout(() => { s.destroy(); reddet(new Error('smtp zaman aşımı')); }, 20000);
    s.setEncoding('utf8');
    s.on('data', (d) => {
      tampon += d;
      const satirlar = tampon.split('\r\n'); tampon = satirlar.pop();
      for (const satir of satirlar) {
        if (/^\d{3}-/.test(satir)) continue;                    // çok satırlı yanıtın ara satırları
        const kod = Number(satir.slice(0, 3));
        if (kod >= 400) { clearTimeout(zaman); s.destroy(); return reddet(new Error(`smtp ${satir}`)); }
        if (adim < komutlar.length) s.write(komutlar[adim++]() + '\r\n');
        else { clearTimeout(zaman); s.end(); coz(); }
      }
    });
    s.on('error', (h) => { clearTimeout(zaman); reddet(h); });
  });
}

/** Gönder; hata yutulmaz ama çağıranın akışını da kırmaz: sonuç { tamam, yol? , hata? } */
export async function postaGonder({ kime, konu, metin }) {
  const govde = ileti({ kime, konu, metin });
  try {
    if (AYAR.smtpUrl) { await smtpGonder(AYAR.smtpUrl, AYAR.postaGonderen, kime, govde); return { tamam: true }; }
    mkdirSync(AYAR.postaKutusu, { recursive: true });
    const yol = join(AYAR.postaKutusu, `${Date.now()}-${kime.replace(/[^a-z0-9@._-]/gi, '_')}.eml`);
    writeFileSync(yol, govde + '\r\n');
    writeFileSync(yol.replace(/\.eml$/, '.txt'), `Kime: ${kime}\nKonu: ${konu}\n\n${metin}\n`);   // okunur kopya
    return { tamam: true, yol };
  } catch (h) {
    console.error('posta gönderilemedi:', h.message);
    return { tamam: false, hata: h.message };
  }
}
