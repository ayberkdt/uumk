/* BİZ KİMİZ — 01 bölümünün davranışları; bölüme yaklaşınca site.mjs yükler. Yüklenmeden önce de sayfa
 * çalışır: "Tarihçeye git" düz bağlantı olarak tarihçeye atlar.
 * · Kimlik paneli: görününce pasaport açılır (data-ucus, CSS), İTÜ damgası basılır; kapak açıldıktan sonra uçak İTÜ damgasından
 *   AS Istanbul damgasına uçar (data-uc + SMIL), varınca EUROAVIA damgası basılır. Üzerine gelince uçuş yinelenir.
 * · "Tarihçeye git": düğmenin uçağı kalkar, sayfa tarihçeye kayar, varınca başlığın altında sarı çizgi uzar, odak başlığa geçer.
 * · Kabin ekipleri: JS yok; ekip kartı ile çizimdeki bölmenin eşleşmesi CSS :has ile (site.css .kabin-plan).
 */
const $ = (s, k = document) => k.querySelector(s);
const $$ = (s, k = document) => [...k.querySelectorAll(s)];

export function bizKur({ az, gozle }) {
  const kimlik = $('.kimlik'), kimlikUcus = $$('#kimlik-yay :is(animateMotion, animate)');   /* uçuş ve arkasından çizilen iz birlikte */
  const kimlikUc = () => { if (az || !kimlikUcus[0]?.beginElement) return; kimlik.dataset.uc = ''; kimlikUcus.forEach((a) => a.beginElement()); };
  gozle(kimlik, { yakin: '-25% 0px', ilk: () => { kimlik.dataset.ucus = ''; setTimeout(kimlikUc, 900); } });
  kimlik.addEventListener('pointerenter', () => { if (kimlik.hasAttribute('data-uc')) kimlikUc(); });
  const tarihceEl = $('#tarihce');
  $('#tarihce-git').addEventListener('click', (e) => {
    e.preventDefault();
    const dugme = e.currentTarget; dugme.classList.add('kalkis');
    setTimeout(() => {
      tarihceEl.scrollIntoView({ behavior: az ? 'auto' : 'smooth', block: 'start' }); history.replaceState(null, '', '#tarihce');
      setTimeout(() => { tarihceEl.classList.add('varis'); $('#tarihce-baslik').focus({ preventScroll: true }); dugme.classList.remove('kalkis'); }, az ? 0 : 700);
    }, az ? 0 : 260);
  });
  new IntersectionObserver(([x]) => { if (x.isIntersecting) tarihceEl.classList.add('varis'); }, { rootMargin: '0px 0px -40% 0px' }).observe($('#tarihce-baslik'));
}
