"""Mix musik latar + efek suara (SFX) yang disinkronkan dengan render.html.

Pemakaian:
  node dump_events.js render.html events.json
  python3 audio.py events.json musik.mp3 out.wav            # musik dari file
  python3 audio.py events.json pad out.wav vo.mp3           # VO + musik instrumental buatan sendiri

Dengan VO: suara dibersihkan ringan (tanpa mengubah nada) dan musik otomatis mengecil
saat VO berbicara. Tanpa VO: musik diberi efek "teredam" dan ducking sesuai penanda
di render.html. SFX disintesis sendiri tanpa sampel eksternal.
"""
import json
import subprocess
import sys
import wave

import numpy as np
from scipy.signal import butter, sosfiltfilt

SR = 44100
events_path, music_path, out_path = sys.argv[1:4]
vo_path = sys.argv[4] if len(sys.argv) > 4 else None
meta = json.load(open(events_path))
DUR = meta['duration']
N = int(SR * DUR)
M = meta['music']
T = np.arange(N) / SR


def load(path, filters=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', path] + (['-af', filters] if filters else []) + ['-f', 'f32le', '-ac', '2', '-ar', str(SR), '-']
    a = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype='<f4').reshape(-1, 2).astype(np.float64)[:N]
    return np.pad(a, ((0, N - len(a)), (0, 0)))


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def make_pad():
    """Musik latar lembut: akor Am–F–C–G (4 detik per akor) + arpeggio pelan."""
    out = np.zeros((N, 2))
    chords = [[45, 52, 57, 60, 64], [41, 48, 57, 60, 65], [48, 55, 60, 64, 67], [43, 50, 59, 62, 67]]
    for k in range(int(DUR / 4) + 1):
        t0, notes = k * 4.0, chords[k % 4]
        n = int(5.5 * SR); t = np.arange(n) / SR
        e = np.clip(t / 1.4, 0, 1) * np.clip((5.5 - t) / 1.6, 0, 1)
        sig = sum(np.sin(2 * np.pi * midi_hz(m) * 2 ** (d / 1200) * t) for m in notes for d in (-6, 6)) / (len(notes) * 2)
        i0 = int(t0 * SR); seg = (sig * e)[: N - i0]
        out[i0:i0 + len(seg), 0] += seg; out[i0:i0 + len(seg), 1] += seg * .96
        for j, m in enumerate([notes[2] + 12, notes[3] + 12, notes[4] + 12, notes[3] + 12]):
            tp = t0 + j; np_ = int(1.8 * SR); tq = np.arange(np_) / SR
            pl = (np.sin(2 * np.pi * midi_hz(m) * tq) + .25 * np.sin(4 * np.pi * midi_hz(m) * tq)) * np.minimum(tq / .01, 1) * np.exp(-tq / .5)
            ip = int(tp * SR); seg = pl[: max(0, N - ip)] * .18
            out[ip:ip + len(seg), 0] += seg * .8; out[ip:ip + len(seg), 1] += seg
    out = sosfiltfilt(butter(2, 2500, 'low', fs=SR, output='sos'), out, axis=0)
    return out / (np.max(np.abs(out)) + 1e-9) * .5


# --- musik ---
music = make_pad() if music_path == 'pad' else load(music_path)


def ramp(t, a, b):
    return np.clip((t - a) / (b - a), 0, 1)


def smooth(k):
    return k * k * (3 - 2 * k)


vo = None
if vo_path:
    # VO dirapikan ringan: buang dengung rendah, kurangi desis, redam "s" tajam, ratakan volume
    vo = load(vo_path, 'highpass=f=80,afftdn=nf=-28,deesser=i=0.4,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2')
    env = np.abs(vo).mean(axis=1)
    k = int(.25 * SR); env = np.convolve(env, np.ones(k) / k, 'same')
    env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1)
    music *= (1 - .7 * env)[:, None]          # ducking: musik mengecil saat ada suara
    music[T > M.get('vo_end', DUR)] *= 1.6    # musik naik di kartu penutup
