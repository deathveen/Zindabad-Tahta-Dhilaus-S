#!/usr/bin/env bash
# Jernihkan lalu percepat VO (default 1.25x; aturan ep11+: pakai tempo_wpm.sh = 200 kata/menit)
# tanpa mengubah nada suara Vonya.
#   prep_vo.sh vo_asli.ogg vo.wav [kecepatan] [--mentah] [--utuh]
# Penjernih: perbaiki bagian pecah (declip.py), buang dengung rendah, kurangi desis,
# redam "s" tajam, perjelas (presence), ratakan volume, heningkan jeda, lalu redam letupan
# konsonan "kresek" (declick.py; setelah kompresor karena kompresor memperkuat letupan).
# Tempo diubah dengan rubberband (formant tetap, transien halus); atempo ffmpeg di 1,7x
# meninggalkan transien kasar yang terdengar kresek (ep11). Fallback ke atempo bila tak ada.
# Terakhir, jeda sunyi > 0,45 dtk dipendekkan jadi 0,28 dtk (potong_jeda.py).
# --mentah = tanpa penjernih; --utuh = jeda tidak dipotong. Semua tahap berikutnya memakai file hasil ini.
set -euo pipefail
IN="$1"; OUT="$2"; SPEED="${3:-1.25}"; MODE=" ${*:4} "
HERE="$(cd "$(dirname "$0")" && pwd)"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
if ffmpeg -hide_banner -filters 2>/dev/null | grep -c " rubberband " >/dev/null; then
  TEMPO="rubberband=tempo=$SPEED:transients=mixed:formant=preserved:pitchq=quality"
else TEMPO="atempo=$SPEED"; fi
if [[ "$MODE" == *" --mentah "* ]]; then
  ffmpeg -v error -y -i "$IN" -af "aresample=48000,$TEMPO" -ac 1 -c:a pcm_s16le "$TMP/cepat.wav"
else
  ffmpeg -v error -y -i "$IN" -ar 48000 -ac 1 -c:a pcm_f32le "$TMP/asli.wav"
  python3 -I "$HERE/declip.py" "$TMP/asli.wav" "$TMP/declip.wav"
  JERNIH="highpass=f=90,afftdn=nr=18:nf=-45:tn=1,adeclick,\
equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=3,deesser=i=0.4:m=0.5:f=0.5,\
acompressor=threshold=-18dB:ratio=2.5:attack=3:release=150:makeup=1,\
agate=threshold=0.008:ratio=2:range=0.25:attack=5:release=200,alimiter=limit=0.89:level=false"
  ffmpeg -v error -y -i "$TMP/declip.wav" -af "$JERNIH" -ac 1 -c:a pcm_f32le "$TMP/jernih.wav"
  python3 -I "$HERE/declick.py" "$TMP/jernih.wav" "$TMP/declick.wav"
  ffmpeg -v error -y -i "$TMP/declick.wav" -af "$TEMPO" -ac 1 -c:a pcm_s16le "$TMP/cepat.wav"
fi
if [[ "$MODE" == *" --utuh "* ]]; then cp "$TMP/cepat.wav" "$OUT"
else python3 -I "$HERE/potong_jeda.py" "$TMP/cepat.wav" "$OUT"; fi
echo "VO ${SPEED}x (${TEMPO%%=*}): $OUT ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT") detik)"
