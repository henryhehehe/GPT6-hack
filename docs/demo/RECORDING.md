# Record or rebuild the updated demo

Current deliverable: `output/demo/v4/counterfactual-worlds-60s.mp4`. This version has new screen recordings, OpenAI Marin narration, synchronized captions, and a complete closing pickup. Versions 2 and 3 remain preserved.

## Recording setup

The user approved macOS `screencapture` after native Screenshot and QuickTime control timed out. Operate the app through computer-use browser controls and capture only the dedicated Chrome window. Resolve its current window ID from the window inventory. Never assume the active Chrome window is the demo: other work can change focus.

The v4 recording used a frozen local build at `http://127.0.0.1:5179`, with an isolated database in `/private/tmp/cw-demo-recording`. This avoided development hot reloads resetting the lesson. The teacher and joined Demo Learner occupied two tabs in one dedicated window. This temporary directory is a recording fixture, not a deployment.

```sh
python3 scripts/demo/capture.py --window VERIFIED_WINDOW_ID --seconds 40 --name UNIQUE_TAKE --version v4
```

Capture metadata is written beside each raw movie. Inspect actual duration: some recordings ended early. Never choose source cuts from the requested duration alone. Crop browser chrome and exclude unrelated windows from the final edit.

## Rehearsal sequence

1. Show the new landing page and open Teacher studio. Choose Alexandria in the 30-lesson library. Review the source packet, approve it, launch, and open the teaching guide.
2. Join a separate learner using the classroom invitation. Keep the invitation out of the film. Show Overview, Walk around, and the Baseline / What if switch.
3. Read the invented harbor ledger and the Strabo source. Save both; open Read in context and add the citation to the explanation.
4. Submit the exact initial answer in SCRIPT.md. Wait for the actual response. Record its words; never substitute an expected score or generated reply.
5. In Teacher studio, open Lesson notes → Teaching help. Enter the request in SCRIPT.md, use the standard request path, review the preview, and add it to the student world.
6. Return to the same learner. Show the applied teacher question and preserved work. Submit the revised explanation and wait for the real feedback.
7. Open the teacher report. Show the first and latest explanations, retaining the context-change label. Finish on a moving city view.

Record short pickups with 2–3 seconds of breathing room around clicks. Keep waiting time in the raw takes and remove it with a labeled edit.

## Narration

The v4 main take and closing pickup use OpenAI speech generation, voice Marin, with conversational founder-style delivery. The original main take omitted the last phrase; the closing pickup contains the complete line. The edit preserves delivery within paragraphs and inserts pauses only between them.

```sh
node scripts/demo/narrate.mjs output/demo/v4 output/demo/v4/voiceover.txt
node scripts/demo/narrate.mjs output/demo/v4/closing output/demo/v4/closing.txt
```

These commands use the existing local API configuration. Preserve verified audio before regenerating. Transcribe and check every phrase before replacing the current voice track.

For your own voice, record two takes in a quiet room with the microphone slightly off-axis, 15–20 cm away. Speak to one person. Pause after “Let’s test it,” and give the changed answer time to land. Keep the last line relaxed.

## Rebuild

```sh
python3 scripts/demo/edit-v4.py --ffmpeg /path/to/ffmpeg
```

The renderer uses the raw clips listed in `output/demo/v4/edit-decision-list.json`, the main and closing WAVs, and exact speech timings. It produces H.264/AAC, 1920×1080 at 30 fps, exactly 60 seconds. Raw footage stays local; the MP4 is standalone. `captions.srt` is also available separately.
