"""Amplop suara VO per 1/30 detik (0..1) untuk gerak mulut narator: python3 -I vo_env.py vo.mp3 out/vo_env.js"""
import json, sys
import librosa, numpy as np
y, sr = librosa.load(sys.argv[1], sr=22050)
hop = sr // 30
db = 20 * np.log10(librosa.feature.rms(y=y, frame_length=hop * 2, hop_length=hop)[0] + 1e-6)
lo, hi = np.percentile(db, 20), np.percentile(db, 97)
env = np.clip((db - lo) / (hi - lo), 0, 1)
open(sys.argv[2], 'w').write('// Amplop suara VO per 1/30 detik (0..1), untuk gerak mulut narator.\nconst VO_ENV = '
                             + json.dumps([round(float(v), 2) for v in env]) + ';\n')
print(f'{len(env)} frame, durasi {len(y) / sr:.2f} detik')
