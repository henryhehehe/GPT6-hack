# One-minute hackathon demo · version 2

The current deliverable is **real screen footage with natural OpenAI narration**, recorded September 10, 2026. The rejected screenshot montage and macOS system voice are archived; do not submit them.

- Video: `output/demo/v2/counterfactual-worlds-60s.mp4`
- Narration: `output/demo/v2/voiceover-final.wav` (AI-generated, OpenAI `gpt-4o-mini-tts`, Marin)
- [Timed script and exact demo inputs](SCRIPT.md)
- [Recording and rebuild instructions](RECORDING.md)
- [Recording provenance and known limits](STATUS.md)
- [Narration text](voiceover.txt), [captions](captions.srt), [story timeline](timeline.json)
- Exact source cuts: `output/demo/v2/edit-decision-list.json`
- Raw moving footage: `output/demo/v2/raw/`; renderer: `scripts/demo/edit.py`

The story follows a prepared Alexandria lesson through exploration, a weak claim, teacher intervention, source reading, and a conditional revision. The app's reasoning uses Astra; the voice uses OpenAI's separate speech model. The video identifies its AI narration and edited takes on screen.

The active **Keep hackathon demo current** follow-up checks every 30 minutes and reports meaningful changes. Recheck published behavior after deployments; local development alone does not establish that the footage is current. The demo uses the teacher's own student-preview identity, not a separately joined learner.
