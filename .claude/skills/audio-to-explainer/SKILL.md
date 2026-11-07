---
name: audio-to-explainer
description: >-
  Turn a voice recording (m4a/mp3/wav, Hindi or Hinglish) into a finished
  hand-drawn, whitish-paper explainer video with karaoke captions, drawn-on
  motion graphics, sound effects and a 1080p MP4, using HyperFrames. Use when
  Shivraj uploads a recording and asks for "the video", "same style as the
  home-loan video", "animated explainer", "hand-drawn", "add captions and
  effects", or "turn this audio into a video".
---

# audio-to-explainer

The pipeline that produced `AI Video Editing/hyperframes/home-loan-half-percent/` (the 0.5% home-loan episode). Every step below was run once and worked in a cloud session; the scripts in `scripts/` are the exact ones. Read `voice.md` (`.claude/youtube/voice.md`) and `/hyperframes` first; this skill is the order of operations, not a replacement for the HyperFrames contract.

Base directory of this skill: `.claude/skills/audio-to-explainer/`. `S` below is a scratch folder outside the repo; `P` is the HyperFrames project folder.

## 0. Before anything

- Output project goes to `AI Video Editing/hyperframes/<topic-slug>/` (CLAUDE.md rule). Never commit `assets/voice.wav`, `assets/sfx/`, `renders/`.
- Network in cloud sessions: youtube/facebook/instagram/huggingface/jsdelivr/googleapis are blocked; github.com releases, registry.npmjs.org and PyPI work. Sending the user's audio to ElevenLabs via the connector was denied by the permission layer. Plan for everything local.
- Tell the user up front: no music (no HeyGen sign-in), transcript is local Whisper plus a hand clean-up, every figure on screen must be one they say.

## 1. Audio (2 min)

```bash
scripts/clean_audio.sh <upload.m4a> $S/audio      # highpass 80, lowpass 12k, afftdn, declick, loudnorm -16 LUFS
```

Send `clean.mp3` to the user at the end alongside the MP4.

## 2. Transcribe (10–20 min of CPU)

```bash
scripts/get_models.sh $S/models                   # whisper large-v3-turbo (int8, ~700 MB) + silero VAD, into a venv
cd $S && WHISPER_PFX=turbo MAXWIN=12 ./models/venv/bin/python -I <skill>/scripts/transcribe.py \
   audio/clean16k.wav models/sherpa-onnx-whisper-turbo models/silero_vad.onnx audio/transcript.json hi
```

- 12 s windows: longer windows loop ("अप अप अप…"). Drop any leading noise blip (`start < 5 s` and one word).
- Garbled windows: `scripts/redecode.py <wav> <modeldir> <vad> out.json 39.5-44 200-210 …` re-decodes ranges in 6 s sub-windows.
- Then read every segment and write `clean-text.json` (`{"<orig start>": "clean text"}`): Devanagari, English finance words in Latin as spoken, `₹` and digits for numbers. Empty string for an unintelligible stretch. Never invent a clause; a window cut mid-word may be completed from the next window.
- Word times are proportional within each segment (±0.3 s). Say so in the delivery note.

## 3. Trim dead air

```bash
python3 scripts/trim.py audio/transcript-nolead.json audio/clean.wav audio/voice-trim.wav audio/transcript-trim.json
```

Collapses gaps > 1.3 s to 0.55 s, lead to 0.45 s, tail to 1.2 s; remaps every time. Then map `clean-text.json` onto the trimmed segments into `words-clean.json` (see the snippet in `scripts/captions.py` header; the home-loan project did it inline). Print `orig start → new start` for every segment: that table is how you pick cue times.

## 4. Story, spec, numbers (before any scene)

- `STORYLINES.md`: three storylines per `hyperframes/references/story.md`; build the recommendation (the user asked for the file, no stops), name the other two in the reply. `templates/STORYLINES.example.md` shows the shape.
- `SPEC.md` from `templates/SPEC.example.md`: keep the LOOK line unless the user asks for another look. Paper `#F7F4EC` + dotted grid + static grain PNG (`scripts/make_grain.py`), ink `#2B2924`, yellow `#FFD84A` only as karaoke band and one keyword, red `#D94A31` cost only, green `#2E8B4A` saving only, blue `#3D6FB4` one object. Kalam 700 labels, Baloo 2 700 captions/numbers (both ship Devanagari; fonts come from npm `@fontsource/kalam`, `@fontsource/baloo-2`).
- `scripts/finance.py`: recompute every rupee figure from the formula on the inputs the speaker states. Screen shows the speaker's figure; the exact one goes in REVIEW.md.

