# Valuation whiteboard series (hand-drawn explainers)

Five short hand-drawn whiteboard lessons on how to value a business from its accounts:

| # | Lesson | What it covers |
|---|---|---|
| 01 | Why valuation | Two shops, payback years, Price vs Value |
| 02 | P/E ratio | P&L → net profit → EPS → P/E, earnings yield, three warnings |
| 03 | P/B ratio | Balance sheet → book value → P/B, where it works and fails, ROE pairing |
| 04 | EV / EBITDA | Market cap + debt − cash, operating profit + D&A, why it is fairer, the capex catch |
| 05 | Putting it together | Peers, own history, quality checks, Company A vs B worked example |

`scene-plan.md` is the edit decision list and visual plan; `sources-and-licences.md` lists every asset.
Rendered MP4s are in `renders/` (with cut-frame QC contact sheets), SRT captions and EDLs in `captions/`.

## Rebuild
```bash
pip install kokoro-onnx soundfile numpy pillow        # plus node + playwright (Chromium) + ffmpeg
# 1. narration (per sentence, gives exact cue times)
python3 tts.py scripts.json kokoro-v1.0.onnx voices-v1.0.bin audio af_heart 1.0
# 2. frames -> video (deterministic: window.render(t) per frame)
node render.js stills 02-pe-ratio stills/02      # QC contact sheet
node render.js video  02-pe-ratio out/02.silent.mp4 30
# 3. lay narration on the timeline, normalise to -14 LUFS, mux, write SRT + EDL
python3 mix.py 02-pe-ratio audio out/02.silent.mp4 out/02-pe-ratio.mp4
```
Model files: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0

To change a voice, pass another Kokoro voice id (e.g. `am_michael`, `bm_george`) to `tts.py`. To change wording, edit `scripts.json`; cue indices in `www/scenes.js` refer to sentence numbers inside each scene, so keep the sentence count the same or adjust the `C(scene, sentence)` calls.
