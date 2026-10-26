#!/usr/bin/env bash
# Render final satu episode: SFX → mix audio → render frame → gabung → contact sheet.
#   finalize.sh <repo>/video <slug> vo.mp3 <out.mp4> [musik.mp3|pad]
set -euo pipefail
VID="$1"; SLUG="$2"; VO="$3"; OUT="$4"; MUSIK="${5:-pad}"
WORK="$(mktemp -d)"
cd "$VID"
node dump_events.js "$SLUG/render.html" "$WORK/events.json"
python3 -I audio.py "$WORK/events.json" "$MUSIK" "$WORK/mix.wav" "$VO"
RENDER_HTML="$SLUG/render.html" node render.js "$WORK/video.mp4" 4
ffmpeg -v error -y -i "$WORK/video.mp4" -i "$WORK/mix.wav" -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 44100 -shortest -movflags +faststart "$OUT"
node "$SLUG/cover.js" "$SLUG/cover.png"
ffmpeg -v error -y -i "$OUT" -vf "fps=1/6,scale=144:-1,tile=8x2" -frames:v 1 "${OUT%.mp4}-sheet.jpg"
ffprobe -v error -show_entries format=duration,size -of compact "$OUT"
ffmpeg -v info -i "$OUT" -af ebur128=peak=true:framelog=quiet -f null - 2>&1 | grep -E '^\s+(I|Peak):' || true
rm -rf "$WORK"
