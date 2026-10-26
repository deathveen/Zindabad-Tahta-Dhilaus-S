"""Transkripsi VO (bahasa Indonesia, boleh campur Inggris) per frasa dengan waktunya.

Pakai Whisper medium versi sherpa-onnx yang di-hosting di GitHub Releases (bisa diunduh
dari container cloud yang memblokir Hugging Face). Model diunduh sekali ke --model-dir.

  python3 -I transcribe.py vo.mp3 out.json [--model-dir DIR] [--min 2.2] [--max 5.5]

Audio dipotong di titik paling hening antara --min dan --max detik, lalu tiap potongan
ditranskripsi. Hasil: [{"start", "end", "text"}, ...] + dicetak ke layar.
"""
import argparse, json, os, subprocess, sys, tarfile

ap = argparse.ArgumentParser()
ap.add_argument('audio'); ap.add_argument('out')
ap.add_argument('--model-dir', default=os.path.expanduser('~/.cache/faedah-asr'))
ap.add_argument('--min', type=float, default=2.2); ap.add_argument('--max', type=float, default=5.5)
ap.add_argument('--lang', default='id')
a = ap.parse_args()

try:
    import sherpa_onnx, librosa, numpy as np
except ImportError:
    subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'sherpa-onnx', 'librosa'], check=True)
    import sherpa_onnx, librosa, numpy as np

mdir = os.path.join(a.model_dir, 'sherpa-onnx-whisper-medium')
if not os.path.exists(os.path.join(mdir, 'medium-tokens.txt')):
    os.makedirs(a.model_dir, exist_ok=True)
    tar = os.path.join(a.model_dir, 'whisper-medium.tar.bz2')
    url = 'https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-medium.tar.bz2'
    print('Mengunduh model (~1,9 GB, sekali saja)...', flush=True)
    subprocess.run(['curl', '-sSL', '-o', tar, url], check=True)
    with tarfile.open(tar) as t: t.extractall(a.model_dir)
    os.remove(tar)

rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f'{mdir}/medium-encoder.int8.onnx', decoder=f'{mdir}/medium-decoder.int8.onnx',
    tokens=f'{mdir}/medium-tokens.txt', language=a.lang, task='transcribe', num_threads=os.cpu_count() or 4)
y, sr = librosa.load(a.audio, sr=16000, mono=True)
hop = 160; fps = sr / hop
rms = librosa.feature.rms(y=y, frame_length=640, hop_length=hop)[0]
sm = np.convolve(rms, np.ones(15) / 15, 'same'); N = len(sm)
cuts = [0]
while True:
    lo, hi = cuts[-1] + int(a.min * fps), cuts[-1] + int(a.max * fps)
    if lo >= N - int(1.5 * fps): break
    hi = min(hi, N - 1); cuts.append(lo + int(np.argmin(sm[lo:hi])))
cuts.append(N)
segs = []
for s0, s1 in zip(cuts[:-1], cuts[1:]):
    st = rec.create_stream(); st.accept_waveform(sr, y[s0 * hop:s1 * hop]); rec.decode_stream(st)
    seg = {'start': round(s0 / fps, 2), 'end': round(s1 / fps, 2), 'text': st.result.text.strip()}
    segs.append(seg); print(f"[{seg['start']:6.2f}-{seg['end']:6.2f}] {seg['text']}", flush=True)
json.dump(segs, open(a.out, 'w'), ensure_ascii=False, indent=1)
