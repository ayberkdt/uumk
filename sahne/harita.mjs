/* HARİTA — EUROAVIA ağının düz haritası (tuval 2B). Lambert azimut eşit alanlı izdüşüm, merkez Avrupa.
 * Katmanlar: (durağan, tampon tuvale bir kez) enlem/boylam ağı · ülkeler (Natural Earth 1:50m, veri/harita-ulkeler.mjs; grubu olan ülkeler petrol) · grup noktaları · pusula ·
 * ölçek çubuğu; (her kare) İstanbul'dan rotalar (görününce yakından uzağa sırayla çizilir) · rotalarda süzülen kâğıt uçaklar ·
 * İstanbul nabzı · seçilen rota (çizilirken ucunda uçak). Hareket azaltmada rotalar çizili gelir, uçak ve nabız yok.
 * API (sahne/ag.mjs): izdus(enlem, boylam) → [x, y, true] (CSS px) · vurgula(hedef|null) · istek() · gorunur(b). */
import { ULKELER, Q } from '../veri/harita-ulkeler.mjs';
/* gece paleti: EUROAVIA bölümü koyu zeminde (site.css .bolum--koyu); sarı = AS Istanbul'un rotaları ve uçakları */
const GECE = { zemin: '#0f0f0f', ag: 'rgba(242, 242, 239, 0.05)', kara: '#24241f', uye: '#123b41', uyeKenar: 'rgba(45, 124, 135, 0.9)', sinir: 'rgba(242, 242, 239, 0.13)', grup: '#f2f2ef', soluk: '#b3b3ae', sari: '#f2c200', rota: 'rgba(242, 194, 0, 0.3)' };
const YAZI = '"IBM Plex Sans", system-ui, sans-serif';
/* ülke halkaları: fark kodlu tamsayılardan [enlem, boylam] dizilerine (bir kez) */
const ULKE = ULKELER.map(([uye, ad, halkalar]) => ({ uye, ad, halkalar: halkalar.map((k) => { const n = []; let x = 0, y = 0; for (let i = 0; i < k.length; i += 2) { x += k[i]; y += k[i + 1]; n.push([y / Q, x / Q]); } return n; }) }));
const NOKTA = ULKE.reduce((t, u) => t + u.halkalar.reduce((a, h) => a + h.length, 0), 0);

const rad = (d) => (d * Math.PI) / 180;
const MERKEZ = { enlem: 46, boylam: 14 };
const sinir = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const yumusak = (t) => 1 - (1 - t) ** 3;

function lambert(enlem, boylam) {
  const f = rad(enlem), l = rad(boylam - MERKEZ.boylam), f0 = rad(MERKEZ.enlem);
  const k = Math.sqrt(2 / (1 + Math.sin(f0) * Math.sin(f) + Math.cos(f0) * Math.cos(f) * Math.cos(l)));
  return [k * Math.cos(f) * Math.sin(l), -k * (Math.cos(f0) * Math.sin(f) - Math.sin(f0) * Math.cos(f) * Math.cos(l))];
}

/* büyük daire: iki nokta arasında küre üzerinde ara noktalar [enlem, boylam] */
function buyukDaire(e1, b1, e2, b2, n = 48) {
  const v = (e, b) => [Math.cos(rad(e)) * Math.cos(rad(b)), Math.cos(rad(e)) * Math.sin(rad(b)), Math.sin(rad(e))];
  const p = v(e1, b1), q = v(e2, b2), w = Math.acos(Math.min(1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2])) || 1e-9, out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, A = Math.sin((1 - t) * w) / Math.sin(w), B = Math.sin(t * w) / Math.sin(w);
    const x = A * p[0] + B * q[0], y = A * p[1] + B * q[1], z = A * p[2] + B * q[2];
    out.push([(Math.atan2(z, Math.hypot(x, y)) * 180) / Math.PI, (Math.atan2(y, x) * 180) / Math.PI]);
  }
  return out;
}

