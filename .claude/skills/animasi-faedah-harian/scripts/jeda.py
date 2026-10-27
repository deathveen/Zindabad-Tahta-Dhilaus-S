"""Cetak titik jeda (hening) di VO: patokan untuk memecah caption dan meletakkan batas adegan.

  python3 -I jeda.py vo.wav [--min 0.1]

Keluaran: daftar "mulai-selesai" detik tiap jeda >= --min, dan saran VO_END (mulai kalimat
terakhir sebelum hening penutup; cocokkan dengan kalimat ajakan follow di transkrip).
"""
import argparse, numpy as np, soundfile as sf

ap = argparse.ArgumentParser(); ap.add_argument('vo'); ap.add_argument('--min', type=float, default=.1)
a = ap.parse_args()
y, sr = sf.read(a.vo, always_2d=True); y = y.mean(1)
w = int(sr * .02); n = len(y) // w
db = 20 * np.log10(np.sqrt((y[:n * w].reshape(n, w) ** 2).mean(1)) + 1e-9)
q = db < (np.percentile(db, 90) - 26)
gaps, i = [], 0
while i < n:
    if q[i]:
        j = i
        while j < n and q[j]: j += 1
        if (j - i) * .02 >= a.min: gaps.append((i * .02, j * .02))
        i = j
    else: i += 1
print(' '.join(f'{s:.2f}-{e:.2f}' for s, e in gaps))
print(f'durasi {len(y) / sr:.2f} detik')
