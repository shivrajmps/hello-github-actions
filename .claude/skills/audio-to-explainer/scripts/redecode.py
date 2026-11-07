#!/usr/bin/env python3
"""Re-decode given ranges in finer sub-windows (split at VAD-detected pauses, max 6s)."""
import sys, json, numpy as np, soundfile as sf, sherpa_onnx
wav, mdir, vad_path, out = sys.argv[1:5]
ranges = [tuple(map(float, r.split("-"))) for r in sys.argv[5:]]
audio, sr = sf.read(wav, dtype="float32")
vc = sherpa_onnx.VadModelConfig(); vc.silero_vad.model = vad_path; vc.silero_vad.threshold = 0.5
vc.silero_vad.min_silence_duration = 0.2; vc.silero_vad.min_speech_duration = 0.2; vc.silero_vad.max_speech_duration = 6; vc.sample_rate = sr
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{mdir}/turbo-encoder.int8.onnx", decoder=f"{mdir}/turbo-decoder.int8.onnx", tokens=f"{mdir}/turbo-tokens.txt", language="hi", task="transcribe", num_threads=4, tail_paddings=1200)
res = []
for a, b in ranges:
    seg = audio[int(a*sr):int(b*sr)]
    vad = sherpa_onnx.VoiceActivityDetector(vc, buffer_size_in_seconds=30); win = vc.silero_vad.window_size; subs = []; i = 0
    while i + win <= len(seg):
        vad.accept_waveform(seg[i:i+win]); i += win
        while not vad.empty(): s = vad.front; subs.append((a + s.start/sr, a + (s.start+len(s.samples))/sr)); vad.pop()
    vad.flush()
    while not vad.empty(): s = vad.front; subs.append((a + s.start/sr, a + (s.start+len(s.samples))/sr)); vad.pop()
    if not subs: subs = [(a, b)]
    for (x, y) in subs:
        x0 = max(0, x-0.2); y0 = min(len(audio)/sr, y+0.3)
        st = rec.create_stream(); st.accept_waveform(sr, audio[int(x0*sr):int(y0*sr)]); rec.decode_stream(st)
        res.append({"start": round(x0,2), "end": round(y0,2), "text": st.result.text.strip()}); print(f"{x0:7.2f}-{y0:6.2f} {st.result.text.strip()}", file=sys.stderr)
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