if 'impact' in M:
  # kurva "teredam": masuk saat kritik, paling dalam di malam hari, terbuka lagi saat fajar
  muff = (smooth(ramp(T, M['impact'], M['impact'] + 1.2)) * .85
        - smooth(ramp(T, M['cards'] - .5, M['cards'] + .6)) * .5
        - smooth(ramp(T, M['dawn'] - .4, M['dawn'] + 1.8)) * .35)
  muff = np.clip(muff, 0, 1)
  lp = sosfiltfilt(butter(2, 700, 'low', fs=SR, output='sos'), music, axis=0)
  music = music * (1 - muff[:, None]) + lp * muff[:, None] * 1.25
  # ducking: hantaman batu & judul penutup
  duck = 1 - .6 * np.exp(-np.maximum(T - M['impact'], 0) / .5) * (T >= M['impact'] - .02)
  duck *= 1 - .35 * np.exp(-np.maximum(T - M['end'], 0) / .6) * (T >= M['end'] - .02)
  music *= duck[:, None]

# --- SFX ---
sfx = np.zeros((N, 2))
rng = np.random.default_rng(11)
PENTA = [9, 12, 14, 16, 19] if music_path == 'pad' else [8, 11, 13, 15, 18]  # A minor (pad) / G# minor pentatonik


def note(deg, octave=6):
    m = 12 * (octave + 1) + PENTA[deg % 5] + 12 * (deg // 5)
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def add(sig, t0, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= N or i0 + len(sig) <= 0:
        return
    if i0 < 0:
        sig, i0 = sig[-i0:], 0
    sig = sig[: N - i0]
    sfx[i0:i0 + len(sig), 0] += sig * gain * np.sqrt((1 - pan) / 2)
    sfx[i0:i0 + len(sig), 1] += sig * gain * np.sqrt((1 + pan) / 2)


def bell(f, dur=1.2, decay=.35):
    t = tt(dur)
    return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 8)
            + .2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 14)) * np.minimum(1, t / .002) * np.exp(-t / decay)


def sweep(f0, f1, dur, shape=2.0):
    t = tt(dur)
    f = f0 * (f1 / f0) ** ((t / dur) ** (1 / shape))
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def bandnoise(dur, lo, hi):
    n = rng.normal(0, 1, int(dur * SR))
    return sosfiltfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), n)


def whoosh(dur=.9, peak=.6, lo=300, hi=5000):
    t = tt(dur)
    n = rng.normal(0, 1, len(t))
    out = np.zeros_like(t)
    # filter berpindah frekuensi: jumlahkan beberapa pita dengan amplop bergeser
    for j, c in enumerate(np.geomspace(lo, hi, 6)):
        b = sosfiltfilt(butter(2, [c * .7, min(c * 1.4, SR / 2 - 100)], 'band', fs=SR, output='sos'), n)
        center = peak * (.6 + .8 * j / 5)
        out += b * np.exp(-((t - center) / (dur * .22)) ** 2)
    env = np.minimum(t / (peak * .9), 1) ** 2 * np.exp(-np.maximum(t - peak, 0) / .18)
    return out * env / 3


def thud(f0=90, f1=40, dur=.8, noise=.3, decay=.18):
    t = tt(dur)
    body = sweep(f0, f1, dur, 1) * np.exp(-t / decay)
    crunch = sosfiltfilt(butter(2, 1800, 'low', fs=SR, output='sos'), rng.normal(0, 1, len(t))) * np.exp(-t / .03)
    return body + noise * crunch


def pan_r():
    return rng.uniform(-.6, .6)


