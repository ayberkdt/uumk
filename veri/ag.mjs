/* EUROAVIA AĞI — üretildi: notlar/euroavia-ag.tsv (kaynak https://euroavia.eu/lg/, 10.10.2026; koordinatlar Wikipedia API).
 * Elle düzenleme: önce TSV, sonra bu dosya; araclar/dogrula.mjs ikisini karşılaştırır. Sayılar (grup, ülke, mesafe) buradan hesaplanır. */

/** [kod, tür, ad (EUROAVIA yazımı), Türkçe ad, ülke (EN), ülke (TR), enlem, boylam] */
export const GRUPLAR = [
  ['AAC', 'AS', 'Aachen', 'Aachen', 'Germany', 'Almanya', 50.7756, 6.0836],
  ['ANK', 'AS', 'Ankara', 'Ankara', 'Turkey', 'Türkiye', 39.9289, 32.8547],
  ['ATH', 'AS', 'Athens', 'Atina', 'Greece', 'Yunanistan', 37.9842, 23.7281],
  ['AVI', 'PAS', 'Aveiro', 'Aveiro', 'Portugal', 'Portekiz', 40.6333, -8.6500],
  ['BEG', 'AS', 'Beograd', 'Belgrad', 'Serbia', 'Sırbistan', 44.8178, 20.4569],
  ['BOD', 'AS', 'Bordeaux', 'Bordeaux', 'France', 'Fransa', 44.8400, -0.5800],
  ['BRS', 'AS', 'Braunschweig', 'Braunschweig', 'Germany', 'Almanya', 52.2667, 10.5167],
  ['BRE', 'AS', 'Bremen', 'Bremen', 'Germany', 'Almanya', 53.0758, 8.8072],
  ['BUC', 'AS', 'Bucharest', 'Bükreş', 'Romania', 'Romanya', 44.4325, 26.1039],
  ['CDZ', 'AS', 'Cádiz', 'Cádiz', 'Spain', 'İspanya', 36.5350, -6.2975],
  ['CAI', 'AM', 'Cairo', 'Kahire', 'Egypt', 'Mısır', 30.0444, 31.2358],
  ['CDF', 'AS', 'Castelldefels', 'Castelldefels', 'Spain', 'İspanya', 41.2860, 1.9820],
  ['CVL', 'AS', 'Covilhã', 'Covilhã', 'Portugal', 'Portekiz', 40.2833, -7.5000],
  ['DRE', 'AS', 'Dresden', 'Dresden', 'Germany', 'Almanya', 51.0500, 13.7400],
  ['ESK', 'PAS', 'Eskişehir', 'Eskişehir', 'Turkey', 'Türkiye', 39.7714, 30.5183],
  ['FBO', 'AS', 'Forlì-Bologna', 'Forlì-Bologna', 'Italy', 'İtalya', 44.2228, 12.0414],
  ['IST', 'AS', 'Istanbul', 'İstanbul', 'Turkey', 'Türkiye', 41.1050, 29.0250],
  ['IZM', 'PAS', 'Izmir', 'İzmir', 'Turkey', 'Türkiye', 38.4244, 27.1322],
  ['KCO', 'AS', 'Kocaeli', 'Kocaeli', 'Turkey', 'Türkiye', 40.7600, 29.9200],
  ['LAG', 'PAM', 'Lagos', 'Lagos', 'Nigeria', 'Nijerya', 6.4561, 3.3936],
  ['LEU', 'AS', 'Leuven', 'Leuven', 'Belgium', 'Belçika', 50.8833, 4.7000],
  ['LIS', 'AS', 'Lisboa', 'Lizbon', 'Portugal', 'Portekiz', 38.7253, -9.1500],
  ['LYS', 'AS', 'Lyon', 'Lyon', 'France', 'Fransa', 45.7675, 4.8350],
  ['MIL', 'AS', 'Milano', 'Milano', 'Italy', 'İtalya', 45.4669, 9.1900],
  ['MIN', 'PAS', 'Minho', 'Minho', 'Portugal', 'Portekiz', 41.5608, -8.3968],
  ['MUC', 'AS', 'Munich', 'Münih', 'Germany', 'Almanya', 48.1375, 11.5750],
  ['NAP', 'AS', 'Napoli', 'Napoli', 'Italy', 'İtalya', 40.8358, 14.2486],
  ['OST', 'AS', 'Oostende', 'Oostende', 'Belgium', 'Belçika', 51.2258, 2.9194],
  ['PAR', 'AS', 'Paris', 'Paris', 'France', 'Fransa', 48.8567, 2.3522],
  ['PAT', 'AS', 'Patras', 'Patras', 'Greece', 'Yunanistan', 38.2500, 21.7333],
  ['PSA', 'AS', 'Pisa', 'Pisa', 'Italy', 'İtalya', 43.7167, 10.4000],
  ['RZE', 'AS', 'Rzeszow', 'Rzeszów', 'Poland', 'Polonya', 50.0333, 22.0000],
  ['SAS', 'AS', 'Samsun', 'Samsun', 'Turkey', 'Türkiye', 41.2903, 36.3336],
  ['SEV', 'AS', 'Sevilla', 'Sevilla', 'Spain', 'İspanya', 37.3886, -5.9950],
  ['STR', 'AS', 'Stuttgart', 'Stuttgart', 'Germany', 'Almanya', 48.7775, 9.1800],
  ['TMP', 'AS', 'Tampere', 'Tampere', 'Finland', 'Finlandiya', 61.4981, 23.7600],
  ['TER', 'AS', 'Terrassa', 'Terrassa', 'Spain', 'İspanya', 41.5700, 2.0130],
  ['TOU', 'AS', 'Toulouse', 'Toulouse', 'France', 'Fransa', 43.6045, 1.4440],
  ['VLC', 'AS', 'València', 'Valensiya', 'Spain', 'İspanya', 39.4700, -0.3764],
  ['ZAG', 'AS', 'Zagreb', 'Zagreb', 'Croatia', 'Hırvatistan', 45.8131, 15.9775],
];

