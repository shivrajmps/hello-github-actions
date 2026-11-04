# QC report — Valuation whiteboard series

## What was verified (from the rendered files, not the source)
- **Frames on both sides of every scene cut** (3 per cut: 0.25 s after the clear, 0.2 s before the next, plus first/last frame) inspected for all five videos. First pass found a 0.4 s overlap where the next title began writing while the old board was still fading; clears were moved 0.5 s earlier into the inter-scene gap and everything re-rendered. Second pass: no overlaps, no stray strokes, no black frames.
- **Every sentence boundary** (164 stills) inspected before the render: text inside its highlight, nothing covering the stick figure, nothing under the caption band. Four layout fixes applied (shop price tags, P/B highlight width, tick spacing, Company B ring).
- **Arithmetic shown on screen** checked in code and on the board: 1,000 − 820 − 30 − 50 = 100; 100 ÷ 10 = 10; 200 ÷ 10 = 20; 500 − 300 = 200; 200 ÷ 10 = 20; 40 ÷ 20 = 2; 1,000 + 400 − 100 = 1,300; 150 + 50 = 200; 1,300 ÷ 200 = 6.5; 1 ÷ 20 = 5 %.
- **Captions**: generated from the narration script itself (not a transcript), one or two lines per sentence, 23–35 cues per video, no overlaps, longest line 71 characters. Timing comes from the per-sentence synthesis, so every cue starts exactly when its sentence starts.
- **Sync**: every on-screen element is keyed to the start time of the sentence that mentions it (per-sentence TTS gives exact starts); nothing is drawn before it is explained.
- **Audio**: 24 kHz mono voice, no music, no SFX. Integrated loudness about -15.3 LUFS, true peak ≤ -1.2 dBTP on all five (measured with ffmpeg ebur128 after the mix).
- **Container**: H.264 1920×1080 30 fps CRF 17, AAC 192 kbps, durations 61 / 84 / 92 / 98 / 96 s.

## Deviations you should know about
- **Voice is Kokoro "af_heart" (American English female), not the Indian-English male narrator planned.** ElevenLabs refused every generation: "Your subscription has a failed or incomplete payment." Nothing was charged. Fix the ElevenLabs invoice and re-run `tts.py` with the "Manish" voice, or switch Kokoro voice with one argument (`am_michael`, `bm_george`).
- **Loudness**: Kokoro's output has a 20 dB crest factor, so -14 LUFS was not reachable with gain alone. A transparent true-peak limiter (ffmpeg alimiter, touches only the loudest ~0.1 % of samples) was added after one gain stage. Result is -15.3 LUFS rather than -14. Platforms will normalise; if you want it hotter, raise the target in `mix.py`.
- **No music or SFX**: no licensed library was available. Add trending audio in-app.
- **Tooling**: built with a direct Playwright + ffmpeg pipeline rather than the Remotion-based Creator Editing OS studio, because the studio's 15-minute install buys nothing for a from-scratch SVG whiteboard and the frame-accurate principle (render(t) per frame) is the same.

## What you must still check at real speed
- Listen through once: the TTS pronunciation of "crore", "lakh", "EBITDA" and "P/E" and the pacing of long numbers.
- Watch on a phone: caption size (40 px Kalam at 1080p) and the small header labels.
