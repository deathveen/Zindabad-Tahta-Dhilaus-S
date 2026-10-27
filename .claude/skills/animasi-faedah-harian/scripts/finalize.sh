#!/usr/bin/env bash
# Render final satu episode: SFX → mix audio → render frame → gabung → contact sheet.
#   finalize.sh <repo>/video <slug> vo.wav <out.mp4> [musik.mp3|pad]
# vo.wav = hasil prep_vo.sh (sudah jernih, 1.25x, jeda dipotong), jadi audio.py tidak menjernihkannya lagi.
# Kerasnya otomatis dikoreksi ke -14 LUFS (puncak < -1.5 dB) walau ada boom hook.
set -euo pipefail
VID="$1"; SLUG="$2"; VO="$3"; OUT="$4"; MUSIK="${5:-pad}"
WORK="$(mktemp -d)"
cd "$VID"
node dump_events.js "$SLUG/render.html" "$WORK/events.json"
VO_SIAP=1 python3 -I audio.py "$WORK/events.json" "$MUSIK" "$WORK/mix.wav" "$VO"
RENDER_HTML="$SLUG/render.html" node render.js "$WORK/video.mp4" 4
ffmpeg -v error -y -i "$WORK/video.mp4" -i "$WORK/mix.wav" -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 44100 -shortest -movflags +faststart "$OUT"
# koreksi keras: loudnorm sekali jalan sering kurang saat ada puncak boom hook → naikkan + limiter
I=$(ffmpeg -v info -i "$OUT" -af ebur128=framelog=quiet -f null - 2>&1 | awk '/^ +I:/{print $2}' | tail -1)
G=$(python3 -c "print(round(-14.0 - float('$I'), 2))")
if python3 -c "import sys; sys.exit(0 if abs($G) > .4 else 1)"; then
  ffmpeg -v error -y -i "$OUT" -c:v copy -af "aresample=176400,volume=${G}dB,alimiter=limit=0.8:attack=2:release=60:level=false,aresample=44100" \
    -c:a aac -b:a 192k -movflags +faststart "$WORK/fix.mp4" && mv "$WORK/fix.mp4" "$OUT"
  echo "keras dikoreksi ${G} dB (dari ${I} LUFS)"
fi
node "$SLUG/cover.js" "$SLUG/cover.png"
ffmpeg -v error -y -i "$OUT" -vf "fps=1/6,scale=144:-1,tile=8x2" -frames:v 1 "${OUT%.mp4}-sheet.jpg"
ffprobe -v error -show_entries format=duration,size -of compact "$OUT"
ffmpeg -v info -i "$OUT" -af ebur128=peak=true:framelog=quiet -f null - 2>&1 | grep -E '^\s+(I|Peak):' || true
rm -rf "$WORK"
