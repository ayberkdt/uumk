/* KATLAMA — A4 kâğıttan klasik "dart" kâğıt uçağın katlama modeli. Saf: DOM yok, three yok; Node'da sınanır.
 *
 * Kâğıt: genişlik 1 (x ∈ [−0,5; 0,5]), boy √2 (A4 oranı; y ∈ [0; √2]), burun y = √2'de.
 * Adımlar, bir önceki adım TAMAMLANMIŞ (düz katlanmış) kâğıdın 2B koordinatlarında verilir: her kırışık bir doğru (a → b) ve
 * hangi yanın döndüğü. Model iki geçişte kurulur:
 *   1. Bölme: her adımda parçalar kırışık doğrusuyla ikiye kesilir (kâğıt rijit parçalara ayrılır).
 *   2. Oynatma: her son parça için, her adımın ÖNCESİNDEKİ 2B konumu, katman sırası ve o adımda dönüp dönmediği kaydedilir.
 * Çizim (sahne/kagit.mjs) bir adımın ilerlemesi p ∈ [0, 1] için: önceki adımlar tamam, bu adımdaki parçalar kırışık ekseni
 * etrafında p·açı kadar döner. 180° katlar düz katlardır; son adım (kanatlar) 90°'dir ve uçağı üç boyutlu yapar. */

export const EN = 1, BOY = Math.SQRT2;
const t22 = Math.tan((22.5 * Math.PI) / 180);

/** yön: +1 → kâğıt izleyiciye doğru (vadi katı; parçalar üste), −1 → arkaya (dağ katı) */
export const ADIMLAR = [
  { ad: 'koseler', aci: Math.PI, yon: +1, kirisik: [
    { a: [0, BOY], b: [-0.5, BOY - 0.5], dis: [-0.5, BOY] },          // sol üst köşe orta çizgiye
    { a: [0, BOY], b: [0.5, BOY - 0.5], dis: [0.5, BOY] } ] },
  { ad: 'kenarlar', aci: Math.PI, yon: +1, kirisik: [
    { a: [0, BOY], b: [-0.5, BOY - 0.5 / t22], dis: [-0.5, BOY - 0.6] },  // eğik kenar yine orta çizgiye (22,5°)
    { a: [0, BOY], b: [0.5, BOY - 0.5 / t22], dis: [0.5, BOY - 0.6] } ] },
  { ad: 'ikiye', aci: Math.PI, yon: -1, kirisik: [
    { a: [0, 0], b: [0, BOY], dis: [-0.3, 0.5] } ] },                  // ortadan ikiye (sol yarı sağın altına)
  { ad: 'kanatlar', aci: Math.PI / 2, kirisik: [                       // kanat kırışığı: burundan kuyrukta 0,12 genişliğe
    { a: [0, BOY], b: [0.12, 0], dis: [0.4, 0.3], yon: +1, koken: 'sag' },
    { a: [0, BOY], b: [0.12, 0], dis: [0.4, 0.3], yon: -1, koken: 'sol' } ] },
];

const yan = (a, b, p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
const yansit = (a, b, p) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L;
  const qx = a[0] + t * dx, qy = a[1] + t * dy;
  return [2 * qx - p[0], 2 * qy - p[1]];
};
const merkez = (ps) => ps.reduce((s, p) => [s[0] + p[0] / ps.length, s[1] + p[1] / ps.length], [0, 0]);
const alan = (ps) => { let s = 0; for (let i = 0; i < ps.length; i++) { const p = ps[i], q = ps[(i + 1) % ps.length]; s += p[0] * q[1] - q[0] * p[1]; } return s / 2; };

/** Çokgeni doğruyla kes: [sol yan, sağ yan] (her biri boş olabilir). cur: şimdiki 2B, org: özgün koordinatlar (aynı sıra) */
function kes(cur, org, a, b) {
  const L = [[], []], LO = [[], []];
  for (let i = 0; i < cur.length; i++) {
    const p = cur[i], q = cur[(i + 1) % cur.length], po = org[i], qo = org[(i + 1) % cur.length];
    const sp = yan(a, b, p), sq = yan(a, b, q);
    if (sp >= -1e-12) { L[0].push(p); LO[0].push(po); }
    if (sp <= 1e-12) { L[1].push(p); LO[1].push(po); }
    if ((sp > 1e-12 && sq < -1e-12) || (sp < -1e-12 && sq > 1e-12)) {
      const t = sp / (sp - sq);
      const k = [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])], ko = [po[0] + t * (qo[0] - po[0]), po[1] + t * (qo[1] - po[1])];
      L[0].push(k); LO[0].push(ko); L[1].push(k); LO[1].push(ko);
    }
  }
  return [0, 1].map((i) => (L[i].length >= 3 && Math.abs(alan(L[i])) > 1e-9 ? { cur: L[i], org: LO[i] } : null));
}

