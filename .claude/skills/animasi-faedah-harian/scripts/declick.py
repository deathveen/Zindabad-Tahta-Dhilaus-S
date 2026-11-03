"""Redam letupan konsonan ("kresek"/"tuk") di VO tanpa mengubah nada atau tempo.

  python3 -I declick.py masuk.wav keluar.wav [--redam 0.75]

Vonya merekam dekat HP, jadi awal konsonan b/p/t/k/g meletup: dari diam, gelombang langsung
melonjak sekeras suku kata paling keras (ep11: 51 letupan, ±0,3 dengan puncak VO 0,43). Setelah
dikompresi dan dinormalisasi, letupan ini terdengar "kresek"/"tuk". `declip.py` tidak
menangkapnya karena tidak mentok di 1,0, dan highpass 90 Hz juga tidak cukup.

Cara kerja:
1. Deteksi: lonjakan selisih sampel > 25× median lokal (20 ms) dan > 2% puncak, pita < 700 Hz
   melonjak > 20% puncak, dan 6 ms sebelumnya sunyi (< 20% letupan) = letupan di awal kata.
   Awal kata yang wajar (naik bertahap) tidak tersentuh.
2. Perbaikan: komponen < 700 Hz di jendela 1 ms sebelum s/d 15 ms sesudah letupan diredam
   (--redam 0,75 = sisa 25%), dengan tepi halus. Bagian atas (artikulasi konsonan) tetap.
Jalankan SETELAH penjernih (prep_vo.sh): kompresor memperkuat letupan (ep11: 11 di VO asli → 51).
Mencetak jumlah letupan dan detiknya.
"""
import argparse, numpy as np, soundfile as sf
from scipy.signal import butter, sosfiltfilt
from scipy.ndimage import median_filter

ap = argparse.ArgumentParser(); ap.add_argument('inp'); ap.add_argument('out'); ap.add_argument('--redam', type=float, default=.75)
a = ap.parse_args()
y, sr = sf.read(a.inp, always_2d=True); y = y.mean(1).astype(np.float64)
pk = np.percentile(np.abs(y), 99.9) + 1e-9

d = np.abs(np.diff(y, prepend=y[0])); s = 8
med = median_filter(d[::s], size=max(3, int(sr * .02) // s)).repeat(s)[:len(d)]
lo = sosfiltfilt(butter(4, 700, 'low', fs=sr, output='sos'), y)
cand = np.where((d > 25 * (med + 1e-6)) & (d > .02 * pk))[0]
ev = np.split(cand, np.where(np.diff(cand) > int(.01 * sr))[0] + 1) if len(cand) else []
pre = int(.006 * sr); hit = []
for e in ev:
    t0 = e[0]
    if t0 < pre: continue
    g = int(.003 * sr)  # letupan bisa mulai ±3 ms sebelum lonjakan selisih terdeteksi
    if t0 < pre + g: continue
    sebelum = np.sqrt(np.mean(y[t0 - g - pre:t0 - g] ** 2)); burst = np.abs(lo[t0 - g:t0 + int(.006 * sr)]).max()
    if burst > .2 * pk and sebelum < .2 * burst: hit.append(t0 - g)

mask = np.zeros(len(y)); r0, r1, tp = int(.001 * sr), int(.015 * sr), int(.004 * sr)
up = .5 - .5 * np.cos(np.linspace(0, np.pi, tp))
for t0 in hit:
    a0, b0 = max(0, t0 - r0), min(len(y), t0 + r1)
    mask[a0:b0] = 1
    l = max(0, a0 - tp); mask[l:a0] = np.maximum(mask[l:a0], up[tp - (a0 - l):])
    rr = min(len(y), b0 + tp); mask[b0:rr] = np.maximum(mask[b0:rr], up[::-1][:rr - b0])
out = y - lo * mask * a.redam
sf.write(a.out, np.clip(out, -1, 1), sr, subtype='FLOAT')
print(f'  letupan diredam: {len(hit)}', ' '.join(f'{t / sr:.2f}' for t in hit[:60]))