export function haritaKur(tuval, { gruplar, merkez, boyutDegisti, az = false }) {
  const g = tuval.getContext('2d');
  const ana = gruplar.find((x) => x[0] === merkez);
  const cerceve = { g: Math.min(...gruplar.map((x) => x[6])) - 3, k: Math.max(...gruplar.map((x) => x[6])) + 4, b: Math.min(...gruplar.map((x) => x[7])) - 4, d: Math.max(...gruplar.map((x) => x[7])) + 5 };
  const tampon = document.createElement('canvas'), tg = tampon.getContext('2d');
  let gen = 0, yuk = 0, dpr = 1, olcek = 1, ox = 0, oy = 0;
  let gorunur = false, girisT0 = null, dongu = 0, secili = null, secimT0 = 0, ustRota = null, odak = 0;
  /* uyarlanabilir kalite (açılıştaki gibi): yavaş çizimde 1x piksel, 2 uçak */
  let hafif = document.documentElement.classList.contains('hafif'), kareSay = 0, kareTop = 0, sonKare = 0;

  /* sığdırma: grupların izdüşüm kutusu tuvalin %86'sına */
  /* çerçeve Avrupa'ya oturur (25° K üstü); dışarıda kalan gruplar (Lagos) kenarda okla gösterilir */
  const ham = gruplar.filter((x) => x[6] > 25).map((x) => lambert(x[6], x[7]));
  const kut = { x0: Math.min(...ham.map((h) => h[0])), x1: Math.max(...ham.map((h) => h[0])), y0: Math.min(...ham.map((h) => h[1])), y1: Math.max(...ham.map((h) => h[1])) };
  const izdus = (enlem, boylam) => { const [x, y] = lambert(enlem, boylam); return [ox + x * olcek, oy + y * olcek, true]; };

  /* rotalar: İstanbul'dan gruba büyük daire yayı (gerçek uçuş rotası gibi), ekranda nokta dizisi */
  let rotalar = [];
  const rotaYap = (e, b, g = null) => { const pts = buyukDaire(ana[6], ana[7], e, b).map(([pe, pb]) => izdus(pe, pb)); const l = Math.hypot(pts.at(-1)[0] - pts[0][0], pts.at(-1)[1] - pts[0][1]); return { g, pts, a: pts[0], b: pts.at(-1), l }; };
  function rotaKur() {
    rotalar = gruplar.filter((x) => x !== ana).map((x) => rotaYap(x[6], x[7], x)).sort((a, b) => a.l - b.l);
  }
  const egri = (r, t) => { const n = r.pts.length - 1, f = Math.min(n - 1e-6, Math.max(0, t * n)), i = Math.floor(f), u = f - i, p = r.pts[i], q = r.pts[i + 1]; return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]; };
  const egim = (r, t) => { const [x1, y1] = egri(r, Math.max(0, t - 0.01)), [x2, y2] = egri(r, Math.min(1, t + 0.01)); return Math.atan2(y2 - y1, x2 - x1); };
  function rotaParca(r, t0, t1, n = 28) {
    g.beginPath();
    for (let i = 0; i <= n; i++) { const [x, y] = egri(r, t0 + ((t1 - t0) * i) / n); i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
  function ucak(x, y, aci, boyut, renk) {
    g.save(); g.translate(x, y); g.rotate(aci); g.scale(boyut / 18, boyut / 18); g.fillStyle = renk;
    g.beginPath(); g.moveTo(9, 0); g.lineTo(-9, -6); g.lineTo(-2, 1.5); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(9, 0); g.lineTo(-2, 1.5); g.lineTo(-3, 6); g.closePath(); g.globalAlpha *= 0.75; g.fill();
    g.restore();
  }

  let rotaTamponda = false;
  function durgun() {
    rotaTamponda = false;
    tg.setTransform(dpr, 0, 0, dpr, 0, 0);
    tg.clearRect(0, 0, gen, yuk);
    /* enlem/boylam ağı (10°) */
    tg.strokeStyle = GECE.ag; tg.lineWidth = 1;
    for (let e = -10; e <= 80; e += 10) { tg.beginPath(); for (let b = -40; b <= 70; b += 2) { const [x, y] = izdus(e, b); b === -40 ? tg.moveTo(x, y) : tg.lineTo(x, y); } tg.stroke(); }
    for (let b = -40; b <= 70; b += 10) { tg.beginPath(); for (let e = -10; e <= 80; e += 2) { const [x, y] = izdus(e, b); e === -10 ? tg.moveTo(x, y) : tg.lineTo(x, y); } tg.stroke(); }
    /* ülkeler: dolgu, ince sınır; grubu olan ülkeler petrol tonunda ve açık petrol kenarlı */
    const yol = (h) => { tg.beginPath(); h.forEach(([e, b], i) => { const [x, y] = izdus(e, b); i ? tg.lineTo(x, y) : tg.moveTo(x, y); }); tg.closePath(); };
    tg.lineJoin = 'round';
    for (const u of ULKE) for (const h of u.halkalar) { yol(h); tg.fillStyle = u.uye ? GECE.uye : GECE.kara; tg.fill(); tg.strokeStyle = GECE.sinir; tg.lineWidth = 0.7; tg.stroke(); }
    for (const u of ULKE) if (u.uye) for (const h of u.halkalar) { yol(h); tg.strokeStyle = GECE.uyeKenar; tg.lineWidth = 1; tg.stroke(); }
    /* pusula gülü (sol alt) */
    { const px = 34, py = yuk - 40, R = 16; tg.save(); tg.translate(px, py); tg.strokeStyle = GECE.soluk; tg.fillStyle = GECE.soluk; tg.lineWidth = 1;
      tg.beginPath(); tg.arc(0, 0, R + 5, 0, Math.PI * 2); tg.globalAlpha = 0.35; tg.stroke(); tg.globalAlpha = 1;
      for (let k = 0; k < 4; k++) { tg.rotate(Math.PI / 2); tg.beginPath(); tg.moveTo(0, -R); tg.lineTo(4, 0); tg.lineTo(-4, 0); tg.closePath(); k === 3 ? tg.fill() : tg.stroke(); }
      tg.restore(); tg.font = `600 10px ${YAZI}`; tg.textAlign = 'center'; tg.fillStyle = GECE.soluk; tg.fillText('K', px, py - R - 9); }
    /* gruplar */
    for (const x of gruplar) {
      if (x === ana) continue;
      const [px, py] = izdus(x[6], x[7]);
      /* tam üye (AS, AM) dolu; aday (PAS, PAM) halka */
      tg.beginPath(); tg.arc(px, py, 2.6, 0, Math.PI * 2);
      if (x[1].startsWith('P')) { tg.strokeStyle = GECE.grup; tg.lineWidth = 1.3; tg.fillStyle = GECE.zemin; tg.fill(); tg.stroke(); } else { tg.fillStyle = GECE.grup; tg.fill(); }
    }
    /* çerçeve dışı gruplar: kenarda yön oku + ad */
    for (const x of gruplar) {
      const [px, py] = izdus(x[6], x[7]);
      if (px >= 0 && py >= 0 && px <= gen && py <= yuk) continue;
      /* ok taşılan kenarı gösterir: alttaysa aşağı, soldaysa sola… */
      const aci = py > yuk ? Math.PI / 2 : py < 0 ? -Math.PI / 2 : px < 0 ? Math.PI : 0;
      const kx = Math.min(gen - 18, Math.max(18, px)), ky = Math.min(yuk - 40, Math.max(18, py));
      tg.save(); tg.translate(kx, ky); tg.rotate(aci); tg.fillStyle = GECE.grup; tg.beginPath(); tg.moveTo(7, 0); tg.lineTo(-5, -5); tg.lineTo(-5, 5); tg.closePath(); tg.fill(); tg.restore();
      tg.fillStyle = GECE.grup; tg.font = `600 11px ${YAZI}`; tg.textAlign = 'left'; tg.fillText(x[3], kx + 10, ky + 4);
    }
    /* ölçek çubuğu: 500 km (merkezde) */
    const [x1, y1] = izdus(MERKEZ.enlem, MERKEZ.boylam), [x2] = izdus(MERKEZ.enlem, MERKEZ.boylam + 500 / (111.32 * Math.cos(rad(MERKEZ.enlem))));
    const L = Math.abs(x2 - x1), sx = gen - L - 24, sy = yuk - 22;
    tg.strokeStyle = GECE.soluk; tg.lineWidth = 1.2; tg.beginPath(); tg.moveTo(sx, sy - 5); tg.lineTo(sx, sy); tg.lineTo(sx + L, sy); tg.lineTo(sx + L, sy - 5); tg.moveTo(sx + L / 2, sy); tg.lineTo(sx + L / 2, sy - 3); tg.stroke();
    tg.fillStyle = GECE.soluk; tg.font = `600 11px ${YAZI}`; tg.textAlign = 'center'; tg.fillText('500 km', sx + L / 2, sy - 9);
    void y1;
  }

  function boyutla() {
    const b = tuval.getBoundingClientRect();
    const yeniDpr = hafif ? 1 : Math.min(devicePixelRatio || 1, 2);
    if (Math.round(b.width) === gen && Math.round(b.height) === yuk && yeniDpr === dpr) return;
    dpr = yeniDpr;
    gen = Math.round(b.width); yuk = Math.round(b.height);
    tuval.width = gen * dpr; tuval.height = yuk * dpr; tampon.width = gen * dpr; tampon.height = yuk * dpr;
    const dolgu = 0.08;
    olcek = Math.min((gen * (1 - 2 * dolgu)) / (kut.x1 - kut.x0), (yuk * (1 - 2 * dolgu)) / (kut.y1 - kut.y0));
    ox = gen / 2 - ((kut.x0 + kut.x1) / 2) * olcek; oy = yuk / 2 - ((kut.y0 + kut.y1) / 2) * olcek;
    durgun(); rotaKur(); if (secili) secili.rota = seciliRota(secili); istek(); boyutDegisti?.();
  }

  function kare(zaman) {
    dongu = 0;
    if (sonKare && kareSay < 10 && !hafif && zaman - sonKare < 250) { kareTop += zaman - sonKare; if (++kareSay === 10 && kareTop / 10 > 40) { hafif = true; gen = 0; boyutla(); } }
    sonKare = zaman;
    const t = zaman / 1000;
    if (girisT0 === null && gorunur) girisT0 = t;
    const giris = az ? 10 : girisT0 === null ? 0 : t - girisT0;
    /* rotalar: yakından uzağa sırayla çizilir, sonra kesikli ve silik kalır */
    /* giriş bitince rotalar durağan tampona bir kez çizilir (tampon bu karede çizilmeden önce: iz bir kare bile kaybolmaz) */
    const girisBitti = giris > 0.9 + rotalar.length * 0.045;
    if (girisBitti && !rotaTamponda) {
      tg.setTransform(dpr, 0, 0, dpr, 0, 0); tg.lineWidth = 1; tg.setLineDash([3, 4]); tg.strokeStyle = GECE.rota;
      for (const r of rotalar) { tg.beginPath(); for (let i = 0; i <= 28; i++) { const [x, y] = egri(r, i / 28); i ? tg.lineTo(x, y) : tg.moveTo(x, y); } tg.stroke(); }
      tg.setLineDash([]); rotaTamponda = true;
    }
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, tuval.width, tuval.height);
    /* odak: etkinlik seçiliyken harita geri çekilir, seçili rota öne çıkar */
    odak += ((secili ? 1 : 0) - odak) * (az ? 1 : 0.12);
    g.globalAlpha = 1 - 0.5 * odak; g.drawImage(tampon, 0, 0); g.globalAlpha = 1;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!rotaTamponda) {
      g.lineWidth = 1; g.setLineDash([3, 4]); g.strokeStyle = GECE.rota;
      rotalar.forEach((r, i) => { const u = sinir((giris - i * 0.045) / 0.9); if (u > 0) rotaParca(r, 0, yumusak(u)); });
      g.setLineDash([]);
    }
    /* süzülen uçaklar: girişten sonra, 6 tanesi farklı rotalarda */
    if (!az && giris > 1.4) {
      for (let k = 0; k < (hafif ? 2 : 6); k++) {
        const r = rotalar[(k * 7 + Math.floor((t + k * 1.7) / 4.2) * 5) % rotalar.length];
        const u = ((t + k * 1.7) % 4.2) / 4.2;
        const [x, y] = egri(r, u);
        g.globalAlpha = Math.sin(Math.PI * u) * 0.85 * (1 - 0.7 * odak);
        g.strokeStyle = GECE.sari; g.lineWidth = 1.4; rotaParca(r, Math.max(0, u - 0.12), u, 10);
        ucak(x, y, egim(r, u), 12, GECE.sari);
        g.globalAlpha = 1;
      }
    }
    /* İstanbul: nabız + nokta */
    const [ix, iy] = izdus(ana[6], ana[7]);
    if (!az) { const n = (t % 2.2) / 2.2; g.strokeStyle = `rgba(242, 194, 0, ${(1 - n) * 0.6})`; g.lineWidth = 1.5; g.beginPath(); g.arc(ix, iy, 5 + n * 22, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = GECE.sari; g.beginPath(); g.arc(ix, iy, 5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = GECE.zemin; g.lineWidth = 1.5; g.stroke();
    /* üzerine gelinen grup: rota önizlemesi */
    if (ustRota) { g.strokeStyle = 'rgba(242, 194, 0, 0.7)'; g.lineWidth = 1.4; g.setLineDash([]); rotaParca(ustRota, 0, 1, 32); }
    /* seçim: rota çizilir, ucunda uçak; varınca hedef halkası */
    if (secili) {
      const [hx, hy] = izdus(secili.enlem, secili.boylam);
      const r = secili.rota;
      const u = az ? 1 : yumusak(sinir((t - secimT0) / 1.2));
      if (r) {
        g.strokeStyle = GECE.sari; g.lineWidth = 2.2; g.lineCap = 'round'; rotaParca(r, 0, u, 40);
        if (u < 1) { const [x, y] = egri(r, u); ucak(x, y, egim(r, u), 18, GECE.sari); }
      }
      g.strokeStyle = GECE.sari; g.lineWidth = 2; g.beginPath(); g.arc(hx, hy, 7 + (u < 1 ? 0 : Math.sin(t * 3) * 1.5), 0, Math.PI * 2); g.stroke();
      g.fillStyle = GECE.grup; g.beginPath(); g.arc(hx, hy, 3, 0, Math.PI * 2); g.fill();
      secili.ilerleme = u;
    }
    const devam = !az && gorunur;
    if (devam && !dongu) dongu = requestAnimationFrame(kare);
  }
  function istek() { if (!dongu) dongu = requestAnimationFrame(kare); }
  function seciliRota(h) {
    const r = rotaYap(h.enlem, h.boylam);
    return r.l > 2 ? r : null;
  }

  new ResizeObserver(boyutla).observe(tuval);
  boyutla();
  return {
    izdus,
    vurgula(h) {
      if (!h) { secili = null; istek(); return; }
      secili = { ...h, rota: seciliRota(h), ilerleme: 0 }; secimT0 = performance.now() / 1000; istek();
    },
    istek,
    onizle(h) { ustRota = h ? seciliRota(h) : null; istek(); },
    gorunur(b) { gorunur = b; if (b) istek(); },
    durum: () => ({ secili: secili ? { ad: secili.ad, ilerleme: secili.ilerleme } : null, rota: rotalar.length, kara: NOKTA, ulke: ULKE.length }),
  };
}
