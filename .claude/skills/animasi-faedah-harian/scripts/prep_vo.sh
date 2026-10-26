#!/usr/bin/env bash
# Jernihkan lalu percepat VO (default 1.2x) tanpa mengubah nada suara Vonya.
#   prep_vo.sh vo_asli.ogg vo.wav [kecepatan] [--mentah]
# Penjernih: perbaiki clipping, buang dengung rendah, kurangi desis, redam "s" tajam,
# perjelas (presence), ratakan volume, dan heningkan jeda. --mentah = hanya ubah kecepatan.
# Semua tahap berikutnya (transkripsi, kerangka episode, render) memakai file hasil ini.
set -euo pipefail
IN="$1"; OUT="$2"; SPEED="${3:-1.2}"; MODE="${4:-}"
JERNIH="aresample=48000,adeclip,highpass=f=90,afftdn=nr=18:nf=-45:tn=1,adeclick,\
equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=3,deesser=i=0.4:m=0.5:f=0.5,\
acompressor=threshold=-18dB:ratio=2.5:attack=8:release=150:makeup=1,\
agate=threshold=0.008:ratio=2:range=0.25:attack=5:release=200,alimiter=limit=0.89:level=false,"
[ "$MODE" = "--mentah" ] && JERNIH="aresample=48000,"
ffmpeg -v error -y -i "$IN" -af "${JERNIH}atempo=$SPEED" -ac 1 "$OUT"
echo "VO ${SPEED}x: $OUT ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT") detik)"
