/* AKIM İŞÇİSİ — akım çizgilerini ana iş parçacığının dışında hesaplar (kaydırma takılmasın). İleti: { id, alfa } → sonuç. */
import { akimHesapla } from './akim.mjs';

onmessage = (e) => {
  const r = akimHesapla(e.data.alfa);
  postMessage({ id: e.data.id, ...r }, [r.kanat.buffer, ...r.cizgiler.map((c) => c.buffer)]);
};