## 5. Project

```bash
npx hyperframes init $P --skip-skills --skill=hyperframes
cp templates/assets/hw-kit.js $P/assets/;  cp templates/src/* $P/src/;  cp scripts/build.py scripts/finance.py $P/scripts/
npm pack gsap@3.15.0 && tar xzf gsap-*.tgz && cp package/dist/gsap.min.js $P/assets/vendor/   # CDN is blocked at RENDER time even when check passes
cp .claude/skills/media-use/audio/assets/sfx/{whoosh-short,pop,sparkle,riser,impact-bass-1}.mp3 $P/assets/sfx/
cp $S/audio/voice-trim.wav $P/assets/voice.wav;  python3 scripts/make_grain.py $P/assets/paper-grain.png
```

- Fonts: `npm pack @fontsource/kalam @fontsource/baloo-2`, copy the `*-devanagari-{400,700}` and `*-latin-{400,700}` woff2 into `assets/fonts/`. `_shared.css` already declares them with unicode-ranges.
- `hw-kit.js` is loaded once from `index.html` and gives every scene: `hwBoil`, `hwWobbleEllipse`, `hwLine`, `hwRect`, `hwArrowPath`, `hwMarkPath`, `hwDrawOn`, `hwDrawAll`, `hwPop`, `hwWrite`, `hwCount`, `hwINR`. Paths are seeded; nothing uses Math.random.
- Scenes are `src/*.html` templates with `{{SHARED_CSS}}`, `{{CUES}}`, `{{T_Bn}}`/`{{D_Bn}}` placeholders; `scripts/build.py` holds the scene table (start/end absolute, cues scene-relative, beat boundaries), the SFX list (absolute seconds, with durations from the sfx manifest, impact on its own track), writes `index.html`, `compositions/*.html` and runs `captions.py`. Edit the table, never the generated files.
- One scene per topic ("one frame that rebuilds"), internal beats cued to words. Keep content above y=840: captions sit at bottom 96 px, 120 px tall.

## 6. Check, look, render

```bash
cd $P && python3 scripts/build.py && npx hyperframes check --json
npx hyperframes snapshot --review --json;  npx hyperframes snapshot --at <times> --json   # read the sheets with the image reader
npx hyperframes render --output renders/<slug>.mp4 --quality looks --workers 3 --json      # ~15 min for 9 min of film
ffmpeg -i renders/<slug>.mp4 -af ebur128=peak=true -f null -                               # expect ≈ −14 LUFS, peak ≤ −1.5
```

Lint fixes you will meet: GSAP must own transforms (`fromTo`, no CSS `transform` on tweened elements); every `<audio>` sfx needs `data-duration`; highlight bands with negative z-index need `isolation: isolate` on the parent; red on paper fails AA at `#E4573D`, passes at `#D94A31`. Frame 0 must not be empty: the first write-on starts at 0 from the text's left edge (`inset(0% 58% 0% 0%)`).

## 7. Deliver

- `REVIEW.md` per `hyperframes/references/review.md`: creative calls, numbers and their source, what was measured vs looked at, weakest shot, warnings kept.
- Send the MP4 and `clean.mp3` with SendUserFile. Copy the project (minus media, `node_modules`, `.hyperframes`, `renders`) into `AI Video Editing/hyperframes/<slug>/`, add `transcript-clean.json`, commit, push.
- In the reply: duration, what to check before publishing (captions vs voice, rounded vs exact figures, no music), what went wrong and how it was worked around.

## Timing reference (9-minute recording, cloud session, 4 CPUs)

Clean 1 min · models 3 min · transcribe 15 min · clean-up by hand 10 min · scenes 40 min · check+snapshots 10 min · render 15 min.
