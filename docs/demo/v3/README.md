# One-minute demo · version 3

Video: `output/demo/v3/counterfactual-worlds-60s.mp4`.

The updated pitch opens on the actual student's claim, follows the teacher's intervention and source reading, and closes on a more careful explanation. It uses real moving screen recordings from version 2, recut to the new story, with fresh AI narration and synchronized captions. Version 2 remains intact.

This is a new edit of the September 10 recorded app, **not a fresh recording of the latest local UI or newly integrated models**. It shows the prepared Alexandria lesson and the teacher's own student preview. AI replies and scores are actual recorded results; no replacement answers were generated for this edit.

The voice is OpenAI Marin (`gpt-4o-mini-tts`): one main take plus a closing pickup after the first take omitted the last sentence. Whisper timestamps were checked against every scripted word. A split transcription of “Counter-factual” was aligned as “Counterfactual.” Paragraphs six and seven use modest tempo adjustments (about 1.15× and 1.06×); pauses separate the seven scenes. The video visibly discloses AI narration, edited takes, and cut waits.

- [Matching script](SCRIPT.md), [narration](voiceover.txt), [captions](captions.srt), [scene timing](timeline.json).
- Exact source cuts: `output/demo/v3/edit-decision-list.json`.
- Speech timing: `output/demo/v3/narration-timing.json`.
- Source and export hashes: `output/demo/v3/provenance.json`.
- Verification: `output/demo/v3/verification.json` and `verification.log`.

Rebuild with `python3 scripts/demo/render-v3.py --ffmpeg /path/to/ffmpeg`. The renderer needs the existing raw recordings under `output/demo/v2/raw/` and the version-3 narration WAVs/transcripts. Large raw captures remain local and are not included in this checkpoint. The finished MP4 is standalone.

To regenerate speech, use `node scripts/demo/voice-v3.mjs narrate` and `narrate-closing`, rewrap each returned WAV through FFmpeg as `voiceover-natural.wav` and `closing-natural.wav`, then run `transcribe` and `transcribe-closing`. These commands use the configured API account. Do not regenerate merely to replay the finished video.
