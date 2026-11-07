#!/usr/bin/env bash
# Denoise + loudness-normalise a voice recording. Usage: clean_audio.sh in.m4a outdir
set -e; IN="$1"; OUT="$2"; mkdir -p "$OUT"
ffmpeg -hide_banner -y -i "$IN" -af "highpass=f=80,lowpass=f=12000,afftdn=nr=14:nf=-38:tn=1,loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/{/,/}/p' > "$OUT/ln.json"
read I TP LRA TH OFF < <(python3 -c "import json;d=json.load(open('$OUT/ln.json'));print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
ffmpeg -hide_banner -y -i "$IN" -af "highpass=f=80,lowpass=f=12000,afftdn=nr=14:nf=-38:tn=1,adeclick,loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$I:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:offset=$OFF:linear=true" -ar 48000 -ac 1 "$OUT/clean.wav"
ffmpeg -hide_banner -y -i "$OUT/clean.wav" -ar 16000 -ac 1 "$OUT/clean16k.wav"
ffmpeg -hide_banner -y -i "$OUT/clean.wav" -b:a 128k "$OUT/clean.mp3"
echo "wrote $OUT/clean.wav (48k, for the project), clean16k.wav (for Whisper), clean.mp3 (to send)"
