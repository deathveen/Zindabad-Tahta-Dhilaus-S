#!/usr/bin/env bash
# Atur tempo VO supaya hasil akhirnya (setelah jeda dipotong) = target kata per menit (default 200).
#   tempo_wpm.sh vo_asli.ogg transkrip.json vo.wav [wpm=200]
# transkrip.json = hasil transcribe.py (dari VO kecepatan berapa pun; jumlah kata tidak berubah).
# Mencari kecepatan atempo dengan beberapa kali prep_vo.sh (interpolasi), toleransi ±0,4 dtk.
set -euo pipefail
IN="$1"; TR="$2"; OUT="$3"; WPM="${4:-200}"
HERE="$(cd "$(dirname "$0")" && pwd)"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
N=$(python3 -I -c "import json,sys;print(sum(len(x['text'].split()) for x in json.load(open(sys.argv[1]))))" "$TR")
TARGET=$(python3 -I -c "print($N/$WPM*60)")
echo "Jumlah kata: $N -> target durasi ${TARGET} dtk (${WPM} kata/menit)"
dur() { "$HERE/prep_vo.sh" "$IN" "$TMP/v.wav" "$1" >/dev/null; ffprobe -v error -show_entries format=duration -of csv=p=0 "$TMP/v.wav"; }
S1=1.25; D1=$(dur $S1); S2=1.6; D2=$(dur $S2)
for i in 1 2 3 4; do
  S=$(python3 -I -c "s1,d1,s2,d2,t=$S1,$D1,$S2,$D2,$TARGET;s=s2+(t-d2)*(s2-s1)/(d2-d1) if d2!=d1 else s2;print(round(min(max(s,0.5),2.5),3))")
  D=$(dur $S); echo "  coba ${S}x -> ${D} dtk"
  S1=$S2; D1=$D2; S2=$S; D2=$D
  python3 -I -c "import sys;sys.exit(0 if abs($D-$TARGET)<0.4 else 1)" && break
done
cp "$TMP/v.wav" "$OUT"
echo "VO ${S2}x: $OUT (${D2} dtk, $(python3 -I -c "print(round($N/$D2*60))") kata/menit)"
