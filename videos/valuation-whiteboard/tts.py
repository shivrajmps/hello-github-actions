import sys, json, re, os, time
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
scripts, model, voices, outdir, voice = sys.argv[1:6]
speed = float(sys.argv[6]) if len(sys.argv) > 6 else 1.0
only = sys.argv[7] if len(sys.argv) > 7 else None
os.makedirs(outdir, exist_ok=True)
k = Kokoro(model, voices)
SR = 24000
GAP = 0.35   # seconds between sentences
def sentences(t):
    parts = re.split(r'(?<=[.!?])\s+', t.strip())
    return [p for p in parts if p]
d = json.load(open(scripts))
timeline = {"sr": SR, "videos": []}
t0 = time.time()
for v in d['videos']:
    if only and v['id'] != only: continue
    vt = {"id": v['id'], "scenes": []}
    for s in v['scenes']:
        chunks = []; cues = []; cur = 0.0
        for sent in sentences(s['text']):
            audio, sr = k.create(sent, voice=voice, speed=speed, lang="en-gb" if voice.startswith('b') else "en-us")
            assert sr == SR
            # trim leading/trailing silence below -45 dB
            a = np.asarray(audio, dtype=np.float32)
            thr = 10 ** (-45 / 20)
            idx = np.where(np.abs(a) > thr)[0]
            if len(idx): a = a[max(0, idx[0] - int(0.05*SR)): min(len(a), idx[-1] + int(0.12*SR))]
            dur = len(a) / SR
            cues.append({"text": sent, "start": round(cur, 3), "end": round(cur + dur, 3)})
            chunks.append(a); chunks.append(np.zeros(int(GAP*SR), dtype=np.float32))
            cur += dur + GAP
        out = np.concatenate(chunks)
        fn = os.path.join(outdir, f"{v['id']}_{s['id']}.wav")
        sf.write(fn, out, SR)
        vt['scenes'].append({"id": s['id'], "file": fn, "duration": round(len(out)/SR, 3), "cues": cues, "text": s['text']})
        print(v['id'], s['id'], f"{len(out)/SR:.1f}s", f"[{time.time()-t0:.0f}s]", flush=True)
    timeline['videos'].append(vt)
json.dump(timeline, open(os.path.join(outdir, "timeline.json"), "w"), indent=1)
print("DONE")
