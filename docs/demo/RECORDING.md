# Recording and rebuilding the demo

Version 3 is finished in `output/demo/v3/`. It re-edits the actual version-2 screen recordings and adds fresh narration and captions. It does not capture the latest local UI. Preserve both versions; make new recordings when the product changes materially.

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

Version 3 uses a new OpenAI Marin main take and a separate closing pickup, generated with conversational delivery instructions. Astra generates the app's reasoning; it does not directly emit this audio. The film explicitly discloses AI narration. Do not use `say` for the finished film.

Use the [version-3 package](v3/README.md) to regenerate narration and timestamp transcripts. The version-2 narration scripts remain archival and write to the version-2 folder; do not run them for this edit.

For your own voice: record two takes in QuickTime → New Audio Recording. Use a quiet room, microphone 15–20 cm away and slightly off-axis. Speak to one person, pause after the opening question, and keep the final phrase relaxed. Replace the speech track and retime captions from that recording.

## Rebuild the current edit

```sh
python3 scripts/demo/render-v3.py --ffmpeg /path/to/ffmpeg
```

See [the version-3 package](v3/README.md) for source dependencies. The renderer uses the original moving recordings, crops browser chrome, assembles 13 cuts, places seven narration sections into exact sample-length slots, and burns synchronized captions into a separate footer. Quoted claims are editorial excerpts of the actual submitted text, not simulated UI. Export is H.264/AAC, 1920×1080, 30 fps, exactly 60 seconds.

Check a new export for real clicks and movement, source labels, readable text, caption timing, and complete narration before 60 seconds. Technical audio checks do not constitute an independent listening review.
