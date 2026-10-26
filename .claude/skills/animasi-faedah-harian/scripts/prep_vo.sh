#!/usr/bin/env bash
# Percepat VO (default 1.2x) tanpa mengubah nada suara Vonya (atempo menjaga pitch).
#   prep_vo.sh vo_asli.ogg vo_1.2x.wav [kecepatan]
# Semua tahap berikutnya (transkripsi, kerangka episode, render) memakai file hasil ini.
set -euo pipefail
IN="$1"; OUT="$2"; SPEED="${3:-1.2}"
ffmpeg -v error -y -i "$IN" -af "atempo=$SPEED" -ar 48000 -ac 1 "$OUT"
echo "VO ${SPEED}x: $OUT ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT") detik)"
