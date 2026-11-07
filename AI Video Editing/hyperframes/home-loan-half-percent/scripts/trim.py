#!/usr/bin/env python3
"""Dead-air trim. Usage: trim.py transcript.json in.wav out.wav out-transcript.json
Collapses gaps between speech windows longer than GAP to KEEP seconds, trims lead to LEAD, tail to TAIL.
Remaps segment and word times. Writes cuts.json alongside."""
import json, sys, subprocess, os
tr, wav_in, wav_out, tr_out = sys.argv[1:5]
GAP, KEEP, LEAD, TAIL = 1.3, 0.55, 0.45, 1.2
d = json.load(open(tr)); segs = d["segments"]
dur = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",wav_in]).decode())
# keep intervals
keeps = []; prev_end = 0.0
first = segs[0]["start"]; keeps_start = max(0.0, first - LEAD)
cur = [keeps_start, None]
for i, s in enumerate(segs):
    if i > 0:
        gap = s["start"] - segs[i-1]["end"]
        if gap > GAP:
            cur[1] = segs[i-1]["end"] + KEEP/2; keeps.append(cur); cur = [s["start"] - KEEP/2, None]
cur[1] = min(dur, segs[-1]["end"] + TAIL); keeps.append(cur)
# mapping old->new
def remap(t):
    acc = 0.0
    for a, b in keeps:
        if t < a: return acc
        if t <= b: return acc + (t - a)
        acc += b - a
    return acc
new_dur = sum(b - a for a, b in keeps)
for s in segs: s["start"], s["end"] = round(remap(s["start"]),3), round(remap(s["end"]),3)
for w in d["words"]: w["start"], w["end"] = round(remap(w["start"]),3), round(remap(w["end"]),3)
d["duration"] = round(new_dur, 3); d["cuts"] = keeps
json.dump(d, open(tr_out,"w"), ensure_ascii=False, indent=1)
json.dump(keeps, open(os.path.splitext(tr_out)[0] + "-cuts.json","w"))
# ffmpeg: concat the kept parts with 15ms crossfades avoided -> use aselect+asetpts (simple, tiny clicks avoided by 5ms fades per cut via afade is complex); use trim+concat
parts = "".join(f"[0:a]atrim=start={a:.3f}:end={b:.3f},asetpts=PTS-STARTPTS[p{i}];" for i,(a,b) in enumerate(keeps))
concat = "".join(f"[p{i}]" for i in range(len(keeps))) + f"concat=n={len(keeps)}:v=0:a=1[out]"
subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",wav_in,"-filter_complex",parts+concat,"-map","[out]",wav_out],check=True)
print(f"kept {len(keeps)} parts, {dur:.1f}s -> {new_dur:.1f}s (cut {dur-new_dur:.1f}s)")
