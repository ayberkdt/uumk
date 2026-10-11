/* HESAP — hesap paneli ve gündem kartları (sunucu/api.mjs istemcisi). Ayrıntı: notlar/tasarim.md "Modül notları". */
import { metin, hataMetni, etkinDil } from '../ceviri.mjs';

const $ = (s, k = document) => k.querySelector(s);
export async function api(yol, { yontem = 'GET', govde } = {}) {
  try {
    const r = await fetch(yol, {
      method: yontem, credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(yontem !== 'GET' ? { 'Content-Type': 'application/json', 'X-UUMK': '1' } : {}) },
      body: govde ? JSON.stringify({ ...govde, dil: etkinDil() }) : yontem !== 'GET' ? JSON.stringify({ dil: etkinDil() }) : undefined,
    });
    const tur = r.headers.get('content-type') || '';
    return { durum: r.status, veri: tur.includes('json') ? await r.json() : null };
  } catch { return { durum: 0, veri: null }; }
}

const tarihBicim = () => new Intl.DateTimeFormat(etkinDil() === 'en' ? 'en-GB' : 'tr-TR', { day: 'numeric', month: 'long', weekday: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
const yerelTarih = (s) => new Date(/T\d\d:\d\d$/.test(s) ? `${s}:00+03:00` : s);

export function hesapKur({ panel, ustDugme, liste, durumAlani }) {
  let kullanici = null, sunucuVar = false, etkinlikler = [], okulAlani = 'itu.edu.tr', tumu = false, sonGorunum = '';
  const ILK = 4;
  const duyur = (m, tur = 'bilgi') => { durumAlani.textContent = m; durumAlani.dataset.tur = tur; };

  function hatalariGoster(form, veri) {
    for (const g of form.querySelectorAll('[aria-invalid]')) { g.removeAttribute('aria-invalid'); }
    for (const p of form.querySelectorAll('.alan__hata')) p.textContent = '';
    const alanlar = veri?.alanlar || {};
    let ilk = null;
    for (const [ad, kod] of Object.entries(alanlar)) {
      const g = form.elements[ad];
      if (!g) continue;
      g.setAttribute('aria-invalid', 'true');
      const p = form.querySelector(`#${form.id}-${ad}-hata`);
      if (p) p.textContent = hataMetni(kod, { alan: okulAlani });
      ilk ??= g;
    }
    const genel = form.querySelector('.form__durum');
    if (genel) genel.textContent = veri?.hata && veri.hata !== 'alan-hatasi' ? hataMetni(veri.hata) : '';
    ilk?.focus();
  }
  const formVeri = (form) => {
    const v = Object.fromEntries(new FormData(form));
    if (form.elements.kvkk) v.kvkk = form.elements.kvkk.checked;
    return v;
  };
  function mesgul(form, b) { for (const d of form.querySelectorAll('button')) d.disabled = b; form.setAttribute('aria-busy', String(b)); }

  function paneliCiz() {
    const ister = panel.dataset.gorunum;
    const gorunum = kullanici ? (['duzenle', 'bildir'].includes(ister) ? ister : 'profil') : ister === 'kayit' ? 'kayit' : panel.dataset.gorunum === 'sifre' ? 'sifre' : panel.dataset.gorunum === 'yenile' ? 'yenile' : 'giris';
    for (const b of panel.querySelectorAll('[data-gorunum-blok]')) b.hidden = b.dataset.gorunumBlok !== gorunum;
    for (const s of panel.querySelectorAll('[role="tab"]')) { const sec = s.dataset.sekme === gorunum; s.setAttribute('aria-selected', String(sec)); s.tabIndex = sec ? 0 : -1; }
    panel.querySelector('.hesap__sekmeler').hidden = !!kullanici || gorunum === 'sifre' || gorunum === 'yenile';
    panel.querySelector('.hesap__sunucu-yok').hidden = sunucuVar;
    for (const f of panel.querySelectorAll('form fieldset')) f.disabled = !sunucuVar;
    if (kullanici) {
      $('[data-profil="ad"]', panel).textContent = `${kullanici.ad} ${kullanici.soyad}`;
      for (const e of panel.querySelectorAll('[data-profil="eposta"]')) e.textContent = kullanici.eposta;
      const rozet = $('[data-profil="durum"]', panel); rozet.textContent = metin(kullanici.rol === 'yonetici' ? 'rozetYonetici' : kullanici.dogrulandi ? 'rozetDogrulandi' : 'rozetBekliyor'); rozet.dataset.durum = kullanici.dogrulandi ? 'tamam' : 'bekliyor';
      if (gorunum === 'duzenle' && sonGorunum !== 'duzenle') { const f = $('#duzenle-form', panel); f.elements.ad.value = kullanici.ad; f.elements.soyad.value = kullanici.soyad; f.elements.okul_no.value = kullanici.okul_no; }
      $('[data-profil="okul_no"]', panel).textContent = kullanici.okul_no;
      $('.profil__dogrula', panel).hidden = kullanici.dogrulandi;
      const kl = $('.profil__kayitlar', panel);
      const benim = etkinlikler.filter((e) => e.kayitli);
      kl.replaceChildren(...(benim.length ? benim.map((e) => Object.assign(document.createElement('li'), { textContent: `${e.baslik[etkinDil()]} · ${tarihBicim().format(yerelTarih(e.baslangic))}` }))
        : [Object.assign(document.createElement('li'), { textContent: metin('kayitYok'), className: 'profil__bos' })]));
      $('.profil__yonetim', panel).hidden = kullanici.rol !== 'yonetici';
    }
    sonGorunum = gorunum;
    ustDugme.textContent = kullanici ? kullanici.ad : metin('girisYap');
    ustDugme.setAttribute('aria-label', kullanici ? metin('hesabim') : metin('girisYap'));
    ustDugme.toggleAttribute('data-giris', !!kullanici);
    dispatchEvent(new CustomEvent('hesap-degisti', { detail: kullanici }));
  }
  panel.querySelector('.hesap__sekmeler').addEventListener('click', (e) => {
    const s = e.target.closest('[role="tab"]'); if (!s) return;
    panel.dataset.gorunum = s.dataset.sekme; paneliCiz(); panel.querySelector(`[data-gorunum-blok="${s.dataset.sekme}"] input`)?.focus();
  });
  panel.querySelector('.hesap__sekmeler').addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const s = [...panel.querySelectorAll('[role="tab"]')], i = s.findIndex((x) => x.getAttribute('aria-selected') === 'true');
    const y = s[(i + (e.key === 'ArrowRight' ? 1 : s.length - 1)) % s.length]; panel.dataset.gorunum = y.dataset.sekme; paneliCiz(); y.focus();
  });
  for (const a of panel.querySelectorAll('[data-git]')) a.addEventListener('click', (e) => { e.preventDefault(); git(a.dataset.git); });
  function git(g) {
    panel.dataset.gorunum = g; paneliCiz();
    const hedef = panel.querySelector(`[data-gorunum-blok="${g}"]`);
    (hedef?.querySelector('input, select, textarea') || (g === 'profil' ? panel.querySelector('[data-git="duzenle"]') : null))?.focus();
    panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  const adresBak = () => { if (location.hash === '#bildir-form') { panel.dataset.gorunum = 'bildir'; paneliCiz(); document.getElementById('hesap')?.scrollIntoView(); } };
  addEventListener('hashchange', adresBak);
  const sayac = $('#bildir-form-sayac', panel), mesaj = $('#bildir-form-mesaj', panel);
  mesaj.addEventListener('input', () => { sayac.textContent = `${mesaj.value.length} / 2000`; });

  const gonderici = (form, yol, sonra) => form.addEventListener('submit', async (e) => {
    e.preventDefault();
    mesgul(form, true);
    let r;
    try { await hazir; r = await api(yol, { yontem: 'POST', govde: formVeri(form) }); }
    catch { r = { durum: 0, veri: null }; } finally { mesgul(form, false); }
    if (r.durum === 0) { hatalariGoster(form, { hata: 'sunucu-hatasi' }); return; }
    if (r.durum >= 400) { hatalariGoster(form, r.veri); return; }
    hatalariGoster(form, null);
    await sonra(r.veri, form);
  });
  gonderici($('#kayit-form', panel), '/api/hesap/kayit', async (v, f) => { f.reset(); kullanici = v.kullanici; await etkinlikleriYukle(); duyur(metin('hesapAcildi', { eposta: v.kullanici.eposta }), 'tamam'); paneliCiz(); });
  gonderici($('#giris-form', panel), '/api/hesap/giris', async (v, f) => { f.reset(); kullanici = v.kullanici; await etkinlikleriYukle(); duyur(metin('merhaba', { ad: v.kullanici.ad }), 'tamam'); paneliCiz(); });
  gonderici($('#sifre-form', panel), '/api/hesap/sifre-unuttum', async () => { duyur(metin('sifreGitti'), 'tamam'); });
  gonderici($('#duzenle-form', panel), '/api/hesap/profil', async (v) => { kullanici = v.kullanici; duyur(metin('profilKaydedildi'), 'tamam'); git('profil'); });
  gonderici($('#parola-form', panel), '/api/hesap/parola', async (v, f) => { f.reset(); duyur(metin('parolaDegisti'), 'tamam'); });
  gonderici($('#bildir-form', panel), '/api/bildirim', async (v, f) => { f.reset(); sayac.textContent = '0 / 2000'; duyur(metin(v.posta ? 'bildirimGitti' : 'bildirimKaydedildi'), 'tamam'); git('profil'); });
  gonderici($('#yenile-form', panel), '/api/hesap/sifre-yenile', async () => { history.replaceState(null, '', location.pathname + location.search + '#hesap'); await benYukle(); await etkinlikleriYukle(); duyur(metin('sifreYenilendi'), 'tamam'); panel.dataset.gorunum = ''; paneliCiz(); });
  $('.profil__cikis', panel).addEventListener('click', async () => { await api('/api/hesap/cikis', { yontem: 'POST' }); kullanici = null; await etkinlikleriYukle(); paneliCiz(); duyur(''); });
  $('.profil__dogrula button', panel).addEventListener('click', async (e) => {
    e.target.disabled = true; const r = await api('/api/hesap/dogrulama-gonder', { yontem: 'POST' }); e.target.disabled = false;
    duyur(r.durum < 400 ? metin('dogrulamaGitti') : hataMetni(r.veri?.hata), r.durum < 400 ? 'tamam' : 'hata');
  });

  function kartCiz(e) {
    const li = document.createElement('li');
    li.className = 'etkinlik'; li.id = `etkinlik-kart-${e.id}`;
    const d = etkinDil();
    const durum = e.kayitli ? metin('kayitlisin') : e.durum === 'acik' ? metin('kayitAcik') : e.durum === 'doldu' ? metin('kontenjanDoldu') : metin('kayitKapali');
    const kalan = e.kalan === null ? metin('kontenjansiz') : metin('kalan', { n: e.kalan });
    li.innerHTML = `<p class="etkinlik__gun" aria-hidden="true"><b></b><span></span></p><p class="etkinlik__tarih"></p><h3 class="etkinlik__ad"></h3><p class="etkinlik__yer"></p><p class="etkinlik__ozet"></p>
      <p class="etkinlik__durum" data-durum="${e.kayitli ? 'kayitli' : e.durum}"><span></span> · <span></span></p><div class="etkinlik__eylem"></div><p class="etkinlik__mesaj" role="status"></p>`;
    const p = tarihBicim().formatToParts(yerelTarih(e.baslangic)), k = (t) => p.find((x) => x.type === t)?.value || '';
    li.querySelector('.etkinlik__tarih').replaceChildren(Object.assign(document.createElement('span'), { className: 'gorunmez', textContent: `${k('day')} ${k('month')}, ` }), `${k('weekday')} · ${k('hour')}:${k('minute')}`);
    const gunB = new Intl.DateTimeFormat(d === 'en' ? 'en-GB' : 'tr-TR', { day: 'numeric', month: 'short', timeZone: 'Europe/Istanbul' }).formatToParts(yerelTarih(e.baslangic));
    li.querySelector('.etkinlik__gun b').textContent = gunB.find((x) => x.type === 'day')?.value || '';
    li.querySelector('.etkinlik__gun span').textContent = (gunB.find((x) => x.type === 'month')?.value || '').replace('.', '');
    li.querySelector('.etkinlik__ad').textContent = e.baslik[d];
    li.querySelector('.etkinlik__yer').textContent = e.yer[d];
    li.querySelector('.etkinlik__ozet').textContent = e.ozet[d];
    const [s1, s2] = li.querySelectorAll('.etkinlik__durum span'); s1.textContent = durum; s2.textContent = kalan;
    if (e.kontenjan) {
      const cubuk = Object.assign(document.createElement('div'), { className: 'etkinlik__doluluk' }); cubuk.setAttribute('aria-hidden', 'true');
      const ic = document.createElement('span'); ic.style.setProperty('--oran', Math.min(1, Math.max(0, (e.kontenjan - (e.kalan ?? e.kontenjan)) / e.kontenjan)).toFixed(3));
      cubuk.append(ic); li.querySelector('.etkinlik__durum').after(cubuk);
    }
    const eylem = li.querySelector('.etkinlik__eylem'), mesaj = li.querySelector('.etkinlik__mesaj');
    const dugme = (m, sinif, fn) => { const b = Object.assign(document.createElement('button'), { type: 'button', className: `dugme ${sinif}`, textContent: m }); b.addEventListener('click', fn); eylem.append(b); return b; };
    if (e.kayitli) dugme(metin('iptalEt'), 'dugme--ikincil', async (ev) => {
      ev.target.disabled = true;
      const r = await api(`/api/etkinlikler/${e.id}/kayit`, { yontem: 'DELETE' });
      if (r.durum < 400) { await etkinlikleriYukle(); duyur(metin('kayitIptal'), 'tamam'); } else { ev.target.disabled = false; mesaj.textContent = hataMetni(r.veri?.hata); }
    });
    else if (e.durum === 'acik') {
      if (kullanici && !kullanici.dogrulandi) { mesaj.textContent = metin('dogrulaNot'); }
      else if (kullanici) dugme(metin('kaydol'), 'dugme--birincil', async (ev) => {
        ev.target.disabled = true;
        const r = await api(`/api/etkinlikler/${e.id}/kayit`, { yontem: 'POST' });
        if (r.durum < 400) { await etkinlikleriYukle(); duyur(metin('kayitAlindi', { eposta: kullanici.eposta }), 'tamam'); $(`#etkinlik-kart-${e.id} button`)?.focus(); }
        else { ev.target.disabled = false; mesaj.textContent = hataMetni(r.veri?.hata); }
      });
      else dugme(metin('kaydol'), 'dugme--birincil', (ev) => { ev.target.hidden = true; misafirFormu(li, e); });
    }
    dugme(metin('takvimeEkle'), 'dugme--ikincil', () => icsIndir(e, d));
    return li;
  }
  function icsIndir(e, d) {
    const utc = (s) => yerelTarih(s).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const bas = yerelTarih(e.baslangic), bit = e.bitis ? yerelTarih(e.bitis) : new Date(bas.getTime() + 2 * 3600e3);
    const katla = (l) => { let o = '', n = 0; for (const c of l) { const b = new TextEncoder().encode(c).length; if (n + b > 75) { o += '\r\n '; n = 1; } o += c; n += b; } return o; };
    const kac = (t) => String(t || '').replace(/[\\;,]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
    const metinIcs = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ITU UUMK//TR', 'BEGIN:VEVENT', `UID:${e.id}@uumk`, `DTSTAMP:${utc(new Date().toISOString())}`,
      `DTSTART:${utc(e.baslangic)}`, `DTEND:${bit.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`, `SUMMARY:${kac(e.baslik[d])}`, `LOCATION:${kac(e.yer[d])}`,
      `DESCRIPTION:${kac(e.ozet[d])}`, 'END:VEVENT', 'END:VCALENDAR'].map(katla).join('\r\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([metinIcs], { type: 'text/calendar' })), download: `${e.id}.ics` });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function misafirFormu(li, e) {
    const f = document.createElement('form');
    f.className = 'misafir'; f.id = `misafir-${e.id}`; f.noValidate = true;
    const alan = (ad, etiket, tur, oz = '') => `<div class="alan"><label for="${f.id}-${ad}">${etiket}</label><input id="${f.id}-${ad}" name="${ad}" type="${tur}" ${oz} aria-describedby="${f.id}-${ad}-hata" required><p class="alan__hata" id="${f.id}-${ad}-hata"></p></div>`;
    const S = etkinDil() === 'en'
      ? { ad: 'First name', soyad: 'Last name', eposta: `School e-mail (@${okulAlani})`, no: 'Student number', kvkk: 'I have read the <a href="kvkk.html" target="_blank" rel="noopener">privacy notice</a>.' }
      : { ad: 'Ad', soyad: 'Soyad', eposta: `Okul e-postası (@${okulAlani})`, no: 'Okul numarası', kvkk: '<a href="kvkk.html" target="_blank" rel="noopener">Aydınlatma metnini</a> okudum.' };
    f.innerHTML = `<p class="misafir__not"></p><fieldset><div class="alanlar">${alan('ad', S.ad, 'text', 'autocomplete="given-name"')}${alan('soyad', S.soyad, 'text', 'autocomplete="family-name"')}
      ${alan('eposta', S.eposta, 'email', 'autocomplete="email" inputmode="email"')}${alan('okul_no', S.no, 'text', 'inputmode="numeric" autocomplete="off"')}</div>
      <div class="alan alan--onay"><input id="${f.id}-kvkk" name="kvkk" type="checkbox" aria-describedby="${f.id}-kvkk-hata" required><label for="${f.id}-kvkk">${S.kvkk}</label><p class="alan__hata" id="${f.id}-kvkk-hata"></p></div>
      <p class="form__durum" role="alert"></p><div class="form__eylem"><button class="dugme dugme--birincil" type="submit"></button><button class="dugme dugme--metin" type="button"></button></div></fieldset>`;
    f.querySelector('.misafir__not').textContent = metin('misafirNot');
    const [g, v] = f.querySelectorAll('.form__eylem button'); g.textContent = metin('gonder'); v.textContent = metin('vazgec');
    v.addEventListener('click', () => { f.remove(); li.querySelector('.etkinlik__eylem button').hidden = false; li.querySelector('.etkinlik__eylem button').focus(); });
    f.addEventListener('submit', async (ev) => {
      ev.preventDefault(); mesgul(f, true);
      const veri = formVeri(f);
      const r = await api(`/api/etkinlikler/${e.id}/kayit`, { yontem: 'POST', govde: veri });
      mesgul(f, false);
      if (r.durum >= 400 || r.durum === 0) { hatalariGoster(f, r.veri || { hata: 'sunucu-hatasi' }); return; }
      await etkinlikleriYukle();
      duyur(metin('kayitAlindi', { eposta: veri.eposta }), 'tamam');
    });
    li.querySelector('.etkinlik__eylem').after(f);
    f.querySelector('input').focus();
  }
  function bos(baslik, aciklama) {
    const li = document.getElementById('bos-sablon').content.firstElementChild.cloneNode(true);
    li.querySelector('.bos__baslik').textContent = metin(baslik); li.querySelector('.bos__metin').textContent = metin(aciklama); li.querySelector('a').textContent = metin('bosTakip');
    const io = new IntersectionObserver(async ([g]) => {
      if (!g.isIntersecting) return; io.disconnect();
      if (!(await import('./gpu.mjs')).donanimGpu()) return;
      if ((await import('./bekleme3b.mjs')).beklemeKur(li.querySelector('canvas'), { az: document.documentElement.classList.contains('az') })) li.dataset.cizici = '3b';
    });
    io.observe(li);
    return li;
  }
  queueMicrotask(adresBak);
  function listeyiCiz() {
    const not = document.querySelector('.gundem__not'); if (not) not.hidden = !sunucuVar;
    if (!sunucuVar) { liste.replaceChildren(bos('bosKapali', 'bosKapaliNot')); return; }
    const gorunen = etkinlikler.filter((e) => yerelTarih(e.baslangic) > new Date());
    const kartlar = gorunen.map(kartCiz);
    kartlar.forEach((k, i) => { if (i >= ILK && !tumu) k.hidden = true; });
    if (kartlar.length > ILK && !tumu) {
      const li = Object.assign(document.createElement('li'), { className: 'etkinlik__daha' });
      const b = Object.assign(document.createElement('button'), { type: 'button', className: 'dugme dugme--ikincil', textContent: metin('dahaFazla', { n: kartlar.length - ILK }) });
      b.addEventListener('click', () => { tumu = true; listeyiCiz(); liste.children[ILK]?.querySelector('button')?.focus(); });
      li.append(b); kartlar.push(li);
    }
    liste.replaceChildren(...(kartlar.length ? kartlar : [bos('bosBekleme', 'bosBeklemeNot')]));
  }

  async function benYukle() { const r = await api('/api/hesap/ben'); kullanici = r.durum === 200 ? r.veri.kullanici : null; }
  async function etkinlikleriYukle() { const r = await api('/api/etkinlikler'); etkinlikler = r.durum === 200 ? r.veri.etkinlikler : []; listeyiCiz(); if (kullanici) paneliCiz(); }

  const hazir = (async () => {
    const d = await api('/api/durum');
    sunucuVar = d.durum === 200 && !!d.veri; if (sunucuVar) okulAlani = d.veri.okulAlani || okulAlani;
    for (const s of panel.querySelectorAll('[data-okul-alani]')) s.textContent = okulAlani;
    if (sunucuVar) await benYukle();
    const prm = new URLSearchParams(location.search);
    if (prm.get('dogrulama')) { duyur(metin(prm.get('dogrulama') === 'tamam' ? 'dogrulandi' : 'dogrulamaGecersiz'), prm.get('dogrulama') === 'tamam' ? 'tamam' : 'hata'); prm.delete('dogrulama'); history.replaceState(null, '', `${location.pathname}${prm.size ? '?' + prm : ''}${location.hash}`); }
    const t = location.hash.match(/^#sifre-yenile=([\w-]+)$/);
    if (t) { panel.dataset.gorunum = 'yenile'; $('#yenile-form', panel).elements.t.value = t[1]; panel.scrollIntoView(); }
    await etkinlikleriYukle();
    paneliCiz();
  })();
  addEventListener('dil-degisti', () => { if (!liste.querySelector('form.misafir')) listeyiCiz(); paneliCiz(); });
  return { yenile: etkinlikleriYukle };
}