/** Model kur: { parcalar: [{ org, kayit: [{ once2b, katman, doner, kirisik }] , son2b, sonKatman, koken }], adimlar } */
export function modelKur(adimlar = ADIMLAR) {
  /* ── geçiş 1: bölme ── */
  let parcalar = [{ cur: [[-0.5, 0], [0.5, 0], [0.5, BOY], [-0.5, BOY]].map((p) => [...p]), org: [[-0.5, 0], [0.5, 0], [0.5, BOY], [-0.5, BOY]], katman: 0 }];
  for (const adim of adimlar) {
    for (const k of adim.kirisik) {
      const yeni = [];
      for (const pr of parcalar) {
        const [s0, s1] = kes(pr.cur, pr.org, k.a, k.b);
        for (const s of [s0, s1]) if (s) yeni.push({ ...pr, cur: s.cur, org: s.org });
      }
      parcalar = yeni;
    }
    /* düz kat uygula: dış yandaki parçalar yansır (90° adımda 2B konum değişmez; sadece kayıt için işaretlenir) */
    if (adim.aci === Math.PI) parcalar = katla(parcalar, adim).map((x) => x.parca);
  }
  /* ── geçiş 2: her son parça için adım adım oynat ── */
  const son = parcalar.map((p) => ({ org: p.org, kayit: [], koken: merkez(p.org)[0] < 0 ? 'sol' : 'sag' }));
  let durum = son.map((p) => ({ cur: p.org.map((q) => [...q]), katman: 0, koken: p.koken }));
  adimlar.forEach((adim, ai) => {
    const sonuc = katla(durum, adim);
    sonuc.forEach((r, i) => son[i].kayit.push({
      once2b: durum[i].cur.map((q) => [...q]), katman: durum[i].katman, sonraKatman: r.parca.katman,
      doner: r.doner, kirisik: r.kirisik, yon: r.yon, aci: adim.aci, adim: ai,
    }));
    if (adim.aci === Math.PI) durum = sonuc.map((r) => r.parca);
  });
  son.forEach((p, i) => { p.son2b = durum[i].cur; p.sonKatman = durum[i].katman; });
  return { parcalar: son, adimlar };
}

/** Bir adımı uygula: hangi parça hangi kırışıkla döner; düz katta yansı + katman güncellemesi */
function katla(parcalar, adim) {
  const sonuc = parcalar.map((p) => ({ parca: p, doner: false, kirisik: null, yon: 0 }));
  for (const k of adim.kirisik) {
    const yon = k.yon ?? adim.yon;
    const disYan = Math.sign(yan(k.a, k.b, k.dis));
    const hareket = sonuc.filter((r) => !r.doner && Math.sign(yan(k.a, k.b, merkez(r.parca.cur))) === disYan && (!k.koken || r.parca.koken === k.koken));
    if (!hareket.length) continue;
    const katmanlar = sonuc.map((r) => r.parca.katman);
    const ust = Math.max(...katmanlar), alt = Math.min(...katmanlar);
    const hUst = Math.max(...hareket.map((r) => r.parca.katman)), hAlt = Math.min(...hareket.map((r) => r.parca.katman));
    for (const r of hareket) {
      r.doner = true; r.kirisik = k; r.yon = yon;
      if (adim.aci === Math.PI) {
        /* katlanan yığın ters döner ve öbür yığının üstüne (vadi) ya da altına (dağ) oturur */
        const katman = yon > 0 ? ust + 1 + (hUst - r.parca.katman) : alt - 1 - (r.parca.katman - hAlt);
        r.parca = { ...r.parca, cur: r.parca.cur.map((q) => yansit(k.a, k.b, q)), katman };
      }
    }
  }
  return sonuc;
}

/** 3B konum: parça köşeleri, adım ai'de ilerleme p iken. Katman kalınlığı KALINLIK; z izleyiciye doğru.
 *  Eksen a + t·e (z = 0), dönme açısı φ. Nokta = a + par·e + d·n (+ z0·ẑ) → a + par·e + n(d·cosφ − z0·sinφ) + ẑ(d·sinφ + z0·cosφ).
 *  φ'nin işareti, dönen yanın izleyiciye (yon +1) ya da arkaya (−1) kalkacağı biçimde seçilir. Düz katın sonunda z, yeni katman
 *  yüksekliğine doğrusal geçer (yığın ters döndüğü için). */
export const KALINLIK = 0.0016;
export function parcaKonum(parca, ai, p, cikti = []) {
  const k = parca.kayit[ai];
  cikti.length = 0;
  const z0 = k.katman * KALINLIK;
  if (!k.doner || p <= 0) { for (const q of k.once2b) cikti.push([q[0], q[1], z0]); return cikti; }
  const { a, b } = k.kirisik;
  const ux = b[0] - a[0], uy = b[1] - a[1], L = Math.hypot(ux, uy), ex = ux / L, ey = uy / L, nx = -ey, ny = ex;
  const mc = merkez(k.once2b);
  const sigma = Math.sign((mc[0] - a[0]) * nx + (mc[1] - a[1]) * ny) || 1;
  const phi = sigma * k.yon * p * k.aci, c = Math.cos(phi), s = Math.sin(phi);
  const zDuzelt = k.aci === Math.PI ? p * (k.sonraKatman * KALINLIK + z0) : 0;
  for (const q of k.once2b) {
    const rx = q[0] - a[0], ry = q[1] - a[1];
    const par = rx * ex + ry * ey, d = rx * nx + ry * ny;
    const dn = d * c - z0 * s, z = d * s + z0 * c;
    cikti.push([a[0] + par * ex + dn * nx, a[1] + par * ey + dn * ny, z + zDuzelt]);
  }
  return cikti;
}

/** Katlanmış şeklin köşe ortalaması (dönme merkezi; katlandıkça şekil kâğıdın ortasından kaymasın) */
export function sekilMerkezi(model, ai, p) {
  let x = 0, y = 0, z = 0, n = 0;
  const g = [];
  for (const pr of model.parcalar) for (const v of parcaKonum(pr, ai, p, g)) { x += v[0]; y += v[1]; z += v[2]; n++; }
  return [x / n, y / n, z / n];
}
