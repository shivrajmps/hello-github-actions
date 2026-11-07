# REVIEW — "0.5% का फ़र्क" (home-loan explainer from Shiv's recording)

## Creative calls
- Built storyline 1 (two houses, one notebook) from STORYLINES.md. Not built: 2 (the ruler as a match-cut object), 3 (bank counter, paper-to-paper chain).
- Look: whitish paper + dotted grid, charcoal marker ink with a 3-frame boil, Kalam handwriting for labels, Baloo 2 for captions and hero numbers. Yellow only as the karaoke band and one highlighted keyword per beat; red only for cost, green only for saving.
- Five scenes, each one page that rebuilds: intro (0.5%? → three loan types → the notebook promise), board (Customer A vs B: houses, 360 ticks, EMI counters, coin stacks, the ₹6.1 lakh gap circled, then "₹6 लाख बचा सकते हैं"), bank (building with Private/Public doors, a six-item checklist ticked as each point is spoken, "0.01% भी फ़र्क करता है"), prepay (EMI slip, the +₹10,000 sticky note, the 30-year ruler shrinking to 15, interest 75.9 → 35 lakh, the ₹40 lakh saving circled), close (two key insights, signature).
- Captions: 177 groups, 3–5 words, karaoke band per word, Devanagari with English finance terms kept in Latin as spoken.
- Audio: the original m4a was high-passed at 80 Hz, low-passed at 12 kHz, denoised (afftdn, −38 dB floor), de-clicked, and loudness-normalised to −16 LUFS / −1.5 dBTP. 11 s of dead air cut (8 s lead, two pauses). Sound effects from the bundled Pixabay set: whoosh on each page change, pop on each number landing, sparkle on both green reveals, riser + bass impact on the ₹40 lakh. No music: no catalog sign-in in this session.

## Numbers on screen
Every rupee figure is either the one Shiv says (33,264 / 34,961 / 69.75 L / 1.259 Cr / 6.1 L / 35 L / 40 L / 10,000 / 44,000 / 50,000) or derived from his own figures (₹1,697 = 34,961 − 33,264; ₹75.85 L = 69.75 L + 6.1 L). scripts/finance.py recomputes the loan from the formula: it agrees with his EMIs to the rupee, and gives 16.6 years and ₹38.4 L saved where he rounds to "15 साल" and "40 लाख". The screen follows his words; the formula results are here for the record.

## Transcript
Local Whisper (large-v3-turbo via sherpa-onnx, Hindi, 12 s windows) then a hand clean-up of every segment. Word timings are proportional within each segment, so a caption word can be ±0.3 s off the voice. Two short stretches were unintelligible in the ASR and are captioned from the audible fragments only; nothing was invented.

## What was measured, what was only looked at
- `check`: ok, 0 errors. Kept warnings: `timeline_track_too_dense` on captions (one file by design), `negative_z_index` on highlight bands (false positive; the band's parent is isolated and the browser pass shows it).
- Looked at: review-beats, review-phone, four seam sheets, plus 30 spot frames across the film.
- Not heard by anyone: the mix. `npx hyperframes audio` on the render reports levels.

## Weakest shot
The board's second beat (158–172 s): coins accumulate slowly while Shiv sets up "total repayment"; the numbers land only when he says them, so 10 s carry only motion, no new fact. With more time: a 30-year calendar flipping under the coins.

## Kept on purpose
- Hard cuts between the five pages with a whoosh, rather than a scribble-out: the registry scribble transition is dark-ink on transparent and read as a smear over paper.
- "15 साल" and "₹40 लाख" shown as spoken, with the exact figures in the note above rather than on screen.