HITS = sorted(e['t'] for e in meta['events'] if e['type'] in ('end_hit', 'door_open'))
for e in meta['events']:
    t0, k = e['t'], e['type']
    if k == 'riser':  # riser naik sampai hantaman berikutnya
        e['dur'] = next((h - t0 for h in HITS if h > t0 + .2), 1.5)
    if k == 'star':
        i = e['i']
        g = .2 if i < 10 else .2 * max(.25, 1 - (i - 10) / 70)
        add(bell(note(i % 7 if i < 10 else rng.integers(0, 8), 6), 1.0, .3 if i < 10 else .18), t0, g, pan_r())
    elif k == 'rise':
        add(bell(note(rng.integers(3, 10), 7), .6, .12), t0, .045, rng.uniform(-.9, .9))
    elif k == 'return':
        add(bell(note(rng.integers(0, 8), 7), .8, .2), t0, .06, rng.uniform(-.8, .8))
    elif k == 'fall':
        s = sweep(1400, 260, .6, 1.4) * np.hanning(int(.6 * SR)) ** .5
        add(s, t0, .12)
        add(whoosh(.7, .55, 200, 2500), t0, .5)
    elif k == 'impact':
        add(thud(110, 34, 1.6, .5, .35), t0, .7)
        add(thud(60, 30, 2.2, 0, .7), t0, .45)
        # dentingan kaca toples
        for f, g in [(2380, .25), (3910, .15), (5230, .1)]:
            add(np.sin(2 * np.pi * f * tt(1.5)) * np.exp(-tt(1.5) / .35), t0 + .005, g * .5, .15)
        add(bandnoise(.5, 2000, 8000) * np.exp(-tt(.5) / .06), t0, .25)
    elif k == 'sting':
        t = tt(2.6)
        s = sum(np.sin(2 * np.pi * f * t) for f in (note(0, 3), note(0, 3) * 2 ** (1 / 12), note(2, 3)))
        add(s * np.minimum(t / 1.0, 1) * np.exp(-np.maximum(t - 1.0, 0) / .6) / 3, t0, .16)
    elif k in ('whoosh', 'whoosh_soft'):
        add(whoosh(1.1, .6), t0, .55 if k == 'whoosh' else .3)
    elif k == 'title':
        add(thud(160, 70, .4, .1, .07), t0 + .1, .35)
        add(bandnoise(.8, 4000, 12000) * np.exp(-tt(.8) / .25) * np.minimum(tt(.8) / .05, 1), t0 + .05, .06)
        for j, d in enumerate((0, 2, 4)):
            add(bell(note(d, 6), 1.2, .4), t0 + .12 + j * .07, .07, -.3 + .3 * j)
    elif k == 'fall_short':
        add(sweep(1200, 300, .55, 1.4) * np.hanning(int(.55 * SR)) ** .5, t0, .1)
    elif k == 'clank':
        t = tt(1.4)
        s = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, d in [(523, .5), (1310, .3), (2470, .2), (3820, .12)])
        add(s / 3, t0, .35)
        add(thud(120, 60, .5, .3, .08), t0, .5)
    elif k == 'bar':
        add(sweep(300 + e['i'] * 80, 700 + e['i'] * 120, .5, .8) * np.hanning(int(.5 * SR)), t0, .07, -.2 + .2 * e['i'])
    elif k == 'eyes':
        for j in range(2):
            add(np.sin(2 * np.pi * 180 * tt(.12)) * np.hanning(int(.12 * SR)), t0 + j * .12, .25)
    elif k == 'alert':
        add(bell(note(4, 6), 1.2, .35) + bell(note(7, 6), 1.2, .35), t0, .14)
        add(thud(200, 120, .2, .2, .04), t0, .3)
    elif k == 'place':
        add(bell(note(e['k'] + 1, 6), 1.0, .3), t0, .14, -.4)
    elif k == 'balance':
        for j, d in enumerate((0, 2, 4, 5)):
            add(bell(note(d, 6), 1.8, .7), t0 + j * .05, .08)
    elif k == 'sprout':
        for j, d in enumerate((0, 1, 2, 3, 4, 5, 7)):
            add(bell(note(d, 6), .9, .25), t0 + j * .06, .08, -.4 + j * .1)
    elif k == 'leaf_fly':
        add(whoosh(.9, .5, 1500, 9000), t0, .25)
    elif k == 'leaf_on':
        add(bell(note(7, 6), 1.5, .5), t0, .15)
    elif k == 'set_down':
        add(thud(90, 50, .6, .4, .1), t0, .45)
        add(sosfiltfilt(butter(2, 900, 'low', fs=SR, output='sos'), rng.normal(0, 1, int(.3 * SR))) * np.exp(-tt(.3) / .06), t0, .2)
    elif k == 'step':
        add(thud(140, 90, .15, .3, .03), t0, .18, .2)
    elif k == 'riser':
        d = e.get('dur', 1.6)
        t = tt(d)
        s = bandnoise(d, 800, 9000) * (t / d) ** 2.5 + .3 * sweep(200, 900, d, .7) * (t / d) ** 2
        add(s, t0, .22)
    elif k == 'unlock':
        add(np.sin(2 * np.pi * 2600 * tt(.05)) * np.exp(-tt(.05) / .008), t0, .35)
        add(thud(300, 180, .12, .5, .02), t0 + .03, .35)
        for j, d in enumerate((0, 2, 4)):
            add(bell(note(d + 2, 6), 1.4, .45), t0 + .08 + j * .07, .12, -.3 + .3 * j)
    elif k == 'alarm':
        for j in range(3):
            add(np.sin(2 * np.pi * 1320 * tt(.14)) * np.hanning(int(.14 * SR)), t0 + j * .3, .12)
            add(np.sin(2 * np.pi * 1760 * tt(.14)) * np.hanning(int(.14 * SR)), t0 + j * .3 + .15, .1)
    elif k == 'smudge':
        add(sosfiltfilt(butter(2, 400, 'low', fs=SR, output='sos'), rng.normal(0, 1, int(.4 * SR))) * np.exp(-tt(.4) / .08), t0, .5)
        add(sweep(220, 140, .3, 1) * np.exp(-tt(.3) / .1), t0, .12)
    elif k == 'door_open':
        t = tt(1.6)
        creak = np.sin(2 * np.pi * np.cumsum(140 + 40 * np.sin(2 * np.pi * 3 * t) + 60 * t) / SR) * np.hanning(len(t))
        add(sosfiltfilt(butter(2, [300, 2500], 'band', fs=SR, output='sos'), creak), t0, .12)
        for j, d in enumerate((0, 2, 4, 7, 9)):
            add(bell(note(d, 5), 3.5, 1.6), t0 + .4 + j * .09, .1)
        add(thud(70, 40, 2.4, .1, .9), t0 + .4, .35)
    elif k == 'end_hit':
        add(thud(80, 35, 2.5, .3, .8), t0, .5)
        for j, d in enumerate((0, 2, 4, 7)):
            add(bell(note(d, 5), 3.0, 1.4), t0 + .02 * j, .09)

# reverb sederhana untuk SFX saja
ir_n = int(1.6 * SR)
ir_t = np.arange(ir_n) / SR
wet = np.zeros_like(sfx)
L = N + ir_n
nfft = 1 << (L - 1).bit_length()
for c in range(2):
    ir = rng.normal(0, 1, ir_n) * np.exp(-ir_t * 3.2)
    ir[: int(.012 * SR)] = 0  # pre-delay
    ir /= np.sqrt(np.sum(ir ** 2))
    wet[:, c] = np.fft.irfft(np.fft.rfft(sfx[:, c], nfft) * np.fft.rfft(ir, nfft), nfft)[:N]
sfx = sfx * .85 + wet * .35

mix = music * (.55 if vo is not None else .8) + sfx * (.8 if vo is not None else 1)
if vo is not None:
    mix += vo * 1.0
fade = np.ones(N)
fade[: int(.4 * SR)] = np.linspace(0, 1, int(.4 * SR))
fade[-int(2.5 * SR):] = np.linspace(1, 0, int(2.5 * SR)) ** 1.5
mix *= fade[:, None]
mix /= np.max(np.abs(mix)) / .95

with wave.open(out_path, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
