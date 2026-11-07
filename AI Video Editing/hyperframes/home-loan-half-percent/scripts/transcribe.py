#!/usr/bin/env python3
"""Local transcription: Silero VAD -> merged speech segments -> sherpa-onnx Whisper.
Usage: transcribe.py <wav 16k mono> <model_dir> <vad.onnx> <out.json> [language]
Writes segments [{start,end,text}] plus approximate per-word timings."""
import sys, json, re, time
import numpy as np, soundfile as sf, sherpa_onnx

wav, mdir, vad_path, out, *rest = sys.argv[1:]
lang = rest[0] if rest else ""
import os
PFX = os.environ.get("WHISPER_PFX", "small")
MAXWIN = float(os.environ.get("MAXWIN", "22"))
audio, sr = sf.read(wav, dtype="float32")
if audio.ndim > 1: audio = audio.mean(axis=1)
assert sr == 16000, sr

# --- VAD ---
vc = sherpa_onnx.VadModelConfig()
vc.silero_vad.model = vad_path
vc.silero_vad.threshold = 0.5
vc.silero_vad.min_silence_duration = 0.35
vc.silero_vad.min_speech_duration = 0.25
vc.silero_vad.max_speech_duration = MAXWIN
vc.sample_rate = sr
vad = sherpa_onnx.VoiceActivityDetector(vc, buffer_size_in_seconds=60)
win = vc.silero_vad.window_size
segs = []
i = 0
while i + win <= len(audio):
    vad.accept_waveform(audio[i:i+win]); i += win
    while not vad.empty():
        s = vad.front; segs.append((s.start / sr, (s.start + len(s.samples)) / sr)); vad.pop()
vad.flush()
while not vad.empty():
    s = vad.front; segs.append((s.start / sr, (s.start + len(s.samples)) / sr)); vad.pop()
print(f"vad segments: {len(segs)}", file=sys.stderr)

# merge into <=22 s windows with gaps < 0.8 s
merged = []
for a, b in segs:
    if merged and a - merged[-1][1] < 0.8 and b - merged[-1][0] <= MAXWIN:
        merged[-1][1] = b
    else:
        merged.append([a, b])
print(f"merged windows: {len(merged)}", file=sys.stderr)

# --- Whisper ---
rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f"{mdir}/{PFX}-encoder.int8.onnx", decoder=f"{mdir}/{PFX}-decoder.int8.onnx",
    tokens=f"{mdir}/{PFX}-tokens.txt", language=lang, task="transcribe", num_threads=4, tail_paddings=800)
results = []
t0 = time.time()
for k, (a, b) in enumerate(merged):
    pad0 = max(0.0, a - 0.15); pad1 = min(len(audio) / sr, b + 0.25)
    chunk = audio[int(pad0 * sr):int(pad1 * sr)]
    st = rec.create_stream(); st.accept_waveform(sr, chunk); rec.decode_stream(st)
    text = st.result.text.strip()
    results.append({"start": round(pad0, 3), "end": round(pad1, 3), "text": text, "lang": getattr(st.result, "lang", "")})
    print(f"[{k+1}/{len(merged)}] {pad0:7.2f}-{pad1:7.2f} {text[:80]}", file=sys.stderr)
print(f"decode time {time.time()-t0:.0f}s", file=sys.stderr)

# --- approximate words ---
words = []; wid = 0
for seg in results:
    toks = [t for t in re.split(r"\s+", seg["text"]) if t]
    if not toks: continue
    total = sum(len(t) + 1 for t in toks); cur = seg["start"]; span = seg["end"] - seg["start"]
    for t in toks:
        d = span * (len(t) + 1) / total
        words.append({"id": f"w{wid}", "text": t, "start": round(cur, 3), "end": round(cur + d, 3)}); wid += 1; cur += d
json.dump({"segments": results, "words": words}, open(out, "w"), ensure_ascii=False, indent=1)
print(f"wrote {out}: {len(results)} segments, {len(words)} words", file=sys.stderr)
