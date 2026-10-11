/* AĞ — EUROAVIA haritasının denetleyicisi: harita (sahne/harita.mjs), seçim listesi (listbox), üzerine gelme etiketi,
 * seçim paneli ve mesafe sayacı. Sayılar veri/ag.mjs'ten hesaplanır; HTML'deki sayılar JS'siz okuma içindir ve dogrula.mjs ile
 * eşitliği sınanır. */
import { GRUPLAR, TAKVIM, TURLER, MERKEZ, grup, mesafe, mesafeKoord } from '../veri/ag.mjs';
import { haritaKur } from './harita.mjs';
import { etkinDil } from '../ceviri.mjs';

const en = () => etkinDil() === 'en';
const kmS = (n) => new Intl.NumberFormat(en() ? 'en-GB' : 'tr-TR').format(n);
const TURLER_EN = { AS: 'Full member (Affiliated Society)', PAS: 'On the way to full membership (Prospective AS)', AM: 'Associated member outside Europe (Adjunct Member)', PAM: 'On the way to associated membership (Prospective AM)' };
const turAd = (t) => (en() ? TURLER_EN[t] : TURLER[t]);
const grupAd = (g) => (en() ? g[2] : g[3]);
const ulkeAd = (g) => (en() ? g[4] : g[5]);
const yerAd = (t) => (en() ? t[7] : t[3]);

