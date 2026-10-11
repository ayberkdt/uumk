/* AĞ — EUROAVIA küresinin denetleyicisi: çizici seçimi (three ya da 2B), seçim listesi (listbox), üzerine gelme etiketi,
 * seçim paneli. Sayılar veri/ag.mjs'ten hesaplanır; HTML'deki sayılar JS'siz okuma içindir ve dogrula.mjs ile eşitliği sınanır. */
import { GRUPLAR, TAKVIM, TURLER, MERKEZ, grup, mesafe, mesafeKoord } from '../veri/ag.mjs';
import { kuresel, dondurmeKur } from './kure-ortak.mjs';
import { donanimGpu } from './gpu.mjs';
import { etkinDil } from '../ceviri.mjs';

const en = () => etkinDil() === 'en';
const kmS = (n) => new Intl.NumberFormat(en() ? 'en-GB' : 'tr-TR').format(n);
const TURLER_EN = { AS: 'Full member (Affiliated Society)', PAS: 'On the way to full membership (Prospective AS)', AM: 'Associated member outside Europe (Adjunct Member)', PAM: 'On the way to associated membership (Prospective AM)' };
const turAd = (t) => (en() ? TURLER_EN[t] : TURLER[t]);
const grupAd = (g) => (en() ? g[2] : g[3]);
const ulkeAd = (g) => (en() ? g[4] : g[5]);
const yerAd = (t) => (en() ? t[7] : t[3]);

