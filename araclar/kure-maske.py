"""Küre nokta maskesi: Natural Earth 1:50m ülke çokgenlerinden eşit alanlı nokta ızgarası üretir.

Kullanım:  python -I araclar/kure-maske.py <ne_50m_admin_0_countries.geojson> [adim_derece=0.8]
Çıktı:     veri/kure-maske.mjs  (yayına giren tek dosya; geojson yayına girmez)

Izgara: her enlem satırı i için enlem = -88 + (i + 0,5)·adım; satırdaki nokta sayısı n = round(360·cos(enlem)/adım),
boylam_j = -180 + (j + 0,5)·360/n. Böylece noktalar küre üzerinde yaklaşık eşit aralıklı olur.
Değer: a = deniz, b = kara, c = EUROAVIA yerel grubu bulunan ülkenin karası (ülke listesi veri/ag.mjs'deki ülkelerdir).
Kodlama: satır başına sıra uzunluğu (harf + sayı), satırlar '|' ile ayrılır.
Yöntem: tarama çizgisi — her satır enleminde çokgen kenarlarının kesişim boylamları sıralanır, çift-tek kuralıyla doldurulur.
"""
import json, math, os, re, sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
kaynak = sys.argv[1]
ADIM = float(sys.argv[2]) if len(sys.argv) > 2 else 0.8

# üye ülkeler: veri/ag.mjs içindeki İngilizce ülke adları (tek kaynak)
ag = open(os.path.join(KOK, 'veri', 'ag.mjs'), encoding='utf-8').read()
UYE = set(re.findall(r"\['[A-Z]{3}', '[A-Z]+', '[^']+', '[^']+', '([^']+)'", ag))
# Natural Earth adlarıyla eşleme (NE 'ADMIN' alanı)
NE_AD = {'Serbia': 'Republic of Serbia'}

veri = json.load(open(kaynak, encoding='utf-8'))
halkalar = []          # (enlem_min, enlem_max, [(lon, lat), ...], uye_mi)
bulunan = set()
for f in veri['features']:
    ad = f['properties'].get('ADMIN') or f['properties'].get('NAME')
    uye = False
    for u in UYE:
        if ad == NE_AD.get(u, u):
            uye = True; bulunan.add(u)
    g = f['geometry']
    cokgenler = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    for cg in cokgenler:
        for halka in cg:
            lats = [p[1] for p in halka]
            halkalar.append((min(lats), max(lats), halka, uye))
eksik = UYE - bulunan
if eksik:
    sys.exit(f'Natural Earth içinde bulunamayan üye ülke: {sorted(eksik)}')

satirlar = []
toplam = {'a': 0, 'b': 0, 'c': 0}
nsatir = int(round(176 / ADIM))
for i in range(nsatir):
    enlem = -88 + (i + 0.5) * ADIM
    n = max(1, round(360 * math.cos(math.radians(enlem)) / ADIM))
    deger = ['a'] * n
    for (emin, emax, halka, uye) in halkalar:
        if enlem < emin or enlem > emax:
            continue
        kes = []
        for k in range(len(halka) - 1):
            (x1, y1), (x2, y2) = halka[k][:2], halka[k + 1][:2]
            if (y1 <= enlem < y2) or (y2 <= enlem < y1):
                kes.append(x1 + (enlem - y1) * (x2 - x1) / (y2 - y1))
        kes.sort()
        for k in range(0, len(kes) - 1, 2):
            j0 = math.ceil((kes[k] + 180) * n / 360 - 0.5)
            j1 = math.floor((kes[k + 1] + 180) * n / 360 - 0.5)
            for j in range(max(0, j0), min(n - 1, j1) + 1):
                # çift-tek: delik halkası (göl) ikinci kez geçerse denize döner
                if deger[j] == 'a':
                    deger[j] = 'c' if uye else 'b'
                else:
                    deger[j] = 'a'
    for d in deger:
        toplam[d] += 1
    # sıra uzunluğu kodlaması
    parca, onceki, say = [], deger[0], 0
    for d in deger:
        if d == onceki:
            say += 1
        else:
            parca.append(f'{onceki}{say}'); onceki, say = d, 1
    parca.append(f'{onceki}{say}')
    satirlar.append(''.join(parca))

metin = '|'.join(satirlar)
cikti = os.path.join(KOK, 'veri', 'kure-maske.mjs')
with open(cikti, 'w', encoding='utf-8', newline='\n') as o:
    o.write('/* KÜRE MASKESİ — üretildi: araclar/kure-maske.py (Natural Earth 1:50m ülkeler, kamu malı). Elle düzenlemeyin.\n')
    o.write(f' * adım {ADIM}°, {nsatir} satır; a deniz · b kara · c EUROAVIA grubu olan ülke. Noktalar: deniz {toplam["a"]}, kara {toplam["b"]}, üye ülke {toplam["c"]}. */\n')
    o.write(f'export const ADIM = {ADIM};\nexport const ENLEM0 = -88;\nexport const MASKE = \'{metin}\';\n')
print(f'{cikti}: {len(metin)} karakter, kara {toplam["b"]}, üye {toplam["c"]}, deniz {toplam["a"]}')
