"""mix.py <videoId> <audioDir> <videoMp4> <outMp4> : lay scene wavs on the video timeline, normalise to about -14 LUFS, mux, write SRT + EDL."""
import sys, json, os, subprocess, re
import numpy as np, soundfile as sf
vid, adir, vmp4, out = sys.argv[1:5]
tl = json.load(open(os.path.join(adir, 'timeline.json')))
vt = next(v for v in tl['videos'] if v['id'] == vid)
caps = json.load(open(os.path.join(adir, vid + '.caps.json')))
SR = tl['sr']; LEAD, GAP = 0.5, 0.55
duration = caps['duration']
buf = np.zeros(int(round(duration * SR)) + SR, dtype=np.float32)
t = LEAD; edl = []
for s in vt['scenes']:
    a, sr = sf.read(s['file'], dtype='float32'); assert sr == SR
    i0 = int(round(t * SR)); buf[i0:i0 + len(a)] += a
    edl.append((t, t + s['duration'], s['id'], s['text']))
    t += s['duration'] + GAP
buf = buf[:int(round(duration * SR))]
# gentle fade at the very end
fade = int(0.3 * SR); buf[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)
raw = os.path.join(adir, vid + '.mix.wav'); sf.write(raw, buf, SR)
# measure integrated loudness, apply a single gain towards -14 LUFS, keep true peak <= -1 dBTP
m = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', raw, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', m)[-1]); tp = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', m)[-1])
gain = -14.0 - I
# synthetic voice: one gain stage, then a transparent true-peak limiter with headroom so true peak stays under -1 dBTP (touches only the top ~0.1% of samples)
af = f'volume={gain:.2f}dB,alimiter=limit=0.66:attack=3:release=60:level=false'
wav = os.path.join(adir, vid + '.final.wav')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', af, wav], check=True)
m2 = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', wav, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
I2 = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', m2)[-1]); tp2 = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', m2)[-1])
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', vmp4, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', out], check=True)
# SRT
def ts(x):
    h = int(x // 3600); m_ = int(x % 3600 // 60); s = x % 60
    return f"{h:02d}:{m_:02d}:{s:06.3f}".replace('.', ',')
with open(out[:-4] + '.srt', 'w') as f:
    for i, c in enumerate(caps['caps'], 1):
        f.write(f"{i}\n{ts(c['start'])} --> {ts(c['end'])}\n{c['text']}\n\n")
with open(out[:-4] + '.edl.txt', 'w') as f:
    f.write(f"{vid}  total {duration:.2f}s\n")
    for a, b, sid, txt in edl: f.write(f"{a:7.2f} - {b:7.2f}  {sid}  {txt[:90]}\n")
print(f"{vid}: loudness {I:.1f} -> {I2:.1f} LUFS, true peak {tp2:.1f} dBTP, gain {gain:+.1f} dB, duration {duration:.1f}s")
