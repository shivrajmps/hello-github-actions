#!/usr/bin/env python3
"""Build compositions/captions.html from a word list.
Usage: captions.py words.json out.html total_duration
words.json: [{"text","start","end"}] (clean, in order). Groups 3-5 words, breaks on
sentence end / pause >= .35s / limit; one group visible at a time; karaoke highlight."""
import json, sys, html
words = json.load(open(sys.argv[1])); out = sys.argv[2]; total = float(sys.argv[3])
MAXW = 5
groups = []; cur = []
def flush():
    global cur
    if cur: groups.append(cur); cur = []
for i, w in enumerate(words):
    cur.append(w)
    nxt = words[i + 1] if i + 1 < len(words) else None
    end_sentence = w["text"].rstrip().endswith(("।", ".", "?", "!", ","))
    pause = nxt is not None and nxt["start"] - w["end"] >= 0.35
    if len(cur) >= MAXW or end_sentence or pause or nxt is None: flush()
# a group opens 0.08s before its first word and closes at its last word's end (+ small tail capped by next group)
items = []
for gi, g in enumerate(groups):
    s = max(0.15, g[0]["start"] - 0.08); e = g[-1]["end"] + 0.18
    if gi + 1 < len(groups): e = min(e, max(groups[gi + 1][0]["start"] - 0.06, g[-1]["end"]))
    e = min(e, total - 0.05)
    if e <= s: continue
    items.append((gi, s, e, g))
parts = []
for gi, s, e, g in items:
    spans = "".join(f'<span class="cw" id="cap-g{gi}-w{j}"><span class="cw-bg"></span><span class="cw-t">{html.escape(w["text"])}</span></span>' for j, w in enumerate(g))
    parts.append(f'<div class="cap-group clip" id="cap-g{gi}" data-start="{s:.3f}" data-duration="{e - s:.3f}" data-track-index="0"><div class="cap-inner" id="cap-g{gi}-in">{spans}</div></div>')
tl = []
for gi, s, e, g in items:
    tl.append(f'tl.fromTo("#cap-g{gi}-in",{{opacity:0,y:14}},{{opacity:1,y:0,duration:0.16,ease:"power3.out"}},{s:.3f});')
    for j, w in enumerate(g):
        ws = max(s, w["start"]); we = max(ws + 0.08, min(e, w["end"]))
        tl.append(f'tl.fromTo("#cap-g{gi}-w{j} .cw-bg",{{scaleX:0}},{{scaleX:1,duration:0.12,ease:"power2.out"}},{ws:.3f});')
        tl.append(f'tl.to("#cap-g{gi}-w{j} .cw-t",{{color:"#1c1b18",scale:1.06,duration:0.1,ease:"power2.out"}},{ws:.3f});')
        tl.append(f'tl.to("#cap-g{gi}-w{j} .cw-t",{{scale:1,duration:0.12,ease:"power2.inOut"}},{ws + 0.1:.3f});')
    tl.append(f'tl.to("#cap-g{gi}-in",{{opacity:0,duration:0.1,ease:"power2.in"}},{e - 0.1:.3f});')
    tl.append(f'tl.set("#cap-g{gi}-in",{{opacity:0,visibility:"hidden"}},{e:.3f});')
doc = f'''<template>
  <style>
    @font-face {{ font-family: "Baloo 2"; src: url("assets/fonts/baloo-2-devanagari-700-normal.woff2") format("woff2"); font-weight: 700; unicode-range: U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FF; }}
    @font-face {{ font-family: "Baloo 2"; src: url("assets/fonts/baloo-2-latin-700-normal.woff2") format("woff2"); font-weight: 700; unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }}
    #root {{ position: absolute; inset: 0; pointer-events: none; }}
    .cap-group {{ position: absolute; left: 0; right: 0; bottom: 96px; height: 120px; overflow: visible; }}
    .cap-inner {{ position: absolute; left: 160px; right: 160px; top: 0; display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-end; gap: 0 10px; font-family: "Baloo 2", sans-serif; font-weight: 700; font-size: 58px; line-height: 1.15; color: #3a3833; }}
    .cw {{ position: relative; display: inline-block; padding: 2px 10px 4px; }}
    .cw-bg {{ position: absolute; left: 0; right: 0; top: 14%; bottom: 10%; background: #ffd84a; border-radius: 6px 10px 7px 11px; transform-origin: 0 50%; z-index: 0; }}
    .cw-t {{ position: relative; z-index: 1; display: inline-block; }}
  </style>
  <div id="root" data-composition-id="captions" data-width="1920" data-height="1080">
    {"".join(parts)}
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
      {"".join(tl)}
      window.__timelines["captions"] = tl;
    }})();
  </script>
</template>
'''
open(out, "w").write(doc)
print(f"groups={len(items)} words={len(words)} -> {out}", file=sys.stderr)