/** Grup türleri — https://euroavia.eu/lg/ tanımları */
export const TURLER = {
  AS: 'Tam üye (Affiliated Society)',
  PAS: 'Tam üyelik sürecinde (Prospective AS)',
  AM: 'Avrupa dışı ortak üye (Adjunct Member)',
  PAM: 'Ortak üyelik sürecinde (Prospective AM)',
};

/** Ağın 2025–26 takvimi — https://euroavia.eu/events/ (10.10.2026).
 *  [başlangıç, bitiş, ad, yer (TR), enlem, boylam, grup kodu | null, yer (EN)]. Koordinat: grup şehriyse grubun; değilse Wikipedia API (aynı gün).
 *  Ideathon 2026 Brugge'dedir; ev sahibi grup Oostende (takvim parçası "Oostende" der). */
export const TAKVIM = [
  ['2025-07-15', '2025-07-20', 'Fly-In Leuven 2025', 'Leuven', 50.8833, 4.7, 'LEU', 'Leuven'],
  ['2025-08-25', '2025-08-30', 'Airbus Sloshing 2025', 'Forlì', 44.2228, 12.0414, 'FBO', 'Forlì'],
  ['2025-09-20', '2025-09-27', 'ExMEAC & AMEAC 2025', 'Patras', 38.25, 21.7333, 'PAT', 'Patras'],
  ['2025-10-06', '2025-10-10', 'Symposium Braunschweig 2025', 'Braunschweig', 52.2667, 10.5167, 'BRS', 'Braunschweig'],
  ['2025-10-14', '2025-10-16', 'Student AirRace 2025', 'Münih', 48.1375, 11.575, 'MUC', 'Munich'],
  ['2025-11-10', '2025-11-10', 'Aviation 4 Girls 2025', 'Brüksel', 50.8467, 4.3525, null, 'Brussels'],
  ['2025-11-18', '2025-11-19', 'Rotorthon 2025', 'Köln', 50.9364, 6.9528, null, 'Cologne'],
  ['2025-11-25', '2025-11-28', 'GEN Days', 'Köln (EASA)', 50.9364, 6.9528, null, 'Cologne (EASA)'],
  ['2026-04-20', '2026-04-26', 'EMEAC 2026', 'Bükreş', 44.4325, 26.1039, 'BUC', 'Bucharest'],
  ['2026-05-18', '2026-05-22', 'Symposium: Hot Wings 3', 'Kocaeli', 40.76, 29.92, 'KCO', 'Kocaeli'],
  ['2026-05-20', '2026-05-22', 'Rapid Response Challenge by Student AirRace', 'Münih', 48.1375, 11.575, 'MUC', 'Munich'],
  ['2026-05-26', '2026-05-28', 'EUROAVIA at Airspace World 2026', 'Lizbon', 38.7253, -9.15, 'LIS', 'Lisbon'],
  ['2026-06-10', '2026-06-14', 'EUROAVIA at ILA Berlin 2026', 'Berlin', 52.52, 13.405, null, 'Berlin'],
  ['2026-06-22', '2026-06-28', 'Fly-in Minho', 'Braga', 41.5511, -8.4283, 'MIN', 'Braga'],
  ['2026-07-12', '2026-07-17', 'Formation Workshop Izmir', 'İzmir', 38.4244, 27.1322, 'IZM', 'Izmir'],
  ['2026-07-20', '2026-07-24', 'EUROAVIA at Farnborough International Airshow 2026', 'Farnborough', 51.29, -0.75, null, 'Farnborough'],
  ['2026-08-17', '2026-08-23', 'Airbus Sloshing 2026', 'Rzeszów', 50.0333, 22.0, 'RZE', 'Rzeszów'],
  ['2026-09-20', '2026-09-27', 'ExMEAC & AMEAC 2026', 'Dresden', 51.05, 13.74, 'DRE', 'Dresden'],
  ['2026-11-03', '2026-11-08', 'Ideathon 2026', 'Brugge', 51.2089, 3.2242, 'OST', 'Bruges'],
];

export const MERKEZ = 'IST';
const R_DUNYA = 6371.0088;   // km, ortalama yarıçap (IUGG)
const rad = (d) => (d * Math.PI) / 180;
/** Büyük daire mesafesi, km (haversine) */
export function mesafe(a, b) {
  return mesafeKoord(a[6], a[7], b[6], b[7]);
}
export function mesafeKoord(e1, b1, e2, b2) {
  const [la1, lo1, la2, lo2] = [rad(e1), rad(b1), rad(e2), rad(b2)];
  const h = Math.sin((la2 - la1) / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin((lo2 - lo1) / 2) ** 2;
  return 2 * R_DUNYA * Math.asin(Math.min(1, Math.sqrt(h)));
}
export const grup = (kod) => GRUPLAR.find((g) => g[0] === kod);
export const ulkeSayisi = () => new Set(GRUPLAR.map((g) => g[4])).size;
