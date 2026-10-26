"""Buat kerangka episode baru di video/<slug>/ dari VO (dan transkrip bila ada).

  python3 -I new_episode.py <repo>/video <slug> vo.mp3 --judul "3 Kunci" [--kecil "CUMA BUTUH"] [--transkrip t.json]

Hasil: render.html (adegan contoh + CAPTIONS dari transkrip untuk dirapikan), vo_env.js, cover.js.
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
        caps.append([s['start'], s['end'], s['text']])
else:
    caps = [[0.2, min(3.0, dur), 'TODO: isi caption dari naskah']]
cap_js = '[\n' + ''.join(f'  [{s:.2f}, {e:.2f}, {json.dumps(t, ensure_ascii=False)}],\n' for s, e, t in caps) + ']'
html = open(os.path.join(here, '..', 'assets', 'template.html')).read()
for k, v in {'__JUDUL__': a.judul, '__JUDUL_BESAR__': a.judul.upper(), '__JUDUL_KECIL__': a.kecil.upper(),
             '__VO_END__': f'{dur:.2f}', '__CAPTIONS__': cap_js, '__CUT_ISI__': f'{min(5.0, dur / 3):.2f}'}.items():
    html = html.replace(k, v)
open(os.path.join(ep, 'render.html'), 'w').write(html)
shutil.copy(os.path.join(a.video_dir, 'ep02', 'cover.js'), os.path.join(ep, 'cover.js'))
print(f'Episode dibuat: {ep} (VO {dur:.2f} detik, {len(caps)} caption)')
