"""Sintesis musik latar + efek suara untuk render.html (tanpa sampel eksternal).

Pemakaian: python3 audio.py out.wav
Waktu efek mengikuti rumus & RNG yang sama dengan render.html.
"""
import sys
import wave

import numpy as np

SR = 44100
DUR = 80.0
N = int(SR * DUR)
out = np.zeros((N, 2))


def lcg(seed):
    s = seed & 0xFFFFFFFF
    while True:
        s = (s * 1664525 + 1013904223) & 0xFFFFFFFF
        yield s / 4294967296


# --- waktu event (sama dengan render.html) ---
N_STARS, STAR_T0, STAR_T1, FALL = 99, 7.0, 18.2, 0.75
STONE_LAND = 19.6 + 0.6
r = lcg(7)
star_land, star_leave, star_back = [], [], []
for i in range(N_STARS):
    v = [next(r) for _ in range(12)]
    star_land.append(STAR_T0 + (STAR_T1 - STAR_T0) * (i / (N_STARS - 1)) ** 0.55 + FALL)
    star_leave.append(25.6 + i * 0.075 + v[6] * 0.3)
    star_back.append(69.8 + v[9] * 3.2)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a, d):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
    return e


def add(sig, t0, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= N:
        return
    sig = sig[: N - i0]
    out[i0 : i0 + len(sig), 0] += sig * gain * (1 - pan) / 2 * 2 ** 0.5
    out[i0 : i0 + len(sig), 1] += sig * gain * (1 + pan) / 2 * 2 ** 0.5


def pad_chord(notes, t0, dur, gain, bright=0.3):
    n = int((dur + 1.5) * SR)
    t = np.arange(n) / SR
    att, rel = 1.2, 1.5
    e = np.clip(t / att, 0, 1) * np.clip((dur + rel - t) / rel, 0, 1)
    sig = np.zeros(n)
    for m in notes:
        f = midi(m)
        for det in (-0.08, 0.08):
            ff = f * 2 ** (det / 12)
            sig += np.sin(2 * np.pi * ff * t) + bright * np.sin(4 * np.pi * ff * t) / 2
    add(sig * e / (len(notes) * 4), t0, gain)


def pluck(m, t0, gain, pan=0.0, decay=0.6):
    n = int((decay * 5) * SR)
    t = np.arange(n) / SR
    f = midi(m)
    sig = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3.01 * f * t))
    add(sig * env(n, 0.005, decay), t0, gain, pan)


def chime(m, t0, gain, pan=0.0):
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = midi(m)
    sig = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6)
    add(sig * env(n, 0.002, 0.35), t0, gain, pan)


rng = np.random.default_rng(3)
PENTA = [0, 2, 4, 7, 9]

# --- musik per babak ---
C, G, Am, F, Dm, E = [48, 55, 64, 67], [43, 50, 59, 62], [45, 52, 60, 64], [41, 48, 57, 64], [38, 50, 57, 65], [40, 52, 56, 59]
for k, ch in enumerate([F, C, Am, G, F]):  # 0–20 senja hangat
    pad_chord(ch, k * 4, 4, 0.55)
pad_chord([38, 45, 50, 53], 20.2, 4.8, 0.6, bright=0.1)  # kritik: Dm rendah
for k, ch in enumerate([Am, F, C, E]):  # 25–37 malam
    pad_chord([m - 12 if j == 0 else m for j, m in enumerate(ch)], 25 + k * 3, 3, 0.5, bright=0.15)
for k, ch in enumerate([Am, F, C, G] * 3 + [Am]):  # 37–62 penjelasan, arpeggio pelan
    t0 = 37 + k * 2
    if t0 >= 62:
        break
    pad_chord(ch, t0, 2, 0.35, bright=0.2)
    for j, m in enumerate([ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12]):
        pluck(m, t0 + j * 0.5, 0.09, pan=(-0.3 + 0.2 * j), decay=0.35)
for k, ch in enumerate([C, G, Am, F, C]):  # 62–80 fajar
    pad_chord([m + 12 if j == 3 else m for j, m in enumerate(ch)], 62 + k * 3.6, 3.6, 0.55, bright=0.35)
for k in range(24):  # melodi kecil fajar
    pluck(72 + PENTA[[0, 2, 4, 2, 1, 3, 4, 2][k % 8]], 62.6 + k * 0.6, 0.06, pan=0.2, decay=0.5)

# --- efek ---
for i, t in enumerate(star_land):  # denting tiap bintang mendarat
    dense = min(1, i / 30)
    chime(84 + PENTA[i % 5] + 12 * (i % 3 == 2), t, 0.16 * (1 - 0.65 * dense), pan=rng.uniform(-.5, .5))

# batu jatuh: dentum rendah + derak
n = int(1.4 * SR)
t = np.arange(n) / SR
f = 70 * np.exp(-t * 3) + 38
thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4)
thump += rng.normal(0, 1, n) * np.exp(-t * 25) * 0.35
add(thump, STONE_LAND, 0.9)
pad_chord([26], STONE_LAND, 4.5, 0.5, bright=0)  # dengung rendah

for i, t in enumerate(star_leave):  # bintang terbang (naik)
    chime(81 + PENTA[(i * 2) % 5] + 12 * (i % 4 == 0), t + 0.4, 0.05, pan=rng.uniform(-.7, .7))
for i, t in enumerate(sorted(star_back)):
    chime(84 + PENTA[i % 5], t + 1.0, 0.045, pan=rng.uniform(-.7, .7))

# tunas & daun (pelajaran)
for j, m in enumerate([72, 76, 79, 84]):
    chime(m, 65.9 + j * 0.12, 0.12, pan=-0.2)
chime(88, 69.0, 0.12)

# --- reverb sederhana (konvolusi dengan derau meluruh) ---
ir_n = int(2.2 * SR)
ir_t = np.arange(ir_n) / SR
wet = np.zeros_like(out)
for c in range(2):
    ir = rng.normal(0, 1, ir_n) * np.exp(-ir_t * 2.6)
    ir /= np.sqrt(np.sum(ir ** 2))
    L = N + ir_n
    nfft = 1 << (L - 1).bit_length()
    wet[:, c] = np.fft.irfft(np.fft.rfft(out[:, c], nfft) * np.fft.rfft(ir, nfft), nfft)[:N]
mixd = out * 0.75 + wet * 0.5

# fade masuk/keluar & normalisasi
fade = np.ones(N)
fade[: int(.6 * SR)] = np.linspace(0, 1, int(.6 * SR))
fade[-int(2 * SR):] = np.linspace(1, 0, int(2 * SR))
mixd *= fade[:, None]
mixd /= np.max(np.abs(mixd)) / 0.85
mixd = np.tanh(mixd * 1.1) / np.tanh(1.1)

with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'audio.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mixd * 32767).astype('<i2').tobytes())
