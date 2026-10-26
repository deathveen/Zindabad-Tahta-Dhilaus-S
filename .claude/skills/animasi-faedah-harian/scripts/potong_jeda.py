"""Potong jeda sunyi yang terlalu panjang di VO (setelah dipercepat), supaya tempo rapat.

  python3 -I potong_jeda.py masuk.wav keluar.wav [--maks 0.45] [--sisa 0.28]

Jeda sunyi yang lebih panjang dari --maks detik dipendekkan menjadi --sisa detik (separuh
di tiap sisi, disambung crossfade 15 ms). Hening di awal/akhir dipangkas menjadi 0,15 detik.
Napas pendek di antara kata tidak disentuh. Mencetak berapa jeda dipotong dan durasi baru.
"""
import argparse, numpy as np, soundfile as sf

ap = argparse.ArgumentParser()
ap.add_argument('inp'); ap.add_argument('out')
ap.add_argument('--maks', type=float, default=.45); ap.add_argument('--sisa', type=float, default=.28)
a = ap.parse_args()
y, sr = sf.read(a.inp, always_2d=True)
mono = y.mean(1); hop = int(.01 * sr); n = len(mono) // hop
db = 20 * np.log10(np.sqrt((mono[:n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
# ambang sunyi: 35 dB di bawah suara keras, tapi tidak di bawah -55 dBFS
quiet = db < max(np.percentile(db, 95) - 35, -55)
quiet = np.convolve(quiet, np.ones(5) / 5, 'same') > .99   # abaikan celah < 50 ms
runs, i = [], 0
while i < n:
    if quiet[i]:
        j = i
        while j < n and quiet[j]: j += 1
        runs.append((i, j)); i = j
    else: i += 1
keep_half, xf = int(a.sisa / 2 * sr), int(.015 * sr)
cuts = []   # (mulai, selesai) sampel yang dibuang
for s0, s1 in runs:
    s0, s1 = s0 * hop, min(s1 * hop, len(mono))
    if s0 == 0: cuts.append((0, max(0, s1 - int(.15 * sr)))); continue
    if s1 >= len(mono) - hop: cuts.append((s0 + int(.15 * sr), len(mono))); continue
    if (s1 - s0) / sr > a.maks: cuts.append((s0 + keep_half, s1 - keep_half))
parts, pos = [], 0
for c0, c1 in cuts:
    if c1 <= c0: continue
    parts.append(y[pos:c0]); pos = c1
parts.append(y[pos:])
out = parts[0]
for p in parts[1:]:
    k = min(xf, len(out), len(p))
    if k > 0:
        r = np.linspace(0, 1, k)[:, None]
        out = np.concatenate([out[:-k], out[-k:] * (1 - r) + p[:k] * r, p[k:]])
    else: out = np.concatenate([out, p])
sf.write(a.out, out, sr, subtype='PCM_16')
inner = sum(1 for c0, c1 in cuts if c0 > 0 and c1 < len(mono))
print(f'  jeda dipotong: {inner} (awal/akhir dirapikan), {len(mono) / sr:.2f} -> {len(out) / sr:.2f} detik')
