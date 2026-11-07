# Project notes

- Save every output from the yt-* skills (scripts, title/thumbnail pairings, edit lists, shorts, retention reads, plans, audits) under `AI Video Editing/`, in the subfolder its README lists. One markdown file per video, named by topic slug.
- The voice profile lives at `.claude/youtube/voice.md`. Read it before any yt-* skill runs; if it is still the blank template, say so in the output.
- HyperFrames projects (from `/hyperframes`, `/hyperframes-cli`, `/hyperframes-registry`, `/media-use`) go under `AI Video Editing/hyperframes/<topic-slug>/`. Never commit rendered video.
- A voice recording to turn into a video: use the `audio-to-explainer` skill (`.claude/skills/audio-to-explainer/SKILL.md`). It holds the scripts, scene templates and the order of operations that produced the home-loan explainer.
