"""Perbaiki bagian VO yang pecah (clipping) karena mic terlalu dekat atau suara terlalu keras.

  python3 -I declip.py masuk.wav keluar.wav

1. Cari sampel yang mentok di batas (>= 0,95; VO WhatsApp/Opus bisa melewati 1,0 dan
   puncaknya bergelombang), lalu bentuk ulang dengan spline kubik dari sampel sehat.
2. Di sekitar tiap gugus clipping, ganti dengan versi low-pass 2,5 kHz yang diredam -5 dB,
   memakai transisi halus (tanpa sambungan mendadak), supaya letupan "kresek" hilang.
Mencetak titik yang diperbaiki (detik di file masukan).
"""
import sys, numpy as np, soundfile as sf
from scipy.interpolate import CubicSpline
from scipy.signal import butter, sosfiltfilt

y, sr = sf.read(sys.argv[1], always_2d=True); y = y.mean(1)
clip = np.abs(y) >= 0.95
idx = np.where(clip)[0]
runs = np.split(idx, np.where(np.diff(idx) > 1)[0] + 1) if len(idx) else []
fixed = y.copy(); ctx = 24
for r in runs:
    if len(r) < 2: continue
    a, b = r[0], r[-1] + 1
    xs = np.r_[np.arange(max(0, a - ctx), a), np.arange(b, min(len(y), b + ctx))]
    xs = xs[~clip[xs]]
    if len(xs) >= 6: fixed[a:b] = CubicSpline(xs, y[xs])(np.arange(a, b))
fixed *= min(1.0, 0.95 / max(np.abs(fixed).max(), 1e-9))
# gugus: run yang berjarak < 0,15 dtk digabung; abaikan gugus kecil (< 5 sampel)
groups = []
for r in runs:
    if groups and r[0] - groups[-1][1] < 0.15 * sr: groups[-1][1] = r[-1]; groups[-1][2] += len(r)
    else: groups.append([r[0], r[-1], len(r)])
groups = [g for g in groups if g[2] >= 5]
lp = 0.56 * sosfiltfilt(butter(4, 2500, 'lp', fs=sr, output='sos'), fixed)
w = np.zeros(len(y)); pad, fade = int(0.03 * sr), int(0.04 * sr)
for a, b, _ in groups:
    a, b = max(0, a - pad), min(len(y), b + pad); w[a:b] = 1
    print(f'  diperbaiki: {a / sr:.2f}-{b / sr:.2f} dtk')
if groups:
    k = np.hanning(2 * fade + 1); w = np.clip(np.convolve(w, k / k.max(), 'same'), 0, 1)
out = fixed * (1 - w) + lp * w
sf.write(sys.argv[2], out, sr, subtype='FLOAT')
