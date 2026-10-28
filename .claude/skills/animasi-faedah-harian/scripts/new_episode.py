"""Buat kerangka episode baru di video/<slug>/ dari VO (dan transkrip bila ada).

  python3 -I new_episode.py <repo>/video <slug> vo.mp3 --judul "3 Kunci" [--kecil "CUMA BUTUH"] [--transkrip t.json]

Hasil: render.html (kerangka pola ep05: hook, kaidah, kartu follow + CAPTIONS dari transkrip), vo_env.js, cover.js.
VO tidak disalin ke repo; simpan path-nya untuk tahap audio.
"""
import argparse, json, os, shutil, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument('video_dir'); ap.add_argument('slug'); ap.add_argument('vo')
ap.add_argument('--judul', required=True); ap.add_argument('--kecil', default='FAEDAH HARIAN')
ap.add_argument('--transkrip')
a = ap.parse_args()
here = os.path.dirname(os.path.abspath(__file__))
ep = os.path.join(a.video_dir, a.slug)
if os.path.exists(os.path.join(ep, 'render.html')):
    sys.exit(f'{ep}/render.html sudah ada; pilih slug lain.')
os.makedirs(ep, exist_ok=True)
subprocess.run([sys.executable, '-I', os.path.join(here, 'vo_env.py'), a.vo, os.path.join(ep, 'vo_env.js')], check=True)
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.vo],
                           capture_output=True, text=True, check=True).stdout)
caps = []
if a.transkrip:
    for s in json.load(open(a.transkrip)):
        if s['text'].strip(): caps.append([s['start'], s['end'], s['text']])
else:
    caps = [[0.2, min(3.0, dur), 'TODO: isi caption dari naskah']]
# VO_END = mulai kalimat ajakan follow (kartu follow tampil saat Vonya mengucapkannya)
fol = next((c for c in caps if 'follow' in c[2].lower()), None)
vo_end = fol[0] if fol else dur
if fol and fol[1] - fol[0] > 5:
    # potongan panjang: ajakan follow biasanya kalimat terakhir → pakai jeda (>= 0,25 dtk) terakhir
    # yang berakhir paling lambat 2 detik sebelum ujung potongan (ep06: 51,65 → 57,0)
    import numpy as np, soundfile as sf
    y, sr = sf.read(a.vo, always_2d=True); y = y.mean(1); w = int(sr * .02); n = len(y) // w
    db = 20 * np.log10(np.sqrt((y[:n * w].reshape(n, w) ** 2).mean(1)) + 1e-9); q = db < (np.percentile(db, 90) - 26)
    gaps, i = [], 0
    while i < n:
        if q[i]:
            j = i
            while j < n and q[j]: j += 1
            if (j - i) * .02 >= .25 and fol[0] < j * .02 <= fol[1] - 2: gaps.append(j * .02)
            i = j
        else: i += 1
    if gaps: vo_end = round(gaps[-1] - .15, 2)
caps = [c for c in caps if c[0] < vo_end]
cap_js = '[\n' + ''.join(f'  [{s:.2f}, {e:.2f}, {json.dumps(t, ensure_ascii=False)}],\n' for s, e, t in caps) + ']'
html = open(os.path.join(here, '..', 'assets', 'template.html')).read()
hook_end = next((c[1] for c in caps if c[1] >= 9), min(12.0, vo_end / 3))
for k, v in {'__JUDUL__': a.judul, '__JUDUL_BESAR__': a.judul.upper(), '__JUDUL_KECIL__': a.kecil.upper(),
             '__VO_END__': f'{vo_end:.2f}', '__DURATION__': f'{dur + 1.8:.2f}', '__CAPTIONS__': cap_js,
             '__HOOK_END__': f'{hook_end:.2f}', '__HOOK_KLAIM__': f'{max(1.5, hook_end - 2.5):.2f}'}.items():
    html = html.replace(k, v)
open(os.path.join(ep, 'render.html'), 'w').write(html)
shutil.copy(os.path.join(a.video_dir, 'ep05', 'cover.js'), os.path.join(ep, 'cover.js'))
print(f'Episode dibuat: {ep} (VO {dur:.2f} detik, {len(caps)} caption, VO_END {vo_end:.2f}, HOOK_END {hook_end:.2f})')
print('Cek VO_END dan HOOK_END di render.html; patokan jeda: scripts/jeda.py')
