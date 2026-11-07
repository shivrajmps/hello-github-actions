#!/usr/bin/env python3
"""Assemble index.html and compositions/*.html from src/ templates + the cue table."""
import json, os, re, subprocess, sys
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(os.path.dirname(P))
shared = open(f"{P}/src/_shared.css").read()
TOTAL = 531.1
scenes = {
  "intro":  dict(start=0.0,    end=63.68,  cues=dict(line=10.85, aadha=11.3, home=16.5, personal=18.5, any=20.4, every=24.6, calc=39.8, promise=42.0), T_B2=16.0, T_B3=36.3),
  "board":  dict(start=63.68,  end=243.04, cues=dict(custA=0.3, custB=1.6, loan=7.8, rateA=15.6, rateB=18.8, n360=43.4, emiA=60.8, emiB=73.3, push=88.7, pushBack=93.8, total=94.6, totB=108.3, totA=123.8, gap=138.5, monthly=149.3, save=157.3), T_B2=94.53),
  "bank":   dict(start=243.04, end=361.20, cues=dict(priv=4.4, compare=10.1, principal=18.4, apply=31.0, floating=62.2, tenure=69.2, fixed=77.8, flex=94.3, tiny=106.5), T_B2=106.0),
  "prepay": dict(start=361.20, end=492.68, cues=dict(y30=5.3, plus10k=17.3, emi34=16.6, emi44=37.3, y15=44.3, int=48.8, alt=65.1, save=85.7), T_B2=64.8),
  "close":  dict(start=492.68, end=TOTAL,  cues=dict(insights=20.3, r1=8.8, r2=14.5, sign=32.8)),
}
os.makedirs(f"{P}/compositions", exist_ok=True)
hosts = []
for name, sc in scenes.items():
    D = sc["end"] - sc["start"]; tpl = open(f"{P}/src/{name}.html").read()
    b = [0.0] + [sc[k] for k in ("T_B2", "T_B3") if k in sc] + [D]
    rep = {"SHARED_CSS": shared, "CUES": json.dumps(sc["cues"])}
    for i in range(len(b) - 1):
        rep[f"T_B{i+1}"] = f"{b[i]:.3f}"; rep[f"D_B{i+1}"] = f"{b[i+1]-b[i]:.3f}"
    out = re.sub(r"\{\{(\w+)\}\}", lambda m: rep[m.group(1)], tpl)
    open(f"{P}/compositions/{name}.html", "w").write(out)
    hosts.append(f'    <div id="{name}" data-composition-id="{name}" data-composition-src="compositions/{name}.html" data-start="{sc["start"]:.3f}" data-duration="{D:.3f}" data-track-index="1" data-track-kind="graphics" data-width="1920" data-height="1080"></div>')
# captions
subprocess.run([sys.executable, f"{S}/tools/captions.py", f"{S}/audio/words-clean.json", f"{P}/compositions/captions.html", str(TOTAL)], check=True)
# sfx (absolute seconds)
DUR = {"chime": 2.5, "click-soft": 0.37, "click": 0.37, "error": 1.62, "glitch-1": 2.64, "glitch-2": 3.5, "glitch-3": 3.1, "impact-bass-1": 2.12, "impact-bass-2": 2.59, "key-press": 0.4, "notification": 2.46, "ping": 1.32, "pop": 0.72, "riser": 10.03, "sparkle": 1.8, "typing": 1.5, "whoosh-cinematic": 5.54, "whoosh-short": 0.57, "whoosh": 0.57}
sfx = [("whoosh-short", t) for t in (63.68, 243.04, 361.2, 492.68)] + \
      [("pop", t) for t in (107.1, 125.8, 138.3, 202.7, 378.5, 399.5)] + \
      [("sparkle", 221.0), ("sparkle", 406.7), ("riser", 444.6), ("impact-bass-1", 446.85)]
audio = [f'    <audio id="voice" class="clip" src="assets/voice.wav" data-start="0" data-duration="{TOTAL:.3f}" data-track-index="3" data-volume="1"></audio>']
for i, (n, t) in enumerate(sfx):
    audio.append(f'    <audio id="sfx{i}" class="clip" src="assets/sfx/{n}.mp3" data-start="{t:.3f}" data-duration="{DUR[n]:.2f}" data-track-index="{5 if n == "impact-bass-1" else 4}" data-volume="{0.5 if n.startswith("whoosh") else 0.6}"></audio>')
index = f'''<!doctype html>
<html lang="hi" data-composition-variables='[{{"id":"accent","type":"color","label":"Marker accent","default":"#FFD84A"}}]'>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="assets/vendor/gsap.min.js"></script>
    <script src="assets/hw-kit.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: 1920px; height: 1080px; overflow: hidden; background: #F7F4EC; }}
      #root {{ position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #F7F4EC; }}
      #paper {{ position: absolute; inset: 0; background-color: #F7F4EC; background-image: radial-gradient(#DDD7C9 1.6px, transparent 1.7px); background-size: 60px 60px; background-position: 30px 30px; }}
      #grain {{ position: absolute; inset: 0; width: 1920px; height: 1080px; opacity: 0.9; pointer-events: none; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL:.3f}" data-width="1920" data-height="1080">
      <div id="paper" data-layout-ignore></div>
      <img id="grain" src="assets/paper-grain.png" alt="" data-layout-ignore />
{chr(10).join(hosts)}
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{TOTAL:.3f}" data-track-index="2" data-track-kind="captions" data-width="1920" data-height="1080"></div>
{chr(10).join(audio)}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
'''
open(f"{P}/index.html", "w").write(index)
print("built", list(scenes), "total", TOTAL)
