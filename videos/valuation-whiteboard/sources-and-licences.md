# Sources and licences

## Graphics
All diagrams, icons (shop, house, factory, bank, laptop, ledger, coins, clock, warning triangle, magnifier), the stick-figure presenter, arrows, rings and highlights are drawn procedurally as SVG in `www/scenes.js` and `www/board.html`. No stock imagery was used.

## Fonts (all Open Font Licence 1.1, redistributable)
| Font | Use | Source |
|---|---|---|
| Kalam (Indian Type Foundry) | body handwriting, captions, ₹ glyph | github.com/google/fonts, ofl/kalam |
| Caveat (Pablo Impallari) | headlines, big numbers | github.com/google/fonts, ofl/caveat |
| Inter (Rasmus Andersson) | small-caps header labels and chapter pills | bundled with the claude-video-effects skill (OFL) |

## Voice
Narration synthesised offline with Kokoro-82M (Apache-2.0 model, `kokoro-onnx` runtime), voice `af_heart`, 24 kHz, one gain change applied to reach about -14 LUFS integrated. Model files from github.com/thewh1teagle/kokoro-onnx releases (model-files-v1.0).

ElevenLabs was the first choice (voice "Manish – Clear Indian Narrator") but every generation failed with "Your subscription has a failed or incomplete payment"; nothing was charged. Higgsfield audio was unavailable (0 credits, free plan). Edge neural TTS was blocked by the sandbox proxy.

## Music and SFX
None. Delivered dry (voice only) so you can add trending audio in Instagram/YouTube. A cue sheet is not provided because no licensed library was available in this session.

## Tooling
Playwright 1.63 + headless Chromium (frame-by-frame deterministic capture), ffmpeg 6.1 (libx264 CRF 17, AAC 192k), Python 3.13 (numpy, soundfile, kokoro-onnx, Pillow).
