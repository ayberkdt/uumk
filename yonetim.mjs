/* YÖNETİM — etkinlik ve yazı yönetimi (rol: yonetici). İlk yönetici sunucuda atanır: node sunucu/yonet.mjs yonetici <eposta>.
 * Tüm işlemler sunucu/api.mjs /api/yonetim/* uçlarıyla; sunucu yetkiyi her istekte yeniden denetler. */
import { api } from './sahne/hesap.mjs';

const $ = (s) => document.querySelector(s);
const durum = $('#durum');
const tarih = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Istanbul' });
const HATA = { 'id-gecersiz': 'Kısa ad 3–64 karakter: küçük harf, rakam, tire.', 'baslik-gerekli': 'Başlık en az 3 karakter.', 'tarih-gecersiz': 'Tarih biçimi geçersiz.',
  'kontenjan-gecersiz': 'Kontenjan pozitif bir tam sayı olmalı.', 'baglanti-gecersiz': 'Bağlantı https:// ile başlamalı.', 'govde-gerekli': 'Dış bağlantı yoksa en az 20 karakterlik metin gerekli.' };

function hatalar(form, veri) {
  for (const g of form.querySelectorAll('[aria-invalid]')) g.removeAttribute('aria-invalid');
  const metinler = [];
  for (const [ad, kod] of Object.entries(veri?.alanlar || {})) { form.elements[ad]?.setAttribute('aria-invalid', 'true'); metinler.push(`${form.querySelector(`[name="${ad}"]`)?.labels?.[0]?.textContent || ad}: ${HATA[kod] || kod}`); }
  form.querySelector('.form__durum').textContent = metinler.join(' ') || (veri?.hata ? `İşlem tamamlanamadı (${veri.hata}).` : '');
}
const veriAl = (form) => {
  const v = Object.fromEntries(new FormData(form));
  for (const k of form.querySelectorAll('input[type=checkbox]')) v[k.name] = k.checked;
  return v;
};

async function etkinlikleriCiz() {
  const r = await api('/api/yonetim/etkinlikler');
  const tb = $('#etkinlik-tablo');
  tb.replaceChildren(...(r.veri?.etkinlikler || []).map((e) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<th scope="row"></th><td></td><td></td><td></td><td class="ytablo__eylem"><button class="dugme dugme--metin" type="button" data-duzenle>Düzenle</button><a class="dugme dugme--metin" download>CSV</a></td>`;
    tr.cells[0].textContent = `${e.baslik_tr} (${e.id})`;
    tr.cells[1].textContent = tarih.format(new Date(`${e.baslangic}:00+03:00`));
    tr.cells[2].textContent = `${e.kayit_acik ? 'açık' : 'kapalı'}${e.yayinda ? '' : ' · gizli'}`;
    tr.cells[3].textContent = `${e.dolu}${e.kontenjan ? ` / ${e.kontenjan}` : ''}`;
    tr.querySelector('a').href = `/api/yonetim/etkinlikler/${e.id}/kayitlar?bicim=csv`;
    tr.querySelector('a').setAttribute('aria-label', `${e.baslik_tr} kayıtlarını CSV olarak indir`);
    tr.querySelector('[data-duzenle]').setAttribute('aria-label', `${e.baslik_tr} etkinliğini düzenle`);
    tr.querySelector('[data-duzenle]').addEventListener('click', () => {
      const f = $('#etkinlik-form');
      for (const [k, v] of Object.entries(e)) { const g = f.elements[k]; if (!g) continue; if (g.type === 'checkbox') g.checked = !!v; else g.value = v ?? ''; }
      f.elements.id.focus();
    });
    return tr;
  }));
  if (!tb.children.length) tb.innerHTML = '<tr><td colspan="5">Henüz etkinlik yok.</td></tr>';
}
async function yazilariCiz() {
  const r = await api('/api/yazilar');
  $('#yazi-liste').replaceChildren(...(r.veri?.yazilar || []).map((y) => {
    const li = document.createElement('li');
    li.innerHTML = '<span></span><button class="dugme dugme--metin" type="button">Sil</button>';
    li.querySelector('span').textContent = `${y.tarih} · ${y.baslik_tr}${y.baglanti ? ' (dış bağlantı)' : ''}`;
    li.querySelector('button').setAttribute('aria-label', `${y.baslik_tr} yazısını sil`);
    li.querySelector('button').addEventListener('click', async (ev) => {
      if (!confirm(`"${y.baslik_tr}" silinsin mi? Bu geri alınamaz.`)) return;
      ev.target.disabled = true;
      const s = await api(`/api/yonetim/yazilar/${y.id}`, { yontem: 'DELETE' });
      durum.textContent = s.durum < 400 ? 'Yazı silindi.' : 'Silinemedi.';
      yazilariCiz();
    });
    return li;
  }));
}

for (const [form, yol, sonra] of [[$('#etkinlik-form'), '/api/yonetim/etkinlikler', etkinlikleriCiz], [$('#yazi-form'), '/api/yonetim/yazilar', yazilariCiz]]) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const r = await api(yol, { yontem: 'POST', govde: veriAl(form) });
    hatalar(form, r.durum >= 400 ? r.veri : null);
    if (r.durum < 400) { durum.textContent = 'Kaydedildi.'; sonra(); }
  });
}

const ben = await api('/api/hesap/ben');
if (ben.durum === 0) durum.textContent = 'Kayıt sunucusuna ulaşılamıyor.';
else if (!ben.veri?.kullanici) durum.innerHTML = 'Bu sayfa için yönetici hesabıyla <a href="./#hesap">giriş yap</a>.';
else if (ben.veri.kullanici.rol !== 'yonetici') durum.textContent = 'Bu hesabın yönetim yetkisi yok.';
else {
  durum.textContent = `${ben.veri.kullanici.ad} ${ben.veri.kullanici.soyad} olarak giriş yapıldı.`;
  $('#etkinlik-bolum').hidden = false; $('#yazi-bolum').hidden = false;
  etkinlikleriCiz(); yazilariCiz();
}
