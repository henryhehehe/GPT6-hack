# Recording and rebuilding the demo

Version 2 is already recorded. Use `output/demo/v2/counterfactual-worlds-60s.mp4`. Record a new take when the working product changes materially; read [the script](SCRIPT.md) first.

## How I recorded it

I operated the published app through computer-use browser controls in a dedicated Chrome tab. After Screenshot and QuickTime control repeatedly timed out, the user explicitly approved macOS `screencapture`. Window capture succeeded without changing system permissions. The first long capture ended early at 122.11 seconds, so teacher/source/result pickups were captured in short clips. All included screen imagery comes from these actual moving recordings.

Capture only the dedicated demo window. Resolve its current window ID from the visible app/window inventory; the recorded ID 517 is session-specific. Do not reuse it blindly or capture another agent's development window. Start each capture before acting and verify the file duration afterward.

```sh
python3 scripts/demo/capture.py --window VERIFIED_WINDOW_ID --seconds 45 --name UNIQUE_CLIP_NAME
```

Use a unique name for every take. The script records into `output/demo/v2/raw/` and stores timing metadata. Keep clips under a minute and allow the process to finish before starting another. Record narration separately.

## Manual recording sequence

1. Open one fresh prepared Alexandria classroom. Keep its provenance visible. Start in Teacher studio, then Preview as student.
2. Capture the overview, a short Walk around movement, and the harbor-trade hypothesis switch.
3. Paste the initial claim from SCRIPT.md and submit. Wait for the real reply; capture the claim and actual rubric feedback.
4. Return to Teacher studio, enter the scripted patron challenge, use **Use standard request**, inspect the generated preview, then **Add to student world**. Use native steering only after it actually works in a new rehearsal.
5. Return to the same student world. Open the harbor ledger and Strabo reader, save evidence, and use the citation action.
6. Submit the revised explanation and capture its actual feedback. Expand Mechanism and Limitation so the reasoning is legible. A score other than 4/4 is acceptable; never replace real results to match a script.
7. Close the conversation and return to the overview for the closing shot.

Record 2 seconds of breathing room around actions. Keep generation waits in the raw take, then remove them with a labeled cut. The finished minute is edited time, not elapsed model latency. Crop browser tabs, address bars, and unrelated windows out of the export.

## Voiceover

The current voice is one connected OpenAI Marin performance, generated with conversational delivery instructions. Astra generates the app's reasoning; it does not directly emit this audio. The film explicitly discloses AI narration. Do not use `say` for the finished film.

To regenerate after a script change, run `node scripts/demo/narrate.mjs` with the existing configured OpenAI API key. It reads `docs/demo/voiceover.txt` and never prints the key. Rewrap the returned streaming WAV through FFmpeg into `voiceover-natural.wav`, then run `node scripts/demo/transcribe.mjs` for a fresh timestamp transcript. Update the paragraph boundaries in `scripts/demo/edit.py` to match the new take before rendering. These API calls incur the account's normal usage.

For your own voice: record two takes in QuickTime → New Audio Recording. Use a quiet room, microphone 15–20 cm away and slightly off-axis. Speak to one person, pause after the opening question, and keep the final phrase relaxed. Replace the speech track and retime captions from that recording.

## Rebuild the current edit

```sh
/Users/Chuanheng.He/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/demo/edit.py --ffmpeg /private/tmp/hackathon-demo-deps/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1
```

The renderer uses real video in/out points, crops browser chrome, preserves 30 fps motion, assembles the seven narrative sections, inserts pauses only between voice paragraphs, normalizes narration, and burns synchronized captions into a separate footer. The revised-claim excerpt is an editorial quotation of the actual submitted text, not simulated UI. Export is H.264/AAC, 1920×1080, exactly 60 seconds, with fast start.

The current crop is specific to the 3592×2136 raw window recordings. Recalculate it if the window size or browser chrome changes. Python requires NumPy. Temporary FFmpeg may need restoring after system cleanup. The old `render.py` and `archive-v1/` describe the rejected screenshot draft and are retained only for history.

Check the exported video end to end: teacher and student scenes, actual clicks/movement, source labels, text readability, caption timing, audible natural delivery, and the last word ending before 60 seconds. Do not call technical audio checks a subjective listening review.