export async function agKur({ kap, liste, secim, az = false }) {
  const tuval = kap.querySelector('canvas');
  const etiketKap = kap.querySelector('.kure__etiketler');
  const merkez = grup(MERKEZ);
  const bak = { enlem: 44, boylam: 16 };    /* ağın ağırlık merkezine yakın: Avrupa ortada, Lagos ve Kahire görünür */
  let cizici = null;
  let yerlestir = () => {};                  /* etiketler kurulunca aşağıda tanımlanır */
  const boyutDegisti = () => requestAnimationFrame(() => yerlestir());
  if (donanimGpu()) {
    const { kureKur } = await import('./kure.mjs');
    cizici = kureKur(tuval, { gruplar: GRUPLAR, merkez: MERKEZ, bak, boyutDegisti });
  }
  if (!cizici) {
    const { kure2bKur } = await import('./kure2b.mjs');
    cizici = kure2bKur(tuval, { gruplar: GRUPLAR, merkez: MERKEZ, bak, boyutDegisti });
    kap.dataset.cizici = '2b';
  } else kap.dataset.cizici = '3b';

  /* etiketler: İstanbul (sabit), seçili ve üzerine gelinen */
  const etiket = (metin) => { const e = document.createElement('span'); e.className = 'kure__etiket'; e.textContent = metin; e.hidden = true; etiketKap.append(e); return e; };
  const eIst = etiket(en() ? 'Istanbul' : 'İstanbul'), eSec = etiket(''), eUst = etiket('');
  let secili = null, ustunde = null;
  function etiketYerlestir(e, hedef) {
    if (!hedef) { e.hidden = true; return; }
    const [x, y, onde] = cizici.izdus(kuresel(hedef.enlem, hedef.boylam));
    e.hidden = !onde;
    if (onde) e.style.transform = `translate(${(x + 10).toFixed(1)}px, ${(y - 10).toFixed(1)}px)`;
  }
  yerlestir = function () {
    etiketYerlestir(eIst, { enlem: merkez[6], boylam: merkez[7] });
    etiketYerlestir(eSec, secili);
    etiketYerlestir(eUst, ustunde && ustunde !== secili ? ustunde : null);
  };
  const dondurme = dondurmeKur(tuval, { bak, az, degisti: () => { cizici.istek(); yerlestir(); } });

  /* üzerine gelme: ekranda en yakın grup (≤ 16 px) */
  function enYakin(cx, cy) {
    const r = tuval.getBoundingClientRect();
    let en = null, d0 = 16 * 16;
    for (const g of GRUPLAR) {
      const [x, y, onde] = cizici.izdus(kuresel(g[6], g[7]));
      if (!onde) continue;
      const d = (x - (cx - r.left)) ** 2 + (y - (cy - r.top)) ** 2;
      if (d < d0) { d0 = d; en = g; }
    }
    return en;
  }
  const grupHedef = (g) => ({ enlem: g[6], boylam: g[7], ad: grupAd(g), kod: g[0] });
  tuval.addEventListener('pointermove', (e) => {
    if (e.buttons) return;
    const g = enYakin(e.clientX, e.clientY);
    ustunde = g ? grupHedef(g) : null;
    eUst.textContent = g ? `${grupAd(g)} · ${g[1]}` : '';
    tuval.style.cursor = g ? 'pointer' : '';
    yerlestir();
  });
  tuval.addEventListener('pointerleave', () => { ustunde = null; yerlestir(); });
  tuval.addEventListener('click', (e) => {
    if (tuval.dataset.surukledi) return;
    const g = enYakin(e.clientX, e.clientY);
    if (g) grupSec(g);
  });

  /* seçim paneli */
  const secAd = secim.querySelector('.ag__secim-ad'), secAlt = secim.querySelector('.ag__secim-alt');
  function paneliYaz(baslik, tur, alt) {
    secAd.replaceChildren(document.createTextNode(`${baslik} · `), Object.assign(document.createElement('span'), { textContent: tur }));
    secAlt.textContent = alt;
  }
  function grupSec(g, { dondur = true } = {}) {
    secili = grupHedef(g);
    cizici.vurgula(g[0] === MERKEZ ? null : secili);
    if (dondur) dondurme.git(g[6], g[7]);
    const olaylar = TAKVIM.filter((t) => t[6] === g[0]).map((t) => t[2]);
    let uzak;
    if (g[0] === MERKEZ) {
      const s = GRUPLAR.filter((x) => x !== merkez).map((x) => [grupAd(x), Math.round(mesafe(merkez, x))]).sort((a, b) => a[1] - b[1]);
      const [y, u] = [s[0], s[s.length - 1]];
      uzak = en() ? `Nearest group ${y[0]} (${kmS(y[1])} km), farthest ${u[0]} (${kmS(u[1])} km). ` : `En yakın grup ${y[0]} (${kmS(y[1])} km), en uzak ${u[0]} (${kmS(u[1])} km). `;
    } else uzak = en() ? `${kmS(Math.round(mesafe(merkez, g)))} km from Istanbul. ` : `İstanbul'dan ${kmS(Math.round(mesafe(merkez, g)))} km. `;
    paneliYaz(grupAd(g), g[1], `${ulkeAd(g)} · ${turAd(g[1])}. ${uzak}${olaylar.length ? (en() ? `Here in 2025–26: ${olaylar.join(', ')}.` : `2025–26'da burada: ${olaylar.join(', ')}.`) : ''}`);
    sonSecim = () => grupSec(g, { dondur: false });
    listedeIsaretle(null);
    yerlestir();
  }
  function olaySec(i) {
    const t = TAKVIM[i];
    secili = { enlem: t[4], boylam: t[5], ad: yerAd(t) };
    cizici.vurgula(secili);
    dondurme.git(t[4], t[5]);
    const g = t[6] ? grup(t[6]) : null;
    const d = kmS(Math.round(mesafeKoord(merkez[6], merkez[7], t[4], t[5])));
    paneliYaz(yerAd(t), g ? g[1] : (en() ? 'not a group city' : 'grup şehri değil'), en() ? `${t[2]}. ${d} km from Istanbul.${g && g[2] !== t[7] ? ` Host group: ${g[2]}.` : ''}` : `${t[2]}. İstanbul'dan ${d} km.${g && g[3] !== t[3] ? ` Ev sahibi grup: ${g[3]}.` : ''}`);
    eSec.textContent = yerAd(t);
    sonSecim = () => olaySec(i);
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
  });

  /* sıradaki etkinlik (bugünden sonra başlayan ilk) */
  const bugun = new Date().toISOString().slice(0, 10);
  const sirada = TAKVIM.findIndex((t) => t[0] >= bugun);
  if (sirada >= 0) secenekler.find((s) => Number(s.dataset.olay) === sirada)?.classList.add('takvim__sirada');

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
  let sonSecim = null;
  addEventListener('dil-degisti', () => { listeYaz(); eIst.textContent = en() ? 'Istanbul' : 'İstanbul'; sonSecim?.(); });
  if (en()) listeYaz();

  /* başlangıç: İstanbul seçili; sayılar HTML'deki ile aynı */
  grupSec(merkez, { dondur: false });
  if (new URLSearchParams(location.search).has('olc')) globalThis.__ag = { cizici, bak, kuresel };   /* sınama kancası */
  return { gorunur: (b) => cizici.gorunur(b), olaySec, grupSec };
}