export async function agKur({ kap, liste, secim, km, az = false }) {
  const tuval = kap.querySelector('canvas');
  const etiketKap = kap.querySelector('.harita__etiketler');
  const merkez = grup(MERKEZ);
  let yerlestir = () => {};
  const cizici = haritaKur(tuval, { gruplar: GRUPLAR, merkez: MERKEZ, az, boyutDegisti: () => requestAnimationFrame(() => yerlestir()) });
  kap.dataset.cizici = '2b';

  /* etiketler: İstanbul (sabit), seçili ve üzerine gelinen */
  const etiket = (metin, sinif = '') => { const e = document.createElement('span'); e.className = `harita__etiket ${sinif}`; e.textContent = metin; e.hidden = true; etiketKap.append(e); return e; };
  const eIst = etiket(en() ? 'Istanbul' : 'İstanbul', 'harita__etiket--ana'), eSec = etiket(''), eUst = etiket('');
  let secili = null, ustunde = null;
  function etiketYerlestir(e, hedef, sol = false) {
    if (!hedef) { e.hidden = true; return; }
    const [x, y] = cizici.izdus(hedef.enlem, hedef.boylam);
    e.hidden = false;
    /* sığmıyorsa diğer yana: etiket harita kenarında kesilmesin */
    const w = e.offsetWidth, G = kap.clientWidth;
    if (!sol && x + 12 + w > G - 8) sol = true; else if (sol && x - 12 - w < 8) sol = false;
    e.style.transform = sol ? `translate(calc(${(x - 12).toFixed(1)}px - 100%), ${(y - 12).toFixed(1)}px)` : `translate(${(x + 12).toFixed(1)}px, ${(y - 12).toFixed(1)}px)`;
  }
  yerlestir = function () {
    etiketYerlestir(eIst, { enlem: merkez[6], boylam: merkez[7] });
    etiketYerlestir(eSec, secili, true);
    etiketYerlestir(eUst, ustunde && ustunde !== secili ? ustunde : null);
  };

  /* üzerine gelme: ekranda en yakın grup (fare ≤ 16 px, parmak ≤ 28 px) */
  function enYakin(cx, cy, yaricap = 16) {
    const r = tuval.getBoundingClientRect();
    let en0 = null, d0 = yaricap * yaricap;
    for (const g of GRUPLAR) {
      const [x, y] = cizici.izdus(g[6], g[7]);
      const d = (x - (cx - r.left)) ** 2 + (y - (cy - r.top)) ** 2;
      if (d < d0) { d0 = d; en0 = g; }
    }
    return en0;
  }
  const grupHedef = (g) => ({ enlem: g[6], boylam: g[7], ad: grupAd(g), kod: g[0] });
  tuval.addEventListener('pointermove', (e) => {
    const g = enYakin(e.clientX, e.clientY);
    ustunde = g ? grupHedef(g) : null;
    eUst.textContent = g ? `${grupAd(g)} · ${g[1]}` : '';
    tuval.style.cursor = g ? 'pointer' : '';
    cizici.onizle(g && g !== merkez ? ustunde : null);
    yerlestir();
  });
  tuval.addEventListener('pointerleave', () => { ustunde = null; cizici.onizle(null); yerlestir(); });
  tuval.addEventListener('click', (e) => { const g = enYakin(e.clientX, e.clientY, e.pointerType === 'touch' ? 28 : 16); if (g) grupSec(g); });

  /* mesafe sayacı: rota çizilirken km sayılır */
  let sayac = 0;
  function kmSay(hedef) {
    cancelAnimationFrame(sayac);
    if (!km) return;
    km.parentElement.hidden = !hedef;   /* İstanbul seçiliyken 0 km gösterilmez */
    if (az) { km.textContent = kmS(hedef); return; }
    const t0 = performance.now();
    const adim = (t) => { const u = Math.min(1, (t - t0) / 1200); km.textContent = kmS(Math.round(hedef * (1 - (1 - u) ** 3))); if (u < 1) sayac = requestAnimationFrame(adim); };
    sayac = requestAnimationFrame(adim);
  }

  /* seçim paneli */
  const secAd = secim.querySelector('.ag__secim-ad'), secAlt = secim.querySelector('.ag__secim-alt'), don = secim.querySelector('.ag__don');
  don?.addEventListener('click', () => { grupSec(merkez); liste.focus(); });
  function paneliYaz(baslik, tur, alt) {
    secAd.replaceChildren(document.createTextNode(`${baslik} · `), Object.assign(document.createElement('span'), { textContent: tur }));
    secAlt.textContent = alt;
  }
  function grupSec(g) {
    secili = g[0] === MERKEZ ? null : grupHedef(g);
    eSec.textContent = secili ? grupAd(g) : '';
    cizici.vurgula(secili);
    const olaylar = TAKVIM.filter((t) => t[6] === g[0]).map((t) => t[2]);
    let uzak;
    if (g[0] === MERKEZ) {
      const s = GRUPLAR.filter((x) => x !== merkez).map((x) => [grupAd(x), Math.round(mesafe(merkez, x))]).sort((a, b) => a[1] - b[1]);
      const [y, u] = [s[0], s[s.length - 1]];
      uzak = en() ? `Nearest group: ${y[0]} (${kmS(y[1])} km); farthest: ${u[0]} (${kmS(u[1])} km). ` : `En yakın grup ${y[0]} (${kmS(y[1])} km), en uzak ${u[0]} (${kmS(u[1])} km). `;
      kmSay(0);
    } else {
      const d = Math.round(mesafe(merkez, g));
      uzak = en() ? `${kmS(d)} km from Istanbul. ` : `İstanbul'dan ${kmS(d)} km. `;
      kmSay(d);
    }
    paneliYaz(grupAd(g), g[1], `${ulkeAd(g)} · ${turAd(g[1])}. ${uzak}${olaylar.length ? (en() ? `Events here in 2025–26: ${olaylar.join(', ')}.` : `2025–26'da burada: ${olaylar.join(', ')}.`) : ''}`);
    sonSecim = () => grupSec(g);
    if (don) don.hidden = g[0] === MERKEZ;
    listedeIsaretle(null);
    yerlestir();
  }
  function olaySec(i) {
    const t = TAKVIM[i];
    secili = { enlem: t[4], boylam: t[5], ad: yerAd(t) };
    cizici.vurgula(secili);
    const g = t[6] ? grup(t[6]) : null;
    const dn = Math.round(mesafeKoord(merkez[6], merkez[7], t[4], t[5])), d = kmS(dn);
    paneliYaz(yerAd(t), g ? g[1] : (en() ? 'venue' : 'etkinlik yeri'), en() ? `${t[2]}. ${d} km from Istanbul.${g && g[2] !== t[7] ? ` Host group: ${g[2]}.` : ''}` : `${t[2]}. İstanbul'dan ${d} km.${g && g[3] !== t[3] ? ` Ev sahibi grup: ${g[3]}.` : ''}`);
    eSec.textContent = yerAd(t);
    kmSay(dn);
    sonSecim = () => olaySec(i);
    if (don) don.hidden = false;
    listedeIsaretle(i);
    yerlestir();
  }

  /* listbox: tek sekme durağı, ok tuşları, Enter/Boşluk ve tıklama seçer */
  const secenekler = [...liste.querySelectorAll('[role="option"]')];
  let etkin = 0;
  function listedeIsaretle(i) {
    for (const s of secenekler) s.setAttribute('aria-selected', String(i !== null && Number(s.dataset.olay) === i));
  }
  function etkinYap(k, kaydir = true) {
    etkin = Math.max(0, Math.min(secenekler.length - 1, k));
    secenekler.forEach((s, j) => (j === etkin ? s.setAttribute('data-etkin', '') : s.removeAttribute('data-etkin')));
    liste.setAttribute('aria-activedescendant', secenekler[etkin].id);
    if (kaydir) secenekler[etkin].scrollIntoView({ block: 'nearest' });
  }
  liste.addEventListener('keydown', (e) => {
    const k = { ArrowDown: etkin + 1, ArrowUp: etkin - 1, Home: 0, End: secenekler.length - 1 }[e.key];
    if (k !== undefined) { e.preventDefault(); etkinYap(k); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); olaySec(Number(secenekler[etkin].dataset.olay)); }
  });
  liste.addEventListener('focus', () => etkinYap(etkin, false));
  liste.addEventListener('blur', () => secenekler.forEach((s) => s.removeAttribute('data-etkin')));
  liste.addEventListener('click', (e) => {
    const s = e.target.closest('[role="option"]');
    if (!s) return;
    etkinYap(secenekler.indexOf(s), false);
    olaySec(Number(s.dataset.olay));
    /* telefonda harita listenin üstünde kalır: tıklamayla seçilince rota görünsün (klavyede kaydırılmaz, odak bağlamı kaybolmasın) */
    const h = kap.getBoundingClientRect(), gorunen = Math.min(h.bottom, innerHeight) - Math.max(h.top, 0);
    if (gorunen < h.height * 0.6) kap.scrollIntoView({ behavior: az ? 'auto' : 'smooth', block: 'center' });
  });

  /* sıradaki etkinlik (bugünden sonra başlayan ilk) */
  const bugun = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Istanbul' }).format(new Date());   /* YYYY-AA-GG, İstanbul */
  const sirada = TAKVIM.findIndex((t) => t[1] >= bugun);   /* bitişe göre: süren etkinlik sıradaki sayılır */
  if (sirada >= 0) secenekler.find((s) => Number(s.dataset.olay) === sirada)?.classList.add('takvim__sirada');
  for (const s of secenekler) s.classList.toggle('takvim__gecti', TAKVIM[Number(s.dataset.olay)][1] < bugun);   /* geçmiş etkinlik soluk */

  /* takvim satırları dile göre (HTML'deki Türkçe metin JS'siz okuma içindir) */
  function listeYaz() {
    const ay = new Intl.DateTimeFormat(en() ? 'en-GB' : 'tr-TR', { month: 'short', timeZone: 'UTC' });
    for (const s of secenekler) {
      const t = TAKVIM[Number(s.dataset.olay)];
      const [b, e] = [new Date(`${t[0]}T00:00:00Z`), new Date(`${t[1]}T00:00:00Z`)];
      const kisa = (d) => ay.format(d).replace('.', '');
      const tarih = t[0] === t[1] ? `${b.getUTCDate()} ${kisa(b)} ${b.getUTCFullYear()}` : b.getUTCMonth() === e.getUTCMonth() ? `${b.getUTCDate()}–${e.getUTCDate()} ${kisa(b)} ${b.getUTCFullYear()}` : `${b.getUTCDate()} ${kisa(b)} – ${e.getUTCDate()} ${kisa(e)} ${e.getUTCFullYear()}`;
      s.querySelector('time').textContent = tarih;
      s.querySelector('small').textContent = `${yerAd(t)} · ${kmS(Math.round(mesafeKoord(merkez[6], merkez[7], t[4], t[5])))} km`;
    }
  }
  /* takvim yarım satırla kesilmesin: 24rem'e sığan tam satırlar gösterilir, altında "tüm takvim" düğmesi */
  const tum = Object.assign(document.createElement('button'), { type: 'button', className: 'dugme dugme--ikincil takvim__tum' });
  tum.setAttribute('aria-controls', liste.id); liste.after(tum);
  let acik = false;
  function sigdir() {
    const sinirPx = 24 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    let h = 0, n = 0;
    for (const s of secenekler) { const y = s.getBoundingClientRect().height; if (h + y > sinirPx) break; h += y; n++; }   /* kesirli yükseklik: yuvarlama 1 px satır göstermesin */
    const maks = acik ? 'none' : `${(h + 1).toFixed(2)}px`;   /* +1: üst çizgi */
    if (liste.style.maxHeight !== maks) liste.style.maxHeight = maks;
    tum.hidden = n >= secenekler.length;
    tum.setAttribute('aria-expanded', acik);
    tum.textContent = acik ? (en() ? 'Show less' : 'Daha az göster') : en() ? `Full calendar (${secenekler.length})` : `Tüm takvim (${secenekler.length})`;
  }
  tum.addEventListener('click', () => { acik = !acik; sigdir(); if (!acik) liste.scrollTop = 0; });
  sigdir(); new ResizeObserver(() => sigdir()).observe(liste); document.fonts?.ready.then(sigdir);   /* satır yüksekliği yazı tipiyle değişir */
  let sonSecim = null;
  addEventListener('dil-degisti', () => { listeYaz(); sigdir(); eIst.textContent = en() ? 'Istanbul' : 'İstanbul'; sonSecim?.(); });
  if (en()) listeYaz();

  /* başlangıç: İstanbul seçili; sayılar HTML'deki ile aynı */
  grupSec(merkez);
  if (new URLSearchParams(location.search).has('olc')) globalThis.__ag = { cizici };   /* sınama kancası */
  return { gorunur: (b) => cizici.gorunur(b), olaySec, grupSec };
}
